<?php
require_once __DIR__ . '/../../dbConnection.php';

require_once __DIR__ . '/../../src/support/response.php';
require_once __DIR__ . '/../../src/support/auth.php';

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

// Validazioni backend dettagliate
$errors = [];

if (empty($nome)) {
    $errors['nome'] = "Il nome è obbligatorio";
}

if (empty($cognome)) {
    $errors['cognome'] = "Il cognome è obbligatorio";
}

if (empty($mail)) {
    $errors['mail'] = "L'email è obbligatoria";
} elseif (!filter_var($mail, FILTER_VALIDATE_EMAIL)) {
    $errors['mail'] = "Email non valida";
}

if (empty($telefono)) {
    $errors['telefono'] = "Il telefono è obbligatorio";
} elseif (strlen($telefono) < 10) {
    $errors['telefono'] = "Inserisci un numero di telefono valido";
}

if (empty($via)) {
    $errors['via'] = "L'indirizzo è obbligatorio";
}

if (empty($citta)) {
    $errors['citta'] = "La città è obbligatoria";
}

if (empty($provincia)) {
    $errors['provincia'] = "La provincia è obbligatoria";
} elseif (strlen($provincia) !== 2) {
    $errors['provincia'] = "Provincia deve essere di 2 caratteri (es. MI)";
}

if (empty($cap)) {
    $errors['cap'] = "Il CAP è obbligatorio";
} elseif (strlen($cap) !== 5 || !is_numeric($cap)) {
    $errors['cap'] = "CAP non valido (5 cifre)";
}

if (empty($password)) {
    $errors['password'] = "La password è obbligatoria";
} elseif (strlen($password) < 6) {
    $errors['password'] = "Password troppo corta (min 6 caratteri)";
}

if (empty($passwordConfirm)) {
    $errors['password_confirm'] = "Conferma la password";
} elseif ($password !== $passwordConfirm) {
    $errors['password_confirm'] = "Le password non coincidono";
}

if (!empty($errors)) {
    Response::json([
        "success" => false,
        "message" => "Errori di validazione",
        "errors" => $errors
    ], 400);
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
