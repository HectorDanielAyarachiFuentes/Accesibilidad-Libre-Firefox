async function enviar(msg){
 const tabs = await browser.tabs.query({active:true,currentWindow:true});
 if (tabs.length > 0) {
   browser.tabs.sendMessage(tabs[0].id,msg);
 }
}

document.getElementById("leer").onclick=()=>enviar("leer");
document.getElementById("oscuro").onclick=()=>enviar("oscuro");
document.getElementById("grande").onclick=()=>enviar("grande");

function actualizarSelect(perfilesGuardados, activo) {
  let select = document.getElementById("lista-perfiles");
  select.innerHTML = '<option value="">-- Nuevo Perfil / Seleccionar --</option>';
  for (let nombre in perfilesGuardados) {
    let opt = document.createElement("option");
    opt.value = nombre;
    opt.textContent = nombre;
    if (nombre === activo) opt.selected = true;
    select.appendChild(opt);
  }
}

// Cargar estado inicial al abrir el popup
browser.storage.local.get(['perfil', 'perfiles']).then(res => {
  let perfiles = res.perfiles || {};
  let perfilActual = res.perfil || "";
  
  actualizarSelect(perfiles, perfilActual);
  
  if (perfilActual && perfilActual !== "Invitado") {
    document.getElementById("perfil").value = perfilActual;
    document.getElementById("estado").innerText = "Perfil guardado: " + perfilActual;
  } else {
    document.getElementById("estado").innerText = "Perfil actual: Invitado";
  }
});

// Al seleccionar un perfil de la lista
document.getElementById("lista-perfiles").addEventListener("change", async (e) => {
  let seleccionado = e.target.value;
  if (!seleccionado) return; // Si vuelve a "Seleccionar"
  
  let res = await browser.storage.local.get(['perfiles']);
  let perfiles = res.perfiles || {};
  
  if (perfiles[seleccionado]) {
    let conf = perfiles[seleccionado];
    await browser.storage.local.set({
      perfil: seleccionado,
      filtroVisual: conf.filtroVisual || 'normal',
      prompterActivo: conf.prompterActivo || false,
      modoLectura: conf.modoLectura || false
    });
    document.getElementById("perfil").value = seleccionado;
    document.getElementById("estado").innerText = "Perfil cargado: " + seleccionado;
  }
});

document.getElementById("guardar").onclick=async()=>{
 let nombre = document.getElementById("perfil").value.trim();
 if (!nombre) {
   document.getElementById("estado").innerText = "Escribe un nombre primero.";
   return;
 }
 
 let res = await browser.storage.local.get(['perfiles', 'filtroVisual', 'prompterActivo', 'modoLectura']);
 let perfiles = res.perfiles || {};
 
 // Guardar la foto de las configuraciones actuales
 perfiles[nombre] = {
   filtroVisual: res.filtroVisual || 'normal',
   prompterActivo: res.prompterActivo || false,
   modoLectura: res.modoLectura || false
 };
 
 await browser.storage.local.set({ 
   perfiles: perfiles,
   perfil: nombre 
 });
 
 actualizarSelect(perfiles, nombre);
 document.getElementById("estado").innerText="Perfil guardado: " + nombre;
};

document.getElementById("reset").onclick=async()=>{
 await browser.storage.local.remove(['filtroVisual', 'prompterActivo', 'modoLectura']);
 enviar("reset");
 document.getElementById("estado").innerText="Accesibilidad restablecida";
};

document.getElementById("invitado").onclick=async()=>{
 await browser.storage.local.remove(['perfil', 'filtroVisual', 'prompterActivo', 'modoLectura']);
 document.getElementById("perfil").value = "";
 document.getElementById("lista-perfiles").value = "";
 document.getElementById("estado").innerText="Modo invitado activado";
 enviar("reset");
};