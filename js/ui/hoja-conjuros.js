/* Hoja de conjuros para llenar a mano: una página por clase lanzadora, con una tabla por nivel de conjuro.
   Cada conjuro trae una casilla "Mem." (cuántas veces lo tienes memorizado) y una casilla "Mat." (componentes materiales). */
(function (A) {
  'use strict';
  const ui = A.ui, h = ui.h, CJ = A.reglas.conjuros || {};

  const porNombre = (a, b) => String(a.nombre).localeCompare(String(b.nombre), 'es');
  const NIVELES = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  /* Lanzadores activos con su lista por nivel y los espacios que tiene de cada uno. */
  function lanzadores(S) {
    const r = S.r, c = r.conjuros, out = [];
    const agrupa = lista => { const o = {}; lista.filter(sp => sp && !sp.faltante && sp.nv >= 1).forEach(sp => { (o[sp.nv] = o[sp.nv] || []).push(sp); }); Object.values(o).forEach(l => l.sort(porNombre)); return o; };
    if (c.mago.activo) out.push({ nombre: 'Mago', nivel: c.mago.nivel, espacios: c.mago.espacios, por: agrupa(c.mago.libro), tipo: 'Libro de conjuros' });
    if (c.hechicero.activo) {
      const sp = c.hechicero.niveles.flatMap(n => n.destinados.concat(n.elegidos).map(x => x.sp));
      out.push({ nombre: 'Hechicero', nivel: c.hechicero.nivel, espacios: null, maximos: c.hechicero.niveles.map(n => n.maximo), por: agrupa(sp), tipo: 'Conjuros conocidos' });
    }
    if (c.brujo && c.brujo.activo) out.push({ nombre: 'Brujo', nivel: c.brujo.nivel, espacios: c.brujo.espacios, por: agrupa(c.brujo.conocidos), tipo: 'Conjuros concedidos' });
    Object.values(c.clases).filter(x => x.activo && x.top > 0).forEach(x => {
      if (x.libroPropio) out.push({ nombre: x.nombre, nivel: x.nivel, espacios: x.espacios, por: agrupa(x.libro), tipo: 'Conjuros conocidos' });
      else if (x.tipo === 'divino' && x.acceso) out.push({ nombre: x.nombre, nivel: x.nivel, espacios: x.espacios, por: agrupa(S.reg.conjuros.filter(sp => CJ.enAcceso(sp, x.acceso, x.top))), tipo: 'Conjuros de tus esferas' });
    });
    return out;
  }

  const casilla = () => h('span', { class: 'h-casilla' });
  function tablaNivel(n, lista, espacios, maximo) {
    const info = espacios !== null && espacios !== undefined ? `${espacios[n - 1] || 0} espacio(s)` : (maximo ? `hasta ${maximo} conocidos` : '');
    return h('section', { class: 'h-nivelc' }, h('h2', { text: `Nivel ${n}${info ? ' · ' + info : ''}` }),
      h('table', { class: 'h-tabla h-conj' }, h('thead', {}, h('tr', {}, [h('th', { text: 'Conjuro' }), h('th', { class: 'c', text: 'Mem.' }), h('th', { class: 'c', text: 'Mat.' })])),
        h('tbody', {}, lista.map(sp => h('tr', {}, h('td', { text: sp.nombre + (sp.rev ? ' (inv.)' : '') }), h('td', { class: 'c' }, casilla()), h('td', { class: 'c' }, casilla()))),
          [0, 1].map(() => h('tr', { class: 'h-blanca' }, h('td', {}), h('td', { class: 'c' }, casilla()), h('td', { class: 'c' }, casilla()))))));
  }

  ui.hojaConjuros = function (S) {
    const L = lanzadores(S), pj = S.pj;
    if (!L.length) return [h('div', { class: 'h-pagina h-conjuros' }, h('header', { class: 'h-cab' }, h('h1', { text: pj.identidad.nombre || 'Sin nombre' }), h('p', { text: 'Hoja de conjuros: este personaje no tiene clases lanzadoras con conjuros.' })))];
    return L.map(x => {
      const niveles = NIVELES.filter(n => (x.por[n] || []).length);
      return h('div', { class: 'h-pagina h-conjuros' },
        h('header', { class: 'h-cab' }, h('h1', { text: `Hoja de conjuros · ${x.nombre}` }), h('p', { text: [pj.identidad.nombre || 'Sin nombre', `nivel ${x.nivel || '—'}`, x.tipo].join('  ·  ') })),
        h('p', { class: 'p', text: 'Mem. = cuántas veces tienes memorizado el conjuro. Mat. = casilla de componentes materiales.' }),
        niveles.length ? h('div', { class: 'h-conj-cols' }, niveles.map(n => tablaNivel(n, x.por[n], x.espacios, x.maximos && x.maximos[n - 1]))) : h('p', { class: 'p', text: 'Todavía no hay conjuros en esta lista.' }));
    });
  };
})(window.ADND);
