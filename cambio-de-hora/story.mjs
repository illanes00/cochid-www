import {yearData,monthlyData,monthsAtHour,hhmm,duration,MONTHS,MONTH_NAMES} from './solar.mjs';
const DAYS=yearData(), MONTHLY=monthlyData(DAYS), $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let index=249, month=8, timer=null, previousDay=null;
const ns='http://www.w3.org/2000/svg';
function node(tag,attrs={},text){const e=document.createElementNS(ns,tag);for(const[k,v]of Object.entries(attrs))e.setAttribute(k,v);if(text!==undefined)e.textContent=text;return e;}
function add(parent,tag,attrs,text){const e=node(tag,attrs,text);parent.appendChild(e);return e;}
function chart(id,w,h,title){const root=$(id);root.replaceChildren();const svg=add(root,'svg',{viewBox:`0 0 ${w} ${h}`,role:'img','aria-label':title});add(svg,'title',{},title);return svg;}
function label(svg,x,y,text,attrs={}){return add(svg,'text',{x,y,'font-size':12,...attrs},text);}
const longDate=d=>`${Number(d.slice(8))} de ${MONTH_NAMES[Number(d.slice(5,7))-1]} de 2026`;
function stop(){clearInterval(timer);timer=null;$('#play').textContent='▶ Recorrer el año';$('#play').setAttribute('aria-pressed','false');$('#day-summary').setAttribute('aria-live','polite');}
function setDay(i,user=false){if(user)stop();index=Math.max(0,Math.min(364,i));const d=DAYS[index];$('#day').value=index;$('#date').value=d.date;$('#day').setAttribute('aria-valuetext',longDate(d.date));$('#day-label').textContent=longDate(d.date);$$('[data-date]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.date===d.date)));renderDay();}
function renderDay(){
 const d=DAYS[index], w=Math.max(260,$('#day-viz').clientWidth), mobile=w<520, h=mobile?272:258, x=t=>28+(w-48)*t/1440, shift=(d.offset+4)*60, tw=$('#twilight').checked;
 const svg=chart('#day-viz',w,h,`${longDate(d.date)}. Horario vigente: salida ${hhmm(d.riseLegal)}, puesta ${hhmm(d.setLegal)}. UTC menos cuatro: salida ${hhmm(d.riseFixed)}, puesta ${hhmm(d.setFixed)}. Misma duración: ${duration(d.daylight)}.`);
 for(const t of (mobile?[0,360,720,1080,1440]:[0,180,360,540,720,900,1080,1260,1440])){
  const xx=x(t); add(svg,'line',{x1:xx,x2:xx,y1:30,y2:225,stroke:t===720?'#a44848':'var(--line)','stroke-dasharray':t===720?'4 4':'0'});
  label(svg,xx,20,hhmm(t),{'text-anchor':t===0?'start':t===1440?'end':'middle',fill:'var(--ink-muted)','font-size':mobile?10:11});
 }
 const rows=[{label:`Horario vigente · UTC${d.offset===-3?'−3':'−4'}`,rise:d.riseLegal,set:d.setLegal,dawn:d.dawnFixed+shift,dusk:d.duskFixed+shift,color:'#f4be69',y:86,key:'Legal'}, {label:'UTC−4 fijo · sin adelanto',rise:d.riseFixed,set:d.setFixed,dawn:d.dawnFixed,dusk:d.duskFixed,color:'#a7c7f1',y:185,key:'Fixed'}];
 rows.forEach(r=>{
  label(svg,x(0),r.y-40,r.label,{'font-size':mobile?12:14,'font-weight':500,fill:'var(--ink)'});
  add(svg,'rect',{x:x(0),y:r.y,width:x(1440)-x(0),height:30,rx:3,fill:'var(--paper-raised)',stroke:'var(--line)'});
  if(tw)add(svg,'rect',{x:x(r.dawn),y:r.y,width:x(r.dusk)-x(r.dawn),height:30,fill:r.color,opacity:.3});
  const band=add(svg,'rect',{x:x(r.rise),y:r.y,width:x(r.set)-x(r.rise),height:30,fill:r.color,rx:2});
  if(previousDay&&!reduced.matches){const dx=x(previousDay['rise'+r.key])-x(r.rise);band.animate([{transform:`translateX(${dx}px)`},{transform:'translateX(0)'}],{duration:280,easing:'ease-out'});}
  label(svg,x(r.rise),r.y-10,hhmm(r.rise),{'text-anchor':'middle','font-weight':600,fill:'var(--ink)','font-size':mobile?12:14});
  label(svg,x(r.set),r.y-10,hhmm(r.set),{'text-anchor':'middle','font-weight':600,fill:'var(--ink)','font-size':mobile?12:14});
  add(svg,'circle',{cx:x((r.rise+r.set)/2),cy:r.y+15,r:7,fill:'none',stroke:'#314459','stroke-width':1.2});
  label(svg,(x(r.rise)+x(r.set))/2,r.y+53,duration(d.daylight),{'text-anchor':'middle',fill:'var(--ink-muted)','font-size':mobile?11:12});
 });
 const daylight=duration(d.daylight);
 $('#day-summary').innerHTML=shift?`<strong>${daylight} de luz en ambos escenarios.</strong> El reloj retrasa el amanecer y la puesta <strong>60 minutos</strong>.<span class="mini">${tw?`El crepúsculo civil comienza a las ${hhmm(d.dawnFixed+shift)} y termina a las ${hhmm(d.duskFixed+shift)} con el horario vigente. Las franjas tenues muestran esa claridad.`:'Las franjas muestran el Sol sobre el horizonte; fuera de ellas puede haber claridad de crepúsculo.'}</span>`:`<strong>En esta fecha los dos relojes coinciden en UTC−4.</strong> Hay ${daylight} de luz.<span class="mini">${tw?`El crepúsculo civil va desde ${hhmm(d.dawnFixed)} antes del amanecer hasta ${hhmm(d.duskFixed)} después de la puesta.`:'Durante este tramo del invierno, mantener UTC−4 no produce diferencia con el horario vigente.'}</span>`;
 previousDay=d;
}
function calendar(id,legal){
 const w=Math.max(250,$(id).clientWidth), svg=chart(id,w,450,`Promedios mensuales de salida y puesta del Sol en Santiago 2026, ${legal?'horario vigente':'UTC menos cuatro fijo'}. Escala de 00:00 a 24:00; datos en la tabla de metodología.`), left=43,top=18,bottom=414,width=w-51,step=width/12,y=t=>top+(bottom-top)*t/1440;
 for(let t=0;t<=1440;t+=120){add(svg,'line',{x1:left,x2:w-8,y1:y(t),y2:y(t),class:t===720?'noon':'grid'});label(svg,left-8,y(t)+4,hhmm(t),{'text-anchor':'end',class:'axis'});}
 MONTHLY.forEach((m,i)=>{
  const a=legal?m.riseLegal:m.riseFixed,b=legal?m.setLegal:m.setFixed,xx=left+i*step+4;
  const rect=add(svg,'rect',{x:xx,y:y(a),width:step-8,height:y(b)-y(a),fill:legal?'#f4be69':'#a7c7f1',class:'month-bar','data-month':i});
  add(rect,'title',{},`${MONTH_NAMES[i]}: salida ${hhmm(a)}, puesta ${hhmm(b)}, ${duration(m.daylight)} de luz media.`);
  add(svg,'line',{x1:xx,x2:xx+step-8,y1:y(a),y2:y(a),stroke:legal?'#ad5f0e':'#285db0','stroke-width':2});
  add(svg,'line',{x1:xx,x2:xx+step-8,y1:y(b),y2:y(b),stroke:legal?'#ad5f0e':'#285db0','stroke-width':2});
  label(svg,left+(i+.5)*step,436,MONTHS[i],{'text-anchor':'middle',class:'axis'});
 });
 add(svg,'line',{x1:left,x2:w-8,y1:y(720),y2:y(720),class:'noon'});
 const m=MONTHLY[month],a=legal?m.riseLegal:m.riseFixed,b=legal?m.setLegal:m.setFixed;
 add(svg,'rect',{x:left+month*step+1,y:y(a)-3,width:step-2,height:y(b)-y(a)+6,class:'selected-outline'});
 svg.querySelectorAll('[data-month]').forEach(b=>b.addEventListener('click',()=>selectMonth(Number(b.dataset.month))));
}
function selectMonth(i){month=i;$$('.month-picker button').forEach((b,j)=>b.setAttribute('aria-pressed',String(i===j)));const m=MONTHLY[i];$('#month-detail').innerHTML=`<strong>${MONTH_NAMES[i][0].toUpperCase()+MONTH_NAMES[i].slice(1)} · ${m.days} días</strong><span class="legal-text">Vigente ${hhmm(m.riseLegal)} → ${hhmm(m.setLegal)}</span><span class="fixed-text">UTC−4 fijo ${hhmm(m.riseFixed)} → ${hhmm(m.setFixed)}</span><span>${duration(m.daylight)} de luz media</span>`;calendar('#calendar-legal',true);calendar('#calendar-fixed',false);}
function lineChart(){
 const w=Math.max(250,$('#sun-times').clientWidth),svg=chart('#sun-times',w,330,'Promedios mensuales de amanecer y atardecer. Línea sólida horario vigente; línea discontinua UTC menos cuatro. Misma escala de 04:00 a 22:00.'),x=i=>43+i*(w-53)/11,y=t=>16+(t-240)/1080*278;
 for(let t=240;t<=1320;t+=180){add(svg,'line',{x1:43,x2:w-10,y1:y(t),y2:y(t),class:'grid'});label(svg,39,y(t)+4,hhmm(t),{'text-anchor':'end',class:'axis'});}
 for(const key of ['riseFixed','setFixed','riseLegal','setLegal']){
  const color=key.startsWith('rise')?'var(--dawn)':'var(--dusk)',fixed=key.endsWith('Fixed');
  add(svg,'path',{d:MONTHLY.map((m,i)=>`${i?'L':'M'}${x(i)},${y(m[key])}`).join(' '),fill:'none',stroke:color,'stroke-width':fixed?1.8:2.5,'stroke-dasharray':fixed?'5 5':'0'});
  if(!fixed)MONTHLY.forEach((m,i)=>{const c=add(svg,'circle',{cx:x(i),cy:y(m[key]),r:3,fill:color});add(c,'title',{},`${MONTHS[i]}: ${hhmm(m[key])}`);});
 }
 MONTHS.forEach((m,i)=>label(svg,x(i),318,m,{'text-anchor':'middle',class:'axis'}));
}
function durationChart(){
 const w=Math.max(250,$('#duration-chart').clientWidth),svg=chart('#duration-chart',w,367,'Duración media mensual de luz. Eje vertical de cero a dieciséis horas. Cambios indicados entre primer y último día del mes.'),left=34,step=(w-40)/12,x=i=>left+i*step,y=t=>302-t/960*270;
 for(let t=0;t<=960;t+=240){add(svg,'line',{x1:left,x2:w-6,y1:y(t),y2:y(t),class:t===720?'noon':'grid'});label(svg,28,y(t)+4,`${t/60} h`,{'text-anchor':'end',class:'axis'});}
 MONTHLY.forEach((m,i)=>{
  const r=add(svg,'rect',{x:x(i)+3,y:y(m.daylight),width:step-6,height:302-y(m.daylight),fill:'var(--fixed-fill)',rx:1});add(r,'title',{},`${MONTH_NAMES[i]}: ${duration(m.daylight)}. Cambio durante el mes: ${Math.round(m.change)} minutos.`);
  if(w>450)label(svg,x(i)+step/2,y(m.daylight)-8,hhmm(m.daylight),{'text-anchor':'middle','font-size':10});
  label(svg,x(i)+step/2,321,m.name,{'text-anchor':'middle',class:'axis'});
  label(svg,x(i)+step/2,345,`${m.change>=0?'+':'−'}${Math.round(Math.abs(m.change))}`,{'text-anchor':'middle','font-size':10,'font-weight':500});
 });
 label(svg,w/2,365,'Cambio de luz durante el mes (minutos)',{'text-anchor':'middle','font-size':10});
}
function hoursChart(){
 const w=Math.max(250,$('#hours-chart').clientWidth),svg=chart('#hours-chart',w,570,'Cantidad de meses con luz en el punto medio de cada hora. Hora en eje vertical, meses de cero a doce en horizontal. Dos barras por hora.'),left=48,right=w-24,top=26,step=21,y=i=>top+i*step,x=n=>left+(right-left)*n/12;
 for(let n=0;n<=12;n+=3){add(svg,'line',{x1:x(n),x2:x(n),y1:top-12,y2:top+23*step+11,class:'grid'});label(svg,x(n),550,String(n),{'text-anchor':'middle',class:'axis'});}
 for(let hour=0;hour<24;hour++){
  const count=monthsAtHour(MONTHLY,hour);label(svg,left-10,y(hour)+4,`${String(hour).padStart(2,'0')}:30`,{'text-anchor':'end',class:'axis'});
  for(const[key,dy,color]of[['legal',-6,'#f4be69'],['fixed',2,'#a7c7f1']]){
   const b=add(svg,'rect',{x:left,y:y(hour)+dy,width:x(count[key])-left,height:6,fill:color});add(b,'title',{},`${hour}:30, ${key==='legal'?'vigente':'UTC−4 fijo'}: ${count[key]} meses`);
   if(count[key])label(svg,x(count[key])+6,y(hour)+dy+6,String(count[key]),{'font-size':9});
  }
 }
 label(svg,w/2,570,'Meses con luz (de 12)',{'text-anchor':'middle','font-size':12});
}
function routine(){const value=$('#routine-time').value;if(!/^\d{2}:\d{2}$/.test(value))return;const[h,m]=value.split(':').map(Number),t=h*60+m;
 if(t<240||t>720){$('#routine-result').textContent='Elige una hora entre las 04:00 y las 12:00.';return;}
 const legal=DAYS.filter(d=>d.riseLegal>t).length,fixed=DAYS.filter(d=>d.riseFixed>t).length,diff=legal-fixed;
 $('#routine-result').innerHTML=`<div class="routine-counts"><div><strong>${legal}<span> días</span></strong><p>antes del amanecer · horario vigente</p></div><div><strong>${fixed}<span> días</span></strong><p>antes del amanecer · UTC−4 fijo</p></div><div class="routine-diff">${diff?`Con el horario vigente, a las ${value} hay <b>${diff} días más</b> en que el Sol aún no ha salido.`:`A las ${value}, el conteo es igual en los dos escenarios.`}</div></div>`;
}
$('#day').addEventListener('input',e=>setDay(Number(e.target.value),true));
$('#date').addEventListener('change',e=>{const i=DAYS.findIndex(d=>d.date===e.target.value);if(i>=0)setDay(i,true);else{e.target.value=DAYS[index].date;}});
$$('[data-date]').forEach(b=>b.addEventListener('click',()=>setDay(DAYS.findIndex(d=>d.date===b.dataset.date),true)));
$$('.month-picker button').forEach((b,i)=>b.addEventListener('click',()=>selectMonth(i)));
$('#twilight').addEventListener('change',renderDay);
$('#routine-time').addEventListener('input',routine);
$('#play').addEventListener('click',()=>{if(timer){stop();return;}if(index===364)setDay(0);$('#play').textContent='Ⅱ Pausar';$('#play').setAttribute('aria-pressed','true');$('#day-summary').setAttribute('aria-live','off');timer=setInterval(()=>{if(index===364){stop();return;}setDay(Math.min(364,index+2));},reduced.matches?600:180);});
$('#print').addEventListener('click',()=>{stop();window.print();});
$('#download-svg').addEventListener('click',()=>{
 const svg=node('svg',{xmlns:ns,width:1100,height:580,viewBox:'0 0 1100 580'});add(svg,'rect',{width:1100,height:580,fill:'#fff'});
 add(svg,'style',{},'text{font-family:sans-serif;fill:#344555}.axis{font-size:11px}.grid{stroke:#e5e9ec}.noon{stroke:#a44848;stroke-dasharray:4 4}.selected-outline{fill:none;stroke:#344555;stroke-width:1.5}');
 label(svg,40,35,'El reloj y el Sol · Santiago 2026',{'font-size':23,'font-weight':600});
 label(svg,40,68,'Horario vigente · UTC−3 / UTC−4',{'font-size':16});label(svg,585,68,'UTC−4 fijo · sin cambios',{'font-size':16});
 ['#calendar-legal svg','#calendar-fixed svg'].forEach((id,i)=>{const c=$(id).cloneNode(true);c.setAttribute('x',String(25+i*545));c.setAttribute('y','85');c.setAttribute('width','520');c.setAttribute('height','450');svg.appendChild(c);});
 label(svg,40,558,'Promedios mensuales · salida arriba, puesta abajo · estimación NOAA · cochid.cl/cambio-de-hora/',{'font-size':13});
 const blob=new Blob([new XMLSerializer().serializeToString(svg)],{type:'image/svg+xml'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='santiago-2026-comparacion-luz.svg';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
});
let resizeFrame;new ResizeObserver(()=>{cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(()=>{renderDay();calendar('#calendar-legal',true);calendar('#calendar-fixed',false);lineChart();durationChart();hoursChart();});}).observe($('#day-viz'));
document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
reduced.addEventListener('change',stop);
setDay(index);selectMonth(month);lineChart();durationChart();hoursChart();routine();
