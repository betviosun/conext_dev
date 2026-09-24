<?php

declare(strict_types=1);

require_once dirname(__DIR__) . '/businessKnowledge.php';

function assist_config(): array
{
    $baseUrl = env('OPENAI_BASE_URL', 'https://api.openai.com/v1') ?? 'https://api.openai.com/v1';
    $baseUrl = rtrim($baseUrl, '/');

    return [
        'apiKey' => trim(env('OPENAI_API_KEY', '') ?? ''),
        'baseUrl' => $baseUrl,
        'model' => trim(env('OPENAI_MODEL', 'gpt-4o-mini') ?? 'gpt-4o-mini'),
    ];
}

function normalize_messages(mixed $messages): array
{
    if (!is_array($messages)) {
        return [];
    }

    $normalized = [];
    foreach (array_slice($messages, -12) as $item) {
        if (!is_array($item)) {
            continue;
        }

        $role = (($item['role'] ?? '') === 'assistant') ? 'assistant' : 'user';
        $content = clean_string($item['content'] ?? '', 2000);
        if ($content === '') {
            continue;
        }

        $normalized[] = [
            'role' => $role,
            'content' => $content,
        ];
    }

    return $normalized;
}

function assist_http_error(string $message, int $status): never
{
    json_response(['ok' => false, 'error' => $message], $status);
}

function generate_assist_reply(mixed $rawMessages): string
{
    $config = assist_config();
    if ($config['apiKey'] === '') {
        assist_http_error('Assist chat is not configured. Add OPENAI_API_KEY to server/.env.', 503);
    }

    $messages = normalize_messages($rawMessages);
    if ($messages === []) {
        assist_http_error('Please enter a message.', 400);
    }

    $payload = json_encode([
        'model' => $config['model'],
        'temperature' => 0.4,
        'max_tokens' => 450,
        'messages' => array_merge(
            [['role' => 'system', 'content' => assist_system_prompt()]],
            $messages
        ),
    ], JSON_UNESCAPED_UNICODE);

    if ($payload === false) {
        assist_http_error('Unable to prepare assist request.', 500);
    }

    $frontendOrigin = env('FRONTEND_ORIGIN', 'http://localhost:3000') ?? 'http://localhost:3000';
    $url = $config['baseUrl'] . '/chat/completions';

    $ch = curl_init($url);
    if ($ch === false) {
        assist_http_error('Unable to start assist request.', 500);
    }

    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => [
            'Authorization: Bearer ' . $config['apiKey'],
            'Content-Type: application/json',
            'HTTP-Referer: ' . $frontendOrigin,
            'X-Title: CoNext Assist',
        ],
        CURLOPT_POSTFIELDS => $payload,
        CURLOPT_CONNECTTIMEOUT => 15,
        CURLOPT_TIMEOUT => 45,
    ]);

    $responseBody = curl_exec($ch);
    $curlError = curl_error($ch);
    $statusCode = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($responseBody === false) {
        if (str_contains(strtolower($curlError), 'timed out')) {
            assist_http_error('OpenRouter request timed out. Check your network and try again.', 504);
        }

        assist_http_error('Could not reach OpenRouter. Check internet/VPN/firewall and try again.', 504);
    }

    $decoded = json_decode($responseBody, true);
    if (!is_array($decoded)) {
        assist_http_error('Invalid response from assist provider.', 502);
    }

    if ($statusCode < 200 || $statusCode >= 300) {
        $detail = $decoded['error']['message'] ?? "OpenRouter request failed ($statusCode)";
        assist_http_error((string) $detail, 502);
    }

    $reply = trim((string) ($decoded['choices'][0]['message']['content'] ?? ''));
    if ($reply === '') {
        assist_http_error('No response was generated. Please try again.', 502);
    }

    return $reply;
}
