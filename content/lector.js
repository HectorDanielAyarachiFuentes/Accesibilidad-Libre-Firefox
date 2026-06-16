let currentZoom = 1.0;

function aplicarZoom(zoom) {
  if (zoom === 1.0) {
    document.body.style.fontSize = "";
  } else {
    document.body.style.fontSize = (zoom * 100) + "%";
  }
}

function aplicarModoOscuro(activo) {
  if (activo) {
    document.body.classList.add("accesibilidad-oscuro");
  } else {
    document.body.classList.remove("accesibilidad-oscuro");
  }
}

// Cargar configuración inicial
browser.storage.local.get(['modoOscuro', 'zoomTexto', 'modoLectura']).then(res => {
  if (res.modoOscuro) aplicarModoOscuro(true);
  if (res.zoomTexto) {
    currentZoom = res.zoomTexto;
    aplicarZoom(currentZoom);
  }
  if (res.modoLectura) {
    setModoLectura(true);
  }
});

// Escuchar cambios de otras pestañas o del popup
browser.storage.onChanged.addListener((changes, area) => {
  if (area === 'local') {
    if (changes.modoOscuro !== undefined) {
      aplicarModoOscuro(changes.modoOscuro.newValue === true);
    }
    if (changes.zoomTexto !== undefined) {
      currentZoom = changes.zoomTexto.newValue || 1.0;
      aplicarZoom(currentZoom);
    }
    if (changes.modoLectura !== undefined) {
      setModoLectura(changes.modoLectura.newValue === true);
    }
  }
});

let modoLecturaActivo = false;
let currentHighlightedElement = null;

function leer(texto) {
  if (!texto) return;
  let voz = new SpeechSynthesisUtterance(texto);
  voz.lang = "es-AR";
  speechSynthesis.cancel();
  speechSynthesis.speak(voz);
}

let hoverTimer = null;

function handleMouseOver(e) {
  // Ignoramos el widget y sus hijos
  if (e.target.closest && e.target.closest('#accesibilidad-libre-root')) return;
  
  if (currentHighlightedElement) {
    currentHighlightedElement.classList.remove('al-resalte-lectura');
  }
  currentHighlightedElement = e.target;
  currentHighlightedElement.classList.add('al-resalte-lectura');

  clearTimeout(hoverTimer);
  hoverTimer = setTimeout(() => {
    let texto = currentHighlightedElement.innerText || currentHighlightedElement.textContent;
    leer(texto);
  }, 500);
}

function handleMouseOut(e) {
  clearTimeout(hoverTimer);
  if (currentHighlightedElement) {
    currentHighlightedElement.classList.remove('al-resalte-lectura');
    currentHighlightedElement = null;
  }
}

function setModoLectura(activo) {
  if (modoLecturaActivo === activo) return;
  modoLecturaActivo = activo;
  
  if (modoLecturaActivo) {
    document.body.addEventListener('mouseover', handleMouseOver);
    document.body.addEventListener('mouseout', handleMouseOut);
  } else {
    document.body.removeEventListener('mouseover', handleMouseOver);
    document.body.removeEventListener('mouseout', handleMouseOut);
    clearTimeout(hoverTimer);
    if (currentHighlightedElement) {
      currentHighlightedElement.classList.remove('al-resalte-lectura');
      currentHighlightedElement = null;
    }
    speechSynthesis.cancel(); // detener lectura si se desactiva
  }
  
  document.dispatchEvent(new CustomEvent('AL_LEER_ESTADO', { detail: modoLecturaActivo }));
}

browser.runtime.onMessage.addListener(async msg => {
  if (msg === "leer") {
    let res = await browser.storage.local.get('modoLectura');
    await browser.storage.local.set({ modoLectura: !res.modoLectura });
  }
  if (msg === "oscuro") {
    let res = await browser.storage.local.get('modoOscuro');
    let nuevoEstado = !res.modoOscuro;
    await browser.storage.local.set({ modoOscuro: nuevoEstado });
  }
  if (msg === "grande") {
    let res = await browser.storage.local.get('zoomTexto');
    let zoomActual = res.zoomTexto || 1.0;
    let nuevoZoom = zoomActual + 0.2;
    if (nuevoZoom > 3.0) nuevoZoom = 3.0; // Límite de 300%
    await browser.storage.local.set({ zoomTexto: nuevoZoom });
  }
  if (msg === "reset") {
    await browser.storage.local.remove(['modoOscuro', 'zoomTexto', 'modoLectura']);
  }
});

document.addEventListener("AL_LEER", async () => {
  let res = await browser.storage.local.get('modoLectura');
  await browser.storage.local.set({ modoLectura: !res.modoLectura });
});