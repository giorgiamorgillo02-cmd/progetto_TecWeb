-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Creato il: Nov 28, 2025 alle 17:51
-- Versione del server: 10.4.28-MariaDB
-- Versione PHP: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `artly`
--

-- --------------------------------------------------------

--
-- Struttura della tabella `categorie`
--

CREATE TABLE `categorie` (
  `id` int(11) NOT NULL,
  `nome` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `categorie`
--

INSERT INTO `categorie` (`id`, `nome`) VALUES
(1, 'Minimal'),
(2, 'Geometrici'),
(3, 'Natura');

-- --------------------------------------------------------

--
-- Struttura della tabella `ordini`
--

CREATE TABLE `ordini` (
  `id` int(11) NOT NULL,
  `totale` decimal(10,2) NOT NULL,
  `data` datetime NOT NULL,
  `id_utente` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `ordini`
--

INSERT INTO `ordini` (`id`, `totale`, `data`, `id_utente`) VALUES
(1, 10.00, '2025-11-27 14:11:40', 2),
(2, 52.50, '2025-11-27 14:11:40', 4);

-- --------------------------------------------------------

--
-- Struttura della tabella `posters`
--

CREATE TABLE `posters` (
  `id` int(11) NOT NULL,
  `titolo` varchar(255) NOT NULL,
  `descrizione` text NOT NULL,
  `autore` varchar(50) NOT NULL DEFAULT 'sconosciuto',
  `prezzo` decimal(10,2) NOT NULL,
  `image_path` varchar(255) NOT NULL,
  `id_categoria` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `posters`
--

INSERT INTO `posters` (`id`, `titolo`, `descrizione`, `autore`, `prezzo`, `image_path`, `id_categoria`) VALUES
(6, 'Minimal 1 ', 'minimalminimalminimalminimalminimalminimalminimalminimalminimalminimalminimalminimalminimalminimalminimalminimalminimalminimalminimalminimalminimal', 'sconosciuto', 45.00, 'https://it.pinterest.com/pin/1266706141296134/', 1),
(7, 'Minimal 2 ', 'minimalminimalminimalminimalminimalminimalminimalminimalminimalminimalminimalminimalminimalminimalminimalminimalminimalminimalminimalminimalminimal', 'sconosciuto', 24.00, 'https://it.pinterest.com/pin/483785184993431377/', 1),
(8, 'Minimal 3', 'minimalminimalminimalminimalminimalminimalminimalminimalminimalminimalminimalminimalminimalminimalminimalminimalminimalminimalminimalminimalminimal', 'sconosciuto', 32.99, 'https://it.pinterest.com/pin/78320481016523695/', 1),
(9, 'Minimal 4', 'minimalminimalminimalminimalminimalminimalminimalminimalminimalminimalminimalminimalminimalminimalminimalminimalminimalminimalminimalminimalminimal', 'sconosciuto', 36.50, 'https://it.pinterest.com/pin/10203536651769360/', 1),
(10, 'Minimal 5 ', 'minimalminimalminimalminimalminimalminimalminimalminimalminimalminimalminimalminimalminimalminimalminimalminimalminimalminimalminimalminimalminimal', 'sconosciuto', 50.00, 'https://it.pinterest.com/pin/198580664814628091/', 1),
(11, 'Geometrico 1 ', 'geometricogeometricogeometricogeometricogeometricogeometricogeometricogeometricogeometricogeometricogeometricogeometricogeometrico', 'sconosciuto', 35.70, 'https://it.pinterest.com/pin/18366310976323888/', 2),
(12, 'Geometrico 2', 'geometricogeometricogeometricogeometricogeometricogeometricogeometricogeometricogeometricogeometricogeometricogeometricogeometrico', 'sconosciuto', 46.30, 'https://it.pinterest.com/pin/2533343530074814/', 2),
(13, 'Geometrico 3', 'geometricogeometricogeometricogeometricogeometricogeometricogeometricogeometricogeometricogeometricogeometricogeometricogeometrico', 'sconosciuto', 45.25, 'https://it.pinterest.com/pin/68746488205/', 2),
(14, 'Geometrico 4', 'geometricogeometricogeometricogeometricogeometricogeometricogeometricogeometricogeometricogeometricogeometricogeometricogeometrico', 'sconosciuto', 24.99, 'https://it.pinterest.com/pin/985231164938026/', 2),
(15, 'Geometrico 5', 'geometricogeometricogeometricogeometricogeometricogeometricogeometricogeometricogeometricogeometricogeometricogeometricogeometrico', 'sconosciuto', 50.00, 'https://it.pinterest.com/pin/4081455907522490/', 2),
(26, 'Natura 1 ', 'naturanaturanaturanaturanaturanaturanaturanaturanaturanaturanaturanaturanaturanaturanaturanaturanaturanaturanaturanaturanaturanaturanatura', 'sconosciuto', 15.65, 'https://it.pinterest.com/pin/351912466121105/', 3),
(27, 'Natura 2 ', 'naturanaturanaturanaturanaturanaturanaturanaturanaturanaturanaturanaturanaturanaturanaturanaturanaturanaturanaturanaturanaturanaturanatura', 'sconosciuto', 48.50, 'https://it.pinterest.com/pin/3166662233138729/', 3),
(28, 'Natura 3 ', 'naturanaturanaturanaturanaturanaturanaturanaturanaturanaturanaturanaturanaturanaturanaturanaturanaturanaturanaturanaturanaturanaturanatura', 'sconosciuto', 24.70, 'https://it.pinterest.com/pin/2111131072948814/', 3),
(29, 'Natura 4 ', 'naturanaturanaturanaturanaturanaturanaturanaturanaturanaturanaturanaturanaturanaturanaturanaturanaturanaturanaturanaturanaturanaturanatura', 'sconosciuto', 42.90, 'https://it.pinterest.com/pin/492649953750858/', 3),
(30, 'Natura 5 ', 'naturanaturanaturanaturanaturanaturanaturanaturanaturanaturanaturanaturanaturanaturanaturanaturanaturanaturanaturanaturanaturanaturanatura', 'sconosciuto', 23.00, 'https://it.pinterest.com/pin/422281211345298/', 3);

-- --------------------------------------------------------

--
-- Struttura della tabella `prodottiOrdine`
--

CREATE TABLE `prodottiOrdine` (
  `id` int(11) NOT NULL,
  `id_ordine` int(11) NOT NULL,
  `id_poster` int(11) NOT NULL,
  `prezzo` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `prodottiOrdine`
--

INSERT INTO `prodottiOrdine` (`id`, `id_ordine`, `id_poster`, `prezzo`) VALUES
(1, 1, 12, 45.00),
(2, 1, 8, 15.90),
(3, 2, 29, 30.00);

-- --------------------------------------------------------

--
-- Struttura della tabella `utenti`
--

CREATE TABLE `utenti` (
  `id` int(11) NOT NULL,
  `nome` varchar(50) NOT NULL,
  `cognome` varchar(50) NOT NULL,
  `mail` varchar(80) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `citta` varchar(50) DEFAULT NULL,
  `provincia` varchar(50) DEFAULT NULL,
  `cap` int(5) DEFAULT NULL,
  `via` varchar(80) DEFAULT NULL,
  `ruolo` tinyint(4) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `utenti`
--

INSERT INTO `utenti` (`id`, `nome`, `cognome`, `mail`, `password_hash`, `citta`, `provincia`, `cap`, `via`, `ruolo`) VALUES
(1, 'admin', 'admin', 'admin@', '000', '', '', 0, '', 1),
(2, 'Mario ', 'Rossi', 'mariorossi@gmail.com', '111', '', '', 0, '', 0),
(3, 'paola ', 'bianchi', 'paolabianchi@gmail.com', '111', '', '', 0, '', 0),
(4, 'serena', 'rosa', 'serenarosa@gmail.com', '111', '', '', 0, '', 0);

--
-- Indici per le tabelle scaricate
--

--
-- Indici per le tabelle `categorie`
--
ALTER TABLE `categorie`
  ADD PRIMARY KEY (`id`);

--
-- Indici per le tabelle `ordini`
--
ALTER TABLE `ordini`
  ADD PRIMARY KEY (`id`),
  ADD KEY `utente_ordine` (`id_utente`);

--
-- Indici per le tabelle `posters`
--
ALTER TABLE `posters`
  ADD PRIMARY KEY (`id`),
  ADD KEY `categoria` (`id_categoria`);

--
-- Indici per le tabelle `prodottiOrdine`
--
ALTER TABLE `prodottiOrdine`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ordine_prodottiOrdine` (`id_ordine`),
  ADD KEY `poster_ordine` (`id_poster`);

--
-- Indici per le tabelle `utenti`
--
ALTER TABLE `utenti`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT per le tabelle scaricate
--

--
-- AUTO_INCREMENT per la tabella `categorie`
--
ALTER TABLE `categorie`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT per la tabella `ordini`
--
ALTER TABLE `ordini`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT per la tabella `posters`
--
ALTER TABLE `posters`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT per la tabella `prodottiOrdine`
--
ALTER TABLE `prodottiOrdine`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT per la tabella `utenti`
--
ALTER TABLE `utenti`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Limiti per le tabelle scaricate
--

--
-- Limiti per la tabella `ordini`
--
ALTER TABLE `ordini`
  ADD CONSTRAINT `utente_ordini` FOREIGN KEY (`id_utente`) REFERENCES `utenti` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Limiti per la tabella `posters`
--
ALTER TABLE `posters`
  ADD CONSTRAINT `categoria_poster` FOREIGN KEY (`id_categoria`) REFERENCES `categorie` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Limiti per la tabella `prodottiOrdine`
--
ALTER TABLE `prodottiOrdine`
  ADD CONSTRAINT `ordine_ordini` FOREIGN KEY (`id_ordine`) REFERENCES `ordini` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `ordine_posters` FOREIGN KEY (`id_poster`) REFERENCES `posters` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
