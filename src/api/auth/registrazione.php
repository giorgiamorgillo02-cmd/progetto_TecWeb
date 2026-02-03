<?php
//API PER LA GESTIONE DELLA REGISTRAZIONE
require_once __DIR__ . '/../../config/dbConnection.php'; //connessione al db 
require_once __DIR__ . '/../../support/response.php'; //gestione risposte api
require_once __DIR__ . '/../../support/auth.php'; //gestione autenticazione 

// Avvia sessione (non richiede login per endpoint pubblico)
Auth::start(); 

//-------VERIFICA SE EMAIL GIA USATA (chiamata via get)-------
//se chiamata get e se mail esiste
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['mail'])) {
    header('Content-Type: application/json');
    $email = trim($_GET['mail']);
    
    //se mail vuota ->esce 
    if (empty($email)) {
        echo json_encode(['exists' => false]);
        exit;
    }
    //se mail non è vuota -> controlla se esiste gia 
    try {
        $stmt = $conn->prepare("SELECT id FROM utenti WHERE mail = ?"); //selezioa id in base a mail 
        $stmt->execute([$email]); 
        //se esiste almeno una riga -> l'email esista gia 
        $exists = $stmt->rowCount() > 0;
        echo json_encode(['exists' => $exists]);
    } 
    //se errore server -> messaggio errore 
    catch (Exception $e) {
        echo json_encode(['exists' => false, 'error' => 'Errore server']);
    }
    exit; //termina richiesta get 
}

//-------REGISTRA UTENTE (chiamata post)-------

//accetta solo metodo post per la scrittura dati (sicurezza)
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error("Metodo non valido", 405);
}

//decodifica json (solo se dati validi)
$data = json_decode(file_get_contents('php://input'), true);
if (!$data) {
    Response::error("Dati non validi", 400);
}

//etsrazione e pulizia dei dati (??-> evita errori se manca campo)
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

//VALIDAZIONE LATO SERVER (controlli aggiuntivi a quelli forntend)
//controlla campi vuoti 
if ($nome === '' || $cognome === '' || $mail === '' || $telefono === '' || $via === '' ||
    $citta === '' || $provincia === '' || $cap === '' || $password === '') {
    Response::error("Compila tutti i campi", 400);
}
//formato email
if (!filter_var($mail, FILTER_VALIDATE_EMAIL)) {
    Response::error("Email non valida", 400);
}
//match tra pw e conferma pw
if ($password !== $passwordConfirm) {
    Response::error("Le password non coincidono", 400);
}
//lunghezza password 
if (strlen($password) < 6) {
    Response::error("Password troppo corta (min 6 caratteri)", 400);
}
//formato provincia 
if (strlen($provincia) !== 2) {
    Response::error("Provincia deve essere di 2 caratteri", 400);
}
//formato cap
if (strlen($cap) !== 5 || !is_numeric($cap)) {
    Response::error("CAP non valido (5 cifre)", 400);
}

try {
    //controlla se esistono dupicati
    $checkStmt = $conn->prepare("SELECT id FROM utenti WHERE mail = :mail");
    $checkStmt->bindValue(':mail', $mail, PDO::PARAM_STR);
    $checkStmt->execute();

    if ($checkStmt->fetch(PDO::FETCH_ASSOC)) {
        Response::error("Email già registrata", 409);
    }

    //hashing password 
    $passwordHash = password_hash($password, PASSWORD_DEFAULT);

    //inserisce nel db 
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

    //recupera id autoincrement appena generato 
    $userId = (int)$conn->lastInsertId();

    //l'utente viene loggato in automatico dopo registrazione 
    $_SESSION['authenticated'] = true;
    $_SESSION['id_utente'] = $userId;
    $_SESSION['email'] = $mail;
    $_SESSION['ruolo'] = 0;

    //se successo -> messaggio di conferma + reindirizza alla home
    Response::json([
        "success" => true,
        "message" => "Registrazione completata! Sarai reindirizzato alla home.",
        "redirect" => "home.html"
    ]);
} 
//se errore server -> messaggio errore  
catch (PDOException $e) {
    error_log("Errore registrazione: " . $e->getMessage());
    Response::error("Errore durante la registrazione. Riprova.", 500);
} 
//se errore geenrico -> messaggio errore 
catch (Exception $e) {
    error_log("Errore generico registrazione: " . $e->getMessage());
    Response::error("Errore server", 500);
}
