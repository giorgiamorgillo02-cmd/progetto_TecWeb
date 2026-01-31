# Refactoring Strutturale Completato

## Riepilogo delle Modifiche

### 1. ✅ Support Classes Aggiornati

**`/src/support/auth.php`**

- Aggiunto metodo `Auth::userId()` - Ritorna l'ID dell'utente autenticato
- Aggiunto metodo `Auth::isAdmin()` - Verifica se l'utente è admin

### 2. ✅ Nuovi Endpoint API Creati

#### **`/api/me.php`** (Profilo Utente)

- **GET**: Recupera dati profilo (sostituisce `check_session.php`)
  - Include controllo blocco utente
  - Distrugge sessione se utente bloccato
- **PATCH/POST**: Aggiorna profilo (sostituisce `update_profile.php`)
  - Campi consentiti: nome, cognome, mail, telefono, via, citta, provincia, cap, password
  - Validazione email e campi obbligatori
  - Aggiorna `$_SESSION['email']` se mail cambia

#### **`/api/admin/utenti.php`** (Gestione Utenti Admin)

- **GET**: Lista tutti gli utenti o dettaglio singolo
  - Supporta filtri: ruolo, blocked, ricerca
- **PATCH**: Modifica ruolo/blocked di un utente
  - Protezione: non può modificare se stesso
  - Validazione: ruolo 0/1, blocked 0/1
- **DELETE**: Elimina utente
  - Protezione: non può eliminare se stesso

#### **`/api/prodotti.php`** (Prodotti Pubblico)

- **GET**: Lista prodotti o dettaglio singolo
  - Supporta filtri: categoria, ricerca
  - Endpoint pubblico (no autenticazione)

#### **`/api/admin/prodotti.php`** (Gestione Prodotti Admin)

- **GET**: Lista/dettaglio prodotti
- **POST**: Crea nuovo prodotto
  - Validazione: titolo, descrizione, prezzo, image_path
- **PATCH**: Aggiorna prodotto
  - Validazione completa campi
- **DELETE**: Elimina prodotto

### 3. ✅ Classi Model Ripulite

**`classes/Utente.php`**

- ❌ **RIMOSSO**: `handleApiRequest()`, `handleGet()`, `handlePatch()`, `handleDelete()`
- ✅ **MANTENUTO**: Logica di dominio pura
  - Costruttore, carica, caricaDaEmail, salva, aggiorna, elimina
  - verificaPassword, setPassword
  - getOrdini, contaOrdini, getAll
  - toArray, validazioni, getter/setter

**`classes/Prodotto.php`**

- ❌ **RIMOSSO**: `handleApiRequest()`, `handleGet()`, `handlePost()`, `handlePatch()`, `handleDelete()`
- ✅ **MANTENUTO**: Logica di dominio pura
  - Costruttore, carica, salva, aggiorna, elimina
  - getAll, toArray, validazioni, getter/setter

### 4. ✅ File Legacy Deprecati (Retrocompatibilità)

Tutti i file vecchi ora rimandano ai nuovi endpoint mantenendo retrocompatibilità:

- `check_session.php` → `/api/me.php`
- `update_profile.php` → `/api/me.php` (PATCH)
- `admin_utenti.php` → `/api/admin/utenti.php`
- `admin_prodotti.php` → `/api/admin/prodotti.php`
- `get_prodotti.php` → `/api/prodotti.php`

## Esempi di Utilizzo

### Profilo Utente

```javascript
// GET - Verifica sessione e recupera dati utente
const response = await fetch("/api/me.php");
const data = await response.json();
// { authenticated: true, id_utente: 1, email: "...", nome: "...", ... }

// PATCH - Aggiorna profilo
const response = await fetch("/api/me.php", {
  method: "PATCH",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    nome: "Mario",
    cognome: "Rossi",
    mail: "mario.rossi@example.com",
    telefono: "1234567890",
  }),
});
// { success: true, message: "Profilo aggiornato con successo" }
```

