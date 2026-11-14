/* Poderes → Psiónica: clase Psiónico (PSP, disciplinas, ciencias, devociones, modos defensivos, mantenimiento, recuperación) y talento salvaje.
   Reglas en js/core/psionica.js. La hoja solo lleva el control; las tiradas las hacen la mesa y el DM. */
(function (A) {
  'use strict';
  const ui = A.ui, h = ui.h, PS = () => A.reglas.psionica, X = () => A.reglas.psionica.acc;
  const cj = () => ui.cj;
  const hacer = (S, fn) => cj().hacer(S, fn);
  const signo = n => (n > 0 ? '+' : n < 0 ? '−' : '') + Math.abs(n);
  const sg = n => (n < 0 ? '−' : '+') + Math.abs(n);
  const abiertos = new Set();
  const rec = { act: 'dormir', horas: 8 };           // recuperación: actividad y horas
  const fil = { q: '', disc: '', tipo: '', puedo: true, sel: '' };   // aprender poderes
  const wild = { tabla: 'dev', d: '', res: null, elec: '', manual: '', manualQ: '' };   // talento: intérprete

  const NOMBRE_U = { round: 'round', turno: 'turno', hora: 'hora', 'día': 'día' };
  const objetivoTxt = o => (o ? `${o.car} ${o.atributo}${o.mod ? ' ' + signo(o.mod).replace('-', '−') : ''} = ${o.valor}` : '—');
  const costoTxt = p => (p.costo !== null && p.costo !== undefined ? String(p.costo) : p.inicio || '—');
  const mantTxt = p => (p.mant && p.mant !== 'n/d' ? p.mant : '—');

  function lin(et, v) { return v ? h('div', { class: 'cj-lin' }, h('strong', { text: et + ': ' }), String(v)) : null; }
  function cuerpoPoder(p) {
    return [lin('Disciplina', `${p.disc} · ${p.tipo === 'ciencia' ? 'ciencia' : 'devoción'}`), lin('Puntuación de poder', p.puntuacionTxt), lin('Costo de inicio', p.inicio), lin('Mantenimiento', p.mant), lin('Alcance', p.alcance), lin('Preparación', p.preparacion), lin('Área', p.area),
      lin('Prerrequisitos', p.prerrequisitosTxt), h('p', { class: 'cj-efecto', text: p.efecto || '(sin descripción)' }), p.riesgos ? h('p', { class: 'cj-efecto', text: 'Riesgos: ' + p.riesgos }) : null];
  }
  function detallePoder(p, extra) {
    const d = h('details', { class: 'cj-det', ontoggle: e => { if (e.target.open) abiertos.add(p.id); else abiertos.delete(p.id); } },
      h('summary', {}, extra || null, h('strong', { text: ' ' + p.nombre }), h('span', { class: 'meta', text: p.faltante ? ' · ya no existe' : ` · ${p.disc} · ${p.tipo === 'ciencia' ? 'ciencia' : 'devoción'}` })),
      p.faltante ? null : h('div', { class: 'cj-cuerpo' }, cuerpoPoder(p)));
    if (abiertos.has(p.id)) d.open = true;
    return d;
  }
  const reqLinea = p => (p.req && p.req.length ? h('div', { class: 'meta' }, 'Requisitos: ', p.req.map((r, i) => h('span', { class: r.cumplido === false ? 'req-falta' : '' }, (i ? ', ' : '') + r.texto + (r.cumplido === false ? ' (falta)' : r.cumplido ? ' ✓' : '')))) : null);

  /* Costo editable para los poderes sin costo numérico. */
  const costosManuales = {};
  function botonUsar(S, p, claveFoco, accion) {
    const sinNum = p.costo === null || p.costo === undefined;
    return h('span', { class: 'fila-edit' },
      sinNum ? ui.numero(costosManuales[p.id] === undefined ? '' : costosManuales[p.id], v => { costosManuales[p.id] = v; }, { min: 0, step: 1, placeholder: 'PSP', 'aria-label': 'Costo de ' + p.nombre, 'data-foco': 'ps-costo-' + claveFoco + '-' + p.id, title: 'Costo de inicio: ' + p.inicio }) : null,
      ui.boton(sinNum ? 'Usar' : `Usar (${p.costo})`, () => hacer(S, pj => accion(pj, p.id, sinNum ? costosManuales[p.id] : undefined)), 'chico primario', { 'data-foco': 'ps-usar-' + claveFoco + '-' + p.id }));
  }

  /* ---- activos / mantenimiento ---- */
  function activos(S, r, esTalento) {
    const lista = r.activos.filter(a => !!a.t === !!esTalento), tot = esTalento ? r.porRoundTalento : r.porRound, tag = esTalento ? 't' : 'p';
    return h('div', {},
      lista.length ? h('ul', { class: 'cj-lista' }, lista.map(a => h('li', { class: 'cj-mem' },
        h('span', { class: 'crece' }, detallePoder(a.poder)),
        ui.numero(a.n, v => S.cambiar(pj => X().ajustarMant(pj, a.i, v, a.u)), { min: 0, step: 1, 'aria-label': 'PSP de mantenimiento de ' + a.poder.nombre, 'data-foco': `ps-mn-${tag}-${a.i}` }),
        ui.select(['round', 'turno', 'hora', 'día'].map(u => ({ v: u, t: '/' + NOMBRE_U[u] })), a.u, v => hacer(S, pj => X().ajustarMant(pj, a.i, a.n, v)), { 'aria-label': 'Unidad de mantenimiento', 'data-foco': `ps-mu-${tag}-${a.i}` }),
        ui.boton('Soltar', () => hacer(S, pj => X().soltar(pj, a.i)), 'chico peligro', { 'data-foco': `ps-soltar-${tag}-${a.i}` })))) : h('p', { class: 'meta', text: 'No mantienes ningún poder.' }),
      h('p', { class: 'meta', text: `Costo de mantenimiento: ${Math.round(tot * 100) / 100} PSP por round.` }),
      h('div', { class: 'fila-edit' },
        [['Pasar un round', 1], ['Pasar un turno (10 rounds)', 10], ['Pasar una hora', 60]].map(([t, m]) => ui.boton(t, () => hacer(S, pj => X().pasar(pj, esTalento ? S.r.psionica : S.r.psionica, m, esTalento)), 'chico', { 'data-foco': `ps-pasar-${tag}-${m}` }))));
  }

  /* ---- recuperación ---- */
  function recuperacion(S, r, esTalento) {
    const calc = PS().recuperacion(rec.act, rec.horas), tag = esTalento ? 't' : 'p', dormir8 = PS().recuperacion('dormir', 8);
    const aplicar = (act, hs) => hacer(S, pj => (esTalento ? X().talentoRecuperar(pj, S.r.psionica, act, hs) : X().recuperar(pj, S.r.psionica, act, hs)));
    return h('div', {},
      h('div', { class: 'rejilla g3' },
        ui.campo('Actividad', ui.select(r.recuperacion.map(a => ({ v: a.id, t: `${a.nombre} (${a.hora}/h)` })), rec.act, v => { rec.act = v; S.render(); }, { 'data-foco': 'ps-rec-act-' + tag })),
        ui.campo('Horas', ui.numero(rec.horas, v => { rec.horas = v; }, { min: 0, step: 1, 'data-foco': 'ps-rec-h-' + tag })),
        h('div', { class: 'fila-edit' }, ui.boton(`Recuperar (+${calc.psp})`, () => aplicar(rec.act, rec.horas), 'primario', { 'data-foco': 'ps-rec-btn-' + tag }), ui.boton(`Dormir 8 horas (+${dormir8.psp})`, () => aplicar('dormir', 8), '', { 'data-foco': 'ps-rec-dormir-' + tag }))),
      h('p', { class: 'meta', text: `${calc.horas} hora(s) de "${calc.actividad.nombre.toLowerCase()}" recuperan ${calc.psp} PSP, sin pasar del máximo.` }));
  }

  /* ---- aprender poderes (catálogo en dos paneles) ---- */
  function catalogo(S, r, { puede, texto, accion, clave }) {
    const reg = S.reg, q = fil.q.trim().toLowerCase();
    const base = reg.poderesPsi.slice().sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
    const coincide = p => (!fil.disc || p.disc === fil.disc) && (!fil.tipo || p.tipo === fil.tipo) && (!q || p.nombre.toLowerCase().includes(q));
    const lista = base.filter(p => coincide(p) && (!puede || !fil.puedo || puede(p)));
    const ocultos = puede && fil.puedo ? base.filter(coincide).length - lista.length : 0;
    const iAct = Math.max(0, lista.findIndex(p => p.id === fil.sel)), act = lista[iAct] || null, sig = lista[iAct + 1] || lista[iAct - 1] || null;
    const col = h('div', { class: 'cj-lista-cat', role: 'group', 'aria-label': 'Poderes psiónicos' }, lista.map(p => h('button', { type: 'button', class: 'cj-item' + (act && act.id === p.id ? ' activo' : ''), 'aria-pressed': String(!!act && act.id === p.id), 'data-foco': `ps-sel-${clave}-${p.id}`, onclick: () => { fil.sel = p.id; S.render(); } },
      h('span', { text: p.nombre }), h('small', { text: `${p.disc} · ${p.tipo === 'ciencia' ? 'ciencia' : 'devoción'}` }))));
    const panel = h('div', { class: 'cj-panel-cat' }, act ? [h('h3', { text: act.nombre }), h('p', { class: 'meta', text: `${act.disc} · ${act.tipo === 'ciencia' ? 'ciencia' : 'devoción'} · inicio ${costoTxt(act)} · mantenimiento ${mantTxt(act)}` }),
      ui.boton(texto, () => { fil.sel = sig ? sig.id : ''; accion(act); }, 'primario', { 'data-foco': 'ps-aprender-' + clave }), h('div', { class: 'cj-cuerpo' }, cuerpoPoder(act))] : h('p', { class: 'vacio', text: 'No hay poderes con esos filtros.' }));
    return h('div', { class: 'cj-buscador' },
      h('div', { class: 'rejilla g4' },
        ui.campo('Buscar poder', ui.texto(fil.q, v => { fil.q = v; S.render(); }, { placeholder: 'Nombre…', 'data-foco': 'ps-buscar-' + clave })),
        ui.campo('Disciplina', ui.select([{ v: '', t: 'Todas' }].concat(reg.disciplinasPsi.map(d => ({ v: d.nombre, t: d.nombre }))), fil.disc, v => { fil.disc = v; S.render(); }, { 'data-foco': 'ps-f-disc-' + clave })),
        ui.campo('Tipo', ui.select([{ v: '', t: 'Ciencias y devociones' }, { v: 'ciencia', t: 'Ciencias' }, { v: 'devocion', t: 'Devociones' }], fil.tipo, v => { fil.tipo = v; S.render(); }, { 'data-foco': 'ps-f-tipo-' + clave })),
        puede ? h('label', { class: 'check' }, h('input', { type: 'checkbox', checked: fil.puedo, 'data-foco': 'ps-f-puedo-' + clave, onchange: e => { fil.puedo = e.target.checked; S.render(); } }), ' Solo los que puedo aprender') : null),
      h('p', { class: 'meta', text: `${lista.length} poder(es)${ocultos > 0 ? ` · ${ocultos} oculto(s) por no poder aprenderlos ahora` : ''}` }),
      h('div', { class: 'cj-dos' }, col, panel));
  }

  /* ---- secuelas y notas ---- */
  function secuelas(S, lista, a) {
    return [h('p', { class: 'ayuda', text: 'Anota lo que dejan los riesgos (el 20 natural o el 97–00 del talento): atributos perdidos, sordera, etc. La hoja no lo aplica sola.' }),
      lista.length ? h('ul', { class: 'cj-lista' }, lista.map((s, i) => h('li', { class: 'cj-mem' }, h('span', { class: 'crece' }, ui.texto(s.texto, v => S.cambiar(pj => a.texto(pj, i, v)), { maxlength: 300, placeholder: 'Qué pasó…', 'aria-label': 'Secuela ' + (i + 1), 'data-foco': `ps-sec-${a.tag}-${i}` })),
        ui.boton('Quitar', () => hacer(S, pj => a.quitar(pj, i)), 'chico peligro', { 'data-foco': `ps-sec-del-${a.tag}-${i}` })))) : h('p', { class: 'meta', text: 'Sin secuelas.' }),
      ui.boton('Anotar una secuela', () => hacer(S, pj => a.agregar(pj)), 'chico', { 'data-foco': 'ps-sec-nueva-' + a.tag })];
  }

  /* ------------------------------------------------------------------ Psiónico */
  function psionico(S) {
    const r = S.r.psionica, st = S.pj.psionica, reg = S.reg, L = r.limites;
    const cab = ui.bloque('Psiónico',
      !r.nivel ? h('p', { class: 'vacio', text: 'No tienes la clase Psiónico: agrégala en Progresión para ver tus PSP y cuántos poderes te tocan.' }) : null,
      h('div', { class: 'armas-resumen' },
        h('div', {}, h('strong', { class: 'cifra', text: r.nivel || '—' }), h('span', { text: 'Nivel' })),
        h('div', {}, h('strong', { class: 'cifra', text: r.psp.restan + ' / ' + r.psp.total }), h('span', { text: 'PSP' })),
        h('div', {}, h('strong', { class: 'cifra', text: `${r.disciplinas.length} / ${L.disciplinas}` }), h('span', { text: 'Disciplinas' })),
        h('div', {}, h('strong', { class: 'cifra', text: `${r.ciencias.length} / ${L.ciencias}` }), h('span', { text: 'Ciencias' })),
        h('div', {}, h('strong', { class: 'cifra', text: `${r.devociones.length} / ${L.devociones}` }), h('span', { text: 'Devociones' })),
        h('div', {}, h('strong', { class: 'cifra', text: `${r.defensas.length} / ${L.defensas}` }), h('span', { text: 'Modos defensivos' }))),
      h('p', { class: 'meta', text: `PSP = base por SAB (${r.stats.baseSab}) ${sg(r.stats.ajusteInt)} por INT ${sg(r.stats.ajusteCon)} por CON + (nivel − 1) × (10 ${sg(r.stats.ajusteSab)} por SAB). Requisitos de la clase: SAB 15, INT 12 y CON 11.` }),
      h('div', { class: 'rejilla g3' },
        ui.campo('Bono de PSP (±)', ui.numero(st.bonoPsp, v => hacer(S, pj => X().bono(pj, v)), { step: 1, 'data-foco': 'ps-bono' })),
        ui.campo('PSP gastados', ui.numero(st.gastados, v => S.cambiar(pj => X().gastados(pj, v)), { min: 0, step: 1, 'data-foco': 'ps-gastados' })),
        ui.campo('Motivo del bono', ui.texto(st.motivo, v => S.cambiar(pj => X().motivo(pj, v)), { maxlength: 300, placeholder: 'Objeto, evento…', 'data-foco': 'ps-motivo' }))));

    const rect = cj().plegable('ps-rec', 'Recuperar PSP', true, `${r.psp.restan} de ${r.psp.total}`, recuperacion(S, r, false));

    /* disciplinas */
    const discBloque = cj().plegable('ps-disc', 'Disciplinas', true, r.disciplinas.length ? r.disciplinas.map(d => d.nombre + (d.primaria ? ' (primaria)' : '')).join(', ') : 'ninguna',
      h('p', { class: 'ayuda', text: 'La primera disciplina que elijas es la primaria. Las secundarias no pueden igualar sus ciencias ni sus devociones.' }),
      h('div', { class: 'checks' }, r.disciplinasLista.map(d => { const on = st.disciplinas.includes(d.id), prim = on && st.disciplinas[0] === d.id; return h('span', { class: 'fila-edit' },
        h('label', { class: 'check' }, h('input', { type: 'checkbox', checked: on, 'data-foco': 'ps-d-' + d.id, onchange: e => hacer(S, pj => X().disciplina(pj, reg, S.r.psionica, d.id, e.target.checked)) }), ' ' + d.nombre),
        on && !prim ? ui.boton('Hacer primaria', () => hacer(S, pj => X().primaria(pj, d.id)), 'chico', { 'data-foco': 'ps-prim-' + d.id }) : null, prim ? h('em', { class: 'meta', text: 'primaria' }) : null); })));

    /* poderes conocidos */
    const tabla = (lista, titulo) => [h('h3', { text: titulo }), lista.length ? h('div', { class: 'tabla-scroll' }, h('table', { class: 'tabla equipo' }, h('thead', {}, h('tr', {}, ['Poder', 'Puntuación', 'Inicio', 'Mant.', ''].map(t => h('th', { scope: 'col', text: t })))),
      h('tbody', {}, lista.map(p => h('tr', {}, h('td', {}, detallePoder(p), reqLinea(p)), h('td', { text: p.faltante ? '' : objetivoTxt(p.objetivo) }), h('td', { text: p.faltante ? '' : costoTxt(p) }), h('td', { text: p.faltante ? '' : mantTxt(p) }),
        h('td', { class: 'acciones' }, p.faltante ? null : [botonUsar(S, p, 'p', (pj, id, c) => X().usar(pj, reg, S.r.psionica, id, c)),
          ui.boton('Mantener', () => hacer(S, pj => X().mantener(pj, reg, p.id)), 'chico', { 'data-foco': 'ps-mant-' + p.id }),
          ui.boton('Olvidar', () => hacer(S, pj => X().olvidar(pj, p.id)), 'chico peligro', { 'data-foco': 'ps-ol-' + p.id })])))))) : h('p', { class: 'meta', text: 'Ninguno todavía.' })];
    const conocidos = cj().plegable('ps-poderes', 'Poderes conocidos', true, `${r.ciencias.length} ciencias · ${r.devociones.length} devociones`,
      h('p', { class: 'ayuda', text: 'La puntuación de poder es tu atributo menos el modificador del poder (la mesa tira d20 contra ese número). "Usar" paga el costo de inicio; si no tiene costo numérico, anótalo a mano.' }),
      tabla(r.ciencias, 'Ciencias'), tabla(r.devociones, 'Devociones'));

    const defBloque = cj().plegable('ps-defensas', 'Modos defensivos', false, `${r.defensas.length} de ${L.defensas}`,
      h('div', { class: 'checks' }, r.defensasLista.map(d => h('label', { class: 'check' }, h('input', { type: 'checkbox', checked: st.defensas.includes(d.id), 'data-foco': 'ps-def-' + d.id, onchange: e => hacer(S, pj => X().defensa(pj, S.r.psionica, d.id, e.target.checked)) }), ' ' + d.nombre))),
      r.defensas.filter(d => d.poderData).map(d => detallePoder(d.poderData)));

    const act = cj().plegable('ps-activos', 'Poderes activos (mantenimiento)', true, r.activos.filter(a => !a.t).length ? `${r.porRound} PSP por round` : 'ninguno', activos(S, r, false));

    const nuevos = cj().plegable('ps-aprender', 'Aprender poderes', false, `${S.reg.poderesPsi.length} poderes en la biblioteca`,
      catalogo(S, r, { clave: 'p', texto: 'Aprender', puede: p => { const k = p.tipo === 'ciencia' ? 'ciencias' : 'devociones'; const dis = reg.disciplinasPsi.find(d => d.nombre === p.disc); return !st[k].includes(p.id) && (!r.nivel || (st[k].length < L[k] && (!dis || st.disciplinas.includes(dis.id)))); },
        accion: p => hacer(S, pj => X().aprender(pj, reg, S.r.psionica, p.id)) }));

    const notas = cj().plegable('ps-notas', 'Notas y secuelas', false, '', ui.campo('Notas psiónicas', ui.area(st.notas, v => S.cambiar(pj => X().notas(pj, v)), { rows: 4, placeholder: 'Cómo despertó tu talento, entrenamiento, entorno…', 'data-foco': 'ps-notas' })),
      h('h3', { text: 'Secuelas' }), secuelas(S, st.secuelas, { tag: 'p', texto: X().secuelaTexto, quitar: X().secuelaQuitar, agregar: X().secuelaAgregar }));
    return h('div', {}, cab, rect, discBloque, conocidos, act, defBloque, nuevos, notas);
  }

  /* ------------------------------------------------------------------ talento salvaje */
  const nombreTabla = t => (t === 'dev' ? 'Tabla 12 (devociones)' : 'Tabla 13 (ciencias)');
  function resultado(S, r) {
    const reg = S.reg, res = wild.res; if (!res) return null;
    const add = (id, origen) => hacer(S, pj => X().talentoPoder(pj, reg, id, origen));
    const origen = `${nombreTabla(res.tabla)}, ${res.n === 100 ? '00' : res.n}`;
    const opciones = (disc, tipo) => [{ v: '', t: 'Elige un poder…' }].concat(reg.poderesPsi.filter(p => (!disc || p.disc === disc) && (tipo === 'ambos' || p.tipo === 'devocion') && !r.talento.poderes.some(x => x.id === p.id)).sort((a, b) => a.nombre.localeCompare(b.nombre, 'es')).map(p => ({ v: p.id, t: `${p.nombre} (${p.disc}, ${p.tipo === 'ciencia' ? 'ciencia' : 'devoción'})` })));
    const elegir = (disc, tipo, etiqueta) => [ui.select(opciones(disc, tipo), wild.elec, v => { wild.elec = v; }, { 'aria-label': etiqueta || 'Elegir poder', 'data-foco': 'ps-w-elec' }),
      ui.boton('Añadir poder', () => { if (wild.elec) { const id = wild.elec; wild.elec = ''; add(id, origen); } }, 'chico primario', { 'data-foco': 'ps-w-elec-add' })];
    const sig = (tabla, t) => ui.boton(t, () => { wild.tabla = tabla; wild.d = ''; wild.res = null; S.render(); }, 'chico', { 'data-foco': 'ps-w-sig-' + tabla });
    const x = res.r; let cuerpo;
    if (x.k === 'poder') { const p = reg.poderPsi(x.id); cuerpo = [h('p', {}, 'Poder obtenido: ', h('strong', { text: x.nombre })), p ? ui.boton('Añadir poder', () => add(p.id, origen), 'chico primario', { 'data-foco': 'ps-w-add' }) : null]; }
    else if (x.k === 'texto') cuerpo = h('p', { text: 'Resultado: ' + x.texto + '. No coincide con la base: búscalo en "Añadir a mano".' });
    else if (x.k === 'elegir') cuerpo = [h('p', {}, `Elegir cualquier ${x.tipo === 'ambos' ? 'ciencia o devoción' : 'devoción'} de `, h('strong', { text: x.disc }), '.'), h('div', { class: 'fila-edit' }, elegir(x.disc, x.tipo))];
    else if (x.k === 'tirar') cuerpo = [h('p', {}, h('strong', { text: `Tira ${x.veces} ${x.veces === 1 ? 'vez' : 'veces'} en la ${nombreTabla(x.tabla)}.` })), sig(x.tabla, 'Preparar esa tabla')];
    else if (x.k === 'elegirN') cuerpo = [h('p', {}, h('strong', { text: `Elige ${x.n} ${x.tipo === 'devocion' ? (x.n === 1 ? 'devoción' : 'devociones') : (x.n === 1 ? 'poder (ciencia o devoción)' : 'poderes (ciencias o devociones)')}.` })), h('div', { class: 'fila-edit' }, elegir('', x.tipo))];
    else if (x.k === 'devLuego') cuerpo = [h('p', {}, h('strong', { text: 'Elige cualquier devoción; luego tira en la Tabla 13.' })), h('div', { class: 'fila-edit' }, elegir('', 'devocion')), sig('cien', 'Preparar Tabla 13')];
    else cuerpo = [h('p', {}, h('strong', { text: x.texto + '.' })), h('p', { class: 'meta', text: 'Añade los poderes que elijan la mesa y el DM (puedes repetir).' }), h('div', { class: 'fila-edit' }, elegir('', 'ambos'))];
    return h('div', { class: 'cj-panel-cat' }, h('h3', { text: `Resultado ${res.n === 100 ? '00' : String(res.n).padStart(2, '0')} · ${nombreTabla(res.tabla)}` }), cuerpo);
  }
  function salvaje(S) {
    const r = S.r.psionica, st = S.pj.psionica, t = st.talento, tl = r.talento, reg = S.reg, pot = tl.potencial;
    const cab = ui.bloque('Talento salvaje',
      h('p', { class: 'ayuda', text: 'Cualquier personaje puede despertar un talento psiónico salvaje. La hoja calcula el potencial y lleva el control; las tiradas las hace el DM.' }),
      h('div', { class: 'rejilla g3' },
        h('label', { class: 'check' }, h('input', { type: 'checkbox', checked: t.activo, 'data-foco': 'ps-w-activo', onchange: e => hacer(S, pj => X().talentoActivo(pj, e.target.checked)) }), ' Mi personaje tiene un talento salvaje'),
        ui.campo('Nivel en que lo obtuvo', ui.numero(t.nivelInicio, v => hacer(S, pj => X().talentoNivel(pj, v)), { min: 1, max: 99, step: 1, 'data-foco': 'ps-w-nivel' })),
        h('output', { class: 'fijo', text: `Nivel actual: ${tl.nivelActual}` })));
    const potencial = cj().plegable('ps-w-pot', 'Potencial', true, `${pot.final}%`,
      h('div', { class: 'tabla-scroll' }, h('table', { class: 'tabla equipo' }, h('thead', {}, h('tr', {}, ['Concepto', 'Dato', 'Ajuste'].map(c => h('th', { scope: 'col', text: c })))), h('tbody', {},
        [['Base', '—', '+1%'], ['SAB', S.r.car.SAB.total, '+' + pot.bonos.sab + '%'], ['INT', S.r.car.INT.total, '+' + pot.bonos.int + '%'], ['CON', S.r.car.CON.total, '+' + pot.bonos.con + '%'], ['Nivel', tl.nivelActual, '+' + pot.bonos.nivel + '%'],
          ['Total antes de ×½', '—', pot.bruto + '%'], ['×½ (una sola vez)', tl.noHumano && tl.claseX ? 'No humano + mago/sacerdote' : tl.noHumano ? 'No humano' : tl.claseX ? 'Mago o sacerdote' : 'No aplica', pot.mitad ? '×½' : '—'], ['Potencial final', '—', pot.final + '%']]
          .map(f => h('tr', {}, f.map(c => h('td', { text: String(c) }))))))),
      h('p', { class: 'meta', text: 'Base 1%. SAB, INT y CON: 16 = +1, 17 = +2, 18 o más = +3 cada una. Nivel 5–8 = +1; nivel 9 o más = +2. Mago, sacerdote o personaje no humano: ×½ una sola vez, redondeando hacia arriba.' }));
    /* intérprete */
    const interp = cj().plegable('ps-w-interp', 'Interpretar una tirada del DM', true, nombreTabla(wild.tabla),
      h('div', { class: 'rejilla g3' },
        ui.campo('Tabla', ui.select([{ v: 'dev', t: 'Tabla 12 — Devociones' }, { v: 'cien', t: 'Tabla 13 — Ciencias' }], wild.tabla, v => { wild.tabla = v; wild.res = null; S.render(); }, { 'data-foco': 'ps-w-tabla' })),
        ui.campo('Resultado del d100 (00 = 100)', ui.numero(wild.d, v => { wild.d = v; }, { min: 0, max: 100, step: 1, 'data-foco': 'ps-w-d' })),
        h('div', { class: 'fila-edit' }, ui.boton('Interpretar', () => { const x = PS().salvajeBuscar(wild.tabla, wild.d); if (!x) { S.aviso('Escribe un resultado entre 0 y 100.', true); return; } wild.res = x; wild.elec = ''; S.render(); }, 'primario', { 'data-foco': 'ps-w-interp' }))),
      resultado(S, r));
    /* manual */
    const q = wild.manualQ.trim().toLowerCase();
    const manualOps = [{ v: '', t: 'Elige un poder…' }].concat(reg.poderesPsi.filter(p => (!q || p.nombre.toLowerCase().includes(q)) && !tl.poderes.some(x => x.id === p.id)).sort((a, b) => a.nombre.localeCompare(b.nombre, 'es')).slice(0, 200).map(p => ({ v: p.id, t: `${p.nombre} (${p.disc}, ${p.tipo === 'ciencia' ? 'ciencia' : 'devoción'})` })));
    const manual = cj().plegable('ps-w-manual', 'Añadir a mano', false, '',
      h('div', { class: 'rejilla g3' }, ui.campo('Buscar', ui.texto(wild.manualQ, v => { wild.manualQ = v; S.render(); }, { placeholder: 'Nombre…', 'data-foco': 'ps-w-mq' })),
        ui.campo('Poder', ui.select(manualOps, wild.manual, v => { wild.manual = v; }, { 'data-foco': 'ps-w-msel' }), 'ancho2'),
        h('div', { class: 'fila-edit' }, ui.boton('Añadir poder', () => { if (wild.manual) { const id = wild.manual; wild.manual = ''; hacer(S, pj => X().talentoPoder(pj, reg, id, 'Manual')); } }, 'primario', { 'data-foco': 'ps-w-madd' }))));
    /* poderes y PSP */
    const filas = tl.poderes.map(p => h('tr', {}, h('td', {}, detallePoder(p), reqLinea({ req: [] })), h('td', { text: p.faltante ? '' : objetivoTxt(p.objetivo) }), h('td', { text: p.faltante ? '' : `${p.costoT.ini}${p.costoT.man ? ' + 4×' + p.costoT.man : ''} = ${p.costoT.total}` }), h('td', { text: p.origen || '—' }),
      h('td', { class: 'acciones' }, p.faltante ? null : [botonUsar(S, p, 't', (pj, id, c) => X().talentoUsar(pj, reg, S.r.psionica, id, c)),
        ui.boton('Mantener', () => hacer(S, pj => X().mantener(pj, reg, p.id, undefined, undefined, true)), 'chico', { 'data-foco': 'ps-w-mant-' + p.id }),
        ui.boton('Quitar', () => hacer(S, pj => X().talentoQuitar(pj, p.id)), 'chico peligro', { 'data-foco': 'ps-w-del-' + p.id })])));
    const poderes = cj().plegable('ps-w-poderes', 'Poderes del talento', true, `${tl.poderes.length} poder(es)`,
      tl.poderes.length ? h('div', { class: 'tabla-scroll' }, h('table', { class: 'tabla equipo' }, h('thead', {}, h('tr', {}, ['Poder', 'Puntuación', 'PSP necesarios', 'Origen', ''].map(c => h('th', { scope: 'col', text: c })))), h('tbody', {}, filas))) : h('p', { class: 'vacio', text: 'Sin poderes todavía: interpreta una tirada del DM o añade uno a mano.' }),
      tl.comoRequisito.length ? [h('h3', { text: 'Poderes obtenidos como prerrequisito' }), h('p', { class: 'ayuda', text: 'Los pide alguno de tus poderes. No cuentan como resultados directos de las tablas.' }), tl.comoRequisito.map(p => detallePoder(p))] : null);
    const pfp = cj().plegable('ps-w-pfp', 'PSP del talento', true, `${tl.pfp.restan} de ${tl.pfp.max}`,
      h('p', { class: 'ayuda', text: 'Para usar cada poder una vez más cuatro mantenimientos cuando correspondan (los costos que son nombres de otros poderes no se cobran dos veces), y +4 por cada nivel ganado después de despertarlo.' }),
      h('div', { class: 'armas-resumen' }, h('div', {}, h('strong', { class: 'cifra', text: tl.pfp.base }), h('span', { text: 'Base' })), h('div', {}, h('strong', { class: 'cifra', text: `${tl.pfp.niveles}` }), h('span', { text: `Niveles (${tl.pfp.posteriores} × 4)` })), h('div', {}, h('strong', { class: 'cifra', text: tl.pfp.max }), h('span', { text: 'Máximo' })), h('div', {}, h('strong', { class: 'cifra', text: tl.pfp.restan }), h('span', { text: 'Restantes' }))),
      h('div', { class: 'rejilla g3' }, ui.campo('PSP gastados', ui.numero(t.gastados, v => S.cambiar(pj => X().talentoGastados(pj, v)), { min: 0, step: 1, 'data-foco': 'ps-w-gastados' }))),
      h('h3', { text: 'Recuperar' }), recuperacion(S, r, true),
      h('h3', { text: 'Poderes activos (mantenimiento)' }), activos(S, r, true));
    const riesgos = cj().plegable('ps-w-riesgos', 'Riesgos y notas', false, '',
      h('p', { class: 'ayuda', text: 'Riesgos al liberar el potencial — 97: salvación contra muerte o SAB −1d6 permanente. 98: salvación contra muerte o INT −1d6. 99: salvación contra muerte o CON −1d6. 00: salvación contra muerte con −5 o SAB, INT y CON quedan en 3 permanentemente. La hoja no hace estas tiradas.' }),
      h('h3', { text: 'Secuelas' }), secuelas(S, t.secuelas, { tag: 't', texto: X().talentoSecuelaTexto, quitar: X().talentoSecuelaQuitar, agregar: X().talentoSecuelaAgregar }),
      ui.campo('Notas del talento', ui.area(t.notas, v => S.cambiar(pj => X().talentoNotas(pj, v)), { rows: 4, placeholder: 'Cómo despertó, qué lo detonó…', 'data-foco': 'ps-w-notas' })));
    return h('div', {}, cab, potencial, interp, manual, poderes, pfp, riesgos);
  }

  ui.psionica = (S, sub) => (sub === 'salvaje' ? salvaje(S) : psionico(S));
})(window.ADND);
