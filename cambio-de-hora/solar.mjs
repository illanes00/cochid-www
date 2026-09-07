/** Santiago 2026. Aproximación NOAA, año fraccional a las 12:00.
 * https://gml.noaa.gov/grad/solcalc/solareqns.PDF
 * Horizonte plano; cenit 90.833 grados. Minutos desde medianoche local.
 * Calendario de 2026 verificado con SHOA/DIRECTEMAR y America/Santiago.
 */
export const MONTHS=['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
export const MONTH_NAMES=['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
const DAY=86400000, START=Date.UTC(2026,0,1), rad=Math.PI/180;
export function solarDay(date){
 const t=Date.parse(date+'T12:00:00Z');
 if(!/^2026-\d{2}-\d{2}$/.test(date)||!Number.isFinite(t)||new Date(t).toISOString().slice(0,10)!==date)throw new RangeError('Elige una fecha válida de 2026.');
 const n=Math.floor((t-START)/DAY)+1, g=2*Math.PI/365*(n-1);
 const eq=229.18*(.000075+.001868*Math.cos(g)-.032077*Math.sin(g)-.014615*Math.cos(2*g)-.040849*Math.sin(2*g));
 const dec=.006918-.399912*Math.cos(g)+.070257*Math.sin(g)-.006758*Math.cos(2*g)+.000907*Math.sin(2*g)-.002697*Math.cos(3*g)+.00148*Math.sin(3*g);
 const lat=-33.4489*rad, noon=720-4*(-70.6693)-eq;
 const half=zenith=>4*Math.acos(Math.cos(zenith*rad)/(Math.cos(lat)*Math.cos(dec))-Math.tan(lat)*Math.tan(dec))/rad;
 const h=half(90.833), civil=half(96);
 const offset=date>='2026-04-05'&&date<'2026-09-06'?-4:-3, shift=(offset+4)*60;
 const riseFixed=noon-h-240, setFixed=noon+h-240;
 return {date,month:Number(date.slice(5,7)),offset,riseFixed,setFixed,riseLegal:riseFixed+shift,setLegal:setFixed+shift,daylight:2*h,dawnFixed:noon-civil-240,duskFixed:noon+civil-240};
}
export function yearData(){return Array.from({length:365},(_,i)=>solarDay(new Date(START+i*DAY).toISOString().slice(0,10)));}
export function monthlyData(days=yearData()){
 return MONTHS.map((name,i)=>{
  const rows=days.filter(d=>d.month===i+1), out={name,month:i+1,days:rows.length};
  for(const key of ['riseLegal','setLegal','riseFixed','setFixed','daylight'])out[key]=rows.reduce((s,d)=>s+d[key],0)/rows.length;
  out.change=rows.at(-1).daylight-rows[0].daylight;
  return out;
 });
}
export function monthsAtHour(months,hour){
 const t=hour*60+30;
 return {legal:months.filter(m=>m.riseLegal<=t&&t<m.setLegal).length,fixed:months.filter(m=>m.riseFixed<=t&&t<m.setFixed).length};
}
export function hhmm(minutes){const n=Math.round(minutes);return String(Math.floor(n/60)).padStart(2,'0')+':'+String(n%60).padStart(2,'0');}
export function duration(minutes){const n=Math.round(minutes);return `${Math.floor(n/60)} h ${String(n%60).padStart(2,'0')} min`;}
