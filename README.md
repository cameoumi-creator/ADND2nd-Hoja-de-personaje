# Ficha de campaña · AD&D 2.5

Constructor de personajes de AD&D 2.5 con soporte homebrew. Sin instalación: abre `index.html` con doble clic.

## Estructura

```
index.html          cascarón de la página
css/app.css         estilos (temas papel/plano, impresión, móvil)
data/base/          datos base: tablas, características, clases, razas, kits, deidades, armas
js/core/            reglas puras (sin DOM): registro, modelo, reglas, armas, almacenamiento, migración
js/ui/              interfaz: una pestaña por archivo p-*.js, hoja imprimible, app.js
tests/              pruebas con Node, sin dependencias
```

Regla de oro: **las reglas no tocan el DOM** y **los datos no tienen lógica**. Así se prueban solas y se amplían sin romper la interfaz.

## Cómo agregar homebrew

**Desde la app (lo normal):** pestaña *Homebrew* → crea razas (con variantes y elecciones), clases, kits, deidades o tablas propias. Cada número muestra su origen en la ficha.
Se guarda en tu navegador, y al exportar un personaje viaja con el homebrew que usa.

**Paquetes:** *Homebrew* → exportar/importar un paquete `ADND2_HOMEBREW` (JSON) para compartirlo con tu mesa.

**Efectos:** `{ "objetivo": "CON", "valor": 1, "nota": "..." }`. Objetivos: `FUE DES CON INT SAB CAR`, `thaco`, `ca`, `pg`, `PVM CVV PP AL CyO`. THAC0, CA y salvaciones se **suman** al número (negativo mejora).

**Datos base:** edita `data/base/*.js` si quieres que algo venga de fábrica.

## Armas

Pestaña *Armas*: competencias individuales y de grupo, especialización (una oportunidad cada 3 niveles, tope según la clase), estilos de combate y combinaciones, y tus armas físicas con GAC0, daño, crítico y RT desglosados. Todo se paga de las pericias de arma (PA) del personaje y nunca deja el gasto en negativo.
Variantes de raza: Homebrew → Variantes de raza agrega una variante a cualquier raza, también las base, sin duplicarlas.
Armas homebrew: pestaña *Homebrew* → Armas. Clases propias: el campo "Especialización máxima en armas" fija hasta dónde llegan (si se deja vacío usa el grupo de THAC0: Luchador 4, Divino 2, Bribón 1, Arcano 0).
Reglas tomadas del constructor anterior: GAC0 = THAC0 − ajuste de golpe (FUE) o de proyectil (DES); competencia +0, familiar +2, sin competencia +4; especialización 1 = −1 GAC0 y +2 daño, 2 = −3 y +3, 4 = dado de daño +1 paso; RT sube con especialización 1 y 4.

**Escudos:** son un arma más (grupo Escudos): hacen daño y tienen su propio RT, que empieza en 1/1 y sube como cualquier arma. Los valores del estilo son los del escudo medio; la rodela y el escudo pequeño dan 1 punto menos de CA (mínimo +0) y 1 bloqueo más, el corporal 1 punto más de CA y 1 bloqueo menos. En Homebrew → Armas puedes marcar un arma como escudo y definir su ajuste y su daño (ej. escudo enano 1d8). El estilo *arma y escudo* modifica la CA de la hoja (se envía como efecto `ca`, listo para el futuro bloque de armaduras). La nota "+1 CA contra el primer golpe" se muestra mientras no compres el estilo y no entra a los cálculos.
**RT:** la base es la mejor entre el RT de la clase y el RT inicial del arma (arco largo 2/2); la especialización y el estilo lo mejoran desde ahí.
**Idiomas:** cada raza trae su idioma nativo gratis (humano = Común). Los aprendidos se descuentan de los idiomas de INT, que comparten con las pericias flexibles. Idiomas homebrew en Homebrew → Idiomas.
**Ego:** CAR + INT + nivel.

## Armadura

Pestaña *Armadura*: la CA se arma por piezas (peto, brazos, piernas), más el equipo puesto, bonos generales y ajustes. Salen tres cifras: **CA total**, **CA de dureza** (sin DES, solo lo que hay que superar para penetrar la armadura) y **CA al toque** (solo DES y magia). La categoría del peto limita el bono de DES: Ligera todo, Media hasta −2 de CA, Pesada nada; una penalización de DES siempre cuenta. La CA no baja de −10. Armaduras propias: Homebrew → Armaduras.
De los estilos de pelea entra a la CA **solo la mejor** de dos fuentes (no se suman): los puntos tácticos de una mano sin gastar en ataque, o el estilo arma-escudo con el escudo equipado. El escudo no da CA como equipo.

