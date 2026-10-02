/* Portada Mezcla v2. (1) Mapa en tres tramos con dos SVG (escritorio y móvil). El cursor solo resalta; se elige con clic o Enter.
   (2) El formulario del hero abre el buscador con el texto escrito. */
(function(){
  var raw=document.getElementById('datos-mapa'); if(!raw) return;
  var D=JSON.parse(raw.textContent);
  var capa='emp', sel=13;
  var $=function(s,r){return (r||document).querySelector(s)};
  var all=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
  function agrupa(n){return String(n).replace(/\B(?=(\d{3})+(?!\d))/g,'.')}
  function fmt(v,d){var s=Math.abs(v).toFixed(d),p=s.split('.');return (v<0?'-':'')+(p[0].length>3?agrupa(p[0]):p[0])+(p[1]?','+p[1]:'')}
  function val(c,v){return fmt(v,D.capas[c].dec)}
  var byId={}; D.regiones.forEach(function(r){byId[r.id]=r});
  var paths={};
  all('.t-mapa .reg').forEach(function(p){(paths[p.dataset.id]=paths[p.dataset.id]||[]).push(p)});
  var box=$('#mapas');
  function pintar(){
    var m=D.capas[capa];
    D.regiones.forEach(function(r){(paths[r.id]||[]).forEach(function(p){p.style.fill='var(--r-'+capa+'-'+r.bin[capa]+')'})});
    box.style.setProperty('--cc','var(--c-'+capa+')');
    $('#mapa-tit').textContent=m.titular;
    $('#mapa-nota').textContent=m.nota;
    var ol=$('#leyenda-ol'); ol.innerHTML='';
    m.cortes.forEach(function(c,i){
      var li=document.createElement('li'), a=fmt(c[0],m.dec), b=fmt(c[1],m.dec);
      li.innerHTML='<i style="background:var(--r-'+capa+'-'+i+')"></i><small>'+(a===b?a:a+' a '+b)+'</small>';
      ol.appendChild(li);
    });
    $('#leyenda-u').textContent=m.unidad+' ('+m.anio+')';
    all('.capa').forEach(function(b){b.setAttribute('aria-pressed',String(b.dataset.capa===capa))});
    ranking(); panel();
  }
  function ranking(){
    var m=D.capas[capa], rs=D.regiones.slice().sort(function(a,b){return b.v[capa]-a.v[capa]});
    var max=rs[0].v[capa], ul=$('#rk'); ul.innerHTML='';
    rs.forEach(function(r){
      var b=document.createElement('button'); b.type='button'; b.dataset.id=r.id;
      b.setAttribute('aria-pressed',String(r.id===sel));
      b.setAttribute('aria-label',r.largo+': '+val(capa,r.v[capa])+' '+m.unidad);
      b.innerHTML='<span>'+r.corto+'</span><span class="b"><i style="width:'+(r.v[capa]/max*100).toFixed(1)+'%"></i></span><em>'+val(capa,r.v[capa])+'</em>';
      b.addEventListener('click',function(){elegir(r.id)});
      ul.appendChild(b);
    });
  }
  function panel(){
    var r=byId[sel], m=D.capas[capa];
    $('#p-nombre').textContent=r.largo;
    $('#p-num').textContent=val(capa,r.v[capa]);
    $('#p-uni').textContent=m.unidad+' ('+m.anio+')';
    $('#p-rango').innerHTML='Puesto <b>'+r.rk[capa]+' de 16</b>';
    var f=r.extra;
    $('#f-emp').textContent=agrupa(f.empresas);
    $('#f-pob').textContent=agrupa(r.v.pob);
    $('#f-pov').textContent=fmt(r.v.pov,1)+' %';
    $('#f-povx').textContent=fmt(f.povext,1)+' %';
    $('#f-den').textContent=agrupa(Math.round(r.v.den));
    $('#f-hac').textContent=fmt(f.hac,0)+' %';
    all('.t-mapa .reg').forEach(function(p){p.classList.toggle('on',+p.dataset.id===sel)});
    all('.t-mapa .rl').forEach(function(t){t.classList.toggle('on',+t.dataset.id===sel)});
    (paths[sel]||[]).forEach(function(p){if(p.parentNode.lastChild!==p) p.parentNode.appendChild(p)});
    all('#rk button').forEach(function(b){b.setAttribute('aria-pressed',String(+b.dataset.id===sel))});
  }
  function elegir(id){sel=+id;panel()}
  all('.capa').forEach(function(b){b.addEventListener('click',function(){capa=b.dataset.capa;pintar()})});
  all('.t-mapa .reg').forEach(function(p){
    p.addEventListener('click',function(){elegir(p.dataset.id)});
  });
  pintar();
})();

/* El formulario del hero abre el buscador del portal con el texto escrito (el catálogo no lee ?q=). */
(function(){
  var f=document.querySelector('[data-buscar-form]'); if(!f) return;
  f.addEventListener('submit',function(e){
    var B=window.Buscador; if(!B||!B.ui) return;
    e.preventDefault();
    var q=f.querySelector('input').value;
    B.ui.abrir();
    var i=document.querySelector('.bq__in');
    if(i){i.value=q;i.dispatchEvent(new Event('input',{bubbles:true}));}
  });
})();
