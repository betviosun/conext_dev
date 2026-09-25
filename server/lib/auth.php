<?php

declare(strict_types=1);

const AUTH_MIN_PASSWORD_LENGTH = 8;
const AUTH_SESSION_TTL_SECONDS = 60 * 60 * 24 * 14;
const AUTH_CAPTCHA_TTL_SECONDS = 600;

function auth_data_dir(): string
{
    $configured = env('AUTH_DATA_DIR');
    if ($configured !== null && $configured !== '') {
        return rtrim($configured, DIRECTORY_SEPARATOR);
    }

    return dirname(__DIR__) . DIRECTORY_SEPARATOR . 'data';
}

function users_file_path(): string
{
    $configured = env('USERS_JSON_PATH');
    if ($configured !== null && $configured !== '') {
        return $configured;
    }

    return auth_data_dir() . DIRECTORY_SEPARATOR . 'users.json';
}

function sessions_file_path(): string
{
    return auth_data_dir() . DIRECTORY_SEPARATOR . 'auth_sessions.json';
}

function captchas_file_path(): string
{
    return auth_data_dir() . DIRECTORY_SEPARATOR . 'auth_captchas.json';
}

function ensure_auth_store(): void
{
    $dir = auth_data_dir();
    if (!is_dir($dir) && !mkdir($dir, 0755, true) && !is_dir($dir)) {
        throw new RuntimeException('Unable to create auth data directory.');
    }

    if (!is_file(users_file_path())) {
        if (file_put_contents(users_file_path(), "[]\n", LOCK_EX) === false) {
            throw new RuntimeException('Unable to initialize users store.');
        }
    }
}

function read_json_store(string $path): array
{
    ensure_auth_store();
    $raw = file_get_contents($path);
    if ($raw === false || trim($raw) === '') {
        return [];
    }

    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : [];
}

function write_json_store(string $path, array $data): void
{
    ensure_auth_store();
    $encoded = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    if ($encoded === false) {
        throw new RuntimeException('Unable to encode auth store.');
    }

    if (file_put_contents($path, $encoded . "\n", LOCK_EX) === false) {
        throw new RuntimeException('Unable to write auth store.');
    }
}

function normalize_email(string $email): string
{
    return strtolower(trim($email));
}

function validate_password(string $password): void
{
    if (strlen($password) < AUTH_MIN_PASSWORD_LENGTH) {
        throw new InvalidArgumentException('Password must be at least ' . AUTH_MIN_PASSWORD_LENGTH . ' characters.');
    }
}

function public_user(array $user): array
{
    return [
        'id' => $user['id'],
        'firstName' => $user['first_name'],
        'lastName' => $user['last_name'],
        'email' => $user['email'],
        'newsletter' => (bool) ($user['newsletter'] ?? false),
        'createdAt' => $user['created_at'] ?? '',
    ];
}

function find_user_by_email(string $email): ?array
{
    $normalized = normalize_email($email);
    foreach (read_json_store(users_file_path()) as $user) {
        if (!is_array($user)) {
            continue;
        }
        if (normalize_email((string) ($user['email'] ?? '')) === $normalized) {
            return $user;
        }
    }

    return null;
}

function find_user_by_id(string $id): ?array
{
    foreach (read_json_store(users_file_path()) as $user) {
        if (is_array($user) && (($user['id'] ?? '') === $id)) {
            return $user;
        }
    }

    return null;
}

function find_user_by_google_id(string $googleId): ?array
{
    if ($googleId === '') {
        return null;
    }

    foreach (read_json_store(users_file_path()) as $user) {
        if (is_array($user) && (($user['google_id'] ?? '') === $googleId)) {
            return $user;
        }
    }

    return null;
}

function save_user(array $user): void
{
    $users = read_json_store(users_file_path());
    $users[] = $user;
    write_json_store(users_file_path(), $users);
}

function update_user_record(string $id, callable $mutator): array
{
    $users = read_json_store(users_file_path());
    $updated = null;

    foreach ($users as $index => $user) {
        if (!is_array($user) || (($user['id'] ?? '') !== $id)) {
            continue;
        }

        $users[$index] = $mutator($user);
        $updated = $users[$index];
        break;
    }

    if ($updated === null) {
        throw new RuntimeException('User not found.');
    }

    write_json_store(users_file_path(), $users);

    return $updated;
}

function google_client_id(): string
{
    return trim(env('GOOGLE_CLIENT_ID', '') ?? '');
}