## Pericias sin arma

Pestaña *Pericias*: catálogo de más de 200 pericias (consulta sin comprar), compra con PNA, mejoras de 1 PNA que suman 1 al objetivo, pericias concedidas por raza, kit u otra fuente (cuestan 0), y el número objetivo calculado con tus características. Las de otra categoría de tu clase cuestan +1; en multiclase vale la unión de categorías. Las de conocimiento (INT/SAB no Generales) exigen entrenamiento; el resto, sin entrenar, lleva +4 al d20. El saldo descuenta solo Ambidiestría y las pericias de arma que salen de las flexibles. El catálogo se agrupa por característica en secciones plegables, con filas compactas que se despliegan al tocarlas. Pericias propias: Homebrew → Pericias; las clases propias pueden declarar sus categorías.

## Técnicas

Pestaña *Técnicas*. **Bribón:** las ocho habilidades existen para cualquier personaje (base de tu mejor clase entre Ladrón, Bardo, Explorador, Bárbaro y Techno, más raza, DES y la categoría del peto), con puntos de Ladrón y de Bardo, tope por habilidad según nivel, ajuste manual, habilidades avanzadas a nivel 20 y las técnicas propias de Ladrón y Bardo. El total va de 0% a 99% (el desglose muestra el valor sin tope). **Bárbaro:** espalda sensible, escalar y saltos por nivel, con extras. Razas y clases propias no traen tablas: usa el ajuste de cada habilidad. **Espadachín:** tres escuelas (Espada, Agua, Norte) de siete rangos; una elección en los niveles 1, 4, 7, 10, 13, 16 y 19, las técnicas de cada escuela se adquieren en orden, MD sale de tu daño por FUE (en el texto de cada técnica, "MD" se cambia por ese número), Touki = nivel ÷ 3 y todo se desactiva con armadura pesada. Escuelas propias: Homebrew → Escuelas de Espadachín (hasta siete técnicas, una por rango).

### Artes marciales

Subpestaña *Artes marciales* en Técnicas. Hasta 3 artes (15 base); cada arte cuesta 1 pericia y cada movimiento otra. Los movimientos se aprenden en orden dentro de su grupo (Candado 1 antes que Candado 2; quitar uno quita los siguientes). El costo sale del saldo de Progresión: con el contador *Pagar con PA* eliges cuántos puntos van a PA y el resto va a PNA (se descuenta como Ambidestría, sin gastar de las pericias de arma).

- **CA:** solo cuenta tu mejor arte (no se acumulan), con peto ligero o sin armadura, en CA total y al toque (no en dureza). Piel de acero (Kung Fu, Mental 6) da −2 aparte y solo sin armadura. La pestaña Armadura muestra el origen ("Artes marciales · Aikijutsu: −3") y si está activa o inactiva y por qué.
- **Armas:** cada arte conocida crea su ataque desarmado (no se puede quitar aparte) con GAC0, daño y crítico como cualquier arma, competencia incluida y especialización con PA de arma. RT: 1/1 más 2 pasos por cada ataque extra del arte (ataques 3 = 3/3).
- **Homebrew:** Homebrew → Artes marciales (ataques, daño, CA, método, armas y movimientos con clave "Grupo N", y CA opcional por movimiento).

### Techno

Subpestaña *Techno* (se llena si tienes la clase). El Techno **fabrica objetos propios**, no "mejoras":

- **Armas (melee/distancia):** parten de cualquier arma de la lista (opcional) y todo es editable, incluido el **RT base**. El dado de la tabla se suma al daño y el **bono de RT del Techno se suma siempre** al RT del arma (no es una creación aparte).
- **Armas de área:** un objeto con elemento, área, daño (de la tabla) y salvación coherente. Se desbloquean en el nivel 7 y un elemento nuevo cada 3 niveles: Fuego 7 (3×3 m, AL), Ácido 10 (4,5 m, AL), Frío 13 (6 m, AL), Electricidad 16 (7,5 m, CVV), Veneno 19 (9 m, PVM), Sónico 22 (12 m, PP), Fuerza 25 (15 m, CyO), Radiante y Necrótico 28 (18 m).
- **Armaduras:** parten de una armadura existente, editable como en Homebrew; el bono de armadura se suma a cada pieza que protege.
- **Monturas:** desde el nivel 4, 3 dados de golpe y +1 por nivel de Techno, d8 por dado (completo o tirado, o HP manual), GAC0 = 21 − DG, CA = 10 − bono de armadura, ataques y movimiento de la tabla.
- Imagen por URL o archivo local (se reduce a ≤192 px). Botones: *Agregar a mi equipo*, *Guardar en Homebrew*, *Entregar (archivo)*, *Nueva versión*, *Editar*, *Eliminar* y *Exportar catálogo completo*.
- **Compartir:** Homebrew tiene el tipo *Creaciones de Techno*. Armas y armaduras se guardan en sus apartados; lo demás, en creaciones. Otro jugador (sin ser Techno) importa el archivo con *Importar paquete* y usa *Agregar a mi taller* en Técnicas → Techno.

