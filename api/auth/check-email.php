<?php
// check-email.php - Verifica se un'email è già registrata
session_start();
require_once __DIR__ . '/../../dbConnection.php';

header('Content-Type: application/json');

// Ottieni l'email dal parametro GET
$email = isset($_GET['email']) ? trim($_GET['email']) : '';

if (empty($email)) {
    echo json_encode(['exists' => false]);
    exit;
}

try {
    // Usa la connessione PDO definita in dbConnection.php
    $stmt = $conn->prepare("SELECT id FROM utenti WHERE mail = ?");
    $stmt->execute([$email]);
    
    $exists = $stmt->rowCount() > 0;
    
    echo json_encode(['exists' => $exists]);
} catch (Exception $e) {
    echo json_encode(['exists' => false, 'error' => 'Errore del server']);
}
?>
