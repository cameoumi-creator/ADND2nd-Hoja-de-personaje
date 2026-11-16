/* Pestaña Historia (reemplaza a Notas): trasfondo del personaje. Todo es informativo; no cambia ningún número de la hoja.
   Retrato de cuerpo entero, datos de identidad, historia, objetivos, relaciones, hitos, crónica, reputación, secretos y notas. */
(function (A) {
  'use strict';
  const ui = A.ui, h = ui.h, H = () => A.HISTORIA;

  const fijar = (S, clave, v) => S.cambiar(pj => { pj.historia[clave] = v; });
  const texto = (S, clave, et, extra) => ui.campo(et, ui.texto(S.pj.historia[clave], v => fijar(S, clave, v), { 'data-foco': 'hi-' + clave, maxlength: 300 }), extra);
  const area = (S, clave, et, filas) => ui.campo(et, ui.area(S.pj.historia[clave], v => fijar(S, clave, v), { rows: filas || 4, 'data-foco': 'hi-' + clave }));

  /* Lista editable genérica. cols: [{ k, et, t: 'texto'|'area'|'sel'|'chk', ops, ancho }] */
  function lista(S, o) {
    const arr = S.pj.historia[o.clave];
    const set = (id, k, v) => S.cambiar(pj => { const it = pj.historia[o.clave].find(x => x.id === id); if (it) it[k] = v; });
    const mover = (i, d) => S.cambiar(pj => { const a = pj.historia[o.clave], j = i + d; if (j < 0 || j >= a.length) return; [a[i], a[j]] = [a[j], a[i]]; }, { estructura: true });
    const campo = (it, c) => {
      const f = `hi-${o.clave}-${it.id}-${c.k}`;
      if (c.t === 'sel') return ui.campo(c.et, ui.select(c.ops.map(x => ({ v: x, t: x })), it[c.k], v => set(it.id, c.k, v), { 'data-foco': f }));
      if (c.t === 'chk') return h('label', { class: 'check' }, h('input', { type: 'checkbox', checked: !!it[c.k], 'data-foco': f, onchange: e => set(it.id, c.k, e.target.checked) }), ' ' + c.et);
      if (c.t === 'area') return ui.campo(c.et, ui.area(it[c.k], v => set(it.id, c.k, v), { rows: c.filas || 3, 'data-foco': f }), 'ancho-todo');
      return ui.campo(c.et, ui.texto(it[c.k], v => set(it.id, c.k, v), { 'data-foco': f, maxlength: 300 }));
    };
    return ui.bloque(o.titulo, o.ayuda ? h('p', { class: 'ayuda', text: o.ayuda }) : null,
      arr.length ? arr.map((it, i) => h('div', { class: 'hi-fila' },
        h('div', { class: 'rejilla g3' }, o.cols.map(c => campo(it, c))),
        o.extra ? o.extra(it, set) : null,
        h('div', { class: 'hi-cab' },
          ui.boton('↑', () => mover(i, -1), 'chico', { 'aria-label': 'Subir', 'data-foco': `hi-${o.clave}-${it.id}-up` }),
          ui.boton('↓', () => mover(i, 1), 'chico', { 'aria-label': 'Bajar', 'data-foco': `hi-${o.clave}-${it.id}-dn` }),
          ui.boton('Eliminar', () => S.cambiar(pj => { pj.historia[o.clave] = pj.historia[o.clave].filter(x => x.id !== it.id); }, { estructura: true }), 'chico peligro', { 'data-foco': `hi-${o.clave}-${it.id}-del` })))) : h('p', { class: 'vacio', text: o.vacio }),
      ui.boton(o.nuevo, () => S.cambiar(pj => { pj.historia[o.clave].push(Object.assign({ id: 'h' + A.util.uid() + A.util.uid() }, o.def)); }, { estructura: true }), 'chico', { 'data-foco': 'hi-nuevo-' + o.clave }));
  }

  ui.paneles.historia = S => {
    const pj = S.pj, Hh = H();
    const cuerpo = ui.bloque('Imagen de cuerpo entero',
      ui.imagenCampo(S, { valor: pj.imagenes.cuerpo, alCambiar: v => S.cambiar(p => { p.imagenes.cuerpo = v; }, { estructura: true }), max: 500, titulo: 'Cuerpo entero', foco: 'img-cuerpo', forma: 'cuerpo' }),
      h('p', { class: 'ayuda', text: 'Sale en la hoja impresa junto al equipo. El retrato de busto se pone en la pestaña Ficha.' }));
    const datos = ui.bloque('Trasfondo',
      h('div', { class: 'rejilla g3' }, texto(S, 'titulo', 'Título / apodo'), texto(S, 'origen', 'Lugar de origen'), texto(S, 'estatus', 'Estatus social'), texto(S, 'afiliacion', 'Afiliación'), texto(S, 'profesion', 'Profesión / título'), texto(S, 'lema', 'Lema / frase')),
      h('div', { class: 'rejilla g3' }, area(S, 'motivacion', 'Motivación', 3), area(S, 'temor', 'Temor / debilidad', 3), area(S, 'ideales', 'Ideales / creencias', 3)));
    const hist = ui.bloque('Historia de origen', ui.area(pj.notas.historia, v => S.cambiar(p => { p.notas.historia = v; }), { rows: 10, class: 'libreta', 'data-foco': 'nota-historia', 'aria-label': 'Historia de origen' }));
    const pers = ui.bloque('Personalidad y apariencia',
      area(S, 'rasgos', 'Rasgos / personalidad', 4),
      ui.campo('Apariencia (la misma de la pestaña Ficha)', ui.area(pj.identidad.apariencia, v => S.cambiar(p => { p.identidad.apariencia = v; }), { rows: 4, 'data-foco': 'hi-apariencia' })));
    const objetivos = lista(S, { clave: 'objetivos', titulo: 'Objetivos', ayuda: 'Objetivos narrativos ilimitados; cambia su estado conforme avance la campaña.', vacio: 'Sin objetivos.', nuevo: 'Agregar objetivo',
      def: { nombre: '', estado: 'Activo', notas: '' }, cols: [{ k: 'nombre', et: 'Objetivo' }, { k: 'estado', et: 'Estado', t: 'sel', ops: Hh.estadosObjetivo }, { k: 'notas', et: 'Notas' }] });
    const relaciones = lista(S, { clave: 'relaciones', titulo: 'Relaciones', ayuda: 'Aliados, rivales y demás. Una relación puede tener varias etiquetas a la vez.', vacio: 'Sin relaciones.', nuevo: 'Agregar relación',
      def: { nombre: '', vinculo: '', actitud: '', estado: 'Vivo / activo', org: '', notas: '', etiquetas: [] },
      cols: [{ k: 'nombre', et: 'Nombre' }, { k: 'vinculo', et: 'Relación / vínculo' }, { k: 'actitud', et: 'Actitud' }, { k: 'estado', et: 'Estado', t: 'sel', ops: Hh.estadosRelacion }, { k: 'org', et: 'Organización / ubicación' }, { k: 'notas', et: 'Notas' }],
      extra: (it, set) => h('div', { class: 'hi-etq', role: 'group', 'aria-label': 'Etiquetas' }, Hh.etiquetas.map(e => h('label', {}, h('input', { type: 'checkbox', checked: it.etiquetas.includes(e), 'data-foco': `hi-relaciones-${it.id}-e-${e}`,
        onchange: ev => S.cambiar(p => { const r = p.historia.relaciones.find(x => x.id === it.id); if (r) r.etiquetas = ev.target.checked ? [...new Set([...r.etiquetas, e])] : r.etiquetas.filter(x => x !== e); }) }), ' ' + e))) });
    const hitos = lista(S, { clave: 'hitos', titulo: 'Hitos de campaña', ayuda: 'Lista ilimitada. Se pueden reordenar sin perder información.', vacio: 'Sin hitos.', nuevo: 'Agregar hito',
      def: { fecha: '', titulo: '', lugar: '', tipo: 'Hazaña', desc: '' }, cols: [{ k: 'fecha', et: 'Fecha / sesión' }, { k: 'titulo', et: 'Título' }, { k: 'lugar', et: 'Lugar' }, { k: 'tipo', et: 'Tipo', t: 'sel', ops: Hh.tiposHito }, { k: 'desc', et: 'Descripción', t: 'area' }] });
    const cronica = lista(S, { clave: 'cronica', titulo: 'Crónica de aventuras', vacio: 'Sin entradas.', nuevo: 'Agregar entrada', def: { fecha: '', titulo: '', lugar: '', texto: '' },
      cols: [{ k: 'fecha', et: 'Fecha / sesión' }, { k: 'titulo', et: 'Título' }, { k: 'lugar', et: 'Lugar' }, { k: 'texto', et: 'Entrada', t: 'area', filas: 5 }] });
    const reputacion = lista(S, { clave: 'reputacion', titulo: 'Reputación y títulos', vacio: 'Sin reputación anotada.', nuevo: 'Agregar reputación', def: { nombre: '', quien: '', lugar: '', notas: '' },
      cols: [{ k: 'nombre', et: 'Nombre / título' }, { k: 'quien', et: 'Quién lo reconoce' }, { k: 'lugar', et: 'Lugar / facción' }, { k: 'notas', et: 'Notas' }] });
    const secretos = lista(S, { clave: 'secretos', titulo: 'Secretos y conocimiento', ayuda: 'Lo marcado como público puede imprimirse; el resto nunca sale en la hoja impresa.', vacio: 'Sin secretos ni conocimiento anotado.', nuevo: 'Agregar secreto / conocimiento',
      def: { tipo: 'Secreto del personaje', info: '', publico: false, notas: '' }, cols: [{ k: 'tipo', et: 'Tipo', t: 'sel', ops: Hh.tiposSecreto }, { k: 'publico', et: 'Público', t: 'chk' }, { k: 'info', et: 'Información', t: 'area' }, { k: 'notas', et: 'Notas' }] });
    const jugador = ui.bloque('Notas del jugador', ui.area(pj.notas.general, v => S.cambiar(p => { p.notas.general = v; }), { rows: 10, class: 'libreta', 'data-foco': 'nota-general', 'aria-label': 'Notas del jugador' }));
    const viejo = pj.notas.equipo.trim() ? ui.bloque('Notas de equipo (de la versión anterior)', h('p', { class: 'ayuda', text: 'Esta libreta ya no tiene pestaña propia: el equipo se lleva en Equipo. Aquí se conserva lo que escribiste.' }),
      ui.area(pj.notas.equipo, v => S.cambiar(p => { p.notas.equipo = v; }), { rows: 6, class: 'libreta', 'data-foco': 'nota-equipo', 'aria-label': 'Notas de equipo' })) : null;
    [datos, objetivos, relaciones, hitos, cronica, reputacion, secretos, viejo].forEach(b => { if (b) b.classList.add('ancho-todo'); });
    return h('div', { class: 'historia hi-rejilla' }, cuerpo, pers, hist, jugador, datos, objetivos, relaciones, hitos, cronica, reputacion, secretos, viejo);
  };
})(window.ADND);
