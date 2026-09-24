<?php

declare(strict_types=1);

require_once __DIR__ . '/lib/env.php';
require_once __DIR__ . '/lib/http.php';
require_once __DIR__ . '/lib/cors.php';
require_once __DIR__ . '/lib/rate_limit.php';
require_once __DIR__ . '/lib/csv_store.php';
require_once __DIR__ . '/lib/assist_chat.php';
require_once __DIR__ . '/lib/live_chat.php';
require_once __DIR__ . '/lib/job_applications.php';

load_env(__DIR__ . '/.env');
apply_cors();
handle_preflight();

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
$basePath = rtrim(env('BASE_PATH', '') ?? '', '/');
if ($basePath !== '' && str_starts_with($path, $basePath)) {
    $path = substr($path, strlen($basePath)) ?: '/';
}
$path = rtrim($path, '/') ?: '/';

if ($method === 'GET' && $path === '/health') {
    json_response([
        'ok' => true,
        'csv' => csv_path(),
        'assistConfigured' => trim(env('OPENAI_API_KEY', '') ?? '') !== '',
        'liveChatConfigured' => trim(env('LIVE_CHAT_ADMIN_TOKEN', '') ?? '') !== '',
    ]);
}

if ($method === 'POST' && $path === '/api/live/start') {
    $ip = client_ip();
    if (rate_limited($ip)) {
        json_response(['ok' => false, 'error' => 'Too many requests. Please try again shortly.'], 429);
    }

    try {
        $body = read_json_body();
        $context = is_array($body['context'] ?? null) ? $body['context'] : [];
        $session = create_live_session($ip, $context);
        json_response(['ok' => true, 'session' => $session]);
    } catch (Throwable $error) {
        error_log('[live-start] ' . $error->getMessage());
        json_response(['ok' => false, 'error' => 'Unable to start live chat right now.'], 500);
    }
}

if ($method === 'POST' && $path === '/api/live/message') {
    $ip = client_ip();
    if (rate_limited($ip)) {
        json_response(['ok' => false, 'error' => 'Too many requests. Please try again shortly.'], 429);
    }

    try {
        $body = read_json_body();
        $sessionId = clean_string($body['sessionId'] ?? '', 64);
        $content = trim((string) ($body['content'] ?? ''));
        $sender = ($body['sender'] ?? '') === 'admin' ? 'admin' : 'user';

        if ($sessionId === '' || $content === '') {
            json_response(['ok' => false, 'error' => 'Session id and message are required.'], 400);
        }

        if ($sender === 'admin') {
            require_admin_token();
        } elseif (get_live_session($sessionId) === null) {
            json_response(['ok' => false, 'error' => 'Live chat session not found.'], 404);
        }

        $session = append_live_message($sessionId, $sender, $content);
        json_response(['ok' => true, 'session' => $session]);
    } catch (Throwable $error) {
        error_log('[live-message] ' . $error->getMessage());
        json_response(['ok' => false, 'error' => $error->getMessage() ?: 'Unable to send message right now.'], 500);
    }
}

if ($method === 'GET' && $path === '/api/live/poll') {
    try {
        $sessionId = clean_string($_GET['sessionId'] ?? '', 64);
        $afterId = clean_string($_GET['after'] ?? '', 32);
        if ($sessionId === '') {
            json_response(['ok' => false, 'error' => 'Session id is required.'], 400);
        }

        $auth = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
        $isAdmin = preg_match('/^Bearer\s+(.+)$/i', $auth, $matches)
            && hash_equals(trim(env('LIVE_CHAT_ADMIN_TOKEN', '') ?? ''), trim($matches[1]));

        if (!$isAdmin && get_live_session($sessionId) === null) {
            json_response(['ok' => false, 'error' => 'Live chat session not found.'], 404);
        }

        // Instant poll — long-polling blocks PHP's single-threaded dev server.
        $result = fetch_live_messages_since($sessionId, $afterId !== '' ? $afterId : null);
        json_response(['ok' => true, ...$result]);
    } catch (Throwable $error) {
        error_log('[live-poll] ' . $error->getMessage());
        json_response(['ok' => false, 'error' => 'Unable to poll live chat right now.'], 500);
    }
}

if ($method === 'GET' && $path === '/api/live/session') {
    try {
        $sessionId = clean_string($_GET['id'] ?? '', 64);
        if ($sessionId === '') {
            json_response(['ok' => false, 'error' => 'Session id is required.'], 400);
        }

        require_admin_token();
        $session = get_live_session($sessionId);
        if ($session === null) {
            json_response(['ok' => false, 'error' => 'Live chat session not found.'], 404);
        }

        json_response(['ok' => true, 'session' => public_session($session)]);
    } catch (Throwable $error) {
        error_log('[live-session] ' . $error->getMessage());
        json_response(['ok' => false, 'error' => 'Unable to load live chat session.'], 500);
    }
}

