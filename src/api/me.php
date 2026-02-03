<?php
/**
 * API Endpoint: /api/me.php
 * 
 * Gestisce il profilo dell'utente autenticato
 * - GET: Recupera i dati del profilo (sostituisce check_session.php perchè include controllo blocco)
 * - PATCH/POST: Aggiorna il profilo 
 */

// Gestione delle dipendenze, caricamento classi e funzioni di supporto (__DIR__ è una costante che rappresenta la directory del file corrente)
require_once __DIR__ . '/../config/dbConnection.php';
require_once __DIR__ . '/../classes/Utente.php';
require_once __DIR__ . '/../support/response.php';
require_once __DIR__ . '/../support/auth.php';

// Avvia sessione e verifica autenticazione, questa funzione viene recuperata dal file di supporto Auth.php
Auth::start();

$method = $_SERVER['REQUEST_METHOD'];//ottiene il metodo HTTP della richiesta (GET, POST, PATCH, ecc.)

/* Gestione delle richieste in base al metodo HTTP, con gestione degli errori (try-catch) 
* Switch per instradare la richiesta al gestore corretto in base al metodo HTTP.*/
try {
    switch ($method) {
        case 'GET':
            handleGet($conn);//chiama la funzione handleGet per gestire le richieste GET
            break;
            
        case 'PATCH':
        case 'POST': // Supporto POST temporaneo per compatibilità client
            handleUpdate($conn);//chiama la funzione handleUpdate per gestire le richieste PATCH e POST
            break;
            
        default:
            Response::error("Metodo non supportato", 405);
    }
} catch (PDOException $e) {
    error_log("Database error in /api/me.php: " . $e->getMessage());//log dell'errore per il debug
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
    
    // Carica utente utilizzando la classe OOP
    $utente = new Utente($conn, $userId);
    
    // Verifica che l'utente esista
    if ($utente->getId() === null) {
        Response::json(["authenticated" => false], 200);
    }
    
    // Controllo blocco utente
    if ($utente->isBlocked()) {
        session_destroy();
        Response::json([
            "authenticated" => false,
            "blocked" => true,
            "message" => "Il tuo account è stato bloccato dall'amministratore."
        ], 200);
    }
    
    // Ritorna dati utente utilizzando i metodi getter
    Response::json([
        "authenticated" => true,
        "id_utente" => $utente->getId(),
        "email" => $utente->getMail(),
        "nome" => $utente->getNome(),
        "cognome" => $utente->getCognome(),
        "telefono" => $utente->getTelefono(),
        "via" => $utente->getVia(),
        "citta" => $utente->getCitta(),
        "provincia" => $utente->getProvincia(),
        "cap" => $utente->getCap(),
        "ruolo" => $utente->getRuolo(),
        "is_admin" => $utente->isAdmin()
    ], 200);
}

/**
 * PATCH/POST /api/me.php
 * Aggiorna il profilo dell'utente loggato
 */
function handleUpdate($conn) {
    Auth::requireLogin();//verifica che l'utente sia autenticato
    
    $userId = Auth::userId();//ottiene l'ID dell'utente autenticato dalla sessione
    
    // Leggi body JSON, ovvero i dati inviati nella richiesta
    $data = json_decode(file_get_contents('php://input'), true);
    if (!$data) {
        Response::error("Dati non validi", 400);
    }
    
    // Carica utente, verifica esistenza
    $utente = new Utente($conn, $userId);
    if ($utente->getId() === null) {
        Response::error("Utente non trovato", 404);
    }
    
    // Prepara dati aggiornamento (solo campi consentiti all'utente)
    // Whitelist dei campi modificabili dall'utente stesso
    $campiConsentiti = ['nome', 'cognome', 'mail', 'telefono', 'via', 'citta', 'provincia', 'cap'];
    $datiAggiornamento = [];
    
    // Filtra e sanitizza solo i campi consentiti presenti nei dati. 
    foreach ($campiConsentiti as $campo) {
        if (array_key_exists($campo, $data)) {
            $valore = trim((string)$data[$campo]);
            
            // Normalizzazione specifica per provincia (deve essere maiuscola)
            if ($campo === 'provincia') {
                $valore = strtoupper($valore);
            }
            
            $datiAggiornamento[$campo] = $valore;
        }
    }
    
    // Gestione password separata (campo sensibile)
    if (!empty($data['password'] ?? '')) {
        $datiAggiornamento['password'] = (string)$data['password'];
    }
    
    // Verifica che ci siano dati da aggiornare
    if (empty($datiAggiornamento)) {
        Response::error("Nessun dato da aggiornare", 400);
    }
    
    // Validazioni di base a livello API (quelle complesse sono nella classe Utente)
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
