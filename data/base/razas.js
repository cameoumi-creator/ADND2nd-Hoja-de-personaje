/* Razas base. mods = ajustes a características. variantes = subtipos con sus propios mods/nota.
   elecciones = decisiones del jugador (cada opción puede traer mods y efectos).
   efectos = bonos que el motor aplica: { objetivo, valor, nota }.
   Objetivos: FUE DES CON INT SAB CAR · thaco · ca · pg · PVM CVV PP AL CyO.
   thaco y salvaciones se SUMAN al número (un valor negativo mejora). */
ADND.base.razas = [
  {
    id: "humano",
    nombre: "Humano",
    mods: {},
    nota: "1 Dote lv 1",
    variantes: [],
    elecciones: []
  },
  {
    id: "elfo",
    nombre: "Elfo",
    mods: { DES: 1, CON: -1 },
    nota: "Infravisión 20 mts, penalti de -4 a la sorpresa si esta solo, a 30 mts del grupo o con otros elfos y medianos, puertas ocultas 1-3 en 1d6. +1 al golpe, espada larga, corta y arcos. ; Resistencia a sueño y conjuros de hechizo 90%",
    variantes: [],
    elecciones: []
  },
  {
    id: "semielfo",
    nombre: "Semielfo",
    mods: {},
    nota: "Infravisión 15 metros, encontrar puertas 1-2 en 1d6; Resistencia a sueño y conjuros de hechizo 30%",
    variantes: [],
    elecciones: []
  },
  {
    id: "enano",
    nombre: "Enano",
    mods: { CON: 1, CAR: -1 },
    nota: "Infravisión 20 mts, +1 al ataque contra orcos, medio orcos, goblins y hobgoblins, Detectar grado inclinación en pasadizo 1-5 en 1d6; Detectar antigüedad tunel/pasadizo 1-5 en 1d6; Detectar paredes que se deslizan/giran 1-4 en 1d6; Detectar trampas, pozos y caídas de albañilería 1-3 en 1d6; Determinar aprox. la profundidad bajo suelo 1-3 en 1d6",
    variantes: [],
    elecciones: []
  },
  {
    id: "gnomo",
    nombre: "Gnomo",
    mods: { INT: 1, SAB: -1 },
    nota: "Detectar grado inclinación en pasadizo 1-5 en 1d6; Detectar paredes, techos y suelos inseguros 1-7 en 1d10; Determinar aprox. la profundidad bajo suelo 1-4 en 1d6; Detectar aprox. la dirección bajo el suelo 1-3 en 1d6; Infravisión 20 metros; En melé los gnomos ganan 1 en sus tiradas de ataque contra kobolds o goblins. Gnolls, espantajos, ogros, trolls, ogros magos, gigantes o titanes tienen un –4 al atacar a un gnomo.",
    variantes: [],
    elecciones: []
  },
  {
    id: "mediano",
    nombre: "Mediano",
    mods: { FUE: -1, DES: 1 },
    nota: "Halflings recios puros 15%; Halflings con antepasados recios 25%; Infravisión recios puros 20 metros; Infravisión recios no puros 10 metros; Infravisión no recios no; Detectar pasillo ascendente/descendente (recios) 1-3 en 1d4; Determinar dirección (recios) 1-2 en 1d4; Bonificación +1 en tiradas de ataque con armas arrojadizas y hondas. Tienen la misma bonificación que los elfos para sorprender a un enemigo.",
    variantes: [
      { id: "normal", nombre: "Normal", nota: "No recio: sin infravisión ni capacidades de detección recias." },
      {
        id: "recio-puro",
        nombre: "Recio puro",
        nota: "Infravisión 20 metros; Detectar pasillo ascendente/descendente 1-3 en 1d4; Determinar dirección 1-2 en 1d4."
      },
      {
        id: "ascendencia-recia",
        nombre: "Ascendencia recia",
        nota: "Infravisión 10 metros; conserva las capacidades recias indicadas por la tabla racial."
      }
    ],
    elecciones: []
  },
  {
    id: "orco",
    nombre: "Orco",
    mods: { FUE: 1, DES: -2, CON: 1, INT: -2, SAB: -2, CAR: -2 },
    nota: "Infravisión de 10 metros.",
    variantes: [],
    elecciones: []
  },
  {
    id: "semiorco",
    nombre: "Semiorco",
    mods: { FUE: 1, CON: 1, CAR: -2 },
    nota: "Sin otros beneficios.",
    variantes: [],
    elecciones: []
  },
  {
    id: "semihumano",
    nombre: "Semihumano",
    mods: {},
    nota: "+1 a Fue, Des o Con; -1 a Int, Sab o Car; Visión en poca luz, ataque natural siguiente dado de desarmado. Rastreo sin penalti.",
    variantes: [],
    elecciones: [
      {
        id: "fisica",
        etiqueta: "+1 a una característica física",
        opciones: [
          {
            valor: "FUE",
            etiqueta: "Fuerza",
            mods: { FUE: 1 }
          },
          {
            valor: "DES",
            etiqueta: "Destreza",
            mods: { DES: 1 }
          },
          {
            valor: "CON",
            etiqueta: "Constitución",
            mods: { CON: 1 }
          }
        ]
      },
      {
        id: "mental",
        etiqueta: "−1 a una característica mental",
        opciones: [
          {
            valor: "INT",
            etiqueta: "Inteligencia",
            mods: { INT: -1 }
          },
          {
            valor: "SAB",
            etiqueta: "Sabiduría",
            mods: { SAB: -1 }
          },
          {
            valor: "CAR",
            etiqueta: "Carisma",
            mods: { CAR: -1 }
          }
        ]
      }
    ]
  },
  {
    id: "tiefling",
    nombre: "Tiefling",
    mods: { FUE: 1, DES: -1, INT: 1, CAR: -2 },
    nota: "Tira un D6 para característica Demoniaca 1 Cuernos (1d8 de daño) 2 Cola (1d4 de daño), puede cargar una daga. 3 Alas V 12 M C. 4 Garras (1d4 de daño) 5 Colmillos (1d4 de daño) puede sostenerse. 6 Scales +1 Ac Habilidad Extra 1d6 1 Ver en la Obscuridad. 2 +2 salvaciones vs veneno. 3 Conocer alineamiento 1/d. 4 Medio daño de fuego. 5 Fuerza Fantasmal 1/d 6 1% de MR / Lv.",
    variantes: [],
    elecciones: [
      {
        id: "demoniaca",
        etiqueta: "Característica demoníaca (1d6)",
        opciones: [
          { valor: "1", etiqueta: "1 · Cuernos (1d8 de daño)" },
          { valor: "2", etiqueta: "2 · Cola (1d4 de daño), puede cargar una daga" },
          { valor: "3", etiqueta: "3 · Alas V 12 M C" },
          { valor: "4", etiqueta: "4 · Garras (1d4 de daño)" },
          { valor: "5", etiqueta: "5 · Colmillos (1d4 de daño), puede sostenerse" },
          { valor: "6", etiqueta: "6 · Scales +1 Ac" }
        ]
      },
      {
        id: "extra",
        etiqueta: "Habilidad extra (1d6)",
        opciones: [
          { valor: "1", etiqueta: "1 · Ver en la oscuridad" },
          { valor: "2", etiqueta: "2 · +2 salvaciones vs veneno" },
          { valor: "3", etiqueta: "3 · Conocer alineamiento 1/d" },
          { valor: "4", etiqueta: "4 · Medio daño de fuego" },
          { valor: "5", etiqueta: "5 · Fuerza fantasmal 1/d" },
          { valor: "6", etiqueta: "6 · 1% de MR por nivel" }
        ]
      }
    ]
  },
  {
    id: "goliath",
    nombre: "Goliath",
    mods: { FUE: 4, CON: 2, INT: -2, SAB: -2, CAR: -2 },
    nota: "2.10 mts minimo de altura (Daño de gigantes)",
    variantes: [],
    elecciones: []
  }
];
