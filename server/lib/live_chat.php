<?php

declare(strict_types=1);

function live_chat_dir(): string
{
    $configured = env('LIVE_CHAT_DATA_DIR');
    if ($configured !== null && $configured !== '') {
        return rtrim($configured, DIRECTORY_SEPARATOR);
    }

    return dirname(__DIR__) . DIRECTORY_SEPARATOR . 'data' . DIRECTORY_SEPARATOR . 'live';
}

function live_sessions_dir(): string
{
    return live_chat_dir() . DIRECTORY_SEPARATOR . 'sessions';
}

function live_session_path(string $sessionId): string
{
    if (!preg_match('/^[a-f0-9]{32}$/', $sessionId)) {
        throw new InvalidArgumentException('Invalid session id.');
    }

    return live_sessions_dir() . DIRECTORY_SEPARATOR . $sessionId . '.json';
}

function ensure_live_chat_dirs(): void
{
    $dir = live_sessions_dir();
    if (!is_dir($dir) && !mkdir($dir, 0755, true) && !is_dir($dir)) {
        throw new RuntimeException('Unable to create live chat storage directory.');
    }
}

function read_session_file(string $path): ?array
{
    if (!is_file($path)) {
        return null;
    }

    $handle = fopen($path, 'rb');
    if ($handle === false) {
        return null;
    }

    try {
        if (!flock($handle, LOCK_SH)) {
            return null;
        }

        $contents = stream_get_contents($handle);
        flock($handle, LOCK_UN);
    } finally {
        fclose($handle);
    }

    if ($contents === false || trim($contents) === '') {
        return null;
    }

    $decoded = json_decode($contents, true);
    return is_array($decoded) ? $decoded : null;
}

