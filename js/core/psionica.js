/* Psiónica: clase Psiónico y talento salvaje. Sin DOM, pura y probable en Node. La hoja solo lleva el control; las tiradas las hacen la mesa y el DM.
   - PSP del Psiónico: base por SAB (15→20, 16→22, 17→24, 18 o más→26) + ajuste de INT + ajuste de CON + (nivel − 1) × (10 + ajuste de SAB). Ajuste: 16=+1, 17=+2, 18 o más=+3.
   - Elecciones por nivel (tabla 1–30): disciplinas, ciencias, devociones y modos defensivos. La primera disciplina es la primaria. Se avisa (no se bloquea) de lo que incumple las reglas.
   - Poderes: puntuación de poder calculada con tu atributo, costo de inicio, mantenimiento (lista de poderes activos que cobra con el tiempo) y recuperación por hora según la actividad.
   - Talento salvaje: cualquier personaje. Potencial = 1% + SAB/INT/CON + nivel (×½ una vez si es mago, sacerdote o no humano). Tablas 12 y 13 (d100). PSP del talento = Σ(inicio + 4 × mantenimiento) + 4 por nivel ganado después de despertarlo. */
(function (A) {
  'use strict';
  const R = A.reglas, num = A.util.num;
  const PS = (R.psionica = {});
  const P = () => A.base.psionica;
  const nivelDe = (items, id) => items.filter(x => x.clase.id === id).reduce((m, x) => Math.max(m, x.nivel), 0);
  const norm = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
  const UNIDAD_MIN = { round: 1, turno: 10, hora: 60, 'día': 1440 };

  PS.ajuste = v => { v = Math.round(num(v)); return v >= 18 ? 3 : v === 17 ? 2 : v === 16 ? 1 : 0; };
  PS.baseSab = v => { v = Math.round(num(v)); return v >= 18 ? 26 : v === 17 ? 24 : v === 16 ? 22 : v === 15 ? 20 : 0; };
  PS.prog = n => { n = Math.max(0, Math.min(30, Math.round(num(n)))); return n ? P().prog[n].slice() : [0, 0, 0, 0]; };
  PS.pspMax = (nivel, sab, int, con) => (nivel > 0 ? PS.baseSab(sab) + PS.ajuste(int) + PS.ajuste(con) + (nivel - 1) * (10 + PS.ajuste(sab)) : 0);

  /* Puntuación de poder: el atributo menos el modificador del poder. */
  PS.objetivo = (poder, car) => {
    if (!poder.puntuacion) return null;
    const t = car[poder.puntuacion.car] ? Math.round(num(car[poder.puntuacion.car].total)) : 0;
    return { car: poder.puntuacion.car, mod: poder.puntuacion.mod, atributo: t, valor: t + poder.puntuacion.mod };
  };

  /* Los poderes de la biblioteca (base + homebrew), por id. */
  const poder = (reg, id) => reg.poderPsi(id);
  const info = (reg, id) => poder(reg, id) || { id, nombre: id, faltante: true, disc: '', tipo: 'devocion', prerrequisitos: [], costo: null };

  /* Tabla 12 / 13 del talento salvaje: la fila del d100 (00 = 100). */
  PS.salvajeBuscar = (tabla, d100) => {
    const n = Math.round(num(d100)) === 0 ? 100 : Math.round(num(d100));
    if (!(n >= 1 && n <= 100)) return null;
    const t = P().salvaje[tabla === 'cien' ? 'cien' : 'dev'];
    const fila = t.find(x => n >= x.de && n <= x.a);
    return fila ? { n, tabla: tabla === 'cien' ? 'cien' : 'dev', r: fila.r, rango: [fila.de, fila.a] } : null;
  };
  PS.potencialSalvaje = (car, nivel, noHumano, claseX) => {
    const b = { sab: PS.ajuste(car.SAB.total), int: PS.ajuste(car.INT.total), con: PS.ajuste(car.CON.total), nivel: nivel >= 9 ? 2 : nivel >= 5 ? 1 : 0 };
    const bruto = 1 + b.sab + b.int + b.con + b.nivel, mitad = !!(noHumano || claseX);
    return { bonos: b, bruto, mitad, final: mitad ? Math.ceil(bruto / 2) : bruto };
  };
  /* Costo de un poder para el talento: inicio + 4 mantenimientos (los costos que son nombres de otros poderes no cuentan). */
  const costoTalento = p => { const ini = p.costo === null || p.costo === undefined ? 0 : num(p.costo); const m = p.mantenimiento ? num(p.mantenimiento.n) : (num(String(p.mant || '').match(/\d+/)) || 0); return { ini, man: m, total: ini + (m > 0 ? 4 * m : 0) }; };

  /* Requisitos de un poder: se evalúan contra los poderes que ya tienes (solo avisan). */
  const reqTexto = (r, reg) => (r.k === 'nivel' ? `nivel ${r.v}` : r.k === 'contacto' ? 'contacto' : r.k === 'disciplina' ? r.v : r.k === 'alternativa' ? r.v.map(x => reqTexto(x, reg)).join(' o ') : r.k === 'poder' ? ((poder(reg, r.v) || {}).nombre || r.nombre || r.v) : r.v);

  PS.resumen = (pj, reg, items, car) => {
    const st = pj.psionica, t = st.talento, lv = nivelDe(items, 'psionico'), avisos = [];
    const sab = Math.round(num(car.SAB.total)), int = Math.round(num(car.INT.total)), con = Math.round(num(car.CON.total));
    const prog = PS.prog(lv), lim = { disciplinas: prog[0], ciencias: prog[1], devociones: prog[2], defensas: prog[3] };
    const disciplinas = reg.disciplinasPsi, nombreDisc = id => (disciplinas.find(x => x.id === id) || { nombre: id }).nombre;
    const pspBase = PS.pspMax(lv, sab, int, con), pspTotal = Math.max(0, pspBase + Math.round(num(st.bonoPsp))), gastados = Math.min(st.gastados, pspTotal);

    const todos = id => info(reg, id);
    const ciencias = st.ciencias.map(todos), devociones = st.devociones.map(todos);
    const conoceIds = new Set([...st.ciencias, ...st.devociones]);
    const tal = t.activo ? t.poderes.map(x => Object.assign({ origen: x.origen }, todos(x.id))) : [];
    const talIds = new Set(tal.map(x => x.id));
    const reqEstado = (p, extraIds) => p.prerrequisitos.map(r => {
      const hecho = r.k === 'nivel' ? lv >= r.v || Math.max(0, ...items.map(x => x.nivel)) >= r.v : r.k === 'poder' ? conoceIds.has(r.v) || extraIds.has(r.v) : r.k === 'disciplina' ? st.disciplinas.includes((disciplinas.find(d => d.nombre === r.v) || {}).id) : r.k === 'alternativa' ? r.v.some(x => x.k === 'poder' && (conoceIds.has(x.v) || extraIds.has(x.v))) : null;
      return { texto: reqTexto(r, reg), cumplido: hecho, tipo: r.k };
    });
    const conObjetivo = p => Object.assign({}, p, { objetivo: p.faltante ? null : PS.objetivo(p, car) });

    /* ---- validación de elecciones del Psiónico ---- */
    if (lv) {
      if (sab < 15 || int < 12 || con < 11) avisos.push('Psiónico: no cumples los requisitos de la clase (SAB 15, INT 12 y CON 11).');
      if (st.disciplinas.length > lim.disciplinas) avisos.push(`Psiónico: tienes ${st.disciplinas.length} disciplinas y a tu nivel te tocan ${lim.disciplinas}.`);
      if (ciencias.length > lim.ciencias) avisos.push(`Psiónico: tienes ${ciencias.length} ciencias y a tu nivel te tocan ${lim.ciencias}.`);
      if (devociones.length > lim.devociones) avisos.push(`Psiónico: tienes ${devociones.length} devociones y a tu nivel te tocan ${lim.devociones}.`);
      if (st.defensas.length > lim.defensas) avisos.push(`Psiónico: tienes ${st.defensas.length} modos defensivos y a tu nivel te tocan ${lim.defensas}.`);
      if (!st.disciplinas.length && (ciencias.length || devociones.length)) avisos.push('Psiónico: elige tus disciplinas; la primera es la primaria.');
      const porDisc = id => ({ c: ciencias.filter(p => !p.faltante && p.disc === nombreDisc(id)).length, d: devociones.filter(p => !p.faltante && p.disc === nombreDisc(id)).length });
      const prim = st.disciplinas[0] ? porDisc(st.disciplinas[0]) : null;
      st.disciplinas.forEach((id, i) => {
        const x = porDisc(id);
        if (x.c && x.d < x.c * 2) avisos.push(`${nombreDisc(id)}: necesita al menos ${x.c * 2} devociones para ${x.c} ciencia(s).`);
        if (i > 0 && prim) {
          if (x.c > 0 && x.c >= prim.c) avisos.push(`${nombreDisc(id)} no puede igualar las ciencias de la disciplina primaria (${nombreDisc(st.disciplinas[0])}).`);
          if (x.d > 0 && x.d >= prim.d) avisos.push(`${nombreDisc(id)} no puede igualar las devociones de la disciplina primaria (${nombreDisc(st.disciplinas[0])}).`);
        }
      });
      [...ciencias, ...devociones].forEach(p => {
        if (p.faltante) { avisos.push(`Un poder psiónico ya no existe en tu biblioteca (${p.id}).`); return; }
        if (!st.disciplinas.map(nombreDisc).includes(p.disc)) avisos.push(`Psiónico: "${p.nombre}" es de ${p.disc}, que no está entre tus disciplinas.`);
        reqEstado(p, talIds).filter(r => r.cumplido === false).forEach(r => avisos.push(`Psiónico: "${p.nombre}" pide ${r.texto}.`));
      });
    }
    const dispDisc = reg.defensasPsi;
    const defensas = st.defensas.map(id => { const d = dispDisc.find(x => x.id === id); return d ? Object.assign({}, d, { poderData: d.poder ? poder(reg, d.poder) : null }) : { id, nombre: id, faltante: true }; });

    /* ---- poderes activos (mantenimiento) ---- */
    const activos = st.activos.map((a, i) => { const p = todos(a.id); return Object.assign({ i }, a, { poder: p, porRound: a.n * (UNIDAD_MIN.round / (UNIDAD_MIN[a.u] || 1)) }); });
    const porRound = activos.filter(a => !a.t).reduce((s, a) => s + a.porRound, 0), porRoundTalento = activos.filter(a => a.t).reduce((s, a) => s + a.porRound, 0);

    /* ---- talento salvaje ---- */
    const nivelPj = Math.max(1, ...items.map(x => x.nivel), 1);
    const noHumano = !!(pj.raza && pj.raza.id && pj.raza.id !== 'humano');
    const claseX = items.some(x => ['mago', 'sacerdote', 'sacerdote_sp'].includes(x.clase.id));
    const pot = PS.potencialSalvaje(car, nivelPj, noHumano, claseX);
    const filas = tal.map(p => Object.assign({}, p, { costoT: p.faltante ? { ini: 0, man: 0, total: 0 } : costoTalento(p) }));
    const base = filas.reduce((s, p) => s + p.costoT.total, 0), posteriores = Math.max(0, nivelPj - Math.max(1, num(t.nivelInicio))), bonoNiv = posteriores * 4;
    const pfpMax = base + bonoNiv, pfpGast = Math.min(t.gastados, pfpMax);
    const comoReq = []; const vistos = new Set([...talIds]);
    tal.forEach(p => p.prerrequisitos && p.prerrequisitos.forEach(r => { const ls = r.k === 'poder' ? [r] : r.k === 'alternativa' ? r.v.filter(x => x.k === 'poder') : []; ls.forEach(x => { if (!vistos.has(x.v)) { vistos.add(x.v); comoReq.push(info(reg, x.v)); } }); }));
    const talento = {
      activo: t.activo, nivelInicio: t.nivelInicio, nivelActual: nivelPj, potencial: pot, noHumano, claseX,
      poderes: filas.map(conObjetivo), comoRequisito: comoReq,
      pfp: { base, niveles: bonoNiv, posteriores, max: pfpMax, gastados: pfpGast, restan: pfpMax - pfpGast },
      notas: t.notas, secuelas: t.secuelas
    };
    const miosCien = ciencias.map(conObjetivo), miosDev = devociones.map(conObjetivo);
    const disponibles = id => reg.poderesPsi.filter(p => p.disc === nombreDisc(id));
    return {
      id: 'psionica', nivel: lv, activo: lv > 0 || st.disciplinas.length > 0 || st.ciencias.length > 0 || st.devociones.length > 0 || t.activo || st.activos.length > 0,
      psionico: lv > 0, stats: { sab, int, con, ajusteSab: PS.ajuste(sab), ajusteInt: PS.ajuste(int), ajusteCon: PS.ajuste(con), baseSab: PS.baseSab(sab) },
      limites: lim, psp: { base: pspBase, bono: Math.round(num(st.bonoPsp)), total: pspTotal, gastados, restan: pspTotal - gastados }, motivo: st.motivo,
      disciplinas: st.disciplinas.map(id => ({ id, nombre: nombreDisc(id), primaria: id === st.disciplinas[0], faltante: !disciplinas.some(d => d.id === id) })),
      disciplinasLista: disciplinas, defensasLista: dispDisc, ciencias: miosCien.map(p => Object.assign({ req: p.faltante ? [] : reqEstado(p, talIds) }, p)), devociones: miosDev.map(p => Object.assign({ req: p.faltante ? [] : reqEstado(p, talIds) }, p)), defensas,
      activos, porRound, porRoundTalento, recuperacion: P().recup, talento, disponibles: id => disponibles(id), notas: st.notas, secuelas: st.secuelas, avisos
    };
  };

  /* ------------------------------------------------------------------ acciones (devuelven un texto si no se pudo) */
  const acc = (PS.acc = {});
  const E = pj => pj.psionica, T = pj => pj.psionica.talento;
  acc.gastar = (pj, rs, n) => { const c = Math.max(0, Math.round(num(n))); if (rs.psp.restan < c) return `Te quedan ${rs.psp.restan} PSP y cuesta ${c}.`; E(pj).gastados = rs.psp.gastados + c; return null; };
  acc.gastados = (pj, v) => { E(pj).gastados = Math.max(0, Math.round(num(v))); return null; };
  acc.bono = (pj, v) => { E(pj).bonoPsp = Math.max(-999, Math.min(999, Math.round(num(v)))); return null; };
  acc.motivo = (pj, t) => { E(pj).motivo = String(t || '').slice(0, 300); return null; };
  acc.notas = (pj, t) => { E(pj).notas = String(t || '').slice(0, 4000); return null; };
  acc.disciplina = (pj, reg, rs, id, on) => {
    const st = E(pj);
    if (on) { if (!reg.disciplinasPsi.some(d => d.id === id)) return 'Esa disciplina no existe.'; if (st.disciplinas.includes(id)) return null; if (st.disciplinas.length >= Math.max(rs.limites.disciplinas, 0) && rs.psionico) return `A tu nivel solo te tocan ${rs.limites.disciplinas} disciplina(s).`; st.disciplinas.push(id); }
    else st.disciplinas = st.disciplinas.filter(x => x !== id);
    return null;
  };
  acc.primaria = (pj, id) => { const st = E(pj); if (!st.disciplinas.includes(id)) return 'Elige primero esa disciplina.'; st.disciplinas = [id].concat(st.disciplinas.filter(x => x !== id)); return null; };
  const lista = { ciencia: 'ciencias', devocion: 'devociones' };
  acc.aprender = (pj, reg, rs, id) => {
    const p = poder(reg, id); if (!p) return 'Ese poder no existe.';
    const k = lista[p.tipo], st = E(pj);
    if (st[k].includes(id)) return 'Ya conoces ese poder.';
    if (rs.psionico && st[k].length >= rs.limites[k]) return `A tu nivel solo te tocan ${rs.limites[k]} ${k === 'ciencias' ? 'ciencia(s)' : 'devoción(es)'}.`;
    const dis = reg.disciplinasPsi.find(d => d.nombre === p.disc);
    if (rs.psionico && dis && !st.disciplinas.includes(dis.id)) return `${p.disc} no está entre tus disciplinas.`;
    st[k].push(id); return null;
  };
  acc.olvidar = (pj, id) => { const st = E(pj); st.ciencias = st.ciencias.filter(x => x !== id); st.devociones = st.devociones.filter(x => x !== id); st.activos = st.activos.filter(a => a.id !== id); return null; };
  acc.defensa = (pj, rs, id, on) => {
    const st = E(pj);
    if (on) { if (st.defensas.includes(id)) return null; if (rs.psionico && st.defensas.length >= rs.limites.defensas) return `A tu nivel solo te tocan ${rs.limites.defensas} modo(s) defensivo(s).`; st.defensas.push(id); }
    else st.defensas = st.defensas.filter(x => x !== id);
    return null;
  };
  /* Usar un poder: paga su costo de inicio (si no tiene costo numérico se indica a mano). */
  acc.usar = (pj, reg, rs, id, costo) => {
    const p = poder(reg, id); if (!p) return 'Ese poder no existe.';
    const c = costo === undefined || costo === null || costo === '' ? (p.costo === null ? 0 : p.costo) : Math.max(0, Math.round(num(costo)));
    return acc.gastar(pj, rs, c);
  };
  /* Mantener un poder: n PSP por unidad de tiempo (por defecto el del manual). */
  acc.mantener = (pj, reg, id, n, u, esTalento) => {
    const p = poder(reg, id); if (!p) return 'Ese poder no existe.';
    const st = E(pj); if (st.activos.some(a => a.id === id && !!a.t === !!esTalento)) return 'Ya lo estás manteniendo.';
    const base = p.mantenimiento || { n: 0, u: 'round' }, cn = n === undefined || n === null || n === '' ? base.n : Math.max(0, Math.round(num(n))), cu = UNIDAD_MIN[u] ? u : base.u;
    if (st.activos.length >= 60) return 'Demasiados poderes activos.';
    st.activos.push({ id, n: cn, u: cu, reloj: 0, t: !!esTalento }); return null;
  };
  acc.soltar = (pj, i) => { E(pj).activos.splice(i, 1); return null; };
  acc.ajustarMant = (pj, i, n, u) => { const a = E(pj).activos[i]; if (!a) return null; a.n = Math.max(0, Math.round(num(n))); if (UNIDAD_MIN[u]) a.u = u; return null; };
  /* Pasa el tiempo (minutos de juego: round = 1, turno = 10, hora = 60): cobra cada mantenimiento por cada unidad completa transcurrida. */
  acc.pasar = (pj, rs, minutos, esTalento) => {
    const st = E(pj), m = Math.max(0, Math.round(num(minutos))); let total = 0;
    st.activos.filter(a => !!a.t === !!esTalento).forEach(a => { const um = UNIDAD_MIN[a.u] || 1; a.reloj = num(a.reloj) + m; const veces = Math.floor(a.reloj / um); a.reloj -= veces * um; total += veces * a.n; });
    const bolsa = esTalento ? rs.talento.pfp : rs.psp, falta = total - bolsa.restan;
    if (esTalento) T(pj).gastados = Math.min(bolsa.max, bolsa.gastados + total); else st.gastados = Math.min(bolsa.total, bolsa.gastados + total);
    return falta > 0 ? `El mantenimiento cuesta ${total} PSP y solo tenías ${bolsa.restan}: te quedas sin PSP (faltan ${falta}). Suelta poderes.` : null;
  };
  /* Recuperación: PSP por hora según la actividad. */
  PS.recuperacion = (actividad, horas) => { const a = P().recup.find(x => x.id === actividad) || P().recup[3]; return { actividad: a, horas: Math.max(0, num(horas)), psp: Math.floor(a.hora * Math.max(0, num(horas))) }; };
  acc.recuperar = (pj, rs, actividad, horas) => { const r = PS.recuperacion(actividad, horas); E(pj).gastados = Math.max(0, rs.psp.gastados - r.psp); return null; };
  acc.secuelaAgregar = pj => { const l = E(pj).secuelas; if (l.length < 40) l.push({ texto: '' }); return null; };
  acc.secuelaTexto = (pj, i, t) => { const s = E(pj).secuelas[i]; if (s) s.texto = String(t || '').slice(0, 300); return null; };
  acc.secuelaQuitar = (pj, i) => { E(pj).secuelas.splice(i, 1); return null; };

  /* Talento salvaje */
  acc.talentoActivo = (pj, on) => { T(pj).activo = !!on; return null; };
  acc.talentoNivel = (pj, v) => { T(pj).nivelInicio = Math.max(1, Math.min(99, Math.round(num(v)) || 1)); return null; };
  acc.talentoPoder = (pj, reg, id, origen) => {
    const p = poder(reg, id); if (!p) return 'Ese poder no existe.';
    const t = T(pj); if (t.poderes.some(x => x.id === id)) return 'Ya tienes ese poder.';
    if (t.poderes.length >= 60) return 'Demasiados poderes.';
    t.poderes.push({ id, origen: String(origen || '').slice(0, 60) }); return null;
  };
  acc.talentoQuitar = (pj, id) => { T(pj).poderes = T(pj).poderes.filter(x => x.id !== id); E(pj).activos = E(pj).activos.filter(a => a.id !== id); return null; };
  acc.talentoGastar = (pj, rs, n) => { const c = Math.max(0, Math.round(num(n))); if (rs.talento.pfp.restan < c) return `Te quedan ${rs.talento.pfp.restan} PSP del talento y cuesta ${c}.`; T(pj).gastados = rs.talento.pfp.gastados + c; return null; };
  acc.talentoUsar = (pj, reg, rs, id, costo) => {
    const p = poder(reg, id); if (!p) return 'Ese poder no existe.';
    return acc.talentoGastar(pj, rs, costo === undefined || costo === null || costo === '' ? (p.costo === null ? 0 : p.costo) : costo);
  };
  acc.talentoRecuperar = (pj, rs, actividad, horas) => { const r = PS.recuperacion(actividad, horas); T(pj).gastados = Math.max(0, rs.talento.pfp.gastados - r.psp); return null; };
  acc.talentoGastados = (pj, v) => { T(pj).gastados = Math.max(0, Math.round(num(v))); return null; };
  acc.talentoNotas = (pj, t) => { T(pj).notas = String(t || '').slice(0, 4000); return null; };
  acc.talentoSecuelaAgregar = pj => { const l = T(pj).secuelas; if (l.length < 40) l.push({ texto: '' }); return null; };
  acc.talentoSecuelaTexto = (pj, i, t) => { const s = T(pj).secuelas[i]; if (s) s.texto = String(t || '').slice(0, 300); return null; };
  acc.talentoSecuelaQuitar = (pj, i) => { T(pj).secuelas.splice(i, 1); return null; };
})((typeof window !== 'undefined' ? window : globalThis).ADND);
