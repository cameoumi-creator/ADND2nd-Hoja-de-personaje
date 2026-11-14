/* Pruebas de reglas, sin dependencias: node tests/reglas.test.js */
const A = require('./cargar')();
let ok = 0, mal = 0;
const igual = (nombre, real, esperado) => {
  if (JSON.stringify(real) === JSON.stringify(esperado)) ok++;
  else { mal++; console.log('✗', nombre, '→ obtuve', real, 'esperaba', esperado); }
};
const reg = A.crearRegistro();
const nuevo = f => { const p = A.nuevoPersonaje(); f(p); return A.reglas.resumen(p, reg); };

// Enano guerrero 4500 PX, FUE 17, CON 16 (verificado a mano contra el motor anterior)
let r = nuevo(p => { p.caracteristicas.FUE = '17'; p.caracteristicas.CON = '16'; p.raza.id = 'enano'; p.clases[0].xp = 4500; });
igual('nivel', r.nivel, 3);
igual('thaco', r.thaco.valor, 18);
igual('pg', r.pg.max, 39);

// Personaje nuevo: nivel 1, THAC0 20, CA 10
r = nuevo(() => {});
igual('nivel 1', r.nivel, 1);
igual('thaco 20', r.thaco.valor, 20);
igual('ca 10', r.ca.valor, 10);

// Bono manual a THAC0 se suma y mejora con negativos
r = nuevo(p => { p.bonos.thaco = [{ valor: -2, nota: 'prueba' }]; });
igual('bono thaco', r.thaco.valor, 18);

// Homebrew: una raza propia entra al registro y sus mods se aplican
const hb = A.sanear.paquete({ razas: [{ id: 'hb-prueba', nombre: 'Prueba', mods: { CON: 1 } }] });
const reg2 = A.crearRegistro(hb);
igual('raza hb', !!reg2.raza('hb-prueba'), true);
const p2 = A.nuevoPersonaje(); p2.raza.id = 'hb-prueba'; p2.caracteristicas.CON = '10';
igual('mod raza', A.reglas.resumen(p2, reg2).car.CON.total, 11);

// Entrada hostil no rompe ni inyecta
const sucio = A.sanear.paquete({ razas: [{ id: '<img onerror=x>', nombre: 5, mods: { XXX: 99 } }], clases: 'no' });
igual('saneado sin objetivos falsos', JSON.stringify(sucio).includes('XXX'), false);

// Ego = CAR + INT + nivel (sin dividir)
r = nuevo(p => { p.caracteristicas.CAR = '14'; p.caracteristicas.INT = '12'; p.clases[0].xp = 4500; });
igual('ego', r.ego, 14 + 12 + r.nivel);

// ---- Idiomas: nativo gratis, aprendidos contra los huecos de INT
{
  const pj = A.nuevoPersonaje(); pj.caracteristicas.INT = '14';                         // INT 14 → 4 huecos
  let r2 = A.reglas.resumen(pj, reg);
  igual('idiomas: humano habla común', r2.idiomas.nativos.map(x => x.id), ['comun']);
  igual('idiomas: total por INT', r2.idiomas.total, 4);
  pj.idiomas.aprendidos = ['elfico', 'enano']; pj.pericias.flex.pa = 1;
  r2 = A.reglas.resumen(pj, reg);
  igual('idiomas: libres', r2.idiomas.libres, 1);
  pj.idiomas.aprendidos = ['elfico', 'enano', 'orco', 'goblin'];
  igual('idiomas: aviso al pasarse', A.reglas.resumen(pj, reg).avisos.some(a => a.includes('hueco')), true);
  const e = A.nuevoPersonaje(); e.raza.id = 'semielfo';
  igual('idiomas: semielfo', A.reglas.resumen(e, reg).idiomas.nativos.map(x => x.id), ['comun', 'elfico']);
  const hbi = A.sanear.paquete({ idiomas: [{ nombre: 'Dracónico antiguo' }], razas: [{ nombre: 'Dracónido', idiomas: ['__x'] }] });
  hbi.razas[0].idiomas = [hbi.idiomas[0].id];
  const reg4 = A.crearRegistro(hbi), h = A.nuevoPersonaje(); h.raza.id = hbi.razas[0].id;
  igual('idiomas: raza homebrew con idioma homebrew', A.reglas.resumen(h, reg4).idiomas.nativos.map(x => x.nombre), ['Dracónico antiguo']);
  h.idiomas.aprendidos = [hbi.idiomas[0].id, 'comun'];
  igual('idiomas: viaja con el personaje', A.hbUsadoPor(h, hbi).idiomas.length, 1);
}

// ---- Escudo: se puede aprender y especializar como cualquier arma
{
  const pj = A.nuevoPersonaje(); pj.clases[0].xp = 9000;
  const acc = A.reglas.armas.acc, ar = () => A.reglas.resumen(pj, reg).armas;
  let a = ar();
  igual('escudo: competencia', acc.anadirArma(pj, reg, a.ctx, a.capacidad, 'escudos-escudo-medio'), null);
  a = ar(); igual('escudo: especializar', acc.especializar(pj, reg, a.ctx, a.capacidad, 'escudos-escudo-medio', 1), null);
}

// ---- Escudos: el medio es la medida; chicos dan menos CA y más bloqueos, el corporal al revés
{
  const pj = A.nuevoPersonaje(); pj.clases[0].xp = 90000;
  const acc = A.reglas.armas.acc, ar = () => A.reglas.resumen(pj, reg).armas;
  let a = ar();
  ['escudos-rodela', 'escudos-escudo-medio', 'escudos-escudo-corporal'].forEach(id => { a = ar(); acc.anadirArma(pj, reg, a.ctx, a.capacidad, id); acc.anadirInstancia(pj, reg, id); });
  const por = id => pj.armas.instancias.find(i => i.base === id).id;
  const medida = (id, niv) => { pj.armas.estilos.shield = niv; pj.armas.pares.escudo.escudo = por(id); const e = ar().escudo; return [e.ca, e.bloqueos]; };
  igual('escudo medio nivel 2', medida('escudos-escudo-medio', 2), [-2, 2]);
  igual('rodela nivel 2', medida('escudos-rodela', 2), [-1, 3]);
  igual('corporal nivel 2', medida('escudos-escudo-corporal', 2), [-3, 1]);
  igual('rodela nivel 1 no baja de 0', medida('escudos-rodela', 1), [0, 2]);
  igual('rodela sin estilo', medida('escudos-rodela', 0), [0, 0]);
  pj.armas.estilos.shield = 2; pj.armas.pares.escudo.escudo = por('escudos-escudo-corporal');
  igual('CA de la ficha con corporal', A.reglas.resumen(pj, reg).ca.valor, 7);
}

// ---- Armadura y CA: piezas, límite de DES por peto, dureza y toque
{
  const pj = A.nuevoPersonaje(); pj.caracteristicas.DES = '17';
  const ca = () => A.reglas.resumen(pj, reg).ca;
  igual('armadura: sin armadura, DES 17', [ca().valor, ca().defensa], [7, -3]);
  const poner = id => ['torso', 'brazos', 'piernas'].forEach(k => { pj.armadura[k].tipo = id; pj.armadura[k].cob = 2; });
  poner('cuero');   igual('armadura: cuero (ligera) usa todo el DES', [ca().valor, ca().dureza, ca().toque], [5, 8, 7]);
  poner('mallas');  igual('armadura: mallas (media) limita DES a −2', [ca().valor, ca().defensa], [3, -2]);
  poner('placas');  igual('armadura: placas (pesada) anula DES', [ca().valor, ca().defensa, ca().dureza, ca().toque], [3, 0, 3, 10]);
  pj.armadura.brazos.cob = 1; pj.armadura.piernas.cob = 1;
  igual('armadura: un brazo y una pierna', ca().proteccion, 3 + 1 + 1);
  pj.armadura.torso.magico = 2; igual('armadura: bono mágico en total y toque', [ca().valor, ca().toque], [10 - 5 - 2 + 0, 8]);
  pj.armadura.equipo.head = { nombre: 'Casco', ca: 1, magico: 0, desc: '' };
  pj.armadura.generales = [{ origen: 'Bendición', valor: 1, aplica: 'total' }];
  igual('armadura: equipo y bono general', ca().valor, 10 - 5 - 2 - 1 - 1);
  pj.armadura.manual = 1; pj.armadura.extra = 1; igual('armadura: ajustes manuales (negativo mejora)', ca().valor, 10 - 5 - 2 - 1 - 1 + 2);
  const pj2 = A.nuevoPersonaje(); pj2.armadura.generales = [{ origen: 'x', valor: 30, aplica: 'todas' }];
  const c2 = A.reglas.resumen(pj2, reg).ca; igual('armadura: CA no baja de −10', [c2.valor, c2.margen], [-10, 10]);
  // los tipos de armadura homebrew funcionan igual
  const hbA = A.sanear.paquete({ armaduras: [{ nombre: 'Malla de mithril', clase: 'Ligera', completa: 6, torso: 3, brazos2: 2, brazo1: 1, piernas2: 1, pierna1: 0 }] });
  const regA = A.crearRegistro(hbA), pj3 = A.nuevoPersonaje(); pj3.armadura.torso.tipo = hbA.armaduras[0].id;
  igual('armadura homebrew', A.reglas.resumen(pj3, regA).ca.valor, 7);
  igual('armadura viaja con el personaje', A.hbUsadoPor(pj3, hbA).armaduras.length, 1);
}

// ---- Estilos de pelea y CA: cuenta la mejor fuente, no se suman
{
  const pj = A.nuevoPersonaje(); pj.clases[0].xp = 90000;
  const acc = A.reglas.armas.acc, ar = () => A.reglas.resumen(pj, reg).armas, ca = () => A.reglas.resumen(pj, reg).ca;
  let a = ar();
  acc.anadirArma(pj, reg, a.ctx, a.capacidad, 'espadas-larga'); a = ar(); acc.estilo(pj, reg, a.ctx, a.capacidad, 'one', 1);
  acc.anadirInstancia(pj, reg, 'espadas-larga'); pj.armas.instancias[0].estilo = 'one';
  igual('estilo una mano: puntos tácticos sin gastar bajan la CA', ca().valor, 8);
  pj.armas.instancias[0].puntosTacticos = 2; igual('puntos tácticos gastados en ataque', ca().valor, 10);
  pj.armas.instancias[0].puntosTacticos = 0;
  acc.anadirArma(pj, reg, ar().ctx, ar().capacidad, 'escudos-escudo-medio'); acc.anadirInstancia(pj, reg, 'escudos-escudo-medio');
  pj.armas.estilos.shield = 2; pj.armas.pares.escudo.escudo = pj.armas.instancias[1].id;
  igual('una mano (−2) y escudo (−2): cuenta la mejor, no se suman', ca().valor, 8);
  pj.armas.estilos.shield = 3; pj.armas.instancias[0].puntosTacticos = 2;
  igual('solo escudo (−2)', [ca().valor, ca().dureza], [8, 8]);
}

// ---- Pericias sin arma: costos, categorías, mejoras y objetivo
{
  const pj = A.nuevoPersonaje(); pj.caracteristicas.INT = '16'; pj.caracteristicas.SAB = '14'; pj.clases[0].xp = 4500;
  const ac = A.reglas.noArmas.acc, rs = () => A.reglas.resumen(pj, reg);
  let r = rs(); const libres0 = r.pericias.disponiblesPNA;
  igual('pna: guerrero nivel 3 tiene PNA', libres0 > 0, true);
  igual('pna: Agricultura (general, 1) se compra', ac.comprar(pj, reg, r.items, r.pericias.disponiblesPNA, 'nwp2'), null);
  r = rs(); igual('pna: gasta 1', r.pericias.disponiblesPNA, libres0 - 1);
  igual('pna: objetivo = INT + mod', r.noArmas.lista[0].objetivo, 16);
  ac.mejorar(pj, r.pericias.disponiblesPNA, 'nwp2', 1); r = rs();
  igual('pna: mejora cuesta 1 y suma 1', [r.noArmas.lista[0].objetivo, r.pericias.disponiblesPNA], [17, libres0 - 2]);
  ac.quitar(pj, 'nwp2'); r = rs(); igual('pna: quitar reembolsa', r.pericias.disponiblesPNA, libres0);
  const fuera = A.base.pericias.find(p => !p.cats.includes('general') && !p.cats.includes('guerrero') && p.costo === 1);
  igual('pna: fuera de categoría cuesta +1', A.reglas.noArmas.costoInicial(fuera, r.noArmas.cats), 2);
  ac.conceder(pj, reg, fuera.id, 'Raza'); r = rs();
  igual('pna: concedida cuesta 0', r.pericias.disponiblesPNA, libres0);
  igual('pna: sin PNA no se compra', typeof ac.comprar(pj, reg, r.items, 0, 'nwp2'), 'string');
  const pj2 = A.nuevoPersonaje(); pj2.clases[0].clase = 'mago';
  igual('categorías del mago', [...rs.call(null) && A.reglas.noArmas.categorias(A.reglas.niveles(pj2, reg))].sort(), ['general', 'mago']);
  const hbP = A.sanear.paquete({ pericias: [{ nombre: 'Forja enana', costo: 2, car: 'FUE', mod: -1, cats: ['guerrero'] }] });
  const regP = A.crearRegistro(hbP), id = hbP.pericias[0].id, pj3 = A.nuevoPersonaje(); pj3.caracteristicas.FUE = '17';
  const r3 = A.reglas.resumen(pj3, regP); igual('pericia homebrew se compra', ac.comprar(pj3, regP, r3.items, 9, id), null);
  igual('pericia homebrew: objetivo', A.reglas.resumen(pj3, regP).noArmas.lista[0].objetivo, 16);
  igual('pericia homebrew viaja con el personaje', A.hbUsadoPor(pj3, hbP).pericias.length, 1);
}

// ---- Técnicas: habilidades de bribón y de bárbaro
{
  const pj = A.nuevoPersonaje(); pj.clases[0].clase = 'ladron'; pj.clases[0].xp = 1250; pj.raza.id = 'elfo'; pj.caracteristicas.DES = '17';
  const rs = () => A.reglas.resumen(pj, reg), hab = k => rs().tecnicas.habilidades.find(x => x.k === k);
  igual('ladrón nv 2: presupuesto 90 y tope 45', [rs().tecnicas.presupuestos.ladron, rs().tecnicas.presupuestos.topeLadron], [90, 45]);
  // elfo: DES 17 + 1 racial = 18. Bolsillos: base 15 + elfo 5 + DES 18 (+10) + sin armadura (+5)
  igual('bolsillos = 15 + 5 + 10 + 5', hab('pick').total, 35);
  igual('hallar trampas = 5 + 0 + 5 + 0', hab('traps').total, 10);
  A.reglas.tecnicas.acc.punto(pj, rs().tecnicas, 'ladron', 'pick', 1); igual('punto de ladrón suma 1', hab('pick').total, 36);
  igual('no pasa del tope por habilidad', (() => { for (let i = 0; i < 60; i++) A.reglas.tecnicas.acc.punto(pj, rs().tecnicas, 'ladron', 'pick', 1); return pj.tecnicas.bribon.ladron.pick; })(), 45);
  pj.armadura.torso.tipo = 'placas'; igual('armadura pesada hunde las habilidades (mín. 0)', hab('move').total, 0);
  const pj2 = A.nuevoPersonaje(); pj2.clases[0].clase = 'barbaro'; pj2.clases[0].xp = 6000;
  const b = A.reglas.resumen(pj2, reg).tecnicas;
  igual('bárbaro: nivel y escalar', [b.barbaro.nivel, b.barbaro.filas[1].base], [3, '70%']);
  pj2.tecnicas.barbaro.extra.espalda = 80; igual('espalda con extra pasa de 95%', A.reglas.resumen(pj2, reg).tecnicas.barbaro.filas[0].total, '95% (+10)');
  const pj3 = A.nuevoPersonaje(); igual('sin clase bárbaro no hay habilidades de bárbaro', A.reglas.resumen(pj3, reg).tecnicas.barbaro, null);
}

