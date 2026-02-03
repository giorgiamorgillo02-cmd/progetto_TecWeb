<?php
// il file gestisce le risposte API in formato JSON. In questo modo, tutte le risposte inviate dal server sono coerenti e facilmente interpretabili dai client che consumano l'API.
declare(strict_types=1);

final class Response //definisce una classe finale chiamata Response che non può essere estesa.
{
    //metodo statico che invia una risposta JSON con un payload (dati) specificato e uno stato HTTP opzionale (default 200).
    public static function json(array $payload, int $status = 200): void
    {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($payload, JSON_UNESCAPED_UNICODE);
        exit;
    }

    //metodo statico che invia una risposta di errore JSON con un messaggio, uno stato HTTP opzionale (default 400) e dati extra opzionali.
    public static function error(string $message, int $status = 400, array $extra = []): void
    {
        self::json(array_merge([
            'success' => false,
            'message' => $message
        ], $extra), $status);
    }
}
