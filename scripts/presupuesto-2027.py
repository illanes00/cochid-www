#!/usr/bin/env python3
"""Reproduce tablas y gráficos del análisis, sin consultar ni modificar bases."""
import argparse
import csv
import json
from decimal import Decimal
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'assets/presupuesto-2027'

def variacion(base, propuesta, inflacion=0):
    return (Decimal(propuesta) / Decimal(base) / (1 + Decimal(str(inflacion))) - 1) * 100

def validar(datos):
    assert datos['unidad'] == 'miles_de_pesos_chilenos'
    assert len(datos['partidas']) == 32
    assert len({p['partida'] for p in datos['partidas']}) == 32
    for anio in (2026, 2027):
        campo = 'ley_2026_miles_clp' if anio == 2026 else 'proyecto_2027_miles_clp'
        assert sum(p[campo] for p in datos['partidas']) == datos[f'total_{anio}_miles_clp']
    for p in datos['partidas']:
        assert p['ley_2026_miles_clp'] > 0 and p['proyecto_2027_miles_clp'] > 0
        assert abs(float(variacion(p['ley_2026_miles_clp'], p['proyecto_2027_miles_clp'])) - p['variacion_nominal_pct']) < 1e-9
        assert abs(float(variacion(p['ley_2026_miles_clp'], p['proyecto_2027_miles_clp'], .03)) - p['variacion_real_escenario_3_pct']) < 1e-9
    assert datos['moneda_extranjera_separada']['incluida_en_totales_clp'] is False
    s = datos['perimetro_constante_seguridad']
    assert s['ley_2026_combinada_miles_clp'] == s['ley_2026_seguridad_miles_clp'] + s['ley_2026_gendarmeria_miles_clp']

def tablas(datos):
    campos = ['partida', 'sector', 'ley_2026_miles_clp', 'proyecto_2027_miles_clp', 'variacion_nominal_pct', 'variacion_real_escenario_3_pct', 'nota']
    with (OUT / 'comparacion.csv').open('w', encoding='utf-8', newline='') as f:
        w = csv.DictWriter(f, fieldnames=campos)
        w.writeheader()
        for p in datos['partidas']:
            w.writerow({k: round(p[k], 6) if isinstance(p[k], float) else p[k] for k in campos})
    with (OUT / 'sensibilidad.csv').open('w', encoding='utf-8', newline='') as f:
        w = csv.writer(f)
        w.writerow(['sector', 'nominal_pct', 'real_inflacion_2_pct', 'real_inflacion_3_pct', 'real_inflacion_4_pct'])
        for p in [{'sector': 'Total aporte fiscal libre', 'ley_2026_miles_clp': datos['total_2026_miles_clp'], 'proyecto_2027_miles_clp': datos['total_2027_miles_clp']}, *datos['partidas']]:
            w.writerow([p['sector'], *[round(variacion(p['ley_2026_miles_clp'], p['proyecto_2027_miles_clp'], i), 6) for i in (0, .02, .03, .04)]])

