/* Armaduras base. "completa" es la protección con peto, dos brazos y dos piernas; el resto, lo que da cada pieza.
   clase = categoría del peto: Ligera deja pasar todo el bono de DES, Media lo limita a −2 de CA y Pesada lo anula.
   Valores tomados del constructor anterior; edítalos en Homebrew → Armaduras si tu mesa usa otros. */
(function (A) {
  'use strict';
  const m = (id, nombre, clase, completa, torso, brazos2, brazo1, piernas2, pierna1) => ({ id, nombre, clase, completa, torso, brazos2, brazo1, piernas2, pierna1 });
  A.base.armaduras = [
    m('acolchada', 'Acolchada', 'Ligera', 2, 1, 1, 0, 0, 0),
    m('cuero', 'Cuero', 'Ligera', 2, 1, 1, 0, 0, 0),
    m('anillas', 'Anillas', 'Ligera', 3, 1, 1, 0, 1, 0),
    m('cuero-tachonado', 'Cuero tachonado', 'Ligera', 3, 1, 1, 0, 1, 0),
    m('brigantina', 'Brigantina', 'Pesada', 4, 2, 1, 0, 1, 0),
    m('escamas', 'Escamas', 'Media', 4, 2, 1, 0, 1, 0),
    m('piel', 'Piel', 'Media', 4, 2, 1, 0, 1, 0),
    m('mallas', 'Mallas', 'Media', 5, 2, 2, 1, 1, 0),
    m('bandas', 'Bandas', 'Media', 6, 3, 2, 1, 1, 0),
    m('placas-bronce', 'Placas de bronce', 'Pesada', 6, 3, 2, 1, 1, 0),
    m('varillas', 'Varillas', 'Pesada', 6, 3, 2, 1, 1, 0),
    m('placas', 'Placas', 'Pesada', 7, 3, 2, 1, 2, 1),
    m('completa-campana', 'Completa de campaña', 'Pesada', 8, 4, 2, 1, 2, 1),
    m('completa', 'Completa', 'Pesada', 9, 4, 3, 1, 2, 1)
  ];
  A.base.ranurasEquipo = [['head', 'Cabeza'], ['ears', 'Orejas'], ['neck', 'Cuello'], ['ring1', 'Anillo 1'], ['ring2', 'Anillo 2'], ['rarm', 'Brazo der.'],
    ['larm', 'Brazo izq.'], ['rhand', 'Mano der.'], ['lhand', 'Mano izq.'], ['waist', 'Cintura'], ['feet', 'Pies'], ['cape', 'Capa'], ['other1', 'Otro 1'], ['other2', 'Otro 2']];
})((typeof window !== "undefined" ? window : globalThis).ADND);
