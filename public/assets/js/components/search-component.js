// CREA BARRA DI RICERCA NELLA HEADER (riutilizzabile)
function createSearchDropdown() {
  return `
    <div class="search-dropdown-wrapper">
      <button class="icon-btn" id="searchBtn" aria-label="Cerca">🔍</button>
      <div class="search-dropdown" id="searchDropdown">
        <input 
          type="text" 
          id="globalSearchInput" 
          placeholder="Cerca prodotti..." 
          class="search-dropdown-input"
        />
        <div class="search-results" id="searchResults">
          <p class="search-placeholder">Inizia a digitare per cercare...</p>
        </div>
      </div>
    </div>
  `;
}

// INIZIALIZZA LA BARRA DI RICERCA
function initSearchDropdownComponent() {
  //trova tutti i pulsanti di ricerca
  const searchButtons = document.querySelectorAll(
    '.icon-btn[aria-label="Cerca"]',
  );

  //cila sui bottoni trovati prima
  searchButtons.forEach((btn) => {
    //se pulante ha gia classe wrapper -> esce
    if (btn.parentElement.classList.contains("search-dropdown-wrapper")) {
      return;
    }

    //se pulante non ha classe wrapper -> crea elemento
    const wrapper = document.createElement("div");
    wrapper.className = "search-dropdown-wrapper";

    // Sostituisci il pulsante con il wrapper che contiene il pulsante e il dropdown
    btn.parentNode.insertBefore(wrapper, btn);
    wrapper.appendChild(btn);

    // Aggiungi il dropdown HTML (appena prima la chiusura del div)
    wrapper.insertAdjacentHTML(
      "beforeend",
      `
      <div class="search-dropdown" id="searchDropdown">
        <input 
          type="text" 
          id="globalSearchInput" 
          placeholder="Cerca prodotti..." 
          class="search-dropdown-input"
        />
        <div class="search-results" id="searchResults">
          <p class="search-placeholder">Inizia a digitare per cercare...</p>
        </div>
      </div>
    `,
    );
  });
}

// INIZIALIZZA (solo quando è stato caricato tutto l'HTML)
document.addEventListener("DOMContentLoaded", () => {
  initSearchDropdownComponent();
});
