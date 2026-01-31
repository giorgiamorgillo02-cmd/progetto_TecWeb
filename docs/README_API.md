# 🎨 Artly - Sistema Gestione Poster

## 📋 Refactoring API Completato

Questo progetto ha subito un refactoring strutturale completo per separare Model, Controller e Support utilities seguendo best practices REST e architettura MVC.

---

## 🗂️ Struttura API Nuova

```
/api/
├── me.php                          # Profilo utente (GET, PATCH)
├── prodotti.php                    # Prodotti pubblico (GET)
└── admin/
    ├── utenti.php                  # Gestione utenti (GET, PATCH, DELETE)
    └── prodotti.php                # Gestione prodotti (GET, POST, PATCH, DELETE)

/classes/
├── Utente.php                      # Model utente (solo logica dominio)
└── Prodotto.php                    # Model prodotto (solo logica dominio)

/src/support/
├── auth.php                        # Autenticazione centralizzata
└── response.php                    # Risposte JSON standardizzate
```

---

## 🚀 Quick Start

### Test Endpoint Pubblici

```bash
# Verifica sessione (non autenticato)
curl http://localhost/progetto_TecWeb/api/me.php

# Lista prodotti
curl http://localhost/progetto_TecWeb/api/prodotti.php

# Dettaglio prodotto
curl http://localhost/progetto_TecWeb/api/prodotti.php?id=1
```

### Test con Autenticazione

```bash
# 1. Login e salva cookie
curl -c cookies.txt -X POST http://localhost/progetto_TecWeb/login.php \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@example.com","password":"password"}'

# 2. Get profilo utente
curl -b cookies.txt http://localhost/progetto_TecWeb/api/me.php

# 3. Aggiorna profilo
curl -b cookies.txt -X PATCH http://localhost/progetto_TecWeb/api/me.php \
  -H 'Content-Type: application/json' \
  -d '{"nome":"Mario","cognome":"Rossi"}'

# 4. Lista utenti (admin)
curl -b cookies.txt http://localhost/progetto_TecWeb/api/admin/utenti.php
```

---

## 📚 Documentazione

- **[REFACTORING.md](REFACTORING.md)** - Dettaglio completo delle modifiche
- **[MIGRATION_GUIDE.md](MIGRATION_GUIDE.md)** - Guida migrazione frontend
- **[test_api.sh](test_api.sh)** - Script di test automatico

---

## 🔐 Autenticazione

Tutti gli endpoint usano sessioni PHP. Gli endpoint admin richiedono `ruolo=1`.

### Support Class: `Auth`

```php
Auth::start();              // Avvia sessione
Auth::requireLogin();       // Richiede login (401 se non autenticato)
Auth::requireAdmin();       // Richiede admin (403 se non admin)
Auth::userId();             // Ritorna ID utente corrente
Auth::isAdmin();            // Verifica se admin
```

---

## 📡 API Endpoints

### Profilo Utente

| Metodo | Endpoint      | Auth     | Descrizione                          |
| ------ | ------------- | -------- | ------------------------------------ |
| GET    | `/api/me.php` | Optional | Verifica sessione e recupera profilo |
| PATCH  | `/api/me.php` | Required | Aggiorna profilo utente              |
| POST   | `/api/me.php` | Required | Aggiorna profilo (compatibilità)     |

### Prodotti (Pubblico)

| Metodo | Endpoint                 | Auth | Descrizione        |
| ------ | ------------------------ | ---- | ------------------ |
| GET    | `/api/prodotti.php`      | No   | Lista prodotti     |
| GET    | `/api/prodotti.php?id=N` | No   | Dettaglio prodotto |

### Gestione Utenti (Admin)

| Metodo | Endpoint                     | Auth  | Descrizione            |
| ------ | ---------------------------- | ----- | ---------------------- |
| GET    | `/api/admin/utenti.php`      | Admin | Lista utenti           |
| GET    | `/api/admin/utenti.php?id=N` | Admin | Dettaglio utente       |
| PATCH  | `/api/admin/utenti.php`      | Admin | Modifica ruolo/blocked |
| DELETE | `/api/admin/utenti.php`      | Admin | Elimina utente         |

