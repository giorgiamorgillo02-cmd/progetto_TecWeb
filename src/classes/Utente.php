<?php

/**
 * Classe Utente - Gestione Object-Oriented degli utenti
 * 
 * Questa classe incapsula la logica di business per gli utenti,
 * fornendo metodi per CRUD operations, autenticazione e gestione ordini.
 */
class Utente {
    // Proprietà private (incapsulamento)
    private $conn;
    private $id;
    private $nome;
    private $cognome;
    private $mail;
    private $password_hash;
    private $telefono;
    private $citta;
    private $provincia;
    private $cap;
    private $via;
    private $ruolo;
    private $blocked;

    /**
     * Costruttore
     * @param PDO $conn - Connessione al database
     * @param int|null $id - ID dell'utente (opzionale)
     */
    public function __construct($conn, $id = null) {
        $this->conn = $conn;
        $this->id = $id;
        $this->ruolo = 0; // Default: utente normale
        $this->blocked = 0; // Default: non bloccato
        
        // Se viene fornito un ID, carica automaticamente i dati
        if ($id !== null) {
            $this->carica();
        }
    }

    /**
     * Carica i dati dell'utente dal database
     * @return bool - true se l'utente esiste, false altrimenti
     */
    public function carica() {
        if ($this->id === null) {
            return false;
        }

        $sql = "SELECT id, nome, cognome, mail, password_hash, telefono, 
                       citta, provincia, cap, via, ruolo, blocked
                FROM utenti 
                WHERE id = :id";
        
        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(':id', $this->id, PDO::PARAM_INT);
        $stmt->execute();
        
        $data = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($data) {
            $this->nome = $data['nome'];
            $this->cognome = $data['cognome'];
            $this->mail = $data['mail'];
            $this->password_hash = $data['password_hash'];
            $this->telefono = $data['telefono'] ?? null;
            $this->citta = $data['citta'] ?? null;
            $this->provincia = $data['provincia'] ?? null;
            $this->cap = $data['cap'] ?? null;
            $this->via = $data['via'] ?? null;
            $this->ruolo = $data['ruolo'];
            $this->blocked = $data['blocked'] ?? 0;
            return true;
        }
        
        return false;
    }

    /**
     * Carica l'utente tramite email
     * @param string $email - Email dell'utente
     * @return bool - true se l'utente esiste
     */
    public function caricaDaEmail($email) {
        $sql = "SELECT id FROM utenti WHERE mail = :email";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(':email', $email, PDO::PARAM_STR);
        $stmt->execute();
        
        $data = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($data) {
            $this->id = $data['id'];
            return $this->carica();
        }
        
        return false;
    }

    /**
     * Salva un nuovo utente nel database
     * @return int|false - ID dell'utente creato o false in caso di errore
     */
    public function salva() {
        // Validazione
        if (!$this->valida()) {
            return false;
        }

        // Verifica che l'email non esista già
        if ($this->emailEsiste($this->mail)) {
            return false;
        }

        $sql = "INSERT INTO utenti (nome, cognome, mail, password_hash, telefono, 
                                    citta, provincia, cap, via, ruolo, blocked) 
                VALUES (:nome, :cognome, :mail, :password_hash, :telefono, 
                        :citta, :provincia, :cap, :via, :ruolo, :blocked)";
        
        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(':nome', $this->nome);
        $stmt->bindParam(':cognome', $this->cognome);
        $stmt->bindParam(':mail', $this->mail);
        $stmt->bindParam(':password_hash', $this->password_hash);
        $stmt->bindParam(':telefono', $this->telefono);
        $stmt->bindParam(':citta', $this->citta);
        $stmt->bindParam(':provincia', $this->provincia);
        $stmt->bindParam(':cap', $this->cap);
        $stmt->bindParam(':via', $this->via);
        $stmt->bindParam(':ruolo', $this->ruolo, PDO::PARAM_INT);
        $stmt->bindParam(':blocked', $this->blocked, PDO::PARAM_INT);
        
        if ($stmt->execute()) {
            $this->id = $this->conn->lastInsertId();
            return $this->id;
        }
        
