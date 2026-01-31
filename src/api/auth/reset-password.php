<?php
require_once __DIR__ . '/../../config/dbConnection.php';
require_once __DIR__ . '/../../classes/Utente.php';

require_once __DIR__ . '/../../support/response.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error("Metodo non consentito", 405);
}

$data = json_decode(file_get_contents('php://input'), true);

if (!$data || !isset($data['email'], $data['newPassword'])) {
    Response::error("Dati mancanti", 400);
}

$email = trim((string)$data['email']);
$newPassword = (string)$data['newPassword'];

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    Response::error("Email non valida", 400);
}

if (strlen($newPassword) < 6) {
    Response::error("La password deve essere di almeno 6 caratteri", 400);
}

try {
    $utente = new Utente($conn);

    if (!$utente->caricaDaEmail($email)) {
        Response::error("Email non trovata nel sistema", 404);
    }

    if ($utente->aggiorna(['password' => $newPassword])) {
        Response::json([
            "success" => true,
            "message" => "Password reimpostata con successo"
        ]);
    }

    Response::error("Errore durante il reset della password", 500);
} catch (PDOException $e) {
    Response::error("Errore del database", 500);
} catch (Exception $e) {
    Response::error("Errore del server", 500);
}
