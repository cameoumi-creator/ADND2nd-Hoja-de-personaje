/* Armadura y Clase de Armadura. Sin DOM, pura y probable en Node.
   Convención: las piezas y el equipo se anotan como PROTECCIÓN (positiva) y restan de la CA; los ajustes manuales y los
   efectos de 'ca' usan el signo de la CA (negativo mejora). Salen tres cifras:
   - CA total: todo lo anterior, con el límite de DES que impone el peto.
   - CA de dureza: solo lo que cuenta para penetrar la armadura (sin DES).
   - CA al toque: solo DES y magia, sin la armadura física. */
(function (A) {
  'use strict';
  const R = A.reglas, num = A.util.num;
  const MIN_CA = -10;

  const valorPieza = (a, parte, cob) => !a ? 0 : parte === 'torso' ? a.torso : parte === 'brazos' ? (cob === 1 ? a.brazo1 : a.brazos2) : (cob === 1 ? a.pierna1 : a.piernas2);

  /* Bono de DES aprovechable (defensa < 0 mejora la CA). Ligera: todo; Media: hasta −2; Pesada: nada. Una penalización siempre cuenta. */
  const desAplicado = (defensa, clase) => defensa >= 0 ? defensa : clase === 'Pesada' ? 0 : clase === 'Media' ? Math.max(defensa, -2) : defensa;
  const limiteDes = clase => clase === 'Pesada' ? 'Bono de DES anulado' : clase === 'Media' ? 'Bono de DES hasta −2' : 'DES completo';

  /* efectos: lista de R.efectos; defensa: fila "Defensa" de DES; estilo: lo que aporta el estilo de armas (ver armas.estiloCA). */
  R.armadura = function (pj, reg, efectos, defensa) {
    const ar = pj.armadura, lineas = [];
    const linea = (et, v, extra) => { if (v) lineas.push(Object.assign({ origen: 'Armadura', etiqueta: et, valor: v }, extra || {})); };
    const piezas = ['torso', 'brazos', 'piernas'].map(k => {
      const a = reg.armadura(ar[k].tipo), prot = valorPieza(a, k, ar[k].cob);
      return { k, a, prot, magico: num(ar[k].magico) };
    });
    const peto = piezas[0].a, clase = peto ? peto.clase : 'Ninguna';
    const prot = piezas.reduce((s, p) => s + p.prot, 0), magia = piezas.reduce((s, p) => s + p.magico, 0);
    const equipos = Object.values(ar.equipo || {});
    const equipoCA = equipos.reduce((s, q) => s + num(q.ca), 0), equipoMag = equipos.reduce((s, q) => s + num(q.magico), 0);
    let gTotal = 0, gDureza = 0, gToque = 0;
    (ar.generales || []).forEach(g => {
      const v = num(g.valor); gTotal += v;
      if (g.aplica === 'todas' || g.aplica === 'total+dureza') gDureza += v;
      if (g.aplica === 'todas' || g.aplica === 'total+toque') gToque += v;
    });
    const des = desAplicado(num(defensa), clase);
    const est = A.reglas.armas ? A.reglas.armas.estiloCA(pj, reg) : { mejor: null, escudo: 0 };
    const otros = efectos.filter(e => e.objetivo === 'ca' && e.origen !== 'Armas');
    const otrosV = otros.reduce((s, e) => s + e.valor, 0);
    const estV = est.mejor ? est.mejor.valor : 0;
    /* Artes marciales: el mejor arte vale sin armadura o con peto ligero (CA total y al toque). Piel de acero (−2) es aparte y solo sin armadura. */
    const am = R.artes ? R.artes.ca(pj, reg) : { arte: null, piel: null };
    const arteActiva = !!am.arte && (clase === 'Ninguna' || clase === 'Ligera'), pielActiva = !!am.piel && clase === 'Ninguna';
    const artesV = (arteActiva ? am.arte.valor : 0) + (pielActiva ? am.piel.valor : 0);
    const artes = {
      arte: am.arte, piel: am.piel, arteActiva, pielActiva, valor: artesV,
      motivo: am.arte && !arteActiva ? `no funciona con peto de clase ${clase.toLowerCase()}` : '',
      motivoPiel: am.piel && !pielActiva ? 'solo funciona sin armadura' : ''
    };

    piezas.forEach(p => { if (p.prot) linea(`${{ torso: 'Peto', brazos: 'Brazos', piernas: 'Piernas' }[p.k]}: ${p.a.nombre}`, -p.prot); });
    linea('Magia de las piezas', -magia); linea('Equipo puesto', -equipoCA); linea('Magia del equipo', -equipoMag);
    (ar.generales || []).forEach(g => linea('Bono: ' + (g.origen || 'sin origen'), -num(g.valor)));
    otros.forEach(e => lineas.push({ origen: e.origen, etiqueta: e.etiqueta, valor: e.valor, nota: e.nota }));
    if (est.mejor) lineas.push({ origen: 'Armas', etiqueta: est.mejor.etiqueta, valor: est.mejor.valor });
    if (arteActiva) lineas.push({ origen: 'Artes marciales', etiqueta: am.arte.nombre, valor: am.arte.valor });
    if (pielActiva) lineas.push({ origen: 'Artes marciales', etiqueta: `${am.piel.nombre} (${am.piel.arte})`, valor: am.piel.valor });
    linea('Ajuste manual', num(ar.manual)); linea('Extraordinario', num(ar.extra));

    const bruta = 10 - prot - magia - equipoCA - equipoMag - gTotal + otrosV + des + estV + artesV + num(ar.manual) + num(ar.extra);
    const durezaBruta = 10 - prot - magia - equipoCA - equipoMag - gDureza + est.escudo;
    const toqueBruta = 10 - magia - equipoMag - gToque + des + artesV;
    const tope = v => Math.max(MIN_CA, v);
    return {
      valor: tope(bruta), bruta, margen: Math.max(0, MIN_CA - bruta), dureza: tope(durezaBruta), toque: tope(toqueBruta),
      defensa: des, defensaNatural: num(defensa), clase, limite: limiteDes(clase), proteccion: prot, magia, equipoCA, equipoMag,
      estilo: est, artes, piezas: piezas.map(p => ({ parte: p.k, armadura: p.a, valor: p.prot, magico: p.magico })), estilo: est, bonos: lineas, tieneEscudo: !!est.hayEscudo
    };
  };
})((typeof window !== 'undefined' ? window : globalThis).ADND);
