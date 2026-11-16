/* Pestaña Equipo: qué carga el personaje (Mochila), dónde guarda el resto (Transporte y alojamiento, Fortaleza, Propiedades),
   dinero y tesoros de cada lugar, y el historial de gastos. Reglas en js/core/equipo.js. La carga es informativa. */
(function (A) {
  'use strict';
  const ui = A.ui, h = ui.h, E = () => A.reglas.equipo;
  const est = { sub: 'mochila', sel: { transporte: '', fortalezas: '', propiedades: '' }, venta: null };
  const TITULOS = { mochila: 'Mochila', transporte: 'Transporte y alojamiento', fortalezas: 'Fortaleza', propiedades: 'Propiedades', gastos: 'Historial' };
  const NOMBRE_NUEVO = { transporte: 'Nuevo transporte', fortalezas: 'Nueva fortaleza', propiedades: 'Nueva propiedad' };
  const MON = [['mc', 'MC'], ['mp', 'MP'], ['me', 'ME'], ['mo', 'MO'], ['mpl', 'MPL']];
  const ahora = () => new Date().toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' });
  const miles = (n, d) => { const s = (Math.round(n * Math.pow(10, d)) / Math.pow(10, d)).toString().split('.'); s[0] = s[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' '); return s.join(','); };
  A.ui.miles = miles;
  const fmt = n => miles(n, 2);
  const kg = n => miles(n, 3) + ' kg';
  const num = v => { if (v === '' || v === null || v === undefined) return ''; const n = Number(String(v).replace(',', '.')); return Number.isFinite(n) && n >= 0 ? n : ''; };
  const lug = (S, tipo, uid) => E().lugar(S.pj.equipo, tipo, uid);
  const aviso = (S, r) => { if (r && !r.ok) S.aviso(r.error, true); };
  ui.equipoLugares = pj => [{ v: 'mochila:', t: 'Mochila' }].concat(['transporte', 'fortalezas', 'propiedades'].flatMap(t => (pj.equipo[t] || []).map(u => ({ v: t + ':' + u.id, t: `${TITULOS[t]}: ${u.nombre || 'Sin nombre'}` }))));
  ui.equipoDestino = v => { const [tipo, id] = String(v || 'mochila:').split(':'); return { tipo: tipo || 'mochila', id: id || '' }; };

  /* ---------------------------------------------------------------- resumen de riqueza */
  let riqAbierta = false;
  function resumen(S) {
    const cuerpo = h('div', { class: 'eq-riq' }), tot = h('p', { class: 'eq-tot' });
    S.enlaces.push((r, reg, pj) => {
      const q = E().riqueza(pj.equipo);
      tot.replaceChildren(...[h('strong', { class: 'cifra', text: fmt(q.conocido) + ' mo' }), ' de patrimonio conocido', q.sinTasar ? h('span', { class: 'meta', text: ` · ${q.sinTasar} línea(s) sin tasar (no suman)` }) : null,
        (q.ingresoMensual || q.gastoMensual) ? h('span', { class: 'meta', text: ` · mensual: +${fmt(q.ingresoMensual)} / −${fmt(q.gastoMensual)} = ${fmt(q.netoMensual)} mo` }) : null].filter(Boolean));
      cuerpo.replaceChildren(h('table', { class: 'tabla eq-tabla-riq' }, h('thead', {}, h('tr', {}, ['Lugar', 'Objetos', 'Monedas', 'Tesoros', 'Inmueble', 'Total'].map(t => h('th', { text: t })))),
        h('tbody', {}, q.filas.map(f => h('tr', {}, h('th', { scope: 'row', text: (f.tipo === 'mochila' ? '' : TITULOS[f.tipo] + ': ') + f.nombre }), ...[f.objetos, f.monedas, f.tesoros, f.propiedad, f.total].map(v => h('td', { text: fmt(v) })))))));
    });
    const det = h('details', { class: 'eq-riq-d' }, h('summary', { text: 'Desglose por lugar y venta' }),
      h('p', { class: 'ayuda', text: 'Valores en monedas de oro (mo). Lo que no tiene valor escrito se cuenta aparte y no suma. Es solo informativo.' }), cuerpo,
      h('div', { class: 'fila-edit' }, ui.campo('Venta: % del valor', ui.numero(S.pj.equipo.pctVenta, v => S.cambiar(pj => { const n = num(v); pj.equipo.pctVenta = n === '' ? 50 : Math.min(1000, n); }), { min: 0, max: 1000, step: 5, class: 'corto', 'data-foco': 'eq-pct' }), 'corto-c')));
    det.open = riqAbierta; det.addEventListener('toggle', () => { riqAbierta = det.open; });
    return h('section', { class: 'bloque eq-riq-b' }, tot, det);
  }

  /* ---------------------------------------------------------------- piezas reutilizables */
  const tx = (S, tipo, uid, campo, et, props, extra) => ui.campo(et, ui.texto(lug(S, tipo, uid)[campo] || '', v => S.cambiar(pj => { lug(S, tipo, uid)[campo] = v; }), Object.assign({ 'data-foco': `eq-${uid || 'm'}-${campo}` }, props)), extra);
  const nu = (S, tipo, uid, campo, et, props) => ui.campo(et, ui.numero(lug(S, tipo, uid)[campo] === '' ? '' : lug(S, tipo, uid)[campo], v => S.cambiar(pj => { lug(S, tipo, uid)[campo] = num(v); }), Object.assign({ min: 0, step: 'any', 'data-foco': `eq-${uid || 'm'}-${campo}` }, props)), 'corto-c');

  function carga(S) {
    const caja = h('div', { class: 'eq-carga' });
    S.enlaces.push((r, reg, pj) => {
      const c = E().carga(pj, reg, r.car.FUE.fila), tope = c.maximo || Math.max(c.total, 1), pct = Math.min(100, c.total / tope * 100), pa = c.autorizado && c.maximo ? c.autorizado / c.maximo * 100 : null;
      caja.replaceChildren(
        h('p', {}, h('strong', { class: 'cifra', text: kg(c.total) }), c.estado ? [' · ', h('strong', { class: 'eq-est eq-est-' + c.estado.toLowerCase(), text: c.estado })] : null,
          c.maximo ? h('span', { class: 'meta', text: ` · autorizado ${kg(c.autorizado)} · máximo ${kg(c.maximo)} (FUE ${r.car.FUE.total})` }) : null),
        h('div', { class: 'eq-barra', role: 'img', 'aria-label': `Carga ${kg(c.total)}` }, h('span', { class: 'eq-barra-v eq-est-' + (c.estado || 'normal').toLowerCase(), style: `width:${pct}%` }), pa !== null ? h('span', { class: 'eq-barra-m', style: `left:${pa}%` }) : null),
        h('p', { class: 'meta', text: `Objetos ${kg(c.objetos)} · monedas ${kg(c.monedas)} · tesoros ${kg(c.tesoros)} · armadura puesta ${kg(c.armadura)}${c.armaduraPartes.length ? ' (' + c.armaduraPartes.map(p => `${p.parte}: ${p.armadura}`).join(', ') + ')' : ''}. Los objetos "Puestos" no suman; las armas pesan solo si están en esta lista. Los estados no cambian tu movimiento.` }));
    });
    return caja;
  }
  function cargaUbic(S, tipo, uid) {
    const caja = h('p', { class: 'eq-carga-u' });
    S.enlaces.push((r, reg, pj) => { const u = lug(S, tipo, uid); if (!u) return; const c = E().cargaUbicacion(u); caja.replaceChildren(...[h('strong', { text: kg(c.total) }), ...(c.capacidad !== null ? [` de ${kg(c.capacidad)} de capacidad (${c.pct}%)`, c.exceso ? h('strong', { class: 'eq-est eq-est-sobrecargado', text: ' · excede la capacidad' }) : null] : [' · sin capacidad definida'])].filter(Boolean)); });
    return caja;
  }

  /* ---------------------------------------------------------------- objetos */
  function objetos(S, tipo, uid) {
    const g = lug(S, tipo, uid), set = (id, c, v) => S.cambiar(pj => { const o = lug(S, tipo, uid).items.find(x => x.id === id); if (o) o[c] = v; });
    const filas = g.items.map(o => {
      const f = h('div', { class: 'eq-fila' },
        ui.texto(o.nombre, v => set(o.id, 'nombre', v), { placeholder: 'Objeto', 'aria-label': 'Nombre del objeto', 'data-foco': `eq-o-${o.id}-n`, class: 'eq-n' }),
        ui.numero(o.cant, v => set(o.id, 'cant', num(v) === '' ? 0 : num(v)), { min: 0, step: 1, 'aria-label': 'Cantidad', 'data-foco': `eq-o-${o.id}-c` }),
        ui.numero(o.peso, v => set(o.id, 'peso', num(v)), { min: 0, step: 'any', 'aria-label': 'Peso unitario en kg', placeholder: 'kg', 'data-foco': `eq-o-${o.id}-p` }),
        ui.numero(o.valor, v => set(o.id, 'valor', num(v)), { min: 0, step: 'any', 'aria-label': 'Valor unitario en mo', placeholder: 'mo', 'data-foco': `eq-o-${o.id}-v` }),
        ui.select(['Guardado', 'Puesto', 'Consumible'].map(x => ({ v: x, t: x })), o.estado, v => S.cambiar(pj => { const q = lug(S, tipo, uid).items.find(x => x.id === o.id); if (q) q.estado = v; }), { 'aria-label': 'Estado', 'data-foco': `eq-o-${o.id}-e` }),
        ui.texto(o.notas, v => set(o.id, 'notas', v), { placeholder: 'Notas', 'aria-label': 'Notas', 'data-foco': `eq-o-${o.id}-t` }),
        ui.boton('Vender', () => { est.venta = est.venta && est.venta.id === o.id ? null : { tipo, uid, id: o.id }; S.render(); }, 'chico', { 'data-foco': `eq-o-${o.id}-vb` }),
        ui.boton('Quitar', () => S.cambiar(pj => { const l = lug(S, tipo, uid); l.items = l.items.filter(x => x.id !== o.id); }, { estructura: true }), 'chico peligro', { 'data-foco': `eq-o-${o.id}-q` }));
      return est.venta && est.venta.id === o.id ? [f, panelVenta(S, tipo, uid, o)] : f;
    });
    return h('div', { class: 'eq-lista' },
      g.items.length ? h('div', { class: 'eq-fila eq-cab' }, ['Objeto', 'Cant.', 'Peso kg', 'Valor mo', 'Estado', 'Notas', '', ''].map(t => h('span', { text: t }))) : h('p', { class: 'vacio', text: 'Sin objetos. Agrégalos a mano o cómpralos en la pestaña Tienda.' }), filas,
      ui.boton('Agregar objeto', () => S.cambiar(pj => { lug(S, tipo, uid).items.push(E().objetoNuevo()); }, { estructura: true }), 'chico', { 'data-foco': `eq-o-nuevo-${uid || 'm'}` }));
  }
  function panelVenta(S, tipo, uid, o) {
    const v = est.venta; v.cant = v.cant || 1; if (v.precio === undefined) v.precio = ''; if (!v.tes) v.tes = tipo + ':' + uid;
    const pct = S.pj.equipo.pctVenta, sug = () => (o.valor === '' ? '' : E().precioVenta(o, v.cant, pct));
    const res = h('p', { class: 'meta' });
    const pintar = () => { res.textContent = o.valor === '' && v.precio === '' ? 'El objeto no tiene valor: escribe el precio de venta.' : `Recibes ${fmt(v.precio === '' ? sug() : num(v.precio) || 0)} mo (sugerido ${v.precio === '' && o.valor !== '' ? fmt(sug()) : o.valor === '' ? '—' : fmt(sug())} mo = ${pct}% del valor).`; };
    const caja = h('div', { class: 'eq-venta' },
      ui.campo('Cantidad', ui.numero(v.cant, x => { v.cant = Math.max(1, Math.min(Number(o.cant) || 1, Math.floor(Number(x)) || 1)); pintar(); }, { min: 1, max: o.cant, step: 1, class: 'corto', 'data-foco': 'eq-v-c' }), 'corto-c'),
      ui.campo('Precio total (mo, vacío = sugerido)', ui.numero(v.precio, x => { v.precio = x; pintar(); }, { min: 0, step: 'any', 'data-foco': 'eq-v-p' }), 'corto-c'),
      ui.campo('El dinero va a', ui.select(ui.equipoLugares(S.pj), v.tes, x => { v.tes = x; }, { 'data-foco': 'eq-v-t' })),
      ui.boton('Confirmar venta', () => { let r; S.cambiar(pj => { r = E().vender(pj.equipo, tipo, uid, o.id, v.cant, { precioTotal: v.precio, tesoreria: ui.equipoDestino(v.tes), ahora: ahora() }); }, { estructura: true }); if (r && r.ok) { est.venta = null; S.render(); S.aviso(`Vendido por ${fmt(r.centavos / 100)} mo.`); } else aviso(S, r); }, 'chico primario', { 'data-foco': 'eq-v-ok' }),
      ui.boton('Cancelar', () => { est.venta = null; S.render(); }, 'chico', { 'data-foco': 'eq-v-x' }), res);
    pintar(); return caja;
  }

  /* ---------------------------------------------------------------- monedas y tesoros */
  function monedas(S, tipo, uid) {
    const info = h('span', { class: 'meta' });
    S.enlaces.push((r, reg, pj) => { const u = lug(S, tipo, uid); if (u) info.textContent = `Valen ${fmt(E().valorMonedas(u.monedas))} mo y pesan ${kg(E().pesoMonedas(u.monedas))} (50 monedas = 0,45 kg).`; });
    return h('div', { class: 'eq-monedas' }, h('div', { class: 'rejilla g5' }, MON.map(([k, et]) => ui.campo(et, ui.numero(lug(S, tipo, uid).monedas[k], v => S.cambiar(pj => { lug(S, tipo, uid).monedas[k] = Math.floor(num(v) || 0); }), { min: 0, step: 1, 'data-foco': `eq-${uid || 'm'}-mon-${k}` }), 'corto-c'))), info);
  }
  function tesoros(S, tipo, uid) {
    const g = lug(S, tipo, uid), set = (id, c, v) => S.cambiar(pj => { const o = lug(S, tipo, uid).tesoros.find(x => x.id === id); if (o) o[c] = v; });
    return h('div', { class: 'eq-lista' },
      g.tesoros.length ? h('div', { class: 'eq-fila eq-tes eq-cab' }, ['Tipo', 'Descripción', 'Cant.', 'Valor mo', 'Peso kg', 'Estado', 'Notas', ''].map(t => h('span', { text: t }))) : h('p', { class: 'vacio', text: 'Sin tesoros (gemas, joyas, arte, objetos mágicos sin tasar…).' }),
      g.tesoros.map(o => h('div', { class: 'eq-fila eq-tes' },
        ui.texto(o.tipo, v => set(o.id, 'tipo', v), { 'aria-label': 'Tipo', 'data-foco': `eq-t-${o.id}-ti` }),
        ui.texto(o.desc, v => set(o.id, 'desc', v), { 'aria-label': 'Descripción', placeholder: 'Descripción', 'data-foco': `eq-t-${o.id}-d` }),
        ui.numero(o.cant, v => set(o.id, 'cant', num(v) === '' ? 0 : num(v)), { min: 0, step: 1, 'aria-label': 'Cantidad', 'data-foco': `eq-t-${o.id}-c` }),
        ui.numero(o.valor, v => set(o.id, 'valor', num(v)), { min: 0, step: 'any', 'aria-label': 'Valor unitario en mo', 'data-foco': `eq-t-${o.id}-v` }),
        ui.numero(o.peso, v => set(o.id, 'peso', num(v)), { min: 0, step: 'any', 'aria-label': 'Peso unitario en kg', 'data-foco': `eq-t-${o.id}-p` }),
        ui.select(['Sin identificar', 'Identificado', 'Tasado'].map(x => ({ v: x, t: x })), o.estado, v => set(o.id, 'estado', v), { 'aria-label': 'Estado', 'data-foco': `eq-t-${o.id}-e` }),
        ui.texto(o.notas, v => set(o.id, 'notas', v), { 'aria-label': 'Notas', placeholder: 'Notas', 'data-foco': `eq-t-${o.id}-n` }),
        ui.boton('Quitar', () => S.cambiar(pj => { const l = lug(S, tipo, uid); l.tesoros = l.tesoros.filter(x => x.id !== o.id); }, { estructura: true }), 'chico peligro', { 'data-foco': `eq-t-${o.id}-q` }))),
      ui.boton('Agregar tesoro', () => S.cambiar(pj => { lug(S, tipo, uid).tesoros.push(E().tesoroNuevo()); }, { estructura: true }), 'chico', { 'data-foco': `eq-t-nuevo-${uid || 'm'}` }));
  }
  const guarda = (S, tipo, uid) => [ui.bloque('Objetos', objetos(S, tipo, uid)), ui.bloque('Monedas', monedas(S, tipo, uid)), ui.bloque('Tesoros', tesoros(S, tipo, uid)),
    ui.bloque('Notas', ui.area(lug(S, tipo, uid).notas || '', v => S.cambiar(pj => { lug(S, tipo, uid).notas = v; }), { rows: 2, 'aria-label': 'Notas', 'data-foco': `eq-${uid || 'm'}-notas` }))];

  /* ---------------------------------------------------------------- ubicaciones */
  function mejoras(S, tipo, uid, titulo) {
    const u = lug(S, tipo, uid), set = (id, c, v) => S.cambiar(pj => { const m = lug(S, tipo, uid).mejoras.find(x => x.id === id); if (m) m[c] = v; });
    return ui.bloque(titulo, u.mejoras.length ? h('div', { class: 'eq-fila eq-mej eq-cab' }, ['Nombre', 'Coste mo', 'Estado', 'Descripción', ''].map(t => h('span', { text: t }))) : h('p', { class: 'vacio', text: 'Sin mejoras anotadas.' }),
      u.mejoras.map(m => h('div', { class: 'eq-fila eq-mej' },
        ui.texto(m.nombre, v => set(m.id, 'nombre', v), { 'aria-label': 'Nombre', 'data-foco': `eq-m-${m.id}-n` }),
        ui.numero(m.coste, v => set(m.id, 'coste', num(v)), { min: 0, step: 'any', 'aria-label': 'Coste en mo', 'data-foco': `eq-m-${m.id}-c` }),
        ui.texto(m.estado, v => set(m.id, 'estado', v), { 'aria-label': 'Estado', placeholder: 'Planeada, en obra, terminada…', 'data-foco': `eq-m-${m.id}-e` }),
        ui.texto(m.desc, v => set(m.id, 'desc', v), { 'aria-label': 'Descripción', 'data-foco': `eq-m-${m.id}-d` }),
        ui.boton('Quitar', () => S.cambiar(pj => { const l = lug(S, tipo, uid); l.mejoras = l.mejoras.filter(x => x.id !== m.id); }, { estructura: true }), 'chico peligro', { 'data-foco': `eq-m-${m.id}-q` }))),
      ui.boton('Agregar mejora', () => S.cambiar(pj => { lug(S, tipo, uid).mejoras.push(E().mejoraNueva()); }, { estructura: true }), 'chico', { 'data-foco': `eq-m-nueva-${uid}` }));
  }
  function ubicacion(S, tipo) {
    const lista = S.pj.equipo[tipo];
    if (!lista.find(u => u.id === est.sel[tipo])) est.sel[tipo] = lista.length ? lista[0].id : '';
    const uid = est.sel[tipo];
    const barra = h('div', { class: 'fila-edit' },
      lista.length ? ui.campo('Unidad', ui.select(lista.map(u => ({ v: u.id, t: u.nombre || 'Sin nombre' })), uid, v => { est.sel[tipo] = v; S.render(); }, { 'data-foco': 'eq-sel-' + tipo })) : null,
      ui.boton('Nueva', () => S.cambiar(pj => { const u = E().ubicacionNueva(tipo, NOMBRE_NUEVO[tipo]); pj.equipo[tipo].push(u); est.sel[tipo] = u.id; }, { estructura: true }), 'chico primario', { 'data-foco': 'eq-nueva-' + tipo }),
      uid ? ui.boton('Eliminar', () => { const u = lug(S, tipo, uid); if (!window.confirm(`¿Eliminar "${u.nombre || 'Sin nombre'}" con todo lo que guarda?`)) return; S.cambiar(pj => { pj.equipo[tipo] = pj.equipo[tipo].filter(x => x.id !== uid); }, { estructura: true }); }, 'chico peligro', { 'data-foco': 'eq-elim-' + tipo }) : null);
    if (!uid) return [barra, h('p', { class: 'vacio', text: tipo === 'transporte' ? 'Aún no hay transportes ni alojamientos (caballo, carreta, cuarto de hotel…).' : tipo === 'fortalezas' ? 'Aún no hay fortalezas (casa, base, el lugar donde vive el personaje).' : 'Aún no hay propiedades (casas, tabernas, tiendas…).' })];
    const datos = [tx(S, tipo, uid, 'nombre', 'Nombre', null, 'crece')];
    if (tipo === 'transporte') datos.push(nu(S, tipo, uid, 'capacidad', 'Capacidad de carga (kg)'));
    else {
      datos.push(tx(S, tipo, uid, 'lugar', 'Lugar'), tx(S, tipo, uid, 'tam', 'Tamaño'), tx(S, tipo, uid, 'estado', 'Estado'), tx(S, tipo, uid, 'defensas', 'Defensas'), tx(S, tipo, uid, 'personal', 'Personal'));
      if (tipo === 'fortalezas') datos.push(nu(S, tipo, uid, 'mantenimiento', 'Mantenimiento mensual (mo)'));
      else datos.push(nu(S, tipo, uid, 'valor', 'Valor del inmueble (mo)'), nu(S, tipo, uid, 'ingreso', 'Ingreso mensual (mo)'), nu(S, tipo, uid, 'gasto', 'Gasto mensual (mo)'));
    }
    return [barra, ui.bloque(tipo === 'transporte' ? 'Datos de la unidad' : 'Datos', h('div', { class: 'rejilla g3' }, datos), tipo === 'transporte' ? cargaUbic(S, tipo, uid) : null),
      tipo === 'transporte' ? null : mejoras(S, tipo, uid, tipo === 'fortalezas' ? 'Mejoras de la fortaleza' : 'Aspectos y mejoras'), ...guarda(S, tipo, uid)];
  }

  /* ---------------------------------------------------------------- historial */
  function historial(S) {
    const g = S.pj.equipo.gastos.slice().reverse();
    return ui.bloque('Historial de gastos', g.length ? h('ul', { class: 'eq-hist' }, g.map(x => h('li', {}, h('span', { class: 'meta', text: x.t }), ' ', x.f, ' ', h('strong', { class: x.mo < 0 ? 'eq-gasto' : 'eq-ingreso', text: (x.mo > 0 ? '+' : '') + fmt(x.mo) + ' mo' })))) : h('p', { class: 'vacio', text: 'Todavía no hay compras, ventas ni servicios.' }),
      g.length ? ui.boton('Borrar historial', () => { if (window.confirm('¿Borrar todo el historial?')) S.cambiar(pj => { pj.equipo.gastos = []; }, { estructura: true }); }, 'chico peligro', { 'data-foco': 'eq-hist-borrar' }) : null);
  }

  ui.paneles.equipo = S => {
    const sub = h('div', { class: 'eq-sub', role: 'group', 'aria-label': 'Secciones del equipo' }, Object.entries(TITULOS).map(([k, t]) => h('button', { type: 'button', class: 'btn chico' + (est.sub === k ? ' primario' : ''), 'aria-pressed': String(est.sub === k), text: t, 'data-foco': 'eq-sub-' + k, onclick: () => { est.sub = k; est.venta = null; S.render(); } })));
    let cuerpo;
    if (est.sub === 'mochila') cuerpo = [ui.bloque('Carga', carga(S)), ...guarda(S, 'mochila', '')];
    else if (est.sub === 'gastos') cuerpo = [historial(S)];
    else cuerpo = ubicacion(S, est.sub);
    return h('div', { class: 'equipo' }, resumen(S), sub, cuerpo);
  };
})(window.ADND);