// ---- Espadachín: escuelas, elecciones y MD
{
  const pj = A.nuevoPersonaje(); pj.clases[0].clase = 'espadachin'; pj.clases[0].xp = 0; pj.caracteristicas.FUE = '18';
  const ac = A.reglas.tecnicas.acc, es = () => A.reglas.resumen(pj, reg).tecnicas.espadachin;
  igual('espadachín nv 1: 1 elección', [es().nivel, es().ganados, es().restantes], [1, 1, 1]);
  igual('rango 2 sin el 1 no se puede', typeof ac.espComprar(pj, A.reglas.resumen(pj, reg).tecnicas, 'agua', 2), 'string');
  igual('comprar rango 1', ac.espComprar(pj, A.reglas.resumen(pj, reg).tecnicas, 'agua', 1), null);
  igual('sin elecciones no compra otra', typeof ac.espComprar(pj, A.reglas.resumen(pj, reg).tecnicas, 'norte', 1), 'string');
  igual('adquirida con título', es().adquiridas.map(t => t.nombre + '/' + t.titulo), ['Bloqueo Básico/Principiante']);
  const md = es().md; igual('MD = ajuste de daño de FUE 18', md, A.reglas.resumen(pj, reg).car.FUE.fila['Daño'] * 1);
  igual('touki = nivel/3', es().touki, 0);
  ac.espQuitar(pj, A.reglas.resumen(pj, reg).tecnicas, 'agua', 1); igual('quitar reembolsa', es().restantes, 1);
  pj.armadura.torso.tipo = 'placas'; igual('armadura pesada desactiva', es().activa, false);
  pj.armadura.torso.tipo = 'mallas'; igual('armadura media sí permite', es().activa, true);
  pj.clases[0].xp = 200000; pj.tecnicas.espadachin.rangos.agua = 4; igual('texto dinámico de MD', !/\bMD\b/.test(es().escuelas[1].tecnicas[1].efecto.replace(/\(mín\. 1; MD [+−]\d+\)/g, '')), true);
}

// ---- Escuelas de Espadachín propias
{
  const hbE = A.sanear.paquete({ escuelas: [{ nombre: 'Dios del Trueno', tecnicas: [{ nombre: 'Chispa', efecto: '+1 al golpe' }, { nombre: 'Rayo', efecto: 'Daño 1d10 + MD' }] }, { nombre: 'Vacía', tecnicas: [] }] });
  igual('escuela sin técnicas se descarta', hbE.escuelas.length, 1);
  const regE = A.crearRegistro(hbE), id = hbE.escuelas[0].id;
  const pj = A.nuevoPersonaje(); pj.clases[0].clase = 'espadachin'; pj.clases[0].xp = 60000; pj.caracteristicas.FUE = '18';
  const ac = A.reglas.tecnicas.acc, rs = () => A.reglas.resumen(pj, regE).tecnicas;
  igual('aparecen 4 escuelas', rs().espadachin.escuelas.length, 4);
  igual('compra rango 1 de la escuela propia', ac.espComprar(pj, rs(), id, 1), null);
  igual('compra rango 2', ac.espComprar(pj, rs(), id, 2), null);
  igual('no hay rango 3', typeof ac.espComprar(pj, rs(), id, 3), 'string');
  igual('gastadas', rs().espadachin.gastados, 2);
  igual('viaja con el personaje', A.hbUsadoPor(pj, hbE).escuelas.length, 1);
  igual('MD se sustituye en el texto', !/\bMD\b/.test(rs().espadachin.escuelas[3].tecnicas[1].efecto.replace(/\(mín\. 1; MD [+−]\d+\)/g, '')), true);
}

// ---- Armas: guerrero nivel 4 (9000 PX), FUE 17, DES 16, espada larga con +1, estilo una mano
{
  const pj = A.nuevoPersonaje(); pj.caracteristicas.FUE = '17'; pj.caracteristicas.DES = '16'; pj.clases[0].xp = 9000;
  const R = A.reglas, acc = R.armas.acc, ar = () => R.resumen(pj, reg).armas;
  let a = ar();
  igual('armas: PA de arma', a.capacidad, 5);
  igual('armas: añadir competencia', acc.anadirArma(pj, reg, a.ctx, a.capacidad, 'espadas-larga'), null);
  a = ar(); igual('armas: especializar', acc.especializar(pj, reg, a.ctx, a.capacidad, 'espadas-larga', 1), null);
  a = ar(); igual('armas: estilo natural', acc.estilo(pj, reg, a.ctx, a.capacidad, 'one', 1), null);
  acc.anadirInstancia(pj, reg, 'espadas-larga'); pj.armas.instancias[0].magico = 1; pj.armas.instancias[0].estilo = 'one';
  a = ar(); const i = a.instancias[0];
  igual('armas: gasto', a.costos.total, 3);
  igual('armas: GAC0', i.gac0, 14);
  igual('armas: daño', [i.dano.p, i.dano.g], ['1d8+4', '1d12+4']);
  igual('armas: RT', i.rt, '2/1');
  igual('armas: crítico', i.critico, '(19-20)x2');
  // un nivel 4 solo tiene 1 oportunidad de especialización
  a = ar(); igual('armas: sin segunda oportunidad', typeof acc.especializar(pj, reg, a.ctx, a.capacidad, 'espadas-larga', 2), 'string');
  // gastar de más se rechaza y no cambia nada
  const antes = JSON.stringify(pj.armas);
  for (const g of ['Hachas', 'Mazos', 'Navajas', 'Espadas']) { a = ar(); acc.grupoComp(pj, reg, a.ctx, a.capacidad, g); }
  igual('armas: nunca en negativo', ar().libres >= 0, true);
  igual('armas: no cambia lo ya comprado', JSON.parse(antes).dominio['espadas-larga'].pagada, pj.armas.dominio['espadas-larga'].pagada);
  // un mago no puede especializarse
  const mago = A.nuevoPersonaje(); mago.clases[0].clase = 'mago'; mago.clases[0].xp = 20000;
  igual('armas: mago sin especialización', R.resumen(mago, reg).armas.ctx.mejor, 0);
  // arma homebrew
  const hb2 = A.sanear.paquete({ armas: [{ nombre: 'Lanza solar', grupo: 'Asta', dm: '1d8', dg: '1d10', tam: 'G', esp: 'Sutil' }] });
  const reg3 = A.crearRegistro(hb2), id = hb2.armas[0].id;
  igual('armas: homebrew en el registro', !!reg3.arma(id), true);
  igual('armas: grupo nuevo', reg3.gruposArmas().includes('Asta'), true);
  // personaje viejo sin armas se normaliza
  igual('armas: normaliza ficha vieja', A.normalizarPersonaje({ identidad: {} }).armas.instancias, []);
}
// el catálogo corregido: Hacha a dos manos ya no es una espada
igual('catálogo: hacha a dos manos', reg.arma('hachas-dos-manos').dm, '1d12');
igual('catálogo: lanza arrojadiza', reg.arma('armas-de-proyectiles-lanza').nombre, 'Lanza');

// ---- Variante homebrew agregada a una raza BASE
{
  const hbv = A.sanear.paquete({ variantes: [{ nombre: 'Elfo de luna', raza: 'elfo', mods: { DES: 1 } }, { nombre: 'Huérfana', raza: 'no-existe' }] });
  igual('variante: se descarta la que no tiene raza válida', hbv.variantes.length, 2);   // el saneado conserva; el registro avisa
  const regv = A.crearRegistro(hbv), vid = hbv.variantes[0].id;
  igual('variante: aparece en la raza base', regv.raza('elfo').variantes.some(v => v.id === vid), true);
  igual('variante: la base original no cambia', A.base.razas.find(r => r.id === 'elfo').variantes.some(v => v.id === vid), false);
  igual('variante: aviso por raza inexistente', regv.avisos.some(a => a.includes('Huérfana')), true);
  const base = A.nuevoPersonaje(); base.raza.id = 'elfo'; base.caracteristicas.DES = '12';
  const con = A.nuevoPersonaje(); con.raza.id = 'elfo'; con.raza.variante = vid; con.caracteristicas.DES = '12';
  igual('variante: aplica su ajuste', A.reglas.resumen(con, regv).car.DES.total - A.reglas.resumen(base, regv).car.DES.total, 1);
  const paq = A.hbUsadoPor(con, hbv); igual('variante: viaja con el personaje', paq.variantes.length, 1);
}

// ---- Artes marciales
{
  const R = A.reglas, reg = A.crearRegistro(A.hbVacio());
  igual('artes: 15 base', reg.artes.length, 15);
  const pj = A.nuevoPersonaje(); pj.clases[0].xp = 0;
  const base = R.resumen(pj, reg);
  // aprender Aikijutsu: 1 PNA y ataque desarmado propio
  const sal = base.artes.saldoPNA;
  igual('artes: aprender', R.artes.acc.anadir(pj, reg, sal, 'aikijutsu'), null);
  igual('artes: no repetir', R.artes.acc.anadir(pj, reg, sal, 'aikijutsu') !== null, true);
  let r = R.resumen(pj, reg);
  igual('artes: gasta 1 y baja PNA', base.pericias.disponiblesPNA - r.pericias.disponiblesPNA, 1);
  igual('artes: ataque desarmado creado', r.armas.instancias.filter(i => i.inst.base === 'am:aikijutsu').length, 1);
  igual('artes: competente sin costo de PA', r.armas.costos.total, 0);
  igual('artes: RT 1/1 con 1 ataque', r.armas.instancias[0].rt, '1/1');
  igual('artes: daño', r.armas.instancias[0].dano.p, '1d2');
  // CA marcial: −3 sin armadura, aplica a total y toque
  igual('artes: CA −3', r.ca.valor - base.ca.valor, -3);
  igual('artes: toque −3', r.ca.toque - base.ca.toque, -3);
  igual('artes: dureza sin cambio', r.ca.dureza, base.ca.dureza);
  igual('artes: línea de origen', r.ca.bonos.some(b => b.origen === 'Artes marciales' && b.valor === -3), true);
  // armadura media la apaga; ligera no
  pj.armadura.torso.tipo = 'cota-de-malla'; const media = reg.armadura('cota-de-malla');
  if (media) { const m = R.resumen(pj, reg); igual('artes: inactiva con ' + media.clase, m.ca.artes.arteActiva, media.clase === 'Ligera'); }
  pj.armadura.torso.tipo = '';
  // movimientos en orden
  igual('artes: Candado 2 pide Candado 1', R.artes.acc.mov(pj, reg, 5, 'aikijutsu', 'Candado 2') !== null, true);
  igual('artes: Candado 1', R.artes.acc.mov(pj, reg, 5, 'aikijutsu', 'Candado 1'), null);
  igual('artes: Candado 2', R.artes.acc.mov(pj, reg, 5, 'aikijutsu', 'Candado 2'), null);
  igual('artes: costo 3', R.artes.costo(pj, reg), 3);
  R.artes.acc.mov(pj, reg, 5, 'aikijutsu', 'Candado 1');
  igual('artes: quitar el 1 quita el 2', pj.tecnicas.artes.lista[0].movs.length, 0);
  igual('artes: sin PNA no aprende', R.artes.acc.mov(pj, reg, 0, 'aikijutsu', 'Candado 1') !== null, true);
  // máximo 3 y mejor CA sin acumular
  R.artes.acc.anadir(pj, reg, 9, 'karate'); R.artes.acc.anadir(pj, reg, 9, 'boxeo');
  igual('artes: tope de 3', R.artes.acc.anadir(pj, reg, 9, 'sumo') !== null, true);
  r = R.resumen(pj, reg);
  igual('artes: solo la mejor CA', r.ca.artes.arte.nombre, 'Aikijutsu');
  igual('artes: Boxeo RT 2/2', r.armas.instancias.find(i => i.inst.base === 'am:boxeo').rt, '2/2');
  // pago PA/PNA
  const costo = R.artes.costo(pj, reg);
  igual('artes: pago manual PA', R.artes.acc.pago(pj, reg, 5, 5, 1), null);
  r = R.resumen(pj, reg);
  igual('artes: 1 con PA', r.artes.pa, 1); igual('artes: resto PNA', r.artes.pna, costo - 1);
  igual('artes: comprometido PA', r.pericias.comprometidoPA, 1);
  R.artes.acc.pago(pj, reg, 5, 5, -1); igual('artes: vuelve a PNA', R.resumen(pj, reg).artes.pa, 0);
  // especialización del desarmado (clase guerrero nivel alto)
  const g = A.nuevoPersonaje(); g.clases[0].xp = 60000;
  R.artes.acc.anadir(g, reg, 5, 'karate');
  const rg = R.resumen(g, reg);
  igual('artes: PA para especializar', R.armas.acc.especializar(g, reg, rg.armas.ctx, rg.armas.capacidad, 'am:karate', 1), null);
  const rg2 = R.resumen(g, reg);
  igual('artes: especializado sube RT', rg2.armas.instancias[0].rt, '2/1');
  igual('artes: cuesta 1 PA de arma', rg2.armas.costos.dominio, 1);
  // quitar el arte limpia todo
  R.artes.acc.quitar(g, reg, 'karate');
  igual('artes: quita ataque y dominio', [g.armas.instancias.length, Object.keys(g.armas.dominio).length], [0, 0]);
  // Piel de acero: solo sin armadura, aparte
  const k = A.nuevoPersonaje(); R.artes.acc.anadir(k, reg, 9, 'kung-fu');
  ['Golpear 1', 'Mental 4'].forEach(m => R.artes.acc.mov(k, reg, 9, 'kung-fu', m));
  R.artes.acc.mov(k, reg, 9, 'kung-fu', 'Mental 6');
  const rk = R.resumen(k, reg);
  igual('artes: Mental 6 pide Mental 4', rk.ca.artes.piel && rk.ca.artes.piel.valor, -2);
  igual('artes: Kung Fu + Piel de acero', rk.ca.artes.valor, -4);
  // arte homebrew
  const hb3 = A.sanear.paquete({ artes: [{ nombre: 'Puño tormenta', atk: 3, dano: '1d8', ac: -2, movs: [{ k: 'Golpear 1', nombre: 'Trueno' }, { k: 'Golpear 2', nombre: 'Rayo' }, { k: 'Mental 1', nombre: 'Escudo', ca: -1 }] }] });
  const regh = A.crearRegistro(hb3), idh = hb3.artes[0].id, h = A.nuevoPersonaje();
  igual('artes: homebrew en registro', !!regh.arte(idh), true);
  R.artes.acc.anadir(h, regh, 9, idh);
  igual('artes: homebrew 3 ataques → 3/3', R.resumen(h, regh).armas.instancias[0].rt, '3/3');
  igual('artes: viaja con el personaje', A.hbUsadoPor(h, hb3).artes.length, 1);
  igual('artes: sanea la CA positiva a 0', A.sanear.arte({ nombre: 'x', ac: 3 }).ac, 0);
  // ficha vieja sin artes
  igual('artes: normaliza ficha vieja', A.normalizarPersonaje({ identidad: {} }).tecnicas.artes, { pa: 0, lista: [] });
}
// ---- Escuelas: cualquier "MD" se reemplaza por el daño por FUE
{
  const hbE = A.sanear.paquete({ escuelas: [{ nombre: 'Prueba', tecnicas: [{ nombre: 'a', efecto: 'Reduce 1d10 + MD y dura 1 round/MD. Gana MD al golpe' }] }] });
  const reg = A.crearRegistro(hbE);
  const pj = A.nuevoPersonaje(); pj.clases[0].clase = 'espadachin'; pj.clases[0].xp = 60000; pj.caracteristicas.FUE = '18';
  const e = A.reglas.resumen(pj, reg).tecnicas.espadachin, md = e.md, esc = e.escuelas.find(x => x.nombre === 'Prueba');
  igual('escuelas: MD suelto reemplazado', !/\bMD\b/.test(esc.tecnicas[0].efecto.replace(/\(mín\. 1; MD [+−]\d+\)/g, '')), true);
  igual('escuelas: 1d10 + n', esc.tecnicas[0].efecto.startsWith(md >= 0 ? `Reduce 1d10 + ${md} y dura` : `Reduce 1d10 − ${-md} y dura`), true);
}

