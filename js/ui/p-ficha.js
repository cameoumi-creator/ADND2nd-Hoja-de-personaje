/* Pestaña Ficha: identidad, raza y características.
   Cada característica muestra "de dónde sale" cada punto (raza, variante, kit, bonos manuales). */
(function (A) {
  'use strict';
  const ui = A.ui, U = A.util, h = ui.h;
  const ALINEAMIENTOS = ['Legal Bueno', 'Neutral Bueno', 'Caótico Bueno', 'Legal Neutral', 'Neutral', 'Caótico Neutral', 'Legal Malvado', 'Neutral Malvado', 'Caótico Malvado'];

  const textoMods = m => A.STATS.filter(s => m && m[s]).map(s => `${s} ${U.signo(m[s])}`).join('  ');

  function identidad(S) {
    const t = (clave, etiqueta, extra) => ui.campo(etiqueta, ui.texto(S.pj.identidad[clave], v => S.cambiar(pj => { pj.identidad[clave] = v; }), { 'data-foco': 'id-' + clave }), extra);
    const deidades = [{ v: '', t: 'Ninguna' }].concat(S.reg.deidades.map(d => ({ v: d.id, t: d.nombre })));
    if (S.pj.identidad.deidad && !S.reg.deidad(S.pj.identidad.deidad)) deidades.push({ v: S.pj.identidad.deidad, t: '(deidad que ya no existe)' });
    return ui.bloque('Identidad',
      h('div', { class: 'rejilla g3' },
        t('nombre', 'Nombre', 'ancho2'), t('jugador', 'Jugador'),
        ui.campo('Alineamiento', ui.select(ALINEAMIENTOS.map(a => ({ v: a, t: a })), S.pj.identidad.alineamiento, v => S.cambiar(pj => { pj.identidad.alineamiento = v; }), { 'data-foco': 'id-ali' })),
        ui.campo('Deidad', ui.select(deidades, S.pj.identidad.deidad, v => S.cambiar(pj => { pj.identidad.deidad = v; }), { 'data-foco': 'id-deidad' })),
        t('sexo', 'Sexo'), t('edad', 'Edad'), t('altura', 'Altura'), t('peso', 'Peso'), t('ojos', 'Ojos'), t('cabello', 'Cabello'), t('piel', 'Piel')),
      ui.campo('Apariencia', ui.area(S.pj.identidad.apariencia, v => S.cambiar(pj => { pj.identidad.apariencia = v; }), { rows: 3, 'data-foco': 'id-apariencia' })));
  }

  function raza(S) {
    const base = S.reg.razas.filter(r => r.origen === 'base').map(r => ({ v: r.id, t: r.nombre }));
    const hb = S.reg.razas.filter(r => r.origen === 'homebrew').map(r => ({ v: r.id, t: r.nombre }));
    const ops = [];
    if (!S.reg.raza(S.pj.raza.id)) ops.push({ v: S.pj.raza.id, t: '(raza que ya no existe)' });
    ops.push({ grupo: 'Base', items: base }); if (hb.length) ops.push({ grupo: 'Homebrew', items: hb });
    const r0 = S.reg.raza(S.pj.raza.id);
    const cont = h('div');
    cont.append(ui.campo('Raza', ui.select(ops, S.pj.raza.id, v => S.cambiar(pj => { pj.raza.id = v; pj.raza.variante = ''; pj.raza.elecciones = {}; }, { estructura: true }), { 'data-foco': 'raza-id' })));
    if (r0 && r0.variantes.length) {
      cont.append(ui.campo('Variante', ui.select([{ v: '', t: 'Sin variante' }].concat(r0.variantes.map(x => ({ v: x.id, t: x.nombre }))), S.pj.raza.variante,
        v => S.cambiar(pj => { pj.raza.variante = v; }, { estructura: true }), { 'data-foco': 'raza-var' })));
    }
    if (r0) r0.elecciones.forEach(e => {
      cont.append(ui.campo(e.etiqueta, ui.select([{ v: '', t: '— Elegir —' }].concat(e.opciones.map(o => ({ v: o.valor, t: o.etiqueta }))), S.pj.raza.elecciones[e.id] || '',
        v => S.cambiar(pj => { if (v) pj.raza.elecciones[e.id] = v; else delete pj.raza.elecciones[e.id]; }, { estructura: true }), { 'data-foco': 'raza-el-' + e.id })));
    });
    const info = h('div', { class: 'notas-raza' });
    cont.append(info);
    S.enlaces.push((r, reg, pj) => {
      const x = reg.raza(pj.raza.id); if (!x) { info.replaceChildren(); return; }
      const v = x.variantes.find(q => q.id === pj.raza.variante);
      const lineas = [];
      const m = textoMods(x.mods); if (m) lineas.push(h('p', { class: 'lapiz' }, 'Ajustes de raza: ', m));
      if (v) { const mv = textoMods(v.mods); lineas.push(h('p', { class: 'lapiz' }, `Variante ${v.nombre}: `, mv || 'sin ajustes')); }
      if (x.nota) lineas.push(h('p', { text: x.nota }));
      if (v && v.nota) lineas.push(h('p', { text: v.nota }));
      x.elecciones.forEach(e => { const o = e.opciones.find(q => q.valor === pj.raza.elecciones[e.id]); if (o && o.efectos && o.efectos.length) lineas.push(h('p', { class: 'lapiz' }, o.etiqueta + ': ', o.efectos.map(f => `${f.objetivo} ${U.signo(f.valor)}`).join(', '))); });
      info.replaceChildren(...lineas);
    });
    return ui.bloque('Raza', cont);
  }

  let idiomaSel = '';
  function idiomas(S) {
    const nat = h('div', { class: 'chips' }), cont = h('p', { class: 'ayuda' }), lista = h('div', { class: 'lista-edit' });
    S.enlaces.push(r => {
      const i = r.idiomas;
      nat.replaceChildren(...(i.nativos.length ? i.nativos.map(x => h('span', { class: 'chip' }, x.nombre)) : [h('span', { class: 'chip vacio', text: 'Esta raza no tiene idioma nativo definido' })]));
      cont.textContent = `Huecos de INT para idiomas: ${i.total} · aprendidos ${i.usados} · libres ${i.libres}`;
      cont.classList.toggle('mal', i.libres < 0);
    });
    const r0 = S.r.idiomas, tomados = new Set([...r0.aprendidos.map(x => x.id), ...r0.nativos.map(x => x.id)]);
    r0.aprendidos.forEach((x, n) => lista.append(h('div', { class: 'fila-edit' },
      h('span', { class: 'crece', text: x.nombre + (x.faltante ? ' (ya no existe en tu biblioteca)' : '') }),
      ui.boton('Quitar', () => S.cambiar(pj => { pj.idiomas.aprendidos.splice(n, 1); }, { estructura: true }), 'chico peligro', { 'data-foco': 'idi-q-' + n }))));
    const opciones = [{ v: '', t: 'Elige un idioma…' }].concat(S.reg.idiomas.filter(i => !tomados.has(i.id)).map(i => ({ v: i.id, t: i.nombre })));
    return ui.bloque('Idiomas',
      h('p', { class: 'ayuda', text: 'El idioma nativo de la raza es gratis. Los demás salen de los huecos que da la Inteligencia. Son independientes de las pericias flexibles: aunque la tabla es la misma, cada una tiene su propio cupo.' }),
      h('h3', { text: 'Nativos (gratis)' }), nat, h('h3', { text: 'Aprendidos' }),
      r0.aprendidos.length ? lista : h('p', { class: 'vacio', text: 'Todavía no aprendes ningún idioma.' }),
      h('div', { class: 'fila-edit' }, ui.select(opciones, idiomaSel, v => { idiomaSel = v; }, { 'data-foco': 'idi-sel', 'aria-label': 'Idioma a aprender' }),
        ui.boton('Agregar idioma', () => { const v = idiomaSel; if (!v) return; idiomaSel = ''; S.cambiar(pj => { if (!pj.idiomas.aprendidos.includes(v)) pj.idiomas.aprendidos.push(v); }, { estructura: true }); }, 'primario', { 'data-foco': 'idi-add' })),
      cont);
  }

  function caracteristicas(S) {
    const lista = h('div', { class: 'caras' });
    const filas = A.STATS.map(stat => {
      const base = stat === 'FUE'
        ? ui.select(A.base.tablas.pasosFuerza.map(p => ({ v: p, t: p })), S.pj.caracteristicas.FUE, v => S.cambiar(pj => { pj.caracteristicas.FUE = v; }), { 'data-foco': 'car-FUE', 'aria-label': 'Fuerza base' })
        : ui.numero(S.pj.caracteristicas[stat], v => S.cambiar(pj => { pj.caracteristicas[stat] = v === '' ? '10' : v; }), { min: 1, max: 25, step: 1, 'data-foco': 'car-' + stat, 'aria-label': A.STAT_NOMBRES[stat] + ' base' });
      const lapiz = h('div', { class: 'cara-lapiz' }), total = h('strong', { class: 'cara-total' }), chips = h('div', { class: 'chips' });
      S.enlaces.push(r => {
        const c = r.car[stat];
        const partes = [`base ${c.base}`].concat(c.partes.map(p => `${p.origen} ${p.etiqueta} ${U.signo(p.valor)}`));
        lapiz.textContent = c.partes.length ? partes.join('  ·  ') : 'sin ajustes';
        lapiz.title = stat === 'FUE' ? 'En Fuerza cada punto de ajuste avanza un paso de la tabla (… 18, 18/50, 18/75 …)' : '';
        total.textContent = c.total;
        chips.replaceChildren(...(c.fila ? Object.entries(c.fila).map(([k, v]) => h('span', { class: 'chip' }, k + ' ', h('b', { text: A.reglas.formatoFila(v) }))) : [h('span', { class: 'chip vacio', text: 'Sin fila en la tabla para este valor' })]));
      });
      return h('div', { class: 'cara' },
        h('div', { class: 'cara-nom' }, h('strong', { text: stat }), h('span', { text: A.STAT_NOMBRES[stat] })),
        h('div', { class: 'cara-base' }, base), lapiz, total, chips);
    });
    lista.append(...filas);
    const ego = h('strong', { class: 'cifra' }), bel = h('strong', { class: 'cifra' });
    S.enlaces.push(r => { ego.textContent = r.ego; bel.textContent = r.belleza; });
    return ui.bloque('Características',
      h('p', { class: 'ayuda', text: 'Pon el valor base que sacaste. Abajo de cada una ves de dónde sale cada ajuste.' }), lista,
      h('div', { class: 'derivadas' },
        h('div', {}, h('span', { text: 'Ego' }), ego, h('small', { text: 'CAR + INT + nivel' })),
        h('div', {}, h('span', { text: 'Belleza' }), bel, h('small', { text: '(CAR + CON) ÷ 2' }))));
  }

  function opcionales(S) {
    return ui.bloque('Reglas opcionales',
      h('label', { class: 'check' }, h('input', { type: 'checkbox', checked: !!S.pj.dotes.activo, 'data-foco': 'of-dotes', onchange: e => { const v = e.target.checked; S.cambiar(pj => { pj.dotes.activo = v; }, { estructura: true }); } }), ' Dotes (de nacimiento y compradas)'),
      h('p', { class: 'ayuda', text: 'Al encenderla aparece la pestaña Dotes. Si la apagas, las dotes se conservan pero se ocultan.' }));
  }

  function retrato(S) {
    return ui.bloque('Retrato', ui.imagenCampo(S, { valor: S.pj.imagenes.retrato, alCambiar: v => S.cambiar(pj => { pj.imagenes.retrato = v; }, { estructura: true }), max: 500, titulo: 'Retrato', foco: 'img-retrato', forma: 'retrato' }),
      h('p', { class: 'ayuda', text: 'Busto del personaje. Aparece en el menú lateral y en la hoja impresa. El de cuerpo entero va en Historia.' }));
  }
  /* Poderes de clase (solo informativos): los que ya tienes y los que llegan con el nivel. */
  function poderes(S) {
    const caja = h('div');
    S.enlaces.push((r) => {
      const con = r.items.filter(x => (x.clase.poderes || []).length);
      caja.replaceChildren(...(con.length ? con.map(x => {
        const lista = x.clase.poderes.slice().sort((a, b) => a.nivel - b.nivel), activos = lista.filter(q => q.nivel <= x.nivel).length;
        return h('details', { class: 'sub', open: x.i === 0 }, h('summary', { text: `${x.clase.nombre} · nivel ${x.nivel} (${activos} de ${lista.length} poderes)` }),
          h('div', { class: 'poderes' }, lista.map(q => h('div', { class: 'poder' + (q.nivel <= x.nivel ? '' : ' apagada') }, h('strong', { text: q.nombre }), h('span', { class: 'meta', text: q.nivel <= x.nivel ? ` · nivel ${q.nivel}` : ` · llega al nivel ${q.nivel}` }), h('p', { class: 'p', text: q.texto })))));
      }) : [h('p', { class: 'vacio', text: 'Tu clase no tiene poderes registrados. Puedes agregarlos en Homebrew.' })]));
    });
    return ui.bloque('Poderes de clase', caja);
  }
  ui.paneles.ficha = S => h('div', { class: 'cols' }, h('div', { class: 'col' }, retrato(S), identidad(S), raza(S), poderes(S)), h('div', { class: 'col ancha' }, caracteristicas(S), idiomas(S), opcionales(S)));
})(window.ADND);
