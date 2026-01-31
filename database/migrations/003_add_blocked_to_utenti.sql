-- Aggiunta colonna blocked alla tabella utenti
-- Questa colonna permette di bloccare gli utenti

ALTER TABLE utenti ADD COLUMN blocked TINYINT(1) DEFAULT 0 AFTER ruolo;

-- Commento: 0 = utente attivo, 1 = utente bloccato
