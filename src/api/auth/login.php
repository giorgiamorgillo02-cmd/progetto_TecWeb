<?php
// login.php - Gestisce il login degli utenti
require_once __DIR__ . '/../../config/dbConnection.php';
require_once __DIR__ . '/../../support/response.php';
require_once __DIR__ . '/../../support/auth.php';

Auth::start();// Avvia la sessione senza richiedere il login

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error("Metodo non valido", 405);
} // Controlla che il metodo della richiesta sia POST

// Legge i dati JSON inviati nel corpo della richiesta
$data = json_decode(file_get_contents('php://input'), true);
// Verifica che i dati necessari siano presenti
if (!$data || !isset($data['email'], $data['password'])) 
{
    Response::error("Dati mancanti", 400);
}

// Estrae email e password dai dati della richiesta
$email = trim((string)$data['email']);
$password = (string)$data['password'];


try {
    // Prepara ed esegue la query per recuperare l'utente con l'email fornita
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
    }// Verifica se l'utente esiste

    if ((int)($user['blocked'] ?? 0) === 1) {
        Response::error("Il tuo account è stato bloccato. Contatta l'amministratore.", 403);// Controlla se l'account è bloccato
    }

    $passwordOk = password_verify($password, $user['password_hash'])
        || $password === $user['password_hash']; // Verifica la password

    if (!$passwordOk) {
        Response::error("Password errata.", 401);
    }// Se la password non è corretta, restituisce un errore

    $_SESSION['authenticated'] = true;// Imposta le variabili di sessione per l'utente autenticato
    $_SESSION['id_utente'] = (int)$user['id'];// ID utente
    $_SESSION['email'] = $user['mail'];// Email utente
    $_SESSION['ruolo'] = (int)$user['ruolo'];// Ruolo utente

    $redirect = ((int)$user['ruolo'] === 1) ? "admin.html" : "home.html"; // Determina la pagina di reindirizzamento in base al ruolo, se admin va ad admin.html altrimenti a home.html

    Response::json([
        "success" => true,
        "message" => "Login effettuato!",
        "redirect" => $redirect,// Pagina di reindirizzamento
        "is_admin" => ((int)$user['ruolo'] === 1)// Indica se l'utente è un admin
    ]);
} catch (PDOException $e) {
    Response::error("Errore server", 500);
}
