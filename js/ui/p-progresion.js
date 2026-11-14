/* Pestaña Progresión: trayectoria, clases con kit y PX, puntos de golpe y pericias. */
(function (A) {
  'use strict';
  const ui = A.ui, U = A.util, h = ui.h;
  const TRAYECTORIAS = [
    ['unica', 'Clase única', 'Solo la primera clase gobierna THAC0, salvaciones y PG.'],
    ['multi', 'Multiclase', 'Se usa el mejor THAC0 y la mejor salvación de entre las clases. Los PG de cada nivel se dividen entre el número de clases.'],
    ['dual', 'Clase dual', 'Marca como Congelada la clase anterior. La actual gobierna hasta superar el nivel de la congelada; entonces recuperas ambas.']
  ];

  function opcionesClase(S) {
    const base = S.reg.clases.filter(c => c.origen === 'base').map(c => ({ v: c.id, t: c.nombre }));
    const hb = S.reg.clases.filter(c => c.origen === 'homebrew').map(c => ({ v: c.id, t: c.nombre }));
    const o = [{ v: '', t: '— Elegir clase —' }, { grupo: 'Base', items: base }];
    if (hb.length) o.push({ grupo: 'Homebrew', items: hb });
    return o;
  }

  function clases(S) {
    const tbody = h('tbody');
    S.pj.clases.forEach((c, i) => {
      const cambiar = (fn, est) => S.cambiar(pj => fn(pj.clases[i]), est ? { estructura: true } : undefined);
      const kits = [{ v: '', t: 'Sin kit' }].concat(S.reg.kitsDe(c.clase).map(k => ({ v: k.id, t: k.nombre })));
      if (c.kit && !S.reg.kitDe(c.clase, c.kit)) kits.push({ v: c.kit, t: '(kit que ya no existe)' });
      const nivel = ui.numero(c.nivel, v => cambiar(x => { x.nivel = U.clamp(Math.round(U.num(v)) || 1, 1, 30); }), { min: 1, max: 30, 'data-foco': `cl${i}-nivel`, 'aria-label': 'Nivel' });
      const xp = ui.numero(c.xp, v => cambiar(x => { x.xp = Math.max(0, U.num(v)); }), { min: 0, step: 100, 'data-foco': `cl${i}-xp`, 'aria-label': 'Puntos de experiencia' });
      const efectivo = h('td', { class: 'num', 'data-et': 'PX con bono' }), siguiente = h('td', { class: 'num', 'data-et': 'Siguiente' }), dado = h('td', { class: 'num', 'data-et': 'Dado' });
      if (c.modo === 'auto') nivel.readOnly = true;
      S.enlaces.push(r => {
        const it = r.items.find(x => x.i === i);
        if (c.modo === 'auto' && it && document.activeElement !== nivel) nivel.value = it.nivel;
        efectivo.textContent = it ? it.xpEfectivo.toLocaleString('es-MX') : '—';
        siguiente.textContent = it ? (it.xpSiguiente === null ? 'Máx.' : it.xpSiguiente.toLocaleString('es-MX')) : '—';
        dado.textContent = it ? 'd' + it.clase.dg : '—';
      });
      tbody.append(h('tr', {},
        h('td', { 'data-et': 'Clase' }, ui.select(opcionesClase(S), c.clase, v => cambiar(x => { x.clase = v; x.kit = ''; }, true), { 'data-foco': `cl${i}-clase`, 'aria-label': 'Clase' })),
        h('td', { 'data-et': 'Kit' }, ui.select(kits, c.kit, v => cambiar(x => { x.kit = v; }, true), { 'data-foco': `cl${i}-kit`, 'aria-label': 'Kit' })),
        h('td', { 'data-et': 'Estado' }, ui.select([{ v: 'Activa', t: 'Activa' }, { v: 'Congelada', t: 'Congelada' }], c.estado, v => cambiar(x => { x.estado = v; }, true),
          { 'data-foco': `cl${i}-estado`, 'aria-label': 'Estado', disabled: S.pj.trayectoria !== 'dual', title: S.pj.trayectoria !== 'dual' ? 'Solo importa en clase dual' : null })),
        h('td', { 'data-et': 'Nivel por' }, ui.select([{ v: 'auto', t: 'PX' }, { v: 'manual', t: 'Manual' }], c.modo, v => cambiar(x => { x.modo = v; }, true), { 'data-foco': `cl${i}-modo`, 'aria-label': 'Cómo se calcula el nivel' })),
        h('td', { 'data-et': 'Nivel' }, nivel), h('td', { 'data-et': 'PX' }, xp), efectivo, siguiente, dado,
        h('td', { class: 'acc' }, ui.boton('Quitar', () => S.cambiar(pj => { pj.clases.splice(i, 1); }, { estructura: true }), 'chico peligro', { 'aria-label': 'Quitar esta clase' }))));
    });
    const trayectoria = ui.select(TRAYECTORIAS.map(t => ({ v: t[0], t: t[1] })), S.pj.trayectoria, v => S.cambiar(pj => { pj.trayectoria = v; }, { estructura: true }), { 'data-foco': 'tray' });
    return ui.bloque('Clases y experiencia',
      h('div', { class: 'rejilla g3' },
        ui.campo('Trayectoria', trayectoria),
        ui.campo('Bono de PX (%)', ui.numero(S.pj.bonoXp, v => S.cambiar(pj => { pj.bonoXp = U.num(v); }), { step: 5, 'data-foco': 'bonoxp' }))),
      h('p', { class: 'ayuda', text: TRAYECTORIAS.find(t => t[0] === S.pj.trayectoria)[2] }),
      h('div', { class: 'tabla-cont' }, h('table', { class: 'tabla clases' },
        h('thead', {}, h('tr', {}, ['Clase', 'Kit', 'Estado', 'Nivel por', 'Nivel', 'PX', 'PX con bono', 'Siguiente', 'Dado', ''].map(t => h('th', { scope: 'col', text: t })))), tbody)),
      ui.boton('Agregar clase', () => S.cambiar(pj => { pj.clases.push({ clase: '', kit: '', estado: 'Activa', modo: 'auto', nivel: 1, xp: 0 }); }, { estructura: true })));
  }

  function puntosDeGolpe(S) {
    const tbody = h('tbody');
    const totales = { clases: h('strong'), extra: h('strong'), bono: h('strong'), max: h('strong', { class: 'cifra' }) };
    S.enlaces.push(r => {
      ui.sincronizar(tbody, r.pg.filas, f => f.key,
        f => {
          const tirada = ui.numero('', v => S.cambiar(pj => { pj.pg.tiradas[f.key] = U.clamp(Math.round(U.num(v)), 0, 99); }), { min: 0, step: 1, class: 'corto', 'data-foco': 'pg-' + f.key, 'aria-label': 'Tirada ' + f.origen });
          return h('tr', {}, h('td', { class: 'o' }), h('td', { class: 'd' }), h('td', { class: 't' }, tirada), h('td', { class: 'c num' }), h('td', { class: 'tot num' }));
        },
        (tr, f) => {
          tr.querySelector('.o').textContent = f.origen; tr.querySelector('.d').textContent = f.dado;
          const inp = tr.querySelector('input'), td = tr.querySelector('.t');
          if (f.editable) { inp.hidden = false; if (document.activeElement !== inp) inp.value = S.pj.pg.tiradas[f.key] === undefined ? '' : S.pj.pg.tiradas[f.key]; const extra = td.querySelector('span'); if (extra) extra.remove(); }
          else { inp.hidden = true; let sp = td.querySelector('span'); if (!sp) { sp = h('span'); td.append(sp); } sp.textContent = f.tirada; }
          tr.querySelector('.c').textContent = f.con ? U.signo(f.con) : '0'; tr.querySelector('.tot').textContent = f.total;
        });
      totales.clases.textContent = r.pg.clases; totales.extra.textContent = r.pg.extra; totales.bono.textContent = U.signo(r.pg.bono); totales.max.textContent = r.pg.max;
    });

    const extras = h('div', { class: 'lista-edit' });
    S.pj.pg.extra.forEach((e, i) => extras.append(h('div', { class: 'fila-edit' },
      ui.texto(e.origen, v => S.cambiar(pj => { pj.pg.extra[i].origen = v; }), { placeholder: 'Origen (p. ej. poción, don divino)', 'data-foco': `pgx${i}-o`, 'aria-label': 'Origen' }),
      ui.numero(e.total, v => S.cambiar(pj => { pj.pg.extra[i].total = U.num(v); }), { class: 'corto', 'data-foco': `pgx${i}-t`, 'aria-label': 'PG' }),
      ui.boton('Quitar', () => S.cambiar(pj => { pj.pg.extra.splice(i, 1); }, { estructura: true }), 'chico peligro'))));

    const dadosMax = () => S.cambiar(pj => { S.r.pg.filas.forEach(f => { if (f.dado !== 'fijo') pj.pg.tiradas[f.key] = Number(String(f.dado).slice(1)); }); }, { estructura: true });
    const abierto = A.almacen.pref('pgDetalle', null);
    const detalle = h('details', { class: 'desplegable pg-detalle' }, h('summary', { text: 'Dados de cada nivel' }),
      h('div', { class: 'tabla-cont' }, h('table', { class: 'tabla pg' },
        h('thead', {}, h('tr', {}, ['Nivel', 'Dado', 'Tirada', 'CON', 'PG'].map(t => h('th', { scope: 'col', text: t })))), tbody)));
    detalle.open = abierto === null ? S.pj.pg.modo === 'tirada' : !!abierto;
    detalle.addEventListener('toggle', () => A.almacen.fijarPref('pgDetalle', detalle.open));
    const actual = ui.numero(S.pj.pg.actual === null ? '' : S.pj.pg.actual, v => S.cambiar(pj => { pj.pg.actual = v === '' ? null : Math.round(U.num(v)); }), { class: 'corto', 'data-foco': 'pg-actual', 'aria-label': 'PG actuales' });
    return ui.bloque('Puntos de golpe',
      h('div', { class: 'rejilla g3' },
        ui.campo('Cómo se calculan', ui.select([{ v: 'maximo', t: 'Dado máximo en cada nivel' }, { v: 'tirada', t: 'Anoto mis tiradas' }], S.pj.pg.modo, v => S.cambiar(pj => { pj.pg.modo = v; }, { estructura: true }), { 'data-foco': 'pg-modo' })),
        ui.campo('PG actuales', h('div', { class: 'junto' }, actual, h('span', { class: 'sobre' }, '/ ', totales.max)))),
      h('div', { class: 'fila-edit' },
        ui.boton('Llenar PG al máximo', () => S.cambiar(pj => { pj.pg.actual = S.r.pg.max; }, { estructura: true }), 'primario', { 'data-foco': 'pg-llenar' }),
        S.pj.pg.modo === 'tirada' ? ui.boton('Poner todos los dados al máximo', dadosMax, '', { 'data-foco': 'pg-dados-max' }) : null),
      detalle,
      h('p', { class: 'suma-pg' }, 'Por clase ', totales.clases, '  ·  extraordinarios ', totales.extra, '  ·  bonos ', totales.bono),
      h('h3', { text: 'Entradas extraordinarias' }), extras,
      ui.boton('Agregar entrada', () => S.cambiar(pj => { pj.pg.extra.push({ origen: '', total: 0 }); }, { estructura: true })));
  }

  function pericias(S) {
    const p = S.pj.pericias;
    const lista = (clave, titulo, conCosto) => {
      const c = h('div', { class: 'lista-edit' });
      p[clave].forEach((x, i) => c.append(h('div', { class: 'fila-edit' },
        ui.texto(x.nombre, v => S.cambiar(pj => { pj.pericias[clave][i].nombre = v; }), { placeholder: conCosto ? 'Pericia' : 'Arma o grupo de armas', 'data-foco': `${clave}${i}-n`, 'aria-label': titulo }),
        conCosto ? ui.numero(x.costo, v => S.cambiar(pj => { pj.pericias[clave][i].costo = Math.max(1, Math.round(U.num(v)) || 1); }), { class: 'corto', min: 1, 'data-foco': `${clave}${i}-c`, 'aria-label': 'Costo en ranuras' }) : null,
        ui.boton('Quitar', () => S.cambiar(pj => { pj.pericias[clave].splice(i, 1); }, { estructura: true }), 'chico peligro'))));
      return h('div', {}, h('h3', { text: titulo }), c, ui.boton('Agregar', () => S.cambiar(pj => { pj.pericias[clave].push(conCosto ? { nombre: '', costo: 1 } : { nombre: '' }); }, { estructura: true })));
    };
    const m = { pa: h('strong', { class: 'cifra' }), pna: h('strong', { class: 'cifra' }), pad: h('small'), pnad: h('small'), flex: h('span'), libre: h('span'), ambi: h('span') };
    const fpa = ui.numero(p.flex.pa, v => S.cambiar(pj => { pj.pericias.flex.pa = Math.max(0, Math.floor(U.num(v))); }), { class: 'corto', min: 0, 'data-foco': 'flex-pa', 'aria-label': 'Flexibles a pericias de arma' });
    const fpna = ui.numero(p.flex.pna, v => S.cambiar(pj => { pj.pericias.flex.pna = Math.max(0, Math.floor(U.num(v))); }), { class: 'corto', min: 0, 'data-foco': 'flex-pna', 'aria-label': 'Flexibles a pericias sin arma' });
    S.enlaces.push(r => {
      const q = r.pericias;
      m.pa.textContent = q.disponiblesPA; m.pna.textContent = q.disponiblesPNA;
      m.pad.textContent = `clase ${q.pa} (${q.fuentePA}) + flexibles ${q.flexPA} − ambidestría ${q.comprometidoPA} − anotadas ${q.gastadoPA}`;
      m.pnad.textContent = `clase ${q.pna} (${q.fuentePNA}) + flexibles ${q.flexPNA} − ambidestría ${q.comprometidoPNA} − anotadas ${q.gastadoPNA}`;
      m.flex.textContent = q.flex; m.libre.textContent = q.flexLibre; m.libre.title = `Ya descontados ${q.idiomasUsados} idioma(s) aprendido(s)`;
      m.ambi.textContent = q.ambidestria.gratis ? `Gratis por ${q.ambidestria.origen}` : (q.ambidestria.activa ? `Consume 1 ${q.ambidestria.reserva}` : 'No comprada');
    });
    return ui.bloque('Pericias',
      h('div', { class: 'pericias-res' },
        h('div', {}, h('span', { text: 'De arma disponibles' }), m.pa, m.pad),
        h('div', {}, h('span', { text: 'Sin arma disponibles' }), m.pna, m.pnad)),
      h('div', { class: 'rejilla g3' },
        ui.campo('Flexibles a armas', fpa), ui.campo('Flexibles a sin arma', fpna),
        h('div', { class: 'campo' }, h('span', { class: 'campo-et', text: 'Flexibles por INT' }), h('div', { class: 'texto-simple' }, m.flex, ' (sin asignar ', m.libre, ')'))),
      h('div', { class: 'rejilla g3' },
        ui.campo('Ambidestría', ui.select([{ v: 'no', t: 'No comprada' }, { v: 'PA', t: 'Comprada con 1 PA' }, { v: 'PNA', t: 'Comprada con 1 PNA' }],
          p.ambidestria.comprada ? p.ambidestria.reserva : 'no', v => S.cambiar(pj => { if (v === 'no') pj.pericias.ambidestria.comprada = false; else { pj.pericias.ambidestria.comprada = true; pj.pericias.ambidestria.reserva = v; } }), { 'data-foco': 'ambi' })),
        h('div', { class: 'campo' }, h('span', { class: 'campo-et', text: 'Estado' }), h('div', { class: 'texto-simple' }, m.ambi))),
      h('p', { class: 'ayuda', text: 'Las pericias de arma se compran en la pestaña Armas y las de no arma en Pericias; ambas se descuentan solas de aquí.' }),
      p.armas.length ? lista('armas', 'Armas anotadas antes (pásalas a la pestaña Armas y quítalas de aquí)', false) : null,
      p.otras.length ? lista('otras', 'Pericias sin arma anotadas antes (pásalas a la pestaña Pericias y quítalas de aquí)', true) : null);
  }

  ui.paneles.progresion = S => h('div', { class: 'cols' },
    h('div', { class: 'col todo' }, clases(S)), h('div', { class: 'col ancha' }, puntosDeGolpe(S)), h('div', { class: 'col' }, pericias(S)));
})(window.ADND);