def graficos(datos):
    import matplotlib
    matplotlib.use('Agg')
    import matplotlib.pyplot as plt
    import numpy as np
    plt.rcParams.update({'font.family': 'DejaVu Sans', 'font.size': 11, 'axes.spines.top': False, 'axes.spines.right': False, 'axes.spines.left': False, 'svg.fonttype': 'none'})
    azul, gris = '#165d91', '#64748b'
    def guardar(fig, nombre):
        fig.savefig(OUT / f'{nombre}.png', dpi=180, facecolor='white')
        fig.savefig(OUT / f'{nombre}.svg', facecolor='white', metadata={'Title': 'Aporte fiscal libre: ley inicial 2026 y proyecto 2027', 'Description': 'Fuente: DIPRES ley 2026 y Cámara, Tesoro Público 2027. Corte: 5 de octubre de 2026. Valores reales estimados con inflación hipotética de 3%.'})
        plt.close(fig)
    fig, ax = plt.subplots(figsize=(8, 3.6))
    valores = [datos['total_2026_miles_clp']/1e9, datos['total_2027_miles_clp']/1e9, datos['total_2027_miles_clp']/1.03/1e9]
    ax.barh([2,1,0], valores, height=.48, color=[gris,azul,gris])
    ax.set_yticks([2,1,0], ['Ley inicial 2026', 'Proyecto 2027, nominal', '2027 a precios de 2026\n(inflación hipotética 3%)'])
    ax.set_xlim(0, 82)
    for y,v in zip([2,1,0], valores): ax.text(v+1,y,f'{v:.2f}'.replace('.',','), va='center')
    ax.set_xlabel('Billones de pesos chilenos (10¹² pesos)')
    fig.suptitle('Aporte fiscal libre: +2,16% nominal\n−0,82% con inflación hipotética de 3%', x=.02, y=.97, ha='left', fontsize=12)
    ax.grid(axis='x', color='#e2e8f0', linewidth=.5); ax.set_axisbelow(True)
    fig.text(.02,.02,'Aporte fiscal libre CLP; no gasto total. Fuente: DIPRES 2026 y Cámara 2027,\n50/01/05. Corte: 05-10-2026. Ajuste real con inflación hipotética de 3%.',fontsize=9,color=gris)
    fig.subplots_adjust(left=.33,right=.96,bottom=.29,top=.78)
    guardar(fig,'total-aporte')
    ids = ['18','29','24','30','16','12','15','09','31','26']
    filas = [next(p for p in datos['partidas'] if p['partida']==i) for i in ids]
    s=datos['perimetro_constante_seguridad']
    filas.insert(9, {'sector':'Seguridad + Gendarmería*', 'variacion_nominal_pct':s['variacion_nominal_pct'], 'variacion_real_escenario_3_pct':s['variacion_real_escenario_3_pct']})
    fig,ax=plt.subplots(figsize=(8,6))
    for y,p in enumerate(filas):
        n,r=p['variacion_nominal_pct'],p['variacion_real_escenario_3_pct']
        ax.plot([r,n],[y,y],color='#94a3b8',lw=1)
        ax.scatter([n],[y],color=azul,s=35,label='Nominal' if y==0 else None,zorder=3)
        ax.scatter([r],[y],facecolor='white',edgecolor=gris,s=35,label='Real, inflación hipotética 3%' if y==0 else None,zorder=3)
        ax.text(56,y,f'{n:+.2f}% / {r:+.2f}%'.replace('.',','),va='center',fontsize=9)
    ax.set_yticks(np.arange(len(filas)), [p['sector'] for p in filas]);ax.invert_yaxis()
    ax.axvline(0,color='#64748b',lw=.8);ax.set_xlim(-28,84);ax.set_xticks([-20,0,20,40])
    ax.set_xlabel('Variación respecto de la ley inicial 2026 (%)')
    ax.set_title('Más pesos no siempre significan más poder de compra',loc='left',pad=32,fontsize=12)
    ax.legend(frameon=False,loc='lower left',bbox_to_anchor=(0,1),fontsize=9,ncols=2)
    ax.text(56,-.75,'Nominal / real',fontsize=9,color=gris)
    ax.grid(axis='x',color='#e2e8f0',linewidth=.5);ax.set_axisbelow(True)
    fig.text(.02,.03,'Aporte fiscal libre CLP. *Seguridad y Gendarmería: perímetro constante.\nFuente: DIPRES 2026 y Cámara 2027, 50/01/05. Corte: 05-10-2026.',fontsize=9,color=gris)
    fig.subplots_adjust(left=.30,right=.98,bottom=.17,top=.83)
    guardar(fig,'sectores-nominal-real')
    fig,ax=plt.subplots(figsize=(8,3.6))
    comparaciones=[('Comparación directa\n(cambia el perímetro)',44.34155747308066),('Mismo perímetro\n(Seguridad + Gendarmería)',s['variacion_nominal_pct'])]
    ax.barh([1,0],[p[1] for p in comparaciones],height=.48,color=[gris,azul]);ax.set_yticks([1,0],[p[0] for p in comparaciones]);ax.set_xlim(0,56)
    for y,(_,v) in zip([1,0],comparaciones):ax.text(v+1,y,f'+{v:.2f}%'.replace('.',','),va='center')
    ax.set_xlabel('Variación nominal del aporte fiscal libre (%)')
    fig.suptitle('Seguridad: el traslado de Gendarmería\ncambia la comparación', x=.02, y=.97, ha='left', fontsize=12)
    ax.grid(axis='x',color='#e2e8f0',linewidth=.5);ax.set_axisbelow(True)
    fig.text(.02,.02,'Aporte fiscal libre CLP. Fuente: DIPRES 2026 y Cámara 2027, programa\n50/01/05. Ley inicial 2026 frente a proyecto 2027. Corte: 05-10-2026.',fontsize=9,color=gris)
    fig.subplots_adjust(left=.35,right=.98,bottom=.29,top=.78)
    guardar(fig,'seguridad-perimetro')
    fig,ax=plt.subplots(figsize=(8,3.6))
    valores=[181749702/1e6,89612552/1e6]
    ax.barh([1,0],valores,height=.48,color=[gris,azul])
    ax.set_yticks([1,0],['Ley 2026: Subsidio al Empleo\ny Subsidio Empleo a la Mujer','Proyecto 2027: las dos líneas\nmás Subsidio Unificado de Empleo'])
    ax.set_xlim(0,225)
    ax.set_xticks([0,50,100,150,200])
    for y,v in zip([1,0],valores):ax.text(v+4,y,f'{v:.2f}'.replace('.',','),va='center')
    ax.set_xlabel('Miles de millones de pesos chilenos, nominales')
    fig.suptitle('Subsidios SENCE seleccionados:\n−50,69% nominal', x=.02, y=.97, ha='left', fontsize=12)
    ax.grid(axis='x',color='#e2e8f0',linewidth=.5);ax.set_axisbelow(True)
    fig.text(.02,.02,'Cobertura: sólo estas asignaciones, no todo SENCE. Fuente: DIPRES 2026\ny Cámara 2027, programa 15/05/04. Corte: 05-10-2026.',fontsize=9,color=gris)
    fig.subplots_adjust(left=.43,right=.98,bottom=.27,top=.78)
    guardar(fig,'empleo-lineas')
    from matplotlib.patches import Rectangle
    fig,ax=plt.subplots(figsize=(8,4.8));ax.set_axis_off();ax.set_xlim(0,1);ax.set_ylim(0,1)
    fig.suptitle('Presupuesto 2027: todavía es un proyecto',x=.04,y=.97,ha='left',fontsize=15)
    for y,t,sub in [(0.70,'1. Ejecutivo: ingreso el 30 de septiembre','Propuesta oficial presentada al Congreso'),(.40,'2. Congreso: revisión y discusión','Las asignaciones pueden cambiar'),(.10,'3. Ley aprobada y publicada: pendiente','Estado verificado al 5 de octubre de 2026')]:
        ax.add_patch(Rectangle((.02,y),.96,.21,facecolor='#f1f5f9',edgecolor=gris,linewidth=.8))
        ax.text(.05,y+.13,t,fontsize=12,weight='bold',va='center')
        ax.text(.05,y+.06,sub,fontsize=11,va='center')
    for y in [.65,.35]:ax.annotate('',xy=(.5,y-.035),xytext=(.5,y+.035),arrowprops={'arrowstyle':'->','color':azul})
    fig.text(.04,.015,'Fuente: Cámara y calendario DIPRES. Una propuesta no acredita gasto ejecutado.',fontsize=9,color=gris)
    fig.subplots_adjust(top=.88,bottom=.08,left=.03,right=.97)
    guardar(fig,'tramitacion')

if __name__ == '__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--graficos',action='store_true');args=parser.parse_args()
    datos=json.loads((OUT/'comparacion.json').read_text());validar(datos);tablas(datos)
    if args.graficos:graficos(datos)
    print('32/32 partidas conciliadas; CLP y USD separados; cálculos nominales y escenarios reales validados.')