### Gestione Utenti Admin

```javascript
// GET - Lista tutti gli utenti
const response = await fetch("/api/admin/utenti.php");
// { success: true, utenti: [...] }

// GET - Dettaglio singolo utente
const response = await fetch("/api/admin/utenti.php?id=5");
// { success: true, utente: {...}, ordini: [...] }

// PATCH - Blocca utente
const response = await fetch("/api/admin/utenti.php", {
  method: "PATCH",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ id: 5, blocked: 1 }),
});

// DELETE - Elimina utente
const response = await fetch("/api/admin/utenti.php", {
  method: "DELETE",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ id: 5 }),
});
```

### Prodotti

```javascript
// GET pubblico - Lista prodotti
const response = await fetch("/api/prodotti.php?categoria=2&ricerca=abstract");
// { success: true, count: 10, data: [...] }

// POST admin - Crea prodotto
const response = await fetch("/api/admin/prodotti.php", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    titolo: "Nuovo Poster",
    descrizione: "Descrizione...",
    autore: "Artista",
    prezzo: 29.99,
    image_path: "img/poster.jpg",
    id_categoria: 1,
  }),
});
// { success: true, message: "Prodotto creato con successo", id: 123 }
```

## Caratteristiche Implementate

### ✅ Separazione Completa

- Model (classes/) contiene solo logica di dominio
- Controller (api/) gestisce HTTP e JSON
- Support (src/support/) fornisce utilities riusabili

### ✅ Risposte Standardizzate

- Sempre `Content-Type: application/json`
- Status code corretti: 200, 201, 400, 401, 403, 404, 405, 500
- Formato uniforme: `{ success: true/false, ... }`
- Uso di `Response::json()` e `Response::error()`

### ✅ Autenticazione Centralizzata

- `Auth::start()` - Avvia sessione
- `Auth::requireLogin()` - Richiede login (401 se non autenticato)
- `Auth::requireAdmin()` - Richiede admin (403 se non admin)
- `Auth::userId()` - Ritorna ID utente corrente

### ✅ Validazioni

- Email con `filter_var()`
- Campi obbligatori controllati
- Prezzo numerico e > 0
- Protezioni (non eliminare/modificare se stesso)

### ✅ Gestione Errori

- Try/catch su PDOException
- Log errori con `error_log()`
- Messaggi generici al client (no dettagli DB)

### ✅ Retrocompatibilità

- File vecchi deprecati ma funzionanti
- Rimandano ai nuovi endpoint
- Frontend può continuare a funzionare

## Struttura Finale

```
/api/
  me.php                    # Profilo utente (GET, PATCH)
  prodotti.php              # Prodotti pubblico (GET)
  /admin/
    utenti.php              # Gestione utenti admin
    prodotti.php            # Gestione prodotti admin

/classes/
  Utente.php                # Model puro (senza routing HTTP)
  Prodotto.php              # Model puro (senza routing HTTP)

/src/support/
  auth.php                  # Autenticazione centralizzata
  response.php              # Risposte JSON standardizzate

# File deprecati (retrocompatibilità)
check_session.php           # → /api/me.php
update_profile.php          # → /api/me.php (PATCH)
admin_utenti.php            # → /api/admin/utenti.php
admin_prodotti.php          # → /api/admin/prodotti.php
get_prodotti.php            # → /api/prodotti.php
```

## Prossimi Passi (Opzionale)

1. **Aggiornare Frontend**
   - Cambiare fetch da file vecchi a `/api/*`
   - Rimuovere file deprecati dopo test

2. **Testing**
   - Testare tutti gli endpoint con Postman/curl
   - Verificare autenticazione e permessi
   - Testare blocco utente e sessioni

3. **Documentazione API**
   - Creare documentazione OpenAPI/Swagger
   - Documentare tutti gli endpoint

4. **Miglioramenti**
   - Rate limiting
   - CORS headers se necessario
   - Logging strutturato
