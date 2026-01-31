<?php
require_once __DIR__ . '/../../config/dbConnection.php';
require_once __DIR__ . '/../../support/Response.php';
require_once __DIR__ . '/../../support/Auth.php';

Auth::requireLogin();

try {
    $idUtente = (int) $_SESSION['id_utente'];

    $stmt = $conn->prepare("
        SELECT
            p.id,
            p.titolo,
            p.descrizione,
            p.autore,
            p.prezzo,
            p.image_path,
            p.id_categoria,
            c.nome as categoria_nome,
            pref.data_aggiunta
        FROM preferiti pref
        INNER JOIN posters p ON pref.id_poster = p.id
        LEFT JOIN categorie c ON p.id_categoria = c.id
        WHERE pref.id_utente = :id_utente
        ORDER BY pref.data_aggiunta DESC
    ");

    $stmt->bindValue(':id_utente', $idUtente, PDO::PARAM_INT);
    $stmt->execute();

    $preferiti = $stmt->fetchAll(PDO::FETCH_ASSOC);

    Response::json([
        "success" => true,
        "count" => count($preferiti),
        "preferiti" => $preferiti
    ]);
} catch (PDOException $e) {
    Response::error("Errore nel recupero dei preferiti", 500);
}
