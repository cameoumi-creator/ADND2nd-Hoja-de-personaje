/* Pestaña Consulta: wiki interna de solo lectura. No necesita personaje: lee del mismo registro que la ficha
   (datos base + todo lo homebrew, marcado con su origen). Incluye la magia salvaje (tablas 1 y 2). */
(function (A) {
  'use strict';
  const ui = A.ui, U = A.util, h = ui.h;
  const W = () => A.reglas.salvaje;

  const est = { cat: 'salvaje', gq: '' };      // categoría abierta y búsqueda global
  const sel = {};                              // sel[cat] = id del elemento abierto
  const fil = {};                              // fil[cat] = { q, origen, ... filtros propios }
  const sal = { tabla: 'salvaje-tom', nivel: '1', d20: '', d100: '' };   // herramienta de magia salvaje

  const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const signo = n => (n > 0 ? '+' : n < 0 ? '−' : '') + Math.abs(n);
  const nombresStat = A.STAT_NOMBRES;

  /* ---------------------------------------------------------------- piezas */
  const lin = (et, v) => (v !== undefined && v !== null && v !== '' ? h('div', { class: 'cj-lin' }, h('strong', { text: et + ': ' }), String(v)) : null);
  const parrafo = t => (t ? h('p', { class: 'cj-efecto', text: t }) : null);
  const subtitulo = t => h('h3', { class: 'co-sub', text: t });
  function tabla(cols, filas, clase) {
    return h('div', { class: 'tabla-cont' }, h('table', { class: 'tabla ' + (clase || '') },
      h('thead', {}, h('tr', {}, cols.map((c, i) => h('th', { scope: 'col', class: i ? 'num' : '', text: c })))),
      h('tbody', {}, filas.map(f => h('tr', { class: f.clase || null }, f.celdas.map((c, i) => (i === 0 ? h('th', { scope: 'row', text: c }) : h('td', { class: 'num', text: c }))))))));
  }
  const modsTxt = m => Object.keys(m || {}).filter(k => m[k]).map(k => `${k} ${signo(m[k])}`).join(', ');
  const nombreCj = (reg, id) => { const c = reg.conjuro(id); return c ? c.nombre : id; };

  /* ---------------------------------------------------------------- detalles por tipo */
  const D = {};
  D.conjuro = (S, sp) => {
    const reg = S.reg, CJ = A.reglas.conjuros;
    const escuelas = (sp.escuelas || []).map(e => (e === 'universal' ? 'Todas' : (reg.escuelaMagia(e) || { nombre: e }).nombre)).join(', ');
    const esferas = CJ && CJ.esferasDe ? CJ.esferasDe(sp).map(CJ.nombreEsfera).join(', ') : sp.esfera;
    return [lin('Tipo', sp.tipo === 'divino' ? 'Divino' : 'Arcano'), lin('Nivel', sp.nv), lin(sp.tipo === 'divino' ? 'Esferas' : 'Escuelas', sp.tipo === 'divino' ? esferas : escuelas), sp.tipo === 'divino' ? null : lin('Esfera', esferas && sp.esfera ? esferas : ''),
      lin('Reversible', sp.rev ? 'Sí' : ''), lin('Alcance', sp.alcance), lin('Componentes', sp.componentes), lin('Duración', sp.duracion), lin('Tiempo de lanzamiento', sp.tiempo), lin('Área de efecto', sp.area), lin('Salvación', sp.salvacion), lin('Material', sp.material), lin('Fuente', sp.fuente),
      parrafo(sp.efecto || '(sin descripción)'), sp.reverso ? parrafo('Inverso: ' + sp.reverso) : null];
  };
  D.poderPsi = (S, p) => [lin('Disciplina', p.disc), lin('Tipo', p.tipo === 'ciencia' ? 'Ciencia' : 'Devoción'), lin('Puntuación de poder', p.puntuacionTxt), lin('Costo de inicio', p.inicio), lin('Mantenimiento', p.mant && p.mant !== 'n/d' ? p.mant : ''),
    lin('Alcance', p.alcance), lin('Preparación', p.preparacion), lin('Área', p.area), lin('Prerrequisitos', p.prerrequisitosTxt), lin('Fuente', p.fuente), parrafo(p.efecto || '(sin descripción)'), p.riesgos ? parrafo('Riesgos: ' + p.riesgos) : null];
  D.disciplinaPsi = (S, d) => {
    const lista = S.reg.poderesPsi.filter(p => p.disc === d.nombre);
    const por = t => lista.filter(p => p.tipo === t).map(p => p.nombre).join(', ');
    return [lin('Ciencias', por('ciencia') || '—'), lin('Devociones', por('devocion') || '—')];
  };
  D.tienda = (S, x) => [lin('Categoría', x.categoria), lin('Precio', x.coste + (x.aprox ? ' (aproximado)' : '')), lin('Valor en mo', x.valor === null ? '' : x.valor), lin('Peso', x.pesoTxt || (x.peso ? x.peso + ' kg' : '')), lin('Destino sugerido', x.destino),
    x.arma ? lin('Arma', `Tamaño ${x.arma.tam} · tipo ${x.arma.tipo} · daño ${x.arma.dm} / ${x.arma.dg}${x.arma.vel ? ' · vel. ' + x.arma.vel : ''}`) : null, parrafo(x.notas)];
  D.defensaPsi = (S, d) => { const p = S.reg.poderPsi(d.poder); return [lin('Poder asociado', p ? p.nombre : d.poder), p ? parrafo(p.efecto) : null]; };
  D.pacto = (S, p) => {
    const reg = S.reg, CJ = A.reglas.conjuros, B = A.base.brujo;
    return [parrafo(p.desc), lin('Escuelas arcanas', (p.escuelas || []).map(e => (reg.escuelaMagia(e) || { nombre: e }).nombre).join(', ')), lin('Esferas divinas', (p.esferas || []).map(e => (CJ && CJ.nombreEsfera ? CJ.nombreEsfera(e) : e)).join(', ')),
      lin('Conjuros firma', (p.firma || []).map(id => nombreCj(reg, id)).join(', ')),
      subtitulo('Técnicas'), h('ul', { class: 'cj-lista' }, (p.tecnicas || []).map((t, i) => h('li', {}, h('strong', { text: `${B.titulos[i] || 'Rango ' + (i + 1)} (nivel ${B.niveles[i] || '—'}): ${t.nombre}` }),
        h('div', { class: 'meta', text: `${t.pasiva ? 'Pasiva' : `Cuesta ${t.costo} punto(s) de pacto`}` }), parrafo(t.efecto))))];
  };
  D.clase = (S, c) => {
    const reg = S.reg, th = reg.tabla('thaco', c.thaco) || [], sv = reg.tabla('salvaciones', c.salvaciones) || [], xp = reg.tabla('xp', c.xp) || [];
    const n = Math.max(th.length, sv.length, xp.length);
    const filas = Array.from({ length: n }, (_, i) => ({ celdas: [String(i + 1), th[i] !== undefined ? th[i] : '—'].concat((sv[i] || []).length ? sv[i] : A.SAVES.map(() => '—'), [xp[i] !== undefined ? String(xp[i]) : '—']) }));
    const p = c.pericias || {};
    return [lin('Tabla de THAC0', c.thaco), lin('Tabla de salvaciones', c.salvaciones), lin('Tabla de PX', c.xp), lin('Dado de golpe', 'd' + c.dg + (c.dgNivelMax ? ` hasta el nivel ${c.dgNivelMax}` : '')), lin('PG por nivel después', c.pgDespues),
      lin('Pericias con arma', p.pa0 !== undefined ? `${p.pa0} iniciales, +1 cada ${p.paCada}` : ''), lin('Pericias sin arma', p.pna0 !== undefined ? `${p.pna0} iniciales, +1 cada ${p.pnaCada}` : ''), lin('Ambidiestría gratis', c.ambidestriaGratis ? 'Sí' : ''),
      (c.gratis || []).length ? lin('Pericias gratis', c.gratis.map(id => (reg.pericia(id) || { nombre: id }).nombre).join(', ')) : null,
      (c.poderes || []).length ? [h('h3', { class: 'co-sub', text: 'Poderes de clase' }), (c.poderes).slice().sort((a, b) => a.nivel - b.nivel).map(q => h('p', {}, h('strong', { text: `Nivel ${q.nivel} · ${q.nombre}. ` }), q.texto))] : null,
      n ? tabla(['Nivel', 'THAC0'].concat(A.SAVES, ['PX']), filas) : null];
  };
  D.raza = (S, r) => {
    const nat = S.reg.nativosDe(r).map(x => x.nombre).join(', ');
    return [lin('Ajustes a características', modsTxt(r.mods) || 'Ninguno'), lin('Idiomas', nat), parrafo(r.nota),
      (r.variantes || []).length ? [subtitulo('Variantes'), h('ul', { class: 'cj-lista' }, r.variantes.map(v => h('li', {}, h('strong', { text: v.nombre }), v.origen === 'homebrew' ? h('span', { class: 'meta', text: ' · homebrew' }) : null, h('div', { class: 'meta', text: modsTxt(v.mods) }), parrafo(v.nota))))] : null,
      (r.elecciones || []).length ? [subtitulo('Elecciones'), h('ul', { class: 'cj-lista' }, r.elecciones.map(e => h('li', {}, h('strong', { text: e.etiqueta + ': ' }), e.opciones.map(o => o.etiqueta).join(', '))))] : null];
  };
  const regalosTxt = (S, r) => {
    if (!r) return [];
    const K = A.reglas.kit, na = id => (S.reg.arma(id) || { nombre: id }).nombre, nombres = {}; S.reg.armas.forEach(a => { nombres[a.id] = a.nombre; });
    const out = [];
    if ((r.armas || []).length) out.push(lin('Competencia gratis con', r.armas.map(na).join(', ')));
    if ((r.grupos || []).length) out.push(lin('Grupos gratis', r.grupos.join(', ')));
    if ((r.esp || []).length || (r.espGrupo || []).length) out.push(lin('Especialización gratis', [...(r.esp || []).map(e => `${na(e.id)} (${e.n})`), ...(r.espGrupo || []).map(e => `grupo ${e.grupo} (${e.n})`)].join(', ')));
    if ((r.noArmas || []).length) out.push(lin('Pericias sin arma gratis', r.noArmas.map(e => `${(S.reg.pericia(e.id) || { nombre: e.id }).nombre}${e.mejoras ? ' +' + e.mejoras : ''}`).join(', ')));
    if ((r.bonos || []).length) out.push(lin('Bonos de arma', r.bonos.map(b => `${K.etiquetaAplica(b.aplica, nombres)}: ${{ gac0: 'GAC0', dano: 'daño', rt: 'RT' }[b.stat]} ${b.valor >= 0 ? '+' : ''}${b.valor}${b.cada ? `, ${b.paso >= 0 ? '+' : ''}${b.paso} cada ${b.cada} niveles` : ''}${b.desde > 1 ? ` desde el nivel ${b.desde}` : ''}${b.tope ? `, tope ${b.tope}` : ''}`).join(' · ')));
    return out;
  };
  D.kit = (S, k) => [...regalosTxt(S, k.regalos), lin('Clase', (S.reg.clase(k.clase) || {}).nombre || k.clase), lin('Ajustes a características', modsTxt(k.mods)), parrafo(k.nota),
    (k.habilidades || []).length ? h('ul', { class: 'cj-lista' }, k.habilidades.map(x => h('li', {}, typeof x === 'string' ? x : [x.nombre ? h('strong', { text: x.nombre + ': ' }) : null, x.texto || x.nota || '']))) : null];
  D.linaje = (S, l) => [parrafo(l.desc), subtitulo('Habilidades'), h('ul', { class: 'cj-lista' }, (l.habilidades || []).map(x => h('li', {}, h('strong', { text: `Nivel ${x.nivel}: ${x.nombre}. ` }), x.texto))),
    (l.conjuros || []).some(a => a && a.length) ? [subtitulo('Conjuros del linaje'), h('ul', { class: 'cj-lista' }, l.conjuros.map((a, i) => (a && a.length ? h('li', {}, h('strong', { text: `Nivel ${i + 1}: ` }), a.map(x => nombreCj(S.reg, x.id)).join(', ')) : null)))] : null];
  D.escuelaMagia = (S, e) => [parrafo(e.desc), e.especialista ? [lin('Especialista', e.especialista.nombre), lin('Escuelas prohibidas', (e.especialista.prohibidas || []).map(i => (S.reg.escuelaMagia(i) || { nombre: i }).nombre).join(', ')),
    h('ul', { class: 'cj-lista' }, (e.especialista.poderes || []).map(p => h('li', {}, h('strong', { text: `Nivel ${p.nivel}: ` }), p.texto)))] : null];
  D.pericia = (S, p) => [lin('Costo', p.costo + ' espacio(s)'), lin('Característica', p.car ? `${p.car}${p.mod ? ' ' + signo(p.mod) : ''}` : ''), lin('Categorías', (p.cats || []).map(c => A.base.categoriasPericias[c] || c).join(', ')), lin('En inglés', p.ingles && p.ingles !== p.nombre ? p.ingles : ''),
    lin('Fuente', p.fuente), parrafo(p.descripcion || p.nota)];
  D.arma = (S, a) => [lin('Grupo', a.grupo), lin('Tipo', a.tipo === 'cuerpo' ? 'Cuerpo a cuerpo' : a.tipo), lin('Daño contra tamaño M o menor', a.dm), lin('Daño contra tamaño G', a.dg), lin('Clase de daño', a.dano), lin('Tamaño', a.tam), lin('Peso', a.peso), lin('Crítico', a.crit), lin('Crítico con ventaja', a.adv),
    lin('Ritmo de ataque (RT)', a.rt), lin('Especial', a.esp), lin('Costo', a.costo), lin('Munición', a.muni)];
  D.armadura = (S, a) => [lin('Clase', a.clase), lin('Cuerpo completo', a.completa), lin('Torso', a.torso), lin('Ambos brazos', a.brazos2), lin('Un brazo', a.brazo1), lin('Ambas piernas', a.piernas2), lin('Una pierna', a.pierna1)];
  D.arte = (S, a) => [lin('Ataques', a.atk), lin('Daño', a.dano), lin('Clase de armadura del ataque', a.ac), lin('Método', a.met), lin('Armas', a.armas),
    (a.movs || []).length ? h('ul', { class: 'cj-lista' }, a.movs.map(m => h('li', {}, h('strong', { text: `${m.k}: ${m.nombre}. ` }), m.efecto))) : null];
  D.escuela = (S, e) => [h('ul', { class: 'cj-lista' }, (e.tecnicas || []).map((t, i) => h('li', {}, h('strong', { text: `${A.base.espadachin.titulos[i] || 'Rango ' + (i + 1)}: ${t.nombre}. ` }), t.efecto)))];
  D.idioma = (S, x) => [parrafo(x.nota) || lin('Idioma', x.nombre)];
  D.deidad = (S, d) => {
    const esf = ids => (ids || []).map(i => (A.reglas.conjuros ? A.reglas.conjuros.nombreEsfera(i) : i)).join(', ');
    return [parrafo(d.nota), lin('Esferas mayores', esf(d.mayores)), lin('Esferas menores', esf(d.menores)), parrafo(d.poderes)];
  };

  D.dote = (S, d) => [lin('Grupo', A.base.dotes.grupos[d.grupo] || d.grupo), lin('Coste', d.coste + ' PD'), parrafo(d.efecto)];
  D.nacFila = (S, it) => { const f = it.fila; return [lin('d100', f.desde === f.hasta ? f.desde : `${f.desde}–${f.hasta}`), lin('Tabla', it.tabla.nombre), parrafo(f.efecto),
    f.accion === 'divina' ? parrafo('Ascendencia Divina: tira el d100 de mitología y después el dado del dios (ver Mitologías de ascendencia).') : null,
    f.accion === 'doble' ? parrafo('Tira dos veces en esta tabla; si vuelve a salir 100, se ignora y se repite.') : null,
    f.accion === 'psi' ? parrafo('Ver Poderes → Psiónica → Talento salvaje.') : null, f.accion === 'magia' ? parrafo('Ver Magia salvaje en esta pestaña.') : null]; };
  D.mitologia = (S, it) => { const m = it.mit; return [lin('d100', `${m.desde}–${m.hasta}`), lin('Dioses', `${m.dioses.length} (se tira 1d${m.dioses.length})`), lin('Tabla', it.tabla.nombre),
    h('ul', { class: 'cj-lista co-cols' }, m.dioses.map((x, i) => h('li', {}, h('strong', { text: (i + 1) + ' ' }), x)))]; };

  /* ---- tablas de reglas ---- */
  function detalleTabla(S, t) {
    if (t.clase === 'car') {
      const datos = A.base.caracteristicas[t.stat], claves = Object.keys(datos), cols = Object.keys(datos[claves[0]]);
      return [h('p', { class: 'meta', text: 'Efectos de cada puntuación.' }), tabla([t.stat].concat(cols), claves.map(k => ({ celdas: [k].concat(cols.map(c => String(datos[k][c]))) })))];
    }
    if (t.clase === 'esp') {
      const filas = []; t.tabla.forEach((f, i) => { if (f) filas.push({ celdas: [String(i)].concat(f.map(String)) }); });
      return [h('p', { class: 'meta', text: 'Conjuros por día según el nivel del personaje (columnas: nivel de conjuro).' }), tabla(['Nivel'].concat([1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => 'C' + n)), filas)];
    }
    const [tt, nombre] = t.ref.split('|'), v = S.reg.tabla(tt, nombre) || [];
    if (tt === 'salvaciones') return tabla(['Nivel'].concat(A.SAVES), v.map((f, i) => ({ celdas: [String(i + 1)].concat(f.map(String)) })));
    return tabla(['Nivel', tt === 'thaco' ? 'THAC0' : 'PX necesarios'], v.map((x, i) => ({ celdas: [String(i + 1), String(x)] })));
  }

  /* ---------------------------------------------------------------- categorías */
  const origenDe = x => x.origen || 'base';
  const C = (id, grupo, titulo, tipoHb, items, detalle, filtros, extra) => Object.assign({ id, grupo, titulo, tipoHb, items, detalle, filtros: filtros || [] }, extra || {});
  const stdItem = (x, sub) => ({ id: x.id, nombre: x.nombre, sub: sub || '', origen: origenDe(x), data: x });

  const CATS = [
    { id: 'salvaje', grupo: 'Magia', titulo: 'Magia salvaje', especial: true },
    C('conjuros', 'Magia', 'Conjuros', 'conjuro', S => S.reg.conjuros.map(x => stdItem(x, `${x.tipo === 'divino' ? 'divino' : 'arcano'} · nv ${x.nv}`)), D.conjuro, [
      { k: 'tipo', et: 'Tipo', op: () => [{ v: '', t: 'Arcanos y divinos' }, { v: 'arcano', t: 'Arcanos' }, { v: 'divino', t: 'Divinos' }], ok: (it, v) => it.data.tipo === v },
      { k: 'nv', et: 'Nivel', op: () => [{ v: '', t: 'Todos los niveles' }].concat(Array.from({ length: 9 }, (_, i) => ({ v: String(i + 1), t: 'Nivel ' + (i + 1) }))), ok: (it, v) => String(it.data.nv) === v },
      { k: 'esc', et: 'Escuela o esfera', op: S => [{ v: '', t: 'Todas las escuelas y esferas' }].concat(S.reg.escuelasMagia.map(e => ({ v: e.id, t: e.nombre })), (A.base.esferas || []).map(e => ({ v: e.id, t: 'Esfera: ' + e.nombre }))),
        ok: (it, v) => (it.data.escuelas || []).includes(v) || (A.reglas.conjuros && A.reglas.conjuros.esferasDe(it.data).includes(v)) }
    ]),
    C('pactos', 'Magia', 'Pactos del brujo', 'pacto', S => S.reg.pactos.map(x => stdItem(x)), D.pacto),
    C('escuelasMagia', 'Magia', 'Escuelas de magia', 'escuelaMagia', S => S.reg.escuelasMagia.map(x => stdItem(x)), D.escuelaMagia),
    C('linajes', 'Magia', 'Linajes de hechicero', 'linaje', S => S.reg.linajes.map(x => stdItem(x)), D.linaje),
    C('poderesPsi', 'Psiónica', 'Poderes psiónicos', 'poderPsi', S => S.reg.poderesPsi.map(x => stdItem(x, `${x.disc} · ${x.tipo === 'ciencia' ? 'ciencia' : 'devoción'}`)), D.poderPsi, [
      { k: 'disc', et: 'Disciplina', op: S => [{ v: '', t: 'Todas las disciplinas' }].concat(S.reg.disciplinasPsi.map(d => ({ v: d.nombre, t: d.nombre }))), ok: (it, v) => it.data.disc === v },
      { k: 'tipo', et: 'Tipo', op: () => [{ v: '', t: 'Ciencias y devociones' }, { v: 'ciencia', t: 'Ciencias' }, { v: 'devocion', t: 'Devociones' }], ok: (it, v) => it.data.tipo === v }
    ]),
    C('disciplinasPsi', 'Psiónica', 'Disciplinas psiónicas', 'disciplinaPsi', S => S.reg.disciplinasPsi.map(x => stdItem(x)), D.disciplinaPsi),
    C('defensasPsi', 'Psiónica', 'Modos defensivos', 'defensaPsi', S => S.reg.defensasPsi.map(x => stdItem(x)), D.defensaPsi),
    C('clases', 'Personaje', 'Clases', 'clase', S => S.reg.clases.map(x => stdItem(x)), D.clase),
    C('razas', 'Personaje', 'Razas', 'raza', S => S.reg.razas.map(x => stdItem(x, modsTxt(x.mods))), D.raza),
    C('kits', 'Personaje', 'Kits', 'kit', S => S.reg.kits.map(x => stdItem(x, (S.reg.clase(x.clase) || {}).nombre || '')), D.kit),
    C('pericias', 'Personaje', 'Pericias sin arma', 'pericia', S => S.reg.pericias.map(x => stdItem(x, `${x.car || ''}${x.mod ? ' ' + signo(x.mod) : ''} · costo ${x.costo}`)), D.pericia, [
      { k: 'cat', et: 'Categoría', op: () => [{ v: '', t: 'Todas las categorías' }].concat(Object.entries(A.base.categoriasPericias).map(([v, t]) => ({ v, t }))), ok: (it, v) => (it.data.cats || []).includes(v) }
    ]),
    C('idiomas', 'Personaje', 'Idiomas', 'idioma', S => S.reg.idiomas.map(x => stdItem(x)), D.idioma),
    C('deidades', 'Personaje', 'Deidades', 'deidad', S => S.reg.deidades.map(x => stdItem(x)), D.deidad),
    C('tienda', 'Equipo', 'Tienda (precios)', null, S => S.reg.tienda().map(x => ({ id: x.id, nombre: x.nombre, sub: `${x.categoria} · ${x.coste}`, origen: x.origen || 'base', data: x })), D.tienda, [
      { k: 'cat', et: 'Categoría', op: () => [{ v: '', t: 'Todas las categorías' }].concat((A.base.tienda.categorias || []).map(c => ({ v: c, t: c }))), ok: (it, v) => it.data.categoria === v }
    ], { tipoHbDe: it => (it.origen === 'homebrew' ? (it.data.categoria === 'Armas' ? 'arma' : it.data.categoria === 'Armaduras' ? 'armadura' : 'objetoTienda') : null), idHbDe: it => it.data.idHb || it.id }),
    C('armas', 'Combate', 'Armas', 'arma', S => S.reg.armas.map(x => stdItem(x, `${x.grupo} · ${x.dm}`)), D.arma, [
      { k: 'grupo', et: 'Grupo', op: S => [{ v: '', t: 'Todos los grupos' }].concat(S.reg.gruposArmas().map(g => ({ v: g, t: g }))), ok: (it, v) => it.data.grupo === v }
    ]),
    C('armaduras', 'Combate', 'Armaduras', 'armadura', S => S.reg.armaduras.map(x => stdItem(x, x.clase)), D.armadura),
    C('artes', 'Combate', 'Artes marciales', 'arte', S => S.reg.artes.map(x => stdItem(x)), D.arte),
    C('escuelas', 'Combate', 'Escuelas de espadachín', 'escuela', S => S.reg.escuelas.map(x => stdItem(x)), D.escuela),
    C('dotes', 'Reglas opcionales', 'Dotes', 'dote', S => S.reg.dotes.map(x => stdItem(x, `${A.base.dotes.grupos[x.grupo] || x.grupo} · coste ${x.coste}`)), D.dote, [
      { k: 'grupo', et: 'Grupo', op: () => [{ v: '', t: 'Todos los grupos' }].concat(Object.entries(A.base.dotes.grupos).map(([v, t]) => ({ v, t }))), ok: (it, v) => it.data.grupo === v },
      { k: 'coste', et: 'Coste', op: () => [{ v: '', t: 'Cualquier coste' }].concat([1, 2, 3, 4].map(n => ({ v: String(n), t: 'Coste ' + n }))), ok: (it, v) => String(it.data.coste) === v }
    ]),
    C('dotesNac', 'Reglas opcionales', 'Dotes de nacimiento', 'dotesNacimiento', S => S.reg.dotesNacimiento.flatMap(t => t.filas.map(f => ({ id: t.id + '|' + f.id, nombre: f.nombre, sub: `d100 ${f.desde === f.hasta ? f.desde : f.desde + '–' + f.hasta}`, origen: t.origen || 'base', data: { fila: f, tabla: t } }))), D.nacFila, [], { idHbDe: it => it.data.tabla.id }),
    C('mitologias', 'Reglas opcionales', 'Mitologías de ascendencia', 'dotesNacimiento', S => S.reg.dotesNacimiento.flatMap(t => t.mitologias.map(m => ({ id: t.id + '|' + m.id, nombre: m.nombre, sub: `d100 ${m.desde}–${m.hasta} · ${m.dioses.length} dioses`, origen: t.origen || 'base', data: { mit: m, tabla: t } }))), D.mitologia, [], { idHbDe: it => it.data.tabla.id }),
    C('tablas', 'Reglas', 'Tablas', null, S => {
      const l = A.STATS.map(s => ({ id: 'car-' + s, nombre: `${nombresStat[s]} (${s})`, sub: 'Característica', origen: 'base', data: { clase: 'car', stat: s } }));
      l.push({ id: 'esp-mago', nombre: 'Espacios de conjuros del mago', sub: 'Magia', origen: 'base', data: { clase: 'esp', tabla: A.base.espaciosMago } });
      (A.base.lanzadores || []).forEach(c => l.push({ id: 'esp-' + c.id, nombre: `Espacios de conjuros: ${c.nombre}`, sub: 'Magia', origen: 'base', data: { clase: 'esp', tabla: c.tabla } }));
      if (A.base.brujo) l.push({ id: 'esp-brujo', nombre: 'Espacios de conjuros del brujo', sub: 'Magia', origen: 'base', data: { clase: 'esp', tabla: A.base.brujo.tabla } });
      const T = { thaco: 'THAC0', salvaciones: 'Salvaciones', xp: 'PX' };
      Object.keys(T).forEach(tt => Object.keys(S.reg.tablas[tt] || {}).forEach(n => l.push({ id: tt + '|' + n, nombre: `${T[tt]}: ${n}`, sub: 'Por nivel', origen: A.base.tablas[tt][n] ? 'base' : 'homebrew', data: { clase: 'nivel', ref: tt + '|' + n } })));
      return l;
    }, detalleTabla, [], { tipoHbDe: it => (it.data.clase === 'nivel' ? 'tabla' : null) })
  ];
  const cat = id => CATS.find(c => c.id === id);

  /* ---------------------------------------------------------------- lista + detalle de un catálogo */
  function catalogo(S, c) {
    const F = fil[c.id] || (fil[c.id] = { q: '', origen: '' }), q = norm(F.q.trim());
    const todos = c.items(S);
    const lista = todos.filter(it => (!q || norm(it.nombre).includes(q)) && (!F.origen || it.origen === F.origen) && c.filtros.every(f => !F[f.k] || f.ok(it, F[f.k])));
    const idSel = sel[c.id], actual = lista.find(x => x.id === idSel) || null;
    const homebrew = todos.filter(x => x.origen === 'homebrew').length;
    const controles = h('div', { class: 'co-filtros' },
      ui.texto(F.q, v => { F.q = v; S.render(); }, { type: 'search', placeholder: `Buscar en ${c.titulo.toLowerCase()}…`, 'aria-label': 'Buscar en ' + c.titulo, 'data-foco': `co-q-${c.id}` }),
      c.filtros.map(f => ui.select(f.op(S), F[f.k] || '', v => { F[f.k] = v; S.render(); }, { 'aria-label': f.et, 'data-foco': `co-f-${c.id}-${f.k}` })),
      homebrew ? ui.select([{ v: '', t: 'Base y homebrew' }, { v: 'base', t: 'Solo base' }, { v: 'homebrew', t: `Solo homebrew (${homebrew})` }], F.origen, v => { F.origen = v; S.render(); }, { 'aria-label': 'Origen', 'data-foco': `co-o-${c.id}` }) : null);
    const col = h('div', { class: 'cj-lista-cat co-lista', role: 'group', 'aria-label': c.titulo }, lista.map(it => h('button', {
      type: 'button', class: 'cj-item' + (actual && actual.id === it.id ? ' activo' : ''), 'aria-pressed': String(!!actual && actual.id === it.id), 'data-foco': `co-sel-${c.id}-${it.id}`,
      onclick: () => { sel[c.id] = it.id; S.render(); }
    }, h('span', { text: it.nombre + (it.origen === 'homebrew' ? ' ★' : '') }), it.sub ? h('small', { text: it.sub }) : null)));
    const detalle = actual ? h('article', { class: 'co-detalle' },
      h('div', { class: 'co-cab' }, h('h2', { text: actual.nombre }), h('span', { class: 'meta', text: actual.origen === 'homebrew' ? 'Homebrew' : 'Base' })),
      c.detalle(S, actual.data),
      botonCopia(S, c, actual)) : h('p', { class: 'meta', text: lista.length ? 'Elige un elemento de la lista.' : 'Nada coincide con la búsqueda.' });
    return [controles, h('p', { class: 'meta', text: `${lista.length} de ${todos.length}${homebrew ? ' · ★ = homebrew' : ''}` }), h('div', { class: 'cj-dos' }, col, detalle)];
  }
  function botonCopia(S, c, it) {
    const tipo = c.tipoHb || (c.tipoHbDe && c.tipoHbDe(it));
    if (!tipo || !ui.hb) return null;
    const id = tipo === 'tabla' ? it.data.ref : (c.idHbDe ? c.idHbDe(it) : it.id);
    return h('div', { class: 'co-copia' }, ui.boton(it.origen === 'homebrew' ? 'Editar en Homebrew' : 'Copiar a homebrew para editar', () => {
      if (it.origen === 'homebrew') { ui.hb.abrirDesdeConsulta(S, tipo, id); return; }
      ui.hb.copiarDesdeConsulta(S, tipo, id);
    }, 'chico', { 'data-foco': `co-copia-${c.id}` }));
  }

  /* ---------------------------------------------------------------- magia salvaje */
  function salvaje(S) {
    const w = W(), tablas = S.reg.magiaSalvaje;
    let t = tablas.find(x => x.id === sal.tabla); if (!t) { t = tablas[0]; sal.tabla = t.id; }
    const nivel = Math.max(1, Math.floor(U.num(sal.nivel)) || 1);
    const v = sal.d20 === '' ? null : w.variacion(t, nivel, sal.d20), r = sal.d100 === '' ? null : w.resultado(t, sal.d100);
    const lista = h('div', { class: 'co-resultado', 'aria-live': 'polite' });
    if (sal.d20 !== '' && !v) lista.append(h('p', { class: 'error', text: 'El d20 va de 1 a 20.' }));
    if (v) {
      lista.append(h('p', {}, h('strong', { text: `Variación: ${v.valor === 0 ? 'ninguna (0)' : signo(v.valor)}. ` }),
        v.valor === 0 ? `El conjuro se lanza como de nivel ${nivel}.` : `El conjuro se lanza como de nivel ${v.nivelEfectivo} (${nivel} ${v.valor > 0 ? '+' : '−'} ${Math.abs(v.valor)}).`),
        ...(v.nivelEfectivo < 1 ? [h('p', { class: 'meta', text: 'El nivel efectivo nunca baja de 0: el conjuro funciona como de nivel mínimo.' })] : []),
        h('p', { class: v.oleada ? 'co-oleada' : 'meta' }, v.oleada ? 'Oleada salvaje: el DM tira 1d100 en la tabla de oleadas y se aplica el resultado además del conjuro.' : 'Sin oleada salvaje.'));
    }
    if (sal.d100 !== '' && !r) lista.append(h('p', { class: 'error', text: `El d100 va de 1 a ${t.resultados.length} (00 = 100).` }));
    if (r) lista.append(h('div', { class: 'co-oleada-res' }, h('strong', { text: `Oleada ${r.d === 100 ? '00' : r.d}: ` }), r.texto || '(vacío)'));
    const celda = (f, c) => {
      const o = (t.oleadas[f] || []).includes(c + 1), a = v && v.fila === f && c + 1 === Number(sal.d20);
      return h('td', { class: 'num' + (o ? ' co-neg' : '') + (a ? ' co-sel' : '') + (v && v.fila === f ? ' co-fila' : ''), text: signo(t.valores[f][c]) });
    };
    const t1 = h('div', { class: 'tabla-cont' }, h('table', { class: 'tabla co-t1' },
      h('caption', { class: 'sr', text: 'Tabla 1: variación de nivel. Negrita con marco: oleada salvaje.' }),
      h('thead', {}, h('tr', {}, h('th', { scope: 'col', text: 'Nivel' }), Array.from({ length: 20 }, (_, i) => h('th', { scope: 'col', class: 'num', text: String(i + 1) })))),
      h('tbody', {}, t.valores.map((fila, f) => h('tr', {}, h('th', { scope: 'row', text: w.etiquetaNivel(f) }), fila.map((_, c) => celda(f, c)))))));
    const t2 = h('div', { class: 'tabla-cont co-t2-cont' }, h('table', { class: 'tabla co-t2' },
      h('caption', { class: 'sr', text: 'Tabla 2: resultados de la oleada salvaje (d100).' }),
      h('thead', {}, h('tr', {}, h('th', { scope: 'col', text: 'd100' }), h('th', { scope: 'col', text: 'Resultado' }))),
      h('tbody', {}, t.resultados.map((x, i) => h('tr', { class: r && r.d === i + 1 ? 'co-sel-fila' : null }, h('th', { scope: 'row', text: i === 99 ? '00' : String(i + 1).padStart(2, '0') }), h('td', { text: x }))))));
    return [
      h('div', { class: 'co-cab' }, h('h2', { text: 'Magia salvaje' }), h('span', { class: 'meta', text: t.origen === 'homebrew' ? 'Homebrew' : 'Base' })),
      tablas.length > 1 || t.origen === 'homebrew' ? ui.campo('Tabla', ui.select(tablas.map(x => ({ v: x.id, t: x.nombre + (x.origen === 'homebrew' ? ' (homebrew)' : '') })), t.id, id => { sal.tabla = id; S.render(); }, { 'data-foco': 'co-sal-tabla' })) : null,
      h('details', { class: 'co-regla', open: true }, h('summary', { text: 'Cómo funciona' }),
        h('ul', { class: 'cj-lista' }, [
          'Solo afecta a los conjuros del mago salvaje que tienen una variable de nivel (alcance, duración, área de efecto o daño).',
          'Al lanzar, el jugador tira 1d20 y cruza la tirada con el nivel verdadero del mago (9 o más usa la última fila). El resultado se suma o resta a su nivel solo para ese conjuro: +2 es nivel +2, −3 es nivel −3 y 0 es un lanzamiento normal. No cambia su nivel ni su capacidad de forma permanente.',
          'Si la casilla está en negrita, además ocurre una oleada salvaje: el DM tira 1d100 en la tabla de oleadas y aplica el resultado junto con el conjuro. Se resuelve siempre al azar, sin elegir el resultado.',
          'Objetivo del resultado: si el conjuro tiene varios objetivos, el resultado los afecta a todos; si no tiene objetivo, afecta a un objetivo al azar a 9 m (30\') del lanzador, que puede ser el propio lanzador.',
          'Ejemplo: un mago salvaje de nivel 7 lanza una bola de fuego y saca 19 en el d20: variación +3, se lanza como de nivel 10 (10d6 de daño). Con 2 sería −3, nivel 4.'
        ].map(x => h('li', { text: x })))),
      h('div', { class: 'co-herr' },
        h('h3', { class: 'co-sub', text: 'Consultar una tirada' }),
        h('div', { class: 'rejilla g3' },
          ui.campo('Nivel del lanzador', ui.numero(sal.nivel, x => { sal.nivel = x; S.render(); }, { min: 1, step: 1, 'data-foco': 'co-sal-nivel' })),
          ui.campo('d20 (variación de nivel)', ui.numero(sal.d20, x => { sal.d20 = x; S.render(); }, { min: 1, max: 20, step: 1, 'data-foco': 'co-sal-d20' })),
          ui.campo('d100 (oleada; 00 = 100)', ui.numero(sal.d100, x => { sal.d100 = x; S.render(); }, { min: 0, max: 100, step: 1, 'data-foco': 'co-sal-d100' }))),
        lista),
      h('div', { class: 'fila-edit' }, ui.boton(t.origen === 'homebrew' ? 'Editar en Homebrew' : 'Copiar a homebrew para editar', () => {
        if (t.origen === 'homebrew') { ui.hb.abrirDesdeConsulta(S, 'magiaSalvaje', t.id); return; }
        ui.hb.copiarDesdeConsulta(S, 'magiaSalvaje', t.id);
      }, 'chico', { 'data-foco': 'co-sal-copia' }), h('span', { class: 'meta', text: 'La base no se modifica: la copia se edita en Homebrew y aparece aquí.' })),
      h('h3', { class: 'co-sub', text: 'Tabla 1: variación de nivel (d20)' }),
      h('p', { class: 'meta', text: 'Las casillas con marco y negrita provocan una oleada salvaje.' }), t1,
      h('h3', { class: 'co-sub', text: 'Tabla 2: resultados de la oleada (d100)' }), t2];
  }

  /* ---------------------------------------------------------------- búsqueda global */
  function resultadosGlobales(S) {
    const q = norm(est.gq.trim()); if (!q) return null;
    const grupos = [];
    CATS.forEach(c => {
      if (c.especial) { if (norm('magia salvaje oleada surge variacion de nivel mago salvaje').includes(q) || 'magia salvaje'.includes(q)) grupos.push({ c, items: [{ id: '', nombre: 'Magia salvaje', sub: 'Tablas 1 y 2', origen: 'base' }], total: 1 }); return; }
      const hit = c.items(S).filter(it => norm(it.nombre).includes(q));
      if (hit.length) grupos.push({ c, items: hit.slice(0, 6), total: hit.length });
    });
    return grupos;
  }
  function panelGlobal(S, grupos) {
    if (!grupos.length) return h('p', { class: 'meta', text: 'Nada coincide en ninguna categoría.' });
    return h('div', { class: 'co-global' }, grupos.map(g => h('section', { class: 'co-grupo' },
      h('h3', { class: 'co-sub', text: `${g.c.titulo} (${g.total})` }),
      h('div', { class: 'items' }, g.items.map(it => h('button', { type: 'button', class: 'item', 'data-foco': `co-g-${g.c.id}-${it.id}`, onclick: () => { est.cat = g.c.id; if (it.id) sel[g.c.id] = it.id; est.gq = ''; S.render(); window.scrollTo({ top: 0 }); } },
        h('span', { text: it.nombre + (it.origen === 'homebrew' ? ' ★' : '') }), it.sub ? h('small', { text: it.sub }) : null))),
      g.total > g.items.length ? ui.boton(`Ver los ${g.total}`, () => { est.cat = g.c.id; (fil[g.c.id] = fil[g.c.id] || { q: '', origen: '' }).q = est.gq; est.gq = ''; S.render(); }, 'chico', { 'data-foco': 'co-mas-' + g.c.id }) : null)));
  }

  /* ---------------------------------------------------------------- panel */
  ui.paneles.consulta = S => {
    if (!cat(est.cat)) est.cat = 'salvaje';
    const grupos = [...new Set(CATS.map(c => c.grupo))];
    const grupoAct = cat(est.cat).grupo;
    const nav = h('nav', { class: 'co-nav', 'aria-label': 'Categorías de consulta' },
      h('div', { class: 'co-fam' }, grupos.map(g => h('button', { type: 'button', class: 'hb-fam-b' + (g === grupoAct && !est.gq.trim() ? ' activo' : ''), 'aria-pressed': g === grupoAct ? 'true' : 'false', 'data-foco': 'co-fam-' + g,
        onclick: () => { est.cat = (CATS.find(c => c.grupo === g) || {}).id; est.gq = ''; S.render(); } }, g))),
      h('div', { class: 'co-subs' }, CATS.filter(c => c.grupo === grupoAct).map(c => h('button', { type: 'button', class: 'co-nav-b' + (c.id === est.cat && !est.gq.trim() ? ' activo' : ''), 'aria-current': c.id === est.cat ? 'page' : null, 'data-foco': 'co-cat-' + c.id, onclick: () => { est.cat = c.id; est.gq = ''; S.render(); } }, c.titulo))));
    const buscar = ui.campo('Buscar en toda la consulta', ui.texto(est.gq, v => { est.gq = v; S.render(); }, { type: 'search', placeholder: 'Conjuro, poder, clase, arma, pericia, tabla…', 'data-foco': 'co-global' }), 'co-global-c');
    const g = resultadosGlobales(S), c = cat(est.cat);
    return h('div', { class: 'co' },
      h('div', { class: 'co-arriba' }, buscar, h('p', { class: 'meta', text: 'No usa tu personaje. Lo de Homebrew aparece con ★.' })),
      nav,
      h('div', { class: 'co-cuerpo' }, h('section', { class: 'bloque co-principal' }, g ? panelGlobal(S, g) : c.especial ? salvaje(S) : [h('h2', { text: c.titulo }), catalogo(S, c)])));
  };
})(window.ADND);
