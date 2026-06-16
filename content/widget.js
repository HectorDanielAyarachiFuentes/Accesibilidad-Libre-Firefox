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
      display: flex;
      align-items: center;
      background: none;
      border: none;
      border-bottom: 1px solid #eee;
      padding: 15px;
      width: 100%;
      text-align: left;
      cursor: pointer;
      font-size: 15px;
      color: #444;
      transition: background 0.3s, color 0.3s;
    }
    .widget-btn:hover {
      background: #f0f8ff;
      color: #0078D7;
    }
    .widget-btn:last-child {
      border-bottom: none;
    }
    .icon-svg {
      width: 22px;
      height: 22px;
      margin-right: 15px;
      fill: currentColor;
      transition: transform 0.3s, fill 0.3s;
    }
    .btn-text {
      flex-grow: 1;
    }
    
    /* Animations */
    @keyframes sound-wave {
      0%, 100% { opacity: 0.3; transform: scale(0.9); }
      50% { opacity: 1; transform: scale(1.1); }
    }
    .widget-btn:hover #svg-speaker-waves,
    .widget-btn.active #svg-speaker-waves {
      animation: sound-wave 1s infinite;
      transform-origin: left center;
    }

    @keyframes rock-moon {
      0%, 100% { transform: rotate(0deg); }
      25% { transform: rotate(-15deg); }
      75% { transform: rotate(15deg); }
    }
    .widget-btn:hover #svg-moon,
    .widget-btn.active #svg-moon {
      animation: rock-moon 2s infinite ease-in-out;
      transform-origin: center;
    }

    @keyframes pulse-screen {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }
    .widget-btn:hover #svg-prompter,
    .widget-btn.active #svg-prompter {
      animation: pulse-screen 1.5s infinite;
      transform-origin: center;
    }

    @keyframes spin-refresh {
      100% { transform: rotate(360deg); }
    }
    .widget-btn:hover #svg-broom {
      animation: spin-refresh 1.5s linear infinite;
      transform-origin: center;
    }

    @keyframes float-icon {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-4px); }
    }
    #toggle-btn:hover svg {
      animation: float-icon 2s infinite ease-in-out;
    }

    /* Active State Colors */
    .widget-btn.active {
      color: #0078D7;
      background: #f0f8ff;
      font-weight: bold;
    }
    .widget-btn.active.danger {
      color: #d9534f;
      background: #fdf0f0;
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
      
      <button class="widget-btn" id="btn-leer">
        <svg viewBox="0 0 24 24" class="icon-svg">
          <path d="M3 9v6h4l5 5V4L7 9H3z"/>
          <g id="svg-speaker-waves">
            <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
            <path d="M14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
          </g>
        </svg>
        <span class="btn-text">Leer página</span>
      </button>

      <button class="widget-btn" id="btn-oscuro">
        <svg viewBox="0 0 24 24" class="icon-svg" id="svg-moon">
          <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-3.03 0-5.5-2.47-5.5-5.5 0-1.82.89-3.42 2.26-4.4C12.92 3.04 12.46 3 12 3z"/>
        </svg>
        <span class="btn-text">Modo oscuro</span>
      </button>

      <button class="widget-btn" id="btn-grande">
        <svg viewBox="0 0 24 24" class="icon-svg" id="svg-prompter">
          <path d="M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h5v2h8v-2h5c1.1 0 1.99-.9 1.99-2L23 5c0-1.1-.9-2-2-2zm0 14H3V5h18v12z"/>
          <rect x="6" y="8" width="12" height="2"/>
          <rect x="6" y="12" width="8" height="2"/>
        </svg>
        <span class="btn-text">Texto grande</span>
      </button>

      <button class="widget-btn" id="btn-reset">
        <svg viewBox="0 0 24 24" class="icon-svg" id="svg-broom">
          <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
        </svg>
        <span class="btn-text">Restablecer</span>
      </button>

    </div>
    <button id="toggle-btn" title="Accesibilidad">
      <svg viewBox="0 0 24 24" style="width: 28px; height: 28px; fill: white;">
        <path d="M12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm9 7h-6v13h-2v-6h-2v6H9V9H3V7h18v2z"/>
      </svg>
    </button>
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
    const textSpan = btnLeer.querySelector('.btn-text');
    if (e.detail) {
      textSpan.innerHTML = 'Detener lectura';
      btnLeer.classList.add('active', 'danger');
    } else {
      textSpan.innerHTML = 'Leer página';
      btnLeer.classList.remove('active', 'danger');
    }
  });

  document.addEventListener('AL_PROMPTER_ESTADO', (e) => {
    const textSpan = btnGrande.querySelector('.btn-text');
    if (e.detail) {
      textSpan.innerHTML = 'Prompter Activo';
      btnGrande.classList.add('active');
    } else {
      textSpan.innerHTML = 'Texto grande';
      btnGrande.classList.remove('active');
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
