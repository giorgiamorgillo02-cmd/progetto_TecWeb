<?php
// reset-password.php - Reimposta la password di un utente tramite email nel caso in cui l'abbia dimenticata
require_once __DIR__ . '/../../config/dbConnection.php';
require_once __DIR__ . '/../../classes/Utente.php';
require_once __DIR__ . '/../../support/response.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error("Metodo non consentito", 405);
}// Solo POST è consentito

$data = json_decode(file_get_contents('php://input'), true);

// Verifica che i dati necessari siano presenti, altrimenti restituisce un errore
if (!$data || !isset($data['email'], $data['newPassword']))// Controlla che email e newPassword siano presenti
{
    Response::error("Dati mancanti", 400);
}

$email = trim((string)$data['email']);// Email utente
$newPassword = (string)$data['newPassword'];// Nuova password

// Verifica che l'email sia valida
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    Response::error("Email non valida", 400);
}

// Verifica che la nuova password sia sufficientemente lunga
if (strlen($newPassword) < 6) {
    Response::error("La password deve essere di almeno 6 caratteri", 400);
}

try {
    $utente = new Utente($conn);// Crea un'istanza della classe Utente

     // Carica l'utente tramite email

    if (!$utente->caricaDaEmail($email)) {
        Response::error("Email non trovata nel sistema", 404);
    }
// Aggiorna la password con la nuova password
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
