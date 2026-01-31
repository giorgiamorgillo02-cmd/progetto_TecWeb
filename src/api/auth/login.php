<?php
require_once __DIR__ . '/../../config/dbConnection.php';
require_once __DIR__ . '/../../support/response.php';
require_once __DIR__ . '/../../support/auth.php';

Auth::start();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error("Metodo non valido", 405);
}

$data = json_decode(file_get_contents('php://input'), true);
if (!$data || !isset($data['email'], $data['password'])) {
    Response::error("Dati mancanti", 400);
}

$email = trim((string)$data['email']);
$password = (string)$data['password'];

try {
    $stmt = $conn->prepare("
        SELECT id, mail, password_hash, ruolo, blocked
        FROM utenti
        WHERE mail = :email
    ");
    $stmt->bindValue(':email', $email, PDO::PARAM_STR);
    $stmt->execute();

    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        Response::error("Email non trovata.", 404);
    }

    if ((int)($user['blocked'] ?? 0) === 1) {
        Response::error("Il tuo account è stato bloccato. Contatta l'amministratore.", 403);
    }

    $passwordOk = password_verify($password, $user['password_hash'])
        || $password === $user['password_hash']; // legacy, come nel tuo file [file:113]

    if (!$passwordOk) {
        Response::error("Password errata.", 401);
    }

    $_SESSION['authenticated'] = true;
    $_SESSION['id_utente'] = (int)$user['id'];
    $_SESSION['email'] = $user['mail'];
    $_SESSION['ruolo'] = (int)$user['ruolo'];

    $redirect = ((int)$user['ruolo'] === 1) ? "admin.html" : "home.html";

    Response::json([
        "success" => true,
        "message" => "Login effettuato!",
        "redirect" => $redirect,
        "is_admin" => ((int)$user['ruolo'] === 1)
    ]);
} catch (PDOException $e) {
    Response::error("Errore server", 500);
}