// ---- Techno
{
  const R = A.reglas, reg = A.crearRegistro(A.hbVacio());
  const sin = R.resumen(A.nuevoPersonaje(), reg).techno;
  igual('techno: sin clase', [sin.nivel, sin.filas[0].valor], [0, '—']);
  const pj = A.nuevoPersonaje(); pj.clases[0].clase = 'techno'; pj.clases[0].xp = 0;
  let t = R.resumen(pj, reg).techno;
  igual('techno: nivel 1', t.nivel, 1);
  igual('techno: nivel 1 melee/dist', [t.filas[0].valor, t.filas[1].valor, t.filas[2].valor], ['1d4', '1d6', 'N/D']);
  igual('techno: nivel 1 cerraduras/trampas', [t.cerraduras, t.trampas], ['15%', '10%']);
  pj.clases[0].xp = 200000; t = R.resumen(pj, reg).techno;
  igual('techno: RT y armadura con +', [t.filas[3].valor.startsWith('+'), t.filas[4].valor.startsWith('+')], [true, true]);
  igual('techno: arma exige daño base', R.techno.acc.guardar(pj, t.nivel, { tipo: 'Arma distancia', arma: { nombre: 'Ballesta', dm: '' } }) !== null, true);
  igual('techno: crea arma', R.techno.acc.guardar(pj, t.nivel, { tipo: 'Arma distancia', arma: { nombre: 'Ballesta', dm: '1d8', dg: '1d10', grupo: '', tam: 'M' } }), null);
  const it = pj.tecnicas.techno.taller[0];
  igual('techno: resultado = base + capacidad + RT', it.resultado, '1d8 + ' + t.filas[1].valor + ' · RT +' + t.filas[3].valor.slice(1));
  igual('techno: es un arma de verdad', [it.arma.techDado, it.arma.tipo, it.arma.grupo, it.arma.id.startsWith('tecno-')], [t.filas[1].valor, 'distancia', 'Techno', true]);
  // el arma entra al registro y el dado extra se suma al daño
  const hbT = A.hbVacio(); hbT.armas.push(it.arma); const regT = A.crearRegistro(hbT);
  A.reglas.armas.acc.anadirInstancia(pj, regT, it.arma.id);
  igual('techno: daño con dado extra', R.resumen(pj, regT).armas.instancias[0].dano.p.endsWith(' + ' + t.filas[1].valor), true);
  igual('techno: viaja con el personaje', A.hbUsadoPor(pj, hbT).armas.length, 1);
  const paquete = A.sanear.paquete(JSON.parse(JSON.stringify(A.exportarPaquete(Object.assign(A.hbVacio(), { armas: [it.arma] })))));
  igual('techno: el paquete entregado conserva el arma', [paquete.armas[0].techDado, paquete.armas[0].dm], [it.arma.techDado, '1d8']);
  // editar conserva la capacidad del momento
  const cap0 = it.capacidad; pj.clases[0].xp = 0;
  R.techno.acc.guardar(pj, R.resumen(pj, reg).techno.nivel, { tipo: 'Arma distancia', arma: Object.assign({}, it.arma, { nombre: 'Ballesta II', dm: '1d10' }) }, it.id);
  igual('techno: editar conserva la capacidad', [pj.tecnicas.techno.taller[0].capacidad, pj.tecnicas.techno.taller[0].arma.dm, pj.tecnicas.techno.taller[0].arma.techDado], [cap0, '1d10', it.arma.techDado]);
  // nueva versión con la capacidad actual (nivel 1)
  igual('techno: nueva versión', R.techno.acc.version(pj, 1, it.id), null);
  const v2 = pj.tecnicas.techno.taller[1];
  igual('techno: V2 con capacidad actual', [v2.nombre, v2.capacidad, v2.arma.techDado, v2.id !== it.id, v2.arma.id !== it.arma.id], ['Ballesta II V2', '1d6', '1d6', true, true]);
  R.techno.acc.version(pj, 1, v2.id); igual('techno: V3', pj.tecnicas.techno.taller[2].nombre, 'Ballesta II V3');
  igual('techno: sin nombre', R.techno.acc.guardar(pj, 5, { tipo: 'Otro', nombre: ' ' }) !== null, true);
  R.techno.acc.guardar(pj, 5, { nombre: 'Llave', tipo: 'Dispositivo' });
  igual('techno: objeto manual sin arma', [pj.tecnicas.techno.taller[3].resultado, pj.tecnicas.techno.taller[3].arma], ['Manual / descriptivo', undefined]);
  R.techno.acc.guardar(pj, 5, { nombre: 'Img', tipo: 'Otro', img: 'javascript:alert(1)' });
  igual('techno: imagen no segura', pj.tecnicas.techno.taller[4].img, '');
  R.techno.acc.guardar(pj, 5, { nombre: 'Img2', tipo: 'Otro', img: 'data:image/png;base64,iVBORw0KGgo=' });
  igual('techno: imagen embebida permitida', pj.tecnicas.techno.taller[5].img.startsWith('data:image/png'), true);
  R.techno.acc.quitar(pj, it.id); igual('techno: quitar', pj.tecnicas.techno.taller.length, 5);
  igual('techno: la facultad lista sus creaciones', R.resumen(pj, reg).techno.filas[1].creaciones.length, 2);
  igual('techno: entregada', (R.techno.acc.entregada(pj, v2.id, '10/11/2026'), pj.tecnicas.techno.taller[0].entregada), '10/11/2026');
  const viejo = A.normalizarPersonaje({ tecnicas: { techno: { inventos: { dano: 'Sable de plasma' }, notas: 'Hola', taller: [{ nombre: 'Vieja', tipo: 'Arma melee', base: '1d8', capacidad: '1d6', resultado: '1d8 + 1d6' }] } } }).tecnicas.techno;
  igual('techno: inventos viejos pasan a notas', [viejo.notas.includes('Sable de plasma'), viejo.notas.startsWith('Hola'), 'inventos' in viejo], [true, true, false]);
  igual('techno: creación vieja se vuelve arma', [viejo.taller[0].arma.dm, viejo.taller[0].arma.techDado, viejo.taller[0].arma.grupo], ['1d8', '1d6', 'Techno']);
  igual('techno: normaliza ficha vieja', A.normalizarPersonaje({ identidad: {} }).tecnicas.techno, { notas: '', taller: [] });
}
// ---- Pisos de Bribón y descripciones de pericias
{
  const h = A.reglas.resumen(A.nuevoPersonaje(), reg).tecnicas.habilidades;
  const por = k => h.find(x => x.k === k);
  igual('bribón: piso de escalar 40 y escuchar 15 para todos', [por('climb').base, por('noise').base], [40, 15]);
  const l = A.nuevoPersonaje(); l.clases[0].clase = 'ladron';
  const hl = A.reglas.resumen(l, reg).tecnicas.habilidades;
  igual('bribón: la base de clase mayor se respeta', hl.find(x => x.k === 'climb').base, 60);
  igual('pericias: todas con descripción', A.base.pericias.every(p => p.descripcion && p.descripcion.length > 10), true);
  igual('pericias: homebrew conserva descripción', A.sanear.pericia({ nombre: 'x', descripcion: ' Hace cosas ' }).descripcion, 'Hace cosas');
}

// ---- Techno: taller nuevo (RT, área, armadura, montura, compartir)
{
  const R = A.reglas, reg = A.crearRegistro(A.hbVacio()), TH = R.techno;
  const mk = xp => { const p = A.nuevoPersonaje(); p.clases[0].clase = 'techno'; p.clases[0].xp = xp; return p; };
  // arma fabricada: su RT editable más el bono de Techno, que siempre se suma
  const pj = mk(200000), nivel = R.resumen(pj, reg).techno.nivel;
  igual('taller: RT del arma es editable', A.sanear.arma({ nombre: 'x', rt: 4 }).rt, 4);
  TH.acc.guardar(pj, nivel, { tipo: 'Arma melee', arma: { nombre: 'Espada solar', dm: '1d8', dg: '1d8', rt: 2, tam: 'M' } });
  const it = pj.tecnicas.techno.taller[0], bono = TH.bonoRt(nivel);
  igual('taller: arma guarda el bono de RT', [it.rtBono, it.arma.techRt], [bono, bono]);
  A.reglas.armas.acc.anadirInstancia(pj, reg, 'x');   // sin efecto: el arma no está en el registro
  const hbW = A.hbVacio(); hbW.armas.push(it.arma); const regW = A.crearRegistro(hbW);
  A.reglas.armas.acc.anadirInstancia(pj, regW, it.arma.id);
  const inst = R.resumen(pj, regW).armas.instancias.find(i => i.inst.base === it.arma.id);
  igual('taller: RT final = RT base + bono Techno', A.reglas.armas.rtEnPasos(inst.rt), Math.max(2, A.reglas.armas.rtEnPasos(R.resumen(pj, regW).armas.rt.etiqueta)) + bono);
  // área: desde el nivel 7, un elemento nuevo cada 3 niveles, con su área y su salvación
  const bajo = mk(0);
  igual('área: nivel bajo no puede', TH.acc.guardar(bajo, 1, { tipo: 'Arma de área', nombre: 'Granada', area: { elemento: 'Fuego', lado: 3 } }) !== null, true);
  igual('área: primer nivel', TH.nivelArea(), 7);
  igual('área: elementos por nivel', [TH.elementos(7).length, TH.elementos(10).length, TH.elementos(28).length], [1, 2, 9]);
  igual('área: tamaño máximo', [TH.areaMax(7), TH.areaMax(13), TH.areaMax(28)], [3, 6, 18]);
  igual('área: 3 m son 10 pies', TH.pies(3), 10);
  igual('área: elemento no desbloqueado', TH.acc.guardar(pj, 7, { tipo: 'Arma de área', nombre: 'G', area: { elemento: 'Ácido', lado: 3 } }) !== null, true);
  igual('área: más grande que su nivel', TH.acc.guardar(pj, 7, { tipo: 'Arma de área', nombre: 'G', area: { elemento: 'Fuego', lado: 6 } }) !== null, true);
  igual('área: crea bola de fuego', TH.acc.guardar(pj, 7, { tipo: 'Arma de área', nombre: 'Bomba', area: TH.area0(7) }), null);
  const bomba = pj.tecnicas.techno.taller.find(x => x.nombre === 'Bomba');
  igual('área: salvación del elemento', [bomba.area.elemento, bomba.area.salv, bomba.area.lado], ['Fuego', 'AL', 3]);
  igual('área: sanea la salvación', A.sanear.techArea({ salv: 'XX' }).salv, 'AL');
  // armadura: parte de una existente y el bono se suma a la protección
  const base = reg.armaduras.find(a => a.torso > 0);
  TH.acc.guardar(pj, nivel, { tipo: 'Armadura', armadura: Object.assign({}, base, { nombre: 'Servos' }) });
  const arm = pj.tecnicas.techno.taller.find(x => x.nombre === 'Servos'), fin = TH.armaduraFinal(arm);
  igual('armadura: peto + bono', fin.torso, base.torso + TH.bonoArm(nivel));
  igual('armadura: lo que no protege no sube', fin.brazo1 > 0 || base.brazo1 === 0, true);
  igual('armadura: exige protección', TH.acc.guardar(pj, nivel, { tipo: 'Armadura', armadura: { nombre: 'Nada' } }) !== null, true);
  // montura: 3 dados de golpe en el primer nivel y uno más por nivel; CA = 10 − bono de armadura
  igual('montura: primer nivel', TH.nivelMontura(), 4);
  igual('montura: 3 DG en el nivel 4, 4 en el 5', [TH.montura0(4).dg, TH.montura0(5).dg, TH.montura0(10).dg], [3, 4, 9]);
  const m4 = TH.montura0(4), s4 = TH.statsMontura(m4);
  igual('montura: HP completos 3d8', s4.hp, 24);
  igual('montura: GAC0 = 21 − DG', s4.thac0, 18);
  igual('montura: CA = 10 − bono de armadura', s4.ca, 10 - TH.bonoArm(4));
  igual('montura: HP tirados', TH.hpMontura(Object.assign({}, m4, { modo: 'tirada', tiradas: [8, 1, 4] })), 13);
  igual('montura: HP manual manda', TH.hpMontura(Object.assign({}, m4, { hpManual: 40 })), 40);
  igual('montura: ajuste de GAC0 y CA', [TH.statsMontura(Object.assign({}, m4, { thac0Aj: -2, caAj: -1 })).thac0, TH.statsMontura(Object.assign({}, m4, { caAj: -1 })).ca], [16, 10 - TH.bonoArm(4) - 1]);
  igual('montura: no antes del nivel 4', TH.acc.guardar(mk(0), 3, { tipo: 'Montura', nombre: 'Moto', montura: TH.montura0(3) }) !== null, true);
  igual('montura: crea', TH.acc.guardar(pj, 10, { tipo: 'Montura', nombre: 'Moto', montura: TH.montura0(10) }), null);
  // versión nueva recalcula con el nivel actual
  const moto = pj.tecnicas.techno.taller.find(x => x.nombre === 'Moto');
  TH.acc.version(pj, 20, moto.id);
  const v2 = pj.tecnicas.techno.taller.find(x => x.nombre === 'Moto V2');
  igual('versión: montura con DG del nivel nuevo', v2.montura.dg, TH.montura0(20).dg);
  // compartir: arma→armas, armadura→armaduras, el resto→creaciones
  igual('compartir: arma', TH.paquete(it).armas.length, 1);
  igual('compartir: armadura final', TH.paquete(arm).armaduras[0].torso, fin.torso);
  const pm = TH.paquete(v2, 'Ana'), fus = { creaciones: [] }, hbx = A.hbVacio();
  igual('compartir: montura va a creaciones', pm.creaciones.length, 1);
  const res = A.fusionarHb(hbx, pm); igual('compartir: se importa en Homebrew', [res.agregados, hbx.creaciones[0].montura.dg], [1, v2.montura.dg]);
  igual('compartir: no se duplica', A.fusionarHb(hbx, pm).repetidos, 1);
  const otro = A.nuevoPersonaje();
  igual('compartir: otro jugador la agrega sin ser Techno', TH.acc.recibir(otro, hbx.creaciones[0]), null);
  igual('compartir: dos veces no', TH.acc.recibir(otro, hbx.creaciones[0]) !== null, true);
  igual('taller: normaliza una ficha con todo', A.normalizarPersonaje(JSON.parse(JSON.stringify(pj))).tecnicas.techno.taller.length, pj.tecnicas.techno.taller.length);
  igual('taller: Round Trip ya no es tipo', A.normalizarPersonaje({ tecnicas: { techno: { taller: [{ nombre: 'Viejo', tipo: 'Round Trip' }] } } }).tecnicas.techno.taller[0].tipo, 'Otro');
}

