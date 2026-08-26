<?php
/**
 * DeciderSpin contact form REST endpoint.
 *
 * Registers POST /wp-json/deciderspin/v1/contact for the static-exported
 * Next.js site's contact form (components/ContactForm.tsx) to submit to,
 * since a static export has no server to run a Node.js Server Action
 * against. WordPress stays running purely as this mail-relay backend.
 *
 * NOT part of the Next.js build — this is a reference copy of what's
 * actually deployed on the server, at
 * wp-content/novamira-sandbox/deciderspin-contact.php (Novamira only
 * allows PHP writes inside its sandbox directory, and files placed there
 * are auto-loaded on every WordPress request).
 */

add_action('rest_api_init', function () {
    register_rest_route('deciderspin/v1', '/contact', [
        'methods'             => 'POST',
        'callback'            => 'deciderspin_handle_contact_submission',
        'permission_callback' => '__return_true',
    ]);
});

function deciderspin_handle_contact_submission(WP_REST_Request $request) {
    $params = $request->get_json_params();
    if (empty($params)) {
        $params = $request->get_params();
    }

    $name = isset($params['name']) ? trim(sanitize_text_field($params['name'])) : '';
    $email = isset($params['email']) ? trim(sanitize_email($params['email'])) : '';
    $message = isset($params['message']) ? trim(sanitize_textarea_field($params['message'])) : '';
    $consent = $params['consent'] ?? '';
    // Honeypot: a field real visitors never see or fill in. Bots that
    // auto-fill every input trip it — they get a fake success, no error
    // that would tip them off, and nothing is actually sent.
    $honeypot = isset($params['company']) ? trim((string) $params['company']) : '';

    if ($honeypot !== '') {
        return new WP_REST_Response(['success' => true], 200);
    }

    if ($name === '') {
        return new WP_REST_Response(['error' => 'Enter your name.'], 422);
    }
    if (!is_email($email)) {
        return new WP_REST_Response(['error' => 'Enter a valid email address.'], 422);
    }
    if ($message === '') {
        return new WP_REST_Response(['error' => 'Enter a message.'], 422);
    }
    if (!in_array($consent, ['on', 'true', '1', true], true)) {
        return new WP_REST_Response(['error' => 'Please check the consent box to send your message.'], 422);
    }

    $to = 'onlineaop@gmail.com';
    $subject = 'New contact form message from ' . $name;
    $body = "From: {$name} <{$email}>\n\n{$message}";
    $headers = [
        'Reply-To: ' . $name . ' <' . $email . '>',
    ];

    $sent = wp_mail($to, $subject, $body, $headers);

    if (!$sent) {
        return new WP_REST_Response([
            'error' => 'Something went wrong sending your message. Please try again, or email us directly instead.',
        ], 500);
    }

    return new WP_REST_Response(['success' => true], 200);
}
