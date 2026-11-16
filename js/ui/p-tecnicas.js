/* Pestaña Técnicas: habilidades de Bribón (ladrón, bardo y compañía), Bárbaro, Espadachín, artes marciales y Techno.
   Las reglas viven en js/core/tecnicas.js; aquí solo se dibuja. */
(function (A) {
  'use strict';
  const ui = A.ui, U = A.util, h = ui.h, T = () => A.reglas.tecnicas;
  const sg = n => (n >= 0 ? '+' + n : '−' + Math.abs(n));
  let sub = 'bribon';
  const abiertos = new Set();

  function hacer(S, fn) {
    let msg = null;
    S.cambiar(pj => { msg = fn(pj); }, { estructura: true });
    if (msg) S.aviso(msg, true);
  }
  const stepper = (valor, mas, menos, etiqueta, foco) => h('span', { class: 'stepper' },
    ui.boton('−', menos, 'chico', { 'aria-label': 'Quitar punto de ' + etiqueta, 'data-foco': foco + '-m' }),
    h('output', { text: valor, 'aria-label': etiqueta }),
    ui.boton('+', mas, 'chico', { 'aria-label': 'Sumar punto de ' + etiqueta, 'data-foco': foco + '-p' }));

  function tarjeta(S, x, avanzada) {
    const t = S.r.tecnicas, desglose = `Base ${x.base} · Raza ${sg(x.raza)} · DES ${sg(x.des)} · Armadura ${sg(x.armadura)} · Ladrón +${x.ladron} · Bardo +${x.bardo} · Ajuste ${sg(x.manual)}`;
    return h('article', { class: 'tarjeta-arma' },
      h('div', { class: 'tarjeta-cab' }, h('strong', { text: x.nombre }), h('strong', { class: 'cifra', text: x.total + '%' })),
      h('p', { class: 'meta', text: desglose + (x.bruto !== x.total ? ` · sin tope: ${x.bruto < 0 ? "−" + Math.abs(x.bruto) : x.bruto}%` : '') }),
      h('div', { class: 'fila-edit' },
        x.puedeLadron ? h('span', { class: 'fila-pips' }, h('span', { text: 'Ladrón' }), stepper(x.ladron, () => hacer(S, pj => T().acc.punto(pj, t, 'ladron', x.k, 1)), () => hacer(S, pj => T().acc.punto(pj, t, 'ladron', x.k, -1)), 'Ladrón en ' + x.nombre, 'tc-l-' + x.k)) : null,
        x.puedeBardo ? h('span', { class: 'fila-pips' }, h('span', { text: 'Bardo' }), stepper(x.bardo, () => hacer(S, pj => T().acc.punto(pj, t, 'bardo', x.k, 1)), () => hacer(S, pj => T().acc.punto(pj, t, 'bardo', x.k, -1)), 'Bardo en ' + x.nombre, 'tc-b-' + x.k)) : null,
        ui.campo('Ajuste ±', ui.numero(x.manual || '', v => hacer(S, pj => { T().acc.manual(pj, x.k, v); return null; }), { class: 'corto', step: 1, placeholder: '0', 'data-foco': 'tc-man-' + x.k, 'aria-label': 'Ajuste manual de ' + x.nombre }))));
  }

  function bribon(S) {
    const t = S.r.tecnicas, L = t.niveles, P = t.presupuestos, U_ = t.usados;
    const resumen = ui.bloque('Habilidades de Bribón',
      h('div', { class: 'armas-resumen' },
        h('div', {}, h('strong', { class: 'cifra', text: L.ladron || '—' }), h('span', { text: 'Ladrón (nivel)' })),
        h('div', {}, h('strong', { class: 'cifra' + (U_.ladron > P.ladron ? ' mal' : ''), text: `${U_.ladron} / ${P.ladron}` }), h('span', { text: 'Puntos de Ladrón' })),
        h('div', {}, h('strong', { class: 'cifra', text: L.bardo || '—' }), h('span', { text: 'Bardo (nivel)' })),
        h('div', {}, h('strong', { class: 'cifra' + (U_.bardo > P.bardo ? ' mal' : ''), text: `${U_.bardo} / ${P.bardo}` }), h('span', { text: 'Puntos de Bardo' })),
        h('div', {}, h('strong', { class: 'cifra', text: t.armadura }), h('span', { text: 'Armadura (peto)' }))),
      h('p', { class: 'ayuda', text: `Las ocho habilidades existen para cualquier personaje: base de tu mejor clase, más raza, DES (${t.des}) y armadura. Ladrón y Bardo reparten puntos (tope por habilidad: ${P.topeLadron || 0} y ${P.topeBardo || 0}). Si tu raza o clase es propia, usa el ajuste de cada habilidad. Los totales van de 0% a 99%.` }),
      h('div', { class: 'cols3 tecnicas-hab' }, t.habilidades.map(x => tarjeta(S, x))));

    const av = t.avanzadas.filter(x => x.permitida), pj = S.pj.tecnicas.bribon;
    const eleccion = L.bardo >= 20 && L.ladron < 20 ? h('div', { class: 'fila-edit' }, h('span', { class: 'ayuda', text: 'Bardo: elige 2 habilidades avanzadas.' }),
      t.avanzadas.map(x => h('label', { class: 'casilla' }, h('input', { type: 'checkbox', checked: pj.bardoAvanzadas.includes(x.k) ? true : null, 'data-foco': 'tc-adv-' + x.k, onchange: e => hacer(S, p => T().acc.avanzada(p, x.k, e.target.checked)) }), ' ' + x.nombre))) : null;
    const d = h('details', { class: 'desplegable' }, h('summary', { text: 'Habilidades avanzadas (nivel 20)' }),
      !t.desbloqueadas ? h('p', { class: 'ayuda', text: 'Se desbloquean cuando Ladrón o Bardo llega a nivel 20.' }) : [eleccion, h('div', { class: 'cols3 tecnicas-hab' }, av.map(x => tarjeta(S, x, true)))]);
    d.open = abiertos.has('adv'); d.addEventListener('toggle', () => { if (d.open) abiertos.add('adv'); else abiertos.delete('adv'); });
    const bloques = [resumen, ui.bloque('Habilidades avanzadas', d)];

    if (t.clase.ladron) bloques.push(ui.bloque('Técnicas exclusivas del Ladrón', h('p', { class: 'meta', text: `Ataque por la espalda ×${t.clase.ladron.espalda} · ataque furtivo ${t.clase.ladron.furtivo}.` })));
    if (t.clase.bardo) {
      const b = t.clase.bardo;
      bloques.push(ui.bloque('Técnicas del Bardo',
        h('div', { class: 'armas-resumen' }, h('div', {}, h('strong', { class: 'cifra', text: b.saber + '%' }), h('span', { text: `Saber legendario (base ${b.saberBase}%)` }))),
        ui.campo('Ajuste manual al saber legendario', ui.numero(S.pj.tecnicas.bribon.saberMod || '', v => S.cambiar(pj2 => { pj2.tecnicas.bribon.saberMod = Math.round(U.num(v)); }, { estructura: true }), { class: 'corto', step: 1, placeholder: '0', 'data-foco': 'tc-saber' })),
        h('p', { class: 'meta', text: `Influencia bárdica: altera la reacción ±1; salvación contra parálisis con modificador ${b.salvacion}.` }),
        h('p', { class: 'meta', text: `Inspiración bárdica: +${b.inspiracion} al ataque, +${b.inspiracion} a las salvaciones o +${b.inspiracion * 2} a la moral; alcance ${b.alcance} pies, duración ${b.duracion} asaltos; pide 3 asaltos de preparación fuera de combate. Los bonos suben cada 4 niveles.` }),
        h('p', { class: 'meta', text: 'Contracanción: radio de 30 pies, salvación contra conjuros, una vez por encuentro; mientras actúa solo puede caminar despacio.' })));
    }
    return h('div', {}, bloques);
  }

  function barbaro(S) {
    const b = S.r.tecnicas.barbaro, X = S.pj.tecnicas.barbaro.extra;
    if (!b) return ui.bloque('Habilidades de Bárbaro', h('p', { class: 'vacio', text: 'No tienes la clase Bárbaro. Estas habilidades se calculan con su nivel.' }));
    return ui.bloque('Habilidades de Bárbaro',
      h('p', { class: 'ayuda', text: `Nivel de Bárbaro: ${b.nivel}. Los valores salen de su tabla de progresión; el extra suma bonos de objetos o del DM. Pasando de 95% se muestra el excedente.` }),
      h('div', { class: 'tabla-scroll' }, h('table', { class: 'tabla equipo' },
        h('thead', {}, h('tr', {}, ['Habilidad', 'Base', 'Extra', 'Total'].map(t => h('th', { scope: 'col', text: t })))),
        h('tbody', {}, b.filas.map(f => h('tr', {},
          h('th', { scope: 'row', text: f.nombre }), h('td', { text: f.base }),
          h('td', {}, f.numerico ? ui.numero(X[f.k] || '', v => S.cambiar(pj => { pj.tecnicas.barbaro.extra[f.k] = U.num(v); }, { estructura: true }), { class: 'corto', step: 1, placeholder: '0', 'data-foco': 'tb-' + f.k, 'aria-label': 'Extra de ' + f.nombre })
            : ui.texto(X[f.k] || '', v => S.cambiar(pj => { pj.tecnicas.barbaro.extra[f.k] = v; }, { estructura: true }), { class: 'corto', placeholder: '+1, +1d4…', 'data-foco': 'tb-' + f.k, 'aria-label': 'Extra de ' + f.nombre })),
          h('td', {}, h('strong', { text: f.total }))))))));
  }

  /* ------------------------------------------------------------------ espadachín */
  function espadachin(S) {
    const e = S.r.tecnicas.espadachin, sgn = n => (n >= 0 ? '+' + n : '−' + Math.abs(n));
    const resumen = ui.bloque('Escuelas del Espadachín',
      h('div', { class: 'armas-resumen' },
        h('div', {}, h('strong', { class: 'cifra', text: e.nivel || '—' }), h('span', { text: 'Nivel de Espadachín' })),
        h('div', {}, h('strong', { class: 'cifra' + (e.restantes < 0 ? ' mal' : ''), text: `${e.gastados} / ${e.ganados}` }), h('span', { text: 'Elecciones gastadas' })),
        h('div', {}, h('strong', { class: 'cifra', text: sgn(e.md) }), h('span', { text: 'MD (daño por FUE)' })),
        h('div', {}, h('strong', { class: 'cifra', text: e.touki }), h('span', { text: 'Touki (reducción de daño)' }))),
      h('p', { class: e.activa ? 'ayuda' : 'nota-escudo', text: e.activa ? 'Técnicas activas: sin armadura, ligera o media.' : 'Técnicas INACTIVAS: llevas armadura pesada (el máximo permitido es media).' }),
      h('p', { class: 'ayuda', text: 'Ganas una elección en los niveles 1, 4, 7, 10, 13, 16 y 19. Puedes combinar escuelas; dentro de cada una las técnicas se adquieren en orden.' }),
      e.restantes < 0 ? h('p', { class: 'nota-escudo', text: `Tienes ${-e.restantes} elección(es) de más para tu nivel. Quita técnicas del final de alguna escuela.` }) : null);
    const columna = esc => h('section', { class: 'bloque-interno' },
      h('h3', { text: `${esc.nombre} · rango ${esc.rango}` }),
      esc.tecnicas.map(t => h('article', { class: 'tarjeta-arma' + (t.adquirida ? '' : ' apagada') },
        h('div', { class: 'tarjeta-cab' }, h('div', {}, h('strong', { text: t.nombre }), h('div', { class: 'meta', text: `${t.titulo} · nivel ${t.nivel}` })),
          t.adquirida ? (t.rango === esc.rango ? ui.boton('Quitar', () => hacer(S, pj => T().acc.espQuitar(pj, S.r.tecnicas, esc.id, t.rango)), 'chico peligro', { 'data-foco': `es-q-${esc.id}-${t.rango}` }) : h('span', { class: 'etiqueta', text: 'Adquirida' }))
            : t.siguiente ? ui.boton('Adquirir', () => hacer(S, pj => T().acc.espComprar(pj, S.r.tecnicas, esc.id, t.rango)), 'chico primario', { disabled: t.alcanzable ? null : true, 'data-foco': `es-a-${esc.id}-${t.rango}` }) : h('span', { class: 'meta', text: 'Pide la anterior' })),
        h('p', { class: 'meta', text: t.efecto }))));
    const adq = e.adquiridas.length ? h('div', { class: 'lista-armas' }, e.adquiridas.map(t => h('div', { class: 'tarjeta-arma' + (e.activa ? '' : ' apagada') },
      h('strong', { text: t.nombre }), h('span', { class: 'etiqueta', text: `${t.escuela} · ${t.titulo}${e.activa ? '' : ' · inactiva'}` }), h('p', { class: 'meta', text: t.efecto })))) : h('p', { class: 'vacio', text: 'Aún no has adquirido técnicas.' });
    return h('div', {}, resumen, ui.bloque('Técnicas por escuela', h('div', { class: 'cols3' }, e.escuelas.map(columna))), ui.bloque('Técnicas adquiridas', adq));
  }

  /* ------------------------------------------------------------- artes marciales */
  let arteElegida = '';
  const AM = () => A.reglas.artes;
  function artesMarciales(S) {
    const m = S.r.artes, ca = m.ca, c = S.r.ca.artes;
    const puntos = (et, v, mal) => h('div', {}, h('strong', { class: 'cifra' + (mal ? ' mal' : ''), text: v }), h('span', { text: et }));
    const pagar = d => hacer(S, pj => AM().acc.pago(pj, S.reg, S.r.artes.saldoPA, S.r.artes.saldoPNA, d));
    const resumen = ui.bloque('Artes marciales',
      h('div', { class: 'armas-resumen' },
        puntos('Artes conocidas', `${m.artes.length} / ${m.max}`),
        puntos('Pericias gastadas', m.costo),
        puntos('Con PA · con PNA', `${m.pa} · ${m.pna}`),
        puntos('Saldo PA · PNA', `${m.saldoPA} · ${m.saldoPNA}`),
        puntos('CA marcial', ca.arte ? sg(ca.arte.valor) : '0')),
      h('div', { class: 'fila-edit' }, h('span', { class: 'campo-et', text: 'Pagar con PA' }),
        h('span', { class: 'stepper' }, ui.boton('−', () => pagar(-1), 'chico', { 'aria-label': 'Pagar un punto menos con PA', 'data-foco': 'am-pa-m' }), h('output', { text: m.pa, 'aria-label': 'Puntos pagados con PA' }), ui.boton('+', () => pagar(1), 'chico', { 'aria-label': 'Pagar un punto más con PA', 'data-foco': 'am-pa-p' })),
        h('span', { class: 'meta', text: `El resto (${m.pna}) se paga con PNA.` })),
      h('p', { class: 'ayuda', text: 'Cada arte cuesta 1 pericia y cada movimiento, otra. Los movimientos se aprenden en orden dentro de su grupo (Candado 1 antes de Candado 2). El costo sale del saldo de Progresión, como Ambidestría.' }),
      ca.arte ? h('p', { class: 'meta' + (c.arteActiva ? '' : ' apagada'), text: `CA: ${ca.arte.nombre} ${sg(ca.arte.valor)} (solo cuenta tu mejor arte) · ${c.arteActiva ? 'activa, ya está en la pestaña Armadura' : 'inactiva, ' + c.motivo}.` }) : null,
      ca.piel ? h('p', { class: 'meta' + (c.pielActiva ? '' : ' apagada'), text: `${ca.piel.nombre} ${sg(ca.piel.valor)} de CA (${ca.piel.arte}) · ${c.pielActiva ? 'activa' : 'inactiva, ' + c.motivoPiel}.` }) : null,
      m.artes.length < m.max ? h('div', { class: 'fila-edit' },
        ui.select([{ v: '', t: 'Elige un arte…' }].concat(m.disponibles.map(a => ({ v: a.id, t: `${a.nombre}${a.origen === 'homebrew' ? ' (propia)' : ''} · CA ${sg(a.ac)} · ${a.dano}` }))), arteElegida, v => { arteElegida = v; }, { 'data-foco': 'am-sel', 'aria-label': 'Arte marcial a aprender' }),
        ui.boton('Aprender arte (1)', () => { const v = arteElegida; if (!v) return; arteElegida = ''; hacer(S, pj => AM().acc.anadir(pj, S.reg, S.r.artes.saldoPNA, v, S.r.artes.saldoPA)); }, 'primario', { 'data-foco': 'am-add' })) : null);

    const tarjetaArte = a => {
      if (a.faltante) return h('article', { class: 'tarjeta-arma apagada' }, h('div', { class: 'tarjeta-cab' }, h('div', {}, h('strong', { text: a.nombre }), h('div', { class: 'meta', text: 'Este arte ya no existe en tu biblioteca.' })), ui.boton('Quitar', () => hacer(S, pj => AM().acc.quitar(pj, S.reg, a.id)), 'chico peligro', { 'data-foco': 'am-q-' + a.id })));
      const filas = a.movs.map(mv => h('tr', { class: mv.adquirido ? '' : 'mov-apagado' },
        h('th', { scope: 'row', text: mv.k }), h('td', { text: mv.nombre }), h('td', { text: mv.efecto || '—' }),
        h('td', {}, mv.adquirido ? ui.boton('Quitar', () => hacer(S, pj => AM().acc.mov(pj, S.reg, S.r.artes.saldoPNA, a.id, mv.k, S.r.artes.saldoPA)), 'chico peligro', { 'data-foco': `am-m-${a.id}-${mv.k}` })
          : ui.boton('Aprender', () => hacer(S, pj => AM().acc.mov(pj, S.reg, S.r.artes.saldoPNA, a.id, mv.k, S.r.artes.saldoPA)), 'chico', { disabled: mv.listo ? null : true, title: mv.listo ? null : 'Antes: ' + mv.previos.filter(p => !a.movs.find(q => q.k === p).adquirido).join(', '), 'data-foco': `am-m-${a.id}-${mv.k}` }))));
      return h('article', { class: 'tarjeta-arma grande' },
        h('div', { class: 'tarjeta-cab' }, h('div', {}, h('strong', { text: a.nombre }), h('div', { class: 'meta', text: `${a.comprados} de ${a.movs.length} movimientos · ${a.origen === 'homebrew' ? 'propia' : 'base'}` })),
          ui.boton('Quitar arte', () => hacer(S, pj => AM().acc.quitar(pj, S.reg, a.id)), 'chico peligro', { 'data-foco': 'am-q-' + a.id })),
        h('div', { class: 'cifras-arma' },
          h('div', {}, h('small', { text: 'Ataques por round' }), h('strong', { class: 'cifra', text: a.atk })),
          h('div', {}, h('small', { text: 'Daño desarmado' }), h('strong', { class: 'cifra chica', text: a.dano })),
          h('div', {}, h('small', { text: 'Modificador de CA' }), h('strong', { class: 'cifra', text: sg(a.ac) })),
          h('div', {}, h('small', { text: 'RT del arte' }), h('strong', { class: 'cifra', text: a.rt }))),
        h('p', { class: 'meta', text: `Método: ${a.met || '—'} · Armas que usa: ${a.armas || '—'}. Su ataque desarmado está en la pestaña Armas (GAC0, daño, especialización y RT).` }),
        h('div', { class: 'tabla-scroll' }, h('table', { class: 'tabla equipo' },
          h('thead', {}, h('tr', {}, ['Mov.', 'Maniobra', 'Efecto', ''].map(t => h('th', { scope: 'col', text: t })))), h('tbody', {}, filas))));
    };
    return h('div', {}, resumen, m.artes.length ? h('div', { class: 'lista-armas' }, m.artes.map(tarjetaArte)) : h('p', { class: 'vacio', text: 'Todavía no conoces ningún arte marcial.' }));
  }

  const SUBS = [['bribon', 'Bribón'], ['barbaro', 'Bárbaro'], ['espadachin', 'Espadachín'], ['artes', 'Artes marciales'], ['techno', 'Techno']];
  ui.paneles.tecnicas = S => {
    const tabs = h('div', { class: 'subpestanas', role: 'tablist', 'aria-label': 'Técnicas' }, SUBS.map(([id, t]) => h('button', {
      type: 'button', role: 'tab', class: 'subpestana', 'aria-selected': String(sub === id), text: t, 'data-foco': 'tec-sub-' + id, onclick: () => { sub = id; S.render(); }
    })));
    return h('div', { class: 'tecnicas' }, tabs, sub === 'barbaro' ? barbaro(S) : sub === 'espadachin' ? espadachin(S) : sub === 'artes' ? artesMarciales(S) : sub === 'techno' ? A.ui.techno(S) : bribon(S));
  };
})(window.ADND);
