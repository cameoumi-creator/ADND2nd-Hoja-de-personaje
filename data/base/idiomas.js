/* Idiomas base y el idioma nativo (gratis) de cada raza base. Las razas homebrew declaran los suyos en el campo "idiomas". */
ADND.base.idiomas = [
  { id: 'comun', nombre: 'Común' }, { id: 'elfico', nombre: 'Élfico' }, { id: 'enano', nombre: 'Enano' }, { id: 'gnomo', nombre: 'Gnomo' },
  { id: 'mediano', nombre: 'Mediano' }, { id: 'orco', nombre: 'Orco' }, { id: 'goblin', nombre: 'Goblin' }, { id: 'hobgoblin', nombre: 'Hobgoblin' },
  { id: 'gigante', nombre: 'Gigante' }, { id: 'draconico', nombre: 'Dracónico' }, { id: 'infernal', nombre: 'Infernal' }, { id: 'abisal', nombre: 'Abisal' },
  { id: 'celestial', nombre: 'Celestial' }, { id: 'silvano', nombre: 'Silvano' }, { id: 'trol', nombre: 'Trol' }, { id: 'ogro', nombre: 'Ogro' },
  { id: 'kobold', nombre: 'Kobold' }, { id: 'subcomun', nombre: 'Subcomún' }, { id: 'primordial', nombre: 'Primordial' }
];
ADND.base.idiomasRaza = {
  humano: ['comun'], elfo: ['elfico'], semielfo: ['comun', 'elfico'], enano: ['enano'], gnomo: ['gnomo'], mediano: ['mediano'],
  orco: ['orco'], semiorco: ['comun', 'orco'], semihumano: ['comun'], tiefling: ['comun', 'infernal'], goliath: ['comun', 'gigante']
};
