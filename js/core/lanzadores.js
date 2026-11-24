/* Lanzadores con tabla propia: bardo (arcano, con libro) y sacerdotes, druida, paladín y explorador (divinos, con esferas).
   - Espacios por nivel de conjuro según la tabla de la clase; los divinos suman los conjuros adicionales de SAB (acumulativos: cada fila hasta tu SAB aporta
     un espacio del nivel que indica; solo se usa si ya tienes espacios de ese nivel, si no queda pendiente) y los espacios extra del juego (±).
   - Memorización (el mismo conjuro se puede repetir; los reversibles se pueden invertir) o, opcionalmente, puntos de conjuro (cada espacio vale su nivel).
   - Divinos: no usan libro; preparan cualquier conjuro de sus esferas (mayores hasta el nivel máximo de la clase; menores hasta el 3).
     Las esferas fijas de la clase se amplían con las que elijas a mano o con las de tu deidad (Homebrew). */
(function (A) {
  'use strict';
  const R = A.reglas, num = A.util.num, CJ = R.conjuros;
  const NIV = 9, ceros = () => new Array(NIV).fill(0);
  const norm = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
  const nivelDe = (items, id) => items.filter(x => x.clase.id === id).reduce((m, x) => Math.max(m, x.nivel), 0);

  CJ.lanzadores = () => A.base.lanzadores || [];
  CJ.lanzador = id => CJ.lanzadores().find(x => x.id === id) || null;

  /* Esferas de un conjuro divino: se leen del texto ("Elemental (Agua, Aire), Adivinación"). Un conjuro propio puede traer `esferas`. */
  const cacheEsf = new Map(); let cacheVer = null;
  CJ.esferasDe = sp => {
    if (Array.isArray(sp.esferas)) return sp.esferas;
    if (cacheVer !== A.esferasActuales) { cacheEsf.clear(); cacheVer = A.esferasActuales; }
    const clave = sp.id + '|' + (sp.esfera || ''); if (cacheEsf.has(clave)) return cacheEsf.get(clave);
    const validas = new Set(A.listaEsferas().map(e => e.id)), out = [], txt = String(sp.esfera || '');
    let prof = 0, cur = ''; const toks = [];
    for (const ch of txt) { if (ch === '(') prof++; if (ch === ')') prof--; if (ch === ',' && prof === 0) { toks.push(cur); cur = ''; } else cur += ch; }
    toks.push(cur);
    toks.forEach(t => {
      const m = t.match(/^\s*elemental\s*\((.*)\)\s*$/i), g = t.match(/^\s*([^(]+?)\s*\((.*)\)\s*$/);
      (m ? m[1].split(',').map(x => 'elemental-' + norm(x)) : g ? [norm(g[1])].concat(g[2].split(',').map(norm)) : [norm(t)]).forEach(id => { if (validas.has(id) && !out.includes(id)) out.push(id); });
    });
    cacheEsf.set(clave, out); return out;
  };
  CJ.nombreEsfera = id => { const e = A.listaEsferas().find(x => x.id === id); return e ? e.nombre : id; };

  /* Conjuros adicionales por SAB: se acumulan las filas 1..SAB. Devuelve cuántos espacios extra hay por nivel de conjuro (9) y el % de fallo. */
  CJ.bonoSab = car => {
    const t = A.base.caracteristicas.SAB, puntaje = Math.max(0, Math.min(25, Math.round(num(car && car.SAB && car.SAB.total))));
    const por = ceros();
    for (let k = 1; k <= puntaje; k++) {
      const v = t[String(k)] && t[String(k)]['Conjuros adicionales'];
      String(v === null || v === undefined ? 0 : v).split(',').map(x => Math.round(num(x))).filter(n => n >= 1 && n <= NIV).forEach(n => { por[n - 1]++; });
    }
    const fila = t[String(puntaje)];
    return { por, puntaje, fallo: fila ? Math.round(num(fila['Fallo conjuro']) * 100) : 0 };
  };

  /* Esferas con las que cuenta este personaje en esa clase. */
  CJ.esferasClase = (def, st, deidad) => {
    const may = new Set(def.mayores || []), men = new Set(def.menores || []);
    const usaDeidad = st.fuente === 'deidad' && deidad && deidad.esferas;
    const src = usaDeidad ? deidad.esferas : st.esferas;
    (src.mayores || []).forEach(x => may.add(x)); (src.menores || []).forEach(x => men.add(x));
    may.forEach(x => men.delete(x));
    return { mayores: [...may], menores: [...men] };
  };
  CJ.enAcceso = (sp, acceso, top) => {
    if (sp.tipo !== 'divino' || sp.nv > top) return false;
    const e = CJ.esferasDe(sp);
    return e.some(x => acceso.mayores.includes(x)) || (sp.nv <= 3 && e.some(x => acceso.menores.includes(x)));
  };

  const info = (reg, id) => reg.conjuro(id) || { id, nombre: id, faltante: true, nv: 0, escuelas: [], rev: false };

  CJ.resumenClase = (pj, reg, items, car, def, avisos) => {
    const st = pj.conjuros.clases[def.id], lv = nivelDe(items, def.id), divino = def.tipo === 'divino';
    const tabla = lv > 0 ? def.tabla[Math.min(30, lv)].slice() : ceros();
    let top = 0; tabla.forEach((v, i) => { if (v > 0) top = i + 1; });
    const sab = divino ? CJ.bonoSab(car) : { por: ceros(), puntaje: 0, fallo: 0 };
    const aplicados = tabla.map((v, i) => (v > 0 ? sab.por[i] : 0)), pendientes = tabla.map((v, i) => (v > 0 ? 0 : sab.por[i]));
    const juego = tabla.map((_, i) => Math.round(num(st.extraEspacios[i + 1])));
    const total = tabla.map((v, i) => Math.max(0, v + aplicados[i] + juego[i]));
    const puntosTotal = Math.max(0, total.reduce((s, v, i) => s + v * (i + 1), 0) + Math.round(num(st.bonoPuntos)));
    const gastados = Math.min(st.gastados, puntosTotal);
    const deidad = divino && pj.identidad ? reg.deidad(pj.identidad.deidad) : null;
    const acceso = divino ? CJ.esferasClase(def, st, deidad) : null;
    const fila = car && car.INT && car.INT.fila ? car.INT.fila : null;
    const baseAprender = !divino && fila ? Math.round(num(fila['Aprender conjuro']) * 100) : 0;
    const nivelINT = !divino && fila ? Math.round(num(fila['Nivel conjuro'])) : 0, maxLibro = !divino && fila ? Math.round(num(fila['Máx. conjuros'])) : 0;
    const libro = def.libro ? st.libro.map(id => info(reg, id)) : [];
    const mem = st.memorizados.map((x, i) => Object.assign({ i }, x, { sp: info(reg, x.id) }));
    const act = lv > 0 || st.libro.length > 0 || st.memorizados.length > 0;
    const niveles = [];
    for (let n = 1; n <= NIV; n++) {
      const delNivel = mem.filter(x => x.sp.nv === n), lib = libro.filter(x => x.nv === n), usados = delNivel.filter(x => x.usado).length;
      if (!total[n - 1] && !delNivel.length && !lib.length && !pendientes[n - 1]) continue;
      niveles.push({ n, base: tabla[n - 1], sab: aplicados[n - 1], pendiente: pendientes[n - 1], bono: juego[n - 1], total: total[n - 1], memorizados: delNivel, preparados: delNivel.length, faltan: Math.max(0, total[n - 1] - delNivel.length), usados, disponibles: delNivel.length - usados, libro: lib, exceso: delNivel.length > total[n - 1] });
      if (delNivel.length > total[n - 1]) avisos.push(`${def.nombre}: memorizas ${delNivel.length} conjuros de nivel ${n} y solo tienes ${total[n - 1]} espacio(s).`);
      if (def.libro && maxLibro && lib.length > maxLibro) avisos.push(`${def.nombre}: tu libro tiene ${lib.length} conjuros de nivel ${n}; tu INT permite ${maxLibro}.`);
    }
    if (def.libro) libro.forEach(sp => { if (sp.faltante) avisos.push(`Un conjuro del libro de ${def.nombre} ya no existe en tu biblioteca (${sp.id}).`); else if (lv && sp.nv > top) avisos.push(`${def.nombre}: "${sp.nombre}" es de nivel ${sp.nv} y aún solo alcanzas el nivel ${top}.`); });
    if (divino) mem.forEach(x => { if (!x.sp.faltante && !CJ.enAcceso(x.sp, acceso, Math.max(top, x.sp.nv))) avisos.push(`${def.nombre}: "${x.sp.nombre}" ya no está en tus esferas.`); });
    if (divino && lv && sab.fallo) avisos.push(`${def.nombre}: tu SAB (${sab.puntaje}) da ${sab.fallo}% de fallo de conjuro.`);
    return {
      id: def.id, nombre: def.nombre, tipo: def.tipo, libroPropio: !!def.libro, nivel: lv, activo: act, top, modo: st.modo, base: tabla, aplicados, pendientes, bonoEspacios: juego, espacios: total, niveles,
      totalPreparados: mem.length, totalEspacios: total.reduce((s, v) => s + v, 0), puntos: { total: puntosTotal, gastados, restan: puntosTotal - gastados }, bonoPuntos: Math.round(num(st.bonoPuntos)), motivo: st.motivo,
      sab: sab.por, sabPuntaje: sab.puntaje, fallo: sab.fallo, libro: libro.map(sp => Object.assign({}, sp, { aprender: sp.faltante ? 0 : baseAprender })), baseAprender, nivelINT, maxLibro,
      acceso, fijas: { mayores: def.mayores || [], menores: def.menores || [] }, fuente: st.fuente, deidad: deidad ? { id: deidad.id, nombre: deidad.nombre, esferas: deidad.esferas || null, poderes: deidad.poderes || '' } : null, notas: st.notas
    };
  };
  CJ.resumenClases = (pj, reg, items, car, avisos) => { const o = {}; CJ.lanzadores().forEach(d => { o[d.id] = CJ.resumenClase(pj, reg, items, car, d, avisos); }); return o; };

  /* ------------------------------------------------------------------ acciones (devuelven un texto si no se pudo) */
  const cl = (CJ.cl = {});
  const E = (pj, id) => pj.conjuros.clases[id];
  cl.modo = (pj, id, modo) => { E(pj, id).modo = modo === 'puntos' ? 'puntos' : 'memorizar'; return null; };
  cl.bono = (pj, id, v) => { E(pj, id).bonoPuntos = Math.max(-99, Math.min(99, Math.round(num(v)))); return null; };
  cl.motivo = (pj, id, t) => { E(pj, id).motivo = String(t || '').slice(0, 300); return null; };
  cl.notas = (pj, id, t) => { E(pj, id).notas = String(t || '').slice(0, 4000); return null; };
  cl.gastados = (pj, id, v) => { E(pj, id).gastados = Math.max(0, Math.round(num(v))); return null; };
  cl.extra = (pj, id, n, v) => { const o = E(pj, id).extraEspacios, x = Math.max(-9, Math.min(9, Math.round(num(v)))); if (x) o[n] = x; else delete o[n]; return null; };
  cl.fuente = (pj, id, f) => { E(pj, id).fuente = f === 'deidad' ? 'deidad' : 'manual'; return null; };
  cl.esfera = (pj, id, cual, esf, on) => {
    const e = E(pj, id).esferas, otro = cual === 'mayores' ? 'menores' : 'mayores';
    if (!A.esferaValida(esf)) return 'Esa esfera no existe.';
    e[cual] = e[cual].filter(x => x !== esf); if (on) { e[cual].push(esf); e[otro] = e[otro].filter(x => x !== esf); }
    return null;
  };
  cl.aprender = (pj, reg, rs, id, spId) => {
    const def = CJ.lanzador(id), sp = reg.conjuro(spId), st = E(pj, id), r = rs.clases[id];
    if (!def || !def.libro) return 'Esa clase no usa libro de conjuros.';
    if (!sp || sp.tipo !== 'arcano') return 'Ese conjuro no existe o no es arcano.';
    if (st.libro.includes(spId)) return 'Ya está en tu libro.';
    if (r.nivel && sp.nv > r.top) return `Aún no alcanzas el nivel ${sp.nv} de conjuro (llegas al ${r.top}).`;
    if (r.nivelINT && sp.nv > r.nivelINT) return `Tu INT solo permite aprender conjuros hasta el nivel ${r.nivelINT}.`;
    st.libro.push(spId); return null;
  };
  cl.olvidar = (pj, id, spId) => { const st = E(pj, id); st.libro = st.libro.filter(x => x !== spId); st.memorizados = st.memorizados.filter(x => x.id !== spId); return null; };
  const sePuede = (rs, id, sp) => {
    const def = CJ.lanzador(id), r = rs.clases[id], st = r;
    if (!sp) return 'Ese conjuro no existe.';
    if (sp.tipo !== def.tipo) return `Un ${def.nombre.toLowerCase()} lanza conjuros ${def.tipo === 'divino' ? 'divinos' : 'arcanos'}.`;
    if (def.libro) return null;
    return CJ.enAcceso(sp, st.acceso, Math.max(r.top, sp.nv)) ? null : 'Ese conjuro no está en tus esferas.';
  };
  cl.memorizar = (pj, reg, rs, id, spId, inv) => {
    const def = CJ.lanzador(id), st = E(pj, id), sp = reg.conjuro(spId), r = rs.clases[id];
    const m = sePuede(rs, id, sp); if (m) return m;
    if (def.libro && !st.libro.includes(spId)) return 'Primero agrégalo a tu libro.';
    if (!def.libro && r.top && sp.nv > r.top && !r.espacios[sp.nv - 1]) return `Aún no llegas al nivel ${sp.nv} de conjuro.`;
    const n = r.niveles.find(x => x.n === sp.nv);
    if (!n || n.total < 1) return `No tienes espacios de nivel ${sp.nv}.`;
    if (n.preparados >= n.total) return `Ya llenaste tus ${n.total} espacio(s) de nivel ${sp.nv}.`;
    st.memorizados.push({ id: spId, inv: !!(inv && sp.rev), usado: false }); return null;
  };
  cl.desmemorizar = (pj, id, i) => { E(pj, id).memorizados.splice(i, 1); return null; };
  cl.usar = (pj, id, i) => { const x = E(pj, id).memorizados[i]; if (x) x.usado = !x.usado; return null; };
  cl.invertir = (pj, reg, id, i) => { const x = E(pj, id).memorizados[i], sp = x && reg.conjuro(x.id); if (x && sp && sp.rev) x.inv = !x.inv; return null; };
  cl.lanzarPuntos = (pj, reg, rs, id, spId) => {
    const sp = reg.conjuro(spId), def = CJ.lanzador(id), st = E(pj, id), r = rs.clases[id];
    const m = sePuede(rs, id, sp); if (m) return m;
    if (def.libro && !st.libro.includes(spId)) return 'Ese conjuro no está en tu libro.';
    if (r.puntos.restan < sp.nv) return `Te quedan ${r.puntos.restan} punto(s) y cuesta ${sp.nv}.`;
    st.gastados = r.puntos.gastados + sp.nv; return null;
  };
})((typeof window !== 'undefined' ? window : globalThis).ADND);