### Gestione Prodotti (Admin)

| Metodo | Endpoint                       | Auth  | Descrizione        |
| ------ | ------------------------------ | ----- | ------------------ |
| GET    | `/api/admin/prodotti.php`      | Admin | Lista prodotti     |
| GET    | `/api/admin/prodotti.php?id=N` | Admin | Dettaglio prodotto |
| POST   | `/api/admin/prodotti.php`      | Admin | Crea prodotto      |
| PATCH  | `/api/admin/prodotti.php`      | Admin | Aggiorna prodotto  |
| DELETE | `/api/admin/prodotti.php`      | Admin | Elimina prodotto   |

---

## ✅ Status Codes

- **200** - OK
- **201** - Created
- **400** - Bad Request (dati non validi)
- **401** - Unauthorized (non autenticato)
- **403** - Forbidden (non autorizzato)
- **404** - Not Found
- **405** - Method Not Allowed
- **500** - Internal Server Error

---

## 🔄 Retrocompatibilità

I seguenti file sono **deprecati** ma funzionano ancora (alias ai nuovi endpoint):

- `check_session.php` → `/api/me.php`
- `update_profile.php` → `/api/me.php`
- `admin_utenti.php` → `/api/admin/utenti.php`
- `admin_prodotti.php` → `/api/admin/prodotti.php`
- `get_prodotti.php` → `/api/prodotti.php`

**Consiglio:** Aggiorna il frontend per usare i nuovi percorsi `/api/*`.

---

## 🧪 Testing

### Verifica Sintassi PHP

```bash
/Applications/XAMPP/xamppfiles/bin/php -l api/me.php
/Applications/XAMPP/xamppfiles/bin/php -l api/prodotti.php
/Applications/XAMPP/xamppfiles/bin/php -l api/admin/utenti.php
/Applications/XAMPP/xamppfiles/bin/php -l api/admin/prodotti.php
```

### Test Automatico

```bash
./test_api.sh
```

---

## 💡 Best Practices Implementate

✅ **Separazione Model/Controller** - Classi contengono solo logica di dominio  
✅ **Risposte JSON standardizzate** - Formato uniforme con `Response::`  
✅ **Autenticazione centralizzata** - Codice riusabile con `Auth::`  
✅ **Validazione input** - Controlli su email, campi obbligatori, tipi  
✅ **Gestione errori** - Try/catch, log errori, messaggi generici  
✅ **Status codes corretti** - Rispetto standard HTTP  
✅ **Documentazione** - Commenti e guide complete

---

## 📝 Note Importanti

### Blocco Utente

Quando un utente viene bloccato (`blocked=1`):

1. Al prossimo `GET /api/me.php` la sessione viene distrutta
2. Il client riceve `{ authenticated: false, blocked: true }`
3. L'utente deve rifare login (che fallirà)

### Protezioni Admin

Gli admin **NON possono**:

- Modificare il proprio account
- Eliminare il proprio account

Questo previene auto-eliminazioni accidentali.

---

## 🔧 Configurazione

### Database Connection

Il file `dbConnection.php` gestisce la connessione PDO al database MySQL.

### Session Configuration

Le sessioni sono gestite tramite `Auth::start()` che controlla se già attiva prima di avviarla.

---

## 📞 Support

Per domande o problemi:

1. Consulta [REFACTORING.md](REFACTORING.md) per dettagli tecnici
2. Consulta [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md) per aggiornare il frontend
3. Verifica log errori in `/Applications/XAMPP/xamppfiles/logs/`

---

## 🎯 Prossimi Passi

1. ✅ Refactoring strutturale completato
2. ⏳ Aggiornare frontend per usare `/api/*`
3. ⏳ Testare tutti i flussi utente
4. ⏳ Eliminare file deprecati dopo test
5. ⏳ Documentazione API OpenAPI/Swagger (opzionale)

---

**Buon lavoro! 🚀**