function verify_google_id_token(string $idToken): array
{
    $clientId = google_client_id();
    if ($clientId === '') {
        throw new RuntimeException('Google sign-in is not configured.');
    }

    if ($idToken === '') {
        throw new InvalidArgumentException('Google credential is required.');
    }

    $url = 'https://oauth2.googleapis.com/tokeninfo?id_token=' . urlencode($idToken);
    $ch = curl_init($url);
    if ($ch === false) {
        throw new RuntimeException('Unable to verify Google credential.');
    }

    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CONNECTTIMEOUT => 10,
        CURLOPT_TIMEOUT => 15,
    ]);

    $responseBody = curl_exec($ch);
    $statusCode = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($responseBody === false || $statusCode < 200 || $statusCode >= 300) {
        throw new InvalidArgumentException('Google credential could not be verified.');
    }

    $payload = json_decode($responseBody, true);
    if (!is_array($payload)) {
        throw new InvalidArgumentException('Invalid Google credential response.');
    }

    if (($payload['aud'] ?? '') !== $clientId) {
        throw new InvalidArgumentException('Invalid Google credential audience.');
    }

    $issuer = (string) ($payload['iss'] ?? '');
    if (!in_array($issuer, ['accounts.google.com', 'https://accounts.google.com'], true)) {
        throw new InvalidArgumentException('Invalid Google credential issuer.');
    }

    if ((string) ($payload['email_verified'] ?? 'false') !== 'true') {
        throw new InvalidArgumentException('Google email address is not verified.');
    }

    if ((int) ($payload['exp'] ?? 0) < time()) {
        throw new InvalidArgumentException('Google credential expired.');
    }

    return $payload;
}

function google_name_parts(array $payload): array
{
    $firstName = clean_string($payload['given_name'] ?? '', 80);
    $lastName = clean_string($payload['family_name'] ?? '', 80);

    if ($firstName === '' || $lastName === '') {
        $fullName = clean_string($payload['name'] ?? '', 160);
        if ($fullName !== '') {
            $parts = preg_split('/\s+/', $fullName, 2) ?: [];
            if ($firstName === '' && !empty($parts[0])) {
                $firstName = clean_string($parts[0], 80);
            }
            if ($lastName === '' && !empty($parts[1])) {
                $lastName = clean_string($parts[1], 80);
            }
        }
    }

    if ($firstName === '') {
        $firstName = 'Google';
    }
    if ($lastName === '') {
        $lastName = 'User';
    }

    return [$firstName, $lastName];
}

function create_captcha_challenge(): array
{
    $alphabet = 'abcdefghjkmnpqrstuvwxyz23456789';
    $challenge = '';
    for ($i = 0; $i < 6; $i++) {
        $challenge .= $alphabet[random_int(0, strlen($alphabet) - 1)];
    }

    $id = bin2hex(random_bytes(8));
    $captchas = read_json_store(captchas_file_path());
    $now = time();
    $captchas = array_values(array_filter($captchas, static function ($item) use ($now) {
        return is_array($item) && (($item['expires_at'] ?? 0) > $now);
    }));

    $captchas[] = [
        'id' => $id,
        'answer' => strtolower($challenge),
        'expires_at' => $now + AUTH_CAPTCHA_TTL_SECONDS,
    ];
    write_json_store(captchas_file_path(), $captchas);

    return [
        'id' => $id,
        'challenge' => $challenge,
    ];
}

function verify_captcha(string $id, string $answer): void
{
    $captchas = read_json_store(captchas_file_path());
    $now = time();
    $matched = false;
    $remaining = [];

    foreach ($captchas as $item) {
        if (!is_array($item)) {
            continue;
        }

        if (($item['expires_at'] ?? 0) <= $now) {
            continue;
        }

        if (($item['id'] ?? '') === $id) {
            $matched = strtolower(trim($answer)) === ($item['answer'] ?? '');
            continue;
        }

        $remaining[] = $item;
    }

    write_json_store(captchas_file_path(), $remaining);

    if (!$matched) {
        throw new InvalidArgumentException('Captcha answer is incorrect or expired.');
    }
}

function create_session(string $userId): array
{
    $token = bin2hex(random_bytes(32));
    $sessions = read_json_store(sessions_file_path());
    $now = time();

    $sessions = array_values(array_filter($sessions, static function ($item) use ($now) {
        return is_array($item) && (($item['expires_at'] ?? 0) > $now);
    }));

    $session = [
        'token' => $token,
        'user_id' => $userId,
        'created_at' => gmdate('c'),
        'expires_at' => $now + AUTH_SESSION_TTL_SECONDS,
    ];
    $sessions[] = $session;
    write_json_store(sessions_file_path(), $sessions);

    return $session;
}

function delete_session(string $token): void
{
    $sessions = read_json_store(sessions_file_path());
    $sessions = array_values(array_filter($sessions, static function ($item) use ($token) {
        return is_array($item) && (($item['token'] ?? '') !== $token);
    }));
    write_json_store(sessions_file_path(), $sessions);
}

