<?php

declare(strict_types=1);

const APPLICATION_CSV_HEADERS = [
    'id',
    'job_token',
    'job_title',
    'name',
    'email',
    'phone',
    'message',
    'resume_file',
    'created_at',
    'ip',
];

const ALLOWED_RESUME_EXTENSIONS = ['pdf', 'doc', 'docx'];
const MAX_RESUME_BYTES = 5 * 1024 * 1024;

function applications_data_dir(): string
{
    $configured = env('APPLICATIONS_DATA_DIR');
    if ($configured !== null && $configured !== '') {
        return rtrim($configured, DIRECTORY_SEPARATOR);
    }

    return dirname(__DIR__) . DIRECTORY_SEPARATOR . 'data';
}

function applications_csv_path(): string
{
    $configured = env('APPLICATIONS_CSV_PATH');
    if ($configured !== null && $configured !== '') {
        return $configured;
    }

    return applications_data_dir() . DIRECTORY_SEPARATOR . 'applications.csv';
}

function resumes_dir(): string
{
    return applications_data_dir() . DIRECTORY_SEPARATOR . 'resumes';
}

function escape_application_csv(string $value): string
{
    if (preg_match('/[",\n\r]/', $value) === 1) {
        return '"' . str_replace('"', '""', $value) . '"';
    }

    return $value;
}

function application_to_csv_row(array $fields): string
{
    $cells = [];
    foreach (APPLICATION_CSV_HEADERS as $header) {
        $cells[] = escape_application_csv((string) ($fields[$header] ?? ''));
    }

    return implode(',', $cells) . "\n";
}

function ensure_applications_store(): void
{
    $dir = applications_data_dir();
    if (!is_dir($dir) && !mkdir($dir, 0755, true) && !is_dir($dir)) {
        throw new RuntimeException('Unable to create applications data directory.');
    }

    $resumeDir = resumes_dir();
    if (!is_dir($resumeDir) && !mkdir($resumeDir, 0755, true) && !is_dir($resumeDir)) {
        throw new RuntimeException('Unable to create resumes directory.');
    }

    $path = applications_csv_path();
    if (!is_file($path)) {
        if (file_put_contents($path, implode(',', APPLICATION_CSV_HEADERS) . "\n", LOCK_EX) === false) {
            throw new RuntimeException('Unable to initialize applications CSV file.');
        }
    }
}

function sanitize_resume_basename(string $filename): string
{
    $basename = basename($filename);
    $basename = preg_replace('/[^a-zA-Z0-9._-]+/', '_', $basename) ?? 'resume';
    $basename = trim($basename, '._-');
    if ($basename === '') {
        return 'resume';
    }

    return substr($basename, 0, 80);
}

function resume_extension(string $filename): string
{
    return strtolower(pathinfo($filename, PATHINFO_EXTENSION));
}

function validate_resume_upload(array $file): void
{
    if (($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
        throw new InvalidArgumentException('Please upload your resume.');
    }

    $size = (int) ($file['size'] ?? 0);
    if ($size <= 0 || $size > MAX_RESUME_BYTES) {
        throw new InvalidArgumentException('Resume must be 5 MB or smaller.');
    }

    $originalName = (string) ($file['name'] ?? '');
    $extension = resume_extension($originalName);
    if (!in_array($extension, ALLOWED_RESUME_EXTENSIONS, true)) {
        throw new InvalidArgumentException('Resume must be a PDF, DOC, or DOCX file.');
    }

    $tmpPath = (string) ($file['tmp_name'] ?? '');
    if ($tmpPath === '' || !is_uploaded_file($tmpPath)) {
        throw new InvalidArgumentException('Invalid resume upload.');
    }

    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mime = $finfo ? finfo_file($finfo, $tmpPath) : false;
    if ($finfo) {
        finfo_close($finfo);
    }

    $allowedMimes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/octet-stream',
    ];

    if ($mime !== false && !in_array($mime, $allowedMimes, true)) {
        throw new InvalidArgumentException('Resume must be a PDF, DOC, or DOCX file.');
    }
}

function store_resume_file(string $applicationId, array $file): string
{
    validate_resume_upload($file);

    $extension = resume_extension((string) ($file['name'] ?? ''));
    $safeBase = sanitize_resume_basename((string) ($file['name'] ?? 'resume'));
    $storedName = $applicationId . '_' . preg_replace('/\.[^.]+$/', '', $safeBase) . '.' . $extension;
    $targetPath = resumes_dir() . DIRECTORY_SEPARATOR . $storedName;

    if (!move_uploaded_file((string) $file['tmp_name'], $targetPath)) {
        throw new RuntimeException('Unable to save resume file.');
    }

    return $storedName;
}

function save_job_application(
    string $jobToken,
    string $jobTitle,
    string $name,
    string $email,
    string $phone,
    string $message,
    array $resumeFile,
    string $ip
): array {
    ensure_applications_store();

    $applicationId = bin2hex(random_bytes(16));
    $storedResume = store_resume_file($applicationId, $resumeFile);

    $record = [
        'id' => $applicationId,
        'job_token' => $jobToken,
        'job_title' => $jobTitle,
        'name' => $name,
        'email' => $email,
        'phone' => $phone,
        'message' => $message,
        'resume_file' => $storedResume,
        'created_at' => gmdate('c'),
        'ip' => $ip,
    ];

    if (file_put_contents(applications_csv_path(), application_to_csv_row($record), FILE_APPEND | LOCK_EX) === false) {
        @unlink(resumes_dir() . DIRECTORY_SEPARATOR . $storedResume);
        throw new RuntimeException('Unable to save application record.');
    }

    return $record;
}
