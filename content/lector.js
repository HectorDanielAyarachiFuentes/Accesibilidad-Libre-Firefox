function leer(){
 let texto=document.body.innerText;
 let voz=new SpeechSynthesisUtterance(texto);
 voz.lang="es-AR";
 speechSynthesis.cancel();
 speechSynthesis.speak(voz);
}

browser.runtime.onMessage.addListener(msg=>{

 if(msg=="leer"){
  leer();
 }

 if(msg=="oscuro"){
  document.body.classList.toggle("accesibilidad-oscuro");
 }

 if(msg=="grande"){
  document.body.style.fontSize="120%";
 }

 if(msg=="reset"){
  document.body.className="";
  document.body.style="";
 }

});