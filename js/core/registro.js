/* Registro: une los datos base con la biblioteca homebrew y ofrece búsquedas.
   Nunca modifica los datos base: lo homebrew vive aparte (así se puede exportar, compartir y borrar). */
(function (A) {
  'use strict';
  const U = A.util;

  A.hbVacio = () => ({ razas: [], clases: [], kits: [], deidades: [], armas: [], armaduras: [], pericias: [], escuelas: [], artes: [], creaciones: [], conjuros: [], escuelasMagia: [], linajes: [], pactos: [], poderesPsi: [], disciplinasPsi: [], defensasPsi: [], magiaSalvaje: [], dotes: [], dotesNacimiento: [], objetosTienda: [], variantes: [], idiomas: [], tablas: { thaco: {}, salvaciones: {}, xp: {} } });

  /* El ataque desarmado de un arte: RT 1/1 (2 pasos) y cada ataque extra del arte suma 2 pasos (1/1 + 2 ataques = 3/3). */
  /* Imágenes permitidas: una URL http(s) o una imagen chica embebida (la que sube el jugador ya viene reducida). */
  A.imagenSegura = (v, max) => { v = String(v || '').trim(); return (/^https?:\/\//i.test(v) && v.length < 2000) || (/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(v) && v.length < (max || 150000)) ? v : ''; };
  A.armaDeArte = arte => ({
    id: 'am:' + arte.id, nombre: `${arte.nombre} (desarmado)`, grupo: 'Artes marciales', tipo: 'cuerpo', dano: arte.dano, dm: arte.dano, dg: arte.dano,
    tam: '—', peso: 0, crit: '(20)x2', adv: '(20)x2', rt: 2, extraRt: 2 * Math.max(0, U.num(arte.atk) - 1), esp: '', costo: '', muni: '', estilos: [], arte: true, origen: arte.origen || 'base'
  });

  A.crearRegistro = function (hb) {
    hb = hb || A.hbVacio();
    const avisos = [];

    const unir = (base, extra, tipo) => {
      const ids = new Set(base.map(x => x.id));
      const aceptados = [];
      (extra || []).forEach(x => {
        if (!x || !x.id) { avisos.push(`${tipo} sin id: se ignora.`); return; }
        if (ids.has(x.id)) { avisos.push(`${tipo} "${x.nombre}" repite el id "${x.id}": se ignora.`); return; }
        ids.add(x.id); aceptados.push(x);
      });
      return base.map(x => Object.assign({}, x, { origen: 'base' }))
        .concat(aceptados.map(x => Object.assign({}, x, { origen: 'homebrew' })));
    };

    const reg = {
      avisos,
      razas: unir(A.base.razas, hb.razas, 'Raza'),
      clases: unir(A.base.clases, hb.clases, 'Clase'),
      kits: unir(A.base.kits, hb.kits, 'Kit'),
      deidades: unir(A.base.deidades, hb.deidades, 'Deidad'),
      armas: unir(A.base.armas.catalogo, hb.armas, 'Arma'),
      idiomas: unir(A.base.idiomas, hb.idiomas, 'Idioma'),
      armaduras: unir(A.base.armaduras, hb.armaduras, 'Armadura'),
      pericias: unir(A.base.pericias, hb.pericias, 'Pericia'),
      escuelas: unir(A.base.escuelasEspadachin, hb.escuelas, 'Escuela'),
      artes: unir(A.base.artes, hb.artes, 'Arte marcial'),
      creaciones: unir([], hb.creaciones, 'Creación'),
      conjuros: unir(A.base.conjuros || [], hb.conjuros, 'Conjuro'),
      escuelasMagia: unir(A.base.escuelasMagia || [], hb.escuelasMagia, 'Escuela de magia'),
      linajes: unir(A.base.linajes || [], hb.linajes, 'Linaje'),
      pactos: unir(A.base.pactos || [], hb.pactos, 'Pacto'),
      poderesPsi: unir((A.base.psionica || {}).poderes || [], hb.poderesPsi, 'Poder psiónico'),
      disciplinasPsi: unir((A.base.psionica || {}).disciplinas || [], hb.disciplinasPsi, 'Disciplina psiónica'),
      defensasPsi: unir((A.base.psionica || {}).defensas || [], hb.defensasPsi, 'Modo defensivo'),
      dotes: unir((A.base.dotes || {}).lista || [], hb.dotes, 'Dote'),
      dotesNacimiento: unir((A.base.dotes || {}).nacimiento ? [A.base.dotes.nacimiento] : [], hb.dotesNacimiento, 'Tabla de dotes de nacimiento'),
      magiaSalvaje: unir(A.base.magiaSalvaje ? [A.base.magiaSalvaje] : [], hb.magiaSalvaje, 'Magia salvaje'),
      objetosTienda: unir([], hb.objetosTienda, 'Objeto de tienda'),
      tablas: {}
    };
    ['thaco', 'salvaciones', 'xp'].forEach(tipo => {
      // Las tablas base ganan si hay un nombre repetido.
      reg.tablas[tipo] = Object.assign({}, (hb.tablas && hb.tablas[tipo]) || {}, A.base.tablas[tipo]);
    });

    /* Variantes homebrew: se añaden a la raza que indiquen, sea base o propia. */
    reg.variantes = [];
    (hb.variantes || []).forEach(v => {
      if (!v || !v.id || !v.raza) return;
      const r = reg.razas.find(x => x.id === v.raza);
      if (!r) { avisos.push(`La variante "${v.nombre}" apunta a una raza que ya no existe.`); return; }
      if ((r.variantes || []).some(x => x.id === v.id)) { avisos.push(`La variante "${v.nombre}" repite un id de ${r.nombre}: se ignora.`); return; }
      const ext = Object.assign({}, v, { origen: 'homebrew' });
      reg.variantes.push(ext);
      reg.razas[reg.razas.indexOf(r)] = Object.assign({}, r, { variantes: (r.variantes || []).concat([ext]) });
    });
    const porId = lista => { const m = new Map(); lista.forEach(x => m.set(x.id, x)); return m; };
    const mr = porId(reg.razas), mc = porId(reg.clases), mk = porId(reg.kits), md = porId(reg.deidades), ma = porId(reg.armas), mi = porId(reg.idiomas), mar = porId(reg.armaduras), mpe = porId(reg.pericias), mes = porId(reg.escuelas), mam = porId(reg.artes);
    reg.raza = id => mr.get(id) || null;
    reg.clase = id => mc.get(id) || null;
    reg.kit = id => mk.get(id) || null;
    reg.deidad = id => md.get(id) || null;
    reg.arte = id => mam.get(id) || null;
    const mcj = porId(reg.conjuros), mem = porId(reg.escuelasMagia), mli = porId(reg.linajes), mpa = porId(reg.pactos), mpp = porId(reg.poderesPsi);
    reg.conjuro = id => mcj.get(id) || null;
    reg.escuelaMagia = id => mem.get(id) || null;
    reg.linaje = id => mli.get(id) || null;
    reg.pacto = id => mpa.get(id) || null;
    reg.poderPsi = id => mpp.get(id) || null;
    const mdo = porId(reg.dotes), mtn = porId(reg.dotesNacimiento), mfn = new Map();
    reg.dotesNacimiento.forEach(t => (t.filas || []).forEach(f => { if (!mfn.has(f.id)) mfn.set(f.id, f); }));
    reg.dote = id => mdo.get(id) || null;
    reg.tablaNacimiento = id => mtn.get(id) || reg.dotesNacimiento[0] || null;
    reg.doteNacimiento = id => mfn.get(id) || null;
    /* Cada arte marcial tiene un "arma" propia: su ataque desarmado. No está en el catálogo (no se compra aparte),
       pero se resuelve por id ("am:<arte>") para que use las mismas reglas que cualquier arma. */
    const desarmadas = new Map();
    reg.arma = id => {
      if (ma.has(id)) return ma.get(id);
      if (typeof id === 'string' && id.startsWith('am:')) {
        const arte = mam.get(id.slice(3)); if (!arte) return null;
        if (!desarmadas.has(id)) desarmadas.set(id, A.armaDeArte(arte));
        return desarmadas.get(id);
      }
      return null;
    };
    reg.idioma = id => mi.get(id) || null;
    reg.armadura = id => mar.get(id) || null;
    /* Tienda: catálogo base + objetos homebrew + armas y armaduras homebrew (solo las propias, para no repetir las base). */
    let cacheTienda = null;
    reg.tienda = () => {
      if (cacheTienda) return cacheTienda;
      const pc = A.reglas.equipo.parseCoste, base = (A.base.tienda && A.base.tienda.items) || [];
      const lista = base.map(x => Object.assign({}, x, { origen: 'base' }));
      reg.objetosTienda.filter(x => x.origen === 'homebrew').forEach(o => { const c = pc(o.coste); lista.push({ id: o.id, categoria: o.categoria || 'Equipo misceláneo', nombre: o.nombre, coste: o.coste || '—', valor: c.valor, aprox: false, peso: o.peso === '' || o.peso === undefined ? null : o.peso, pesoTxt: o.peso ? o.peso + ' kg' : '', destino: o.destino || 'Mochila', notas: o.notas || '', origen: 'homebrew', idHb: o.id }); });
      reg.armas.filter(a => a.origen === 'homebrew').forEach(a => { const c = pc(a.costo); lista.push({ id: 'hb:' + a.id, categoria: 'Armas', nombre: a.nombre, coste: a.costo || '—', valor: c.valor, aprox: false, peso: a.peso || null, pesoTxt: a.peso ? a.peso + ' kg' : '', destino: 'Mochila', arma: { tam: a.tam, tipo: a.tipo === 'distancia' ? 'D' : 'C', vel: '', dm: a.dm, dg: a.dg }, origen: 'homebrew', idHb: a.id }); });
      reg.armaduras.filter(a => a.origen === 'homebrew').forEach(a => { const c = pc(a.costo); lista.push({ id: 'hb:' + a.id, categoria: 'Armaduras', nombre: a.nombre, coste: a.costo || '—', valor: c.valor, aprox: false, peso: a.peso || null, pesoTxt: a.peso ? a.peso + ' kg' : '', destino: 'Mochila', origen: 'homebrew', idHb: a.id }); });
      return (cacheTienda = lista);
    };
    reg.pericia = id => mpe.get(id) || null;
    reg.escuela = id => mes.get(id) || null;
    /* Idiomas nativos de una raza: los suyos si es homebrew o los de la tabla base. */
    reg.nativosDe = raza => (raza ? (Array.isArray(raza.idiomas) ? raza.idiomas : (A.base.idiomasRaza[raza.id] || [])) : []).map(id => mi.get(id)).filter(Boolean);
    reg.gruposArmas = () => [...new Set(reg.armas.map(a => a.grupo))];
    reg.kitsDe = claseId => reg.kits.filter(k => k.clase === claseId);
    reg.kitDe = (claseId, kitId) => { const k = kitId ? mk.get(kitId) : null; return k && k.clase === claseId ? k : null; };
    reg.tabla = (tipo, nombre) => (reg.tablas[tipo] || {})[nombre] || null;
    return reg;
  };

  /* ---------- Saneado: todo lo que entra (editor, importación) pasa por aquí ---------- */
  const modsLimpios = m => {
    const o = {};
    A.STATS.forEach(s => { const v = U.num(m && m[s]); if (v) o[s] = v; });
    return o;
  };
  const efectosLimpios = lista => (Array.isArray(lista) ? lista : [])
    .filter(e => e && A.OBJETIVOS[e.objetivo] && U.num(e.valor))
    .map(e => ({ objetivo: e.objetivo, valor: U.num(e.valor), nota: String(e.nota || '') }));
  const textos = l => (Array.isArray(l) ? l : []).map(x => String(x).trim()).filter(Boolean);

  A.sanear = {
    raza(r) {
      return {
        id: String(r.id || U.idNuevo('hb-raza', r.nombre)),
        nombre: String(r.nombre || '').trim(),
        mods: modsLimpios(r.mods), nota: String(r.nota || ''),
        efectos: efectosLimpios(r.efectos),
        idiomas: Array.isArray(r.idiomas) ? [...new Set(r.idiomas.map(String).filter(Boolean))] : ['comun'],
        variantes: (Array.isArray(r.variantes) ? r.variantes : []).map(v => ({
          id: String(v.id || U.slug(v.nombre) || U.uid()), nombre: String(v.nombre || '').trim(),
          mods: modsLimpios(v.mods), nota: String(v.nota || ''), efectos: efectosLimpios(v.efectos)
        })).filter(v => v.nombre),
        elecciones: (Array.isArray(r.elecciones) ? r.elecciones : []).map(e => ({
          id: String(e.id || U.slug(e.etiqueta) || U.uid()), etiqueta: String(e.etiqueta || ''),
          opciones: (Array.isArray(e.opciones) ? e.opciones : []).map(o => ({
            valor: String(o.valor), etiqueta: String(o.etiqueta || o.valor), mods: modsLimpios(o.mods), efectos: efectosLimpios(o.efectos)
          }))
        })).filter(e => e.opciones.length)
      };
    },
    clase(c) {
      const p = c.pericias || {};
      const o = {
        id: String(c.id || U.idNuevo('hb-clase', c.nombre)), nombre: String(c.nombre || '').trim(),
        thaco: String(c.thaco || ''), salvaciones: String(c.salvaciones || ''), xp: String(c.xp || ''),
        dg: Math.max(1, U.num(c.dg) || 8), dgNivelMax: Math.max(1, U.num(c.dgNivelMax) || 9), pgDespues: Math.max(0, U.num(c.pgDespues)),
        pericias: { pa0: Math.max(0, U.num(p.pa0)), pna0: Math.max(0, U.num(p.pna0)), paCada: Math.max(1, U.num(p.paCada) || 3), pnaCada: Math.max(1, U.num(p.pnaCada) || 3) }
      };
      if (c.ambidestriaGratis) o.ambidestriaGratis = true;
      if (Array.isArray(c.catPericias)) o.catPericias = [...new Set(c.catPericias.map(String).filter(k => A.base.categoriasPericias[k] && k !== 'general'))];
      if (c.espArmas !== undefined && c.espArmas !== null && c.espArmas !== '') o.espArmas = Math.min(5, Math.max(0, Math.round(U.num(c.espArmas))));
      if (c.topeBonoCon !== undefined && c.topeBonoCon !== null && c.topeBonoCon !== '') o.topeBonoCon = U.num(c.topeBonoCon);
      return o;
    },
    kit(k) {
      const s = k.sobreescribe || {}, p = k.pericias || {};
      const sob = {};
      ['thaco', 'salvaciones', 'xp'].forEach(f => { if (s[f]) sob[f] = String(s[f]); });
      ['dg', 'dgNivelMax', 'pgDespues', 'topeBonoCon'].forEach(f => { if (s[f] !== undefined && s[f] !== null && s[f] !== '') sob[f] = U.num(s[f]); });
      const per = {};
      ['pa0', 'pna0'].forEach(f => { if (p[f] !== undefined && p[f] !== null && p[f] !== '') per[f] = Math.max(0, U.num(p[f])); });
      ['paCada', 'pnaCada'].forEach(f => { if (p[f] !== undefined && p[f] !== null && p[f] !== '') per[f] = Math.max(1, U.num(p[f])); });
      return {
        id: String(k.id || U.idNuevo('hb-kit', k.nombre)), nombre: String(k.nombre || '').trim(), clase: String(k.clase || ''),
        nota: String(k.nota || ''), habilidades: textos(k.habilidades), mods: modsLimpios(k.mods),
        efectos: efectosLimpios(k.efectos), sobreescribe: sob, pericias: per
      };
    },
    idioma(i) {
      if (typeof i === 'string') i = { nombre: i };
      return { id: String(i.id || U.idNuevo('hb-idioma', i.nombre)), nombre: String(i.nombre || '').trim(), nota: String(i.nota || '') };
    },
    pericia(p) {
      const cats = (Array.isArray(p.cats) ? p.cats : []).map(String).filter(k => A.base.categoriasPericias[k]);
      const car = ['FUE', 'DES', 'CON', 'INT', 'SAB', 'CAR', 'FUE/CAR', 'NA', 'Especial'].includes(p.car) ? p.car : 'INT';
      return {
        id: String(p.id || U.idNuevo('hb-pericia', p.nombre)), nombre: String(p.nombre || '').trim(), ingles: String(p.ingles || ''),
        costo: Math.max(1, Math.round(U.num(p.costo)) || 1), car, mod: p.mod === null || p.mod === undefined || p.mod === '' ? 0 : U.num(p.mod), opciones: [],
        cats: cats.length ? [...new Set(cats)] : ['general'], fuente: String(p.fuente || 'Homebrew'), nota: String(p.nota || ''), descripcion: String(p.descripcion || '').trim().slice(0, 6000)
      };
    },
    escuela(e) {
      const tec = (Array.isArray(e.tecnicas) ? e.tecnicas : []).slice(0, 7).map(t => ({ nombre: String((t && t.nombre) || '').trim(), efecto: String((t && t.efecto) || '').trim() }));
      while (tec.length && !tec[tec.length - 1].nombre) tec.pop();
      return { id: String(e.id || U.idNuevo('hb-escuela', e.nombre)), nombre: String(e.nombre || '').trim(), tecnicas: tec.map((t, i) => ({ nombre: t.nombre || 'Técnica ' + (i + 1), efecto: t.efecto })) };
    },
    armadura(a) {
      const n = (v, d) => Math.max(0, U.num(v) || d || 0);
      return {
        id: String(a.id || U.idNuevo('hb-armadura', a.nombre)), nombre: String(a.nombre || '').trim(),
        clase: ['Ninguna', 'Ligera', 'Media', 'Pesada'].includes(a.clase) ? a.clase : 'Ligera',
        completa: n(a.completa), torso: n(a.torso), brazos2: n(a.brazos2), brazo1: n(a.brazo1), piernas2: n(a.piernas2), pierna1: n(a.pierna1),
        costo: String(a.costo || '').trim().slice(0, 40), peso: Math.round(n(a.peso) * 100) / 100
      };
    },
    objetoTienda(o) {
      const t = v => String(v === undefined || v === null ? '' : v).trim();
      const cats = (A.base.tienda && A.base.tienda.categorias) || [], dest = ['Mochila', 'Transporte', 'Fortaleza', 'Propiedades', 'Servicio'];
      const peso = Number(String(o.peso === undefined || o.peso === null ? '' : o.peso).replace(',', '.'));
      return { id: String(o.id || U.idNuevo('hb-obj', o.nombre)), nombre: t(o.nombre).slice(0, 80), categoria: t(o.categoria) || 'Equipo misceláneo',
        coste: t(o.coste).slice(0, 40), peso: Number.isFinite(peso) && peso > 0 ? Math.round(peso * 1000) / 1000 : '', destino: dest.includes(o.destino) ? o.destino : 'Mochila', notas: t(o.notas).slice(0, 500) };
    },
    variante(v) {
      return {
        id: String(v.id || U.idNuevo('hb-var', v.nombre)), raza: String(v.raza || ''), nombre: String(v.nombre || '').trim(),
        mods: modsLimpios(v.mods), nota: String(v.nota || ''), efectos: efectosLimpios(v.efectos)
      };
    },
    arma(a) {
      const t = (v, d) => String(v === undefined || v === null ? d : v).trim();
      const lista = Array.isArray(a.estilos) ? a.estilos.map(String) : [];
      const o = {
        id: String(a.id || U.idNuevo('hb-arma', a.nombre)), nombre: t(a.nombre, ''), grupo: t(a.grupo, 'Otras') || 'Otras',
        tipo: a.tipo === 'distancia' ? 'distancia' : 'cuerpo', dano: t(a.dano, ''), dm: t(a.dm, '1d6'), dg: t(a.dg, '1d6'),
        tam: ['P', 'L', 'M', 'G', '—', ''].includes(t(a.tam, 'M').toUpperCase()) ? t(a.tam, 'M').toUpperCase() : 'M',
        peso: Math.max(0, U.num(a.peso)), crit: t(a.crit, '(20)x2'), adv: t(a.adv, '(20)x2'), rt: Math.max(1, U.num(a.rt) || 2),
        esp: t(a.esp, ''), costo: t(a.costo, ''), muni: t(a.muni, ''), estilos: lista
      };
      if (U.num(a.techRt) > 0) o.techRt = Math.min(12, Math.round(U.num(a.techRt)));
      if (/^\d+d\d+$/i.test(t(a.techDado, ''))) o.techDado = t(a.techDado, '').toLowerCase();
      if (t(a.autor, '')) o.autor = t(a.autor, '').slice(0, 80);
      const im = A.imagenSegura(a.img); if (im) o.img = im;
      if (a.escudo && typeof a.escudo === 'object') o.escudo = { ca: U.num(a.escudo.ca), bloqueos: U.num(a.escudo.bloqueos) };
      return o;
    },
    arte(a) {
      const movs = (Array.isArray(a.movs) ? a.movs : []).map(m => {
        const o = { k: String((m && m.k) || '').trim(), nombre: String((m && m.nombre) || '').trim(), efecto: String((m && m.efecto) || '').trim() };
        if (m && U.num(m.ca)) { o.ca = Math.min(0, U.num(m.ca)); o.sinArmadura = m.sinArmadura !== false; }
        return o;
      }).filter(m => m.k);
      movs.forEach(m => { if (!m.nombre) m.nombre = m.k; });
      return {
        id: String(a.id || U.idNuevo('hb-arte', a.nombre)), nombre: String(a.nombre || '').trim(),
        atk: Math.min(6, Math.max(1, Math.round(U.num(a.atk)) || 1)), dano: String(a.dano || '1d4').trim() || '1d4',
        ac: Math.min(0, Math.max(-6, Math.round(U.num(a.ac)))), met: String(a.met || '').trim(), armas: String(a.armas || '').trim(), movs
      };
    },
    /* Piezas de las creaciones del Techno (área y montura) y la creación completa que se comparte por Homebrew. */
    techArea(a) {
      a = a && typeof a === 'object' ? a : {};
      return { elemento: String(a.elemento || '').slice(0, 40), lado: Math.max(0, Math.min(100, U.num(a.lado))), salv: A.SAVES.includes(a.salv) ? a.salv : 'AL', exito: String(a.exito || 'Mitad del daño').slice(0, 120), dano: String(a.dano || '').slice(0, 40), notas: String(a.notas || '').slice(0, 1000) };
    },
    techMontura(m) {
      m = m && typeof m === 'object' ? m : {};
      const dado = [4, 6, 8, 10, 12].includes(Math.round(U.num(m.dado))) ? Math.round(U.num(m.dado)) : 8, dg = Math.max(1, Math.min(40, Math.round(U.num(m.dg)) || 3));
      return {
        dg, dado, modo: m.modo === 'tirada' ? 'tirada' : 'maximo', tiradas: (Array.isArray(m.tiradas) ? m.tiradas : []).slice(0, 40).map(v => Math.max(1, Math.min(dado, Math.round(U.num(v)) || 1))),
        hpManual: m.hpManual === null || m.hpManual === undefined || m.hpManual === '' ? null : Math.max(1, Math.round(U.num(m.hpManual))),
        thac0Aj: Math.round(U.num(m.thac0Aj)), caAj: Math.round(U.num(m.caAj)), bonoArm: Math.max(0, Math.round(U.num(m.bonoArm))), mov: String(m.mov || '').slice(0, 200), tam: String(m.tam || '').slice(0, 40),
        ataques: (Array.isArray(m.ataques) ? m.ataques : []).slice(0, 8).map(x => ({ nombre: String((x && x.nombre) || '').slice(0, 60), dano: String((x && x.dano) || '').slice(0, 40) })).filter(x => x.nombre || x.dano), notas: String(m.notas || '').slice(0, 1000)
      };
    },
    conjuro(c) {
      c = c && typeof c === 'object' ? c : {};
      const t = (v, n) => String(v === undefined || v === null ? '' : v).trim().slice(0, n);
      const tipo = c.tipo === 'divino' ? 'divino' : 'arcano';
      const o = {
        id: String(c.id || U.idNuevo('hb-conjuro', c.nombre)), nombre: t(c.nombre, 120), tipo, nv: Math.max(1, Math.min(9, Math.round(U.num(c.nv)) || 1)), fuente: t(c.fuente, 80) || 'Homebrew',
        escuelas: [...new Set((Array.isArray(c.escuelas) ? c.escuelas : []).map(x => t(x, 60)).filter(Boolean))].slice(0, 6), rev: !!c.rev,
        alcance: t(c.alcance, 120), componentes: t(c.componentes, 60), duracion: t(c.duracion, 120), tiempo: t(c.tiempo, 60), area: t(c.area, 160), salvacion: t(c.salvacion, 60),
        efecto: String(c.efecto || '').slice(0, 8000), material: t(c.material, 300)
      };
      if (c.reverso) o.reverso = String(c.reverso).slice(0, 4000);
      if (tipo === 'divino') o.esfera = t(c.esfera, 120);
      return o;
    },
    linaje(l) {
      l = l && typeof l === 'object' ? l : {};
      const t = (v, n) => String(v === undefined || v === null ? '' : v).trim().slice(0, n);
      const conj = Array.isArray(l.conjuros) ? l.conjuros : [];
      return {
        id: String(l.id || U.idNuevo('hb-linaje', l.nombre)), nombre: t(l.nombre, 80), desc: String(l.desc || '').slice(0, 1000),
        habilidades: (Array.isArray(l.habilidades) ? l.habilidades : []).slice(0, 12).map(x => ({ nivel: Math.max(1, Math.min(30, Math.round(U.num(x && x.nivel)) || 1)), nombre: t(x && x.nombre, 80), texto: String((x && x.texto) || '').slice(0, 1500) })).filter(x => x.nombre || x.texto),
        conjuros: Array.from({ length: 9 }, (_, i) => (Array.isArray(conj[i]) ? conj[i] : []).slice(0, 2).map(c => { const o = { id: t(c && c.id, 120) }; if (c && c.inv) o.inv = true; return o; }).filter(c => c.id))
      };
    },
    poderPsi(p) {
      p = p && typeof p === 'object' ? p : {};
      const t = (v, n) => String(v === undefined || v === null ? '' : v).trim().slice(0, n);
      const car = ['SAB', 'INT', 'CON', 'FUE', 'DES', 'CAR'];
      const pu = p.puntuacion && typeof p.puntuacion === 'object' && car.includes(p.puntuacion.car) ? { car: p.puntuacion.car, mod: Math.max(-20, Math.min(0, Math.round(U.num(p.puntuacion.mod)))) } : null;
      const unidades = ['round', 'turno', 'hora', 'día'];
      const mant = p.mantenimiento && typeof p.mantenimiento === 'object' && unidades.includes(p.mantenimiento.u) ? { n: Math.max(0, Math.min(999, Math.round(U.num(p.mantenimiento.n)))), u: p.mantenimiento.u } : null;
      const req = (Array.isArray(p.prerrequisitos) ? p.prerrequisitos : []).slice(0, 12).map(r => {
        if (!r || typeof r !== 'object') return null;
        if (r.k === 'nivel') return { k: 'nivel', v: Math.max(1, Math.min(30, Math.round(U.num(r.v)) || 1)) };
        if (r.k === 'contacto') return { k: 'contacto' };
        if (r.k === 'poder' && r.v) return { k: 'poder', v: t(r.v, 120), nombre: t(r.nombre, 80) };
        if (r.k === 'disciplina' && r.v) return { k: 'disciplina', v: t(r.v, 60) };
        if (r.k === 'texto' && r.v) return { k: 'texto', v: t(r.v, 120) };
        return null;
      }).filter(Boolean);
      const costo = p.costo === null || p.costo === undefined || p.costo === '' ? null : Math.max(0, Math.min(9999, Math.round(U.num(p.costo))));
      return {
        id: String(p.id || U.idNuevo('hb-poder', p.nombre)), nombre: t(p.nombre, 100), disc: t(p.disc, 60), tipo: p.tipo === 'ciencia' ? 'ciencia' : 'devocion',
        puntuacion: pu, puntuacionTxt: t(p.puntuacionTxt, 300), inicio: t(p.inicio, 80) || (costo === null ? '' : String(costo)), costo, mant: t(p.mant, 80) || (mant ? `${mant.n}/${mant.u}` : 'n/d'), mantenimiento: mant,
        alcance: t(p.alcance, 80), preparacion: t(p.preparacion, 80), area: t(p.area, 80), prerrequisitos: req, prerrequisitosTxt: t(p.prerrequisitosTxt, 200),
        efecto: String(p.efecto || '').slice(0, 8000), riesgos: String(p.riesgos || '').slice(0, 1000), fuente: t(p.fuente, 80) || 'Homebrew'
      };
    },
    disciplinaPsi(d) { d = d && typeof d === 'object' ? d : {}; return { id: String(d.id || U.idNuevo('hb-disciplina', d.nombre)), nombre: String(d.nombre || '').trim().slice(0, 60) }; },
    defensaPsi(d) { d = d && typeof d === 'object' ? d : {}; return { id: String(d.id || U.idNuevo('hb-defensa', d.nombre)), nombre: String(d.nombre || '').trim().slice(0, 60), poder: String(d.poder || '').slice(0, 120) }; },
    pacto(p) {
      p = p && typeof p === 'object' ? p : {};
      const t = (v, n) => String(v === undefined || v === null ? '' : v).trim().slice(0, n);
      const lista = (v, n) => [...new Set((Array.isArray(v) ? v : []).map(x => t(x, 120)).filter(Boolean))].slice(0, n);
      const o = {
        id: String(p.id || U.idNuevo('hb-pacto', p.nombre)), nombre: t(p.nombre, 80), desc: String(p.desc || '').slice(0, 1000),
        escuelas: lista(p.escuelas, 12), esferas: lista(p.esferas, 30), firma: lista(p.firma, 60),
        tecnicas: (Array.isArray(p.tecnicas) ? p.tecnicas : []).slice(0, 7).map(x => ({ nombre: t(x && x.nombre, 80), efecto: String((x && x.efecto) || '').slice(0, 1500), pasiva: !!(x && x.pasiva), costo: (x && x.pasiva) ? 0 : Math.max(0, Math.min(20, Math.round(U.num(x && x.costo)))) }))
      };
      while (o.tecnicas.length && !o.tecnicas[o.tecnicas.length - 1].nombre && !o.tecnicas[o.tecnicas.length - 1].efecto) o.tecnicas.pop();   // solo se recortan las vacías del final: el lugar de cada técnica es su rango
      return o;
    },
    escuelaMagia(e) {
      e = e && typeof e === 'object' ? e : {};
      const o = { id: String(e.id || U.idNuevo('hb-escuelamagia', e.nombre)), nombre: String(e.nombre || '').trim().slice(0, 80), desc: String(e.desc || '').slice(0, 2000) };
      const s = e.especialista;
      if (s && typeof s === 'object' && String(s.nombre || '').trim()) {
        o.especialista = {
          nombre: String(s.nombre).trim().slice(0, 80), prohibidas: [...new Set((Array.isArray(s.prohibidas) ? s.prohibidas : []).map(x => String(x)).filter(Boolean))].slice(0, 8),
          aprender: { propio: Math.max(-50, Math.min(50, Math.round(U.num(s.aprender && s.aprender.propio === undefined ? 15 : s.aprender && s.aprender.propio)))), otras: Math.max(-50, Math.min(50, Math.round(U.num(s.aprender && s.aprender.otras === undefined ? -15 : s.aprender && s.aprender.otras)))) },
          salv: { propio: Math.max(-5, Math.min(5, Math.round(U.num(s.salv && s.salv.propio === undefined ? 1 : s.salv && s.salv.propio)))), ajeno: Math.max(-5, Math.min(5, Math.round(U.num(s.salv && s.salv.ajeno === undefined ? -1 : s.salv && s.salv.ajeno)))) },
          extra: s.extra === undefined ? true : !!s.extra,
          rasgos: (Array.isArray(s.rasgos) ? s.rasgos : []).slice(0, 12).map(x => String(x || '').trim().slice(0, 500)).filter(Boolean),
          poderes: (Array.isArray(s.poderes) ? s.poderes : []).slice(0, 12).map(p => ({ nivel: Math.max(1, Math.min(30, Math.round(U.num(p && p.nivel)) || 1)), texto: String((p && p.texto) || '').slice(0, 1000) })).filter(p => p.texto)
        };
      }
      return o;
    },
    creacion(c) {
      const tipos = ['Arma de área', 'Montura', 'Munición', 'Dispositivo', 'Otro'], tipo = tipos.includes(c.tipo) ? c.tipo : 'Otro';
      const o = { id: String(c.id || U.idNuevo('hb-creacion', c.nombre)), nombre: String(c.nombre || '').trim().slice(0, 120), tipo, desc: String(c.desc || '').slice(0, 3000), autor: String(c.autor || '').slice(0, 80), nivel: Math.max(0, Math.round(U.num(c.nivel))), capacidad: String(c.capacidad || '').slice(0, 200), resultado: String(c.resultado || '').slice(0, 300) };
      const im = A.imagenSegura(c.img); if (im) o.img = im;
      if (tipo === 'Arma de área') o.area = A.sanear.techArea(c.area);
      if (tipo === 'Montura') o.montura = A.sanear.techMontura(c.montura);
      return o;
    },
    deidad(d) {
      if (typeof d === 'string') d = { nombre: d };
      const validas = new Set((A.base.esferas || []).map(e => e.id)), lista = l => [...new Set((Array.isArray(l) ? l : []).map(String).filter(x => validas.has(x)))];
      const e = d.esferas && typeof d.esferas === 'object' ? d.esferas : null, may = e ? lista(e.mayores) : [], men = e ? lista(e.menores).filter(x => !may.includes(x)) : [];
      const o = { id: String(d.id || U.idNuevo('hb-deidad', d.nombre)), nombre: String(d.nombre || '').trim(), nota: String(d.nota || '') };
      if (may.length || men.length) o.esferas = { mayores: may, menores: men };
      if (String(d.poderes || '').trim()) o.poderes = String(d.poderes).slice(0, 2000);
      return o;
    },
    tabla(tipo, t) {
      const nums = l => (Array.isArray(l) ? l : []).map(U.num);
      if (tipo === 'salvaciones') return (Array.isArray(t) ? t : []).map(f => nums(f).slice(0, 5));
      return nums(t);
    },
    paquete(p) {
      const hb = A.hbVacio();
      if (!p || typeof p !== 'object') return hb;
      hb.razas = (Array.isArray(p.razas) ? p.razas : []).map(A.sanear.raza).filter(x => x.nombre);
      hb.clases = (Array.isArray(p.clases) ? p.clases : []).map(A.sanear.clase).filter(x => x.nombre);
      hb.kits = (Array.isArray(p.kits) ? p.kits : []).map(A.sanear.kit).filter(x => x.nombre && x.clase);
      hb.deidades = (Array.isArray(p.deidades) ? p.deidades : []).map(A.sanear.deidad).filter(x => x.nombre);
      hb.variantes = (Array.isArray(p.variantes) ? p.variantes : []).map(A.sanear.variante).filter(x => x.nombre && x.raza);
      hb.idiomas = (Array.isArray(p.idiomas) ? p.idiomas : []).map(A.sanear.idioma).filter(x => x.nombre);
      hb.creaciones = (Array.isArray(p.creaciones) ? p.creaciones : []).map(A.sanear.creacion).filter(x => x.nombre);
      hb.conjuros = (Array.isArray(p.conjuros) ? p.conjuros : []).map(A.sanear.conjuro).filter(x => x.nombre);
      hb.escuelasMagia = (Array.isArray(p.escuelasMagia) ? p.escuelasMagia : []).map(A.sanear.escuelaMagia).filter(x => x.nombre);
      hb.linajes = (Array.isArray(p.linajes) ? p.linajes : []).map(A.sanear.linaje).filter(x => x.nombre);
      hb.poderesPsi = (Array.isArray(p.poderesPsi) ? p.poderesPsi : []).map(A.sanear.poderPsi).filter(x => x.nombre);
      hb.disciplinasPsi = (Array.isArray(p.disciplinasPsi) ? p.disciplinasPsi : []).map(A.sanear.disciplinaPsi).filter(x => x.nombre);
      hb.defensasPsi = (Array.isArray(p.defensasPsi) ? p.defensasPsi : []).map(A.sanear.defensaPsi).filter(x => x.nombre);
      hb.pactos = (Array.isArray(p.pactos) ? p.pactos : []).map(A.sanear.pacto).filter(x => x.nombre && x.tecnicas.length);
      hb.magiaSalvaje = (Array.isArray(p.magiaSalvaje) ? p.magiaSalvaje : []).map(x => A.sanear.magiaSalvaje(x)).filter(x => x.nombre);
      hb.objetosTienda = (Array.isArray(p.objetosTienda) ? p.objetosTienda : []).map(x => A.sanear.objetoTienda(x)).filter(x => x.nombre);
      hb.dotes = (Array.isArray(p.dotes) ? p.dotes : []).map(x => A.sanear.dote(x)).filter(x => x.nombre);
      hb.dotesNacimiento = (Array.isArray(p.dotesNacimiento) ? p.dotesNacimiento : []).map(x => A.sanear.dotesNacimiento(x)).filter(x => x.nombre && x.filas.length);
      hb.artes = (Array.isArray(p.artes) ? p.artes : []).map(A.sanear.arte).filter(x => x.nombre);
      hb.escuelas = (Array.isArray(p.escuelas) ? p.escuelas : []).map(A.sanear.escuela).filter(x => x.nombre && x.tecnicas.length);
      hb.pericias = (Array.isArray(p.pericias) ? p.pericias : []).map(A.sanear.pericia).filter(x => x.nombre);
      hb.armaduras = (Array.isArray(p.armaduras) ? p.armaduras : []).map(A.sanear.armadura).filter(x => x.nombre);
      hb.armas = (Array.isArray(p.armas) ? p.armas : []).map(A.sanear.arma).filter(x => x.nombre);
      ['thaco', 'salvaciones', 'xp'].forEach(t => {
        Object.entries((p.tablas && typeof p.tablas[t] === 'object' && p.tablas[t]) || {}).forEach(([n, v]) => { hb.tablas[t][n] = A.sanear.tabla(t, v); });
      });
      return hb;
    }
  };

  /* Fusiona un paquete en la biblioteca. Los ids repetidos: gana lo que ya tenías (se informa). */
  A.fusionarHb = function (hb, paquete) {
    const nuevo = A.sanear.paquete(paquete);
    const res = { agregados: 0, repetidos: 0 };
    ['razas', 'clases', 'kits', 'deidades', 'armas', 'armaduras', 'pericias', 'escuelas', 'artes', 'creaciones', 'conjuros', 'escuelasMagia', 'linajes', 'pactos', 'poderesPsi', 'disciplinasPsi', 'defensasPsi', 'magiaSalvaje', 'dotes', 'dotesNacimiento', 'objetosTienda', 'variantes', 'idiomas'].forEach(t => {
      hb[t] = hb[t] || [];
      const ids = new Set(hb[t].map(x => x.id));
      nuevo[t].forEach(x => { if (ids.has(x.id)) res.repetidos++; else { hb[t].push(x); ids.add(x.id); res.agregados++; } });
    });
    ['thaco', 'salvaciones', 'xp'].forEach(t => {
      Object.entries(nuevo.tablas[t]).forEach(([n, v]) => {
        if (hb.tablas[t][n] || A.base.tablas[t][n]) res.repetidos++; else { hb.tablas[t][n] = v; res.agregados++; }
      });
    });
    return res;
  };

  /* Paquete con SOLO lo que usa un personaje (para que su archivo viaje completo). */
  A.hbUsadoPor = function (pj, hb) {
    const out = A.hbVacio();
    const usa = (lista, id) => lista.find(x => x.id === id);
    const r = usa(hb.razas, pj.raza && pj.raza.id); if (r) out.razas.push(r);
    (hb.variantes || []).forEach(v => { if (pj.raza && v.raza === pj.raza.id && v.id === pj.raza.variante) out.variantes.push(v); });
    const d = usa(hb.deidades, pj.identidad && pj.identidad.deidad); if (d) out.deidades.push(d);
    const tablasUsadas = { thaco: new Set(), salvaciones: new Set(), xp: new Set() };
    (pj.clases || []).forEach(c => {
      const cl = usa(hb.clases, c.clase); if (cl) out.clases.push(cl);
      const k = usa(hb.kits, c.kit); if (k) out.kits.push(k);
      [cl, k && k.sobreescribe].forEach(o => { if (o) { ['thaco', 'salvaciones', 'xp'].forEach(t => o[t] && tablasUsadas[t].add(o[t])); } });
    });
    ['thaco', 'salvaciones', 'xp'].forEach(t => tablasUsadas[t].forEach(n => { if (hb.tablas[t][n]) out.tablas[t][n] = hb.tablas[t][n]; }));
    const idiomasUsados = new Set([...((pj.idiomas && pj.idiomas.aprendidos) || []), ...((out.razas[0] && out.razas[0].idiomas) || [])]);
    (hb.idiomas || []).forEach(i => { if (idiomasUsados.has(i.id)) out.idiomas.push(i); });
    const armasUsadas = new Set([...Object.keys((pj.armas && pj.armas.dominio) || {}), ...((pj.armas && pj.armas.instancias) || []).map(i => i.base)]);
    (hb.armas || []).forEach(a => { if (armasUsadas.has(a.id)) out.armas.push(a); });
    const ar = (pj.armadura) || {}, armadurasUsadas = new Set(['torso', 'brazos', 'piernas'].map(k => ar[k] && ar[k].tipo).filter(Boolean));
    (hb.armaduras || []).forEach(a => { if (armadurasUsadas.has(a.id)) out.armaduras.push(a); });
    const pericias = new Set(Object.keys((pj.pericias && pj.pericias.noArmas) || {}));
    (hb.pericias || []).forEach(x => { if (pericias.has(x.id)) out.pericias.push(x); });
    const rg = (pj.tecnicas && pj.tecnicas.espadachin && pj.tecnicas.espadachin.rangos) || {};
    (hb.escuelas || []).forEach(e => { if (rg[e.id] > 0) out.escuelas.push(e); });
    const artesUsadas = new Set(((pj.tecnicas && pj.tecnicas.artes && pj.tecnicas.artes.lista) || []).map(x => x.id));
    (hb.artes || []).forEach(x => { if (artesUsadas.has(x.id)) out.artes.push(x); });
    const cj = (pj && pj.conjuros) || {}, usadosCj = new Set([...((cj.mago && cj.mago.libro) || []), ...((cj.mago && cj.mago.memorizados) || []).map(m => m.id), ...((cj.hechicero && cj.hechicero.elegidos) || []), ...((cj.brujo && cj.brujo.conocidos) || [])]);
    Object.values(cj.clases || {}).forEach(c => { (c.libro || []).forEach(i => usadosCj.add(i)); (c.memorizados || []).forEach(m => usadosCj.add(m.id)); });
    const escUsadas = new Set(cj.mago && cj.mago.escuela ? [cj.mago.escuela] : []);
    (hb.conjuros || []).forEach(x => { if (usadosCj.has(x.id)) { out.conjuros.push(x); (x.escuelas || []).forEach(e => escUsadas.add(e)); } });
    (hb.escuelasMagia || []).forEach(x => { if (escUsadas.has(x.id)) out.escuelasMagia.push(x); });
    const linUsado = (hb.linajes || []).find(l => cj.hechicero && l.id === cj.hechicero.linaje); if (linUsado) out.linajes.push(linUsado);
    const pactoUsado = (hb.pactos || []).find(x => cj.brujo && x.id === cj.brujo.pacto); if (pactoUsado) out.pactos.push(pactoUsado);
    const ps = (pj && pj.psionica) || {}, poderesUsados = new Set([...(ps.ciencias || []), ...(ps.devociones || []), ...((ps.talento && ps.talento.poderes) || []).map(x => x.id), ...(ps.activos || []).map(a => a.id)]);
    (hb.poderesPsi || []).forEach(x => { if (poderesUsados.has(x.id)) out.poderesPsi.push(x); });
    const discUsadas = new Set([...(ps.disciplinas || []), ...out.poderesPsi.map(x => ((hb.disciplinasPsi || []).find(d => d.nombre === x.disc) || {}).id).filter(Boolean)]);
    (hb.disciplinasPsi || []).forEach(x => { if (discUsadas.has(x.id)) out.disciplinasPsi.push(x); });
    (hb.defensasPsi || []).forEach(x => { if ((ps.defensas || []).includes(x.id)) out.defensasPsi.push(x); });
    const dt = (pj && pj.dotes) || {}, dtUsadas = new Set([...(dt.comprados || []), dt.humano].filter(Boolean));
    (hb.dotes || []).forEach(x => { if (dtUsadas.has(x.id)) out.dotes.push(x); });
    (hb.dotesNacimiento || []).forEach(x => { if (x.id === dt.tabla) out.dotesNacimiento.push(x); });
    // sin duplicar clases/kits
    ['clases', 'kits'].forEach(t => { const v = new Set(); out[t] = out[t].filter(x => !v.has(x.id) && v.add(x.id)); });
    return out;
  };
})((typeof window !== 'undefined' ? window : globalThis).ADND);
