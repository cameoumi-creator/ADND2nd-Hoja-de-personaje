/* Pestaña Dotes (regla opcional por personaje): dote de nacimiento, dote de humano y dotes compradas con puntos de dote (PD).
   La hoja solo marca: no cambia ningún número. Reglas en js/core/dotes.js. */
(function (A) {
  'use strict';
  const ui = A.ui, U = A.util, h = ui.h, D = () => A.reglas.dotes, X = () => A.reglas.dotes.acc;

  const fil = { q: '', grupo: '', coste: '', abiertos: new Set() };
  const hacer = (S, fn) => { let msg = null; S.cambiar(pj => { msg = fn(pj); }, { estructura: true }); if (msg) S.aviso(msg, true); };
  const lin = (et, v) => (v !== undefined && v !== null && v !== '' ? h('div', { class: 'cj-lin' }, h('strong', { text: et + ': ' }), String(v)) : null);
  const nombreGrupo = g => (A.base.dotes.grupos[g] || g);

  function detalleDote(S, d, extra) {
    const det = h('details', { class: 'cj-det', ontoggle: e => { if (e.target.open) fil.abiertos.add(d.id); else fil.abiertos.delete(d.id); } },
      h('summary', {}, extra || null, h('strong', { text: ' ' + d.nombre }), h('span', { class: 'meta', text: d.faltante ? '' : ` · ${nombreGrupo(d.grupo)} · coste ${d.coste}` })),
      h('div', { class: 'cj-cuerpo' }, h('p', { class: 'cj-efecto', text: d.efecto || '(sin descripción)' })));
    if (fil.abiertos.has(d.id)) det.open = true;
    return det;
  }
  const campoEleccion = (S, id, valor, et) => ui.campo(et || 'Elección o nota', ui.texto(valor || '', v => S.cambiar(pj => X().eleccion(pj, id, v)), { 'data-foco': 'dt-el-' + id, placeholder: 'Por ejemplo: fuego, bosque…' }), 'corto-c');

  /* ---------------------------------------------------------------- cabecera */
  function cabecera(S) {
    const caja = h('div', { class: 'dt-pd' }), av = h('ul', { class: 'avisos-lista' });
    S.enlaces.push(r => {
      const d = r.dotes; if (!d) return;
      caja.replaceChildren(h('strong', { class: 'cifra', text: `${d.pd.gastados} / ${d.pd.total}` }), h('span', { text: ' PD gastados' }),
        h('div', { class: 'meta', text: `Restan ${d.pd.restan}. Nivel ${d.nivel}: el próximo PD llega al nivel ${d.pd.siguiente}. Ganas 1 PD al empezar y 1 más cada 3 niveles.` }));
      av.replaceChildren(...d.avisos.map(a => h('li', { text: a }))); av.hidden = !d.avisos.length;
    });
    return ui.bloque('Puntos de dote', h('p', { class: 'ayuda', text: 'Regla opcional. La hoja solo marca las dotes del personaje: si una da un bono, aplícalo en el apartado que corresponda (Bonos, Combate, etc.).' }), caja, av);
  }

  /* ---------------------------------------------------------------- nacimiento */
  function nacimiento(S, d) {
    const filas = d.nacimiento, cuerpo = [];
    if (d.tablas.length > 1) cuerpo.push(ui.campo('Tabla de nacimiento', ui.select(d.tablas.map(t => ({ v: t.id, t: t.nombre + (t.origen === 'homebrew' ? ' (homebrew)' : '') })), d.tabla.id, v => hacer(S, pj => X().tabla(pj, v)), { 'data-foco': 'dt-tabla' })));
    cuerpo.push(h('p', { class: 'ayuda', text: 'Escribe lo que salió en el d100 (00 = 100) y la hoja te dice la dote. Si sale el 100, tira dos veces: agrega las dos tiradas con el botón.' }));
    const opcDotes = [{ v: '', t: '— o elige a mano —' }].concat(d.tabla.filas.map(f => ({ v: f.id, t: `${f.desde === f.hasta ? f.desde : f.desde + '–' + f.hasta} · ${f.nombre}` })));
    filas.forEach(f => {
      cuerpo.push(h('div', { class: 'dt-fila' },
        h('div', { class: 'fila-edit' },
          ui.numero(f.n, v => hacer(S, pj => X().nacTirada(pj, f.i, v)), { min: 0, max: 100, step: 1, class: 'corto', placeholder: 'd100', 'aria-label': 'Tirada d100 de nacimiento ' + (f.i + 1), 'data-foco': 'dt-n-' + f.i }),
          ui.select(opcDotes, f.fila && !f.n && f.n !== 0 ? f.fila.id : '', v => hacer(S, pj => X().nacDote(pj, f.i, v)), { 'aria-label': 'Dote de nacimiento a mano', 'data-foco': 'dt-nd-' + f.i }),
          ui.boton('Quitar', () => hacer(S, pj => X().nacQuitar(pj, f.i)), 'chico peligro', { 'data-foco': 'dt-nq-' + f.i })),
        f.fila ? h('div', { class: 'dt-res' }, h('strong', { text: f.fila.nombre }), h('span', { class: 'meta', text: ` · d100 ${f.fila.desde === f.fila.hasta ? f.fila.desde : f.fila.desde + '–' + f.fila.hasta}` }),
          h('p', { class: 'cj-efecto', text: f.fila.efecto }), campoEleccion(S, f.fila.id, f.eleccion)) : (f.n !== '' ? h('p', { class: 'error', text: 'Esa tirada no cae en la tabla.' }) : null)));
    });
    cuerpo.push(ui.boton('Agregar tirada', () => hacer(S, pj => X().nacAgregar(pj)), 'chico', { 'data-foco': 'dt-nag' }));
    if (!filas.length) cuerpo.push(h('p', { class: 'vacio', text: 'Aún no tiene dote de nacimiento.' }));
    if (d.tiene.psi) cuerpo.push(h('p', { class: 'dt-nota', text: 'Psiónica salvaje: el módulo está en Poderes → Psiónica → Talento salvaje.' }));
    if (d.tiene.magia) cuerpo.push(h('p', { class: 'dt-nota', text: 'Magia salvaje: las tablas están en Consulta → Magia salvaje (la oleada se dispara al llegar al 50% de daño; el atacante es el objetivo).' }));
    if (d.tiene.heroica) cuerpo.push(h('div', { class: 'dt-ayuda' }, h('strong', { text: 'Ascendencia Heroica: +1 a una característica al azar. ' }),
      h('div', { class: 'fila-edit' }, ui.campo('d6 (1 FUE · 2 DES · 3 CON · 4 INT · 5 SAB · 6 CAR)', ui.numero(d.heroica ? d.heroica.d6 : '', v => hacer(S, pj => X().heroica(pj, v)), { min: 1, max: 6, step: 1, class: 'corto', 'data-foco': 'dt-her' })),
        d.heroica ? h('span', { text: `→ +1 a ${A.STAT_NOMBRES[d.heroica.stat]} (${d.heroica.stat}). Aplícalo en Bonos.` }) : null)));
    if (d.tiene.divina) cuerpo.push(divina(S, d));
    return ui.bloque('Dote de nacimiento', cuerpo);
  }
  function divina(S, d) {
    const dv = d.divina, mits = d.tabla.mitologias;
    if (!mits.length) return h('p', { class: 'dt-nota', text: 'Ascendencia Divina: esta tabla no trae mitologías.' });
    const dios = dv.dios;
    return h('div', { class: 'dt-ayuda' }, h('strong', { text: 'Ascendencia Divina: ' }), 'la sangre de un dios. Tira el d100 de mitología y luego el dado del dios; si el DM no concede poder, el personaje toma Ascendencia Heroica.',
      h('div', { class: 'rejilla g3' },
        ui.campo('d100 de mitología (00 = 100)', ui.numero(dv.m, v => hacer(S, pj => X().divina(pj, 'm', v)), { min: 0, max: 100, step: 1, 'data-foco': 'dt-dv-m' })),
        ui.campo('Mitología (a mano)', ui.select([{ v: '', t: '—' }].concat(mits.map(m => ({ v: m.id, t: m.nombre }))), dv.mitId, v => hacer(S, pj => X().divina(pj, 'mito', v)), { 'data-foco': 'dt-dv-mito' })),
        ui.campo(dv.mito ? `Dado del dios (d${dv.mito.dioses.length})` : 'Dado del dios', ui.numero(dv.d, v => hacer(S, pj => X().divina(pj, 'd', v)), { min: 1, step: 1, 'data-foco': 'dt-dv-d' }))),
      dv.mito ? h('p', {}, h('strong', { text: dv.mito.nombre }), dios ? ` · dios nº ${dv.d}: ` : ' · ', dios ? h('strong', { text: dios }) : `tira 1d${dv.mito.dioses.length} para el dios.`) : null,
      dv.mito ? h('details', { class: 'cj-det' }, h('summary', { text: `Dioses de la mitología ${dv.mito.nombre.toLowerCase()} (${dv.mito.dioses.length})` }), h('p', { class: 'meta', text: dv.mito.dioses.map((x, i) => `${i + 1} ${x}`).join(' · ') })) : null,
      ui.campo('Poder concedido (según Legends & Lore)', ui.area(dv.nota, v => S.cambiar(pj => X().divina(pj, 'nota', v)), { rows: 2, 'data-foco': 'dt-dv-nota' })));
  }

  /* ---------------------------------------------------------------- humano */
  function humano(S, d) {
    if (!d.humanoRaza && !d.humano) return null;
    const uno = S.reg.dotes.filter(x => x.coste === 1);
    return ui.bloque('Dote de humano',
      h('p', { class: 'ayuda', text: 'Los humanos eligen una dote de coste 1 gratis, aparte de sus PD.' }),
      ui.campo('Dote', ui.select([{ v: '', t: '— Sin dote —' }].concat(uno.map(x => ({ v: x.id, t: `${x.nombre} · ${nombreGrupo(x.grupo)}` })), d.humano && !uno.some(x => x.id === d.humano.id) ? [{ v: d.humano.id, t: d.humano.nombre + ' (coste ' + d.humano.coste + ')' }] : []), d.humano ? d.humano.id : '', v => hacer(S, pj => X().humano(pj, v)), { 'data-foco': 'dt-humano' })),
      d.humano ? [h('p', { class: 'cj-efecto', text: d.humano.efecto }), d.humano.faltante ? null : campoEleccion(S, d.humano.id, d.humano.eleccion)] : null);
  }

  /* ---------------------------------------------------------------- compradas */
  function compradas(S, d) {
    const reg = S.reg, q = fil.q.trim().toLowerCase(), tienen = new Set(d.comprados.map(x => x.id));
    const lista = reg.dotes.filter(x => !tienen.has(x.id) && (!q || x.nombre.toLowerCase().includes(q)) && (!fil.grupo || x.grupo === fil.grupo) && (!fil.coste || String(x.coste) === fil.coste));
    return ui.bloque('Dotes',
      d.comprados.length ? h('ul', { class: 'cj-lista' }, d.comprados.map(x => h('li', { class: 'cj-mem' },
        h('span', { class: 'crece' }, detalleDote(S, x), x.faltante ? null : campoEleccion(S, x.id, x.eleccion)),
        ui.boton('Quitar', () => hacer(S, pj => X().quitar(pj, x.id)), 'chico peligro', { 'data-foco': 'dt-quitar-' + x.id })))) : h('p', { class: 'vacio', text: 'Aún no tiene dotes compradas.' }),
      h('h3', { class: 'co-sub', text: 'Agregar dotes' }),
      h('div', { class: 'co-filtros' },
        ui.texto(fil.q, v => { fil.q = v; S.render(); }, { type: 'search', placeholder: 'Buscar dote…', 'aria-label': 'Buscar dote', 'data-foco': 'dt-q' }),
        ui.select([{ v: '', t: 'Todos los grupos' }].concat(Object.entries(A.base.dotes.grupos).map(([v, t]) => ({ v, t }))), fil.grupo, v => { fil.grupo = v; S.render(); }, { 'aria-label': 'Grupo', 'data-foco': 'dt-g' }),
        ui.select([{ v: '', t: 'Cualquier coste' }].concat([1, 2, 3, 4].map(n => ({ v: String(n), t: 'Coste ' + n }))), fil.coste, v => { fil.coste = v; S.render(); }, { 'aria-label': 'Coste', 'data-foco': 'dt-c' })),
      h('p', { class: 'meta', text: `${lista.length} dote(s). Restan ${d.pd.restan} PD; puedes agregar una aunque no alcance, la hoja solo avisa.` }),
      h('div', { class: 'dt-cat' }, lista.map(x => h('div', { class: 'dt-item' }, detalleDote(S, x),
        ui.boton(`Agregar (${x.coste})`, () => hacer(S, pj => X().comprar(pj, reg, x.id)), 'chico primario', { 'data-foco': 'dt-add-' + x.id })))));
  }

  ui.paneles.dotes = S => {
    S.enlaces = S.enlaces || [];
    const d = S.r.dotes;
    return h('div', { class: 'dotes' },
      cabecera(S), nacimiento(S, d), humano(S, d), compradas(S, d),
      ui.bloque('Notas de dotes', ui.area(d.notas, v => S.cambiar(pj => X().notas(pj, v)), { rows: 3, 'data-foco': 'dt-notas', 'aria-label': 'Notas de dotes' })));
  };
})(window.ADND);
