/* Reglas de armas (puras, sin DOM): competencias, especialización, estilos de combate,
   y por cada arma física su GAC0, daño, crítico y RT, mostrando de dónde sale cada número.
   Se carga después de reglas.js y cuelga de A.reglas.armas. */
(function (A) {
  'use strict';
  const U = A.util, R = A.reglas, B = () => A.base.armas;
  const num = U.num, clamp = U.clamp;
  const A_ = {};
  R.armas = A_;

  /* ------------------------------------------------------------ contexto de clases */
  const ESP_POR_GRUPO = { Luchador: 4, Divino: 2, Bribon: 1, Arcano: 0 };
  A_.espMax = function (clase) {
    if (clase.espArmas !== undefined && clase.espArmas !== null) return clamp(num(clase.espArmas), 0, 5);
    const t = B().espMaxClase[clase.id];
    if (t !== undefined) return t;
    return ESP_POR_GRUPO[clase.thaco] !== undefined ? ESP_POR_GRUPO[clase.thaco] : 0;
  };
  /* Estilos "naturales": los que la clase aprende sin recargo. */
  const naturalesDe = clase => {
    const m = A_.espMax(clase);
    if (m >= 4) return B().ordenEstilos.slice();
    if (m >= 2) return ['one', 'shield', 'twohand'];
    if (m === 1) return ['one', 'two', 'ranged'];
    return ['one', 'twohand'];
  };

  /* gob = clases que cuentan ahora (en dual, solo la activa hasta recuperar la anterior). */
  A_.contexto = function (pj, items, gob) {
    const clases = (gob && gob.length ? gob : items.slice(0, 1)).map(x => ({ x, esp: A_.espMax(x.clase), nivel: x.nivel }));
    const mejor = clases.length ? Math.max(...clases.map(c => c.esp)) : 0;
    const nivelEsp = Math.max(1, ...clases.filter(c => c.esp === mejor).map(c => c.nivel));
    const oportunidades = Math.floor(nivelEsp / 3);
    const natural = k => clases.some(c => naturalesDe(c.x.clase).includes(k));
    const tope = k => {
      const nat = clases.filter(c => naturalesDe(c.x.clase).includes(k));
      const nivel = nat.length ? Math.max(...nat.map(c => c.nivel)) : Math.max(1, ...clases.map(c => c.nivel));
      return Math.min(maxEstilo(k), Math.floor(nivel / 3));
    };
    const luchadores = clases.filter(c => c.x.clase.thaco === 'Luchador').sort((a, b) => b.nivel - a.nivel);
    const lv = luchadores.length ? Math.max(1, luchadores[0].nivel) : 0;
    const rt = { der: lv >= 7 ? 2 : 1, izq: lv >= 13 ? 2 : 1, origen: luchadores.length ? luchadores[0].x.clase.nombre : 'Sin progresión Luchador' };
    rt.etiqueta = `${rt.der}/${rt.izq}`;
    return { mejor, nivelEsp, oportunidades, natural, tope, rt, kit: R.kit.regalos(items, gob) };
  };
  const maxEstilo = k => (B().estilos[k] && B().estilos[k].max) || 4;
  /* Nivel efectivo de un estilo: lo pagado más los niveles gratis que da un modificador externo (nunca pasa del máximo). */
  const lvE = (pj, k) => Math.min(maxEstilo(k), (pj.armas.estilos[k] || 0) + ((pj.armas.estiloExtra || {})[k] || 0));

  /* ---------------------------------------------------------------- dominio y costos */
  const esArte = id => String(id).startsWith('am:');   // el ataque desarmado de un arte marcial: la competencia ya la paga el arte
  const grupoDe = (pj, reg, id) => { const a = reg.arma(id); return a ? a.grupo : ''; };
  const specGrupo = (pj, g) => (pj.armas.grupos[g] && pj.armas.grupos[g].spec) || 0;
  const specKit = (ctx, id, g) => { const k = ctx && ctx.kit; if (!k) return 0; return Math.max((k.spec.get(id) || { n: 0 }).n, (k.specGrupo.get(g) || { n: 0 }).n); };
  const efectivaDe = (pj, reg, id, ctx) => {
    const d = pj.armas.dominio[id], g = grupoDe(pj, reg, id), kit = specKit(ctx, id, g);
    return Math.min(5, Math.max(kit, d ? Math.max(specGrupo(pj, g), d.regalada + d.pagada) : specGrupo(pj, g)));
  };
  const kitDa = (ctx, id, g) => { const k = ctx && ctx.kit; return !!k && (k.armas.has(id) || k.grupos.has(g) || k.spec.has(id)); };

  A_.costos = function (pj, reg, ctx) {
    const grupos = new Set([...Object.keys(pj.armas.grupos), ...Object.keys(pj.armas.dominio).map(id => grupoDe(pj, reg, id))]);
    let dominio = 0;
    grupos.forEach(g => {
      const G = pj.armas.grupos[g] || {};
      const kg = ctx.kit && ctx.kit.grupos.has(g), ke = ctx.kit && ctx.kit.specGrupo.get(g) ? ctx.kit.specGrupo.get(g).n : 0;
      if (G.comp && !kg) dominio += 2;
      if (G.spec) dominio += 2 * Math.max(0, G.spec - ke);
      Object.entries(pj.armas.dominio).forEach(([id, d]) => { if (grupoDe(pj, reg, id) !== g) return; if (!G.comp && !kg && !esArte(id) && !kitDa(ctx, id, g)) dominio += 1; dominio += d.pagada; });
    });
    let estilos = 0;
    Object.entries(pj.armas.estilos).forEach(([k, lv]) => { if (lv) estilos += lv + (ctx.natural(k) ? 0 : 1); });
    const combos = Object.values(pj.armas.combos).reduce((a, v) => a + num(v), 0);
    return { dominio, estilos, combos, total: dominio + estilos + combos };
  };
  A_.gasto = (pj, reg, ctx) => A_.costos(pj, reg, ctx).total;

  /* ---------------------------------------------------------------- efectos de estilo */
  const VACIO = () => ({ gac0: 0, dano: 0, rt: 0, bloq: 0, ca: 0, salv: 0, man: 0, notas: [] });
  const efectoEstilo = (k, nivel) => {
    const e = VACIO(), def = B().estilos[k];
    if (!def || !nivel) return e;
    def.niveles.slice(0, nivel).forEach(n => {
      ['gac0', 'dano', 'rt', 'bloq', 'ca', 'salv', 'man'].forEach(f => { e[f] += num(n[f]); });
      (n.notas || []).forEach(t => e.notas.push(t));
    });
    return e;
  };
  const efectoCombinado = (pj, k) => {
    const e = efectoEstilo(k, lvE(pj, k));
    Object.entries(pj.armas.combos).forEach(([clave, lv]) => {
      const par = clave.split('|');
      if (!lv || !par.includes(k)) return;
      const otro = par.find(x => x !== k), o = efectoEstilo(otro, lv);
      ['gac0', 'dano', 'rt', 'bloq', 'ca', 'salv', 'man'].forEach(f => { e[f] += o[f]; });
      o.notas.forEach(t => e.notas.push(`${B().estilos[otro].nombre}: ${t}`));
    });
    return e;
  };
  /* Lo que el estilo arma-escudo aporta con este escudo. El escudo medio es la medida: cada escudo trae su ajuste
     (escudo.ca en puntos de bono de CA, escudo.bloqueos en bloqueos). El bono de CA nunca baja de 0 ni cambia de signo. */
  const aporteEscudo = (eff, datos) => {
    const aj = (datos && datos.escudo) || { ca: 0, bloqueos: 0 };
    const bono = eff.ca ? Math.max(0, -eff.ca + num(aj.ca)) : 0;
    const bloq = eff.bloq ? Math.max(0, eff.bloq + num(aj.bloqueos)) : 0;
    return { ca: bono ? -bono : 0, bloq };
  };
  const claveCombo = (a, b) => [a, b].sort().join('|');

  /* ------------------------------------------------------------------ dados y RT */
  const DADOS = [4, 6, 8, 10, 12, 20];
  const subirDado = (expr, pasos) => {
    pasos = Math.max(0, num(pasos));
    if (!expr || !pasos || !/\dd\d/i.test(expr)) return expr;
    return String(expr).replace(/(\d+)d(4|6|8|10|12|20)/i, (m, n, d) => `${n}d${DADOS[Math.min(DADOS.length - 1, Math.max(0, DADOS.indexOf(+d)) + pasos)]}`);
  };
  const partirDano = expr => { const m = String(expr || '').match(/^\s*(\d+d\d+)([+-]\d+)?/i); return m ? { dado: m[1], plano: num(m[2]) } : null; };
  const formatoDano = (expr, plano, pasos) => {
    const p = partirDano(subirDado(expr, pasos));
    if (!p) return String(expr || '—');
    const n = p.plano + plano;
    return p.dado + (n > 0 ? '+' + n : n < 0 ? String(n) : '');
  };
  /* RT como pasos: 0/0, 1/0, 1/1, 2/1, 2/2 ... */
  const aPasos = etiqueta => {
    const m = String(etiqueta || '1/1').match(/(\d+)\s*[\/\-]\s*(\d+)/);
    const a = m ? +m[1] : 1, b = m ? +m[2] : 1;
    return a === 0 && b === 0 ? 0 : a === 1 && b === 0 ? 1 : a === b ? 2 * a : 2 * a - 1;
  };
  const aEtiqueta = t => { t = Math.max(0, Math.round(t)); return t === 0 ? '0/0' : `${Math.ceil(t / 2)}/${Math.floor(t / 2)}`; };
  A_.pasoRt = (base, delta) => aEtiqueta(aPasos(base) + (delta || 0));
  A_.rtEnPasos = aPasos; A_.rtEtiqueta = aEtiqueta;

  /* ------------------------------------------------------------------ dos armas */
  const tamano = d => String((d && d.tam) || '').trim().toUpperCase();
  const apta2 = d => ['L', 'M'].includes(tamano(d));
  const reducirDual = (pa, pb, nivelEstilo, reaccion, ambidestro) => {
    const react = Math.max(0, -num(reaccion)), amb = ambidestro ? 2 : 0;
    const punto = () => { if (pb > pa && pb > 0) pb--; else if (pa > 0) pa--; else if (pb > 0) pb--; };
    const paquete = () => { if (pb > pa && pb > 0) pb = Math.max(0, pb - 2); else if (pa > 0) pa = Math.max(0, pa - 2); else if (pb > 0) pb = Math.max(0, pb - 2); };
    for (let i = 0; i < react; i++) punto();
    if (amb) paquete();
    for (let i = 0; i < nivelEstilo; i++) paquete();
    return { pa, pb, reduccion: react + amb + 2 * nivelEstilo, react, amb };
  };
  const penalizacionBase = (da, db) => {
    if (!apta2(da) || !apta2(db)) return null;
    const la = tamano(da) === 'L', lb = tamano(db) === 'L';
    return la && lb ? [2, 4] : la !== lb ? [4, 4] : [4, 6];
  };

  /* ------------------------------------------------------------------ cálculo completo */
  A_.resumen = function (pj, reg, ent) {
    const { items, gob, car, thaco, pericias } = ent;
    const ctx = A_.contexto(pj, items, gob);
    const costos = A_.costos(pj, reg, ctx);
    const ESP = B().especializacion;
    const reaccion = car.DES.fila ? num(car.DES.fila['Reacción']) : 0;
    const golpeFue = car.FUE.fila ? num(car.FUE.fila['Golpe']) : 0, danoFue = car.FUE.fila ? num(car.FUE.fila['Daño']) : 0;
    const proyDes = car.DES.fila ? num(car.DES.fila['Proyectil']) : 0, defDes = car.DES.fila ? num(car.DES.fila['Defensa']) : 0;
    const gac0Fue = thaco.valor - golpeFue, gac0Des = thaco.valor - proyDes;
    const capacidad = Math.max(0, pericias.totalPA - pericias.comprometidoPA - pj.pericias.armas.length);

    const estado = id => {
      const a = reg.arma(id), g = a ? a.grupo : '';
      if (esArte(id) && a) return 'Competente';
      if ((pj.armas.grupos[g] && pj.armas.grupos[g].comp) || pj.armas.dominio[id] || kitDa(ctx, id, g)) return 'Competente';
      return Object.keys(pj.armas.dominio).some(x => grupoDe(pj, reg, x) === g) ? 'Familiar' : 'No profesional';
    };

    const dominio = Object.entries(pj.armas.dominio).map(([id, d]) => {
      const a = reg.arma(id), eff = efectivaDe(pj, reg, id, ctx), g = a ? a.grupo : '';
      return { id, arma: a, nombre: a ? a.nombre : id, grupo: g, faltante: !a, regalada: d.regalada, pagada: d.pagada, origen: d.origen, efectiva: eff, nombreEsp: ESP[eff], tope: ctx.mejor, kit: kitDa(ctx, id, g) ? ((ctx.kit.armas.get(id) || (ctx.kit.spec.get(id) || {}).f || ctx.kit.grupos.get(g) || '')) : '' };
    });
    /* Lo que da el kit y no está en tu lista: aparece solo, no se puede quitar ni se paga. */
    const kitIds = new Set([...ctx.kit.armas.keys(), ...ctx.kit.spec.keys()]);
    kitIds.forEach(id => {
      if (pj.armas.dominio[id]) return; const a = reg.arma(id); if (!a) return;
      const eff = efectivaDe(pj, reg, id, ctx);
      dominio.push({ id, arma: a, nombre: a.nombre, grupo: a.grupo, faltante: false, regalada: 0, pagada: 0, origen: '', efectiva: eff, nombreEsp: ESP[eff], tope: ctx.mejor, kit: ctx.kit.armas.get(id) || (ctx.kit.spec.get(id) || {}).f || '', soloKit: true });
    });
    const grupos = reg.gruposArmas().map(g => {
      const G = pj.armas.grupos[g] || { comp: false, spec: 0 };
      const conocidas = Object.keys(pj.armas.dominio).filter(id => grupoDe(pj, reg, id) === g).length;
      const copia = JSON.parse(JSON.stringify(pj.armas)); copia.grupos[g] = { comp: !G.comp, spec: G.comp ? 0 : G.spec };
      const delta = A_.costos({ armas: copia }, reg, ctx).dominio - costos.dominio;
      const kg = ctx.kit.grupos.get(g) || '', ke = ctx.kit.specGrupo.get(g);
      return { grupo: g, comp: !!G.comp || !!kg, spec: Math.max(G.spec || 0, ke ? ke.n : 0), conocidas, deltaComp: delta, tope: Math.min(2, ctx.mejor, ctx.oportunidades), kit: kg || (ke ? ke.f : ''), kitEsp: ke ? ke.n : 0 };
    });

    const estilos = B().ordenEstilos.map(k => {
      const def = B().estilos[k], lvP = pj.armas.estilos[k] || 0, ext = (pj.armas.estiloExtra || {})[k] || 0, lv = lvE(pj, k);
      return { id: k, nombre: def.nombre, nivel: lvP, extra: ext, total: lv, pagado: lvP, max: maxEstilo(k), tope: ctx.tope(k), natural: ctx.natural(k), niveles: def.niveles.map(n => n.desc), efecto: efectoEstilo(k, lv) };
    });
    const combos = [];
    B().ordenEstilos.forEach((a, i) => B().ordenEstilos.slice(i + 1).forEach(b => {
      const clave = claveCombo(a, b), nivel = pj.armas.combos[clave] || 0, nat = ctx.natural(a) && ctx.natural(b);
      combos.push({ clave, a, b, nombre: `${B().estilos[a].nombre} ↔ ${B().estilos[b].nombre}`, nivel, natural: nat, tope: Math.min(lvE(pj, a), lvE(pj, b)) });
    }));

    /* instancias */
    const porId = id => pj.armas.instancias.find(i => i.id === id) || null;
    const datosDe = i => reg.arma(i.base);
    const buena = porId(pj.armas.pares.dos.buena), mala = porId(pj.armas.pares.dos.mala);
    let dos = null;
    if (buena && mala && buena !== mala) {
      const base = penalizacionBase(datosDe(buena), datosDe(mala));
      if (base) { const r = reducirDual(base[0], base[1], lvE(pj, 'two'), reaccion, pericias.ambidestria.activa); dos = Object.assign({ buena, mala, baseA: base[0], baseB: base[1] }, r); }
    }
    const penal = i => (dos && i.estilo === 'two' ? (dos.buena === i ? dos.pa : dos.mala === i ? dos.pb : 0) : 0);

    const instancias = pj.armas.instancias.map(i => {
      const a = datosDe(i), sp = a ? efectivaDe(pj, reg, a.id, ctx) : 0, est = a ? estado(a.id) : 'No profesional';
      const modos = !a ? ['Cuerpo'] : a.tipo === 'distancia' ? (/arroj/i.test(a.esp) ? ['Distancia', 'Cuerpo'] : ['Distancia']) : (/arroj/i.test(a.esp) ? ['Cuerpo', 'Arrojada'] : ['Cuerpo']);
      const modo = modos.includes(i.modo) ? i.modo : modos[0];
      const opciones = [['none', 'Ninguno']];
      B().ordenEstilos.forEach(k => { if (k === 'shield') return; if (k === 'ranged' && modo === 'Cuerpo') return; if (k === 'twohand' && tamano(a) === 'P') return; opciones.push([k, B().estilos[k].nombre]); });
      const estilo = opciones.some(o => o[0] === i.estilo) ? i.estilo : 'none';
      const eff = estilo === 'none' ? VACIO() : efectoCombinado(pj, estilo);
      const sutilPermitida = !!a && /sutil/i.test(a.esp);
      const conDes = sutilPermitida && i.sutileza === 'DES' && modo === 'Cuerpo';
      const baseGac0 = modo === 'Cuerpo' && !conDes ? gac0Fue : gac0Des;
      const lvUna = lvE(pj, 'one');
      const tacticos = estilo === 'one' ? Math.min(4, (lvUna >= 1 ? 2 : 0) + (lvUna >= 3 ? 2 : 0)) : 0;
      const tacGac0 = estilo === 'one' ? clamp(i.puntosTacticos, 0, tacticos) : 0;
      const profGac0 = est === 'Competente' ? 0 : est === 'Familiar' ? 2 : 4;
      const espGac0 = sp >= 2 ? -3 : sp >= 1 ? -1 : 0;
      const pen = penal(i), bk = a ? R.kit.bonosDe(ctx.kit, a) : { gac0: 0, dano: 0, rt: 0, partes: [] };
      const partesGac0 = [
        { et: modo === 'Cuerpo' && !conDes ? 'GAC0 con FUE' : 'GAC0 con DES', v: baseGac0, base: true },
        { et: `Competencia (${est})`, v: profGac0 }, { et: `Especialización ${sp}`, v: espGac0 }, { et: 'Mágico', v: -i.magico },
        { et: 'Estilo', v: eff.gac0 }, ...bk.partes.filter(q => q.stat === 'gac0').map(q => ({ et: q.et, v: -q.v })), { et: 'Puntos tácticos', v: -tacGac0 }, { et: 'Dos armas', v: pen }, { et: 'Ajuste manual', v: i.ajusteGac0 }
      ].filter(p => p.base || p.v);
      const gac0 = Math.max(1, partesGac0.reduce((s, p) => s + p.v, 0));

      let atrib = 0, etAtrib = '';
      if (modo !== 'Distancia') {
        if (conDes) { atrib = -defDes; etAtrib = 'DES (sutileza)'; } else { atrib = estilo === 'twohand' ? Math.round(danoFue * 1.5) : danoFue; etAtrib = estilo === 'twohand' ? 'FUE ×1,5' : 'FUE'; }
      }
      const espDano = modo === 'Cuerpo' ? (sp >= 2 ? 3 : sp >= 1 ? 2 : 0) : 0;
      const pasosDado = (sp >= 4 ? 1 : 0) + i.dadoMagico;
      const partesDano = [{ et: etAtrib, v: atrib }, { et: `Especialización ${sp}`, v: espDano }, { et: 'Mágico', v: i.magico }, { et: 'Estilo', v: eff.dano }, ...bk.partes.filter(q => q.stat === 'dano').map(q => ({ et: q.et, v: q.v })), { et: 'Ajuste manual', v: i.ajusteDano }].filter(p => p.v);
      const plano = partesDano.reduce((s, p) => s + p.v, 0);
      const extraTec = a && a.techDado ? ` + ${a.techDado}` : '';   // dado extra de un arma fabricada por un Techno
      const dano = a ? { p: formatoDano(a.dm, plano, pasosDado) + extraTec, g: formatoDano(a.dg, plano, pasosDado) + extraTec } : { p: '—', g: '—' };

      /* El RT base es el mejor entre el de la tabla del arma y el de la clase; lo demás se suma encima. */
      const pasosClase = aPasos(ctx.rt.etiqueta), pasosArma = a ? num(a.rt) : 0, pasosBase = Math.max(pasosClase, pasosArma);
      const origenRt = pasosArma >= pasosClase ? `Arma ${a ? a.nombre : ''}`.trim() : `Clase ${ctx.rt.origen}`;
      const rtArte = a ? num(a.extraRt) : 0, rtTech = a ? num(a.techRt) : 0;
      const rtDelta = (sp >= 1 ? 1 : 0) + (sp >= 4 ? 1 : 0) + i.rtMagico + eff.rt + rtArte + rtTech + bk.rt;
      const partesRt = [{ et: `Base (${origenRt})`, v: aEtiqueta(pasosBase), base: true }, { et: 'Ataques extra del arte', v: rtArte }, { et: 'Bono RT del Techno', v: rtTech }, { et: 'Especialización', v: (sp >= 1 ? 1 : 0) + (sp >= 4 ? 1 : 0) }, { et: 'Mágico', v: i.rtMagico }, { et: 'Estilo', v: eff.rt }, ...bk.partes.filter(q => q.stat === 'rt').map(q => ({ et: q.et, v: q.v }))].filter(p => p.base || p.v);
      const critico = !a ? '—' : sp >= 3 ? (a.adv || a.crit || '—') : (a.crit || '—');

      const escudo = null;
      return {
        inst: i, arma: a, faltante: !a, grupo: a ? a.grupo : '', estado: est, sp, nombreEsp: ESP[sp] || 'Competente', modos, modo, opciones, estilo, eff,
        sutilPermitida, conDes, tacticos, tacGac0, gac0, partesGac0, dano, partesDano, rt: aEtiqueta(pasosBase + rtDelta), partesRt, critico, escudo, penalDos: pen
      };
    });

    /* Escudo equipado: es un arma más (hace daño y tiene su propio RT); el estilo arma-escudo solo aporta CA, salvaciones, bloqueos y maniobras. */
    const par = pj.armas.pares.escudo, instEsc = porId(par.escudo), datosEsc = instEsc ? datosDe(instEsc) : null;
    let escudo = null;
    if (instEsc && datosEsc && datosEsc.escudo) {
      const nivel = lvE(pj, 'shield'), eff = efectoCombinado(pj, 'shield'), otra = porId(par.arma);
      const ap = aporteEscudo(eff, datosEsc);
      escudo = { inst: instEsc, arma: otra && otra !== instEsc ? otra : null, nivel, eff, ca: ap.ca, bloqueos: ap.bloq, salv: eff.salv, man: eff.man, notas: eff.notas, primerGolpe: nivel === 0, aplicada: A_.estiloCA(pj, reg).escudoAplicado, calculo: instancias.find(x => x.inst === instEsc) };
    }
    return { ctx, costos, capacidad, libres: capacidad - costos.total, dominio, grupos, estilos, combos, instancias, dos, gac0Fue, gac0Des, rt: ctx.rt, escudo, elegiblesDos: pj.armas.instancias.filter(i => apta2(datosDe(i))), escudos: pj.armas.instancias.filter(i => { const a = datosDe(i); return a && a.escudo; }) };
  };

  /* ---------------------------------------------------------- acciones (cambian pj) */
  /* Cada acción devuelve null si se hizo, o un texto si no se pudo. Se deshace sola si no alcanzan los PA. */
  const acc = A_.acc = {};
  const probar = (pj, reg, ctx, capacidad, cambio) => {
    const antes = JSON.stringify(pj.armas);
    const r = cambio();
    if (r) { pj.armas = JSON.parse(antes); return r; }
    if (A_.gasto(pj, reg, ctx) > capacidad) { pj.armas = JSON.parse(antes); return 'No te alcanzan los PA de arma.'; }
    return null;
  };
  acc.anadirArma = (pj, reg, ctx, cap, id) => probar(pj, reg, ctx, cap, () => {
    const a = reg.arma(id); if (!a) return 'Esa arma no existe.';
    if (pj.armas.dominio[id] || (pj.armas.grupos[a.grupo] && pj.armas.grupos[a.grupo].comp)) return 'Ya eres competente con esa arma.';
    pj.armas.dominio[id] = { pagada: 0, regalada: 0, origen: '' }; return null;
  });
  acc.quitarArma = (pj, id) => { delete pj.armas.dominio[id]; return null; };
  acc.especializar = (pj, reg, ctx, cap, id, n) => probar(pj, reg, ctx, cap, () => {
    const d = pj.armas.dominio[id]; if (!d) return 'Primero agrega el arma.';
    const eff = Math.min(ctx.mejor, d.regalada + d.pagada);
    if (n === eff + 1 && d.pagada < ctx.oportunidades && n <= ctx.mejor) d.pagada++;
    else if (n === eff && d.pagada > 0 && n > d.regalada) d.pagada--;
    else return n > ctx.mejor ? 'Tu clase no llega a ese nivel de especialización.' : 'Aún no tienes oportunidades de especialización (una cada 3 niveles).';
    return null;
  });
  acc.regalarEsp = (pj, ctx, id, n) => {
    const d = pj.armas.dominio[id]; if (!d) return null;
    const nv = d.regalada === n ? n - 1 : n;
    if (nv > d.regalada + 1 || nv > ctx.mejor) return 'Ese nivel no es posible.';
    d.regalada = Math.max(0, nv); return null;
  };
  acc.origenEsp = (pj, id, texto) => { if (pj.armas.dominio[id]) pj.armas.dominio[id].origen = String(texto || ''); return null; };
  acc.grupoComp = (pj, reg, ctx, cap, g) => probar(pj, reg, ctx, cap, () => {
    const G = pj.armas.grupos[g] || (pj.armas.grupos[g] = { comp: false, spec: 0 });
    G.comp = !G.comp; if (!G.comp) G.spec = 0; return null;
  });
  acc.grupoEsp = (pj, reg, ctx, cap, g, n) => probar(pj, reg, ctx, cap, () => {
    const G = pj.armas.grupos[g] || (pj.armas.grupos[g] = { comp: true, spec: 0 });
    const nv = G.spec === n ? n - 1 : n;
    if (nv > G.spec + 1 || nv > Math.min(ctx.mejor, ctx.oportunidades)) return 'Aún no puedes especializarte en el grupo a ese nivel.';
    G.spec = nv; return null;
  });
  acc.estiloExtra = (pj, k, n) => { pj.armas.estiloExtra = pj.armas.estiloExtra || {}; const v = Math.max(0, Math.min(maxEstilo(k), Math.round(Number(n) || 0))); if (v) pj.armas.estiloExtra[k] = v; else delete pj.armas.estiloExtra[k]; };
  acc.estilo = (pj, reg, ctx, cap, k, n) => probar(pj, reg, ctx, cap, () => {
    const cur = pj.armas.estilos[k] || 0, nv = cur === n ? n - 1 : n;
    if (nv > cur + 1) return 'Los niveles se compran en orden.';
    if (nv > ctx.tope(k)) return 'Tu nivel aún no permite ese nivel de estilo (uno cada 3 niveles).';
    if (nv <= 0) delete pj.armas.estilos[k]; else pj.armas.estilos[k] = nv;
    // un combo no puede superar el nivel de sus estilos
    Object.keys(pj.armas.combos).forEach(c => { const [x, y] = c.split('|'); const tope = Math.min(lvE(pj, x), lvE(pj, y)); if (pj.armas.combos[c] > tope) { if (tope) pj.armas.combos[c] = tope; else delete pj.armas.combos[c]; } });
    return null;
  });
  acc.combo = (pj, reg, ctx, cap, clave, n) => probar(pj, reg, ctx, cap, () => {
    const [a, b] = clave.split('|'), cur = pj.armas.combos[clave] || 0, nv = cur === n ? n - 1 : n;
    const tope = Math.min(lvE(pj, a), lvE(pj, b));
    if (!ctx.natural(a) || !ctx.natural(b)) return 'Solo se combinan estilos a los que tu clase accede de forma natural.';
    if (nv > cur + 1 || nv > tope) return 'Primero sube los dos estilos.';
    if (nv <= 0) delete pj.armas.combos[clave]; else pj.armas.combos[clave] = nv;
    return null;
  });
  acc.anadirInstancia = (pj, reg, id) => {
    const a = reg.arma(id); if (!a) return 'Esa arma no existe.';
    const modo = a.tipo === 'distancia' ? 'Distancia' : 'Cuerpo';
    pj.armas.instancias.push({ id: U.idNuevo('inst', a.nombre), base: id, nombre: '', modo, magico: 0, rtMagico: 0, dadoMagico: 0, ajusteGac0: 0, ajusteDano: 0, sutileza: 'FUE', estilo: 'none', puntosTacticos: 0, notas: '' });
    return null;
  };
  acc.quitarInstancia = (pj, id) => {
    pj.armas.instancias = pj.armas.instancias.filter(i => i.id !== id);
    ['buena', 'mala'].forEach(k => { if (pj.armas.pares.dos[k] === id) pj.armas.pares.dos[k] = ''; });
    ['arma', 'escudo'].forEach(k => { if (pj.armas.pares.escudo[k] === id) pj.armas.pares.escudo[k] = ''; });
    return null;
  };
  /* CA que aportan los estilos de pelea. Solo cuenta la MEJOR de dos fuentes (no se suman): los puntos tácticos de una mano sin gastar
     en ataque, o el estilo arma-escudo con el escudo equipado (con el ajuste de su tamaño). `escudo` es la parte permanente del escudo,
     que también cuenta para la CA de dureza. */
  A_.estiloCA = function (pj, reg) {
    const vacio = { mejor: null, escudo: 0, hayEscudo: false, escudoAplicado: false };
    if (!pj.armas) return vacio;
    const candidatos = [];
    const lvUna = lvE(pj, 'one'), tacticos = Math.min(4, (lvUna >= 1 ? 2 : 0) + (lvUna >= 3 ? 2 : 0));
    pj.armas.instancias.forEach(i => {
      if (i.estilo !== 'one') return;
      const resto = Math.max(0, tacticos - clamp(i.puntosTacticos, 0, tacticos));
      if (resto) candidatos.push({ etiqueta: `Arma a una mano: ${resto} punto(s) táctico(s) a la defensa`, valor: -resto, escudo: false });
    });
    const par = pj.armas.pares && pj.armas.pares.escudo, inst = par && par.escudo ? pj.armas.instancias.find(i => i.id === par.escudo) : null;
    const a = inst && reg.arma(inst.base);
    let escudo = 0, hayEscudo = false;
    if (a && a.escudo) {
      hayEscudo = true;
      const nivel = lvE(pj, 'shield'), ap = aporteEscudo(efectoCombinado(pj, 'shield'), a);
      escudo = ap.ca;
      if (ap.ca) candidatos.push({ etiqueta: `Arma-escudo (${a.nombre}), nivel ${nivel}`, valor: ap.ca, escudo: true });
    }
    const mejor = candidatos.reduce((m, c) => (!m || c.valor < m.valor ? c : m), null);
    return { mejor, escudo, hayEscudo, escudoAplicado: !!(mejor && mejor.escudo) };
  };
  A_.efectosCA = function (pj, reg) {
    const e = A_.estiloCA(pj, reg).mejor;
    return e ? [{ origen: 'Armas', etiqueta: e.etiqueta, objetivo: 'ca', valor: e.valor, nota: '' }] : [];
  };
  acc.formato = { sutileza: v => (v === 'DES' ? 'DES' : 'FUE') };
})((typeof window !== 'undefined' ? window : globalThis).ADND);
