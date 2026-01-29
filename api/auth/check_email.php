<?php
require_once __DIR__ . '/../../dbConnection.php';
require_once __DIR__ . '/../../src/support/response.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error("Metodo non valido", 405);
}

$data = json_decode(file_get_contents('php://input'), true);
if (!$data || !isset($data['email'])) {
    Response::error("Email mancante", 400);
}

$email = trim((string)$data['email']);

if (empty($email)) {
    Response::json([
        "success" => false,
        "available" => false,
        "message" => "Email non valida"
    ]);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    Response::json([
        "success" => false,
        "available" => false,
        "message" => "Email non valida"
    ]);
}

try {
    $stmt = $conn->prepare("SELECT id FROM utenti WHERE mail = :mail");
    $stmt->bindValue(':mail', $email, PDO::PARAM_STR);
    $stmt->execute();

    $exists = $stmt->fetch(PDO::FETCH_ASSOC);

    Response::json([
        "success" => true,
        "available" => !$exists,
        "message" => $exists ? "Email già registrata" : "Email disponibile"
    ]);
} catch (PDOException $e) {
    Response::error("Errore server", 500);
}
