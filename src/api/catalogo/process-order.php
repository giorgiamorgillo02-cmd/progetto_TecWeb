<?php
require_once __DIR__ . '/../../config/dbConnection.php';

require_once __DIR__ . '/../../support/response.php';
require_once __DIR__ . '/../../support/auth.php';

Auth::requireLogin();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error("Metodo non consentito", 405);
}

$data = json_decode(file_get_contents('php://input'), true);
if (!$data) {
    Response::error("Dati non validi", 400);
}

// Validazione campi anagrafici (come facevi prima)
$required = ['nome', 'cognome', 'email', 'telefono', 'via', 'citta', 'provincia', 'cap', 'prodotti'];
foreach ($required as $field) {
    if (empty($data[$field])) {
        Response::error("Campo obbligatorio mancante: $field", 400);
    }
}

// Validazione prodotti
if (!is_array($data['prodotti']) || count($data['prodotti']) === 0) {
    Response::error("Nessun prodotto nell'ordine", 400);
}

$idUtente = (int) $_SESSION['id_utente'];

try {
    $conn->beginTransaction();

    // 1) Calcola totale lato server prendendo i prezzi dal DB
    $totale = 0.0;

    // statement riutilizzabile per leggere il prezzo dal DB
    $stmtPrezzo = $conn->prepare("SELECT prezzo FROM posters WHERE id = :id");

    foreach ($data['prodotti'] as $p) {
        $idPoster = (int)($p['id_poster'] ?? 0);
        $quantita = (int)($p['quantita'] ?? 1);

        if ($idPoster <= 0) {
            Response::error("id_poster non valido", 400);
        }
        if ($quantita <= 0) {
            Response::error("quantita non valida", 400);
        }

        $stmtPrezzo->bindValue(':id', $idPoster, PDO::PARAM_INT);
        $stmtPrezzo->execute();
        $row = $stmtPrezzo->fetch(PDO::FETCH_ASSOC);

        if (!$row) {
            Response::error("Prodotto non trovato: $idPoster", 404);
        }

        $prezzoDb = (float)$row['prezzo'];
        $totale += $prezzoDb * $quantita;
    }

    // 2) Inserisci ordine (totale calcolato server-side)
    $stmtOrdine = $conn->prepare("
        INSERT INTO ordini (totale, data, id_utente)
        VALUES (:totale, NOW(), :id_utente)
    ");
    $stmtOrdine->execute([
        ':totale' => $totale,
        ':id_utente' => $idUtente
    ]);

    $orderId = (int) $conn->lastInsertId();

    // 3) Inserisci righe prodotti ordine (prezzo preso dal DB)
    $stmtInsertRiga = $conn->prepare("
        INSERT INTO prodottiOrdine (id_ordine, id_poster, prezzo)
        VALUES (:id_ordine, :id_poster, :prezzo)
    ");

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

    $conn->commit();

    Response::json([
        "success" => true,
        "message" => "Ordine creato con successo",
        "orderId" => $orderId,
        "totale" => $totale
    ]);
} catch (PDOException $e) {
    if ($conn->inTransaction()) {
        $conn->rollBack();
    }
    Response::error("Errore durante la creazione dell'ordine", 500);
}
?>