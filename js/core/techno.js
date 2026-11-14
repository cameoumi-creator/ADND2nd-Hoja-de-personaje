/* Techno. Sin DOM, pura y probable en Node.
   El Techno no "mejora" armas: las fabrica. La tabla por nivel marca lo que su taller puede hacer:
   - Armas (melee y a distancia): parten de una arma existente y todo es editable; el dado de su tabla se suma al daño y su bono de RT se suma siempre al RT.
   - Armas de área: un objeto con elemento (uno nuevo cada 3 niveles desde el 7), área por nivel, daño de la tabla y la salvación del elemento.
   - Armaduras: parten de una armadura existente; su bono (+1 a +6) se suma a la protección.
   - Monturas: con dados de golpe (3 en el primer nivel que se pueden hacer y uno más por nivel), HP, GAC0 y CA (10 menos el bono de armadura).
   Cada creación guarda la capacidad del nivel en que se fabricó; para mejorarla se hace una versión nueva. */
(function (A) {
  'use strict';
  const R = A.reglas, num = A.util.num, clamp = A.util.clamp;
  const TH = (R.techno = {});
  const T = () => A.base.techno;

  TH.FACULTADES = [
    { k: 'dano', nombre: 'Daño de armas melee', fuente: 'Mejora Techno melee', nota: 'Se suma al daño de cada arma melee que fabricas.' },
    { k: 'proy', nombre: 'Daño de armas a distancia', fuente: 'Mejora Techno distancia', nota: 'Se suma al daño de cada arma a distancia que fabricas.' },
    { k: 'area', nombre: 'Armas de área (máx.)', fuente: 'Daño máximo de área', nota: 'Daño del dispositivo; un elemento nuevo cada 3 niveles.' },
    { k: 'rt', nombre: 'Bono al round trip', fuente: 'Bono Round Trip', nota: 'Se suma al RT de cada arma que fabricas (melee y a distancia).', mas: true },
    { k: 'arm', nombre: 'Bono de armadura', fuente: 'Mejora de armadura', nota: 'Se suma a la protección de las armaduras que fabricas y baja la CA de tus monturas.', mas: true },
    { k: 'montura', nombre: 'Tipo de montura', fuente: 'Capacidad de montura', nota: 'Velocidad y modos de desplazamiento de tus monturas.' }
  ];
  /* tipo de creación → facultad que fija su capacidad (el RT no es una creación: es parte de cada arma) */
  TH.TIPOS = [['Arma melee', 'dano'], ['Arma distancia', 'proy'], ['Arma de área', 'area'], ['Armadura', 'arm'], ['Montura', 'montura'], ['Munición', null], ['Dispositivo', null], ['Otro', null]];
  const esArma = tipo => tipo === 'Arma melee' || tipo === 'Arma distancia';
  TH.esArma = esArma;

  TH.nivel = items => { const x = items.find(i => i.clase.id === 'techno'); return x ? clamp(num(x.nivel), 0, 30) : 0; };
  const valorDe = (k, lv) => { if (!lv) return '—'; const v = T()[k][lv]; return k === 'rt' || k === 'arm' ? '+' + v : String(v); };
  const primero = (k, ok) => { for (let n = 1; n <= 30; n++) if (ok(T()[k][n])) return n; return 31; };
  TH.nivelArea = () => primero('area', v => v !== 'N/D');
  TH.nivelMontura = () => primero('montura', v => v !== 'N/D');

  TH.bonoRt = lv => (lv ? num(T().rt[lv]) : 0);
  TH.bonoArm = lv => (lv ? num(T().arm[lv]) : 0);
  TH.elementos = lv => A.base.technoElementos.filter(e => lv >= e.nivel);
  TH.elemento = k => A.base.technoElementos.find(e => e.k === k || e.nombre === k) || null;
  TH.areaMax = lv => TH.elementos(lv).reduce((m, e) => Math.max(m, e.lado), 0);
  TH.pies = lado => Math.round(num(lado) * 10 / 3);
  TH.textoArea = lado => `${lado}×${lado} m (${TH.pies(lado)}×${TH.pies(lado)} pies)`;

  /* Valores iniciales de una montura: 3 dados de golpe en el primer nivel que se puede hacer y uno más por nivel. */
  TH.montura0 = lv => A.sanear.techMontura({ dg: Math.max(3, lv - TH.nivelMontura() + 3), dado: 8, modo: 'maximo', bonoArm: TH.bonoArm(lv), mov: lv ? String(T().montura[lv]) : '', ataques: [{ nombre: 'Embestida', dano: '1d6' }] });
  TH.area0 = lv => { const e = TH.elementos(lv)[0]; return A.sanear.techArea(e ? { elemento: e.nombre, lado: e.lado, salv: e.salv, dano: lv ? String(T().area[lv]) : '' } : {}); };
  TH.hpMontura = m => {
    if (m.hpManual !== null && m.hpManual !== undefined) return m.hpManual;
    if (m.modo !== 'tirada') return m.dg * m.dado;
    const media = Math.ceil((m.dado + 1) / 2);
    return Array.from({ length: m.dg }, (_, i) => (m.tiradas[i] || media)).reduce((s, v) => s + v, 0);
  };
  /* Ficha de monstruo de la montura: GAC0 = 21 − dados de golpe (3 dados: 18); CA = 10 − bono de armadura del Techno. */
  TH.statsMontura = m => ({ dg: m.dg, dado: m.dado, hp: TH.hpMontura(m), thac0: Math.max(1, 21 - m.dg) + m.thac0Aj, ca: 10 - m.bonoArm + m.caAj });

  TH.resumen = (pj, items) => {
    const lv = TH.nivel(items), t = pj.tecnicas.techno;
    /* Cada facultad lista sola las creaciones del taller que dependen de ella. */
    const facultadDe = tipo => { const par = TH.TIPOS.find(x => x[0] === tipo); return par ? par[1] : null; };
    const filas = TH.FACULTADES.map(f => ({ k: f.k, nombre: f.nombre, nota: f.nota, valor: valorDe(f.k, lv), creaciones: t.taller.filter(x => facultadDe(x.tipo) === f.k).map(x => ({ id: x.id, nombre: x.nombre, resultado: x.resultado })) }));
    return { nivel: lv, filas, cerraduras: lv ? T().cerraduras[lv] + '%' : '—', trampas: lv ? T().trampas[lv] + '%' : '—', notas: t.notas, taller: t.taller, elementos: TH.elementos(lv), areaMax: TH.areaMax(lv), nivelArea: TH.nivelArea(), nivelMontura: TH.nivelMontura() };
  };

  /* Capacidad actual para un tipo de creación (texto) y su fuente. */
  TH.capacidad = (tipo, lv) => {
    const par = TH.TIPOS.find(x => x[0] === tipo), f = par && TH.FACULTADES.find(q => q.k === par[1]);
    return f ? { valor: valorDe(f.k, lv), fuente: f.fuente } : { valor: 'Manual / descriptivo', fuente: 'Manual' };
  };
  TH.conBase = esArma;

  /* Línea de resumen de una creación (hoja impresa y tarjetas). */
  TH.linea = x => {
    if (x.tipo === 'Montura' && x.montura) { const s = TH.statsMontura(x.montura); return `${s.dg} DG (d${s.dado}), ${s.hp} HP, GAC0 ${s.thac0}, CA ${s.ca}${x.montura.mov ? ', ' + x.montura.mov : ''}${x.montura.ataques.length ? ' · ' + x.montura.ataques.map(a => `${a.nombre} ${a.dano}`).join(', ') : ''}`; }
    if (x.tipo === 'Arma de área' && x.area) return `${x.area.dano || x.capacidad} de ${x.area.elemento || 'daño'}, ${TH.textoArea(x.area.lado)}, salvación ${x.area.salv}: ${x.area.exito}`;
    return x.resultado || x.capacidad || '';
  };

  const acc = (TH.acc = {});
  acc.notas = (pj, texto) => { pj.tecnicas.techno.notas = String(texto || ''); return null; };

  const aDado = v => (/^\d+d\d+$/i.test(String(v)) ? String(v).toLowerCase() : '');
  const armaDe = (b, tipo, id, dado, rtBono, autor) => A.sanear.arma(Object.assign({}, b.arma || {}, { id: 'tecno-' + id, tipo: tipo === 'Arma distancia' ? 'distancia' : 'cuerpo', grupo: String((b.arma && b.arma.grupo) || '').trim() || 'Techno', techDado: dado, techRt: rtBono, autor, escudo: undefined }));
  /* Protección final de una armadura fabricada: la base editada más el bono de Techno en cada pieza que protege. */
  TH.armaduraFinal = x => {
    const a = JSON.parse(JSON.stringify(x.armadura)), b = num(x.bono);
    ['completa', 'torso', 'brazos2', 'brazo1', 'piernas2', 'pierna1'].forEach(k => { if (num(a[k]) > 0) a[k] = num(a[k]) + b; });
    a.id = 'tecno-arm-' + x.id; a.nombre = x.nombre; return A.sanear.armadura(a);
  };
  const resultadoDe = (it, tipo, cap) => {
    if (esArma(tipo) && it.arma) return `${it.arma.dm} + ${cap.valor}${it.rtBono ? ' · RT +' + it.rtBono : ''}`;
    if (tipo === 'Armadura') return `Protección base + ${it.bono}`;
    if (tipo === 'Arma de área') return `${it.area.dano || cap.valor} · ${it.area.elemento || 'sin elemento'} · ${TH.textoArea(it.area.lado)}`;
    if (tipo === 'Montura' && it.montura) { const s = TH.statsMontura(it.montura); return `${s.dg} DG, ${s.hp} HP, GAC0 ${s.thac0}, CA ${s.ca}`; }
    return cap.valor;
  };

  /* b: { nombre, tipo, dueno, desc, img, arma, armadura, area, montura }; id: la creación que se reemplaza (opcional). */
  acc.guardar = (pj, nivel, b, id) => {
    const tipo = TH.TIPOS.some(x => x[0] === b.tipo) ? b.tipo : 'Otro';
    const nombre = String(esArma(tipo) ? (b.arma && b.arma.nombre) : tipo === 'Armadura' ? (b.armadura && b.armadura.nombre) : b.nombre || '').trim();
    if (!nombre) return 'Escribe un nombre para la creación.';
    if (!nivel && !id) return 'Para fabricar necesitas la clase Techno.';
    const l = pj.tecnicas.techno.taller, i = id ? l.findIndex(x => x.id === id) : -1, previo = i >= 0 ? l[i] : null;
    const cambioTipo = previo && previo.tipo !== tipo, conserva = previo && !cambioTipo;
    const nivelF = conserva ? previo.nivel : nivel, cap = conserva ? { valor: previo.capacidad, fuente: previo.fuente } : TH.capacidad(tipo, nivel);
    if (esArma(tipo) && !String((b.arma && b.arma.dm) || '').trim()) return 'Indica el daño base del arma.';
    if (tipo === 'Armadura') { const a = b.armadura || {}; if (!(num(a.completa) > 0 || num(a.torso) > 0)) return 'Indica la protección de la armadura (completa o peto).'; }
    if (tipo === 'Arma de área') {
      if (!conserva && nivel < TH.nivelArea()) return `Las armas de área se pueden fabricar desde el nivel ${TH.nivelArea()} de Techno.`;
      const el = TH.elemento(b.area && b.area.elemento);
      if (!el) return 'Elige el elemento del arma de área.';
      if (!conserva && nivel < el.nivel) return `${el.nombre} se desbloquea en el nivel ${el.nivel} de Techno.`;
      if (!conserva && num(b.area.lado) > TH.areaMax(nivel)) return `Con tu nivel el área máxima es ${TH.textoArea(TH.areaMax(nivel))}.`;
    }
    if (tipo === 'Montura' && !conserva && nivel < TH.nivelMontura()) return `Las monturas se pueden fabricar desde el nivel ${TH.nivelMontura()} de Techno.`;
    const nuevoId = previo ? previo.id : A.util.idNuevo('taller', nombre);
    const it = { id: nuevoId, nombre, tipo, nivel: nivelF, dueno: String(b.dueno || '').trim(), base: '', capacidad: cap.valor, fuente: cap.fuente, resultado: cap.valor, desc: String(b.desc || '').trim(), img: A.imagenSegura(b.img), entregada: previo ? previo.entregada : '' };
    if (esArma(tipo)) { it.rtBono = conserva && previo.rtBono !== undefined ? previo.rtBono : TH.bonoRt(nivelF); it.arma = armaDe(b, tipo, nuevoId, aDado(cap.valor), it.rtBono, pj.identidad.nombre); it.nombre = it.arma.nombre; it.base = it.arma.dm; }
    if (tipo === 'Armadura') { it.bono = conserva && previo.bono !== undefined ? previo.bono : TH.bonoArm(nivelF); it.armadura = A.sanear.armadura(Object.assign({}, b.armadura, { id: 'tecno-arm-' + nuevoId })); it.nombre = it.armadura.nombre; }
    if (tipo === 'Arma de área') it.area = A.sanear.techArea(b.area);
    if (tipo === 'Montura') it.montura = A.sanear.techMontura(Object.assign({}, b.montura, { bonoArm: conserva && previo.montura ? previo.montura.bonoArm : TH.bonoArm(nivelF) }));
    it.resultado = resultadoDe(it, tipo, cap);
    if (previo) l[i] = it; else l.push(it);
    return null;
  };
  /* Nueva versión: copia la creación con la capacidad de tu nivel actual y la deja junto a la anterior. */
  acc.version = (pj, nivel, id) => {
    const l = pj.tecnicas.techno.taller, x = l.find(q => q.id === id); if (!x) return 'Esa creación ya no existe.';
    if (!nivel) return 'Para fabricar necesitas la clase Techno.';
    const base = x.nombre.replace(/\s+V(\d+)$/i, ''), vs = l.map(q => { const m = q.nombre.startsWith(base) && q.nombre.match(/\sV(\d+)$/i); return q.nombre === base ? 1 : m ? +m[1] : 0; });
    const n = Math.max(1, ...vs) + 1, nombre = `${base} V${n}`, nuevo = A.util.idNuevo('taller', nombre), cap = TH.capacidad(x.tipo, nivel);
    const it = Object.assign({}, JSON.parse(JSON.stringify(x)), { id: nuevo, nombre, nivel, capacidad: cap.valor, fuente: cap.fuente, entregada: '' });
    if (x.arma) { it.rtBono = TH.bonoRt(nivel); it.arma = armaDe({ arma: Object.assign({}, x.arma, { nombre }) }, x.tipo, nuevo, aDado(cap.valor), it.rtBono, pj.identidad.nombre); it.base = it.arma.dm; }
    if (x.armadura) { it.bono = TH.bonoArm(nivel); it.armadura = A.sanear.armadura(Object.assign({}, x.armadura, { id: 'tecno-arm-' + nuevo, nombre })); }
    if (x.montura) { it.montura = A.sanear.techMontura(Object.assign({}, x.montura, { bonoArm: TH.bonoArm(nivel), dg: Math.max(x.montura.dg, TH.montura0(nivel).dg), tiradas: [] })); it.montura.mov = String(T().montura[nivel] || it.montura.mov); }
    if (x.area) { it.area = A.sanear.techArea(Object.assign({}, x.area, { dano: String(T().area[nivel] !== 'N/D' ? T().area[nivel] : x.area.dano) })); }
    it.resultado = resultadoDe(it, x.tipo, cap);
    l.push(it); return null;
  };
  acc.entregada = (pj, id, fecha) => { const x = pj.tecnicas.techno.taller.find(q => q.id === id); if (x) x.entregada = String(fecha || ''); return null; };
  acc.quitar = (pj, id) => { pj.tecnicas.techno.taller = pj.tecnicas.techno.taller.filter(x => x.id !== id); return null; };

  /* Paquete de Homebrew para compartir una creación: armas y armaduras van a sus apartados; el resto, a "Creaciones de Techno". */
  TH.paquete = (x, autor) => {
    const paq = A.hbVacio();
    if (x.arma) paq.armas.push(JSON.parse(JSON.stringify(x.arma)));
    else if (x.armadura) paq.armaduras.push(TH.armaduraFinal(x));
    else paq.creaciones.push(A.sanear.creacion({ id: 'tecno-' + x.id, nombre: x.nombre, tipo: x.tipo, desc: x.desc, img: x.img, autor, nivel: x.nivel, capacidad: x.capacidad, resultado: TH.linea(x), area: x.area, montura: x.montura }));
    return paq;
  };
  /* Una creación recibida (Homebrew) pasa al taller de este personaje, sin pedir nivel de Techno. */
  acc.recibir = (pj, c) => {
    const l = pj.tecnicas.techno.taller; if (l.some(x => x.id === 'rec-' + c.id)) return 'Esa creación ya está en tu taller.';
    const it = { id: 'rec-' + c.id, nombre: c.nombre, tipo: c.tipo, nivel: c.nivel || 0, dueno: '', base: '', capacidad: c.capacidad || '', fuente: c.autor ? 'Recibida de ' + c.autor : 'Recibida', resultado: c.resultado || c.capacidad || '', desc: c.desc || '', img: c.img || '', entregada: '' };
    if (c.area) it.area = A.sanear.techArea(c.area);
    if (c.montura) it.montura = A.sanear.techMontura(c.montura);
    l.push(it); return null;
  };
})((typeof window !== 'undefined' ? window : globalThis).ADND);
