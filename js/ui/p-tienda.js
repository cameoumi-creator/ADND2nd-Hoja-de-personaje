/* Pestaña Tienda: catálogo de precios (base + objetos, armas y armaduras homebrew) con compra, "agregar sin pagar" y venta desde Equipo.
   Comprar descuenta de la tesorería elegida (con cambio entre monedas). Los servicios solo descuentan y quedan en el historial. */
(function (A) {
  'use strict';
  const ui = A.ui, h = ui.h, E = () => A.reglas.equipo;
  const fil = { q: '', cat: '', dest: '', sel: '', cant: 1, precio: '', destino: '', tes: 'mochila:', limite: 60 };
  const ahora = () => new Date().toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' });
  const fmt = n => ui.miles(n, 2);
  const sinAcentos = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const DEST = ['Mochila', 'Transporte', 'Fortaleza', 'Propiedades', 'Servicio'];
  const TIPO_DE = { Mochila: 'mochila', Transporte: 'transporte', Fortaleza: 'fortalezas', Propiedades: 'propiedades' };

  /* Destino sugerido: la primera unidad del tipo que pide el objeto; si no hay, la Mochila. */
  const destinoPorDefecto = (pj, it) => { const t = TIPO_DE[it.destino]; if (!t || t === 'mochila') return 'mochila:'; const u = (pj.equipo[t] || [])[0]; return u ? t + ':' + u.id : 'mochila:'; };

  function detalleItem(it) {
    const lin = (et, v) => (v ? h('div', { class: 'cj-lin' }, h('strong', { text: et + ': ' }), String(v)) : null);
    return [h('h3', { class: 'co-sub', text: it.nombre }), h('p', { class: 'meta', text: `${it.categoria}${it.origen === 'homebrew' ? ' · homebrew' : ''}` }),
      lin('Precio', it.coste + (it.aprox ? ' (aproximado)' : '')), lin('Peso', it.pesoTxt || (it.peso ? it.peso + ' kg' : '')), lin('Destino sugerido', it.destino),
      it.arma ? lin('Arma', `Tamaño ${it.arma.tam} · tipo ${it.arma.tipo} · daño ${it.arma.dm} / ${it.arma.dg}${it.arma.vel ? ' · vel. ' + it.arma.vel : ''}`) : null, lin('Notas', it.notas)];
  }

  function panelCompra(S, it) {
    const pj = S.pj, lugares = ui.equipoLugares(pj), esServ = it.destino === 'Servicio';
    const cant = Math.max(1, Math.floor(Number(fil.cant)) || 1), unit = fil.precio !== '' ? Number(fil.precio) : it.valor;
    const total = unit === null || unit === undefined || !Number.isFinite(unit) ? null : Math.round(unit * cant * 100) / 100;
    if (!lugares.some(l => l.v === fil.destino)) fil.destino = destinoPorDefecto(pj, it);
    if (!lugares.some(l => l.v === fil.tes)) fil.tes = 'mochila:';
    const info = h('p', { class: 'meta' });
    S.enlaces.push((r, reg, p) => {
      const t = ui.equipoDestino(fil.tes), l = E().lugar(p.equipo, t.tipo, t.id);
      info.textContent = l ? `Tesorería elegida: ${fmt(E().valorMonedas(l.monedas))} mo (${['mc', 'mp', 'me', 'mo', 'mpl'].map(k => l.monedas[k] + ' ' + k.toUpperCase()).join(' · ')}).` : '';
    });
    const opciones = { cant, destino: ui.equipoDestino(fil.destino), tesoreria: ui.equipoDestino(fil.tes), precioUnit: fil.precio !== '' ? Number(fil.precio) : undefined, ahora: ahora() };
    const resultado = r => { if (r.ok) S.aviso(r.mensaje || 'Hecho.'); else S.aviso(r.error, true); };
    return h('div', { class: 'tn-compra' }, ...detalleItem(it),
      h('div', { class: 'rejilla g3' },
        ui.campo('Cantidad', ui.numero(fil.cant, v => { fil.cant = v; S.render(); }, { min: 1, step: 1, 'data-foco': 'tn-cant' }), 'corto-c'),
        ui.campo(it.valor === null ? 'Precio unitario (mo) — sin precio, escríbelo' : 'Precio unitario (mo)', ui.numero(fil.precio !== '' ? fil.precio : (it.valor === null ? '' : it.valor), v => { fil.precio = v; S.render(); }, { min: 0, step: 'any', 'data-foco': 'tn-precio' }), 'corto-c'),
        ui.campo('Total', h('output', { class: 'tn-total', text: total === null ? '—' : fmt(total) + ' mo' }), 'corto-c')),
      h('div', { class: 'rejilla g3' },
        esServ ? null : ui.campo('Guardar en', ui.select(lugares, fil.destino, v => { fil.destino = v; S.render(); }, { 'data-foco': 'tn-destino' })),
        ui.campo('Pagar con la tesorería de', ui.select(lugares, fil.tes, v => { fil.tes = v; S.render(); }, { 'data-foco': 'tn-tes' }))),
      info,
      h('div', { class: 'fila-edit' },
        ui.boton(esServ ? 'Pagar servicio' : 'Comprar', () => { let r; S.cambiar(pj => { r = E().comprar(pj.equipo, it, opciones); if (r.ok) r.mensaje = `${esServ ? 'Pagado' : 'Comprado'}: ${it.nombre} (${fmt(r.centavos / 100)} mo).`; }, { estructura: true }); resultado(r); }, 'primario', { 'data-foco': 'tn-comprar' }),
        esServ ? null : ui.boton('Agregar sin pagar', () => { let ok; S.cambiar(pj => { ok = E().agregar(pj.equipo, it, { cant, destino: opciones.destino, precioUnit: opciones.precioUnit }); }, { estructura: true }); resultado(ok ? { ok: true, mensaje: `Agregado sin pagar: ${it.nombre}.` } : { ok: false, error: 'El destino elegido ya no existe.' }); }, '', { 'data-foco': 'tn-sinpagar' })),
      h('p', { class: 'ayuda', text: esServ ? 'Los servicios solo descuentan el dinero y quedan anotados en el historial.' : 'Lo comprado se guarda como una copia (nombre, peso y valor): si cambias la tienda, no se altera. Las armas y armaduras van a la lista; no se pasan solas a las pestañas Armas o Armadura.' }));
  }

  ui.paneles.tienda = S => {
    const todos = S.reg.tienda(), cats = (A.base.tienda.categorias || []).concat([...new Set(todos.map(x => x.categoria))].filter(c => !(A.base.tienda.categorias || []).includes(c)));
    const q = sinAcentos(fil.q.trim()), lista = todos.filter(x => (!fil.cat || x.categoria === fil.cat) && (!fil.dest || x.destino === fil.dest) && (!q || sinAcentos(x.nombre).includes(q)));
    const it = todos.find(x => x.id === fil.sel) || null;
    const filtros = h('div', { class: 'co-filtros' },
      ui.texto(fil.q, v => { fil.q = v; fil.limite = 60; S.render(); }, { type: 'search', placeholder: 'Buscar en la tienda…', 'aria-label': 'Buscar en la tienda', 'data-foco': 'tn-q' }),
      ui.select([{ v: '', t: 'Todas las categorías' }].concat(cats.map(c => ({ v: c, t: c }))), fil.cat, v => { fil.cat = v; fil.limite = 60; S.render(); }, { 'aria-label': 'Categoría', 'data-foco': 'tn-cat' }),
      ui.select([{ v: '', t: 'Cualquier destino' }].concat(DEST.map(c => ({ v: c, t: c }))), fil.dest, v => { fil.dest = v; fil.limite = 60; S.render(); }, { 'aria-label': 'Destino', 'data-foco': 'tn-dest' }));
    const lis = lista.slice(0, fil.limite).map(x => h('li', {}, h('button', { type: 'button', class: 'tn-item' + (x.id === fil.sel ? ' sel' : ''), 'aria-pressed': String(x.id === fil.sel), 'data-foco': 'tn-i-' + x.id,
      onclick: () => { fil.sel = x.id; fil.precio = ''; fil.cant = 1; fil.destino = destinoPorDefecto(S.pj, x); S.render(); } },
      h('strong', { text: x.nombre }), h('span', { class: 'meta', text: ` · ${x.categoria}${x.origen === 'homebrew' ? ' · homebrew' : ''}` }), h('span', { class: 'tn-precio', text: x.coste + (x.aprox ? ' ≈' : '') }))));
    return h('div', { class: 'tienda' },
      ui.bloque('Tienda', h('p', { class: 'ayuda', text: 'Elige un objeto, indica de qué tesorería pagas y dónde se guarda. Las armas y armaduras homebrew aparecen aquí solas; para añadir otros objetos usa Homebrew → Objetos de tienda.' }), filtros,
        h('div', { class: 'tn-cols' },
          h('div', { class: 'tn-lista' }, h('p', { class: 'meta', text: `${lista.length} objeto(s)` }), h('ul', { class: 'tn-ul' }, lis),
            lista.length > fil.limite ? ui.boton(`Mostrar más (${lista.length - fil.limite})`, () => { fil.limite += 60; S.render(); }, 'chico', { 'data-foco': 'tn-mas' }) : null),
          h('div', { class: 'tn-lado' }, it ? panelCompra(S, it) : h('p', { class: 'vacio', text: 'Elige un objeto de la lista.' })))));
  };
})(window.ADND);
