<?php

declare(strict_types=1);

require_once __DIR__ . '/lib/env.php';
require_once __DIR__ . '/lib/http.php';
require_once __DIR__ . '/lib/cors.php';
require_once __DIR__ . '/lib/rate_limit.php';
require_once __DIR__ . '/lib/csv_store.php';
require_once __DIR__ . '/lib/assist_chat.php';

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
    ]);
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
