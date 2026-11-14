/* Equipo y Tienda (motor puro, sin DOM).
   - Dinero en centavos de moneda de oro enteros: mc = 1, mp = 10, me = 50, mo = 100, mpl = 500 (se evitan errores de decimales).
   - Pago con conversión: se gasta primero la moneda del precio, luego las menores (de mayor a menor) y al final las mayores; si hace falta romper una moneda grande se devuelve el cambio en mo/mp/mc.
   - Carga: objetos de la Mochila (salvo los "Puestos"), monedas (50 = 0,45 kg), tesoros de la Mochila y la armadura que lleva puesta (torso 50 %, brazos 25 %, piernas 25 %).
     Los estados Normal / Cargado / Sobrecargado son informativos: no cambian el movimiento ni ningún número de la hoja.
   - Los objetos guardan una copia (nombre, peso, valor); cambiar la tienda después no altera lo ya comprado. */
(function (A) {
  'use strict';
  const U = A.util, R = A.reglas, E = (R.equipo = {});
  const VAL = { mc: 1, mp: 10, me: 50, mo: 100, mpl: 500 }, ORDEN = ['mc', 'mp', 'me', 'mo', 'mpl'], KG_MONEDA = 0.009;
  E.MONEDAS = ORDEN; E.VALOR_CENTAVOS = VAL; E.KG_MONEDA = KG_MONEDA;
  E.TIPOS = { transporte: 'Transporte y alojamiento', fortalezas: 'Fortaleza', propiedades: 'Propiedades' };
  const num = v => { const n = Number(String(v === undefined || v === null ? '' : v).replace(',', '.')); return Number.isFinite(n) ? n : 0; };
  const r2 = v => Math.round(v * 100) / 100, r3 = v => Math.round(v * 1000) / 1000;

  /* "3 mp", "5–10 mo", "3 mp / 4 mo", "2 mc / milla": toma el primer precio; en rangos, el mínimo (aprox). */
  E.parseCoste = txt => {
    const m = String(txt || '').replace(',', '.').match(/(\d+(?:\.\d+)?)(?:\s*[–-]\s*(\d+(?:\.\d+)?))?\s*(mc|mp|me|mo|mpl)\b/i);
    if (!m) return { valor: null, aprox: false, den: 'mo' };
    const den = m[3].toLowerCase();
    return { valor: r2(Number(m[1]) * VAL[den] / 100), aprox: !!m[2], den };
  };
  E.aCentavos = mo => Math.round(num(mo) * 100);
  E.valorMonedas = m => r2(ORDEN.reduce((s, k) => s + Math.floor(num(m && m[k])) * VAL[k], 0) / 100);
  E.centavosMonedas = m => ORDEN.reduce((s, k) => s + Math.floor(num(m && m[k])) * VAL[k], 0);
  E.pesoMonedas = m => r3(ORDEN.reduce((s, k) => s + Math.floor(num(m && m[k])), 0) * KG_MONEDA);
  const copia = m => { const o = {}; ORDEN.forEach(k => { o[k] = Math.floor(num(m && m[k])); }); return o; };

  /* Cambio en mo/mp/mc (no en me ni mpl, para no repartir monedas raras). */
  const cambio = c => { const o = { mo: Math.floor(c / 100) }; c %= 100; o.mp = Math.floor(c / 10); o.mc = c % 10; return o; };

  /* Paga `centavos` desde `monedas`. Devuelve { ok, monedas, cambio, error }; no modifica el original. */
  E.pagar = (monedas, centavos, den) => {
    const m = copia(monedas), coste = Math.max(0, Math.round(centavos));
    if (E.centavosMonedas(m) < coste) return { ok: false, monedas: m, error: `Faltan ${r2((coste - E.centavosMonedas(m)) / 100)} mo.` };
    const p = ORDEN.includes(den) ? den : 'mo', i = ORDEN.indexOf(p);
    const orden = [p, ...ORDEN.slice(0, i).reverse(), ...ORDEN.slice(i + 1)];
    let resto = coste;
    orden.forEach(k => { const n = Math.min(m[k], Math.floor(resto / VAL[k])); m[k] -= n; resto -= n * VAL[k]; });
    let dado = null;
    if (resto > 0) {
      const k = ORDEN.find(x => m[x] > 0 && VAL[x] > resto);
      m[k] -= 1; dado = cambio(VAL[k] - resto);
      ORDEN.forEach(x => { if (dado[x]) m[x] += dado[x]; });
    }
    return { ok: true, monedas: m, cambio: dado };
  };
  E.cobrar = (monedas, centavos) => { const m = copia(monedas), c = cambio(Math.max(0, Math.round(centavos))); ORDEN.forEach(k => { if (c[k]) m[k] += c[k]; }); return m; };

  /* ------------------------------------------------------------ carga */
  E.pesoArmadura = (pj, reg) => {
    const rep = { torso: 0.5, brazos: 0.25, piernas: 0.25 }, ar = (pj && pj.armadura) || {}, tabla = (A.base.tienda && A.base.tienda.pesoArmaduras) || {};
    let total = 0; const partes = [];
    Object.keys(rep).forEach(k => {
      const id = ar[k] && ar[k].tipo; if (!id) return;
      const a = reg.armadura(id), entero = a && a.peso ? num(a.peso) : num(tabla[id]);
      const kg = r3(entero * rep[k]); if (kg > 0) { total += kg; partes.push({ parte: k, armadura: a ? a.nombre : id, kg }); }
    });
    return { total: r3(total), partes };
  };
  const pesoGuarda = (g, sinPuestos) => {
    const obj = (g.items || []).reduce((s, x) => s + (sinPuestos && x.estado === 'Puesto' ? 0 : num(x.cant) * num(x.peso)), 0);
    const tes = (g.tesoros || []).reduce((s, x) => s + num(x.cant) * num(x.peso), 0);
    return { objetos: r3(obj), monedas: E.pesoMonedas(g.monedas), tesoros: r3(tes) };
  };
  E.carga = (pj, reg, fila) => {
    const g = pesoGuarda(pj.equipo.mochila, true), ar = E.pesoArmadura(pj, reg);
    const total = r3(g.objetos + g.monedas + g.tesoros + ar.total);
    const aut = fila && fila['Peso autorizado'] !== undefined ? num(fila['Peso autorizado']) : null, max = fila && fila['Peso máximo'] !== undefined ? num(fila['Peso máximo']) : null;
    const estado = aut === null || max === null ? '' : total <= aut ? 'Normal' : total <= max ? 'Cargado' : 'Sobrecargado';
    return { total, objetos: g.objetos, monedas: g.monedas, tesoros: g.tesoros, armadura: ar.total, armaduraPartes: ar.partes, autorizado: aut, maximo: max, estado };
  };
  E.cargaUbicacion = u => {
    const g = pesoGuarda(u, false), total = r3(g.objetos + g.monedas + g.tesoros), cap = u.capacidad === '' || u.capacidad === undefined ? null : num(u.capacidad);
    return { total, capacidad: cap, pct: cap ? Math.round(total / cap * 100) : null, exceso: cap !== null && total > cap };
  };

  /* ------------------------------------------------------------ riqueza */
  const valorGuarda = g => {
    let sin = 0;
    const obj = (g.items || []).reduce((s, x) => { if (x.valor === '' || x.valor === undefined) { if (num(x.cant) > 0) sin++; return s; } return s + num(x.cant) * num(x.valor); }, 0);
    const tes = (g.tesoros || []).reduce((s, x) => { if (x.valor === '' || x.valor === undefined) { if (num(x.cant) > 0) sin++; return s; } return s + num(x.cant) * num(x.valor); }, 0);
    return { objetos: r2(obj), monedas: E.valorMonedas(g.monedas), tesoros: r2(tes), sinTasar: sin };
  };
  E.riqueza = eq => {
    const filas = []; let conocido = 0, sinTasar = 0, ingreso = 0, gasto = 0;
    const meter = (tipo, nombre, u, extra, id) => {
      const v = valorGuarda(u), total = r2(v.objetos + v.monedas + v.tesoros + extra);
      filas.push({ tipo, id, nombre, objetos: v.objetos, monedas: v.monedas, tesoros: v.tesoros, propiedad: r2(extra), total, sinTasar: v.sinTasar });
      conocido += total; sinTasar += v.sinTasar;
    };
    meter('mochila', 'Mochila', eq.mochila, 0, 'mochila');
    (eq.transporte || []).forEach(u => meter('transporte', u.nombre || 'Sin nombre', u, 0, u.id));
    (eq.fortalezas || []).forEach(u => { meter('fortalezas', u.nombre || 'Sin nombre', u, (u.mejoras || []).reduce((s, m) => s + num(m.coste), 0), u.id); gasto += num(u.mantenimiento); });
    (eq.propiedades || []).forEach(u => { meter('propiedades', u.nombre || 'Sin nombre', u, num(u.valor), u.id); ingreso += num(u.ingreso); gasto += num(u.gasto); });
    return { filas, conocido: r2(conocido), sinTasar, ingresoMensual: r2(ingreso), gastoMensual: r2(gasto), netoMensual: r2(ingreso - gasto) };
  };

  /* ------------------------------------------------------------ acciones (modifican pj.equipo; llamar dentro de S.cambiar) */
  const id = () => 'e' + U.uid() + U.uid();
  E.objetoNuevo = d => Object.assign({ id: id(), nombre: '', cant: 1, peso: '', valor: '', estado: 'Guardado', notas: '' }, d || {});
  E.tesoroNuevo = d => Object.assign({ id: id(), tipo: 'Tesoro', desc: '', cant: 1, valor: '', peso: '', estado: 'Sin identificar', notas: '' }, d || {});
  E.mejoraNueva = d => Object.assign({ id: id(), nombre: '', coste: '', estado: '', desc: '' }, d || {});
  E.ubicacionNueva = (tipo, nombre) => ({ id: id(), nombre: nombre || '', capacidad: '', lugar: '', tam: '', estado: '', defensas: '', personal: '', mantenimiento: 0, valor: '', ingreso: 0, gasto: 0, mejoras: [], items: [], monedas: copia(), tesoros: [], notas: '' });
  E.lugar = (eq, tipo, uid) => tipo === 'mochila' ? eq.mochila : ((eq[tipo] || []).find(u => u.id === uid) || null);
  const anotar = (eq, mo, f, ahora) => { eq.gastos.push({ t: ahora || '', mo: r2(mo), f }); if (eq.gastos.length > 200) eq.gastos.shift(); };
  E.anotar = anotar;

  /* Compra. opts: { cant, destino:{tipo,id}, tesoreria:{tipo,id}, precioUnit (mo, opcional), ahora }. */
  E.comprar = (eq, item, opts) => {
    opts = opts || {}; const cant = Math.max(1, Math.floor(num(opts.cant) || 1));
    const unit = opts.precioUnit !== undefined && opts.precioUnit !== '' ? num(opts.precioUnit) : item.valor;
    if (unit === null || unit === undefined) return { ok: false, error: 'Este objeto no tiene precio: escribe uno o usa "Agregar sin pagar".' };
    const centavos = Math.round(unit * 100 * cant), den = E.parseCoste(item.coste).den;
    const tes = E.lugar(eq, (opts.tesoreria || {}).tipo || 'mochila', (opts.tesoreria || {}).id);
    if (!tes) return { ok: false, error: 'La tesorería elegida ya no existe.' };
    const esServicio = item.destino === 'Servicio';
    const dest = esServicio ? null : E.lugar(eq, (opts.destino || {}).tipo || 'mochila', (opts.destino || {}).id);
    if (!esServicio && !dest) return { ok: false, error: 'El destino elegido ya no existe.' };
    const pago = E.pagar(tes.monedas, centavos, den);
    if (!pago.ok) return { ok: false, error: pago.error };
    tes.monedas = pago.monedas;
    if (!esServicio) E.agregar(eq, item, { cant, destino: opts.destino, precioUnit: unit });
    anotar(eq, -centavos / 100, `${esServicio ? 'Servicio' : 'Compra'}: ${cant > 1 ? cant + ' × ' : ''}${item.nombre}`, opts.ahora);
    return { ok: true, centavos, cambio: pago.cambio };
  };
  E.agregar = (eq, item, opts) => {
    opts = opts || {}; const dest = E.lugar(eq, (opts.destino || {}).tipo || 'mochila', (opts.destino || {}).id); if (!dest) return false;
    const cant = Math.max(1, Math.floor(num(opts.cant) || 1)), peso = item.peso === null || item.peso === undefined ? '' : item.peso;
    const valor = opts.precioUnit !== undefined && opts.precioUnit !== null ? opts.precioUnit : (item.valor === null || item.valor === undefined ? '' : item.valor);
    const igual = dest.items.find(x => x.nombre === item.nombre && x.estado === 'Guardado' && String(x.peso) === String(peso) && String(x.valor) === String(valor));
    if (igual) igual.cant = num(igual.cant) + cant; else dest.items.push(E.objetoNuevo({ nombre: item.nombre, cant, peso, valor, notas: item.notas || '' }));
    return true;
  };
  /* Venta: suma las monedas a `tesoreria` (por defecto el mismo lugar) y resta la cantidad. precioTotal (mo) sobrescribe el % por defecto. */
  E.vender = (eq, tipo, uid, objId, cant, opts) => {
    opts = opts || {}; const lug = E.lugar(eq, tipo, uid); if (!lug) return { ok: false, error: 'Ubicación inexistente.' };
    const o = lug.items.find(x => x.id === objId); if (!o) return { ok: false, error: 'Objeto inexistente.' };
    const n = Math.max(1, Math.min(Math.floor(num(cant) || 1), Math.floor(num(o.cant)) || 1));
    if (o.valor === '' && (opts.precioTotal === undefined || opts.precioTotal === '')) return { ok: false, error: 'El objeto no tiene valor: escribe el precio de venta.' };
    const total = opts.precioTotal !== undefined && opts.precioTotal !== '' ? num(opts.precioTotal) : num(o.valor) * n * num(eq.pctVenta) / 100;
    const centavos = Math.round(total * 100);
    const tes = E.lugar(eq, (opts.tesoreria || {}).tipo || tipo, (opts.tesoreria || {}).id || uid) || lug;
    tes.monedas = E.cobrar(tes.monedas, centavos);
    o.cant = num(o.cant) - n; if (o.cant <= 0) lug.items.splice(lug.items.indexOf(o), 1);
    anotar(eq, centavos / 100, `Venta: ${n > 1 ? n + ' × ' : ''}${o.nombre}`, opts.ahora);
    return { ok: true, centavos };
  };
  E.precioVenta = (o, n, pct) => r2(num(o.valor) * Math.max(1, n || 1) * num(pct) / 100);
})((typeof window !== 'undefined' ? window : globalThis).ADND);
