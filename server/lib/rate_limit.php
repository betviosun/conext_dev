<?php

declare(strict_types=1);

function rate_limited(string $ip, int $windowMs = 60_000, int $max = 20): bool
{
    $dir = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'conext-rate';
    if (!is_dir($dir) && !mkdir($dir, 0755, true) && !is_dir($dir)) {
        return false;
    }

    $path = $dir . DIRECTORY_SEPARATOR . md5($ip) . '.json';
    $now = (int) round(microtime(true) * 1000);
    $hits = [];

    if (is_file($path)) {
        $decoded = json_decode((string) file_get_contents($path), true);
        if (is_array($decoded)) {
            $hits = $decoded;
        }
    }

    $hits = array_values(array_filter($hits, static fn ($timestamp) => is_int($timestamp) && ($now - $timestamp) < $windowMs));
    $hits[] = $now;
    file_put_contents($path, json_encode($hits), LOCK_EX);

    return count($hits) > $max;
}
