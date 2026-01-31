<?php
declare(strict_types=1);

// Configurazione DB
$host = 'localhost';
$dbname = 'artly';
$username = 'root';
$password = '';

$dsn = "mysql:host=$host;dbname=$dbname;charset=utf8mb4";

try {
    $conn = new PDO($dsn, $username, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
} catch (PDOException $e) {
    // Non stampare nulla qui (rompe le risposte JSON).
    // L'endpoint che include questo file gestirà l'errore nel suo try/catch.
    throw $e;
}
