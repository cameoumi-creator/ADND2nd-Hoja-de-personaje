/* Utilidades de DOM sin dependencias. Todo el texto entra por textContent (nunca innerHTML),
   así que lo que escriba el usuario o traiga un paquete importado no puede inyectar HTML. */
(function (A) {
  'use strict';
  const ui = A.ui;
  ui.paneles = ui.paneles || {};   // cada pestaña se registra aquí (js/ui/p-*.js)

  ui.h = function h(tag, props, ...hijos) {
    const el = document.createElement(tag);
    let valor;
    for (const [k, v] of Object.entries(props || {})) {
      if (v === null || v === undefined || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k === 'text') el.textContent = v;
      else if (k === 'value') valor = v;
      else if (k === 'checked') el.checked = !!v;
      else if (k === 'dataset') Object.assign(el.dataset, v);
      else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
      else el.setAttribute(k, v === true ? '' : v);
    }
    hijos.flat(Infinity).forEach(c => { if (c !== null && c !== undefined && c !== false) el.append(c.nodeType ? c : document.createTextNode(String(c))); });
    if (valor !== undefined) el.value = valor;   // después de crear las <option>
    return el;
  };
  const h = ui.h;

  /* opciones: [{v,t}] o [{grupo, items:[{v,t}]}] */
  ui.select = function (opciones, valor, alCambiar, props) {
    const op = o => h('option', { value: o.v, text: o.t });
    const s = h('select', Object.assign({}, props, { onchange: e => alCambiar && alCambiar(e.target.value) }),
      opciones.map(o => (o.grupo ? h('optgroup', { label: o.grupo }, o.items.map(op)) : op(o))));
    s.value = valor;
    if (s.value !== String(valor) && opciones.length) { /* valor que ya no existe: se muestra vacío */ }
    return s;
  };

  ui.texto = (valor, alCambiar, props) => h('input', Object.assign({ type: 'text', value: valor, oninput: e => alCambiar(e.target.value) }, props));
  ui.numero = (valor, alCambiar, props) => h('input', Object.assign({ type: 'number', value: valor, inputmode: 'numeric', oninput: e => alCambiar(e.target.value) }, props));
  ui.area = (valor, alCambiar, props) => h('textarea', Object.assign({ value: valor, oninput: e => alCambiar(e.target.value) }, props));

  ui.campo = (etiqueta, control, extra) => h('label', { class: 'campo' + (extra ? ' ' + extra : '') }, h('span', { class: 'campo-et', text: etiqueta }), control);

  ui.boton = (texto, alClick, clase, props) => h('button', Object.assign({ type: 'button', class: 'btn' + (clase ? ' ' + clase : ''), text: texto, onclick: alClick }, props));

  ui.bloque = (titulo, ...contenido) => h('section', { class: 'bloque' }, h('h2', { text: titulo }), contenido);

  /* Reconciliación por clave: reutiliza nodos existentes (conserva el foco al teclear) en vez de reconstruir. */
  ui.sincronizar = function (contenedor, items, clave, crear, actualizar) {
    const previos = new Map();
    [...contenedor.children].forEach(c => previos.set(c.dataset.clave, c));
    const usados = new Set();
    items.forEach((it, i) => {
      const k = String(clave(it));
      let nodo = previos.get(k);
      if (!nodo) { nodo = crear(it); nodo.dataset.clave = k; }
      actualizar(nodo, it);
      if (contenedor.children[i] !== nodo) contenedor.insertBefore(nodo, contenedor.children[i] || null);
      usados.add(k);
    });
    previos.forEach((n, k) => { if (!usados.has(k)) n.remove(); });
  };

  /* Línea de desglose: "Raza Elfo +1 · Kit Berserker −1" */
  ui.desglose = function (partes) {
    return partes.map(p => p.texto).join('  ·  ');
  };
})(window.ADND);
