/* Pericias sin arma (PNA). Sin DOM. Se pagan de las PNA que da la clase (más las flexibles de INT).
   - Costo inicial: el de la pericia, +1 si está fuera de las categorías de tus clases. Las concedidas (raza, kit, DJ…) cuestan 0.
   - Cada mejora cuesta 1 PNA y suma 1 al objetivo, sin límite.
   - Objetivo = característica + modificador + mejoras: se tira d20 y debe salir igual o menos.
   - Una pericia de conocimiento (INT/SAB fuera de las Generales) no se puede probar sin entrenar; el resto, sin entrenar, lleva +4 al d20. */
(function (A) {
  'use strict';
  const R = A.reglas, num = A.util.num;
  const GRUPO = { Luchador: 'guerrero', Divino: 'sacerdote', Bribon: 'bribon', Arcano: 'mago' };
  const N = (R.noArmas = {});

  /* Categorías accesibles: la unión de las de todas tus clases. Clase homebrew: las suyas o, si no las declara, las de su grupo de THAC0. */
  N.categorias = function (items) {
    const out = new Set(['general']);
    items.forEach(x => {
      const c = x.clase, base = A.base.accesoPericias[c.id];
      (Array.isArray(c.catPericias) ? c.catPericias : base || [GRUPO[c.thaco] || 'guerrero']).forEach(k => out.add(k));
    });
    return out;
  };
  const acceso = (p, cats) => (p.cats || []).some(k => cats.has(k));
  const conocimiento = p => ['INT', 'SAB'].includes(p.car) && !(p.cats || []).includes('general');
  N.costoInicial = (p, cats) => (num(p.costo) || 1) + (acceso(p, cats) ? 0 : 1);
  const pagoInicial = (o, p, cats) => (o.concedida ? 0 : N.costoInicial(p, cats));
  N.gasto = function (pj, reg, cats) {
    return Object.entries(pj.pericias.noArmas).reduce((s, [id, o]) => { const p = reg.pericia(id); return s + (p ? pagoInicial(o, p, cats) + num(o.mejoras) : 0); }, 0);
  };
  const opciones = p => (Array.isArray(p.opciones) ? p.opciones : []);
  const modDe = (p, o) => (opciones(p).length ? (opciones(p).includes(o.mod) ? o.mod : opciones(p)[0]) : (typeof p.mod === 'number' ? p.mod : null));
  const objetivo = (p, o, car) => {
    const m = modDe(p, o);
    if (p.car === 'NA' || p.car === 'Especial' || m === null) return null;
    const stat = p.car === 'FUE/CAR' ? num(car[o.car === 'CAR' ? 'CAR' : 'FUE'].total) : num(car[p.car].total);
    return stat + m + num(o.mejoras);
  };

  N.resumen = function (pj, reg, items, car, pnaLibres) {
    const cats = N.categorias(items);
    const lista = Object.entries(pj.pericias.noArmas).map(([id, o]) => {
      const p = reg.pericia(id); if (!p) return { id, o, p: null };
      const t = objetivo(p, o, car);
      return { id, o, p, objetivo: t, sinEntrenar: t === null ? null : t - 4, costo: pagoInicial(o, p, cats) + num(o.mejoras), modificador: modDe(p, o), car: p.car === 'FUE/CAR' ? o.car : p.car };
    });
    const consulta = p => {
      const t = objetivo(p, { mejoras: 0, car: 'FUE', mod: null }, car);
      return { objetivo: t, sinEntrenar: t === null ? null : t - 4, acceso: acceso(p, cats), conocimiento: conocimiento(p), costo: N.costoInicial(p, cats) };
    };
    return { cats, lista, consulta, gastado: N.gasto(pj, reg, cats), libres: pnaLibres };
  };

  /* Acciones: devuelven un texto con el motivo si no se puede. */
  const acc = (N.acc = {});
  acc.comprar = (pj, reg, items, libres, id) => {
    const p = reg.pericia(id); if (!p) return 'Esa pericia ya no existe.';
    if (pj.pericias.noArmas[id]) return 'Ya tienes esa pericia.';
    const c = N.costoInicial(p, N.categorias(items));
    if (libres < c) return `Te faltan PNA: cuesta ${c} y tienes ${libres}.`;
    pj.pericias.noArmas[id] = { mejoras: 0, concedida: false, fuente: '', car: 'FUE', mod: opciones(p)[0] === undefined ? null : opciones(p)[0] };
    return null;
  };
  acc.conceder = (pj, reg, id, fuente) => {
    const p = reg.pericia(id); if (!p) return 'Elige una pericia.';
    const o = pj.pericias.noArmas[id];
    if (o) { o.concedida = true; o.fuente = String(fuente || ''); return null; }
    pj.pericias.noArmas[id] = { mejoras: 0, concedida: true, fuente: String(fuente || ''), car: 'FUE', mod: opciones(p)[0] === undefined ? null : opciones(p)[0] };
    return null;
  };
  acc.mejorar = (pj, libres, id, d) => {
    const o = pj.pericias.noArmas[id]; if (!o) return null;
    if (d > 0 && libres < 1) return 'No te quedan PNA para mejorar.';
    o.mejoras = Math.max(0, num(o.mejoras) + d); return null;
  };
  acc.quitar = (pj, id) => { delete pj.pericias.noArmas[id]; return null; };
  acc.elegir = (pj, id, campo, valor) => { const o = pj.pericias.noArmas[id]; if (!o) return; if (campo === 'car') o.car = valor === 'CAR' ? 'CAR' : 'FUE'; else o.mod = num(valor); };
})((typeof window !== 'undefined' ? window : globalThis).ADND);
