/* Carga los mismos archivos que index.html (en el mismo orden) dentro de un contexto de Node. */
const fs = require('fs'), path = require('path'), vm = require('vm');
const RAIZ = path.resolve(__dirname, '..');

const ARCHIVOS = [
  'js/core/ns.js',
  'data/base/tablas.js', 'data/base/caracteristicas.js', 'data/base/clases.js',
  'data/base/razas.js', 'data/base/kits.js', 'data/base/deidades.js', 'data/base/armas.js', 'data/base/idiomas.js', 'data/base/armaduras.js', 'data/base/pericias.js', 'data/base/tecnicas.js', 'data/base/espadachin.js', 'data/base/artes.js', 'data/base/techno.js', 'data/base/magia.js', 'data/base/lanzadores.js', 'data/base/brujo.js', 'data/base/psionica.js', 'data/base/salvaje.js', 'data/base/dotes.js', 'data/base/tienda.js', 'data/base/conjuros-arcanos.js', 'data/base/conjuros-divinos.js',
  'js/core/registro.js', 'js/core/modelo.js', 'js/core/reglas.js', 'js/core/kit.js', 'js/core/armas.js', 'js/core/armadura.js', 'js/core/pericias.js', 'js/core/tecnicas.js', 'js/core/artes.js', 'js/core/techno.js', 'js/core/conjuros.js', 'js/core/lanzadores.js', 'js/core/brujo.js', 'js/core/psionica.js', 'js/core/salvaje.js', 'js/core/dotes.js', 'js/core/equipo.js',
  'js/core/almacen.js', 'js/core/migrar.js'
];

module.exports = function cargar(extra = {}) {
  const ctx = vm.createContext(Object.assign({ console, Math, JSON, Date, Number, String, Object, Array, Set, Map }, extra));
  ctx.globalThis = ctx;
  for (const f of ARCHIVOS) {
    const ruta = path.join(RAIZ, f);
    if (!fs.existsSync(ruta)) continue;            // permite probar antes de que existan todos
    vm.runInContext(fs.readFileSync(ruta, 'utf8'), ctx, { filename: f });
  }
  return ctx.ADND;
};
