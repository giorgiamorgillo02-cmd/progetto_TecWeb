<?php
declare(strict_types=1);//abilita il controllo rigoroso dei tipi in PHP. Significa che le funzioni e i metodi devono essere chiamati con argomenti del tipo corretto, altrimenti viene generato un errore.

// Configurazione DB
$host = 'localhost';//indirizzo del server database
$dbname = 'artly';//nome del database
$username = 'root';//nome utente per connettersi al database, in questo caso 'root' per una configurazione locale
$password = '';//password per connettersi al database, vuota in questo caso perchè è una configurazione locale

$dsn = "mysql:host=$host;dbname=$dbname;charset=utf8mb4";//Data Source Name (DSN) per la connessione PDO al database MySQL, specificando l'host, il nome del database e il set di caratteri UTF-8.

// Crea connessione PDO, gestisce errori di connessione
try {
    //opzioni di connessione PDO
    $conn = new PDO($dsn, $username, $password, 
     [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,//impostazione della modalità di errore per lanciare eccezioni
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,//impostazione del modo di fetch predefinito per restituire i risultati come array associativi
    ]);
} catch (PDOException $e) {
  // Gestione errore connessione che viene rilanciato per essere gestito nei file che includono questa configurazione
    throw $e;
}
