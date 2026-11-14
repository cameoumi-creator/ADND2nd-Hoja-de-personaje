/* Taller del Techno: fabrica armas, armaduras, armas de área, monturas y otros objetos; se comparten por Homebrew. */
(function (A) {
  'use strict';
  const ui = A.ui, h = ui.h, U = A.util;
  const TH = () => A.reglas.techno;
  const clon = o => JSON.parse(JSON.stringify(o));
  let borrador = null;

  const nuevo = (nivel, tipo) => {
    const b = { id: null, nombre: '', tipo: tipo || 'Arma melee', dueno: '', desc: '', img: '', arma: ui.hb.plantillaArma(), armadura: ui.hb.plantillaArmadura(), area: TH().area0(nivel), montura: TH().montura0(nivel) };
    b.arma.tipo = b.tipo === 'Arma distancia' ? 'distancia' : 'cuerpo';
    return b;
  };

  function reducirImagen(archivo, alTerminar) {
    const lector = new FileReader();
    lector.onload = () => {
      const img = new Image();
      img.onload = () => {
        const f = Math.min(1, 192 / Math.max(img.width, img.height)), c = document.createElement('canvas');
        c.width = Math.max(1, Math.round(img.width * f)); c.height = Math.max(1, Math.round(img.height * f));
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        let url = c.toDataURL('image/webp', 0.8); if (!/^data:image\/webp/.test(url)) url = c.toDataURL('image/jpeg', 0.8);
        alTerminar(A.imagenSegura(url) ? url : '');
      };
      img.onerror = () => alTerminar(''); img.src = String(lector.result);
    };
    lector.onerror = () => alTerminar(''); lector.readAsDataURL(archivo);
  }

  function hacer(S, fn) { let msg = null; S.cambiar(pj => { msg = fn(pj); }, { estructura: true }); if (msg) S.aviso(msg, true); return !msg; }

  function techno(S) {
    const t = S.r.techno, T = S.pj.tecnicas.techno, lv = t.nivel;
    if (!lv && !t.taller.length && !S.reg.creaciones.length) return ui.bloque('Habilidades de Techno', h('p', { class: 'vacio', text: 'No tienes la clase Techno. Estas capacidades se calculan con su nivel.' }));
    if (!borrador) borrador = nuevo(lv);
    const b = borrador, edita = !!b.id, esArma = TH().esArma(b.tipo);
    const cap = TH().capacidad(b.tipo, lv);

    const resumen = ui.bloque('Habilidades de Techno',
      h('p', { class: 'ayuda', text: 'El Techno fabrica objetos propios. El bono de RT es parte de cada arma (se suma siempre) y el bono de armadura se suma a la protección de cada armadura fabricada; por eso no son creaciones aparte.' }),
      h('div', { class: 'armas-resumen' },
        h('div', {}, h('strong', { class: 'cifra', text: lv || '—' }), h('span', { text: 'Nivel de Techno' })),
        h('div', {}, h('strong', { class: 'cifra', text: t.cerraduras }), h('span', { text: 'Abrir cerraduras (base)' })),
        h('div', {}, h('strong', { class: 'cifra', text: t.trampas }), h('span', { text: 'Detectar/retirar trampas (base)' }))),
      h('div', { class: 'tabla-scroll' }, h('table', { class: 'tabla equipo' },
        h('thead', {}, h('tr', {}, ['Facultad', 'Valor', 'Qué hace', 'Tus creaciones'].map(x => h('th', { scope: 'col', text: x })))),
        h('tbody', {}, t.filas.map(f => h('tr', {}, h('th', { scope: 'row', text: f.nombre }), h('td', {}, h('strong', { text: f.valor })), h('td', { class: 'meta', text: f.nota }),
          h('td', {}, f.creaciones.length ? f.creaciones.map(c => h('div', {}, h('strong', { text: c.nombre }), ' · ' + c.resultado)) : h('span', { class: 'meta', text: 'Sin creaciones' }))))))),
      t.elementos.length ? h('p', { class: 'meta', text: 'Elementos de área: ' + t.elementos.map(e => `${e.nombre} (${A.reglas.techno.textoArea(e.lado)}, salv. ${e.salv})`).join(' · ') }) : h('p', { class: 'meta', text: `Las armas de área se desbloquean en el nivel ${t.nivelArea}; un elemento nuevo cada 3 niveles.` }),
      ui.campo('Notas de taller', ui.area(T.notas, v => S.cambiar(pj => TH().acc.notas(pj, v)), { rows: 3, placeholder: 'Proyectos en curso, materiales, fallos, prototipos…', 'data-foco': 'th-notas' })));

    /* ---- partes del editor según tipo ---- */
    let cuerpo;
    if (esArma) {
      const bases = S.reg.armas.filter(a => !a.escudo && !String(a.id).startsWith('am:') && (a.tipo === 'distancia') === (b.tipo === 'Arma distancia'));
      cuerpo = [
        ui.campo('Partir de un arma existente', ui.select([{ v: '', t: '— elegir base —' }].concat(bases.map(a => ({ v: a.id, t: a.nombre }))), '', v => {
          const a = S.reg.armas.find(q => q.id === v); if (!a) return;
          b.arma = Object.assign(clon(a), { id: '', nombre: a.nombre + ' (Techno)', escudo: undefined }); S.render();
        }, { 'data-foco': 'th-base' })),
        h('p', { class: 'meta', text: `Bono de RT del Techno: +${TH().bonoRt(lv)} pasos, que se suman al RT del arma. Todo lo demás es editable.` }),
        ui.hb.formArma(S, b.arma, { sinTipo: true, sinEscudo: true })
      ];
    } else if (b.tipo === 'Armadura') {
      cuerpo = [
        ui.campo('Partir de una armadura existente', ui.select([{ v: '', t: '— elegir base —' }].concat(S.reg.armaduras.map(a => ({ v: a.id, t: a.nombre }))), '', v => {
          const a = S.reg.armaduras.find(q => q.id === v); if (!a) return; b.armadura = Object.assign(clon(a), { id: '', nombre: a.nombre + ' (Techno)' }); S.render();
        }, { 'data-foco': 'th-base-arm' })),
        h('p', { class: 'meta', text: `Bono de armadura del Techno: +${TH().bonoArm(lv)} a cada pieza que protege.` }),
        ui.hb.formArmadura(S, b.armadura)
      ];
    } else if (b.tipo === 'Arma de área') {
      const a = b.area, els = TH().elementos(lv), lados = [...new Set(A.base.technoElementos.map(e => e.lado))].filter(l => l <= Math.max(TH().areaMax(lv), a.lado));
      cuerpo = [
        h('div', { class: 'rejilla g3' }, ui.campo('Nombre', ui.texto(b.nombre, v => { b.nombre = v; }, { maxlength: 60, 'data-foco': 'th-nombre' })),
          ui.campo('Elemento', ui.select(els.map(e => ({ v: e.nombre, t: e.nombre })).concat(els.some(e => e.nombre === a.elemento) ? [] : [{ v: a.elemento || '', t: a.elemento || '— elegir —' }]), a.elemento, v => { const e = TH().elemento(v); a.elemento = v; if (e) { a.salv = e.salv; a.lado = Math.min(e.lado, TH().areaMax(lv) || e.lado); } S.render(); }, { 'data-foco': 'th-elem' })),
          ui.campo('Área', ui.select(lados.map(l => ({ v: String(l), t: TH().textoArea(l) })), String(a.lado), v => { a.lado = Number(v); }, { 'data-foco': 'th-lado' }))),
        h('div', { class: 'rejilla g3' }, ui.campo('Daño (según tu nivel)', ui.texto(a.dano, v => { a.dano = v; }, { 'data-foco': 'th-adano' })),
          ui.campo('Salvación', ui.select(A.SAVES.map(s => ({ v: s, t: s })), a.salv, v => { a.salv = v; }, { 'data-foco': 'th-salv' })),
          ui.campo('Si supera la salvación', ui.texto(a.exito, v => { a.exito = v; }, { 'data-foco': 'th-exito' })))
      ];
    } else if (b.tipo === 'Montura') {
      const m = b.montura, s = TH().statsMontura(m);
      const tirar = () => { m.tiradas = Array.from({ length: m.dg }, () => 1 + Math.floor(Math.random() * m.dado)); m.modo = 'tirada'; m.hpManual = null; S.render(); };
      cuerpo = [
        h('div', { class: 'rejilla g3' }, ui.campo('Nombre', ui.texto(b.nombre, v => { b.nombre = v; }, { maxlength: 60, 'data-foco': 'th-nombre' })),
          ui.campo('Dados de golpe', ui.numero(m.dg, v => { m.dg = Math.max(1, Math.round(U.num(v)) || 1); S.render(); }, { min: 1, step: 1, 'data-foco': 'th-dg' })),
          ui.campo('Dado', ui.select([4, 6, 8, 10, 12].map(d => ({ v: String(d), t: 'd' + d })), String(m.dado), v => { m.dado = Number(v); m.tiradas = []; S.render(); }, { 'data-foco': 'th-dado' }))),
        h('div', { class: 'rejilla g3' }, ui.campo('Puntos de golpe', ui.select([{ v: 'maximo', t: 'Completo (máximo)' }, { v: 'tirada', t: 'Tirado' }], m.modo, v => { m.modo = v; S.render(); }, { 'data-foco': 'th-modo' })),
          ui.campo('HP manual (opcional)', ui.numero(m.hpManual === null ? '' : m.hpManual, v => { m.hpManual = v === '' ? null : Math.max(1, Math.round(U.num(v))); S.render(); }, { min: 1, step: 1, 'data-foco': 'th-hpm' })),
          m.modo === 'tirada' ? ui.campo('Dados', ui.boton('Tirar dados', tirar, 'chico', { 'data-foco': 'th-tirar' })) : null),
        h('div', { class: 'rejilla g3' }, ui.campo('Ajuste de GAC0', ui.numero(m.thac0Aj, v => { m.thac0Aj = Math.round(U.num(v)); S.render(); }, { step: 1, 'data-foco': 'th-gaj' })),
          ui.campo('Ajuste de CA', ui.numero(m.caAj, v => { m.caAj = Math.round(U.num(v)); S.render(); }, { step: 1, 'data-foco': 'th-caj' })),
          ui.campo('Tamaño', ui.texto(m.tam, v => { m.tam = v; }, { 'data-foco': 'th-tam' }))),
        h('p', { class: 'meta', text: `Ficha: ${s.dg} DG (d${s.dado}) · ${s.hp} HP · GAC0 ${s.thac0} · CA ${s.ca} (10 − bono de armadura ${m.bonoArm})` }),
        ui.campo('Movimiento', ui.texto(m.mov, v => { m.mov = v; }, { 'data-foco': 'th-mov' })),
        h('div', {}, m.ataques.map((x, i) => h('div', { class: 'rejilla g3' },
          ui.campo('Ataque', ui.texto(x.nombre, v => { x.nombre = v; }, { 'data-foco': 'th-at-n' + i })), ui.campo('Daño', ui.texto(x.dano, v => { x.dano = v; }, { 'data-foco': 'th-at-d' + i })),
          ui.boton('Quitar', () => { m.ataques.splice(i, 1); S.render(); }, 'chico peligro', { 'data-foco': 'th-at-q' + i }))),
        ui.boton('+ Ataque', () => { if (m.ataques.length < 8) m.ataques.push({ nombre: '', dano: '' }); S.render(); }, 'chico', { 'data-foco': 'th-at-add' })),
        ui.campo('Notas de la montura', ui.area(m.notas || '', v => { m.notas = v; }, { rows: 2, 'data-foco': 'th-mnotas' }))
      ];
    } else {
      cuerpo = [h('div', { class: 'rejilla g3' }, ui.campo('Nombre', ui.texto(b.nombre, v => { b.nombre = v; }, { maxlength: 60, placeholder: 'Ej. Granada de humo', 'data-foco': 'th-nombre' }), 'ancho2'))];
    }

    const archivo = h('input', { type: 'file', accept: 'image/*', 'data-foco': 'th-img-file', 'aria-label': 'Imagen local', onchange: e => { const f = e.target.files[0]; if (f) reducirImagen(f, url => { if (!url) { S.aviso('No pude leer esa imagen.', true); return; } b.img = url; S.render(); }); } });
    const editor = ui.bloque(edita ? 'Editando creación' : 'Taller: nueva creación',
      h('p', { class: 'ayuda', text: 'Cada creación guarda la capacidad que tenías al fabricarla; para mejorarla, usa "Nueva versión".' }),
      h('div', { class: 'rejilla g3' },
        ui.campo('Tipo', ui.select(TH().TIPOS.map(([x]) => ({ v: x, t: x })), b.tipo, v => { b.tipo = v; if (b.arma) b.arma.tipo = v === 'Arma distancia' ? 'distancia' : 'cuerpo'; S.render(); }, { 'data-foco': 'th-tipo' })),
        ui.campo('Propietario / destino', ui.texto(b.dueno, v => { b.dueno = v; }, { placeholder: 'Techno, aliado, grupo…', 'data-foco': 'th-dueno' })),
        ui.campo('Capacidad al fabricar', h('output', { class: 'fijo', text: `${cap.valor} (${cap.fuente})` }))),
      cuerpo,
      ui.campo('Descripción / propiedades', ui.area(b.desc, v => { b.desc = v; }, { rows: 3, 'data-foco': 'th-desc' })),
      h('div', { class: 'rejilla g3' },
        ui.campo('Imagen por URL', ui.texto(b.img.startsWith('data:') ? '' : b.img, v => { b.img = v; }, { placeholder: 'https://…', 'data-foco': 'th-img' })),
        ui.campo('O un archivo de tu equipo', archivo),
        h('div', { class: 'taller-prev' }, b.img ? h('img', { src: b.img, alt: 'Vista previa', class: 'taller-img' }) : h('span', { class: 'meta', text: 'Sin imagen' }))),
      h('div', { class: 'fila-edit' },
        ui.boton(edita ? 'Guardar cambios' : '+ Añadir al catálogo', () => {
          const d = clon(b), id = b.id;
          if (hacer(S, pj => TH().acc.guardar(pj, S.r.techno.nivel, d, id))) { alinea(S, id); borrador = nuevo(S.r.techno.nivel); S.render(); }
        }, 'primario', { 'data-foco': 'th-add' }),
        b.img ? ui.boton('Quitar imagen', () => { b.img = ''; S.render(); }, 'chico', { 'data-foco': 'th-img-q' }) : null,
        edita ? ui.boton('Cancelar edición', () => { borrador = nuevo(lv); S.render(); }, '', { 'data-foco': 'th-cancel' }) : null,
        h('span', { class: 'meta', text: `${t.taller.length} ${t.taller.length === 1 ? 'creación guardada' : 'creaciones guardadas'}` })));

    /* ---- acciones de cada creación ---- */
    const aEquipo = x => {
      if (x.arma) {
        S.cambiarHb(hb => { hb.armas = hb.armas || []; const i = hb.armas.findIndex(q => q.id === x.arma.id), c = clon(x.arma); if (i >= 0) hb.armas[i] = c; else hb.armas.push(c); });
        let msg = null; S.cambiar(pj => { msg = A.reglas.armas.acc.anadirInstancia(pj, S.reg, x.arma.id); }, { estructura: true });
        S.aviso(msg || `"${x.nombre}" ya está en tu equipo (pestaña Armas).`, !!msg);
      } else if (x.armadura) {
        const f = TH().armaduraFinal(x);
        S.cambiarHb(hb => { hb.armaduras = hb.armaduras || []; const i = hb.armaduras.findIndex(q => q.id === f.id); if (i >= 0) hb.armaduras[i] = f; else hb.armaduras.push(f); });
        S.aviso(`"${x.nombre}" ya está disponible: elígela en la pestaña Armadura (con el bono +${x.bono} incluido).`);
      }
    };
    const entregar = x => {
      S.descargar((U.slug(x.nombre) || 'creacion') + '.techno.json', A.exportarPaquete(TH().paquete(x, S.pj.identidad.nombre)));
      S.cambiar(pj => TH().acc.entregada(pj, x.id, new Date().toLocaleDateString('es-MX')), { estructura: true });
      S.aviso('Archivo listo: quien lo reciba lo importa en Homebrew → Importar paquete.');
    };
    const guardarHb = x => {
      const paq = TH().paquete(x, S.pj.identidad.nombre);
      S.cambiarHb(hb => { ['armas', 'armaduras', 'creaciones'].forEach(k => paq[k].forEach(c => { hb[k] = hb[k] || []; const i = hb[k].findIndex(q => q.id === c.id); if (i >= 0) hb[k][i] = c; else hb[k].push(c); })); });
      S.aviso('Guardada en tu Homebrew: ya se puede exportar con el resto de tu biblioteca.');
    };
    const tarjeta = x => h('article', { class: 'tarjeta-arma grande' },
      h('div', { class: 'tarjeta-cab' }, h('div', { class: 'crece' }, h('strong', { text: x.nombre }), h('div', { class: 'meta', text: `${x.tipo} · ${x.nivel ? 'fabricado a nivel ' + x.nivel : x.fuente || 'recibida'}${x.dueno ? ' · para ' + x.dueno : ''}` })),
        x.entregada ? h('span', { class: 'etiqueta', text: 'Entregada ' + x.entregada }) : null),
      h('div', { class: 'taller-cuerpo' },
        x.img ? h('img', { src: x.img, alt: '', class: 'taller-img', referrerpolicy: 'no-referrer' }) : null,
        h('div', {}, x.arma ? h('p', { class: 'meta', text: `Daño base P/M ${x.arma.dm} · G ${x.arma.dg} · ${x.arma.grupo} · tamaño ${x.arma.tam} · crítico ${x.arma.crit} · RT base ${A.reglas.armas.rtEtiqueta(x.arma.rt || 2)}${x.rtBono ? ' + ' + x.rtBono + ' pasos Techno' : ''}` }) : null,
          h('p', { text: `Resultado: ${TH().linea(x) || '—'}` }),
          x.desc ? h('p', { class: 'meta', text: x.desc }) : null)),
      h('div', { class: 'fila-edit' },
        x.arma || x.armadura ? ui.boton('Agregar a mi equipo', () => aEquipo(x), 'chico primario', { 'data-foco': 'th-eq-' + x.id }) : null,
        ui.boton('Guardar en Homebrew', () => guardarHb(x), 'chico', { 'data-foco': 'th-hb-' + x.id }),
        ui.boton('Entregar (archivo)', () => entregar(x), 'chico', { 'data-foco': 'th-ent-' + x.id }),
        ui.boton('Editar', () => { borrador = Object.assign(nuevo(lv, x.tipo), { id: x.id, nombre: x.arma || x.armadura ? '' : x.nombre, dueno: x.dueno, desc: x.desc, img: x.img }); if (x.arma) borrador.arma = clon(x.arma); if (x.armadura) borrador.armadura = clon(x.armadura); if (x.area) borrador.area = clon(x.area); if (x.montura) borrador.montura = clon(x.montura); S.render(); window.scrollTo({ top: 0 }); }, 'chico', { 'data-foco': 'th-e-' + x.id }),
        x.nivel ? ui.boton('Nueva versión', () => hacer(S, pj => TH().acc.version(pj, S.r.techno.nivel, x.id)), 'chico', { 'data-foco': 'th-v-' + x.id }) : null,
        ui.boton('Eliminar', () => { if (!confirm(`¿Eliminar "${x.nombre}"?`)) return; if (borrador && borrador.id === x.id) borrador = nuevo(lv); hacer(S, pj => TH().acc.quitar(pj, x.id)); }, 'chico peligro', { 'data-foco': 'th-d-' + x.id })));
    const lista = t.taller.length ? h('div', { class: 'lista-armas' }, t.taller.map(tarjeta)) : h('p', { class: 'vacio', text: 'Aún no hay objetos fabricados registrados.' });

    /* ---- creaciones recibidas por Homebrew ---- */
    const recibidas = S.reg.creaciones.filter(c => !t.taller.some(x => x.id === 'rec-' + c.id));
    const bloqueRec = S.reg.creaciones.length ? ui.bloque('Creaciones recibidas (Homebrew)',
      h('p', { class: 'ayuda', text: 'Creaciones de otros Techno que importaste. Las armas y armaduras compartidas aparecen directamente en Armas y Armadura.' }),
      recibidas.length ? h('div', { class: 'lista-armas' }, recibidas.map(c => h('article', { class: 'tarjeta-arma' },
        h('div', { class: 'tarjeta-cab' }, h('div', { class: 'crece' }, h('strong', { text: c.nombre }), h('div', { class: 'meta', text: `${c.tipo}${c.autor ? ' · de ' + c.autor : ''}` }))),
        h('p', { class: 'meta', text: TH().linea(c) }), c.desc ? h('p', { class: 'meta', text: c.desc }) : null,
        h('div', { class: 'fila-edit' }, ui.boton('Agregar a mi taller', () => hacer(S, pj => TH().acc.recibir(pj, c)), 'chico primario', { 'data-foco': 'th-rec-' + c.id }))))) : h('p', { class: 'meta', text: 'Todas están ya en tu taller.' })) : null;

    const exportar = t.taller.length ? ui.boton('Exportar catálogo completo', () => {
      const paq = A.hbVacio(); t.taller.forEach(x => { const p = TH().paquete(x, S.pj.identidad.nombre); ['armas', 'armaduras', 'creaciones'].forEach(k => paq[k].push(...p[k])); });
      S.descargar((U.slug(S.pj.identidad.nombre) || 'techno') + '-catalogo.techno.json', A.exportarPaquete(paq));
    }, 'chico', { 'data-foco': 'th-exp-todo' }) : null;
    return h('div', {}, resumen, editor, ui.bloque('Creaciones', exportar, lista), bloqueRec);
  }
  function alinea(S, id) {
    if (!id) return;
    const x = S.pj.tecnicas.techno.taller.find(q => q.id === id); if (!x) return;
    if (x.arma && (S.hb.armas || []).some(q => q.id === x.arma.id)) S.cambiarHb(hb => { const i = hb.armas.findIndex(q => q.id === x.arma.id); hb.armas[i] = clon(x.arma); });
    if (x.armadura && (S.hb.armaduras || []).some(q => q.id === 'tecno-arm-' + x.id)) S.cambiarHb(hb => { const i = hb.armaduras.findIndex(q => q.id === 'tecno-arm-' + x.id); hb.armaduras[i] = TH().armaduraFinal(x); });
  }
  ui.techno = techno;
})(window.ADND);
