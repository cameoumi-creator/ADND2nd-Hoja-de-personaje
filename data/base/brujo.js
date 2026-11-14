/* Brujo (AD&D 2.5 homebrew): magia por petición a un patrón. Datos de la mesa.
   - Un solo pacto: da una lista de patrón (2 escuelas arcanas, 1 esfera divina y conjuros firma) y siete técnicas, una por rango de título (niveles 1, 4, 7, 10, 13, 16 y 19).
   - Tabla de espacios propia (intermedia entre bardo y mago; tope en nivel 6). Los niveles 16 y 19 de cada pacto y los costos en puntos son propuestas para ajustar. */
(function (A) {
  'use strict';
  A.base.brujo = {
    niveles: [1, 4, 7, 10, 13, 16, 19],
    titulos: ['Principiante', 'Intermedio', 'Avanzado', 'Santo', 'Real', 'Imperial', 'Divino'],
    tabla: [null,[1,0,0,0,0,0,0,0,0],[2,0,0,0,0,0,0,0,0],[2,1,0,0,0,0,0,0,0],[3,1,0,0,0,0,0,0,0],[3,2,0,0,0,0,0,0,0],[3,2,1,0,0,0,0,0,0],[3,3,1,0,0,0,0,0,0],[3,3,2,0,0,0,0,0,0],[4,3,2,1,0,0,0,0,0],[4,3,3,1,0,0,0,0,0],[4,4,3,2,0,0,0,0,0],[4,4,3,2,1,0,0,0,0],[4,4,4,3,1,0,0,0,0],[4,4,4,3,2,0,0,0,0],[5,4,4,3,2,1,0,0,0],[5,5,4,3,2,1,0,0,0],[5,5,4,4,3,2,0,0,0],[5,5,5,4,3,2,0,0,0],[5,5,5,4,4,3,0,0,0],[5,5,5,5,4,3,0,0,0],[6,5,5,5,4,3,0,0,0],[6,5,5,5,5,3,0,0,0],[6,6,5,5,5,4,0,0,0],[6,6,6,5,5,4,0,0,0],[6,6,6,6,5,4,0,0,0],[6,6,6,6,5,5,0,0,0],[6,6,6,6,6,5,0,0,0],[6,6,6,6,6,5,0,0,0],[6,6,6,6,6,6,0,0,0],[6,6,6,6,6,6,0,0,0]]
  };
  A.base.pactos = [
 {
  "id": "llama",
  "nombre": "Pacto de la Llama",
  "desc": "Fuego, brasas y furia: el patrón es una llama viva que exige ser alimentada.",
  "escuelas": [
   "evocacion",
   "alteracion"
  ],
  "esferas": [
   "elemental-fuego"
  ],
  "firma": [
   "cj-manos-ardientes",
   "cj-bola-de-fuego",
   "cj-muro-de-fuego",
   "cd-resistir-fuego-frio",
   "cd-invocar-elemental-del-fuego"
  ],
  "tecnicas": [
   {
    "nombre": "Invocar Llama",
    "efecto": "Invoca una llama pequeña, causando 1d4 de daño por fuego.",
    "pasiva": false,
    "costo": 1
   },
   {
    "nombre": "Esfera de Fuego",
    "efecto": "Lanza una esfera de fuego, causando 2d6 de daño por fuego en un radio de 3 metros.",
    "pasiva": false,
    "costo": 1
   },
   {
    "nombre": "Resistencia a Fuego",
    "efecto": "Daño de fuego 1/2",
    "pasiva": true,
    "costo": 0
   },
   {
    "nombre": "Fénix Renacido",
    "efecto": "Una vez al día, recuperas 50% de tus puntos de vida máximos al caer a 0 PV.",
    "pasiva": false,
    "costo": 2
   },
   {
    "nombre": "Tormenta de Llamas",
    "efecto": "Invoca una tormenta de fuego, causando 5d10 de daño por fuego en un radio de 10 metros.",
    "pasiva": false,
    "costo": 3
   },
   {
    "nombre": "Furia Ígnea",
    "efecto": "Tus conjuros de fuego causan un dado adicional de daño durante 1d6 rounds.",
    "pasiva": false,
    "costo": 3
   },
   {
    "nombre": "Avatar de Fuego",
    "efecto": "Te envuelves en llamas durante 1 turno: quien te golpea cuerpo a cuerpo recibe 2d6 de fuego y eres inmune al fuego normal.",
    "pasiva": false,
    "costo": 4
   }
  ]
 },
 {
  "id": "abismo",
  "nombre": "Pacto del Abismo",
  "desc": "Un señor de las profundidades concede poder a cambio de favores oscuros.",
  "escuelas": [
   "conjuracion",
   "necromancia"
  ],
  "esferas": [
   "caos"
  ],
  "firma": [
   "cj-toque-vampirico",
   "cj-miedo",
   "cj-rayo-debilitador",
   "cj-controlar-muertos-vivientes"
  ],
  "tecnicas": [
   {
    "nombre": "Llamar Imp Inferior",
    "efecto": "Invoca un imp que lucha a tu lado, #Atk: 1, 1d4 de daño, 6 hp, GAC0 = el del brujo.",
    "pasiva": false,
    "costo": 1
   },
   {
    "nombre": "Toxina Abisal",
    "efecto": "Tus ataques naturales cuerpo a cuerpo causan 1d6 de daño adicional de toxina abisal.",
    "pasiva": false,
    "costo": 1
   },
   {
    "nombre": "Resistencia al Abismo",
    "efecto": "+2 salvaciones vs Hechizo y Nigromancia.",
    "pasiva": true,
    "costo": 0
   },
   {
    "nombre": "Alas de Demonio",
    "efecto": "Obtienes alas demoníacas, permitiéndote volar a una velocidad de 12.",
    "pasiva": false,
    "costo": 2
   },
   {
    "nombre": "Invocar Demonio Mayor",
    "efecto": "Una vez al día, invocas un demonio mayor que lucha a tu lado durante una batalla. Pide algo a cambio.",
    "pasiva": false,
    "costo": 3
   },
   {
    "nombre": "Legión Infernal",
    "efecto": "Invocas 1d4 imps inferiores (como Llamar Imp Inferior) que luchan a tu lado durante un combate.",
    "pasiva": false,
    "costo": 3
   },
   {
    "nombre": "Drenar Abismo",
    "efecto": "Un ataque o conjuro drena 3d6 PV del objetivo (salvación niega la mitad) y los recuperas tú.",
    "pasiva": false,
    "costo": 4
   }
  ]
 },
 {
  "id": "enigma",
  "nombre": "Pacto del Enigma",
  "desc": "Un patrón de engaños y acertijos: la verdad es lo que él te deja ver.",
  "escuelas": [
   "ilusion",
   "encantamiento"
  ],
  "esferas": [
   "pensamiento"
  ],
  "firma": [
   "cj-fuerza-fantasmal",
   "cj-imagen-en-un-espejo",
   "cj-confusion",
   "cj-vision-falsa",
   "cj-ver-realmente"
  ],
  "tecnicas": [
   {
    "nombre": "Imagen Ilusoria",
    "efecto": "Crea una pequeña ilusión que distrae o confunde a un enemigo, save vs Vol o -4 AC, 1 turno.",
    "pasiva": false,
    "costo": 1
   },
   {
    "nombre": "Reflejo Espectral",
    "efecto": "Manifiesta un duplicado espectral que confunde a los enemigos, 50% de atacar la ilusión. Soporta 1 ataque.",
    "pasiva": false,
    "costo": 1
   },
   {
    "nombre": "Resistencia Mental",
    "efecto": "+2 salvaciones vs Ilusión y Hechizo.",
    "pasiva": true,
    "costo": 0
   },
   {
    "nombre": "Visión Verdadera",
    "efecto": "Puedes ver a través de ilusiones y detectar seres invisibles.",
    "pasiva": false,
    "costo": 2
   },
   {
    "nombre": "Laberinto Ilusorio",
    "efecto": "Una vez al día, atrapa a los enemigos en un laberinto ilusorio, dejándolos desorientados durante 1d4 rounds. Salvación niega.",
    "pasiva": false,
    "costo": 3
   },
   {
    "nombre": "Doble Engaño",
    "efecto": "Creas tres reflejos espectrales (como Reflejo Espectral) a la vez.",
    "pasiva": false,
    "costo": 3
   },
   {
    "nombre": "Realidad Maleable",
    "efecto": "Una de tus ilusiones se vuelve real durante 1d4 rounds.",
    "pasiva": false,
    "costo": 4
   }
  ]
 },
 {
  "id": "ancestro",
  "nombre": "Pacto del Ancestro",
  "desc": "Los espíritus de tu linaje te guían, protegen y a veces te reclaman.",
  "escuelas": [
   "adivinacion",
   "abjuracion"
  ],
  "esferas": [
   "curadora"
  ],
  "firma": [
   "cd-hablar-con-los-muertos",
   "cd-bendicion",
   "cd-ayuda",
   "cd-curar-heridas-ligeras",
   "cd-curar-heridas-serias"
  ],
  "tecnicas": [
   {
    "nombre": "Invocar Espíritu Guía",
    "efecto": "Invoca un espíritu ancestral, +2 a tiradas de pericias de conocimiento.",
    "pasiva": false,
    "costo": 1
   },
   {
    "nombre": "Curación Ancestral",
    "efecto": "Curarte a ti mismo o a un aliado por 2d8 puntos de vida una vez al día.",
    "pasiva": false,
    "costo": 1
   },
   {
    "nombre": "Resistencia Espiritual",
    "efecto": "50% de resistencia a la escuela de hechizo.",
    "pasiva": true,
    "costo": 0
   },
   {
    "nombre": "Escudo del Ancestro",
    "efecto": "Invoca un escudo espiritual que absorbe hasta 10 puntos de daño por ataque durante 1d4 rounds / batalla.",
    "pasiva": false,
    "costo": 2
   },
   {
    "nombre": "Consejo de los Ancestros",
    "efecto": "Llama a un consejo de espíritus que mejora tus habilidades, proporcionando +2 en todas las tiradas durante 1d6 turnos, una vez al día.",
    "pasiva": false,
    "costo": 3
   },
   {
    "nombre": "Llamada de los Caídos",
    "efecto": "Devuelves a 1 PV a un aliado que cayó hace menos de 1 turno. Una vez por semana.",
    "pasiva": false,
    "costo": 3
   },
   {
    "nombre": "Legado Eterno",
    "efecto": "Un espíritu ancestral combate a tu lado durante un combate, como un aliado de la mitad de tu nivel.",
    "pasiva": false,
    "costo": 4
   }
  ]
 },
 {
  "id": "umbral",
  "nombre": "Pacto del Umbral",
  "desc": "Un patrón que habita entre la luz y la sombra, entre un lugar y otro.",
  "escuelas": [
   "alteracion",
   "conjuracion"
  ],
  "esferas": [
   "astral"
  ],
  "firma": [
   "cj-oscuridad-radio-5-metros",
   "cj-puerta-dimensional",
   "cj-puerta-de-sombra",
   "cj-magia-de-las-sombras",
   "cj-teleportacion"
  ],
  "tecnicas": [
   {
    "nombre": "Manipulación de Sombras",
    "efecto": "Permite moverte y ocultarte en sombras, como un ranger de tu nivel.",
    "pasiva": false,
    "costo": 1
   },
   {
    "nombre": "Portal de Oscuridad",
    "efecto": "Crea un portal de oscuridad para teletransportarte a corta distancia (10 mts).",
    "pasiva": false,
    "costo": 1
   },
   {
    "nombre": "Resistencia a la Energía",
    "efecto": "1/2 daño de ataques de energía.",
    "pasiva": true,
    "costo": 0
   },
   {
    "nombre": "Velo de Sombras",
    "efecto": "Envuelve en sombras, penalti a golpearte de -4 con ataques físicos.",
    "pasiva": false,
    "costo": 2
   },
   {
    "nombre": "Brecha en la Realidad",
    "efecto": "Abre una brecha en la realidad, causando 6d10 de daño a los enemigos en un radio de 6 metros. Una vez al día.",
    "pasiva": false,
    "costo": 3
   },
   {
    "nombre": "Paso Umbrío",
    "efecto": "Te teletransportas hasta 100 metros a un lugar que veas o que conozcas.",
    "pasiva": false,
    "costo": 3
   },
   {
    "nombre": "Eclipse",
    "efecto": "Oscuridad total en 30 metros durante 1d6 rounds: tus enemigos atacan con -4 y tú ves con normalidad.",
    "pasiva": false,
    "costo": 4
   }
  ]
 },
 {
  "id": "dragon",
  "nombre": "Pacto del Dragón",
  "desc": "La sangre de un dragón antiguo corre por tus venas gracias al pacto.",
  "escuelas": [
   "evocacion",
   "abjuracion"
  ],
  "esferas": [
   "proteccion"
  ],
  "firma": [
   "cj-armadura",
   "cj-piel-de-piedra",
   "cj-golpe-de-rayo",
   "cj-volar",
   "cd-proteccion-contra-el-rayo"
  ],
  "tecnicas": [
   {
    "nombre": "Aliento Dracónico",
    "efecto": "Exhala una ráfaga elemental, causando 2d6 de daño en un cono de 15 pies. Una vez por combate.",
    "pasiva": false,
    "costo": 1
   },
   {
    "nombre": "Escamas Dracónicas",
    "efecto": "Aumenta tu CA en +2 debido a las escamas dracónicas.",
    "pasiva": true,
    "costo": 0
   },
   {
    "nombre": "Fuerza Dracónica",
    "efecto": "Aumenta tu fuerza en 2.",
    "pasiva": true,
    "costo": 0
   },
   {
    "nombre": "Resistencia Elemental",
    "efecto": "Ganas resistencia al daño elemental de tu dragón (fuego, hielo, relámpago, ácido, veneno).",
    "pasiva": true,
    "costo": 0
   },
   {
    "nombre": "Transformación Dracónica",
    "efecto": "Una vez al día, te transformas en un dragón durante 1 turno, categoría = Lv-10.",
    "pasiva": false,
    "costo": 3
   },
   {
    "nombre": "Garras de Dragón",
    "efecto": "Durante un combate, tus ataques causan 1d8 de daño elemental adicional.",
    "pasiva": false,
    "costo": 3
   },
   {
    "nombre": "Sangre de Dragón",
    "efecto": "Eres inmune al elemento de tu dragón y ganas +2 a la CA.",
    "pasiva": true,
    "costo": 0
   }
  ]
 }
];
})((typeof window !== 'undefined' ? window : globalThis).ADND);