function write_session_file(string $path, array $session): void
{
    ensure_live_chat_dirs();

    $handle = fopen($path, 'c+');
    if ($handle === false) {
        throw new RuntimeException('Unable to open live chat session.');
    }

    try {
        if (!flock($handle, LOCK_EX)) {
            throw new RuntimeException('Unable to lock live chat session.');
        }

        ftruncate($handle, 0);
        rewind($handle);
        $encoded = json_encode($session, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        if ($encoded === false) {
            throw new RuntimeException('Unable to encode live chat session.');
        }

        fwrite($handle, $encoded);
        fflush($handle);
        flock($handle, LOCK_UN);
    } finally {
        fclose($handle);
    }
}

function new_message_id(): string
{
    return bin2hex(random_bytes(8));
}

function new_session_id(): string
{
    return bin2hex(random_bytes(16));
}

function public_session(array $session): array
{
    return [
        'id' => $session['id'],
        'status' => $session['status'],
        'created_at' => $session['created_at'],
        'updated_at' => $session['updated_at'],
        'messages' => $session['messages'],
    ];
}

function create_live_session(string $ip, array $context = []): array
{
    ensure_live_chat_dirs();

    $now = gmdate('c');
    $session = [
        'id' => new_session_id(),
        'status' => 'waiting',
        'created_at' => $now,
        'updated_at' => $now,
        'user_ip' => $ip,
        'context' => array_values(array_filter(array_map(
            static fn ($line) => clean_string($line, 500),
            $context
        ))),
        'messages' => [[
            'id' => new_message_id(),
            'sender' => 'system',
            'content' => 'You are connected to the support queue. A team member will join shortly.',
            'created_at' => $now,
        ]],
    ];

    write_session_file(live_session_path($session['id']), $session);

    return public_session($session);
}

function get_live_session(string $sessionId): ?array
{
    try {
        $path = live_session_path($sessionId);
    } catch (Throwable) {
        return null;
    }

    return read_session_file($path);
}

function update_live_session(string $sessionId, callable $mutator): array
{
    try {
        $path = live_session_path($sessionId);
    } catch (Throwable) {
        throw new RuntimeException('Invalid session id.');
    }

    $handle = fopen($path, 'c+');
    if ($handle === false) {
        throw new RuntimeException('Live chat session not found.');
    }

    try {
        if (!flock($handle, LOCK_EX)) {
            throw new RuntimeException('Unable to lock live chat session.');
        }

        rewind($handle);
        $contents = stream_get_contents($handle);
        $session = is_string($contents) && trim($contents) !== ''
            ? json_decode($contents, true)
            : null;

        if (!is_array($session)) {
            throw new RuntimeException('Live chat session not found.');
        }

        $session = $mutator($session);
        $session['updated_at'] = gmdate('c');

        ftruncate($handle, 0);
        rewind($handle);
        $encoded = json_encode($session, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        if ($encoded === false) {
            throw new RuntimeException('Unable to encode live chat session.');
        }

        fwrite($handle, $encoded);
        fflush($handle);
        flock($handle, LOCK_UN);
    } finally {
        fclose($handle);
    }

    return public_session($session);
}

function append_live_message(string $sessionId, string $sender, string $content): array
{
    $safeContent = trim($content);
    if ($safeContent === '') {
        throw new RuntimeException('Message cannot be empty.');
    }
    if (strlen($safeContent) > 2000) {
        $safeContent = substr($safeContent, 0, 2000);
    }

    return update_live_session($sessionId, static function (array $session) use ($sender, $safeContent): array {
        if (($session['status'] ?? '') === 'closed') {
            throw new RuntimeException('This live chat session is closed.');
        }

        if ($sender === 'admin' && ($session['status'] ?? '') === 'waiting') {
            $session['status'] = 'active';
        }

        $session['messages'][] = [
            'id' => new_message_id(),
            'sender' => $sender,
            'content' => $safeContent,
            'created_at' => gmdate('c'),
        ];

        return $session;
    });
}

function list_live_sessions(): array
{
    ensure_live_chat_dirs();

    $sessions = [];
    $files = glob(live_sessions_dir() . DIRECTORY_SEPARATOR . '*.json') ?: [];

    foreach ($files as $file) {
        $session = read_session_file($file);
        if (!is_array($session) || ($session['status'] ?? '') === 'closed') {
            continue;
        }

        $lastMessage = $session['messages'][array_key_last($session['messages'])] ?? null;
        $sessions[] = [
            'id' => $session['id'],
            'status' => $session['status'],
            'created_at' => $session['created_at'],
            'updated_at' => $session['updated_at'],
            'user_ip' => $session['user_ip'] ?? '',
            'preview' => is_array($lastMessage) ? (string) ($lastMessage['content'] ?? '') : '',
            'message_count' => count($session['messages'] ?? []),
        ];
    }

    usort($sessions, static fn ($a, $b) => strcmp($b['updated_at'], $a['updated_at']));

    return $sessions;
}

function messages_after(array $session, ?string $afterId): array
{
    $messages = $session['messages'] ?? [];
    if ($afterId === null || $afterId === '') {
        return $messages;
    }

    $start = 0;
    foreach ($messages as $index => $message) {
        if (($message['id'] ?? '') === $afterId) {
            $start = $index + 1;
            break;
        }
    }

    return array_slice($messages, $start);
}

function fetch_live_messages_since(string $sessionId, ?string $afterId): array
{
    $session = get_live_session($sessionId);
    if ($session === null) {
        throw new RuntimeException('Live chat session not found.');
    }

    return [
        'session' => [
            'id' => $session['id'],
            'status' => $session['status'],
            'updated_at' => $session['updated_at'],
        ],
        'messages' => messages_after($session, $afterId),
    ];
}

function clear_all_live_sessions(): int
{
    ensure_live_chat_dirs();

    $files = glob(live_sessions_dir() . DIRECTORY_SEPARATOR . '*.json') ?: [];
    $removed = 0;

    foreach ($files as $file) {
        if (is_file($file) && unlink($file)) {
            $removed++;
        }
    }

    return $removed;
}

function require_admin_token(): void
{
    $expected = trim(env('LIVE_CHAT_ADMIN_TOKEN', '') ?? '');
    if ($expected === '') {
        json_response(['ok' => false, 'error' => 'Live chat admin is not configured.'], 503);
    }

    $auth = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (!preg_match('/^Bearer\s+(.+)$/i', $auth, $matches)) {
        json_response(['ok' => false, 'error' => 'Unauthorized.'], 401);
    }

    $provided = trim($matches[1]);
    if (!hash_equals($expected, $provided)) {
        json_response(['ok' => false, 'error' => 'Unauthorized.'], 401);
    }
}
