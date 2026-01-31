<?php
require_once __DIR__ . '/../../support/response.php';
require_once __DIR__ . '/../../support/auth.php';

Auth::start();
session_destroy();

Response::json([
    "success" => true,
    "message" => "Logout effettuato con successo"
]);
?>
