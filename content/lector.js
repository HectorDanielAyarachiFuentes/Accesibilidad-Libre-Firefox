let prompterActivo = false;

function aplicarModoOscuro(activo) {
  if (typeof DarkReader !== 'undefined') {
    if (activo) {
      DarkReader.enable({
        brightness: 100,
        contrast: 90,
        sepia: 10
      });
    } else {
      DarkReader.disable();
    }
  } else {
    console.error("DarkReader no está cargado.");
  }
}

// Cargar configuración inicial
browser.storage.local.get(['modoOscuro', 'prompterActivo', 'modoLectura']).then(res => {
  if (res.modoOscuro) aplicarModoOscuro(true);
  if (res.prompterActivo) {
    prompterActivo = true;
    document.dispatchEvent(new CustomEvent('AL_PROMPTER_ESTADO', { detail: true }));
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
    if (changes.prompterActivo !== undefined) {
      prompterActivo = changes.prompterActivo.newValue === true;
      document.dispatchEvent(new CustomEvent('AL_PROMPTER_ESTADO', { detail: prompterActivo }));
      if (!prompterActivo) {
        document.dispatchEvent(new CustomEvent('AL_OCULTAR_PROMPTER'));
      }
    }
    if (changes.modoLectura !== undefined) {
      setModoLectura(changes.modoLectura.newValue === true);
    }
  }
});

let modoLecturaActivo = false;
let currentHighlightedElement = null;
let textNodesMapping = [];

function extractTextAndMap(element) {
  let text = "";
  textNodesMapping = [];
  let walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, {
    acceptNode: function(node) {
      let parent = node.parentNode;
      if (parent && ['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(parent.tagName)) return NodeFilter.FILTER_REJECT;
      // Skip text nodes with only whitespace to keep TTS clean
      if (node.nodeValue.trim() === '') return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }
  }, false);
  
  let node;
  while ((node = walker.nextNode())) {
    let nodeText = node.nodeValue;
    // Add a space if needed to separate blocks
    if (text.length > 0 && !text.endsWith(' ') && !nodeText.startsWith(' ')) {
      text += ' ';
    }
    let start = text.length;
    text += nodeText;
    textNodesMapping.push({
      node: node,
      start: start,
      end: text.length
    });
  }
  return text;
}

function highlightWordOnPage(charIndex, charLength) {
  if (!CSS.highlights) return;
  
  let targetStart = charIndex;
  let targetEnd = charIndex + charLength;

  let startNodeInfo = null;
  let endNodeInfo = null;

  for (let mapping of textNodesMapping) {
    if (!startNodeInfo && targetStart >= mapping.start && targetStart < mapping.end) {
      startNodeInfo = mapping;
    }
    if (!endNodeInfo && targetEnd > mapping.start && targetEnd <= mapping.end) {
      endNodeInfo = mapping;
    }
    if (startNodeInfo && endNodeInfo) break;
  }

  // Fallback if it ends exactly at the node boundary
  if (!endNodeInfo) {
     for (let mapping of textNodesMapping) {
       if (targetEnd === mapping.end) {
         endNodeInfo = mapping;
         break;
       }
     }
  }

  if (startNodeInfo && endNodeInfo) {
    try {
      let range = new Range();
      range.setStart(startNodeInfo.node, targetStart - startNodeInfo.start);
      range.setEnd(endNodeInfo.node, targetEnd - endNodeInfo.start);
      
      let highlight = new Highlight(range);
      CSS.highlights.set('al-karaoke', highlight);
    } catch(e) {
      console.log("Error en karaoke:", e);
    }
  }
}

function clearHighlightOnPage() {
  if (CSS.highlights) {
    CSS.highlights.delete('al-karaoke');
  }
}

function leer(texto) {
  if (!texto) return;
  let voz = new SpeechSynthesisUtterance(texto);
  voz.lang = "es-AR";
  
  voz.addEventListener('boundary', (e) => {
    if (e.name === 'word') {
      let length = e.charLength;
      if (!length) { // Firefox fallback
        const remaining = texto.substring(e.charIndex);
        const match = remaining.match(/^[\wáéíóúñÁÉÍÓÚÑ]+/);
        length = match ? match[0].length : 1;
      }
      
      highlightWordOnPage(e.charIndex, length);

      document.dispatchEvent(new CustomEvent('AL_LEER_PALABRA', {
        detail: {
          charIndex: e.charIndex,
          charLength: length
        }
      }));
    }
  });

  speechSynthesis.cancel();
  speechSynthesis.speak(voz);
}

let hoverTimer = null;

function handleMouseOver(e) {
  // Ignoramos el widget y sus hijos
  if (e.target.closest && e.target.closest('#accesibilidad-libre-root')) return;
  
  // Buscar el contenedor padre de texto más cercano
  let blockTarget = e.target.closest('p, h1, h2, h3, h4, h5, h6, li, blockquote, figcaption');
  let newTarget = blockTarget || e.target;

  // Evitar seleccionar contenedores estructurales masivos (ej: grillas, columnas, la página entera)
  if (!blockTarget) {
    // Si el elemento sobre el que está el ratón (ej: un div genérico o el fondo)
    // contiene párrafos o títulos por dentro, significa que es un contenedor envolvente.
    // Lo ignoramos para obligar a que apunte a un texto específico.
    if (newTarget.querySelector('p, h1, h2, h3, h4, h5, h6, article, section, ul')) {
      return;
    }
    // Si es un contenedor genérico pero tiene demasiado texto (más de 800 letras),
    // asumimos que atrapó múltiples noticias o una sección entera por error.
    let textLen = (newTarget.innerText || newTarget.textContent || "").trim().length;
    if (textLen > 800 || textLen === 0) {
      return;
    }
  }

  // Si seguimos dentro del mismo bloque resaltado o de sus elementos hijos, 
  // no hacemos nada (esto evita por completo los reinicios del audio)
  if (currentHighlightedElement && (currentHighlightedElement === newTarget || currentHighlightedElement.contains(e.target))) {
    return;
  }

  // Si cambiamos de bloque, quitamos el resalte del anterior
  if (currentHighlightedElement) {
    currentHighlightedElement.classList.remove('al-resalte-lectura');
  }
  
  currentHighlightedElement = newTarget;
  currentHighlightedElement.classList.add('al-resalte-lectura');

  clearTimeout(hoverTimer);
  hoverTimer = setTimeout(() => {
    let texto = extractTextAndMap(currentHighlightedElement);
    
    // Mostramos el prompter primero para que ya tenga el texto antes de leer
    if (prompterActivo) {
      document.dispatchEvent(new CustomEvent('AL_MOSTRAR_PROMPTER', { detail: texto }));
    }
    
    leer(texto);
  }, 250);
}

function handleMouseOut(e) {
  // Ignorar si el evento se origina en el widget/prompter
  if (e.target && e.target.closest && e.target.closest('#accesibilidad-libre-root')) return;

  let toElement = e.relatedTarget;
  
  // Ignorar si el ratón se mueve HACIA el widget/prompter
  if (toElement && toElement.closest && toElement.closest('#accesibilidad-libre-root')) {
    return;
  }
  
  // Si el ratón se mueve a un elemento hijo dentro de nuestro mismo bloque, ignoramos la salida.
  if (currentHighlightedElement && toElement && currentHighlightedElement.contains(toElement)) {
    return;
  }

  clearTimeout(hoverTimer);
  if (currentHighlightedElement) {
    currentHighlightedElement.classList.remove('al-resalte-lectura');
    currentHighlightedElement = null;
  }
  clearHighlightOnPage();
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
    clearHighlightOnPage();
    speechSynthesis.cancel();
    document.dispatchEvent(new CustomEvent('AL_OCULTAR_PROMPTER'));
  }
  
  document.dispatchEvent(new CustomEvent('AL_LEER_ESTADO', { detail: modoLecturaActivo }));
}

