/* Conjuros arcanos. Sin DOM, pura y probable en Node.
   - Mago: espacios por nivel de conjuro (tabla por nivel de personaje), libro de conjuros (tope por INT), memorización
     (el mismo conjuro puede repetirse) y, opcionalmente, puntos de conjuro: cada espacio vale tantos puntos como su nivel.
   - Especialista (escuela de magia con "especialista"): +1 espacio por nivel de conjuro (de su escuela), escuelas prohibidas,
     ±15% al aprender y bonos a las salvaciones; poderes de nivel 8/11/14 y magia salvaje prohibida bajo el interruptor de reglas opcionales.
   - Hechicero: lanzador espontáneo con puntos (2 por nivel de personaje; cada conjuro cuesta su nivel), un linaje que le da
     2 conjuros por nivel de conjuro y 2 conjuros elegidos más por nivel; los niveles de conjuro se abren como en la tabla del mago. */
(function (A) {
  'use strict';
  const R = A.reglas, num = A.util.num;
  const CJ = (R.conjuros = {});
  const ESP = () => A.base.espaciosMago;
  const NIV = 9;

  /* Espacios del mago de ese nivel: arreglo de 9 (nivel de conjuro 1..9). */
  CJ.espaciosMago = lv => (lv > 0 ? ESP()[Math.min(30, Math.max(1, lv))].slice() : new Array(NIV).fill(0));
  CJ.nivelMax = lv => { const e = CJ.espaciosMago(lv); let t = 0; e.forEach((v, i) => { if (v > 0) t = i + 1; }); return t; };
  const nivelDe = (items, id) => items.filter(x => x.clase.id === id).reduce((m, x) => Math.max(m, x.nivel), 0);

  /* Escuela de especialidad y sus prohibiciones (con las de las reglas opcionales si están activas). */
  CJ.especialidad = (reg, mago) => {
    const e = mago.escuela ? reg.escuelaMagia(mago.escuela) : null;
    if (!e || !e.especialista) return null;
    const s = e.especialista, prohibidas = (s.prohibidas || []).slice();
    if (mago.opcionales && e.id !== 'salvaje' && !prohibidas.includes('salvaje')) prohibidas.push('salvaje');
    return { id: e.id, nombre: e.nombre, nombreEspecialista: s.nombre, prohibidas, poderes: s.poderes || [], rasgos: s.rasgos || [], extra: s.extra !== false,
      aprender: Object.assign({ propio: 15, otras: -15 }, s.aprender), salv: Object.assign({ propio: 1, ajeno: -1 }, s.salv) };
  };
  /* ¿Puede el mago aprender este conjuro? Un conjuro que pertenece también a la escuela de especialidad siempre se puede. */
  CJ.prohibido = (esp, sp) => !!esp && !sp.escuelas.includes(esp.id) && sp.escuelas.some(x => esp.prohibidas.includes(x));
  const esDeEsp = (esp, sp) => !!esp && sp.escuelas.includes(esp.id);
  CJ.aprenderPct = (base, esp, sp) => {
    if (CJ.prohibido(esp, sp)) return 0;
    const aj = !esp ? 0 : esDeEsp(esp, sp) ? esp.aprender.propio : esp.aprender.otras;
    return Math.max(0, Math.min(100, Math.round(base + aj)));
  };

  const info = (reg, id) => {
    const sp = reg.conjuro(id); if (!sp) return { id, nombre: id, faltante: true, nv: 0, escuelas: [], rev: false };
    return sp;
  };

  CJ.resumen = (pj, reg, items, car) => {
    const C = pj.conjuros, m = C.mago, h = C.hechicero;
    const lvM = nivelDe(items, 'mago'), lvH = nivelDe(items, 'hechicero');
    const fila = car && car.INT && car.INT.fila ? car.INT.fila : null;
    const baseAprender = fila ? Math.round(num(fila['Aprender conjuro']) * 100) : 0;
    const nivelINT = fila ? Math.round(num(fila['Nivel conjuro'])) : 0, maxLibro = fila ? Math.round(num(fila['Máx. conjuros'])) : 0;
    const avisos = [];

    /* ---------------- mago ---------------- */
    const esp = CJ.especialidad(reg, m);
    const tabla = CJ.espaciosMago(lvM), top = CJ.nivelMax(lvM);
    const bonoEsp = tabla.map((_, i) => Math.round(num(m.extraEspacios[i + 1])));
    const slots = tabla.map((v, i) => Math.max(0, v + bonoEsp[i]));          // espacios libres: tabla + extras del juego
    const extra = tabla.map(v => (esp && esp.extra && v > 0 ? 1 : 0));        // el de especialidad
    const puntosBase = slots.reduce((s, v, i) => s + (v + extra[i]) * (i + 1), 0), puntosTotal = Math.max(0, puntosBase + Math.round(num(m.bonoPuntos)));
    const libro = m.libro.map(id => info(reg, id));
    const mem = m.memorizados.map((x, i) => Object.assign({ i }, x, { sp: info(reg, x.id) }));
    const niveles = [];
    for (let n = 1; n <= NIV; n++) {
      const total = slots[n - 1] + extra[n - 1];
      const delNivel = mem.filter(x => x.sp.nv === n);
      const noEsp = delNivel.filter(x => !esDeEsp(esp, x.sp)).length;
      const usados = delNivel.filter(x => x.usado).length;
      const lib = libro.filter(x => x.nv === n);
      if (!total && !lib.length && !delNivel.length) continue;
      niveles.push({ n, base: slots[n - 1], bono: bonoEsp[n - 1], extra: extra[n - 1], total, memorizados: delNivel, preparados: delNivel.length, faltan: Math.max(0, total - delNivel.length), usados, disponibles: delNivel.length - usados, libre: Math.max(0, slots[n - 1] - noEsp), libro: lib, maxLibro,
        exceso: delNivel.length > total || noEsp > slots[n - 1] });
      if (delNivel.length > total) avisos.push(`Mago: memorizas ${delNivel.length} conjuros de nivel ${n} y solo tienes ${total} espacio(s).`);
      else if (noEsp > slots[n - 1]) avisos.push(`Mago: el espacio extra de nivel ${n} debe ser de ${esp ? esp.nombre : 'tu escuela'}.`);
      if (maxLibro && lib.length > maxLibro) avisos.push(`Mago: tu libro tiene ${lib.length} conjuros de nivel ${n}; tu INT permite ${maxLibro}.`);
    }
    libro.forEach(sp => {
      if (sp.faltante) avisos.push(`Un conjuro del libro ya no existe en tu biblioteca (${sp.id}).`);
      else if (CJ.prohibido(esp, sp)) avisos.push(`Mago: "${sp.nombre}" es de una escuela prohibida para tu especialidad.`);
      else if (lvM && sp.nv > top) avisos.push(`Mago: "${sp.nombre}" es de nivel ${sp.nv} y aún solo alcanzas el nivel ${top}.`);
    });
    const gastados = Math.min(m.gastados, puntosTotal);
    const mago = {
      nivel: lvM, activo: lvM > 0 || m.libro.length > 0 || !!m.escuela, top, modo: m.modo, escuela: m.escuela, especialidad: esp, opcionales: !!m.opcionales,
      espacios: slots, extra, bonoEspacios: bonoEsp, bonoPuntos: Math.round(num(m.bonoPuntos)), motivo: m.motivo, niveles, libro: libro.map(sp => Object.assign({}, sp, { aprender: sp.faltante ? 0 : CJ.aprenderPct(baseAprender, esp, sp), prohibido: !sp.faltante && CJ.prohibido(esp, sp), deEsp: !sp.faltante && esDeEsp(esp, sp) })),
      baseAprender, nivelINT, maxLibro, puntos: { total: puntosTotal, gastados, restan: puntosTotal - gastados },
      rasgos: esp ? esp.rasgos : [], aprenderEsp: esp ? esp.aprender : null, salvEsp: esp ? esp.salv : null,
      poderes: esp ? esp.poderes.map(p => ({ nivel: p.nivel, texto: p.texto, activo: !!m.opcionales && lvM >= p.nivel, deAlcance: lvM >= p.nivel })) : [],
      escuelasEsp: reg.escuelasMagia.filter(e => e.especialista).map(e => ({ id: e.id, nombre: e.nombre, especialista: e.especialista.nombre })),
      totalPreparados: mem.length, totalEspacios: slots.reduce((s, v, i) => s + v + extra[i], 0)
    };

    /* ---------------- hechicero ---------------- */
    const linaje = h.linaje ? reg.linaje(h.linaje) : null;
    const topH = CJ.nivelMax(lvH), puntosH = Math.max(0, 2 * lvH + Math.round(num(h.bonoPuntos))), gastadosH = Math.min(h.gastados, puntosH);
    const hNiveles = [];
    for (let n = 1; n <= NIV; n++) {
      const abierto = n <= topH;
      const destinados = linaje && abierto ? (linaje.conjuros[n - 1] || []).map(x => Object.assign({ costo: n, inv: !!x.inv, destinado: true }, { sp: info(reg, x.id) })) : [];
      const elegidos = h.elegidos.map(id => info(reg, id)).filter(sp => sp.nv === n).map(sp => ({ sp, costo: n, elegido: true }));
      const extraE = Math.round(num(h.extraElegidos[n])), maxE = 2 + extraE;
      if (!abierto && !elegidos.length && !extraE) continue;
      hNiveles.push({ n, abierto, destinados, elegidos, extra: extraE, maximo: maxE, libres: Math.max(0, maxE - elegidos.length) });
      if (elegidos.length > maxE) avisos.push(`Hechicero: tienes ${elegidos.length} conjuros elegidos de nivel ${n}; el máximo es ${maxE}.`);
      if (!abierto && elegidos.length) avisos.push(`Hechicero: aún no abres el nivel ${n} de conjuro.`);
    }
    h.elegidos.forEach(id => { if (!reg.conjuro(id)) avisos.push(`Hechicero: un conjuro elegido ya no existe en tu biblioteca (${id}).`); });
    const conocidos = []; hNiveles.forEach(x => { x.destinados.forEach(d => conocidos.push(Object.assign({ n: x.n }, d))); x.elegidos.forEach(e => conocidos.push(Object.assign({ n: x.n }, e))); });
    const hechicero = {
      nivel: lvH, activo: lvH > 0 || !!h.linaje || h.elegidos.length > 0, top: topH, linaje: linaje ? { id: linaje.id, nombre: linaje.nombre, desc: linaje.desc } : null, linajes: reg.linajes.map(x => ({ id: x.id, nombre: x.nombre })),
      habilidades: linaje ? linaje.habilidades.map(x => Object.assign({}, x, { activa: lvH >= x.nivel })) : [], niveles: hNiveles, conocidos,
      puntos: { total: puntosH, gastados: gastadosH, restan: puntosH - gastadosH }, bonoPuntos: Math.round(num(h.bonoPuntos)), motivo: h.motivo, extraElegidos: h.extraElegidos
    };
    if (lvH && !linaje) avisos.push('Hechicero: elige un linaje.');
    const clases = CJ.resumenClases ? CJ.resumenClases(pj, reg, items, car, avisos) : {};
    const brujo = CJ.resumenBrujo ? CJ.resumenBrujo(pj, reg, items, car, avisos) : null;
    return { mago, hechicero, clases, brujo, avisos };
  };

  /* ------------------------------------------------------------------ acciones (devuelven un texto si no se pudo) */
  const acc = (CJ.acc = {});
  const M = pj => pj.conjuros.mago, H = pj => pj.conjuros.hechicero;
  const arcano = (reg, id) => { const sp = reg.conjuro(id); return sp && sp.tipo === 'arcano' ? sp : null; };

  acc.escuela = (pj, id) => { M(pj).escuela = String(id || ''); return null; };
  acc.opcionales = (pj, v) => { M(pj).opcionales = !!v; return null; };
  acc.modo = (pj, modo) => { M(pj).modo = modo === 'puntos' ? 'puntos' : 'memorizar'; return null; };
  /* lvMago y nivelINT/ maxLibro vienen del resumen para no recalcular aquí. */
  acc.aprender = (pj, reg, rs, id) => {
    const sp = arcano(reg, id); if (!sp) return 'Ese conjuro no existe o no es arcano.';
    const m = M(pj); if (m.libro.includes(id)) return 'Ya está en tu libro.';
    const esp = CJ.especialidad(reg, m);
    if (CJ.prohibido(esp, sp)) return `Un ${esp.nombreEspecialista.toLowerCase()} no puede aprender conjuros de esa escuela.`;
    if (rs.mago.nivel && sp.nv > rs.mago.top) return `Aún no alcanzas el nivel ${sp.nv} de conjuro (llegas al ${rs.mago.top}).`;
    if (rs.mago.nivelINT && sp.nv > rs.mago.nivelINT) return `Tu INT solo permite aprender conjuros hasta el nivel ${rs.mago.nivelINT}.`;
    m.libro.push(id); return null;
  };
  acc.olvidar = (pj, id) => { const m = M(pj); m.libro = m.libro.filter(x => x !== id); m.memorizados = m.memorizados.filter(x => x.id !== id); return null; };
  acc.memorizar = (pj, reg, rs, id, inv) => {
    const m = M(pj), sp = reg.conjuro(id); if (!sp) return 'Ese conjuro no existe.';
    if (!m.libro.includes(id)) return 'Primero agrégalo a tu libro.';
    const n = rs.mago.niveles.find(x => x.n === sp.nv);
    if (!n || n.total < 1) return `No tienes espacios de nivel ${sp.nv}.`;
    const esp = rs.mago.especialidad, deEsp = esDeEsp(esp, sp);
    if (n.preparados >= n.total) return `Ya llenaste tus ${n.total} espacio(s) de nivel ${sp.nv}.`;
    if (!deEsp && n.libre < 1) return `El espacio libre de nivel ${sp.nv} que queda es el extra: debe ser de ${esp.nombre}.`;
    m.memorizados.push({ id, inv: !!(inv && sp.rev), usado: false }); return null;
  };
  acc.desmemorizar = (pj, i) => { M(pj).memorizados.splice(i, 1); return null; };
  acc.usar = (pj, i) => { const x = M(pj).memorizados[i]; if (x) x.usado = !x.usado; return null; };
  acc.invertir = (pj, reg, i) => { const x = M(pj).memorizados[i], sp = x && reg.conjuro(x.id); if (x && sp && sp.rev) x.inv = !x.inv; return null; };
  acc.descansar = pj => {
    M(pj).memorizados.forEach(x => { x.usado = false; }); M(pj).gastados = 0; H(pj).gastados = 0;
    Object.values(pj.conjuros.clases || {}).forEach(c => { c.memorizados.forEach(x => { x.usado = false; }); c.gastados = 0; });
    if (pj.conjuros.brujo) pj.conjuros.brujo.preparados.forEach(x => { x.usado = false; });   // los puntos de pacto no se recuperan al descansar: se piden al patrón
    return null;
  };
  /* Puntos del mago: lanzar un conjuro del libro cuesta su nivel. */
  acc.lanzarPuntos = (pj, reg, rs, id) => {
    const sp = reg.conjuro(id); if (!sp || !M(pj).libro.includes(id)) return 'Ese conjuro no está en tu libro.';
    if (rs.mago.puntos.restan < sp.nv) return `Te quedan ${rs.mago.puntos.restan} punto(s) y cuesta ${sp.nv}.`;
    M(pj).gastados = rs.mago.puntos.gastados + sp.nv; return null;
  };
  acc.devolverPuntos = (pj, n) => { M(pj).gastados = Math.max(0, M(pj).gastados - Math.max(0, Math.round(num(n)))); return null; };

  /* Hechicero */
  acc.linaje = (pj, id) => { H(pj).linaje = String(id || ''); return null; };
  acc.elegir = (pj, reg, rs, id) => {
    const sp = arcano(reg, id), h = H(pj); if (!sp) return 'Ese conjuro no existe o no es arcano.';
    if (h.elegidos.includes(id)) return 'Ya lo conoces.';
    if (sp.nv > rs.hechicero.top) return `Aún no abres el nivel ${sp.nv} de conjuro.`;
    const lin = reg.linaje(h.linaje); if (lin && (lin.conjuros[sp.nv - 1] || []).some(x => x.id === id)) return 'Ya es un conjuro de tu linaje.';
    const maxE = 2 + Math.round(num(h.extraElegidos[sp.nv]));
    if (h.elegidos.map(x => reg.conjuro(x)).filter(x => x && x.nv === sp.nv).length >= maxE) return `Ya elegiste tus ${maxE} conjuros de nivel ${sp.nv}.`;
    h.elegidos.push(id); return null;
  };
  acc.quitarElegido = (pj, id) => { H(pj).elegidos = H(pj).elegidos.filter(x => x !== id); return null; };
  acc.lanzarH = (pj, rs, costo) => {
    const c = Math.max(1, Math.round(num(costo)));
    if (rs.hechicero.puntos.restan < c) return `Te quedan ${rs.hechicero.puntos.restan} punto(s) y cuesta ${c}.`;
    H(pj).gastados = rs.hechicero.puntos.gastados + c; return null;
  };
  acc.devolverH = (pj, n) => { H(pj).gastados = Math.max(0, H(pj).gastados - Math.max(0, Math.round(num(n)))); return null; };
  /* Ajustes fuera de nuestro control (objetos, maldiciones, eventos): bono ± a los puntos, espacios extra del mago y conjuros elegidos extra del hechicero. */
  acc.bonoPuntos = (pj, quien, v) => { (quien === 'hechicero' ? H(pj) : M(pj)).bonoPuntos = Math.max(-99, Math.min(99, Math.round(num(v)))); return null; };
  acc.extraEspacios = (pj, n, v) => { const o = M(pj).extraEspacios, x = Math.max(-9, Math.min(9, Math.round(num(v)))); if (x) o[n] = x; else delete o[n]; return null; };
  acc.extraElegidos = (pj, n, v) => { const o = H(pj).extraElegidos, x = Math.max(0, Math.min(9, Math.round(num(v)))); if (x) o[n] = x; else delete o[n]; return null; };
  acc.motivo = (pj, quien, t) => { (quien === 'hechicero' ? H(pj) : M(pj)).motivo = String(t || '').slice(0, 300); return null; };
  acc.gastados = (pj, quien, v) => { (quien === 'hechicero' ? H(pj) : M(pj)).gastados = Math.max(0, Math.round(num(v))); return null; };
})((typeof window !== 'undefined' ? window : globalThis).ADND);