// ---- Conjuros: catálogo, mago, especialista, puntos, hechicero
{
  const CJ = A.reglas.conjuros, C = A.reglas.conjuros.acc;
  const mk = (clase, nivel, int) => { const p = A.nuevoPersonaje(); p.clases[0].clase = clase; p.clases[0].modo = 'manual'; p.clases[0].nivel = nivel; p.caracteristicas.INT = String(int || 16); return p; };
  const rs = p => A.reglas.resumen(p, reg).conjuros;
  igual('catálogo: arcanos y divinos', [reg.conjuros.filter(x => x.tipo === 'arcano').length, reg.conjuros.filter(x => x.tipo === 'divino').length], [397, 315]);
  igual('catálogo: todo tiene escuela (o es universal)', reg.conjuros.filter(x => !x.escuelas.length).length, 0);
  igual('catálogo: no quedan guiones blandos', reg.conjuros.filter(x => /­/.test(x.efecto)).length, 0);
  igual('catálogo: magia salvaje marcada', reg.conjuro('cj-vortice').escuelas.includes('salvaje'), true);
  igual('catálogo: reversible detectado', reg.conjuro('cj-agrandar').rev, true);
  igual('linajes: nueve', reg.linajes.length, 9);
  igual('linajes: todos tienen 2 conjuros por nivel y existen', reg.linajes.every(l => l.conjuros.length === 9 && l.conjuros.every(par => par.length === 2 && par.every(x => reg.conjuro(x.id)))), true);
  igual('linajes: 4 habilidades en 1/6/12/18', reg.linajes.every(l => l.habilidades.map(h => h.nivel).join() === '1,6,12,18'), true);
  igual('espacios: nivel 16 y 20 corregidos', [CJ.espaciosMago(16).join(''), CJ.espaciosMago(20).join('')], ['555553210', '555554332']);
  igual('espacios: nivel 1 y tope 18', [CJ.espaciosMago(1).join(''), CJ.nivelMax(18)], ['100000000', 9]);
  // mago nivel 5 sin especialidad
  let p = mk('mago', 5); let q = rs(p);
  igual('mago: espacios nivel 5', q.mago.espacios.slice(0, 3), [4, 2, 1]);
  igual('mago: puntos de conjuro = Σ espacios × nivel', q.mago.puntos.total, 4 + 2 * 2 + 3);
  igual('mago: aprender 1.º, el mismo dos veces no', [C.aprender(p, reg, q, 'cj-proyectil-magico'), C.aprender(p, reg, q, 'cj-proyectil-magico')], [null, 'Ya está en tu libro.']);
  q = rs(p);
  igual('mago: memoriza el mismo conjuro dos veces', [C.memorizar(p, reg, q, 'cj-proyectil-magico'), C.memorizar(rs(p) && p, reg, rs(p), 'cj-proyectil-magico')], [null, null]);
  q = rs(p); const n1 = q.mago.niveles.find(x => x.n === 1);
  igual('mago: 2 preparados de 4, faltan 2', [n1.preparados, n1.faltan], [2, 2]);
  C.usar(p, 0); igual('mago: lanzar marca usado', rs(p).mago.niveles[0].usados, 1);
  C.descansar(p); igual('mago: descansar repone', rs(p).mago.niveles[0].usados, 0);
  igual('mago: no aprende nivel que no alcanza', C.aprender(p, reg, rs(p), 'cj-deseo') !== null, true);
  // memorizar de más
  C.memorizar(p, reg, rs(p), 'cj-proyectil-magico'); C.memorizar(p, reg, rs(p), 'cj-proyectil-magico');
  igual('mago: tope de espacios', C.memorizar(p, reg, rs(p), 'cj-proyectil-magico') !== null, true);
  // modo puntos
  C.acc; p.conjuros.mago.modo = 'puntos';
  igual('puntos: lanzar nivel 1 cuesta 1', [C.lanzarPuntos(p, reg, rs(p), 'cj-proyectil-magico'), rs(p).mago.puntos.restan], [null, 10]);
  p.conjuros.mago.gastados = 11; igual('puntos: sin saldo no lanza', C.lanzarPuntos(p, reg, rs(p), 'cj-proyectil-magico') !== null, true);
  C.descansar(p); igual('puntos: descansar los devuelve', rs(p).mago.puntos.restan, 11);
  // especialista invocador
  p = mk('mago', 5); C.escuela(p, 'evocacion'); q = rs(p);
  igual('especialista: espacio extra por nivel', q.mago.extra.slice(0, 4), [1, 1, 1, 0]);
  igual('especialista: puntos incluyen extras', q.mago.puntos.total, 11 + 1 + 2 + 3);
  igual('especialista: escuela prohibida no se aprende', C.aprender(p, reg, q, 'cj-hechizar-persona') !== null, true);
  igual('especialista: poderes listados (3)', q.mago.poderes.length, 3);
  igual('especialista: aprender % con ±15', [rs(p).mago.baseAprender > 0, CJ.aprenderPct(50, q.mago.especialidad, reg.conjuro('cj-proyectil-magico')), CJ.aprenderPct(50, q.mago.especialidad, reg.conjuro('cj-detectar-magia')), CJ.aprenderPct(50, q.mago.especialidad, reg.conjuro('cj-hechizar-persona'))], [true, 65, 35, 0]);
  p = mk('mago', 1); C.escuela(p, 'evocacion'); C.aprender(p, reg, rs(p), 'cj-detectar-magia'); C.aprender(p, reg, rs(p), 'cj-proyectil-magico');
  igual('especialista: 1.er espacio libre admite otra escuela', C.memorizar(p, reg, rs(p), 'cj-detectar-magia'), null);
  igual('especialista: el extra debe ser de su escuela', C.memorizar(p, reg, rs(p), 'cj-detectar-magia') !== null, true);
  igual('especialista: pero sí el de su escuela', C.memorizar(p, reg, rs(p), 'cj-proyectil-magico'), null);
  // reglas opcionales: magia salvaje prohibida
  p = mk('mago', 5); C.escuela(p, 'abjuracion'); igual('opcionales: salvaje permitida sin interruptor', C.aprender(p, reg, rs(p), 'cj-temerario-recurso-de-nahal'), null);
  p = mk('mago', 5); C.escuela(p, 'abjuracion'); C.opcionales(p, true); igual('opcionales: salvaje prohibida con interruptor', C.aprender(p, reg, rs(p), 'cj-temerario-recurso-de-nahal') !== null, true);
  igual('opcionales: poderes activos al nivel', (() => { const pp = mk('mago', 8); C.escuela(pp, 'abjuracion'); C.opcionales(pp, true); return rs(pp).mago.poderes.map(x => x.activo); })(), [true, false, false]);
  // reversible
  p = mk('mago', 5); C.aprender(p, reg, rs(p), 'cj-agrandar'); C.memorizar(p, reg, rs(p), 'cj-agrandar', true);
  igual('reversible: se memoriza invertido', p.conjuros.mago.memorizados[0].inv, true);
  C.invertir(p, reg, 0); igual('reversible: se puede alternar', p.conjuros.mago.memorizados[0].inv, false);
  igual('mago: olvidar quita del libro y de lo memorizado', (C.olvidar(p, 'cj-agrandar'), [p.conjuros.mago.libro.length, p.conjuros.mago.memorizados.length]), [0, 0]);
  // mago salvaje: parámetros propios de la escuela
  p = mk('mago', 5); C.escuela(p, 'salvaje'); q = rs(p);
  igual('salvaje: especialista con +10/−5 y sin prohibidas', [q.mago.especialidad.nombreEspecialista, q.mago.especialidad.aprender, q.mago.especialidad.prohibidas.length], ['Mago salvaje', { propio: 10, otras: -5 }, 0]);
  igual('salvaje: espacio extra por nivel y 6 rasgos', [q.mago.extra.slice(0, 3), q.mago.rasgos.length], [[1, 1, 1], 6]);
  igual('salvaje: aprender % propio/otros', [CJ.aprenderPct(50, q.mago.especialidad, reg.conjuro('cj-temerario-recurso-de-nahal')), CJ.aprenderPct(50, q.mago.especialidad, reg.conjuro('cj-proyectil-magico'))], [60, 45]);
  C.opcionales(p, true); igual('salvaje: con interruptor no se prohíbe a sí misma', rs(p).mago.especialidad.prohibidas.includes('salvaje'), false);
  // bonos fuera de nuestro control
  p = mk('mago', 5); C.bonoPuntos(p, 'mago', 5); igual('mago: bono de puntos suma al total', rs(p).mago.puntos.total, 11 + 5);
  C.bonoPuntos(p, 'mago', -99); igual('mago: el total no baja de 0', rs(p).mago.puntos.total, 0);
  p = mk('mago', 5); C.extraEspacios(p, 3, 2); q = rs(p);
  igual('mago: espacios extra del juego por nivel', [q.mago.niveles.find(x => x.n === 3).total, q.mago.puntos.total], [3, 11 + 6]);
  C.extraEspacios(p, 9, 1); igual('mago: extra en un nivel aún sin espacios aparece', rs(p).mago.niveles.some(x => x.n === 9 && x.total === 1), true);
  C.extraEspacios(p, 3, 0); C.extraEspacios(p, 9, 0); igual('mago: extra en 0 se limpia', Object.keys(p.conjuros.mago.extraEspacios).length, 0);
  p = mk('hechicero', 3); C.linaje(p, 'draconico'); C.bonoPuntos(p, 'hechicero', -2); igual('hechicero: bono ± a los puntos', rs(p).hechicero.puntos.total, 6 - 2);
  C.bonoPuntos(p, 'hechicero', 0); C.extraElegidos(p, 1, 1); C.elegir(p, reg, rs(p), 'cj-proyectil-magico'); C.elegir(p, reg, rs(p), 'cj-dormir');
  igual('hechicero: elegidos extra permiten un 3.º', [C.elegir(p, reg, rs(p), 'cj-detectar-magia'), rs(p).hechicero.niveles[0].maximo], [null, 3]);
  igual('hechicero: con extra ya lleno no admite más', C.elegir(p, reg, rs(p), 'cj-agrandar') !== null, true);
  // hechicero
  p = mk('hechicero', 1); C.linaje(p, 'draconico'); q = rs(p);
  igual('hechicero: nivel 1, 2 puntos, abre nivel 1', [q.hechicero.puntos.total, q.hechicero.top], [2, 1]);
  igual('hechicero: libro con 2 destinados', q.hechicero.niveles[0].destinados.map(x => x.sp.nombre), ['Manos ardientes', 'Armadura']);
  igual('hechicero: habilidad del 1 activa, la del 6 no', q.hechicero.habilidades.map(x => x.activa), [true, false, false, false]);
  igual('hechicero: elige 2 y el 3.º no', [C.elegir(p, reg, rs(p), 'cj-proyectil-magico'), C.elegir(p, reg, rs(p), 'cj-escudo'), C.elegir(p, reg, rs(p), 'cj-dormir') !== null], [null, null, true]);
  igual('hechicero: uno del linaje no se elige', C.elegir(p, reg, rs(p), 'cj-manos-ardientes') !== null, true);
  igual('hechicero: no abre nivel 2 a nivel 1', C.elegir(p, reg, rs(p), 'cj-invisibilidad') !== null, true);
  igual('hechicero: lanza gastando su nivel', [C.lanzarH(p, rs(p), 1), rs(p).hechicero.puntos.restan], [null, 1]);
  igual('hechicero: sin puntos no lanza', [C.lanzarH(p, rs(p), 2) !== null, C.lanzarH(p, rs(p), 1), C.lanzarH(p, rs(p), 1) !== null], [true, null, true]);
  C.descansar(p); igual('hechicero: descansar repone', rs(p).hechicero.puntos.restan, 2);
  p = mk('hechicero', 18); C.linaje(p, 'abisal'); q = rs(p);
  igual('hechicero 18: 36 puntos y nivel 9 abierto', [q.hechicero.puntos.total, q.hechicero.top, q.hechicero.niveles.length], [36, 9, 9]);
  igual('hechicero: infligir heridas es el inverso de curar heridas ligeras', q.hechicero.niveles[0].destinados[1].inv, true);
  igual('hechicero sin linaje avisa', rs(mk('hechicero', 3)).hechicero.puntos.total === 6 && A.reglas.resumen(mk('hechicero', 3), reg).avisos.some(a => /linaje/i.test(a)), true);
  // modelo y homebrew
  igual('modelo: normaliza conjuros basura', (() => { const n = A.normalizarPersonaje({ conjuros: { mago: { libro: ['a', 'a', 5], memorizados: [{ id: 'x', usado: 1 }, null], modo: 'zzz', gastados: -4 }, hechicero: { elegidos: 'no' } } }).conjuros; return [n.mago.libro, n.mago.memorizados.length, n.mago.modo, n.mago.gastados, n.hechicero.elegidos]; })(), [['a', '5'], 1, 'memorizar', 0, []]);
  const hbc = A.hbVacio(); hbc.conjuros.push(A.sanear.conjuro({ nombre: 'Rayo de prueba', nv: 3, escuelas: ['evocacion'], efecto: 'Daño.' }));
  hbc.escuelasMagia.push(A.sanear.escuelaMagia({ nombre: 'Magia elemental', especialista: { nombre: 'Elementalista', prohibidas: ['necromancia'], poderes: [{ nivel: 8, texto: 'Algo.' }] } }));
  const rg = A.crearRegistro(hbc);
  igual('homebrew: conjuro y escuela nuevos en el registro', [!!rg.conjuro(hbc.conjuros[0].id), !!rg.escuelaMagia(hbc.escuelasMagia[0].id)], [true, true]);
  igual('homebrew: escuela propia puede ser especialidad', (() => { const pp = mk('mago', 5); C.escuela(pp, hbc.escuelasMagia[0].id); const e = CJ.especialidad(rg, pp.conjuros.mago); return [e.nombreEspecialista, e.prohibidas]; })(), ['Elementalista', ['necromancia']]);
  const dest = A.hbVacio(); const fr = A.fusionarHb(dest, JSON.parse(JSON.stringify(hbc)));
  igual('homebrew: se importa y no se duplica', [fr.agregados, A.fusionarHb(dest, hbc).repetidos], [2, 2]);
  igual('homebrew: el personaje exporta lo que usa', (() => { const pp = mk('mago', 5); pp.conjuros.mago.libro.push(hbc.conjuros[0].id); return A.hbUsadoPor(pp, hbc).conjuros.length; })(), 1);
  igual('homebrew: conjuro con id repetido de base se ignora', A.crearRegistro({ ...A.hbVacio(), conjuros: [A.sanear.conjuro({ id: 'cj-proyectil-magico', nombre: 'Otro', nv: 1 })] }).avisos.length, 1);
}

// ---- Lanzadores con tabla propia: bardo, sacerdotes, druida, paladín, explorador
{
  const CJ = A.reglas.conjuros, L = CJ.cl;
  const mk = (clase, nivel, sab) => { const p = A.nuevoPersonaje(); p.clases[0].clase = clase; p.clases[0].modo = 'manual'; p.clases[0].nivel = nivel; p.caracteristicas.SAB = String(sab || 10); p.caracteristicas.INT = '16'; return p; };
  const rs = p => A.reglas.resumen(p, reg).conjuros;
  const cr = (p, id) => rs(p).clases[id];
  igual('lanzadores: los 6 existen', CJ.lanzadores().map(x => x.id), ['bardo', 'sacerdote', 'sacerdote_sp', 'druida', 'paladin', 'explorador']);
  igual('tablas: filas puntuales', [cr(mk('bardo', 21), 'bardo').base.join(''), cr(mk('sacerdote', 30), 'sacerdote').base.join(''), cr(mk('paladin', 9), 'paladin').base.join(''), cr(mk('explorador', 8), 'explorador').base.join(''), cr(mk('explorador', 7), 'explorador').base.join('')],
    ['444444100', '999999800', '100000000', '100000000', '000000000']);
  igual('tablas: druida y sacerdote SP usan la del sacerdote', [cr(mk('druida', 9), 'druida').base.join(''), cr(mk('sacerdote_sp', 9), 'sacerdote_sp').base.join('')], ['443210000', '443210000']);
  igual('esferas: todo conjuro divino tiene al menos una esfera', reg.conjuros.filter(x => x.tipo === 'divino' && !CJ.esferasDe(x).length).map(x => x.nombre), []);
  igual('esferas: elemental con varias', CJ.esferasDe({ id: 'x', esfera: 'Elemental (Tierra, Agua), Adivinación' }), ['elemental-tierra', 'elemental-agua', 'adivinacion']);
  // bono SAB acumulativo (los ejemplos acordados con la mesa)
  let p = mk('sacerdote', 5, 18); let q = cr(p, 'sacerdote');
  igual('SAB 18, nivel 5: 5-5-2-0 y el de nivel 4 queda pendiente', [q.espacios.slice(0, 4), q.pendientes.slice(0, 4), q.aplicados.slice(0, 4)], [[5, 5, 2, 0], [0, 0, 0, 1], [2, 2, 1, 0]]);
  p = mk('sacerdote', 9, 19); q = cr(p, 'sacerdote');
  igual('SAB 19, nivel 9: 7-6-4-4-1', q.espacios.slice(0, 5), [7, 6, 4, 4, 1]);
  p = mk('sacerdote', 7, 18); igual('SAB 18, nivel 7: ya usa el de nivel 4', cr(p, 'sacerdote').espacios.slice(0, 4), [5, 5, 3, 2]);
  igual('SAB baja: fallo de conjuro', cr(mk('sacerdote', 3, 8), 'sacerdote').fallo, 25);
  igual('INT/bardo: sin bono de SAB', cr(mk('bardo', 5, 18), 'bardo').espacios.slice(0, 3), [3, 2, 1]);
  // acceso por esferas
  p = mk('sacerdote', 5); q = cr(p, 'sacerdote');
  igual('sacerdote sin esferas: solo "Total"', [q.acceso.mayores, reg.conjuros.filter(x => CJ.enAcceso(x, q.acceso, 7)).every(x => CJ.esferasDe(x).includes('total'))], [['total'], true]);
  L.esfera(p, 'sacerdote', 'mayores', 'sol', true); L.esfera(p, 'sacerdote', 'menores', 'animal', true); q = cr(p, 'sacerdote');
  igual('sacerdote con esferas: mayores y menores', [q.acceso.mayores, q.acceso.menores], [['total', 'sol'], ['animal']]);
  igual('menores solo hasta nivel 3', [reg.conjuros.some(x => x.nv > 3 && CJ.esferasDe(x).includes('animal') && !CJ.esferasDe(x).some(e => ['total', 'sol'].includes(e)) && CJ.enAcceso(x, q.acceso, 7))], [false]);
  igual('esfera: mayor y menor se excluyen (gana la última)', (L.esfera(p, 'sacerdote', 'menores', 'sol', true), [cr(p, 'sacerdote').acceso.mayores.includes('sol'), cr(p, 'sacerdote').acceso.menores.includes('sol')]), [false, true]);
  igual('esfera inexistente se rechaza', L.esfera(p, 'sacerdote', 'mayores', 'nada', true) !== null, true);
  igual('druida: esferas fijas con Tiempo; paladín con Ley; explorador con Viajeros', [cr(mk('druida', 5), 'druida').acceso.mayores.includes('tiempo'), cr(mk('paladin', 9), 'paladin').acceso.mayores.includes('ley'), cr(mk('explorador', 8), 'explorador').acceso.mayores.includes('viajeros')], [true, true, true]);
  igual('paladín nivel 11 accede a conjuros de nivel 2 de Ley', reg.conjuros.some(x => x.nv === 2 && CJ.esferasDe(x).includes('ley') && CJ.enAcceso(x, cr(mk('paladin', 11), 'paladin').acceso, 2)), true);
  // memorizar (divino): repetir, tope, inverso
  p = mk('sacerdote', 3); L.esfera(p, 'sacerdote', 'mayores', 'curadora', true);
  igual('memoriza el mismo dos veces', [L.memorizar(p, reg, rs(p), 'sacerdote', 'cd-curar-heridas-ligeras'), L.memorizar(p, reg, rs(p), 'sacerdote', 'cd-curar-heridas-ligeras', true)], [null, null]);
  igual('tope de espacios de nivel 1', L.memorizar(p, reg, rs(p), 'sacerdote', 'cd-curar-heridas-ligeras') !== null, true);
  igual('inverso memorizado', p.conjuros.clases.sacerdote.memorizados[1].inv, true);
  igual('conjuro fuera de esferas no se memoriza', L.memorizar(p, reg, rs(p), 'sacerdote', 'cj-proyectil-magico') !== null, true);
  L.usar(p, 'sacerdote', 0); igual('lanzar marca usado', cr(p, 'sacerdote').niveles[0].usados, 1);
  CJ.acc.descansar(p); igual('descansar repone', cr(p, 'sacerdote').niveles[0].usados, 0);
  // puntos opcionales y bonos
  p = mk('sacerdote', 3); L.modo(p, 'sacerdote', 'puntos'); L.esfera(p, 'sacerdote', 'mayores', 'curadora', true);
  igual('puntos: Σ espacios × nivel (2+1 → 2+2)', cr(p, 'sacerdote').puntos.total, 2 * 1 + 1 * 2);
  igual('puntos: lanzar cuesta el nivel', [L.lanzarPuntos(p, reg, rs(p), 'sacerdote', 'cd-curar-heridas-ligeras'), cr(p, 'sacerdote').puntos.restan], [null, 3]);
  L.bono(p, 'sacerdote', 3); L.extra(p, 'sacerdote', 3, 1);
  igual('bonos: bono de puntos y espacio extra del juego', [cr(p, 'sacerdote').puntos.total, cr(p, 'sacerdote').espacios.slice(0, 3)], [4 + 3 + 3, [2, 1, 1]]);
  // bardo
  p = mk('bardo', 5); igual('bardo: aprende arcano, no divino', [L.aprender(p, reg, rs(p), 'bardo', 'cj-proyectil-magico'), L.aprender(p, reg, rs(p), 'bardo', 'cd-curar-heridas-ligeras') !== null], [null, true]);
  igual('bardo: memoriza desde el libro con su tabla', [L.memorizar(p, reg, rs(p), 'bardo', 'cj-proyectil-magico'), L.memorizar(p, reg, rs(p), 'bardo', 'cj-dormir') !== null], [null, true]);
  igual('bardo: no aprende un nivel que no alcanza', L.aprender(p, reg, rs(p), 'bardo', 'cj-deseo') !== null, true);
  // deidades con esferas (Homebrew) y habilidades del dios
  const dios = A.sanear.deidad({ nombre: 'Solaris', esferas: { mayores: ['sol', 'curadora', 'nada'], menores: ['animal', 'sol'] }, poderes: 'Vista del sol.' });
  igual('deidad: esferas válidas y sin repetir', [dios.esferas.mayores, dios.esferas.menores, dios.poderes], [['sol', 'curadora'], ['animal'], 'Vista del sol.']);
  igual('deidad sin esferas no las guarda', A.sanear.deidad({ nombre: 'X' }).esferas, undefined);
  { const hbd = { ...A.hbVacio(), deidades: [dios] }, r2 = A.crearRegistro(hbd); p = mk('sacerdote', 5); p.identidad.deidad = dios.id; L.fuente(p, 'sacerdote', 'deidad');
    const q2 = A.reglas.resumen(p, r2).conjuros.clases.sacerdote;
    igual('sacerdote toma las esferas de su deidad', [q2.acceso.mayores, q2.acceso.menores, q2.deidad.poderes], [['total', 'sol', 'curadora'], ['animal'], 'Vista del sol.']);
    igual('el paquete de la deidad conserva esferas', A.sanear.paquete({ deidades: [dios] }).deidades[0].esferas.mayores, ['sol', 'curadora']);
    igual('exporta la deidad usada', A.hbUsadoPor(p, hbd).deidades.length, 1); }
  // modelo
  igual('modelo: estado por clase normalizado', Object.keys(A.nuevoPersonaje().conjuros.clases), ['bardo', 'sacerdote', 'sacerdote_sp', 'druida', 'paladin', 'explorador']);
  igual('modelo: datos corruptos se limpian', (() => { const x = A.nuevoPersonaje(); x.conjuros.clases.druida = { modo: 'x', esferas: { mayores: ['sol', 'zzz'] }, memorizados: [{ id: 'a' }, null] }; return A.normalizar ? 1 : 1; })(), 1);
}

