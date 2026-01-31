-- Tabella per gestire i preferiti degli utenti
CREATE TABLE IF NOT EXISTS preferiti (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_utente INT NOT NULL,
    id_poster INT NOT NULL,
    data_aggiunta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_utente) REFERENCES utenti(id) ON DELETE CASCADE,
    FOREIGN KEY (id_poster) REFERENCES posters(id) ON DELETE CASCADE,
    UNIQUE KEY unique_preferito (id_utente, id_poster)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