// Cierre manual desde el widget
document.addEventListener('AL_OCULTAR_PROMPTER_MANUAL', () => {
  clearTimeout(hoverTimer);
  if (currentHighlightedElement) {
    currentHighlightedElement.classList.remove('al-resalte-lectura');
    currentHighlightedElement = null;
  }
  clearHighlightOnPage();
  speechSynthesis.cancel();
  document.dispatchEvent(new CustomEvent('AL_OCULTAR_PROMPTER'));
});

// Cerrar con Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && prompterActivo) {
    document.dispatchEvent(new CustomEvent('AL_OCULTAR_PROMPTER_MANUAL'));
  }
});

browser.runtime.onMessage.addListener(async msg => {
  if (msg === "leer") {
    let res = await browser.storage.local.get('modoLectura');
    await browser.storage.local.set({ modoLectura: !res.modoLectura });
  }
  if (msg === "oscuro") {
    let res = await browser.storage.local.get('modoOscuro');
    await browser.storage.local.set({ modoOscuro: !res.modoOscuro });
  }
  if (msg === "grande") {
    let res = await browser.storage.local.get(['prompterActivo', 'modoLectura']);
    let nuevoEstado = !res.prompterActivo;
    
    // Guardamos el nuevo estado del prompter
    let updates = { prompterActivo: nuevoEstado };
    
    // Si prendemos el prompter y el modo lectura estaba apagado, lo encendemos también
    if (nuevoEstado && !res.modoLectura) {
      updates.modoLectura = true;
    }
    
    await browser.storage.local.set(updates);
    document.dispatchEvent(new CustomEvent('AL_PROMPTER_ESTADO', { detail: nuevoEstado }));
  }
  if (msg === "reset") {
    await browser.storage.local.remove(['modoOscuro', 'prompterActivo', 'modoLectura']);
  }
});

document.addEventListener("AL_LEER", async () => {
  let res = await browser.storage.local.get('modoLectura');
  await browser.storage.local.set({ modoLectura: !res.modoLectura });
});

document.addEventListener("AL_GRANDE", async () => {
  let res = await browser.storage.local.get(['prompterActivo', 'modoLectura']);
  let nuevoEstado = !res.prompterActivo;
  
  let updates = { prompterActivo: nuevoEstado };
  
  if (nuevoEstado && !res.modoLectura) {
    updates.modoLectura = true;
  }
  
  await browser.storage.local.set(updates);
  document.dispatchEvent(new CustomEvent('AL_PROMPTER_ESTADO', { detail: nuevoEstado }));
});