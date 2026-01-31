-- phpMyAdmin SQL Dump
-- version 5.1.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Creato il: Gen 31, 2026 alle 10:38
-- Versione del server: 10.4.21-MariaDB
-- Versione PHP: 8.1.2

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dump dei dati per la tabella `ordini`
--

INSERT INTO `ordini` (`id`, `totale`, `data`, `id_utente`) VALUES
(1, '10.00', '2025-11-27 14:11:40', NULL),
(2, '52.50', '2025-11-27 14:11:40', NULL),
(3, '371.39', '2026-01-18 18:11:33', 6),
(4, '40.60', '2026-01-20 18:25:21', NULL),
(5, '40.60', '2026-01-20 18:29:38', NULL),
(6, '82.99', '2026-01-20 18:51:40', NULL),
(7, '113.98', '2026-01-20 19:01:13', NULL),
(8, '65.98', '2026-01-21 15:12:16', NULL),
(9, '117.49', '2026-01-22 14:46:53', NULL),
(10, '108.00', '2026-01-30 17:45:20', 6);

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dump dei dati per la tabella `posters`
--

INSERT INTO `posters` (`id`, `titolo`, `descrizione`, `autore`, `prezzo`, `image_path`, `id_categoria`) VALUES
(6, 'The Martian', 'L\'infinità dello spazio e la solitudine dell\'esploratore. Una silhouette bianca su un Marte rosso sangue trasforma il celebre film di Ridley Scott in un\'opera di design iconica e potente', 'Olly Moss', '45.00', 'minimal-martian.jpg', 1),
(7, 'Up ', 'La gioia di volare racchiusa in pochi cerchi colorati. Questa composizione astratta dei famosi palloncini di Up è un tocco di colore delicato e nostalgico per ogni stanza della casa.', 'Lara', '24.00', 'minimal-up.jpeg', 1),
(9, 'Forget Everything', 'Un blu profondo che invita alla riflessione. La silhouette di una balena che nuota verso l\'ignoto è accompagnata da un messaggio motivazionale forte: \"Dimentica tutto e ricomincia\", ideale per chi cerca ispirazione e calma.', 'Alari Tammsalu', '36.50', 'minimal-whale.jpeg', 1),
(10, 'No Idea (Pigeon)', 'Ironia urbana catturata in pixel. Questo piccione in stile mezza tinta (halftone) blu su sfondo arancio neon è il manifesto perfetto per chi affronta la vita con un pizzico di umorismo e stile street-art.', 'Alari Tammsalu', '50.00', 'minimal-noidea.jpeg', 1),
(11, 'Bauhaus Composition', 'Un omaggio alla purezza della forma e del colore primario. Questa stampa celebra l\'estetica razionalista della scuola Bauhaus, combinando tipografia audace e geometria essenziale per un pezzo di design senza tempo.', 'Herbert Bayer/', '35.70', 'geometrico-bahaus.jpeg', 2),
(12, 'Forme in Equilibrio', 'Una danza di semicerchi e sfere in tonalità pastello e terra. Un poster che trasmette calma e stabilità attraverso una composizione verticale perfettamente bilanciata, ideale per studi o zone living minimaliste.', 'sconosciuto', '46.30', 'geometrico-forme.jpeg', 2),
(13, 'Fragments', 'Geometria modulare dal carattere forte. Il contrasto netto tra il nero profondo delle forme smussate e il cerchio rosso vibrante crea un punto focale magnetico, perfetto per ambienti moderni e industrial.', 'Matt', '45.25', 'geometrico-rossonero.jpeg', 2),
(14, 'Spirale Ipnotica', 'Una spirale optical in bianco e nero incastonata in un vivace mosaico di colori pop. Un\'opera che cattura lo sguardo e simula il movimento, portando energia e creatività sulle tue pareti.', 'sconosciuto', '24.99', 'geometrico-spirale.png', 2),
(15, 'Composizione Blu', 'Un\'indagine visiva sul blu. Linee sottili e cerchi sovrapposti giocano con le trasparenze e il rigore geometrico, creando una finestra di eleganza astratta e profondità concettuale.', 'sconosciuto', '50.00', 'geometrico-blu.png', 2),
(26, 'Ginkgo Biloba', 'Un tributo alla bellezza senza tempo della natura. Questo poster cattura l\'eleganza minimalista della foglia di Ginkgo attraverso un design geometrico pulito e un giallo vibrante, ideale per portare luce e serenità in ogni ambiente moderno.', 'Matt', '15.65', 'natura-ginko.jpeg', 3),
(28, 'Corallo e Punto Blu', 'Ispirato alle forme organiche del corallo, questo poster gioca con il contrasto tra il calore dell\'arancione e la profondità di un singolo dettaglio blu. Un\'opera minimalista perfetta per chi ama l\'arte astratta ispirata agli oceani.', 'sconosciuto', '24.70', 'natura-corallo.jpeg', 3),
(29, 'Fungo Yayoi Kusama', 'Un\'esplosione di energia e colore ispirata all\'arte iconica di Yayoi Kusama. Trame puntinate, colori pop e un design ipnotico rendono questo poster un pezzo d\'arredo audace, pensato per chi non ha paura di osare con lo stile.', 'Yayoi Kusama', '58.00', 'natura-fungo.jpeg', 3),
(33, 'Nice', 'Quando la semplicità quotidiana diventa arte. Una padella, un pomodoro e una patata sotto un lettering rosso imponente: una stampa ironica e moderna che trasforma la cucina in una galleria d\'arte.', 'Two Sides Studio', '43.00', 'minimal-nice.jpeg', 1),
(35, 'Pesce Astratto', 'Uno stile grafico audace incontra il fascino del mare. Caratterizzato da pennellate nere decise su un fondo blu intenso, questo poster rappresenta il movimento fluido della vita acquatica con un tocco contemporaneo e sofisticato.', 'Lara', '27.50', 'natura-pesce.jpeg', 3);

