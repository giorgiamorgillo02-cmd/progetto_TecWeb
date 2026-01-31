<?php
require_once __DIR__ . '/../../config/dbConnection.php';
require_once __DIR__ . '/../../support/Response.php'; // Nota: maiuscola come originale
require_once __DIR__ . '/../../support/Auth.php';

Auth::requireLogin();

$idUtente = (int) $_SESSION['id_utente'];

// *** 1. LISTA PREFERITI (GET senza parametri) ***
if ($_SERVER['REQUEST_METHOD'] === 'GET' && empty($_GET)) {
    try {
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
    exit;
}

// *** 2. GESTIONE PREFERITI (POST action/add|remove|check) ***
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error("Metodo non consentito", 405);
}

$data = json_decode(file_get_contents('php://input'), true);
if (!$data || !isset($data['action'], $data['id_poster'])) {
    Response::error("Dati mancanti", 400);
}

$action = (string) $data['action'];
$idPoster = (int) $data['id_poster'];

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
    
    else {
        Response::error("Azione non valida", 400);
    }
    
} catch (PDOException $e) {
    Response::error("Errore database", 500);
}
?>
