<?php
/**
 * API USER ORDINI
 * 
 * Endpoint per recuperare lo storico ordini di un utente autenticato.
 * Restituisce la lista completa degli ordini con i relativi prodotti acquistati.
 * 
 * AUTENTICAZIONE: Richiesta (session-based)
 * METODO HTTP: GET
 */

// Dipendenze: connessione DB, helper response e autenticazione
require_once __DIR__ . '/../../config/dbConnection.php';

require_once __DIR__ . '/../../support/response.php';
require_once __DIR__ . '/../../support/auth.php';

// Verifica che l'utente sia autenticato, altrimenti invia 401 Unauthorized
Auth::requireLogin();

try {
    // Recupera ID utente dalla sessione (cast a int per sicurezza)
    $idUtente = (int) $_SESSION['id_utente'];

    /**
     * QUERY: Recupera tutti gli ordini dell'utente con i relativi prodotti
     */
    $stmt = $conn->prepare("
        SELECT
            o.id AS ordine_id,
            o.totale,
            o.data,
            p.id AS poster_id,
            p.titolo,
            p.autore,
            p.image_path,
            po.prezzo
        FROM ordini o
        INNER JOIN prodottiOrdine po ON o.id = po.id_ordine
        INNER JOIN posters p ON po.id_poster = p.id
        WHERE o.id_utente = :id_utente
        ORDER BY o.data DESC
    ");

    // Bind parametro ID utente (PDO::PARAM_INT previene SQL injection)
    $stmt->bindValue(':id_utente', $idUtente, PDO::PARAM_INT);
    $stmt->execute();

    // Recupera tutte le righe come array associativo
    $risultati = $stmt->fetchAll(PDO::FETCH_ASSOC);

    /**
     * AGGREGAZIONE DATI: Raggruppa prodotti per ordine
     * 
     * PROBLEMA: La query restituisce righe duplicate per ordini con più prodotti
     * Esempio input:
     *   [ordine_id=1, prodotto=A], [ordine_id=1, prodotto=B], [ordine_id=2, prodotto=C]
     * 
     * SOLUZIONE: Usare un array associativo ($ordiniMap) con chiave = ordine_id
     * Output desiderato:
     *   { 1: {id: 1, prodotti: [A, B]}, 2: {id: 2, prodotti: [C]} }
     */
    $ordiniMap = [];

    foreach ($risultati as $row) {
        $ordineId = (int) $row['ordine_id'];

        // Se è la prima volta che incontriamo questo ordine, crea la struttura base
        if (!isset($ordiniMap[$ordineId])) {
            $ordiniMap[$ordineId] = [
                'id' => $ordineId,
                'totale' => $row['totale'],      // Totale ordine (già calcolato al checkout)
                'data' => $row['data'],          // Timestamp ordine
                'prodotti' => []                 // Array che conterrà i prodotti
            ];
        }

        // Aggiungi il prodotto corrente all'array prodotti dell'ordine
        $ordiniMap[$ordineId]['prodotti'][] = [
            'id' => (int) $row['poster_id'],
            'titolo' => $row['titolo'],
            'autore' => $row['autore'],
            'image_path' => $row['image_path'],
            'prezzo' => $row['prezzo']           // Prezzo al momento dell'acquisto (storicizzato)
        ];
    }

    /**
     * CONVERSIONE: Da array associativo (chiave = ordine_id) a array indicizzato
     */
    $ordini = array_values($ordiniMap);

    // Risposta JSON con lista ordini aggregati
    Response::json([
        "success" => true,
        "ordini" => $ordini
    ]);

} catch (PDOException $e) {
    // Gestione errori database (connessione fallita, query errata, etc.)
    // Non espone dettagli tecnici al client per sicurezza
    Response::error("Errore nel recupero degli ordini", 500);
}
