// Componente Footer - Riutilizzabile in tutta l'applicazione
class FooterComponent {
  //costruisce e restituisce l'html
  render() {
    const currentYear = new Date().getFullYear(); //calcolo dinamico dell'anno corrente

    return `
      <footer class="footer">
        <div class="container footer-inner">
          <div class="footer-column">
            <div class="logo footer-logo">
              <img src="public/assets/img/logo.png" alt="Artly Logo" class="logo-img" />
            </div>
            <p class="footer-text">
              Stampe digitali pensate per chi ama l'immagine, il colore e i dettagli.
            </p>
          </div>

          <div class="footer-column">
            <h4>Link utili</h4>
            <ul>
              <li><a href="#" data-link>FAQ</a></li>
              <li><a href="#" data-link>Spedizioni &amp; Resi</a></li>
              <li><a href="#" data-link>Metodi di pagamento</a></li>
            </ul>
          </div>

          <div class="footer-column">
            <h4>Contatti</h4>
            <ul>
              <li><a href="mailto:info@artly.it">info@artly.it</a></li>
              <li><a href="#">Instagram</a></li>
              <li><a href="#">Behance</a></li>
            </ul>
          </div>
        </div>

        <div class="container footer-bottom">
          <p>© ${currentYear} Artly. Tutti i diritti riservati.</p>
          <div class="footer-bottom-links">
            <a href="#" data-link>Privacy</a>
            <a href="#" data-link>Cookie</a>
            <a href="#" data-link>Termini</a>
          </div>
        </div>
          <div id="toast" class="toast"></div>
      </footer>
    `;
  }
}
//div toast -> permette di visualizzare toast in tutte le pagine dove è contenuto l'oggetto footer

// Esporta direttamente oggetto creato
const footerComponent = new FooterComponent();
