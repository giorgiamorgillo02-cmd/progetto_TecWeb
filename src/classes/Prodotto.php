<?php

/**
 * Classe Prodotto - Gestione Object-Oriented dei prodotti (posters)
 * 
 * Questa classe incapsula la logica di business per i prodotti,
 * fornendo metodi per CRUD operations e validazione dati.
 */
class Prodotto {
    // Proprietà private (incapsulamento)
    private $conn;
    private $id;
    private $titolo;
    private $descrizione;
    private $autore;
    private $prezzo;
    private $image_path;
    private $id_categoria;
    private $categoria_nome;

    /**
     * Costruttore
     * @param PDO $conn - Connessione al database
     * @param int|null $id - ID del prodotto (opzionale)
     */
    public function __construct($conn, $id = null) {
        $this->conn = $conn;
        $this->id = $id;
        
        // Se viene fornito un ID, carica automaticamente i dati
        if ($id !== null) {
            $this->carica();
        }
    }

    /**
     * Carica i dati del prodotto dal database
     * @return bool - true se il prodotto esiste, false altrimenti
     */
 public function carica() {
    if ($this->id === null) return false;

    $sql = "SELECT p.id, p.titolo, p.descrizione, p.autore, p.prezzo, p.image_path,
                   p.id_categoria, c.nome as categoria_nome
            FROM posters p
            LEFT JOIN categorie c ON p.id_categoria = c.id
            WHERE p.id = :id";

    $stmt = $this->conn->prepare($sql);
    $stmt->bindValue(':id', $this->id, PDO::PARAM_INT);
    $stmt->execute();

    $data = $stmt->fetch(PDO::FETCH_ASSOC); // se non c'è riga => false [web:26]

    if (!$data) {
        $this->id = null;          // questa è la chiave
        return false;
    }

    $this->titolo = $data['titolo'];
    $this->descrizione = $data['descrizione'];
    $this->autore = $data['autore'];
    $this->prezzo = $data['prezzo'];
    $this->image_path = $data['image_path'];
    $this->id_categoria = $data['id_categoria'];
    $this->categoria_nome = $data['categoria_nome'];

    return true;
}


    /**
     * Salva un nuovo prodotto nel database
     * @return int|false - ID del prodotto creato o false in caso di errore
     */
    public function salva() {
        // Validazione
        if (!$this->valida()) {
            return false;
        }

        $sql = "INSERT INTO posters (titolo, descrizione, autore, prezzo, image_path, id_categoria) 
                VALUES (:titolo, :descrizione, :autore, :prezzo, :image_path, :id_categoria)";
        
        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(':titolo', $this->titolo);
        $stmt->bindParam(':descrizione', $this->descrizione);
        $stmt->bindParam(':autore', $this->autore);
        $stmt->bindParam(':prezzo', $this->prezzo);
        $stmt->bindParam(':image_path', $this->image_path);
        $stmt->bindParam(':id_categoria', $this->id_categoria, PDO::PARAM_INT);
        
        if ($stmt->execute()) {
            $this->id = $this->conn->lastInsertId();
            return $this->id;
        }
        
        return false;
    }

    /**
     * Aggiorna il prodotto esistente nel database
     * @param array $dati - Array associativo con i campi da aggiornare
     * @return bool - true se l'aggiornamento ha successo
     */
    public function aggiorna($dati) {
        if ($this->id === null) {
            return false;
        }

        $campiAggiornabili = ['titolo', 'descrizione', 'autore', 'prezzo', 'image_path', 'id_categoria'];
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
        
        if (empty($setClauses)) {
            return false;
        }
        
        $sql = "UPDATE posters SET " . implode(', ', $setClauses) . " WHERE id = :id";
        $stmt = $this->conn->prepare($sql);
        
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        
        return $stmt->execute();
    }

    /**
     * Elimina il prodotto dal database
     * @return bool - true se l'eliminazione ha successo
     */
    public function elimina() {
        if ($this->id === null) {
            return false;
        }

        $stmt = $this->conn->prepare("DELETE FROM posters WHERE id = :id");
        $stmt->bindParam(':id', $this->id, PDO::PARAM_INT);
        
        return $stmt->execute();
    }

    /**
     * Metodo statico per ottenere tutti i prodotti
     * @param PDO $conn - Connessione al database
     * @param array $filtri - Filtri opzionali (categoria, ricerca, etc.)
     * @return array - Array di array associativi con i dati dei prodotti
     */
    public static function getAll($conn, $filtri = []) {
        $sql = "SELECT 
                    p.id, 
                    p.titolo, 
                    p.descrizione, 
                    p.autore, 
                    p.prezzo, 
                    p.image_path,
                    p.id_categoria,
                    c.nome as categoria_nome
                FROM posters p
                LEFT JOIN categorie c ON p.id_categoria = c.id";
        
        $conditions = [];
        $params = [];
        
        // Applica filtri se presenti
        if (!empty($filtri['categoria'])) {
            $conditions[] = "p.id_categoria = :categoria";
            $params[':categoria'] = $filtri['categoria'];
        }
        
        if (!empty($filtri['ricerca'])) {
            $conditions[] = "(p.titolo LIKE :ricerca OR p.descrizione LIKE :ricerca OR p.autore LIKE :ricerca)";
            $params[':ricerca'] = '%' . $filtri['ricerca'] . '%';
        }
        
        if (!empty($conditions)) {
            $sql .= " WHERE " . implode(' AND ', $conditions);
        }
        
        $sql .= " ORDER BY p.id DESC";
        
        $stmt = $conn->prepare($sql);
        
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Converte l'oggetto in un array associativo
     * @return array - Rappresentazione array del prodotto
     */
    public function toArray() {
        return [
            'id' => $this->id,
            'titolo' => $this->titolo,
            'descrizione' => $this->descrizione,
            'autore' => $this->autore,
            'prezzo' => $this->prezzo,
            'image_path' => $this->image_path,
            'id_categoria' => $this->id_categoria,
            'categoria_nome' => $this->categoria_nome
        ];
    }

    /**
     * Validazione dei dati del prodotto
     * @return bool - true se i dati sono validi
     */
    private function valida() {
        if (empty($this->titolo) || empty($this->descrizione) || empty($this->prezzo) || empty($this->image_path)) {
            return false;
        }
        
        if (!is_numeric($this->prezzo) || $this->prezzo <= 0) {
            return false;
        }
        
        return true;
    }

    // Getter e Setter
    public function getId() {
        return $this->id;
    }

    public function getTitolo() {
        return $this->titolo;
    }

    public function setTitolo($titolo) {
        $this->titolo = $titolo;
    }

    public function getDescrizione() {
        return $this->descrizione;
    }

    public function setDescrizione($descrizione) {
        $this->descrizione = $descrizione;
    }

    public function getAutore() {
        return $this->autore;
    }

    public function setAutore($autore) {
        $this->autore = $autore;
    }

    public function getPrezzo() {
        return $this->prezzo;
    }

    public function setPrezzo($prezzo) {
        $this->prezzo = $prezzo;
    }

    public function getImagePath() {
        return $this->image_path;
    }

    public function setImagePath($image_path) {
        $this->image_path = $image_path;
    }

    public function getIdCategoria() {
        return $this->id_categoria;
    }

    public function setIdCategoria($id_categoria) {
        $this->id_categoria = $id_categoria;
    }

    public function getCategoriaNome() {
        return $this->categoria_nome;
    }
}
