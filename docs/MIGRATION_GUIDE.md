# Guida Migrazione Endpoint API

## Mapping Vecchi → Nuovi Endpoint

Questa guida mostra come aggiornare le chiamate API dal frontend per usare i nuovi endpoint.

### ✅ Profilo Utente

#### Verifica Sessione / Get Profilo

**Vecchio:**

```javascript
fetch("/check_session.php");
```

**Nuovo:**

```javascript
fetch("/api/me.php");
```

**Response (identica):**

```json
{
  "authenticated": true,
  "id_utente": 1,
  "email": "user@example.com",
  "nome": "Mario",
  "cognome": "Rossi",
  "telefono": "1234567890",
  "via": "Via Roma 1",
  "citta": "Milano",
  "provincia": "MI",
  "cap": "20100",
  "ruolo": 0,
  "is_admin": false
}
```

#### Aggiornamento Profilo

**Vecchio:**

```javascript
fetch("/update_profile.php", {
  method: "POST", // ⚠️ Era POST
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ nome: "Mario", cognome: "Rossi" }),
});
```

**Nuovo (opzione 1 - PATCH standard):**

```javascript
fetch("/api/me.php", {
  method: "PATCH", // ✅ Standard REST
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ nome: "Mario", cognome: "Rossi" }),
});
```

**Nuovo (opzione 2 - POST per compatibilità):**

```javascript
fetch("/api/me.php", {
  method: "POST", // ✅ Supportato temporaneamente
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ nome: "Mario", cognome: "Rossi" }),
});
```

---

### ✅ Prodotti (Pubblico)

#### Lista Prodotti

**Vecchio:**

```javascript
fetch("/get_prodotti.php");
fetch("/get_prodotti.php?categoria=2");
fetch("/get_prodotti.php?ricerca=abstract");
```

**Nuovo:**

```javascript
fetch("/api/prodotti.php");
fetch("/api/prodotti.php?categoria=2");
fetch("/api/prodotti.php?ricerca=abstract");
```

**Response:**

```json
{
  "success": true,
  "count": 10,
  "data": [
    {
      "id": 1,
      "titolo": "Poster 1",
      "descrizione": "...",
      "autore": "Artista",
      "prezzo": "29.99",
      "image_path": "img/poster1.jpg",
      "id_categoria": 1,
      "categoria_nome": "Abstract"
    }
  ]
}
```

#### Dettaglio Prodotto

**Vecchio:**

```javascript
fetch("/get_prodotti.php?id=1");
```

**Nuovo:**

```javascript
fetch("/api/prodotti.php?id=1");
```

---

### ✅ Gestione Utenti (Admin)

#### Lista Utenti

**Vecchio:**

```javascript
fetch("/admin_utenti.php", { method: "GET" });
```

**Nuovo:**

```javascript
fetch("/api/admin/utenti.php", { method: "GET" });
```

**Response:**

```json
{
  "success": true,
  "utenti": [
    {
      "id": 1,
      "nome": "Mario",
      "cognome": "Rossi",
      "mail": "mario@example.com",
      "ruolo": 0,
      "blocked": 0,
      "num_ordini": 5
    }
  ]
}
```

#### Dettaglio Utente

**Vecchio:**

```javascript
fetch("/admin_utenti.php?id=5", { method: "GET" });
```

**Nuovo:**

```javascript
fetch("/api/admin/utenti.php?id=5", { method: "GET" });
```

#### Modifica Utente (Blocca/Promuovi Admin)

**Vecchio:**

```javascript
fetch("/admin_utenti.php", {
  method: "PATCH",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ id: 5, blocked: 1, ruolo: 0 }),
});
```

**Nuovo:**

```javascript
fetch("/api/admin/utenti.php", {
  method: "PATCH",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ id: 5, blocked: 1, ruolo: 0 }),
});
```

#### Elimina Utente

**Vecchio:**

