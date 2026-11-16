/* Pestaña Pericias: pericias sin arma (PNA) con catálogo, compra, mejoras, concedidas y objetivo calculado.
   Las reglas viven en js/core/pericias.js; las pericias propias se crean en Homebrew → Pericias. */
(function (A) {
  'use strict';
  const ui = A.ui, U = A.util, h = ui.h, N = () => A.reglas.noArmas;
  const sg = n => (n > 0 ? '+' + n : n < 0 ? '−' + Math.abs(n) : '0');
  const filtro = { q: '', cat: '', acceso: '', conceder: '', fuente: '' };
  const quitaAcentos = t => String(t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

  function hacer(S, fn) {
    let msg = null;
    S.cambiar(pj => { msg = fn(pj); }, { estructura: true });
    if (msg) S.aviso(msg, true);
  }

  function resumen(S) {
    const q = S.r.pericias, na = S.r.noArmas, nombres = [...na.cats].map(k => A.base.categoriasPericias[k]);
    return ui.bloque('Pericias sin arma',
      h('div', { class: 'armas-resumen' },
        h('div', {}, h('strong', { class: 'cifra', text: q.totalPNA }), h('span', { text: 'PNA generadas' })),
        h('div', {}, h('strong', { class: 'cifra', text: na.gastado }), h('span', { text: 'Gastadas aquí' })),
        h('div', {}, h('strong', { class: 'cifra' + (q.disponiblesPNA === 0 ? ' mal' : ''), text: q.disponiblesPNA }), h('span', { text: 'PNA disponibles' })),
        h('div', {}, h('strong', { class: 'cifra', text: na.lista.length }), h('span', { text: 'Pericias adquiridas' }))),
      h('p', { class: 'ayuda', text: `Categorías sin recargo: ${nombres.join(', ')}. Las de otra categoría cuestan +1 PNA al aprenderlas; cada mejora cuesta 1 PNA y suma 1 al objetivo, sin límite.${q.comprometidoPNA || q.gastadoPNA > na.gastado ? ' El saldo ya descuenta Ambidiestría y la lista manual de Progresión.' : ''}` }));
  }

  /* -------------------------------------------------------------- pericias del personaje */
  const num0 = v => Number(v) || 0;
  function tarjetaPropia(S, x) {
    if (!x.p) return h('div', { class: 'tarjeta-arma' }, h('strong', { text: 'Pericia desconocida' }), h('p', { class: 'meta', text: 'Ya no existe en tu biblioteca.' }),
      ui.boton('Quitar', () => hacer(S, pj => N().acc.quitar(pj, x.id)), 'chico peligro'));
    const p = x.p, o = x.o, propia = num0(o.mejoras) - (x.mejorasKit || 0);
    const objetivo = x.objetivo === null ? (p.car === 'NA' ? 'Sin prueba' : 'Especial') : `${x.objetivo} o menos`;
    const eleccion = [
      p.car === 'FUE/CAR' ? ui.select([{ v: 'FUE', t: 'FUE' }, { v: 'CAR', t: 'CAR' }], o.car, v => hacer(S, pj => N().acc.elegir(pj, x.id, 'car', v)), { 'data-foco': 'pn-car-' + x.id, 'aria-label': 'Característica de ' + p.nombre }) : null,
      (p.opciones || []).length ? ui.select(p.opciones.map(v => ({ v: String(v), t: sg(v) })), String(x.modificador), v => hacer(S, pj => N().acc.elegir(pj, x.id, 'mod', v)), { 'data-foco': 'pn-mod-' + x.id, 'aria-label': 'Modificador de ' + p.nombre }) : null
    ].filter(Boolean);
    return h('article', { class: 'tarjeta-arma' },
      h('div', { class: 'tarjeta-cab' },
        h('div', {}, h('strong', { text: p.nombre }), o.concedida ? h('span', { class: 'etiqueta', text: x.kit ? 'Gratis: ' + x.kit : 'Concedida' }) : null,
          h('div', { class: 'meta', text: `${p.car}${typeof p.mod === 'number' ? ' ' + sg(p.mod) : ''}${o.mejoras ? ' · mejoras +' + o.mejoras : ''} · ${x.costo} PNA gastadas${o.concedida && o.fuente ? ' · de ' + o.fuente : ''}` })),
        h('strong', { class: 'cifra', text: objetivo })),
      p.descripcion ? h('details', { class: 'desplegable' }, h('summary', { text: 'Descripción' }), h('p', { class: 'pericia-desc', text: p.descripcion }), p.fuente ? h('p', { class: 'meta', text: p.fuente }) : null) : null,
      x.soloKit ? h('div', { class: 'fila-edit' }, h('span', { class: 'meta', text: `La da tu clase o kit${x.mejorasKit ? ' con +' + x.mejorasKit : ''}: no gasta PNA. Para mejorarla o cambiar su opción, anótala.` }),
        ui.boton('Anotar para mejorarla', () => hacer(S, pj => N().acc.conceder(pj, S.reg, x.id, 'Gratis ' + x.kit)), 'chico', { 'data-foco': 'pn-anotar-' + x.id })) : null,
      !x.soloKit && eleccion.length ? h('div', { class: 'fila-edit' }, ...eleccion) : null,
      x.soloKit ? null : h('div', { class: 'fila-edit' },
        ui.boton('− Quitar mejora', () => hacer(S, pj => N().acc.mejorar(pj, 0, x.id, -1)), 'chico', { disabled: propia > 0 ? null : true, 'data-foco': 'pn-dn-' + x.id }),
        ui.boton('+ Mejorar (1 PNA)', () => hacer(S, pj => N().acc.mejorar(pj, S.r.pericias.disponiblesPNA, x.id, 1)), 'chico', { 'data-foco': 'pn-up-' + x.id }),
        ui.boton(o.concedida ? 'Quitar' : 'Quitar y reembolsar', () => hacer(S, pj => N().acc.quitar(pj, x.id)), 'chico peligro', { 'data-foco': 'pn-q-' + x.id })));
  }

  function propias(S) {
    const na = S.r.noArmas, reg = S.reg;
    const todas = reg.pericias.slice().sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
    const conceder = h('div', { class: 'fila-edit' },
      ui.select([{ v: '', t: 'Elige una pericia…' }].concat(todas.map(p => ({ v: p.id, t: p.nombre }))), filtro.conceder, v => { filtro.conceder = v; }, { 'data-foco': 'pn-conc', 'aria-label': 'Pericia a conceder' }),
      ui.texto(filtro.fuente, v => { filtro.fuente = v; }, { placeholder: 'Fuente: raza, kit, DJ…', 'data-foco': 'pn-conc-f', 'aria-label': 'Fuente de la pericia concedida' }),
      ui.boton('Conceder', () => { const id = filtro.conceder, f = filtro.fuente; if (!id) return; filtro.conceder = ''; filtro.fuente = ''; hacer(S, pj => N().acc.conceder(pj, reg, id, f)); }, 'primario', { 'data-foco': 'pn-conc-ok' }));
    const det = h('details', { class: 'desplegable' }, h('summary', { text: 'Pericias concedidas o bonificadas' }),
      h('p', { class: 'ayuda', text: 'Las que da tu raza, kit u otra fuente. La adquisición inicial cuesta 0 PNA; las mejoras siguen costando 1.' }), conceder);
    return ui.bloque('Tus pericias', det,
      na.lista.length ? h('div', { class: 'lista-armas' }, na.lista.map(x => tarjetaPropia(S, x))) : h('p', { class: 'vacio', text: 'Todavía no tienes pericias sin arma. Cómpralas del catálogo.' }));
  }

  /* ------------------------------------------------------------------------- catálogo */
  /* Secciones por característica (la que se tira): así se explora el catálogo sin saber el nombre. Cada pericia es una fila compacta
     que se despliega al tocarla. Con búsqueda o filtros activos se abren todas las secciones con resultados. */
  const SECCIONES = [['INT', 'Inteligencia (INT)'], ['SAB', 'Sabiduría (SAB)'], ['FUE', 'Fuerza (FUE)'], ['DES', 'Destreza (DES)'], ['CON', 'Constitución (CON)'], ['CAR', 'Carisma (CAR)'],
    ['FUE/CAR', 'Fuerza o Carisma'], ['SIN', 'Sin prueba o regla especial']];
  const seccionDe = p => (['NA', 'Especial'].includes(p.car) ? 'SIN' : p.car);
  const abiertas = {};   // clave de sección → true/false (lo que el jugador abrió o cerró a mano)

  function fila(S, p, info) {
    const c = info.consulta(p), tiene = S.pj.pericias.noArmas[p.id];
    const cats = p.cats.map(k => A.base.categoriasPericias[k]).join(', ');
    const prueba = c.objetivo === null ? (p.car === 'NA' ? 'Sin prueba normal' : 'Regla especial')
      : c.conocimiento && !tiene ? 'Requiere entrenamiento' : `Entrenada: ${c.objetivo} o menos${tiene ? '' : ` · sin entrenar: ${c.sinEntrenar} o menos (d20+4)`}`;
    const mod = (p.opciones || []).length ? p.opciones.map(sg).join(' o ') : typeof p.mod === 'number' ? sg(p.mod) : '';
    const detalle = h('div', { class: 'pericia-detalle', hidden: true },
      h('p', { class: 'meta', text: `${cats} · ${p.car}${mod ? ' ' + mod : ''}${c.acceso ? '' : ' · fuera de categoría'}${c.conocimiento ? ' · conocimiento' : ''}` }),
      h('p', { class: 'meta', text: prueba + (p.ingles && p.ingles !== p.nombre ? ' · ' + p.ingles : '') + (p.fuente ? ' · ' + p.fuente : '') + (p.nota ? ' · ' + p.nota : '') }),
      p.descripcion ? h('p', { class: 'pericia-desc', text: p.descripcion }) : null);
    const nombre = h('button', { type: 'button', class: 'pericia-nombre', 'aria-expanded': 'false', text: p.nombre, 'data-foco': 'pn-ver-' + p.id,
      onclick: () => { detalle.hidden = !detalle.hidden; nombre.setAttribute('aria-expanded', String(!detalle.hidden)); } });
    return h('div', { class: 'pericia-fila' + (tiene ? ' tengo' : '') },
      h('div', { class: 'pericia-linea' }, nombre,
        h('span', { class: 'meta pericia-res', text: `${p.car === 'NA' ? 'NA' : p.car}${mod ? ' ' + mod : ''}${c.acceso ? '' : ' · fuera'}` }),
        tiene ? h('span', { class: 'etiqueta', text: 'Adquirida' })
          : ui.boton(`Comprar (${c.costo})`, () => hacer(S, pj => N().acc.comprar(pj, S.reg, S.r.items, S.r.pericias.disponiblesPNA, p.id)), 'chico primario', { 'data-foco': 'pn-buy-' + p.id })),
      detalle);
  }

  function catalogo(S) {
    const lista = h('div', { class: 'pericias-secciones' }), pie = h('p', { class: 'meta' });
    const info = N().resumen(S.pj, S.reg, S.r.items, S.r.car, 0), cats = info.cats;
    const pintar = () => {
      const q = quitaAcentos(filtro.q), activo = !!(q || filtro.cat || filtro.acceso);
      const hit = S.reg.pericias.filter(p => (!q || quitaAcentos(p.nombre).includes(q) || quitaAcentos(p.ingles).includes(q))
        && (!filtro.cat || p.cats.includes(filtro.cat))
        && (!filtro.acceso || (filtro.acceso === 'normal') === p.cats.some(k => cats.has(k)))).sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
      const secciones = SECCIONES.map(([k, titulo]) => ({ k, titulo, items: hit.filter(p => seccionDe(p) === k) })).filter(x => x.items.length);
      lista.replaceChildren(...secciones.map(sec => {
        const d = h('details', { class: 'pericias-seccion' }, h('summary', { text: `${sec.titulo} · ${sec.items.length}` }), h('div', { class: 'pericias-filas' }, sec.items.map(p => fila(S, p, info))));
        d.open = activo || (abiertas[sec.k] === true);
        d.addEventListener('toggle', () => { if (!activo) abiertas[sec.k] = d.open; });
        return d;
      }));
      if (!hit.length) lista.replaceChildren(h('p', { class: 'vacio', text: 'Ninguna pericia coincide con la búsqueda.' }));
      pie.textContent = `${hit.length} pericia(s)${activo ? '' : ' en total. Abre una sección para verlas.'}`;
    };
    const buscar = ui.texto(filtro.q, v => { filtro.q = v; pintar(); }, { type: 'search', placeholder: 'Buscar pericia o nombre en inglés…', 'data-foco': 'pn-buscar', 'aria-label': 'Buscar pericia' });
    const porCat = ui.select([{ v: '', t: 'Todas las categorías' }].concat(Object.entries(A.base.categoriasPericias).map(([v, t]) => ({ v, t }))), filtro.cat, v => { filtro.cat = v; pintar(); }, { 'data-foco': 'pn-cat', 'aria-label': 'Categoría' });
    const porAcc = ui.select([{ v: '', t: 'Todo el catálogo' }, { v: 'normal', t: 'Acceso normal' }, { v: 'fuera', t: 'Fuera de categoría' }], filtro.acceso, v => { filtro.acceso = v; pintar(); }, { 'data-foco': 'pn-acc', 'aria-label': 'Acceso' });
    pintar();
    return ui.bloque('Catálogo',
      h('p', { class: 'ayuda', text: 'Agrupado por la característica que se tira. Toca una pericia para ver su prueba, su fuente y cómo se tira sin entrenar. Las de INT o SAB que no son Generales son de conocimiento y exigen entrenamiento; las demás, sin entrenar, llevan +4 al d20.' }),
      h('div', { class: 'rejilla g3' }, buscar, porCat, porAcc), pie, lista);
  }

  ui.paneles.pericias = S => h('div', { class: 'armas' }, resumen(S),
    h('div', { class: 'cols armas-cols' }, h('div', { class: 'col' }, propias(S)), h('div', { class: 'col' }, catalogo(S))));
})(window.ADND);
