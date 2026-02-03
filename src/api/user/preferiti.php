<?php
// API PER LA GESTIONE DEI PREFERITI
require_once __DIR__ . '/../../config/dbConnection.php'; //connessione al db
require_once __DIR__ . '/../../support/Response.php'; //gestione risposte api
require_once __DIR__ . '/../../support/Auth.php'; //gestione autenticazione 

Auth::requireLogin(); //richiede autenticazione -> se non autenticato risponde con errore (sicurezza)

$idUtente = (int) $_SESSION['id_utente']; //id utente autenticato

//LISTA PREFERITI
//se richiesta GET senza parametri -> restituisce lista preferiti utente
if ($_SERVER['REQUEST_METHOD'] === 'GET' && empty($_GET)) {
    try {
        /* recupera preferiti utente: 
            INNER JOIN per prendere solo le righe che hanno corrispondenza in entrambe le tabelle 
            LEFT JOIN per prendere i dati della categoria associata al poster (se manca categoria non esclude poster)
        */
        $stmt = $conn->prepare("
            SELECT
                p.id, p.titolo, p.descrizione, p.autore, p.prezzo,
                p.image_path, p.id_categoria, c.nome as categoria_nome,
                pref.data_aggiunta
            FROM preferiti pref 
            INNER JOIN posters p ON pref.id_poster = p.id
            LEFT JOIN categorie c ON p.id_categoria = c.id
            WHERE pref.id_utente = :id_utente
            ORDER BY pref.data_aggiunta DESC
        ");
        $stmt->bindValue(':id_utente', $idUtente, PDO::PARAM_INT); //sicurezza contro SQL injection
        $stmt->execute(); //esegue la query
        
        $preferiti = $stmt->fetchAll(PDO::FETCH_ASSOC); //recupera tutti i preferiti come array associativo
        
        //risposta con lista preferiti
        Response::json([
            "success" => true,
            "count" => count($preferiti), 
            "preferiti" => $preferiti
        ]);
    } 
    //se errore -> mostra messaggio errore 
    catch (PDOException $e) {
        Response::error("Errore nel recupero dei preferiti", 500);
    }
    exit; 
}

//FILTRO DI SICUREZZA -> accetta solo richieste POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error("Metodo non consentito", 405); 
}

//LEGGE DATI INVIATI IN FORMATO JSON
$data = json_decode(file_get_contents('php://input'), true); 

//CONTROLLO DATI RICHIESTI (se mancano action, id_poster)
if (!$data || !isset($data['action'], $data['id_poster'])) {
    Response::error("Dati mancanti", 400);
}

$action = (string) $data['action']; //azione da eseguire (add, remove, check)
$idPoster = (int) $data['id_poster']; //ide del poster su cui agire

//CONTROLLO VALIDITA POSTER ID
if ($idPoster <= 0) {
    Response::error("ID prodotto non valido", 400);
}
//ESECUZIONE AZIONE RICHIESTA
try {
    //1. aggiungi ai preriti
    if ($action === 'add') {
        //prepara query di inserimento (: -> prepared statement per sicurezza contro SQL injection)
        $stmt = $conn->prepare("
            INSERT INTO preferiti (id_utente, id_poster)
            VALUES (:id_utente, :id_poster)
        ");
        $stmt->bindValue(':id_utente', $idUtente, PDO::PARAM_INT); 
        $stmt->bindValue(':id_poster', $idPoster, PDO::PARAM_INT);
        
        try {
            //esegge query e aggiunge ai preferiti
            $stmt->execute(); 
            Response::json([
                "success" => true,
                "message" => "Aggiunto ai preferiti",
                "isFavorite" => true
            ]);
        //se errore duplicato (doppia sicurezza, controlli gia fatti in js)-> risponde con messaggio specifico
        } catch (PDOException $e) {
            if ((int)$e->getCode() === 23000) {
                Response::json([
                    "success" => false,
                    "message" => "Già nei preferiti",
                    "isFavorite" => true
                ], 409);
            }
            throw $e; //permette di gestire altri errori
        }
    }
    //2. rimuovi dai preferiti
    elseif ($action === 'remove') {
        $stmt = $conn->prepare("
            DELETE FROM preferiti
            WHERE id_utente = :id_utente AND id_poster = :id_poster
        ");
        $stmt->bindValue(':id_utente', $idUtente, PDO::PARAM_INT);
        $stmt->bindValue(':id_poster', $idPoster, PDO::PARAM_INT);
        $stmt->execute();
        
        Response::json([
            "success" => true,
            "message" => "Rimosso dai preferiti",
            "isFavorite" => false
        ]);
    }
    //3. verifica se è nei preferiti
    elseif ($action === 'check') {
        $stmt = $conn->prepare("
            SELECT 1 FROM preferiti
            WHERE id_utente = :id_utente AND id_poster = :id_poster
            LIMIT 1
        ");
        $stmt->bindValue(':id_utente', $idUtente, PDO::PARAM_INT);
        $stmt->bindValue(':id_poster', $idPoster, PDO::PARAM_INT);
        $stmt->execute();
        
        $isFavorite = (bool) $stmt->fetchColumn();
        
        Response::json([
            "success" => true,
            "isFavorite" => $isFavorite
        ]);
    }
    //se azione non valida -> errore
    else {
        Response::error("Azione non valida", 400);
    }
   //se errore generico (database) -> mostra messaggio errore
} catch (PDOException $e) {
    Response::error("Errore database", 500);
}
?>
