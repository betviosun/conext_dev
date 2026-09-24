<?php

declare(strict_types=1);

function apply_cors(): void
{
    $originConfig = env('FRONTEND_ORIGIN', 'http://localhost:3000') ?? 'http://localhost:3000';
    $allowedOrigins = array_values(array_filter(array_map('trim', explode(',', $originConfig))));
    $requestOrigin = $_SERVER['HTTP_ORIGIN'] ?? '';

    if ($requestOrigin !== '' && in_array($requestOrigin, $allowedOrigins, true)) {
        header("Access-Control-Allow-Origin: $requestOrigin");
        header('Vary: Origin');
    }

    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
}

function handle_preflight(): void
{
    if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
        http_response_code(204);
        exit;
    }
}
