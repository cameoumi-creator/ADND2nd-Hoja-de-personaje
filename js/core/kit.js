/* Regalos de un kit (motor puro): competencias de arma, grupos, especializaciones, pericias sin arma y bonos de arma.
   Todo es gratis (no gasta PA ni PNA). Los bonos pueden ser fijos o crecer con el nivel de la clase del kit:
   valor inicial desde el nivel `desde`, más `paso` cada `cada` niveles, con tope opcional.
   Un kit solo cuenta mientras su clase gobierna (en clase dual, la congelada no aporta). */
(function (A) {
  'use strict';
  const R = A.reglas, num = A.util.num, K = (R.kit = {});
  K.STATS = ['gac0', 'dano', 'rt'];
  K.vacio = () => ({ armas: [], grupos: [], esp: [], espGrupo: [], noArmas: [], bonos: [] });

  /* Valor de un bono al nivel dado (positivo = mejora). */
  K.valorBono = (b, nivel) => {
    const desde = Math.max(1, num(b.desde) || 1);
    if (nivel < desde) return 0;
    const cada = Math.max(0, num(b.cada)), paso = num(b.paso) || 1;
    let v = num(b.valor) + (cada > 0 ? Math.floor((nivel - desde) / cada) * paso : 0);
    const tope = Math.abs(num(b.tope));
    if (tope) v = v >= 0 ? Math.min(v, tope) : Math.max(v, -tope);
    return v;
  };
  K.etiquetaAplica = (a, nombres) => { a = String(a || 'todas'); if (a === 'todas') return 'todas las armas'; if (a === 'cuerpo') return 'armas cuerpo a cuerpo'; if (a === 'distancia') return 'armas a distancia'; const [t, id] = a.split(':'); return t === 'grupo' ? 'grupo ' + id : (nombres && nombres[id]) || id; };
  const aplica = (b, arma) => {
    const a = String(b.aplica || 'todas'); if (!arma) return false;
    if (a === 'todas') return true; if (a === 'cuerpo') return arma.tipo !== 'distancia'; if (a === 'distancia') return arma.tipo === 'distancia';
    const i = a.indexOf(':'); const t = a.slice(0, i), id = a.slice(i + 1);
    return t === 'grupo' ? arma.grupo === id : t === 'arma' ? arma.id === id : false;
  };

  K.regalos = (items, gob) => {
    const o = { armas: new Map(), grupos: new Map(), spec: new Map(), specGrupo: new Map(), noArmas: new Map(), bonos: [], fuentes: [] };
    const fuente = (m, k, f) => { if (!m.has(k)) m.set(k, f); };
    const mayor = (m, k, n, f) => { if (!m.has(k) || m.get(k).n < n) m.set(k, { n, f }); };
    (gob && gob.length ? gob : (items || []).slice(0, 1)).forEach(x => {
      (x.clase && x.clase.gratis || []).forEach(id => { if (!o.noArmas.has(id)) o.noArmas.set(id, { mejoras: 0, f: x.clase.nombre }); });
      const kit = x.clase && x.clase.kit, r = kit && kit.regalos; if (!r) return;
      o.fuentes.push(kit.nombre);
      (r.armas || []).forEach(id => fuente(o.armas, id, kit.nombre)); (r.grupos || []).forEach(g => fuente(o.grupos, g, kit.nombre));
      (r.esp || []).forEach(e => mayor(o.spec, e.id, Math.min(5, num(e.n)), kit.nombre)); (r.espGrupo || []).forEach(e => mayor(o.specGrupo, e.grupo, Math.min(5, num(e.n)), kit.nombre));
      (r.noArmas || []).forEach(p => { const a = o.noArmas.get(p.id); if (!a) o.noArmas.set(p.id, { mejoras: Math.max(0, num(p.mejoras)), f: kit.nombre }); else a.mejoras = Math.max(a.mejoras, Math.max(0, num(p.mejoras))); });
      (r.bonos || []).forEach(b => o.bonos.push(Object.assign({}, b, { f: kit.nombre, nivel: x.nivel })));
    });
    return o;
  };

  /* Suma de bonos del kit para un arma: { gac0, dano, rt, partes:[{ et, stat, v }] } (positivo = mejora). */
  K.bonosDe = (regalos, arma) => {
    const out = { gac0: 0, dano: 0, rt: 0, partes: [] };
    ((regalos && regalos.bonos) || []).forEach(b => {
      if (!K.STATS.includes(b.stat) || !aplica(b, arma)) return;
      const v = K.valorBono(b, b.nivel); if (!v) return;
      out[b.stat] += v; out.partes.push({ et: `Kit ${b.f}`, stat: b.stat, v });
    });
    return out;
  };
})((typeof window !== 'undefined' ? window : globalThis).ADND);
