<?php
require_once __DIR__ . '/../../config/dbConnection.php';

require_once __DIR__ . '/../../support/response.php';
require_once __DIR__ . '/../../support/auth.php';

Auth::start();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error("Metodo non valido", 405);
}

$data = json_decode(file_get_contents('php://input'), true);
if (!$data) {
    Response::error("Dati non validi", 400);
}

$nome = trim((string)($data['nome'] ?? ''));
$cognome = trim((string)($data['cognome'] ?? ''));
$mail = trim((string)($data['mail'] ?? ''));
$telefono = trim((string)($data['telefono'] ?? ''));
$via = trim((string)($data['via'] ?? ''));
$citta = trim((string)($data['citta'] ?? ''));
$provincia = strtoupper(trim((string)($data['provincia'] ?? '')));
$cap = trim((string)($data['cap'] ?? ''));
$password = (string)($data['password'] ?? '');
$passwordConfirm = (string)($data['password_confirm'] ?? '');

if ($nome === '' || $cognome === '' || $mail === '' || $telefono === '' || $via === '' ||
    $citta === '' || $provincia === '' || $cap === '' || $password === '') {
    Response::error("Compila tutti i campi", 400);
}

if (!filter_var($mail, FILTER_VALIDATE_EMAIL)) {
    Response::error("Email non valida", 400);
}

if ($password !== $passwordConfirm) {
    Response::error("Le password non coincidono", 400);
}

if (strlen($password) < 6) {
    Response::error("Password troppo corta (min 6 caratteri)", 400);
}

if (strlen($provincia) !== 2) {
    Response::error("Provincia deve essere di 2 caratteri", 400);
}

if (strlen($cap) !== 5 || !is_numeric($cap)) {
    Response::error("CAP non valido (5 cifre)", 400);
}

try {
    $checkStmt = $conn->prepare("SELECT id FROM utenti WHERE mail = :mail");
    $checkStmt->bindValue(':mail', $mail, PDO::PARAM_STR);
    $checkStmt->execute();

    if ($checkStmt->fetch(PDO::FETCH_ASSOC)) {
        Response::error("Email già registrata", 409);
    }

    $passwordHash = password_hash($password, PASSWORD_DEFAULT);

    $stmt = $conn->prepare("
        INSERT INTO utenti (nome, cognome, mail, Telefono, via, citta, provincia, cap, password_hash, ruolo)
        VALUES (:nome, :cognome, :mail, :telefono, :via, :citta, :provincia, :cap, :password_hash, 0)
    ");

    $stmt->execute([
        ':nome' => $nome,
        ':cognome' => $cognome,
        ':mail' => $mail,
        ':telefono' => $telefono,
        ':via' => $via,
        ':citta' => $citta,
        ':provincia' => $provincia,
        ':cap' => $cap,
        ':password_hash' => $passwordHash
    ]);

    $userId = (int)$conn->lastInsertId();

    $_SESSION['authenticated'] = true;
    $_SESSION['id_utente'] = $userId;
    $_SESSION['email'] = $mail;
    $_SESSION['ruolo'] = 0;

    Response::json([
        "success" => true,
        "message" => "Registrazione completata! Sarai reindirizzato alla home.",
        "redirect" => "home.html"
    ]);
} catch (PDOException $e) {
    error_log("Errore registrazione: " . $e->getMessage());
    Response::error("Errore durante la registrazione. Riprova.", 500);
} catch (Exception $e) {
    error_log("Errore generico registrazione: " . $e->getMessage());
    Response::error("Errore server", 500);
}
