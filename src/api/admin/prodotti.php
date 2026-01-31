<?php
/**
 * API Endpoint: /api/admin/prodotti.php
 * 
 * Gestisce le operazioni CRUD sui prodotti (solo per amministratori)
 * - GET: Lista tutti i prodotti o dettaglio singolo prodotto
 * - POST: Crea un nuovo prodotto
 * - PATCH: Aggiorna un prodotto esistente
 * - DELETE: Elimina un prodotto
 */

require_once __DIR__ . '/../../config/dbConnection.php';
require_once __DIR__ . '/../../classes/Prodotto.php';
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
            
        case 'POST':
            handlePost($conn);
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
    error_log("Database error in /api/admin/prodotti.php: " . $e->getMessage());
    Response::error("Errore del database", 500);
} catch (Exception $e) {
    error_log("Error in /api/admin/prodotti.php: " . $e->getMessage());
    Response::error("Errore del server", 500);
}

/**
 * GET /api/admin/prodotti.php
 * GET /api/admin/prodotti.php?id=123
 */
function handleGet($conn) {
    if (isset($_GET['id']) && !empty($_GET['id'])) {
        // Dettaglio singolo prodotto
        $id = (int)$_GET['id'];
        
        $prodotto = new Prodotto($conn, $id);
        
        if ($prodotto->getId() === null) {
            Response::error("Prodotto non trovato", 404);
        }
        
        Response::json([
            "success" => true,
            "data" => $prodotto->toArray()
        ], 200);
    } else {
        // Lista tutti i prodotti
        $filtri = [];
        
        if (isset($_GET['categoria']) && is_numeric($_GET['categoria'])) {
            $filtri['categoria'] = (int)$_GET['categoria'];
        }
        
        if (isset($_GET['ricerca']) && !empty($_GET['ricerca'])) {
            $filtri['ricerca'] = $_GET['ricerca'];
        }
        
        $prodotti = Prodotto::getAll($conn, $filtri);
        
        Response::json([
            "success" => true,
            "prodotti" => $prodotti
        ], 200);
    }
}

/**
 * POST /api/admin/prodotti.php
 * Body: {"titolo": "...", "descrizione": "...", "autore": "...", "prezzo": 29.99, "image_path": "...", "id_categoria": 1}
 */
function handlePost($conn) {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!$data) {
        Response::error("Dati non validi", 400);
    }
    
    // Validazione campi obbligatori
    if (empty($data['titolo'] ?? '')) {
        Response::error("Titolo obbligatorio", 400);
    }
    if (empty($data['descrizione'] ?? '')) {
        Response::error("Descrizione obbligatoria", 400);
    }
    if (empty($data['prezzo'] ?? '')) {
        Response::error("Prezzo obbligatorio", 400);
    }
    if (empty($data['image_path'] ?? '')) {
        Response::error("Immagine obbligatoria", 400);
    }
    
    // Validazione prezzo
    if (!is_numeric($data['prezzo']) || (float)$data['prezzo'] <= 0) {
        Response::error("Prezzo non valido", 400);
    }
    
    // Crea nuovo prodotto
    $prodotto = new Prodotto($conn);
    $prodotto->setTitolo(trim($data['titolo']));
    $prodotto->setDescrizione(trim($data['descrizione']));
    $prodotto->setAutore(trim($data['autore'] ?? 'Sconosciuto'));
    $prodotto->setPrezzo((float)$data['prezzo']);
    $prodotto->setImagePath(trim($data['image_path']));
    $prodotto->setIdCategoria(isset($data['id_categoria']) ? (int)$data['id_categoria'] : null);
    
    $id = $prodotto->salva();
    
    if ($id) {
        Response::json([
            "success" => true,
            "message" => "Prodotto creato con successo",
            "id" => $id
        ], 201);
    }
    
    Response::error("Errore durante la creazione del prodotto", 500);
}

/**
 * PATCH /api/admin/prodotti.php
 * Body: {"id": 123, "titolo": "...", "prezzo": 39.99}
 */
function handlePatch($conn) {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!$data) {
        Response::error("Dati non validi", 400);
    }
    
    $id = $data['id'] ?? null;
    
    if (!$id || !is_numeric($id)) {
        Response::error("ID prodotto richiesto", 400);
    }
    
    $id = (int)$id;
    
    $prodotto = new Prodotto($conn, $id);
    
    if ($prodotto->getId() === null) {
        Response::error("Prodotto non trovato", 404);
    }
    
    // Prepara dati aggiornamento
    $datiAggiornamento = [];
    
    if (array_key_exists('titolo', $data)) {
        $titolo = trim((string)$data['titolo']);
        if (empty($titolo)) {
            Response::error("Titolo non può essere vuoto", 400);
        }
        $datiAggiornamento['titolo'] = $titolo;
    }
    
    if (array_key_exists('descrizione', $data)) {
        $descrizione = trim((string)$data['descrizione']);
        if (empty($descrizione)) {
            Response::error("Descrizione non può essere vuota", 400);
        }
        $datiAggiornamento['descrizione'] = $descrizione;
    }
    
    if (array_key_exists('autore', $data)) {
        $datiAggiornamento['autore'] = trim((string)$data['autore']);
    }
    
    if (array_key_exists('prezzo', $data)) {
        $prezzo = $data['prezzo'];
        if (!is_numeric($prezzo) || (float)$prezzo <= 0) {
            Response::error("Prezzo non valido", 400);
        }
        $datiAggiornamento['prezzo'] = (float)$prezzo;
    }
    
    if (array_key_exists('image_path', $data)) {
        $imagePath = trim((string)$data['image_path']);
        if (empty($imagePath)) {
            Response::error("Percorso immagine non può essere vuoto", 400);
        }
        $datiAggiornamento['image_path'] = $imagePath;
    }
    
    if (array_key_exists('id_categoria', $data)) {
        $datiAggiornamento['id_categoria'] = $data['id_categoria'] !== null ? (int)$data['id_categoria'] : null;
    }
    
    if (empty($datiAggiornamento)) {
        Response::error("Nessun campo da aggiornare", 400);
    }
    
    if ($prodotto->aggiorna($datiAggiornamento)) {
        Response::json([
            "success" => true,
            "message" => "Prodotto aggiornato con successo"
        ], 200);
    }
    
    Response::error("Errore durante l'aggiornamento", 500);
}

/**
 * DELETE /api/admin/prodotti.php
 * Body: {"id": 123}
 */
function handleDelete($conn) {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!$data) {
        Response::error("Dati non validi", 400);
    }
    
    $id = $data['id'] ?? null;
    
    if (!$id || !is_numeric($id)) {
        Response::error("ID prodotto richiesto", 400);
    }
    
    $id = (int)$id;
    
    $prodotto = new Prodotto($conn, $id);
    
    if ($prodotto->getId() === null) {
        Response::error("Prodotto non trovato", 404);
    }
    
    if ($prodotto->elimina()) {
        Response::json([
            "success" => true,
            "message" => "Prodotto eliminato con successo"
        ], 200);
    }
    
    Response::error("Errore durante l'eliminazione", 500);
}