```javascript
fetch("/admin_utenti.php", {
  method: "DELETE",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ id: 5 }),
});
```

**Nuovo:**

```javascript
fetch("/api/admin/utenti.php", {
  method: "DELETE",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ id: 5 }),
});
```

---

### ✅ Gestione Prodotti (Admin)

#### Lista Prodotti Admin

**Vecchio:**

```javascript
fetch("/admin_prodotti.php", { method: "GET" });
```

**Nuovo:**

```javascript
fetch("/api/admin/prodotti.php", { method: "GET" });
```

**Response:**

```json
{
  "success": true,
  "prodotti": [...]
}
```

#### Crea Prodotto

**Vecchio:**

```javascript
fetch("/admin_prodotti.php", {
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
```

**Nuovo:**

```javascript
fetch("/api/admin/prodotti.php", {
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
```

#### Modifica Prodotto

**Vecchio:**

```javascript
fetch("/admin_prodotti.php", {
  method: "PATCH",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    id: 1,
    titolo: "Titolo Aggiornato",
    prezzo: 39.99,
  }),
});
```

**Nuovo:**

```javascript
fetch("/api/admin/prodotti.php", {
  method: "PATCH",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    id: 1,
    titolo: "Titolo Aggiornato",
    prezzo: 39.99,
  }),
});
```

#### Elimina Prodotto

**Vecchio:**

```javascript
fetch("/admin_prodotti.php", {
  method: "DELETE",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ id: 1 }),
});
```

**Nuovo:**

```javascript
fetch("/api/admin/prodotti.php", {
  method: "DELETE",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ id: 1 }),
});
```

---

## Strategia di Migrazione

### Opzione A: Migrazione Immediata (Consigliata)

1. Sostituisci tutte le chiamate da vecchi a nuovi endpoint
2. Testa il frontend
3. Elimina i file vecchi deprecati:
   - `check_session.php`
   - `update_profile.php`
   - `admin_utenti.php`
   - `admin_prodotti.php`
   - `get_prodotti.php`

### Opzione B: Migrazione Graduale

1. Lascia i file vecchi (già configurati come alias)
2. Aggiorna progressivamente le chiamate frontend
3. Monitora i log per vedere quali endpoint sono ancora usati
4. Elimina i file vecchi quando non più utilizzati

---

## File da Aggiornare nel Frontend

Cerca questi pattern nel tuo codice JavaScript:

```bash
# Trova tutti i file che usano i vecchi endpoint
grep -r "check_session.php" js/ views/ components/ *.js
grep -r "update_profile.php" js/ views/ components/ *.js
grep -r "admin_utenti.php" js/ views/ components/ *.js
grep -r "admin_prodotti.php" js/ views/ components/ *.js
grep -r "get_prodotti.php" js/ views/ components/ *.js
```

Sostituisci con i nuovi percorsi `/api/*`.

---

## Vantaggi della Migrazione

✅ **Struttura chiara**: `/api/` raggruppa tutti gli endpoint  
✅ **Separazione Model/Controller**: Codice più manutenibile  
✅ **Risposte standardizzate**: Formato JSON uniforme  
✅ **Gestione errori migliorata**: Status code corretti  
✅ **Retrocompatibilità**: File vecchi funzionano ancora  
✅ **Autenticazione centralizzata**: Codice riusabile in `Auth::`

---

## Note sulla Retrocompatibilità

I file vecchi (`check_session.php`, `update_profile.php`, ecc.) sono stati trasformati in **alias** che includono automaticamente i nuovi controller.

**Questo significa che:**

- Il frontend continua a funzionare senza modifiche
- I vecchi endpoint rispondono esattamente come prima
- Hai tempo per aggiornare il frontend gradualmente
- Quando pronto, puoi eliminare i file vecchi

**File deprecati (sicuri da eliminare dopo migrazione):**

```
check_session.php
update_profile.php
admin_utenti.php
admin_prodotti.php
get_prodotti.php
```
