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

  shadow.appendChild(style);
  shadow.appendChild(wrapper);

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

  btnGrande.addEventListener('click', async () => {
    let res = await browser.storage.local.get('zoomTexto');
    let zoomActual = res.zoomTexto || 1.0;
    let nuevoZoom = zoomActual + 0.2;
    if (nuevoZoom > 3.0) nuevoZoom = 3.0;
    await browser.storage.local.set({ zoomTexto: nuevoZoom });
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

})();
