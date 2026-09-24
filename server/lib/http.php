<?php

declare(strict_types=1);

function json_response(array $payload, int $status = 200): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}

function read_json_body(): array
{
    $raw = file_get_contents('php://input');
    if ($raw === false || trim($raw) === '') {
        return [];
    }

    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : [];
}

function client_ip(): string
{
    $forwarded = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? '';
    if ($forwarded !== '') {
        $parts = explode(',', $forwarded);
        $ip = trim($parts[0]);
        if ($ip !== '') {
            return $ip;
        }
    }

    return $_SERVER['REMOTE_ADDR'] ?? 'unknown';
}

function clean_string(mixed $value, int $max = 2000): string
{
    $text = trim((string) ($value ?? ''));
    if ($text === '') {
        return '';
    }

    $text = preg_replace('/[\r\n]+/', ' ', $text) ?? $text;
    if (strlen($text) > $max) {
        $text = substr($text, 0, $max);
    }

    return $text;
}

function is_email(string $value): bool
{
    return (bool) filter_var($value, FILTER_VALIDATE_EMAIL);
}
