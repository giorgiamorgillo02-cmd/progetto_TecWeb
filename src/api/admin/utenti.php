<?php
/**
 * API Endpoint: /api/admin/utenti.php
 * 
 * Gestisce le operazioni CRUD sugli utenti (solo per amministratori)
 * - GET: Lista tutti gli utenti o dettaglio singolo utente
 * - PATCH: Modifica ruolo o stato blocked di un utente
 */

require_once __DIR__ . '/../../config/dbConnection.php';
require_once __DIR__ . '/../../classes/Utente.php';
require_once __DIR__ . '/../../support/response.php';
require_once __DIR__ . '/../../support/auth.php';

// Verifica autenticazione e permessi admin
Auth::requireAdmin();

$method = $_SERVER['REQUEST_METHOD'];//ottiene il metodo HTTP della richiesta (GET, POST, PATCH, ecc.)

try {
    switch ($method) {
        case 'GET':
            handleGet($conn);
            break;
            
        case 'PATCH':
            handlePatch($conn);
            break;            

        default:
            Response::error("Metodo non supportato", 405);
    }
} catch (PDOException $e) {
    error_log("Database error in /api/admin/utenti.php: " . $e->getMessage());
    Response::error("Errore del database", 500);
} catch (Exception $e) {
    error_log("Error in /api/admin/utenti.php: " . $e->getMessage());
    Response::error("Errore del server", 500);
}

/**
 * GET /api/admin/utenti.php
 * GET /api/admin/utenti.php?id=123
 * Restituisce la lista di tutti gli utenti e i dettagli di un singolo utente con i suoi ordini
 */
function handleGet($conn) {
    if (isset($_GET['id']) && !empty($_GET['id'])) {
        // Dettagli singolo utente
        $id = (int)$_GET['id'];
        
        $utente = new Utente($conn, $id);//crea un'istanza della classe Utente per l'utente con l'ID specificato.
        
        if ($utente->getId() === null) {
            Response::error("Utente non trovato", 404);
        }
        
        $datiUtente = $utente->toArray();//ottiene i dati dell'utente come array associativo.
        $datiUtente['num_ordini'] = $utente->contaOrdini();//ottiene il numero di ordini effettuati dall'utente.
        $ordini = $utente->getOrdini();//ottiene la lista degli ordini effettuati dall'utente.
        
        Response::json([
            "success" => true,
            "utente" => $datiUtente,
            "ordini" => $ordini
        ], 200);
    } else {
        // Lista tutti gli utenti
        $utenti = Utente::getAll($conn);
        
        Response::json([
            "success" => true,
            "utenti" => $utenti
        ], 200);
    }
}

/**
 * PATCH /api/admin/utenti.php
 * Body: {"id": 123, "ruolo": 1, "blocked": 0}
 */
function handlePatch($conn) {
    $data = json_decode(file_get_contents('php://input'), true);//legge i dati JSON inviati nel corpo della richiesta e li decodifica in un array associativo.
    
    if (!$data) {
        Response::error("Dati non validi", 400);
    }//
    
    $id = $data['id'] ?? null;//ottiene l'ID dell'utente da modificare dai dati della richiesta.
    
    if (!$id || !is_numeric($id)) {
        Response::error("ID utente richiesto", 400);
    }
    
    $id = (int)$id;// converte l'ID in un intero.
    
    // Non permettere di modificare se stesso
    if ($id === Auth::userId()) {
        Response::error("Non puoi modificare il tuo stesso account", 403);
    }
    
    $utente = new Utente($conn, $id);
    
    if ($utente->getId() === null) {
        Response::error("Utente non trovato", 404);
    }
    
    // Prepara dati aggiornamento (solo ruolo e blocked per admin)
    $datiAggiornamento = [];
    // Ruolo, 0=utente, 1=admin, default 0 --> controlla se è presente il campo 'ruolo' nei dati della richiesta.
    if (array_key_exists('ruolo', $data)) {
        $ruolo = (int)$data['ruolo'];//converte il valore del ruolo in un intero.
        if ($ruolo !== 0 && $ruolo !== 1) {
            Response::error("Ruolo non valido (0=utente, 1=admin)", 400);//controlla se il ruolo è valido (0 o 1).
        }
        $datiAggiornamento['ruolo'] = $ruolo;//se il ruolo è valido, lo aggiunge ai dati di aggiornamento.
    }
  // Blocked, 0=attivo, 1=bloccato, default 0 --> controlla se è presente il campo 'blocked' nei dati della richiesta.  
    if (array_key_exists('blocked', $data)) {
        $blocked = (int)$data['blocked'];
        if ($blocked !== 0 && $blocked !== 1) {
            Response::error("Valore blocked non valido (0=attivo, 1=bloccato)", 400);//controlla se il valore di blocked è valido (0 o 1).
        }
        $datiAggiornamento['blocked'] = $blocked;//se il valore di blocked è valido, lo aggiunge ai dati di aggiornamento.
    }
    
    if (empty($datiAggiornamento)) {
        Response::error("Nessun campo da aggiornare", 400);//verifica che ci siano effettivamente dati da aggiornare.
    }
    
    if ($utente->aggiorna($datiAggiornamento)) {
        Response::json([
            "success" => true,
            "message" => "Utente aggiornato con successo"
        ], 200);// se l'aggiornamento ha successo, invia una risposta di successo.
    }
    
    Response::error("Errore durante l'aggiornamento", 500);
}



