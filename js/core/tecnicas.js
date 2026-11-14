/* Técnicas de clase: habilidades de Bribón (Ladrón, Bardo, Explorador, Bárbaro, Techno) y habilidades de Bárbaro. Sin DOM.
   Las ocho habilidades de bribón existen para cualquier personaje: base de la mejor clase que las tenga, más raza, DES, armadura,
   puntos repartidos y un ajuste manual. Las razas y clases homebrew no traen tablas: usa el ajuste manual de cada habilidad. */
(function (A) {
  'use strict';
  const R = A.reglas, num = A.util.num, clamp = A.util.clamp;
  const T = () => A.base.tecnicas;
  const T_ = (R.tecnicas = {});

  const nivelDe = (items, id) => { const x = items.find(i => i.clase.id === id); return x ? clamp(num(x.nivel), 0, 30) : 0; };
  const claseArm = c => (c === 'Ligera' || c === 'Media' || c === 'Pesada' ? c : 'Sin armadura');
  const fila = (tabla, nivel) => tabla[Math.min(nivel, tabla.length - 1)] || 0;
  T_.presupuestos = (t, b) => ({ ladron: t ? 60 + 30 * (t - 1) : 0, bardo: b ? 20 + 15 * (b - 1) : 0, topeLadron: t ? 30 + 15 * (t - 1) : 0, topeBardo: b ? 10 + 8 * (b - 1) : 0 });
  const suma = o => Object.values(o || {}).reduce((s, v) => s + num(v), 0);
  const PISO = { climb: 40, noise: 15 };
  const PUEDE_BARDO = ['pick', 'noise', 'climb', 'read'];

  function baseDe(k, lv) {
    const B = T().bribon, v = [];
    if (lv.ladron) v.push(B.baseLadron[k] || 0);
    if (lv.bardo && k in B.baseBardo) v.push(B.baseBardo[k]);
    if (lv.explorador && B.explorador[k]) v.push(fila(B.explorador[k], Math.min(20, lv.explorador)) || 99);
    if (lv.barbaro && k === 'climb') v.push(fila(B.barbaro.climb, Math.min(20, lv.barbaro)) || 95);
    if (lv.techno && B.techno[k]) v.push(fila(B.techno[k], Math.min(15, lv.techno)) || 99);
    return Math.max(PISO[k] || 0, ...v);   // todas las criaturas parten de 40% en Escalar y 15% en Escuchar; las bases específicas se respetan si son mayores
  }

  T_.resumen = function (pj, reg, items, car, armadura) {
    const B = T().bribon, tp = pj.tecnicas.bribon;
    const lv = { ladron: nivelDe(items, 'ladron'), bardo: nivelDe(items, 'bardo'), explorador: nivelDe(items, 'explorador'), barbaro: nivelDe(items, 'barbaro'), techno: nivelDe(items, 'techno') };
    const raza = pj.raza.id, des = clamp(Math.floor(num(car.DES.total)), 1, 25), arm = claseArm(armadura);
    const pres = T_.presupuestos(lv.ladron, lv.bardo);
    const rr = B.raza[raza] || B.raza.humano, dd = B.des[des] || [0, 0, 0, 0, 0], aa = B.armadura[arm];
    const habilidades = B.habilidades.map(([k, nombre], i) => {
      const base = baseDe(k, lv), raz = rr[i] || 0, d = i < 5 ? (dd[i] || 0) : 0, a = aa[i] || 0;
      const l = num(tp.ladron[k]), b = num(tp.bardo[k]), m = num(tp.manual[k]);
      const bruto = base + raz + d + a + l + b + m;
      return { k, nombre, base, raza: raz, des: d, armadura: a, ladron: l, bardo: b, manual: m, bruto, total: clamp(bruto, 0, 99), puedeLadron: !!lv.ladron, puedeBardo: !!lv.bardo && PUEDE_BARDO.includes(k) };
    });
    const desbloqueadas = lv.ladron >= 20 || lv.bardo >= 20;
    const ar = (T().bribon.avanzadasRaza[raza] || T().bribon.avanzadasRaza.humano), ad = B.avanzadasDes[clamp(des, 9, 22)] || [0, 0], aarm = B.avanzadasArmadura[arm];
    const avanzadas = B.avanzadas.map(([k, nombre, base], i) => {
      const permitida = lv.ladron >= 20 || (lv.bardo >= 20 && tp.bardoAvanzadas.includes(k));
      const raz = ar[i] || 0, d = k === 'escape' ? ad[0] : k === 'tunnel' ? ad[1] : 0, a = k === 'bribe' ? aarm[0] : k === 'escape' ? aarm[1] : k === 'tunnel' ? aarm[2] : 0;
      const l = num(tp.ladron[k]), b = num(tp.bardo[k]), m = num(tp.manual[k]);
      const bruto = base + raz + d + a + l + b + m;
      return { k, nombre, base, raza: raz, des: d, armadura: a, ladron: l, bardo: b, manual: m, bruto, total: clamp(bruto, 0, 99), permitida, puedeLadron: lv.ladron >= 20, puedeBardo: lv.bardo >= 20 && tp.bardoAvanzadas.includes(k) };
    });
    const t = lv.ladron, b = lv.bardo, mult = t >= 13 ? 5 : t >= 9 ? 4 : t >= 5 ? 3 : 2;
    const clase = {
      ladron: t ? { espalda: mult, furtivo: `${mult}d6` } : null,
      bardo: b ? { saber: b * 5 + num(tp.saberMod), saberBase: b * 5, salvacion: -Math.floor(b / 3), inspiracion: Math.ceil(b / 4), alcance: b * 10, duracion: b } : null
    };
    const nb = lv.barbaro ? Math.min(20, lv.barbaro) : 0, X = pj.tecnicas.barbaro.extra, Bb = T().barbaro;
    const pct = (base, extra) => { const raw = base + num(extra); return raw > 95 ? `95% (+${raw - 95})` : raw + '%'; };
    const dado = (base, extra) => { extra = String(extra || '').trim(); if (!extra || extra === '0') return base; const n = Number(extra); return Number.isFinite(n) ? base + (n > 0 ? ' +' + n : ' ' + n) : base + ' ' + extra; };
    const barbaro = nb ? {
      nivel: nb, filas: [
        { k: 'espalda', nombre: 'Espalda sensible', base: Bb.espalda[nb] + '%', total: pct(Bb.espalda[nb], X.espalda), numerico: true },
        { k: 'escalar', nombre: 'Escalar paredes', base: Bb.escalar[nb] + '%', total: pct(Bb.escalar[nb], X.escalar), numerico: true },
        { k: 'cf', nombre: 'Salto en carrera, al frente', base: Bb.correrFrente[nb], total: dado(Bb.correrFrente[nb], X.cf) },
        { k: 'qf', nombre: 'Salto quieto, al frente', base: Bb.quietoFrente[nb], total: dado(Bb.quietoFrente[nb], X.qf) },
        { k: 'ca', nombre: 'Salto en carrera, hacia arriba', base: Bb.correrArriba[nb], total: dado(Bb.correrArriba[nb], X.ca) },
        { k: 'qa', nombre: 'Salto quieto, hacia arriba', base: Bb.quietoArriba[nb], total: dado(Bb.quietoArriba[nb], X.qa) }
      ]
    } : null;
    const E = A.base.espadachin, ne = Math.min(30, nivelDe(items, 'espadachin')), md = pj.tecnicas.espadachin ? num(car.FUE.fila && car.FUE.fila['Daño']) : 0;
    const rangos = pj.tecnicas.espadachin.rangos, ganados = E.niveles.filter(n => ne >= n).length, gastados = reg.escuelas.reduce((s, e) => s + Math.min(e.tecnicas.length, num(rangos[e.id])), 0);
    const activa = armadura !== 'Pesada';
    const dinamico = txt => {
      const dur = Math.max(1, md), sg2 = md >= 0 ? '+ ' : '− ';
      const sg = md >= 0 ? '+' : '−';
      return String(txt)
        .replace(/1 round\/MD/gi, '\u0001')
        .replace(/\s*[+−-]\s*MD\b/g, () => ` ${sg2}${Math.abs(md)}`)
        .replace(/\bMD\b/g, `${sg}${Math.abs(md)}`)
        .replace(/\u0001/g, `${dur} round${dur === 1 ? '' : 's'} (mín. 1; MD ${sg}${Math.abs(md)})`);
    };
    const escuelas = reg.escuelas.map(esc => ({ id: esc.id, nombre: esc.nombre, origen: esc.origen, rango: Math.min(esc.tecnicas.length, num(rangos[esc.id])), tecnicas: esc.tecnicas.map((t, r) => ({ rango: r + 1, nivel: E.niveles[r], titulo: E.titulos[r], nombre: t.nombre, efecto: dinamico(t.efecto), adquirida: num(rangos[esc.id]) > r, siguiente: num(rangos[esc.id]) === r, alcanzable: ne >= E.niveles[r] })) }));
    const espadachin = { nivel: ne, ganados, gastados, restantes: ganados - gastados, md, touki: ne ? Math.floor(ne / 3) : 0, activa, escuelas, adquiridas: escuelas.flatMap(e => e.tecnicas.filter(t => t.adquirida).map(t => Object.assign({ escuela: e.nombre }, t))) };
    return { espadachin, niveles: lv, presupuestos: pres, usados: { ladron: suma(pj.tecnicas.bribon.ladron), bardo: suma(pj.tecnicas.bribon.bardo) }, armadura: arm, des, raza, habilidades, avanzadas, desbloqueadas, clase, barbaro };
  };

  const acc = (T_.acc = {});
  acc.punto = (pj, res, pool, k, d) => {
    const p = pj.tecnicas.bribon, B = res.presupuestos, lim = pool === 'ladron' ? B.ladron : B.bardo, tope = pool === 'ladron' ? B.topeLadron : B.topeBardo;
    const dest = p[pool];
    if (d > 0) {
      if (suma(dest) >= lim) return `No quedan puntos de ${pool === 'ladron' ? 'Ladrón' : 'Bardo'}.`;
      if (num(dest[k]) >= tope) return 'Esa habilidad llegó al máximo que permiten tus niveles.';
      dest[k] = num(dest[k]) + 1;
    } else dest[k] = Math.max(0, num(dest[k]) - 1);
    if (!dest[k]) delete dest[k];
    return null;
  };
  /* Escuelas del Espadachín: las técnicas se adquieren en orden dentro de su escuela (rango 1, 2, 3…). */
  acc.espComprar = (pj, res, escuela, rango) => {
    const E = res.espadachin, esc = E.escuelas.find(e => e.id === escuela); if (!esc) return null;
    if (rango !== esc.rango + 1) return 'Las técnicas de una escuela se adquieren en orden.';
    if (rango > esc.tecnicas.length) return 'Esa escuela no tiene más técnicas.';
    if (!esc.tecnicas[rango - 1].alcanzable) return `Pide nivel ${esc.tecnicas[rango - 1].nivel} de Espadachín.`;
    if (E.restantes < 1) return 'No te quedan elecciones de Espadachín.';
    pj.tecnicas.espadachin.rangos[escuela] = rango; return null;
  };
  acc.espQuitar = (pj, res, escuela, rango) => {
    const esc = res.espadachin.escuelas.find(e => e.id === escuela); if (!esc) return null;
    if (rango !== esc.rango) return 'Solo puedes quitar la última técnica de la escuela.';
    if (rango - 1 > 0) pj.tecnicas.espadachin.rangos[escuela] = rango - 1; else delete pj.tecnicas.espadachin.rangos[escuela]; return null;
  };
  acc.manual = (pj, k, v) => { const n = Math.round(num(v)); if (n) pj.tecnicas.bribon.manual[k] = n; else delete pj.tecnicas.bribon.manual[k]; };
  acc.avanzada = (pj, k, on) => {
    const l = pj.tecnicas.bribon.bardoAvanzadas;
    if (on) { if (l.includes(k)) return null; if (l.length >= 2) return 'El Bardo solo puede escoger 2 habilidades avanzadas.'; l.push(k); } else pj.tecnicas.bribon.bardoAvanzadas = l.filter(x => x !== k);
    return null;
  };
})((typeof window !== 'undefined' ? window : globalThis).ADND);
