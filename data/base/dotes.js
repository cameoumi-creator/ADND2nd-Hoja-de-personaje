/* Dotes (regla opcional). Datos de las listas "Dotes de nacimiento" y "Dotes" del juego de mesa.
   nacimiento.filas: d100 → dote de nacimiento (accion: psi, magia, heroica, divina o doble = recordatorios que la ficha no automatiza).
   nacimiento.mitologias: d100 de Ascendencia Divina, proporcional al número de dioses de cada panteón (Legends & Lore); luego d(N) elige al dios. */
ADND.base.dotes = {
 "grupos": {
  "combate": "Combate marcial",
  "magia": "Magia arcana",
  "fe": "Fe y divinidad",
  "sigilo": "Sigilo y exploración",
  "mente": "Atributos, social y psiónica"
 },
 "lista": [
  {
   "id": "dt-barrido-amplio",
   "nombre": "Barrido Amplio",
   "grupo": "combate",
   "coste": 2,
   "efecto": "Cuando reduces a 0 PG a un enemigo con un arma cuerpo a cuerpo, puedes realizar inmediatamente un ataque adicional gratuito contra otro enemigo que esté dentro de tu alcance."
  },
  {
   "id": "dt-estocada-perforante",
   "nombre": "Estocada Perforante",
   "grupo": "combate",
   "coste": 2,
   "efecto": "Ignoras hasta 2 puntos de bonificación por armadura metálica (como placas o mallas) al atacar con armas perforantes (estoques, lanzas, picos)."
  },
  {
   "id": "dt-rompeescudos",
   "nombre": "Rompeescudos",
   "grupo": "combate",
   "coste": 2,
   "efecto": "Si impactas con un arma contundente pesada (maza, martillo de guerra, mangual), puedes sacrificar el daño para obligar al objetivo a superar una salvación contra aplastamiento o destruir su escudo."
  },
  {
   "id": "dt-postura-inamovible",
   "nombre": "Postura Inamovible",
   "grupo": "combate",
   "coste": 1,
   "efecto": "Mientras no te muevas durante tu turno, obtienes un +2 a la CA contra ataques cuerpo a cuerpo y eres inmune a ser derribado o empujado."
  },
  {
   "id": "dt-desarme-tactico",
   "nombre": "Desarme Táctico",
   "grupo": "combate",
   "coste": 1,
   "efecto": "Puedes intentar desarmar a un oponente con un penalizador de solo −2 al ataque, en lugar del −4 estándar."
  },
  {
   "id": "dt-guardia-del-escudo",
   "nombre": "Guardia del Escudo",
   "grupo": "combate",
   "coste": 2,
   "efecto": "Si usas un escudo, puedes otorgar su bonificación base de CA a un aliado adyacente contra un ataque, una vez por asalto y sin gastar tu ataque."
  },
  {
   "id": "dt-lluvia-de-flechas",
   "nombre": "Lluvia de Flechas",
   "grupo": "combate",
   "coste": 3,
   "efecto": "Permite disparar una flecha adicional por asalto con cualquier arco, aplicando un penalizador de -2 a todas las tiradas de ataque de ese turno."
  },
  {
   "id": "dt-disparo-a-bocajarro",
   "nombre": "Disparo a Bocajarro",
   "grupo": "combate",
   "coste": 1,
   "efecto": "Elimina cualquier penalización por disparar armas a distancia contra objetivos que se encuentren a menos de 3 metros (10 pies) y suma +1 al daño."
  },
  {
   "id": "dt-maestro-de-la-esgrima",
   "nombre": "Maestro de la Esgrima",
   "grupo": "combate",
   "coste": 2,
   "efecto": "Al luchar con una espada ligera en una mano y nada en la otra, obtienes un +1 a la CA y un +1 al THAC0."
  },
  {
   "id": "dt-furia-contenida",
   "nombre": "Furia Contenida",
   "grupo": "combate",
   "coste": 3,
   "efecto": "Una vez por combate, cuando caigas por debajo del 50% de tus PG, ganas +2 al ataque y +3 al daño durante 1d4+1 asaltos, pero sufres -2 a la CA."
  },
  {
   "id": "dt-golpe-aturdidor",
   "nombre": "Golpe Aturdidor",
   "grupo": "combate",
   "coste": 2,
   "efecto": "Una vez por encuentro, con un arma contundente, puedes obligar al enemigo impactado a superar una salvación contra paralización o perder su siguiente acción."
  },
  {
   "id": "dt-veterano-de-asedio",
   "nombre": "Veterano de Asedio",
   "grupo": "combate",
   "coste": 1,
   "efecto": "Duplica el daño que infliges contra estructuras, puertas, barricadas y constructos de piedra o madera."
  },
  {
   "id": "dt-reflejos-de-combate",
   "nombre": "Reflejos de Combate",
   "grupo": "combate",
   "coste": 2,
   "efecto": "Obtienes +2 a la iniciativa individual durante el primer asalto de cada combate (restas 2 a tu dado de iniciativa)."
  },
  {
   "id": "dt-lucha-sucia",
   "nombre": "Lucha Sucia",
   "grupo": "combate",
   "coste": 1,
   "efecto": "Una vez por combate, puedes arrojar arena, tirar de la capa o golpear un punto débil (tirada de ataque normal sin daño) para cegar o aturdir al rival 1 asalto."
  },
  {
   "id": "dt-maestro-de-armas-arrojadizas",
   "nombre": "Maestro de Armas Arrojadizas",
   "grupo": "combate",
   "coste": 2,
   "efecto": "Puedes desenfundar y lanzar armas arrojadizas (dagas, hachas de mano, dardos) a la misma cadencia que tus ataques cuerpo a cuerpo."
  },
  {
   "id": "dt-carga-imparable",
   "nombre": "Carga Imparable",
   "grupo": "combate",
   "coste": 2,
   "efecto": "Al realizar una carga, obtienes un +3 al ataque (en lugar de +2) y sumas +2 al daño, reduciendo la penalización de CA a solo -1."
  },
  {
   "id": "dt-especialista-en-dos-armas",
   "nombre": "Especialista en Dos Armas",
   "grupo": "combate",
   "coste": 3,
   "efecto": "Reduce a 0 los penalizadores por combatir con un arma en cada mano, siempre que el arma secundaria sea ligera."
  },
  {
   "id": "dt-tactico-de-formacion",
   "nombre": "Táctico de Formación",
   "grupo": "combate",
   "coste": 2,
   "efecto": "Cuando luchas adyacente a al menos dos aliados, todos ganan un +1 a la CA y +1 a las tiradas de salvación contra miedo."
  },
  {
   "id": "dt-ejecutor-implacable",
   "nombre": "Ejecutor Implacable",
   "grupo": "combate",
   "coste": 2,
   "efecto": "Contra enemigos derribados, aturdidos o flanqueados, tu rango de golpe crítico aumenta en +1 y sumas +2 al daño."
  },
  {
   "id": "dt-bloqueo-de-proyectiles",
   "nombre": "Bloqueo de Proyectiles",
   "grupo": "combate",
   "coste": 2,
   "efecto": "Si tienes una mano libre o un arma cuerpo a cuerpo preparada, puedes intentar desviar un proyectil no mágico por asalto superando una tirada de salvación contra varitas."
  },
  {
   "id": "dt-conjuro-silencioso",
   "nombre": "Conjuro Silencioso",
   "grupo": "magia",
   "coste": 2,
   "efecto": "Permite lanzar hasta 2 conjuros al día (de nivel 4 o inferior) omitiendo por completo el componente verbal."
  },
  {
   "id": "dt-conjuro-inmovil",
   "nombre": "Conjuro Inmóvil",
   "grupo": "magia",
   "coste": 2,
   "efecto": "Permite lanzar hasta 2 conjuros al día (de nivel 4 o inferior) sin necesidad de realizar componentes somáticos (útil si estás atado o con las manos ocupadas)."
  },
  {
   "id": "dt-penetracion-de-conjuros",
   "nombre": "Penetración de Conjuros",
   "grupo": "magia",
   "coste": 3,
   "efecto": "Restas un 15% a la Resistencia Mágica natural de las criaturas objetivo de tus hechizos."
  },
  {
   "id": "dt-conjuro-esculpido",
   "nombre": "Conjuro Esculpido",
   "grupo": "magia",
   "coste": 3,
   "efecto": "Te permite excluir hasta 3 casillas o aliados específicos del área de efecto de tus conjuros explosivos (como Bola de Fuego o Relámpago)."
  },
  {
   "id": "dt-lanzamiento-defensivo",
   "nombre": "Lanzamiento Defensivo",
   "grupo": "magia",
   "coste": 2,
   "efecto": "Una vez al día, si recibes daño mientras lanzas un conjuro, puedes hacer una tirada de salvación contra conjuros; si la superas, no pierdes el conjuro."
  },
  {
   "id": "dt-afinidad-elemental",
   "nombre": "Afinidad Elemental",
   "grupo": "magia",
   "coste": 2,
   "efecto": "Elige un elemento (fuego, frío, ácido o electricidad). Todos tus conjuros de ese elemento suman +1 punto de daño por cada dado lanzado."
  },
  {
   "id": "dt-contramagia-instintiva",
   "nombre": "Contramagia Instintiva",
   "grupo": "magia",
   "coste": 3,
   "efecto": "Con una acción retrasada (preparada), puedes gastar un conjuro memorizado del mismo nivel o superior (o de la misma escuela) para anular automáticamente el conjuro de un lanzador enemigo visible."
  },
  {
   "id": "dt-familiar-mejorado",
   "nombre": "Familiar Mejorado",
   "grupo": "magia",
   "coste": 2,
   "efecto": "Tu familiar gana el doble de PG, comparte tu tirada de salvación base y puede almacenar un conjuro de nivel 1 para liberarlo a tu orden."
  },
  {
   "id": "dt-inscripcion-rapida",
   "nombre": "Inscripción Rápida",
   "grupo": "magia",
   "coste": 1,
   "efecto": "Reduces a la mitad el tiempo y el coste en oro necesario para copiar conjuros en tu libro o fabricar pergaminos mágicos."
  },
  {
   "id": "dt-eco-de-mana",
   "nombre": "Eco de Mana",
   "grupo": "magia",
   "coste": 3,
   "efecto": "Una vez al día, tras lanzar un conjuro de nivel 1 a 3, tira 1d6; con un resultado de 5 o 6, el conjuro no se borra de tu memoria."
  },
  {
   "id": "dt-toque-espectral",
   "nombre": "Toque Espectral",
   "grupo": "magia",
   "coste": 2,
   "efecto": "Puedes lanzar conjuros cuyo alcance sea \"Toque\" a una distancia de hasta 9 metros (30 pies) proyectando una mano de energía arcana."
  },
  {
   "id": "dt-sustitucion-elemental",
   "nombre": "Sustitución Elemental",
   "grupo": "magia",
   "coste": 2,
   "efecto": "Puedes cambiar el tipo de daño de cualquier conjuro elemental que lances por otro elemento que hayas elegido al tomar esta dote."
  },
  {
   "id": "dt-sifon-arcano",
   "nombre": "Sifón Arcano",
   "grupo": "magia",
   "coste": 3,
   "efecto": "Cuando matas a una criatura mágica o lanzador de conjuros con un hechizo, recuperas un espacio de conjuro gastado de nivel 1 o 2."
  },
  {
   "id": "dt-resonancia-de-varitas",
   "nombre": "Resonancia de Varitas",
   "grupo": "magia",
   "coste": 2,
   "efecto": "Al usar varitas, bastones o cetros, tienes un 25% de probabilidad de que el objeto no consuma una carga."
  },
  {
   "id": "dt-conjuro-rapido-menor",
   "nombre": "Conjuro Rápido Menor",
   "grupo": "magia",
   "coste": 4,
   "efecto": "Una vez al día, puedes lanzar un conjuro de nivel 1 o 2 con tiempo de lanzamiento de 1 segmento, permitiéndote realizar otra acción en el mismo asalto."
  },
  {
   "id": "dt-mente-blindada",
   "nombre": "Mente Blindada",
   "grupo": "magia",
   "coste": 2,
   "efecto": "Otorga un +3 a las tiradas de salvación contra hechizos de adivinación, lectura de mente, encantamiento y control mental."
  },
  {
   "id": "dt-alquimista-arcano",
   "nombre": "Alquimista Arcano",
   "grupo": "magia",
   "coste": 1,
   "efecto": "Puedes destilar pociones curativas menores y frascos de fuego alquímico en la mitad de tiempo y sin necesidad de un laboratorio completo."
  },
  {
   "id": "dt-aura-de-deteccion",
   "nombre": "Aura de Detección",
   "grupo": "magia",
   "coste": 1,
   "efecto": "Percibes automáticamente la presencia de magia activa a menos de 3 metros de ti sin necesidad de concentrarte (aunque no su escuela ni intensidad)."
  },
  {
   "id": "dt-maestria-en-rituales",
   "nombre": "Maestría en Rituales",
   "grupo": "magia",
   "coste": 2,
   "efecto": "Puedes lanzar cualquier conjuro de tu libro que tenga duración larga o efecto utilitario como un ritual de 10 minutos sin gastar el espacio memorizado (1 vez al día)."
  },
  {
   "id": "dt-sobrecarga-de-concentracion",
   "nombre": "Sobrecarga de Concentración",
   "grupo": "magia",
   "coste": 2,
   "efecto": "Puedes mantener activos dos conjuros que requieran concentración simultáneamente, sufriendo un -2 a la CA y al ataque mientras lo haces."
  },
  {
   "id": "dt-aura-de-valentia",
   "nombre": "Aura de Valentía",
   "grupo": "fe",
   "coste": 2,
   "efecto": "Todos los aliados a menos de 6 metros de ti obtienen un +2 a las tiradas de salvación contra miedo y chequeos de moral."
  },
  {
   "id": "dt-curacion-eficiente",
   "nombre": "Curación Eficiente",
   "grupo": "fe",
   "coste": 2,
   "efecto": "Todos los conjuros de curación que lances siempre curan al menos el valor medio del dado (ej. un 1d8 nunca cura menos de 4)."
  },
  {
   "id": "dt-expulsion-devastadora",
   "nombre": "Expulsión Devastadora",
   "grupo": "fe",
   "coste": 3,
   "efecto": "Cuando logras ahuyentar muertos vivientes, aquellos que tengan menos de la mitad de tus dados de golpe son destruidos instantáneamente en lugar de huir."
  },
  {
   "id": "dt-escudo-de-la-fe",
   "nombre": "Escudo de la Fe",
   "grupo": "fe",
   "coste": 2,
   "efecto": "Una vez al día, sin gastar tu ataque del asalto, puedes interponer un destello divino que reduce a la mitad el daño de un ataque dirigido a ti o a un aliado adyacente."
  },
  {
   "id": "dt-bendicion-del-viajero",
   "nombre": "Bendición del Viajero",
   "grupo": "fe",
   "coste": 1,
   "efecto": "Tú y hasta 6 compañeros ignoran el cansancio por marchas forzadas normales y necesitan la mitad de raciones de agua y comida al día."
  },
  {
   "id": "dt-castigo-sagrado",
   "nombre": "Castigo Sagrado",
   "grupo": "fe",
   "coste": 3,
   "efecto": "Gasta un conjuro memorizado de nivel 1 o superior para imbuir tu arma cuerpo a cuerpo, sumando +1d6 de daño sagrado por nivel del conjuro gastado en tu próximo impacto."
  },
  {
   "id": "dt-voz-de-la-naturaleza",
   "nombre": "Voz de la Naturaleza",
   "grupo": "fe",
   "coste": 1,
   "efecto": "Puedes comunicarte telepáticamente con tu compañero animal o montura a una distancia de hasta 1 kilómetro."
  },
  {
   "id": "dt-forma-cambiante-mejorada",
   "nombre": "Forma Cambiante Mejorada",
   "grupo": "fe",
   "coste": 3,
   "efecto": "Al transformarte en animal (druida o guardabosques), conservas tu propia CA base (si es mejor que la del animal) y ganas 1d8 PG temporales."
  },
  {
   "id": "dt-toque-purificador",
   "nombre": "Toque Purificador",
   "grupo": "fe",
   "coste": 1,
   "efecto": "Una vez al día, al imponer manos o lanzar Curar heridas leves, también neutralizas venenos comunes o enfermedades leves."
  },
  {
   "id": "dt-vinculo-con-el-terreno",
   "nombre": "Vínculo con el Terreno",
   "grupo": "fe",
   "coste": 2,
   "efecto": "Elige un tipo de terreno (bosque, montaña, pantano, desierto, subterráneo). Mientras estés en él, ganas +2 a la iniciativa, +1 a la CA y +2 a todas las pericias."
  },
  {
   "id": "dt-martillo-contra-los-impios",
   "nombre": "Martillo contra los Impíos",
   "grupo": "fe",
   "coste": 2,
   "efecto": "Tus ataques con armas naturales o bendecidas se consideran mágicos (+1) a efectos de dañar criaturas que solo pueden ser heridas por armas encantadas."
  },
  {
   "id": "dt-santuario-interior",
   "nombre": "Santuario Interior",
   "grupo": "fe",
   "coste": 2,
   "efecto": "Mientras rezas o meditas durante 10 minutos, eres inmune a efectos climáticos extremos y detectas cualquier criatura hostil que se acerque a menos de 15 metros."
  },
  {
   "id": "dt-canalizar-energia-vital",
   "nombre": "Canalizar Energía Vital",
   "grupo": "fe",
   "coste": 3,
   "efecto": "Puedes sacrificar tus propios PG (hasta un máximo de 3 por nivel) para transferir esa misma cantidad exacta de curación a un aliado al tocarlo."
  },
  {
   "id": "dt-exorcista-nato",
   "nombre": "Exorcista Nato",
   "grupo": "fe",
   "coste": 2,
   "efecto": "Obtienes un +4 a las tiradas de salvación contra posesión demoníaca o fantasmal y +2 a los chequeos para expulsar entidades extraplanares."
  },
  {
   "id": "dt-cosecha-de-hierbas",
   "nombre": "Cosecha de Hierbas",
   "grupo": "fe",
   "coste": 1,
   "efecto": "Si pasas 1 hora buscando en un entorno natural, siempre encuentras suficientes hierbas medicinales para fabricar un ungüento que cura 1d6+1 PG."
  },
  {
   "id": "dt-guia-espiritual",
   "nombre": "Guía Espiritual",
   "grupo": "fe",
   "coste": 2,
   "efecto": "Una vez por sesión, puedes pedir una pista o señal a tu deidad o espíritus ancestrales sobre el camino correcto ante una encrucijada (sin palabras, solo un presagio claro)."
  },
  {
   "id": "dt-resistencia-al-drenaje",
   "nombre": "Resistencia al Drenaje",
   "grupo": "fe",
   "coste": 3,
   "efecto": "Otorga un +4 a las tiradas de salvación contra ataques de drenaje de niveles o drenaje de características de muertos vivientes."
  },
  {
   "id": "dt-pacto-de-la-tierra",
   "nombre": "Pacto de la Tierra",
   "grupo": "fe",
   "coste": 2,
   "efecto": "Mientras tus pies descalzos o botas toquen tierra o piedra natural, no puedes ser derribado ni movido contra tu voluntad por magia o fuerza física."
  },
  {
   "id": "dt-luz-cegadora",
   "nombre": "Luz Cegadora",
   "grupo": "fe",
   "coste": 2,
   "efecto": "Una vez por combate, puedes hacer brillar tu símbolo sagrado o foco druídico; los enemigos en un cono de 6 metros deben salvar contra conjuros o quedar cegados 1 asalto."
  },
  {
   "id": "dt-inmunidad-a-las-plagas",
   "nombre": "Inmunidad a las Plagas",
   "grupo": "fe",
   "coste": 1,
   "efecto": "Eres completamente inmune a enfermedades naturales, parásitos y fiebres de pantano, y ganas +2 contra enfermedades mágicas (como la podredumbre de momia)."
  },
  {
   "id": "dt-paso-fantasma",
   "nombre": "Paso Fantasma",
   "grupo": "sigilo",
   "coste": 2,
   "efecto": "Puedes moverte a tu velocidad completa (en lugar de la mitad) mientras utilizas Moverse en silencio y Esconderse en las sombras sin sufrir penalización."
  },
  {
   "id": "dt-vista-de-halcon",
   "nombre": "Vista de Halcón",
   "grupo": "sigilo",
   "coste": 1,
   "efecto": "Duplica tu rango de visión efectiva en exteriores y otorga un +2 a las tiradas para detectar emboscadas o criaturas ocultas a distancia."
  },
  {
   "id": "dt-oido-absoluto",
   "nombre": "Oído Absoluto",
   "grupo": "sigilo",
   "coste": 1,
   "efecto": "Puedes escuchar conversaciones a través de puertas gruesas o muros de piedra con un +15% a Detectar ruidos y nunca sufres penalizaciones por luchar a ciegas si el enemigo hace ruido."
  },
  {
   "id": "dt-escapista-maestro",
   "nombre": "Escapista Maestro",
   "grupo": "sigilo",
   "coste": 2,
   "efecto": "Obtienes un +25% a escapar de cuerdas, grilletes o presas, y puedes deslizarte por espacios estrechos por los que apenas cabría tu cabeza."
  },
  {
   "id": "dt-veneno-persistente",
   "nombre": "Veneno Persistente",
   "grupo": "sigilo",
   "coste": 2,
   "efecto": "Cuando aplicas veneno a un arma, este permanece activo durante 3 impactos exitosos en lugar de disiparse tras el primer golpe."
  },
  {
   "id": "dt-emboscador-letal",
   "nombre": "Emboscador Letal",
   "grupo": "sigilo",
   "coste": 3,
   "efecto": "Si actúas en el asalto de sorpresa, obtienes un +2 al ataque y sumas +1d6 de daño extra contra cualquier enemigo que aún no haya actuado."
  },
  {
   "id": "dt-lector-de-labios",
   "nombre": "Lector de Labios",
   "grupo": "sigilo",
   "coste": 1,
   "efecto": "Si puedes ver claramente la boca de una criatura hablando un idioma que conoces (a menos de 18 metros), entiendes perfectamente lo que dice sin necesidad de oírla."
  },
  {
   "id": "dt-falsificador-experto",
   "nombre": "Falsificador Experto",
   "grupo": "sigilo",
   "coste": 1,
   "efecto": "Obtienes la pericia Falsificación con un bono de +3; puedes replicar firmas, sellos reales y documentos tras estudiarlos durante 10 minutos."
  },
  {
   "id": "dt-acrobacia-de-combate",
   "nombre": "Acrobacia de Combate",
   "grupo": "sigilo",
   "coste": 2,
   "efecto": "Una vez por combate puedes atravesar el espacio de un enemigo o escapar de un cerco superando una prueba de Destreza; si fallas, pierdes el movimiento."
  },
  {
   "id": "dt-rastreador-implacable",
   "nombre": "Rastreador Implacable",
   "grupo": "sigilo",
   "coste": 2,
   "efecto": "Puedes seguir rastros de hasta una semana de antigüedad incluso bajo lluvia ligera o sobre roca dura, con un +3 a la pericia Rastrear."
  },
  {
   "id": "dt-desactivacion-rapida",
   "nombre": "Desactivación Rápida",
   "grupo": "sigilo",
   "coste": 2,
   "efecto": "Reduces el tiempo necesario para desactivar trampas o abrir cerraduras a la mitad (1 asalto en lugar de 1 turno), y si fallas por menos de 5%, la trampa no se activa."
  },
  {
   "id": "dt-memoria-cartografica",
   "nombre": "Memoria Cartográfica",
   "grupo": "sigilo",
   "coste": 1,
   "efecto": "Nunca te pierdes en laberintos o mazmorras subterráneas; recuerdas cada giro, puerta secreta y nivel de profundidad que hayas recorrido."
  },
  {
   "id": "dt-mimetismo-vocal",
   "nombre": "Mimetismo Vocal",
   "grupo": "sigilo",
   "coste": 1,
   "efecto": "Puedes imitar con exactitud voces de personas que hayas escuchado hablar o sonidos de animales comunes (un chequeo de Carisma solo es necesario ante conocidos íntimos)."
  },
  {
   "id": "dt-caida-amortiguada",
   "nombre": "Caída Amortiguada",
   "grupo": "sigilo",
   "coste": 1,
   "efecto": "Reduces en 6 metros (20 pies) la distancia efectiva de cualquier caída a efectos de calcular el daño, siempre que haya una pared o superficie cerca."
  },
  {
   "id": "dt-sexto-sentido-para-trampas",
   "nombre": "Sexto Sentido para Trampas",
   "grupo": "sigilo",
   "coste": 2,
   "efecto": "Obtienes una tirada pasiva automática (como si estuvieras buscando) cada vez que te acercas a menos de 1.5 metros de una trampa mecánica o mágica."
  },
  {
   "id": "dt-carterista-veloz",
   "nombre": "Carterista Veloz",
   "grupo": "sigilo",
   "coste": 1,
   "efecto": "Puedes intentar Vaciar bolsillos o plantar un objeto pequeño en alguien como una acción breve incluso en medio de una conversación o combate."
  },
  {
   "id": "dt-superviviente-urbano",
   "nombre": "Superviviente Urbano",
   "grupo": "sigilo",
   "coste": 1,
   "efecto": "En cualquier ciudad o pueblo, encuentras refugio seguro, mercado negro y rumores locales en la mitad de tiempo y sin llamar la atención de la guardia."
  },
  {
   "id": "dt-maestro-del-disfraz",
   "nombre": "Maestro del Disfraz",
   "grupo": "sigilo",
   "coste": 2,
   "efecto": "Puedes crear un disfraz convincente (incluyendo cambios de postura y altura aparente) en 10 minutos con un +3 a la pericia Disfrazarse."
  },
  {
   "id": "dt-sombra-en-la-multitud",
   "nombre": "Sombra en la Multitud",
   "grupo": "sigilo",
   "coste": 1,
   "efecto": "Puedes utilizar la habilidad Esconderse en las sombras a plena luz del día siempre que te encuentres en medio de una multitud de al menos 10 personas."
  },
  {
   "id": "dt-golpe-a-los-puntos-vitales",
   "nombre": "Golpe a los Puntos Vitales",
   "grupo": "sigilo",
   "coste": 3,
   "efecto": "Incluso cuando no puedes realizar un ataque furtivo por la espalda, tus golpes críticos contra criaturas con anatomía definida infligen +1d6 de daño adicional."
  },
  {
   "id": "dt-voluntad-de-hierro",
   "nombre": "Voluntad de Hierro",
   "grupo": "mente",
   "coste": 2,
   "efecto": "Otorga un +2 permanente a todas las tiradas de salvación contra conjuros, poderes psiónicos y efectos que afecten la mente o las emociones."
  },
  {
   "id": "dt-reflejos-relampago",
   "nombre": "Reflejos Relámpago",
   "grupo": "mente",
   "coste": 2,
   "efecto": "Otorga un +2 permanente a todas las tiradas de salvación contra alientos de dragón, explosiones de área y trampas físicas, además de +1 a la iniciativa."
  },
  {
   "id": "dt-gran-fortaleza",
   "nombre": "Gran Fortaleza",
   "grupo": "mente",
   "coste": 2,
   "efecto": "Otorga un +2 permanente a todas las tiradas de salvación contra venenos, enfermedades, paralización y muerte por choque sistémico."
  },
  {
   "id": "dt-mente-despierta",
   "nombre": "Mente Despierta",
   "grupo": "mente",
   "coste": 1,
   "efecto": "Solo necesitas dormir 4 horas para obtener los beneficios completos de un una noche de descanso completo y recuperar conjuros o PSPs."
  },
  {
   "id": "dt-lider-carismatico",
   "nombre": "Líder Carismático",
   "grupo": "mente",
   "coste": 2,
   "efecto": "Aumenta en +2 tu puntuación máxima de lealtad de seguidores y mercenarios, y otorga +1 a todas tus tiradas de reacción con PNJ."
  },
  {
   "id": "dt-intimidacion-aterradora",
   "nombre": "Intimidación Aterradora",
   "grupo": "mente",
   "coste": 1,
   "efecto": "Puedes usar tu Fuerza (en lugar de Carisma) para pruebas de intimidación, y en combate puedes obligar a un enemigo débil a hacer un chequeo de moral."
  },
  {
   "id": "dt-poliglota-natural",
   "nombre": "Políglota Natural",
   "grupo": "mente",
   "coste": 1,
   "efecto": "Aprendes idiomas adicionales en la mitad de tiempo y obtienes 2 espacios gratuitos extra para pericias de idiomas antiguos o muertos."
  },
  {
   "id": "dt-sangre-de-troll",
   "nombre": "Sangre de Troll",
   "grupo": "mente",
   "coste": 4,
   "efecto": "Regeneras 1 punto de golpe cada 10 minutos (1 turno) de forma pasiva, siempre que tengas al menos 1 PG y no hayas recibido daño por fuego o ácido recientemente."
  },
  {
   "id": "dt-corazon-de-leon",
   "nombre": "Corazón de León",
   "grupo": "mente",
   "coste": 1,
   "efecto": "Eres completamente inmune a los efectos de miedo normal (como el rugido de un dragón o intimidaciones) y ganas +4 contra miedo mágico."
  },
  {
   "id": "dt-afortunado-en-el-juego",
   "nombre": "Afortunado en el Juego",
   "grupo": "mente",
   "coste": 1,
   "efecto": "Obtienes un +3 en cualquier pericia o tirada relacionada con juegos de azar, apuestas o deducción de engaños en tabernas."
  },
  {
   "id": "dt-resistencia-al-dolor",
   "nombre": "Resistencia al Dolor",
   "grupo": "mente",
   "coste": 2,
   "efecto": "Cuando tus PG caen a 0 o menos, puedes seguir actuando de forma consciente (sin perder el conocimiento) durante 1d4 asaltos antes de colapsar."
  },
  {
   "id": "dt-mente-compartimentada",
   "nombre": "Mente Compartimentada",
   "grupo": "mente",
   "coste": 2,
   "efecto": "Si eres afectado por un poder telepático o lectura de mente, puedes proyectar pensamientos falsos superficiales para engañar al invasor (requiere salvación opuesta)."
  },
  {
   "id": "dt-reserva-psionica-ampliada",
   "nombre": "Reserva Psiónica Ampliada",
   "grupo": "mente",
   "coste": 2,
   "efecto": "Aumenta tu reserva máxima de Puntos de Fuerza Psiónica (PSP) en +10 puntos fijos, más 2 puntos adicionales por cada nivel que subas."
  },
  {
   "id": "dt-canalizacion-telequinetica",
   "nombre": "Canalización Telequinética",
   "grupo": "mente",
   "coste": 2,
   "efecto": "Puedes manipular objetos pequeños (de hasta 2 kilos) a una distancia de 6 metros usando solo el poder de tu mente, sin gastar PSPs."
  },
  {
   "id": "dt-escudo-de-pensamiento",
   "nombre": "Escudo de Pensamiento",
   "grupo": "mente",
   "coste": 1,
   "efecto": "Otorga un +2 a tu CA mental contra ataques psiónicos de Empuje de Ego o Insinuación de Ello."
  },
  {
   "id": "dt-empatia-profunda",
   "nombre": "Empatía Profunda",
   "grupo": "mente",
   "coste": 1,
   "efecto": "Puedes percibir el estado emocional dominante (miedo, ira, engaño, calma) de cualquier criatura inteligente a menos de 9 metros con una prueba exitosa de Sabiduría."
  },
  {
   "id": "dt-comerciante-astuto",
   "nombre": "Comerciante Astuto",
   "grupo": "mente",
   "coste": 1,
   "efecto": "Siempre vendes tesoros, joyas y equipo usado por un 15% más de su valor habitual en mercados y casas de empeño."
  },
  {
   "id": "dt-adaptabilidad-cultural",
   "nombre": "Adaptabilidad Cultural",
   "grupo": "mente",
   "coste": 1,
   "efecto": "Nunca sufres penalizaciones de reacción por ser extranjero o pertenecer a una raza poco común en tierras lejanas; comprendes rápidamente las etiquetas locales."
  },
  {
   "id": "dt-instinto-de-supervivencia",
   "nombre": "Instinto de Supervivencia",
   "grupo": "mente",
   "coste": 2,
   "efecto": "Cuando realizas una tirada de salvación que podría resultar en tu muerte instantánea (como desintegración o veneno letal), puedes repetir la tirada una vez por sesión."
  },
  {
   "id": "dt-legado-del-aventurero",
   "nombre": "Legado del Aventurero",
   "grupo": "mente",
   "coste": 4,
   "efecto": "Obtienes 2 espacios de pericias adicionales inmediatas y un +1 permanente a cualquier característica física o mental que no supere los 15 puntos."
  }
 ],
 "nacimiento": {
  "id": "nacimiento-base",
  "nombre": "Dotes de nacimiento (base)",
  "filas": [
   {
    "desde": 1,
    "hasta": 4,
    "id": "dn-buena-suerte",
    "nombre": "Buena suerte",
    "efecto": "Permite al personaje repetir una tirada cualquiera de dados (siempre y cuando sea una acción propia del personaje, como ataque, pericia, salvación, pero no tiradas de daño, dado de golpe, etc.) una vez por sesión de juego, excepto cuando esta termine inconclusa. En estos casos se tendrá un máximo de una tirada de suerte por batalla o encuentro.",
    "accion": ""
   },
   {
    "desde": 5,
    "hasta": 8,
    "id": "dn-sentido-comun",
    "nombre": "Sentido común",
    "efecto": "Otorga un bonificador de +1 ante cualquier situación en la que el sentido común le ayude (salvaciones, la mayoría de pericias, etc.). Además, el DM avisa al jugador cuando su personaje esté a punto de actuar de forma inadecuada a su categoría, raza, alineamiento, etc.",
    "accion": ""
   },
   {
    "desde": 9,
    "hasta": 12,
    "id": "dn-psionica-salvaje",
    "nombre": "Psiónica salvaje",
    "efecto": "El personaje obtiene un poder de psiónica salvaje como es descrito en el Manual del Psiónico.",
    "accion": "psi"
   },
   {
    "desde": 13,
    "hasta": 16,
    "id": "dn-magia-salvaje",
    "nombre": "Magia Salvaje",
    "efecto": "Al alcanzar el 50% de daño, se desencadena una oleada salvaje como es descrita en el Tomo de Magias, donde el atacante es el objetivo y el personaje el lanzador para efectos específicos.",
    "accion": "magia"
   },
   {
    "desde": 17,
    "hasta": 20,
    "id": "dn-ascendencia-heroica",
    "nombre": "Ascendencia Heroica",
    "efecto": "+1 a un Stat al azar.",
    "accion": "heroica"
   },
   {
    "desde": 21,
    "hasta": 24,
    "id": "dn-ascendencia-divina",
    "nombre": "Ascendencia Divina",
    "efecto": "La sangre de un dios corre por sus venas (según el manual Legends & Lore; en caso de no tener poder garantizado, gana el skill de Ascendencia Heroica).",
    "accion": "divina"
   },
   {
    "desde": 25,
    "hasta": 28,
    "id": "dn-sangre-feerica",
    "nombre": "Sangre Feérica",
    "efecto": "El personaje nació bajo un velo entre el Plano Material y el reino de las hadas. Otorga un +2 a las tiradas de salvación contra encantamientos, ilusiones y efectos de dormir, y le permite detectar puertas secretas élficas o feéricas con un 1-2 en 1d6 al pasar cerca.",
    "accion": ""
   },
   {
    "desde": 29,
    "hasta": 32,
    "id": "dn-tocado-por-los-planos",
    "nombre": "Tocado por los Planos",
    "efecto": "Una convergencia planar marcó su nacimiento. El personaje obtiene una resistencia elemental menor (reduce en 1 punto por dado el daño recibido de fuego, frío, electricidad o ácido, elegido al azar) y puede percibir portales planares a menos de 10 pies.",
    "accion": ""
   },
   {
    "desde": 33,
    "hasta": 36,
    "id": "dn-sexto-sentido",
    "nombre": "Sexto Sentido",
    "efecto": "Un instinto sobrenatural le advierte del peligro inminente. El personaje nunca puede ser sorprendido de forma normal (sólo ante emboscadas mágicas o planares) y obtiene un +1 a sus tiradas de iniciativa individual.",
    "accion": ""
   },
   {
    "desde": 37,
    "hasta": 40,
    "id": "dn-aura-inquebrantable",
    "nombre": "Aura Inquebrantable",
    "efecto": "Su espíritu es anormalmente denso y difícil de corromper. Otorga un +2 a las tiradas de salvación contra miedo, posesión, drenaje de energía y efectos de muerte (o chequeos de horror/locura si se juega en Ravenloft).",
    "accion": ""
   },
   {
    "desde": 41,
    "hasta": 44,
    "id": "dn-afinidad-animal",
    "nombre": "Afinidad Animal",
    "efecto": "Las bestias naturales reconocen algo familiar en su olor y mirada. Los animales normales (no mágicos ni monstruosos) nunca lo atacarán primero a menos que sean provocados o controlados mágicamente, y obtiene un +2 a cualquier pericia relacionada con montar, entrenar o tratar animales.",
    "accion": ""
   },
   {
    "desde": 45,
    "hasta": 48,
    "id": "dn-recuperacion-prodigiosa",
    "nombre": "Recuperación Prodigiosa",
    "efecto": "Su cuerpo cierra heridas con una rapidez inquietante. Al descansar una noche completa, recupera el doble de puntos de golpe naturales de lo habitual y obtiene un +2 a las salvaciones contra venenos y enfermedades comunes.",
    "accion": ""
   },
   {
    "desde": 49,
    "hasta": 52,
    "id": "dn-eco-arcano",
    "nombre": "Eco Arcano",
    "efecto": "Nació durante una tormenta mágica o eclipse. Aunque no sea lanzador de conjuros, puede lanzar un conjuro de nivel 1 de mago (determinado al azar) una vez al día como habilidad innata, usando su nivel de personaje como nivel de lanzador.",
    "accion": ""
   },
   {
    "desde": 53,
    "hasta": 56,
    "id": "dn-don-de-lenguas",
    "nombre": "Don de Lenguas",
    "efecto": "Posee una facilidad innata para comprender la estructura de cualquier idioma. Comienza el juego con 3 espacios adicionales de pericias de idiomas modernos y, tras escuchar hablar una lengua desconocida durante al menos un día, puede hacer una tirada de Inteligencia para entender lo básico.",
    "accion": ""
   },
   {
    "desde": 57,
    "hasta": 60,
    "id": "dn-ojo-de-tasador",
    "nombre": "Ojo de Tasador",
    "efecto": "Tiene un talento natural para distinguir el valor real y los defectos ocultos de las cosas. Obtiene automáticamente la pericia Tasación sin gastar espacios (o un +3 si ya la posee) y tiene un 25% de probabilidad de detectar a simple vista si un objeto es mágico o está maldito al tocarlo.",
    "accion": ""
   },
   {
    "desde": 61,
    "hasta": 64,
    "id": "dn-manos-de-artesano",
    "nombre": "Manos de Artesano",
    "efecto": "Sus dedos poseen una destreza excepcional para el trabajo fino. Obtiene 2 espacios gratuitos en pericias de oficio o artesanía, +2 a chequeos de Destreza relacionados con manipular mecanismos delicados y reduce a la mitad el tiempo necesario para fabricar o reparar equipo.",
    "accion": ""
   },
   {
    "desde": 65,
    "hasta": 68,
    "id": "dn-voz-de-mando",
    "nombre": "Voz de Mando",
    "efecto": "Su presencia inspira respeto o temor de manera natural. Otorga un +2 a las tiradas de reacción de PNJ, aumenta en +1 el límite máximo de seguidores/mercenarios y mejora en +10% la moral de los aliados bajo su liderazgo.",
    "accion": ""
   },
   {
    "desde": 69,
    "hasta": 72,
    "id": "dn-sombra-fugitiva",
    "nombre": "Sombra Fugitiva",
    "efecto": "Nació en una noche sin luna y parece fundirse con la penumbra. Gana un +15% a las habilidades de Esconderse en las sombras y Moverse en silencio (si no es ladrón o explorador, obtiene ambas habilidades con una base del 25%).",
    "accion": ""
   },
   {
    "desde": 73,
    "hasta": 76,
    "id": "dn-estomago-de-hierro",
    "nombre": "Estómago de Hierro",
    "efecto": "Puede digerir casi cualquier sustancia orgánica sin sufrir daño. Es inmune a intoxicaciones alimentarias, agua estancada o alcohol común, y obtiene un +4 a las tiradas de salvación contra venenos ingeridos.",
    "accion": ""
   },
   {
    "desde": 77,
    "hasta": 80,
    "id": "dn-orientacion-perfecta",
    "nombre": "Orientación Perfecta",
    "efecto": "Posee una brújula interna infalible. Nunca puede perderse de forma natural (incluso bajo tierra o en el mar), siempre sabe dónde está el norte y puede calcular la hora exacta del día o la noche con un margen de error de pocos minutos.",
    "accion": ""
   },
   {
    "desde": 81,
    "hasta": 84,
    "id": "dn-vinculo-con-el-acero",
    "nombre": "Vínculo con el Acero",
    "efecto": "Tiene una afinidad instintiva con el combate armado. Obtiene una competencia con arma adicional gratuita desde nivel 1 y, una vez por encuentro, puede sumar un +1 al ataque y al daño con su arma predilecta.",
    "accion": ""
   },
   {
    "desde": 85,
    "hasta": 88,
    "id": "dn-memoria-eidetica",
    "nombre": "Memoria Eidética",
    "efecto": "Recuerda con claridad fotográfica todo lo que ha visto, leído o escuchado. Puede memorizar mapas, textos o rostros tras verlos unos segundos (con una tirada exitosa de Inteligencia para detalles muy complejos) y tarda la mitad de tiempo en aprender nuevos conjuros o habilidades.",
    "accion": ""
   },
   {
    "desde": 89,
    "hasta": 91,
    "id": "dn-susurro-de-los-muertos",
    "nombre": "Susurro de los Muertos",
    "efecto": "Nació cerca de un camposanto o durante un rito funerario. Puede percibir la presencia de muertos vivientes a 30 pies (como un escalofrío en la nuca) y una vez por semana puede formular una única pregunta a un cadáver reciente (como el conjuro Hablar con los muertos).",
    "accion": ""
   },
   {
    "desde": 92,
    "hasta": 94,
    "id": "dn-resistencia-elemental",
    "nombre": "Resistencia Elemental",
    "efecto": "Nació en un entorno extremo (glaciar, desierto, volcán o alta montaña). No sufre penalizaciones por climas naturales extremos de calor o frío y recibe un +2 a las salvaciones contra efectos climáticos o ambientales.",
    "accion": ""
   },
   {
    "desde": 95,
    "hasta": 97,
    "id": "dn-mal-de-ojo-involuntario",
    "nombre": "Mal de Ojo Involuntario",
    "efecto": "Cuando el personaje sufre un golpe crítico o cae a menos del 25% de sus puntos de golpe, su mirada lanza una maldición inconsciente: el atacante debe superar una tirada de salvación contra paralización o sufrir un -2 a todas sus tiradas durante los siguientes 1d4 asaltos.",
    "accion": ""
   },
   {
    "desde": 98,
    "hasta": 99,
    "id": "dn-destello-del-destino",
    "nombre": "Destello del Destino",
    "efecto": "Una vez por aventura (o arco narrativo), cuando el personaje vaya a morir por daño físico o mágico, el destino interviene de forma improbable (una moneda detiene la flecha, un derrumbe desvía el golpe) dejándolo exactamente a 1 punto de golpe en lugar de morir.",
    "accion": ""
   },
   {
    "desde": 100,
    "hasta": 100,
    "id": "dn-tira-dos-veces-ignora-el-100",
    "nombre": "Tira dos veces (ignora el 100)",
    "efecto": "Vuelve a tirar dos veces en esta tabla (si vuelve a salir 100, se ignora y se repite).",
    "accion": "doble"
   }
  ],
  "mitologias": [
   {
    "id": "mit-indios-americanos",
    "nombre": "Indios americanos",
    "desde": 1,
    "hasta": 8,
    "dioses": [
     "Great Spirit",
     "Sun",
     "Moon",
     "Earth",
     "Morning Star",
     "Wind",
     "Fire",
     "Thunder",
     "Raven",
     "Coyote",
     "Snake",
     "Spirits"
    ]
   },
   {
    "id": "mit-azteca",
    "nombre": "Azteca",
    "desde": 9,
    "hasta": 18,
    "dioses": [
     "Ometeotl",
     "Huitzilopochtli",
     "Quetzalcoatl",
     "Mictlantecuhtli",
     "Mictanchihuatl",
     "Tezcatlipoca",
     "Tlaloc",
     "Chalchihuitlicue",
     "Tlazolteotl",
     "Xochipilli",
     "Xochiquetzal",
     "Metzli",
     "Centeotl",
     "Ixtlilton"
    ]
   },
   {
    "id": "mit-celta",
    "nombre": "Celta",
    "desde": 19,
    "hasta": 26,
    "dioses": [
     "Lugh",
     "Oghma",
     "Goibhniu",
     "Daghdha",
     "Manannan mac Lir",
     "Arawn",
     "Morrigan",
     "Diancecht",
     "Math Mathonwy",
     "Belenus",
     "Brigantia"
    ]
   },
   {
    "id": "mit-china",
    "nombre": "China",
    "desde": 27,
    "hasta": 37,
    "dioses": [
     "Shang-ti",
     "Kuan-ti",
     "Yen-Wang-Yeh",
     "Fu Hsing",
     "Chung Kuel",
     "Liu",
     "Lu Hsing",
     "Shou Hsing",
     "Kuan Yin",
     "Chih-Nii",
     "Lei Kung",
     "Sung Chiang",
     "Lao Tzu",
     "K'ung Fu-tzu",
     "Dragon Kings",
     "Ch'eng Huang"
    ]
   },
   {
    "id": "mit-egipcia",
    "nombre": "Egipcia",
    "desde": 38,
    "hasta": 46,
    "dioses": [
     "Ra",
     "Geb",
     "Nut",
     "Shu",
     "Tefnut",
     "Osiris",
     "Isis",
     "Set",
     "Nephythys",
     "Thoth",
     "Ptah",
     "Horus",
     "Anhur",
     "Bast"
    ]
   },
   {
    "id": "mit-griega",
    "nombre": "Griega",
    "desde": 47,
    "hasta": 59,
    "dioses": [
     "Gaea",
     "Uranus",
     "Cronus",
     "Rhea",
     "Zeus",
     "Hera",
     "Aphrodite",
     "Ares",
     "Artemis",
     "Athena",
     "Demeter",
     "Dionysus",
     "Hephaestus",
     "Hermes",
     "Apollo",
     "Poseidon",
     "Hades",
     "Hecate"
    ]
   },
   {
    "id": "mit-india",
    "nombre": "India",
    "desde": 60,
    "hasta": 71,
    "dioses": [
     "Brahman",
     "Indra",
     "Varuna",
     "Mitra",
     "Yama",
     "Agni",
     "Surya",
     "Savitri",
     "Soma",
     "Ushas",
     "Siva",
     "Kali",
     "Brihaspati",
     "Rudra",
     "Puchan",
     "Ratri",
     "Vayu",
     "Tvashtri"
    ]
   },
   {
    "id": "mit-japonesa",
    "nombre": "Japonesa",
    "desde": 72,
    "hasta": 82,
    "dioses": [
     "Izanagi and Izanami",
     "Amaterasu",
     "Tsuki-Yomi",
     "Hachiman",
     "Susanoo",
     "Raiden",
     "O-Kuni-Nushi",
     "Ama-Tsu-Mara",
     "Inari",
     "Ho Masubi",
     "Nai No Kami",
     "O-Wata-Tsu-Mi",
     "Kura Okami",
     "Shina-Tsu-Hiko",
     "Amatsu-Mikaboshi",
     "Shifukujin"
    ]
   },
   {
    "id": "mit-nehwon",
    "nombre": "Nehwon",
    "desde": 83,
    "hasta": 88,
    "dioses": [
     "Gods of Lankhmar",
     "Issek of the Jug",
     "Gods of Trouble",
     "Hate",
     "Death",
     "Kos",
     "Tyaa",
     "Red God"
    ]
   },
   {
    "id": "mit-nordica",
    "nombre": "Nórdica",
    "desde": 89,
    "hasta": 100,
    "dioses": [
     "Odin",
     "Frigga",
     "Thor",
     "Sif",
     "Aegir",
     "Baldur",
     "Bragi",
     "Forseti",
     "Frey",
     "Freya",
     "Heimdall",
     "Hel",
     "Idun",
     "Loki",
     "Tyr",
     "Norns",
     "Thrym",
     "Surtr"
    ]
   }
  ]
 }
};
