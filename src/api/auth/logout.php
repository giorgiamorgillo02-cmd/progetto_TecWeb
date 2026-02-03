<?php
// logout.php - Gestisce il logout dell'utente
require_once __DIR__ . '/../../support/response.php';
require_once __DIR__ . '/../../support/auth.php';

Auth::start();// Avvia la sessione senza richiedere il login
session_destroy();// Distrugge la sessione corrente

Response::json([
    "success" => true,
    "message" => "Logout effettuato con successo"
]);
?>
