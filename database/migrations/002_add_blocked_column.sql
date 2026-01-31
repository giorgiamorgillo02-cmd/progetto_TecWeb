-- Aggiunge la colonna blocked alla tabella utenti per permettere di bloccare gli account
ALTER TABLE `utenti` ADD `blocked` TINYINT(1) NOT NULL DEFAULT '0' AFTER `ruolo`;
