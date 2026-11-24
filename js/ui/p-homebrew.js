/* Pestaña Homebrew: biblioteca propia de razas, clases, kits, deidades y tablas.
   Lo base es de solo lectura (se puede duplicar). Todo lo que se guarda pasa por A.sanear. */
(function (A) {
  'use strict';
  const ui = A.ui, U = A.util, h = ui.h;

  const TIPOS = [
    { id: 'raza', plural: 'razas', titulo: 'Razas', nueva: 'Nueva raza' },
    { id: 'variante', plural: 'variantes', titulo: 'Variantes de raza', nueva: 'Nueva variante' },
    { id: 'clase', plural: 'clases', titulo: 'Clases', nueva: 'Nueva clase' },
    { id: 'kit', plural: 'kits', titulo: 'Kits', nueva: 'Nuevo kit' },
    { id: 'deidad', plural: 'deidades', titulo: 'Deidades', nueva: 'Nueva deidad' },
    { id: 'idioma', plural: 'idiomas', titulo: 'Idiomas', nueva: 'Nuevo idioma' },
    { id: 'arma', plural: 'armas', titulo: 'Armas', nueva: 'Nueva arma' },
    { id: 'escuela', plural: 'escuelas', titulo: 'Escuelas de Espadachín', nueva: 'Nueva escuela' },
    { id: 'arte', plural: 'artes', titulo: 'Artes marciales', nueva: 'Nuevo arte' },
    { id: 'creacion', plural: 'creaciones', titulo: 'Creaciones de Techno', nueva: 'Nueva creación' },
    { id: 'conjuro', plural: 'conjuros', titulo: 'Conjuros', nueva: 'Nuevo conjuro' },
    { id: 'escuelaMagia', plural: 'escuelasMagia', titulo: 'Escuelas de magia', nueva: 'Nueva escuela de magia' },
    { id: 'esfera', plural: 'esferas', titulo: 'Esferas de sacerdote', nueva: 'Nueva esfera' },
    { id: 'linaje', plural: 'linajes', titulo: 'Linajes de hechicero', nueva: 'Nuevo linaje' },
    { id: 'pacto', plural: 'pactos', titulo: 'Pactos de brujo', nueva: 'Nuevo pacto' },
    { id: 'poderPsi', plural: 'poderesPsi', titulo: 'Poderes psiónicos', nueva: 'Nuevo poder' },
    { id: 'disciplinaPsi', plural: 'disciplinasPsi', titulo: 'Disciplinas psiónicas', nueva: 'Nueva disciplina' },
    { id: 'defensaPsi', plural: 'defensasPsi', titulo: 'Modos defensivos', nueva: 'Nuevo modo defensivo' },
    { id: 'magiaSalvaje', plural: 'magiaSalvaje', titulo: 'Magia salvaje (tablas)', nueva: 'Nueva tabla de magia salvaje' },
    { id: 'dote', plural: 'dotes', titulo: 'Dotes', nueva: 'Nueva dote' },
    { id: 'dotesNacimiento', plural: 'dotesNacimiento', titulo: 'Tablas de dotes de nacimiento', nueva: 'Nueva tabla de dotes de nacimiento' },
    { id: 'pericia', plural: 'pericias', titulo: 'Pericias sin arma', nueva: 'Nueva pericia' },
    { id: 'armadura', plural: 'armaduras', titulo: 'Armaduras', nueva: 'Nueva armadura' },
    { id: 'objetoTienda', plural: 'objetosTienda', titulo: 'Objetos de tienda', nueva: 'Nuevo objeto de tienda' },
    { id: 'tabla', plural: 'tablas', titulo: 'Tablas', nueva: 'Nueva tabla' }
  ];
  const TABLAS = { thaco: 'THAC0 por nivel', salvaciones: 'Salvaciones por nivel', xp: 'PX por nivel' };

  /* Familias: la barra fija deja ver solo una parte de las categorías a la vez. */
  const FAMILIAS = [
    { id: 'personaje', t: 'Personaje', tipos: ['raza', 'variante', 'clase', 'kit', 'deidad', 'idioma'] },
    { id: 'combate', t: 'Combate', tipos: ['arma', 'armadura', 'escuela', 'arte', 'creacion'] },
    { id: 'magia', t: 'Magia', tipos: ['conjuro', 'escuelaMagia', 'esfera', 'linaje', 'pacto'] },
    { id: 'psionica', t: 'Psiónica', tipos: ['poderPsi', 'disciplinaPsi', 'defensaPsi'] },
    { id: 'opcionales', t: 'Reglas opcionales', tipos: ['dote', 'dotesNacimiento', 'magiaSalvaje'] },
    { id: 'equipo', t: 'Equipo y otros', tipos: ['objetoTienda', 'pericia', 'tabla'] }
  ];
  const familiaDe = tipo => (FAMILIAS.find(f => f.tipos.includes(tipo)) || FAMILIAS[0]).id;
  let familia = 'personaje';
  let sel = null;            // { tipo, id, borrador, lectura }
  const filtroBase = {};            // búsqueda dentro de listas base largas (conjuros)
  const baseAbiertas = new Set();   // grupos "Base" que dejaste abiertos
  let error = '';            // mensaje del último intento de guardar

  const plantillas = {
    raza: () => ({ id: '', nombre: '', mods: {}, nota: '', idiomas: ['comun'], efectos: [], variantes: [], elecciones: [] }),
    variante: S => ({ id: '', raza: (S.reg.razas[0] || {}).id || '', nombre: '', mods: {}, nota: '', efectos: [] }),
    clase: () => ({ id: '', nombre: '', thaco: 'Luchador', salvaciones: 'Luchador', xp: 'Guerrero', dg: 8, dgNivelMax: 9, pgDespues: 2, pericias: { pa0: 2, pna0: 3, paCada: 3, pnaCada: 3 } }),
    kit: S => ({ id: '', nombre: '', clase: (S.reg.clases[0] || {}).id || '', nota: '', habilidades: [], mods: {}, efectos: [], sobreescribe: {}, pericias: {} }),
    deidad: () => ({ id: '', nombre: '', nota: '' }),
    idioma: () => ({ id: '', nombre: '', nota: '' }),
    arma: () => ({ id: '', nombre: '', grupo: 'Otras', tipo: 'cuerpo', dano: 'C', dm: '1d6', dg: '1d6', tam: 'M', peso: 0, crit: '(20)x2', adv: '(18-20)x2', rt: 2, esp: '', costo: '', muni: '', estilos: [] }),
    escuela: () => ({ id: '', nombre: '', tecnicas: A.base.espadachin.niveles.map(() => ({ nombre: '', efecto: '' })) }),
    arte: () => ({ id: '', nombre: '', atk: 1, dano: '1d6', ac: -1, met: '', armas: '', movs: [{ k: 'Golpear 1', nombre: '', efecto: '', ca: 0 }] }),
    conjuro: () => ({ id: '', nombre: '', tipo: 'arcano', nv: 1, fuente: 'Homebrew', escuelas: [], esfera: '', rev: false, alcance: '', componentes: 'V,S', duracion: '', tiempo: '1', area: '', salvacion: 'No', efecto: '', material: '', reverso: '' }),
    escuelaMagia: () => ({ id: '', nombre: '', desc: '' }),
    esfera: () => ({ id: '', nombre: '', desc: '' }),
    linaje: () => ({ id: '', nombre: '', desc: '', habilidades: [1, 6, 12, 18].map(n => ({ nivel: n, nombre: '', texto: '' })), conjuros: Array.from({ length: 9 }, () => []) }),
    poderPsi: S => ({ id: '', nombre: '', disc: (S.reg.disciplinasPsi[0] || {}).nombre || '', tipo: 'devocion', puntuacion: { car: 'SAB', mod: -3 }, puntuacionTxt: '', inicio: '', costo: null, mant: 'n/d', mantenimiento: null, alcance: '', preparacion: '0', area: '', prerrequisitos: [], efecto: '', riesgos: '' }),
    disciplinaPsi: () => ({ id: '', nombre: '' }),
    defensaPsi: () => ({ id: '', nombre: '', poder: '' }),
    pacto: () => ({ id: '', nombre: '', desc: '', escuelas: [], esferas: [], firma: [], tecnicas: A.base.brujo.niveles.map(() => ({ nombre: '', efecto: '', costo: 1, pasiva: false })) }),
    magiaSalvaje: () => { const b = A.base.magiaSalvaje; return { id: '', nombre: '', matrizTxt: A.reglas.salvaje.matrizATexto(b), resultadosTxt: b.resultados.join('\n') }; },
    dote: () => ({ id: '', nombre: '', grupo: 'combate', coste: 1, efecto: '' }),
    dotesNacimiento: () => { const b = A.base.dotes.nacimiento, DT = A.reglas.dotes; return { id: '', nombre: '', filasTxt: DT.filasATexto(b), mitTxt: DT.mitATexto(b) }; },
    creacion: () => ({ id: '', nombre: '', tipo: 'Dispositivo', desc: '', autor: '', capacidad: '', resultado: '' }),
    pericia: () => ({ id: '', nombre: '', ingles: '', costo: 1, car: 'INT', mod: 0, cats: ['general'], fuente: 'Homebrew', nota: '', descripcion: '' }),
    armadura: () => ({ id: '', nombre: '', clase: 'Ligera', completa: 0, torso: 0, brazos2: 0, brazo1: 0, piernas2: 0, pierna1: 0, costo: '', peso: 0 }),
    objetoTienda: () => ({ id: '', nombre: '', categoria: 'Equipo misceláneo', coste: '', peso: '', destino: 'Mochila', notas: '' }),
    tabla: () => ({ id: '', tipoTabla: 'thaco', nombre: '', texto: '' })
  };

  const tablaATexto = (tipo, v) => (tipo === 'salvaciones' ? v.map(f => f.join(' ')).join('\n') : v.join(', '));
  function textoATabla(tipo, texto) {
    if (tipo === 'salvaciones') {
      const filas = texto.split(/\n+/).map(l => l.trim()).filter(Boolean).map(l => l.split(/[\s,;]+/).map(Number));
      if (!filas.length) throw new Error('Escribe al menos una fila (un nivel por línea, 5 números).');
      filas.forEach((f, i) => { if (f.length !== 5 || f.some(n => !Number.isFinite(n))) throw new Error(`La fila ${i + 1} debe tener 5 números (PVM CVV PP AL CyO).`); });
      return filas;
    }
    const nums = texto.split(/[\s,;]+/).filter(Boolean).map(Number);
    if (!nums.length || nums.some(n => !Number.isFinite(n))) throw new Error('Escribe números separados por comas, espacios o saltos de línea (uno por nivel).');
    return nums;
  }

  /* ---------------------------------------------------------------- abrir */
  function buscar(S, tipo, id) {
    if (tipo === 'tabla') {
      const [tt, nombre] = id.split('|');
      const hbv = S.hb.tablas[tt] && S.hb.tablas[tt][nombre], baseV = A.base.tablas[tt] && A.base.tablas[tt][nombre];
      const v = hbv || baseV; if (!v) return null;
      return { item: { id, tipoTabla: tt, nombre, texto: tablaATexto(tt, v) }, lectura: !hbv };
    }
    const it = S.reg[TIPOS.find(t => t.id === tipo).plural].find(x => x.id === id);
    if (it && tipo === 'raza' && !Array.isArray(it.idiomas)) it.idiomas = S.reg.nativosDe(it).map(x => x.id);
    return it ? { item: it, lectura: it.origen === 'base' } : null;
  }
  function abrir(S, tipo, id) {
    const r = buscar(S, tipo, id); if (!r) return;
    sel = { tipo, id, borrador: U.clon(r.item), lectura: r.lectura }; error = ''; S.render();
  }
  function nuevo(S, tipo) { sel = { tipo, id: null, borrador: plantillas[tipo](S), lectura: false }; error = ''; S.render(); }
  function nuevaVarianteDe(S, razaId) {
    sel = { tipo: 'variante', id: null, borrador: Object.assign(plantillas.variante(S), { raza: razaId }), lectura: false }; error = ''; S.render();
  }
  function duplicar(S) {
    const b = U.clon(sel.borrador); b.id = ''; b.nombre = (b.nombre || 'Sin nombre') + ' (copia)'; delete b.origen;
    sel = { tipo: sel.tipo, id: null, borrador: b, lectura: false }; error = ''; S.render();
  }

  /* ---------------------------------------------------------------- guardar / borrar */
  function guardar(S) {
    const { tipo, borrador: b } = sel; error = '';
    try {
      if (!String(b.nombre || '').trim()) throw new Error('Escribe un nombre.');
      const t = TIPOS.find(x => x.id === tipo);
      if (tipo === 'tabla') {
        const valores = A.sanear.tabla(b.tipoTabla, textoATabla(b.tipoTabla, b.texto));
        const nombre = b.nombre.trim();
        const [tt0, n0] = sel.id ? sel.id.split('|') : [null, null];
        if (A.base.tablas[b.tipoTabla][nombre]) throw new Error('Ya existe una tabla base con ese nombre.');
        if (S.hb.tablas[b.tipoTabla][nombre] && !(tt0 === b.tipoTabla && n0 === nombre)) throw new Error('Ya tienes una tabla con ese nombre.');
        S.cambiarHb(hb => { if (tt0 && hb.tablas[tt0]) delete hb.tablas[tt0][n0]; hb.tablas[b.tipoTabla][nombre] = valores; });
        sel = { tipo, id: b.tipoTabla + '|' + nombre, borrador: { id: b.tipoTabla + '|' + nombre, tipoTabla: b.tipoTabla, nombre, texto: tablaATexto(b.tipoTabla, valores) }, lectura: false };
        S.render(); S.aviso('Tabla guardada.'); return;
      }
      if (tipo === 'magiaSalvaje') {
        const W = A.reglas.salvaje, m = W.matrizDeTexto(b.matrizTxt), res = W.resultadosDeTexto(b.resultadosTxt);
        Object.assign(b, { valores: m.valores, oleadas: m.oleadas, resultados: res });
      }
      if (tipo === 'dotesNacimiento') {
        const DT = A.reglas.dotes, filas = DT.filasDeTexto(b.filasTxt), mit = DT.mitDeTexto(b.mitTxt);
        Object.assign(b, { filas, mitologias: mit });
      }
      if (tipo === 'variante' && !S.reg.raza(b.raza)) throw new Error('Elige la raza a la que pertenece la variante.');
      if (tipo === 'kit' && !S.reg.clase(b.clase)) throw new Error('Elige la clase a la que pertenece el kit.');
      if (tipo === 'raza' && b.elecciones && typeof b.elecciones === 'string') throw new Error('Las elecciones no son JSON válido.');
      const limpio = A.sanear[tipo](b);
      const otro = S.reg[t.plural].find(x => x.id !== limpio.id && String(x.nombre).trim().toLowerCase() === limpio.nombre.toLowerCase() && (tipo !== 'kit' || x.clase === limpio.clase) && (tipo !== 'variante' || x.raza === limpio.raza));
      if (otro) throw new Error(`Ya existe ${tipo === 'kit' ? 'un kit' : tipo === 'deidad' ? 'una deidad' : tipo === 'arma' ? 'un arma' : tipo === 'variante' ? 'una variante' : tipo === 'idioma' ? 'un idioma' : tipo === 'clase' ? 'una clase' : tipo === 'arte' ? 'un arte' : tipo === 'creacion' ? 'una creación' : tipo === 'conjuro' ? 'un conjuro' : tipo === 'escuelaMagia' ? 'una escuela de magia' : tipo === 'esfera' ? 'una esfera' : tipo === 'linaje' ? 'un linaje' : tipo === 'pacto' ? 'un pacto' : tipo === 'poderPsi' ? 'un poder' : tipo === 'disciplinaPsi' ? 'una disciplina' : tipo === 'defensaPsi' ? 'un modo defensivo' : tipo === 'escuela' ? 'una escuela' : tipo === 'pericia' ? 'una pericia' : tipo === 'armadura' ? 'una armadura' : 'una raza'} con ese nombre.`);
      if (tipo === 'clase') ['thaco', 'salvaciones', 'xp'].forEach(x => { if (!S.reg.tabla(x, limpio[x])) throw new Error(`Elige una tabla de ${TABLAS[x].toLowerCase()}.`); });
      S.cambiarHb(hb => { const l = hb[t.plural], i = l.findIndex(x => x.id === limpio.id); if (i >= 0) l[i] = limpio; else l.push(limpio); });
      sel = { tipo, id: limpio.id, borrador: U.clon(limpio), lectura: false };
      S.render(); S.aviso('Guardado.');
    } catch (e) { error = e.message; S.render(); }
  }
  function borrar(S) {
    const { tipo, id, borrador: b } = sel;
    if (!confirm(`¿Eliminar "${b.nombre}"? Los personajes que lo usen mostrarán un aviso.`)) return;
    const t = TIPOS.find(x => x.id === tipo);
    if (tipo === 'tabla') { const [tt, n] = id.split('|'); S.cambiarHb(hb => { delete hb.tablas[tt][n]; }); }
    else S.cambiarHb(hb => { hb[t.plural] = hb[t.plural].filter(x => x.id !== id); });
    sel = null; error = ''; S.render(); S.aviso('Eliminado.');
  }

  /* ---------------------------------------------------------------- piezas de formulario */
  const nombreCampo = b => ui.campo('Nombre', ui.texto(b.nombre || '', v => { b.nombre = v; }, { 'data-foco': 'hb-nombre', maxlength: 60 }), 'ancho2');
  const notaCampo = (b, et) => ui.campo(et || 'Descripción y capacidades', ui.area(b.nota || '', v => { b.nota = v; }, { rows: 5, 'data-foco': 'hb-nota' }));

  function editorMods(obj, titulo) {
    obj.mods = obj.mods || {};
    return h('div', { class: 'campo' }, h('span', { class: 'campo-et', text: titulo || 'Ajustes a características' }),
      h('div', { class: 'mods' }, A.STATS.map(s => h('label', { class: 'mod' }, h('span', { text: s }),
        ui.numero(obj.mods[s] || 0, v => { const n = U.num(v); if (n) obj.mods[s] = n; else delete obj.mods[s]; }, { step: 1, 'aria-label': 'Ajuste a ' + A.STAT_NOMBRES[s] })))));
  }

  function editorEfectos(S, obj, titulo, prefijo) {
    obj.efectos = obj.efectos || [];
    const lista = h('div', { class: 'lista-edit' });
    obj.efectos.forEach((e, i) => lista.append(h('div', { class: 'fila-edit' },
      ui.select(Object.entries(A.OBJETIVOS).map(([v, t]) => ({ v, t })), e.objetivo || 'thaco', v => { e.objetivo = v; }, { 'data-foco': `${prefijo}-ef${i}-o`, 'aria-label': 'Qué modifica' }),
      ui.numero(e.valor || 0, v => { e.valor = U.num(v); }, { class: 'corto', step: 1, 'data-foco': `${prefijo}-ef${i}-v`, 'aria-label': 'Valor' }),
      ui.texto(e.nota || '', v => { e.nota = v; }, { placeholder: 'Nota', 'data-foco': `${prefijo}-ef${i}-n`, 'aria-label': 'Nota' }),
      ui.boton('Quitar', () => { obj.efectos.splice(i, 1); S.render(); }, 'chico peligro'))));
    return h('div', { class: 'campo' }, h('span', { class: 'campo-et', text: titulo || 'Efectos que se aplican solos' }), lista,
      ui.boton('Agregar efecto', () => { obj.efectos.push({ objetivo: 'thaco', valor: -1, nota: '' }); S.render(); }, 'chico'));
  }

  const nombresTablas = (S, t) => Object.keys(S.reg.tablas[t]).map(n => ({ v: n, t: n }));
  const opcional = (obj, k, etiqueta, props) => ui.campo(etiqueta, ui.numero(obj[k] === undefined ? '' : obj[k], v => { if (v === '') delete obj[k]; else obj[k] = U.num(v); }, Object.assign({ placeholder: 'sin cambio', 'data-foco': 'hb-' + k }, props)));

  /* ---------------------------------------------------------------- formularios por tipo */
  function formRaza(S, b) {
    const variantes = h('div', { class: 'lista-edit' });
    b.variantes = b.variantes || [];
    b.variantes.forEach((v, i) => {
      v.mods = v.mods || {};
      variantes.append(h('details', { class: 'sub', open: true },
        h('summary', { text: v.nombre || 'Variante sin nombre' }),
        ui.campo('Nombre de la variante', ui.texto(v.nombre || '', x => { v.nombre = x; }, { 'data-foco': `hb-v${i}-n` })),
        editorMods(v, 'Ajustes de la variante'), ui.campo('Descripción', ui.area(v.nota || '', x => { v.nota = x; }, { rows: 3, 'data-foco': `hb-v${i}-nota` })),
        editorEfectos(S, v, 'Efectos de la variante', `hb-v${i}`),
        ui.boton('Quitar variante', () => { b.variantes.splice(i, 1); S.render(); }, 'chico peligro')));
    });
    if (typeof b._eleccionesTexto !== 'string') b._eleccionesTexto = JSON.stringify(b.elecciones || [], null, 2);
    return [
      h('div', { class: 'rejilla g3' }, nombreCampo(b), opcional(b, 'mov', 'Movimiento base (vacío: 12)', { min: 0, max: 60, 'data-foco': 'hb-mov' })), editorMods(b), notaCampo(b), editorIdiomasNativos(S, b), editorEfectos(S, b, 'Efectos de la raza', 'hb-raza'),
      h('h3', { text: 'Variantes' }), variantes, ui.boton('Agregar variante', () => { b.variantes.push({ id: '', nombre: '', mods: {}, nota: '', efectos: [] }); S.render(); }, 'chico'),
      h('details', { class: 'sub' }, h('summary', { text: 'Elecciones del jugador (avanzado, JSON)' }),
        h('p', { class: 'ayuda', text: 'Para razas donde el jugador elige algo (como el semihumano). Cada elección tiene id, etiqueta y opciones con valor, etiqueta y, si quieres, mods o efectos.' }),
        ui.area(b._eleccionesTexto, v => { b._eleccionesTexto = v; try { b.elecciones = JSON.parse(v); } catch (e) { b.elecciones = v; } }, { rows: 8, class: 'codigo', 'data-foco': 'hb-elecciones', spellcheck: 'false' }))
    ];
  }

  /* Poderes (texto) y pericias gratis de una clase. */
  function poderesYGratis(S, b) {
    b.poderes = Array.isArray(b.poderes) ? b.poderes : []; b.gratis = Array.isArray(b.gratis) ? b.gratis : [];
    const filas = b.poderes.map((q, i) => h('div', { class: 'hb-bono' },
      h('div', { class: 'rejilla g3' }, ui.campo('Poder', ui.texto(q.nombre || '', v => { q.nombre = v; }, { 'data-foco': `hb-pd-${i}-n`, maxlength: 80 })),
        ui.campo('Desde el nivel', ui.numero(q.nivel || 1, v => { q.nivel = Math.max(1, U.num(v)); }, { min: 1, max: 30, class: 'corto', 'data-foco': `hb-pd-${i}-l` }), 'corto-c')),
      ui.campo('Descripción', ui.area(q.texto || '', v => { q.texto = v; }, { rows: 3, 'data-foco': `hb-pd-${i}-t` })),
      ui.boton('Quitar poder', () => { b.poderes.splice(i, 1); S.render(); }, 'chico peligro', { 'data-foco': `hb-pd-${i}-q` })));
    let nuevoId = '';
    const opts = [{ v: '', t: 'Elige una pericia…' }].concat(S.reg.pericias.map(x => ({ v: x.id, t: x.nombre })));
    return [h('h3', { text: 'Poderes de clase (solo texto)' }), h('p', { class: 'ayuda', text: 'Se ven en la pestaña Ficha según el nivel y salen en la hoja impresa.' }),
      filas.length ? filas : h('p', { class: 'vacio', text: 'Sin poderes.' }), ui.boton('Agregar poder', () => { b.poderes.push({ nombre: '', nivel: 1, texto: '' }); S.render(); }, 'chico', { 'data-foco': 'hb-pd-nuevo' }),
      h('h3', { text: 'Pericias sin arma gratis' }), h('p', { class: 'ayuda', text: 'No gastan PNA mientras esta clase gobierne al personaje.' }),
      h('div', { class: 'chips' }, b.gratis.map((id, i) => h('span', { class: 'chip' }, (S.reg.pericia(id) || { nombre: id }).nombre, ' ', h('button', { type: 'button', class: 'chip-x', 'aria-label': 'Quitar', 'data-foco': 'hb-gr-q-' + i, onclick: () => { b.gratis.splice(i, 1); S.render(); } }, '×')))),
      h('div', { class: 'fila-edit' }, ui.select(opts, '', v => { nuevoId = v; }, { 'data-foco': 'hb-gr-add', 'aria-label': 'Pericia gratis' }), ui.boton('Agregar', () => { if (nuevoId && !b.gratis.includes(nuevoId)) { b.gratis.push(nuevoId); S.render(); } }, 'chico', { 'data-foco': 'hb-gr-btn' }))];
  }
  function formClase(S, b) {
    b.pericias = b.pericias || {};
    const num = (k, et, extra) => ui.campo(et, ui.numero(b[k] === undefined ? '' : b[k], v => { b[k] = U.num(v); }, Object.assign({ 'data-foco': 'hb-' + k }, extra)));
    const per = (k, et) => ui.campo(et, ui.numero(b.pericias[k] === undefined ? '' : b.pericias[k], v => { b.pericias[k] = U.num(v); }, { min: 0, 'data-foco': 'hb-p-' + k }));
    return [
      h('div', { class: 'rejilla g3' }, nombreCampo(b), opcional(b, 'mov', 'Movimiento base de la clase (vacío: el de la raza)', { min: 0, max: 60, 'data-foco': 'hb-mov' })),
      h('h3', { text: 'Tablas que usa' }),
      h('div', { class: 'rejilla g3' },
        ui.campo('THAC0', ui.select(nombresTablas(S, 'thaco'), b.thaco, v => { b.thaco = v; }, { 'data-foco': 'hb-thaco' })),
        ui.campo('Salvaciones', ui.select(nombresTablas(S, 'salvaciones'), b.salvaciones, v => { b.salvaciones = v; }, { 'data-foco': 'hb-salv' })),
        ui.campo('Experiencia', ui.select(nombresTablas(S, 'xp'), b.xp, v => { b.xp = v; }, { 'data-foco': 'hb-xp' }))),
      h('h3', { text: 'Puntos de golpe' }),
      h('div', { class: 'rejilla g3' }, num('dg', 'Dado de golpe (caras)', { min: 2 }), num('dgNivelMax', 'Último nivel que tira dado', { min: 1 }), num('pgDespues', 'PG fijos por nivel después', { min: 0 })),
      opcional(b, 'topeBonoCon', 'Tope del bono de CON a PG (vacío: sin tope con THAC0 Luchador, 2 con las demás)'),
      h('fieldset', { class: 'hb-cats' }, h('legend', { text: 'Categorías de pericias sin arma (vacío: según su tabla de THAC0)' }),
        h('div', { class: 'fila-edit' }, Object.entries(A.base.categoriasPericias).filter(([k]) => k !== 'general').map(([k, t]) => h('label', { class: 'casilla' },
          h('input', { type: 'checkbox', checked: (b.catPericias || []).includes(k) ? true : null, 'data-foco': 'hb-cl-c-' + k, onchange: e => { const s = new Set(b.catPericias || []); if (e.target.checked) s.add(k); else s.delete(k); if (s.size) b.catPericias = [...s]; else delete b.catPericias; } }), ' ' + t)))),
      opcional(b, 'espArmas', 'Especialización máxima en armas, 0 a 5 (vacío: según su tabla de THAC0)', { min: 0, max: 5 }),
      h('h3', { text: 'Pericias' }),
      h('div', { class: 'rejilla g4' }, per('pa0', 'De arma al inicio'), per('paCada', 'Una de arma cada N niveles'), per('pna0', 'Sin arma al inicio'), per('pnaCada', 'Una sin arma cada N niveles')),
      ...poderesYGratis(S, b),
      ui.campo('Ambidestría gratis', h('label', { class: 'check' }, h('input', { type: 'checkbox', checked: !!b.ambidestriaGratis, onchange: e => { if (e.target.checked) b.ambidestriaGratis = true; else delete b.ambidestriaGratis; } }), ' Esta clase no paga la ambidestría'))
    ];
  }

  /* Regalos del kit: todo gratis (sin gastar PA ni PNA). */
  function regalosKit(S, b) {
    const r = b.regalos = b.regalos && typeof b.regalos === 'object' ? b.regalos : A.reglas.kit.vacio();
    ['armas', 'grupos', 'esp', 'espGrupo', 'noArmas', 'bonos'].forEach(k => { if (!Array.isArray(r[k])) r[k] = []; });
    const armasOp = [{ v: '', t: 'Elige un arma…' }].concat(S.reg.gruposArmas().map(g => ({ grupo: g, items: S.reg.armas.filter(x => x.grupo === g).map(x => ({ v: x.id, t: x.nombre })) })).filter(g => g.items.length));
    const gruposOp = [{ v: '', t: 'Elige un grupo…' }].concat(S.reg.gruposArmas().map(g => ({ v: g, t: g })));
    const pericOp = [{ v: '', t: 'Elige una pericia…' }].concat(S.reg.pericias.map(p => ({ v: p.id, t: p.nombre })));
    const nombreArma = id => (S.reg.arma(id) || { nombre: id + ' (ya no existe)' }).nombre;
    const quitar = (lista, i, foco) => ui.boton('Quitar', () => { lista.splice(i, 1); S.render(); }, 'chico peligro', { 'data-foco': foco });
    const nivelSel = (max, v, fn, foco) => ui.select(Array.from({ length: max }, (_, i) => ({ v: String(i + 1), t: 'Nivel ' + (i + 1) })), String(v), x => fn(Number(x)), { 'data-foco': foco, 'aria-label': 'Nivel de especialización' });
    const nuevo = (op, foco, agregar, et) => { let v = ''; return h('div', { class: 'fila-edit' }, ui.select(op, '', x => { v = x; }, { 'data-foco': foco, 'aria-label': et }), ui.boton('Agregar', () => { if (v) { agregar(v); S.render(); } }, 'chico', { 'data-foco': foco + '-add' })); };
    const chips = (lista, nombre, foco) => h('div', { class: 'chips' }, lista.map((x, i) => h('span', { class: 'chip' }, nombre(x), ' ', h('button', { type: 'button', class: 'chip-x', 'aria-label': 'Quitar ' + nombre(x), 'data-foco': foco + '-q-' + i, onclick: () => { lista.splice(i, 1); S.render(); } }, '×'))));
    const bonoTargets = [{ v: 'todas', t: 'Todas las armas' }, { v: 'cuerpo', t: 'Cuerpo a cuerpo' }, { v: 'distancia', t: 'A distancia' }, { v: 'grupo', t: 'Un grupo…' }, { v: 'arma', t: 'Un arma…' }];
    const bonos = r.bonos.map((bo, i) => {
      const [t0, id0] = /^(arma|grupo):/.test(bo.aplica) ? [bo.aplica.split(':')[0], bo.aplica.slice(bo.aplica.indexOf(':') + 1)] : [bo.aplica, ''];
      const textoPrev = () => `Al nivel 1 / 5 / 9 / 13: ${[1, 5, 9, 13].map(n => A.reglas.kit.valorBono(bo, n)).join(' / ')} (positivo = mejora).`;
      const prev = h('p', { class: 'meta', text: textoPrev() });
      const num = (k, et, extra) => ui.campo(et, ui.numero(bo[k] === undefined ? '' : bo[k], v => { bo[k] = U.num(v); prev.textContent = textoPrev(); }, Object.assign({ step: 1, 'data-foco': `hb-kb-${i}-${k}` }, extra)), 'corto-c');
      return h('div', { class: 'hb-bono' },
        h('div', { class: 'rejilla g3' },
          ui.campo('Aplica a', ui.select(bonoTargets, t0, v => { bo.aplica = v === 'arma' || v === 'grupo' ? v + ':' : v; S.render(); }, { 'data-foco': `hb-kb-${i}-t` })),
          t0 === 'grupo' ? ui.campo('Grupo', ui.select(gruposOp, id0, v => { bo.aplica = 'grupo:' + v; S.render(); }, { 'data-foco': `hb-kb-${i}-g` })) : t0 === 'arma' ? ui.campo('Arma', ui.select(armasOp, id0, v => { bo.aplica = 'arma:' + v; S.render(); }, { 'data-foco': `hb-kb-${i}-a` })) : null,
          ui.campo('Mejora', ui.select([{ v: 'gac0', t: 'GAC0 (golpe)' }, { v: 'dano', t: 'Daño' }, { v: 'rt', t: 'RT (pasos de ataque)' }], bo.stat, v => { bo.stat = v; }, { 'data-foco': `hb-kb-${i}-s` }))),
        h('div', { class: 'rejilla g5' }, num('valor', 'Valor inicial'), num('desde', 'Desde el nivel', { min: 1 }), num('cada', 'Crece cada N niveles (0 = fijo)', { min: 0 }), num('paso', 'Cuánto crece', { step: 1 }), num('tope', 'Tope (0 = sin tope)', { min: 0 })),
        prev, quitar(r.bonos, i, `hb-kb-${i}-q`));
    });
    return [h('h3', { text: 'Armas y pericias que da el kit (gratis)' }),
      h('p', { class: 'ayuda', text: 'Nada de esto gasta PA ni PNA: aparece solo en las pestañas Armas y Pericias, marcado como "Del kit".' }),
      h('h4', { text: 'Competencia con armas' }), chips(r.armas, nombreArma, 'hb-kr-a'), nuevo(armasOp, 'hb-kr-arma', v => { if (!r.armas.includes(v)) r.armas.push(v); }, 'Arma'),
      h('h4', { text: 'Competencia con grupos enteros' }), chips(r.grupos, g => g, 'hb-kr-g'), nuevo(gruposOp, 'hb-kr-grupo', v => { if (!r.grupos.includes(v)) r.grupos.push(v); }, 'Grupo'),
      h('h4', { text: 'Especialización' }),
      r.esp.map((e, i) => h('div', { class: 'fila-edit' }, h('strong', { text: nombreArma(e.id) }), nivelSel(5, e.n, v => { e.n = v; }, `hb-kr-e-${i}`), quitar(r.esp, i, `hb-kr-eq-${i}`))), nuevo(armasOp, 'hb-kr-esp', v => { if (!r.esp.some(e => e.id === v)) r.esp.push({ id: v, n: 1 }); }, 'Arma a especializar'),
      r.espGrupo.map((e, i) => h('div', { class: 'fila-edit' }, h('strong', { text: 'Grupo ' + e.grupo }), nivelSel(2, e.n, v => { e.n = v; }, `hb-kr-eg-${i}`), quitar(r.espGrupo, i, `hb-kr-egq-${i}`))), nuevo(gruposOp, 'hb-kr-espg', v => { if (!r.espGrupo.some(e => e.grupo === v)) r.espGrupo.push({ grupo: v, n: 1 }); }, 'Grupo a especializar'),
      h('h4', { text: 'Pericias sin arma gratis' }),
      r.noArmas.map((e, i) => h('div', { class: 'fila-edit' }, h('strong', { text: (S.reg.pericia(e.id) || { nombre: e.id + ' (ya no existe)' }).nombre }),
        ui.campo('Mejoras gratis', ui.numero(e.mejoras, v => { e.mejoras = Math.max(0, U.num(v)); }, { min: 0, step: 1, class: 'corto', 'data-foco': `hb-kr-p-${i}` }), 'corto-c'), quitar(r.noArmas, i, `hb-kr-pq-${i}`))),
      nuevo(pericOp, 'hb-kr-peri', v => { if (!r.noArmas.some(e => e.id === v)) r.noArmas.push({ id: v, mejoras: 0 }); }, 'Pericia'),
      h('h4', { text: 'Bonos a armas (fijos o que crecen con el nivel)' }),
      h('p', { class: 'ayuda', text: 'Ejemplo: espadas, GAC0, valor 1 desde el nivel 1, crece 1 cada 4 niveles, tope 4. Para un bono fijo deja "Crece cada" en 0.' }),
      bonos.length ? bonos : h('p', { class: 'vacio', text: 'Sin bonos.' }),
      ui.boton('Agregar bono', () => { r.bonos.push({ aplica: 'todas', stat: 'gac0', valor: 1, cada: 0, paso: 1, desde: 1, tope: 0 }); S.render(); }, 'chico', { 'data-foco': 'hb-kb-nuevo' })];
  }
  function formKit(S, b) {
    b.sobreescribe = b.sobreescribe || {}; b.pericias = b.pericias || {};
    if (typeof b._habilidadesTexto !== 'string') b._habilidadesTexto = (b.habilidades || []).join('\n');
    const so = (k, et, t) => ui.campo(et, ui.select([{ v: '', t: 'Sin cambio' }].concat(nombresTablas(S, t)), b.sobreescribe[k] || '', v => { if (v) b.sobreescribe[k] = v; else delete b.sobreescribe[k]; }, { 'data-foco': 'hb-so-' + k }));
    const pe = (k, et, min) => opcional(b.pericias, k, et, { min, 'data-foco': 'hb-pe-' + k });
    return [
      h('div', { class: 'rejilla g3' }, nombreCampo(b),
        ui.campo('Clase del kit', ui.select(S.reg.clases.map(c => ({ v: c.id, t: c.nombre })), b.clase, v => { b.clase = v; }, { 'data-foco': 'hb-clase' }))),
      editorMods(b), notaCampo(b, 'Descripción'),
      ui.campo('Habilidades (una por línea)', ui.area(b._habilidadesTexto, v => { b._habilidadesTexto = v; b.habilidades = v.split('\n').map(x => x.trim()).filter(Boolean); }, { rows: 4, 'data-foco': 'hb-habs' })),
      editorEfectos(S, b, 'Efectos que se aplican solos (bono al ataque, salvaciones, CA, PG…)', 'hb-kit'),
      h('h3', { text: 'Cambia las reglas de la clase' }),
      h('p', { class: 'ayuda', text: 'Deja en blanco lo que el kit no cambie.' }),
      h('div', { class: 'rejilla g3' }, so('thaco', 'Tabla de THAC0', 'thaco'), so('salvaciones', 'Tabla de salvaciones', 'salvaciones'), so('xp', 'Tabla de experiencia', 'xp')),
      h('div', { class: 'rejilla g4' }, opcional(b.sobreescribe, 'dg', 'Dado de golpe', { min: 2 }), opcional(b.sobreescribe, 'dgNivelMax', 'Último nivel que tira dado', { min: 1 }), opcional(b.sobreescribe, 'pgDespues', 'PG fijos después', { min: 0 }), opcional(b.sobreescribe, 'topeBonoCon', 'Tope bono CON')),
      h('div', { class: 'rejilla g4' }, pe('pa0', 'De arma al inicio', 0), pe('paCada', 'Una de arma cada N', 1), pe('pna0', 'Sin arma al inicio', 0), pe('pnaCada', 'Una sin arma cada N', 1)),
      ...regalosKit(S, b)
    ];
  }

  function formVariante(S, b) {
    return [
      h('div', { class: 'rejilla g3' }, nombreCampo(b),
        ui.campo('Raza a la que se agrega', ui.select(S.reg.razas.map(r => ({ v: r.id, t: r.nombre + (r.origen === 'base' ? '' : ' (propia)') })), b.raza, v => { b.raza = v; }, { 'data-foco': 'hb-v-raza' }))),
      editorMods(b, 'Ajustes de la variante'), notaCampo(b, 'Descripción'),
      editorEfectos(S, b, 'Efectos de la variante', 'hb-var')
    ];
  }

  function formIdioma(S, b) { return [h('div', { class: 'rejilla g3' }, nombreCampo(b)), notaCampo(b, 'Notas (quién lo habla, escritura…)')]; }

  /* Idiomas nativos de una raza homebrew: se eligen de tu lista de idiomas (base + propios). */
  function editorIdiomasNativos(S, b) {
    b.idiomas = Array.isArray(b.idiomas) ? b.idiomas : (A.base.idiomasRaza[b.id] || []).slice();
    const filas = b.idiomas.map((id, i) => h('div', { class: 'fila-edit' },
      ui.select(S.reg.idiomas.map(x => ({ v: x.id, t: x.nombre })), id, v => { b.idiomas[i] = v; }, { 'data-foco': `hb-idi${i}`, 'aria-label': 'Idioma nativo' }),
      ui.boton('Quitar', () => { b.idiomas.splice(i, 1); S.render(); }, 'chico peligro')));
    return h('div', {}, h('h3', { text: 'Idiomas nativos (gratis)' }), ...filas,
      ui.boton('Agregar idioma nativo', () => { b.idiomas.push((S.reg.idiomas[0] || {}).id || ''); S.render(); }, 'chico'));
  }

  function formArma(S, b, opc) {
    opc = opc || {};
    const txt = (k, et, extra) => ui.campo(et, ui.texto(String(b[k] === undefined ? '' : b[k]), v => { b[k] = v; }, Object.assign({ 'data-foco': 'hb-a-' + k }, extra)));
    const lista = h('datalist', { id: 'hb-grupos-armas' }, S.reg.gruposArmas().map(g => h('option', { value: g })));
    return [
      h('div', { class: 'rejilla g3' }, nombreCampo(b), txt('grupo', 'Grupo (competencia de grupo)', { list: 'hb-grupos-armas' }), lista,
        opc.sinTipo ? null : ui.campo('Tipo', ui.select([{ v: 'cuerpo', t: 'Cuerpo a cuerpo' }, { v: 'distancia', t: 'A distancia' }], b.tipo, v => { b.tipo = v; }, { 'data-foco': 'hb-a-tipo' }))),
      h('div', { class: 'rejilla g4' }, txt('dm', 'Daño P/M (ej. 1d8+1)'), txt('dg', 'Daño G'), txt('dano', 'Tipo de daño (P, C, G)'),
        ui.campo('Tamaño', ui.select(['P', 'L', 'M', 'G'].map(v => ({ v, t: v })), b.tam || 'M', v => { b.tam = v; }, { 'data-foco': 'hb-a-tam' }))),
      h('div', { class: 'rejilla g4' }, txt('crit', 'Crítico (ej. (19-20)x2)'), txt('adv', 'Crítico con especialista'), txt('costo', 'Costo (ej. 15 mo)'), txt('peso', 'Peso (kg)')),
      h('div', { class: 'rejilla g3' },
        ui.campo('RT base (ataques por round)', ui.select(Array.from({ length: 12 }, (_, i) => ({ v: String(i + 1), t: A.reglas.armas.rtEtiqueta(i + 1) + (i === 1 ? ' (lo normal)' : '') })), String(Math.max(1, Math.min(12, Math.round(U.num(b.rt)) || 2))), v => { b.rt = Number(v); }, { 'data-foco': 'hb-a-rt' })),
        b.techRt ? ui.campo('Bono de RT del Techno', h('output', { class: 'fijo', text: '+' + b.techRt + ' (se suma aparte del RT base)' })) : null),
      opc.sinEscudo ? null : h('div', { class: 'rejilla g3' },
        ui.campo('¿Es un escudo?', ui.select([{ v: 'no', t: 'No' }, { v: 'si', t: 'Sí (arma-escudo)' }], b.escudo ? 'si' : 'no', v => { b.escudo = v === 'si' ? (b.escudo || { ca: 0, bloqueos: 0 }) : undefined; if (v === 'si') b.grupo = 'Escudos'; S.render(); }, { 'data-foco': 'hb-a-esc' })),
        b.escudo ? ui.campo('Ajuste de CA vs. escudo medio (−1 más chico, +1 más grande)', ui.numero(b.escudo.ca || 0, v => { b.escudo.ca = U.num(v); }, { step: 1, 'data-foco': 'hb-a-esc-ca' })) : null,
        b.escudo ? ui.campo('Ajuste de bloqueos vs. escudo medio (+1 más chico, −1 más grande)', ui.numero(b.escudo.bloqueos || 0, v => { b.escudo.bloqueos = U.num(v); }, { step: 1, 'data-foco': 'hb-a-esc-bl' })) : null),
      txt('esp', 'Propiedades (usa "Sutil" para permitir DES, "Arrojadizo" para lanzarla)')
    ];
  }

  function formEscuela(S, b) {
    const E = A.base.espadachin;
    b.tecnicas = Array.isArray(b.tecnicas) ? b.tecnicas : [];
    while (b.tecnicas.length < E.niveles.length) b.tecnicas.push({ nombre: '', efecto: '' });
    return [
      h('div', { class: 'rejilla g3' }, nombreCampo(b)),
      h('p', { class: 'ayuda', text: 'Una técnica por rango, desde el nivel 1 hasta el 19. Deja vacías las últimas si tu escuela es más corta. En el efecto escribe "MD" donde entre el daño por Fuerza: la ficha lo cambia por el valor del personaje (por ejemplo "Reduce el daño en 1d10 + MD" queda "1d10 + 3"). "1 round/MD" se convierte en esa cantidad de rounds, mínimo 1.' }),
      b.tecnicas.slice(0, E.niveles.length).map((t, i) => h('div', { class: 'tarjeta-arma' },
        h('strong', { text: `Rango ${i + 1} · ${E.titulos[i]} · nivel ${E.niveles[i]}` }),
        h('div', { class: 'rejilla g2' },
          ui.campo('Nombre', ui.texto(t.nombre || '', v => { t.nombre = v; }, { 'data-foco': `hb-es-n${i}` })),
          ui.campo('Efecto', ui.texto(t.efecto || '', v => { t.efecto = v; }, { 'data-foco': `hb-es-e${i}` })))))
    ];
  }

  function formArte(S, b) {
    b.movs = Array.isArray(b.movs) ? b.movs : [];
    const filas = b.movs.map((m, i) => h('div', { class: 'tarjeta-arma' },
      h('div', { class: 'rejilla g3' },
        ui.campo('Clave (grupo y número)', ui.texto(m.k || '', v => { m.k = v; }, { placeholder: 'Golpear 1', 'data-foco': `hb-am-k${i}` })),
        ui.campo('Maniobra', ui.texto(m.nombre || '', v => { m.nombre = v; }, { 'data-foco': `hb-am-n${i}` })),
        ui.campo('CA (opcional, solo sin armadura)', ui.numero(m.ca || 0, v => { m.ca = U.num(v); }, { step: 1, max: 0, 'data-foco': `hb-am-c${i}` }))),
      ui.campo('Efecto', ui.texto(m.efecto || '', v => { m.efecto = v; }, { 'data-foco': `hb-am-e${i}` })),
      ui.boton('Quitar movimiento', () => { b.movs.splice(i, 1); S.render(); }, 'chico peligro', { 'data-foco': `hb-am-q${i}` })));
    return [
      h('div', { class: 'rejilla g3' }, nombreCampo(b),
        ui.campo('Ataques por round (1 = normal)', ui.numero(b.atk, v => { b.atk = U.num(v); }, { min: 1, max: 6, step: 1, 'data-foco': 'hb-am-atk' })),
        ui.campo('Daño desarmado', ui.texto(b.dano || '', v => { b.dano = v; }, { placeholder: '1d6, 1d4+1…', 'data-foco': 'hb-am-dano' })),
        ui.campo('Modificador de CA (0 a −6)', ui.numero(b.ac, v => { b.ac = U.num(v); }, { max: 0, min: -6, step: 1, 'data-foco': 'hb-am-ac' })),
        ui.campo('Método de pelea', ui.texto(b.met || '', v => { b.met = v; }, { 'data-foco': 'hb-am-met' })),
        ui.campo('Armas que usa', ui.texto(b.armas || '', v => { b.armas = v; }, { 'data-foco': 'hb-am-armas' }))),
      h('p', { class: 'ayuda', text: 'Los ataques extra suman al RT de su ataque desarmado (1/1 con 1 ataque, 3/3 con 3). La clave del movimiento termina en un número: Candado 1 se aprende antes que Candado 2. Un movimiento con CA negativa funciona solo sin armadura y se suma aparte del bono del arte.' }),
      filas,
      h('div', { class: 'fila-edit' },
        ui.select([{ v: '', t: 'Agregar un movimiento existente…' }].concat(['Bloqueo', 'Candado', 'Mov', 'Patada', 'Golpear', 'Empujar', 'Arrojar', 'Vital', 'Arma', 'Mental'].map(g => ({
          grupo: g, items: A.base.artesMovs.filter(m => m.k.split(' ')[0] === g).map(m => ({ v: m.k, t: `${m.k} · ${m.nombre}${b.movs.some(x => x.k === m.k) ? ' (ya está)' : ''}` }))
        })).filter(g => g.items.length)), '', v => {
          const m = A.base.artesMovs.find(x => x.k === v);
          if (m && !b.movs.some(x => x.k === m.k)) { b.movs.push(Object.assign({}, m)); S.render(); }
        }, { 'data-foco': 'hb-am-existente', 'aria-label': 'Movimiento existente a agregar' }),
        ui.boton('Agregar movimiento nuevo', () => { b.movs.push({ k: '', nombre: '', efecto: '', ca: 0 }); S.render(); }, 'chico', { 'data-foco': 'hb-am-add' }))
    ];
  }

  function formCreacion(S, b) {
    const tipos = ['Arma de área', 'Montura', 'Munición', 'Dispositivo', 'Otro'];
    const TH = A.reglas.techno;
    return [
      h('div', { class: 'rejilla g3' }, nombreCampo(b),
        ui.campo('Tipo', ui.select(tipos.map(v => ({ v, t: v })), tipos.includes(b.tipo) ? b.tipo : 'Otro', v => { b.tipo = v; S.render(); }, { 'data-foco': 'hb-cr-tipo' })),
        ui.campo('Autor', ui.texto(b.autor || '', v => { b.autor = v; }, { 'data-foco': 'hb-cr-autor' }))),
      b.tipo === 'Arma de área' && b.area ? h('p', { class: 'meta', text: TH.linea({ tipo: b.tipo, area: b.area, capacidad: b.capacidad }) }) : null,
      b.tipo === 'Montura' && b.montura ? h('p', { class: 'meta', text: TH.linea({ tipo: b.tipo, montura: b.montura }) }) : null,
      ui.campo('Descripción', ui.area(b.desc || '', v => { b.desc = v; }, { rows: 5, 'data-foco': 'hb-cr-desc' })),
      h('p', { class: 'ayuda', text: 'Las creaciones llegan aquí cuando un Techno te las entrega (Importar paquete) o las guarda desde su taller. Para usarlas, abre Técnicas → Techno y agrégalas a tu taller. Los valores ya vienen fabricados: no dependen de tu nivel.' })
    ];
  }

  /* Esferas de un conjuro divino: se eligen de la lista (base + homebrew), sin escribirlas. */
  function selectorEsferas(S, b) {
    if (!Array.isArray(b.esferas)) b.esferas = A.reglas.conjuros ? A.reglas.conjuros.esferasDe(b).slice() : [];
    const lista = A.listaEsferas(), nombre = id => (lista.find(e => e.id === id) || { nombre: id + ' (ya no existe)' }).nombre;
    const ops = [{ v: '', t: '— agregar esfera —' }].concat(lista.filter(e => !b.esferas.includes(e.id)).sort((x, y) => x.nombre.localeCompare(y.nombre, 'es')).map(e => ({ v: e.id, t: e.nombre + (e.origen === 'homebrew' ? ' (homebrew)' : '') })));
    return h('div', { class: 'campo ancho-todo' }, h('span', { class: 'campo-et', text: 'Esferas del conjuro' }),
      b.esferas.length ? h('div', { class: 'fila-edit' }, b.esferas.map((id, i) => ui.boton(nombre(id) + ' ✕', () => { b.esferas.splice(i, 1); b.esfera = ''; S.render(); }, 'chico', { 'data-foco': 'hb-cj-esfq' + i, title: 'Quitar esfera' }))) : h('p', { class: 'meta', text: 'Sin esferas: el conjuro no estará en la lista de ningún sacerdote.' }),
      ui.select(ops, '', v => { if (v) { b.esferas.push(v); b.esfera = ''; S.render(); } }, { 'aria-label': 'Agregar esfera', 'data-foco': 'hb-cj-esfadd' }));
  }
  function formEsfera(S, b) {
    return [h('div', { class: 'rejilla g3' }, nombreCampo(b)),
      ui.campo('Descripción', ui.area(b.desc || '', v => { b.desc = v; }, { rows: 4, 'data-foco': 'hb-es-desc' })),
      h('p', { class: 'ayuda', text: 'Las esferas nuevas aparecen al crear conjuros divinos, en las deidades y en las esferas de cada sacerdote.' })];
  }

  function formConjuro(S, b) {
    const t = (k, et, extra) => ui.campo(et, ui.texto(b[k] || '', v => { b[k] = v; }, Object.assign({ 'data-foco': 'hb-cj-' + k }, extra || {})));
    b.escuelas = Array.isArray(b.escuelas) ? b.escuelas : [];
    const marcas = S.reg.escuelasMagia.map(e => h('label', { class: 'check' }, h('input', { type: 'checkbox', checked: b.escuelas.includes(e.id), 'data-foco': 'hb-cj-esc-' + e.id, onchange: ev => { b.escuelas = b.escuelas.filter(x => x !== e.id); if (ev.target.checked) b.escuelas.push(e.id); } }), ' ' + e.nombre));
    return [
      h('div', { class: 'rejilla g3' }, nombreCampo(b),
        ui.campo('Tipo', ui.select([{ v: 'arcano', t: 'Arcano (mago, hechicero)' }, { v: 'divino', t: 'Divino (sacerdote)' }], b.tipo, v => { b.tipo = v; S.render(); }, { 'data-foco': 'hb-cj-tipo' })),
        ui.campo('Nivel de conjuro', ui.numero(b.nv, v => { b.nv = U.num(v); }, { min: 1, max: 9, step: 1, 'data-foco': 'hb-cj-nv' }))),
      h('div', { class: 'campo' }, h('span', { class: 'campo-et', text: 'Escuelas de magia (puede tener varias)' }), h('div', { class: 'checks' }, marcas)),
      h('div', { class: 'rejilla g3' }, b.tipo === 'divino' ? selectorEsferas(S, b) : null, t('fuente', 'Fuente'),
        h('label', { class: 'check' }, h('input', { type: 'checkbox', checked: !!b.rev, 'data-foco': 'hb-cj-rev', onchange: e => { b.rev = e.target.checked; S.render(); } }), ' Reversible')),
      h('div', { class: 'rejilla g3' }, t('alcance', 'Alcance'), t('componentes', 'Componentes'), t('duracion', 'Duración'), t('tiempo', 'Tiempo de lanzamiento'), t('area', 'Área de efecto'), t('salvacion', 'Salvación')),
      t('material', 'Componente material'),
      ui.campo('Efecto', ui.area(b.efecto || '', v => { b.efecto = v; }, { rows: 8, 'data-foco': 'hb-cj-efecto' })),
      b.rev ? ui.campo('Efecto inverso', ui.area(b.reverso || '', v => { b.reverso = v; }, { rows: 4, 'data-foco': 'hb-cj-reverso' })) : null
    ];
  }

  function formEscuelaMagia(S, b) {
    const esp = b.especialista, otras = S.reg.escuelasMagia.filter(e => e.id !== b.id);
    const marcas = esp ? otras.map(e => h('label', { class: 'check' }, h('input', { type: 'checkbox', checked: esp.prohibidas.includes(e.id), 'data-foco': 'hb-em-p-' + e.id, onchange: ev => { esp.prohibidas = esp.prohibidas.filter(x => x !== e.id); if (ev.target.checked) esp.prohibidas.push(e.id); } }), ' ' + e.nombre)) : [];
    return [
      h('div', { class: 'rejilla g3' }, nombreCampo(b)),
      ui.campo('Descripción', ui.area(b.desc || '', v => { b.desc = v; }, { rows: 3, 'data-foco': 'hb-em-desc' })),
      h('label', { class: 'check' }, h('input', { type: 'checkbox', checked: !!esp, 'data-foco': 'hb-em-esp', onchange: e => { if (e.target.checked) b.especialista = { nombre: '', prohibidas: [], aprender: { propio: 15, otras: -15 }, salv: { propio: 1, ajeno: -1 }, extra: true, rasgos: [], poderes: [] }; else delete b.especialista; S.render(); } }), ' Permite magos especialistas en esta escuela'),
      esp ? [
        h('p', { class: 'ayuda', text: 'Valores de fábrica del especialista: +1 a sus salvaciones contra su escuela, −1 para los demás, un espacio extra por nivel de conjuro, +15% al aprender los suyos y −15% los demás. Ajústalos para tu escuela.' }),
        ui.campo('Nombre del especialista', ui.texto(esp.nombre || '', v => { esp.nombre = v; }, { placeholder: 'Ej. Elementalista', 'data-foco': 'hb-em-nombre' })),
        h('div', { class: 'campo' }, h('span', { class: 'campo-et', text: 'Escuelas prohibidas' }), h('div', { class: 'checks' }, marcas)),
        (esp.aprender = esp.aprender || { propio: 15, otras: -15 }, esp.salv = esp.salv || { propio: 1, ajeno: -1 }, null),
        h('div', { class: 'rejilla g4' },
          ui.campo('% al aprender su escuela', ui.numero(esp.aprender.propio, v => { esp.aprender.propio = U.num(v); }, { step: 5, 'data-foco': 'hb-em-ap' })),
          ui.campo('% al aprender otras', ui.numero(esp.aprender.otras, v => { esp.aprender.otras = U.num(v); }, { step: 5, 'data-foco': 'hb-em-ao' })),
          ui.campo('Salvación propia vs. su escuela', ui.numero(esp.salv.propio, v => { esp.salv.propio = U.num(v); }, { step: 1, 'data-foco': 'hb-em-sp' })),
          ui.campo('Salvación de los demás vs. él', ui.numero(esp.salv.ajeno, v => { esp.salv.ajeno = U.num(v); }, { step: 1, 'data-foco': 'hb-em-sa' }))),
        h('label', { class: 'check' }, h('input', { type: 'checkbox', checked: esp.extra !== false, 'data-foco': 'hb-em-extra', onchange: e => { esp.extra = e.target.checked; } }), ' Un espacio extra por nivel de conjuro (de su escuela)'),
        h('h3', { text: 'Rasgos permanentes (no dependen del nivel ni del interruptor)' }),
        (esp.rasgos = esp.rasgos || []).map((r, i) => h('div', { class: 'fila-edit' },
          ui.texto(r, v => { esp.rasgos[i] = v; }, { 'aria-label': 'Rasgo ' + (i + 1), 'data-foco': `hb-em-r${i}` }), ui.boton('Quitar', () => { esp.rasgos.splice(i, 1); S.render(); }, 'chico peligro', { 'data-foco': `hb-em-rq${i}` }))),
        ui.boton('Agregar rasgo', () => { esp.rasgos.push(''); S.render(); }, 'chico', { 'data-foco': 'hb-em-radd' }),
        h('h3', { text: 'Poderes por nivel (se activan con el interruptor de reglas opcionales)' }),
        (esp.poderes = esp.poderes || []).map((p, i) => h('div', { class: 'tarjeta-arma' },
          h('div', { class: 'rejilla g3' }, ui.campo('Nivel', ui.numero(p.nivel, v => { p.nivel = U.num(v); }, { min: 1, max: 30, step: 1, 'data-foco': `hb-em-pn${i}` })),
            ui.campo('Poder', ui.texto(p.texto || '', v => { p.texto = v; }, { 'data-foco': `hb-em-pt${i}` }), 'ancho2')),
          ui.boton('Quitar poder', () => { esp.poderes.splice(i, 1); S.render(); }, 'chico peligro', { 'data-foco': `hb-em-pq${i}` }))),
        ui.boton('Agregar poder', () => { esp.poderes.push({ nivel: 8, texto: '' }); S.render(); }, 'chico', { 'data-foco': 'hb-em-padd' })
      ] : null
    ];
  }

  function formLinaje(S, b) {
    b.habilidades = Array.isArray(b.habilidades) ? b.habilidades : [];
    b.conjuros = Array.from({ length: 9 }, (_, i) => (Array.isArray(b.conjuros) && Array.isArray(b.conjuros[i]) ? b.conjuros[i] : []));
    const hab = b.habilidades.map((x, i) => h('div', { class: 'tarjeta-arma' },
      h('div', { class: 'rejilla g3' }, ui.campo('Nivel', ui.numero(x.nivel, v => { x.nivel = U.num(v); }, { min: 1, max: 30, step: 1, 'data-foco': `hb-li-hn${i}` })),
        ui.campo('Habilidad', ui.texto(x.nombre || '', v => { x.nombre = v; }, { 'data-foco': `hb-li-hb${i}` }), 'ancho2')),
      ui.campo('Efecto', ui.area(x.texto || '', v => { x.texto = v; }, { rows: 2, 'data-foco': `hb-li-ht${i}` })),
      ui.boton('Quitar habilidad', () => { b.habilidades.splice(i, 1); S.render(); }, 'chico peligro', { 'data-foco': `hb-li-hq${i}` })));
    const filas = b.conjuros.map((par, n) => {
      const opciones = [{ v: '', t: '— ninguno —' }].concat(S.reg.conjuros.filter(x => x.nv === n + 1).map(x => ({ v: x.id, t: x.nombre + (x.tipo === 'divino' ? ' (divino)' : '') })));
      return h('div', { class: 'tarjeta-arma' }, h('strong', { text: `Conjuros de nivel ${n + 1}` }),
        h('div', { class: 'rejilla g2' }, [0, 1].map(k => h('div', {},
          ui.campo('Conjuro ' + (k + 1), ui.select(opciones, (par[k] && par[k].id) || '', v => { if (v) par[k] = Object.assign({ id: v }, par[k] && par[k].inv ? { inv: true } : {}); else par.splice(k, 1); S.render(); }, { 'data-foco': `hb-li-c${n}-${k}` })),
          par[k] && (S.reg.conjuro(par[k].id) || {}).rev ? h('label', { class: 'check' }, h('input', { type: 'checkbox', checked: !!par[k].inv, 'data-foco': `hb-li-i${n}-${k}`, onchange: e => { par[k].inv = e.target.checked; } }), ' Forma inversa') : null))));
    });
    return [
      h('div', { class: 'rejilla g3' }, nombreCampo(b)),
      ui.campo('Descripción', ui.area(b.desc || '', v => { b.desc = v; }, { rows: 2, 'data-foco': 'hb-li-desc' })),
      h('h3', { text: 'Habilidades (suelen ser en los niveles 1, 6, 12 y 18)' }), hab,
      ui.boton('Agregar habilidad', () => { b.habilidades.push({ nivel: 1, nombre: '', texto: '' }); S.render(); }, 'chico', { 'data-foco': 'hb-li-hadd' }),
      h('h3', { text: 'Conjuros del linaje (2 por nivel de conjuro)' }), filas
    ];
  }

  function formPacto(S, b) {
    const Bz = A.base.brujo;
    b.tecnicas = Array.isArray(b.tecnicas) ? b.tecnicas : [];
    while (b.tecnicas.length < Bz.niveles.length) b.tecnicas.push({ nombre: '', efecto: '', costo: 1, pasiva: false });
    b.escuelas = Array.isArray(b.escuelas) ? b.escuelas : []; b.esferas = Array.isArray(b.esferas) ? b.esferas : []; b.firma = Array.isArray(b.firma) ? b.firma : [];
    const marcar = (lista, id, on) => { const i = lista.indexOf(id); if (on && i < 0) lista.push(id); if (!on && i >= 0) lista.splice(i, 1); };
    const opcionesFirma = [{ v: '', t: '— agregar conjuro firma —' }].concat(S.reg.conjuros.filter(x => !b.firma.includes(x.id)).sort((x, y) => x.nombre.localeCompare(y.nombre, 'es') || x.nv - y.nv).map(x => ({ v: x.id, t: `${x.nombre} (nv ${x.nv}, ${x.tipo === 'divino' ? 'divino' : 'arcano'})` })));
    return [
      h('div', { class: 'rejilla g3' }, nombreCampo(b)),
      ui.campo('Descripción', ui.area(b.desc || '', v => { b.desc = v; }, { rows: 2, 'data-foco': 'hb-pa-desc' })),
      h('p', { class: 'ayuda', text: 'La lista de tu patrón son los conjuros arcanos de sus escuelas, los divinos de sus esferas y los conjuros firma. El brujo solo puede pedir de esa lista.' }),
      h('div', { class: 'campo' }, h('span', { class: 'campo-et', text: 'Escuelas arcanas del patrón' }), h('div', { class: 'checks' }, S.reg.escuelasMagia.map(e => h('label', { class: 'check' },
        h('input', { type: 'checkbox', checked: b.escuelas.includes(e.id), 'data-foco': 'hb-pa-esc-' + e.id, onchange: ev => marcar(b.escuelas, e.id, ev.target.checked) }), ' ' + e.nombre)))),
      h('div', { class: 'campo' }, h('span', { class: 'campo-et', text: 'Esferas divinas del patrón' }), h('div', { class: 'checks' }, A.listaEsferas().map(e => h('label', { class: 'check' },
        h('input', { type: 'checkbox', checked: b.esferas.includes(e.id), 'data-foco': 'hb-pa-esf-' + e.id, onchange: ev => marcar(b.esferas, e.id, ev.target.checked) }), ' ' + e.nombre)))),
      h('h3', { text: 'Conjuros firma' }),
      b.firma.length ? h('ul', { class: 'cj-lista' }, b.firma.map((id, i) => h('li', { class: 'cj-mem' }, h('span', { class: 'crece', text: (S.reg.conjuro(id) || { nombre: id + ' (ya no existe)' }).nombre }),
        ui.boton('Quitar', () => { b.firma.splice(i, 1); S.render(); }, 'chico peligro', { 'data-foco': 'hb-pa-fq' + i })))) : h('p', { class: 'meta', text: 'Sin conjuros firma.' }),
      ui.select(opcionesFirma, '', v => { if (v) { b.firma.push(v); S.render(); } }, { 'aria-label': 'Agregar conjuro firma', 'data-foco': 'hb-pa-fadd' }),
      h('h3', { text: 'Técnicas (una por rango de título)' }),
      h('p', { class: 'ayuda', text: 'Del nivel 1 al 19. Las activas cuestan puntos de pacto cada vez que se usan; las pasivas siempre están activas y no cuestan. Deja vacías las últimas si tu pacto es más corto.' }),
      b.tecnicas.slice(0, Bz.niveles.length).map((t, i) => h('div', { class: 'tarjeta-arma' },
        h('strong', { text: `Rango ${i + 1} · ${Bz.titulos[i]} · nivel ${Bz.niveles[i]}` }),
        h('div', { class: 'rejilla g3' },
          ui.campo('Nombre', ui.texto(t.nombre || '', v => { t.nombre = v; }, { 'data-foco': `hb-pa-n${i}` })),
          ui.campo('Costo (puntos de pacto)', ui.numero(t.costo, v => { t.costo = Math.max(0, Math.min(20, Math.round(U.num(v)))); }, { min: 0, max: 20, step: 1, 'data-foco': `hb-pa-c${i}` })),
          h('label', { class: 'check' }, h('input', { type: 'checkbox', checked: !!t.pasiva, 'data-foco': `hb-pa-p${i}`, onchange: e => { t.pasiva = e.target.checked; } }), ' Pasiva (sin costo)')),
        ui.campo('Efecto', ui.area(t.efecto || '', v => { t.efecto = v; }, { rows: 2, 'data-foco': `hb-pa-e${i}` }))))
    ];
  }

  function formPoderPsi(S, b) {
    b.prerrequisitos = Array.isArray(b.prerrequisitos) ? b.prerrequisitos : [];
    const discs = S.reg.disciplinasPsi.map(d => ({ v: d.nombre, t: d.nombre }));
    const pu = b.puntuacion || null, mant = b.mantenimiento || null;
    const nombrePoder = id => (S.reg.poderPsi(id) || { nombre: id }).nombre;
    const reqTxt = r => (r.k === 'nivel' ? `Nivel ${r.v}` : r.k === 'contacto' ? 'Contacto' : r.k === 'poder' ? nombrePoder(r.v) : r.v);
    const tieneContacto = b.prerrequisitos.some(r => r.k === 'contacto');
    const opcPoderes = [{ v: '', t: '— agregar poder requerido —' }].concat(S.reg.poderesPsi.filter(p => p.id !== b.id).sort((x, y) => x.nombre.localeCompare(y.nombre, 'es')).map(p => ({ v: p.id, t: `${p.nombre} (${p.disc})` })));
    return [
      h('div', { class: 'rejilla g3' }, nombreCampo(b),
        ui.campo('Disciplina', ui.select(discs, b.disc || (discs[0] && discs[0].v) || '', v => { b.disc = v; }, { 'data-foco': 'hb-pp-disc' })),
        ui.campo('Tipo', ui.select([{ v: 'ciencia', t: 'Ciencia' }, { v: 'devocion', t: 'Devoción' }], b.tipo || 'devocion', v => { b.tipo = v; }, { 'data-foco': 'hb-pp-tipo' }))),
      h('div', { class: 'rejilla g3' },
        ui.campo('Puntuación de poder: atributo', ui.select([{ v: '', t: 'Sin puntuación' }].concat(['SAB', 'INT', 'CON', 'FUE', 'DES', 'CAR'].map(x => ({ v: x, t: x }))), pu ? pu.car : '', v => { b.puntuacion = v ? { car: v, mod: pu ? pu.mod : 0 } : null; S.render(); }, { 'data-foco': 'hb-pp-car' })),
        ui.campo('Modificador (0 o negativo)', ui.numero(pu ? pu.mod : 0, v => { if (b.puntuacion) b.puntuacion.mod = Math.min(0, Math.round(U.num(v))); }, { max: 0, step: 1, 'data-foco': 'hb-pp-mod' })),
        ui.campo('Efecto de la puntuación y del 20', ui.texto(b.puntuacionTxt || '', v => { b.puntuacionTxt = v; }, { 'data-foco': 'hb-pp-ptxt' }))),
      h('div', { class: 'rejilla g3' },
        ui.campo('Costo de inicio (PSP)', ui.numero(b.costo === null || b.costo === undefined ? '' : b.costo, v => { b.costo = v === '' ? null : Math.max(0, Math.round(U.num(v))); b.inicio = v === '' ? b.inicio : String(b.costo); }, { min: 0, step: 1, placeholder: 'vacío si no es numérico', 'data-foco': 'hb-pp-costo' })),
        ui.campo('Mantenimiento (PSP)', ui.numero(mant ? mant.n : '', v => { if (v === '') { b.mantenimiento = null; b.mant = 'n/d'; } else { b.mantenimiento = { n: Math.max(0, Math.round(U.num(v))), u: mant ? mant.u : 'round' }; b.mant = `${b.mantenimiento.n}/${b.mantenimiento.u}`; } }, { min: 0, step: 1, placeholder: 'vacío si no tiene', 'data-foco': 'hb-pp-mant' })),
        ui.campo('Por', ui.select(['round', 'turno', 'hora', 'día'].map(u => ({ v: u, t: u })), mant ? mant.u : 'round', v => { if (b.mantenimiento) { b.mantenimiento.u = v; b.mant = `${b.mantenimiento.n}/${v}`; } }, { 'data-foco': 'hb-pp-mu' }))),
      h('div', { class: 'rejilla g3' },
        ui.campo('Alcance', ui.texto(b.alcance || '', v => { b.alcance = v; }, { 'data-foco': 'hb-pp-alc' })), ui.campo('Preparación', ui.texto(b.preparacion || '', v => { b.preparacion = v; }, { 'data-foco': 'hb-pp-prep' })), ui.campo('Área', ui.texto(b.area || '', v => { b.area = v; }, { 'data-foco': 'hb-pp-area' }))),
      h('h3', { text: 'Prerrequisitos' }),
      b.prerrequisitos.length ? h('ul', { class: 'cj-lista' }, b.prerrequisitos.map((r, i) => h('li', { class: 'cj-mem' }, h('span', { class: 'crece', text: reqTxt(r) }), ui.boton('Quitar', () => { b.prerrequisitos.splice(i, 1); S.render(); }, 'chico peligro', { 'data-foco': 'hb-pp-rq' + i })))) : h('p', { class: 'meta', text: 'Sin prerrequisitos.' }),
      h('div', { class: 'rejilla g3' },
        ui.select(opcPoderes, '', v => { if (v) { b.prerrequisitos.push({ k: 'poder', v, nombre: nombrePoder(v) }); S.render(); } }, { 'aria-label': 'Agregar poder requerido', 'data-foco': 'hb-pp-radd' }),
        h('div', { class: 'fila-edit' }, ui.numero('', v => { b._nivelReq = v; }, { min: 1, max: 30, step: 1, placeholder: 'Nivel', 'aria-label': 'Nivel requerido', 'data-foco': 'hb-pp-nv' }), ui.boton('Pedir nivel', () => { const n = Math.round(U.num(b._nivelReq)); if (n >= 1) { b.prerrequisitos = b.prerrequisitos.filter(r => r.k !== 'nivel'); b.prerrequisitos.push({ k: 'nivel', v: n }); S.render(); } }, 'chico', { 'data-foco': 'hb-pp-nvadd' })),
        h('label', { class: 'check' }, h('input', { type: 'checkbox', checked: tieneContacto, 'data-foco': 'hb-pp-cont', onchange: e => { b.prerrequisitos = b.prerrequisitos.filter(r => r.k !== 'contacto'); if (e.target.checked) b.prerrequisitos.push({ k: 'contacto' }); S.render(); } }), ' Requiere contacto')),
      ui.campo('Efecto', ui.area(b.efecto || '', v => { b.efecto = v; }, { rows: 6, 'data-foco': 'hb-pp-efecto' })),
      ui.campo('Riesgos', ui.area(b.riesgos || '', v => { b.riesgos = v; }, { rows: 2, 'data-foco': 'hb-pp-riesgos' }))
    ];
  }
  function formDisciplinaPsi(S, b) { return [h('div', { class: 'rejilla g3' }, nombreCampo(b)), h('p', { class: 'ayuda', text: 'Una disciplina nueva se puede elegir en la pestaña Poderes → Psiónica. Asígnala a tus poderes propios con su nombre exacto.' })]; }
  function formDefensaPsi(S, b) {
    const ops = [{ v: '', t: 'Sin poder asociado' }].concat(S.reg.poderesPsi.slice().sort((x, y) => x.nombre.localeCompare(y.nombre, "es")).map(p => ({ v: p.id, t: p.nombre })));
    return [h('div', { class: 'rejilla g3' }, nombreCampo(b), ui.campo('Poder asociado (muestra su texto)', ui.select(ops, b.poder || '', v => { b.poder = v; }, { 'data-foco': 'hb-pd-poder' }), 'ancho2'))];
  }

  function formPericia(S, b) {
    const cats = Object.entries(A.base.categoriasPericias);
    return [
      h('div', { class: 'rejilla g3' }, nombreCampo(b),
        ui.campo('Costo (PNA)', ui.numero(b.costo, v => { b.costo = Math.max(1, Math.round(U.num(v)) || 1); }, { min: 1, step: 1, 'data-foco': 'hb-pe-costo' })),
        ui.campo('Característica de la prueba', ui.select(['FUE', 'DES', 'CON', 'INT', 'SAB', 'CAR', 'FUE/CAR', 'NA', 'Especial'].map(v => ({ v, t: v === 'NA' ? 'NA (sin prueba)' : v })), b.car, v => { b.car = v; }, { 'data-foco': 'hb-pe-car' }))),
      h('div', { class: 'rejilla g3' },
        ui.campo('Modificador', ui.numero(b.mod, v => { b.mod = U.num(v); }, { step: 1, 'data-foco': 'hb-pe-mod' })),
        ui.campo('Fuente', ui.texto(b.fuente || '', v => { b.fuente = v; }, { 'data-foco': 'hb-pe-fuente', placeholder: 'Homebrew, manual, página…' })),
        ui.campo('Nombre en inglés (opcional)', ui.texto(b.ingles || '', v => { b.ingles = v; }, { 'data-foco': 'hb-pe-ing' }))),
      h('fieldset', { class: 'hb-cats' }, h('legend', { text: 'Categorías que la tienen sin recargo' }),
        h('div', { class: 'fila-edit' }, cats.map(([k, t]) => h('label', { class: 'casilla' },
          h('input', { type: 'checkbox', checked: (b.cats || []).includes(k) ? true : null, 'data-foco': 'hb-pe-c-' + k, onchange: e => { const s = new Set(b.cats || []); if (e.target.checked) s.add(k); else s.delete(k); b.cats = [...s]; } }), ' ' + t)))),
      ui.campo('Nota corta (opcional)', ui.texto(b.nota || '', v => { b.nota = v; }, { 'data-foco': 'hb-pe-nota' })),
      ui.campo('Descripción de la pericia', ui.area(b.descripcion || '', v => { b.descripcion = v; }, { rows: 6, 'data-foco': 'hb-pe-desc', placeholder: 'Qué permite hacer, cómo se usa, tiradas y límites…' }))
    ];
  }

  function formArmadura(S, b) {
    const num = (k, et) => ui.campo(et, ui.numero(b[k] === undefined ? '' : b[k], v => { b[k] = U.num(v); }, { min: 0, step: 1, 'data-foco': 'hb-ar-' + k }));
    return [
      h('div', { class: 'rejilla g3' }, nombreCampo(b),
        ui.campo('Categoría del peto (límite de DES)', ui.select([{ v: 'Ninguna', t: 'Ninguna (DES completo)' }, { v: 'Ligera', t: 'Ligera (DES completo)' }, { v: 'Media', t: 'Media (DES hasta −2 de CA)' }, { v: 'Pesada', t: 'Pesada (sin bono de DES)' }], b.clase, v => { b.clase = v; }, { 'data-foco': 'hb-ar-clase' }))),
      h('p', { class: 'ayuda', text: 'Protección que da cada pieza. "Completa" es la suma de peto, dos brazos y dos piernas, y se muestra al elegir el conjunto.' }),
      h('div', { class: 'rejilla g4' }, num('completa', 'Protección completa'), num('torso', 'Peto'), num('brazos2', 'Dos brazos'), num('brazo1', 'Un brazo')),
      h('div', { class: 'rejilla g4' }, num('piernas2', 'Dos piernas'), num('pierna1', 'Una pierna')),
      h('p', { class: 'ayuda', text: 'Opcional: con costo y peso (de la armadura completa, en kg) aparece en la Tienda y suma a la carga cuando la llevas puesta.' }),
      h('div', { class: 'rejilla g3' }, ui.campo('Costo (ej. 200 mo)', ui.texto(b.costo || '', v => { b.costo = v; }, { 'data-foco': 'hb-ar-costo', maxlength: 40 })),
        ui.campo('Peso de la completa (kg)', ui.numero(b.peso === undefined ? '' : b.peso, v => { b.peso = U.num(v); }, { min: 0, step: 'any', 'data-foco': 'hb-ar-peso' })))
    ];
  }

  function formObjetoTienda(S, b) {
    const cats = A.base.tienda.categorias, dest = ['Mochila', 'Transporte', 'Fortaleza', 'Propiedades', 'Servicio'];
    return [h('div', { class: 'rejilla g3' }, nombreCampo(b),
      ui.campo('Categoría', ui.select(cats.map(c => ({ v: c, t: c })), cats.includes(b.categoria) ? b.categoria : 'Equipo misceláneo', v => { b.categoria = v; }, { 'data-foco': 'hb-ot-cat' })),
      ui.campo('Destino sugerido', ui.select(dest.map(c => ({ v: c, t: c })), b.destino || 'Mochila', v => { b.destino = v; }, { 'data-foco': 'hb-ot-dest' }))),
      h('div', { class: 'rejilla g3' }, ui.campo('Costo (ej. 5 mo, 3 mp, 2 mpl)', ui.texto(b.coste || '', v => { b.coste = v; }, { 'data-foco': 'hb-ot-coste', maxlength: 40 })),
        ui.campo('Peso (kg)', ui.numero(b.peso === undefined ? '' : b.peso, v => { b.peso = v; }, { min: 0, step: 'any', 'data-foco': 'hb-ot-peso' }))),
      h('p', { class: 'ayuda', text: 'Las armas y armaduras homebrew ya aparecen solas en la Tienda; aquí agregas todo lo demás (equipo, animales, servicios, transporte…).' }),
      ui.campo('Notas', ui.area(b.notas || '', v => { b.notas = v; }, { rows: 3, 'data-foco': 'hb-ot-notas' }))];
  }
  function formDeidad(S, b) {
    const e = b.esferas = b.esferas && typeof b.esferas === 'object' ? b.esferas : { mayores: [], menores: [] };
    e.mayores = e.mayores || []; e.menores = e.menores || [];
    const marcas = cual => h('div', { class: 'checks' }, A.listaEsferas().map(x => h('label', { class: 'check' },
      h('input', { type: 'checkbox', checked: e[cual].includes(x.id), 'data-foco': `hb-di-${cual}-${x.id}`, onchange: ev => {
        const otro = cual === 'mayores' ? 'menores' : 'mayores';
        e[cual] = e[cual].filter(i => i !== x.id); if (ev.target.checked) { e[cual].push(x.id); e[otro] = e[otro].filter(i => i !== x.id); S.render(); }
      } }), ' ' + x.nombre)));
    return [h('div', { class: 'rejilla g3' }, nombreCampo(b)), notaCampo(b, 'Alineamiento y notas'),
      h('p', { class: 'ayuda', text: 'Las esferas de la deidad las toman los sacerdotes que la sigan (Conjuros → su clase → "Las de mi deidad"). Así se comparte un dios con todo su acervo en un paquete.' }),
      h('div', { class: 'campo' }, h('span', { class: 'campo-et', text: 'Esferas mayores' }), marcas('mayores')),
      h('div', { class: 'campo' }, h('span', { class: 'campo-et', text: 'Esferas menores (hasta nivel 3)' }), marcas('menores')),
      ui.campo('Poderes y habilidades especiales que otorga', ui.area(b.poderes || '', v => { b.poderes = v; }, { rows: 4, 'data-foco': 'hb-di-poderes', placeholder: 'Lo que da este dios a sus sacerdotes…' }))];
  }

  function formTabla(S, b) {
    const ayuda = { thaco: 'Un número por nivel, empezando en el nivel 1. Ejemplo: 20, 19, 18, 17…', xp: 'PX necesarios para cada nivel, empezando en el 1 (que suele ser 0). Ejemplo: 0, 2000, 4000…', salvaciones: 'Una línea por nivel con 5 números: PVM CVV PP AL CyO. Ejemplo: 14 16 15 17 17' }[b.tipoTabla];
    const existentes = Object.keys(S.reg.tablas[b.tipoTabla] || {});
    return [
      h('div', { class: 'rejilla g3' },
        ui.campo('Tipo', ui.select(Object.entries(TABLAS).map(([v, t]) => ({ v, t })), b.tipoTabla, v => { b.tipoTabla = v; S.render(); }, { 'data-foco': 'hb-tt', disabled: !!sel.id })),
        nombreCampo(b)),
      ui.campo('Copiar valores de otra tabla', ui.select([{ v: '', t: '— Elegir para copiar —' }].concat(existentes.map(n => ({ v: n, t: n }))), '', v => { if (v) { b.texto = tablaATexto(b.tipoTabla, S.reg.tabla(b.tipoTabla, v)); S.render(); } }, { 'data-foco': 'hb-copiar' })),
      h('p', { class: 'ayuda', text: ayuda }),
      ui.area(b.texto, v => { b.texto = v; }, { rows: b.tipoTabla === 'salvaciones' ? 14 : 5, class: 'codigo', 'data-foco': 'hb-texto', spellcheck: 'false', 'aria-label': 'Valores de la tabla' })
    ];
  }

  function formMagiaSalvaje(S, b) {
    const W = A.reglas.salvaje;
    if (b.matrizTxt === undefined) { b.matrizTxt = W.matrizATexto(b); b.resultadosTxt = (b.resultados || []).join('\n'); }
    return [
      h('div', { class: 'rejilla g3' }, nombreCampo(b)),
      h('p', { class: 'ayuda', text: 'Tabla 1 (variación de nivel): una línea por nivel, de 1 a 8 y 9+, con 20 números (el d20 del 1 al 20). Pon * junto al número que va en negrita (hay oleada salvaje). Ejemplo: +1* o -1*.' }),
      ui.area(b.matrizTxt, v => { b.matrizTxt = v; }, { rows: 10, class: 'codigo', 'data-foco': 'hb-ms-matriz', spellcheck: 'false', 'aria-label': 'Matriz de variación de nivel' }),
      h('p', { class: 'ayuda', text: 'Tabla 2 (oleadas): 100 líneas, una por resultado del d100 (la primera es el 1; el 00 es la última). Escribe las distancias en metros primero y pies entre paréntesis.' }),
      ui.area(b.resultadosTxt, v => { b.resultadosTxt = v; }, { rows: 16, class: 'codigo', 'data-foco': 'hb-ms-res', spellcheck: 'false', 'aria-label': 'Resultados de la oleada salvaje' })
    ];
  }

  function formDote(S, b) {
    return [h('div', { class: 'rejilla g3' }, nombreCampo(b),
      ui.campo('Grupo', ui.select(Object.entries(A.base.dotes.grupos).map(([v, t]) => ({ v, t })), b.grupo || 'combate', v => { b.grupo = v; }, { 'data-foco': 'hb-dt-grupo' })),
      ui.campo('Coste en puntos de dote (PD)', ui.numero(b.coste, v => { b.coste = U.num(v); }, { min: 1, max: 9, step: 1, 'data-foco': 'hb-dt-coste' }))),
      ui.campo('Efecto', ui.area(b.efecto || '', v => { b.efecto = v; }, { rows: 5, 'data-foco': 'hb-dt-efecto' }))];
  }
  function formDotesNacimiento(S, b) {
    const DT = A.reglas.dotes;
    if (b.filasTxt === undefined) { b.filasTxt = DT.filasATexto(b); b.mitTxt = DT.mitATexto(b); }
    return [h('div', { class: 'rejilla g3' }, nombreCampo(b)),
      h('p', { class: 'ayuda', text: 'Una dote por línea: "rango | nombre | efecto | acción". La acción es opcional y solo pone un recordatorio: psi, magia, heroica, divina o doble (tira dos veces). Los rangos deben cubrir del 1 al 100 sin huecos ni traslapes.' }),
      ui.area(b.filasTxt, v => { b.filasTxt = v; }, { rows: 14, class: 'codigo', 'data-foco': 'hb-dn-filas', spellcheck: 'false', 'aria-label': 'Dotes de nacimiento' }),
      h('p', { class: 'ayuda', text: 'Mitologías de Ascendencia Divina (opcional; si la usas, cubre del 1 al 100): "rango | nombre | dios 1, dios 2, …". Con N dioses, el dado del dios es 1dN.' }),
      ui.area(b.mitTxt, v => { b.mitTxt = v; }, { rows: 8, class: 'codigo', 'data-foco': 'hb-dn-mit', spellcheck: 'false', 'aria-label': 'Mitologías de ascendencia' })];
  }

  const formularios = { dote: formDote, dotesNacimiento: formDotesNacimiento, magiaSalvaje: formMagiaSalvaje, raza: formRaza, clase: formClase, kit: formKit, deidad: formDeidad, esfera: formEsfera, idioma: formIdioma, arma: formArma, armadura: formArmadura, objetoTienda: formObjetoTienda, pericia: formPericia, escuela: formEscuela, arte: formArte, creacion: formCreacion, conjuro: formConjuro, escuelaMagia: formEscuelaMagia, linaje: formLinaje, pacto: formPacto, poderPsi: formPoderPsi, disciplinaPsi: formDisciplinaPsi, defensaPsi: formDefensaPsi, variante: formVariante, tabla: formTabla };

  /* ---------------------------------------------------------------- listas y panel */
  function lista(S, t) {
    let hbItems, baseItems;
    if (t.id === 'tabla') {
      hbItems = []; baseItems = [];
      Object.keys(TABLAS).forEach(tt => {
        Object.keys(S.hb.tablas[tt] || {}).forEach(n => hbItems.push({ id: tt + '|' + n, nombre: n, extra: TABLAS[tt] }));
        Object.keys(A.base.tablas[tt]).forEach(n => baseItems.push({ id: tt + '|' + n, nombre: n, extra: TABLAS[tt] }));
      });
    } else {
      const todos = S.reg[t.plural];
      const claseNombre = id => (S.reg.clase(id) || {}).nombre || '';
      const f = x => ({ id: x.id, nombre: x.nombre, extra: t.id === 'kit' ? claseNombre(x.clase) : t.id === 'arma' ? x.grupo : t.id === 'variante' ? (S.reg.raza(x.raza) || {}).nombre || '' : '' });
      hbItems = todos.filter(x => x.origen === 'homebrew').map(f); baseItems = todos.filter(x => x.origen === 'base').map(f);
    }
    const boton = it => h('button', { type: 'button', class: 'item' + (sel && sel.tipo === t.id && sel.id === it.id ? ' activo' : ''), onclick: () => abrir(S, t.id, it.id) },
      h('span', { text: it.nombre }), it.extra ? h('small', { text: it.extra }) : null);
    return h('div', { class: 'hb-grupo' },
      h('div', { class: 'hb-grupo-cab' }, h('h3', { text: t.titulo }), ui.boton('+ ' + t.nueva, () => nuevo(S, t.id), 'chico')),
      hbItems.length ? h('div', { class: 'items' }, hbItems.map(boton)) : h('p', { class: 'vacio', text: 'Aún no tienes ' + t.titulo.toLowerCase() + ' propias.' }),
      baseItems.length ? (() => {
        const muchos = baseItems.length > 80, q = (filtroBase[t.id] || '').trim().toLowerCase();
        const vis = muchos ? baseItems.filter(x => !q || x.nombre.toLowerCase().includes(q)).slice(0, 60) : baseItems;
        const d = h('details', { class: 'base' }, h('summary', { text: `Base (${baseItems.length})` }),
          muchos ? h('div', { class: 'fila-edit' }, ui.texto(filtroBase[t.id] || '', v => { filtroBase[t.id] = v; S.render(); }, { placeholder: 'Buscar en la base…', 'aria-label': 'Buscar en la base de ' + t.titulo.toLowerCase(), 'data-foco': 'hb-fb-' + t.id })) : null,
          h('div', { class: 'items' }, vis.map(boton)), muchos && !q ? h('p', { class: 'meta', text: 'Se muestran los primeros 60: busca por nombre.' }) : null);
        d.open = baseAbiertas.has(t.id);
        d.addEventListener('toggle', () => { if (d.open) baseAbiertas.add(t.id); else baseAbiertas.delete(t.id); });
        return d;
      })() : null);
  }

  function editor(S) {
    if (!sel) return h('div', { class: 'hb-vacio' }, h('h2', { text: 'Elige algo para editar' }),
      h('p', { text: 'Crea algo con el botón + de la lista o abre uno existente. Lo base se duplica para modificarlo.' }),
      h('p', { class: 'ayuda', text: 'Los efectos que definas se aplican solos y se ven en "Todo lo que modifica tu ficha".' }));
    const t = TIPOS.find(x => x.id === sel.tipo), b = sel.borrador;
    const cuerpo = h('fieldset', { class: 'hb-form', disabled: sel.lectura }, formularios[sel.tipo](S, b));
    const esNuevo = !sel.id;
    return h('div', { class: 'hb-editor' },
      h('div', { class: 'hb-cab' }, h('h2', { text: (esNuevo ? 'Nuevo: ' : sel.lectura ? 'Base: ' : 'Editar: ') + (b.nombre || t.id) }),
        h('div', { class: 'hb-acciones' },
          sel.lectura || !esNuevo ? ui.boton('Duplicar como homebrew', () => duplicar(S), sel.lectura ? 'primario' : '') : null,
          !sel.lectura ? ui.boton(esNuevo ? 'Crear' : 'Guardar cambios', () => guardar(S), 'primario') : null,
          !sel.lectura && !esNuevo ? ui.boton('Eliminar', () => borrar(S), 'peligro') : null,
          ui.boton('Cerrar', () => { sel = null; error = ''; S.render(); }))),
      sel.lectura ? h('p', { class: 'ayuda', text: 'Es contenido base: no se modifica. Duplícalo para crear tu versión.' }) : null,
      error ? h('p', { class: 'error', role: 'alert', text: error }) : null,
      cuerpo,
      sel.tipo === 'raza' && sel.id ? variantesPropias(S, sel.id) : null);
  }

  /* Desde el menú de cualquier raza (también las base) se agregan y abren sus variantes homebrew. */
  function variantesPropias(S, razaId) {
    const mias = (S.hb.variantes || []).filter(v => v.raza === razaId);
    return h('section', { class: 'hb-variantes' },
      h('h3', { text: 'Variantes agregadas por ti' }),
      h('p', { class: 'ayuda', text: 'Se suman a las variantes de esta raza sin modificarla. Puedes exportarlas, compartirlas o borrarlas cuando quieras.' }),
      mias.length ? h('div', { class: 'items' }, mias.map(v => h('button', { type: 'button', class: 'item', onclick: () => abrir(S, 'variante', v.id) }, h('span', { text: v.nombre })))) : h('p', { class: 'vacio', text: 'Todavía no agregas variantes a esta raza.' }),
      ui.boton('+ Agregar variante', () => nuevaVarianteDe(S, razaId), 'chico', { 'data-foco': 'hb-add-var' }));
  }

  function herramientas(S) {
    const json = h('textarea', { class: 'codigo', rows: 14, spellcheck: 'false', 'aria-label': 'Biblioteca homebrew completa en JSON' });
    json.value = JSON.stringify(S.hb, null, 2);
    const msg = h('p', { class: 'ayuda' });
    return h('div', { class: 'hb-herr' },
      ui.boton('Importar paquete o personaje', () => {
        const f = h('input', { type: 'file', accept: '.json,application/json' });
        f.addEventListener('change', () => { const a = f.files[0]; if (!a) return; const r = new FileReader(); r.onload = () => { try { S.aviso(S.importarTexto(String(r.result))); } catch (e) { S.aviso(e.message, true); } }; r.readAsText(a); });
        f.click();
      }),
      ui.boton('Exportar mi biblioteca', () => { S.descargar('homebrew.adnd.json', A.exportarPaquete(S.hb)); S.aviso('Paquete exportado.'); }),
      h('details', { class: 'sub' }, h('summary', { text: 'Editar toda la biblioteca como JSON (avanzado)' }),
        h('p', { class: 'ayuda', text: 'Reemplaza tu biblioteca completa. Lo que no tenga el formato correcto se descarta.' }), json,
        ui.boton('Aplicar JSON', () => {
          try {
            const nuevo = A.sanear.paquete(JSON.parse(json.value));
            if (!confirm('Esto reemplaza toda tu biblioteca homebrew. ¿Continuar?')) return;
            S.cambiarHb(hb => { hb.razas = nuevo.razas; hb.clases = nuevo.clases; hb.kits = nuevo.kits; hb.deidades = nuevo.deidades; hb.armas = nuevo.armas; hb.armaduras = nuevo.armaduras; hb.pericias = nuevo.pericias; hb.escuelas = nuevo.escuelas; hb.artes = nuevo.artes; hb.creaciones = nuevo.creaciones; hb.conjuros = nuevo.conjuros; hb.escuelasMagia = nuevo.escuelasMagia; hb.esferas = nuevo.esferas; hb.linajes = nuevo.linajes; hb.pactos = nuevo.pactos; hb.poderesPsi = nuevo.poderesPsi; hb.disciplinasPsi = nuevo.disciplinasPsi; hb.defensasPsi = nuevo.defensasPsi; hb.magiaSalvaje = nuevo.magiaSalvaje; hb.dotes = nuevo.dotes; hb.dotesNacimiento = nuevo.dotesNacimiento; hb.objetosTienda = nuevo.objetosTienda; hb.variantes = nuevo.variantes; hb.idiomas = nuevo.idiomas; hb.tablas = nuevo.tablas; });
            sel = null; S.render(); S.aviso('Biblioteca reemplazada.');
          } catch (e) { msg.textContent = 'No es JSON válido: ' + e.message; }
        }), msg));
  }

  /* Desde Consulta: abre en Homebrew una copia editable de un elemento (base o propio). */
  function copiarDesdeConsulta(S, tipo, id) {
    if (!buscar(S, tipo, id)) return false;
    S.pestana = 'homebrew'; A.almacen.fijarPref('pestana', 'homebrew');
    abrir(S, tipo, id); duplicar(S); window.scrollTo({ top: 0 }); return true;
  }
  function abrirDesdeConsulta(S, tipo, id) {
    if (!buscar(S, tipo, id)) return false;
    S.pestana = 'homebrew'; A.almacen.fijarPref('pestana', 'homebrew'); abrir(S, tipo, id); window.scrollTo({ top: 0 }); return true;
  }
  ui.hb = { FAMILIAS, copiarDesdeConsulta, abrirDesdeConsulta, TIPOS, formArma, formArmadura, plantillaArma: () => plantillas.arma(), plantillaArmadura: () => plantillas.armadura() };
  ui.paneles.homebrew = S => {
    if (sel && !buscar(S, sel.tipo, sel.id || '') && sel.id) sel = null;   // el elemento ya no existe
    if (sel) familia = familiaDe(sel.tipo);
    const fam = FAMILIAS.find(f => f.id === familia) || FAMILIAS[0];
    const cuantos = f => f.tipos.reduce((n, id) => { const t = TIPOS.find(x => x.id === id); return n + (id === 'tabla' ? Object.values(S.hb.tablas).reduce((m, o) => m + Object.keys(o).length, 0) : S.hb[t.plural].length); }, 0);
    const barra = h('nav', { class: 'hb-fam', 'aria-label': 'Categorías de homebrew' }, FAMILIAS.map(f => {
      const n = cuantos(f);
      return h('button', { type: 'button', class: 'hb-fam-b' + (f.id === fam.id ? ' activo' : ''), 'aria-pressed': f.id === fam.id ? 'true' : 'false', 'data-foco': 'hb-fam-' + f.id,
        onclick: () => { familia = f.id; sel = null; error = ''; S.render(); } }, f.t, n ? h('small', { text: String(n) }) : null);
    }), h('details', { class: 'hb-herr-d' }, h('summary', { text: 'Importar y exportar' }), herramientas(S)));
    return h('div', { class: 'hb' }, barra,
      h('div', { class: 'hb-cuerpo' },
        h('aside', { class: 'hb-lado' }, fam.tipos.map(id => lista(S, TIPOS.find(t => t.id === id)))),
        h('div', { class: 'hb-centro' }, editor(S))));
  };
})(window.ADND);
