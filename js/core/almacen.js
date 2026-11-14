/* Almacén: guardado automático (localStorage), biblioteca homebrew y archivos de intercambio.
   Si el navegador bloquea localStorage, todo sigue funcionando en memoria y se avisa. */
(function (A) {
  'use strict';
  const U = A.util;
  const P = 'adnd2.v1.';

  const memoria = {};
  let persistente = true;
  const lec = k => { try { const v = localStorage.getItem(P + k); return v === null ? (k in memoria ? memoria[k] : null) : v; } catch (e) { persistente = false; return k in memoria ? memoria[k] : null; } };
  const esc = (k, v) => { memoria[k] = v; try { localStorage.setItem(P + k, v); } catch (e) { persistente = false; } };
  const bor = k => { delete memoria[k]; try { localStorage.removeItem(P + k); } catch (e) { persistente = false; } };
  const leerJson = (k, def) => { try { const v = lec(k); return v ? JSON.parse(v) : def; } catch (e) { return def; } };

  const alm = (A.almacen = {
    get persistente() { return persistente; },

    /* ---- personajes ---- */
    lista() { return leerJson('indice', []).sort((a, b) => String(b.modificado).localeCompare(String(a.modificado))); },
    cargar(id) { const o = leerJson('pj.' + id, null); return o ? A.normalizarPersonaje(o) : null; },
    guardar(pj) {
      pj.modificado = U.ahora();
      esc('pj.' + pj.id, JSON.stringify(pj));
      const idx = leerJson('indice', []).filter(x => x.id !== pj.id);
      idx.push({ id: pj.id, nombre: pj.identidad.nombre || 'Sin nombre', modificado: pj.modificado });
      esc('indice', JSON.stringify(idx));
    },
    borrar(id) { bor('pj.' + id); esc('indice', JSON.stringify(leerJson('indice', []).filter(x => x.id !== id))); },
    actualId() { return lec('actual'); },
    fijarActual(id) { esc('actual', id); },

    /* ---- homebrew ---- */
    cargarHb() { return A.sanear.paquete(leerJson('hb', null)); },
    guardarHb(hb) { esc('hb', JSON.stringify(hb)); },

    /* ---- preferencias ---- */
    pref(k, def) { return leerJson('pref', {})[k] !== undefined ? leerJson('pref', {})[k] : def; },
    fijarPref(k, v) { const p = leerJson('pref', {}); p[k] = v; esc('pref', JSON.stringify(p)); }
  });

  /* ---------------- archivos de intercambio ---------------- */
  A.ARCHIVO = 'ADND2_ARCHIVO';
  A.PAQUETE = 'ADND2_HOMEBREW';

  /* Archivo de personaje: lleva consigo lo homebrew que usa, para que se abra igual en otra computadora. */
  A.exportarPersonaje = (pj, hb) => ({ formato: A.ARCHIVO, version: 1, exportado: U.ahora(), personaje: pj, homebrew: A.hbUsadoPor(pj, hb) });
  A.exportarPaquete = hb => Object.assign({ formato: A.PAQUETE, version: 1, exportado: U.ahora() }, hb);

  /* Lee cualquier archivo conocido. Devuelve { tipo, personaje?, homebrew?, avisos[] } o lanza Error. */
  A.leerArchivo = function (obj) {
    if (!obj || typeof obj !== 'object') throw new Error('El archivo no tiene un formato reconocible.');
    if (obj.formato === A.ARCHIVO && obj.personaje) {
      return { tipo: 'personaje', personaje: A.normalizarPersonaje(obj.personaje), homebrew: A.sanear.paquete(obj.homebrew), avisos: [] };
    }
    if (obj.formato === A.FORMATO && obj.caracteristicas) {
      return { tipo: 'personaje', personaje: A.normalizarPersonaje(obj), homebrew: A.hbVacio(), avisos: [] };
    }
    if (obj.formato === A.PAQUETE) return { tipo: 'paquete', homebrew: A.sanear.paquete(obj), avisos: [] };
    if (obj.format === 'ADND2_CHARACTER_V4') { const r = A.migrarLegacy(obj); r.tipo = 'personaje'; return r; }
    throw new Error('El archivo no es una ficha ni un paquete homebrew de esta aplicación.');
  };
})((typeof window !== 'undefined' ? window : globalThis).ADND);
