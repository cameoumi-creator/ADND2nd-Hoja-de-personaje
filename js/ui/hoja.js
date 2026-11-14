/* Hoja imprimible: se arma al imprimir (botón Imprimir o Ctrl+P) y solo se ve en papel.
   Es texto y tablas reales, sin imágenes de fondo: imprime nítida y no depende de nada externo. */
(function (A) {
  'use strict';
  const ui = A.ui, U = A.util, h = ui.h;

  /* Historia en la hoja: sin secretos (solo lo marcado como público), sin crónica ni notas del jugador. */
  function historiaHoja(S) {
    const pj = S.pj, hi = pj.historia, p = (et, v) => (String(v || '').trim() ? h('p', { class: 'p' }, h('strong', { text: et + ': ' }), String(v)) : null);
    const datos = [['Título', hi.titulo], ['Origen', hi.origen], ['Estatus', hi.estatus], ['Afiliación', hi.afiliacion], ['Profesión', hi.profesion]].filter(x => x[1]).map(x => `${x[0]}: ${x[1]}`).join(' · ');
    const obj = hi.objetivos.filter(o => o.nombre && o.estado === 'Activo'), rel = hi.relaciones.filter(r => r.nombre), hit = hi.hitos.filter(x => x.titulo), rep = hi.reputacion.filter(x => x.nombre), pub = hi.secretos.filter(x => x.publico && x.info);
    const cont = [p('Datos', datos), p('Lema', hi.lema), p('Motivación', hi.motivacion), p('Temor', hi.temor), p('Ideales', hi.ideales), p('Rasgos', hi.rasgos), p('Historia', pj.notas.historia),
      obj.length ? p('Objetivos activos', obj.map(o => o.nombre).join('; ')) : null,
      rel.length ? p('Relaciones', rel.map(r => `${r.nombre}${r.vinculo ? ' (' + r.vinculo + ')' : ''}${r.etiquetas.length ? ' [' + r.etiquetas.join(', ') + ']' : ''}`).join('; ')) : null,
      hit.length ? p('Hitos', hit.map(x => `${x.titulo}${x.tipo ? ' (' + x.tipo + ')' : ''}`).join('; ')) : null,
      rep.length ? p('Reputación', rep.map(x => x.nombre + (x.quien ? ' — ' + x.quien : '')).join('; ')) : null,
      pub.length ? p('Conocimiento público', pub.map(x => x.info).join('; ')) : null].filter(Boolean);
    return cont.length ? h('div', {}, h('h2', { text: 'Historia' }), cont) : null;
  }
  function companerosHoja(S) {
    const c = S.pj.companeros, sq = c.secuito, f = c.familiar, v = x => String(x || '').trim(), linea = (...a) => a.filter(Boolean).join(' · ');
    const filas = [];
    const seg = sq.seguidores.filter(x => v(x.nombre)), apr = sq.aprendices.filter(x => v(x.nombre));
    if (v(sq.tipo) || v(sq.nombre) || seg.length || apr.length || v(sq.tropa.tipo) || v(sq.gremio.nombre))
      filas.push(h('p', { class: 'p' }, h('strong', { text: 'Séquito: ' }), linea(sq.nombre, sq.tipo, sq.sede && 'sede ' + sq.sede, sq.moral && 'moral ' + sq.moral),
        seg.length ? ' — ' + seg.map(x => `${x.nombre}${x.clase ? ' (' + x.clase + (x.nv ? ' ' + x.nv : '') + ')' : ''}`).join(', ') : '', apr.length ? ' — aprendices: ' + apr.map(x => x.nombre).join(', ') : '',
        v(sq.tropa.tipo) ? ` — tropa: ${sq.tropa.numero ? sq.tropa.numero + ' ' : ''}${sq.tropa.tipo}` : '', v(sq.gremio.nombre) ? ` — gremio: ${sq.gremio.nombre}${sq.gremio.miembros ? ' (' + sq.gremio.miembros + ')' : ''}` : ''));
    c.mascotas.filter(m => v(m.nombre) || v(m.especie)).forEach(m => filas.push(h('p', { class: 'p' }, h('strong', { text: 'Mascota: ' }), linea(m.nombre, m.especie, m.dg && 'DG ' + m.dg, m.pg && 'PG ' + m.pg, m.ca && 'CA ' + m.ca, m.gac0 && 'GAC0 ' + m.gac0, m.ataque, m.mov && 'mov ' + m.mov))));
    if (v(f.nombre) || v(f.tipo)) filas.push(h('p', { class: 'p' }, h('strong', { text: 'Familiar: ' }), linea(f.nombre, f.tipo, f.pg && 'PG ' + f.pg, f.ca && 'CA ' + f.ca, f.estado), f.poderes.filter(x => v(x.poder)).length ? ' — ' + f.poderes.map((x, i) => (v(x.poder) ? `${i + 1}: ${x.poder}` : '')).filter(Boolean).join('; ') : ''));
    c.registrados.filter(x => v(x.nombre)).forEach(x => filas.push(h('p', { class: 'p' }, h('strong', { text: x.tipo + ': ' }), linea(x.nombre, x.clase, x.nivel && 'nv ' + x.nivel, x.pgMax && `PG ${x.pgAct || '—'}/${x.pgMax}`, x.ca && 'CA ' + x.ca, x.gac0 && 'GAC0 ' + x.gac0, x.estado !== 'Activo' ? x.estado : ''))));
    return filas.length ? h('div', {}, h('h2', { text: 'Compañeros' }), filas) : null;
  }
  /* Sección Equipo de la hoja: solo aparece si hay algo anotado. */
  function equipoHoja(S) {
    const eq = S.pj.equipo, E = A.reglas.equipo, fmt = n => ui.miles(n, 2), kg = n => ui.miles(n, 3) + ' kg';
    const lista = g => g.items.filter(x => x.nombre).map(x => `${x.cant > 1 ? x.cant + ' × ' : ''}${x.nombre}${x.estado === 'Puesto' ? ' (puesto)' : ''}`).join(', ');
    const mon = m => E.MONEDAS.filter(k => m[k]).map(k => `${m[k]} ${k.toUpperCase()}`).join(' · ');
    const hay = eq.mochila.items.length || E.centavosMonedas(eq.mochila.monedas) || eq.mochila.tesoros.length || ['transporte', 'fortalezas', 'propiedades'].some(t => eq[t].length);
    const cuerpo = S.pj.imagenes.cuerpo ? h('img', { class: 'h-cuerpo', src: S.pj.imagenes.cuerpo, alt: '', referrerpolicy: 'no-referrer' }) : null;
    if (!hay && !cuerpo) return null;
    const c = E.carga(S.pj, S.reg, S.r.car.FUE.fila), q = E.riqueza(eq), tes = g => g.tesoros.filter(t => t.desc || t.tipo).map(t => `${t.cant > 1 ? t.cant + ' × ' : ''}${t.desc || t.tipo}`).join(', ');
    const parrafo = (et, v) => (v ? h('p', { class: 'p' }, h('strong', { text: et + ': ' }), v) : null);
    const ub = (t, et, extra) => eq[t].map(u => h('p', { class: 'p' }, h('strong', { text: `${et}: ${u.nombre || 'Sin nombre'}` }), [u.lugar, extra && extra(u), lista(u) && 'guarda ' + lista(u), mon(u.monedas) && 'monedas ' + mon(u.monedas), tes(u) && 'tesoros ' + tes(u)].filter(Boolean).map(x => ' · ' + x).join('')));
    return h('div', {}, h('h2', { text: 'Equipo' }), cuerpo,
      parrafo('Mochila', lista(eq.mochila)), parrafo('Monedas', mon(eq.mochila.monedas)), parrafo('Tesoros', tes(eq.mochila)),
      h('p', { class: 'p' }, h('strong', { text: 'Carga: ' }), `${kg(c.total)}${c.estado ? ' (' + c.estado + '; autorizado ' + kg(c.autorizado) + ', máximo ' + kg(c.maximo) + ')' : ''}`),
      ...ub('transporte', 'Transporte', u => u.capacidad !== '' ? `capacidad ${kg(u.capacidad)}` : ''),
      ...ub('fortalezas', 'Fortaleza', u => (u.mantenimiento ? `mantenimiento ${fmt(u.mantenimiento)} mo/mes` : '')),
      ...ub('propiedades', 'Propiedad', u => [u.valor !== '' ? `valor ${fmt(u.valor)} mo` : '', u.ingreso ? `ingreso ${fmt(u.ingreso)} mo/mes` : '', u.gasto ? `gasto ${fmt(u.gasto)} mo/mes` : ''].filter(Boolean).join(' · ')),
      h('p', { class: 'p' }, h('strong', { text: 'Patrimonio conocido: ' }), `${fmt(q.conocido)} mo${q.ingresoMensual || q.gastoMensual ? ` · mensual ${fmt(q.ingresoMensual)} − ${fmt(q.gastoMensual)} = ${fmt(q.netoMensual)} mo` : ''}`));
  }

  ui.hoja = function (S) {
    const { pj, r, reg } = S;
    const raza = reg.raza(pj.raza.id), variante = raza && raza.variantes.find(v => v.id === pj.raza.variante);
    const clases = (pj.trayectoria === 'unica' ? r.gob : r.items).map(x => `${x.clase.nombre}${x.clase.kit ? ' (' + x.clase.kit.nombre + ')' : ''} ${x.nivel}`).join(pj.trayectoria === 'multi' ? ' / ' : ' → ');
    const deidad = reg.deidad(pj.identidad.deidad);
    const dato = (et, v) => h('div', { class: 'h-dato' }, h('span', { text: et }), h('strong', { text: String(v) }));

    const caracteristicas = h('table', { class: 'h-tabla' },
      h('thead', {}, h('tr', {}, ['', 'Base', 'Final', 'Efectos'].map(t => h('th', { text: t })))),
      h('tbody', {}, A.STATS.map(s => {
        const c = r.car[s];
        const efectos = c.fila ? Object.entries(c.fila).map(([k, v]) => `${k} ${A.reglas.formatoFila(v)}`).join(' · ') : '';
        return h('tr', {}, h('th', { text: `${s} ${A.STAT_NOMBRES[s]}` }), h('td', { text: c.base }), h('td', { class: 'g', text: c.total }), h('td', { class: 'p', text: efectos }));
      })));

    const salvaciones = h('table', { class: 'h-tabla' }, h('tbody', {}, r.salvaciones.map(s => h('tr', {}, h('th', { text: `${s.id} · ${A.SAVE_NOMBRES[s.id]}` }), h('td', { class: 'g', text: s.valor })))));

    const clasesTabla = h('table', { class: 'h-tabla' },
      h('thead', {}, h('tr', {}, ['Clase', 'Kit', 'Nivel', 'PX', 'Siguiente'].map(t => h('th', { text: t })))),
      h('tbody', {}, r.items.map(x => h('tr', {}, h('td', { text: x.clase.nombre + (x.entrada.estado === 'Congelada' ? ' (congelada)' : '') }), h('td', { text: x.clase.kit ? x.clase.kit.nombre : '—' }),
        h('td', { text: x.nivel }), h('td', { text: x.xpEfectivo.toLocaleString('es-MX') }), h('td', { text: x.xpSiguiente === null ? 'Máx.' : x.xpSiguiente.toLocaleString('es-MX') })))));

    const datosId = [pj.identidad.jugador && 'Jugador: ' + pj.identidad.jugador, deidad && 'Deidad: ' + deidad.nombre, pj.identidad.sexo, pj.identidad.edad && pj.identidad.edad + ' años', pj.identidad.altura, pj.identidad.peso].filter(Boolean).join('  ·  ');
    const efectos = r.efectos.filter(e => !A.STATS.includes(e.objetivo) || e.origen === 'Manual');
    const armas = r.armas ? r.armas.instancias : [];
    const tablaArmas = armas.length ? h('table', { class: 'h-tabla' },
      h('thead', {}, h('tr', {}, ['Arma', 'GAC0', 'Daño P/M', 'Daño G', 'RT', 'Crítico', 'Estilo'].map(t => h('th', { text: t })))),
      h('tbody', {}, armas.map(x => h('tr', {}, h('td', { text: (x.inst.nombre ? x.inst.nombre + ' — ' : '') + (x.arma ? x.arma.nombre : '?') }), h('td', { class: 'g', text: x.gac0 }), h('td', { text: x.dano.p }), h('td', { text: x.dano.g }), h('td', { text: x.rt }), h('td', { text: x.critico }),
        h('td', { text: (x.opciones.find(o => o[0] === x.estilo) || [0, ''])[1] === 'Ninguno' ? '' : (x.opciones.find(o => o[0] === x.estilo) || [0, ''])[1] }))))) : null;
    const idiomasTxt = [...r.idiomas.nativos.map(x => x.nombre + ' (nativo)'), ...r.idiomas.aprendidos.map(x => x.nombre)].join(', ');
    const notas = ['equipo'].filter(k => pj.notas[k].trim());

    const hoja = h('div', { class: 'h-pagina' },
      h('header', { class: 'h-cab' }, pj.imagenes.retrato ? h('img', { class: 'h-retrato', src: pj.imagenes.retrato, alt: '', referrerpolicy: 'no-referrer' }) : null, h('h1', { text: pj.identidad.nombre || 'Sin nombre' }),
        h('p', { text: [raza ? raza.nombre + (variante ? ` (${variante.nombre})` : '') : '', clases, pj.identidad.alineamiento].filter(Boolean).join('  ·  ') })),
      h('div', { class: 'h-fila' },
        dato('Nivel', r.nivel), dato('THAC0', r.thaco.valor), dato('CA', r.ca.valor), dato('PG', pj.pg.actual === null ? r.pg.max : `${pj.pg.actual} / ${r.pg.max}`)),
      h('div', { class: 'h-cols' },
        h('div', {}, h('h2', { text: 'Características' }), caracteristicas, h('p', { class: 'p', text: `Ego ${r.ego}  ·  Belleza ${r.belleza}` })),
        h('div', {}, h('h2', { text: 'Salvaciones' }), salvaciones, ...(datosId ? [h('h2', { text: 'Identidad' }), h('p', { class: 'p', text: datosId }),
          pj.identidad.apariencia ? h('p', { class: 'p', text: pj.identidad.apariencia }) : null] : []))),
      h('h2', { text: 'Clases' }), clasesTabla,
      h('p', { class: 'p', text: `Pericias disponibles: ${r.pericias.disponiblesPA} de arma, ${r.pericias.disponiblesPNA} sin arma.${pj.pericias.armas.length ? ' Armas: ' + pj.pericias.armas.map(x => x.nombre).filter(Boolean).join(', ') + '.' : ''}${pj.pericias.otras.length ? ' Otras: ' + pj.pericias.otras.map(x => x.nombre).filter(Boolean).join(', ') + '.' : ''}` }),
      idiomasTxt ? h('div', {}, h('h2', { text: 'Idiomas' }), h('p', { class: 'p', text: idiomasTxt })) : null,
      tablaArmas ? h('div', {}, h('h2', { text: 'Armas' }), tablaArmas) : null,
      r.noArmas.lista.filter(x => x.p).length ? h('div', {}, h('h2', { text: 'Pericias sin arma' }), h('p', { class: 'p', text: r.noArmas.lista.filter(x => x.p).map(x => `${x.p.nombre}${x.objetivo === null ? '' : ' ' + x.objetivo}`).join(' · ') })) : null,
      (r.tecnicas.niveles.ladron || r.tecnicas.niveles.bardo) ? h('div', {}, h('h2', { text: 'Habilidades de bribón' }), h('p', { class: 'p', text: r.tecnicas.habilidades.map(x => `${x.nombre} ${x.total}%`).join(' · ') + (r.tecnicas.clase.ladron ? `  ·  Espalda ×${r.tecnicas.clase.ladron.espalda}, furtivo ${r.tecnicas.clase.ladron.furtivo}` : '') + (r.tecnicas.clase.bardo ? `  ·  Saber legendario ${r.tecnicas.clase.bardo.saber}%` : '') })) : null,
      r.tecnicas.barbaro ? h('div', {}, h('h2', { text: 'Habilidades de bárbaro' }), h('p', { class: 'p', text: r.tecnicas.barbaro.filas.map(f => `${f.nombre} ${f.total}`).join(' · ') })) : null,
      r.tecnicas.espadachin.nivel ? h('div', {}, h('h2', { text: 'Espadachín' }), h('p', { class: 'p', text: `Nivel ${r.tecnicas.espadachin.nivel} · MD ${r.tecnicas.espadachin.md >= 0 ? '+' : ''}${r.tecnicas.espadachin.md} · Touki ${r.tecnicas.espadachin.touki}${r.tecnicas.espadachin.activa ? '' : ' · INACTIVO (armadura pesada)'}` }),
        r.tecnicas.espadachin.adquiridas.length ? h('p', { class: 'p', text: r.tecnicas.espadachin.adquiridas.map(t => `${t.nombre} (${t.escuela}): ${t.efecto}`).join('  ·  ') }) : null) : null,
      (r.techno.nivel || r.techno.taller.length) ? h('div', {}, h('h2', { text: 'Techno' }),
        h('p', { class: 'p', text: `Nivel ${r.techno.nivel || '—'} · Cerraduras ${r.techno.cerraduras} · Trampas ${r.techno.trampas}` }),
        h('p', { class: 'p', text: r.techno.filas.map(f => `${f.nombre}: ${f.valor}${f.creaciones.length ? ' (' + f.creaciones.map(c => c.nombre).join(', ') + ')' : ''}`).join(' · ') }),
        r.techno.notas ? h('p', { class: 'p', text: r.techno.notas }) : null,
        r.techno.taller.map(x => h('p', { class: 'p' }, h('strong', { text: x.nombre + ': ' }), `${x.tipo}, nivel ${x.nivel || '—'}${x.dueno ? ', para ' + x.dueno : ''} · ${A.reglas.techno.linea(x) || x.resultado}${x.desc ? ' · ' + x.desc : ''}`))) : null,
      r.artes.artes.length ? h('div', {}, h('h2', { text: 'Artes marciales' }), r.artes.artes.map(a => a.faltante ? null : h('p', { class: 'p' }, h('strong', { text: a.nombre + ': ' }),
        `${a.atk} ataque(s)/round · daño ${a.dano} · CA ${U.signo(a.ac)} · RT ${a.rt}${a.movs.some(m => m.adquirido) ? ' · ' + a.movs.filter(m => m.adquirido).map(m => `${m.nombre} (${m.k})`).join(', ') : ''}`)),
        r.ca.artes.arte ? h('p', { class: 'p', text: `CA marcial ${U.signo(r.ca.artes.arte.valor)} (${r.ca.artes.arte.nombre}): ${r.ca.artes.arteActiva ? 'activa' : 'inactiva, ' + r.ca.artes.motivo}.` }) : null) : null,
      r.conjuros.mago.activo ? h('div', {}, h('h2', { text: 'Magia (mago)' }),
        h('p', { class: 'p', text: [`Nivel ${r.conjuros.mago.nivel || '—'}`, r.conjuros.mago.especialidad ? `${r.conjuros.mago.especialidad.nombreEspecialista} (${r.conjuros.mago.especialidad.nombre})` : 'generalista', r.conjuros.mago.modo === 'puntos' ? `puntos de conjuro ${r.conjuros.mago.puntos.restan}/${r.conjuros.mago.puntos.total}` : `espacios ${r.conjuros.mago.espacios.map((v, i) => v + r.conjuros.mago.extra[i]).join('/')}`].join(' · ') }),
        r.conjuros.mago.modo === 'memorizar' ? r.conjuros.mago.niveles.filter(n => n.preparados).map(n => h('p', { class: 'p' }, h('strong', { text: `Nivel ${n.n}: ` }), n.memorizados.map(x => x.sp.nombre + (x.inv ? ' (inv.)' : '') + (x.usado ? ' ✗' : '')).join(', '))) : null,
        r.conjuros.mago.libro.length ? h('p', { class: 'p', text: 'Libro: ' + r.conjuros.mago.libro.map(x => `${x.nombre} (${x.nv})`).join(', ') }) : null) : null,
      r.conjuros.hechicero.activo ? h('div', {}, h('h2', { text: 'Magia (hechicero)' }),
        h('p', { class: 'p', text: `Nivel ${r.conjuros.hechicero.nivel || '—'} · ${r.conjuros.hechicero.linaje ? 'linaje ' + r.conjuros.hechicero.linaje.nombre : 'sin linaje'} · puntos de conjuro ${r.conjuros.hechicero.puntos.restan}/${r.conjuros.hechicero.puntos.total}` }),
        r.conjuros.hechicero.habilidades.filter(x => x.activa).map(x => h('p', { class: 'p' }, h('strong', { text: x.nombre + ': ' }), x.texto)),
        r.conjuros.hechicero.niveles.filter(n => n.abierto).map(n => h('p', { class: 'p' }, h('strong', { text: `Nivel ${n.n}: ` }), n.destinados.concat(n.elegidos).map(x => x.sp.nombre + (x.inv ? ' (inv.)' : '')).join(', ')))) : null,
      r.psionica && r.psionica.activo && (r.psionica.psionico || r.psionica.ciencias.length || r.psionica.devociones.length || r.psionica.disciplinas.length) ? h('div', {}, h('h2', { text: 'Psiónica' }),
        h('p', { class: 'p', text: [`Nivel ${r.psionica.nivel || '—'}`, `PSP ${r.psionica.psp.restan}/${r.psionica.psp.total}`, r.psionica.disciplinas.length ? 'disciplinas: ' + r.psionica.disciplinas.map(d => d.nombre + (d.primaria ? ' (primaria)' : '')).join(', ') : null].filter(Boolean).join(' · ') }),
        r.psionica.ciencias.length ? h('p', { class: 'p' }, h('strong', { text: 'Ciencias: ' }), r.psionica.ciencias.map(p => `${p.nombre} (${p.faltante ? '—' : p.costo !== null && p.costo !== undefined ? p.costo : p.inicio}${p.objetivo ? ', ' + p.objetivo.valor : ''})`).join(', ')) : null,
        r.psionica.devociones.length ? h('p', { class: 'p' }, h('strong', { text: 'Devociones: ' }), r.psionica.devociones.map(p => `${p.nombre} (${p.faltante ? '—' : p.costo !== null && p.costo !== undefined ? p.costo : p.inicio}${p.objetivo ? ', ' + p.objetivo.valor : ''})`).join(', ')) : null,
        r.psionica.defensas.length ? h('p', { class: 'p', text: 'Modos defensivos: ' + r.psionica.defensas.map(d => d.nombre).join(', ') }) : null,
        r.psionica.activos.filter(a => !a.t).length ? h('p', { class: 'p', text: 'Manteniendo: ' + r.psionica.activos.filter(a => !a.t).map(a => `${a.poder.nombre} (${a.n}/${a.u})`).join(', ') }) : null,
        r.psionica.secuelas.filter(x => x.texto).length ? h('p', { class: 'p', text: 'Secuelas: ' + r.psionica.secuelas.filter(x => x.texto).map(x => x.texto).join('; ') }) : null,
        r.psionica.notas ? h('p', { class: 'p', text: r.psionica.notas }) : null) : null,
      equipoHoja(S),
      r.dotes && r.dotes.activo && (r.dotes.comprados.length || r.dotes.humano || r.dotes.nacimiento.some(f => f.fila)) ? h('div', {}, h('h2', { text: 'Dotes' }),
        r.dotes.nacimiento.filter(f => f.fila).length ? h('p', { class: 'p' }, h('strong', { text: 'Nacimiento: ' }), r.dotes.nacimiento.filter(f => f.fila).map(f => f.fila.nombre + (f.eleccion ? ` (${f.eleccion})` : '')).join(', ')) : null,
        r.dotes.humano ? h('p', { class: 'p' }, h('strong', { text: 'Humano: ' }), r.dotes.humano.nombre + (r.dotes.humano.eleccion ? ` (${r.dotes.humano.eleccion})` : '')) : null,
        r.dotes.comprados.length ? h('p', { class: 'p' }, h('strong', { text: `Dotes (${r.dotes.pd.gastados}/${r.dotes.pd.total} PD): ` }), r.dotes.comprados.map(d => d.nombre + (d.eleccion ? ` (${d.eleccion})` : '')).join(', ')) : null,
        r.dotes.divina.mito && r.dotes.tiene.divina ? h('p', { class: 'p', text: `Ascendencia Divina: ${r.dotes.divina.mito.nombre}${r.dotes.divina.dios ? ', ' + r.dotes.divina.dios : ''}${r.dotes.divina.nota ? ' — ' + r.dotes.divina.nota : ''}` }) : null,
        r.dotes.notas ? h('p', { class: 'p', text: r.dotes.notas }) : null) : null,
      r.psionica && r.psionica.talento.activo ? h('div', {}, h('h2', { text: 'Talento psiónico salvaje' }),
        h('p', { class: 'p', text: `Potencial ${r.psionica.talento.potencial.final}% · desde el nivel ${r.psionica.talento.nivelInicio} · PSP ${r.psionica.talento.pfp.restan}/${r.psionica.talento.pfp.max}` }),
        r.psionica.talento.poderes.length ? h('p', { class: 'p', text: r.psionica.talento.poderes.map(p => `${p.nombre}${p.objetivo ? ' (' + p.objetivo.valor + ')' : ''}`).join(', ') }) : null,
        r.psionica.talento.secuelas.filter(x => x.texto).length ? h('p', { class: 'p', text: 'Secuelas: ' + r.psionica.talento.secuelas.filter(x => x.texto).map(x => x.texto).join('; ') }) : null,
        r.psionica.talento.notas ? h('p', { class: 'p', text: r.psionica.talento.notas }) : null) : null,
      r.conjuros.brujo && r.conjuros.brujo.activo ? h('div', {}, h('h2', { text: 'Magia (brujo)' }),
        h('p', { class: 'p', text: [`Nivel ${r.conjuros.brujo.nivel || '—'}`, r.conjuros.brujo.pacto ? r.conjuros.brujo.pacto.nombre : 'sin pacto', `espacios ${r.conjuros.brujo.espacios.join('/').replace(/(\/0)+$/, '')}`, `puntos de pacto ${r.conjuros.brujo.puntos.restan}/${r.conjuros.brujo.puntos.total}`, `reacción CAR ${r.conjuros.brujo.ajuste >= 0 ? '+' : '−'}${Math.abs(r.conjuros.brujo.ajuste)}`].join(' · ') }),
        r.conjuros.brujo.tecnicas.filter(t => t.activa && (t.nombre || t.efecto)).map(t => h('p', { class: 'p' }, h('strong', { text: `${t.nombre} (${t.pasiva ? 'pasiva' : t.costo + ' pt'}): ` }), t.efecto)),
        r.conjuros.brujo.niveles.filter(n => n.preparados).map(n => h('p', { class: 'p' }, h('strong', { text: `Nivel ${n.n}: ` }), n.memorizados.map(q => q.sp.nombre + (q.inv ? ' (inv.)' : '') + (q.usado ? ' ✗' : '')).join(', '))),
        r.conjuros.brujo.conocidos.length ? h('p', { class: 'p', text: 'Concedidos: ' + r.conjuros.brujo.conocidos.map(q => `${q.nombre} (${q.nv})`).join(', ') }) : null,
        r.conjuros.brujo.favores.filter(f => !f.cumplido && f.texto).length ? h('p', { class: 'p', text: 'Favores pendientes: ' + r.conjuros.brujo.favores.filter(f => !f.cumplido && f.texto).map(f => f.texto).join('; ') }) : null,
        r.conjuros.brujo.notas ? h('p', { class: 'p', text: r.conjuros.brujo.notas }) : null) : null,
      Object.values(r.conjuros.clases).filter(x => x.activo).map(x => h('div', {}, h('h2', { text: 'Magia (' + x.nombre.toLowerCase() + ')' }),
        h('p', { class: 'p', text: [`Nivel ${x.nivel || '—'}`, x.modo === 'puntos' ? `puntos de conjuro ${x.puntos.restan}/${x.puntos.total}` : `espacios ${x.espacios.join('/').replace(/(\/0)+$/, '')}`, x.tipo === 'divino' ? 'esferas: ' + x.acceso.mayores.map(A.reglas.conjuros.nombreEsfera).concat(x.acceso.menores.map(e => A.reglas.conjuros.nombreEsfera(e) + ' (menor)')).join(', ') : ''].filter(Boolean).join(' · ') }),
        x.modo === 'memorizar' ? x.niveles.filter(n => n.preparados).map(n => h('p', { class: 'p' }, h('strong', { text: `Nivel ${n.n}: ` }), n.memorizados.map(q => q.sp.nombre + (q.inv ? ' (inv.)' : '') + (q.usado ? ' ✗' : '')).join(', '))) : null,
        x.libroPropio && x.libro.length ? h('p', { class: 'p', text: 'Libro: ' + x.libro.map(q => `${q.nombre} (${q.nv})`).join(', ') }) : null,
        x.notas ? h('p', { class: 'p', text: x.notas }) : null)),
      h('div', {}, h('h2', { text: 'Defensa' }), h('p', { class: 'p', text: [`CA ${r.ca.valor}`, `Dureza ${r.ca.dureza}`, `Toque ${r.ca.toque}`, `DES aplicada ${U.signo(r.ca.defensa)}`,
        ['torso', 'brazos', 'piernas'].map(k => r.ca.piezas.find(p => p.parte === k)).filter(p => p.armadura).map(p => `${{ torso: 'Peto', brazos: 'Brazos', piernas: 'Piernas' }[p.parte]}: ${p.armadura.nombre}${p.magico ? ' +' + p.magico : ''}`).join(', '),
        Object.values(pj.armadura.equipo).filter(q => q.nombre || q.ca || q.magico).map(q => `${q.nombre || 'Equipo'}${q.ca || q.magico ? ' (' + U.signo(q.ca + q.magico) + ')' : ''}`).join(', ')].filter(Boolean).join('  ·  ') })),
      raza && (raza.nota || (variante && variante.nota)) ? h('div', {}, h('h2', { text: 'Capacidades de raza' }), h('p', { class: 'p', text: [raza.nota, variante && variante.nota].filter(Boolean).join('\n') })) : null,
      r.items.some(x => x.clase.kit && (x.clase.kit.habilidades.length || x.clase.kit.nota)) ? h('div', {}, h('h2', { text: 'Kits' }),
        r.items.filter(x => x.clase.kit).map(x => h('p', { class: 'p' }, h('strong', { text: x.clase.kit.nombre + ': ' }), [x.clase.kit.nota, ...x.clase.kit.habilidades].filter(Boolean).join(' · ')))) : null,
      efectos.length ? h('div', {}, h('h2', { text: 'Bonos y efectos' }), h('p', { class: 'p', text: efectos.map(e => `${e.etiqueta}: ${A.OBJETIVOS[e.objetivo].split(' (')[0]} ${U.signo(e.valor)}`).join('  ·  ') })) : null,
      historiaHoja(S), companerosHoja(S),
      ...notas.map(k => h('div', {}, h('h2', { text: 'Notas de equipo' }), h('p', { class: 'p', text: pj.notas[k] }))));
    document.getElementById('hoja').replaceChildren(hoja);
  };
})(window.ADND);