if ($method === 'GET' && $path === '/api/live/sessions') {
    try {
        require_admin_token();
        json_response(['ok' => true, 'sessions' => list_live_sessions()]);
    } catch (Throwable $error) {
        error_log('[live-sessions] ' . $error->getMessage());
        json_response(['ok' => false, 'error' => 'Unable to load live chat sessions.'], 500);
    }
}

if ($method === 'POST' && $path === '/api/live/sessions/clear') {
    try {
        require_admin_token();
        $removed = clear_all_live_sessions();
        json_response(['ok' => true, 'removed' => $removed]);
    } catch (Throwable $error) {
        error_log('[live-clear] ' . $error->getMessage());
        json_response(['ok' => false, 'error' => 'Unable to clear live chat sessions.'], 500);
    }
}

if ($method === 'POST' && $path === '/api/assist') {
    $ip = client_ip();
    if (rate_limited($ip)) {
        json_response(['ok' => false, 'error' => 'Too many requests. Please try again shortly.'], 429);
    }

    try {
        $body = read_json_body();
        $reply = generate_assist_reply($body['messages'] ?? []);
        json_response(['ok' => true, 'reply' => $reply]);
    } catch (Throwable $error) {
        error_log('[assist] ' . $error->getMessage());
        json_response(['ok' => false, 'error' => 'Unable to reply right now.'], 500);
    }
}

if ($method === 'POST' && $path === '/api/jobs/apply') {
    $ip = client_ip();
    if (rate_limited($ip)) {
        json_response(['ok' => false, 'error' => 'Too many requests. Please try again shortly.'], 429);
    }

    try {
        if (!empty($_POST['website'])) {
            json_response(['ok' => true]);
        }

        $jobToken = clean_string($_POST['jobToken'] ?? '', 32);
        $jobTitle = clean_string($_POST['jobTitle'] ?? '', 180);
        $name = clean_string($_POST['name'] ?? '', 120);
        $email = clean_string($_POST['email'] ?? '', 180);
        $phone = clean_string($_POST['phone'] ?? '', 40);
        $message = trim((string) ($_POST['message'] ?? ''));
        if (strlen($message) > 3000) {
            $message = substr($message, 0, 3000);
        }

        if ($jobToken === '' || $name === '' || $email === '') {
            json_response(['ok' => false, 'error' => 'Name, email, and job reference are required.'], 400);
        }

        if (!is_email($email)) {
            json_response(['ok' => false, 'error' => 'Please provide a valid email address.'], 400);
        }

        $resume = $_FILES['resume'] ?? null;
        if (!is_array($resume)) {
            json_response(['ok' => false, 'error' => 'Please upload your resume.'], 400);
        }

        $record = save_job_application($jobToken, $jobTitle, $name, $email, $phone, $message, $resume, $ip);
        json_response(['ok' => true, 'id' => $record['id']]);
    } catch (InvalidArgumentException $error) {
        json_response(['ok' => false, 'error' => $error->getMessage()], 400);
    } catch (Throwable $error) {
        error_log('[job-apply] ' . $error->getMessage());
        json_response(['ok' => false, 'error' => 'Unable to submit your application right now.'], 500);
    }
}

if ($method === 'POST' && $path === '/api/contact') {
    $ip = client_ip();
    if (rate_limited($ip)) {
        json_response(['ok' => false, 'error' => 'Too many requests. Please try again shortly.'], 429);
    }

    try {
        $body = read_json_body();

        // Honeypot — bots fill hidden fields; humans leave this empty.
        if (!empty($body['website'])) {
            json_response(['ok' => true]);
        }

        $safeName = clean_string($body['name'] ?? '', 120);
        $safeEmail = clean_string($body['email'] ?? '', 180);
        $safeCompany = clean_string($body['company'] ?? '', 180);
        $safeMessage = trim((string) ($body['message'] ?? ''));
        if (strlen($safeMessage) > 5000) {
            $safeMessage = substr($safeMessage, 0, 5000);
        }

        if ($safeName === '' || $safeEmail === '' || $safeMessage === '') {
            json_response(['ok' => false, 'error' => 'Name, email, and message are required.'], 400);
        }

        if (!is_email($safeEmail)) {
            json_response(['ok' => false, 'error' => 'Please provide a valid email address.'], 400);
        }

        $record = save_contact_record($safeName, $safeEmail, $safeCompany, $safeMessage, $ip);
        json_response(['ok' => true, 'id' => $record['id']]);
    } catch (Throwable $error) {
        error_log('[contact] ' . $error->getMessage());
        json_response(['ok' => false, 'error' => 'Unable to save your enquiry right now.'], 500);
    }
}

json_response(['ok' => false, 'error' => 'Not found.'], 404);
