/* Pestaña Armas: dominio (competencias y especialización), estilos de combate y las armas físicas del personaje.
   Las reglas viven en js/core/armas.js; aquí solo se dibuja y se llaman sus acciones. */
(function (A) {
  'use strict';
  const ui = A.ui, U = A.util, h = ui.h, R = () => A.reglas.armas;

  const sel = { dominio: '', instancia: '' };      // selecciones pendientes (sobreviven al redibujar)
  let sub = 'dominio';                             // pestaña interna de Entrenamiento
  const abiertos = new Set();                      // <details> abiertos
  const sg = n => (n > 0 ? '+' + n : n < 0 ? '−' + Math.abs(n) : '0');

  function detalles(clave, titulo, lineas) {
    const d = h('details', { class: 'desplegable' }, h('summary', { text: titulo }), h('ul', { class: 'desglose' }, lineas.map(t => h('li', { text: t }))));
    d.open = abiertos.has(clave);
    d.addEventListener('toggle', () => { if (d.open) abiertos.add(clave); else abiertos.delete(clave); });
    return d;
  }

  /* Ejecuta una acción de R.armas.acc sobre el personaje; si no se puede, avisa con el motivo. */
  function hacer(S, fn) {
    let msg = null;
    S.cambiar(pj => { msg = fn(pj, S.reg, S.r.armas.ctx, S.r.armas.capacidad); }, { estructura: true });
    if (msg) S.aviso(msg, true);
  }

  function pips(total, actual, alClick, etiqueta, foco, deshabilitado) {
    return h('span', { class: 'pips', role: 'group', 'aria-label': etiqueta },
      Array.from({ length: total }, (_, i) => h('button', {
        type: 'button', class: 'pip' + (actual > i ? ' on' : ''), text: i + 1, 'aria-pressed': String(actual > i),
        'aria-label': `${etiqueta} ${i + 1}`, 'data-foco': `${foco}-${i + 1}`, disabled: deshabilitado && deshabilitado(i + 1) ? true : null,
        onclick: () => alClick(i + 1)
      })));
  }
  const stepper = (valor, alCambiar, etiqueta, foco) => h('span', { class: 'stepper' },
    ui.boton('−', () => alCambiar(-1), 'chico', { 'aria-label': 'Restar ' + etiqueta, 'data-foco': foco + '-m' }),
    h('output', { text: sg(valor), 'aria-label': etiqueta }),
    ui.boton('+', () => alCambiar(1), 'chico', { 'aria-label': 'Sumar ' + etiqueta, 'data-foco': foco + '-p' }));

  /* ------------------------------------------------------------------ resumen */
  function resumen(S) {
    const a = S.r.armas, c = a.costos, mal = a.libres < 0;
    return ui.bloque('Pericias de arma',
      h('div', { class: 'armas-resumen' },
        h('div', {}, h('strong', { class: 'cifra' + (mal ? ' mal' : ''), text: a.libres }), h('span', { text: 'PA libres' })),
        h('div', {}, h('strong', { class: 'cifra', text: c.total + ' / ' + a.capacidad }), h('span', { text: 'PA gastados' })),
        h('div', {}, h('strong', { class: 'cifra', text: a.ctx.mejor }), h('span', { text: 'Especialización máx.' })),
        h('div', {}, h('strong', { class: 'cifra', text: a.ctx.oportunidades }), h('span', { text: 'Oportunidades (1 cada 3 niv.)' })),
        h('div', {}, h('strong', { class: 'cifra', text: a.rt.etiqueta }), h('span', { text: 'RT base · ' + a.rt.origen }))),
      h('p', { class: 'ayuda', text: `Dominio ${c.dominio} PA · estilos ${c.estilos} PA · combinaciones ${c.combos} PA. Los PA salen de tus pericias de arma (pestaña Progresión), menos las armas que anotaste a mano.` }));
  }

  /* ------------------------------------------------------------------- dominio */
  function dominioArmas(S) {
    const a = S.r.armas, reg = S.reg;
    const grupos = reg.gruposArmas().map(g => ({ grupo: g, items: reg.armas.filter(x => x.grupo === g).map(x => ({ v: x.id, t: x.nombre })) })).filter(g => g.items.length);
    const select = ui.select([{ v: '', t: 'Elige un arma…' }].concat(grupos), sel.dominio, v => { sel.dominio = v; }, { 'data-foco': 'dom-sel', 'aria-label': 'Arma a aprender' });
    const lista = a.dominio.length ? a.dominio.map(d => h('div', { class: 'tarjeta-arma' },
      h('div', { class: 'tarjeta-cab' },
        h('div', {}, h('strong', { text: d.nombre }), h('span', { class: 'etiqueta', text: d.nombreEsp }), d.kit ? h('span', { class: 'etiqueta', text: 'Del kit: ' + d.kit }) : null,
          h('div', { class: 'meta', text: `${d.grupo || 'Arma desconocida'} · especialización efectiva ${d.efectiva} · ${d.pagada} comprada(s) de ${a.ctx.oportunidades} posibles${d.regalada ? ' · ' + d.regalada + ' otorgada(s)' : ''}${d.kit ? ' · gratis (no gasta PA)' : ''}` })),
        d.id.startsWith('am:') ? h('span', { class: 'etiqueta', text: 'Arte marcial' }) : d.soloKit ? h('span', { class: 'meta', text: 'No se puede quitar' }) : ui.boton('Quitar', () => hacer(S, pj => R().acc.quitarArma(pj, d.id)), 'chico peligro', { 'data-foco': 'dom-q-' + d.id })),
      h('div', { class: 'fila-pips' },
        h('span', { text: 'Especialización' }), pips(5, d.efectiva, n => hacer(S, (pj, reg2, ctx, cap) => R().acc.especializar(pj, reg2, ctx, cap, d.id, n)), 'Especialización de ' + d.nombre, 'esp-' + d.id, n => n > a.ctx.mejor || !!d.soloKit)),
      h('div', { class: 'fila-pips' },
        h('span', { text: 'Otorgada' }), pips(5, d.regalada, n => hacer(S, (pj, reg2, ctx) => R().acc.regalarEsp(pj, ctx, d.id, n)), 'Especialización otorgada de ' + d.nombre, 'reg-' + d.id, n => n > a.ctx.mejor || !!d.soloKit),
        d.regalada ? ui.texto(d.origen, v => S.cambiar(pj => R().acc.origenEsp(pj, d.id, v)), { placeholder: 'De dónde viene (kit, DJ…)', 'data-foco': 'org-' + d.id, 'aria-label': 'Origen de la especialización otorgada' }) : null)))
      : [h('p', { class: 'vacio', text: 'Todavía no sabes usar ningún arma por separado.' })];
    return h('div', {},
      h('p', { class: 'ayuda', text: 'Competencia individual = 1 PA. Una competencia vuelve familiares las demás armas de su grupo (+2 al ataque en vez de +4 sin competencia).' }),
      h('div', { class: 'fila-edit' }, select, ui.boton('Agregar competencia', () => { const v = sel.dominio; if (!v) return; sel.dominio = ''; hacer(S, (pj, reg2, ctx, cap) => R().acc.anadirArma(pj, reg2, ctx, cap, v)); }, 'primario', { 'data-foco': 'dom-add' })),
      h('div', { class: 'lista-armas' }, lista));
  }

  function gruposArmas(S) {
    const a = S.r.armas;
    return h('div', {},
      h('p', { class: 'ayuda', text: 'Competencia de grupo = 2 PA: cubre todas las armas del grupo. Con ella puedes especializar al grupo entero.' }),
      h('div', { class: 'tabla-cont' }, h('table', { class: 'tabla grupos' },
        h('thead', {}, h('tr', {}, ['Grupo', 'Competencia', 'Especialización'].map(t => h('th', { scope: 'col', text: t })))),
        h('tbody', {}, a.grupos.map(g => h('tr', {},
          h('th', { scope: 'row', text: g.grupo }),
          h('td', {}, g.kit && !(S.pj.armas.grupos[g.grupo] || {}).comp ? h('span', { class: 'etiqueta', text: 'Del kit: ' + g.kit }) : ui.boton(g.comp ? 'Quitar' : `Comprar (${g.deltaComp >= 0 ? '+' : ''}${g.deltaComp} PA)`, () => hacer(S, (pj, reg2, ctx, cap) => R().acc.grupoComp(pj, reg2, ctx, cap, g.grupo)), g.comp ? 'chico peligro' : 'chico', { 'data-foco': 'g-c-' + g.grupo })),
          h('td', {}, g.comp ? pips(2, g.spec, n => hacer(S, (pj, reg2, ctx, cap) => R().acc.grupoEsp(pj, reg2, ctx, cap, g.grupo, n)), 'Especialización de grupo ' + g.grupo, 'g-e-' + g.grupo, n => (n > g.tope && n > g.kitEsp) || n <= g.kitEsp) : h('span', { class: 'meta', text: g.conocidas ? `${g.conocidas} arma(s) sueltas` : '—' }))))))));
  }

  /* -------------------------------------------------------------------- estilos */
  function estilos(S) {
    const a = S.r.armas;
    const est = a.estilos.map(e => h('div', { class: 'tarjeta-arma' },
      h('div', { class: 'tarjeta-cab' }, h('div', {}, h('strong', { text: e.nombre }), h('div', { class: 'meta', text: `${e.natural ? 'Acceso natural' : 'Fuera de tu categoría: +1 PA al aprender'} · tope actual ${e.tope}` })),
        pips(e.max, e.nivel, n => hacer(S, (pj, reg, ctx, cap) => R().acc.estilo(pj, reg, ctx, cap, e.id, n)), 'Nivel de ' + e.nombre, 'est-' + e.id, n => n > e.tope && n > e.nivel)),
      h('div', { class: 'fila-edit' }, ui.campo('Niveles gratis (modificador externo)', ui.numero(e.extra, v => S.cambiar(pj => R().acc.estiloExtra(pj, e.id, v), { estructura: true }), { min: 0, max: e.max, step: 1, class: 'corto', 'data-foco': 'est-extra-' + e.id }), 'corto-c'),
        e.extra ? h('span', { class: 'meta', text: `Total efectivo: nivel ${e.total} (${e.pagado} pagado + ${e.extra} gratis)` }) : null),
      e.total ? h('ul', { class: 'desglose' }, e.niveles.slice(0, e.total).map((t, i) => h('li', { text: `${i + 1}. ${t}${i >= e.pagado ? ' (gratis)' : ''}` }))) : null));
    const cmb = a.combos.map(c => h('div', { class: 'tarjeta-arma' + (c.natural ? '' : ' apagada') },
      h('div', { class: 'tarjeta-cab' }, h('div', {}, h('strong', { text: c.nombre }), h('div', { class: 'meta', text: (c.natural ? 'Acceso natural a ambos' : 'No combinable: falta acceso natural') + ' · tope ' + c.tope })),
        pips(4, c.nivel, n => hacer(S, (pj, reg, ctx, cap) => R().acc.combo(pj, reg, ctx, cap, c.clave, n)), 'Nivel de combinación ' + c.nombre, 'cmb-' + c.clave, n => !c.natural || n > c.tope))));
    return h('div', {},
      h('p', { class: 'ayuda', text: 'Los niveles gratis no cuestan PA (úsalos para bonos de un objeto, raza, deidad, etc.). Cada nivel de estilo pagado cuesta 1 PA por casilla (+1 PA en total si el estilo no es natural de tu clase) y se compra en orden; puedes subir un nivel cada 3 niveles de personaje.' }),
      h('div', { class: 'lista-armas' }, est), h('h3', { text: 'Combinar estilos' }), h('div', { class: 'lista-armas' }, cmb));
  }

  /* -------------------------------------------------------------- armas físicas */
  function tarjeta(S, x, n) {
    const i = x.inst, nombreArma = x.arma ? x.arma.nombre : 'Arma desconocida', esEscudo = !!(x.arma && x.arma.escudo);
    const mod = fn => S.cambiar(pj => { const t = pj.armas.instancias.find(k => k.id === i.id); if (t) fn(t); }, { estructura: true });
    const paso = (campo, d, min, max) => mod(t => { t[campo] = U.clamp(t[campo] + d, min, max); });
    const campo = (et, campoN, min, max) => h('label', { class: 'campo' }, h('span', { class: 'campo-et', text: et }), stepper(i[campoN], d => paso(campoN, d, min, max), et, `i-${n}-${campoN}`));
    const lin = partes => partes.map(p => p.base ? `${p.et}: ${p.v}` : `${p.et}: ${typeof p.v === 'number' ? sg(p.v) : p.v}`);
    const enPar = S.r.armas.escudo && (S.r.armas.escudo.inst === i ? 'Escudo equipado' : S.r.armas.escudo.arma === i ? 'Con escudo' : '');

    const stats = h('div', { class: 'cifras-arma' },
      h('div', {}, h('small', { text: 'GAC0' }), h('strong', { class: 'cifra', text: x.gac0 }), detalles(`g${i.id}`, 'Cómo sale', lin(x.partesGac0))),
      h('div', {}, h('small', { text: 'Daño P/M · G' }), h('strong', { class: 'cifra chica', text: x.dano.p === x.dano.g ? x.dano.p : `${x.dano.p} · ${x.dano.g}` }), detalles(`d${i.id}`, 'Cómo sale', x.partesDano.length ? lin(x.partesDano) : ['Sin bonos planos'])),
      h('div', {}, h('small', { text: 'RT' }), h('strong', { class: 'cifra', text: x.rt }), detalles(`r${i.id}`, 'Cómo sale', x.partesRt.map(p => p.base ? `${p.et}: ${p.v}` : `${p.et}: ${sg(p.v)}`))),
      h('div', {}, h('small', { text: 'Crítico' }), h('strong', { class: 'cifra chica', text: x.critico })));

    const ajustes = h('details', { class: 'desplegable ajustes' }, h('summary', { text: 'Ajustes, estilo y notas' }),
      h('div', { class: 'cols2' },
        h('label', { class: 'campo' }, h('span', { class: 'campo-et', text: 'Modo' }), x.modos.length > 1 ? ui.select(x.modos.map(m => ({ v: m, t: m })), x.modo, v => mod(t => { t.modo = v; }), { 'data-foco': `i-${n}-modo` }) : h('output', { class: 'fijo', text: x.modos[0] })),
        campo('Bono mágico', 'magico', -5, 10), campo('RT mágico', 'rtMagico', 0, 5), campo('Dado mágico', 'dadoMagico', 0, 5), campo('Ajuste GAC0', 'ajusteGac0', -20, 20), campo('Ajuste daño', 'ajusteDano', -20, 20),
        h('label', { class: 'campo' }, h('span', { class: 'campo-et', text: 'Sutileza' }), x.sutilPermitida && x.modo === 'Cuerpo' ? ui.select([{ v: 'FUE', t: 'FUE' }, { v: 'DES', t: 'DES' }], i.sutileza, v => mod(t => { t.sutileza = v; }), { 'data-foco': `i-${n}-sut` }) : h('output', { class: 'fijo', text: 'No aplica' }))),
      h('div', { class: 'estilo-caja' },
        h('label', { class: 'campo' }, h('span', { class: 'campo-et', text: 'Estilo aplicado' }), ui.select(x.opciones.map(([v, t]) => ({ v, t })), x.estilo, v => mod(t => { t.estilo = v; }), { 'data-foco': `i-${n}-estilo` })),
        x.estilo === 'one' ? h('div', {}, h('span', { class: 'campo-et', text: `Puntos tácticos a GAC0 (${x.tacGac0}/${x.tacticos}) · el resto va a CA: ${Math.max(0, x.tacticos - x.tacGac0)}` }), stepper(x.tacGac0, d => paso('puntosTacticos', d, 0, x.tacticos), 'Puntos tácticos a GAC0', `i-${n}-tac`)) : null,
        x.estilo !== 'none' ? h('p', { class: 'meta', text: `GAC0 ${sg(x.eff.gac0)} · daño ${sg(x.eff.dano)} · RT ${sg(x.eff.rt)} · maniobras ${sg(x.eff.man)}${x.eff.notas.length ? ' · ' + x.eff.notas.join(' · ') : ''}` }) : null),
      h('label', { class: 'campo' }, h('span', { class: 'campo-et', text: 'Notas' }), ui.area(i.notas, v => S.cambiar(pj => { const t = pj.armas.instancias.find(k => k.id === i.id); if (t) t.notas = v; }), { rows: 2, placeholder: 'Propiedades especiales, historia, reglas del DJ…', 'data-foco': `i-${n}-notas` })));
    ajustes.open = abiertos.has('aj' + i.id); ajustes.addEventListener('toggle', () => { if (ajustes.open) abiertos.add('aj' + i.id); else abiertos.delete('aj' + i.id); });

    return h('article', { class: 'tarjeta-arma grande' + (esEscudo ? ' escudo' : '') },
      h('div', { class: 'tarjeta-cab' },
        h('div', { class: 'crece' }, ui.texto(i.nombre, v => S.cambiar(pj => { const t = pj.armas.instancias.find(k => k.id === i.id); if (t) t.nombre = v; }), { placeholder: 'Nombre propio (ej. Excalibur)', 'data-foco': `i-${n}-nombre`, 'aria-label': 'Nombre propio del arma' }),
          h('div', { class: 'meta', text: `${nombreArma} · ${x.grupo} · ${x.estado}${x.sp ? ' · ' + x.nombreEsp + ' (esp. ' + x.sp + ')' : ''}` })),
        enPar ? h('span', { class: 'etiqueta', text: enPar }) : null,
        x.arma && x.arma.arte ? h('span', { class: 'etiqueta', text: 'Arte marcial' }) : ui.boton('Quitar', () => hacer(S, pj => R().acc.quitarInstancia(pj, i.id)), 'chico peligro', { 'data-foco': `i-${n}-q` })),
      stats,
      x.arma ? h('p', { class: 'meta', text: `Base P/M ${x.arma.dm}${x.arma.techDado ? ' + ' + x.arma.techDado : ''} · G ${x.arma.dg}${x.arma.techDado ? ' + ' + x.arma.techDado : ''} · Crítico ${x.arma.crit} · Tamaño ${x.arma.tam || '—'}${x.arma.esp ? ' · ' + x.arma.esp : ''}` }) : h('p', { class: 'vacio', text: 'Esta arma ya no existe en tu biblioteca.' }),
      ajustes);
  }

  /* El escudo es un arma (hace daño y tiene su RT); aquí se elige cuál está equipado y se ve lo que aporta el estilo arma-escudo. */
  function escudoPanel(S) {
    const a = S.r.armas, reg = S.reg, par = S.pj.armas.pares.escudo;
    const nombreDe = i => (i.nombre ? i.nombre + ' — ' : '') + (reg.arma(i.base) ? reg.arma(i.base).nombre : i.base);
    const escudos = S.pj.armas.instancias.filter(i => { const d = reg.arma(i.base); return d && d.escudo; });
    const sel1 = (et, clave, lista, foco) => h('label', { class: 'campo' }, h('span', { class: 'campo-et', text: et }),
      ui.select([{ v: '', t: '—' }].concat(lista.map(i => ({ v: i.id, t: nombreDe(i) }))), par[clave], v => S.cambiar(pj => { pj.armas.pares.escudo[clave] = v; }, { estructura: true }), { 'data-foco': foco }));
    const e = a.escudo;
    const cuerpo = !escudos.length ? h('p', { class: 'ayuda', text: 'Agrega un escudo a "Mis armas" (grupo Escudos) para equiparlo aquí.' })
      : !e ? h('p', { class: 'ayuda', text: 'Elige el escudo que llevas equipado para aplicar el estilo arma-escudo.' })
      : h('div', {},
        h('div', { class: 'cifras-arma' },
          h('div', {}, h('small', { text: 'CA que aporta' }), h('strong', { class: 'cifra', text: sg(e.ca) })),
          h('div', {}, h('small', { text: 'Bloqueos extra' }), h('strong', { class: 'cifra', text: e.bloqueos }), h('small', { class: 'meta', text: 'Independientes del RT' })),
          h('div', {}, h('small', { text: 'Salvaciones protegibles' }), h('strong', { class: 'cifra', text: sg(e.salv) })),
          h('div', {}, h('small', { text: 'Maniobras con escudo' }), h('strong', { class: 'cifra', text: sg(e.man) }))),
        e.calculo ? h('p', { class: 'meta', text: `El escudo ataca con GAC0 ${e.calculo.gac0}, daño ${e.calculo.dano.p} · ${e.calculo.dano.g} y RT ${e.calculo.rt} (su tarjeta está arriba).` }) : null,
        e.notas.length ? h('p', { class: 'meta', text: e.notas.join(' · ') }) : null,
        e.primerGolpe ? h('p', { class: 'nota-escudo', text: 'Sin pericia en el estilo arma-escudo, el escudo mejora tu CA en 1 contra el primer golpe. Es solo una referencia: no se suma a ningún cálculo.' })
          : h('p', { class: 'meta', text: e.aplicada ? `La CA del estilo con este escudo (${sg(e.ca)}) ya está en tu CA (pestaña Armadura).` : e.ca ? `Con este escudo el estilo daría ${sg(e.ca)} de CA, pero no se suma: otra bonificación de estilo (puntos tácticos de una mano) es mejor y no se acumulan.` : 'Con este escudo y este nivel de estilo no hay CA permanente.' }));
    const d = h('details', { class: 'desplegable escudo-panel' }, h('summary', { text: 'Configuración de escudo' + (a.escudo ? ' (equipado)' : '') }),
      h('div', { class: 'cols2' }, sel1('Escudo equipado', 'escudo', escudos, 'esc-escudo'), sel1('Arma en la otra mano', 'arma', S.pj.armas.instancias.filter(i => !escudos.includes(i)), 'esc-arma')), cuerpo);
    d.open = abiertos.has('cfg-escudo'); d.addEventListener('toggle', () => { if (d.open) abiertos.add('cfg-escudo'); else abiertos.delete('cfg-escudo'); });
    return d;
  }

  function armasFisicas(S) {
    const a = S.r.armas, reg = S.reg;
    const compet = reg.armas.filter(x => a.dominio.some(d => d.id === x.id)).map(x => ({ v: x.id, t: x.nombre }));
    const grupos = reg.gruposArmas().map(g => ({ grupo: g, items: reg.armas.filter(x => x.grupo === g).map(x => ({ v: x.id, t: x.nombre })) }));
    const opciones = [{ v: '', t: 'Elige un arma…' }].concat(compet.length ? [{ grupo: 'Con competencia propia', items: compet }] : [], grupos);
    const select = ui.select(opciones, sel.instancia, v => { sel.instancia = v; }, { 'data-foco': 'inst-sel', 'aria-label': 'Arma a agregar' });

    const dos = a.dos;
    const par = (et, clave) => h('label', { class: 'campo' }, h('span', { class: 'campo-et', text: et }),
      ui.select([{ v: '', t: '—' }].concat(a.elegiblesDos.map(i => ({ v: i.id, t: (i.nombre ? i.nombre + ' — ' : '') + (reg.arma(i.base) ? reg.arma(i.base).nombre : i.base) }))), S.pj.armas.pares.dos[clave],
        v => S.cambiar(pj => { pj.armas.pares.dos[clave] = v; }, { estructura: true }), { 'data-foco': 'par-' + clave }));
    const config = h('details', { class: 'desplegable' }, h('summary', { text: 'Configuración de dos armas' }),
      h('div', { class: 'cols2' }, par('Mano buena', 'buena'), par('Mano mala', 'mala')),
      dos ? h('p', { class: 'meta', text: `Penalización base ${dos.baseA}/${dos.baseB}, reducida en ${dos.reduccion} (reacción ${dos.react}, ambidestría ${dos.amb}, estilo ${2 * ((S.r.armas.estilos.find(x => x.id === 'two') || {}).total || 0)}): mano buena ${dos.pa}, mano mala ${dos.pb}. Solo se aplica a las armas con el estilo "Dos armas".` })
        : h('p', { class: 'ayuda', text: 'Elige dos armas ligeras o medianas (L o M) para calcular la penalización.' }));
    config.open = abiertos.has('cfg-dos'); config.addEventListener('toggle', () => { if (config.open) abiertos.add('cfg-dos'); else abiertos.delete('cfg-dos'); });

    return ui.bloque('Mis armas',
      h('div', { class: 'fila-edit' }, select, ui.boton('Agregar a mi equipo', () => { const v = sel.instancia; if (!v) return; sel.instancia = ''; hacer(S, pj => R().acc.anadirInstancia(pj, S.reg, v)); }, 'primario', { 'data-foco': 'inst-add' })),
      a.instancias.length ? h('div', { class: 'lista-armas' }, a.instancias.map((x, n) => tarjeta(S, x, n))) : h('p', { class: 'vacio', text: 'Todavía no tienes armas en tu equipo. Cada tarjeta es un ejemplar físico; aquí no se gastan PA.' }),
      escudoPanel(S), config);
  }

  /* Entrenamiento: lo que compras con PA, en pestañas para no ocupar toda la pantalla. */
  const SUBS = [['dominio', 'Competencias'], ['grupos', 'Grupos'], ['estilos', 'Estilos']];
  function entrenamiento(S) {
    const tabs = h('div', { class: 'subpestanas', role: 'tablist', 'aria-label': 'Entrenamiento' }, SUBS.map(([id, t]) => h('button', {
      type: 'button', role: 'tab', class: 'subpestana', 'aria-selected': String(sub === id), text: t, 'data-foco': 'sub-' + id, onclick: () => { sub = id; S.render(); }
    })));
    const cuerpo = sub === 'grupos' ? gruposArmas(S) : sub === 'estilos' ? estilos(S) : dominioArmas(S);
    return ui.bloque('Entrenamiento', tabs, cuerpo);
  }

  ui.paneles.armas = S => h('div', { class: 'armas' }, resumen(S),
    h('div', { class: 'cols armas-cols' }, h('div', { class: 'col' }, armasFisicas(S)), h('div', { class: 'col' }, entrenamiento(S))));
})(window.ADND);
