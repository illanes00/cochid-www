(()=>{
  const estado=document.querySelector('[data-hilo-estado]');
  async function copiar(texto,control){
    try{await navigator.clipboard.writeText(texto);estado.textContent='Texto copiado.';}
    catch{if(control){control.focus();control.select();}estado.textContent='Selecciona el texto y cópialo con el menú de tu dispositivo. También puedes descargar el hilo completo.';}
  }
  for(const boton of document.querySelectorAll('[data-copiar-tweet]'))boton.addEventListener('click',()=>{const control=document.getElementById(boton.dataset.copiarTweet);copiar(control.value,control);});
  document.querySelector('[data-copiar-hilo]')?.addEventListener('click',()=>copiar([...document.querySelectorAll('.hilo-item textarea')].map(t=>t.value).join('\n\n')));
})();
