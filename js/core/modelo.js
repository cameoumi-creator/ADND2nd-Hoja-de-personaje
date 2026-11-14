/* Modelo del personaje: forma de los datos, valores por defecto y normalización.
   Un solo objeto es la fuente de verdad; la interfaz solo lo lee y lo modifica. */
(function (A) {
  'use strict';
  const U = A.util;
  A.FORMATO = 'ADND2_FICHA';
  A.VERSION = 1;

  A.nuevoPersonaje = function () {
    const bonos = {};
    Object.keys(A.OBJETIVOS).forEach(k => { bonos[k] = []; });
    const car = {}; A.STATS.forEach(s => { car[s] = '10'; });
    return {
      formato: A.FORMATO, version: A.VERSION, id: 'pj-' + U.uid() + U.uid(),
      creado: U.ahora(), modificado: U.ahora(),
      identidad: { nombre: '', jugador: '', alineamiento: 'Neutral', sexo: '', edad: '', altura: '', peso: '', deidad: '', apariencia: '' },
      caracteristicas: car,
      raza: { id: 'humano', variante: '', elecciones: {} },
      trayectoria: 'unica',
      clases: [{ clase: 'guerrero', kit: '', estado: 'Activa', modo: 'auto', nivel: 1, xp: 0 }],
      bonoXp: 0,
      pg: { modo: 'maximo', tiradas: {}, extra: [], actual: null },
      bonos,
      pericias: { noArmas: {}, flex: { pa: 0, pna: 0 }, ambidestria: { comprada: false, reserva: 'PA' }, armas: [], otras: [] },
      idiomas: { aprendidos: [] },
      armadura: normalizarArmadura({}),
      tecnicas: normalizarTecnicas({}),
      conjuros: normalizarConjuros({}),
      psionica: normalizarPsionica({}),
      dotes: normalizarDotes({}),
      equipo: normalizarEquipo({}),
      historia: normalizarHistoria({}),
      companeros: normalizarCompaneros({}),
      imagenes: normalizarImagenes({}),
      armas: { dominio: {}, grupos: {}, estilos: {}, combos: {}, instancias: [], pares: { dos: { buena: '', mala: '' }, escudo: { arma: '', escudo: '' } } },
      notas: { general: '', historia: '', equipo: '' }
    };
  };

  const entero = (v, min, max) => U.clamp(Math.round(U.num(v)), min, max);
  function normalizarArmas(a, base) {
    a = a && typeof a === 'object' ? a : {};
    const o = { dominio: {}, grupos: {}, estilos: {}, combos: {}, instancias: [], pares: JSON.parse(JSON.stringify(base.pares)) };
    Object.entries(a.dominio || {}).forEach(([id, d]) => { if (id) o.dominio[id] = { pagada: entero(d && d.pagada, 0, 5), regalada: entero(d && d.regalada, 0, 5), origen: String((d && d.origen) || '') }; });
    Object.entries(a.grupos || {}).forEach(([g, d]) => { if (g) o.grupos[g] = { comp: !!(d && d.comp), spec: entero(d && d.spec, 0, 2) }; });
    Object.entries(a.estilos || {}).forEach(([k, v]) => { const n = entero(v, 0, 5); if (n) o.estilos[k] = n; });
    Object.entries(a.combos || {}).forEach(([k, v]) => { const n = entero(v, 0, 4); if (n) o.combos[k] = n; });
    o.instancias = (Array.isArray(a.instancias) ? a.instancias : []).filter(i => i && i.base).map(i => ({
      id: String(i.id || U.idNuevo('inst', i.base)), base: String(i.base), nombre: String(i.nombre || ''), modo: i.modo === 'Distancia' || i.modo === 'Arrojada' ? i.modo : 'Cuerpo',
      magico: entero(i.magico, -5, 10), rtMagico: entero(i.rtMagico, 0, 5), dadoMagico: entero(i.dadoMagico, 0, 5),
      ajusteGac0: entero(i.ajusteGac0, -20, 20), ajusteDano: entero(i.ajusteDano, -20, 20),
      sutileza: i.sutileza === 'DES' ? 'DES' : 'FUE', estilo: String(i.estilo || 'none'), puntosTacticos: entero(i.puntosTacticos, 0, 4), notas: String(i.notas || '')
    }));
    const p = a.pares || {};
    o.pares.dos = { buena: String((p.dos && p.dos.buena) || ''), mala: String((p.dos && p.dos.mala) || '') };
    o.pares.escudo = { arma: String((p.escudo && p.escudo.arma) || ''), escudo: String((p.escudo && p.escudo.escudo) || '') };
    return o;
  }

  /* Rellena lo que falte y corrige tipos. Sirve para archivos viejos, editados a mano o de otra versión. */
  const normalizarArmadura = a => {
    a = a && typeof a === 'object' ? a : {};
    const pieza = (x, cob) => { x = x && typeof x === 'object' ? x : {}; const o = { tipo: String(x.tipo || ''), magico: U.num(x.magico), nota: String(x.nota || '') }; if (cob) o.cob = Number(x.cob) === 1 ? 1 : 2; return o; };
    const equipo = {};
    (A.base.ranurasEquipo || []).forEach(([k]) => { const q = (a.equipo && a.equipo[k]) || {}; equipo[k] = { nombre: String(q.nombre || ''), ca: U.num(q.ca), magico: U.num(q.magico), desc: String(q.desc || '') }; });
    return {
      torso: pieza(a.torso), brazos: pieza(a.brazos, true), piernas: pieza(a.piernas, true), equipo,
      generales: (Array.isArray(a.generales) ? a.generales : []).map(g => ({ origen: String((g && g.origen) || ''), valor: U.num(g && g.valor), aplica: ['total', 'todas', 'total+toque', 'total+dureza'].includes(g && g.aplica) ? g.aplica : 'total' })),
      manual: U.num(a.manual), extra: U.num(a.extra), notas: String(a.notas || '')
    };
  };
  const normalizarArtes = a => {
    a = a && typeof a === 'object' ? a : {};
    const vistos = new Set();
    const lista = (Array.isArray(a.lista) ? a.lista : []).filter(x => x && x.id && !vistos.has(String(x.id)) && vistos.add(String(x.id))).slice(0, 3)
      .map(x => ({ id: String(x.id), movs: [...new Set((Array.isArray(x.movs) ? x.movs : []).map(String))] }));
    return { pa: Math.max(0, Math.round(U.num(a.pa))), lista };
  };
  const normalizarTechno = t => {
    t = t && typeof t === 'object' ? t : {};
    /* Versiones anteriores tenían un texto de "invento" por facultad: ahora el taller lo cubre, así que ese texto pasa a las notas. */
    const inv = t.inventos && typeof t.inventos === 'object' ? t.inventos : {}, nombres = { dano: 'Daño melee', proy: 'Daño a distancia', area: 'Área', rt: 'Round trip', arm: 'Armadura', montura: 'Montura' };
    const viejos = Object.keys(nombres).filter(k => String(inv[k] || '').trim()).map(k => `${nombres[k]}: ${String(inv[k]).trim()}`);
    const notas = [String(t.notas || '').trim()].concat(viejos.length && !String(t.notas || '').includes(viejos[0]) ? ['Inventos anteriores: ' + viejos.join(' · ')] : []).filter(Boolean).join('\n');
    const tipos = ['Arma melee', 'Arma distancia', 'Arma de área', 'Armadura', 'Montura', 'Munición', 'Dispositivo', 'Otro'], ids = new Set();
    const conArma = x => x.tipo === 'Arma melee' || x.tipo === 'Arma distancia';
    const taller = (Array.isArray(t.taller) ? t.taller : []).filter(x => x && x.nombre).map(x => {
      let id = String(x.id || U.idNuevo('taller', x.nombre)); while (ids.has(id)) id += 'x'; ids.add(id);
      const tipo = tipos.includes(x.tipo) ? x.tipo : 'Otro', cap = String(x.capacidad || '');
      const it = { id, nombre: String(x.nombre), tipo, nivel: Math.max(0, Math.round(U.num(x.nivel))), dueno: String(x.dueno || ''), base: String(x.base || ''), capacidad: cap, fuente: String(x.fuente || ''), resultado: String(x.resultado || x.capacidad || ''), desc: String(x.desc || ''), img: A.imagenSegura(x.img), entregada: String(x.entregada || '') };
      /* Un arma fabricada es un arma de verdad (se puede equipar y entregar). Las creaciones viejas con "daño base" se convierten. */
      if (conArma(it)) {
        const a0 = x.arma && typeof x.arma === 'object' ? x.arma : { nombre: it.nombre, grupo: 'Techno', dm: it.base || '1d6', dg: it.base || '1d6', tam: 'M' };
        it.arma = A.sanear.arma(Object.assign({}, a0, { id: String(a0.id || 'tecno-' + id), nombre: a0.nombre || it.nombre, tipo: tipo === 'Arma distancia' ? 'distancia' : 'cuerpo', grupo: a0.grupo || 'Techno', techDado: a0.techDado !== undefined ? a0.techDado : cap }));
        it.nombre = it.arma.nombre; it.base = it.arma.dm;
        it.rtBono = Math.max(0, Math.round(U.num(x.rtBono !== undefined ? x.rtBono : it.arma.techRt)));
      }
      if (tipo === 'Armadura' && x.armadura && typeof x.armadura === 'object') { it.armadura = A.sanear.armadura(Object.assign({}, x.armadura, { id: String(x.armadura.id || 'tecno-arm-' + id) })); it.bono = Math.max(0, Math.round(U.num(x.bono))); it.nombre = it.armadura.nombre; }
      if (tipo === 'Arma de área' && x.area) it.area = A.sanear.techArea(x.area);
      if (tipo === 'Montura' && x.montura) it.montura = A.sanear.techMontura(x.montura);
      return it;
    });
    return { notas, taller };
  };
  /* Conjuros: mago (libro, memorizados o puntos) y hechicero (linaje, conjuros elegidos y puntos gastados). */
  const normalizarConjuros = c => {
    c = c && typeof c === 'object' ? c : {}; const m = c.mago && typeof c.mago === 'object' ? c.mago : {}, h = c.hechicero && typeof c.hechicero === 'object' ? c.hechicero : {};
    const ids = l => [...new Set((Array.isArray(l) ? l : []).map(String).filter(Boolean))].slice(0, 400);
    const mapaNiv = (o, mn, mx) => { const r = {}; for (let n = 1; n <= 9; n++) { const v = Math.max(mn, Math.min(mx, Math.round(U.num(o && o[n])))); if (v) r[n] = v; } return r; };
    const esferasValidas = new Set((A.base.esferas || []).map(e => e.id));
    const lanzador = x => {
      x = x && typeof x === 'object' ? x : {}; const e = x.esferas && typeof x.esferas === 'object' ? x.esferas : {};
      const may = ids(e.mayores).filter(i => esferasValidas.has(i)), men = ids(e.menores).filter(i => esferasValidas.has(i) && !may.includes(i));
      return {
        modo: x.modo === 'puntos' ? 'puntos' : 'memorizar', gastados: Math.max(0, Math.round(U.num(x.gastados))), bonoPuntos: Math.max(-99, Math.min(99, Math.round(U.num(x.bonoPuntos)))),
        extraEspacios: mapaNiv(x.extraEspacios, -9, 9), motivo: String(x.motivo || '').slice(0, 300), libro: ids(x.libro),
        memorizados: (Array.isArray(x.memorizados) ? x.memorizados : []).slice(0, 200).filter(q => q && q.id).map(q => ({ id: String(q.id), inv: !!q.inv, usado: !!q.usado })),
        esferas: { mayores: may, menores: men }, fuente: x.fuente === 'deidad' ? 'deidad' : 'manual', notas: String(x.notas || '').slice(0, 4000)
      };
    };
    const cls = c.clases && typeof c.clases === 'object' ? c.clases : {};
    const b = c.brujo && typeof c.brujo === 'object' ? c.brujo : {};
    const brujo = {
      pacto: String(b.pacto || ''), gastados: Math.max(0, Math.round(U.num(b.gastados))), bonoPuntos: Math.max(-99, Math.min(99, Math.round(U.num(b.bonoPuntos)))),
      extraEspacios: mapaNiv(b.extraEspacios, -9, 9), motivo: String(b.motivo || '').slice(0, 300), conocidos: ids(b.conocidos),
      preparados: (Array.isArray(b.preparados) ? b.preparados : []).slice(0, 200).filter(q => q && q.id).map(q => ({ id: String(q.id), inv: !!q.inv, usado: !!q.usado })),
      favores: (Array.isArray(b.favores) ? b.favores : []).slice(0, 30).map(f => ({ texto: String((f && f.texto) || '').slice(0, 300), cumplido: !!(f && f.cumplido) })),
      historial: (Array.isArray(b.historial) ? b.historial : []).slice(0, 10).map(x => ({ total: Math.round(U.num(x && x.total)), nombre: String((x && x.nombre) || '').slice(0, 40), puntos: Math.max(0, Math.round(U.num(x && x.puntos))), texto: String((x && x.texto) || '').slice(0, 120) })),
      notas: String(b.notas || '').slice(0, 4000)
    };
    return {
      brujo,
      clases: Object.fromEntries((A.base.lanzadores || []).map(d => [d.id, lanzador(cls[d.id])])),
      mago: {
        bonoPuntos: Math.max(-99, Math.min(99, Math.round(U.num(m.bonoPuntos)))), extraEspacios: mapaNiv(m.extraEspacios, -9, 9), motivo: String(m.motivo || '').slice(0, 300), escuela: String(m.escuela || ''), opcionales: !!m.opcionales, modo: m.modo === 'puntos' ? 'puntos' : 'memorizar', gastados: Math.max(0, Math.round(U.num(m.gastados))), libro: ids(m.libro),
        memorizados: (Array.isArray(m.memorizados) ? m.memorizados : []).slice(0, 200).filter(x => x && x.id).map(x => ({ id: String(x.id), inv: !!x.inv, usado: !!x.usado }))
      },
      hechicero: { bonoPuntos: Math.max(-99, Math.min(99, Math.round(U.num(h.bonoPuntos)))), extraElegidos: mapaNiv(h.extraElegidos, 0, 9), motivo: String(h.motivo || '').slice(0, 300), linaje: String(h.linaje || ''), elegidos: ids(h.elegidos).slice(0, 40), gastados: Math.max(0, Math.round(U.num(h.gastados))) }
    };
  };
  /* Psiónica: disciplinas, poderes conocidos (ids), PSP gastados, poderes activos y talento salvaje. */
  /* Historia (solo informativa): datos de trasfondo y listas libres. Retratos en `imagenes` (busto y cuerpo entero). */
  const T_ = (v, n) => String(v === undefined || v === null ? '' : v).slice(0, n || 2000);
  const L_ = (v, n) => (Array.isArray(v) ? v : []).filter(x => x && typeof x === 'object').slice(0, n);
  const ID_ = x => T_(x.id, 40) || 'h' + U.uid() + U.uid();
  const en_ = (v, lista, d) => (lista.includes(v) ? v : d);
  A.HISTORIA = {
    estadosObjetivo: ['Activo', 'Cumplido', 'Fracasado', 'Abandonado', 'En pausa'],
    estadosRelacion: ['Vivo / activo', 'Desaparecido', 'Muerto', 'Desconocido'],
    etiquetas: ['Aliado', 'Rival', 'Enemigo', 'Amigo', 'Familia', 'Romance', 'Mentor', 'Discípulo', 'Contacto', 'Deudor', 'Juramento', 'Facción'],
    tiposHito: ['Hazaña', 'Derrota', 'Título', 'Recompensa', 'Juramento', 'Maldición', 'Descubrimiento'],
    tiposSecreto: ['Secreto del personaje', 'Información descubierta', 'Rumor', 'Conocimiento prohibido']
  };
  const normalizarHistoria = x => {
    x = x && typeof x === 'object' ? x : {}; const H = A.HISTORIA, o = {};
    ['titulo', 'origen', 'estatus', 'afiliacion', 'profesion', 'lema', 'motivacion', 'temor', 'ideales', 'rasgos'].forEach(k => { o[k] = T_(x[k], 4000); });
    o.objetivos = L_(x.objetivos, 100).map(v => ({ id: ID_(v), nombre: T_(v.nombre, 300), estado: en_(v.estado, H.estadosObjetivo, 'Activo'), notas: T_(v.notas, 2000) }));
    o.relaciones = L_(x.relaciones, 200).map(v => ({ id: ID_(v), nombre: T_(v.nombre, 200), vinculo: T_(v.vinculo, 300), actitud: T_(v.actitud, 200), estado: en_(v.estado, H.estadosRelacion, 'Vivo / activo'), org: T_(v.org, 300), notas: T_(v.notas, 2000),
      etiquetas: [...new Set((Array.isArray(v.etiquetas) ? v.etiquetas : []).map(e => T_(e, 30)).filter(Boolean))].slice(0, 12) }));
    o.hitos = L_(x.hitos, 200).map(v => ({ id: ID_(v), fecha: T_(v.fecha, 100), titulo: T_(v.titulo, 300), lugar: T_(v.lugar, 200), tipo: en_(v.tipo, H.tiposHito, 'Hazaña'), desc: T_(v.desc, 3000) }));
    o.cronica = L_(x.cronica, 300).map(v => ({ id: ID_(v), fecha: T_(v.fecha, 100), titulo: T_(v.titulo, 300), lugar: T_(v.lugar, 200), texto: T_(v.texto, 8000) }));
    o.reputacion = L_(x.reputacion, 100).map(v => ({ id: ID_(v), nombre: T_(v.nombre, 300), quien: T_(v.quien, 300), lugar: T_(v.lugar, 300), notas: T_(v.notas, 2000) }));
    o.secretos = L_(x.secretos, 100).map(v => ({ id: ID_(v), tipo: en_(v.tipo, H.tiposSecreto, 'Secreto del personaje'), info: T_(v.info, 4000), publico: v.publico === true, notas: T_(v.notas, 2000) }));
    return o;
  };
  A.normalizarHistoria = normalizarHistoria;
  const IMG_PJ = 400000, IMG_CHICA = 150000;
  A.IMG_PJ = IMG_PJ; A.IMG_CHICA = IMG_CHICA;
  const imgChica = v => A.imagenSegura(v, IMG_CHICA);
  const normalizarImagenes = x => { x = x && typeof x === 'object' ? x : {}; return { retrato: A.imagenSegura(x.retrato, IMG_PJ), cuerpo: A.imagenSegura(x.cuerpo, IMG_PJ) }; };
  A.normalizarImagenes = normalizarImagenes;
  /* Compañeros (solo informativos): séquito, mascotas, familiar y compañeros registrados con inventario propio (no suma a la carga del personaje). */
  const normalizarCompaneros = x => {
    x = x && typeof x === 'object' ? x : {};
    const campos = (v, ks, n) => { const o = {}; v = v && typeof v === 'object' ? v : {}; ks.forEach(k => { o[k] = T_(v[k], n || 1000); }); return o; };
    const sq = x.secuito && typeof x.secuito === 'object' ? x.secuito : {};
    const filas = (v, ks, tam) => { const a = L_(v, tam).map(f => campos(f, ks)); while (a.length < tam) a.push(campos({}, ks)); return a; };
    const secuito = Object.assign(campos(sq, ['tipo', 'nombre', 'sede', 'moral'], 300), {
      img: imgChica(sq.img),
      seguidores: filas(sq.seguidores, ['nombre', 'clase', 'nv', 'pg', 'ca', 'gac0', 'notas'], 8),
      tropa: campos(sq.tropa, ['tipo', 'numero', 'nv', 'ca', 'moral', 'notas'], 2000),
      gremio: campos(sq.gremio, ['nombre', 'miembros', 'territorio', 'renta', 'notas'], 2000),
      aprendices: filas(sq.aprendices, ['nombre', 'tradicion', 'nv', 'tareas', 'notas'], 6)
    });
    const mascotas = L_(x.mascotas, 30).map(m => Object.assign({ id: ID_(m), img: imgChica(m.img) }, campos(m, ['nombre', 'especie', 'dg', 'pg', 'ca', 'gac0', 'ataque', 'mov', 'notas'], 2000)));
    const fm = x.familiar && typeof x.familiar === 'object' ? x.familiar : {};
    const poderes = L_(fm.poderes, 9).map(p => campos(p, ['poder', 'efecto'], 2000)); while (poderes.length < 9) poderes.push({ poder: '', efecto: '' });
    const familiar = Object.assign(campos(fm, ['nombre', 'tipo', 'dueno', 'nmax', 'pg', 'ca', 'gac0', 'mov', 'inteligencia', 'alcance', 'sentidos', 'estado', 'vinculo'], 2000), { img: imgChica(fm.img), poderes });
    const ESTADOS = ['Activo', 'Descansando', 'Herido', 'Inconsciente', 'Muerto', 'Desaparecido'], TIPOS = ['PNJ / Seguidor', 'Familiar', 'Mascota', 'Montura', 'Animal de guerra', 'Criatura invocada', 'Esbirro', 'Otro'];
    const nn = v => { if (v === '' || v === null || v === undefined || typeof v === 'boolean') return ''; const n = Number(String(v).replace(',', '.')); return Number.isFinite(n) && n >= 0 ? Math.round(n * 1000) / 1000 : ''; };
    const registrados = L_(x.registrados, 100).map(c => Object.assign({ id: ID_(c), img: imgChica(c.img), tipo: en_(c.tipo, TIPOS, 'PNJ / Seguidor'), estado: en_(c.estado, ESTADOS, 'Activo'), oculta: c.oculta === true,
      items: L_(c.items, 200).map(i => ({ id: ID_(i), nombre: T_(i.nombre, 200), cant: nn(i.cant) === '' ? 1 : nn(i.cant), peso: nn(i.peso), notas: T_(i.notas, 500) })) },
      campos(c, ['nombre', 'clase', 'nivel', 'pgAct', 'pgMax', 'ca', 'gac0', 'mov', 'ataque', 'moral', 'lealtad', 'cargaPropia', 'vinculo', 'ordenes', 'dinero', 'notas'], 3000)));
    return { secuito, mascotas, familiar, registrados };
  };
  A.normalizarCompaneros = normalizarCompaneros;
  A.COMPANEROS = { tipos: ['PNJ / Seguidor', 'Familiar', 'Mascota', 'Montura', 'Animal de guerra', 'Criatura invocada', 'Esbirro', 'Otro'], estados: ['Activo', 'Descansando', 'Herido', 'Inconsciente', 'Muerto', 'Desaparecido'], tiposSecuito: ['', 'Tropa (guerrero)', 'Gremio de ladrones (bribón)', 'Aprendices (mago / sacerdote)', 'Mixto / otros'] };

  /* Equipo: mochila (lo que carga el personaje) y ubicaciones (transporte, fortalezas, propiedades) con objetos, monedas y tesoros. */
  const normalizarEquipo = x => {
    x = x && typeof x === 'object' ? x : {};
    const txt = v => String(v === undefined || v === null ? '' : v), lista = v => (Array.isArray(v) ? v : []).filter(v2 => v2 && typeof v2 === 'object');
    const nn = v => { if (v === '' || v === null || v === undefined || typeof v === 'boolean') return ''; const n = Number(String(v).replace(',', '.')); return Number.isFinite(n) && n >= 0 ? Math.round(n * 1000) / 1000 : ''; };
    const nz = v => { const n = nn(v); return n === '' ? 0 : n; };
    const idDe = v => txt(v.id) || 'e' + U.uid() + U.uid();
    const ESTADO_OBJ = ['Guardado', 'Puesto', 'Consumible'], ESTADO_TES = ['Sin identificar', 'Identificado', 'Tasado'];
    const objeto = v => ({ id: idDe(v), nombre: txt(v.nombre), cant: nz(v.cant), peso: nn(v.peso), valor: nn(v.valor), estado: ESTADO_OBJ.includes(v.estado) ? v.estado : 'Guardado', notas: txt(v.notas) });
    const tesoro = v => ({ id: idDe(v), tipo: txt(v.tipo) || 'Tesoro', desc: txt(v.desc), cant: nz(v.cant), valor: nn(v.valor), peso: nn(v.peso), estado: ESTADO_TES.includes(v.estado) ? v.estado : 'Sin identificar', notas: txt(v.notas) });
    const monedas = m => { const o = {}; ['mc', 'mp', 'me', 'mo', 'mpl'].forEach(k => { o[k] = Math.floor(nz(m && m[k])); }); return o; };
    const guarda = v => ({ items: lista(v.items).slice(0, 500).map(objeto), monedas: monedas(v.monedas), tesoros: lista(v.tesoros).slice(0, 300).map(tesoro), notas: txt(v.notas) });
    const ubicacion = v => Object.assign({ id: idDe(v), nombre: txt(v.nombre), capacidad: nn(v.capacidad), lugar: txt(v.lugar), tam: txt(v.tam), estado: txt(v.estado), defensas: txt(v.defensas), personal: txt(v.personal),
      mantenimiento: nz(v.mantenimiento), valor: nn(v.valor), ingreso: nz(v.ingreso), gasto: nz(v.gasto),
      mejoras: lista(v.mejoras).slice(0, 200).map(m => ({ id: idDe(m), nombre: txt(m.nombre), coste: nn(m.coste), estado: txt(m.estado), desc: txt(m.desc) })) }, guarda(v));
    const ubs = v => lista(v).slice(0, 40).map(ubicacion);
    const pct = Number(x.pctVenta);
    return {
      pctVenta: Number.isFinite(pct) && pct >= 0 && pct <= 1000 ? Math.round(pct * 100) / 100 : 50,
      mochila: guarda(x.mochila && typeof x.mochila === 'object' ? x.mochila : {}),
      transporte: ubs(x.transporte), fortalezas: ubs(x.fortalezas), propiedades: ubs(x.propiedades),
      gastos: lista(x.gastos).slice(-200).map(g => ({ t: txt(g.t), mo: Number.isFinite(Number(g.mo)) ? Math.round(Number(g.mo) * 100) / 100 : 0, f: txt(g.f) }))
    };
  };
  A.normalizarEquipo = normalizarEquipo;
  /* Dotes (regla opcional): interruptor, dote de humano, dotes compradas, tiradas de nacimiento y ayudas de Ascendencia. */
  const normalizarDotes = x => {
    x = x && typeof x === 'object' ? x : {};
    const txt = v => String(v === undefined || v === null ? '' : v);
    const entero = (v, a, b) => { const n = Math.round(Number(v)); return v === '' || v === null || v === undefined || typeof v === 'boolean' || !Number.isFinite(n) || n < a || n > b ? '' : n; };
    const el = {}; Object.entries(x.elecciones && typeof x.elecciones === 'object' ? x.elecciones : {}).forEach(([k, v]) => { if (txt(v)) el[k] = txt(v); });
    const d = x.divina && typeof x.divina === 'object' ? x.divina : {};
    return {
      activo: x.activo === true, tabla: txt(x.tabla), humano: txt(x.humano),
      comprados: [...new Set((Array.isArray(x.comprados) ? x.comprados : []).map(txt).filter(Boolean))],
      nacimiento: (Array.isArray(x.nacimiento) ? x.nacimiento : []).filter(Boolean).slice(0, 8).map(f => ({ n: entero(f.n, 0, 100), id: txt(f.id) })),
      elecciones: el, divina: { m: entero(d.m, 0, 100), mito: txt(d.mito), d: entero(d.d, 1, 99), nota: txt(d.nota) },
      heroica: entero(x.heroica, 1, 6), notas: txt(x.notas)
    };
  };
  const normalizarPsionica = x => {
    x = x && typeof x === 'object' ? x : {}; const t = x.talento && typeof x.talento === 'object' ? x.talento : {};
    const ids = (l, n) => [...new Set((Array.isArray(l) ? l : []).map(String).filter(Boolean))].slice(0, n);
    const secuelas = l => (Array.isArray(l) ? l : []).slice(0, 40).map(s => ({ texto: String((s && s.texto) || '').slice(0, 300) }));
    const unidades = ['round', 'turno', 'hora', 'día'];
    return {
      disciplinas: ids(x.disciplinas, 20), ciencias: ids(x.ciencias, 200), devociones: ids(x.devociones, 300), defensas: ids(x.defensas, 20),
      gastados: Math.max(0, Math.round(U.num(x.gastados))), bonoPsp: Math.max(-999, Math.min(999, Math.round(U.num(x.bonoPsp)))), motivo: String(x.motivo || '').slice(0, 300),
      activos: (Array.isArray(x.activos) ? x.activos : []).slice(0, 60).filter(a => a && a.id).map(a => ({ id: String(a.id), n: Math.max(0, Math.round(U.num(a.n))), u: unidades.includes(a.u) ? a.u : 'round', reloj: Math.max(0, Math.round(U.num(a.reloj))), t: !!a.t })),
      notas: String(x.notas || '').slice(0, 4000), secuelas: secuelas(x.secuelas),
      talento: { activo: !!t.activo, nivelInicio: Math.max(1, Math.min(99, Math.round(U.num(t.nivelInicio)) || 1)), poderes: (Array.isArray(t.poderes) ? t.poderes : []).slice(0, 60).filter(p => p && p.id).map(p => ({ id: String(p.id), origen: String(p.origen || '').slice(0, 60) })),
        gastados: Math.max(0, Math.round(U.num(t.gastados))), notas: String(t.notas || '').slice(0, 4000), secuelas: secuelas(t.secuelas) }
    };
  };
  const normalizarTecnicas = t => {
    t = t && typeof t === 'object' ? t : {}; const esp = t.espadachin && typeof t.espadachin === 'object' ? t.espadachin : {}; const b = t.bribon && typeof t.bribon === 'object' ? t.bribon : {}, x = t.barbaro && t.barbaro.extra && typeof t.barbaro.extra === 'object' ? t.barbaro.extra : {};
    const mapa = o => { const r = {}; Object.entries(o && typeof o === 'object' ? o : {}).forEach(([k, v]) => { const n = Math.round(U.num(v)); if (n) r[k] = n; }); return r; };
    return {
      bribon: { ladron: mapa(b.ladron), bardo: mapa(b.bardo), manual: mapa(b.manual), bardoAvanzadas: [...new Set((Array.isArray(b.bardoAvanzadas) ? b.bardoAvanzadas : []).map(String))].slice(0, 2), saberMod: Math.round(U.num(b.saberMod)) },
      espadachin: { rangos: Object.fromEntries(Object.entries(esp.rangos && typeof esp.rangos === 'object' ? esp.rangos : {}).map(([k, v]) => [k, Math.min(7, Math.max(0, Math.round(U.num(v))))]).filter(([, v]) => v > 0)) },
      artes: normalizarArtes(t.artes), techno: normalizarTechno(t.techno),
      barbaro: { extra: { espalda: U.num(x.espalda), escalar: U.num(x.escalar), cf: String(x.cf || ''), qf: String(x.qf || ''), ca: String(x.ca || ''), qa: String(x.qa || '') } }
    };
  };
  A.normalizarPersonaje = function (pj) {
    const base = A.nuevoPersonaje();
    const o = Object.assign({}, base, pj || {});
    o.formato = A.FORMATO; o.version = A.VERSION;
    o.identidad = Object.assign({}, base.identidad, o.identidad);
    o.caracteristicas = Object.assign({}, base.caracteristicas, o.caracteristicas);
    A.STATS.forEach(s => { o.caracteristicas[s] = String(o.caracteristicas[s] == null ? '10' : o.caracteristicas[s]); });
    o.raza = Object.assign({}, base.raza, o.raza); o.raza.elecciones = Object.assign({}, o.raza.elecciones);
    if (!['unica', 'multi', 'dual'].includes(o.trayectoria)) o.trayectoria = 'unica';
    o.clases = (Array.isArray(o.clases) ? o.clases : []).map(c => ({
      clase: String(c.clase || ''), kit: String(c.kit || ''), estado: c.estado === 'Congelada' ? 'Congelada' : 'Activa',
      modo: c.modo === 'manual' ? 'manual' : 'auto', nivel: U.clamp(Math.round(U.num(c.nivel)) || 1, 1, 30), xp: Math.max(0, U.num(c.xp))
    }));
    o.bonoXp = U.num(o.bonoXp);
    o.conjuros = normalizarConjuros(o.conjuros);
    o.psionica = normalizarPsionica(o.psionica);
    o.dotes = normalizarDotes(o.dotes);
    o.equipo = normalizarEquipo(o.equipo);
    o.historia = normalizarHistoria(o.historia);
    o.companeros = normalizarCompaneros(o.companeros);
    o.imagenes = normalizarImagenes(o.imagenes);
    o.pg = Object.assign({}, base.pg, o.pg);
    if (!['maximo', 'tirada'].includes(o.pg.modo)) o.pg.modo = 'maximo';
    o.pg.tiradas = Object.assign({}, o.pg.tiradas);
    o.pg.extra = (Array.isArray(o.pg.extra) ? o.pg.extra : []).map(e => ({ origen: String(e.origen || ''), total: U.num(e.total) }));
    const bonos = {};
    Object.keys(A.OBJETIVOS).forEach(k => {
      bonos[k] = ((o.bonos && o.bonos[k]) || []).map(b => ({ valor: U.num(b.valor), origen: String(b.origen || ''), nota: String(b.nota || '') }));
    });
    o.bonos = bonos;
    o.pericias = Object.assign({}, base.pericias, o.pericias);
    o.pericias.flex = Object.assign({ pa: 0, pna: 0 }, o.pericias.flex);
    o.pericias.ambidestria = Object.assign({ comprada: false, reserva: 'PA' }, o.pericias.ambidestria);
    const na = {};
    Object.entries(o.pericias.noArmas && typeof o.pericias.noArmas === 'object' ? o.pericias.noArmas : {}).forEach(([id, x]) => {
      x = x && typeof x === 'object' ? x : {};
      na[id] = { mejoras: Math.max(0, Math.round(U.num(x.mejoras))), concedida: !!x.concedida, fuente: String(x.fuente || ''), car: x.car === 'CAR' ? 'CAR' : 'FUE', mod: x.mod === null || x.mod === undefined ? null : U.num(x.mod) };
    });
    o.pericias.noArmas = na;
    o.pericias.armas = (Array.isArray(o.pericias.armas) ? o.pericias.armas : []).map(x => ({ nombre: String(x.nombre || '') }));
    o.pericias.otras = (Array.isArray(o.pericias.otras) ? o.pericias.otras : []).map(x => ({ nombre: String(x.nombre || ''), costo: Math.max(1, U.num(x.costo) || 1) }));
    o.idiomas = { aprendidos: [...new Set((o.idiomas && Array.isArray(o.idiomas.aprendidos) ? o.idiomas.aprendidos : []).map(String).filter(Boolean))] };
    o.armas = normalizarArmas(o.armas, base.armas);
    o.armadura = normalizarArmadura(o.armadura);
    o.tecnicas = normalizarTecnicas(o.tecnicas);
    o.notas = Object.assign({}, base.notas, o.notas);
    return o;
  };
})((typeof window !== 'undefined' ? window : globalThis).ADND);
