<?php

declare(strict_types=1);

const CSV_HEADERS = ['id', 'name', 'gmail', 'company', 'content', 'created_at', 'ip'];

function csv_path(): string
{
    $configured = env('CONTACT_CSV_PATH');
    if ($configured !== null && $configured !== '') {
        return $configured;
    }

    $dir = env('CONTACT_CSV_DIR');
    if ($dir === null || $dir === '') {
        $dir = dirname(__DIR__) . DIRECTORY_SEPARATOR . 'data';
    }

    return rtrim($dir, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . 'contacts.csv';
}

function escape_csv(string $value): string
{
    if (preg_match('/[",\n\r]/', $value) === 1) {
        return '"' . str_replace('"', '""', $value) . '"';
    }

    return $value;
}

function to_csv_row(array $fields): string
{
    $cells = [];
    foreach (CSV_HEADERS as $header) {
        $cells[] = escape_csv((string) ($fields[$header] ?? ''));
    }

    return implode(',', $cells) . "\n";
}

function ensure_csv(): void
{
    $path = csv_path();
    $dir = dirname($path);
    if (!is_dir($dir) && !mkdir($dir, 0755, true) && !is_dir($dir)) {
        throw new RuntimeException('Unable to create contact CSV directory.');
    }

    if (!is_file($path)) {
        if (file_put_contents($path, implode(',', CSV_HEADERS) . "\n", LOCK_EX) === false) {
            throw new RuntimeException('Unable to initialize contact CSV file.');
        }
    }
}

function save_contact_record(string $name, string $gmail, string $company, string $content, string $ip): array
{
    ensure_csv();

    $record = [
        'id' => bin2hex(random_bytes(16)),
        'name' => $name,
        'gmail' => $gmail,
        'company' => $company,
        'content' => $content,
        'created_at' => gmdate('c'),
        'ip' => $ip,
    ];

    if (file_put_contents(csv_path(), to_csv_row($record), FILE_APPEND | LOCK_EX) === false) {
        throw new RuntimeException('Unable to save contact record.');
    }

    return $record;
}
