# Artly - E-commerce di Stampe Digitali

## Indice

1. [Panoramica del Progetto](#panoramica-del-progetto)
2. [Architettura dell'Applicazione](#architettura-dellapplicazione)
3. [Struttura del Progetto](#struttura-del-progetto)
4. [Tecnologie Utilizzate](#tecnologie-utilizzate)
5. [Funzionalità Principali](#funzionalità-principali)
6. [Sistema di Routing](#sistema-di-routing)
7. [Gestione dello Stato](#gestione-dello-stato)
8. [API Backend](#api-backend)
9. [Sistema di Autenticazione](#sistema-di-autenticazione)
10. [Database](#database)
11. [Componenti Riutilizzabili](#componenti-riutilizzabili)
12. [Sistema di Validazione](#sistema-di-validazione)
13. [Responsive Design](#responsive-design)
14. [Installazione e Configurazione](#installazione-e-configurazione)

---

## Panoramica del Progetto

**Artly** è un e-commerce moderno specializzato nella vendita di stampe digitali d'arte. Il progetto è stato sviluppato come Single Page Application (SPA) con architettura client-server, utilizzando JavaScript vanilla per il frontend e PHP per il backend.

### Caratteristiche Principali

- ✅ Single Page Application (SPA) con routing lato client
- ✅ Gestione completa del carrello con localStorage
- ✅ Sistema di autenticazione utente (login/registrazione)
- ✅ Area amministrativa per gestione prodotti e utenti
- ✅ Sistema di preferiti (wishlist)
- ✅ Checkout con riepilogo ordine
- ✅ Profilo utente con storico ordini
- ✅ Ricerca e filtri avanzati per prodotti
- ✅ Design responsive mobile-first
- ✅ Validazione real-time dei form

---

## Architettura dell'Applicazione

### Pattern Architetturale: SPA (Single Page Application)

L'applicazione utilizza un'architettura SPA moderna che:

- Carica una singola pagina HTML (`index.html`)
- Gestisce la navigazione tramite History API
- Carica dinamicamente le view tramite fetch
- Mantiene lo stato dell'applicazione in memoria

### Flusso di Funzionamento

```
1. Caricamento iniziale (index.html)
   ↓
2. Inizializzazione componenti globali (Header, Footer)
   ↓
3. Router intercetta la richiesta
   ↓
4. Router carica la view appropriata
   ↓
5. Controller della pagina si inizializza
   ↓
6. Controller fa richieste API al backend
   ↓
7. Backend elabora e restituisce JSON
   ↓
8. Frontend aggiorna il DOM
```

### Separazione Frontend/Backend

**Frontend (Public)**

- Gestisce l'interfaccia utente
- Validazione client-side
- Routing lato client
- Gestione dello stato locale

**Backend (Src)**

- API RESTful in PHP
- Logica di business
- Accesso al database MySQL
- Autenticazione e autorizzazione

---

## Struttura del Progetto

```
progetto_TecWeb/
│
├── public/                          # Frontend pubblicamente accessibile
│   ├── index.html                   # Entry point dell'applicazione
│   │
│   ├── assets/                      # Risorse statiche
│   │   ├── css/
│   │   │   └── style.css           # Stili globali (4700+ righe)
│   │   │
│   │   ├── img/                     # Immagini del sito
│   │   │   ├── logo.png
│   │   │   ├── sfondoHome.png
│   │   │   ├── pw_nascosta.png
│   │   │   ├── pw_visibile.png
│   │   │   └── [prodotti]/         # Immagini prodotti
│   │   │
│   │   └── js/                      # JavaScript
│   │       ├── app.js              # Controller principale
│   │       ├── router.js           # Gestione routing
│   │       ├── store.js            # Gestione stato globale
│   │       ├── utils.js            # Funzioni di utilità
│   │       │
│   │       ├── components/         # Componenti riutilizzabili
│   │       │   ├── header.js       # Header con navigazione
│   │       │   ├── footer.js       # Footer
│   │       │   └── search-component.js
│   │       │
│   │       └── pages/              # Controller delle pagine
│   │           ├── admin.js        # Pannello amministrativo
│   │           ├── carrello.js     # Gestione carrello
│   │           ├── checkout.js     # Processo di checkout
│   │           ├── dettaglio-prodotto.js
│   │           ├── preferiti.js    # Wishlist
│   │           ├── prodotti.js     # Catalogo prodotti
│   │           └── profilo.js      # Area personale
│   │
│   └── views/                       # Template HTML delle pagine
│       ├── home.html
│       ├── prodotti.html
│       ├── dettaglio-prodotto.html
│       ├── carrello.html
│       ├── checkout.html
│       ├── preferiti.html
│       ├── profilo.html
│       ├── login.html
│       ├── registrazione.html
│       ├── admin.html
│       ├── order-success.html
│       └── 404.html
│
├── src/                             # Backend (non accessibile via web)
│   ├── api/                         # Endpoint API RESTful
│   │   ├── me.php                  # Info utente corrente
│   │   ├── prodotti.php            # CRUD prodotti (public)
│   │   │
│   │   ├── auth/                   # Autenticazione
│   │   │   ├── login.php
│   │   │   ├── logout.php
│   │   │   ├── registrazione.php
│   │   │   ├── check-email.php
│   │   │   ├── change-password.php
│   │   │   └── reset-password.php
│   │   │
│   │   ├── admin/                  # Endpoint amministrativi
│   │   │   ├── prodotti.php       # CRUD prodotti (admin)
│   │   │   └── utenti.php         # Gestione utenti
│   │   │
│   │   ├── catalogo/               # Catalogo e ordini
│   │   │   ├── categorie.php
│   │   │   └── process-order.php
│   │   │
│   │   └── user/                   # Funzionalità utente
│   │       ├── preferiti.php
│   │       ├── manage_preferiti.php
│   │       └── ordini.php
│   │
│   ├── classes/                     # Classi PHP
│   │   ├── Prodotto.php
│   │   └── Utente.php
│   │
│   ├── config/                      # Configurazione
│   │   └── dbConnection.php        # Connessione database
│   │
│   └── support/                     # Funzioni di supporto
│       ├── auth.php                # Verifica autenticazione
│       └── response.php            # Formattazione risposte JSON
│
├── database/                        # Database e migrazioni
│   ├── artly.sql              # Schema completo
│
├── docs/                           # Documentazione
│   ├── README.md
│
├── .htaccess                       # Configurazione Apache (root)
└── public/.htaccess                # Configurazione Apache (public)
```

---

## Tecnologie Utilizzate

### Frontend

- **HTML5**: Struttura semantica delle pagine
- **CSS3**: Stili moderni con CSS Variables, Flexbox, Grid
- **JavaScript ES6+**: Logica applicativa (vanilla, no framework)
- **History API**: Gestione routing SPA
- **LocalStorage**: Persistenza carrello e stato
- **Fetch API**: Comunicazione con backend

### Backend

- **PHP 7.4+**: Linguaggio server-side
- **MySQL 8.0+**: Database relazionale
- **Apache 2.4+**: Web server
- **PDO**: Database abstraction layer
- **JSON**: Formato dati API

### Tools & Metodologie

- **RESTful API**: Architettura API
- **MVC Pattern**: Separazione logica
- **Component-Based**: Componenti riutilizzabili
- **Mobile-First**: Design responsive
- **Progressive Enhancement**: Accessibilità

---

## Funzionalità Principali

### 1. Catalogo Prodotti

**File coinvolti:**

- `public/views/prodotti.html`
- `public/assets/js/pages/prodotti.js`
- `src/api/prodotti.php`

**Caratteristiche:**

- Griglia responsive di prodotti con immagini
- Filtri per categoria (dinamici da database)
- Ordinamento (prezzo crescente/decrescente, nome)
- Ricerca testuale real-time (titolo, descrizione, autore)
- Contatore prodotti dinamico
- Modal carrello dopo aggiunta prodotto

**Flusso:**

1. Caricamento categorie da API
2. Caricamento prodotti da API
3. Rendering cards prodotto
4. Applicazione filtri lato client
5. Click su card → navigazione a dettaglio
6. Click su "Aggiungi" → aggiungi a carrello + mostra modal

### 2. Dettaglio Prodotto

**File coinvolti:**

- `public/views/dettaglio-prodotto.html`
- `public/assets/js/pages/dettaglio-prodotto.js`
- `src/api/prodotti.php` (GET con parametro id)

**Caratteristiche:**

- Visualizzazione completa informazioni prodotto
- Immagine grande del prodotto
- Quantità selezionabile (spinner)
- Aggiunta al carrello
- Aggiunta ai preferiti (se loggato)
- Modal carrello con riepilogo

### 3. Carrello

**File coinvolti:**

- `public/views/carrello.html`
- `public/assets/js/pages/carrello.js`
- `public/assets/js/store.js`

**Caratteristiche:**

- Persistenza in localStorage
- Modifica quantità prodotti
- Rimozione prodotti
- Calcolo automatico subtotale, spedizione, totale
- Spedizione gratuita sopra €50
- Prodotti consigliati (basati su categoria)
- Validazione carrello vuoto
- Navigazione a checkout

**Logica Spedizione:**

```javascript
shipping = subtotal >= 50 ? 0 : 4.9 €
```

### 4. Checkout

**File coinvolti:**

- `public/views/checkout.html`
- `public/assets/js/pages/checkout.js`
- `src/api/catalogo/process-order.php`

**Caratteristiche:**

- Form dati personali e spedizione
- Validazione real-time campi
- Riepilogo ordine con totali
- Selezione metodo pagamento
- Precompilazione dati se utente loggato
- Invio ordine al backend
- Redirect a pagina conferma

**Campi Validati:**

- Nome, Cognome (almeno 2 caratteri)
- Email (formato valido)
- Telefono (9-15 cifre)
- Via, Città, Provincia, CAP
- Metodo di pagamento selezionato

### 5. Autenticazione

**File coinvolti:**

- `public/views/login.html`
- `public/views/registrazione.html`
- `public/assets/js/app.js` (controller login/registrazione)
- `src/api/auth/login.php`
- `src/api/auth/registrazione.php`

**Login:**

- Validazione email e password
- Sessione PHP
- Redirect intelligente (query param `?redirect=`)
- Toggle password visibility
- Link reset password con modal

**Registrazione:**

- Form completo dati utente
- Validazione email univoca
- Password minimo 6 caratteri
- Conferma password
- CAP validazione (5 cifre)
- Provincia validazione (2 lettere)
- Creazione automatica sessione dopo registrazione

**Reset Password:**

- Modal inline nella pagina login
- Verifica email esistente
- Cambio password diretta (simulato)

### 6. Preferiti (Wishlist)

**File coinvolti:**

- `public/views/preferiti.html`
- `public/assets/js/pages/preferiti.js`
- `src/api/user/preferiti.php`

**Caratteristiche:**

- Salvati nel database (non localStorage)
- Solo per utenti autenticati
- Aggiunta/rimozione prodotti
- Navigazione a dettaglio prodotto
- Aggiunta rapida al carrello

### 7. Profilo Utente

**File coinvolti:**

- `public/views/profilo.html`
- `public/assets/js/pages/profilo.js`
- `src/api/me.php`
- `src/api/user/ordini.php`
- `src/api/auth/reset-password.php`

**Caratteristiche:**

- Visualizzazione dati personali
- Modifica profilo con validazione
- Cambio password
- Storico ordini con dettagli
- Protezione: redirect a login se non autenticato

**Sezioni:**

1. **Dati Personali**: nome, cognome, email, telefono, indirizzo
2. **Gestione Password**: modal per cambio password
3. **I Miei Ordini**: lista ordini con prodotti, totali, date (con possibilità di poter effettuare di nuovo lo stesso ordine)

### 8. Area Amministrativa

**File coinvolti:**

- `public/views/admin.html`
- `public/assets/js/pages/admin.js`
- `src/api/admin/prodotti.php`
- `src/api/admin/utenti.php`

**Protezione:**

- Solo utenti con `ruolo = 'admin'`
- Verifica lato server in ogni endpoint
- Redirect automatico se non autorizzato

**Gestione Prodotti:**

- Tabella con tutti i prodotti
- Creazione nuovo prodotto
- Modifica prodotto esistente
- Eliminazione prodotto
- Upload immagine (path salvato in DB)

**Gestione Utenti:**

- Lista completa utenti
- Possibilità di rendere admin un utente (o viceversa)
- Blocco/Sblocco utente (`blocked` flag)

---

## Sistema di Routing

### Router (`public/assets/js/router.js`)

Il router gestisce la navigazione SPA senza ricaricamento della pagina.

**Configurazione Routes:**

```javascript
const routes = {
  "/": { view: "home.html", controller: "home" },
  "/home": { view: "home.html", controller: "home" },
  "/prodotti": { view: "prodotti.html", controller: "prodotti" },
  "/dettaglio-prodotto": {
    view: "dettaglio-prodotto.html",
    controller: "dettaglio-prodotto",
  },
  "/carrello": { view: "carrello.html", controller: "carrello" },
  "/checkout": { view: "checkout.html", controller: "checkout" },
  "/preferiti": { view: "preferiti.html", controller: "preferiti" },
  "/profilo": { view: "profilo.html", controller: "profilo" },
  "/login": { view: "login.html", controller: "login" },
  "/registrazione": { view: "registrazione.html", controller: "registrazione" },
  "/admin": { view: "admin.html", controller: "admin" },
};
```

**Funzionamento:**

1. **Link Click Intercept:**

Intercepta click su link [data-link] per navigazione SPA senza refresh pagina

```javascript
document.addEventListener("click", (e) => {
  const link = e.target.closest("[data-link]");
  if (link) {
    e.preventDefault();
    router.navigate(link.getAttribute("href"));
  }
});
```

2. **History API:**
   Navigazione SPA: aggiorna URL + carica contenuto senza refresh pagina

```javascript
navigate(path) {
  window.history.pushState({}, '', path);
  this.loadRoute(path);
}
```

3. **View Loading:**

Carica dinamicamente la vista HTML e inizializza il controller per la route richiesta.

```javascript
async loadRoute(path) {
  const route = this.routes[path] || { view: '404.html' };

  // Carica HTML
  const response = await fetch(`views/${route.view}`);
  const html = await response.text();
  document.getElementById('app').innerHTML = html;

  // Chiama controller
  if (this.controllers[route.controller]) {
    await this.controllers[route.controller](params);
  }
}
```

4. **Query Parameters:**

Estrae i parametri query dall'URL corrente per passare ai controller.

```javascript
// Esempio: /dettaglio-prodotto?id=5
const params = new URLSearchParams(window.location.search);
const productId = params.get("id");
```

**Vantaggi:**

- Navigazione istantanea
- URL condivisibili
- Supporto tasti browser (back/forward)
- Nessun ricaricamento pagina

---

## Gestione dello Stato

### Store (`public/assets/js/store.js`)

Lo store gestisce lo stato globale dell'applicazione con pattern singleton (Garantisce UNA SOLA ISTANZA dello store in tutta l'app).

**Stato Gestito:**

```javascript
{
  user: null,              // Dati utente loggato
  cart: [],                // Prodotti nel carrello
  isAuthenticated: false   // Flag autenticazione
}
```

**Metodi Principali:**

**Autenticazione:**

```javascript
setUser(userData); // Imposta utente
getUser(); // Ottieni dati utente
isAuthenticated(); // Verifica login
isAdmin(); // Verifica ruolo admin
clearUser(); // Logout (pulisce stato)
```

**Carrello:**

```javascript
addToCart(product); // Aggiunge prodotto (incrementa quantità se esiste)
removeFromCart(productId); // Rimuove prodotto
updateQuantity(id, qty); // Modifica quantità
getCart(); // Ottieni carrello completo
getCartCount(); // Conta totale pezzi
clearCart(); // Svuota carrello
saveCart(); // Salva in localStorage
loadCart(); // Carica da localStorage
```

**Persistenza:**

```javascript
// Salvataggio automatico localStorage
localStorage.setItem("artly_cart", JSON.stringify(cart));

// Caricamento all'inizializzazione
const savedCart = localStorage.getItem("artly_cart");
```

**Utilizzo:**

```javascript
// Aggiungere al carrello
store.addToCart(product);

// Verificare autenticazione
if (store.isAuthenticated()) {
  // Mostra contenuto protetto
}

// Ottenere numero articoli
const count = store.getCartCount();
```

---

## API Backend

### Struttura Risposta Standard

Tutte le API restituiscono JSON con questa struttura:

**Successo:**

```json
{
  "success": true,
  "message": "Operazione completata con successo",
  "data": {
    /* dati richiesti */
  }
}
```

**Errore:**

```json
{
  "success": false,
  "message": "Descrizione errore",
  "error": "Dettaglio tecnico (opzionale)"
}
```

### Endpoint Principali

#### 1. Autenticazione

**POST `/api/auth/login.php`**

```json
Request:
{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "message": "Login effettuato con successo",
  "data": {
    "id": 1,
    "nome": "Mario",
    "cognome": "Rossi",
    "email": "user@example.com",
    "ruolo": "cliente"
  }
}
```

**POST `/api/auth/registrazione.php`**

```json
Request:
{
  "nome": "Mario",
  "cognome": "Rossi",
  "email": "user@example.com",
  "password": "password123",
  "telefono": "3331234567",
  "via": "Via Roma 1",
  "citta": "Milano",
  "provincia": "MI",
  "cap": "20100"
}
```

**GET `/api/auth/logout.php`**

- Distrugge la sessione
- Restituisce conferma

**GET `/api/me.php`**

- Restituisce dati utente corrente
- `authenticated: false` se non loggato

#### 2. Prodotti

**GET `/api/prodotti.php`**

- Lista completa prodotti con categoria
- Accessibile senza autenticazione

```json
Response:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "titolo": "Sunset Dreams",
      "descrizione": "Stampa digitale...",
      "prezzo": "29.99",
      "autore": "Anna Bianchi",
      "image_path": "sunset_dreams.jpg",
      "id_categoria": 2,
      "categoria_nome": "Paesaggi"
    }
  ]
}
```

**GET `/api/prodotti.php?id=1`**

- Dettaglio singolo prodotto

**POST `/api/admin/prodotti.php`** (Admin)

- Creazione nuovo prodotto

**PUT `/api/admin/prodotti.php`** (Admin)

- Modifica prodotto esistente

**DELETE `/api/admin/prodotti.php?id=1`** (Admin)

- Eliminazione prodotto

#### 3. Catalogo

**GET `/api/catalogo/categorie.php`**

```json
Response:
{
  "success": true,
  "data": [
    { "id": 1, "nome": "Astratto" },
    { "id": 2, "nome": "Paesaggi" },
    { "id": 3, "nome": "Ritratti" }
  ]
}
```

**POST `/api/catalogo/process-order.php`**

```json
Request:
{
  "nome": "Mario",
  "cognome": "Rossi",
  "email": "user@example.com",
  "telefono": "3331234567",
  "indirizzo": "Via Roma 1",
  "citta": "Milano",
  "provincia": "MI",
  "cap": "20100",
  "metodoPagamento": "carta",
  "carrello": [
    {
      "id": 1,
      "titolo": "Prodotto",
      "prezzo": "29.99",
      "quantity": 2
    }
  ],
  "totale": 64.88
}

Response:
{
  "success": true,
  "message": "Ordine creato con successo",
  "data": {
    "orderId": 42,
    "totale": 64.88
  }
}
```

#### 4. Preferiti

**GET `/api/user/preferiti.php`** (Autenticato)

- Lista preferiti utente

**POST `/api/user/preferiti.php`** (Autenticato)

```json
Request:
{
  "action": "add",
  "id_prodotto": 5
}
```

**DELETE `/api/user/preferiti.php`** (Autenticato)

```json
Request:
{
  "action": "remove",
  "id_prodotto": 5
}
```

#### 5. Ordini

**GET `/api/user/ordini.php`** (Autenticato)

```json
Response:
{
  "success": true,
  "data": [
    {
      "id": 42,
      "data_ordine": "2026-01-15 14:30:00",
      "totale": "64.88",
      "stato": "completato",
      "prodotti": [
        {
          "titolo": "Prodotto",
          "quantita": 2,
          "prezzo_unitario": "29.99"
        }
      ]
    }
  ]
}
```

#### 6. Admin

**GET `/api/admin/utenti.php`** (Admin)

- Lista tutti gli utenti

**PUT `/api/admin/utenti.php`** (Admin)

- Modifica utente (blocco/sblocco, dati)

---

## Classi PHP (OOP)

Il progetto utilizza un approccio **Object-Oriented** per gestire le entità principali del sistema attraverso due classi PHP dedicate.

### Classe Prodotto (`src/classes/Prodotto.php`)

La classe `Prodotto` incapsula tutta la logica di business relativa ai prodotti (posters), seguendo i principi di **incapsulamento** e **single responsibility**.

**Proprietà Private:**

```php
private $conn;          // Connessione PDO al database
private $id;            // ID univoco prodotto
private $titolo;        // Titolo del poster
private $descrizione;   // Descrizione dettagliata
private $autore;        // Nome dell'artista
private $prezzo;        // Prezzo in formato decimale
private $image_path;    // Path dell'immagine
private $id_categoria;  // FK verso tabella categorie
private $categoria_nome; // Nome categoria (da JOIN)
```

**Metodi Principali:**

**Costruttore e Caricamento:**

```php
public function __construct($conn, $id = null)
// Crea un'istanza del prodotto
// Se $id è fornito, carica automaticamente i dati dal DB

public function carica()
// Carica i dati del prodotto dal database tramite JOIN con categorie
// Ritorna false se il prodotto non esiste
```

**CRUD Operations:**

```php
public function salva()
// Inserisce un nuovo prodotto nel database
// Esegue validazione automatica
// Ritorna l'ID del prodotto creato

public function aggiorna($dati)
// Aggiorna solo i campi specificati nell'array $dati
// Esempio: $prodotto->aggiorna(['prezzo' => 39.99, 'titolo' => 'Nuovo Titolo'])
// Utilizza prepared statements per sicurezza

public function elimina()
// Elimina il prodotto dal database
// Ritorna bool (successo/fallimento)
```

**Metodi Statici:**

```php
public static function getAll($conn, $filtri = [])
// Recupera tutti i prodotti con possibilità di filtraggio
// Filtri supportati: categoria, ricerca testuale
// Ritorna array di prodotti con JOIN alle categorie
// Esempio: Prodotto::getAll($conn, ['categoria' => 2, 'ricerca' => 'sunset'])
```

**Validazione:**

```php
private function valida()
// Valida i dati del prodotto:
// - Titolo obbligatorio (max 100 caratteri)
// - Prezzo numerico positivo
// - ID categoria valido
```

**Utilizzo Pratico:**

```php
// Esempio 1: Creare un nuovo prodotto
$prodotto = new Prodotto($conn);
$prodotto->setTitolo("Sunset Dreams");
$prodotto->setDescrizione("Splendido tramonto sul mare");
$prodotto->setAutore("Anna Bianchi");
$prodotto->setPrezzo(29.99);
$prodotto->setImagePath("sunset_dreams.jpg");
$prodotto->setIdCategoria(2);
$nuovoId = $prodotto->salva();

// Esempio 2: Caricare e modificare un prodotto esistente
$prodotto = new Prodotto($conn, 5); // Carica prodotto ID 5
$prodotto->aggiorna([
    'prezzo' => 34.99,
    'descrizione' => 'Descrizione aggiornata'
]);

// Esempio 3: Ottenere tutti i prodotti filtrati
$prodottiPaesaggi = Prodotto::getAll($conn, ['categoria' => 2]);
```

**Vantaggi dell'Approccio OOP:**

- ✅ Incapsulamento dati sensibili
- ✅ Validazione centralizzata
- ✅ Riutilizzabilità del codice
- ✅ Manutenibilità migliorata
- ✅ Type safety e autocomplete IDE

---

### Classe Utente (`src/classes/Utente.php`)

La classe `Utente` gestisce tutte le operazioni relative agli utenti del sistema, inclusa l'autenticazione.

**Proprietà Private:**

```php
private $conn;           // Connessione PDO
private $id;             // ID univoco utente
private $nome;           // Nome
private $cognome;        // Cognome
private $mail;           // Email (univoca)
private $password_hash;  // Password hashata con bcrypt
private $telefono;       // Numero di telefono
private $citta;          // Città di residenza
private $provincia;      // Sigla provincia (2 caratteri)
private $cap;            // Codice postale
private $via;            // Indirizzo completo
private $ruolo;          // 0 = cliente, 1 = admin
private $blocked;        // Flag blocco utente (0 o 1)
```

**Metodi Principali:**

**Costruttore e Caricamento:**

```php
public function __construct($conn, $id = null)
// Crea istanza utente
// Imposta valori default: ruolo=0, blocked=0

public function carica()
// Carica dati utente dal database tramite ID

public function caricaDaEmail($email)
// Carica dati utente tramite email
// Utile per il processo di login
```

**CRUD Operations:**

```php
public function salva()
// Registra nuovo utente
// Verifica univocità email
// Hash automatico password
// Ritorna ID utente creato

public function aggiorna($dati)
// Aggiorna campi specificati
// Gestione speciale per password (hash automatico)
// Esempio: $utente->aggiorna(['telefono' => '3331234567', 'password' => 'nuova123'])

public function elimina()
// Elimina utente dal database
```

**Autenticazione:**

```php
public function verificaPassword($password)
// Verifica password usando password_verify()
// Supporta bcrypt automaticamente
// Ritorna bool

public function cambiaPassword($nuovaPassword)
// Cambia password utente
// Hash automatico con password_hash()
```

**Metodi Statici:**

```php
public static function getAll($conn, $filtri = [])
// Recupera lista tutti gli utenti (per admin)
// Filtri opzionali: ruolo, blocked, ricerca

public static function emailEsiste($conn, $email)
// Verifica se email è già registrata
// Utilizzato nella validazione registrazione
```

**Validazione:**

```php
private function valida()
// Valida dati utente:
// - Nome e cognome obbligatori
// - Email formato valido e univoca
// - Password min 6 caratteri
// - CAP formato corretto (5 cifre)
// - Provincia 2 lettere maiuscole
```

**Gestione Ordini:**

```php
public function getOrdini()
// Recupera storico ordini dell'utente
// Ritorna array con dettagli prodotti ordinati
// Include data, totale, stato ordine
```

**Utilizzo Pratico:**

```php
// Esempio 1: Registrazione nuovo utente
$utente = new Utente($conn);
$utente->setNome("Mario");
$utente->setCognome("Rossi");
$utente->setMail("mario.rossi@email.com");
$utente->setPasswordHash(password_hash("password123", PASSWORD_DEFAULT));
$utente->setTelefono("3331234567");
$utente->setCitta("Milano");
$utente->setProvincia("MI");
$utente->setCap("20100");
$utente->setVia("Via Roma 1");
$userId = $utente->salva();

// Esempio 2: Login utente
$utente = new Utente($conn);
if ($utente->caricaDaEmail($email)) {
    if ($utente->verificaPassword($password)) {
        // Login successful
        $_SESSION['user_id'] = $utente->getId();
        $_SESSION['user_role'] = $utente->getRuolo();
    }
}

// Esempio 3: Blocco utente (admin)
$utente = new Utente($conn, $userId);
$utente->aggiorna(['blocked' => 1]);

// Esempio 4: Recupero storico ordini
$utente = new Utente($conn, $_SESSION['user_id']);
$ordini = $utente->getOrdini();
```

**Sicurezza Implementata:**

- 🔒 Password sempre hashate con `password_hash()` (bcrypt)
- 🔒 Prepared statements per prevenire SQL Injection
- 🔒 Validazione completa dati input
- 🔒 Email univoca con constraint database
- 🔒 Blocco utente per sicurezza

---

## Sistema di Autenticazione

### Sessioni PHP

**Configurazione:**

```php
session_start();
$_SESSION['user_id'] = $userId;
$_SESSION['user_role'] = $userRole;
```

**Middleware (`src/support/auth.php`):**
Protegge automaticamente tutte le API da accessi non autorizzati.

- `requireAuth()`: Verifica login utente (401 se non loggato)
- `requireAdmin()`: Verifica login + ruolo admin (403 se non autorizzato)

```php
function requireAuth() {
  if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode([
      'success' => false,
      'message' => 'Non autenticato'
    ]);
    exit;
  }
}

function requireAdmin() {
  requireAuth();
  if ($_SESSION['user_role'] !== 'admin') {
    http_response_code(403);
    echo json_encode([
      'success' => false,
      'message' => 'Accesso negato'
    ]);
    exit;
  }
}
```

### Password Hashing

```php
// Registrazione
$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

// Verifica login
if (password_verify($password, $hashedPassword)) {
  // Login successful
}
```

### Protezione Route Frontend

```javascript
// In app.js - controller delle pagine protette
async function initProfiloPage() {
  const response = await fetch("api/me.php");
  const data = await response.json();

  if (!data.authenticated) {
    const redirectUrl = encodeURIComponent("/profilo");
    router.navigate(`/login?redirect=${redirectUrl}`);
    return;
  }

  // Carica pagina protetta
}
```

### Protezione Admin

```javascript
// Doppia verifica: frontend + backend
if (store.isAdmin()) {
  // Mostra interfaccia admin
  // Ma ogni chiamata API è protetta anche lato server
}
```

---

## Database

### Schema Principale

**Tabella: utenti**

```sql
CREATE TABLE utenti (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nome VARCHAR(50) NOT NULL,
  cognome VARCHAR(50) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  telefono VARCHAR(20),
  via VARCHAR(100),
  citta VARCHAR(50),
  provincia CHAR(2),
  cap VARCHAR(5),
  ruolo ENUM('cliente', 'admin') DEFAULT 'cliente',
  blocked BOOLEAN DEFAULT FALSE,
  data_registrazione TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Tabella: prodotti**

```sql
CREATE TABLE prodotti (
  id INT PRIMARY KEY AUTO_INCREMENT,
  titolo VARCHAR(100) NOT NULL,
  descrizione TEXT,
  prezzo DECIMAL(10,2) NOT NULL,
  autore VARCHAR(100),
  image_path VARCHAR(255),
  id_categoria INT,
  data_creazione TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_categoria) REFERENCES categorie(id)
);
```

**Tabella: categorie**

```sql
CREATE TABLE categorie (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nome VARCHAR(50) NOT NULL UNIQUE
);
```

**Tabella: ordini**

```sql
CREATE TABLE ordini (
  id INT PRIMARY KEY AUTO_INCREMENT,
  id_utente INT,
  nome VARCHAR(50) NOT NULL,
  cognome VARCHAR(50) NOT NULL,
  email VARCHAR(100) NOT NULL,
  telefono VARCHAR(20),
  indirizzo VARCHAR(200),
  citta VARCHAR(50),
  provincia CHAR(2),
  cap VARCHAR(5),
  metodo_pagamento VARCHAR(50),
  subtotale DECIMAL(10,2),
  spedizione DECIMAL(10,2),
  totale DECIMAL(10,2) NOT NULL,
  stato VARCHAR(50) DEFAULT 'completato',
  data_ordine TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_utente) REFERENCES utenti(id)
);
```

**Tabella: ordini_prodotti**

```sql
CREATE TABLE ordini_prodotti (
  id INT PRIMARY KEY AUTO_INCREMENT,
  id_ordine INT NOT NULL,
  id_prodotto INT NOT NULL,
  titolo VARCHAR(100),
  prezzo_unitario DECIMAL(10,2),
  quantita INT,
  FOREIGN KEY (id_ordine) REFERENCES ordini(id),
  FOREIGN KEY (id_prodotto) REFERENCES prodotti(id)
);
```

**Tabella: preferiti**

```sql
CREATE TABLE preferiti (
  id INT PRIMARY KEY AUTO_INCREMENT,
  id_utente INT NOT NULL,
  id_prodotto INT NOT NULL,
  data_aggiunta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_preferito (id_utente, id_prodotto),
  FOREIGN KEY (id_utente) REFERENCES utenti(id) ON DELETE CASCADE,
  FOREIGN KEY (id_prodotto) REFERENCES prodotti(id) ON DELETE CASCADE
);
```

### Relazioni Database

```
utenti (1) ──→ (N) ordini
utenti (1) ──→ (N) preferiti
prodotti (1) ──→ (N) ordini_prodotti
prodotti (1) ──→ (N) preferiti
ordini (1) ──→ (N) ordini_prodotti
categorie (1) ──→ (N) prodotti
```

---

## Componenti Riutilizzabili

### Header Component (`public/assets/js/components/header.js`)

**Caratteristiche:**

- Classe ES6 esportabile
- Rendering HTML dinamico
- Gestione stato autenticazione
- Menu mobile responsive
- Badge carrello aggiornato
- Dropdown profilo utente

**Struttura:**

```javascript
class HeaderComponent {
  render(isAuthenticated, userName, cartCount) {
    return `<header>...</header>`;
  }

  attachEvents() {
    // Mobile menu toggle
    // User dropdown
    // Logout handler
  }
}
```

**Menu Desktop:**

- Home
- Prodotti
- Preferiti (solo autenticato)
- Admin (solo admin)
- Login/Profilo

**Menu Mobile:**

- Animazioni smooth
- Chiusura automatica su click link
- Reset automatico su resize finestra
- Icona hamburger → X

### Footer Component (`public/assets/js/components/footer.js`)

**Caratteristiche:**

- Rendering statico
- Link utili
- Contatti
- Copyright dinamico (anno corrente)
- Container per toast notifications

**Struttura:**

```javascript
class FooterComponent {
  render() {
    const currentYear = new Date().getFullYear();
    return `<footer>
      ...
      <div id="toast" class="toast"></div>
    </footer>`;
  }
}
```

---

## Sistema di Validazione

### Validazione Real-Time

**Pattern Utilizzato:**

```javascript
// Validazione su blur (quando si esce dal campo)
input.addEventListener("blur", () => {
  const error = validateField(input.value);
  showFieldError(input, errorSpan, error);
});

// Validazione su input (mentre si digita, solo se c'è già un errore)
input.addEventListener("input", () => {
  if (input.classList.contains("input-error")) {
    const error = validateField(input.value);
    showFieldError(input, errorSpan, error);
  }
});
```

### Funzioni di Validazione

**Email:**

```javascript
function validateEmail(email) {
  if (!email) return "L'email è obbligatoria";
  if (!email.includes("@") || !email.includes(".")) {
    return "Inserisci un'email valida";
  }
  return "";
}
```

**Password:**

```javascript
function validatePassword(password) {
  if (!password) return "La password è obbligatoria";
  if (password.length < 6) {
    return "La password deve essere di almeno 6 caratteri";
  }
  return "";
}
```

**Telefono:**

```javascript
function validateTelefono(telefono) {
  if (!telefono) return "Il telefono è obbligatorio";
  const cleaned = telefono.replace(/\s/g, "");
  if (cleaned.length < 9 || cleaned.length > 15) {
    return "Inserisci un numero valido (9-15 cifre)";
  }
  return "";
}
```

**CAP:**

```javascript
function validateCap(cap) {
  if (!cap) return "Il CAP è obbligatorio";
  if (!/^\d{5}$/.test(cap)) {
    return "Il CAP deve essere di 5 cifre";
  }
  return "";
}
```

### Feedback Visivo

**CSS Classes:**

```css
.input-error {
  border-color: #ff3b30 !important;
  background: rgba(255, 59, 48, 0.05);
}

.input-success {
  border-color: #34c759 !important;
}

.field-error {
  color: #ff3b30;
  font-size: 0.85rem;
  display: block;
  margin-top: 0.3rem;
}
```

---

## Responsive Design

### Breakpoints

```css
/* Mobile First Approach */

/* Mobile: < 768px (default) */
/* Tablet: 768px - 900px */
@media (max-width: 900px) {
}

/* Desktop: > 900px */
@media (min-width: 901px) {
}
```

### Mobile Menu

**Caratteristiche:**

- Hamburger icon → X icon
- Slide-in animation
- Backdrop overlay
- Close on link click
- Reset on window resize > 768px

**CSS:**

```css
.nav-mobile {
  display: none;
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease-in-out;
}

.nav-mobile.is-open {
  display: block;
  max-height: 500px;
}
```

### Grid Responsive

**Products Grid:**

```css
.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

@media (max-width: 768px) {
  .products-grid {
    grid-template-columns: 1fr;
  }
}
```

### Images Responsive

```css
.product-image {
  width: 100%;
  height: 280px;
  background-size: cover;
  background-position: center;
}

@media (max-width: 768px) {
  .product-image {
    height: 200px;
  }
}
```

---

## Installazione e Configurazione

### Requisiti

- **Apache 2.4+** con mod_rewrite abilitato
- **PHP 7.4+** con estensioni: pdo, pdo_mysql
- **MySQL 8.0+**
- **Browser moderno** (Chrome, Firefox, Safari, Edge)

### Installazione

**1. Clone del progetto:**

```bash
cd /Applications/XAMPP/xamppfiles/htdocs/
# Il progetto è già nella cartella progetto_TecWeb
```

**2. Configurazione Database:**

Modificare `src/config/dbConnection.php`:

```php
$host = 'localhost';
$db = 'artly';
$user = 'root';
$pass = '';
$charset = 'utf8mb4';
```

**3. Importazione Database:**

```bash
mysql -u root -p
CREATE DATABASE artly CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE artly;
SOURCE /path/to/database/migrations/artly.sql;
```

**4. Configurazione Apache:**

Verificare che `.htaccess` sia abilitato in `httpd.conf`:

```apache
<Directory "/Applications/XAMPP/xamppfiles/htdocs">
    AllowOverride All
</Directory>
```

**5. Permessi File:**

```bash
chmod -R 755 public/
chmod -R 755 src/
chmod 644 public/assets/img/*
```

**6. Verifica Configurazione:**

File: `/.htaccess` (root)

```apache
RewriteEngine On
RewriteRule ^api/(.*)$ src/api/$1 [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ public/$1 [L]
```

File: `/public/.htaccess`

```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . index.html [L]
```

### Accesso Applicazione

**URL:** `http://localhost/progetto_TecWeb/`

**Admin di Test:**

- Email: `admin01@gmail.it`
- Password: `admin123`

**Utente di Test:**

- Email: `ale@gmail.com`
- Password: `ale1234`

### Struttura URL

```
http://localhost/progetto_TecWeb/          → Home
http://localhost/progetto_TecWeb/prodotti  → Catalogo
http://localhost/progetto_TecWeb/carrello  → Carrello
http://localhost/progetto_TecWeb/login     → Login
http://localhost/progetto_TecWeb/admin     → Admin Panel

API:
http://localhost/progetto_TecWeb/api/prodotti.php
http://localhost/progetto_TecWeb/api/auth/login.php
etc.
```

---

## Performance e Ottimizzazioni

### Caching Browser

**Version Query String:**

```html
<script src="assets/js/app.js?v=16"></script>
<link rel="stylesheet" href="assets/css/style.css?v=16" />
```

- Incrementare il numero per forzare refresh cache

### Lazy Loading Immagini

```javascript
// Immagini prodotti caricate on-demand
const fullPath = window.image_path + product.image_path;
imageDiv.style.backgroundImage = `url('${fullPath}')`;
```

### LocalStorage

```javascript
// Carrello persistente senza chiamate API
localStorage.setItem("artly_cart", JSON.stringify(cart));
```

### Debounce Ricerca

```javascript
// Evita troppe chiamate durante digitazione
let searchTimeout;
searchInput.addEventListener("input", () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    filterProducts();
  }, 300);
});
```

---

## Sicurezza

### Prevenzione SQL Injection

```php
// Uso di PDO con prepared statements
$stmt = $pdo->prepare("SELECT * FROM utenti WHERE email = :email");
$stmt->execute(['email' => $email]);
```

### XSS Prevention

```javascript
// Sanitizzazione input
function sanitizeHTML(str) {
  const temp = document.createElement("div");
  temp.textContent = str;
  return temp.innerHTML;
}
```

### Password Hashing

```php
// Bcrypt automatico
$hash = password_hash($password, PASSWORD_DEFAULT);
```

### CORS & Headers

```php
// Headers sicurezza
header('Content-Type: application/json');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
```

### Validazione Doppia

- Client-side: UX immediata
- Server-side: Sicurezza garantita

---

## Testing

### Test Manuali Consigliati

**1. Navigazione:**

- [ ] Tutti i link funzionano
- [ ] Back/Forward browser funziona
- [ ] URL condivisibili funzionano
- [ ] 404 per route inesistenti

**2. Autenticazione:**

- [ ] Login con credenziali valide
- [ ] Login con credenziali errate
- [ ] Registrazione nuovo utente
- [ ] Logout
- [ ] Protezione pagine private
- [ ] Reset password

**3. Carrello:**

- [ ] Aggiunta prodotto
- [ ] Modifica quantità
- [ ] Rimozione prodotto
- [ ] Persistenza dopo refresh
- [ ] Badge aggiornato
- [ ] Calcolo totali corretto

**4. Checkout:**

- [ ] Validazione campi
- [ ] Calcolo spedizione
- [ ] Invio ordine
- [ ] Conferma ordine

**5. Preferiti:**

- [ ] Aggiunta preferito
- [ ] Rimozione preferito
- [ ] Persistenza database
- [ ] Solo utenti loggati

**6. Admin:**

- [ ] Accesso solo admin
- [ ] CRUD prodotti
- [ ] Gestione utenti
- [ ] Upload immagini

**7. Responsive:**

- [ ] Mobile menu funziona
- [ ] Grid responsive
- [ ] Form leggibili
- [ ] Immagini scalano

---

## Troubleshooting

### Problemi Comuni

**1. Pagina bianca / 404:**

- Verificare `.htaccess` attivo
- Verificare `mod_rewrite` abilitato
- Controllare permessi file

**2. API non funzionano:**

- Verificare path API in `.htaccess`
- Controllare errori PHP in error_log
- Verificare connessione database

**3. Immagini non visibili:**

- Verificare `window.image_path` in `utils.js`
- Controllare path immagini in database
- Verificare file esistano in `public/assets/img/`

**4. Carrello non persiste:**

- Verificare localStorage browser
- Controllare console per errori
- Verificare `store.js` caricato

**5. Login non funziona:**

- Verificare sessioni PHP attive
- Controllare hash password corretti
- Verificare credenziali database

### Debug

**Console Log:**

```javascript
console.log("🔍 Debug:", variabile);
```

**Network Tab:**

- Verificare chiamate API
- Controllare status code
- Ispezionare payload

**PHP Error Log:**

```bash
tail -f /Applications/XAMPP/xamppfiles/logs/error_log
```

---

## Crediti e Licenza

**Sviluppato da:** Giorgia Morgillo e Gaia Maria Vittoria Lo Coco
**Anno Accademico:** 2025/2026  
**Corso:** Tecnologie Web  
**Università:** Univertà degli Studi di Torino

### Tecnologie e Risorse

- **Icons:** Emoji Unicode
- **Fonts:** System Fonts (-apple-system, BlinkMacSystemFont)
- **Color Palette:** Custom Dark Theme
- **Images:** Placeholder/Demo (da sostituire con contenuti reali)

---

## Conclusioni

Artly è un progetto completo che dimostra:

✅ **Architettura SPA moderna** con routing client-side  
✅ **RESTful API** ben strutturate  
✅ **Gestione stato** centralizzata  
✅ **Autenticazione sicura** con sessioni PHP  
✅ **Database relazionale** ben normalizzato  
✅ **Responsive design** mobile-first  
✅ **Validazione completa** client e server  
✅ **Componenti riutilizzabili** modulari  
✅ **Codice pulito** e commentato  
✅ **Struttura progetto** professionale

**Ultima revisione:** 31 Gennaio 2026