        return false;
    }

    /**
     * Aggiorna l'utente esistente nel database
     * @param array $dati - Array associativo con i campi da aggiornare
     * @return bool - true se l'aggiornamento ha successo
     */
    public function aggiorna($dati) {
        if ($this->id === null) {
            return false;
        }

        $campiAggiornabili = ['nome', 'cognome', 'mail', 'telefono', 'citta', 
                              'provincia', 'cap', 'via', 'ruolo', 'blocked'];
        $setClauses = [];
        $params = [':id' => $this->id];
        
        foreach ($campiAggiornabili as $campo) {
            if (isset($dati[$campo])) {
                $setClauses[] = "$campo = :$campo";
                $params[":$campo"] = $dati[$campo];
                
                // Aggiorna anche la proprietà dell'oggetto
                $this->$campo = $dati[$campo];
            }
        }
        
        // Gestione password separata (con hash)
        if (isset($dati['password']) && !empty($dati['password'])) {
            $setClauses[] = "password_hash = :password_hash";
            $params[':password_hash'] = password_hash($dati['password'], PASSWORD_DEFAULT);
            $this->password_hash = $params[':password_hash'];
        }
        
        if (empty($setClauses)) {
            return false;
        }
        
        $sql = "UPDATE utenti SET " . implode(', ', $setClauses) . " WHERE id = :id";
        $stmt = $this->conn->prepare($sql);
        
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        
        return $stmt->execute();
    }

    /**
     * Elimina l'utente dal database
     * @return bool - true se l'eliminazione ha successo
     */
    public function elimina() {
        if ($this->id === null) {
            return false;
        }

        $stmt = $this->conn->prepare("DELETE FROM utenti WHERE id = :id");
        $stmt->bindParam(':id', $this->id, PDO::PARAM_INT);
        
        return $stmt->execute();
    }

    /**
     * Verifica le credenziali di login
     * @param string $password - Password in chiaro da verificare
     * @return bool - true se le credenziali sono corrette
     */
    public function verificaPassword($password) {
        if ($this->password_hash === null) {
            return false;
        }

        // Supporta sia password hashate che password in chiaro (legacy)
        if (password_verify($password, $this->password_hash)) {
            return true;
        } elseif ($password === $this->password_hash) {
            // Compatibilità con password non hashate
            return true;
        }
        
        return false;
    }

    /**
     * Imposta una nuova password (con hash automatico)
     * @param string $password - Password in chiaro
     */
    public function setPassword($password) {
        $this->password_hash = password_hash($password, PASSWORD_DEFAULT);
    }

    /**
     * Ottieni gli ordini dell'utente
     * @return array - Array di ordini
     */
    public function getOrdini() {
        if ($this->id === null) {
            return [];
        }

        $sql = "SELECT o.id, o.totale, o.data,
                (SELECT COUNT(*) FROM prodottiOrdine WHERE id_ordine = o.id) as num_prodotti
                FROM ordini o
                WHERE o.id_utente = :id
                ORDER BY o.data DESC";
        
        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(':id', $this->id, PDO::PARAM_INT);
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Conta il numero di ordini dell'utente
     * @return int - Numero di ordini
     */
    public function contaOrdini() {
        if ($this->id === null) {
            return 0;
        }

        $stmt = $this->conn->prepare("SELECT COUNT(*) FROM ordini WHERE id_utente = :id");
        $stmt->bindParam(':id', $this->id, PDO::PARAM_INT);
        $stmt->execute();
        
        return (int) $stmt->fetchColumn();
    }

    /**
     * Metodo statico per ottenere tutti gli utenti
     * @param PDO $conn - Connessione al database
     * @param array $filtri - Filtri opzionali
     * @return array - Array di array associativi con i dati degli utenti
     */
    public static function getAll($conn, $filtri = []) {
        $sql = "SELECT u.id, u.nome, u.cognome, u.mail, u.ruolo, u.blocked,
                (SELECT COUNT(*) FROM ordini WHERE id_utente = u.id) as num_ordini
                FROM utenti u";
        
        $conditions = [];
        $params = [];
        
        // Applica filtri se presenti
        if (isset($filtri['ruolo'])) {
            $conditions[] = "u.ruolo = :ruolo";
            $params[':ruolo'] = $filtri['ruolo'];
        }
        
        if (isset($filtri['blocked'])) {
            $conditions[] = "u.blocked = :blocked";
            $params[':blocked'] = $filtri['blocked'];
        }
        
        if (!empty($filtri['ricerca'])) {
            $conditions[] = "(u.nome LIKE :ricerca OR u.cognome LIKE :ricerca OR u.mail LIKE :ricerca)";
            $params[':ricerca'] = '%' . $filtri['ricerca'] . '%';
        }
        
        if (!empty($conditions)) {
            $sql .= " WHERE " . implode(' AND ', $conditions);
        }
        
        $sql .= " ORDER BY u.id DESC";
        
        $stmt = $conn->prepare($sql);
        
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Converte l'oggetto in un array associativo (senza password)
     * @return array - Rappresentazione array dell'utente
     */
    public function toArray($includiSensibili = false) {
        $data = [
            'id' => $this->id,
            'nome' => $this->nome,
            'cognome' => $this->cognome,
            'mail' => $this->mail,
            'telefono' => $this->telefono,
            'citta' => $this->citta,
            'provincia' => $this->provincia,
            'cap' => $this->cap,
            'via' => $this->via,
            'ruolo' => $this->ruolo,
            'blocked' => $this->blocked
        ];
        
        // Include dati sensibili solo se richiesto esplicitamente
        if ($includiSensibili) {
            $data['password_hash'] = $this->password_hash;
        }
        
        return $data;
    }

    /**
     * Validazione dei dati dell'utente
     * @return bool - true se i dati sono validi
     */
    private function valida() {
        if (empty($this->nome) || empty($this->cognome) || empty($this->mail)) {
            return false;
        }
        
        // Validazione email
        if (!filter_var($this->mail, FILTER_VALIDATE_EMAIL)) {
            return false;
        }
        
        // Validazione password (solo per nuovi utenti)
        if ($this->id === null && empty($this->password_hash)) {
            return false;
        }
        
        return true;
    }

    /**
     * Verifica se un'email è già registrata
     * @param string $email - Email da verificare
     * @param int|null $escludiId - ID utente da escludere (per aggiornamenti)
     * @return bool - true se l'email esiste già
     */
    private function emailEsiste($email, $escludiId = null) {
        $sql = "SELECT id FROM utenti WHERE mail = :email";
        
        if ($escludiId !== null) {
            $sql .= " AND id != :escludiId";
        }
        
        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(':email', $email, PDO::PARAM_STR);
        
        if ($escludiId !== null) {
            $stmt->bindParam(':escludiId', $escludiId, PDO::PARAM_INT);
        }
        
        $stmt->execute();
        
        return $stmt->rowCount() > 0;
    }

    // Getter e Setter
    public function getId() {
        return $this->id;
    }

    public function getNome() {
        return $this->nome;
    }

    public function setNome($nome) {
        $this->nome = $nome;
    }

    public function getCognome() {
        return $this->cognome;
    }

    public function setCognome($cognome) {
        $this->cognome = $cognome;
    }

    public function getMail() {
        return $this->mail;
    }

    public function setMail($mail) {
        $this->mail = $mail;
    }

    public function getTelefono() {
        return $this->telefono;
    }

    public function setTelefono($telefono) {
        $this->telefono = $telefono;
    }

    public function getCitta() {
        return $this->citta;
    }

    public function setCitta($citta) {
        $this->citta = $citta;
    }

    public function getProvincia() {
        return $this->provincia;
    }

    public function setProvincia($provincia) {
        $this->provincia = $provincia;
    }

    public function getCap() {
        return $this->cap;
    }

    public function setCap($cap) {
        $this->cap = $cap;
    }

    public function getVia() {
        return $this->via;
    }

    public function setVia($via) {
        $this->via = $via;
    }

    public function getRuolo() {
        return $this->ruolo;
    }

    public function setRuolo($ruolo) {
        $this->ruolo = $ruolo;
    }

    public function isAdmin() {
        return $this->ruolo == 1;
    }

    public function getBlocked() {
        return $this->blocked;
    }

    public function setBlocked($blocked) {
        $this->blocked = $blocked;
    }

    public function isBlocked() {
        return $this->blocked == 1;
    }
}
