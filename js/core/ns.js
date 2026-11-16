/* Espacio de nombres único. Todo el proyecto cuelga de ADND (no hay otras globales).
   Se usan scripts clásicos y no módulos ES porque los módulos no cargan con doble clic (file://). */
(function (g) {
  'use strict';
  const A = (g.ADND = g.ADND || {});
  A.base = A.base || {};     // datos incorporados (data/base/*.js)
  A.reglas = A.reglas || {}; // motor de reglas: funciones puras, sin DOM
  A.ui = A.ui || {};         // interfaz
  A.util = A.util || {};

  A.STATS = ['FUE', 'DES', 'CON', 'INT', 'SAB', 'CAR'];
  A.STAT_NOMBRES = { FUE: 'Fuerza', DES: 'Destreza', CON: 'Constitución', INT: 'Inteligencia', SAB: 'Sabiduría', CAR: 'Carisma' };
  A.SAVES = ['PVM', 'CVV', 'PP', 'AL', 'CyO'];
  A.SAVE_NOMBRES = {
    PVM: 'Parálisis, veneno o muerte mágica',
    CVV: 'Cetros, varas o varitas',
    PP: 'Petrificación o polimorfia',
    AL: 'Armas de aliento',
    CyO: 'Conjuros'
  };
  /* Objetivos que un efecto puede modificar. */
  A.OBJETIVOS = {
    FUE: 'Fuerza', DES: 'Destreza', CON: 'Constitución', INT: 'Inteligencia', SAB: 'Sabiduría', CAR: 'Carisma',
    thaco: 'THAC0 (se suma; negativo mejora)', ca: 'Clase de armadura (se suma; negativo mejora)', pg: 'Puntos de golpe máximos',
    PVM: 'Salvación PVM (se suma; negativo mejora)', CVV: 'Salvación CVV (se suma; negativo mejora)',
    PP: 'Salvación PP (se suma; negativo mejora)', AL: 'Salvación AL (se suma; negativo mejora)',
    CyO: 'Salvación CyO (se suma; negativo mejora)', mov: 'Movimiento (se suma)'
  };

  const U = A.util;
  U.num = v => { const n = Number(v); return Number.isFinite(n) ? n : 0; };
  U.round = v => Math.floor(v + 0.5);
  U.clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  U.clon = o => JSON.parse(JSON.stringify(o));
  U.uid = () => Math.random().toString(36).slice(2, 8);
  U.slug = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  U.idNuevo = (prefijo, nombre) => `${prefijo}-${U.slug(nombre) || 'sin-nombre'}-${U.uid()}`;
  U.signo = n => (n > 0 ? '+' : n < 0 ? '−' : '') + Math.abs(n);
  U.esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  U.ahora = () => new Date().toISOString();
})(typeof window !== 'undefined' ? window : globalThis);
