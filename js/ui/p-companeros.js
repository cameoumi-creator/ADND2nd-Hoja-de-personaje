/* Pestaña Compañeros (informativa): séquito, mascotas, familiar y compañeros registrados con inventario propio.
   Nada de esto cambia números del personaje; el peso del inventario de un compañero NO suma a la carga del personaje. */
(function (A) {
  'use strict';
  const ui = A.ui, h = ui.h, U = A.util, CO = () => A.COMPANEROS;
  const est = { sub: 'secuito' };
  const SUBS = { secuito: 'Séquito', mascotas: 'Mascotas', familiar: 'Familiar', registrados: 'Compañeros registrados' };
  const nuevoId = () => 'c' + U.uid() + U.uid();
  const kg = n => (Math.round(n * 1000) / 1000).toString().replace('.', ',') + ' kg';

  /* Campo de texto ligado a una ruta del objeto del personaje (S.pj.companeros...). */
  const tx = (S, get, k, et, foco, extra) => ui.campo(et, ui.texto(get()[k], v => S.cambiar(() => { get()[k] = v; }), { 'data-foco': foco, maxlength: 300 }), extra);
  const ar = (S, get, k, et, foco, filas) => ui.campo(et, ui.area(get()[k], v => S.cambiar(() => { get()[k] = v; }), { rows: filas || 3, 'data-foco': foco }), 'ancho-todo');
  const imagen = (S, get, foco, titulo) => ui.imagenCampo(S, { valor: get().img, alCambiar: v => S.cambiar(() => { get().img = v; }, { estructura: true }), max: 192, limite: A.IMG_CHICA, titulo, foco, forma: 'chica', compacto: true });

  /* Tabla de filas fijas (seguidores, aprendices). */
  function tabla(S, filas, cols, pref) {
    return h('div', { class: 'tabla-cont' }, h('table', { class: 'cp-tabla' }, h('thead', {}, h('tr', {}, h('th', { text: '#' }), cols.map(c => h('th', { scope: 'col', text: c[1] })))),
      h('tbody', {}, filas().map((f, i) => h('tr', {}, h('td', { text: String(i + 1) }), cols.map(c => h('td', {}, ui.texto(f[c[0]], v => S.cambiar(() => { filas()[i][c[0]] = v; }), { 'aria-label': `${c[1]} ${i + 1}`, 'data-foco': `${pref}-${i}-${c[0]}` }))))))));
  }

  function secuito(S) {
    const sq = () => S.pj.companeros.secuito, t = sq().tipo;
    const sel = ui.campo('Tipo de séquito', ui.select(CO().tiposSecuito.map(x => ({ v: x, t: x || 'Ninguno' })), t, v => S.cambiar(() => { sq().tipo = v; }, { estructura: true }), { 'data-foco': 'cp-sq-tipo' }));
    const base = ui.bloque('Séquito', h('div', { class: 'cp-card' }, imagen(S, sq, 'img-secuito', 'Emblema o imagen del séquito'),
      h('div', { class: 'cp-datos' }, h('div', { class: 'rejilla g3' }, sel, tx(S, sq, 'nombre', 'Nombre del grupo', 'cp-sq-nombre'), tx(S, sq, 'sede', 'Sede', 'cp-sq-sede'), tx(S, sq, 'moral', 'Moral / lealtad', 'cp-sq-moral')))));
    const seg = ui.bloque('Seguidores principales', h('p', { class: 'ayuda', text: 'Hasta 8. Datos básicos de combate y papel en el séquito.' }),
      tabla(S, () => sq().seguidores, [['nombre', 'Nombre'], ['clase', 'Clase / oficio'], ['nv', 'Nv'], ['pg', 'PG'], ['ca', 'CA'], ['gac0', 'GAC0'], ['notas', 'Notas']], 'cp-seg'));
    const tropa = () => sq().tropa, gremio = () => sq().gremio;
    const bTropa = t === 'Tropa (guerrero)' || t === 'Mixto / otros' ? ui.bloque('Tropa (guerrero)', h('div', { class: 'rejilla g3' }, tx(S, tropa, 'tipo', 'Tipo de tropa', 'cp-tr-tipo'), tx(S, tropa, 'numero', 'Número', 'cp-tr-n'), tx(S, tropa, 'nv', 'Nv / DG', 'cp-tr-nv'), tx(S, tropa, 'ca', 'CA media', 'cp-tr-ca'), tx(S, tropa, 'moral', 'Moral', 'cp-tr-moral')), ar(S, tropa, 'notas', 'Equipo y notas', 'cp-tr-notas')) : null;
    const bGremio = t === 'Gremio de ladrones (bribón)' || t === 'Mixto / otros' ? ui.bloque('Gremio de ladrones (bribón)', h('div', { class: 'rejilla g3' }, tx(S, gremio, 'nombre', 'Nombre del gremio', 'cp-gr-nombre'), tx(S, gremio, 'miembros', 'Miembros', 'cp-gr-n'), tx(S, gremio, 'territorio', 'Territorio', 'cp-gr-terr'), tx(S, gremio, 'renta', 'Renta / mes', 'cp-gr-renta')), ar(S, gremio, 'notas', 'Contactos, leyes internas, problemas', 'cp-gr-notas')) : null;
    const bApr = t === 'Aprendices (mago / sacerdote)' || t === 'Mixto / otros' ? ui.bloque('Aprendices (mago / sacerdote)', h('p', { class: 'ayuda', text: 'Los lanzadores no levantan tropa ni gremio: solo discípulos.' }),
      tabla(S, () => sq().aprendices, [['nombre', 'Nombre'], ['tradicion', 'Tradición'], ['nv', 'Nv'], ['tareas', 'Tareas'], ['notas', 'Notas']], 'cp-apr')) : null;
    return [base, seg, bTropa, bGremio, bApr];
  }

  /* Fila plegable: el resumen siempre visible y los datos al abrir. Lo abierto se recuerda mientras dure la sesión. */
  const abiertos = new Set();
  function fila(S, clave, get, cab, cuerpo) {
    const mini = h('span', { class: 'cp-mini' }), tit = h('strong', {}), meta = h('span', { class: 'meta' });
    const pintar = () => {
      const x = get(); if (!x) return;
      mini.replaceChildren(...[x.img ? h('img', { src: x.img, alt: '', referrerpolicy: 'no-referrer' }) : null].filter(Boolean));
      tit.textContent = x.nombre || 'Sin nombre'; meta.textContent = cab(x).filter(Boolean).join(' · ');
    };
    pintar(); S.enlaces.push(pintar);
    const d = h('details', { class: 'cp-pleg' }, h('summary', { 'data-foco': 'cp-pleg-' + clave }, mini, tit, meta), h('div', { class: 'cp-pleg-cuerpo' }, cuerpo));
    d.open = abiertos.has(clave);
    d.addEventListener('toggle', () => { if (d.open) abiertos.add(clave); else abiertos.delete(clave); });
    return d;
  }

  function mascotas(S) {
    const l = S.pj.companeros.mascotas, get = id => () => S.pj.companeros.mascotas.find(m => m.id === id);
    return [ui.bloque('Mascotas', h('p', { class: 'ayuda', text: 'Animales de compañía o de guerra. No son familiar ni séquito. Abre una fila para ver y editar sus datos.' }),
      l.length ? h('div', { class: 'cp-lista' }, l.map(m => {
        const g = get(m.id), f = 'cp-m-' + m.id;
        return fila(S, f, g, x => [x.especie, x.dg && 'DG ' + x.dg, x.pg && 'PG ' + x.pg, x.ca && 'CA ' + x.ca],
          [h('div', { class: 'rejilla g4' }, tx(S, g, 'nombre', 'Nombre', f + '-n'), tx(S, g, 'especie', 'Especie', f + '-e'), tx(S, g, 'dg', 'DG / Nv', f + '-dg'), tx(S, g, 'pg', 'PG', f + '-pg'), tx(S, g, 'ca', 'CA', f + '-ca'), tx(S, g, 'gac0', 'GAC0', f + '-g'), tx(S, g, 'ataque', 'Ataque / daño', f + '-a'), tx(S, g, 'mov', 'Movimiento', f + '-mov')),
            h('div', { class: 'cp-card' }, imagen(S, g, 'img-m-' + m.id, 'Imagen de la mascota'), h('div', { class: 'cp-datos' }, ar(S, g, 'notas', 'Trucos / notas', f + '-notas', 2))),
            h('div', { class: 'hi-cab' }, ui.boton('Eliminar', () => S.cambiar(pj => { pj.companeros.mascotas = pj.companeros.mascotas.filter(x => x.id !== m.id); }, { estructura: true }), 'chico peligro', { 'data-foco': f + '-del' }))]);
      })) : h('p', { class: 'vacio', text: 'Sin mascotas.' }),
      ui.boton('Agregar mascota', () => S.cambiar(pj => { const n = A.normalizarCompaneros({ mascotas: [{ id: nuevoId() }] }).mascotas[0]; pj.companeros.mascotas.push(n); abiertos.add('cp-m-' + n.id); }, { estructura: true }), 'chico', { 'data-foco': 'cp-m-nueva' }))];
  }

  function familiar(S) {
    const fm = () => S.pj.companeros.familiar;
    const datos = h('div', { class: 'rejilla g4' }, tx(S, fm, 'nombre', 'Nombre', 'cp-f-nombre'), tx(S, fm, 'tipo', 'Tipo', 'cp-f-tipo'), tx(S, fm, 'dueno', 'Dueño / lanzador', 'cp-f-dueno'), tx(S, fm, 'nmax', 'Nv máx. de conjuro del dueño', 'cp-f-nmax'),
      tx(S, fm, 'pg', 'PG', 'cp-f-pg'), tx(S, fm, 'ca', 'CA', 'cp-f-ca'), tx(S, fm, 'gac0', 'GAC0', 'cp-f-gac0'), tx(S, fm, 'mov', 'Movimiento', 'cp-f-mov'), tx(S, fm, 'inteligencia', 'Inteligencia', 'cp-f-int'),
      tx(S, fm, 'alcance', 'Alcance del vínculo', 'cp-f-alc'), tx(S, fm, 'sentidos', 'Sentidos', 'cp-f-sen'), tx(S, fm, 'estado', 'Estado', 'cp-f-est'));
    const poderes = h('div', { class: 'tabla-cont' }, h('table', { class: 'cp-tabla' }, h('thead', {}, h('tr', {}, ['Nv', 'Poder', 'Efecto'].map(t => h('th', { text: t })))),
      h('tbody', {}, fm().poderes.map((p, i) => h('tr', {}, h('td', { text: String(i + 1) }), h('td', {}, ui.texto(p.poder, v => S.cambiar(() => { fm().poderes[i].poder = v; }), { 'aria-label': 'Poder nivel ' + (i + 1), 'data-foco': 'cp-f-p' + i })), h('td', {}, ui.texto(p.efecto, v => S.cambiar(() => { fm().poderes[i].efecto = v; }), { 'aria-label': 'Efecto nivel ' + (i + 1), 'data-foco': 'cp-f-e' + i })))))));
    return [ui.bloque('Familiar', h('p', { class: 'ayuda', text: 'Abre la fila para ver y editar sus datos, poderes y vínculo.' }),
      h('div', { class: 'cp-lista' }, fila(S, 'cp-familiar', fm, x => [x.tipo, x.pg && 'PG ' + x.pg, x.ca && 'CA ' + x.ca],
        [datos, h('div', { class: 'cp-card' }, imagen(S, fm, 'img-familiar', 'Imagen del familiar'), h('div', { class: 'cp-datos' }, ar(S, fm, 'vinculo', 'Vínculo / consecuencias si muere', 'cp-f-vinc', 2))),
          h('h3', { class: 'co-sub', text: 'Poderes (uno por cada nivel de conjuro que el mago puede lanzar; deja vacíos los que aún no)' }), poderes])))];
  }

  function registrados(S) {
    const l = S.pj.companeros.registrados;
    const tarjeta = c => {
      const g = () => S.pj.companeros.registrados.find(x => x.id === c.id), f = 'cp-r-' + c.id;
      const set = (k, v) => S.cambiar(() => { g()[k] = v; });
      const pesoTotal = h('span', { class: 'meta' }); S.enlaces.push(() => { const x = g(); if (x) pesoTotal.textContent = `Peso del inventario: ${kg(x.items.reduce((s, i) => s + (Number(i.cant) || 0) * (Number(i.peso) || 0), 0))}. Pertenece al compañero: no suma a tu carga.`; });
      const cab = h('div', { class: 'cp-card' }, imagen(S, g, 'img-r-' + c.id, 'Imagen del compañero'), h('div', { class: 'cp-datos' }, h('div', { class: 'rejilla g3' }, tx(S, g, 'nombre', 'Nombre', f + '-n', 'ancho2'),
        ui.campo('Tipo', ui.select(CO().tipos.map(x => ({ v: x, t: x })), c.tipo, v => set('tipo', v), { 'data-foco': f + '-tipo' })), ui.campo('Estado', ui.select(CO().estados.map(x => ({ v: x, t: x })), c.estado, v => set('estado', v), { 'data-foco': f + '-est' })))));
      const acciones = h('div', { class: 'hi-cab' }, ui.boton(c.oculta ? 'Mostrar ficha' : 'Ocultar ficha', () => S.cambiar(() => { g().oculta = !g().oculta; }, { estructura: true }), 'chico', { 'data-foco': f + '-ocultar' }),
        ui.boton('Duplicar', () => S.cambiar(pj => { const cp = JSON.parse(JSON.stringify(g())); cp.id = nuevoId(); cp.nombre = (cp.nombre || 'Sin nombre') + ' (copia)'; cp.items.forEach(i => { i.id = nuevoId(); }); pj.companeros.registrados.push(cp); }, { estructura: true }), 'chico', { 'data-foco': f + '-dup' }),
        ui.boton('Eliminar', () => { if (window.confirm(`¿Eliminar a "${c.nombre || 'Sin nombre'}"?`)) S.cambiar(pj => { pj.companeros.registrados = pj.companeros.registrados.filter(x => x.id !== c.id); }, { estructura: true }); }, 'chico peligro', { 'data-foco': f + '-del' }));
      if (c.oculta) return h('div', { class: 'cp-fila' }, h('p', {}, h('strong', { text: c.nombre || 'Sin nombre' }), h('span', { class: 'meta', text: ` · ${c.tipo} · ${c.estado}` })), acciones);
      const campos = h('div', { class: 'rejilla g3' }, [['clase', 'Clase / especie / oficio'], ['nivel', 'Nivel / DG'], ['pgAct', 'PG actuales'], ['pgMax', 'PG máximos'], ['ca', 'CA'], ['gac0', 'GAC0'], ['mov', 'Movimiento'], ['ataque', 'Ataque / daño'], ['moral', 'Moral'], ['lealtad', 'Lealtad'], ['cargaPropia', 'Carga propia'], ['vinculo', 'Vínculo / relación'], ['ordenes', 'Órdenes / función habitual'], ['dinero', 'Dinero propio']].map(([k, et]) => tx(S, g, k, et, `${f}-${k}`)));
      const inv = h('div', { class: 'eq-lista' }, c.items.length ? h('div', { class: 'eq-fila eq-cab', style: 'grid-template-columns: minmax(9rem,2fr) 5rem 6rem minmax(8rem,2fr) auto' }, ['Objeto', 'Cant.', 'Peso unit. kg', 'Notas', ''].map(t => h('span', { text: t }))) : null,
        c.items.map(it => { const gi = () => g().items.find(x => x.id === it.id), si = (k, v) => S.cambiar(() => { gi()[k] = v; }), n = v => { const x = Number(String(v).replace(',', '.')); return v === '' ? '' : Number.isFinite(x) && x >= 0 ? x : ''; };
          return h('div', { class: 'eq-fila', style: 'grid-template-columns: minmax(9rem,2fr) 5rem 6rem minmax(8rem,2fr) auto' }, ui.texto(it.nombre, v => si('nombre', v), { 'aria-label': 'Objeto', 'data-foco': `${f}-i-${it.id}-n` }), ui.numero(it.cant, v => si('cant', n(v)), { min: 0, step: 'any', 'aria-label': 'Cantidad', 'data-foco': `${f}-i-${it.id}-c` }),
            ui.numero(it.peso, v => si('peso', n(v)), { min: 0, step: 'any', 'aria-label': 'Peso unitario', 'data-foco': `${f}-i-${it.id}-p` }), ui.texto(it.notas, v => si('notas', v), { 'aria-label': 'Notas', 'data-foco': `${f}-i-${it.id}-t` }),
            ui.boton('Quitar', () => S.cambiar(() => { g().items = g().items.filter(x => x.id !== it.id); }, { estructura: true }), 'chico peligro', { 'data-foco': `${f}-i-${it.id}-q` })); }),
        ui.boton('Agregar objeto', () => S.cambiar(() => { g().items.push({ id: nuevoId(), nombre: '', cant: 1, peso: '', notas: '' }); }, { estructura: true }), 'chico', { 'data-foco': f + '-i-nuevo' }), pesoTotal);
      return h('div', { class: 'cp-fila' }, cab, campos, ar(S, g, 'notas', 'Personalidad, habilidades especiales y notas', f + '-notas'), h('h3', { class: 'co-sub', text: 'Inventario propio' }), inv, acciones);
    };
    return [ui.bloque('Compañeros registrados', h('p', { class: 'ayuda', text: 'Ficha rápida con inventario y carga propios. No suma a la carga del personaje.' }), l.length ? l.map(tarjeta) : h('p', { class: 'vacio', text: 'Sin compañeros registrados.' }),
      ui.boton('Agregar compañero', () => S.cambiar(pj => { pj.companeros.registrados.push(A.normalizarCompaneros({ registrados: [{ id: nuevoId() }] }).registrados[0]); }, { estructura: true }), 'chico primario', { 'data-foco': 'cp-r-nuevo' }))];
  }

  ui.paneles.companeros = S => {
    const sub = h('div', { class: 'eq-sub', role: 'group', 'aria-label': 'Secciones de compañeros' }, Object.entries(SUBS).map(([k, t]) => h('button', { type: 'button', class: 'btn chico' + (est.sub === k ? ' primario' : ''), 'aria-pressed': String(est.sub === k), text: t, 'data-foco': 'cp-sub-' + k, onclick: () => { est.sub = k; S.render(); } })));
    const cuerpo = { secuito, mascotas, familiar, registrados }[est.sub](S);
    return h('div', { class: 'companeros' }, sub, cuerpo);
  };
})(window.ADND);
