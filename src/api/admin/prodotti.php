<?php
/**
 * API Endpoint: /api/admin/prodotti.php -> Gestisce le operazioni CRUD sui prodotti (solo per amministratori)
 * - GET: Lista tutti i prodotti o dettaglio singolo prodotto
 * - POST: Crea un nuovo prodotto
 * - PATCH: Aggiorna un prodotto esistente
 * - DELETE: Elimina un prodotto
 */

// API PER LA GESTIONE DEI PRODOTTI (CRUD)
require_once __DIR__ . '/../../config/dbConnection.php'; //connessione al db
require_once __DIR__ . '/../../classes/Prodotto.php'; //classe Prodotto
require_once __DIR__ . '/../../support/response.php'; //gestione risposte api
require_once __DIR__ . '/../../support/auth.php'; //gestione autenticazione

// Verifica autenticazione e permessi admin (altrimenti errore)
Auth::requireAdmin();

$method = $_SERVER['REQUEST_METHOD']; //richiesta HTTP

//GESTIONE RICHIESTE (in base al metodo )
try {
    switch ($method) {
        case 'GET': //se get -> recupera prodotti
            handleGet($conn);
            break;
            
        case 'POST': //se post -> crea nuovo prodotto
            handlePost($conn);
            break;
            
        case 'PATCH': //se patch -> aggiorna prodotto
            handlePatch($conn);
            break;
            
        case 'DELETE': //se delete -> elimina prodotto
            handleDelete($conn);
            break;
            
        default:
            Response::error("Metodo non supportato", 405);
    }
} 
//se errore db
catch (PDOException $e) {
    error_log("Database error in /api/admin/prodotti.php: " . $e->getMessage());
    Response::error("Errore del database", 500);
} 
//se errore generico
catch (Exception $e) {
    error_log("Error in /api/admin/prodotti.php: " . $e->getMessage());
    Response::error("Errore del server", 500);
}

//GESTIONE RICHIESTE GET
function handleGet($conn) {
    //se esiste id -> dettaglio singolo prodotto (quando si clicca su un prodotto)
    if (isset($_GET['id']) && !empty($_GET['id'])) {
        $id = (int)$_GET['id'];
        
        $prodotto = new Prodotto($conn, $id);
        
        //se prodotto non trovato -> errore
        if ($prodotto->getId() === null) {
            Response::error("Prodotto non trovato", 404);
        }
        //risposta json contenente dati del prodotto
        Response::json([
            "success" => true,
            "data" => $prodotto->toArray() //converte oggetto in array
        ], 200);
    } 
    //se non esiste `id` -> restituisce lista prodotti con filtri opzionali
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
        $prodotti = Prodotto::getAll($conn, $filtri);
        
        // Risposta JSON standard (array di prodotti)
        Response::json([
            "success" => true,
            "prodotti" => $prodotti
        ], 200);
    }
}

//GESTIONE RICHIESTE POST
function handlePost($conn) {
    $data = json_decode(file_get_contents('php://input'), true); //legge body json
    
    //se dati non validi -> errore
    if (!$data) {
        Response::error("Dati non validi", 400);
    }
    
    // Validazione campi obbligatori (??'' evita warning se chiave non esiste)
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
    
    // Validazione prezzo (numero positivo)
    if (!is_numeric($data['prezzo']) || (float)$data['prezzo'] <= 0) {
        Response::error("Prezzo non valido", 400);
    }
    
    // Crea nuovo prodotto
    $prodotto = new Prodotto($conn); //nuovo oggetto prodotto vuoto
    $prodotto->setTitolo(trim($data['titolo']));
    $prodotto->setDescrizione(trim($data['descrizione']));
    $prodotto->setAutore(trim($data['autore'] ?? 'Sconosciuto')); //autore opzionale
    $prodotto->setPrezzo((float)$data['prezzo']);
    $prodotto->setImagePath(trim($data['image_path']));
    $prodotto->setIdCategoria(isset($data['id_categoria']) ? (int)$data['id_categoria'] : null);
    
    $id = $prodotto->salva(); //salva nel db e ottiene id (classe Prodotto.php)
    
    //SE creazione avvenuta con successo -> risposta con id nuovo prodotto
    if ($id) {
        Response::json([
            "success" => true,
            "message" => "Prodotto creato con successo",
            "id" => $id
        ], 201);
    }
    //SE errore durante creazione -> errore server
    Response::error("Errore durante la creazione del prodotto", 500);
}

//GESTIONE RICHIESTE PATCH
function handlePatch($conn) {
    $data = json_decode(file_get_contents('php://input'), true); //legge body json
    //se dati non validi -> errore
    if (!$data) {
        Response::error("Dati non validi", 400);
    }
    
    $id = $data['id'] ?? null; //id prodotto da aggiornare (se id non c'è -> nullo )
    
    //se id non valido -> errore (manca o non numerico)
    if (!$id || !is_numeric($id)) {
        Response::error("ID prodotto richiesto", 400);
    }
    
    $id = (int)$id; //cast a intero per sicurezza
    
    $prodotto = new Prodotto($conn, $id); //carica prodotto esistente
    
    //se prodotto non trovato -> errore
    if ($prodotto->getId() === null) { 
        Response::error("Prodotto non trovato", 404);
    }
    
    // Prepara dati aggiornamento 
    $datiAggiornamento = [];

    // Controlla e valida ogni campo (solo se esiste nell'input)
    if (array_key_exists('titolo', $data)) { //controlla se esiste chiave titolo
        $titolo = trim((string)$data['titolo']); //cast a stringa e trim
        //se titolo vuoto -> errore
        if (empty($titolo)) {
            Response::error("Titolo non può essere vuoto", 400);
        }
        //aggiunge titolo a dati aggiornamento
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
        $datiAggiornamento['autore'] = trim((string)$data['autore']); //autore può essere vuoto
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
    
    //SE aggiornamento avvenuto con successo -> feedback positivo
    if ($prodotto->aggiorna($datiAggiornamento)) {
        Response::json([
            "success" => true,
            "message" => "Prodotto aggiornato con successo"
        ], 200);
    }

    //SE errore durante aggiornamento -> errore server
    Response::error("Errore durante l'aggiornamento", 500);
}

//GESTIONE RICHIESTE DELETE
function handleDelete($conn) {
    $data = json_decode(file_get_contents('php://input'), true); //legge body json
    
    //se dati non validi -> errore
    if (!$data) {
        Response::error("Dati non validi", 400);
    }
    
    $id = $data['id'] ?? null; //id prodotto da eliminare
    
    //se id non valido (manca o non numerico) -> errore
    if (!$id || !is_numeric($id)) {
        Response::error("ID prodotto richiesto", 400);
    }
    
    $id = (int)$id; //cast a intero per sicurezza
    
    $prodotto = new Prodotto($conn, $id); //carica prodotto esistente
    
    //se prodotto non trovato -> errore
    if ($prodotto->getId() === null) {
        Response::error("Prodotto non trovato", 404);
    }
    //SE eliminazione avvenuta con successo -> feedback positivo
    if ($prodotto->elimina()) {
        Response::json([
            "success" => true,
            "message" => "Prodotto eliminato con successo"
        ], 200);
    }
    //SE errore durante eliminazione -> errore server
    Response::error("Errore durante l'eliminazione", 500);
}