/* Importa personajes de la hoja vieja (formato ADND2_CHARACTER_V4, V31.2).
   Migra: identidad, características, raza y variante, elecciones raciales, trayectoria, clases, kits
   (arquetipos), PG y todo el homebrew del catálogo (razas, variantes, kits, deidades). */
(function (A) {
  'use strict';
  const U = A.util;

  A.migrarLegacy = function (payload) {
    const avisos = [];
    const ctrl = k => { const x = (payload.controls || {})['#' + k]; return x && x.value !== undefined ? x.value : undefined; };
    const txt = k => { const v = ctrl(k); return v === undefined || v === null ? '' : String(v); };

    let z = {};
    try { z = JSON.parse(ctrl('id2_state_save') || '{}') || {}; } catch (e) { avisos.push('No pude leer el estado de clases del archivo viejo.'); }
    const cat = payload.catalogs || z.catalogs || {};

    const hb = A.hbVacio();
    const baseRaza = id => A.base.razas.find(r => r.id === id);
    const arr6 = m => { const o = {}; (Array.isArray(m) ? m : []).forEach((v, i) => { if (U.num(v)) o[A.STATS[i]] = U.num(v); }); return o; };

    /* ---- razas personalizadas (y sus variantes) ---- */
    const razaLegacy = {};       // clave vieja -> id nuevo
    const variantes = cat.variants || {};
    Object.entries(cat.customRaces || {}).forEach(([k, r]) => {
      const vs = (variantes[k] || []).map(v => (typeof v === 'string' ? { n: v } : v));
      hb.razas.push({
        id: 'legacy-' + k, nombre: r.n, mods: arr6(r.m), nota: r.note || '', efectos: [],
        variantes: vs.map(v => ({ id: U.slug(v.n), nombre: v.n, mods: arr6(v.m), nota: v.note || '', efectos: [] })), elecciones: []
      });
      razaLegacy[k] = 'legacy-' + k;
    });
    /* Variantes personalizadas de razas BASE: no se pueden colgar de una raza base, así que cada una
       se convierte en una raza homebrew "Raza (Variante)" con los ajustes ya sumados. */
    const varLegacy = {};        // `${raza}|${nombreVariante}` -> id de raza nueva
    Object.entries(variantes).forEach(([k, lista]) => {
      const b = baseRaza(k); if (!b) return;
      (lista || []).forEach(v => {
        if (typeof v === 'string' || !v.custom) return;
        const mods = {}; A.STATS.forEach((s, i) => { const t = U.num(b.mods[s]) + U.num((v.m || [])[i]); if (t) mods[s] = t; });
        const id = 'legacy-' + k + '-' + U.slug(v.n);
        hb.razas.push({ id, nombre: `${b.nombre} (${v.n})`, mods, nota: [b.nota, v.note].filter(Boolean).join('\n\n'), efectos: [], variantes: [], elecciones: JSON.parse(JSON.stringify(b.elecciones || [])) });
        varLegacy[k + '|' + v.n] = id;
      });
    });

    /* ---- kits (arquetipos) ---- */
    const kitLegacy = {};        // `${clase}|${idViejo}` -> id nuevo
    Object.entries(cat.archetypes || {}).forEach(([clase, lista]) => {
      (lista || []).forEach(a => {
        const id = 'legacy-' + (a.id || U.slug(a.name) || U.uid());
        const p = a.prof || {};
        hb.kits.push(A.sanear.kit({
          id, nombre: a.name, clase, nota: a.note, habilidades: a.abilities, mods: arr6(a.statMods),
          sobreescribe: { thaco: a.g, salvaciones: a.sv, xp: a.xp, dg: a.dg, dgNivelMax: a.dgMax, pgDespues: a.post },
          pericias: { pa0: p.pa0, pna0: p.pna0, paCada: p.paFreq, pnaCada: p.pnaFreq }
        }));
        kitLegacy[clase + '|' + a.id] = id;
      });
    });

    /* ---- deidades ---- */
    const deidLegacy = {};
    (cat.deities || []).forEach(d => {
      const nombre = typeof d === 'string' ? d : d.nombre;
      if (!nombre || nombre === '—') return;
      const id = 'legacy-deidad-' + U.slug(nombre);
      if (!hb.deidades.some(x => x.id === id)) hb.deidades.push({ id, nombre, nota: '' });
      deidLegacy[nombre] = id;
    });

    /* ---- personaje ---- */
    const pj = A.nuevoPersonaje();
    pj.identidad = {
      nombre: txt('id2_nombre'), jugador: txt('id2_jugador'), alineamiento: txt('id2_alineamiento') || 'Neutral', sexo: txt('id2_sexo'),
      edad: txt('id2_edad'), altura: txt('id2_altura'), peso: txt('id2_peso'), apariencia: txt('id2_apariencia'),
      deidad: deidLegacy[txt('id2_deidad')] || ''
    };
    A.STATS.forEach(s => { const v = txt('id2_' + s + '_base'); if (v) pj.caracteristicas[s] = v; });

    const razaKey = z.race || txt('id2_raza') || 'humano';
    const varNombre = z.variant || txt('id2_variante') || '';
    if (varLegacy[razaKey + '|' + varNombre]) { pj.raza.id = varLegacy[razaKey + '|' + varNombre]; pj.raza.variante = ''; }
    else {
      pj.raza.id = razaLegacy[razaKey] || razaKey;
      const r = baseRaza(razaKey) || hb.razas.find(x => x.id === pj.raza.id);
      const v = r && (r.variantes || []).find(x => x.nombre === varNombre);
      pj.raza.variante = v ? v.id : '';
      if (varNombre && !v) avisos.push(`No encontré la variante "${varNombre}"; revisa la raza.`);
    }
    const rc = z.raceChoices || {};
    pj.raza.elecciones = {};
    if (rc.semiPhysical) pj.raza.elecciones.fisica = rc.semiPhysical;
    if (rc.semiMental) pj.raza.elecciones.mental = rc.semiMental;
    if (rc.tieflingDemonic) pj.raza.elecciones.demoniaca = String(rc.tieflingDemonic);
    if (rc.tieflingExtra) pj.raza.elecciones.extra = String(rc.tieflingExtra);

    pj.trayectoria = txt('id2_trayectoria') || 'unica';
    pj.bonoXp = U.num(z.xpBonus);
    pj.pg.modo = z.hpMode === 'roll' ? 'tirada' : 'maximo';
    pj.clases = (z.classes || []).filter(c => c && c.key).map(c => ({
      clase: c.key, kit: kitLegacy[c.key + '|' + c.arch] || '', estado: c.status === 'Congelada' ? 'Congelada' : 'Activa',
      modo: c.mode === 'manual' ? 'manual' : 'auto', nivel: U.num(c.level) || 1, xp: U.num(c.xp)
    }));
    if (!pj.clases.length) avisos.push('El archivo viejo no traía clases; agrégalas.');
    /* Idiomas escritos a mano en la hoja vieja: se emparejan con la lista o se crean como homebrew. */
    const norm = t => String(t).normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();
    const nativos = new Set();
    { const r0 = A.crearRegistro(A.sanear.paquete(hb)).raza(pj.raza.id); if (r0) (A.base.idiomasRaza[r0.id] || r0.idiomas || []).forEach(i => nativos.add(i)); }
    for (let n = 1; n <= 12; n++) {
      const t = String(ctrl('id2_idioma_' + n) || '').trim(); if (!t) continue;
      const base = A.base.idiomas.find(i => norm(i.nombre) === norm(t));
      let id = base ? base.id : null;
      if (!id) { hb.idiomas = hb.idiomas || []; let h2 = hb.idiomas.find(i => norm(i.nombre) === norm(t)); if (!h2) { h2 = { id: U.idNuevo('legacy-idioma', t), nombre: t, nota: '' }; hb.idiomas.push(h2); } id = h2.id; }
      if (!nativos.has(id) && !pj.idiomas.aprendidos.includes(id)) pj.idiomas.aprendidos.push(id);
    }
    /* Armadura por piezas de la hoja vieja (defense_state): los tipos se emparejan por nombre; lo que no exista se avisa. */
    try {
      const d = JSON.parse(ctrl('defense_state') || '{}'), claves = { acolchada: 'acolchada', cuero: 'cuero', anillas: 'anillas', cuero_tach: 'cuero-tachonado', brigantina: 'brigantina', escamas: 'escamas', piel: 'piel', mallas: 'mallas', bandas: 'bandas', placas_bronce: 'placas-bronce', varillas: 'varillas', placas: 'placas', completa_camp: 'completa-campana', completa: 'completa' };
      const ar = pj.armadura;
      [['torso', 'torso'], ['arms', 'brazos'], ['legs', 'piernas']].forEach(([o, n]) => { const x = d[o]; if (!x) return; ar[n].tipo = claves[x.type] || ''; ar[n].magico = U.num(x.magic); ar[n].nota = String(x.note || ''); if (n !== 'torso') ar[n].cob = Number(x.cov) === 1 ? 1 : 2; });
      Object.keys(ar.equipo).forEach(k => { const q = d.equip && d.equip[k]; if (q) ar.equipo[k] = { nombre: String(q.name || ''), ca: U.num(q.ca), magico: U.num(q.magic), desc: String(q.desc || '') }; });
      ar.generales = (d.general || []).filter(g => g && (g.source || g.value)).map(g => ({ origen: String(g.source || ''), valor: U.num(g.value), aplica: { total: 'total', all: 'todas', total_touch: 'total+toque', total_hard: 'total+dureza' }[g.scope] || 'total' }));
      ar.manual = U.num(d.manual); ar.extra = U.num(d.extra); ar.notas = String(d.notes || '');
    } catch (e) { avisos.push('No se pudo leer la armadura de la hoja vieja; anótala de nuevo.'); }
    /* Pericias sin arma de la hoja vieja (nwp_state): los ids del catálogo base se conservan; las propias pasan a homebrew. */
    try {
      const d = JSON.parse(ctrl('nwp_state') || '{}'), mapa = {};
      hb.pericias = hb.pericias || [];
      (d.custom || []).forEach((c, i) => {
        const cats = { General: 'general', Warrior: 'guerrero', Rogue: 'bribon', Priest: 'sacerdote', Wizard: 'mago', Psionicist: 'psionico' };
        const id = U.idNuevo('legacy-pericia', c.name || String(i)); mapa[c.id] = id;
        hb.pericias.push({ id, nombre: String(c.name || ''), ingles: '', costo: U.num(c.cost) || 1, car: c.ability, mod: U.num(c.mod), cats: (c.cats || []).map(k => cats[k]).filter(Boolean), fuente: String(c.source || (c.sources || [])[0] || 'Homebrew'), nota: String(c.note || '') });
      });
      Object.entries(d.owned || {}).forEach(([id, o]) => {
        pj.pericias.noArmas[mapa[id] || id] = { mejoras: U.num(o.upgrades), concedida: !!o.granted, fuente: String(o.grantSource || ''), car: o.abilityChoice === 'CAR' ? 'CAR' : 'FUE', mod: o.modChoice === null || o.modChoice === undefined ? null : U.num(o.modChoice) };
      });
    } catch (e) { avisos.push('No se pudieron leer las pericias sin arma de la hoja vieja.'); }
    /* Técnicas de bribón y bárbaro de la hoja vieja: puntos repartidos, ajustes y extras. */
    try {
      const d = JSON.parse(ctrl('rogue_tech_state') || '{}'), tb = pj.tecnicas.bribon, mapa = o => { const r = {}; Object.entries(o || {}).forEach(([k, v]) => { const n = Math.round(U.num(v)); if (n) r[k] = n; }); return r; };
      tb.ladron = mapa(d.thief); tb.bardo = mapa(d.bard); tb.manual = mapa(d.manual); tb.bardoAvanzadas = (d.bardAdvanced || []).slice(0, 2).map(String); tb.saberMod = Math.round(U.num(d.loreMod));
      const x = pj.tecnicas.barbaro.extra, e = id => { const v = ctrl(id); return v === undefined || v === null ? '' : String(v).trim(); };
      x.espalda = U.num(e('bar_espalda_extra')); x.escalar = U.num(e('bar_escalarp_extra'));
      x.cf = e('bar_sc_frente_extra'); x.qf = e('bar_sq_frente_extra'); x.ca = e('bar_sc_arriba_extra'); x.qa = e('bar_sq_arriba_extra');
    } catch (err) { avisos.push('No se pudieron leer las técnicas de bribón de la hoja vieja.'); }
    /* Escuelas del Espadachín: cada casilla marcada, en orden dentro de su escuela, es un rango. */
    try {
      const chk = k => { const x = (payload.controls || {})['#' + k]; return !!(x && x.value); };
      ['espada', 'agua', 'norte'].forEach((id, j) => { let n = 0; for (const nv of [1, 4, 7, 10, 13, 16, 19]) { if (chk(`esp_${nv}_c${j + 1}`)) n++; else break; } pj.tecnicas.espadachin.rangos[id] = n; });
    } catch (err) { avisos.push('No se pudieron leer las técnicas de Espadachín de la hoja vieja.'); }
    /* Artes marciales: hasta 3 ranuras (nombre del arte + casilla por movimiento) y cuántos puntos se pagaron con PA. */
    try {
      const chk = k => { const x = (payload.controls || {})['#' + k]; return !!(x && x.value); };
      const lista = [];
      for (let n = 1; n <= 3; n++) {
        const a = A.base.artes.find(x => x.nombre === txt(`am${n}_nombre`)); if (!a || lista.some(x => x.id === a.id)) continue;
        lista.push({ id: a.id, movs: a.movs.filter((m, i) => chk(`am${n}_m${i + 1}`)).map(m => m.k) });
      }
      pj.tecnicas.artes = { pa: Math.max(0, Math.round(U.num(ctrl('am_pa_use')))), lista };
    } catch (err) { avisos.push('No se pudieron leer las artes marciales de la hoja vieja.'); }
    /* Techno: lo que el jugador escribió en cada facultad, las notas de taller y el catálogo de creaciones. */
    try {
      const t = pj.tecnicas.techno;
      const inventos = {}; [['dano', 'tec_dano_inv'], ['proy', 'tec_proy_inv'], ['area', 'tec_area_inv'], ['rt', 'tec_rt_inv'], ['arm', 'tec_arm_inv'], ['montura', 'tec_montura_inv']].forEach(([k, id]) => { inventos[k] = txt(id); });
      t.inventos = inventos;   // el normalizador los pasa a las notas
      t.notas = txt('tec_notas');
      const lista = JSON.parse(ctrl('tec_taller_data') || '[]');
      t.taller = (Array.isArray(lista) ? lista : []).filter(x => x && x.nombre).map(x => ({ nombre: x.nombre, tipo: x.tipo, nivel: x.nivel, dueno: x.dueno, base: x.base, capacidad: x.capacidad, fuente: x.fuente, resultado: x.resultado, desc: x.desc, img: x.img }));
      pj.tecnicas = A.normalizarPersonaje({ tecnicas: pj.tecnicas }).tecnicas;
    } catch (err) { avisos.push('No se pudo leer el taller de Techno de la hoja vieja.'); }
    /* Equipo de la hoja vieja: mochila, transporte, fortaleza y propiedades con su dinero y tesoros. Los pesos se leen como kg. */
    try {
      const R = payload.equipmentRows || {}, filas = k => (Array.isArray(R[k]) ? R[k] : []).filter(Array.isArray), c = v => String(v === undefined || v === null ? '' : v).trim();
      const nm = v => { const n = Number(c(v).replace(',', '.')); return Number.isFinite(n) && n > 0 ? n : ''; };
      const mo = v => { const t = c(v); if (!t) return ''; const p = A.reglas.equipo.parseCoste(t); return p.valor !== null ? p.valor : nm(t); };
      const coins = pre => { const o = {}; ['mc', 'mp', 'me', 'mo', 'mpl'].forEach((k, i) => { const x = (payload.controls || {})['host:' + pre + '_treasury:' + i]; o[k] = Math.floor(Number(x && x.value) || 0); }); return o; };
      const tesoros = k => filas(k).filter(r => c(r[0]) || c(r[1])).map(r => ({ tipo: c(r[0]) || 'Tesoro', desc: c(r[1]), cant: nm(r[2]) || 1, valor: nm(r[3]), peso: nm(r[4]), estado: c(r[5]), notas: c(r[6]) }));
      const eq = pj.equipo;
      eq.mochila.items = filas('eq_pack_rows').filter(r => c(r[0])).map(r => ({ nombre: c(r[0]), cant: nm(r[1]) || 1, peso: nm(r[2]), valor: '', estado: ['Guardado', 'Puesto', 'Consumible'].includes(c(r[6])) ? c(r[6]) : 'Guardado', notas: c(r[7]) }));
      eq.mochila.monedas = coins('pack'); eq.mochila.tesoros = tesoros('pack_treasure_rows');
      const unidad = (tipo, pre, nombre, extra, tk) => Object.assign(A.reglas.equipo.ubicacionNueva(tipo, nombre), extra || {}, { monedas: coins(pre), tesoros: tesoros(tk) });
      filas('eq_transport_rows').filter(r => c(r[0])).forEach((r, i) => { eq.transporte.push(unidad('transporte', i === 0 ? 'transport' : 'x', c(r[0]), { capacidad: nm(r[3]), notas: [c(r[4]), c(r[2]) ? 'Costo: ' + c(r[2]) : ''].filter(Boolean).join(' · ') }, i === 0 ? 'transport_treasure_rows' : 'x')); });
      filas('eq_fort_rows').filter(r => c(r[0])).forEach((r, i) => { eq.fortalezas.push(unidad('fortalezas', i === 0 ? 'fort' : 'x', c(r[0]), { lugar: c(r[3]), notas: c(r[4]), mejoras: c(r[2]) ? [{ nombre: 'Costo anotado en la hoja vieja', coste: mo(r[2]), estado: '', desc: c(r[2]) }] : [] }, i === 0 ? 'fort_treasure_rows' : 'x')); });
      filas('eq_property_rows').filter(r => c(r[0])).forEach((r, i) => { eq.propiedades.push(unidad('propiedades', i === 0 ? 'property' : 'x', c(r[0]), { valor: mo(r[1]), lugar: c(r[2]), notas: c(r[3]) }, i === 0 ? 'property_treasure_rows' : 'x')); });
      /* Si hay dinero o tesoros pero ninguna fila, se conservan en una unidad para no perderlos. */
      [['transport', 'transporte', 'Transporte (hoja vieja)', 'transport_treasure_rows'], ['fort', 'fortalezas', 'Fortaleza (hoja vieja)', 'fort_treasure_rows'], ['property', 'propiedades', 'Propiedades (hoja vieja)', 'property_treasure_rows']].forEach(([pre, tipo, nombre, tk]) => {
        if (eq[tipo].length) return; const u = unidad(tipo, pre, nombre, {}, tk);
        if (A.reglas.equipo.centavosMonedas(u.monedas) || u.tesoros.length) eq[tipo].push(u);
      });
    } catch (err) { avisos.push('No se pudo leer el equipo de la hoja vieja.'); }
    /* Historia y Compañeros de la hoja vieja (los campos sueltos; las listas con filas dinámicas no se importan). */
    try {
      const hi = pj.historia, sq = pj.companeros.secuito, f = pj.companeros.familiar, h1 = (d, k, id) => { d[k] = txt(id); };
      [['titulo', 'his_apodo'], ['origen', 'his_lugar'], ['estatus', 'his_estatus'], ['afiliacion', 'his_afiliacion'], ['profesion', 'his_titulo'], ['lema', 'his_lema'], ['motivacion', 'his_motivo'], ['temor', 'his_temor'], ['ideales', 'his_ideales'], ['rasgos', 'his_rasgos']].forEach(([k, id]) => h1(hi, k, id));
      if (!pj.identidad.apariencia && txt('his_apariencia')) pj.identidad.apariencia = txt('his_apariencia');
      const u = A.imagenSegura(txt('his_portrait_url')); if (u && !u.startsWith('data:')) pj.imagenes.retrato = u;
      sq.tipo = { tropa: 'Tropa (guerrero)', gremio: 'Gremio de ladrones (bribón)', aprendices: 'Aprendices (mago / sacerdote)', mixto: 'Mixto / otros' }[txt('seg_tipo')] || '';
      sq.nombre = txt('seg_grupo'); sq.sede = txt('seg_sede'); sq.moral = txt('seg_moral');
      for (let i = 1; i <= 8; i++) Object.assign(sq.seguidores[i - 1], { nombre: txt(`seg_${i}_nom`), clase: txt(`seg_${i}_clase`), nv: txt(`seg_${i}_nv`), pg: txt(`seg_${i}_pg`), ca: txt(`seg_${i}_ca`), gac0: txt(`seg_${i}_gac0`), notas: txt(`seg_${i}_nota`) });
      for (let i = 1; i <= 6; i++) Object.assign(sq.aprendices[i - 1], { nombre: txt(`apr_${i}_nom`), tradicion: txt(`apr_${i}_trad`), nv: txt(`apr_${i}_nv`), tareas: txt(`apr_${i}_tar`), notas: txt(`apr_${i}_nota`) });
      Object.assign(sq.tropa, { tipo: txt('tropa_tipo'), numero: txt('tropa_n'), nv: txt('tropa_nv'), ca: txt('tropa_ca'), moral: txt('tropa_moral'), notas: txt('tropa_notas') });
      Object.assign(sq.gremio, { nombre: txt('gremio_nom'), miembros: txt('gremio_n'), territorio: txt('gremio_terr'), renta: txt('gremio_renta'), notas: txt('gremio_notas') });
      for (let i = 1; i <= 3; i++) {
        const m = { id: 'mig-mas-' + i, nombre: txt(`mas_${i}_nom`), especie: txt(`mas_${i}_esp`), dg: txt(`mas_${i}_dg`), pg: txt(`mas_${i}_pg`), ca: txt(`mas_${i}_ca`), gac0: txt(`mas_${i}_gac0`), ataque: txt(`mas_${i}_atq`), mov: txt(`mas_${i}_mov`), notas: txt(`mas_${i}_notas`) };
        if (['nombre', 'especie', 'dg', 'pg', 'ca', 'gac0', 'ataque', 'mov', 'notas'].some(k => m[k])) pj.companeros.mascotas.push(m);
      }
      Object.assign(f, { nombre: txt('fam_nom'), tipo: txt('fam_tipo'), dueno: txt('fam_dueno'), nmax: txt('fam_nmax'), pg: txt('fam_pg'), ca: txt('fam_ca'), gac0: txt('fam_gac0'), mov: txt('fam_mov'), inteligencia: txt('fam_int'), alcance: txt('fam_alcance'), sentidos: txt('fam_sentidos'), estado: txt('fam_estado'), vinculo: txt('fam_vinculo') });
      for (let i = 1; i <= 9; i++) { f.poderes[i - 1].poder = txt(`fam_p${i}_nom`); f.poderes[i - 1].efecto = txt(`fam_p${i}_ef`); }
    } catch (err) { avisos.push('No se pudo leer la historia o los compañeros de la hoja vieja.'); }
    pj.notas.historia = txt('his_origen'); pj.notas.general = txt('his_notas');

    avisos.push('Importado desde la hoja vieja: identidad, características, raza, clases, kits, PG y homebrew. ' +
      'Conjuros, armas, pericias detalladas, psiónica e imágenes no se importan todavía (la armadura, el equipo puesto, mochila, transporte, fortaleza y propiedades, historia y compañeros (solo los campos sueltos: objetivos, relaciones, hitos, crónica y compañeros registrados no), las pericias sin arma, las artes marciales, el taller de Techno y las técnicas de bribón, bárbaro y espadachín sí).');
    return { personaje: A.normalizarPersonaje(pj), homebrew: A.sanear.paquete(hb), avisos };
  };
})((typeof window !== 'undefined' ? window : globalThis).ADND);
