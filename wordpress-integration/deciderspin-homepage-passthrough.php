<?php
/**
 * The document root has both WordPress's index.php and the static Next.js
 * export's index.html sitting side by side. Apache/LiteSpeed's default
 * DirectoryIndex order serves index.php first, so "/" would otherwise run
 * through Elementor instead of the new static site — and .htaccess can't
 * be edited to flip that priority (it's treated as a PHP execution-control
 * file, sandbox-only, same as this one). Transparently serving the static
 * file's bytes from within WordPress achieves the same result without
 * needing that Apache-level change.
 *
 * NOT part of the Next.js build — this is a reference copy of what's
 * actually deployed on the server, at
 * wp-content/novamira-sandbox/deciderspin-homepage-passthrough.php.
 *
 * Every other route (/8ball/, /contact/, /privacy-policy/,
 * /terms-of-service/) doesn't need this trick: those directories have no
 * competing index.php of their own, so the exported index.html there wins
 * automatically.
 */

add_action('template_redirect', function () {
    $path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
    if ($path !== '/' && $path !== '') {
        return;
    }

    $file = ABSPATH . 'index.html';
    if (!file_exists($file)) {
        return;
    }

    header('Content-Type: text/html; charset=UTF-8');
    readfile($file);
    exit;
});
