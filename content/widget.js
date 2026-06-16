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
      --prompter-bg: rgba(0, 0, 0, 0.95);
      --prompter-color: #FFD700;
      --prompter-font-size: 40px;
      --palabra-bg: #FFD700;
      --palabra-color: #000;
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

    /* Submenu Settings */
    .btn-settings {
      background: none;
      border: none;
      cursor: pointer;
      padding: 0 15px;
      color: #777;
      border-left: 1px solid #eee;
    }
    .btn-settings:hover {
      color: #0078D7;
      background: #f0f8ff;
    }
    .submenu {
      background: #fafafa;
      border-bottom: 1px solid #eee;
      padding: 0 15px;
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.3s ease-in-out, padding 0.3s ease-in-out;
    }
    .submenu.open {
      max-height: 200px;
      padding: 15px;
    }
    .submenu-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
      font-size: 13px;
      color: #555;
    }
    .submenu-row:last-child {
      margin-bottom: 0;
    }
    .btn-group {
      display: flex;
      gap: 8px;
      align-items: center;
    }
    .icon-btn {
      width: 28px;
      height: 28px;
      border: 1px solid #ccc;
      background: white;
      border-radius: 4px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      color: #333;
    }
    .icon-btn:hover {
      background: #e0e0e0;
    }
    .color-btn {
      width: 28px;
      height: 28px;
      border: 1px solid #ccc;
      border-radius: 4px;
      cursor: pointer;
      font-weight: bold;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .color-btn.selected {
      border: 2px solid #0078D7;
      transform: scale(1.1);
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
      background: var(--prompter-bg);
      color: var(--prompter-color);
      font-size: var(--prompter-font-size);
      font-weight: bold;
      text-align: center;
      z-index: 2147483647;
      display: none;
      line-height: 1.5;
      box-sizing: border-box;
      border-radius: 20px;
      transition: all 0.3s ease-in-out, font-size 0.2s;
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
      font-size: calc(var(--prompter-font-size) * 1.375);
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
      background-color: var(--palabra-bg);
      color: var(--palabra-color);
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

      <div style="display:flex; border-bottom: 1px solid #eee;">
        <button class="widget-btn" id="btn-grande" style="border-bottom:none;">
          <svg viewBox="0 0 24 24" class="icon-svg" id="svg-prompter">
            <path d="M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h5v2h8v-2h5c1.1 0 1.99-.9 1.99-2L23 5c0-1.1-.9-2-2-2zm0 14H3V5h18v12z"/>
            <rect x="6" y="8" width="12" height="2"/>
            <rect x="6" y="12" width="8" height="2"/>
          </svg>
          <span class="btn-text">Texto grande</span>
        </button>
        <button id="btn-prompter-settings" class="btn-settings" title="Ajustes de Lectura">
          <svg viewBox="0 0 24 24" class="icon-svg" style="margin:0;">
             <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.06-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.73,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.06,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.43-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.49-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
          </svg>
        </button>
      </div>

      <!-- Panel de Opciones del Prompter -->
      <div id="prompter-options" class="submenu hidden">
        <div class="submenu-row">
          <span>Tamaño de Letra:</span>
          <div class="btn-group">
            <button id="btn-font-minus" class="icon-btn">-</button>
            <span id="font-size-label">40px</span>
            <button id="btn-font-plus" class="icon-btn">+</button>
          </div>
        </div>
        <div class="submenu-row">
          <span>Tema de Color:</span>
          <div class="btn-group">
            <button class="color-btn" data-theme="yellow" style="background:#000; color:#FFD700;">A</button>
            <button class="color-btn" data-theme="white" style="background:#000; color:#FFF;">A</button>
            <button class="color-btn" data-theme="black" style="background:#FFF; color:#000;">A</button>
            <button class="color-btn" data-theme="green" style="background:#000; color:#0F0;">A</button>
          </div>
        </div>
      </div>

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

  // --- Prompter Settings Logic ---
  const btnPrompterSettings = shadow.getElementById('btn-prompter-settings');
  const prompterOptions = shadow.getElementById('prompter-options');
  const btnFontMinus = shadow.getElementById('btn-font-minus');
  const btnFontPlus = shadow.getElementById('btn-font-plus');
  const fontLabel = shadow.getElementById('font-size-label');
  const colorBtns = shadow.querySelectorAll('.color-btn');

  let currentFontSize = 40;
  let currentTheme = 'yellow';

  const themes = {
    'yellow': { bg: 'rgba(0, 0, 0, 0.95)', color: '#FFD700', activeBg: '#FFD700', activeColor: '#000' },
    'white': { bg: 'rgba(0, 0, 0, 0.95)', color: '#FFFFFF', activeBg: '#FFFFFF', activeColor: '#000' },
    'black': { bg: 'rgba(255, 255, 255, 0.95)', color: '#000000', activeBg: '#000000', activeColor: '#FFF' },
    'green': { bg: 'rgba(0, 0, 0, 0.95)', color: '#00FF00', activeBg: '#00FF00', activeColor: '#000' }
  };

  btnPrompterSettings.addEventListener('click', () => {
    prompterOptions.classList.toggle('open');
  });

  function applySettings() {
    fontLabel.innerText = currentFontSize + 'px';
    container.style.setProperty('--prompter-font-size', currentFontSize + 'px');
    
    const theme = themes[currentTheme];
    if (theme) {
      container.style.setProperty('--prompter-bg', theme.bg);
      container.style.setProperty('--prompter-color', theme.color);
      container.style.setProperty('--palabra-bg', theme.activeBg);
      container.style.setProperty('--palabra-color', theme.activeColor);
    }

    colorBtns.forEach(btn => {
      if (btn.dataset.theme === currentTheme) btn.classList.add('selected');
      else btn.classList.remove('selected');
    });

    // Guardar
    browser.storage.local.set({
      prompterSettings: { fontSize: currentFontSize, theme: currentTheme }
    });
  }

  btnFontMinus.addEventListener('click', () => {
    if (currentFontSize > 20) {
      currentFontSize -= 5;
      applySettings();
    }
  });

  btnFontPlus.addEventListener('click', () => {
    if (currentFontSize < 100) {
      currentFontSize += 5;
      applySettings();
    }
  });

  colorBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      currentTheme = btn.dataset.theme;
      applySettings();
    });
  });

  // Load initial settings
  browser.storage.local.get('prompterSettings').then(res => {
    if (res.prompterSettings) {
      currentFontSize = res.prompterSettings.fontSize || 40;
      currentTheme = res.prompterSettings.theme || 'yellow';
      applySettings();
    }
  });

})();
