<?php
/* Classe prodotto per: 
    - costruttore: __construct($conn, $id = null)
    - caricare dati prodotto dal db: carica()
    - salvare nuovo prodotto nel db: salva()
    - aggiornare prodotto esistente nel db: aggiorna($dati)
    - eliminare prodotto dal db: elimina()
    - ottenere lista prodotti con filtri opzionali: getAll($conn, $filtri = [])
    - convertire oggetto in array associativo: toArray()
    - validare dati prodotto: valida()
    - getter e setter
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

    // Costruttore
    public function __construct($conn, $id = null) { //connessione al db + id prodotto (opzionale)
        $this->conn = $conn;
        $this->id = $id;
        
        // Se viene fornito un ID, carica automaticamente i dati
        if ($id !== null) {
            $this->carica();
        }
    }

//CARICA DATI PRODOTTO DAL DB (restituisce booleano)
 public function carica() {
    //se id non impostato -> non carica 
    if ($this->id === null) return false;

    //query per ottenere dati prodotto
    $sql = "SELECT p.id, p.titolo, p.descrizione, p.autore, p.prezzo, p.image_path,
                   p.id_categoria, c.nome as categoria_nome
            FROM posters p
            LEFT JOIN categorie c ON p.id_categoria = c.id
            WHERE p.id = :id";

    $stmt = $this->conn->prepare($sql); //prepara query
    $stmt->bindValue(':id', $this->id, PDO::PARAM_INT); 
    $stmt->execute();

    //ottiene dati come array associativo
    $data = $stmt->fetch(PDO::FETCH_ASSOC); 
    //se nessun dato trovato -> id non valido
    if (!$data) {
        $this->id = null;         
        return false;
    }

    //imposta proprietà oggetto con dati dal db
    $this->titolo = $data['titolo'];
    $this->descrizione = $data['descrizione'];
    $this->autore = $data['autore'];
    $this->prezzo = $data['prezzo'];
    $this->image_path = $data['image_path'];
    $this->id_categoria = $data['id_categoria'];
    $this->categoria_nome = $data['categoria_nome'];

    return true;
}


    //SALVA NUOVO PRODOTTO NEL DB (restituisce id nuovo prodotto o false)
    public function salva() {
        // se dati non validi -> non salva
        if (!$this->valida()) {
            return false;
        }
        //query di inserimento
        $sql = "INSERT INTO posters (titolo, descrizione, autore, prezzo, image_path, id_categoria) 
                VALUES (:titolo, :descrizione, :autore, :prezzo, :image_path, :id_categoria)";
        
        $stmt = $this->conn->prepare($sql); //prepara query
        $stmt->bindParam(':titolo', $this->titolo);
        $stmt->bindParam(':descrizione', $this->descrizione);
        $stmt->bindParam(':autore', $this->autore);
        $stmt->bindParam(':prezzo', $this->prezzo);
        $stmt->bindParam(':image_path', $this->image_path);
        $stmt->bindParam(':id_categoria', $this->id_categoria, PDO::PARAM_INT); //può essere null
        
        //se esecuzione avvenuta con successo -> imposta id e lo restituisce
        if ($stmt->execute()) {
            $this->id = $this->conn->lastInsertId();
            return $this->id;
        }
        
        return false;
    }

    //AGGIORNA PRODOTTO NEL DB (restituisce booleano)
    public function aggiorna($dati) {
        //se id non impostato -> non aggiorna
        if ($this->id === null) {
            return false;
        }

        $campiAggiornabili = ['titolo', 'descrizione', 'autore', 'prezzo', 'image_path', 'id_categoria']; //campi che possono essere aggiornati
        $setClauses = []; //clausole SET della query
        $params = [':id' => $this->id]; //parametri per la query
        
        //ciclo sui campi aggiornabili se presenti in $dati -> aggiunge a query e parametri
        foreach ($campiAggiornabili as $campo) {
            if (isset($dati[$campo])) {
                $setClauses[] = "$campo = :$campo";
                $params[":$campo"] = $dati[$campo];
                
                // Aggiorna proprietà dell'oggetto
                $this->$campo = $dati[$campo];
            }
        }
        
        //se nessun campo da aggiornare -> non esegue query
        if (empty($setClauses)) {
            return false;
        }
        
        $sql = "UPDATE posters SET " . implode(', ', $setClauses) . " WHERE id = :id"; //costruisce query (implode -> unisce clausole SET con virgole)
        $stmt = $this->conn->prepare($sql);
        
        //ciclo per fare il bind dei parametri
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        
        return $stmt->execute(); //esegue query e restituisce risultato
    }

    //ELIMINA PRODOTTO DAL DB (restituisce booleano)
    public function elimina() {
        //se id non impostato -> non elimina
        if ($this->id === null) {
            return false;
        }
        //query di eliminazione (in base a id)
        $stmt = $this->conn->prepare("DELETE FROM posters WHERE id = :id");
        $stmt->bindParam(':id', $this->id, PDO::PARAM_INT);
        
        return $stmt->execute();
    }

    //OTTENERE LISTA PRODOTTI DAL DB CON FILTRI OPZIONALI (restituisce array di prodotti)
    public static function getAll($conn, $filtri = []) {
        //query di selezione
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
        
        $conditions = []; //condizioni WHERE
        $params = []; //parametri per la query
        
        // Applica filtri se presenti
        if (!empty($filtri['categoria'])) { //filtro categoria
            $conditions[] = "p.id_categoria = :categoria";
            $params[':categoria'] = $filtri['categoria'];
        }
        
        if (!empty($filtri['ricerca'])) { //filtro ricerca (titolo, descrizione, autore)
            $conditions[] = "(p.titolo LIKE :ricerca OR p.descrizione LIKE :ricerca OR p.autore LIKE :ricerca)";
            $params[':ricerca'] = '%' . $filtri['ricerca'] . '%';
        }
        
        //se ci sono condizioni -> le aggiunge alla query
        if (!empty($conditions)) {
            $sql .= " WHERE " . implode(' AND ', $conditions);
        }
        
        $sql .= " ORDER BY p.id DESC"; //ordina per id decrescente (prodotti più recenti prima)
        
        $stmt = $conn->prepare($sql);
        
        //bind dei parametri
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC); //restituisce array di prodotti
    }

    //CONVERTI OGGETTO PRODOTTO IN ARRAY ASSOCIATIVO
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

    //VALIDA DATI PRODOTTO (restituisce booleano)
    private function valida() {
        //se dati obbligatori mancanti -> false
        if (empty($this->titolo) || empty($this->descrizione) || empty($this->prezzo) || empty($this->image_path)) {
            return false;
        }
        
        //se prezzo non è un numero positivo -> false
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