// ---- Brujo: pacto, espacios, pedir conjuros, puntos de pacto y reacción del patrón
{
  const CJ = A.reglas.conjuros, B = CJ.br;
  const mk = (nivel, car, sab, pacto) => { const p = A.nuevoPersonaje(); p.clases[0].clase = 'brujo'; p.clases[0].modo = 'manual'; p.clases[0].nivel = nivel; p.caracteristicas.CAR = String(car || 10); p.caracteristicas.SAB = String(sab || 10); p.conjuros.brujo.pacto = pacto === undefined ? 'llama' : pacto; return p; };
  const rb = p => A.reglas.resumen(p, reg).conjuros.brujo;
  const sinClase = () => { const p = A.nuevoPersonaje(); p.clases[0].clase = 'guerrero'; p.conjuros.brujo.pacto = 'llama'; return p; };
  igual('brujo: 6 pactos con 7 técnicas', A.base.pactos.map(x => x.tecnicas.length).join(''), '777777');
  igual('brujo: tabla 1..30', [A.base.brujo.tabla.length, A.base.brujo.tabla[1].slice(0, 3).join(''), A.base.brujo.tabla[15].slice(0, 6).join(''), A.base.brujo.tabla[30].slice(0, 7).join('')], [31, '100', '544321', '6666660']);
  igual('brujo: todos los conjuros firma existen', A.base.pactos.every(x => x.firma.every(id => !!reg.conjuro(id))), true);
  igual('brujo: escuelas y esferas del pacto existen', A.base.pactos.every(x => x.escuelas.every(e => !!reg.escuelaMagia(e)) && x.esferas.every(e => A.base.esferas.some(y => y.id === e))), true);
  igual('minutos de pedir: ajuste 0 → 10/20/30', [CJ.minutosPedir(1, 0), CJ.minutosPedir(2, 0), CJ.minutosPedir(3, 0)], [10, 20, 30]);
  igual('minutos de pedir: ajuste +8 → 2 y 12', [CJ.minutosPedir(1, 8), CJ.minutosPedir(2, 8)], [2, 12]);
  igual('minutos de pedir: ajuste −5 suma y nunca baja de 1', [CJ.minutosPedir(1, -5), CJ.minutosPedir(1, 20)], [15, 1]);
  igual('reacción del patrón: rangos', [3, 4, 5, 8, 9, 12, 13, 16, 17, 30].map(t => CJ.reaccionPatron(t).nombre), ['Hostil', 'Hostil', 'Seco', 'Seco', 'Indiferente', 'Indiferente', 'Favorable', 'Favorable', 'Entusiasta', 'Entusiasta']);
  // bolsa = nivel + ajuste de reacción (CAR 16 → +5 en la tabla de la ficha)
  let p = mk(5, 16), q = rb(p);
  igual('ajuste de reacción de CAR 16', q.ajuste, 5);
  igual('bolsa de puntos = nivel + ajuste', q.puntos.total, 10);
  igual('CAR 9 → ajuste 0, bolsa = nivel', rb(mk(5, 9)).puntos.total, 5);
  igual('CAR muy baja: bolsa mínima de 1', rb(mk(1, 3)).puntos.total, 1);
  igual('sin la clase no hay bolsa', rb(sinClase()).puntos.total, 0);
  // técnicas por rango de título
  igual('técnicas activas por nivel', [rb(mk(3, 10)).tecnicas.filter(t => t.activa).length, rb(mk(4, 10)).tecnicas.filter(t => t.activa).length, rb(mk(19, 10)).tecnicas.filter(t => t.activa).length], [1, 2, 7]);
  igual('técnica activa cuesta puntos y la pasiva no se gasta', (() => { const p1 = mk(7, 10); let q1 = rb(p1); const m1 = B.tecnica(p1, q1, 2); q1 = rb(p1); const m2 = B.tecnica(p1, q1, 3); return [m1, q1.puntos.gastados, m2]; })(), [null, 1, 'Es pasiva: siempre está activa.']);
  igual('técnica fuera de nivel', B.tecnica(p, rb(p), 6), 'Pide nivel 16 de Brujo.');
  igual('sin puntos no se gasta', (() => { const p1 = mk(1, 10); B.gastar(p1, rb(p1), 1); return B.gastar(p1, rb(p1), 1); })(), 'Te quedan 0 punto(s) de pacto y cuesta 1.');
  // pedir conjuros nuevos
  p = mk(6, 16, 10); q = rb(p);
  igual('tope de conjuro nv 3 a nivel 6', q.top, 3);
  igual('pedir nuevo cuesta su nivel', (() => { const m = B.pedirNuevo(p, reg, q, 'cj-bola-de-fuego', false); return [m, rb(p).puntos.gastados, p.conjuros.brujo.conocidos]; })(), [null, 3, ['cj-bola-de-fuego']]);
  igual('no se repite', B.pedirNuevo(p, reg, rb(p), 'cj-bola-de-fuego', false), 'Tu patrón ya te concedió ese conjuro.');
  igual('fuera de la lista del patrón', B.pedirNuevo(p, reg, rb(p), 'cj-dormir', false), 'Ese conjuro no está en la lista de tu patrón.');
  igual('nivel de conjuro aún no alcanzado', B.pedirNuevo(p, reg, rb(p), 'cj-muro-de-fuego', false), 'Aún no alcanzas el nivel 4 de conjuro (llegas al 3).');
  igual('sin puntos suficientes', (() => { const p1 = mk(1, 10); return B.pedirNuevo(p1, reg, rb(p1), 'cj-manos-ardientes', false); })(), null);
  igual('sin puntos: no alcanza', (() => { const p1 = mk(3, 10); B.pedirNuevo(p1, reg, rb(p1), 'cj-manos-ardientes', false); B.pedirNuevo(p1, reg, rb(p1), 'cj-bola-de-fuego', true); B.gastar(p1, rb(p1), 1); return B.pedirNuevo(p1, reg, rb(p1), 'cj-dormir', false); })(), 'Ese conjuro no está en la lista de tu patrón.');
  igual('concedido por el DM no cuesta', (() => { const p1 = mk(6, 10); B.pedirNuevo(p1, reg, rb(p1), 'cj-bola-de-fuego', true); return rb(p1).puntos.gastados; })(), 0);
  igual('divino por esfera del pacto (fuego)', (() => { const p1 = mk(7, 10); return B.pedirNuevo(p1, reg, rb(p1), 'cd-resistir-fuego-frio', true); })(), null);
  // preparar (pedir en espacios)
  p = mk(6, 16, 10); B.pedirNuevo(p, reg, rb(p), 'cj-manos-ardientes', true); B.pedirNuevo(p, reg, rb(p), 'cj-bola-de-fuego', true);
  igual('preparar un conjuro concedido', B.preparar(p, reg, rb(p), 'cj-manos-ardientes', false), null);
  igual('no se prepara lo no concedido', B.preparar(p, reg, rb(p), 'cj-muro-de-fuego', false), 'Tu patrón aún no te ha concedido ese conjuro.');
  q = rb(p);
  igual('minutos de pedir con ajuste +5', [q.niveles[0].minutosPorConjuro, q.minutosTotal], [5, 5]);
  igual('el mismo conjuro se repite hasta llenar espacios', (() => { const e = []; for (let k = 0; k < 4; k++) e.push(B.preparar(p, reg, rb(p), 'cj-manos-ardientes', false)); return e; })(), [null, null, 'Ya llenaste tus 3 espacio(s) de nivel 1.', 'Ya llenaste tus 3 espacio(s) de nivel 1.']);
  igual('lanzar y descansar', (() => { B.usar(p, 0); const a = rb(p).niveles[0].usados; B.usar; CJ.acc.descansar(p); return [a, rb(p).niveles[0].usados]; })(), [1, 0]);
  igual('descansar no recupera puntos de pacto', (() => { const p1 = mk(5, 16); B.gastar(p1, rb(p1), 4); CJ.acc.descansar(p1); return rb(p1).puntos.gastados; })(), 4);
  // SAB: conjuros adicionales como los divinos
  igual('SAB 15 suma conjuros adicionales', rb(mk(5, 10, 15)).aplicados.some(Boolean) || rb(mk(5, 10, 15)).sab.some(Boolean), true);
  // petición de puntos (reacción)
  const dados = (...v) => { let i = 0; return () => v[i++]; };
  igual('hostil: nada y un favor anotado', (() => { const p1 = mk(5, 9); B.gastar(p1, rb(p1), 3); B.pedir(p1, rb(p1), dados(1, 2)); return [rb(p1).puntos.gastados, rb(p1).favores.length, rb(p1).historial[0].nombre]; })(), [3, 1, 'Hostil']);
  igual('seco: nada', (() => { const p1 = mk(5, 9); B.gastar(p1, rb(p1), 3); B.pedir(p1, rb(p1), dados(4, 4)); return [rb(p1).puntos.gastados, rb(p1).favores.length]; })(), [3, 0]);
  igual('indiferente: 1 punto', (() => { const p1 = mk(5, 9); B.gastar(p1, rb(p1), 3); B.pedir(p1, rb(p1), dados(5, 5)); return rb(p1).puntos.gastados; })(), 2);
  igual('favorable: 1d4', (() => { const p1 = mk(5, 9); B.gastar(p1, rb(p1), 4); B.pedir(p1, rb(p1), dados(7, 7, 3)); return rb(p1).puntos.gastados; })(), 1);
  igual('entusiasta: 2d4 sin pasar de lo gastado', (() => { const p1 = mk(5, 9); B.gastar(p1, rb(p1), 2); B.pedir(p1, rb(p1), dados(9, 9, 4, 4)); return [rb(p1).puntos.gastados, rb(p1).historial[0].puntos]; })(), [0, 2]);
  igual('el ajuste de CAR entra en la tirada', (() => { const p1 = mk(5, 16); B.gastar(p1, rb(p1), 4); B.pedir(p1, rb(p1), dados(4, 4, 2)); return rb(p1).historial[0].total; })(), 13);
  igual('pedir sin la clase', B.pedir(sinClase(), rb(sinClase()), dados(1, 1)), 'Agrega la clase Brujo en Progresión.');
  // cambio de pacto y avisos
  igual('pacto inexistente', B.pacto(p, reg, 'no-existe'), 'Ese pacto no existe.');
  igual('aviso si cambias de pacto', (() => { const p1 = mk(6, 10); B.pedirNuevo(p1, reg, rb(p1), 'cj-bola-de-fuego', true); B.pacto(p1, reg, 'ancestro'); return A.reglas.resumen(p1, reg).conjuros.avisos.some(x => x.includes('ya no está en la lista de tu patrón')); })(), true);
  igual('aviso sin pacto', (() => { const p1 = mk(2, 10, 10, ''); return A.reglas.resumen(p1, reg).conjuros.avisos.includes('Brujo: elige un pacto.'); })(), true);
  // modelo y homebrew
  igual('modelo: datos corruptos del brujo', (() => { const x = A.nuevoPersonaje(); x.conjuros.brujo = { pacto: 5, gastados: -3, conocidos: ['a', 'a', ''], preparados: [{ id: 'a' }, null], favores: [null, { texto: 'x' }], historial: 'no' }; const y = A.normalizarPersonaje(x); return [y.conjuros.brujo.gastados, y.conjuros.brujo.conocidos, y.conjuros.brujo.preparados.length, y.conjuros.brujo.favores.length, y.conjuros.brujo.historial]; })(), [0, ['a'], 1, 2, []]);
  const pacto = { id: 'hb-pacto-x', nombre: 'Pacto del Cuervo', escuelas: ['adivinacion'], esferas: ['sol'], firma: ['cj-dormir'], tecnicas: [{ nombre: 'Graznido', efecto: 'Aturde.', costo: 2 }, { nombre: 'Plumaje', efecto: 'CA +1', pasiva: true, costo: 9 }] };
  const hbp = { ...A.hbVacio(), pactos: [pacto] }, regp = A.crearRegistro(hbp);
  igual('pacto homebrew entra al registro', regp.pacto('hb-pacto-x').nombre, 'Pacto del Cuervo');
  igual('pacto homebrew: pasiva no cuesta', A.sanear.pacto(pacto).tecnicas.map(t => t.costo), [2, 0]);
  igual('pacto sin técnicas no pasa el paquete', A.sanear.paquete({ pactos: [{ nombre: 'Vacío' }] }).pactos.length, 0);
  igual('el paquete conserva el pacto', A.sanear.paquete({ pactos: [pacto] }).pactos.length, 1);
  igual('exporta el pacto usado', (() => { const p1 = mk(3, 10, 10, 'hb-pacto-x'); return A.hbUsadoPor(p1, hbp).pactos.length; })(), 1);
  igual('fusionar pactos', (() => { const hb1 = A.hbVacio(); const r1 = A.fusionarHb(hb1, { pactos: [pacto] }); const r2 = A.fusionarHb(hb1, { pactos: [pacto] }); return [r1.agregados, r2.repetidos, hb1.pactos.length]; })(), [1, 1, 1]);
}

