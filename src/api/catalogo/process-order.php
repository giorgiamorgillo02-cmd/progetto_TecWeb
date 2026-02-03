<?php
//API PER LA GESTIONE DELL'ORDINE
require_once __DIR__ . '/../../config/dbConnection.php'; //connessione al db 
require_once __DIR__ . '/../../support/response.php'; //gestione risposte api 
require_once __DIR__ . '/../../support/auth.php'; //gestione autenticazione 

//RICHIESTA LOGIN 
Auth::requireLogin();

//CONTROLLO METODO (se non è post -> errore)
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error("Metodo non consentito", 405);
}

//DECODIFICA DATI JSON (se dati inviati da frontend non validi -> errore)
$data = json_decode(file_get_contents('php://input'), true);
if (!$data) {
    Response::error("Dati non validi", 400);
}

//VALIDAZIONE CAMPI ANAGRAFICI
$required = ['nome', 'cognome', 'email', 'telefono', 'via', 'citta', 'provincia', 'cap', 'prodotti'];
//ciclo su array per valutare se campi mancanti 
foreach ($required as $field) {
    if (empty($data[$field])) {
        Response::error("Campo obbligatorio mancante: $field", 400);
    }
}

//VALIDAZIONE PRODOTTI (se non esistono prodotti -> errore)
if (!is_array($data['prodotti']) || count($data['prodotti']) === 0) {
    Response::error("Nessun prodotto nell'ordine", 400);
}


//PROCESSA L'ORDINE 
//recupera id utente dalla sessione
$idUtente = (int) $_SESSION['id_utente'];

try {
    $conn->beginTransaction(); //se non riesce a portare a termine tutte le operazioni allora non ne fa nessuna

    //Calcola totale lato server prendendo i prezzi dal DB
    $totale = 0.0;

    //legge prezzo da db 
    $stmtPrezzo = $conn->prepare("SELECT prezzo FROM posters WHERE id = :id");

    //cicla sui prodotti del carrello
    foreach ($data['prodotti'] as $p) {
        $idPoster = (int)($p['id_poster'] ?? 0); //id poster
        $quantita = (int)($p['quantita'] ?? 1); //quantita 

        //controlli aggiuntivi
        //se id poster non valido -> messaggio errore 
        if ($idPoster <= 0) {
            Response::error("id_poster non valido", 400);
        }
        //se qt non valida -> messaggio errore
        if ($quantita <= 0) {
            Response::error("quantita non valida", 400);
        }

        //recupera prezzo dal db 
        $stmtPrezzo->bindValue(':id', $idPoster, PDO::PARAM_INT);
        $stmtPrezzo->execute();
        $row = $stmtPrezzo->fetch(PDO::FETCH_ASSOC);

        //se prodotto non esiste piu nel db -> errore 
        if (!$row) {
            Response::error("Prodotto non trovato: $idPoster", 404);
        }

        //somma il totale 
        $prezzoDb = (float)$row['prezzo'];
        $totale += $prezzoDb * $quantita;
    }

    //INSERISCE ORDINE NEL DB 'ordini'
    $stmtOrdine = $conn->prepare("
        INSERT INTO ordini (totale, data, id_utente)
        VALUES (:totale, NOW(), :id_utente)
    ");
    $stmtOrdine->execute([
        ':totale' => $totale,
        ':id_utente' => $idUtente
    ]);

    //recupera id dell'ordine appena creato per collegare prodotti
    $orderId = (int) $conn->lastInsertId(); 

    //INSERISCE RIGHE PRODOTTI NEL DB prodottiOrdine'
    //collega prodotti all'ordine 
    $stmtInsertRiga = $conn->prepare("
        INSERT INTO prodottiOrdine (id_ordine, id_poster, prezzo)
        VALUES (:id_ordine, :id_poster, :prezzo)
    ");
    //cicla sull'array per inserire una riga per ogni prodotto (2 poster uguali -> due righe)
    foreach ($data['prodotti'] as $p) {
        $idPoster = (int)$p['id_poster'];
        $quantita = (int)($p['quantita'] ?? 1);

        $stmtPrezzo->bindValue(':id', $idPoster, PDO::PARAM_INT);
        $stmtPrezzo->execute();
        $row = $stmtPrezzo->fetch(PDO::FETCH_ASSOC);
        $prezzoDb = (float)$row['prezzo'];

        for ($i = 0; $i < $quantita; $i++) {
            $stmtInsertRiga->execute([
                ':id_ordine' => $orderId,
                ':id_poster' => $idPoster,
                ':prezzo' => $prezzoDb
            ]);
        }
    }

    //CONFERMA MODIFICHE AL DB ()
    $conn->commit();
    //se successo-> messaggio di conferma 
    Response::json([
        "success" => true,
        "message" => "Ordine creato con successo",
        "orderId" => $orderId,
        "totale" => $totale
    ]);
} 
//se errore server -> messaggio errore  
catch (PDOException $e) {
    if ($conn->inTransaction()) {
        $conn->rollBack();
    }
    Response::error("Errore durante la creazione dell'ordine", 500);
}
?>