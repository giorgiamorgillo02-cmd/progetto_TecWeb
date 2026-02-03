<?php
/* 
* Il file gestisce l'autenticazione e l'autorizzazione degli utenti. 
* Assicura che solo gli utenti autenticati possano accedere a determinate risorse 
* e che solo gli amministratori possano accedere a funzionalità riservate.
* Fornisce metodi statici che possono essere chiamati senza istanziare la classe e che rendono il codice più pulito e riusabile.
*/
declare(strict_types=1);//abilita il controllo rigoroso dei tipi in PHP. Significa che le funzioni e i metodi devono essere chiamati con argomenti del tipo corretto, altrimenti viene generato un errore.

final class Auth //definisce una classe finale chiamata Auth che non può essere estesa. Una classe finale perchè non è prevista l'estensione di questa classe.
{
    //metodo statico che avvia una sessione PHP se non è già stata avviata.
    public static function start(): void
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
    }//metodo statico che avvia una sessione PHP se non è già stata avviata.

    //metodo statico che verifica se l'utente è autenticato; in caso contrario, invia una risposta di errore 401.
    public static function requireLogin(): void
    {
        self::start();//chiama il metodo statico start() per assicurarsi che la sessione sia avviata.

        if (!isset($_SESSION['authenticated']) || $_SESSION['authenticated'] !== true) {
            Response::error("Non autenticato", 401);
        }
    }

    //metodo statico che verifica se l'utente è un amministratore; in caso contrario, invia una risposta di errore 403.
    public static function requireAdmin(): void
    {
        self::requireLogin();//chiama il metodo statico requireLogin() per assicurarsi che l'utente sia autenticato.

        if (!isset($_SESSION['ruolo']) || (int)$_SESSION['ruolo'] !== 1) {
            Response::error("Accesso negato", 403);
        }
    }

    //metodo statico che ritorna l'ID dell'utente autenticato dalla sessione.
    public static function userId(): int
    {
        self::requireLogin();
        return (int)$_SESSION['id_utente'];
    }


    public static function isAdmin(): bool
    {
        self::start();
        return isset($_SESSION['ruolo']) && (int)$_SESSION['ruolo'] === 1;
    }
}