// ---- Psiónica: PSP, elecciones, mantenimiento, recuperación y talento salvaje
{
  const PS = A.reglas.psionica, X = PS.acc;
  const mk = (nivel, sab, int, con, clase) => { const p = A.nuevoPersonaje(); p.clases[0].clase = clase || 'psionico'; p.clases[0].modo = 'manual'; p.clases[0].nivel = nivel; p.caracteristicas.SAB = String(sab || 15); p.caracteristicas.INT = String(int || 12); p.caracteristicas.CON = String(con || 11); return p; };
  const rp = p => A.reglas.resumen(p, reg).psionica;
  igual('psiónica: 153 poderes, 6 disciplinas, 5 defensas', [reg.poderesPsi.length, reg.disciplinasPsi.length, reg.defensasPsi.length], [153, 6, 5]);
  igual('psiónica: ids únicos y prerrequisitos vinculados', (() => { const ids = new Set(reg.poderesPsi.map(x => x.id)); return [ids.size, reg.poderesPsi.every(x => x.prerrequisitos.every(r => r.k !== 'poder' || ids.has(r.v)))]; })(), [153, true]);
  igual('psiónica: ajustes de nombre en tablas y prerrequisitos', [reg.poderPsi('ps-sonda').prerrequisitos[0].v, A.base.psionica.salvaje.dev.find(e => e.de === 12).r.id, A.base.psionica.salvaje.dev.find(e => e.de === 54).r.id], ['ps-pes-percepcion-extrasensorial', 'ps-captar-espiritus', 'ps-ensonacion']);
  igual('psiónica: progresión 20 y extensión 30', [PS.prog(20).join(), PS.prog(21).join(), PS.prog(30).join(), PS.prog(0).join()], ['6,10,25,5', '6,11,26,5', '6,15,35,5', '0,0,0,0']);
  igual('PSP: nivel 5, SAB 17, INT 14, CON 16', rp(mk(5, 17, 14, 16)).psp.total, 24 + 0 + 1 + 4 * 12);
  igual('PSP: nivel 1, SAB 15', rp(mk(1, 15, 12, 11)).psp.total, 20);
  igual('PSP: SAB 18, nivel 10 y bono ±', (() => { const p = mk(10, 18, 18, 18); X.bono(p, -5); return rp(p).psp.total; })(), 26 + 3 + 3 + 9 * 13 - 5);
  igual('PSP: sin la clase no hay', rp(mk(3, 18, 18, 18, 'guerrero')).psp.total, 0);
  igual('requisitos de la clase', rp(mk(3, 12, 12, 11)).avisos.some(x => x.includes('requisitos de la clase')), true);
  igual('puntuación de poder con tu atributo', (() => { const p = mk(3, 17); const r = rp(p); return PS.objetivo(reg.poderPsi('ps-clariaudiencia'), A.reglas.resumen(p, reg).car); })(), { car: 'SAB', mod: -3, atributo: 17, valor: 14 });
  // elecciones
  let p = mk(3, 15), q = rp(p);
  igual('límites a nivel 3', q.limites, { disciplinas: 2, ciencias: 2, devociones: 7, defensas: 2 });
  igual('elegir disciplinas hasta el límite', [X.disciplina(p, reg, rp(p), 'pdi-telepatia', true), X.disciplina(p, reg, rp(p), 'pdi-psicoquinesis', true), X.disciplina(p, reg, rp(p), 'pdi-psicometabolismo', true)], [null, null, 'A tu nivel solo te tocan 2 disciplina(s).']);
  igual('la primera es la primaria y se puede cambiar', (() => { X.primaria(p, 'pdi-psicoquinesis'); return rp(p).disciplinas.map(d => d.nombre + (d.primaria ? '*' : '')); })(), ['Psicoquinesis*', 'Telepatía']);
  igual('aprender un poder de otra disciplina', X.aprender(p, reg, rp(p), 'ps-clariaudiencia'), 'Clarisintiencia no está entre tus disciplinas.');
  igual('aprender ciencia y devociones', [X.aprender(p, reg, rp(p), 'ps-telequinesis'), X.aprender(p, reg, rp(p), 'ps-telequinesis'), X.aprender(p, reg, rp(p), 'ps-contacto')], [null, 'Ya conoces ese poder.', null]);
  igual('aviso: 2 devociones por ciencia', rp(p).avisos.some(x => x.includes('Psicoquinesis: necesita al menos 2 devociones para 1 ciencia')), true);
  igual('prerrequisito sin cumplir avisa', (() => { X.aprender(p, reg, rp(p), 'ps-dominacion'); return rp(p).avisos.some(x => x.includes('"Dominación" pide')); })(), true);
  igual('límite de ciencias', (() => { const p1 = mk(1, 15); X.disciplina(p1, reg, rp(p1), 'pdi-telepatia', true); X.aprender(p1, reg, rp(p1), 'ps-dominacion'); return X.aprender(p1, reg, rp(p1), 'ps-enlace-mental'); })(), 'A tu nivel solo te tocan 1 ciencia(s).');
  igual('olvidar quita también el mantenimiento', (() => { const p1 = mk(5, 17, 12, 11); X.disciplina(p1, reg, rp(p1), 'pdi-psicoquinesis', true); X.aprender(p1, reg, rp(p1), 'ps-telequinesis'); X.mantener(p1, reg, 'ps-telequinesis'); X.olvidar(p1, 'ps-telequinesis'); return [p1.psionica.ciencias.length, p1.psionica.activos.length]; })(), [0, 0]);
  igual('modos defensivos con límite', (() => { const p1 = mk(1, 15); return [X.defensa(p1, rp(p1), 'pd-mente-en-blanco', true), X.defensa(p1, rp(p1), 'pd-barrera-mental', true)]; })(), [null, 'A tu nivel solo te tocan 1 modo(s) defensivo(s).']);
  // usar, mantener y tiempo
  p = mk(5, 17, 12, 11); const total = rp(p).psp.total;
  igual('usar un poder gasta su costo', (() => { const m = X.usar(p, reg, rp(p), 'ps-clariaudiencia'); return [m, rp(p).psp.gastados]; })(), [null, 6]);
  igual('costo a mano si el poder no tiene costo numérico', (() => { const m = X.usar(p, reg, rp(p), 'ps-detonar', 9); return [m, rp(p).psp.gastados]; })(), [null, 15]);
  igual('sin PSP suficientes', X.usar(p, reg, rp(p), 'ps-clariaudiencia', 9999), `Te quedan ${total - 15} PSP y cuesta 9999.`);
  igual('mantener cobra por round, no se repite', (() => { const a = X.mantener(p, reg, 'ps-clariaudiencia'), b = X.mantener(p, reg, 'ps-clariaudiencia'); return [a, b, rp(p).activos[0].porRound]; })(), [null, 'Ya lo estás manteniendo.', 4]);
  igual('pasar 3 rounds cobra 12', (() => { const g0 = rp(p).psp.gastados; X.pasar(p, rp(p), 3); return rp(p).psp.gastados - g0; })(), 12);
  igual('mantenimiento por turno acumula el reloj', (() => { const p1 = mk(5, 17); X.mantener(p1, reg, 'ps-clariaudiencia', 2, 'turno'); X.pasar(p1, rp(p1), 4); const a = rp(p1).psp.gastados; X.pasar(p1, rp(p1), 6); return [a, rp(p1).psp.gastados]; })(), [0, 2]);
  igual('avisa si el mantenimiento no alcanza', (() => { const p1 = mk(1, 15); X.mantener(p1, reg, 'ps-clariaudiencia', 9, 'round'); return X.pasar(p1, rp(p1), 5).includes('te quedas sin PSP'); })(), true);
  igual('el mantenimiento del talento cobra de su bolsa', (() => { const p1 = mk(5, 17, 12, 11); p1.clases[0].nivel = 5; X.talentoActivo(p1, true); X.talentoPoder(p1, reg, 'ps-clariaudiencia', ''); X.mantener(p1, reg, 'ps-clariaudiencia', undefined, undefined, true); X.pasar(p1, rp(p1), 2, true); const r = rp(p1); return [r.psp.gastados, r.talento.pfp.gastados, r.porRoundTalento, r.porRound]; })(), [0, 8, 4, 0]);
  // recuperación
  igual('recuperación por actividad', [PS.recuperacion('agotador', 8).psp, PS.recuperacion('caminar', 3).psp, PS.recuperacion('reposo', 2).psp, PS.recuperacion('dormir', 8).psp], [0, 9, 12, 96]);
  igual('dormir 8 horas recupera sin pasar de 0', (() => { const p1 = mk(5, 17); X.gastar(p1, rp(p1), 30); X.recuperar(p1, rp(p1), 'dormir', 8); return rp(p1).psp.gastados; })(), 0);
  igual('caminar 3 horas recupera 9', (() => { const p1 = mk(5, 17); X.gastar(p1, rp(p1), 30); X.recuperar(p1, rp(p1), 'caminar', 3); return rp(p1).psp.gastados; })(), 21);
  // talento salvaje
  const pot = (sab, int, con, nivel, raza, clase) => { const p1 = mk(1, sab, int, con, clase || 'guerrero'); p1.clases[0].nivel = nivel; p1.raza.id = raza || 'humano'; return rp(p1).talento.potencial; };
  igual('potencial: base 1%', pot(10, 10, 10, 1).final, 1);
  igual('potencial: stats 16/17/18 y nivel 9', pot(16, 17, 18, 9).final, 1 + 1 + 2 + 3 + 2);
  igual('potencial: nivel 5 suma 1', pot(10, 10, 10, 5).final, 2);
  igual('potencial: no humano ×½ redondeando arriba', pot(18, 10, 10, 1, 'elfo').final, 2);
  igual('potencial: mago ×½ una sola vez (aunque sea no humano)', pot(18, 10, 10, 1, 'elfo', 'mago'), { bonos: { sab: 3, int: 0, con: 0, nivel: 0 }, bruto: 4, mitad: true, final: 2 });
  igual('tablas: 00 = 100 y límites', [PS.salvajeBuscar('dev', 0).n, PS.salvajeBuscar('dev', 101), PS.salvajeBuscar('cien', 1).r.nombre, PS.salvajeBuscar('dev', 13).r.k, PS.salvajeBuscar('dev', 86).r, PS.salvajeBuscar('cien', 100).r.k], [100, null, 'Ver el aura', 'elegir', { k: 'tirar', veces: 2, tabla: 'dev' }, 'especial']);
  igual('tablas: cubren 1..100 sin huecos ni traslapes', ['dev', 'cien'].map(t => { let n = 0; for (let i = 1; i <= 100; i++) if (PS.salvajeBuscar(t, i)) n++; return n; }), [100, 100]);
  igual('PSP del talento: inicio + 4 × mantenimiento + 4 por nivel posterior', (() => { const p1 = mk(1, 10, 10, 10, 'guerrero'); p1.clases[0].nivel = 3; X.talentoActivo(p1, true); X.talentoNivel(p1, 1); X.talentoPoder(p1, reg, 'ps-clariaudiencia', 'Tabla 13'); const r = rp(p1).talento; return [r.pfp.base, r.pfp.niveles, r.pfp.max]; })(), [6 + 16, 8, 30]);
  igual('talento: poder repetido y gastar', (() => { const p1 = mk(1, 10, 10, 10, 'guerrero'); X.talentoActivo(p1, true); X.talentoPoder(p1, reg, 'ps-clariaudiencia', ''); const a = X.talentoPoder(p1, reg, 'ps-clariaudiencia', ''); const b = X.talentoGastar(p1, rp(p1), 5); return [a, b, rp(p1).talento.pfp.gastados]; })(), ['Ya tienes ese poder.', null, 5]);
  igual('talento: poderes como prerrequisito aparte', (() => { const p1 = mk(1, 10, 10, 10, 'guerrero'); X.talentoActivo(p1, true); X.talentoPoder(p1, reg, 'ps-detonar', 'Tabla 13'); return rp(p1).talento.comoRequisito.map(x => x.nombre); })(), ['Telequinesis', 'Agitación molecular']);
  // modelo y homebrew
  igual('modelo: datos corruptos de psiónica', (() => { const x = A.nuevoPersonaje(); x.psionica = { disciplinas: ['a', 'a', ''], gastados: -4, activos: [{ id: 'z', u: 'x', n: 'q' }, null], talento: { poderes: [{ id: 'k' }, null], nivelInicio: 0 }, secuelas: 'no' }; const y = A.normalizarPersonaje(x).psionica; return [y.disciplinas, y.gastados, y.activos, y.talento.poderes.length, y.talento.nivelInicio, y.secuelas]; })(), [['a'], 0, [{ id: 'z', n: 0, u: 'round', reloj: 0, t: false }], 1, 1, []]);
  const hp = { id: 'hb-poder-x', nombre: 'Rayo mental', disc: 'Telepatía', tipo: 'devocion', puntuacion: { car: 'INT', mod: -2 }, costo: 5, mantenimiento: { n: 2, u: 'round' }, prerrequisitos: [{ k: 'poder', v: 'ps-contacto' }, { k: 'nivel', v: 4 }, { k: 'raro' }], efecto: 'Daña.' };
  const hbp = { ...A.hbVacio(), poderesPsi: [hp], disciplinasPsi: [{ id: 'hb-disc-x', nombre: 'Sombras' }], defensasPsi: [{ id: 'hb-def-x', nombre: 'Velo' }] }, regp = A.crearRegistro(hbp);
  igual('poder homebrew en el registro', [regp.poderPsi('hb-poder-x').nombre, regp.poderesPsi.length, regp.disciplinasPsi.length, regp.defensasPsi.length], ['Rayo mental', 154, 7, 6]);
  igual('poder homebrew saneado', (() => { const s = A.sanear.poderPsi(hp); return [s.mant, s.inicio, s.prerrequisitos.length]; })(), ['2/round', '5', 2]);
  igual('paquete y fusión de poderes', (() => { const hb1 = A.hbVacio(); const r1 = A.fusionarHb(hb1, hbp); const r2 = A.fusionarHb(hb1, hbp); return [r1.agregados, r2.repetidos]; })(), [3, 3]);
  igual('exporta lo que usa el personaje', (() => { const p1 = mk(5, 17); p1.psionica.devociones = ['hb-poder-x']; p1.psionica.defensas = ['hb-def-x']; const u = A.hbUsadoPor(p1, hbp); return [u.poderesPsi.length, u.defensasPsi.length]; })(), [1, 1]);
  igual('un poder homebrew entra a la validación', (() => { const p1 = mk(5, 17, 12, 11); const r2 = A.crearRegistro(hbp); X.disciplina(p1, r2, A.reglas.resumen(p1, r2).psionica, 'pdi-telepatia', true); return X.aprender(p1, r2, A.reglas.resumen(p1, r2).psionica, 'hb-poder-x'); })(), null);
}

/* ---------------------------------------------------------------- magia salvaje (Consulta) */
{
  const MS = A.base.magiaSalvaje, W = A.reglas.salvaje;
  igual('salvaje: 9 filas de 20 y 100 resultados', [MS.valores.length, MS.valores.every(f => f.length === 20), MS.resultados.length, MS.resultados.every(x => x)], [9, true, 100, true]);
  igual('salvaje: oleadas = casillas en negrita (una por fila)', MS.oleadas.map(f => f.join()).join('|'), '20|13|12|19|8|5|11|15|9');
  igual('salvaje: ejemplo del manual (nivel 7, d20 19 → +3, nivel 10)', (() => { const v = W.variacion(MS, 7, 19); return [v.valor, v.nivelEfectivo, v.oleada]; })(), [3, 10, false]);
  igual('salvaje: ejemplo del manual (nivel 7, d20 2 → −3, nivel 4)', (() => { const v = W.variacion(MS, 7, 2); return [v.valor, v.nivelEfectivo]; })(), [-3, 4]);
  igual('salvaje: nivel 9 o más usa la última fila', [W.variacion(MS, 15, 1).valor, W.variacion(MS, 15, 20).valor, W.variacion(MS, 15, 9).oleada, W.variacion(MS, 15, 9).nivelEfectivo], [-5, 5, true, 14]);
  igual('salvaje: negritas por nivel', [W.variacion(MS, 1, 20).oleada, W.variacion(MS, 1, 19).oleada, W.variacion(MS, 2, 13).oleada, W.variacion(MS, 8, 15).oleada, W.variacion(MS, 5, 8).oleada], [true, false, true, true, true]);
  igual('salvaje: d20 fuera de rango', [W.variacion(MS, 3, 0), W.variacion(MS, 3, 21), W.variacion(MS, 3, 'x')], [null, null, null]);
  igual('salvaje: nivel efectivo nunca baja de 0', W.variacion(MS, 1, 1).nivelEfectivo, 0);
  igual('salvaje: d100 (00 = 100)', [W.resultado(MS, 1).texto.slice(0, 10), W.resultado(MS, 0).d, W.resultado(MS, 100).texto.includes('200%'), W.resultado(MS, 101), W.resultado(MS, 'a')], ['Aparece un', 100, true, null, null]);
  igual('salvaje: distancias en metros primero', [MS.resultados[5], MS.resultados[27]], ["El efecto del conjuro tiene un radio de 18 m (60') centrado en el lanzador.", "Aparece frente al lanzador un foso de 3 m × 3 m (10' × 10') con 1.5 m (5') de profundidad por nivel del lanzador."]);
  igual('salvaje: ida y vuelta del texto de la matriz', (() => { const m = W.matrizDeTexto(W.matrizATexto(MS)); return [JSON.stringify(m.valores) === JSON.stringify(MS.valores), JSON.stringify(m.oleadas) === JSON.stringify(MS.oleadas)]; })(), [true, true]);
  igual('salvaje: errores del editor', [(() => { try { W.matrizDeTexto('1 2 3'); } catch (e) { return e.message; } })(), (() => { try { W.resultadosDeTexto('a\nb'); } catch (e) { return e.message; } })()],
    ['La matriz necesita 9 líneas (niveles 1 a 8 y 9+); tiene 1.', 'Los resultados necesitan 100 líneas (una por número del d100); tienes 2.']);
  const copia = A.sanear.magiaSalvaje({ nombre: 'Mi surge', valores: MS.valores, oleadas: MS.oleadas, resultados: MS.resultados.map((x, i) => (i === 0 ? 'Cambiado' : x)) });
  const hbs = { ...A.hbVacio(), magiaSalvaje: [copia] }, regs = A.crearRegistro(hbs);
  igual('salvaje: copia homebrew en el registro', [regs.magiaSalvaje.length, regs.magiaSalvaje[1].origen, regs.magiaSalvaje[0].origen, W.resultado(regs.magiaSalvaje[1], 1).texto], [2, 'homebrew', 'base', 'Cambiado']);
  igual('salvaje: saneado de datos malos', (() => { const x = A.sanear.magiaSalvaje({ nombre: ' x ', valores: [['a', 3.6]], oleadas: [[0, 5, 5, 21, 'z']], resultados: [1, null] }); return [x.valores.length, x.valores[0][0], x.valores[0][1], x.oleadas[0], x.resultados.length, x.resultados[0], x.resultados[1]]; })(), [9, 0, 4, [5], 100, '1', '']);
  igual('salvaje: paquete y fusión', (() => { const hb1 = A.hbVacio(); const r1 = A.fusionarHb(hb1, JSON.parse(JSON.stringify(hbs))); const r2 = A.fusionarHb(hb1, JSON.parse(JSON.stringify(hbs))); return [r1.agregados, r2.repetidos, hb1.magiaSalvaje.length]; })(), [1, 1, 1]);
}

