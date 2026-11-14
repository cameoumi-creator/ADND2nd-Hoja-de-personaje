/* Dotes (regla opcional, se activa por personaje). Motor puro, sin DOM.
   - Puntos de dote (PD): 1 al empezar y +1 en los niveles 3, 6, 9, 12… (el ritmo de los espacios de pericia). Cada dote cuesta su "coste" en PD.
   - Humano: una dote de coste 1 gratis, aparte del presupuesto.
   - Nacimiento: se consulta una tabla d100 (varias tiradas se acumulan; el 100 pide tirar dos veces). Ascendencia Divina: d100 de mitología y d(N) del dios.
   - La ficha SOLO marca: no modifica números. Todo incumplimiento es un aviso, nunca un bloqueo. */
(function (A) {
  'use strict';
  const U = A.util, R = A.reglas, D = (R.dotes = {});
  const GRUPOS = ['combate', 'magia', 'fe', 'sigilo', 'mente'], ACCIONES = ['psi', 'magia', 'heroica', 'divina', 'doble'];

  D.pdTotal = nivel => 1 + Math.floor(Math.max(1, U.num(nivel) || 1) / 3);
  D.pdSiguiente = nivel => { const n = Math.max(1, Math.floor(U.num(nivel)) || 1); return Math.floor(n / 3) * 3 + 3; };

  /* d100 (00 = 100) → fila de la tabla de nacimiento, o null. */
  D.filaPorTirada = (tabla, n) => {
    if (n === '' || n === null || n === undefined) return null;
    let d = Math.floor(Number(n)); if (d === 0) d = 100;
    return (tabla && tabla.filas || []).find(f => d >= f.desde && d <= f.hasta) || null;
  };
  D.mitPorTirada = (tabla, m) => {
    if (m === '' || m === null || m === undefined) return null;
    let d = Math.floor(Number(m)); if (d === 0) d = 100;
    return (tabla && tabla.mitologias || []).find(x => d >= x.desde && d <= x.hasta) || null;
  };
  D.dios = (mit, d) => { const n = Math.floor(Number(d)); return mit && n >= 1 && n <= mit.dioses.length ? mit.dioses[n - 1] : null; };

  /* ---- resumen: lo que la hoja necesita para mostrar el módulo ---- */
  D.resumen = (pj, reg, nivel) => {
    const st = pj.dotes || {}, avisos = [], humanoRaza = pj.raza && pj.raza.id === 'humano';
    const tabla = reg.tablaNacimiento(st.tabla);
    const total = D.pdTotal(nivel);
    const comprados = (st.comprados || []).map(id => { const d = reg.dote(id); return d ? Object.assign({}, d, { eleccion: (st.elecciones || {})[id] || '' }) : { id, nombre: 'Dote que ya no existe', coste: 0, grupo: '', efecto: '', faltante: true, eleccion: '' }; });
    const gastados = comprados.reduce((a, d) => a + d.coste, 0);
    if (gastados > total) avisos.push(`Dotes: llevas ${gastados} PD y a nivel ${nivel} te tocan ${total}.`);
    comprados.filter(d => d.faltante).forEach(() => avisos.push('Una dote de tu lista ya no existe en la biblioteca.'));
    let humano = null;
    if (st.humano) {
      const d = reg.dote(st.humano);
      humano = d ? Object.assign({}, d, { eleccion: (st.elecciones || {})[d.id] || '' }) : { id: st.humano, nombre: 'Dote que ya no existe', coste: 0, efecto: '', faltante: true, eleccion: '' };
      if (!humanoRaza) avisos.push('La dote de humano solo aplica a personajes humanos.');
      else if (d && d.coste !== 1) avisos.push(`La dote de humano debe ser de coste 1 ("${d.nombre}" cuesta ${d.coste}).`);
      if (d && comprados.some(c => c.id === d.id)) avisos.push(`"${d.nombre}" está como dote de humano y también comprada.`);
    }
    const filas = (st.nacimiento || []).map((f, i) => {
      const porN = D.filaPorTirada(tabla, f.n), fila = porN || (f.id ? reg.doteNacimiento(f.id) : null);
      return { i, n: f.n, id: f.id, fila, eleccion: fila ? (st.elecciones || {})[fila.id] || '' : '' };
    });
    if (filas.some(f => f.n !== '' && !f.fila)) avisos.push('Una tirada de nacimiento no cae en la tabla: va de 1 a 100 (00 = 100).');
    const vistas = new Set();
    filas.forEach(f => { if (f.fila) { if (vistas.has(f.fila.id)) avisos.push(`Dote de nacimiento repetida: "${f.fila.nombre}".`); vistas.add(f.fila.id); } });
    const dobles = filas.filter(f => f.fila && f.fila.accion === 'doble').length;
    if (dobles && filas.filter(f => f.fila && f.fila.accion !== 'doble').length < dobles * 2) avisos.push('Sacaste el 100: agrega dos tiradas más (si vuelve a salir 100, se ignora).');
    const tiene = acc => filas.some(f => f.fila && f.fila.accion === acc);
    const dv = st.divina || {}, mitManual = (tabla && tabla.mitologias || []).find(x => x.id === dv.mito) || null;
    const mit = D.mitPorTirada(tabla, dv.m) || mitManual, dios = D.dios(mit, dv.d);
    return {
      activo: !!st.activo, nivel, tabla, tablas: reg.dotesNacimiento, humanoRaza, humano, comprados, notas: st.notas || '',
      pd: { total, gastados, restan: total - gastados, siguiente: D.pdSiguiente(nivel) },
      nacimiento: filas, tiene: { divina: tiene('divina'), heroica: tiene('heroica'), psi: tiene('psi'), magia: tiene('magia') },
      divina: { m: dv.m, mito: mit, mitId: mit ? mit.id : '', d: dv.d, dios, nota: dv.nota || '' },
      heroica: st.heroica === '' || st.heroica === undefined ? null : { d6: st.heroica, stat: A.STATS[st.heroica - 1] },
      avisos
    };
  };

  /* ---- acciones: reciben el personaje y devuelven null o un mensaje de error ---- */
  const acc = (D.acc = {});
  const E = pj => (pj.dotes = pj.dotes || A.normalizarPersonaje({}).dotes);
  acc.activo = (pj, v) => { E(pj).activo = !!v; return null; };
  acc.tabla = (pj, id) => { E(pj).tabla = String(id || ''); return null; };
  acc.comprar = (pj, reg, id) => {
    const e = E(pj), d = reg.dote(id); if (!d) return 'Esa dote no existe.';
    if (e.comprados.includes(id)) return 'Ya tienes esa dote.';
    e.comprados.push(id); return null;
  };
  acc.quitar = (pj, id) => { const e = E(pj); e.comprados = e.comprados.filter(x => x !== id); return null; };
  acc.humano = (pj, id) => { E(pj).humano = String(id || ''); return null; };
  acc.eleccion = (pj, id, txt) => { const e = E(pj); if (String(txt || '')) e.elecciones[id] = String(txt); else delete e.elecciones[id]; return null; };
  acc.nacTirada = (pj, i, n) => { const f = E(pj).nacimiento[i]; if (!f) return null; const v = String(n).trim() === '' ? '' : Math.round(Number(n)); f.n = Number.isFinite(v) && v >= 0 && v <= 100 ? v : ''; if (f.n !== '') f.id = ''; return null; };
  acc.nacDote = (pj, i, id) => { const f = E(pj).nacimiento[i]; if (f) { f.id = String(id || ''); if (f.id) f.n = ''; } return null; };
  acc.nacAgregar = pj => { const e = E(pj); if (e.nacimiento.length >= 8) return 'Ya tienes 8 tiradas.'; e.nacimiento.push({ n: '', id: '' }); return null; };
  acc.nacQuitar = (pj, i) => { E(pj).nacimiento.splice(i, 1); return null; };
  acc.divina = (pj, campo, v) => {
    const d = E(pj).divina;
    if (campo === 'm') { const n = String(v).trim() === '' ? '' : Math.round(Number(v)); d.m = Number.isFinite(n) && n >= 0 && n <= 100 ? n : ''; if (d.m !== '') d.mito = ''; }
    else if (campo === 'mito') { d.mito = String(v || ''); if (d.mito) d.m = ''; }
    else if (campo === 'd') { const n = String(v).trim() === '' ? '' : Math.round(Number(v)); d.d = Number.isFinite(n) && n >= 1 && n <= 99 ? n : ''; }
    else if (campo === 'nota') d.nota = String(v || '');
    return null;
  };
  acc.heroica = (pj, v) => { const n = String(v).trim() === '' ? '' : Math.round(Number(v)); E(pj).heroica = Number.isFinite(n) && n >= 1 && n <= 6 ? n : ''; return null; };
  acc.notas = (pj, v) => { E(pj).notas = String(v || ''); return null; };

  /* ---- texto <-> tabla de nacimiento (editor homebrew) ----
     Filas:      "1-4 | Nombre | efecto | accion"   (accion opcional: psi, magia, heroica, divina, doble)
     Mitologías: "1-8 | Nombre | dios 1, dios 2, …" */
  const rango = (a, b) => (a === b ? String(a) : `${a}-${b}`);
  D.filasATexto = t => t.filas.map(f => `${rango(f.desde, f.hasta)} | ${f.nombre} | ${f.efecto}${f.accion ? ' | ' + f.accion : ''}`).join('\n');
  D.mitATexto = t => (t.mitologias || []).map(m => `${rango(m.desde, m.hasta)} | ${m.nombre} | ${m.dioses.join(', ')}`).join('\n');
  const parteRango = (txt, n) => {
    const m = /^(\d+)\s*(?:[-–]\s*(\d+))?$/.exec(txt.trim()); if (!m) throw new Error(`Línea ${n}: el rango "${txt.trim()}" no es válido (usa 1-4 o 100).`);
    const a = +m[1], b = +(m[2] || m[1]); if (a < 1 || b > 100 || a > b) throw new Error(`Línea ${n}: el rango ${a}-${b} debe estar entre 1 y 100.`);
    return [a, b];
  };
  const cubre = (items, que) => {
    let prev = 0; items.forEach(x => { if (x.desde !== prev + 1) throw new Error(`${que}: ${x.desde > prev + 1 ? `falta cubrir del ${prev + 1} al ${x.desde - 1}` : `se traslapa en el ${x.desde}`}.`); prev = x.hasta; });
    if (prev !== 100) throw new Error(`${que}: debe terminar en el 100 (llega al ${prev}).`);
  };
  D.filasDeTexto = texto => {
    const filas = String(texto || '').split(/\n/).map(l => l.trim()).filter(Boolean).map((l, i) => {
      const p = l.split('|').map(x => x.trim()); if (p.length < 3) throw new Error(`Línea ${i + 1}: usa "rango | nombre | efecto".`);
      const [desde, hasta] = parteRango(p[0], i + 1); if (!p[1]) throw new Error(`Línea ${i + 1}: falta el nombre.`);
      const accion = (p[3] || '').toLowerCase(); if (accion && !ACCIONES.includes(accion)) throw new Error(`Línea ${i + 1}: la acción "${accion}" no existe (${ACCIONES.join(', ')}).`);
      return { desde, hasta, nombre: p[1], efecto: p[2], accion };
    });
    if (!filas.length) throw new Error('Escribe al menos una fila.');
    cubre(filas, 'Dotes de nacimiento'); return filas;
  };
  D.mitDeTexto = texto => {
    const l = String(texto || '').split(/\n/).map(x => x.trim()).filter(Boolean); if (!l.length) return [];
    const m = l.map((x, i) => {
      const p = x.split('|').map(y => y.trim()); if (p.length < 3) throw new Error(`Mitología, línea ${i + 1}: usa "rango | nombre | dios 1, dios 2".`);
      const [desde, hasta] = parteRango(p[0], i + 1), dioses = p[2].split(',').map(y => y.trim()).filter(Boolean);
      if (!p[1] || !dioses.length) throw new Error(`Mitología, línea ${i + 1}: falta el nombre o los dioses.`);
      return { desde, hasta, nombre: p[1], dioses };
    });
    cubre(m, 'Mitologías'); return m;
  };

  /* ---- saneado ---- */
  A.sanear = A.sanear || {};
  A.sanear.dote = d => {
    d = d || {};
    return { id: String(d.id || U.idNuevo('hb-dote', d.nombre)), nombre: String(d.nombre || '').trim(), grupo: GRUPOS.includes(d.grupo) ? d.grupo : 'combate', coste: Math.max(1, Math.min(9, Math.round(U.num(d.coste)) || 1)), efecto: String(d.efecto || '') };
  };
  A.sanear.dotesNacimiento = t => {
    t = t || {};
    const rg = x => { const a = Math.round(U.num(x.desde)), b = Math.round(U.num(x.hasta)); return a >= 1 && b <= 100 && a <= b ? [a, b] : null; };
    const filas = (Array.isArray(t.filas) ? t.filas : []).filter(Boolean).map(f => { const r = rg(f), nombre = String(f.nombre || '').trim(); return r && nombre ? { desde: r[0], hasta: r[1], id: String(f.id || 'dn-' + U.slug(nombre)), nombre, efecto: String(f.efecto || ''), accion: ACCIONES.includes(f.accion) ? f.accion : '' } : null; }).filter(Boolean);
    const mitologias = (Array.isArray(t.mitologias) ? t.mitologias : []).filter(Boolean).map(m => { const r = rg(m), nombre = String(m.nombre || '').trim(), dioses = (Array.isArray(m.dioses) ? m.dioses : []).map(x => String(x).trim()).filter(Boolean); return r && nombre && dioses.length ? { id: String(m.id || 'mit-' + U.slug(nombre)), nombre, desde: r[0], hasta: r[1], dioses } : null; }).filter(Boolean);
    return { id: String(t.id || U.idNuevo('hb-nacimiento', t.nombre)), nombre: String(t.nombre || '').trim(), filas, mitologias };
  };
})(ADND);
