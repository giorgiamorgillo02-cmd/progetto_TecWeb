<?php
require_once __DIR__ . '/../../config/dbConnection.php';

require_once __DIR__ . '/../../support/response.php';
require_once __DIR__ . '/../../support/auth.php';

Auth::requireLogin();

try {
    $idUtente = (int) $_SESSION['id_utente'];

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

    $stmt->bindValue(':id_utente', $idUtente, PDO::PARAM_INT);
    $stmt->execute();

    $risultati = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Raggruppa i prodotti per ordine
    $ordiniMap = [];

    foreach ($risultati as $row) {
        $ordineId = (int) $row['ordine_id'];

        if (!isset($ordiniMap[$ordineId])) {
            $ordiniMap[$ordineId] = [
                'id' => $ordineId,
                'totale' => $row['totale'],
                'data' => $row['data'],
                'prodotti' => []
            ];
        }

        $ordiniMap[$ordineId]['prodotti'][] = [
            'id' => (int) $row['poster_id'],
            'titolo' => $row['titolo'],
            'autore' => $row['autore'],
            'image_path' => $row['image_path'],
            'prezzo' => $row['prezzo']
        ];
    }

    // Converti mappa -> array indicizzato
    $ordini = array_values($ordiniMap);

    Response::json([
        "success" => true,
        "ordini" => $ordini
    ]);
} catch (PDOException $e) {
    Response::error("Errore nel recupero degli ordini", 500);
}
