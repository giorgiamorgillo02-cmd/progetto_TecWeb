<?php
/**
 * API Endpoint: /api/me.php
 * 
 * Gestisce il profilo dell'utente autenticato
 * - GET: Recupera i dati del profilo (sostituisce check_session.php)
 * - PATCH/POST: Aggiorna il profilo (sostituisce update_profile.php)
 */

require_once __DIR__ . '/../config/dbConnection.php';
require_once __DIR__ . '/../classes/Utente.php';
require_once __DIR__ . '/../support/response.php';
require_once __DIR__ . '/../support/auth.php';

// Avvia sessione e verifica autenticazione
Auth::start();

$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($method) {
        case 'GET':
            handleGet($conn);
            break;
            
        case 'PATCH':
        case 'POST': // Supporto POST temporaneo per compatibilità client
            handleUpdate($conn);
            break;
            
        default:
            Response::error("Metodo non supportato", 405);
    }
} catch (PDOException $e) {
    error_log("Database error in /api/me.php: " . $e->getMessage());
    Response::error("Errore del database", 500);
} catch (Exception $e) {
    error_log("Error in /api/me.php: " . $e->getMessage());
    Response::error("Errore del server", 500);
}

/**
 * GET /api/me.php
 * Restituisce i dati dell'utente loggato
 * Include controllo blocco utente
 */
function handleGet($conn) {
    // Controllo autenticazione
    if (!isset($_SESSION['authenticated']) || $_SESSION['authenticated'] !== true) {
        Response::json(["authenticated" => false], 200);
    }
    
    $userId = (int)$_SESSION['id_utente'];
    
    // Recupera dati utente dal database
    $stmt = $conn->prepare("
        SELECT nome, cognome, mail, telefono, via, citta, provincia, cap, ruolo, blocked
        FROM utenti
        WHERE id = :id
    ");
    $stmt->bindValue(':id', $userId, PDO::PARAM_INT);
    $stmt->execute();
    
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        Response::json(["authenticated" => false], 200);
    }
    
    // Controllo blocco utente
    if ((int)($user['blocked'] ?? 0) === 1) {
        session_destroy();
        Response::json([
            "authenticated" => false,
            "blocked" => true,
            "message" => "Il tuo account è stato bloccato dall'amministratore."
        ], 200);
    }
    
    // Ritorna dati utente
    Response::json([
        "authenticated" => true,
        "id_utente" => $userId,
        "email" => $user['mail'],
        "nome" => $user['nome'],
        "cognome" => $user['cognome'],
        "telefono" => $user['telefono'],
        "via" => $user['via'],
        "citta" => $user['citta'],
        "provincia" => $user['provincia'],
        "cap" => $user['cap'],
        "ruolo" => (int)$user['ruolo'],
        "is_admin" => ((int)$user['ruolo'] === 1)
    ], 200);
}

/**
 * PATCH/POST /api/me.php
 * Aggiorna il profilo dell'utente loggato
 */
function handleUpdate($conn) {
    Auth::requireLogin();
    
    $userId = Auth::userId();
    
    // Leggi body JSON
    $data = json_decode(file_get_contents('php://input'), true);
    if (!$data) {
        Response::error("Dati non validi", 400);
    }
    
    // Carica utente
    $utente = new Utente($conn, $userId);
    if ($utente->getId() === null) {
        Response::error("Utente non trovato", 404);
    }
    
    // Prepara dati aggiornamento (solo campi consentiti all'utente)
    $datiAggiornamento = [];
    
    if (array_key_exists('nome', $data)) {
        $datiAggiornamento['nome'] = trim((string)$data['nome']);
    }
    if (array_key_exists('cognome', $data)) {
        $datiAggiornamento['cognome'] = trim((string)$data['cognome']);
    }
    if (array_key_exists('mail', $data)) {
        $datiAggiornamento['mail'] = trim((string)$data['mail']);
    }
    if (array_key_exists('telefono', $data)) {
        $datiAggiornamento['telefono'] = trim((string)$data['telefono']);
    }
    if (array_key_exists('via', $data)) {
        $datiAggiornamento['via'] = trim((string)$data['via']);
    }
    if (array_key_exists('citta', $data)) {
        $datiAggiornamento['citta'] = trim((string)$data['citta']);
    }
    if (array_key_exists('provincia', $data)) {
        $datiAggiornamento['provincia'] = strtoupper(trim((string)$data['provincia']));
    }
    if (array_key_exists('cap', $data)) {
        $datiAggiornamento['cap'] = trim((string)$data['cap']);
    }
    
    // Gestione password
    if (!empty($data['password'] ?? '')) {
        $datiAggiornamento['password'] = (string)$data['password'];
    }
    
    if (empty($datiAggiornamento)) {
        Response::error("Nessun dato da aggiornare", 400);
    }
    
    // Validazioni
    if (isset($datiAggiornamento['nome']) && $datiAggiornamento['nome'] === '') {
        Response::error("Nome obbligatorio", 400);
    }
    if (isset($datiAggiornamento['cognome']) && $datiAggiornamento['cognome'] === '') {
        Response::error("Cognome obbligatorio", 400);
    }
    if (isset($datiAggiornamento['mail'])) {
        if ($datiAggiornamento['mail'] === '') {
            Response::error("Email obbligatoria", 400);
        }
        if (!filter_var($datiAggiornamento['mail'], FILTER_VALIDATE_EMAIL)) {
            Response::error("Formato email non valido", 400);
        }
    }
    
    // Aggiorna utente
    if ($utente->aggiorna($datiAggiornamento)) {
        // Aggiorna sessione se mail è cambiata
        if (isset($datiAggiornamento['mail'])) {
            $_SESSION['email'] = $datiAggiornamento['mail'];
        }
        
        Response::json([
            "success" => true,
            "message" => "Profilo aggiornato con successo"
        ], 200);
    }
    
    Response::error("Errore durante l'aggiornamento del profilo", 500);
}
