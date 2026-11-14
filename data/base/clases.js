/* Clases base. Campos: thaco/salvaciones/xp = nombre de tabla; dg = dado de golpe;
   dgNivelMax = último nivel que tira dg; pgDespues = PG fijos por nivel posterior;
   pericias = pericias de arma (pa) y no de arma (pna): iniciales y cada cuántos niveles ganas una.
   Opcional: topeBonoCon (número; sin tope si es null). Por defecto: sin tope con la tabla thaco "Luchador", 2 con las demás. */
ADND.base.clases = [
  {
    id: "guerrero",
    nombre: "Guerrero",
    thaco: "Luchador",
    salvaciones: "Luchador",
    xp: "Guerrero",
    dg: 10,
    dgNivelMax: 9,
    pgDespues: 3,
    pericias: { pa0: 4, pna0: 3, paCada: 3, pnaCada: 3 }
  },
  {
    id: "explorador",
    nombre: "Explorador",
    thaco: "Luchador",
    salvaciones: "Luchador",
    xp: "Paladin",
    dg: 10,
    dgNivelMax: 9,
    pgDespues: 3,
    pericias: { pa0: 4, pna0: 3, paCada: 3, pnaCada: 3 },
    ambidestriaGratis: true
  },
  {
    id: "paladin",
    nombre: "Paladín",
    thaco: "Luchador",
    salvaciones: "Luchador",
    xp: "Paladin",
    dg: 10,
    dgNivelMax: 9,
    pgDespues: 3,
    pericias: { pa0: 4, pna0: 3, paCada: 3, pnaCada: 3 }
  },
  {
    id: "espadachin",
    nombre: "Espadachín",
    thaco: "Luchador",
    salvaciones: "Luchador",
    xp: "Paladin",
    dg: 10,
    dgNivelMax: 9,
    pgDespues: 3,
    pericias: { pa0: 4, pna0: 3, paCada: 3, pnaCada: 3 }
  },
  {
    id: "barbaro",
    nombre: "Bárbaro",
    thaco: "Luchador",
    salvaciones: "Luchador",
    xp: "Paladin",
    dg: 12,
    dgNivelMax: 9,
    pgDespues: 3,
    pericias: { pa0: 4, pna0: 3, paCada: 3, pnaCada: 3 }
  },
  {
    id: "cambiaformas",
    nombre: "Cambiaformas",
    thaco: "Luchador",
    salvaciones: "Luchador",
    xp: "Paladin",
    dg: 12,
    dgNivelMax: 9,
    pgDespues: 3,
    pericias: { pa0: 2, pna0: 4, paCada: 3, pnaCada: 3 }
  },
  {
    id: "monje",
    nombre: "Monje",
    thaco: "Divino",
    salvaciones: "Sacerdote",
    xp: "Sacerdote",
    dg: 8,
    dgNivelMax: 9,
    pgDespues: 2,
    pericias: { pa0: 2, pna0: 4, paCada: 3, pnaCada: 3 },
    ambidestriaGratis: true
  },
  {
    id: "sacerdote",
    nombre: "Sacerdote",
    thaco: "Divino",
    salvaciones: "Sacerdote",
    xp: "Sacerdote",
    dg: 8,
    dgNivelMax: 9,
    pgDespues: 2,
    pericias: { pa0: 2, pna0: 4, paCada: 3, pnaCada: 3 }
  },
  {
    id: "sacerdote_sp",
    nombre: "Sacerdote Sp",
    thaco: "Divino",
    salvaciones: "Sacerdote",
    xp: "SacerdoteSP",
    dg: 8,
    dgNivelMax: 9,
    pgDespues: 2,
    pericias: { pa0: 2, pna0: 4, paCada: 3, pnaCada: 3 }
  },
  {
    id: "druida",
    nombre: "Druida",
    thaco: "Divino",
    salvaciones: "Sacerdote",
    xp: "SacerdoteSP",
    dg: 8,
    dgNivelMax: 9,
    pgDespues: 2,
    pericias: { pa0: 2, pna0: 4, paCada: 3, pnaCada: 3 }
  },
  {
    id: "brujo",
    nombre: "Brujo",
    thaco: "Divino",
    salvaciones: "Sacerdote",
    xp: "Sacerdote",
    dg: 8,
    dgNivelMax: 9,
    pgDespues: 2,
    pericias: { pa0: 2, pna0: 4, paCada: 3, pnaCada: 3 }
  },
  {
    id: "ladron",
    nombre: "Ladrón",
    thaco: "Bribon",
    salvaciones: "Bribon",
    xp: "Bribon",
    dg: 6,
    dgNivelMax: 10,
    pgDespues: 2,
    pericias: { pa0: 3, pna0: 3, paCada: 4, pnaCada: 4 },
    ambidestriaGratis: true
  },
  {
    id: "bardo",
    nombre: "Bardo",
    thaco: "Bribon",
    salvaciones: "Bribon",
    xp: "Bribon",
    dg: 6,
    dgNivelMax: 10,
    pgDespues: 2,
    pericias: { pa0: 3, pna0: 3, paCada: 4, pnaCada: 4 }
  },
  {
    id: "psionico",
    nombre: "Psiónico",
    thaco: "Bribon",
    salvaciones: "Psionico",
    xp: "Psionico",
    dg: 6,
    dgNivelMax: 10,
    pgDespues: 2,
    pericias: { pa0: 2, pna0: 3, paCada: 5, pnaCada: 3 }
  },
  {
    id: "hechicero",
    nombre: "Hechicero",
    thaco: "Bribon",
    salvaciones: "Bribon",
    xp: "Mago",
    dg: 6,
    dgNivelMax: 10,
    pgDespues: 2,
    pericias: { pa0: 1, pna0: 4, paCada: 5, pnaCada: 3 }
  },
  {
    id: "techno",
    nombre: "Techno",
    thaco: "Bribon",
    salvaciones: "Bribon",
    xp: "Bribon",
    dg: 4,
    dgNivelMax: 10,
    pgDespues: 2,
    pericias: { pa0: 3, pna0: 4, paCada: 3, pnaCada: 3 }
  },
  {
    id: "mago",
    nombre: "Mago",
    thaco: "Arcano",
    salvaciones: "Mago",
    xp: "Mago",
    dg: 4,
    dgNivelMax: 10,
    pgDespues: 1,
    pericias: { pa0: 1, pna0: 4, paCada: 6, pnaCada: 3 }
  }
];
