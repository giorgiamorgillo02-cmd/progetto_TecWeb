<?php
/**
 * API Endpoint: /api/prodotti.php (pubblico)
 * 
 * Endpoint pubblico per la consultazione dei prodotti
 * - GET: Lista tutti i prodotti o dettaglio singolo prodotto
 */

require_once __DIR__ . '/../config/dbConnection.php';
require_once __DIR__ . '/../classes/Prodotto.php';
require_once __DIR__ . '/../support/response.php';
require_once __DIR__ . '/../support/auth.php';

// Avvia sessione (non richiede login per endpoint pubblico)
Auth::start();

$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($method) {
        case 'GET':
            handleGet($conn);
            break;
            
        default:
            Response::error("Metodo non supportato", 405);
    }
} catch (PDOException $e) {
    error_log("Database error in /api/prodotti.php: " . $e->getMessage());
    Response::error("Errore del database", 500);
} catch (Exception $e) {
    error_log("Error in /api/prodotti.php: " . $e->getMessage());
    Response::error("Errore del server", 500);
}

/**
 * GET /api/prodotti.php
 * GET /api/prodotti.php?id=123
 * GET /api/prodotti.php?categoria=2&ricerca=abstract
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
        // Lista prodotti con filtri opzionali
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
            "count" => count($prodotti),
            "data" => $prodotti
        ], 200);
    }
}