### Conjuros

Pestaña *Conjuros* con dos subpestañas. Catálogo: 397 conjuros arcanos y 315 divinos (con esferas), con su ficha completa.

- **Mago.** Espacios por nivel de conjuro según la tabla de AD&D 2.5 (niveles 1–30; el 26 en adelante es de la mesa). Libro de conjuros con el tope de INT y el % de aprender, memorización (el mismo conjuro se puede repetir), cuántos llevas preparados y cuántos faltan, "Lanzar" y "Descansar". Los reversibles se memorizan en forma normal o inversa. Opcional: **puntos de conjuro** (cada espacio vale su nivel de conjuro) para lanzar en lugar de memorizar.
- **Secciones plegables.** "Conjuros estudiados", "Libro de conjuros" y "Aprender conjuros" se contraen y la ficha recuerda lo que dejes abierto. De inicio: con memorización, estudiados abierto y libro cerrado; con puntos, libro abierto y estudiados cerrado.
- **Aprender conjuros.** Catálogo en dos paneles: lista con desplazamiento (sin tope de resultados) y el detalle del conjuro marcado con su botón. Filtros por nombre, nivel y escuela, y "Solo los que puedo aprender" (nivel alcanzable, sin escuelas prohibidas y sin los que ya tienes).
- **Bonos fuera de tu control.** "Bono de puntos (±)" para el mago y el hechicero (cambia el total), espacios extra del juego por nivel de conjuro para el mago (también suman puntos) y conjuros elegidos extra por nivel para el hechicero, con un campo de motivo.
- **Especialista.** Selector de escuela. De fábrica: +1 espacio por nivel (de su escuela), +15%/−15% al aprender, salvaciones +1/−1 y escuelas prohibidas bloqueadas; cada escuela puede cambiar esos valores. El **Mago salvaje** (magia salvaje) tiene +10%/−5% al aprender, sin ajustes de salvación, sin escuelas prohibidas y sus rasgos permanentes. Los poderes de nivel 8/11/14 y la prohibición de magia salvaje van bajo el interruptor de reglas opcionales de Player's Option.
- **Hechicero.** Lanzador por puntos (2 por nivel de personaje; cada conjuro cuesta su nivel). Un linaje (Dracónico, Salvaje, Sombras, Celestial, Abisal, Feérico, Tormenta, Sangre y Dijinn) da habilidades en los niveles 1, 6, 12 y 18 y 2 conjuros por nivel de conjuro; el hechicero elige 2 más por nivel. Los niveles de conjuro se abren como en la tabla del mago.
- **Bardo, Sacerdote, Sacerdote SP, Druida, Paladín y Explorador.** Cada uno con su tabla de espacios por nivel (1–30) y las mismas herramientas que el mago: memorización (se puede repetir el mismo conjuro; los reversibles, en forma normal o inversa), puntos de conjuro opcionales, bono de puntos ± y espacios extra del juego, y secciones plegables.
  - **Bardo** (arcano): libro de conjuros y catálogo arcano, como el mago, hasta nivel 7.
  - **Divinos:** sin libro; preparan cualquier conjuro de sus esferas (mayores hasta su nivel máximo, menores hasta el 3). Esferas fijas de AD&D 2.5 más una del Tomo de Magias: Druida +Tiempo, Paladín +Ley, Explorador +Viajeros. Se pueden sumar esferas a mano o tomar las de tu deidad.
  - **Bono de SAB:** los conjuros adicionales se acumulan fila por fila hasta tu SAB y solo se usan en los niveles que ya tienes; los demás quedan pendientes. También se avisa el fallo de conjuro por SAB baja.
  - **Habilidades del dios:** un espacio de notas en cada clase divina y, en Homebrew → Deidades, esferas mayores/menores y poderes de la deidad, que viajan en los paquetes para compartir dioses.
  - Sacerdote SP y Druida son sacerdotes especialistas: sus habilidades las da el dios (se anotan ahí).
