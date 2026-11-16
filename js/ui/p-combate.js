/* Pestaña Combate: THAC0, salvaciones y CA con su desglose, y bonos manuales.
   El panel "Todo lo que modifica tu ficha" lista cada efecto con su origen. */
(function (A) {
  'use strict';
  const ui = A.ui, U = A.util, h = ui.h;

  function lineas(partesClase, bonos, etiquetaFinal) {
    const out = partesClase.map(p => `${p.clase} nivel ${p.nivel}: ${p.valor}`);
    if (partesClase.length > 1) out.push('Se usa el mejor (el más bajo)');
    bonos.forEach(b => out.push(`${b.origen} ${b.etiqueta}: ${U.signo(b.valor)}`));
    if (!partesClase.length) out.push('Sin clase: valor base 20');
    return out;
  }

  function bloquesCifra(S) {
    const thaco = h('strong', { class: 'cifra enorme' }), thacoL = h('ul', { class: 'desglose' });
    const ca = h('strong', { class: 'cifra enorme' }), caL = h('ul', { class: 'desglose' });
    const salv = h('tbody');
    const mov = h('strong', { class: 'cifra enorme' }), movL = h('ul', { class: 'desglose' });
    S.enlaces.push(r => {
      mov.textContent = r.mov.valor; movL.replaceChildren(...r.mov.partes.map(q => h('li', { text: `${q.et}: ${q.v > 0 && !/^(Raza|Base)/.test(q.et) ? U.signo(q.v) : q.v}` })), ...(r.mov.reducido ? [h('li', { text: `Carga ${r.mov.carga}: ×${r.mov.factor === 0.5 ? '1/2' : '1/3'} (de ${r.mov.sinCarga} a ${r.mov.valor})` })] : []));
      thaco.textContent = r.thaco.valor; thacoL.replaceChildren(...lineas(r.thaco.partes, r.thaco.bonos).map(t => h('li', { text: t })));
      ca.textContent = r.ca.valor;
      caL.replaceChildren(...['Base 10', `Destreza aplicada: ${U.signo(r.ca.defensa)}`].concat(r.ca.bonos.map(b => `${b.origen} ${b.etiqueta}: ${U.signo(b.valor)}`)).map(t => h('li', { text: t })));
      salv.replaceChildren(...r.salvaciones.map(s => h('tr', {},
        h('th', { scope: 'row' }, h('strong', { text: s.id }), h('span', { text: A.SAVE_NOMBRES[s.id] })),
        h('td', { class: 'num' }, h('strong', { class: 'cifra', text: s.valor })),
        h('td', { class: 'desg' }, lineas(s.partes, s.bonos).join('  ·  ')))));
    });
    return h('div', { class: 'combate-cifras' },
      h('section', { class: 'bloque' }, h('h2', { text: 'THAC0' }), thaco, thacoL),
      h('section', { class: 'bloque' }, h('h2', { text: 'Clase de armadura' }), ca, caL, h('p', { class: 'ayuda', text: 'La armadura, el equipo y los estilos de pelea se configuran en la pestaña Armadura; aquí se ve el desglose.' })),
      h('section', { class: 'bloque' }, h('h2', { text: 'Movimiento' }), mov, movL, h('p', { class: 'ayuda', text: 'Se reduce según la carga (pestaña Equipo): Cargado a la mitad, Sobrecargado a un tercio. Los bonos (botas, conjuros, dones) van en "Bonos manuales" con el objetivo Movimiento.' })),
      h('section', { class: 'bloque ancho', style: null }, h('h2', { text: 'Tiradas de salvación' }),
        h('div', { class: 'tabla-cont' }, h('table', { class: 'tabla salv' }, h('thead', {}, h('tr', {}, ['Salvación', 'Valor', 'Cómo sale'].map(t => h('th', { scope: 'col', text: t })))), salv))));
  }

  function bonosManuales(S) {
    const plano = [];
    Object.keys(S.pj.bonos).forEach(obj => S.pj.bonos[obj].forEach((b, idx) => plano.push({ obj, idx, b })));
    const filas = h('div', { class: 'lista-edit bonos' });
    plano.forEach((p, n) => {
      const mod = fn => S.cambiar(pj => fn(pj.bonos[p.obj][p.idx]));
      filas.append(h('div', { class: 'fila-edit' },
        ui.select(Object.entries(A.OBJETIVOS).map(([v, t]) => ({ v, t })), p.obj, v => S.cambiar(pj => { const [x] = pj.bonos[p.obj].splice(p.idx, 1); pj.bonos[v].push(x); }, { estructura: true }), { 'data-foco': `bm${n}-obj`, 'aria-label': 'Qué modifica' }),
        ui.numero(p.b.valor, v => mod(b => { b.valor = U.num(v); }), { class: 'corto', step: 1, 'data-foco': `bm${n}-v`, 'aria-label': 'Valor' }),
        ui.texto(p.b.origen, v => mod(b => { b.origen = v; }), { placeholder: 'Origen (objeto, conjuro, don…)', 'data-foco': `bm${n}-o`, 'aria-label': 'Origen' }),
        ui.texto(p.b.nota, v => mod(b => { b.nota = v; }), { placeholder: 'Nota', 'data-foco': `bm${n}-n`, 'aria-label': 'Nota' }),
        ui.boton('Quitar', () => S.cambiar(pj => { pj.bonos[p.obj].splice(p.idx, 1); }, { estructura: true }), 'chico peligro')));
    });
    return ui.bloque('Bonos manuales',
      h('p', { class: 'ayuda', text: 'Para lo que no viene de tu raza o kit: objetos mágicos, conjuros duraderos, dones del DJ. THAC0, CA y salvaciones se suman al número: un valor negativo mejora.' }),
      plano.length ? filas : h('p', { class: 'vacio', text: 'Todavía no hay bonos manuales.' }),
      ui.boton('Agregar bono', () => S.cambiar(pj => { pj.bonos.thaco.push({ valor: 0, origen: '', nota: '' }); }, { estructura: true })));
  }

  function todosLosEfectos(S) {
    const tbody = h('tbody');
    S.enlaces.push(r => {
      tbody.replaceChildren(...(r.efectos.length ? r.efectos.map(e => h('tr', {},
        h('td', { text: e.origen }), h('td', { text: e.etiqueta }), h('td', { text: A.OBJETIVOS[e.objetivo] }), h('td', { class: 'num', text: U.signo(e.valor) }), h('td', { text: e.nota })))
        : [h('tr', {}, h('td', { colspan: 5, class: 'vacio', text: 'Nada modifica tu ficha todavía.' }))]));
    });
    return ui.bloque('Todo lo que modifica tu ficha',
      h('div', { class: 'tabla-cont' }, h('table', { class: 'tabla' },
        h('thead', {}, h('tr', {}, ['Origen', 'Fuente', 'Modifica', 'Valor', 'Nota'].map(t => h('th', { scope: 'col', text: t })))), tbody)));
  }

  ui.paneles.combate = S => h('div', { class: 'combate' }, bloquesCifra(S), h('div', { class: 'cols mitad' }, h('div', { class: 'col ancha' }, bonosManuales(S)), h('div', { class: 'col ancha' }, todosLosEfectos(S))));
})(window.ADND);