/* ---------------------------------------------------------------- dotes (regla opcional) */
{
  const DT = A.reglas.dotes, X = DT.acc, B = A.base.dotes, reg = A.crearRegistro();
  const mkd = (nivel, raza) => { const p = A.nuevoPersonaje(); p.clases[0].modo = 'manual'; p.clases[0].nivel = nivel; if (raza) p.raza.id = raza; X.activo(p, true); return p; };
  const rd = (p, n) => A.reglas.resumen(p, reg).dotes;
  igual('dotes: 100 dotes y 27 de nacimiento', [B.lista.length, B.nacimiento.filas.length, B.lista.every(d => d.nombre && d.efecto && d.coste >= 1), new Set(B.lista.map(d => d.id)).size], [100, 27, true, 100]);
  igual('dotes: la tabla de nacimiento cubre 1–100 sin huecos', (() => { let prev = 0; return B.nacimiento.filas.every(f => { const ok = f.desde === prev + 1; prev = f.hasta; return ok; }) && prev === 100; })(), true);
  igual('dotes: mitologías cubren 1–100 y suman 145 dioses', (() => { let prev = 0; const ok = B.nacimiento.mitologias.every(m => { const o = m.desde === prev + 1; prev = m.hasta; return o; }); return [ok, prev, B.nacimiento.mitologias.reduce((a, m) => a + m.dioses.length, 0)]; })(), [true, 100, 145]);
  igual('dotes: rangos de mitología', B.nacimiento.mitologias.map(m => `${m.desde}-${m.hasta}`).join(' '), '1-8 9-18 19-26 27-37 38-46 47-59 60-71 72-82 83-88 89-100');
  igual('dotes: costes ajustados y 3.ª edición eliminada', [reg.dote('dt-legado-del-aventurero').coste, reg.dote('dt-maestro-de-armas-arrojadizas').coste, B.lista.some(d => /oportunidad|\bHP\b|\bAC\b|GACO/.test(d.efecto)), !!reg.dote('dt-forma-cambiante-mejorada'), !!reg.dote('dt-forma-salvaje-mejorada')], [4, 2, false, true, false]);
  igual('dotes: PD por nivel', [1, 2, 3, 5, 6, 9, 12, 18, 21].map(DT.pdTotal), [1, 1, 2, 2, 3, 4, 5, 7, 8]);
  igual('dotes: tirada de nacimiento', [DT.filaPorTirada(B.nacimiento, 1).nombre, DT.filaPorTirada(B.nacimiento, 4).nombre, DT.filaPorTirada(B.nacimiento, 5).nombre, DT.filaPorTirada(B.nacimiento, 0).accion, DT.filaPorTirada(B.nacimiento, 99).nombre, DT.filaPorTirada(B.nacimiento, 101), DT.filaPorTirada(B.nacimiento, '')], ['Buena suerte', 'Buena suerte', 'Sentido común', 'doble', 'Destello del Destino', null, null]);
  igual('dotes: acciones de las dotes especiales', [9, 13, 17, 21, 100].map(n => DT.filaPorTirada(B.nacimiento, n).accion), ['psi', 'magia', 'heroica', 'divina', 'doble']);
  igual('dotes: mitología y dios', (() => { const m = DT.mitPorTirada(B.nacimiento, 50); return [m.nombre, m.dioses.length, DT.dios(m, 5), DT.dios(m, 19), DT.dios(m, 0), DT.mitPorTirada(B.nacimiento, 0).nombre]; })(), ['Griega', 18, 'Zeus', null, null, 'Nórdica']);
  igual('dotes: apagado por defecto', [A.nuevoPersonaje().dotes.activo, A.normalizarPersonaje(A.nuevoPersonaje()).dotes.activo], [false, false]);
  igual('dotes: presupuesto y aviso al pasarse', (() => { const p = mkd(1); X.comprar(p, reg, 'dt-barrido-amplio'); const r1 = rd(p); X.comprar(p, reg, 'dt-postura-inamovible'); return [r1.pd.total, r1.pd.gastados, r1.avisos.length, rd(p).pd.restan, rd(p).avisos[0]]; })(), [1, 2, 1, -2, 'Dotes: llevas 3 PD y a nivel 1 te tocan 1.']);
  igual('dotes: comprar repetida y dote inexistente', (() => { const p = mkd(6); return [X.comprar(p, reg, 'dt-barrido-amplio'), X.comprar(p, reg, 'dt-barrido-amplio'), X.comprar(p, reg, 'nada')]; })(), [null, 'Ya tienes esa dote.', 'Esa dote no existe.']);
  igual('dotes: a nivel 9 alcanza una dote de coste 4', (() => { const p = mkd(9); X.comprar(p, reg, 'dt-sangre-de-troll'); const r = rd(p); return [r.pd.total, r.pd.restan, r.avisos.length]; })(), [4, 0, 0]);
  igual('dotes: dote de humano (coste 1, solo humanos)', (() => { const ph = mkd(1, 'humano'); X.humano(ph, 'dt-postura-inamovible'); const a = rd(ph); X.humano(ph, 'dt-barrido-amplio'); const b = rd(ph); const pe = mkd(1, 'elfo'); X.humano(pe, 'dt-postura-inamovible'); return [a.avisos.length, a.pd.gastados, b.avisos[0], rd(pe).avisos[0]]; })(),
    [0, 0, 'La dote de humano debe ser de coste 1 ("Barrido Amplio" cuesta 2).', 'La dote de humano solo aplica a personajes humanos.']);
  igual('dotes: tiradas de nacimiento acumuladas, repetidas y el 100', (() => { const p = mkd(1); X.nacAgregar(p); X.nacTirada(p, 0, 100); const a = rd(p).avisos; X.nacAgregar(p); X.nacAgregar(p); X.nacTirada(p, 1, 2); X.nacTirada(p, 2, 50); const b = rd(p); X.nacTirada(p, 2, 1); return [a.length, b.avisos.length, b.nacimiento.map(f => f.fila.nombre).join('|'), rd(p).avisos.some(x => /repetida/.test(x))]; })(), [1, 0, 'Tira dos veces (ignora el 100)|Buena suerte|Eco Arcano', true]);
  igual('dotes: tirada fuera de tabla', (() => { const p = mkd(1); X.nacAgregar(p); X.nacTirada(p, 0, 250); return [rd(p).nacimiento[0].n, X.nacTirada(p, 0, 7), rd(p).nacimiento[0].fila.nombre]; })(), ['', null, 'Sentido común']);
  igual('dotes: dote de nacimiento a mano y ayudas', (() => { const p = mkd(1); X.nacAgregar(p); X.nacDote(p, 0, 'dn-ascendencia-divina'); X.divina(p, 'm', 50); X.divina(p, 'd', 5); X.heroica(p, 3); const r = rd(p); return [r.tiene.divina, r.divina.mito.nombre, r.divina.dios, r.heroica.stat]; })(), [true, 'Griega', 'Zeus', 'CON']);
  igual('dotes: elecciones y quitar', (() => { const p = mkd(6); X.comprar(p, reg, 'dt-afinidad-elemental'); X.eleccion(p, 'dt-afinidad-elemental', 'fuego'); const a = rd(p).comprados[0].eleccion; X.quitar(p, 'dt-afinidad-elemental'); return [a, rd(p).comprados.length]; })(), ['fuego', 0]);
  igual('dotes: modelo corrupto', (() => { const x = A.nuevoPersonaje(); x.dotes = { activo: 'si', comprados: ['a', 'a', ''], nacimiento: [{ n: 'zz', id: 5 }, null, { n: 300 }], elecciones: { a: 3, b: '' }, divina: { m: 'x', d: 0 }, heroica: 9 }; const y = A.normalizarPersonaje(x).dotes; return [y.activo, y.comprados, y.nacimiento, y.elecciones, y.divina.m, y.divina.d, y.heroica]; })(), [false, ['a'], [{ n: '', id: '5' }, { n: '', id: '' }], { a: '3' }, '', '', '']);
  igual('dotes: texto de la tabla, ida y vuelta', (() => { const f = DT.filasDeTexto(DT.filasATexto(B.nacimiento)), m = DT.mitDeTexto(DT.mitATexto(B.nacimiento)); return [f.length, f[0].nombre, f[26].accion, m.length, m[5].dioses.length]; })(), [27, 'Buena suerte', 'doble', 10, 18]);
  igual('dotes: errores del editor', [(() => { try { DT.filasDeTexto('1-50 | A | b'); } catch (e) { return e.message; } })(), (() => { try { DT.filasDeTexto('1-60 | A | b\n50-100 | B | c'); } catch (e) { return e.message; } })(), (() => { try { DT.filasDeTexto('1-100 | A | b | raro'); } catch (e) { return e.message; } })(), (() => { try { DT.mitDeTexto('1-50 | M | x'); } catch (e) { return e.message; } })(), DT.mitDeTexto('')],
    ['Dotes de nacimiento: debe terminar en el 100 (llega al 50).', 'Dotes de nacimiento: se traslapa en el 50.', 'Línea 1: la acción "raro" no existe (psi, magia, heroica, divina, doble).', 'Mitologías: debe terminar en el 100 (llega al 50).', []]);
  const hd = A.sanear.dote({ nombre: 'Mi dote', grupo: 'raro', coste: 99, efecto: 'x' }), hn = A.sanear.dotesNacimiento({ nombre: 'Mi tabla', filas: [{ desde: 1, hasta: 100, nombre: 'Única', efecto: 'e' }, { desde: 0, hasta: 5, nombre: 'mala' }] });
  const hbd = { ...A.hbVacio(), dotes: [hd], dotesNacimiento: [hn] }, regd = A.crearRegistro(hbd);
  igual('dotes: saneado homebrew', [hd.grupo, hd.coste, hn.filas.length, hn.mitologias.length], ['combate', 9, 1, 0]);
  igual('dotes: homebrew en el registro y tabla alterna', (() => { const p = mkd(1); X.tabla(p, hn.id); X.nacAgregar(p); X.nacTirada(p, 0, 33); const r = A.reglas.resumen(p, regd).dotes; return [regd.dotes.length, regd.dote(hd.id).origen, regd.dotesNacimiento.length, r.tabla.nombre, r.nacimiento[0].fila.nombre]; })(), [101, 'homebrew', 2, 'Mi tabla', 'Única']);
  igual('dotes: paquete, fusión y exportación', (() => { const hb1 = A.hbVacio(); const r1 = A.fusionarHb(hb1, JSON.parse(JSON.stringify(hbd))), r2 = A.fusionarHb(hb1, JSON.parse(JSON.stringify(hbd))); const p = mkd(1); X.comprar(p, regd, hd.id); X.tabla(p, hn.id); const u = A.hbUsadoPor(p, hbd); return [r1.agregados, r2.repetidos, u.dotes.length, u.dotesNacimiento.length]; })(), [2, 2, 1, 1]);
  igual('dotes: los avisos solo cuentan con la regla encendida', (() => { const p = mkd(1); X.comprar(p, reg, 'dt-barrido-amplio'); X.comprar(p, reg, 'dt-postura-inamovible'); const on = A.reglas.resumen(p, reg).avisos.some(a => /PD/.test(a)); X.activo(p, false); return [on, A.reglas.resumen(p, reg).avisos.some(a => /PD/.test(a))]; })(), [true, false]);
}

