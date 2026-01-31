<?php
require_once __DIR__ . '/../../config/dbConnection.php';
require_once __DIR__ . '/../../support/response.php';

try {
    $stmt = $conn->prepare("SELECT id, nome FROM categorie ORDER BY nome ASC");
    $stmt->execute();

    $categorie = $stmt->fetchAll(PDO::FETCH_ASSOC);

    Response::json([
        "success" => true,
        "data" => $categorie
    ]);
} catch (PDOException $e) {
    Response::error("Errore nel recupero delle categorie", 500);
}
