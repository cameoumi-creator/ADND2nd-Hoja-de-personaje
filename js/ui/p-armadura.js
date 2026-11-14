/* Pestaña Armadura: piezas, equipo puesto, bonos y las tres cifras de CA (total, dureza, toque).
   Las reglas viven en js/core/armadura.js; aquí solo se dibuja. */
(function (A) {
  'use strict';
  const ui = A.ui, U = A.util, h = ui.h;
  const sg = n => (n > 0 ? '+' + n : n < 0 ? '−' + Math.abs(n) : '0');
  const abiertos = new Set();
  let conjunto = '';

  const stepper = (valor, alCambiar, etiqueta, foco) => h('span', { class: 'stepper' },
    ui.boton('−', () => alCambiar(-1), 'chico', { 'aria-label': 'Restar ' + etiqueta, 'data-foco': foco + '-m' }),
    h('output', { text: sg(valor), 'aria-label': etiqueta }),
    ui.boton('+', () => alCambiar(1), 'chico', { 'aria-label': 'Sumar ' + etiqueta, 'data-foco': foco + '-p' }));

  /* Se redibuja solo en cada cambio (S.enlaces), así las cifras siguen lo que tecleas sin perder el foco. */
  function resumen(S) {
    const cuerpo = h('div', {});
    const pintar = r => cuerpo.replaceChildren(...resumenCuerpo(r.ca).filter(Boolean));
    pintar(S.r); S.enlaces.push(pintar);
    return ui.bloque('Clase de armadura', cuerpo);
  }
  function resumenCuerpo(c) {
    const est = c.estilo.mejor;
    return [
      h('div', { class: 'armas-resumen ca-resumen' },
        h('div', {}, h('strong', { class: 'cifra', text: c.valor }), h('span', { text: 'CA total' })),
        h('div', {}, h('strong', { class: 'cifra', text: c.dureza }), h('span', { text: 'CA de dureza' })),
        h('div', {}, h('strong', { class: 'cifra', text: c.toque }), h('span', { text: 'CA al toque' })),
        h('div', {}, h('strong', { class: 'cifra', text: sg(c.defensa) }), h('span', { text: 'DES aplicada' })),
        h('div', {}, h('strong', { class: 'cifra', text: c.proteccion }), h('span', { text: 'Protección de armadura' }))),
      h('p', { class: 'ayuda', text: `Peto: ${c.clase === 'Ninguna' ? 'sin armadura' : c.clase}. ${c.limite}${c.defensaNatural !== c.defensa ? ` (tu DES da ${sg(c.defensaNatural)}, se aplica ${sg(c.defensa)})` : ''}. Dureza: lo que hay que superar para penetrar la armadura (sin DES). Toque: solo DES y magia.` }),
      est ? h('p', { class: 'meta', text: `Estilo de pelea: ${est.etiqueta}, ${sg(est.valor)} de CA.` }) : null,
      c.artes.arte ? h('p', { class: 'meta' + (c.artes.arteActiva ? '' : ' apagada'), text: `Artes marciales (${c.artes.arte.nombre}): ${sg(c.artes.arte.valor)} de CA en total y al toque · ${c.artes.arteActiva ? 'activa' : 'inactiva, ' + c.artes.motivo}. Es el mejor de tus artes; no se acumulan.` }) : null,
      c.artes.piel ? h('p', { class: 'meta' + (c.artes.pielActiva ? '' : ' apagada'), text: `${c.artes.piel.nombre} (${c.artes.piel.arte}): ${sg(c.artes.piel.valor)} de CA en total y al toque · ${c.artes.pielActiva ? 'activa' : 'inactiva, ' + c.artes.motivoPiel}. Se suma aparte del bono del arte.` }) : null,
      c.margen ? h('p', { class: 'meta', text: `La CA no baja de −10; te sobran ${c.margen} punto(s).` }) : null];
  }

  function opcionesArmadura(S) {
    return [{ v: '', t: '— Sin pieza —' }].concat(S.reg.armaduras.map(a => ({ v: a.id, t: `${a.nombre} · ${a.clase}` })));
  }

  function pieza(S, k, titulo, cob) {
    const x = S.pj.armadura[k], chip = h('span', { class: 'etiqueta' });
    const pintar = r => { chip.textContent = 'Protección ' + r.ca.piezas.find(p => p.parte === k).valor; };
    pintar(S.r); S.enlaces.push(pintar);
    return h('div', { class: 'tarjeta-arma' },
      h('div', { class: 'tarjeta-cab' }, h('strong', { text: titulo }), chip),
      h('div', { class: 'rejilla g2' },
        ui.campo('Tipo', ui.select(opcionesArmadura(S), x.tipo, v => S.cambiar(pj => { pj.armadura[k].tipo = v; }), { 'data-foco': 'arm-' + k })),
        cob ? ui.campo('Cobertura', ui.select([{ v: '2', t: cob[0] }, { v: '1', t: cob[1] }], String(x.cob), v => S.cambiar(pj => { pj.armadura[k].cob = Number(v); }), { 'data-foco': 'arm-cob-' + k })) : null),
      h('div', { class: 'fila-pips' }, h('span', { text: 'Bono mágico' }), stepper(x.magico, d => S.cambiar(pj => { pj.armadura[k].magico = U.num(pj.armadura[k].magico) + d; }), 'bono mágico de ' + titulo, 'arm-mag-' + k)),
      ui.campo('Nombre o notas', ui.texto(x.nota, v => S.cambiar(pj => { pj.armadura[k].nota = v; }), { 'data-foco': 'arm-nota-' + k, placeholder: 'Peto de mithril, propiedad especial…' })));
  }

  function puesta(S) {
    const conj = ui.select([{ v: '', t: '— Elegir conjunto —' }].concat(S.reg.armaduras.map(a => ({ v: a.id, t: `${a.nombre} · ${a.clase} · protección ${a.completa}` }))), conjunto, v => { conjunto = v; }, { 'data-foco': 'arm-conjunto', 'aria-label': 'Conjunto de armadura' });
    return ui.bloque('Armadura puesta',
      h('p', { class: 'ayuda', text: 'La armadura se anota por piezas. "Equipar conjunto" llena peto, brazos y piernas con el mismo tipo; después puedes mezclar. La categoría del peto decide cuánto bono de DES conservas.' }),
      h('div', { class: 'fila-edit' }, conj,
        ui.boton('Equipar conjunto', () => { if (!conjunto) return; const id = conjunto; S.cambiar(pj => { ['torso', 'brazos', 'piernas'].forEach(k => { pj.armadura[k].tipo = id; }); pj.armadura.brazos.cob = 2; pj.armadura.piernas.cob = 2; }, { estructura: true }); }, 'primario', { 'data-foco': 'arm-equipar' }),
        ui.boton('Quitar armadura', () => S.cambiar(pj => { ['torso', 'brazos', 'piernas'].forEach(k => { pj.armadura[k].tipo = ''; pj.armadura[k].magico = 0; }); }, { estructura: true }), '', { 'data-foco': 'arm-quitar' })),
      h('div', { class: 'cols3' }, pieza(S, 'torso', 'Peto'), pieza(S, 'brazos', 'Brazos', ['Dos brazos', 'Un brazo']), pieza(S, 'piernas', 'Piernas', ['Dos piernas', 'Una pierna'])));
  }

  function equipo(S) {
    const fila = ([k, et]) => {
      const q = S.pj.armadura.equipo[k];
      const campo = (f, num, aria, extra) => (num ? ui.numero(q[f] === 0 ? '' : q[f], v => S.cambiar(pj => { pj.armadura.equipo[k][f] = U.num(v); }), Object.assign({ class: 'corto', step: 1, placeholder: '0', 'data-foco': `eq-${k}-${f}`, 'aria-label': aria + ' de ' + et }, extra))
        : ui.texto(q[f], v => S.cambiar(pj => { pj.armadura.equipo[k][f] = v; }), { 'data-foco': `eq-${k}-${f}`, 'aria-label': aria + ' de ' + et }));
      return h('tr', {}, h('th', { scope: 'row', text: et }), h('td', {}, campo('nombre', false, 'Objeto')), h('td', {}, campo('ca', true, 'Protección')), h('td', {}, campo('magico', true, 'Bono mágico')), h('td', {}, campo('desc', false, 'Descripción')));
    };
    return ui.bloque('Equipo puesto',
      h('p', { class: 'ayuda', text: 'Todo lo que llevas puesto, dé CA o no. Protección y bono mágico se suman a tu CA (valores positivos mejoran); la descripción es solo informativa.' }),
      h('div', { class: 'tabla-scroll' }, h('table', { class: 'tabla equipo' },
        h('thead', {}, h('tr', {}, ['Lugar', 'Objeto', 'Protección', '+ Mágico', 'Descripción'].map(t => h('th', { scope: 'col', text: t })))),
        h('tbody', {}, A.base.ranurasEquipo.map(fila)))));
  }

  const APLICA = [{ v: 'total', t: 'Solo CA total' }, { v: 'total+dureza', t: 'Total y dureza' }, { v: 'total+toque', t: 'Total y toque' }, { v: 'todas', t: 'Las tres' }];

  function bonos(S) {
    const g = S.pj.armadura.generales;
    const filas = g.map((x, i) => h('div', { class: 'fila-edit bono-ca' },
      ui.texto(x.origen, v => S.cambiar(pj => { pj.armadura.generales[i].origen = v; }), { placeholder: 'Origen (bendición, habilidad…)', 'data-foco': 'bg-o-' + i, 'aria-label': 'Origen del bono' }),
      ui.numero(x.valor === 0 ? '' : x.valor, v => S.cambiar(pj => { pj.armadura.generales[i].valor = U.num(v); }), { class: 'corto', step: 1, placeholder: '0', 'data-foco': 'bg-v-' + i, 'aria-label': 'Bono de CA' }),
      ui.select(APLICA, x.aplica, v => S.cambiar(pj => { pj.armadura.generales[i].aplica = v; }), { 'data-foco': 'bg-a-' + i, 'aria-label': 'A qué CA aplica' }),
      ui.boton('Quitar', () => S.cambiar(pj => { pj.armadura.generales.splice(i, 1); }, { estructura: true }), 'chico peligro', { 'data-foco': 'bg-q-' + i })));
    const ar = S.pj.armadura;
    return ui.bloque('Bonos y ajustes',
      h('p', { class: 'ayuda', text: 'Bonos generales (raza, clase, bendiciones…) que no van ligados a una pieza. Un valor positivo mejora la CA. Cada uno se aplica una sola vez a las CA marcadas.' }),
      filas.length ? h('div', { class: 'lista-armas' }, filas) : h('p', { class: 'vacio', text: 'Sin bonos generales.' }),
      ui.boton('+ Agregar bono', () => S.cambiar(pj => { pj.armadura.generales.push({ origen: '', valor: 0, aplica: 'total' }); }, { estructura: true }), 'chico', { 'data-foco': 'bg-add' }),
      h('div', { class: 'rejilla g2' },
        ui.campo('Ajuste manual de CA (negativo mejora)', stepper(ar.manual, d => S.cambiar(pj => { pj.armadura.manual = U.num(pj.armadura.manual) + d; }), 'ajuste manual', 'arm-man')),
        ui.campo('Otros bonos extraordinarios (negativo mejora)', stepper(ar.extra, d => S.cambiar(pj => { pj.armadura.extra = U.num(pj.armadura.extra) + d; }), 'bono extraordinario', 'arm-ext'))),
      ui.campo('Notas de defensa', ui.area(ar.notas, v => S.cambiar(pj => { pj.armadura.notas = v; }), { rows: 2, 'data-foco': 'arm-notas', placeholder: 'Cobertura, efectos del DM, habilidades temporales…' })));
  }

  function desglose(S) {
    const ul = h('ul', { class: 'desglose' });
    const pintar = r => { const c = r.ca; ul.replaceChildren(...['Base 10', `Destreza aplicada: ${sg(c.defensa)}`].concat(c.bonos.map(b => `${b.origen} · ${b.etiqueta}: ${sg(b.valor)}`),
      [`CA total: ${c.valor}`, `CA de dureza: ${c.dureza}`, `CA al toque: ${c.toque}`]).map(t => h('li', { text: t }))); };
    pintar(S.r); S.enlaces.push(pintar);
    const d = h('details', { class: 'desplegable' }, h('summary', { text: 'Detalles del cálculo' }), ul);
    d.open = abiertos.has('desglose');
    d.addEventListener('toggle', () => { if (d.open) abiertos.add('desglose'); else abiertos.delete('desglose'); });
    return ui.bloque('Cómo se calcula', d);
  }

  ui.paneles.armadura = S => h('div', { class: 'armadura' }, resumen(S), puesta(S),
    h('div', { class: 'cols armas-cols' }, h('div', { class: 'col' }, equipo(S)), h('div', { class: 'col' }, bonos(S), desglose(S))));
})(window.ADND);