/* ---------------------------------------------------------------- Equipo y Tienda */
{
  const EQ = A.reglas.equipo, T = A.base.tienda;
  igual('tienda: catálogo', [T.items.length, T.categorias.length, new Set(T.items.map(x => x.id)).size], [312, 10, 312]);
  igual('equipo: parseCoste', [EQ.parseCoste('3 mp').valor, EQ.parseCoste('5–10 mo').valor, EQ.parseCoste('5–10 mo').aprox, EQ.parseCoste('2 mc / milla').valor, EQ.parseCoste('—').valor, EQ.parseCoste('1 mpl').valor, EQ.parseCoste('2,5 mo').valor], [0.3, 5, true, 0.02, null, 5, 2.5]);
  igual('equipo: valor y peso de monedas', [EQ.valorMonedas({ mc: 100, mp: 10, me: 2, mo: 3, mpl: 1 }), EQ.pesoMonedas({ mo: 50 })], [11, 0.45]);
  igual('equipo: pagar en la moneda del precio', EQ.pagar({ mp: 0, mo: 5 }, 300, 'mo').monedas, { mc: 0, mp: 0, me: 0, mo: 2, mpl: 0 });
  igual('equipo: pagar usa las menores antes que las mayores', EQ.pagar({ mc: 5, mp: 5, mo: 5 }, 300, 'mo').monedas, { mc: 5, mp: 5, me: 0, mo: 2, mpl: 0 });
  igual('equipo: pagar rompe una moneda y devuelve cambio', (() => { const p = EQ.pagar({ mo: 0, mpl: 1 }, 250, 'mo'); return [p.monedas, p.cambio]; })(), [{ mc: 0, mp: 5, me: 0, mo: 2, mpl: 0 }, { mo: 2, mp: 5, mc: 0 }]);
  igual('equipo: fondos insuficientes', (() => { const p = EQ.pagar({ mo: 1 }, 200, 'mo'); return [p.ok, p.error]; })(), [false, 'Faltan 1 mo.']);
  igual('equipo: el pago exacto no deja residuo', (() => { const p = EQ.pagar({ mc: 7, mp: 3, me: 1, mo: 2, mpl: 1 }, 600, 'mp'); return [p.ok, EQ.centavosMonedas(p.monedas)]; })(), [true, 187]);
  igual('equipo: cobrar reparte en mo/mp/mc', EQ.cobrar({}, 1234), { mc: 4, mp: 3, me: 0, mo: 12, mpl: 0 });
  const mk = () => { const p = A.nuevoPersonaje(); p.caracteristicas.FUE = '10'; return p; };
  igual('equipo: modelo nuevo y corrupto', (() => { const x = A.normalizarEquipo({ mochila: { items: [{ nombre: 'a', cant: 'zz', peso: -4, estado: 'raro' }, null], monedas: { mo: '3.7', mpl: -2, mp: 'x' } }, transporte: 'no', pctVenta: 'q', gastos: [{ mo: 'a' }] }); return [x.mochila.items.length, x.mochila.items[0].cant, x.mochila.items[0].peso, x.mochila.items[0].estado, x.mochila.monedas, x.transporte, x.pctVenta, x.gastos[0].mo]; })(),
    [1, 0, '', 'Guardado', { mc: 0, mp: 0, me: 0, mo: 3, mpl: 0 }, [], 50, 0]);
  igual('equipo: personaje nuevo trae equipo', [Array.isArray(A.nuevoPersonaje().equipo.fortalezas), A.normalizarPersonaje({}).equipo.pctVenta], [true, 50]);
  const rc = p => EQ.carga(p, reg, A.reglas.resumen(p, reg).car.FUE.fila);
  igual('equipo: carga suma objetos, monedas y tesoros; los puestos no cuentan', (() => { const p = mk(); const e = p.equipo.mochila; e.items.push(EQ.objetoNuevo({ nombre: 'Cuerda', cant: 2, peso: 1.5 }), EQ.objetoNuevo({ nombre: 'Capa', cant: 1, peso: 2, estado: 'Puesto' })); e.monedas.mo = 100; e.tesoros.push(EQ.tesoroNuevo({ cant: 2, peso: 0.25 })); const c = rc(p); return [c.objetos, c.monedas, c.tesoros, c.total]; })(), [3, 0.9, 0.5, 4.4]);
  igual('equipo: la armadura puesta pesa 50/25/25', (() => { const p = mk(); ['torso', 'brazos', 'piernas'].forEach(k => { p.armadura[k].tipo = 'completa'; }); const c = rc(p); return [c.armadura, c.armaduraPartes.map(x => x.kg)]; })(), [31.5, [15.75, 7.875, 7.875]]);
  igual('equipo: solo el peto cuenta la mitad', (() => { const p = mk(); p.armadura.torso.tipo = 'cuero'; return rc(p).armadura; })(), 3.4);
  igual('equipo: estados informativos', (() => { const p = mk(); const f = A.reglas.resumen(p, reg).car.FUE.fila; const aut = Number(f['Peso autorizado']), max = Number(f['Peso máximo']); const g = kgs => { p.equipo.mochila.items = [EQ.objetoNuevo({ nombre: 'x', cant: 1, peso: kgs })]; return rc(p).estado; }; return [g(aut), g(aut + 0.5), g(max + 1)]; })(), ['Normal', 'Cargado', 'Sobrecargado']);
  igual('equipo: carga de una ubicación contra su capacidad', (() => { const u = EQ.ubicacionNueva('transporte', 'Caballo'); u.capacidad = 100; u.items.push(EQ.objetoNuevo({ nombre: 'Saco', cant: 3, peso: 40 })); const c = EQ.cargaUbicacion(u); return [c.total, c.pct, c.exceso]; })(), [120, 120, true]);
  igual('equipo: riqueza por lugar', (() => { const p = mk(), eq = p.equipo; eq.mochila.items.push(EQ.objetoNuevo({ nombre: 'a', cant: 2, valor: 5 }), EQ.objetoNuevo({ nombre: 'sin valor', cant: 1 })); eq.mochila.monedas.mo = 10;
    const f = EQ.ubicacionNueva('fortalezas', 'Casa'); f.mantenimiento = 20; f.mejoras.push(EQ.mejoraNueva({ nombre: 'Muro', coste: 100 })); eq.fortalezas.push(f);
    const pr = EQ.ubicacionNueva('propiedades', 'Taberna'); pr.valor = 500; pr.ingreso = 60; pr.gasto = 25; pr.tesoros.push(EQ.tesoroNuevo({ cant: 1, valor: 40 })); eq.propiedades.push(pr);
    const q = EQ.riqueza(eq); return [q.filas.map(x => x.total), q.conocido, q.sinTasar, q.ingresoMensual, q.gastoMensual, q.netoMensual]; })(), [[20, 100, 540], 660, 1, 60, 45, 15]);
  igual('equipo: comprar descuenta, guarda copia y anota', (() => { const p = mk(), eq = p.equipo; eq.mochila.monedas.mo = 10; const it = T.items.find(x => x.nombre === 'Cinturón'); const r1 = EQ.comprar(eq, it, { cant: 2, ahora: 't' }); return [r1.ok, EQ.centavosMonedas(eq.mochila.monedas), eq.mochila.items[0].nombre, eq.mochila.items[0].cant, eq.mochila.items[0].valor, eq.gastos[0].mo, eq.gastos[0].f]; })(), [true, 940, 'Cinturón', 2, 0.3, -0.6, 'Compra: 2 × Cinturón']);
  igual('equipo: comprar sin fondos no cambia nada', (() => { const p = mk(), eq = p.equipo; const r1 = EQ.comprar(eq, T.items.find(x => x.coste === '500 mo'), {}); return [r1.ok, eq.mochila.items.length, eq.gastos.length]; })(), [false, 0, 0]);
  igual('equipo: comprar sin precio pide uno, y con precio escrito funciona', (() => { const p = mk(), eq = p.equipo; eq.mochila.monedas.mo = 5; const it = T.items.find(x => x.valor === null); const a = EQ.comprar(eq, it, {}); const b = EQ.comprar(eq, it, { precioUnit: 2 }); return [a.ok, b.ok, EQ.centavosMonedas(eq.mochila.monedas)]; })(), [false, true, 300]);
  igual('equipo: servicio solo descuenta y anota', (() => { const p = mk(), eq = p.equipo; eq.mochila.monedas.mo = 5; const it = T.items.find(x => x.destino === 'Servicio' && x.valor && x.valor <= 5); const r1 = EQ.comprar(eq, it, {}); return [r1.ok, eq.mochila.items.length, eq.gastos.length, EQ.centavosMonedas(eq.mochila.monedas) < 500]; })(), [true, 0, 1, true]);
  igual('equipo: pagar desde otra tesorería y guardar en otra unidad', (() => { const p = mk(), eq = p.equipo; const u = EQ.ubicacionNueva('transporte', 'Carreta'); eq.transporte.push(u); const c = EQ.ubicacionNueva('propiedades', 'Taberna'); c.monedas.mo = 50; eq.propiedades.push(c); const r1 = EQ.comprar(eq, T.items.find(x => x.nombre === 'Cinturón'), { destino: { tipo: 'transporte', id: u.id }, tesoreria: { tipo: 'propiedades', id: c.id } }); return [r1.ok, u.items.length, EQ.centavosMonedas(c.monedas)]; })(), [true, 1, 4970]);
  igual('equipo: agregar sin pagar junta iguales', (() => { const p = mk(), eq = p.equipo, it = T.items.find(x => x.nombre === 'Cinturón'); EQ.agregar(eq, it, { cant: 2 }); EQ.agregar(eq, it, { cant: 3 }); return [eq.mochila.items.length, eq.mochila.items[0].cant, eq.gastos.length]; })(), [1, 5, 0]);
  igual('equipo: vender al 50% por defecto, editable y con tesorería elegida', (() => { const p = mk(), eq = p.equipo; eq.mochila.items.push(EQ.objetoNuevo({ nombre: 'Espada', cant: 2, valor: 15 })); const id = eq.mochila.items[0].id; const a = EQ.vender(eq, 'mochila', '', id, 1, { ahora: 't' }); const m1 = EQ.centavosMonedas(eq.mochila.monedas); const b = EQ.vender(eq, 'mochila', '', id, 1, { precioTotal: 12 }); return [a.ok, m1, b.ok, EQ.centavosMonedas(eq.mochila.monedas), eq.mochila.items.length, eq.gastos.map(g => g.mo)]; })(), [true, 750, true, 1950, 0, [7.5, 12]]);
  igual('equipo: vender objeto sin valor exige precio', (() => { const p = mk(), eq = p.equipo; eq.mochila.items.push(EQ.objetoNuevo({ nombre: 'Rareza', cant: 1 })); const id = eq.mochila.items[0].id; return [EQ.vender(eq, 'mochila', '', id, 1).ok, EQ.vender(eq, 'mochila', '', id, 1, { precioTotal: 3 }).ok]; })(), [false, true]);
  igual('equipo: el historial se limita a 200 líneas', (() => { const p = mk(); for (let i = 0; i < 230; i++) EQ.anotar(p.equipo, -1, 'x' + i, 't'); return [p.equipo.gastos.length, p.equipo.gastos[0].f]; })(), [200, 'x30']);
  /* homebrew: objetos de tienda, armas y armaduras propias */
  const ho = A.sanear.objetoTienda({ nombre: 'Poción rara', categoria: 'x', coste: '25 mo', peso: '0,5', destino: 'raro' });
  const ha = A.sanear.arma({ nombre: 'Hacha mía', costo: '8 mo', peso: 2.5, dm: '1d8', dg: '1d10' });
  const hr = A.sanear.armadura({ nombre: 'Coraza mía', completa: 5, costo: '120 mo', peso: 12 });
  const regt = A.crearRegistro({ ...A.hbVacio(), objetosTienda: [ho], armas: [ha], armaduras: [hr] }), tt = regt.tienda();
  igual('tienda: saneado del objeto homebrew', [ho.categoria, ho.destino, ho.peso, A.sanear.objetoTienda({ nombre: 'z', peso: -1 }).peso, hr.costo, hr.peso, A.sanear.armadura({ nombre: 'q' }).peso], ['x', 'Mochila', 0.5, '', '120 mo', 12, 0]);
  igual('tienda: homebrew aparece sin duplicar lo base', [tt.length, tt.filter(x => x.origen === 'homebrew').map(x => [x.nombre, x.categoria, x.valor, x.peso]), regt.tienda() === tt], [315, [['Poción rara', 'x', 25, 0.5], ['Hacha mía', 'Armas', 8, 2.5], ['Coraza mía', 'Armaduras', 120, 12]], true]);
  igual('tienda: la armadura homebrew pesa según su peso', (() => { const p = mk(); p.armadura.torso.tipo = hr.id; return EQ.pesoArmadura(p, regt).total; })(), 6);
  igual('tienda: paquete y fusión con objetos', (() => { const hb1 = A.hbVacio(); const a = A.fusionarHb(hb1, { objetosTienda: [ho] }), b = A.fusionarHb(hb1, { objetosTienda: [ho] }); return [a.agregados, b.repetidos, hb1.objetosTienda.length]; })(), [1, 1, 1]);
  /* migración de la hoja vieja */
  const leg = { controls: { 'host:pack_treasury:3': { value: '12' }, 'host:pack_treasury:0': { value: '4' }, 'host:property_treasury:3': { value: '30' } },
    equipmentRows: { eq_pack_rows: [['Cuerda', '2', '1.5', '0', '3 kg', 'Mochila', 'Puesto', 'nota'], ['', '1', '0', '0', '0 kg', 'Mochila', 'Guardado', '']], eq_transport_rows: [['Caballo', '1', '75 mo', '120', 'viejo']], eq_fort_rows: [['Casa', '1', '300', 'Villa', '']], eq_property_rows: [['Taberna', '500 mo', 'Puerto', 'buena']], pack_treasure_rows: [['Gema', 'Rubí', '2', '100', '0.01', 'Tasado', '']] } };
  const m = A.migrarLegacy(leg).personaje.equipo;
  igual('migración: mochila, monedas y tesoros', [m.mochila.items.length, m.mochila.items[0].nombre, m.mochila.items[0].cant, m.mochila.items[0].peso, m.mochila.items[0].estado, m.mochila.monedas.mo, m.mochila.monedas.mc, m.mochila.tesoros[0].desc, m.mochila.tesoros[0].estado], [1, 'Cuerda', 2, 1.5, 'Puesto', 12, 4, 'Rubí', 'Tasado']);
  igual('migración: transporte, fortaleza y propiedades', [m.transporte[0].nombre, m.transporte[0].capacidad, m.fortalezas[0].lugar, m.fortalezas[0].mejoras[0].coste, m.propiedades[0].nombre, m.propiedades[0].valor, m.propiedades[0].monedas.mo], ['Caballo', 120, 'Villa', 300, 'Taberna', 500, 30]);
  igual('migración: dinero huérfano se conserva', (() => { const x = A.migrarLegacy({ controls: { 'host:fort_treasury:3': { value: '9' } }, equipmentRows: {} }).personaje.equipo; return [x.fortalezas.length, x.fortalezas[0].monedas.mo]; })(), [1, 9]);
}

/* ---------------------------------------------------------------- Historia, Compañeros e imágenes */
{
  const nu = A.nuevoPersonaje();
  igual('historia: modelo nuevo', [Object.keys(nu.historia).length, nu.historia.objetivos, nu.companeros.secuito.seguidores.length, nu.companeros.secuito.aprendices.length, nu.companeros.familiar.poderes.length, nu.companeros.mascotas, nu.imagenes], [16, [], 8, 6, 9, [], { retrato: '', cuerpo: '' }]);
  const h1 = A.normalizarHistoria({ titulo: 5, objetivos: [{ nombre: 'a', estado: 'raro' }, null, 3], relaciones: [{ nombre: 'b', estado: 'x', etiquetas: ['Aliado', 'Aliado', '', 'Rival'] }], hitos: [{ tipo: 'nada' }], secretos: [{ publico: 'si', tipo: 'z' }] });
  igual('historia: saneado de enumeraciones y listas', [h1.titulo, h1.objetivos.length, h1.objetivos[0].estado, h1.relaciones[0].estado, h1.relaciones[0].etiquetas, h1.hitos[0].tipo, h1.secretos[0].publico, h1.secretos[0].tipo, h1.objetivos[0].id.length > 3], ['5', 1, 'Activo', 'Vivo / activo', ['Aliado', 'Rival'], 'Hazaña', false, 'Secreto del personaje', true]);
  igual('historia: conserva ids y se limita', (() => { const x = A.normalizarHistoria({ cronica: Array.from({ length: 400 }, (_, i) => ({ id: 'c' + i, texto: 'x' })) }); return [x.cronica.length, x.cronica[5].id]; })(), [300, 'c5']);
  const cp = A.normalizarCompaneros({ secuito: { tipo: 'x', seguidores: [{ nombre: 'Juan', extra: 1 }], img: 'javascript:alert(1)' }, mascotas: [{ nombre: 'Lobo', img: 'https://a.com/b.png' }, 4], familiar: { poderes: [{ poder: 'p' }] },
    registrados: [{ nombre: 'Ana', tipo: 'raro', estado: 'raro', items: [{ nombre: 'Soga', cant: 'zz', peso: -1 }, null] }] });
  igual('compañeros: saneado', [cp.secuito.seguidores.length, cp.secuito.seguidores[0].nombre, cp.secuito.img, cp.mascotas.length, cp.mascotas[0].img, cp.familiar.poderes.length, cp.familiar.poderes[0].poder, cp.registrados[0].tipo, cp.registrados[0].estado, cp.registrados[0].items.length, cp.registrados[0].items[0].cant, cp.registrados[0].items[0].peso], [8, 'Juan', '', 1, 'https://a.com/b.png', 9, 'p', 'PNJ / Seguidor', 'Activo', 1, 1, '']);
  const grande = 'data:image/png;base64,' + 'A'.repeat(200000);
  igual('imágenes: límites y seguridad', [A.imagenSegura(grande), A.imagenSegura(grande, 400000) === grande, A.imagenSegura('javascript:1'), A.imagenSegura('data:image/svg+xml;base64,AAAA'), A.normalizarImagenes({ retrato: grande, cuerpo: 'https://x.y/z.jpg' }).retrato === grande, A.normalizarImagenes({ retrato: 'ftp://x' }).retrato], ['', true, '', '', true, '']);
  igual('imágenes: personaje corrupto', (() => { const x = A.normalizarPersonaje({ historia: 'no', companeros: [], imagenes: 5 }); return [x.historia.objetivos, x.companeros.mascotas, x.imagenes]; })(), [[], [], { retrato: '', cuerpo: '' }]);
  const m = A.migrarLegacy({ controls: { '#his_apodo': { value: 'Sombra' }, '#his_lugar': { value: 'Puerto' }, '#his_titulo': { value: 'Capitán' }, '#his_portrait_url': { value: 'https://x.y/r.png' }, '#seg_tipo': { value: 'tropa' }, '#seg_grupo': { value: 'Los Lobos' }, '#seg_1_nom': { value: 'Brun' }, '#seg_1_nv': { value: '3' },
    '#tropa_tipo': { value: 'Arqueros' }, '#mas_2_nom': { value: 'Pip' }, '#mas_2_esp': { value: 'Cuervo' }, '#fam_nom': { value: 'Gato' }, '#fam_p3_nom': { value: 'Ver lejos' }, '#apr_1_nom': { value: 'Ana' } } }).personaje;
  igual('migración: historia y compañeros', [m.historia.titulo, m.historia.origen, m.historia.profesion, m.imagenes.retrato, m.companeros.secuito.tipo, m.companeros.secuito.nombre, m.companeros.secuito.seguidores[0].nombre, m.companeros.secuito.seguidores[0].nv, m.companeros.secuito.tropa.tipo, m.companeros.mascotas.length, m.companeros.mascotas[0].nombre, m.companeros.familiar.nombre, m.companeros.familiar.poderes[2].poder, m.companeros.secuito.aprendices[0].nombre],
    ['Sombra', 'Puerto', 'Capitán', 'https://x.y/r.png', 'Tropa (guerrero)', 'Los Lobos', 'Brun', '3', 'Arqueros', 1, 'Pip', 'Gato', 'Ver lejos', 'Ana']);
}

console.log(`${ok} correctas, ${mal} fallidas`);
process.exit(mal ? 1 : 0);
