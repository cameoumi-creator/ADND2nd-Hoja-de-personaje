/* Artes marciales (AD&D 2.5, Combat & Tactics). Datos base: 15 artes con sus movimientos, y el catálogo de maniobras.
   Cada arte: ataques (atk = ataques por round; 1 es lo normal), daño desarmado, modificador de CA (negativo mejora),
   método de pelea y armas que usa. Los movimientos se aprenden en orden dentro de su grupo (Candado 1, luego Candado 2…). */
(function (A) {
  'use strict';
const ARTES = {
    "Aikijutsu":            {atk:1, dano:"1d2",   ac:-3, met:"Cuerpo",  armas:"Varas, espadas orientales, medias y de duelo"},
    "Atemi":                {atk:1, dano:"1d8",   ac:-1, met:"Mano/Pie",armas:"Garrotes, varas"},
    "Jujutsu":              {atk:1, dano:"1d4",   ac:-2, met:"Cuerpo",  armas:"Espadas de duelo, orientales y medias"},
    "Karate":               {atk:1, dano:"1d8",   ac:-1, met:"Mano",    armas:"Improvisadas"},
    "Kung Fu":              {atk:1, dano:"1d6",   ac:-2, met:"Mano",    armas:"Cualquier arma de melé"},
    "Ninjutsu":             {atk:1, dano:"1d4",   ac:-2, met:"Piernas", armas:"Espadas cortas, orientales, cadena, cuerda"},
    "Sumo":                 {atk:1, dano:"1d4",   ac:-1, met:"Mano",    armas:"Ninguna"},
    "Tae Kwon Do":          {atk:1, dano:"1d8",   ac:-1, met:"Pie",     armas:"Espadas medias, varas, garrotes"},
    "Pancracio clásico":    {atk:1, dano:"1d6",   ac:-2, met:"Mano",    armas:"Espadas cortas"},
    "Pancracio libre":      {atk:1, dano:"1d8",   ac:-1, met:"Mano",    armas:"Espadas cortas"},
    "Lucha libre":          {atk:1, dano:"1d4",   ac:-3, met:"Cuerpo",  armas:"Ninguna"},
    "Capoeira":             {atk:1, dano:"1d4+1", ac:-2, met:"Piernas", armas:"Garrotes"},
    "Muay Thai":            {atk:1, dano:"1d4+1", ac:-1, met:"Piernas", armas:"Garrotes"},
    "Boxeo":                {atk:2, dano:"1d6",   ac:-2, met:"Manos",   armas:"Cestus, manoplas"},
    "Callejero":            {atk:1, dano:"1d6",   ac:-2, met:"Manos",   armas:"Cualquiera"}
  };
  const AM_MOVS = {
    "Aikijutsu": ["Candado 1","Candado 2","Candado 3","Bloqueo 1","Bloqueo 2","Bloqueo 3","Bloqueo 4","Mov 1","Mov 3","Arrojar 1","Arrojar 2","Arrojar 3","Arrojar 4","Mental 1","Mental 2","Mental 3","Mental 4","Mental 5"],
    "Atemi": ["Bloqueo 1","Bloqueo 2","Mov 1","Empujar 3","Golpear 1","Vital 1","Vital 2","Vital 3"],
    "Jujutsu": ["Candado 1","Candado 2","Candado 3","Candado 4","Arrojar 1","Arrojar 2","Arrojar 3","Arrojar 4","Mov 1","Mov 3","Vital 1","Vital 2","Mental 1","Mental 2","Mental 3"],
    "Karate": ["Golpear 1","Golpear 2","Golpear 3","Patada 1","Bloqueo 1","Bloqueo 2","Mov 1","Mental 1","Mental 4"],
    "Kung Fu": ["Candado 1","Golpear 1","Golpear 2","Patada 2","Bloqueo 1","Bloqueo 2","Bloqueo 3","Bloqueo 4","Mental 4","Mental 6"],
    "Ninjutsu": ["Patada 1","Patada 2","Candado 1","Candado 3","Mov 1","Mov 2","Mov 4","Golpear 1","Arrojar 1","Arrojar 2","Bloqueo 1","Bloqueo 3","Bloqueo 4","Mental 2","Mental 4"],
    "Sumo": ["Candado 2","Mov 3","Empujar 1","Empujar 2","Arrojar 1","Arrojar 3","Bloqueo 1"],
    "Tae Kwon Do": ["Patada 1","Patada 2","Patada 3","Golpear 1","Arrojar 4","Bloqueo 1","Bloqueo 2","Mov 4"],
    "Pancracio clásico": ["Golpear 1","Arrojar 3","Arrojar 4","Mov 1","Mov 3"],
    "Pancracio libre": ["Golpear 1","Patada 1","Patada 2","Candado 1","Candado 3","Mov 2","Vital 1","Vital 2"],
    "Lucha libre": ["Candado 1","Candado 3","Candado 4","Arrojar 3","Arrojar 4","Mov 2","Mov 3","Vital 1"],
    "Capoeira": ["Mov 1","Mov 2","Mov 4","Mov 5","Mov 6","Patada 1","Patada 2","Patada 4","Arrojar 2","Golpear 1","Golpear 2","Mental 1"],
    "Muay Thai": ["Bloqueo 2","Bloqueo 3","Bloqueo 4","Empujar 1","Golpear 1","Golpear 2","Golpear 3","Vital 1","Vital 2","Vital 3"],
    "Boxeo": ["Golpear 1","Golpear 2","Mov 1","Mov 5","Mental 2","Mental 5"],
    "Callejero": ["Bloqueo 1","Bloqueo 3","Patada 1","Candado 1","Candado 4","Mov 1","Mov 2","Arrojar 1","Arrojar 2","Arrojar 3","Golpear 1","Golpear 2"]
  };
  const AM_EFECTO = {
    "Bloqueo 1":["Parreo básico","Bloquea un ataque de melé"],
    "Bloqueo 2":["Parrear todo","Costo: 2 AT; bloquea todos los ataques de melé"],
    "Bloqueo 3":["Parreo aferrante","Bloquea un ataque de melé; retiene el arma"],
    "Bloqueo 4":["Parreo de flechas","Costo: 2 AT; bloquea todos los ataques de misiles"],
    "Patada 1":["Patada circular","Dobla el daño básico"],
    "Patada 2":["Patada voladora","Salta; triplica el daño básico"],
    "Patada 3":["Patada hacia atrás","Patea a alguien detrás; daño normal"],
    "Patada 4":["Patada hacia atrás","Patea a alguien detrás; daño normal"],
    "Candado 1":["Candado al cuello","Todo el round; la víctima se desmaya"],
    "Candado 2":["Bloqueo de candado","Retiene arma/extremidad; +4 al golpe con otros ataques"],
    "Candado 3":["Incapacitador","Dobla el daño básico; incapacita el miembro"],
    "Candado 4":["Inmovilizador","Víctima inmovilizada"],
    "Mov 1":["Finta","Costo: 1 AT; +3 al golpe"],
    "Mov 2":["Pelea en el piso","Sin penalización por luchar en el piso, sentado o reclinado"],
    "Mov 3":["Inmovilidad","Salvación vs paralización para no caer"],
    "Mov 4":["Salto","Salta grandes distancias"],
    "Mov 5":["Velocidad","Dobla el número de ataques"],
    "Mov 6":["Resistencia a la lentitud","Inmune a efectos de lentitud"],
    "Mov 7":["Deflexión de misiles","Salvación vs paralización para no ser impactado por misiles normales"],
    "Empujar 1":["Empujón concentrado","Empuja 1 m cada 3 niveles; cae si es más de 1 m"],
    "Empujar 2":["Toque cercano","Mientras toca: +2 al golpe, −2 CA"],
    "Empujar 3":["Empujón de un solo dedo","Empujón concentrado a distancia"],
    "Golpear 1":["Puño de acero","1d10 de daño + Fuerza"],
    "Golpear 2":["Golpe aplastante","Rompe objetos inanimados; 1 round"],
    "Golpear 3":["Garra de águila","3d10 de daño; 1 AT/round"],
    "Arrojar 1":["Caer","Mitad de daño en caídas"],
    "Arrojar 2":["Parada instantánea","Ponte de pie al momento (niega el penalizador de 1 round)"],
    "Arrojar 3":["Derribo","Arroja 1d4 pies; dobla el daño básico"],
    "Arrojar 4":["Gran lanzamiento","Arroja 1 pie/nivel; triplica el daño básico"],
    "Vital 1":["Toque de dolor","−2 al golpe y +2 CA durante 1d3 rounds"],
    "Vital 2":["Toque aturdidor","Salvación vs parálisis o aturdido 1d4 rounds"],
    "Vital 3":["Toque paralizante","Salvación vs parálisis o inconsciente 2d4 rounds"],
    "Vital 4":["Muerte a distancia","Los toques anteriores a distancia; ×3 daño básico"],
    "Arma 1":["Rompearmas","Rompe automáticamente armas normales"],
    "Arma 2":["Ropa de acero","Arroja ropa 1–3 m como lanza; 1d8+1"],
    "Mental 1":["Meditación","1 hora de meditación = 2 horas de sueño"],
    "Mental 2":["Sentido de todo alrededor","Alerta a ataques en todas direcciones"],
    "Mental 3":["Resistencia mental","+2 a salvaciones vs ataques mentales"],
    "Mental 4":["Ataque de Ch'i","Golpea como arma mágica"],
    "Mental 5":["Lucha a ciegas","Solo −1 al luchar a ciegas"],
    "Mental 6":["Piel de acero","−2 CA sin armadura"],
    "Mental 7":["Levitar","Flota 5'/round/nivel"]
  };

  const slug = s => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  /* Piel de acero: el único movimiento con efecto numérico en la CA (solo sin armadura). */
  const CA_MOV = { 'Mental 6': -2 };
  /* Catálogo de movimientos existentes (para armar artes propias): clave, maniobra, efecto y CA si tiene. */
  A.base.artesMovs = Object.keys(AM_EFECTO).map(k => { const e = AM_EFECTO[k], m = { k, nombre: e[0], efecto: e[1] }; if (CA_MOV[k]) { m.ca = CA_MOV[k]; m.sinArmadura = true; } return m; });
  A.base.artes = Object.keys(ARTES).map(nombre => {
    const a = ARTES[nombre];
    return {
      id: slug(nombre), nombre, atk: a.atk, dano: a.dano, ac: a.ac, met: a.met, armas: a.armas,
      movs: (AM_MOVS[nombre] || []).map(k => { const e = AM_EFECTO[k] || [k, '']; const m = { k, nombre: e[0], efecto: e[1] }; if (CA_MOV[k]) { m.ca = CA_MOV[k]; m.sinArmadura = true; } return m; })
    };
  });
})(ADND);
