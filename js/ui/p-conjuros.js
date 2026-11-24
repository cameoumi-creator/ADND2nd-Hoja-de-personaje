/* Pestaña Conjuros: mago (libro, memorización o puntos, especialista) y hechicero (linaje, puntos). Reglas en js/core/conjuros.js. */
(function (A) {
  'use strict';
  const ui = A.ui, h = ui.h, CJ = () => A.reglas.conjuros;
  let sub = null;                      // 'mago' | 'hechicero'
  const abiertos = new Set();          // conjuros con el detalle abierto
    const elegir = { };                  // candidato elegido por nivel (hechicero)
  const prep = { };                    // conjuro elegido para memorizar por nivel

  function hacer(S, fn) { let msg = null; S.cambiar(pj => { msg = fn(pj); }, { estructura: true }); if (msg) S.aviso(msg, true); return !msg; }
  const nombreEsc = (reg, id) => (id === 'universal' ? 'Todas' : (reg.escuelaMagia(id) || { nombre: id }).nombre);
  const escuelasTxt = (reg, sp) => sp.escuelas.map(e => nombreEsc(reg, e)).join(', ');

  /* Cuerpo con todos los datos de un conjuro. */
  function cuerpoConjuro(S, sp) {
    const linea = (et, v) => (v ? h('div', { class: 'cj-lin' }, h('strong', { text: et + ': ' }), String(v)) : null);
    return [linea('Alcance', sp.alcance), linea('Componentes', sp.componentes), linea('Duración', sp.duracion), linea('Tiempo de lanzamiento', sp.tiempo), linea('Área de efecto', sp.area), linea('Salvación', sp.salvacion), linea('Material', sp.material), linea('Fuente', sp.fuente),
      h('p', { class: 'cj-efecto', text: sp.efecto || '(sin descripción)' }), sp.reverso ? h('p', { class: 'cj-efecto', text: 'Inverso: ' + sp.reverso }) : null];
  }
  /* Ficha completa de un conjuro, plegable. */
  function detalle(S, sp, extra) {
    const reg = S.reg;
    const d = h('details', { class: 'cj-det', ontoggle: e => { if (e.target.open) abiertos.add(sp.id); else abiertos.delete(sp.id); } },
      h('summary', {}, extra || null, h('strong', { text: ' ' + sp.nombre }), h('span', { class: 'meta', text: ` · nv ${sp.nv} · ${escuelasTxt(reg, sp)}${sp.esfera ? ' · ' + sp.esfera : ''}${sp.rev ? ' · reversible' : ''}` })),
      h('div', { class: 'cj-cuerpo' }, cuerpoConjuro(S, sp)));
    if (abiertos.has(sp.id)) d.open = true;
    return d;
  }

  /* Secciones que se pueden contraer; lo que dejes abierto o cerrado se recuerda. `porDefecto` solo vale mientras no las toques. */
  const PLEG = 'adnd-cj-pleg';
  let pleg = {}; try { pleg = JSON.parse(localStorage.getItem(PLEG) || '{}') || {}; } catch (e) { pleg = {}; }
  function plegable(id, titulo, porDefecto, resumen, ...contenido) {
    const abierto = pleg[id] === undefined ? porDefecto : !!pleg[id];
    const d = h('details', { class: 'bloque cj-plegable' },
      h('summary', { class: 'cj-pleg-cab', 'data-foco': 'cj-pleg-' + id }, h('h2', { text: titulo }), resumen ? h('span', { class: 'meta', text: resumen }) : null),
      h('div', { class: 'cj-pleg-cuerpo' }, contenido));
    d.open = abierto;
    /* Se guarda en el clic (antes de que el navegador alterne la sección) para no perder el estado si la ficha se redibuja enseguida. */
    d.firstChild.addEventListener('click', () => { pleg[id] = !d.open; try { localStorage.setItem(PLEG, JSON.stringify(pleg)); } catch (e) { /* sin almacenamiento */ } });
    return d;
  }

  /* Catálogo en dos paneles: lista compacta con desplazamiento (sin tope de resultados) y el detalle del conjuro marcado.
     ctx: { clave, lista (conjuros que se muestran), texto (botón; texto o función), accion(sp), puede(sp) opcional, esferas (filtra por esfera en vez de escuela) } */
  const filtros = {}, selCats = {}, scrolls = {};
  function buscador(S, ctx) {
    const reg = S.reg, F = filtros[ctx.clave] || (filtros[ctx.clave] = { q: '', nv: '0', esc: '', puedo: true }), q = F.q.trim().toLowerCase();
    const base = ctx.lista || reg.conjuros.filter(x => x.tipo === 'arcano');
    const coincide = x => (F.nv === '0' || String(x.nv) === F.nv) && (!F.esc || (ctx.esferas ? CJ().esferasDe(x).includes(F.esc) : x.escuelas.includes(F.esc))) && (!q || x.nombre.toLowerCase().includes(q));
    const lista = base.filter(x => coincide(x) && (!ctx.puede || !F.puedo || ctx.puede(x)));
    const ocultos = ctx.puede && F.puedo ? base.filter(coincide).length - lista.length : 0;
    const nvs = [{ v: '0', t: 'Todos los niveles' }].concat(Array.from({ length: 9 }, (_, i) => ({ v: String(i + 1), t: 'Nivel ' + (i + 1) })));
    const opcEsc = ctx.esferas ? [...new Set(base.flatMap(x => CJ().esferasDe(x)))].map(id => ({ v: id, t: CJ().nombreEsfera(id) })).sort((x, y) => x.t.localeCompare(y.t, 'es')) : reg.escuelasMagia.map(e => ({ v: e.id, t: e.nombre }));
    const escs = [{ v: '', t: ctx.esferas ? 'Todas las esferas' : 'Todas las escuelas' }].concat(opcEsc);
    const iActual = Math.max(0, lista.findIndex(x => x.id === selCats[ctx.clave])), actual = lista[iActual] || null;
    const etiqueta = sp => `nv ${sp.nv} · ${ctx.esferas ? (CJ().esferasDe(sp).map(CJ().nombreEsfera).join(', ') || '—') : escuelasTxt(reg, sp)}${sp.rev ? ' · rev.' : ''}`;
    const col = h('div', { class: 'cj-lista-cat', role: 'group', 'aria-label': 'Conjuros del catálogo' }, lista.map(sp => h('button', {
      type: 'button', class: 'cj-item' + (actual && actual.id === sp.id ? ' activo' : ''), 'aria-pressed': String(!!actual && actual.id === sp.id), 'data-foco': `cj-sel-${ctx.clave}-${sp.id}`, onclick: () => { selCats[ctx.clave] = sp.id; S.render(); }
    }, h('span', { text: sp.nombre }), h('small', { text: etiqueta(sp) }))));
    col.addEventListener('scroll', () => { scrolls[ctx.clave] = col.scrollTop; });
    requestAnimationFrame(() => { col.scrollTop = scrolls[ctx.clave] || 0; });
    const sig = lista[iActual + 1] || lista[iActual - 1] || null;
    const texto = actual ? (typeof ctx.texto === 'function' ? ctx.texto(actual) : ctx.texto) : '';
    const panel = h('div', { class: 'cj-panel-cat' }, actual ? [
      h('h3', { text: actual.nombre }), h('p', { class: 'meta', text: `Nivel ${actual.nv} · ${ctx.esferas ? (CJ().esferasDe(actual).map(CJ().nombreEsfera).join(', ') || '—') + ' · ' : ''}${escuelasTxt(reg, actual)}${actual.rev ? ' · reversible' : ''} · ${actual.fuente || ''}` }),
      ui.boton(texto, () => { selCats[ctx.clave] = sig ? sig.id : null; ctx.accion(actual); }, 'primario', { 'data-foco': 'cj-aprender-' + ctx.clave }),
      h('div', { class: 'cj-cuerpo' }, cuerpoConjuro(S, actual))] : h('p', { class: 'vacio', text: 'No hay conjuros con esos filtros.' }));
    return h('div', { class: 'cj-buscador' },
      h('div', { class: 'rejilla g4' },
        ui.campo('Buscar conjuro', ui.texto(F.q, v => { F.q = v; S.render(); }, { placeholder: 'Nombre…', 'data-foco': 'cj-buscar-' + ctx.clave })),
        ui.campo('Nivel', ui.select(nvs, F.nv, v => { F.nv = v; S.render(); }, { 'data-foco': 'cj-f-nv-' + ctx.clave })),
        ui.campo(ctx.esferas ? 'Esfera' : 'Escuela', ui.select(escs, F.esc, v => { F.esc = v; S.render(); }, { 'data-foco': 'cj-f-esc-' + ctx.clave })),
        ctx.puede ? h('label', { class: 'check' }, h('input', { type: 'checkbox', checked: F.puedo, 'data-foco': 'cj-f-puedo-' + ctx.clave, onchange: e => { F.puedo = e.target.checked; S.render(); } }), ' Solo los que puedo aprender') : null),
      h('p', { class: 'meta', text: `${lista.length} conjuro(s)${ocultos > 0 ? ` · ${ocultos} oculto(s) por no poder aprenderlos ahora` : ''}` }),
      h('div', { class: 'cj-dos' }, col, panel));
  }
  const signo = n => (n > 0 ? '+' : n < 0 ? '−' : '') + Math.abs(n);

  /* ------------------------------------------------------------------ mago */
  function mago(S) {
    const m = S.r.conjuros.mago, C = S.pj.conjuros.mago, reg = S.reg;
    const esps = [{ v: '', t: 'Sin especialidad (mago generalista)' }].concat(m.escuelasEsp.map(e => ({ v: e.id, t: `${e.especialista} — ${e.nombre}` })));
    const esp = m.especialidad, memorizando = m.modo === 'memorizar';
    const cab = ui.bloque('Mago',
      !m.nivel ? h('p', { class: 'vacio', text: 'No tienes la clase Mago: aquí se muestran los espacios al nivel 1 de ejemplo cuando la agregues. Puedes armar tu libro desde ya.' }) : null,
      h('div', { class: 'armas-resumen' },
        h('div', {}, h('strong', { class: 'cifra', text: m.nivel || '—' }), h('span', { text: 'Nivel de mago' })),
        h('div', {}, h('strong', { class: 'cifra', text: m.top || '—' }), h('span', { text: 'Nivel de conjuro máximo' })),
        h('div', {}, h('strong', { class: 'cifra', text: m.totalPreparados + ' / ' + m.totalEspacios }), h('span', { text: 'Preparados / espacios' })),
        h('div', {}, h('strong', { class: 'cifra', text: m.puntos.restan + ' / ' + m.puntos.total }), h('span', { text: 'Puntos de conjuro' }))),
      h('div', { class: 'rejilla g3' },
        ui.campo('Cómo lanzas', ui.select([{ v: 'memorizar', t: 'Memorizando conjuros' }, { v: 'puntos', t: 'Con puntos de conjuro (opcional)' }], m.modo, v => hacer(S, pj => CJ().acc.modo(pj, v)), { 'data-foco': 'cj-modo' })),
        ui.campo('Especialidad', ui.select(esps, m.escuela && esp ? m.escuela : '', v => hacer(S, pj => CJ().acc.escuela(pj, v)), { 'data-foco': 'cj-esc' })),
        h('div', { class: 'fila-edit' }, ui.boton('Descansar', () => hacer(S, pj => CJ().acc.descansar(pj)), 'primario', { 'data-foco': 'cj-descansar' }))),
      h('p', { class: 'meta', text: `Aprender conjuros (INT): ${m.baseAprender}% base · nivel máximo ${m.nivelINT || '—'} · hasta ${m.maxLibro || '—'} conjuros por nivel en el libro. Cada espacio vale tantos puntos como su nivel de conjuro.` }),
      h('div', { class: 'rejilla g3' },
        ui.campo('Bono de puntos (±)', ui.numero(C.bonoPuntos, v => hacer(S, pj => CJ().acc.bonoPuntos(pj, 'mago', v)), { step: 1, min: -99, max: 99, 'data-foco': 'cj-bono' })),
        ui.campo('Motivo del bono o de los extras', ui.texto(C.motivo, v => S.cambiar(pj => CJ().acc.motivo(pj, 'mago', v)), { placeholder: 'Anillo, maldición, evento…', maxlength: 300, 'data-foco': 'cj-motivo' }), 'ancho2')),
      m.modo === 'puntos' ? h('div', { class: 'rejilla g3' },
        ui.campo('Puntos gastados', ui.numero(C.gastados, v => S.cambiar(pj => CJ().acc.gastados(pj, 'mago', v)), { min: 0, step: 1, 'data-foco': 'cj-pgast' })),
        h('output', { class: 'fijo', text: `Te quedan ${m.puntos.restan} de ${m.puntos.total} puntos${m.bonoPuntos ? ` (incluye ${signo(m.bonoPuntos)} de bono)` : ''}` })) : null);

    const espBloque = ui.bloque('Especialista',
      esp ? [
        h('p', { class: 'ayuda', text: [
          esp.extra ? 'Un espacio extra por nivel de conjuro, que debe ser de tu escuela.' : 'Sin espacio extra por nivel.',
          `Al aprender: ${signo(esp.aprender.propio)}% con tu escuela y ${signo(esp.aprender.otras)}% con las demás.`,
          esp.salv.propio || esp.salv.ajeno ? `Salvaciones: ${signo(esp.salv.propio)} contra tu escuela y ${signo(esp.salv.ajeno)} para los demás contra tus conjuros de ella.` : 'Sin ajustes a las salvaciones, ni las tuyas ni las de tus blancos.'
        ].join(' ') }),
        h('p', { text: `${esp.nombreEspecialista}: escuelas prohibidas — ${esp.prohibidas.map(e => nombreEsc(reg, e)).join(', ') || 'ninguna'}.` }),
        m.rasgos.length ? h('ul', { class: 'cj-rasgos' }, m.rasgos.map(t => h('li', { text: t }))) : null,
        m.poderes.length ? h('label', { class: 'check' }, h('input', { type: 'checkbox', checked: !!m.opcionales, 'data-foco': 'cj-opc', onchange: e => hacer(S, pj => CJ().acc.opcionales(pj, e.target.checked)) }), ' Reglas opcionales de Player\'s Option: poderes de nivel 8/11/14 y magia salvaje prohibida') : h('label', { class: 'check' }, h('input', { type: 'checkbox', checked: !!m.opcionales, 'data-foco': 'cj-opc', onchange: e => hacer(S, pj => CJ().acc.opcionales(pj, e.target.checked)) }), ' Reglas opcionales de Player\'s Option'),
        h('div', {}, m.poderes.map(p => h('p', { class: 'cj-poder' + (p.activo ? '' : ' apagado') }, h('strong', { text: `Nivel ${p.nivel}${p.activo ? ' (activo)' : p.deAlcance ? ' (alcanzado, desactivado)' : ''}: ` }), p.texto)))
      ] : h('p', { class: 'vacio', text: 'Elige una especialidad arriba para ver sus bonos, escuelas prohibidas y poderes. Sin especialidad eres mago generalista.' }));

    /* ---- conjuros estudiados (por nivel de conjuro) ---- */
    const extras = Array.from({ length: 9 }, (_, i) => h('label', { class: 'mod' }, h('span', { text: 'Nv ' + (i + 1) }),
      ui.numero(C.extraEspacios[i + 1] || 0, v => hacer(S, pj => CJ().acc.extraEspacios(pj, i + 1, v)), { step: 1, min: -9, max: 9, 'aria-label': `Espacios extra de nivel ${i + 1}`, 'data-foco': 'cj-xe-' + (i + 1) })));
    const filas = m.niveles.map(n => {
      const cands = n.libro.filter(sp => !sp.faltante).map(sp => ({ v: sp.id, t: sp.nombre }));
      const sel = cands.some(c => c.v === prep[n.n]) ? prep[n.n] : (cands[0] ? cands[0].v : '');
      return h('article', { class: 'tarjeta-arma cj-nivel' + (n.exceso ? ' alerta' : '') },
        h('div', { class: 'tarjeta-cab' }, h('div', { class: 'crece' }, h('strong', { text: `Nivel ${n.n}` }),
          h('div', { class: 'meta', text: `${n.total} espacio(s)${n.extra || n.bono ? ` (${[n.base - n.bono ? `${n.base - n.bono} de tabla` : '', n.bono ? `${signo(n.bono)} extra del juego` : '', n.extra ? '1 de especialidad' : ''].filter(Boolean).join(' + ')})` : ''} · ${n.preparados} preparado(s) · faltan ${n.faltan}${memorizando ? ` · ${n.disponibles} sin lanzar` : ''}` }))),
        memorizando ? [
          n.memorizados.length ? h('ul', { class: 'cj-lista' }, n.memorizados.map(x => h('li', { class: 'cj-mem' + (x.usado ? ' usado' : '') },
            h('span', { class: 'crece' }, detalle(S, x.sp, x.inv ? h('em', { text: '(inverso)' }) : null)),
            x.sp.rev ? ui.boton(x.inv ? 'Forma normal' : 'Forma inversa', () => hacer(S, pj => CJ().acc.invertir(pj, reg, x.i)), 'chico', { 'data-foco': 'cj-inv-' + x.i }) : null,
            ui.boton(x.usado ? 'Recuperar' : 'Lanzar', () => hacer(S, pj => CJ().acc.usar(pj, x.i)), 'chico' + (x.usado ? '' : ' primario'), { 'data-foco': 'cj-usar-' + x.i }),
            ui.boton('Quitar', () => hacer(S, pj => CJ().acc.desmemorizar(pj, x.i)), 'chico peligro', { 'data-foco': 'cj-des-' + x.i })))) : h('p', { class: 'meta', text: 'Nada memorizado en este nivel.' }),
          cands.length && n.total ? h('div', { class: 'fila-edit' },
            ui.select(cands, sel, v => { prep[n.n] = v; }, { 'data-foco': 'cj-prep-' + n.n, 'aria-label': 'Conjuro a memorizar de nivel ' + n.n }),
            ui.boton('Memorizar', () => { const id = prep[n.n] && cands.some(c => c.v === prep[n.n]) ? prep[n.n] : sel; if (id) hacer(S, pj => CJ().acc.memorizar(pj, reg, S.r.conjuros, id, false)); }, 'chico', { 'data-foco': 'cj-mem-' + n.n })) : (n.total ? h('p', { class: 'meta', text: 'Agrega conjuros de este nivel a tu libro para memorizarlos (puedes repetir el mismo).' }) : null)
        ] : h('p', { class: 'meta', text: 'Modo de puntos: lanza desde tu libro.' }));
    });
    const estudiados = plegable('mago-estudiados', 'Conjuros estudiados', memorizando, `${m.totalPreparados} preparados de ${m.totalEspacios} espacios${m.bonoEspacios.some(Boolean) ? ' · con extras del juego' : ''}`,
      h('div', { class: 'campo' }, h('span', { class: 'campo-et', text: 'Espacios extra del juego por nivel de conjuro (±): objetos, eventos u otras razones fuera de la tabla' }), h('div', { class: 'mods' }, extras)),
      h('div', { class: 'lista-armas' }, filas));

    /* ---- libro ---- */
    const libroFilas = m.libro.map(sp => h('tr', { class: sp.prohibido ? 'alerta' : '' },
      h('td', {}, sp.faltante ? h('span', { class: 'meta', text: sp.id + ' (ya no existe)' }) : detalle(S, sp)),
      h('td', { text: sp.nv || '—' }), h('td', { text: sp.faltante ? '' : escuelasTxt(reg, sp) }),
      h('td', { text: sp.faltante ? '' : sp.prohibido ? 'Prohibido' : sp.aprender + '%' }),
      h('td', { class: 'acciones' },
        m.modo === 'puntos' && !sp.faltante ? ui.boton(`Lanzar (${sp.nv})`, () => hacer(S, pj => CJ().acc.lanzarPuntos(pj, reg, S.r.conjuros, sp.id)), 'chico primario', { 'data-foco': 'cj-lp-' + sp.id }) : null,
        ui.boton('Olvidar', () => hacer(S, pj => CJ().acc.olvidar(pj, sp.id)), 'chico peligro', { 'data-foco': 'cj-ol-' + sp.id }))));
    const libro = plegable('mago-libro', 'Libro de conjuros', !memorizando, `${m.libro.length} conjuro(s)`,
      h('p', { class: 'ayuda', text: 'Los conjuros que conoces. "Aprender" es tu probabilidad de aprenderlo según INT y especialidad.' }),
      m.libro.length ? h('div', { class: 'tabla-scroll' }, h('table', { class: 'tabla equipo' },
        h('thead', {}, h('tr', {}, ['Conjuro', 'Nv', 'Escuela', 'Aprender', ''].map(t => h('th', { scope: 'col', text: t })))), h('tbody', {}, libroFilas))) : h('p', { class: 'vacio', text: 'Tu libro está vacío. Abre "Aprender conjuros" para agregar.' }));

    const idsLibro = new Set(m.libro.map(x => x.id));
    const aprender = plegable('mago-aprender', 'Aprender conjuros', false, 'catálogo arcano',
      buscador(S, { clave: 'mago', texto: 'Aprender', accion: sp => hacer(S, pj => CJ().acc.aprender(pj, reg, S.r.conjuros, sp.id)),
        puede: sp => !idsLibro.has(sp.id) && (!m.nivel || sp.nv <= m.top) && (!m.nivelINT || sp.nv <= m.nivelINT) && !CJ().prohibido(esp, sp) }));
    return h('div', {}, cab, espBloque, estudiados, libro, aprender);
  }

  /* ------------------------------------------------------------------ hechicero */
  function hechicero(S) {
    const hc = S.r.conjuros.hechicero, reg = S.reg, H = S.pj.conjuros.hechicero;
    const extras = Array.from({ length: 9 }, (_, i) => h('label', { class: 'mod' }, h('span', { text: 'Nv ' + (i + 1) }),
      ui.numero(H.extraElegidos[i + 1] || 0, v => hacer(S, pj => CJ().acc.extraElegidos(pj, i + 1, v)), { step: 1, min: 0, max: 9, 'aria-label': `Conjuros elegidos extra de nivel ${i + 1}`, 'data-foco': 'cj-hx-' + (i + 1) })));
    const cab = ui.bloque('Hechicero',
      h('div', { class: 'armas-resumen' },
        h('div', {}, h('strong', { class: 'cifra', text: hc.nivel || '—' }), h('span', { text: 'Nivel de hechicero' })),
        h('div', {}, h('strong', { class: 'cifra', text: hc.top || '—' }), h('span', { text: 'Nivel de conjuro máximo' })),
        h('div', {}, h('strong', { class: 'cifra', text: hc.puntos.restan + ' / ' + hc.puntos.total }), h('span', { text: 'Puntos de conjuro' }))),
      h('p', { class: 'ayuda', text: 'El hechicero lanza sin memorizar: tiene 2 puntos por nivel y cada conjuro cuesta su nivel. Su linaje le da 2 conjuros por nivel de conjuro y él elige 2 más.' }),
      h('div', { class: 'rejilla g3' },
        ui.campo('Linaje', ui.select([{ v: '', t: '— elegir linaje —' }].concat(hc.linajes.map(l => ({ v: l.id, t: l.nombre }))), hc.linaje ? hc.linaje.id : '', v => hacer(S, pj => CJ().acc.linaje(pj, v)), { 'data-foco': 'cj-linaje' })),
        ui.campo('Puntos gastados', ui.numero(H.gastados, v => S.cambiar(pj => CJ().acc.gastados(pj, 'hechicero', v)), { min: 0, step: 1, 'data-foco': 'cj-hgast' })),
        h('div', { class: 'fila-edit' }, ui.boton('Descansar', () => hacer(S, pj => CJ().acc.descansar(pj)), 'primario', { 'data-foco': 'cj-hdescansar' }))),
      h('div', { class: 'rejilla g3' },
        ui.campo('Bono de puntos (±)', ui.numero(H.bonoPuntos, v => hacer(S, pj => CJ().acc.bonoPuntos(pj, 'hechicero', v)), { step: 1, min: -99, max: 99, 'data-foco': 'cj-hbono' })),
        ui.campo('Motivo del bono o de los extras', ui.texto(H.motivo, v => S.cambiar(pj => CJ().acc.motivo(pj, 'hechicero', v)), { placeholder: 'Objeto, maldición, evento…', maxlength: 300, 'data-foco': 'cj-hmotivo' }), 'ancho2')),
      h('output', { class: 'fijo', text: `Te quedan ${hc.puntos.restan} de ${hc.puntos.total} puntos${hc.bonoPuntos ? ` (incluye ${signo(hc.bonoPuntos)} de bono)` : ''}` }),
      h('div', { class: 'campo' }, h('span', { class: 'campo-et', text: 'Conjuros elegidos extra por nivel de conjuro (además de los 2 normales)' }), h('div', { class: 'mods' }, extras)),
      hc.linaje ? h('p', { class: 'meta', text: hc.linaje.desc }) : null);
    const hab = hc.linaje ? ui.bloque('Habilidades del linaje', h('div', { class: 'tabla-scroll' }, h('table', { class: 'tabla equipo' },
      h('thead', {}, h('tr', {}, ['Nivel', 'Habilidad', 'Efecto'].map(t => h('th', { scope: 'col', text: t })))),
      h('tbody', {}, hc.habilidades.map(x => h('tr', { class: x.activa ? '' : 'apagada' }, h('td', { text: x.nivel }), h('th', { scope: 'row', text: x.nombre + (x.activa ? '' : ' (aún no)') }), h('td', { text: x.texto }))))))) : null;
    const lanzar = (costo, foco) => ui.boton(`Lanzar (${costo})`, () => hacer(S, pj => CJ().acc.lanzarH(pj, S.r.conjuros, costo)), 'chico primario', { 'data-foco': foco });
    const filas = hc.niveles.map(n => {
      const cands = reg.conjuros.filter(x => x.tipo === 'arcano' && x.nv === n.n && !S.pj.conjuros.hechicero.elegidos.includes(x.id) && !n.destinados.some(d => d.sp.id === x.id)).map(x => ({ v: x.id, t: x.nombre }));
      const sel = cands.some(c => c.v === elegir[n.n]) ? elegir[n.n] : (cands[0] ? cands[0].v : '');
      return h('article', { class: 'tarjeta-arma cj-nivel' },
        h('div', { class: 'tarjeta-cab' }, h('div', { class: 'crece' }, h('strong', { text: `Nivel ${n.n}` }), h('div', { class: 'meta', text: n.abierto ? `Cuesta ${n.n} punto(s) · ${n.destinados.length} del linaje · ${n.elegidos.length} de ${n.maximo} elegido(s)` : 'Aún no abres este nivel' }))),
        h('ul', { class: 'cj-lista' },
          n.destinados.map((d, i) => h('li', { class: 'cj-mem' }, h('span', { class: 'crece' }, detalle(S, d.sp, h('em', { text: d.inv ? '(del linaje · inverso)' : '(del linaje)' }))), lanzar(d.costo, `cj-hl-${n.n}-${i}`))),
          n.elegidos.map((e, i) => h('li', { class: 'cj-mem' }, h('span', { class: 'crece' }, detalle(S, e.sp, h('em', { text: '(elegido)' }))), e.sp.faltante ? null : lanzar(e.costo, `cj-he-${n.n}-${i}`),
            ui.boton('Quitar', () => hacer(S, pj => CJ().acc.quitarElegido(pj, e.sp.id)), 'chico peligro', { 'data-foco': `cj-hq-${n.n}-${i}` })))),
        n.abierto && n.libres > 0 ? h('div', { class: 'fila-edit' },
          ui.select(cands, sel, v => { elegir[n.n] = v; }, { 'data-foco': 'cj-hsel-' + n.n, 'aria-label': 'Conjuro a elegir de nivel ' + n.n }),
          ui.boton(`Elegir (${n.libres} libre${n.libres > 1 ? 's' : ''})`, () => { const id = elegir[n.n] && cands.some(c => c.v === elegir[n.n]) ? elegir[n.n] : sel; if (id) hacer(S, pj => CJ().acc.elegir(pj, reg, S.r.conjuros, id)); }, 'chico', { 'data-foco': 'cj-hel-' + n.n })) : null);
    });
    return h('div', {}, cab, hab, h('div', { class: 'lista-armas' }, filas.length ? filas : h('p', { class: 'vacio', text: 'Agrega la clase Hechicero para abrir niveles de conjuro.' })));
  }

  /* ------------------------------------------------------------------ bardo y clases divinas */
  function lanzador(S, id) {
    const reg = S.reg, def = CJ().lanzador(id), r = S.r.conjuros.clases[id], st = S.pj.conjuros.clases[id], L = CJ().cl;
    const divino = def.tipo === 'divino', memorizando = r.modo === 'memorizar';
    const nombresEsf = l => (l.length ? l.map(CJ().nombreEsfera).join(', ') : 'ninguna');
    const sabTxt = divino ? (r.sab.some(Boolean) ? 'Conjuros adicionales por SAB ' + r.sabPuntaje + ': ' + r.sab.map((v, i) => (v ? `+${v} de nivel ${i + 1}${r.pendientes[i] ? ' (pendiente: aún no tienes ese nivel)' : ''}` : null)).filter(Boolean).join(', ') + '.' : `SAB ${r.sabPuntaje}: sin conjuros adicionales.`) + (r.fallo ? ` Fallo de conjuro por SAB baja: ${r.fallo}%.` : '') : '';
    const cab = ui.bloque(def.nombre,
      !r.nivel ? h('p', { class: 'vacio', text: `No tienes la clase ${def.nombre}: agrégala en Progresión para ver tus espacios.` }) : null,
      h('div', { class: 'armas-resumen' },
        h('div', {}, h('strong', { class: 'cifra', text: r.nivel || '—' }), h('span', { text: 'Nivel' })),
        h('div', {}, h('strong', { class: 'cifra', text: r.top || '—' }), h('span', { text: 'Nivel de conjuro máximo' })),
        h('div', {}, h('strong', { class: 'cifra', text: r.totalPreparados + ' / ' + r.totalEspacios }), h('span', { text: 'Preparados / espacios' })),
        h('div', {}, h('strong', { class: 'cifra', text: r.puntos.restan + ' / ' + r.puntos.total }), h('span', { text: 'Puntos de conjuro' }))),
      h('div', { class: 'rejilla g3' },
        ui.campo('Cómo lanzas', ui.select([{ v: 'memorizar', t: 'Memorizando conjuros' }, { v: 'puntos', t: 'Con puntos de conjuro (opcional)' }], r.modo, v => hacer(S, pj => L.modo(pj, id, v)), { 'data-foco': `cl-modo-${id}` })),
        h('div', { class: 'fila-edit' }, ui.boton('Descansar', () => hacer(S, pj => CJ().acc.descansar(pj)), 'primario', { 'data-foco': `cl-descansar-${id}` }))),
      divino ? h('p', { class: 'meta', text: sabTxt }) : h('p', { class: 'meta', text: `Aprender conjuros (INT): ${r.baseAprender}% base · nivel máximo ${r.nivelINT || '—'} · hasta ${r.maxLibro || '—'} conjuros por nivel en el libro. Cada espacio vale tantos puntos como su nivel.` }),
      divino ? null : null,
      h('div', { class: 'rejilla g3' },
        ui.campo('Bono de puntos (±)', ui.numero(st.bonoPuntos, v => hacer(S, pj => L.bono(pj, id, v)), { step: 1, min: -99, max: 99, 'data-foco': `cl-bono-${id}` })),
        ui.campo('Motivo del bono o de los extras', ui.texto(st.motivo, v => S.cambiar(pj => L.motivo(pj, id, v)), { placeholder: 'Objeto, maldición, evento…', maxlength: 300, 'data-foco': `cl-motivo-${id}` }), 'ancho2')),
      r.modo === 'puntos' ? h('div', { class: 'rejilla g3' },
        ui.campo('Puntos gastados', ui.numero(st.gastados, v => S.cambiar(pj => L.gastados(pj, id, v)), { min: 0, step: 1, 'data-foco': `cl-pgast-${id}` })),
        h('output', { class: 'fijo', text: `Te quedan ${r.puntos.restan} de ${r.puntos.total} puntos${r.bonoPuntos ? ` (incluye ${signo(r.bonoPuntos)} de bono)` : ''}` })) : null);

    /* ---- esferas, deidad y habilidades del dios (divinos) ---- */
    let esferas = null;
    if (divino) {
      const dd = r.deidad, tieneEsf = !!(dd && dd.esferas);
      const marcas = (cual) => h('div', { class: 'checks' }, A.listaEsferas().filter(e => !r.fijas.mayores.includes(e.id) && !r.fijas.menores.includes(e.id)).map(e => h('label', { class: 'check' },
        h('input', { type: 'checkbox', checked: st.esferas[cual].includes(e.id), 'data-foco': `cl-esf-${id}-${cual}-${e.id}`, onchange: ev => hacer(S, pj => L.esfera(pj, id, cual, e.id, ev.target.checked)) }), ' ' + e.nombre)));
      esferas = plegable('cl-esferas-' + id, 'Esferas, deidad y habilidades del dios', !r.acceso.mayores.length && !r.acceso.menores.length, `mayores: ${r.acceso.mayores.length} · menores: ${r.acceso.menores.length}`,
        h('p', { class: 'ayuda', text: `Esferas de la clase — mayores: ${nombresEsf(r.fijas.mayores)}; menores: ${nombresEsf(r.fijas.menores)}. Las mayores llegan hasta tu nivel máximo de conjuro; las menores, hasta el nivel 3.` }),
        h('div', { class: 'rejilla g3' }, ui.campo('Esferas adicionales', ui.select([{ v: 'manual', t: 'Las que elija a mano' }].concat(tieneEsf ? [{ v: 'deidad', t: `Las de mi deidad (${dd.nombre})` }] : []), tieneEsf ? st.fuente : 'manual', v => hacer(S, pj => L.fuente(pj, id, v)), { 'data-foco': `cl-fuente-${id}` }))),
        !r.acceso.mayores.length && !r.acceso.menores.length ? h('p', { class: 'aviso', text: 'Aún no tienes esferas: elige las mayores y menores de tu deidad (o toma las de la deidad registrada) para ver conjuros.' }) : null,
        !tieneEsf ? h('p', { class: 'meta', text: dd ? `Tu deidad (${dd.nombre}) no define esferas: agrégalas en Homebrew → Deidades para tomarlas de ahí.` : 'Elige una deidad en la pestaña Ficha, con esferas definidas en Homebrew → Deidades, para tomar sus esferas.' }) : null,
        tieneEsf && st.fuente === 'deidad' ? h('p', { text: `Deidad ${dd.nombre} — mayores: ${nombresEsf(dd.esferas.mayores)}; menores: ${nombresEsf(dd.esferas.menores)}.` }) : [
          h('div', { class: 'campo' }, h('span', { class: 'campo-et', text: 'Esferas mayores adicionales' }), marcas('mayores')),
          h('div', { class: 'campo' }, h('span', { class: 'campo-et', text: 'Esferas menores adicionales' }), marcas('menores'))],
        dd && dd.poderes ? h('p', { class: 'ayuda', text: `Poderes que da ${dd.nombre}: ${dd.poderes}` }) : null,
        ui.campo('Habilidades especiales que da tu dios', ui.area(st.notas, v => S.cambiar(pj => L.notas(pj, id, v)), { rows: 4, placeholder: 'Poderes, dominios, restricciones, favores…', 'data-foco': `cl-notas-${id}` })));
    }

    /* ---- conjuros estudiados ---- */
    const extras = Array.from({ length: 9 }, (_, i) => h('label', { class: 'mod' }, h('span', { text: 'Nv ' + (i + 1) }),
      ui.numero(st.extraEspacios[i + 1] || 0, v => hacer(S, pj => L.extra(pj, id, i + 1, v)), { step: 1, min: -9, max: 9, 'aria-label': `Espacios extra de nivel ${i + 1}`, 'data-foco': `cl-xe-${id}-${i + 1}` })));
    const accesibles = divino ? reg.conjuros.filter(x => CJ().enAcceso(x, r.acceso, r.top)) : [];
    const filas = r.niveles.map(n => {
      const cands = (divino ? accesibles.filter(x => x.nv === n.n) : n.libro.filter(x => !x.faltante)).map(x => ({ v: x.id, t: x.nombre })).sort((x, y) => x.t.localeCompare(y.t, 'es'));
      const sel = cands.some(c => c.v === prep[id + n.n]) ? prep[id + n.n] : (cands[0] ? cands[0].v : '');
      const partes = [n.base ? `${n.base} de tabla` : '', n.sab ? `${n.sab} por SAB` : '', n.bono ? `${signo(n.bono)} extra del juego` : ''].filter(Boolean);
      return h('article', { class: 'tarjeta-arma cj-nivel' + (n.exceso ? ' alerta' : '') },
        h('div', { class: 'tarjeta-cab' }, h('div', { class: 'crece' }, h('strong', { text: `Nivel ${n.n}` }),
          h('div', { class: 'meta', text: `${n.total} espacio(s)${partes.length > 1 ? ` (${partes.join(' + ')})` : ''}${n.pendiente ? ` · ${n.pendiente} por SAB pendiente(s) hasta abrir este nivel` : ''} · ${n.preparados} preparado(s) · faltan ${n.faltan}${memorizando ? ` · ${n.disponibles} sin lanzar` : ''}` }))),
        memorizando ? [
          n.memorizados.length ? h('ul', { class: 'cj-lista' }, n.memorizados.map(x => h('li', { class: 'cj-mem' + (x.usado ? ' usado' : '') },
            h('span', { class: 'crece' }, detalle(S, x.sp, x.inv ? h('em', { text: '(inverso)' }) : null)),
            x.sp.rev ? ui.boton(x.inv ? 'Forma normal' : 'Forma inversa', () => hacer(S, pj => L.invertir(pj, reg, id, x.i)), 'chico', { 'data-foco': `cl-inv-${id}-${x.i}` }) : null,
            ui.boton(x.usado ? 'Recuperar' : 'Lanzar', () => hacer(S, pj => L.usar(pj, id, x.i)), 'chico' + (x.usado ? '' : ' primario'), { 'data-foco': `cl-usar-${id}-${x.i}` }),
            ui.boton('Quitar', () => hacer(S, pj => L.desmemorizar(pj, id, x.i)), 'chico peligro', { 'data-foco': `cl-des-${id}-${x.i}` })))) : h('p', { class: 'meta', text: 'Nada memorizado en este nivel.' }),
          cands.length && n.total ? h('div', { class: 'fila-edit' },
            ui.select(cands, sel, v => { prep[id + n.n] = v; }, { 'data-foco': `cl-prep-${id}-${n.n}`, 'aria-label': 'Conjuro a memorizar de nivel ' + n.n }),
            ui.boton('Memorizar', () => { const sid = prep[id + n.n] && cands.some(c => c.v === prep[id + n.n]) ? prep[id + n.n] : sel; if (sid) hacer(S, pj => L.memorizar(pj, reg, S.r.conjuros, id, sid, false)); }, 'chico', { 'data-foco': `cl-mem-${id}-${n.n}` })) : (n.total ? h('p', { class: 'meta', text: divino ? 'No hay conjuros de este nivel en tus esferas.' : 'Agrega conjuros de este nivel a tu libro para memorizarlos (puedes repetir el mismo).' }) : null)
        ] : h('p', { class: 'meta', text: divino ? 'Modo de puntos: lanza desde "Lista de acceso".' : 'Modo de puntos: lanza desde tu libro.' }));
    });
    const estudiados = plegable('cl-estudiados-' + id, 'Conjuros estudiados', memorizando, `${r.totalPreparados} preparados de ${r.totalEspacios} espacios${r.bonoEspacios.some(Boolean) ? ' · con extras del juego' : ''}`,
      h('div', { class: 'campo' }, h('span', { class: 'campo-et', text: 'Espacios extra del juego por nivel de conjuro (±): objetos, eventos u otras razones fuera de la tabla' }), h('div', { class: 'mods' }, extras)),
      h('div', { class: 'lista-armas' }, filas.length ? filas : h('p', { class: 'vacio', text: 'Aún no tienes espacios de conjuros.' })));

    let resto;
    if (divino) {
      resto = plegable('cl-acceso-' + id, 'Lista de acceso', false, `${accesibles.length} conjuro(s) en tus esferas`,
        h('p', { class: 'ayuda', text: 'Los conjuros de tus esferas hasta tu nivel máximo. ' + (memorizando ? 'Memoriza aquí o desde la lista de cada nivel.' : 'Lanza con puntos desde aquí.') }),
        buscador(S, { clave: id, esferas: true, lista: accesibles, texto: sp => (memorizando ? 'Memorizar' : `Lanzar (${sp.nv})`), accion: sp => hacer(S, pj => (memorizando ? L.memorizar(pj, reg, S.r.conjuros, id, sp.id, false) : L.lanzarPuntos(pj, reg, S.r.conjuros, id, sp.id))) }));
    } else {
      const libroFilas = r.libro.map(sp => h('tr', {},
        h('td', {}, sp.faltante ? h('span', { class: 'meta', text: sp.id + ' (ya no existe)' }) : detalle(S, sp)), h('td', { text: sp.nv || '—' }), h('td', { text: sp.faltante ? '' : escuelasTxt(reg, sp) }), h('td', { text: sp.faltante ? '' : sp.aprender + '%' }),
        h('td', { class: 'acciones' },
          r.modo === 'puntos' && !sp.faltante ? ui.boton(`Lanzar (${sp.nv})`, () => hacer(S, pj => L.lanzarPuntos(pj, reg, S.r.conjuros, id, sp.id)), 'chico primario', { 'data-foco': `cl-lp-${id}-${sp.id}` }) : null,
          ui.boton('Olvidar', () => hacer(S, pj => L.olvidar(pj, id, sp.id)), 'chico peligro', { 'data-foco': `cl-ol-${id}-${sp.id}` }))));
      const libro = plegable('cl-libro-' + id, 'Libro de conjuros', !memorizando, `${r.libro.length} conjuro(s)`,
        h('p', { class: 'ayuda', text: 'Los conjuros que conoces. "Aprender" es tu probabilidad de aprenderlo según INT.' }),
        r.libro.length ? h('div', { class: 'tabla-scroll' }, h('table', { class: 'tabla equipo' }, h('thead', {}, h('tr', {}, ['Conjuro', 'Nv', 'Escuela', 'Aprender', ''].map(t => h('th', { scope: 'col', text: t })))), h('tbody', {}, libroFilas))) : h('p', { class: 'vacio', text: 'Tu libro está vacío. Abre "Aprender conjuros" para agregar.' }));
      const idsLibro = new Set(r.libro.map(x => x.id));
      const aprender = plegable('cl-aprender-' + id, 'Aprender conjuros', false, 'catálogo arcano',
        buscador(S, { clave: id, texto: 'Aprender', accion: sp => hacer(S, pj => L.aprender(pj, reg, S.r.conjuros, id, sp.id)), puede: sp => !idsLibro.has(sp.id) && (!r.nivel || sp.nv <= r.top) && (!r.nivelINT || sp.nv <= r.nivelINT) }));
      resto = [libro, aprender];
    }
    return h('div', {}, cab, esferas, estudiados, resto);
  }


  /* ------------------------------------------------------------------ brujo */
  function brujo(S) {
    const reg = S.reg, r = S.r.conjuros.brujo, st = S.pj.conjuros.brujo, B = CJ().br, min = n => (n === 1 ? '1 min' : n + ' min');
    const opcPactos = [{ v: '', t: 'Sin pacto' }].concat(r.pactos.map(x => ({ v: x.id, t: x.nombre })));
    const pa = r.pacto;
    const sabTxt = r.sab.some(Boolean) ? 'Conjuros adicionales por SAB ' + r.sabPuntaje + ': ' + r.sab.map((v, i) => (v ? `+${v} de nivel ${i + 1}${r.pendientes[i] ? ' (pendiente: aún no tienes ese nivel)' : ''}` : null)).filter(Boolean).join(', ') + '.' : `SAB ${r.sabPuntaje}: sin conjuros adicionales.`;
    const cab = ui.bloque('Brujo',
      !r.nivel ? h('p', { class: 'vacio', text: 'No tienes la clase Brujo: agrégala en Progresión para ver tus espacios y tus puntos de pacto.' }) : null,
      h('div', { class: 'armas-resumen' },
        h('div', {}, h('strong', { class: 'cifra', text: r.nivel || '—' }), h('span', { text: 'Nivel' })),
        h('div', {}, h('strong', { class: 'cifra', text: r.top || '—' }), h('span', { text: 'Nivel de conjuro máximo' })),
        h('div', {}, h('strong', { class: 'cifra', text: r.totalPreparados + ' / ' + r.totalEspacios }), h('span', { text: 'Preparados / espacios' })),
        h('div', {}, h('strong', { class: 'cifra', text: r.puntos.restan + ' / ' + r.puntos.total }), h('span', { text: 'Puntos de pacto' })),
        h('div', {}, h('strong', { class: 'cifra', text: signo(r.ajuste) }), h('span', { text: 'Reacción (CAR)' }))),
      h('div', { class: 'rejilla g3' },
        ui.campo('Pacto', ui.select(opcPactos, st.pacto, v => hacer(S, pj => B.pacto(pj, reg, v)), { 'data-foco': 'br-pacto' })),
        h('div', { class: 'fila-edit' }, ui.boton('Descansar', () => hacer(S, pj => CJ().acc.descansar(pj)), 'primario', { 'data-foco': 'br-descansar' }))),
      h('p', { class: 'meta', text: `CAR da los conjuros y los puntos de pacto; SAB decide cómo lanza. Bolsa de puntos = nivel + ajuste de reacción de CAR (mín. 1). Descansar renueva los conjuros lanzados, pero los puntos de pacto se recuperan pidiendo al patrón. ${sabTxt}${r.fallo ? ` Fallo de conjuro por SAB baja: ${r.fallo}%.` : ''}` }),
      h('div', { class: 'rejilla g3' },
        ui.campo('Bono de puntos (±)', ui.numero(st.bonoPuntos, v => hacer(S, pj => B.bono(pj, v)), { step: 1, min: -99, max: 99, 'data-foco': 'br-bono' })),
        ui.campo('Puntos gastados', ui.numero(st.gastados, v => S.cambiar(pj => B.gastados(pj, v)), { min: 0, step: 1, 'data-foco': 'br-gastados' })),
        ui.campo('Motivo del bono o de los extras', ui.texto(st.motivo, v => S.cambiar(pj => B.motivo(pj, v)), { placeholder: 'Objeto, maldición, evento…', maxlength: 300, 'data-foco': 'br-motivo' }))));

    /* ---- el pacto y su lista de patrón ---- */
    const nombreSp = id => { const sp = reg.conjuro(id); return sp ? `${sp.nombre} (nv ${sp.nv})` : id; };
    const bloquePacto = plegable('br-pacto', 'Tu pacto', true, pa ? pa.nombre : 'sin elegir', pa ? [
      pa.desc ? h('p', { text: pa.desc }) : null,
      h('p', { class: 'ayuda', text: `Lista de tu patrón — escuelas arcanas: ${pa.nombresEscuelas.join(', ') || 'ninguna'}; esferas divinas: ${pa.nombresEsferas.join(', ') || 'ninguna'}. Conjuros firma (siempre en la lista): ${pa.firma.map(nombreSp).join(', ') || 'ninguno'}.` })
    ] : h('p', { class: 'vacio', text: 'Elige un pacto arriba para ver sus técnicas y su lista de conjuros.' }));

    /* ---- técnicas ---- */
    const tec = plegable('br-tecnicas', 'Técnicas del pacto', true, `${r.tecnicas.filter(t => t.activa).length} de ${r.tecnicas.length} desbloqueadas`,
      h('p', { class: 'ayuda', text: 'Cada título desbloquea una técnica de tu pacto. Las activas cuestan puntos de pacto cada vez que las usas; las pasivas siempre están activas.' }),
      r.tecnicas.length ? h('div', { class: 'lista-armas' }, r.tecnicas.filter(t => t.nombre || t.efecto).map(t => h('article', { class: 'tarjeta-arma' + (t.activa ? '' : ' bloqueada') },
        h('div', { class: 'tarjeta-cab' }, h('div', { class: 'crece' }, h('strong', { text: `${t.nombre}` }),
          h('div', { class: 'meta', text: `${t.titulo} · nivel ${t.nivel} · ${t.pasiva ? 'pasiva' : `cuesta ${t.costo} punto${t.costo === 1 ? '' : 's'} de pacto`}${t.activa ? '' : ' · aún no la desbloqueas'}` })),
          t.activa && !t.pasiva ? ui.boton(`Usar (${t.costo})`, () => hacer(S, pj => B.tecnica(pj, S.r.conjuros.brujo, t.rango)), 'chico primario', { 'data-foco': 'br-tec-' + t.rango }) : null),
        h('p', { text: t.efecto })))) : h('p', { class: 'vacio', text: 'Sin pacto no hay técnicas.' }));

    /* ---- pedir puntos al patrón ---- */
    const u = r.historial[0];
    const pedir = plegable('br-pedir', 'Pedir puntos al patrón', true, `${r.puntos.restan} de ${r.puntos.total} puntos`,
      h('p', { class: 'ayuda', text: `Cada petición dura ${r.peticionMin} minutos. El patrón reacciona con 2d10 + tu ajuste de reacción de CAR (${signo(r.ajuste)}): 4 o menos es hostil (nada y pide un favor), 5–8 seco (nada), 9–12 indiferente (1 punto), 13–16 favorable (1d4 puntos), 17 o más entusiasta (2d4 puntos).` }),
      h('div', { class: 'fila-edit' }, ui.boton('Pedir al patrón', () => hacer(S, pj => B.pedir(pj, S.r.conjuros.brujo, n => 1 + Math.floor(Math.random() * n))), 'primario', { 'data-foco': 'br-pedir-btn' }),
        u ? h('output', { class: 'fijo', text: `Última: ${u.nombre} (${u.texto}) → ${u.puntos ? '+' + u.puntos + ' punto' + (u.puntos === 1 ? '' : 's') : 'sin puntos'}` }) : null),
      r.historial.length > 1 ? h('ul', { class: 'cj-lista' }, r.historial.slice(1).map(x => h('li', { class: 'meta', text: `${x.nombre} (${x.texto}) → ${x.puntos ? '+' + x.puntos : '0'}` }))) : null,
      r.historial.length ? ui.boton('Borrar historial', () => hacer(S, pj => B.limpiarHistorial(pj)), 'chico', { 'data-foco': 'br-hist-borrar' }) : null,
      h('h3', { text: 'Favores del patrón' }),
      r.favores.length ? h('ul', { class: 'cj-lista' }, r.favores.map((f, i) => h('li', { class: 'cj-mem' + (f.cumplido ? ' usado' : '') },
        h('label', { class: 'check' }, h('input', { type: 'checkbox', checked: f.cumplido, 'aria-label': 'Favor cumplido', 'data-foco': 'br-fav-ok-' + i, onchange: e => hacer(S, pj => B.favorHecho(pj, i, e.target.checked)) })),
        h('span', { class: 'crece' }, ui.texto(f.texto, v => S.cambiar(pj => B.favorTexto(pj, i, v)), { maxlength: 300, placeholder: 'Qué pide el patrón…', 'aria-label': 'Favor', 'data-foco': 'br-fav-' + i })),
        ui.boton('Quitar', () => hacer(S, pj => B.favorQuitar(pj, i)), 'chico peligro', { 'data-foco': 'br-fav-del-' + i })))) : h('p', { class: 'meta', text: 'Sin favores pendientes.' }),
      ui.boton('Anotar un favor', () => hacer(S, pj => B.favorAgregar(pj)), 'chico', { 'data-foco': 'br-fav-nuevo' }));

    /* ---- conjuros concedidos y preparados ---- */
    const extras = Array.from({ length: 9 }, (_, i) => h('label', { class: 'mod' }, h('span', { text: 'Nv ' + (i + 1) }),
      ui.numero(st.extraEspacios[i + 1] || 0, v => hacer(S, pj => B.extra(pj, i + 1, v)), { step: 1, min: -9, max: 9, 'aria-label': `Espacios extra de nivel ${i + 1}`, 'data-foco': 'br-xe-' + (i + 1) })));
    const filas = r.niveles.map(n => {
      const cands = n.conocidos.filter(x => !x.faltante).map(x => ({ v: x.id, t: x.nombre })).sort((x, y) => x.t.localeCompare(y.t, 'es'));
      const sel = cands.some(c => c.v === prep['br' + n.n]) ? prep['br' + n.n] : (cands[0] ? cands[0].v : '');
      const partes = [n.base ? `${n.base} de tabla` : '', n.sab ? `${n.sab} por SAB` : '', n.bono ? `${signo(n.bono)} extra del juego` : ''].filter(Boolean);
      return h('article', { class: 'tarjeta-arma cj-nivel' + (n.exceso ? ' alerta' : '') },
        h('div', { class: 'tarjeta-cab' }, h('div', { class: 'crece' }, h('strong', { text: `Nivel ${n.n}` }),
          h('div', { class: 'meta', text: `${n.total} espacio(s)${partes.length > 1 ? ` (${partes.join(' + ')})` : ''}${n.pendiente ? ` · ${n.pendiente} por SAB pendiente(s) hasta abrir este nivel` : ''} · ${n.preparados} preparado(s) · faltan ${n.faltan} · ${n.disponibles} sin lanzar · pedir cada uno toma ${min(n.minutosPorConjuro)}` }))),
        n.memorizados.length ? h('ul', { class: 'cj-lista' }, n.memorizados.map(x => h('li', { class: 'cj-mem' + (x.usado ? ' usado' : '') },
          h('span', { class: 'crece' }, detalle(S, x.sp, x.inv ? h('em', { text: '(inverso)' }) : null)),
          x.sp.rev ? ui.boton(x.inv ? 'Forma normal' : 'Forma inversa', () => hacer(S, pj => B.invertir(pj, reg, x.i)), 'chico', { 'data-foco': `br-inv-${x.i}` }) : null,
          ui.boton(x.usado ? 'Recuperar' : 'Lanzar', () => hacer(S, pj => B.usar(pj, x.i)), 'chico' + (x.usado ? '' : ' primario'), { 'data-foco': `br-usar-${x.i}` }),
          ui.boton('Quitar', () => hacer(S, pj => B.despreparar(pj, x.i)), 'chico peligro', { 'data-foco': `br-des-${x.i}` })))) : h('p', { class: 'meta', text: 'Nada preparado en este nivel.' }),
        cands.length && n.total ? h('div', { class: 'fila-edit' },
          ui.select(cands, sel, v => { prep['br' + n.n] = v; }, { 'data-foco': 'br-prep-' + n.n, 'aria-label': 'Conjuro a pedir de nivel ' + n.n }),
          ui.boton('Pedir (preparar)', () => { const sid = prep['br' + n.n] && cands.some(c => c.v === prep['br' + n.n]) ? prep['br' + n.n] : sel; if (sid) hacer(S, pj => B.preparar(pj, reg, S.r.conjuros.brujo, sid, false)); }, 'chico', { 'data-foco': 'br-mem-' + n.n })) :
          (n.total ? h('p', { class: 'meta', text: 'Tu patrón aún no te concede conjuros de este nivel: pídelos abajo.' }) : null));
    });
    const estudiados = plegable('br-preparados', 'Conjuros pedidos al patrón', true, `${r.totalPreparados} preparados de ${r.totalEspacios} espacios · ${min(r.minutosTotal)} de pedimento${r.minutosFaltan ? ` · faltan ${min(r.minutosFaltan)} por llenar` : ''}`,
      h('p', { class: 'ayuda', text: `Solo puedes pedir (preparar) conjuros que tu patrón ya te concedió. Cada uno toma 10 min × su nivel menos tu ajuste de reacción (${signo(r.ajuste)}), mínimo 1 min. El mismo conjuro se puede repetir en varios espacios.` }),
      h('div', { class: 'campo' }, h('span', { class: 'campo-et', text: 'Espacios extra del juego por nivel de conjuro (±)' }), h('div', { class: 'mods' }, extras)),
      h('div', { class: 'lista-armas' }, filas.length ? filas : h('p', { class: 'vacio', text: 'Aún no tienes espacios de conjuros.' })));

    /* ---- concedidos y pedir nuevos ---- */
    const conocidosIds = new Set(r.conocidos.map(x => x.id));
    const concedidos = plegable('br-concedidos', 'Conjuros concedidos', false, `${r.conocidos.length} conjuro(s)`,
      r.conocidos.length ? h('div', { class: 'tabla-scroll' }, h('table', { class: 'tabla equipo' }, h('thead', {}, h('tr', {}, ['Conjuro', 'Nv', 'Escuela', ''].map(t => h('th', { scope: 'col', text: t })))), h('tbody', {}, r.conocidos.map(sp => h('tr', {},
        h('td', {}, sp.faltante ? h('span', { class: 'meta', text: sp.id + ' (ya no existe)' }) : detalle(S, sp)), h('td', { text: sp.nv || '—' }), h('td', { text: sp.faltante ? '' : escuelasTxt(reg, sp) }),
        h('td', { class: 'acciones' }, ui.boton('Olvidar', () => hacer(S, pj => B.olvidar(pj, sp.id)), 'chico peligro', { 'data-foco': 'br-ol-' + sp.id }))))))) : h('p', { class: 'vacio', text: 'Tu patrón aún no te ha concedido conjuros. Pídele alguno en "Pedir conjuros nuevos".' }));
    const pacto = pa ? reg.pacto(pa.id) : null;
    const accesibles = pacto ? reg.conjuros.filter(x => CJ().enPacto(x, pacto, r.top)) : [];
    const nuevos = plegable('br-nuevos', 'Pedir conjuros nuevos', false, pacto ? `${accesibles.length} conjuro(s) en la lista de tu patrón` : 'elige un pacto',
      h('p', { class: 'ayuda', text: 'Pedir un conjuro nuevo al patrón cuesta tantos puntos de pacto como su nivel. Solo puedes pedir los de la lista de tu pacto hasta tu nivel de conjuro máximo.' }),
      pacto ? [h('div', { class: 'fila-edit' }, ui.boton('Concedido sin costo (lo da el DM)', () => { sinCosto = !sinCosto; S.render(); }, 'chico' + (sinCosto ? ' primario' : ''), { 'data-foco': 'br-sincosto', 'aria-pressed': String(sinCosto) }), h('span', { class: 'meta', text: sinCosto ? 'Modo activo: el siguiente conjuro no gasta puntos.' : '' })),
        buscador(S, { clave: 'brujo', lista: accesibles, texto: sp => (sinCosto ? 'Agregar (sin costo)' : `Pedir al patrón (${sp.nv} pt${sp.nv === 1 ? '' : 's'})`), accion: sp => hacer(S, pj => B.pedirNuevo(pj, reg, S.r.conjuros.brujo, sp.id, sinCosto)), puede: sp => !conocidosIds.has(sp.id) })] :
        h('p', { class: 'vacio', text: 'Elige un pacto para ver su lista de conjuros.' }));

    const notas = plegable('br-notas', 'Notas del pacto', false, '', ui.campo('Lo que da y lo que pide tu patrón', ui.area(st.notas, v => S.cambiar(pj => B.notas(pj, v)), { rows: 4, placeholder: 'Obligaciones, tabúes, el nombre del patrón, lo que ofreciste…', 'data-foco': 'br-notas' })));
    return h('div', {}, cab, bloquePacto, tec, pedir, estudiados, concedidos, nuevos, notas);
  }
  let sinCosto = false;

  /* Pestaña "Poderes": cuatro grupos (Arcano, Divino, Pacto, Psiónica) y dentro de cada uno sus clases. Las que tu personaje usa salen primero. */
  const GRUPOS = [
    ['arcano', 'Arcano', [['mago', 'Mago'], ['hechicero', 'Hechicero'], ['bardo', 'Bardo']]],
    ['divino', 'Divino', [['sacerdote', 'Sacerdote'], ['sacerdote_sp', 'Sacerdote SP'], ['druida', 'Druida'], ['paladin', 'Paladín'], ['explorador', 'Explorador']]],
    ['pacto', 'Pacto', [['brujo', 'Brujo']]],
    ['psionica', 'Psiónica', [['psionico', 'Psiónico'], ['salvaje', 'Talento salvaje']]]
  ];
  const activa = (r, k) => (k === 'mago' ? r.mago.activo : k === 'hechicero' ? r.hechicero.activo : k === 'brujo' ? !!(r.brujo && r.brujo.activo) : r.clases[k] ? r.clases[k].activo : false);
  let grupo = null;
  ui.paneles.conjuros = S => {
    const r = S.r.conjuros, ps = S.r.psionica;
    const usa = (g, k) => (g === 'psionica' ? (k === 'salvaje' ? ps.talento.activo : ps.activo && (ps.psionico || k === 'psionico')) : activa(r, k));
    const grupoActivo = g => g[2].some(([k]) => usa(g[0], k));
    if (!grupo || !GRUPOS.some(g => g[0] === grupo)) { const g = GRUPOS.find(grupoActivo) || GRUPOS[0]; grupo = g[0]; }
    const G = GRUPOS.find(g => g[0] === grupo);
    if (!sub || !G[2].some(([k]) => k === sub)) sub = (G[2].find(([k]) => usa(grupo, k)) || G[2][0])[0];
    const gtabs = h('div', { class: 'subpestanas', role: 'tablist', 'aria-label': 'Tipo de poder' }, GRUPOS.map(g => h('button', { type: 'button', role: 'tab', class: 'subpestana' + (grupoActivo(g) ? '' : ' apagada'), 'aria-selected': String(grupo === g[0]), text: g[1], 'data-foco': 'cj-grupo-' + g[0], onclick: () => { grupo = g[0]; sub = null; S.render(); } })));
    const tabs = G[2].length > 1 ? h('div', { class: 'subpestanas', role: 'tablist', 'aria-label': G[1] }, G[2].slice().sort((a, b) => (usa(grupo, b[0]) ? 1 : 0) - (usa(grupo, a[0]) ? 1 : 0)).map(([id, t]) => h('button', { type: 'button', role: 'tab', class: 'subpestana' + (usa(grupo, id) ? '' : ' apagada'), 'aria-selected': String(sub === id), text: t, 'data-foco': 'cj-sub-' + id, onclick: () => { sub = id; S.render(); } }))) : null;
    const cuerpo = grupo === 'psionica' ? ui.psionica(S, sub) : sub === 'hechicero' ? hechicero(S) : sub === 'mago' ? mago(S) : sub === 'brujo' ? brujo(S) : lanzador(S, sub);
    return h('div', { class: 'conjuros' }, gtabs, tabs, cuerpo);
  };
  ui.cj = { plegable, hacer, signo };
})(window.ADND);
