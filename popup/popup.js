async function enviar(msg){
 const tabs = await browser.tabs.query({active:true,currentWindow:true});
 browser.tabs.sendMessage(tabs[0].id,msg);
}

document.getElementById("leer").onclick=()=>enviar("leer");

document.getElementById("oscuro").onclick=()=>enviar("oscuro");

document.getElementById("grande").onclick=()=>enviar("grande");

document.getElementById("guardar").onclick=async()=>{
 let nombre=document.getElementById("perfil").value || "Invitado";
 await browser.storage.local.set({
   perfil:nombre,
   configuracion:{
    guardado:true
   }
 });
 document.getElementById("estado").innerText="Perfil guardado: "+nombre;
};

document.getElementById("reset").onclick=async()=>{
 await browser.storage.local.clear();
 enviar("reset");
 document.getElementById("estado").innerText="Configuración limpiada";
};

document.getElementById("invitado").onclick=async()=>{
 await browser.storage.local.set({modoInvitado:true});
 document.getElementById("estado").innerText="Modo invitado activado";
};