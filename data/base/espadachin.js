/* Espadachín: tres escuelas de técnicas, siete rangos cada una (una elección en los niveles 1, 4, 7, 10, 13, 16 y 19).
   En los efectos, "MD" es el ajuste de daño por Fuerza; la hoja lo sustituye por tu valor. */
(function (A) {
  'use strict';
  A.base.espadachin = {
    niveles: [1, 4, 7, 10, 13, 16, 19],
    titulos: ['Principiante', 'Intermedio', 'Avanzado', 'Santo', 'Real', 'Imperial', 'Divino'],
    escuelas: [{ id: 'espada', nombre: 'Dios de la Espada' }, { id: 'agua', nombre: 'Dios del Agua' }, { id: 'norte', nombre: 'Dios del Norte' }],
    tecnicas: [
      [['Golpe Veloz', 'Realiza un ataque con un dado adicional de daño.'], ['Bloqueo Básico', '+1 Parry'], ['Golpe Sorpresa', 'El segundo ataque del round hace un dado adicional de daño']],
      [['Corte Relámpago', 'Realiza un ataque adicional.'], ['Desvío de Agua', 'Reduce el daño de un ataque en 1d10 + MD.'], ['Truco del Norte', '+3 al golpe']],
      [['Doble Corte', 'Realiza dos ataques; el objetivo puede quedar aturdido (salvación vs. Parálisis/Veneno/Muerte).'], ['Contraataque Fluido', 'Añade 1d10 + MD a un ataque de oportunidad'], ['Ataque Versátil', 'Añade un dado de daño a todos tus ataques del round']],
      [['Corte de Luz', 'Ataque con 2 dados adicionales de daño; el objetivo puede quedar cegado (salvación vs. Parálisis/Veneno/Muerte).'], ['Muro de Agua', 'Parrear proyectiles'], ['Táctica del Norte', 'Un ataque de oportunidad puede aturdir al enemigo.']],
      [['Corte Divino', 'Ataque con 3 dados adicionales de daño; enemigos cercanos pueden quedar cegados (salvación vs. Parálisis/Veneno/Muerte).'], ['Torrente Defensivo', 'Reduce el daño de un ataque en 2d10 + MD y realiza ataque de oportunidad.'], ['Maestro del Norte', 'Añade 2 dados de daño a todos tus ataques del round']],
      [['Corte Celestial', 'Ataque con 4 dados adicionales de daño; el objetivo puede quedar paralizado (salvación vs. Parálisis/Veneno/Muerte).'], ['Escudo de Agua', '1/2 de daño físico, +2 al CA 1 round/MD'], ['Estrategia del Norte', 'No cede ataques de oportunidad durante 1 round/MD']],
      [['Espada de Dios', 'Ataque con 5 dados adicionales de daño; enemigos cercanos pueden quedar cegados y aturdidos (salvación vs. Parálisis/Veneno/Muerte).'], ['Ola Divina', 'Puede derribar a todos los enemigos alrededor, luego realiza ataque de oportunidad a los derribados.'], ['Dominio del Norte', 'Dos ataques a todo alrededor, +3 dados de daño c/u']]
    ]
  };
  /* Cada escuela base como objeto completo (igual que las propias de Homebrew): siete técnicas, una por rango. */
  A.base.escuelasEspadachin = A.base.espadachin.escuelas.map((e, j) => ({ id: e.id, nombre: e.nombre, tecnicas: A.base.espadachin.tecnicas.map(r => ({ nombre: r[j][0], efecto: r[j][1] })) }));
})((typeof window !== 'undefined' ? window : globalThis).ADND);
