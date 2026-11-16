/* Controlador: estado de la sesión, render por pestañas, guardado automático, archivos. */
(function (A) {
  'use strict';
  const ui = A.ui, U = A.util, h = ui.h;
  ui.paneles = ui.paneles || {};

  const S = (ui.S = { pj: null, hb: null, reg: null, r: null, pestana: 'ficha', enlaces: [], globales: [], temporizador: null });
  const PESTANAS = [['ficha', 'Ficha'], ['progresion', 'Progresión'], ['combate', 'Combate'], ['armas', 'Armas'], ['armadura', 'Armadura'], ['equipo', 'Equipo'], ['tienda', 'Tienda'], ['pericias', 'Pericias'], ['tecnicas', 'Técnicas'], ['conjuros', 'Poderes'], ['dotes', 'Dotes'], ['companeros', 'Compañeros'], ['historia', 'Historia'], ['consulta', 'Consulta'], ['homebrew', 'Homebrew']];
  const $ = id => document.getElementById(id);
  /* La pestaña Dotes es una regla opcional: solo existe si el personaje la tiene encendida. */
  const visibles = () => PESTANAS.filter(([id]) => id !== 'dotes' || (S.pj && S.pj.dotes && S.pj.dotes.activo));
  let pestanasClave = '';

  /* ---------------------------------------------------------------- cálculo */
  S.recalcular = () => { S.reg = A.crearRegistro(S.hb); if (A.reglas.artes) A.reglas.artes.sincronizar(S.pj, S.reg); S.r = A.reglas.resumen(S.pj, S.reg); };
  S.refrescar = () => {
    [...S.globales, ...S.enlaces].forEach(f => { try { f(S.r, S.reg, S.pj); } catch (e) { console.error('Enlace con error:', e); } });
  };
  /* estructura:true reconstruye el panel (cuando cambian filas, opciones o secciones);
     si no, solo se actualizan los números enlazados y el foco no se pierde al teclear. */
  S.cambiar = function (fn, opc) {
    fn(S.pj); S.recalcular();
    if (opc && opc.estructura) S.render(); else S.refrescar();
    programarGuardado();
  };
  S.cambiarHb = function (fn, opc) {
    fn(S.hb); A.almacen.guardarHb(S.hb); S.recalcular();
    if (opc && opc.sinRender) S.refrescar(); else S.render();
    programarGuardado();
  };

  /* ---------------------------------------------------------------- guardado */
  function estado(texto, aviso) {
    const e = $('estado'); if (!e) return;
    e.textContent = texto; e.classList.toggle('aviso', !!aviso);
    clearTimeout(estado.t); if (!aviso) estado.t = setTimeout(() => { e.textContent = ''; }, 3500);
  }
  S.aviso = estado;
  function programarGuardado() {
    clearTimeout(S.temporizador);
    S.temporizador = setTimeout(guardarYa, 350);
  }
  function guardarYa() {
    A.almacen.guardar(S.pj);
    if (!A.almacen.persistente) estado('Este navegador no permite guardar solo: usa Exportar para no perder el personaje.', true);
    else estado('Guardado a las ' + new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }));
    actualizarLista();
  }
  window.addEventListener('beforeunload', () => { if (S.pj) A.almacen.guardar(S.pj); });

  /* ------------------------------------------------------------ personajes */
  function cargarPersonaje(pj) {
    S.pj = pj; A.almacen.fijarActual(pj.id); S.recalcular(); S.render(); actualizarLista();
  }
  function nuevo() { const pj = A.nuevoPersonaje(); A.almacen.guardar(pj); cargarPersonaje(pj); estado('Personaje nuevo.'); }
  function duplicar() {
    const c = U.clon(S.pj); c.id = 'pj-' + U.uid() + U.uid(); c.identidad.nombre = (c.identidad.nombre || 'Sin nombre') + ' (copia)';
    A.almacen.guardar(c); cargarPersonaje(c); estado('Copia creada.');
  }
  function eliminar() {
    const nombre = S.pj.identidad.nombre || 'Sin nombre';
    if (!confirm(`¿Eliminar a "${nombre}"? No se puede deshacer. Exporta antes si quieres conservarlo.`)) return;
    A.almacen.borrar(S.pj.id);
    const l = A.almacen.lista();
    if (l.length) cargarPersonaje(A.almacen.cargar(l[0].id)); else nuevo();
    estado(`"${nombre}" eliminado.`);
  }

  /* --------------------------------------------------------------- archivos */
  function descargar(nombre, obj) {
    const url = URL.createObjectURL(new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' }));
    const a = h('a', { href: url, download: nombre }); document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }
  S.descargar = descargar;
  function exportar() {
    guardarYa();
    descargar((U.slug(S.pj.identidad.nombre) || 'personaje') + '.ficha.json', A.exportarPersonaje(S.pj, S.hb));
    estado('Archivo exportado.');
  }
  S.importarTexto = function (texto) {
    let obj; try { obj = JSON.parse(texto); } catch (e) { throw new Error('El archivo no es JSON válido.'); }
    const lec = A.leerArchivo(obj);
    const res = A.fusionarHb(S.hb, lec.homebrew);
    A.almacen.guardarHb(S.hb);
    if (lec.tipo === 'paquete') {
      S.recalcular(); S.render();
      return `Paquete importado: ${res.agregados} elementos nuevos${res.repetidos ? `, ${res.repetidos} ya existían` : ''}.`;
    }
    const pj = lec.personaje;
    if (A.almacen.lista().some(x => x.id === pj.id)) { pj.id = 'pj-' + U.uid() + U.uid(); pj.identidad.nombre += ' (importado)'; }
    A.almacen.guardar(pj); cargarPersonaje(pj);
    return [`"${pj.identidad.nombre || 'Sin nombre'}" importado.`, res.agregados ? `${res.agregados} elementos homebrew añadidos.` : '', ...lec.avisos].filter(Boolean).join(' ');
  };
  function importar() {
    const f = h('input', { type: 'file', accept: '.json,application/json' });
    f.addEventListener('change', () => {
      const archivo = f.files[0]; if (!archivo) return;
      const r = new FileReader();
      r.onload = () => { try { estado(S.importarTexto(String(r.result)), false); } catch (e) { estado(e.message, true); } };
      r.readAsText(archivo);
    });
    f.click();
  }

  /* --------------------------------------------------------------- tema */
  const TEMAS = [['pergamino', 'Pergamino oscuro', '#14100C'], ['papel', 'Papel', '#EDF0EA'], ['pizarra', 'Pizarra', '#10181C'], ['contraste', 'Alto contraste', '#000000']];
  function aplicarTema(t) { document.documentElement.dataset.tema = t; const m = document.querySelector('meta[name="theme-color"]'); const x = TEMAS.find(q => q[0] === t); if (m && x) m.content = x[2]; }
  function temaInicial() {
    const p = A.almacen.pref('tema', null);
    if (p === 'plano') return 'pizarra';                       // el tema oscuro anterior
    if (TEMAS.some(q => q[0] === p)) return p;
    return 'pergamino';
  }

  /* ---------------------------------------------------------------- cabecera */
  function actualizarLista() {
    const s = $('lista-personajes'); if (!s) return;
    const l = A.almacen.lista();
    s.replaceChildren(...l.map(x => h('option', { value: x.id, text: x.nombre })));
    s.value = S.pj.id;
  }
  function construirCabecera() {
    const cab = $('cabecera');
    // En pantallas chicas el menú de personajes y archivo va plegado para no tapar el contenido.
    const menu = h('details', { class: 'menu' },
      h('summary', { text: 'Personajes y archivo' }),
      h('div', { class: 'menu-cont' },
        h('div', { class: 'cab-pj' },
          h('label', { class: 'sr', for: 'lista-personajes', text: 'Personaje' }),
          h('select', { id: 'lista-personajes', onchange: e => { const id = e.target.value; guardarYa(); const pj = A.almacen.cargar(id); if (pj) cargarPersonaje(pj); } })),
        h('div', { class: 'cab-acciones' },
          ui.boton('Nuevo', nuevo), ui.boton('Duplicar', duplicar), ui.boton('Eliminar', eliminar, 'peligro'),
          h('span', { class: 'sep' }),
          ui.boton('Importar', importar), ui.boton('Exportar', exportar), ui.boton('Imprimir', () => ui.dialogoImpresion(S), 'primario'))));
    cab.replaceChildren(
      h('div', { class: 'marca' }, h('span', { class: 'marca-t', text: 'Ficha de campaña' }), h('span', { class: 'marca-s', text: 'AD&D 2.5' })),
      h('label', { class: 'campo tema' }, h('span', { class: 'sr', text: 'Tema' }),
        ui.select(TEMAS.map(q => ({ v: q[0], t: q[1] })), document.documentElement.dataset.tema, t => { aplicarTema(t); A.almacen.fijarPref('tema', t); }, { 'aria-label': 'Tema' })),
      h('div', { id: 'retrato-lateral', hidden: true }),
      menu);
    const ancho = window.matchMedia('(min-width: 721px)');
    const sync = () => { menu.open = ancho.matches; };
    sync(); ancho.addEventListener('change', sync);
    actualizarLista();
  }

  /* ---------------------------------------------------------------- resumen */
  function construirResumen() {
    const cont = $('resumen');
    const dato = (etiqueta, id, clase, titulo) => h('div', { class: 'dato ' + (clase || ''), title: titulo || null }, h('span', { class: 'dato-et', text: etiqueta }), h('strong', { class: 'dato-v', id }));
    cont.replaceChildren(
      h('div', { class: 'resumen-id' }, h('strong', { id: 'r-nombre' }), h('span', { id: 'r-sub' })),
      h('div', { class: 'resumen-datos' },
        dato('Nivel', 'r-nivel'), dato('THAC0', 'r-thaco', 'grande', 'Se suma el dado a este número: lo que necesitas para golpear CA 0'),
        dato('CA', 'r-ca', 'grande', 'Clase de armadura sin armadura'), dato('PG', 'r-pg', 'grande'),
        h('span', { class: 'sep-v' }),
        ...A.SAVES.map(s => dato(s, 'r-' + s, 'salv', A.SAVE_NOMBRES[s]))));
    S.globales = [(r, reg, pj) => {
      $('r-nombre').textContent = pj.identidad.nombre || 'Sin nombre';
      const raza = reg.raza(pj.raza.id);
      // En clase única solo cuenta la primera clase: no se listan las demás filas.
      const clases = (pj.trayectoria === 'unica' ? r.gob : r.items).map(x => `${x.clase.nombre} ${x.nivel}`).join(pj.trayectoria === 'multi' ? ' / ' : ' → ');
      $('r-sub').textContent = [raza ? raza.nombre : '', clases].filter(Boolean).join(', ') || 'Sin raza ni clase';
      $('r-nivel').textContent = r.nivel; $('r-thaco').textContent = r.thaco.valor; $('r-ca').textContent = r.ca.valor; $('r-pg').textContent = r.pg.max;
      r.salvaciones.forEach(s => { $('r-' + s.id).textContent = s.valor; });
      const rl = $('retrato-lateral'), src = pj.imagenes.retrato;
      if (rl && rl.dataset.src !== src) { rl.dataset.src = src; rl.hidden = !src; rl.replaceChildren(...(src ? [h('img', { src, alt: 'Retrato de ' + (pj.identidad.nombre || 'el personaje'), referrerpolicy: 'no-referrer', onerror: e => { rl.hidden = true; e.target.remove(); } })] : [])); }
      document.title = (pj.identidad.nombre || 'Ficha') + ' · Ficha AD&D 2.5';
      const av = $('avisos'); av.replaceChildren(...r.avisos.map(a => h('li', { text: a }))); av.hidden = !r.avisos.length;
    }];
  }

  /* -------------------------------------------------------------- pestañas */
  function construirPestanas() {
    pestanasClave = visibles().map(x => x[0]).join();
    $('pestanas').replaceChildren(...visibles().map(([id, t]) => h('button', {
      type: 'button', role: 'tab', id: 'tab-' + id, class: 'pestana', 'aria-controls': 'panel', text: t,
      onclick: () => { S.pestana = id; A.almacen.fijarPref('pestana', id); S.render(); window.scrollTo({ top: 0 }); }
    })));
  }
  function actualizarPestanas() {
    visibles().forEach(([id]) => { const b = $('tab-' + id); b.setAttribute('aria-selected', String(id === S.pestana)); b.tabIndex = id === S.pestana ? 0 : -1; });
    const sel = $('tab-' + S.pestana); if (sel && sel.scrollIntoView) sel.scrollIntoView({ inline: 'nearest', block: 'nearest' });
    $('panel').setAttribute('aria-labelledby', 'tab-' + S.pestana);
  }

  /* El foco se conserva al reconstruir: cada control editable lleva data-foco con su identidad. */
  S.render = function () {
    if (!visibles().some(x => x[0] === S.pestana)) S.pestana = 'ficha';
    if (visibles().map(x => x[0]).join() !== pestanasClave) construirPestanas();
    const act = document.activeElement, clave = act && act.dataset ? act.dataset.foco : null;
    const pos = act && typeof act.selectionStart === 'number' ? [act.selectionStart, act.selectionEnd] : null;
    const y = window.scrollY;
    S.enlaces = [];
    const panel = $('panel');
    panel.replaceChildren(ui.paneles[S.pestana](S));
    actualizarPestanas();
    S.refrescar();
    window.scrollTo({ top: y });
    if (clave) {
      const n = panel.querySelector(`[data-foco="${CSS.escape(clave)}"]`);
      if (n) { n.focus({ preventScroll: true }); if (pos && typeof n.setSelectionRange === 'function') try { n.setSelectionRange(pos[0], pos[1]); } catch (e) { /* tipos sin selección */ } }
    }
  };

  /* ------------------------------------------------------------------ inicio */
  function init() {
    aplicarTema(temaInicial());
    S.hb = A.almacen.cargarHb();
    let pj = null; const id = A.almacen.actualId();
    if (id) pj = A.almacen.cargar(id);
    if (!pj) { const l = A.almacen.lista(); if (l.length) pj = A.almacen.cargar(l[0].id); }
    if (!pj) { pj = A.nuevoPersonaje(); A.almacen.guardar(pj); }
    A.almacen.fijarActual(pj.id); S.pj = pj;
    const p0 = A.almacen.pref('pestana', 'ficha'), p = p0 === 'notas' ? 'historia' : p0; S.pestana = PESTANAS.some(x => x[0] === p) ? p : 'ficha';
    construirCabecera(); construirResumen(); construirPestanas();
    S.recalcular(); S.render();
    if (!A.almacen.persistente) estado('Este navegador no permite guardar solo: usa Exportar para no perder el personaje.', true);
    window.addEventListener('beforeprint', () => ui.hoja && ui.hoja(S));
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})(window.ADND);