- **Brujo** (pestaña Conjuros → Brujo). Magia por petición a un patrón, pensada para ser distinta de mago y sacerdote sin ser más fuerte que ellos.
  - **Un solo pacto** (Llama, Abismo, Enigma, Ancestro, Umbral, Dragón). Cada pacto da una *lista de patrón* (2 escuelas arcanas, esferas divinas y conjuros firma) y siete técnicas, una por título (niveles 1, 4, 7, 10, 13, 16 y 19). Las técnicas de los niveles 16 y 19 y los costos son propuestas mías: se editan duplicando el pacto en Homebrew.
  - **Espacios:** tabla propia (tope en conjuros de nivel 6) más los conjuros adicionales de SAB, que decide cómo lanza, y los extras del juego (±).
  - **Puntos de pacto:** nivel + ajuste de reacción de CAR (mínimo 1) ± bono. Se gastan en técnicas activas (las pasivas son gratis) y en conjuros nuevos. Descansar no los recupera.
  - **Pedir conjuros (preparar):** solo los que el patrón ya concedió; se puede repetir el mismo. Cada uno toma 10 min × su nivel − el ajuste de reacción de CAR (mínimo 1 min). La hoja suma el tiempo total.
  - **Conjuros nuevos:** se piden al patrón y cuestan su nivel en puntos de pacto, solo de la lista del pacto. Hay un modo "concedido sin costo" para lo que dé el DM.
  - **Recuperar puntos:** botón "Pedir al patrón" (60 min): 2d10 + ajuste de reacción de CAR → 4 o menos hostil (nada y un favor anotado), 5–8 seco, 9–12 indiferente (1 punto), 13–16 favorable (1d4), 17 o más entusiasta (2d4).
  - **Homebrew → Pactos de brujo:** escuelas, esferas, conjuros firma y técnicas con costo o pasivas; viajan en los paquetes.
- **Pestaña Poderes** (antes "Conjuros"): cuatro grupos con sus clases dentro: **Arcano** (Mago, Hechicero, Bardo), **Divino** (Sacerdote, Sacerdote SP, Druida, Paladín, Explorador), **Pacto** (Brujo) y **Psiónica** (Psiónico y Talento salvaje). Las clases que tu personaje usa salen primero; las demás aparecen apagadas.
- **Psiónico** (Poderes → Psiónica → Psiónico). 153 poderes del manual (45 ciencias y 108 devociones) en 6 disciplinas, con su texto completo. La ficha solo lleva el control; las tiradas las hacen la mesa y el DM.
  - **PSP:** base por SAB (15→20, 16→22, 17→24, 18 o más→26) + ajuste de INT + ajuste de CON + (nivel − 1) × (10 + ajuste de SAB). Ajuste: 16 = +1, 17 = +2, 18 o más = +3. Con bono ± y motivo.
  - **Elecciones por nivel:** disciplinas, ciencias, devociones y modos defensivos según la tabla del manual (1–20). Del 21 al 30 la extendí: ciencias +1 cada dos niveles, devociones +1 por nivel, disciplinas 6 y modos defensivos 5.
  - **Avisos** (no bloquean): requisitos de la clase (SAB 15, INT 12, CON 11), 2 devociones por cada ciencia de una disciplina, una disciplina secundaria no puede igualar a la primaria, poderes de disciplinas que no tienes, y prerrequisitos que faltan (los 76 poderes con prerrequisitos están vinculados a los poderes del catálogo).
  - **Puntuación de poder:** se muestra ya calculada con tu atributo (por ejemplo "SAB 17 − 3 = 14").
  - **Usar y mantener:** "Usar" paga el costo de inicio (si el poder no tiene costo numérico se anota a mano). Los poderes activos cobran su mantenimiento por round, turno, hora o día con los botones "Pasar un round / un turno / una hora", y avisa si no alcanzan los PSP.
  - **Recuperación:** por actividad (esfuerzo agotador 0/h, caminar o cabalgar 3/h, reposar o leer 6/h, dormir 12/h) y horas, con el botón rápido "Dormir 8 horas".
  - **Notas y secuelas** (riesgos del 20 natural u otros) en texto libre.
- **Talento psiónico salvaje** (Poderes → Psiónica → Talento salvaje). Para cualquier personaje:
  - **Potencial:** 1% + SAB, INT y CON (16 = +1, 17 = +2, 18 o más = +3, cada una) + nivel (5–8 = +1, 9 o más = +2); ×½ una sola vez si es mago, sacerdote o no humano.
  - **Intérprete de las tablas 12 y 13:** escribes el d100 que sacó el DM (00 = 100) y la ficha te dice el poder, o te pide elegir ("cualquier devoción de X"), tirar de nuevo o elegir varios. También se puede añadir a mano.
  - **PSP del talento:** suma de (inicio + 4 × mantenimiento) de cada poder, más 4 por cada nivel ganado después de despertarlo. Los poderes que se piden como prerrequisito se listan aparte.
  - Con su propia recuperación, mantenimiento, secuelas (riesgos 97–00 como texto) y notas.
