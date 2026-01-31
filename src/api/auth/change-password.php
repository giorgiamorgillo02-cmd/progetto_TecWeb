<?php
require_once __DIR__ . '/../../config/dbConnection.php';
require_once __DIR__ . '/../../classes/Utente.php';

require_once __DIR__ . '/../../support/response.php';
require_once __DIR__ . '/../../support/auth.php';

Auth::requireLogin();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error("Metodo non consentito", 405);
}

$data = json_decode(file_get_contents('php://input'), true);

if (!$data || !isset($data['currentPassword'], $data['newPassword'])) {
    Response::error("Dati mancanti", 400);
}

$currentPassword = (string) $data['currentPassword'];
$newPassword = (string) $data['newPassword'];

if (strlen($newPassword) < 6) {
    Response::error("La nuova password deve essere di almeno 6 caratteri", 400);
}

try {
    $utente = new Utente($conn, (int)$_SESSION['id_utente']);

    if ($utente->getId() === null) {
        Response::error("Utente non trovato", 404);
    }

    if (!$utente->verificaPassword($currentPassword)) {
        Response::error("Password attuale non corretta", 401);
    }

    if ($utente->aggiorna(['password' => $newPassword])) {
        Response::json([
            "success" => true,
            "message" => "Password modificata con successo"
        ]);
    }

    Response::error("Errore durante il cambio password", 500);
} catch (PDOException $e) {
    Response::error("Errore del database", 500);
} catch (Exception $e) {
    Response::error("Errore del server", 500);
}
