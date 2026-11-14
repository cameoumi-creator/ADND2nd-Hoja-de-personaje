/* Selector de imagen reutilizable: archivo local (se reduce al subirlo) o URL. Se guarda dentro del personaje.
   opciones: { valor, alCambiar(url), max (lado máximo en px), limite (caracteres), titulo, foco, forma ('retrato' | 'cuerpo' | 'chica') } */
(function (A) {
  'use strict';
  const ui = A.ui, h = ui.h;

  /* Reduce a `max` px de lado y baja la calidad hasta que el resultado cabe en `limite` caracteres. */
  ui.reducirImagen = (archivo, max, limite, alTerminar) => {
    const lector = new FileReader();
    lector.onload = () => {
      const img = new Image();
      img.onload = () => {
        const f = Math.min(1, max / Math.max(img.width, img.height)), c = document.createElement('canvas');
        c.width = Math.max(1, Math.round(img.width * f)); c.height = Math.max(1, Math.round(img.height * f));
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        let url = '';
        for (const q of [0.85, 0.7, 0.55, 0.4]) {
          url = c.toDataURL('image/webp', q); if (!/^data:image\/webp/.test(url)) url = c.toDataURL('image/jpeg', q);
          if (url.length < limite) break;
        }
        alTerminar(A.imagenSegura(url, limite) ? url : '');
      };
      img.onerror = () => alTerminar(''); img.src = String(lector.result);
    };
    lector.onerror = () => alTerminar(''); lector.readAsDataURL(archivo);
  };

  ui.imagenCampo = (S, o) => {
    const max = o.max || 500, limite = o.limite || A.IMG_PJ, forma = o.forma || 'retrato', f = o.foco || 'img';
    const esLocal = (o.valor || '').startsWith('data:');
    let url = esLocal ? '' : (o.valor || '');
    const prev = h('div', { class: 'im-prev im-' + forma }, o.valor
      ? h('img', { src: o.valor, alt: o.titulo || 'Imagen', referrerpolicy: 'no-referrer', onerror: ev => { ev.target.replaceWith(h('span', { class: 'meta', text: 'No se pudo cargar la imagen.' })); } })
      : h('span', { class: 'meta', text: 'Sin imagen' }));
    const archivo = h('input', { type: 'file', accept: 'image/*', class: 'sr', id: 'file-' + f, 'data-foco': f + '-file', 'aria-label': (o.titulo || 'Imagen') + ': archivo local',
      onchange: e => { const a = e.target.files[0]; if (a) ui.reducirImagen(a, max, limite, v => { if (!v) S.aviso('No pude leer la imagen (usa PNG, JPG o WebP).', true); else o.alCambiar(v); }); } });
    const ctrl = h('div', { class: 'im-ctrl' },
      h('label', { class: 'btn chico', for: 'file-' + f, text: o.valor ? 'Cambiar archivo' : 'Subir archivo' }), archivo,
      h('div', { class: 'im-url' }, ui.texto(url, v => { url = v; }, { placeholder: 'o pega una URL https://…', 'aria-label': (o.titulo || 'Imagen') + ': URL', 'data-foco': f + '-url' }),
        ui.boton('Usar URL', () => { const v = A.imagenSegura(url, limite); if (!v || v.startsWith('data:')) { S.aviso('La URL debe empezar con http:// o https://.', true); return; } o.alCambiar(v); }, 'chico', { 'data-foco': f + '-usar' })),
      o.valor ? ui.boton('Quitar', () => o.alCambiar(''), 'chico peligro', { 'data-foco': f + '-quitar' }) : null,
      h('p', { class: 'meta', text: `Se reduce a ${max} px de lado y se guarda en el personaje. Con URL, la imagen vive fuera y puede desaparecer.` }));
    return h('div', { class: 'im-campo' }, prev, ctrl);
  };
})(window.ADND);
