/* Tablas de las técnicas de Bribón y Bárbaro (tomadas del constructor anterior).
   Las habilidades de bribón (porcentajes) llevan, en este orden: vaciar bolsillos, abrir cerraduras, hallar/retirar trampas,
   moverse en silencio, ocultarse en las sombras, detectar ruidos, escalar paredes y leer lenguajes. */
(function (A) {
  'use strict';
  A.base.tecnicas = {
    bribon: {
      habilidades: [['pick', 'Vaciar bolsillos'], ['locks', 'Abrir cerraduras'], ['traps', 'Hallar/retirar trampas'], ['move', 'Moverse en silencio'],
        ['hide', 'Ocultarse en las sombras'], ['noise', 'Detectar ruidos'], ['climb', 'Escalar paredes'], ['read', 'Leer lenguajes']],
      baseLadron: { pick: 15, locks: 10, traps: 5, move: 10, hide: 5, noise: 15, climb: 60, read: 0 },
      baseBardo: { pick: 10, noise: 20, climb: 50, read: 5 },
      raza: { humano: [0, 0, 0, 0, 0, 0, 0, 0], elfo: [5, -5, 0, 5, 10, 5, 0, 0], semielfo: [10, 0, 0, 0, 5, 0, 0, 0], enano: [0, 10, 15, 0, 0, 0, -10, -5],
        gnomo: [0, 5, 10, 5, 5, 10, -15, 0], mediano: [5, 5, 5, 10, 15, 5, -15, -5], orco: [-5, 0, 0, 0, 5, 5, 5, -10], semiorco: [-5, 5, 5, 0, 0, 5, 5, -10],
        semihumano: [-5, -5, 0, 10, 10, 10, 10, -10], tiefling: [0, 5, 0, 5, 10, 5, 0, 0], goliath: [-10, -5, -5, -10, -10, 5, 20, -10] },
      des: { 1: [-55, -50, -30, -60, -50], 2: [-50, -45, -30, -55, -45], 3: [-45, -40, -25, -50, -40], 4: [-40, -35, -25, -45, -35], 5: [-35, -30, -20, -40, -30],
        6: [-30, -25, -20, -35, -25], 7: [-25, -20, -15, -30, -20], 8: [-20, -15, -15, -25, -15], 9: [-15, -10, -10, -20, -10], 10: [-10, -5, -10, -15, -5],
        11: [-5, 0, -5, -10, 0], 12: [0, 0, 0, -5, 0], 13: [0, 0, 0, 0, 0], 14: [0, 0, 0, 0, 0], 15: [0, 0, 0, 0, 0], 16: [0, 5, 0, 0, 0], 17: [5, 10, 0, 5, 5],
        18: [10, 15, 5, 10, 10], 19: [15, 20, 10, 15, 15], 20: [15, 20, 10, 15, 15], 21: [20, 25, 15, 20, 20], 22: [25, 30, 20, 25, 25], 23: [30, 35, 25, 30, 30],
        24: [35, 40, 30, 35, 35], 25: [40, 45, 35, 40, 40] },
      armadura: { 'Sin armadura': [5, 0, 0, 10, 5, 0, 10, 0], Ligera: [-20, -5, -5, -10, -10, 0, 0, 0], Media: [-30, -10, -10, -20, -20, 0, -10, 0], Pesada: [-100, -100, -100, -100, -100, 0, -40, 0] },
      explorador: { move: [0, 15, 21, 27, 33, 40, 47, 55, 62, 70, 78, 86, 94, 99, 99, 99, 99, 99, 99, 99, 99], hide: [0, 10, 15, 20, 25, 31, 37, 43, 49, 56, 63, 70, 77, 85, 93, 99, 99, 99, 99, 99, 99] },
      barbaro: { climb: [0, 60, 65, 70, 75, 80, 85, 90, 95, 95, 95, 95, 95, 95, 95, 95, 95, 95, 95, 95, 95] },
      techno: { locks: [0, 15, 21, 27, 33, 40, 47, 55, 62, 70, 78, 86, 94, 99], traps: [0, 10, 15, 20, 25, 31, 37, 43, 49, 56, 63, 70, 77, 85, 93, 99] },
      avanzadas: [['bribe', 'Sobornar', 5], ['illusion', 'Detectar ilusiones', 10], ['magic', 'Detectar magia', 5], ['escape', 'Escapar de ataduras', 10], ['tunnel', 'Excavar túneles', 15]],
      avanzadasRaza: { humano: [0, 0, 0, 0, 0], elfo: [15, 0, 10, 0, -10], semielfo: [5, 5, 5, 0, -5], enano: [-5, 0, 10, 0, 10], gnomo: [5, 10, 5, 0, 5], mediano: [0, 0, 5, 10, 5],
        orco: [-10, 5, 5, 10, 5], semiorco: [-5, 0, 0, 5, 0], semihumano: [10, 5, 5, -10, 5], tiefling: [15, 5, 10, -10, -10], goliath: [5, 0, 0, -15, 10] },
      avanzadasDes: { 9: [-5, -10], 10: [-10, -5], 11: [-5, 0], 12: [0, 0], 13: [0, 0], 14: [0, 0], 15: [0, 0], 16: [0, 0], 17: [5, 0], 18: [10, 5], 19: [15, 10], 20: [20, 15], 21: [25, 20], 22: [30, 30] },
      avanzadasArmadura: { 'Sin armadura': [-10, 5, 10], Ligera: [5, -5, -5], Media: [-5, -5, -10], Pesada: [15, -40, -40] }
    },
    barbaro: {
      espalda: [0, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 95, 95, 95],
      escalar: [0, 60, 65, 70, 75, 80, 85, 90, 95, 95, 95, 95, 95, 95, 95, 95, 95, 95, 95, 95, 95],
      correrFrente: [null, '3d6+1', '3d6+2', '3d6+3', '3d6+4', '3d6+5', '3d6+6', '3d6+7', '3d6+8', '3d6+9', '3d6+10', '3d6+11', '3d6+12', '3d6+13', '3d6+14', '3d6+15', '3d6+16', '3d6+17', '3d6+18', '3d6+19', '3d6+20'],
      quietoFrente: [null, '1d6', '1d6+1', '1d6+1', '1d6+2', '1d6+2', '1d6+3', '1d6+3', '1d6+4', '1d6+4', '1d6+5', '1d6+5', '1d6+6', '1d6+6', '1d6+6', '1d6+6', '1d6+6', '1d6+6', '1d6+6', '1d6+6', '1d6+6'],
      correrArriba: [null, '2d4', '2d4+1', '2d4+1', '2d4+2', '2d4+2', '2d4+3', '2d4+3', '2d4+4', '2d4+4', '2d4+5', '2d4+5', '2d4+6', '2d4+6', '2d4+7', '2d4+7', '2d4+8', '2d4+8', '2d4+9', '2d4+9', '2d4+10'],
      quietoArriba: [null, '1d4', '1d4+1', '1d4+1', '1d4+2', '1d4+2', '1d4+3', '1d4+3', '1d4+3', '1d4+3', '1d4+3', '1d4+3', '1d4+3', '1d4+3', '1d4+3', '1d4+3', '1d4+3', '1d4+3', '1d4+3', '1d4+3', '1d4+3']
    }
  };
})((typeof window !== 'undefined' ? window : globalThis).ADND);