-- --------------------------------------------------------

--
-- Struttura della tabella `preferiti`
--

CREATE TABLE `preferiti` (
  `id` int(11) NOT NULL,
  `id_utente` int(11) NOT NULL,
  `id_poster` int(11) NOT NULL,
  `data_aggiunta` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dump dei dati per la tabella `preferiti`
--

INSERT INTO `preferiti` (`id`, `id_utente`, `id_poster`, `data_aggiunta`) VALUES
(17, 6, 10, '2026-01-30 16:44:56'),
(19, 6, 29, '2026-01-31 08:34:26');

-- --------------------------------------------------------

--
-- Struttura della tabella `prodottiOrdine`
--

CREATE TABLE `prodottiOrdine` (
  `id` int(11) NOT NULL,
  `id_ordine` int(11) NOT NULL,
  `id_poster` int(11) NOT NULL,
  `prezzo` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dump dei dati per la tabella `prodottiOrdine`
--

INSERT INTO `prodottiOrdine` (`id`, `id_ordine`, `id_poster`, `prezzo`) VALUES
(1, 1, 12, '45.00'),
(3, 2, 29, '30.00'),
(6, 3, 12, '46.30'),
(7, 3, 12, '46.30'),
(8, 3, 12, '46.30'),
(9, 3, 9, '36.50'),
(10, 3, 6, '45.00'),
(12, 3, 7, '24.00'),
(13, 3, 7, '24.00'),
(14, 3, 7, '24.00'),
(15, 4, 11, '35.70'),
(16, 5, 11, '35.70'),
(17, 6, 15, '50.00'),
(21, 7, 7, '24.00'),
(22, 7, 7, '24.00'),
(25, 9, 7, '24.00'),
(26, 9, 7, '24.00'),
(28, 9, 9, '36.50'),
(29, 10, 29, '58.00'),
(30, 10, 10, '50.00');

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
  `citta` varchar(50) NOT NULL,
  `provincia` varchar(2) NOT NULL,
  `cap` int(5) NOT NULL,
  `via` varchar(80) NOT NULL,
  `ruolo` tinyint(4) NOT NULL DEFAULT 0,
  `blocked` tinyint(1) DEFAULT 0,
  `Telefono` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dump dei dati per la tabella `utenti`
--

INSERT INTO `utenti` (`id`, `nome`, `cognome`, `mail`, `password_hash`, `citta`, `provincia`, `cap`, `via`, `ruolo`, `blocked`, `Telefono`) VALUES
(5, 'giorgia', 'morgillo', 'gio@gmail.com', '$2y$10$.NDmnsiY.5EfuPNT0ncicO5HCdL/HLbvs1J/TYRTFDfOsgj52OGpW', 'Venezia', 'VE', 10020, 'Via Verdi, 68', 0, 0, '333321321'),
(6, 'Alessia', 'Franco', 'ale@gmail.com', '$2y$10$vLpBwl7LvYvDim5TrjnDjODKbEx9Hs/FN/6Jp7ruNF1meUje7V/.u', 'Torino', 'TO', 10024, 'Via Trento 19', 1, 0, '356456456'),
(7, 'Serena', 'Rosa', 'serenarosa@gmail.com', '$2y$10$.XLEHKnDnG31UASg2WuC0u98FXLO0wBVWtbR3/giMTAMG8h42n5KS', 'Torino', 'TO', 10800, 'via cernigliara, 24', 0, 0, '333123456'),
(9, 'Cristina', 'gibin', 'cristina@gmail.com', '$2y$10$IfWeYQ/PFzLXz8qTKBtUC.KbOvOjSls0VJEu3OQRWP422dJC8NOq2', 'Torino', 'TO', 10024, 'Via Trento 19', 0, 0, '356456456'),
(10, 'admin', 'admin', 'admin01@gmail.com', '$2y$10$GvKgwEim7oTjnEU/Karz8.X9aV0AFDWndw9m6RJBNCJ0ob/uDfe.G', 'Genova', 'GE', 10024, 'Via Superga 11', 1, 0, '3703224168');

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
-- Indici per le tabelle `preferiti`
--
ALTER TABLE `preferiti`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_preferito` (`id_utente`,`id_poster`),
  ADD KEY `id_poster` (`id_poster`);

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT per la tabella `posters`
--
ALTER TABLE `posters`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=38;

--
-- AUTO_INCREMENT per la tabella `preferiti`
--
ALTER TABLE `preferiti`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT per la tabella `prodottiOrdine`
--
ALTER TABLE `prodottiOrdine`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT per la tabella `utenti`
--
ALTER TABLE `utenti`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

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
-- Limiti per la tabella `preferiti`
--
ALTER TABLE `preferiti`
  ADD CONSTRAINT `preferiti_ibfk_1` FOREIGN KEY (`id_utente`) REFERENCES `utenti` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `preferiti_ibfk_2` FOREIGN KEY (`id_poster`) REFERENCES `posters` (`id`) ON DELETE CASCADE;

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