- **Datos psiónicos:** tomados del archivo heredado V31.2. Se unificó "Metapsiónica" y se vincularon por nombre las referencias que no coincidían exacto: PES → "PES (Percepción extrasensorial)", Sentido del espíritu → Captar espíritus, Ensueño → Ensoñación y Ocultar los pensamientos → Ocultar pensamientos.
- **Homebrew:** Poderes psiónicos, Disciplinas psiónicas y Modos defensivos (con prerrequisitos, costo, mantenimiento y puntuación); viajan en los paquetes.
- **Pestaña Consulta** (wiki interna, solo lectura, no usa tu personaje). Se abre desde la barra de pestañas, entre Poderes y Homebrew.
  - **Buscador global** arriba: busca por nombre en todas las categorías y agrupa los resultados; un clic abre el elemento.
  - **Categorías:** Magia salvaje, Conjuros (filtros por tipo, nivel, escuela o esfera), Pactos del brujo, Escuelas de magia, Linajes; Poderes, Disciplinas y Modos defensivos psiónicos; Clases (con su tabla de THAC0, salvaciones y PX por nivel), Razas, Kits, Pericias sin arma, Idiomas, Deidades; Armas, Armaduras, Artes marciales, Escuelas de espadachín; y Tablas (características, espacios de conjuros del mago, de las clases lanzadoras y del brujo, y las tablas de THAC0, salvaciones y PX).
  - **Homebrew incluido:** todo lo que agregues en Homebrew aparece en su categoría marcado con ★, y se puede filtrar "Solo homebrew". Cada elemento tiene el botón **Copiar a homebrew para editar** (o **Editar en Homebrew** si ya es tuyo).