function session_from_token(string $token): ?array
{
    if ($token === '') {
        return null;
    }

    $sessions = read_json_store(sessions_file_path());
    $now = time();
    $found = null;
    $remaining = [];

    foreach ($sessions as $item) {
        if (!is_array($item)) {
            continue;
        }

        if (($item['expires_at'] ?? 0) <= $now) {
            continue;
        }

        if (($item['token'] ?? '') === $token) {
            $found = $item;
            $remaining[] = $item;
            continue;
        }

        $remaining[] = $item;
    }

    write_json_store(sessions_file_path(), $remaining);

    return $found;
}

function bearer_token_from_request(): string
{
    $auth = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (preg_match('/^Bearer\s+(.+)$/i', $auth, $matches)) {
        return trim($matches[1]);
    }

    return '';
}

function register_user(
    string $firstName,
    string $lastName,
    string $email,
    string $password,
    bool $newsletter,
    string $captchaId,
    string $captchaAnswer,
    string $ip
): array {
    if ($firstName === '' || $lastName === '' || $email === '') {
        throw new InvalidArgumentException('First name, last name, and email are required.');
    }

    if (!is_email($email)) {
        throw new InvalidArgumentException('Please provide a valid email address.');
    }

    validate_password($password);
    verify_captcha($captchaId, $captchaAnswer);

    if (find_user_by_email($email) !== null) {
        throw new InvalidArgumentException('An account with this email already exists.');
    }

    $user = [
        'id' => bin2hex(random_bytes(16)),
        'first_name' => $firstName,
        'last_name' => $lastName,
        'email' => normalize_email($email),
        'password_hash' => password_hash($password, PASSWORD_DEFAULT),
        'newsletter' => $newsletter,
        'created_at' => gmdate('c'),
        'ip' => $ip,
    ];

    save_user($user);

    return [
        'user' => public_user($user),
    ];
}

function login_user(string $email, string $password): array
{
    if (!is_email($email)) {
        throw new InvalidArgumentException('Please provide a valid email address.');
    }

    $user = find_user_by_email($email);
    $passwordHash = (string) ($user['password_hash'] ?? '');
    if ($user === null || $passwordHash === '' || !password_verify($password, $passwordHash)) {
        throw new InvalidArgumentException('Invalid email or password.');
    }

    $session = create_session((string) $user['id']);

    return [
        'token' => $session['token'],
        'expiresAt' => gmdate('c', $session['expires_at']),
        'user' => public_user($user),
    ];
}

function google_account_exists(string $googleId, string $email): ?array
{
    $byGoogleId = find_user_by_google_id($googleId);
    if ($byGoogleId !== null) {
        return $byGoogleId;
    }

    return find_user_by_email($email);
}

function create_google_user(string $googleId, string $email, string $firstName, string $lastName, string $ip): array
{
    $existing = google_account_exists($googleId, $email);
    if ($existing !== null) {
        throw new InvalidArgumentException('An account with this email already exists.');
    }

    $user = [
        'id' => bin2hex(random_bytes(16)),
        'first_name' => $firstName,
        'last_name' => $lastName,
        'email' => $email,
        'password_hash' => '',
        'google_id' => $googleId,
        'newsletter' => false,
        'created_at' => gmdate('c'),
        'ip' => $ip,
    ];
    save_user($user);

    return $user;
}

function authenticate_with_google(string $idToken, string $ip, string $intent = 'login'): array
{
    $payload = verify_google_id_token($idToken);
    $googleId = clean_string($payload['sub'] ?? '', 64);
    $email = normalize_email((string) ($payload['email'] ?? ''));

    if ($googleId === '' || !is_email($email)) {
        throw new InvalidArgumentException('Google account details are incomplete.');
    }

    [$firstName, $lastName] = google_name_parts($payload);
    $intent = $intent === 'signup' ? 'signup' : 'login';
    $existingUser = google_account_exists($googleId, $email);
    $isNewUser = false;

    if ($intent === 'signup') {
        if ($existingUser !== null) {
            throw new InvalidArgumentException('An account with this email already exists. Please log in.');
        }

        $user = create_google_user($googleId, $email, $firstName, $lastName, $ip);
        $isNewUser = true;
    } else {
        if ($existingUser !== null) {
            $user = $existingUser;
            if (($user['google_id'] ?? '') === '') {
                $user = update_user_record((string) $user['id'], static function (array $record) use ($googleId): array {
                    $record['google_id'] = $googleId;
                    return $record;
                });
            }
        } else {
            $user = create_google_user($googleId, $email, $firstName, $lastName, $ip);
            $isNewUser = true;
        }
    }

    $session = create_session((string) $user['id']);

    return [
        'token' => $session['token'],
        'expiresAt' => gmdate('c', $session['expires_at']),
        'user' => public_user($user),
        'isNewUser' => $isNewUser,
    ];
}

function current_user_from_request(): ?array
{
    $token = bearer_token_from_request();
    $session = session_from_token($token);
    if ($session === null) {
        return null;
    }

    $user = find_user_by_id((string) ($session['user_id'] ?? ''));
    return $user !== null ? public_user($user) : null;
}
