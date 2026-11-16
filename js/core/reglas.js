/* Motor de reglas AD&D 2.5 (homebrew de la V31.2). Funciones puras: reciben el personaje y el
   registro, devuelven datos. No tocan el DOM, el almacenamiento ni ninguna variable global,
   así se pueden probar en Node y comparar contra la hoja vieja. */
(function (A) {
  'use strict';
  const { num, round, clamp, signo } = A.util;
  const R = (A.reglas = A.reglas || {});

  /* ---------------------------------------------------------------- efectos */
  /* Lista plana de TODO lo que modifica algo, con su origen (así cada número muestra de dónde sale). */
  R.efectos = function (pj, reg) {
    const out = [];
    const add = (origen, etiqueta, objetivo, valor, nota) => {
      valor = num(valor);
      if (valor && A.OBJETIVOS[objetivo]) out.push({ origen, etiqueta, objetivo, valor, nota: nota || '' });
    };
    const mods = (o, e, m) => Object.entries(m || {}).forEach(([k, v]) => add(o, e, k, v));
    const efs = (o, e, l) => (l || []).forEach(x => add(o, e, x.objetivo, x.valor, x.nota));

    const raza = reg.raza(pj.raza.id);
    if (raza) {
      mods('Raza', raza.nombre, raza.mods); efs('Raza', raza.nombre, raza.efectos);
      const v = (raza.variantes || []).find(x => x.id === pj.raza.variante);
      if (v) { mods('Variante', v.nombre, v.mods); efs('Variante', v.nombre, v.efectos); }
      (raza.elecciones || []).forEach(el => {
        const op = (el.opciones || []).find(o => o.valor === pj.raza.elecciones[el.id]);
        if (op) { mods('Elección', op.etiqueta, op.mods); efs('Elección', op.etiqueta, op.efectos); }
      });
    }
    pj.clases.forEach(c => {
      if (!reg.clase(c.clase)) return;
      const k = reg.kitDe(c.clase, c.kit);
      if (k) { mods('Kit', k.nombre, k.mods); efs('Kit', k.nombre, k.efectos); }
    });
    Object.entries(pj.bonos || {}).forEach(([obj, lista]) =>
      (lista || []).forEach(b => add('Manual', b.origen || 'Bono manual', obj, b.valor, b.nota)));
    if (R.armas && R.armas.efectosCA) R.armas.efectosCA(pj, reg).forEach(e => add(e.origen, e.etiqueta, e.objetivo, e.valor, e.nota));
    return out;
  };
  const suma = (efectos, objetivo) => efectos.filter(e => e.objetivo === objetivo).reduce((a, e) => a + e.valor, 0);

  /* ------------------------------------------------------------ características */
  R.desplazarFuerza = function (base, delta) {
    const P = A.base.tablas.pasosFuerza;
    let i = P.indexOf(String(base));
    if (i < 0) i = P.indexOf(String(clamp(round(num(base)), 1, 25)));
    return P[clamp(i + Math.trunc(delta), 0, P.length - 1)];
  };
  R.claveTabla = (stat, valor) => (stat === 'FUE' ? String(valor) : String(clamp(round(num(valor)), 1, 25)));

  R.caracteristica = function (pj, stat, efectos) {
    const base = pj.caracteristicas[stat];
    const partes = efectos.filter(e => e.objetivo === stat);
    const mod = partes.reduce((a, e) => a + e.valor, 0);
    const total = stat === 'FUE' ? R.desplazarFuerza(base, mod) : num(base) + mod;
    const fila = A.base.caracteristicas[stat][R.claveTabla(stat, total)] || null;
    return { base, mod, total, partes, fila };
  };

  /* ------------------------------------------------------------------ clases */
  const SOBRE = ['thaco', 'salvaciones', 'xp', 'dg', 'dgNivelMax', 'pgDespues', 'topeBonoCon'];
  R.claseEfectiva = function (entrada, reg) {
    const base = reg.clase(entrada.clase);
    if (!base) return null;
    const kit = reg.kitDe(entrada.clase, entrada.kit);
    const e = Object.assign({}, base, { pericias: Object.assign({}, base.pericias) });
    if (kit) {
      SOBRE.forEach(k => { const v = kit.sobreescribe && kit.sobreescribe[k]; if (v !== '' && v != null) e[k] = typeof v === 'number' ? v : String(v); });
      Object.entries(kit.pericias || {}).forEach(([k, v]) => { if (v !== '' && v != null) e.pericias[k] = Math.max(k.endsWith('Cada') ? 1 : 0, num(v)); });
    }
    e.kit = kit; e.nombreBase = base.nombre;
    return e;
  };

  R.xpEfectivo = (pj, entrada) => Math.max(0, Math.round(num(entrada.xp) * (1 + num(pj.bonoXp) / 100)));
  R.nivelPorXp = function (tabla, xp) {
    if (!tabla) return 1;
    let l = 1;
    for (let i = 0; i < tabla.length; i++) if (xp >= tabla[i]) l = i + 1;
    return Math.min(30, l);
  };

  /* Una fila por clase válida (con el índice original, que sirve de clave para tiradas de PG). */
  R.niveles = function (pj, reg) {
    const out = [];
    pj.clases.forEach((entrada, i) => {
      const clase = R.claseEfectiva(entrada, reg);
      if (!clase) return;
      const tabla = reg.tabla('xp', clase.xp);
      const xpEf = R.xpEfectivo(pj, entrada);
      const nivel = clamp(entrada.modo === 'auto' ? R.nivelPorXp(tabla, xpEf) : num(entrada.nivel), 1, 30);
      out.push({ i, entrada, clase, nivel, xpEfectivo: xpEf, xpSiguiente: tabla && tabla[nivel] !== undefined ? tabla[nivel] : null, tablaFaltante: !tabla });
    });
    return out;
  };

  R.dual = function (items) {
    const congeladas = items.filter(x => x.entrada.estado === 'Congelada');
    const activas = items.filter(x => x.entrada.estado !== 'Congelada');
    const actual = activas.length ? activas[activas.length - 1] : null;
    const umbral = Math.max(0, ...congeladas.map(x => x.nivel));
    return { congeladas, activas, actual, umbral, recuperada: !!actual && actual.nivel > umbral };
  };

  R.gobernantes = function (pj, items) {
    if (pj.trayectoria === 'unica') return items.length ? [items[0]] : [];
    if (pj.trayectoria === 'multi') return items;
    const d = R.dual(items);
    if (!d.actual) return [];
    return d.recuperada ? items : [d.actual];
  };

  /* ------------------------------------------------------- THAC0 y salvaciones */
  const celda = (tabla, nivel) => tabla ? tabla[Math.min(tabla.length - 1, nivel - 1)] : undefined;

  R.thaco = function (items, gob, efectos, reg) {
    const partes = gob.map(x => ({ clase: x.clase.nombre, nivel: x.nivel, valor: celda(reg.tabla('thaco', x.clase.thaco), x.nivel) }))
      .filter(p => p.valor !== undefined);
    const base = partes.length ? Math.min(...partes.map(p => p.valor)) : 20;
    const bonos = efectos.filter(e => e.objetivo === 'thaco');
    return { valor: base + bonos.reduce((a, e) => a + e.valor, 0), base, partes, bonos };
  };

  R.salvaciones = function (gob, efectos, reg) {
    return A.SAVES.map((s, j) => {
      const partes = gob.map(x => { const f = celda(reg.tabla('salvaciones', x.clase.salvaciones), x.nivel); return f ? { clase: x.clase.nombre, nivel: x.nivel, valor: f[j] } : null; })
        .filter(p => p && p.valor !== undefined);
      const base = partes.length ? Math.min(...partes.map(p => p.valor)) : 20;
      const bonos = efectos.filter(e => e.objetivo === s);
      return { id: s, valor: base + bonos.reduce((a, e) => a + e.valor, 0), base, partes, bonos };
    });
  };

  /* ---------------------------------------------------------------------- PG */
  R.bonoCon = function (clase, con) {
    const fila = A.base.caracteristicas.CON[String(clamp(round(num(con)), 1, 25))];
    const b = fila ? num(fila['Bono PG']) : 0;
    const tope = clase.topeBonoCon !== undefined && clase.topeBonoCon !== null ? clase.topeBonoCon : (clase.thaco === 'Luchador' ? null : 2);
    return tope === null ? b : Math.min(tope, b);
  };

  R.pgEntradas = function (pj, items, con) {
    const out = [], n = Math.max(1, items.length), dual = R.dual(items), tr = pj.trayectoria;
    items.forEach(x => {
      const c = x.clase;
      if (tr === 'unica' && x.i !== items[0].i) return;
      let inicio = 1;
      if (tr === 'dual') inicio = x.entrada.estado === 'Congelada' ? 1 : dual.umbral + 1;
      for (let lv = inicio; lv <= x.nivel; lv++) {
        const key = x.i + ':' + lv, origen = `${c.nombre} nv. ${lv}`;
        if (lv <= c.dgNivelMax) {
          const dado = pj.pg.modo === 'maximo' ? c.dg : clamp(num(pj.pg.tiradas[key]), 0, c.dg);
          const cb = R.bonoCon(c, con);
          const parteDado = tr === 'multi' ? Math.ceil(dado / n) : dado;
          const parteCon = tr === 'multi' ? Math.ceil(cb / n) : cb;
          out.push({ key, origen, dado: 'd' + c.dg, tirada: dado, con: parteCon, total: parteDado + parteCon, editable: pj.pg.modo === 'tirada' });
        } else {
          out.push({ key, origen, dado: 'fijo', tirada: c.pgDespues, con: 0, total: c.pgDespues, editable: false });
        }
      }
    });
    return out;
  };

  /* -------------------------------------------------------------- pericias */
  R.pericias = function (pj, items, int, efectos, gob, reg) {
    const reglas = items.map(x => ({ x, pa: x.clase.pericias.pa0 + Math.floor(x.nivel / x.clase.pericias.paCada), pna: x.clase.pericias.pna0 + Math.floor(x.nivel / x.clase.pericias.pnaCada) }));
    let pa = 0, pna = 0, fuentePA = '—', fuentePNA = '—';
    if (reglas.length) {
      if (pj.trayectoria === 'dual') { pa = reglas.reduce((a, r) => a + r.pa, 0); pna = reglas.reduce((a, r) => a + r.pna, 0); fuentePA = fuentePNA = 'suma de clases'; }
      else if (pj.trayectoria === 'multi') {
        const ap = [...reglas].sort((a, b) => b.pa - a.pa)[0], an = [...reglas].sort((a, b) => b.pna - a.pna)[0];
        pa = ap.pa; pna = an.pna; fuentePA = ap.x.clase.nombre; fuentePNA = an.x.clase.nombre;
      } else { pa = reglas[0].pa; pna = reglas[0].pna; fuentePA = fuentePNA = reglas[0].x.clase.nombre; }
    }
    const flex = num(A.base.tablas.idiomasPorInt[String(clamp(Math.floor(num(int)), 1, 25))]);
    let fpa = Math.max(0, Math.floor(num(pj.pericias.flex.pa))), fpna = Math.max(0, Math.floor(num(pj.pericias.flex.pna)));
    if (fpa > flex) fpa = flex;
    if (fpa + fpna > flex) fpna = Math.max(0, flex - fpa);
    const idiomasUsados = pj.idiomas ? pj.idiomas.aprendidos.length : 0;
    const gratis = items.find(x => x.clase.ambidestriaGratis);
    const comprada = !gratis && !!pj.pericias.ambidestria.comprada;
    const reserva = pj.pericias.ambidestria.reserva === 'PNA' ? 'PNA' : 'PA';
    const artes = R.artes && reg ? R.artes.gasto(pj, reg) : { costo: 0, pa: 0, pna: 0 };
    const comprometidoPA = (comprada && reserva === 'PA' ? 1 : 0) + artes.pa, comprometidoPNA = (comprada && reserva === 'PNA' ? 1 : 0) + artes.pna;
    const gastoArmas = R.armas && reg ? R.armas.gasto(pj, reg, R.armas.contexto(pj, items, gob)) : 0;
    const gastadoPA = pj.pericias.armas.length + gastoArmas, gastadoPNA = pj.pericias.otras.reduce((a, o) => a + o.costo, 0) + (R.noArmas && reg ? R.noArmas.gasto(pj, reg, R.noArmas.categorias(items), R.kit.regalos(items, gob)) : 0);
    const totalPA = pa + fpa, totalPNA = pna + fpna;
    return {
      pa, pna, fuentePA, fuentePNA, flex, flexPA: fpa, flexPNA: fpna, idiomasUsados, flexLibre: flex - fpa - fpna, idiomasLibres: flex - idiomasUsados,
      totalPA, totalPNA, gastoArmas, gastadoPA, gastadoPNA, comprometidoPA, comprometidoPNA, gastoArtes: artes,
      disponiblesPA: Math.max(0, totalPA - comprometidoPA - gastadoPA), disponiblesPNA: Math.max(0, totalPNA - comprometidoPNA - gastadoPNA),
      ambidestria: gratis ? { activa: true, gratis: true, origen: gratis.clase.nombre } : { activa: comprada, gratis: false, reserva, origen: comprada ? `1 ${reserva}` : '—' }
    };
  };

  /* ---------------------------------------------------------------- movimiento */
  const FACTOR_CARGA = { Normal: 1, Cargado: 1 / 2, Sobrecargado: 1 / 3 };
  /* Base de la raza o (si es mayor) de la clase que gobierna, más bonos; la carga lo reduce. */
  R.movimiento = function (pj, reg, gob, efectos, estadoCarga) {
    const raza = reg.raza(pj.raza.id);
    const baseRaza = raza ? (raza.mov !== undefined && raza.mov !== null ? num(raza.mov) : num((A.base.movRaza || {})[raza.id] === undefined ? 12 : A.base.movRaza[raza.id])) : 12;
    const claseMov = (gob || []).filter(x => x.clase.mov !== undefined && x.clase.mov !== null).sort((a, b) => b.clase.mov - a.clase.mov)[0];
    const partes = [];
    let base = baseRaza; partes.push({ et: raza ? `Raza ${raza.nombre}` : 'Base', v: baseRaza });
    if (claseMov && num(claseMov.clase.mov) > baseRaza) { partes.push({ et: `Clase ${claseMov.clase.nombre} (reemplaza la base)`, v: num(claseMov.clase.mov) - baseRaza }); base = num(claseMov.clase.mov); }
    const bonos = efectos.filter(e => e.objetivo === 'mov');
    bonos.forEach(e => partes.push({ et: e.etiqueta, v: e.valor }));
    const sub = base + bonos.reduce((a, e) => a + e.valor, 0);
    const factor = FACTOR_CARGA[estadoCarga] === undefined ? 1 : FACTOR_CARGA[estadoCarga];
    const valor = Math.max(0, Math.floor(sub * factor));
    return { valor, sinCarga: sub, base, partes, carga: estadoCarga || '', factor, reducido: factor !== 1 };
  };

  /* ---------------------------------------------------------------- resumen */
  R.resumen = function (pj, reg) {
    const efectos = R.efectos(pj, reg);
    const car = {}; A.STATS.forEach(s => { car[s] = R.caracteristica(pj, s, efectos); });
    const items = R.niveles(pj, reg);
    const gob = R.gobernantes(pj, items);
    const nivel = Math.max(1, ...items.map(x => x.nivel));
    const thaco = R.thaco(items, gob, efectos, reg);
    const salvaciones = R.salvaciones(gob, efectos, reg);
    const pgFilas = R.pgEntradas(pj, items, car.CON.total);
    const pgClases = pgFilas.reduce((a, x) => a + num(x.total), 0);
    const pgExtra = pj.pg.extra.reduce((a, x) => a + num(x.total), 0);
    const pgBonos = efectos.filter(e => e.objetivo === 'pg');
    const pgBono = pgBonos.reduce((a, e) => a + e.valor, 0);
    const pg = { filas: pgFilas, clases: pgClases, extra: pgExtra, bonos: pgBonos, bono: pgBono, max: Math.max(0, pgClases + pgExtra + pgBono) };
    const defensa = car.DES.fila ? num(car.DES.fila['Defensa']) : 0;
    const ca = R.armadura(pj, reg, efectos, defensa);
    const carga = R.equipo && reg ? R.equipo.carga(pj, reg, car.FUE.fila) : { estado: '' };
    const mov = R.movimiento(pj, reg, gob, efectos, carga.estado);
    const tecnicas = R.tecnicas.resumen(pj, reg, items, car, ca.clase);
    const ego = round(num(car.CAR.total) + num(car.INT.total) + nivel);
    const belleza = round((num(car.CAR.total) + num(car.CON.total)) / 2);
    const pericias = R.pericias(pj, items, car.INT.total, efectos, gob, reg);
    const noArmas = R.noArmas.resumen(pj, reg, items, car, pericias.disponiblesPNA, R.kit.regalos(items, gob));
    const artes = R.artes.resumen(pj, reg, pericias);
    const techno = R.techno.resumen(pj, items);
    const conjuros = R.conjuros.resumen(pj, reg, items, car);
    const psionica = R.psionica.resumen(pj, reg, items, car);
    const dotes = R.dotes ? R.dotes.resumen(pj, reg, nivel) : null;

    const avisos = [];
    if (!pj.clases.length) avisos.push('Agrega al menos una clase.');
    pj.clases.forEach((c, i) => {
      if (!c.clase) avisos.push(`La fila ${i + 1} de clases no tiene clase.`);
      else if (!reg.clase(c.clase)) avisos.push(`La clase "${c.clase}" ya no existe en tu biblioteca.`);
      else {
        if (c.kit && !reg.kitDe(c.clase, c.kit)) avisos.push(`El kit de ${reg.clase(c.clase).nombre} ya no existe.`);
        const cl = R.claseEfectiva(c, reg);
        ['thaco', 'salvaciones', 'xp'].forEach(t => { if (!reg.tabla(t, cl[t])) avisos.push(`${cl.nombre}: falta la tabla ${t} "${cl[t]}".`); });
      }
    });
    const raza = reg.raza(pj.raza.id);
    if (!raza) avisos.push('La raza elegida ya no existe en tu biblioteca.');
    else (raza.elecciones || []).forEach(e => { if (!pj.raza.elecciones[e.id]) avisos.push(`Elección racial pendiente: ${e.etiqueta}.`); });
    if (pj.trayectoria === 'dual' && !items.some(x => x.entrada.estado === 'Congelada')) avisos.push('Clase dual: marca como Congelada la clase anterior.');
    const razaObj = reg.raza(pj.raza.id);
    const idiomas = {
      nativos: reg.nativosDe(razaObj),
      aprendidos: pj.idiomas.aprendidos.map(id => { const i = reg.idioma(id); return { id, nombre: i ? i.nombre : id, faltante: !i }; }),
      total: pericias.flex, usados: pericias.idiomasUsados, enPericias: pericias.flexPA + pericias.flexPNA, libres: pericias.idiomasLibres
    };
    if (idiomas.libres < 0) avisos.push(`Idiomas aprendidos: gastas ${-idiomas.libres} hueco(s) de INT de más.`);
    if (artes.pa > pericias.totalPA || artes.pna > pericias.totalPNA) avisos.push(`Artes marciales: gastas ${artes.pa} PA y ${artes.pna} PNA; tienes ${pericias.totalPA} PA y ${pericias.totalPNA} PNA en total.`);
    const armas = R.armas ? R.armas.resumen(pj, reg, { items, gob, car, thaco, pericias }) : null;
    if (armas && armas.libres < 0) avisos.push(`Armas: gastas ${-armas.libres} PA más de los que tienes.`);
    return { efectos, car, items, gob, nivel, thaco, salvaciones, pg, ca, mov, ego, belleza, pericias, noArmas, tecnicas, artes, techno, conjuros, psionica, dotes, idiomas, armas, avisos: avisos.concat(conjuros.avisos, psionica.avisos, dotes && dotes.activo ? dotes.avisos : []) };
  };

  /* Formato legible para tablas de características (0.85 → 85 %). */
  R.formatoFila = v => (typeof v === 'number' && v > 0 && v < 1 ? Math.round(v * 100) + '%' : v === null || v === undefined || v === '' ? '—' : String(v));
  R.signo = signo;
})((typeof window !== 'undefined' ? window : globalThis).ADND);
