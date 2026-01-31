<?php
/**
 * API Endpoint: /api/admin/utenti.php
 * 
 * Gestisce le operazioni CRUD sugli utenti (solo per amministratori)
 * - GET: Lista tutti gli utenti o dettaglio singolo utente
 * - PATCH: Modifica ruolo o stato blocked di un utente
 * - DELETE: Elimina un utente
 */

require_once __DIR__ . '/../../config/dbConnection.php';
require_once __DIR__ . '/../../classes/Utente.php';
require_once __DIR__ . '/../../support/response.php';
require_once __DIR__ . '/../../support/auth.php';

// Verifica autenticazione e permessi admin
Auth::requireAdmin();

$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($method) {
        case 'GET':
            handleGet($conn);
            break;
            
        case 'PATCH':
            handlePatch($conn);
            break;
            
        case 'DELETE':
            handleDelete($conn);
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
 */
function handleGet($conn) {
    if (isset($_GET['id']) && !empty($_GET['id'])) {
        // Dettagli singolo utente
        $id = (int)$_GET['id'];
        
        $utente = new Utente($conn, $id);
        
        if ($utente->getId() === null) {
            Response::error("Utente non trovato", 404);
        }
        
        $datiUtente = $utente->toArray();
        $datiUtente['num_ordini'] = $utente->contaOrdini();
        $ordini = $utente->getOrdini();
        
        Response::json([
            "success" => true,
            "utente" => $datiUtente,
            "ordini" => $ordini
        ], 200);
    } else {
        // Lista tutti gli utenti
        $filtri = [];
        
        if (isset($_GET['ruolo'])) {
            $filtri['ruolo'] = (int)$_GET['ruolo'];
        }
        
        if (isset($_GET['blocked'])) {
            $filtri['blocked'] = (int)$_GET['blocked'];
        }
        
        if (isset($_GET['ricerca'])) {
            $filtri['ricerca'] = $_GET['ricerca'];
        }
        
        $utenti = Utente::getAll($conn, $filtri);
        
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
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!$data) {
        Response::error("Dati non validi", 400);
    }
    
    $id = $data['id'] ?? null;
    
    if (!$id || !is_numeric($id)) {
        Response::error("ID utente richiesto", 400);
    }
    
    $id = (int)$id;
    
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
    
    if (array_key_exists('ruolo', $data)) {
        $ruolo = (int)$data['ruolo'];
        if ($ruolo !== 0 && $ruolo !== 1) {
            Response::error("Ruolo non valido (0=utente, 1=admin)", 400);
        }
        $datiAggiornamento['ruolo'] = $ruolo;
    }
    
    if (array_key_exists('blocked', $data)) {
        $blocked = (int)$data['blocked'];
        if ($blocked !== 0 && $blocked !== 1) {
            Response::error("Valore blocked non valido (0=attivo, 1=bloccato)", 400);
        }
        $datiAggiornamento['blocked'] = $blocked;
    }
    
    if (empty($datiAggiornamento)) {
        Response::error("Nessun campo da aggiornare", 400);
    }
    
    if ($utente->aggiorna($datiAggiornamento)) {
        Response::json([
            "success" => true,
            "message" => "Utente aggiornato con successo"
        ], 200);
    }
    
    Response::error("Errore durante l'aggiornamento", 500);
}

/**
 * DELETE /api/admin/utenti.php
 * Body: {"id": 123}
 */
function handleDelete($conn) {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!$data) {
        Response::error("Dati non validi", 400);
    }
    
    $id = $data['id'] ?? null;
    
    if (!$id || !is_numeric($id)) {
        Response::error("ID utente richiesto", 400);
    }
    
    $id = (int)$id;
    
    // Non permettere di eliminare se stesso
    if ($id === Auth::userId()) {
        Response::error("Non puoi eliminare il tuo stesso account", 403);
    }
    
    $utente = new Utente($conn, $id);
    
    if ($utente->getId() === null) {
        Response::error("Utente non trovato", 404);
    }
    
    if ($utente->elimina()) {
        Response::json([
            "success" => true,
            "message" => "Utente eliminato con successo"
        ], 200);
    }
    
    Response::error("Errore durante l'eliminazione", 500);
}
