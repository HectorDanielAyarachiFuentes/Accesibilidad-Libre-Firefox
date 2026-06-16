// content/widget.js

(function() {
  // Prevent multiple injections
  if (document.getElementById('accesibilidad-libre-root')) return;

  const container = document.createElement('div');
  container.id = 'accesibilidad-libre-root';
  // Attach to body
  document.body.appendChild(container);

  // Attach Shadow DOM
  const shadow = container.attachShadow({ mode: 'open' });

  // CSS for the widget
  const style = document.createElement('style');
  style.textContent = `
    :host {
      all: initial; /* Reset all styles to prevent leaking from host */
    }
    #widget-wrapper {
      position: fixed;
      top: 20vh;
      left: -260px; /* Panel hidden, but button visible */
      width: max-content;
      height: auto;
      z-index: 2147483647;
      display: flex;
      flex-direction: row;
      align-items: flex-start;
      transition: left 0.3s ease-in-out;
      font-family: Arial, sans-serif;
    }
    #widget-wrapper.open {
      left: 0;
    }
    #panel {
      width: 260px;
      flex-shrink: 0;
      background: #ffffff;
      box-shadow: 2px 0 10px rgba(0,0,0,0.2);
      border-radius: 0 0 10px 0;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    #panel-header {
      background: #0078D7;
      color: white;
      padding: 15px;
      font-weight: bold;
      text-align: center;
      font-size: 14px;
    }
    .widget-btn {
      background: none;
      border: none;
      border-bottom: 1px solid #eee;
      padding: 15px;
      width: 100%;
      text-align: left;
      cursor: pointer;
      font-size: 14px;
      color: #333;
      transition: background 0.2s;
    }
    .widget-btn:hover {
      background: #f0f8ff;
    }
    .widget-btn:last-child {
      border-bottom: none;
    }
    #toggle-btn {
      width: 50px;
      height: 50px;
      background: #0078D7;
      color: white;
      border: none;
      border-radius: 0 10px 10px 0;
      cursor: pointer;
      box-shadow: 2px 0 5px rgba(0,0,0,0.2);
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 28px;
    }
    #prompter {
      position: fixed;
      bottom: 5vh;
      left: 50%;
      transform: translateX(-50%);
      width: 90vw;
      max-height: 40vh;
      background: rgba(0, 0, 0, 0.95);
      color: #FFD700;
      font-size: 40px;
      font-weight: bold;
      text-align: center;
      z-index: 2147483647;
      display: none;
      line-height: 1.5;
      box-sizing: border-box;
      border-radius: 20px;
      transition: all 0.3s ease-in-out;
    }
    #prompter.fullscreen {
      top: 0;
      bottom: 0;
      left: 0;
      transform: none;
      width: 100vw;
      height: 100vh;
      max-height: 100vh;
      border-radius: 0;
      font-size: 55px;
    }
    #prompter-text {
      width: 100%;
      height: 100%;
      padding: 60px 40px;
      box-sizing: border-box;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: center;
      scroll-behavior: smooth;
    }
    .palabra-activa {
      background-color: #FFD700;
      color: #000;
      border-radius: 8px;
      padding: 2px 5px;
      transition: background-color 0.1s, color 0.1s;
    }
    #prompter.fullscreen #prompter-text {
      padding: 80px 10vw;
    }
    .prompter-controls {
      position: absolute;
      top: 15px;
      right: 20px;
      display: flex;
      gap: 15px;
      z-index: 10;
    }
    .prompter-btn {
      background: rgba(255, 255, 255, 0.1);
      border: 2px solid rgba(255, 255, 255, 0.3);
      color: #fff;
      font-size: 24px;
      width: 50px;
      height: 50px;
      border-radius: 25px;
      cursor: pointer;
      opacity: 0.8;
      transition: all 0.2s;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .prompter-btn:hover {
      opacity: 1;
      background: #d9534f;
      border-color: #d9534f;
      transform: scale(1.1);
    }
  `;

  // HTML structure
  const wrapper = document.createElement('div');
  wrapper.id = 'widget-wrapper';
  wrapper.innerHTML = `
    <div id="panel">
      <div id="panel-header">HERRAMIENTAS</div>
      <button class="widget-btn" id="btn-leer">🔊 Leer página</button>
      <button class="widget-btn" id="btn-oscuro">🌙 Modo oscuro</button>
      <button class="widget-btn" id="btn-grande">A+ Texto grande</button>
      <button class="widget-btn" id="btn-reset">🧹 Restablecer</button>
    </div>
    <button id="toggle-btn" title="Accesibilidad">♿</button>
  `;

  const prompterDiv = document.createElement('div');
  prompterDiv.id = 'prompter';

  const controlsDiv = document.createElement('div');
  controlsDiv.className = 'prompter-controls';

  const expandBtn = document.createElement('button');
  expandBtn.className = 'prompter-btn';
  expandBtn.innerHTML = '⛶';
  expandBtn.title = 'Pantalla Completa';

  const closeBtn = document.createElement('button');
  closeBtn.className = 'prompter-btn';
  closeBtn.innerHTML = '✖';
  closeBtn.title = 'Cerrar (Esc)';
  
  controlsDiv.appendChild(expandBtn);
  controlsDiv.appendChild(closeBtn);

  const textDiv = document.createElement('div');
  textDiv.id = 'prompter-text';

  prompterDiv.appendChild(controlsDiv);
  prompterDiv.appendChild(textDiv);

  shadow.appendChild(style);
  shadow.appendChild(wrapper);
  shadow.appendChild(prompterDiv);

  // Logic
  const toggleBtn = shadow.getElementById('toggle-btn');
  const btnLeer = shadow.getElementById('btn-leer');
  const btnOscuro = shadow.getElementById('btn-oscuro');
  const btnGrande = shadow.getElementById('btn-grande');
  const btnReset = shadow.getElementById('btn-reset');

  toggleBtn.addEventListener('click', () => {
    wrapper.classList.toggle('open');
  });

  btnLeer.addEventListener('click', () => {
    document.dispatchEvent(new CustomEvent('AL_LEER'));
  });

  btnOscuro.addEventListener('click', async () => {
    let res = await browser.storage.local.get('modoOscuro');
    await browser.storage.local.set({ modoOscuro: !res.modoOscuro });
  });

  btnGrande.addEventListener('click', () => {
    document.dispatchEvent(new CustomEvent('AL_GRANDE'));
  });

  btnReset.addEventListener('click', async () => {
    await browser.storage.local.remove(['modoOscuro', 'zoomTexto']);
  });

  document.addEventListener('AL_LEER_ESTADO', (e) => {
    if (e.detail) {
      btnLeer.innerHTML = '⏹️ Detener lectura';
      btnLeer.style.color = '#d9534f';
      btnLeer.style.fontWeight = 'bold';
    } else {
      btnLeer.innerHTML = '🔊 Leer página';
      btnLeer.style.color = '#333';
      btnLeer.style.fontWeight = 'normal';
    }
  });

  document.addEventListener('AL_PROMPTER_ESTADO', (e) => {
    if (e.detail) {
      btnGrande.innerHTML = '✅ Prompter Activo';
      btnGrande.style.color = '#5cb85c';
      btnGrande.style.fontWeight = 'bold';
    } else {
      btnGrande.innerHTML = 'A+ Texto grande';
      btnGrande.style.color = '#333';
      btnGrande.style.fontWeight = 'normal';
    }
  });

  let textoActual = "";

  function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
      tag => ({
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          "'": '&#39;',
          '"': '&quot;'
      }[tag])
    );
  }

  document.addEventListener('AL_MOSTRAR_PROMPTER', (e) => {
    textoActual = e.detail;
    textDiv.innerText = textoActual;
    prompterDiv.style.display = 'block';
  });

  document.addEventListener('AL_LEER_PALABRA', (e) => {
    if (!textoActual) return;
    const { charIndex, charLength } = e.detail;
    
    // Evitar errores si el índice está fuera de rango
    if (charIndex >= textoActual.length) return;

    const pre = escapeHTML(textoActual.substring(0, charIndex));
    const word = escapeHTML(textoActual.substring(charIndex, charIndex + charLength));
    const post = escapeHTML(textoActual.substring(charIndex + charLength));
    
    textDiv.innerHTML = `${pre}<span class="palabra-activa">${word}</span>${post}`;
    
    const span = textDiv.querySelector('.palabra-activa');
    if (span) {
      // Auto-scroll centrado suave
      textDiv.scrollTo({
        top: span.offsetTop - (textDiv.clientHeight / 2) + (span.clientHeight / 2),
        behavior: 'smooth'
      });
    }
  });

  document.addEventListener('AL_OCULTAR_PROMPTER', () => {
    prompterDiv.style.display = 'none';
  });

  let isFullscreen = false;
  expandBtn.addEventListener('click', () => {
    isFullscreen = !isFullscreen;
    if (isFullscreen) {
      prompterDiv.classList.add('fullscreen');
      expandBtn.innerHTML = '🗗';
      expandBtn.title = 'Minimizar (Modo Subtítulo)';
    } else {
      prompterDiv.classList.remove('fullscreen');
      expandBtn.innerHTML = '⛶';
      expandBtn.title = 'Pantalla Completa';
    }
  });

  closeBtn.addEventListener('click', () => {
    document.dispatchEvent(new CustomEvent('AL_OCULTAR_PROMPTER_MANUAL'));
  });

})();
