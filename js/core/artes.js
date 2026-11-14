/* Artes marciales. Sin DOM, pura y probable en Node.
   - Hasta 3 artes. Cada arte cuesta 1 pericia y cada movimiento 1 más; se pagan con PA o PNA (el jugador elige cuántas van a PA).
   - Los movimientos se aprenden en orden dentro de su grupo (Candado 1 antes que Candado 2); quitar uno quita los siguientes del grupo.
   - CA: solo cuenta el mejor modificador entre tus artes (no se suman) y solo sin armadura o con peto ligero.
     Piel de acero (−2) es aparte y solo sin armadura; la hace valer R.armadura.
   - Cada arte conocida da un ataque desarmado en la pestaña Armas (arma "am:<arte>"), con RT 1/1 más sus ataques extra. */
(function (A) {
  'use strict';
  const R = A.reglas, num = A.util.num;
  const AR = (R.artes = {});
  const MAX = 3;
  const grupoDe = k => { const m = String(k).match(/^(.*?)(\d+)\s*$/); return m ? { grupo: m[1].trim(), nv: parseInt(m[2], 10) } : { grupo: String(k).trim(), nv: 0 }; };
  const estado = pj => pj.tecnicas.artes;

  /* Movimientos de un arte ordenados dentro de cada grupo: { ...mov, grupo, nv, previos: [claves que se exigen antes] } */
  const movsDe = arte => {
    const base = arte.movs.map((m, i) => Object.assign({ i }, m, grupoDe(m.k)));
    return base.map(m => Object.assign({}, m, { previos: base.filter(o => o.grupo === m.grupo && (o.nv < m.nv || (o.nv === m.nv && o.i < m.i))).map(o => o.k) }));
  };

  /* Puntos que se gastan: 1 por arte conocida y 1 por movimiento. */
  AR.costo = (pj, reg) => estado(pj).lista.reduce((s, x) => { const a = reg.arte(x.id); return s + (a ? 1 + x.movs.filter(k => a.movs.some(m => m.k === k)).length : 0); }, 0);
  AR.gasto = (pj, reg) => {
    const costo = AR.costo(pj, reg), pa = Math.min(costo, Math.max(0, Math.round(num(estado(pj).pa))));
    return { costo, pa, pna: costo - pa };
  };

  /* Lo que las artes hacen por la CA (sin mirar la armadura: R.armadura decide si está activa). */
  AR.ca = (pj, reg) => {
    let arte = null, piel = null;
    estado(pj).lista.forEach(x => {
      const a = reg.arte(x.id); if (!a) return;
      if (a.ac < 0 && (!arte || a.ac < arte.valor)) arte = { id: a.id, nombre: a.nombre, valor: a.ac };
      x.movs.forEach(k => { const m = a.movs.find(q => q.k === k); if (m && m.ca < 0 && (!piel || m.ca < piel.valor)) piel = { arte: a.nombre, nombre: m.nombre, valor: m.ca }; });
    });
    return { arte, piel };
  };

  AR.resumen = (pj, reg, pericias) => {
    const e = estado(pj), g = AR.gasto(pj, reg);
    const artes = e.lista.map(x => {
      const a = reg.arte(x.id);
      if (!a) return { id: x.id, faltante: true, nombre: x.id };
      const movs = movsDe(a).map(m => ({ k: m.k, nombre: m.nombre, efecto: m.efecto, ca: m.ca, sinArmadura: m.sinArmadura, adquirido: x.movs.includes(m.k), previos: m.previos, listo: m.previos.every(p => x.movs.includes(p)) }));
      return { id: a.id, nombre: a.nombre, origen: a.origen, atk: a.atk, extra: Math.max(0, a.atk - 1), dano: a.dano, ac: a.ac, met: a.met, armas: a.armas, movs, comprados: movs.filter(m => m.adquirido).length, rt: A.reglas.armas ? A.reglas.armas.rtEtiqueta(2 * a.atk) : '1/1' };
    });
    return { max: MAX, artes, costo: g.costo, pa: g.pa, pna: g.pna, saldoPA: pericias.disponiblesPA, saldoPNA: pericias.disponiblesPNA, ca: AR.ca(pj, reg), disponibles: reg.artes.filter(a => !e.lista.some(x => x.id === a.id)) };
  };

  /* ---- Sincronía con la pestaña Armas: cada arte conocida tiene su ataque desarmado, que no se puede quitar aparte ---- */
  AR.sincronizar = (pj, reg) => {
    const ids = new Set(estado(pj).lista.filter(x => reg.arte(x.id)).map(x => x.id));
    const A_ = pj.armas;
    A_.instancias = A_.instancias.filter(i => !String(i.base).startsWith('am:') || ids.has(String(i.base).slice(3)));
    ids.forEach(id => {
      const clave = 'am:' + id;
      if (!A_.instancias.some(i => i.base === clave)) A_.instancias.push({ id: 'inst-am-' + id, base: clave, nombre: '', modo: 'Cuerpo', magico: 0, rtMagico: 0, dadoMagico: 0, ajusteGac0: 0, ajusteDano: 0, sutileza: 'FUE', estilo: 'none', puntosTacticos: 0, notas: '' });
      if (!A_.dominio[clave]) A_.dominio[clave] = { pagada: 0, regalada: 0, origen: '' };
    });
    Object.keys(A_.dominio).forEach(k => { if (k.startsWith('am:') && !ids.has(k.slice(3))) delete A_.dominio[k]; });
    estado(pj).pa = Math.min(Math.max(0, Math.round(num(estado(pj).pa))), AR.costo(pj, reg));
    const vivo = new Set(A_.instancias.map(i => i.id));
    ['buena', 'mala'].forEach(k => { if (!vivo.has(A_.pares.dos[k])) A_.pares.dos[k] = ''; });
    ['arma', 'escudo'].forEach(k => { if (!vivo.has(A_.pares.escudo[k])) A_.pares.escudo[k] = ''; });
  };

  /* ---- Acciones: devuelven un texto con el motivo si no se pudo ---- */
  const acc = (AR.acc = {});
  acc.anadir = (pj, reg, saldoPNA, id) => {
    const a = reg.arte(id), e = estado(pj);
    if (!a) return 'Ese arte no existe.';
    if (e.lista.some(x => x.id === id)) return 'Ya conoces ese arte.';
    if (e.lista.length >= MAX) return `Solo puedes conocer ${MAX} artes marciales.`;
    if (saldoPNA < 1) return 'No te quedan PNA. Pasa un punto de PA a PNA con "Pagar con PA" o libera una pericia.';
    e.lista.push({ id, movs: [] }); AR.sincronizar(pj, reg); return null;
  };
  acc.quitar = (pj, reg, id) => { estado(pj).lista = estado(pj).lista.filter(x => x.id !== id); AR.sincronizar(pj, reg); return null; };
  acc.mov = (pj, reg, saldoPNA, id, k) => {
    const x = estado(pj).lista.find(q => q.id === id), a = reg.arte(id); if (!x || !a) return 'Ese arte no existe.';
    const mov = movsDe(a).find(m => m.k === k); if (!mov) return 'Ese movimiento no existe.';
    if (x.movs.includes(k)) {
      const quitar = new Set([k, ...movsDe(a).filter(m => m.previos.includes(k)).map(m => m.k)]);
      x.movs = x.movs.filter(q => !quitar.has(q)); return null;
    }
    const falta = mov.previos.filter(p => !x.movs.includes(p));
    if (falta.length) return `Antes necesitas ${falta.join(', ')}.`;
    if (saldoPNA < 1) return 'No te quedan PNA. Pasa un punto de PA a PNA con "Pagar con PA" o libera una pericia.';
    x.movs.push(k); return null;
  };
  /* d > 0 paga un punto más con PA; d < 0, uno más con PNA. */
  acc.pago = (pj, reg, saldoPA, saldoPNA, d) => {
    const g = AR.gasto(pj, reg), e = estado(pj);
    if (d > 0) { if (g.pa >= g.costo) return 'Ya pagas todo con PA.'; if (saldoPA < 1) return 'No te quedan PA.'; e.pa = g.pa + 1; return null; }
    if (g.pa <= 0) return null;
    if (saldoPNA < 1) return 'No te quedan PNA para recibir ese punto.';
    e.pa = g.pa - 1; return null;
  };
})((typeof window !== 'undefined' ? window : globalThis).ADND);
