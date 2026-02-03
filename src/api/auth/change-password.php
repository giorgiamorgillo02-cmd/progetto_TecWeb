<?php
// change-password.php - Cambia la password dell'utente loggato 
require_once __DIR__ . '/../../config/dbConnection.php';
require_once __DIR__ . '/../../classes/Utente.php';

require_once __DIR__ . '/../../support/response.php';
require_once __DIR__ . '/../../support/auth.php';

Auth::requireLogin();// Verifica che l'utente sia loggato

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error("Metodo non consentito", 405);
}// Solo POST è consentito

$data = json_decode(file_get_contents('php://input'), true);// Legge i dati JSON dal corpo della richiesta

// Verifica che i dati necessari siano presenti, altrimenti restituisce un errore
if (!$data || !isset($data['currentPassword'], // Controlla che currentPassword e newPassword siano presenti
$data['newPassword'])) {
    Response::error("Dati mancanti", 400);
}

$currentPassword = (string) $data['currentPassword'];// Password attuale
$newPassword = (string) $data['newPassword'];// Nuova password

// Verifica che la nuova password sia sufficientemente lunga
if (strlen($newPassword) < 6) {
    Response::error("La nuova password deve essere di almeno 6 caratteri", 400);
}

try {
    $utente = new Utente($conn, (int)$_SESSION['id_utente']);// Carica l'utente loggato

     // Verifica che l'utente esista

    if ($utente->getId() === null) {
        Response::error("Utente non trovato", 404);
    }
// Verifica che la password attuale sia corretta
    if (!$utente->verificaPassword($currentPassword)) {
        Response::error("Password attuale non corretta", 401);
    }
// Aggiorna la password con la nuova password
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
