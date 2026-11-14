/* Techno: capacidades máximas de fabricación por nivel de Techno (1 a 30). Son descriptivas: no tocan Armas, Defensa ni Equipo.
   El índice del arreglo es el nivel (el 0 va vacío). rt y arm son bonos numéricos; montura y area, texto. */
(function (A) {
  'use strict';
  const TECNO_TAB = {
    dano: ["","1d4","1d4","1d4","1d6","1d6","1d6","1d8","1d8","1d8","1d10","1d10","1d10","1d12","1d12","1d12","3d4","3d4","3d4","3d6","3d6","3d6","3d8","3d8","3d8","3d8","3d10","3d10","3d10","3d12","3d12"],
    proy: ["","1d6","1d6","1d6","1d8","1d8","1d8","1d10","1d10","1d10","1d12","1d12","1d12","3d4","3d4","3d4","3d6","3d6","3d6","3d8","3d8","3d8","3d8","3d10","3d10","3d10","3d12","3d12","3d20","3d20","3d20"],
    area: ["","N/D","N/D","N/D","N/D","N/D","N/D","1d12","1d12","1d12","2d12","2d12","2d12","2d12","3d12","3d12","3d12","3d12","4d12","4d12","4d12","5d12","5d12","5d12","6d12","6d12","6d12","7d12","7d12","7d12","7d12"],
    rt:   ["",1,1,1,1,1,2,2,2,2,2,3,3,3,3,3,4,4,4,4,4,5,5,5,5,5,6,6,6,6,6],
    arm:  ["",1,1,1,1,1,2,2,2,2,2,3,3,3,3,3,4,4,4,4,4,5,5,5,5,5,6,6,6,6,6],
    montura: ["","N/D","N/D","N/D","V 18, Terrestre","V 18, Terrestre","V 18, Terrestre","V 24, Terrestre","V 24, Terrestre","V 24, Terrestre","V 24, Terrestre, Marina","V 24, Terrestre, Marina","V 24, Terrestre, Marina","V 32, Terrestre, Marina, Voladora","V 32, Terrestre, Marina, Voladora","V 32, Terrestre, Marina, Voladora","V 40, Terrestre, Marina, Voladora","V 40, Terrestre, Marina, Voladora","V 40, Terrestre, Marina, Voladora","V 40, Terrestre, Marina, Voladora, Teleport (1/d)","V 40, Terrestre, Marina, Voladora, Teleport (1/d)","V 40, Terrestre, Marina, Voladora, Teleport (1/d)","V 50, Terrestre, Marina, Voladora, Teleport (2/d)","V 50, Terrestre, Marina, Voladora, Teleport (2/d)","V 50, Terrestre, Marina, Voladora, Teleport (2/d)","V 50, Terrestre, Marina, Voladora, Teleport (2/d)","V 50, Terrestre, Marina, Voladora, Teleport (2/d)","V 50, Terrestre, Marina, Voladora, Teleport (2/d)","V 50, Terrestre, Marina, Voladora, Teleport (2/d)","V 50, Terrestre, Marina, Voladora, Teleport (2/d)","V 50, Terrestre, Marina, Voladora, Teleport (2/d)"],
    cerraduras: [0,15,21,27,33,40,47,55,62,70,78,86,94,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99],
    trampas:    [0,10,15,20,25,31,37,43,49,56,63,70,77,85,93,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99]
  };
  A.base.techno = TECNO_TAB;
  /* Armas de área: cada 3 niveles desde el 7 (primer nivel con daño de área) se desbloquea un elemento y crece el área máxima.
     lado = metros por lado del cuadrado (3 m ≈ 10 pies); salv = categoría de salvación (la de tu hoja); con éxito, mitad del daño. */
  A.base.technoElementos = [
    { nivel: 7, k: 'fuego', nombre: 'Fuego', lado: 3, salv: 'AL' },
    { nivel: 10, k: 'acido', nombre: 'Ácido', lado: 4.5, salv: 'AL' },
    { nivel: 13, k: 'frio', nombre: 'Frío / hielo', lado: 6, salv: 'AL' },
    { nivel: 16, k: 'electricidad', nombre: 'Electricidad', lado: 7.5, salv: 'CVV' },
    { nivel: 19, k: 'veneno', nombre: 'Veneno / gas', lado: 9, salv: 'PVM' },
    { nivel: 22, k: 'sonico', nombre: 'Sónico', lado: 12, salv: 'PP' },
    { nivel: 25, k: 'fuerza', nombre: 'Fuerza', lado: 15, salv: 'CyO' },
    { nivel: 28, k: 'radiante', nombre: 'Radiante', lado: 18, salv: 'CyO' },
    { nivel: 28, k: 'necrotico', nombre: 'Necrótico', lado: 18, salv: 'PVM' }
  ];
})((typeof window !== 'undefined' ? window : globalThis).ADND);
