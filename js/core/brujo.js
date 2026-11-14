/* Brujo: magia por petición a un patrón. Sin DOM, pura y probable en Node.
   - Un solo pacto: su lista de patrón (2 escuelas arcanas, esferas divinas y conjuros firma) y siete técnicas, una por rango de título (niveles 1, 4, 7, 10, 13, 16 y 19).
   - Espacios: tabla propia + conjuros adicionales por SAB (como los divinos; SAB decide cómo lanza) + extras del juego (±).
   - Conjuros: solo puede preparar los que su patrón ya le concedió (conocidos). Pedir (preparar) un conjuro toma 10 min × nivel − ajuste de reacción de CAR (mín. 1 min).
     Un conjuro nuevo se pide al patrón gastando puntos de pacto (su nivel en puntos), siempre dentro de la lista de su pacto.
   - Puntos de pacto: nivel + ajuste de reacción de CAR (mín. 1). Se gastan en técnicas activas y en conjuros nuevos. Se recuperan pidiendo al patrón: 2d10 + ajuste de reacción de CAR (cada petición dura 60 min). */
(function (A) {
  'use strict';
  const R = A.reglas, num = A.util.num, CJ = R.conjuros;
  const NIV = 9, ceros = () => new Array(NIV).fill(0);
  const nivelDe = (items, id) => items.filter(x => x.clase.id === id).reduce((m, x) => Math.max(m, x.nivel), 0);
  const MIN_PETICION = 60;
  CJ.brujoPeticionMin = MIN_PETICION;

  /* Minutos para pedir (preparar) un conjuro: 10 por nivel menos el ajuste de reacción, nunca menos de 1. */
  CJ.minutosPedir = (nv, ajuste) => Math.max(1, 10 * Math.max(1, Math.round(num(nv))) - Math.round(num(ajuste)));
  CJ.puntosPacto = (nivel, ajuste, bono) => (nivel > 0 ? Math.max(1, Math.round(nivel + num(ajuste))) : 0) + (nivel > 0 ? Math.round(num(bono)) : 0);

  /* Reacción del patrón: 2d10 + ajuste de reacción de CAR. */
  const TABLA = [
    { hasta: 4, nombre: 'Hostil', dados: null, texto: 'No recuperas nada y el patrón pide un favor.' },
    { hasta: 8, nombre: 'Seco', dados: null, texto: 'No recuperas nada.' },
    { hasta: 12, nombre: 'Indiferente', dados: [0, 0], fijo: 1, texto: 'Recuperas 1 punto.' },
    { hasta: 16, nombre: 'Favorable', dados: [1, 4], texto: 'Recuperas 1d4 puntos.' },
    { hasta: 999, nombre: 'Entusiasta', dados: [2, 4], texto: 'Recuperas 2d4 puntos.' }
  ];
  CJ.reaccionTabla = TABLA;
  CJ.reaccionPatron = total => TABLA.find(x => total <= x.hasta);

  /* ¿Está el conjuro en la lista de su patrón? Los firma siempre; los arcanos por escuela, los divinos por esfera (mayores). */
  CJ.enPacto = (sp, pacto, top) => {
    if (!pacto || !sp || sp.nv > top) return false;
    if ((pacto.firma || []).includes(sp.id)) return true;
    if (sp.tipo === 'arcano') return (sp.escuelas || []).some(e => (pacto.escuelas || []).includes(e));
    return CJ.esferasDe(sp).some(e => (pacto.esferas || []).includes(e));
  };

  const info = (reg, id) => reg.conjuro(id) || { id, nombre: id, faltante: true, nv: 0, escuelas: [], rev: false };

  CJ.resumenBrujo = (pj, reg, items, car, avisos) => {
    const st = pj.conjuros.brujo, B = A.base.brujo, lv = nivelDe(items, 'brujo');
    const pacto = st.pacto ? reg.pacto(st.pacto) : null;
    const ajuste = Math.round(num(car && car.CAR && car.CAR.fila && car.CAR.fila['Reacción']));
    const tabla = lv > 0 ? B.tabla[Math.min(30, lv)].slice() : ceros();
    let top = 0; tabla.forEach((v, i) => { if (v > 0) top = i + 1; });
    const sab = lv > 0 ? CJ.bonoSab(car) : { por: ceros(), puntaje: 0, fallo: 0 };
    const aplicados = tabla.map((v, i) => (v > 0 ? sab.por[i] : 0)), pendientes = tabla.map((v, i) => (v > 0 ? 0 : sab.por[i]));
    const juego = tabla.map((_, i) => Math.round(num(st.extraEspacios[i + 1])));
    const total = tabla.map((v, i) => Math.max(0, v + aplicados[i] + juego[i]));
    const pTotal = Math.max(0, CJ.puntosPacto(lv, ajuste, st.bonoPuntos)), gastados = Math.min(st.gastados, pTotal);
    const conocidos = st.conocidos.map(id => info(reg, id));
    const prep = st.preparados.map((x, i) => Object.assign({ i }, x, { sp: info(reg, x.id), minutos: CJ.minutosPedir(info(reg, x.id).nv, ajuste) }));
    const niveles = [];
    for (let n = 1; n <= NIV; n++) {
      const delNivel = prep.filter(x => x.sp.nv === n), conoc = conocidos.filter(x => x.nv === n), usados = delNivel.filter(x => x.usado).length;
      if (!total[n - 1] && !delNivel.length && !conoc.length && !pendientes[n - 1]) continue;
      niveles.push({ n, base: tabla[n - 1], sab: aplicados[n - 1], pendiente: pendientes[n - 1], bono: juego[n - 1], total: total[n - 1], preparados: delNivel.length, memorizados: delNivel, faltan: Math.max(0, total[n - 1] - delNivel.length), usados, disponibles: delNivel.length - usados, conocidos: conoc, minutosPorConjuro: CJ.minutosPedir(n, ajuste), exceso: delNivel.length > total[n - 1] });
      if (delNivel.length > total[n - 1]) avisos.push(`Brujo: preparas ${delNivel.length} conjuros de nivel ${n} y solo tienes ${total[n - 1]} espacio(s).`);
    }
    if (lv && !pacto) avisos.push('Brujo: elige un pacto.');
    conocidos.forEach(sp => {
      if (sp.faltante) avisos.push(`Un conjuro del brujo ya no existe en tu biblioteca (${sp.id}).`);
      else if (pacto && lv && !CJ.enPacto(sp, pacto, Math.max(top, sp.nv))) avisos.push(`Brujo: "${sp.nombre}" ya no está en la lista de tu patrón.`);
      else if (lv && sp.nv > top) avisos.push(`Brujo: "${sp.nombre}" es de nivel ${sp.nv} y aún solo alcanzas el nivel ${top}.`);
    });
    if (lv && sab.fallo) avisos.push(`Brujo: tu SAB (${sab.puntaje}) da ${sab.fallo}% de fallo de conjuro.`);
    const nombresEsc = (pacto ? pacto.escuelas : []).map(id => (reg.escuelaMagia(id) || { nombre: id }).nombre);
    const tecnicas = pacto ? pacto.tecnicas.map((t, r) => ({ rango: r + 1, nivel: B.niveles[r], titulo: B.titulos[r], nombre: t.nombre, efecto: t.efecto, pasiva: !!t.pasiva, costo: t.pasiva ? 0 : num(t.costo), activa: lv >= B.niveles[r], alcanzable: lv >= B.niveles[r] })) : [];
    const minutosTotal = prep.reduce((s, x) => s + x.minutos, 0);
    return {
      id: 'brujo', nivel: lv, activo: lv > 0 || !!pacto || st.conocidos.length > 0 || st.preparados.length > 0, top, ajuste, base: tabla, aplicados, pendientes, bonoEspacios: juego, espacios: total, niveles,
      sab: sab.por, sabPuntaje: sab.puntaje, fallo: sab.fallo, totalPreparados: prep.length, totalEspacios: total.reduce((s, v) => s + v, 0), minutosTotal, minutosFaltan: niveles.reduce((s, n) => s + n.faltan * n.minutosPorConjuro, 0),
      puntos: { total: pTotal, gastados, restan: pTotal - gastados }, bonoPuntos: Math.round(num(st.bonoPuntos)), motivo: st.motivo,
      pacto: pacto ? { id: pacto.id, nombre: pacto.nombre, desc: pacto.desc, escuelas: pacto.escuelas, esferas: pacto.esferas, firma: pacto.firma, nombresEscuelas: nombresEsc, nombresEsferas: pacto.esferas.map(CJ.nombreEsfera) } : null,
      pactos: reg.pactos.map(x => ({ id: x.id, nombre: x.nombre })), tecnicas, conocidos, favores: st.favores, historial: st.historial, notas: st.notas, peticionMin: MIN_PETICION
    };
  };

  /* ------------------------------------------------------------------ acciones (devuelven un texto si no se pudo) */
  const br = (CJ.br = {});
  const E = pj => pj.conjuros.brujo;
  br.pacto = (pj, reg, id) => { if (id && !reg.pacto(id)) return 'Ese pacto no existe.'; E(pj).pacto = String(id || ''); return null; };
  br.bono = (pj, v) => { E(pj).bonoPuntos = Math.max(-99, Math.min(99, Math.round(num(v)))); return null; };
  br.motivo = (pj, t) => { E(pj).motivo = String(t || '').slice(0, 300); return null; };
  br.notas = (pj, t) => { E(pj).notas = String(t || '').slice(0, 4000); return null; };
  br.gastados = (pj, v) => { E(pj).gastados = Math.max(0, Math.round(num(v))); return null; };
  br.extra = (pj, n, v) => { const o = E(pj).extraEspacios, x = Math.max(-9, Math.min(9, Math.round(num(v)))); if (x) o[n] = x; else delete o[n]; return null; };
  /* Gasto manual (técnica o lo que decida la mesa). */
  br.gastar = (pj, rs, n) => {
    const c = Math.max(0, Math.round(num(n)));
    if (rs.puntos.restan < c) return `Te quedan ${rs.puntos.restan} punto(s) de pacto y cuesta ${c}.`;
    E(pj).gastados = rs.puntos.gastados + c; return null;
  };
  br.tecnica = (pj, rs, rango) => {
    const t = rs.tecnicas[rango - 1]; if (!t) return 'Esa técnica no existe.';
    if (!t.activa) return `Pide nivel ${t.nivel} de Brujo.`;
    if (t.pasiva) return 'Es pasiva: siempre está activa.';
    return br.gastar(pj, rs, t.costo);
  };
  /* Pedir conjuros nuevos al patrón: cuesta su nivel en puntos de pacto (o nada si te lo concede el DM). */
  br.pedirNuevo = (pj, reg, rs, spId, gratis) => {
    const sp = reg.conjuro(spId), pacto = rs.pacto ? reg.pacto(rs.pacto.id) : null;
    if (!pacto) return 'Elige un pacto primero.';
    if (!sp) return 'Ese conjuro no existe.';
    if (!rs.nivel) return 'Agrega la clase Brujo en Progresión.';
    if (E(pj).conocidos.includes(spId)) return 'Tu patrón ya te concedió ese conjuro.';
    if (sp.nv > rs.top) return `Aún no alcanzas el nivel ${sp.nv} de conjuro (llegas al ${rs.top}).`;
    if (!CJ.enPacto(sp, pacto, rs.top)) return 'Ese conjuro no está en la lista de tu patrón.';
    if (!gratis) { if (rs.puntos.restan < sp.nv) return `Te quedan ${rs.puntos.restan} punto(s) de pacto y cuesta ${sp.nv}.`; E(pj).gastados = rs.puntos.gastados + sp.nv; }
    E(pj).conocidos.push(spId); return null;
  };
  br.olvidar = (pj, spId) => { const st = E(pj); st.conocidos = st.conocidos.filter(x => x !== spId); st.preparados = st.preparados.filter(x => x.id !== spId); return null; };
  /* Pedir (preparar) un conjuro ya concedido en un espacio libre. */
  br.preparar = (pj, reg, rs, spId, inv) => {
    const st = E(pj), sp = reg.conjuro(spId); if (!sp) return 'Ese conjuro no existe.';
    if (!st.conocidos.includes(spId)) return 'Tu patrón aún no te ha concedido ese conjuro.';
    const n = rs.niveles.find(x => x.n === sp.nv);
    if (!n || n.total < 1) return `No tienes espacios de nivel ${sp.nv}.`;
    if (n.preparados >= n.total) return `Ya llenaste tus ${n.total} espacio(s) de nivel ${sp.nv}.`;
    st.preparados.push({ id: spId, inv: !!(inv && sp.rev), usado: false }); return null;
  };
  br.despreparar = (pj, i) => { E(pj).preparados.splice(i, 1); return null; };
  br.usar = (pj, i) => { const x = E(pj).preparados[i]; if (x) x.usado = !x.usado; return null; };
  br.invertir = (pj, reg, i) => { const x = E(pj).preparados[i], sp = x && reg.conjuro(x.id); if (x && sp && sp.rev) x.inv = !x.inv; return null; };
  /* Petición de puntos: 2d10 + ajuste de reacción. `azar(caras)` devuelve 1..caras (se inyecta para poder probar). */
  br.pedir = (pj, rs, azar) => {
    const st = E(pj); if (!rs.nivel) return 'Agrega la clase Brujo en Progresión.';
    const d1 = azar(10), d2 = azar(10), total = d1 + d2 + rs.ajuste, r = CJ.reaccionPatron(total);
    let puntos = 0, texto = `${d1} + ${d2} ${rs.ajuste >= 0 ? '+' : '−'} ${Math.abs(rs.ajuste)} = ${total}`;
    if (r.fijo) puntos = r.fijo;
    else if (r.dados) { const t = []; for (let k = 0; k < r.dados[0]; k++) t.push(azar(r.dados[1])); puntos = t.reduce((s, v) => s + v, 0); texto += ` · dados ${t.join('+')}`; }
    const recupera = Math.min(puntos, rs.puntos.gastados);
    st.gastados = Math.max(0, rs.puntos.gastados - puntos);
    if (r.hasta <= 4 && st.favores.length < 30) st.favores.push({ texto: 'Favor que pide el patrón (reacción hostil)', cumplido: false });
    st.historial.unshift({ total, nombre: r.nombre, puntos: recupera, texto });
    st.historial = st.historial.slice(0, 10);
    return null;
  };
  br.favorAgregar = (pj) => { const f = E(pj).favores; if (f.length < 30) f.push({ texto: '', cumplido: false }); return null; };
  br.favorTexto = (pj, i, t) => { const f = E(pj).favores[i]; if (f) f.texto = String(t || '').slice(0, 300); return null; };
  br.favorHecho = (pj, i, v) => { const f = E(pj).favores[i]; if (f) f.cumplido = !!v; return null; };
  br.favorQuitar = (pj, i) => { E(pj).favores.splice(i, 1); return null; };
  br.limpiarHistorial = pj => { E(pj).historial = []; return null; };
})((typeof window !== 'undefined' ? window : globalThis).ADND);
