/* Reglas de magia (arcana): escuelas con sus especialistas, espacios del mago por nivel (1–30) y linajes del hechicero.
   Espacios: tabla de AD&D 2.5 (niveles 16 y 20 corregidos); del 26 al 30 son de la mesa. Los poderes de nivel 8/11/14 y la prohibición de magia salvaje son de las reglas opcionales de Player's Option. */
(function (A) {
  'use strict';
  A.base.escuelasMagia = [
 {
  "id": "abjuracion",
  "nombre": "Abjuración",
  "desc": "",
  "especialista": {
   "nombre": "Abjurador",
   "prohibidas": [
    "alteracion",
    "ilusion"
   ],
   "poderes": [
    {
     "nivel": 8,
     "texto": "+1 a las salvaciones contra parálisis, veneno y magia de muerte."
    },
    {
     "nivel": 11,
     "texto": "+1 a la CA (mágico)."
    },
    {
     "nivel": 14,
     "texto": "Inmunidad a todas las formas de conjuros de retener."
    }
   ]
  }
 },
 {
  "id": "adivinacion",
  "nombre": "Adivinación",
  "desc": "",
  "especialista": {
   "nombre": "Adivino",
   "prohibidas": [
    "conjuracion"
   ],
   "poderes": [
    {
     "nivel": 11,
     "texto": "3 veces al día puede lanzar hallar trampas (1 round de concentración)."
    },
    {
     "nivel": 14,
     "texto": "Inmunidad a toda forma de espionaje (conjuros de visión a distancia)."
    }
   ]
  }
 },
 {
  "id": "alteracion",
  "nombre": "Alteración",
  "desc": "",
  "especialista": {
   "nombre": "Transmutador",
   "prohibidas": [
    "abjuracion",
    "necromancia"
   ],
   "poderes": [
    {
     "nivel": 8,
     "texto": "Las salvaciones contra alteración suben a +2 en total."
    },
    {
     "nivel": 11,
     "texto": "Las salvaciones contra alteración suben a +3 en total."
    },
    {
     "nivel": 11,
     "texto": "Estos bonos valen también contra objetos y varitas de tipo alteración."
    }
   ]
  }
 },
 {
  "id": "conjuracion",
  "nombre": "Conjuración/Llamada",
  "desc": "",
  "especialista": {
   "nombre": "Conjurador",
   "prohibidas": [
    "adivinacion",
    "evocacion"
   ],
   "poderes": [
    {
     "nivel": 11,
     "texto": "Lanza conjuros de conjuración/llamada sin componentes materiales."
    },
    {
     "nivel": 14,
     "texto": "3 veces al día disipa al instante criaturas conjuradas por un oponente: hasta 10 DG de criaturas (máximo 5 DG por criatura); 1 round de concentración y solo componente somático."
    }
   ]
  }
 },
 {
  "id": "encantamiento",
  "nombre": "Encantamiento/Hechizo",
  "desc": ""
 },
 {
  "id": "evocacion",
  "nombre": "Invocación/Evocación",
  "desc": "",
  "especialista": {
   "nombre": "Invocador",
   "prohibidas": [
    "encantamiento",
    "conjuracion"
   ],
   "poderes": [
    {
     "nivel": 8,
     "texto": "Las salvaciones contra invocación/evocación suben a +2 en total."
    },
    {
     "nivel": 11,
     "texto": "Las salvaciones contra invocación/evocación suben a +3 en total."
    },
    {
     "nivel": 14,
     "texto": "Inmunidad a un conjuro de invocación/evocación de nivel 3 o menor (a elección del jugador). No cubre objetos mágicos similares ni armas de aliento."
    }
   ]
  }
 },
 {
  "id": "ilusion",
  "nombre": "Ilusión/Fantasma",
  "desc": "",
  "especialista": {
   "nombre": "Ilusionista",
   "prohibidas": [
    "necromancia",
    "evocacion",
    "abjuracion"
   ],
   "poderes": [
    {
     "nivel": 8,
     "texto": "Las salvaciones contra ilusión/fantasma suben a +2 en total."
    },
    {
     "nivel": 11,
     "texto": "3 veces al día puede lanzar disipar fuerza fantasmal o disipar fuerza fantasmal mejorada: 50% base, ±5% por nivel de diferencia con quien la lanzó; alcance 30 yardas (≈27 m), tiempo de lanzamiento 1, solo somático. Usarlo sobre algo real gasta una de las 3 cargas del día."
    }
   ]
  }
 },
 {
  "id": "necromancia",
  "nombre": "Necromancia",
  "desc": "",
  "especialista": {
   "nombre": "Nigromante",
   "prohibidas": [
    "ilusion",
    "encantamiento"
   ],
   "poderes": [
    {
     "nivel": 8,
     "texto": "Las salvaciones contra necromancia suben a +2 en total."
    },
    {
     "nivel": 11,
     "texto": "Gana una habilidad sortílega de hablar con los muertos: solo somático, 1 round de concentración, dura 1 turno y permite hacer cuatro preguntas al espíritu."
    },
    {
     "nivel": 14,
     "texto": "+2 a las salvaciones contra drenaje de fuerza, parálisis y otros efectos de ataques de no muertos. Puede tirar salvación contra magia de muerte con −4 para evitar cualquier ataque de no muerto que normalmente no permita salvación."
    }
   ]
  }
 },
 {
  "id": "salvaje",
  "nombre": "Magia salvaje",
  "desc": "Escuela del Tomo de Magias. Los conjuros salvajes conservan además su escuela original.",
  "especialista": {
   "nombre": "Mago salvaje",
   "prohibidas": [],
   "aprender": { "propio": 10, "otras": -5 },
   "salv": { "propio": 0, "ajeno": 0 },
   "extra": true,
   "poderes": [],
   "rasgos": [
    "Está sujeto a los caprichos del azar: cada conjuro que lanza sigue las reglas de magia salvaje.",
    "Sin ajustes a las salvaciones, ni las suyas ni las de sus blancos.",
    "Aprende un conjuro de magia salvaje por nivel de personaje.",
    "Ninguna escuela de magia le está prohibida.",
    "Al investigar un conjuro de magia salvaje nuevo, se trata como si fuera un nivel menor.",
    "Controla el 50% de las veces el resultado de los objetos mágicos que dependen del azar."
   ]
  }
 }
];
  A.base.especialistaBase = "";
  A.base.espaciosMago = [null,[1,0,0,0,0,0,0,0,0],[2,0,0,0,0,0,0,0,0],[2,1,0,0,0,0,0,0,0],[3,2,0,0,0,0,0,0,0],[4,2,1,0,0,0,0,0,0],[4,2,2,0,0,0,0,0,0],[4,3,2,1,0,0,0,0,0],[4,3,3,2,0,0,0,0,0],[4,3,3,2,1,0,0,0,0],[4,4,3,2,2,0,0,0,0],[4,4,4,3,3,0,0,0,0],[4,4,4,4,4,1,0,0,0],[5,5,5,4,4,2,0,0,0],[5,5,5,4,4,2,1,0,0],[5,5,5,5,5,2,1,0,0],[5,5,5,5,5,3,2,1,0],[5,5,5,5,5,3,3,2,0],[5,5,5,5,5,3,3,2,1],[5,5,5,5,5,3,3,3,1],[5,5,5,5,5,4,3,3,2],[5,5,5,5,5,4,4,4,2],[5,5,5,5,5,5,5,4,3],[5,5,5,5,5,5,5,5,3],[5,5,5,5,5,5,5,5,4],[5,5,5,5,5,5,5,5,5],[6,6,6,6,5,5,5,5,5],[6,6,6,6,6,6,6,6,6],[6,6,6,6,6,6,6,6,6],[7,7,7,7,6,6,6,6,6],[7,7,7,7,7,7,7,6,6]];
  A.base.linajes = [
 {
  "id": "draconico",
  "nombre": "Dracónico",
  "desc": "Tu sangre guarda un linaje de dragones.",
  "habilidades": [
   {
    "nivel": 1,
    "nombre": "Resiliencia dracónica",
    "texto": "Mejora tu CA en 3 puntos y te da 3 PG."
   },
   {
    "nivel": 6,
    "nombre": "Afinidad elemental",
    "texto": "Elige el elemento de tu dragón: +2 a las salvaciones contra ese elemento y suma tu mod. de CAR al daño de tus conjuros de ese elemento."
   },
   {
    "nivel": 12,
    "nombre": "Alas de dragón",
    "texto": "Vuelo igual a tu velocidad de movimiento."
   },
   {
    "nivel": 18,
    "nombre": "Presencia dracónica",
    "texto": "Miedo de dragón en un radio de 20 m."
   }
  ],
  "conjuros": [
   [
    {
     "id": "cj-manos-ardientes"
    },
    {
     "id": "cj-armadura"
    }
   ],
   [
    {
     "id": "cj-flecha-acida-de-melf"
    },
    {
     "id": "cj-esfera-llameante"
    }
   ],
   [
    {
     "id": "cj-bola-de-fuego"
    },
    {
     "id": "cj-volar"
    }
   ],
   [
    {
     "id": "cj-muro-de-fuego"
    },
    {
     "id": "cj-piel-de-piedra"
    }
   ],
   [
    {
     "id": "cj-cono-de-frio"
    },
    {
     "id": "cj-dominacion"
    }
   ],
   [
    {
     "id": "cj-cadena-de-rayos"
    },
    {
     "id": "cj-niebla-letal"
    }
   ],
   [
    {
     "id": "cj-bola-de-fuego-de-estallido-retardado"
    },
    {
     "id": "cj-rociada-prismatica"
    }
   ],
   [
    {
     "id": "cj-nube-incendiaria"
    },
    {
     "id": "cj-palabra-poderosa-cegar"
    }
   ],
   [
    {
     "id": "cj-enjambre-de-meteoros"
    },
    {
     "id": "cj-deseo"
    }
   ]
  ]
 },
 {
  "id": "salvaje",
  "nombre": "Salvaje",
  "desc": "Tu magia nace del caos.",
  "habilidades": [
   {
    "nivel": 1,
    "nombre": "Magia salvaje",
    "texto": "Tu fuente de magia es el caos: cada vez que lanzas un conjuro, tiras en la tabla de magia salvaje del Tomo de Magias, con sus reglas de magia salvaje."
   },
   {
    "nivel": 6,
    "nombre": "Alma salvaje",
    "texto": "Cada día obtienes +2 a las salvaciones contra una escuela de conjuros al azar."
   },
   {
    "nivel": 12,
    "nombre": "Afinidad mágica",
    "texto": "+2 a las salvaciones contra la escuela de tu alma salvaje y suma tu mod. de CAR a los conjuros de esa escuela."
   },
   {
    "nivel": 18,
    "nombre": "Dominio de la ola",
    "texto": "Tiras dos veces en la tabla de magia salvaje y eliges cualquiera de los dos resultados."
   }
  ],
  "conjuros": [
   [
    {
     "id": "cj-temerario-recurso-de-nahal"
    },
    {
     "id": "cj-agrandar"
    }
   ],
   [
    {
     "id": "cj-imagen-en-un-espejo"
    },
    {
     "id": "cj-incontrolable-risa-horrible-de-tasha"
    }
   ],
   [
    {
     "id": "cj-parpadeo"
    },
    {
     "id": "cj-disipar-magia"
    }
   ],
   [
    {
     "id": "cj-polimorfizar-a-otro"
    },
    {
     "id": "cj-mala-suerte"
    }
   ],
   [
    {
     "id": "cj-vortice"
    },
    {
     "id": "cj-teleportacion"
    }
   ],
   [
    {
     "id": "cj-desintegrar"
    },
    {
     "id": "cj-golpe-salvaje"
    }
   ],
   [
    {
     "id": "cj-invertir-gravedad"
    },
    {
     "id": "cj-rociada-prismatica"
    }
   ],
   [
    {
     "id": "cj-golpe-caleidoscopico-de-gunther"
    },
    {
     "id": "cj-hechizar-masas"
    }
   ],
   [
    {
     "id": "cj-deseo"
    },
    {
     "id": "cj-viento-salvaje"
    }
   ]
  ]
 },
 {
  "id": "sombras",
  "nombre": "Sombras",
  "desc": "Un linaje tocado por la oscuridad.",
  "habilidades": [
   {
    "nivel": 1,
    "nombre": "Ojo de sombras",
    "texto": "Infravisión de 40 m."
   },
   {
    "nivel": 6,
    "nombre": "Paso de las sombras",
    "texto": "Te teletransportas hasta 20 m, sin quedar aturdido, a un espacio en sombras, como movimiento."
   },
   {
    "nivel": 12,
    "nombre": "Resistir la oscuridad",
    "texto": "+2 a las salvaciones contra las escuelas de ilusión y necromancia."
   },
   {
    "nivel": 18,
    "nombre": "Forma de sombras",
    "texto": "Puedes lanzar a voluntad el conjuro forma de sombras, pero dura solo 1 turno."
   }
  ],
  "conjuros": [
   [
    {
     "id": "cj-fuerza-fantasmal"
    },
    {
     "id": "cj-sirviente-invisible"
    }
   ],
   [
    {
     "id": "cj-oscuridad-radio-5-metros"
    },
    {
     "id": "cj-silueta-imprecisa"
    }
   ],
   [
    {
     "id": "cj-fingir-muerte"
    },
    {
     "id": "cj-toque-vampirico"
    }
   ],
   [
    {
     "id": "cj-invisibilidad-mejorada"
    },
    {
     "id": "cj-asesino-fantasma"
    }
   ],
   [
    {
     "id": "cj-nube-letal"
    },
    {
     "id": "cj-sueno"
    }
   ],
   [
    {
     "id": "cj-sombras"
    },
    {
     "id": "cj-velo"
    }
   ],
   [
    {
     "id": "cj-dedo-de-muerte"
    },
    {
     "id": "cj-gato-de-sombra"
    }
   ],
   [
    {
     "id": "cj-horrible-marchitamiento-de-abldalzim"
    },
    {
     "id": "cj-pantalla"
    }
   ],
   [
    {
     "id": "cj-palabra-poderosa-matar"
    },
    {
     "id": "cj-lamento-del-banshee"
    }
   ]
  ]
 },
 {
  "id": "celestial",
  "nombre": "Celestial",
  "desc": "Un linaje de luz.",
  "habilidades": [
   {
    "nivel": 1,
    "nombre": "Luz divina",
    "texto": "Conjuros de luz y curar heridas ligeras, 1 vez al día."
   },
   {
    "nivel": 6,
    "nombre": "Resistencia divina",
    "texto": "+2 a las salvaciones contra criaturas malvadas."
   },
   {
    "nivel": 12,
    "nombre": "Alas celestiales",
    "texto": "Vuelo igual a tu velocidad de movimiento."
   },
   {
    "nivel": 18,
    "nombre": "Presencia divina",
    "texto": "Aura de autoridad en un radio de 20 m."
   }
  ],
  "conjuros": [
   [
    {
     "id": "cd-curar-heridas-ligeras"
    },
    {
     "id": "cj-luz"
    }
   ],
   [
    {
     "id": "cd-resistir-fuego-frio"
    },
    {
     "id": "cd-piel-de-corteza"
    }
   ],
   [
    {
     "id": "cd-vestimenta-magica"
    },
    {
     "id": "cd-linea-de-proteccion"
    }
   ],
   [
    {
     "id": "cd-fortalecer"
    },
    {
     "id": "cj-proteccion-contra-el-mal-radio-3-metros"
    }
   ],
   [
    {
     "id": "cd-rayo-de-luna"
    },
    {
     "id": "cd-disipar-el-mal"
    }
   ],
   [
    {
     "id": "cd-curar"
    },
    {
     "id": "cd-barrera-de-hojas"
    }
   ],
   [
    {
     "id": "cd-rayo-de-sol"
    },
    {
     "id": "cj-simbolo"
    }
   ],
   [
    {
     "id": "cj-nube-incendiaria"
    },
    {
     "id": "cj-pedir"
    }
   ],
   [
    {
     "id": "cj-cambiar-de-forma"
    },
    {
     "id": "cj-esfera-prismatica"
    }
   ]
  ]
 },
 {
  "id": "abisal",
  "nombre": "Abisal",
  "desc": "Sangre de demonio corre por tus venas.",
  "habilidades": [
   {
    "nivel": 1,
    "nombre": "Apariencia del Abismo",
    "texto": "Penalizador de 2 a la reacción, mitad de daño de fuego y rasgos demoníacos."
   },
   {
    "nivel": 6,
    "nombre": "Toque del abismo",
    "texto": "Ataque cuerpo a cuerpo ajustado por DES que causa 2d10 + mod. de CAR de daño de fuego, 1 vez al día por punto de mod. de CAR."
   },
   {
    "nivel": 12,
    "nombre": "Presencia aterradora",
    "texto": "Miedo en un radio de 20 m."
   },
   {
    "nivel": 18,
    "nombre": "Forma del abismo",
    "texto": "Adquiere las defensas de un demonio del Abismo."
   }
  ],
  "conjuros": [
   [
    {
     "id": "cj-aparicion"
    },
    {
     "id": "cd-curar-heridas-ligeras",
     "inv": true
    }
   ],
   [
    {
     "id": "cj-ceguera"
    },
    {
     "id": "cj-rayo-debilitador"
    }
   ],
   [
    {
     "id": "cj-maleficio-menor"
    },
    {
     "id": "cj-fuerza-espectral"
    }
   ],
   [
    {
     "id": "cj-tentaculos-negros-de-evard"
    },
    {
     "id": "cj-asesino-fantasma"
    }
   ],
   [
    {
     "id": "cj-nube-letal"
    },
    {
     "id": "cj-contagio"
    }
   ],
   [
    {
     "id": "cj-transformacion-de-tenser"
    },
    {
     "id": "cj-conjuro-de-muerte"
    }
   ],
   [
    {
     "id": "cj-dedo-de-muerte"
    },
    {
     "id": "cj-destierro"
    }
   ],
   [
    {
     "id": "cj-horrible-marchitamiento-de-abldalzim"
    },
    {
     "id": "cj-atrapar-el-alma"
    }
   ],
   [
    {
     "id": "cj-palabra-poderosa-matar"
    },
    {
     "id": "cj-puerta"
    }
   ]
  ]
 },
 {
  "id": "feerico",
  "nombre": "Feérico",
  "desc": "Un linaje del Reino de las Hadas.",
  "habilidades": [
   {
    "nivel": 1,
    "nombre": "Travesura de hada",
    "texto": "Puede usar un cantrip a voluntad y hechizar persona 1 vez al día."
   },
   {
    "nivel": 6,
    "nombre": "Paso feérico",
    "texto": "Puedes teletransportarte 10 m, tantas veces al día como tu mod. de CAR."
   },
   {
    "nivel": 12,
    "nombre": "Resistencia de las hadas",
    "texto": "Inmune al miedo y con bono a las salvaciones contra control mental e ilusión."
   },
   {
    "nivel": 18,
    "nombre": "Presencia de hada",
    "texto": "En un radio de 20 m, tus aliados reciben +2 a las tiradas de salvación, de ataque o a la CA."
   }
  ],
  "conjuros": [
   [
    {
     "id": "cj-hechizar-persona"
    },
    {
     "id": "cj-rociada-de-color"
    }
   ],
   [
    {
     "id": "cj-levitar"
    },
    {
     "id": "cj-imagen-en-un-espejo"
    }
   ],
   [
    {
     "id": "cj-invisibilidad-radio-3-metros"
    },
    {
     "id": "cj-sugestion"
    }
   ],
   [
    {
     "id": "cj-motivo-arco-iris"
    },
    {
     "id": "cj-polimorfizarse-a-si-mismo"
    }
   ],
   [
    {
     "id": "cj-dominacion"
    },
    {
     "id": "cj-apariencia"
    }
   ],
   [
    {
     "id": "cj-sugestion-de-masas"
    },
    {
     "id": "cj-erudicion-en-leyendas"
    }
   ],
   [
    {
     "id": "cj-simulacro"
    },
    {
     "id": "cj-palabra-poderosa-aturdir"
    }
   ],
   [
    {
     "id": "cj-hechizar-masas"
    },
    {
     "id": "cj-irresistible-danza-de-otto"
    }
   ],
   [
    {
     "id": "cj-auxilio"
    },
    {
     "id": "cj-esfera-prismatica"
    }
   ]
  ]
 },
 {
  "id": "tormenta",
  "nombre": "Tormenta",
  "desc": "Un linaje de elementos desatados.",
  "habilidades": [
   {
    "nivel": 1,
    "nombre": "Afinidad elemental",
    "texto": "Elige tu elemento: +2 a las salvaciones contra él y suma tu mod. de CAR al daño de tus conjuros de ese elemento."
   },
   {
    "nivel": 6,
    "nombre": "Resistencia elemental",
    "texto": "Mitad de daño del elemento elegido."
   },
   {
    "nivel": 12,
    "nombre": "Viaje elemental",
    "texto": "Puedes moverte a través de tu elemento a tu velocidad normal."
   },
   {
    "nivel": 18,
    "nombre": "Forma elemental",
    "texto": "Puedes transformarte a voluntad en un genasi de tu elemento."
   }
  ],
  "conjuros": [
   [
    {
     "id": "cj-presa-sacudidora"
    },
    {
     "id": "cj-puno-de-piedra"
    }
   ],
   [
    {
     "id": "cj-cabalgar-el-viento"
    },
    {
     "id": "cj-nube-de-niebla"
    }
   ],
   [
    {
     "id": "cj-golpe-de-rayo"
    },
    {
     "id": "cj-soplo-de-viento"
    }
   ],
   [
    {
     "id": "cj-tormenta-de-hielo"
    },
    {
     "id": "cj-vara-de-truenos"
    }
   ],
   [
    {
     "id": "cj-agua-aerea"
    },
    {
     "id": "cj-cono-de-frio"
    }
   ],
   [
    {
     "id": "cj-cadena-de-rayos"
    },
    {
     "id": "cj-bajar-agua"
    }
   ],
   [
    {
     "id": "cj-rociada-prismatica"
    },
    {
     "id": "cj-bola-de-fuego-de-estallido-retardado"
    }
   ],
   [
    {
     "id": "cj-nube-incendiaria"
    },
    {
     "id": "cj-esfera-telequinetica-de-otiluke"
    }
   ],
   [
    {
     "id": "cj-enjambre-de-meteoros"
    },
    {
     "id": "cj-aura-elemental"
    }
   ]
  ]
 },
 {
  "id": "sangre",
  "nombre": "Sangre",
  "desc": "Tu poder se paga con tu propia sangre.",
  "habilidades": [
   {
    "nivel": 1,
    "nombre": "Magia de sangre",
    "texto": "Puedes usar tu propia sangre para potenciar tus conjuros: al lanzar un conjuro de daño, puedes perder tantos PG como el nivel del conjuro para aumentar su daño en 1d6 por nivel del conjuro."
   },
   {
    "nivel": 6,
    "nombre": "Vínculo de sangre",
    "texto": "Una vez por combate marcas a una criatura; cada vez que le haces daño con magia de sangre, recuperas 1/4 del daño causado."
   },
   {
    "nivel": 12,
    "nombre": "Ritual de sangre",
    "texto": "Puedes hacer un ritual que sacrifica PG para recuperar conjuros: por cada 5 PG que sacrifiques, recuperas 1 nivel de conjuro (1 punto de conjuro por nivel)."
   },
   {
    "nivel": 18,
    "nombre": "Maestría de la sangre",
    "texto": "Con tu acción controlas la sangre de un enemigo que veas a 20 m: debe hacer una salvación contra parálisis, veneno y muerte (PVM); si falla, queda paralizado 1 turno. Puedes usarlo 1 vez al día por punto de tu mod. de CAR."
   }
  ],
  "conjuros": [
   [
    {
     "id": "cj-toque-helado"
    },
    {
     "id": "cj-dormir"
    }
   ],
   [
    {
     "id": "cj-irritacion"
    },
    {
     "id": "cj-rayo-debilitador"
    }
   ],
   [
    {
     "id": "cj-toque-vampirico"
    },
    {
     "id": "cj-retener-personas"
    }
   ],
   [
    {
     "id": "cj-debilidad"
    },
    {
     "id": "cj-contagio"
    }
   ],
   [
    {
     "id": "cj-apariencia"
    },
    {
     "id": "cj-crecimiento-animal"
    }
   ],
   [
    {
     "id": "cj-desintegrar"
    },
    {
     "id": "cj-corcel-espectral-de-piedrasangrienta"
    }
   ],
   [
    {
     "id": "cj-dedo-de-muerte"
    },
    {
     "id": "cj-controlar-muertos-vivientes"
    }
   ],
   [
    {
     "id": "cj-palabra-poderosa-cegar"
    },
    {
     "id": "cj-horrible-marchitamiento-de-abldalzim"
    }
   ],
   [
    {
     "id": "cj-palabra-poderosa-matar"
    },
    {
     "id": "cj-cambiar-de-forma"
    }
   ]
  ]
 },
 {
  "id": "dijinn",
  "nombre": "Dijinn",
  "desc": "Un linaje de genios de los vientos y los deseos. (Linaje completado por la mesa: revisa y ajusta sus habilidades en tu campaña.)",
  "habilidades": [
   {
    "nivel": 1,
    "nombre": "Aliento del genio",
    "texto": "+2 a las salvaciones contra efectos de aire, electricidad y gases; caída de pluma a voluntad."
   },
   {
    "nivel": 6,
    "nombre": "Forma de humo",
    "texto": "Una vez al día por punto de mod. de CAR, te vuelves humo (forma gaseosa) hasta 1 turno."
   },
   {
    "nivel": 12,
    "nombre": "Deseo menor",
    "texto": "Una vez por semana puedes lanzar deseo limitado sin gastar puntos de conjuro."
   },
   {
    "nivel": 18,
    "nombre": "Torbellino del genio",
    "texto": "Vuelo igual a tu velocidad de movimiento y mitad de daño de electricidad."
   }
  ],
  "conjuros": [
   [
    {
     "id": "cj-caida-de-pluma"
    },
    {
     "id": "cj-salto"
    }
   ],
   [
    {
     "id": "cj-viento-susurrante"
    },
    {
     "id": "cj-invisibilidad"
    }
   ],
   [
    {
     "id": "cj-muro-de-viento"
    },
    {
     "id": "cj-lenguas"
    }
   ],
   [
    {
     "id": "cj-puerta-dimensional"
    },
    {
     "id": "cj-celeridad-de-mordenkainen"
    }
   ],
   [
    {
     "id": "cj-invocar-elemental"
    },
    {
     "id": "cj-telequinesis"
    }
   ],
   [
    {
     "id": "cj-controlar-el-clima"
    },
    {
     "id": "cj-transformacion-insustancial-de-lorloveim"
    }
   ],
   [
    {
     "id": "cj-deseo-limitado"
    },
    {
     "id": "cj-teleportacion-sin-error"
    }
   ],
   [
    {
     "id": "cj-pedir"
    },
    {
     "id": "cj-bote-aereo"
    }
   ],
   [
    {
     "id": "cj-deseo"
    },
    {
     "id": "cj-puerta"
    }
   ]
  ]
 }
];
})((typeof window !== 'undefined' ? window : globalThis).ADND);
