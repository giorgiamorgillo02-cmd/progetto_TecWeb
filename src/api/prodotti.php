<?php
//API PER LA GESTIONE DEI PRODOTTI
require_once __DIR__ . '/../config/dbConnection.php'; //connessione al db
require_once __DIR__ . '/../classes/Prodotto.php'; //classe Prodotto
require_once __DIR__ . '/../support/response.php'; //gestione risposte api
require_once __DIR__ . '/../support/auth.php'; //gestione autenticazione

// Avvia sessione (non richiede login per endpoint pubblico)
Auth::start();

$method = $_SERVER['REQUEST_METHOD']; //richiesta HTTP

//GESTIONE RICHIESTE
try {
    //instrada richieste in base al metodo HTTP
    switch ($method) {
        //se richiesta GET -> recupera prodotti
        case 'GET': 
            handleGet($conn);
            break;
            
        default:
            Response::error("Metodo non supportato", 405);
    }
} 
//se errore db 
catch (PDOException $e) {
    error_log("Database error in /api/prodotti.php: " . $e->getMessage());
    Response::error("Errore del database", 500);
}
//se errore generico 
catch (Exception $e) {
    error_log("Error in /api/prodotti.php: " . $e->getMessage());
    Response::error("Errore del server", 500);
}

//GESTIONE RICHIESTE GET
function handleGet($conn) {
    //SE esiste id -> dettaglio singolo prodotto (quando si clicca su un prodotto)
    if (isset($_GET['id']) && !empty($_GET['id'])) {
        $id = (int)$_GET['id']; //id prodotto richiesto
        
        $prodotto = new Prodotto($conn, $id);//crea oggetto prodotto
        
        //se prodotto non trovato -> errore
        if ($prodotto->getId() === null) {
            Response::error("Prodotto non trovato", 404);
        }
        //rissposta json contenente dati del prodotto
        Response::json([
            "success" => true,
            "data" => $prodotto->toArray() //converte oggetto in array
        ], 200);
    } 
    // SE non esiste `id` -> restituisce lista prodotti con filtri opzionali (per ricerche e filtri)
    else {
        $filtri = [];

        // Filtro categoria: se è presente e numerico -> lo aggiunge a array filtri come intero (sicurezza)
        if (isset($_GET['categoria']) && is_numeric($_GET['categoria'])) {
            $filtri['categoria'] = (int)$_GET['categoria']; 
        }

        // Filtro ricerca: se è presente e non vuoto -> lo aggiunge a array filtri
        if (isset($_GET['ricerca']) && !empty($_GET['ricerca'])) {
            $filtri['ricerca'] = $_GET['ricerca'];
        }

        
        // Recupera tutti i prodotti che corrispondono ai filtri (o tutti)
        $prodotti = Prodotto::getAll($conn, $filtri); //`Prodotto::getAll`-> per dell'escape/uso sicuro nel DB

        // Risposta JSON standard (array di prodotti)
        Response::json([
            "success" => true,
            "count" => count($prodotti),
            "data" => $prodotti
        ], 200);
    }
}