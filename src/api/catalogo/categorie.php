<?php
//API PER LA GESTIONE DELLE CATEGORIE
require_once __DIR__ . '/../../config/dbConnection.php'; //connessione al dp 
require_once __DIR__ . '/../../support/response.php'; //gestione risposte api

try {
    //seleziona nome e id categore 
    $stmt = $conn->prepare("SELECT id, nome FROM categorie ORDER BY nome ASC");
    $stmt->execute();

    //salva categorie estratte nella variabile  
    $categorie = $stmt->fetchAll(PDO::FETCH_ASSOC); 

    //se successo -> carica le categorie 
    Response::json([
        "success" => true,
        "data" => $categorie
    ]);
} 
//se errore server -> messaggio errore 
catch (PDOException $e) {
    Response::error("Errore nel recupero delle categorie", 500);
}