- **Magia salvaje** (Consulta → Magia salvaje), del mago salvaje de Tome of Magic. Solo aparece en Consulta:
  - **Resumen de la regla** y las dos tablas completas: la Tabla 1 de variación de nivel (d20 por nivel, 1 a 8 y 9+) con las 9 oleadas en negrita y marcadas, y la Tabla 2 con los 100 resultados de la oleada, traducidos. Las distancias van en metros primero y pies entre paréntesis.
  - **Consultar una tirada:** escribes el nivel del lanzador y el d20 y te dice la variación, el nivel con el que se lanza el conjuro y si hay oleada; escribes el d100 (00 = 100) y te muestra el resultado. No tira dados.
  - **Objetivo:** si el conjuro tiene varios objetivos, el resultado afecta a todos; si no tiene objetivo, a uno al azar a 9 m (30') del lanzador, que puede ser el propio lanzador.
  - **Tabla fija con copia editable:** "Copiar a homebrew para editar" crea tu variante en Homebrew → *Magia salvaje (tablas)*: una matriz de 9 líneas con 20 números (un `*` marca la casilla de oleada) y 100 líneas de resultados. La copia aparece en el selector de tablas de Consulta y viaja en los paquetes homebrew.
- **Dotes (regla opcional, por personaje).** Se enciende en Ficha → "Reglas opcionales"; entonces aparece la pestaña **Dotes**. Apagada se oculta, pero las dotes se conservan. La hoja **solo marca**: no cambia ningún número; si una dote da un bono, se aplica a mano en el apartado que corresponda.
  - **Puntos de dote (PD):** 1 al empezar y +1 en los niveles 3, 6, 9, 12, 15, 18… (el mismo ritmo que los espacios de pericia, con el nivel total del personaje). Cada dote cuesta su coste en PD, así que una de coste 4 se puede tener desde el nivel 9. Pasarte del presupuesto o repetir una dote solo da un aviso (también arriba, en la cabecera de la ficha).
  - **Dotes compradas:** 100 dotes en 5 grupos (combate marcial, magia arcana, fe y divinidad, sigilo y exploración, atributos/social/psiónica), con buscador y filtros por grupo y coste, y un campo de elección o nota por dote (por ejemplo el elemento de Afinidad Elemental).
  - **Dote de humano:** una dote de coste 1 gratis, aparte de los PD (solo para personajes humanos; avisa si no es de coste 1).
  - **Dote de nacimiento:** 27 entradas en una tabla d100. Escribes el número y la hoja te dice la dote (o la eliges a mano). Las tiradas se acumulan y avisa si se repite una; el 100 pide tirar dos veces. Ayudas: **Ascendencia Divina** (d100 de mitología proporcional al número de dioses de cada panteón y luego el dado del dios, 1dN, con los 145 dioses de Legends & Lore), **Ascendencia Heroica** (d6 de la característica) y recordatorios de Psiónica salvaje y Magia salvaje (dónde está cada módulo).
  - **Ajustes de balance mías:** Legado del Aventurero sube a coste 4 y Maestro de Armas Arrojadizas a 2. Las reglas de 3.ª edición se cambiaron por equivalentes de 2.ª (Reflejos de Combate, Acrobacia de Combate, Desarme Táctico, Lanzamiento Defensivo, Guardia del Escudo, Escudo de la Fe, Contramagia Instintiva, Forma Cambiante Mejorada, Eco Arcano).
  - **Consulta:** Dotes, Dotes de nacimiento y Mitologías de ascendencia están siempre en Consulta, con el interruptor encendido o no.
  - **Homebrew:** *Dotes* (nombre, grupo, coste, efecto) y *Tablas de dotes de nacimiento* (una copia editable de las dos tablas: "rango | nombre | efecto | acción" y "rango | mitología | dioses"; los rangos deben cubrir del 1 al 100). Si hay más de una tabla, el personaje elige cuál usar.
- **Homebrew:** editores de *Conjuros*, *Escuelas de magia* (con especialista, escuelas prohibidas, % al aprender, ajustes de salvación, espacio extra, rasgos permanentes y poderes por nivel) y *Linajes de hechicero*. Así se agregan la magia elemental, la salvaje u otras del Tomo de Magias. Todo se exporta e importa con los paquetes.
- Dijinn lo completó la mesa (habilidades y conjuros de tema genio): se puede ajustar en Homebrew duplicándolo.

#### Bardo y clases divinas

Subpestañas *Bardo*, *Sacerdote*, *Sacerdote SP*, *Druida*, *Paladín* y *Explorador*, cada una con su tabla de espacios (niveles 1–30, de la mesa).

- **Bardo (arcano).** Libro de conjuros y memorización como el mago (mismo catálogo arcano, con su propia progresión, hasta nivel 7).
- **Divinos.** No usan libro: preparan cualquier conjuro de sus **esferas** (mayores hasta su nivel máximo; menores hasta el 3). Esferas de fábrica de AD&D 2.5 más una del Tomo de Magias: Druida +Tiempo, Paladín +Ley, Explorador +Viajeros; el Sacerdote y el Sacerdote SP tienen "Total" y eligen el resto. Todos pueden **agregar esferas** a mano o **tomarlas de su deidad**.
- **Bono de SAB.** Los conjuros adicionales se **acumulan** (cada fila de la tabla hasta tu SAB aporta un espacio del nivel que indica) y solo se usan si ya tienes espacios de ese nivel; si no, quedan pendientes. Ejemplo: SAB 18 y sacerdote de nivel 5 → 5-5-2-0 (el de nivel 4 queda pendiente hasta el nivel 7); SAB 19 y nivel 9 → 7-6-4-4-1. El fallo de conjuro por SAB baja se muestra como aviso.
- **Puntos de conjuro opcionales** en todas las clases (cada espacio vale su nivel), con bono ± y espacios extra del juego por nivel, y plegables como en el mago.
- **Deidades en Homebrew** con esferas mayores/menores y poderes: se comparten en un paquete y el sacerdote las toma. Cada clase divina tiene un campo para anotar las habilidades especiales que da el dios (el Sacerdote SP y el Druida son sacerdotes especialistas: sus habilidades las da el dios).
- Esferas dudosas que conviene revisar en tu mesa: las del Explorador (Animal, Vegetal, Clima y Viajeros).

### Equipo y Tienda

- **Pestaña Equipo.** Arriba, el *Resumen de riqueza* (valor por lugar, patrimonio conocido, líneas sin tasar, ingreso y gasto mensual; todo informativo). Secciones: **Mochila** (lo que carga el personaje), **Transporte y alojamiento** (varias unidades: caballo, carreta, cuarto de hotel…, cada una con capacidad en kg), **Fortaleza** (varias; lugar, tamaño, estado, defensas, personal, mantenimiento mensual y lista de mejoras) y **Propiedades** (varias; casas, tabernas…, con valor, ingreso y gasto mensual; solo informativo, no hay botón de "cobrar un mes"), más el **Historial** de compras, ventas y servicios.
- **Cada lugar** tiene objetos (nombre, cantidad, peso kg, valor mo, estado Guardado/Puesto/Consumible, notas), monedas (MC, MP, ME, MO, MPL) y tesoros (tipo, descripción, cantidad, valor, peso, estado, notas).
- **Monedas.** mc 0,01 · mp 0,1 · me 0,5 · mo 1 · mpl 5 (en mo). 50 monedas pesan 0,45 kg.
- **Carga (informativa).** Suma objetos de la Mochila (los "Puestos" no cuentan), monedas, tesoros y la armadura que lleva puesta en la pestaña Armadura (torso 50 %, brazos 25 %, piernas 25 % del peso de la armadura completa). Se compara con "Peso autorizado" y "Peso máximo" de la FUE: Normal / Cargado / Sobrecargado. No cambia el movimiento ni ningún número. Las armas pesan solo si están en la lista de la Mochila.
- **Pestaña Tienda.** 312 objetos del catálogo de la hoja vieja (ropa, comida y alojamiento, provisiones, transporte, animales, servicios, arreos, equipo, armaduras y armas) con buscador y filtros de categoría y destino. **Comprar** descuenta de la tesorería elegida con conversión entre monedas (primero la moneda del precio, luego las menores, luego las mayores; si hay que romper una moneda se devuelve el cambio en mo/mp/mc; si no alcanza, avisa y no cambia nada). **Agregar sin pagar** solo añade. Los **servicios** solo descuentan y quedan en el historial. **Vender** (botón en cada objeto) paga por defecto el 50 % del valor, editable por venta. Lo comprado se guarda como copia (nombre, peso, valor).
- **Armas y armaduras compradas** van solo a la lista del lugar elegido; no se pasan solas a las pestañas Armas o Armadura.
- **Consulta:** *Tienda (precios)* en solo lectura. **Homebrew:** *Objetos de tienda* (categoría, costo, peso kg, destino sugerido, notas); las armas y armaduras homebrew aparecen solas en la Tienda (la armadura homebrew tiene costo y peso opcionales; el peso del arma se lee como kg).
- **Hoja impresa:** sección Equipo (mochila, monedas, carga, transporte, fortalezas, propiedades con ingreso).
- **Importar de la hoja vieja:** mochila, monedas, tesoros, transporte, fortaleza y propiedades.
- Tres objetos del catálogo no traen precio (Garrote, Bastón, Piedra de honda): se escribe el precio al comprar. Cinco precios del catálogo son aproximados y se marcan con ≈.

### Historia, Compañeros e imágenes

Todo informativo: no cambia ningún número de la hoja.

- **Historia** (reemplaza a la pestaña Notas): imagen de cuerpo entero, trasfondo (título, origen, estatus, afiliación, profesión, lema, motivación, temor, ideales), historia de origen, personalidad y apariencia (la misma de Ficha), y listas reordenables: objetivos (con estado), relaciones (con etiquetas múltiples), hitos de campaña, crónica, reputación y títulos, secretos y conocimiento, más las notas del jugador. La libreta "Equipo y monedas" de versiones anteriores solo aparece si tenía texto.
- **Compañeros**: *Séquito* (tipo, nombre, sede, moral, 8 seguidores y, según el tipo, tropa, gremio o 6 aprendices; con imagen del grupo), *Mascotas* (lista libre, cada una con imagen), *Familiar* (siempre visible: ficha, 9 poderes por nivel de conjuro, vínculo, imagen) y *Compañeros registrados* (ficha rápida, estado, ocultar, duplicar, inventario propio cuyo peso no suma a la carga del personaje, imagen).
- **Imágenes**: retrato de busto en **Ficha**, cuerpo entero en **Historia** y pequeñas en séquito, mascotas, familiar y compañeros. Cada una acepta archivo local (se reduce a 500 px; 192 px las pequeñas) o URL https. Se guardan dentro del personaje y viajan al exportarlo.
- **Menú lateral**: el retrato de Ficha aparece bajo el selector de tema, solo se edita en Ficha.
- **Hoja impresa**: retrato en el encabezado; imagen de cuerpo entero junto al Equipo; secciones Historia y Compañeros. Los secretos solo se imprimen si los marcas como públicos; crónica y notas del jugador no se imprimen.
- **Importar de la hoja vieja**: campos sueltos de Historia, séquito, mascotas y familiar (y el retrato si era una URL). Las listas con filas dinámicas (objetivos, relaciones, hitos, crónica, reputación, secretos y compañeros registrados) no se importan.

### Kits: armas, pericias y bonos gratis

En Homebrew → Personaje → Kits, un kit puede dar, sin gastar PA ni PNA: competencia con armas sueltas o grupos enteros, especialización (arma o grupo), pericias sin arma con mejoras gratis, y bonos a GAC0, daño o RT que son fijos o crecen (aplica a todas / cuerpo a cuerpo / distancia / un grupo / un arma; valor inicial, desde el nivel, +paso cada N niveles, tope opcional). Todo aparece marcado "Del kit" en Armas y Pericias, y los bonos se desglosan en cada arma. Solo cuentan los kits de la clase que gobierna (en doble clase, la congelada no aporta). Positivo = mejora.

### Navegación de Homebrew y Consulta

Ambas pestañas tienen una barra fija de familias (Personaje, Combate, Magia, Psiónica, Reglas opcionales, Equipo y otros; en Consulta, además, subcategorías). Solo se ve la lista de la familia elegida; el editor mantiene fijos Guardar / Cerrar y las listas "Base" van plegadas. Importar/exportar está en un desplegable.

### Espacios reorganizados

Ficha con columnas equilibradas, Equipo con el resumen de riqueza en una línea (desglose plegado) y Historia en dos columnas en pantallas anchas.

### Poderes de clase, pericias gratis y estilos con niveles gratis

- Cada clase puede tener **poderes** (solo texto, con el nivel en que llegan). Se ven en la pestaña Ficha (los que aún no llegan, atenuados), en Consulta y en la hoja impresa (solo los ya obtenidos). Las clases base traen los suyos (Druida, Paladín y Explorador con el texto completo; las demás con una descripción breve para revisar). En Homebrew, una clase puede tener poderes propios.
- Cada clase puede dar **pericias sin arma gratis** (Explorador: rastreo y supervivencia; Bárbaro: supervivencia; Mago: leer y escribir; Sacerdote y Sacerdote especialista: leer y escribir y religión; Bardo: leer y escribir e historia local). Funcionan como las del kit y solo cuentan mientras la clase gobierne.
- En Armas → Estilos cada estilo tiene **niveles gratis (modificador externo)**: suben el nivel efectivo sin gastar PA, hasta el máximo del estilo.
- **Artes marciales**: si ya no te quedan PNA pero sí PA, el arte o movimiento nuevo se paga solo con PA (antes bloqueaba la compra y el botón "Pagar con PA" no hacía nada porque aún no había artes).
- Los huecos de INT para **idiomas** y las **pericias flexibles** son cupos independientes: gastar uno no descuenta del otro.

### Impresión: estilos, hoja de conjuros y movimiento

- **Imprimir** abre un diálogo (se recuerda tu elección): qué imprimir (hoja de personaje, hoja de conjuros o las dos), el estilo (**Clásica**, **Azul ornamentada** con marcos y bandas azules sobre papel casi blanco, o **Compacta**, una sola página de combate) y **Ahorrar tinta** (sin bandas de color).
- La hoja de personaje ahora trae Movimiento, GAC0 (natural, FUE, DES, ambidestría), la columna **Entrada** (daño plano del arma sin el dado) y ojos, cabello y piel. La Azul agrega la tabla de objetos equipados con las ranuras de la pestaña Armadura.
- **Hoja de conjuros**: una página por clase lanzadora (Mago, Bardo, Hechicero, Brujo, Sacerdote, Druida…), con una tabla por nivel de conjuro: nombre, casilla **Mem.** (cuántas veces lo tienes memorizado) y casilla **Mat.** (componentes materiales), más renglones en blanco. Mago, Bardo, Hechicero y Brujo listan su libro o conocidos; Sacerdote y Druida listan todos los conjuros de sus esferas.
- **Movimiento** (pestaña Combate y hojas): base de la raza (12 humano/elfo/semielfo…, 6 enano/gnomo/mediano; una raza homebrew puede fijar el suyo), o el de la clase si es mayor (Bárbaro 18), más bonos (objetivo "Movimiento" en Bonos manuales). La carga lo reduce: Cargado a la mitad, Sobrecargado a un tercio.

### Pericias: descripciones

Las 226 pericias del catálogo traen su descripción (en el catálogo y en las aprendidas); las pericias propias de Homebrew tienen un campo de descripción que viaja en los paquetes. Las habilidades de Bribón parten de 40% en Escalar paredes y 15% en Escuchar ruidos para cualquier criatura; las bases de clase se respetan si son mayores.

## Temas

Selector en la barra lateral: Pergamino oscuro (por defecto), Papel, Pizarra y Alto contraste. En pantallas angostas la barra lateral pasa a pestañas arriba.

## Personajes del archivo anterior

Importar con el botón *Importar* un archivo `ADND2_CHARACTER_V4` del constructor viejo: se migra solo (razas, variantes, arquetipos → kits, deidades, clases personalizadas, equipo).

## Pruebas

```
node tests/reglas.test.js
node tests/humo.js
```

## Todavía no incluido

Retrato e imágenes. Los conjuros del archivo viejo no se importan (la pestaña Conjuros es nueva).

Las fuentes vienen de Google Fonts; sin internet se usan tipos del sistema.
