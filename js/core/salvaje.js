/* Magia salvaje: variación de nivel (d20) y tabla de oleadas (d100). Motor puro, sin DOM.
   Una "tabla" es { valores[9][20], oleadas[9][cols], resultados[100] } (la base o una copia homebrew). */
(function (A) {
  'use strict';
  const U = A.util;
  const FILAS = 9, COLS = 20, RESULTADOS = 100;
  const S = (A.reglas.salvaje = {});
  S.FILAS = FILAS; S.COLS = COLS; S.RESULTADOS = RESULTADOS;

  S.fila = nivel => Math.min(FILAS, Math.max(1, Math.floor(U.num(nivel)) || 1)) - 1;
  S.etiquetaNivel = fila => (fila >= FILAS - 1 ? '9+' : String(fila + 1));

  /* Variación para un nivel verdadero y una tirada de d20. d20 fuera de 1–20 → null. */
  S.variacion = (tabla, nivel, d20) => {
    const d = Math.floor(Number(d20));
    if (!Number.isFinite(d) || d < 1 || d > COLS) return null;
    const fila = S.fila(nivel), valor = tabla.valores[fila][d - 1];
    const nivelBase = Math.max(1, Math.floor(U.num(nivel)) || 1);
    return { fila, valor, oleada: (tabla.oleadas[fila] || []).includes(d), nivelEfectivo: Math.max(0, nivelBase + valor), nivel: nivelBase };
  };

  /* Resultado de la oleada: el d100 (00 = 100) es la posición. */
  S.resultado = (tabla, d100) => {
    let d = Math.floor(Number(d100));
    if (d === 0) d = 100;
    if (!Number.isFinite(d) || d < 1 || d > tabla.resultados.length) return null;
    return { d, texto: tabla.resultados[d - 1] };
  };

  /* ---- texto <-> tabla (editor homebrew) ----
     Matriz: una línea por nivel (1 a 8 y 9+), 20 números; un "*" tras el número marca la oleada (negrita). */
  S.matrizATexto = tabla => tabla.valores.map((f, i) => f.map((v, c) => (v > 0 ? '+' + v : String(v)) + ((tabla.oleadas[i] || []).includes(c + 1) ? '*' : '')).join(' ')).join('\n');
  S.matrizDeTexto = texto => {
    const lineas = String(texto || '').split(/\n+/).map(l => l.trim()).filter(Boolean);
    if (lineas.length !== FILAS) throw new Error(`La matriz necesita ${FILAS} líneas (niveles 1 a 8 y 9+); tiene ${lineas.length}.`);
    const valores = [], oleadas = [];
    lineas.forEach((l, i) => {
      const toks = l.split(/[\s,;]+/).filter(Boolean);
      if (toks.length !== COLS) throw new Error(`La línea ${i + 1} necesita ${COLS} números (d20 del 1 al 20); tiene ${toks.length}.`);
      const fila = [], col = [];
      toks.forEach((t, c) => {
        const m = /^([+\-−]?\d+)(\*?)$/.exec(t); if (!m) throw new Error(`Línea ${i + 1}, columna ${c + 1}: "${t}" no es un número (usa * para marcar la oleada).`);
        fila.push(parseInt(m[1].replace('−', '-'), 10)); if (m[2]) col.push(c + 1);
      });
      valores.push(fila); oleadas.push(col);
    });
    return { valores, oleadas };
  };
  S.resultadosDeTexto = texto => {
    const l = String(texto || '').split(/\n/).map(x => x.trim()).filter(Boolean);
    if (l.length !== RESULTADOS) throw new Error(`Los resultados necesitan ${RESULTADOS} líneas (una por número del d100); tienes ${l.length}.`);
    return l;
  };

  /* Entrada ya limpia desde cualquier origen (importación, editor). */
  A.sanear = A.sanear || {};
  A.sanear.magiaSalvaje = t => {
    t = t || {};
    const valores = Array.from({ length: FILAS }, (_, i) => Array.from({ length: COLS }, (_, c) => Math.round(U.num(t.valores && t.valores[i] && t.valores[i][c])) || 0));
    const oleadas = Array.from({ length: FILAS }, (_, i) => [...new Set(((t.oleadas && t.oleadas[i]) || []).map(Number).filter(n => Number.isInteger(n) && n >= 1 && n <= COLS))].sort((a, b) => a - b));
    const resultados = Array.from({ length: RESULTADOS }, (_, i) => String((t.resultados && t.resultados[i]) || '').trim());
    return { id: String(t.id || U.idNuevo('hb-salvaje', t.nombre)), nombre: String(t.nombre || '').trim(), niveles: ['1', '2', '3', '4', '5', '6', '7', '8', '9+'], valores, oleadas, resultados };
  };
})(ADND);
