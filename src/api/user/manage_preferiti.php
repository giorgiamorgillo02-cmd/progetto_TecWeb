<?php
require_once __DIR__ . '/../../config/dbConnection.php';

require_once __DIR__ . '/../../support/response.php';
require_once __DIR__ . '/../../support/auth.php';

Auth::requireLogin();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error("Metodo non consentito", 405);
}

$data = json_decode(file_get_contents('php://input'), true);
if (!$data || !isset($data['action'], $data['id_poster'])) {
    Response::error("Dati mancanti", 400);
}

$action = (string) $data['action'];
$idPoster = (int) $data['id_poster'];
$idUtente = (int) $_SESSION['id_utente'];

if ($idPoster <= 0) {
    Response::error("ID prodotto non valido", 400);
}

try {
    if ($action === 'add') {
        $stmt = $conn->prepare("
            INSERT INTO preferiti (id_utente, id_poster)
            VALUES (:id_utente, :id_poster)
        ");
        $stmt->bindValue(':id_utente', $idUtente, PDO::PARAM_INT);
        $stmt->bindValue(':id_poster', $idPoster, PDO::PARAM_INT);

        try {
            $stmt->execute();
            Response::json([
                "success" => true,
                "message" => "Aggiunto ai preferiti",
                "isFavorite" => true
            ]);
        } catch (PDOException $e) {
            // 23000 di solito = violazione vincolo (es. duplicate key)
            if ((int)$e->getCode() === 23000) {
                Response::json([
                    "success" => false,
                    "message" => "Già nei preferiti",
                    "isFavorite" => true
                ], 409);
            }
            throw $e;
        }
    }

    if ($action === 'remove') {
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

    if ($action === 'check') {
        $stmt = $conn->prepare("
            SELECT 1
            FROM preferiti
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

    Response::error("Azione non valida", 400);
} catch (PDOException $e) {
    Response::error("Errore database", 500);
}
