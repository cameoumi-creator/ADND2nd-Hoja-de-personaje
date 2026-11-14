/* Armas: catálogo, especialización, estilos de combate. Generado del constructor anterior (V31.2) con correcciones.
   dm/dg = daño contra tamaño Pequeño-Mediano / Grande. tipo: cuerpo | distancia. */
ADND.base.armas = {
  catalogo: [
    {"id":"espadas-ancha","nombre":"Ancha","grupo":"Espadas","tipo":"cuerpo","dano":"C","dm":"2d4","dg":"1d6+1","tam":"M","peso":5,"crit":"(20)x3","adv":"(18)x3","rt":2,"esp":"","costo":"10 mo","muni":"","estilos":["um","ae","da"]},
    {"id":"espadas-bastarda","nombre":"Bastarda","grupo":"Espadas","tipo":"cuerpo","dano":"C","dm":"1d8","dg":"1d12","tam":"M","peso":6,"crit":"(19-20)x2","adv":"(17-20)x2","rt":2,"esp":"Versátil","costo":"25 mo","muni":"","estilos":["um","dm","ae","da"]},
    {"id":"espadas-claymore","nombre":"Claymore","grupo":"Espadas","tipo":"cuerpo","dano":"C","dm":"1d10","dg":"2d6","tam":"G","peso":8,"crit":"(19-20)x2","adv":"(17-20)x2","rt":2,"esp":"","costo":"25 mo","muni":"","estilos":["dm"]},
    {"id":"espadas-corta","nombre":"Corta","grupo":"Espadas","tipo":"cuerpo","dano":"C","dm":"1d6","dg":"1d8","tam":"L","peso":3,"crit":"(19-20)x2","adv":"(17-20)x2","rt":2,"esp":"Sutil","costo":"12 mo","muni":"","estilos":["um","ae","da"]},
    {"id":"espadas-cutlass","nombre":"Cutlass","grupo":"Espadas","tipo":"cuerpo","dano":"C","dm":"1d6","dg":"1d8","tam":"M","peso":3,"crit":"(19-20)x2","adv":"(17-20)x2","rt":2,"esp":"","costo":"12 mo","muni":"","estilos":["um","ae","da"]},
    {"id":"espadas-drusus","nombre":"Drusus","grupo":"Espadas","tipo":"cuerpo","dano":"C","dm":"1d6+1","dg":"2d4+1","tam":"M","peso":3,"crit":"(19-20)x2","adv":"(17-20)x2","rt":2,"esp":"","costo":"12 mo","muni":"","estilos":["um","ae","da"]},
    {"id":"espadas-falchion","nombre":"Falchion","grupo":"Espadas","tipo":"cuerpo","dano":"C","dm":"1d6+1","dg":"2d4","tam":"M","peso":5,"crit":"(19-20)x2","adv":"(17-20)x2","rt":2,"esp":"","costo":"12 mo","muni":"","estilos":["um","ae","da"]},
    {"id":"espadas-katana","nombre":"Katana","grupo":"Espadas","tipo":"cuerpo","dano":"S/P","dm":"1d10","dg":"1d12","tam":"M","peso":4,"crit":"(19-20)x2","adv":"(17-20)x2","rt":2,"esp":"Versátil","costo":"100 mo","muni":"","estilos":["um","dm","ae","da"]},
    {"id":"espadas-kopesh","nombre":"Kopesh","grupo":"Espadas","tipo":"cuerpo","dano":"C","dm":"2d4","dg":"1d6","tam":"M","peso":9,"crit":"(19-20)x2","adv":"(17-20)x2","rt":2,"esp":"","costo":"10 mo","muni":"","estilos":["um","ae","da"]},
    {"id":"espadas-rapier","nombre":"Rapier","grupo":"Espadas","tipo":"cuerpo","dano":"P","dm":"1d6+1","dg":"1d8+1","tam":"M","peso":4,"crit":"(18-20)x2","adv":"(16-20)x2","rt":2,"esp":"Sutil","costo":"15 mo","muni":"","estilos":["um","ae","da"]},
    {"id":"espadas-sable","nombre":"Sable","grupo":"Espadas","tipo":"cuerpo","dano":"C","dm":"1d6+1","dg":"1d8+1","tam":"M","peso":4,"crit":"(19-20)x2","adv":"(17-20)x2","rt":2,"esp":"Sutil","costo":"17 mo","muni":"","estilos":["um","ae","da"]},
    {"id":"espadas-cimitarra","nombre":"Cimitarra","grupo":"Espadas","tipo":"cuerpo","dano":"C","dm":"1d8","dg":"1d8","tam":"L","peso":5,"crit":"(18-20)x2","adv":"(16-20)x2","rt":2,"esp":"Alto crítico","costo":"15 mo","muni":"","estilos":["um","ae","da"]},
    {"id":"espadas-dos-manos","nombre":"Dos manos","grupo":"Espadas","tipo":"cuerpo","dano":"C","dm":"1d10","dg":"3d6","tam":"G","peso":10,"crit":"(19-20)x2","adv":"(17-20)x2","rt":2,"esp":"","costo":"50 mo","muni":"","estilos":["dm"]},
    {"id":"espadas-larga","nombre":"Larga","grupo":"Espadas","tipo":"cuerpo","dano":"C","dm":"1d8","dg":"1d12","tam":"M","peso":5,"crit":"(19-20)x2","adv":"(17-20)x2","rt":2,"esp":"Versátil","costo":"15 mo","muni":"","estilos":["um","ae","da"]},
    {"id":"espadas-wakizashi","nombre":"Wakizashi","grupo":"Espadas","tipo":"cuerpo","dano":"C/P","dm":"1d8","dg":"1d8","tam":"M","peso":3,"crit":"(19-20)x2","adv":"(17-20)x2","rt":2,"esp":"Sutil","costo":"50 mo","muni":"","estilos":["um","ae","da"]},
    {"id":"espadas-madera","nombre":"Madera","grupo":"Espadas","tipo":"cuerpo","dano":"G","dm":"1d6","dg":"1d6","tam":"L","peso":3,"crit":"(19-20)x2","adv":"(17-20)x2","rt":2,"esp":"Frágil, versátil, sutil","costo":"1 mo","muni":"","estilos":["um","ae","da"]},
    {"id":"navajas-dardo","nombre":"Dardo","grupo":"Navajas","tipo":"distancia","dano":"P","dm":"1d4","dg":"1d3","tam":"L","peso":2,"crit":"(19-20)x2","adv":"(17-20)x2","rt":3,"esp":"Arrojadizo","costo":"2 mo","muni":"","estilos":["di","um","da"]},
    {"id":"navajas-hueso","nombre":"Hueso","grupo":"Navajas","tipo":"distancia","dano":"P","dm":"1d2","dg":"1d2","tam":"L","peso":2,"crit":"(19-20)x2","adv":"(17-20)x2","rt":3,"esp":"Sutil, arrojadizo","costo":"1 mp","muni":"","estilos":["um","di","da"]},
    {"id":"navajas-bloqueo","nombre":"Bloqueo","grupo":"Navajas","tipo":"cuerpo","dano":"P","dm":"1d3","dg":"1d3","tam":"L","peso":2,"crit":"(19-20)x2","adv":"(17-20)x2","rt":3,"esp":"Sutil, +2 parry","costo":"5 mo","muni":"","estilos":["um","da","ae"]},
    {"id":"navajas-piedra","nombre":"Piedra","grupo":"Navajas","tipo":"distancia","dano":"P","dm":"1d3","dg":"1d2","tam":"L","peso":2,"crit":"(19-20)x2","adv":"(17-20)x2","rt":3,"esp":"Sutil, arrojadizo","costo":"2 mp","muni":"","estilos":["um","di","da"]},
    {"id":"navajas-cuchillo","nombre":"Cuchillo","grupo":"Navajas","tipo":"distancia","dano":"P","dm":"1d6","dg":"1d4","tam":"L","peso":2,"crit":"(19-20)x2","adv":"(17-20)x2","rt":3,"esp":"Arrojadizo","costo":"2 mo","muni":"","estilos":["um","di","da"]},
    {"id":"navajas-main-gauche","nombre":"Main-Gauche","grupo":"Navajas","tipo":"cuerpo","dano":"P","dm":"1d4","dg":"1d3","tam":"L","peso":2,"crit":"(19-20)x2","adv":"(17-20)x2","rt":2,"esp":"Sutil, +2 parry","costo":"3 mo","muni":"","estilos":["um","da","ae"]},
    {"id":"navajas-shuriken","nombre":"Shuriken","grupo":"Navajas","tipo":"distancia","dano":"P","dm":"1d6","dg":"1d6","tam":"L","peso":2,"crit":"(19-20)x2","adv":"(17-20)x2","rt":3,"esp":"Arrojadizo","costo":"10 mo","muni":"","estilos":["di"]},
    {"id":"hachas-batalla","nombre":"Batalla","grupo":"Hachas","tipo":"cuerpo","dano":"C","dm":"1d8","dg":"1d8","tam":"M","peso":7,"crit":"(20)x3","adv":"(18-20)x3","rt":2,"esp":"","costo":"5 mo","muni":"","estilos":["um","ae","da"]},
    {"id":"hachas-dos-manos","nombre":"Dos manos","grupo":"Hachas","tipo":"cuerpo","dano":"C","dm":"1d12","dg":"1d12","tam":"G","peso":12,"crit":"(20)x3","adv":"(18-20)x3","rt":2,"esp":"","costo":"15 mp","muni":"","estilos":["dm"]},
    {"id":"hachas-mano","nombre":"Mano","grupo":"Hachas","tipo":"cuerpo","dano":"C","dm":"1d6","dg":"1d4","tam":"M","peso":4,"crit":"(20)x3","adv":"(18-20)x3","rt":2,"esp":"Arrojadizo","costo":"1 mo","muni":"","estilos":["um","ae","da","di"]},
    {"id":"hachas-broad","nombre":"Broad","grupo":"Hachas","tipo":"cuerpo","dano":"C/G","dm":"1d12","dg":"1d12","tam":"G","peso":14,"crit":"(20)x3","adv":"(18-20)x3","rt":2,"esp":"Mórbida","costo":"50 mo","muni":"","estilos":["dm"]},
    {"id":"hachas-lago","nombre":"Lago","grupo":"Hachas","tipo":"cuerpo","dano":"C","dm":"1d10","dg":"1d10","tam":"G","peso":10,"crit":"(20)x3","adv":"(18-20)x3","rt":2,"esp":"Alcance","costo":"25 mo","muni":"","estilos":["dm"]},
    {"id":"hachas-martillo","nombre":"Martillo","grupo":"Hachas","tipo":"cuerpo","dano":"C/G","dm":"1d10","dg":"1d10","tam":"G","peso":10,"crit":"(20)x3","adv":"(18-20)x3","rt":2,"esp":"","costo":"3 mo","muni":"","estilos":["um","dm"]},
    {"id":"hachas-natta","nombre":"Natta","grupo":"Hachas","tipo":"cuerpo","dano":"C","dm":"1d6","dg":"1d6","tam":"L","peso":3,"crit":"(20)x3","adv":"(18-20)x3","rt":2,"esp":"Sutil","costo":"10 mo","muni":"","estilos":["um","da"]},
    {"id":"mazos-almadena","nombre":"Almádena","grupo":"Mazos","tipo":"cuerpo","dano":"G","dm":"2d6","dg":"2d6","tam":"G","peso":10,"crit":"(20)x3","adv":"(18-20)x3","rt":2,"esp":"","costo":"10 mo","muni":"","estilos":["dm"]},
    {"id":"mazos-garrote","nombre":"Garrote","grupo":"Mazos","tipo":"cuerpo","dano":"G","dm":"1d8","dg":"1d8","tam":"G","peso":8,"crit":"(20)x3","adv":"(18-20)x3","rt":2,"esp":"Versátil","costo":"2 mp","muni":"","estilos":["um","dm"]},
    {"id":"mazos-mayal","nombre":"Mayal","grupo":"Mazos","tipo":"cuerpo","dano":"G","dm":"1d6+1","dg":"2d4","tam":"M","peso":7,"crit":"(20)x3","adv":"(18-20)x3","rt":2,"esp":"","costo":"15 mo","muni":"","estilos":["um","ae"]},
    {"id":"mazos-guerra","nombre":"Guerra","grupo":"Mazos","tipo":"cuerpo","dano":"","dm":"—","dg":"—","tam":"","peso":0,"crit":"—","adv":"—","rt":2,"esp":"Sin datos en el archivo original","costo":"","muni":"","estilos":[]},
    {"id":"mazos-lucero-del-alba","nombre":"Lucero del alba","grupo":"Mazos","tipo":"cuerpo","dano":"G/P","dm":"2d4","dg":"1d6+1","tam":"M","peso":7,"crit":"(20)x3","adv":"(18-20)x3","rt":2,"esp":"","costo":"25 mo","muni":"","estilos":["um","ae"]},
    {"id":"mazos-pica","nombre":"Pica","grupo":"Mazos","tipo":"cuerpo","dano":"P/G","dm":"1d6+1","dg":"2d4","tam":"M","peso":10,"crit":"(20)x3","adv":"(18-20)x3","rt":2,"esp":"","costo":"8 mo","muni":"","estilos":["um","dm"]},
    {"id":"mazos-ka-nabo","nombre":"Ka nabo","grupo":"Mazos","tipo":"cuerpo","dano":"G/P","dm":"1d12","dg":"1d12","tam":"G","peso":10,"crit":"(20)x3","adv":"(18-20)x3","rt":2,"esp":"Sutil","costo":"50 mo","muni":"","estilos":["um","dm"]},
    {"id":"armas-de-asta-vara-bo","nombre":"Vara Bo","grupo":"Armas de asta","tipo":"cuerpo","dano":"G","dm":"1d3","dg":"1d3","tam":"G","peso":4,"crit":"(20)x3","adv":"(18-20)x3","rt":4,"esp":"","costo":"2 mp","muni":"","estilos":["dm"]},
    {"id":"armas-de-asta-lanza-pesada","nombre":"Lanza Pesada","grupo":"Armas de asta","tipo":"cuerpo","dano":"P","dm":"3d3","dg":"3d6","tam":"G","peso":8,"crit":"(20)x4","adv":"(18-20)x3","rt":2,"esp":"","costo":"15 mo","muni":"","estilos":["dm"]},
    {"id":"armas-de-asta-lanza-de-justa","nombre":"Lanza de Justa","grupo":"Armas de asta","tipo":"cuerpo","dano":"P","dm":"1d3-1","dg":"1d2-1","tam":"G","peso":6,"crit":"(20) Derribo","adv":"(18-20) Derribo","rt":2,"esp":"No letal, frágil","costo":"20 mo","muni":"","estilos":["dm"]},
    {"id":"armas-de-asta-lanza-ligera","nombre":"Lanza Ligera","grupo":"Armas de asta","tipo":"cuerpo","dano":"P","dm":"1d6","dg":"1d8","tam":"L","peso":10,"crit":"(20)x3","adv":"(18-20)x3","rt":2,"esp":"Versátil","costo":"6 mo","muni":"","estilos":["um","dm","di"]},
    {"id":"armas-de-asta-lanza-mediana","nombre":"Lanza Mediana","grupo":"Armas de asta","tipo":"cuerpo","dano":"P","dm":"1d6+1","dg":"2d6","tam":"M","peso":7,"crit":"(20)x3","adv":"(18-20)x3","rt":2,"esp":"Versátil","costo":"10 mo","muni":"","estilos":["um","dm"]},
    {"id":"armas-de-asta-mancatcher","nombre":"Mancatcher","grupo":"Armas de asta","tipo":"cuerpo","dano":"-","dm":"1d2","dg":"1d2","tam":"G","peso":7,"crit":"(20)x3","adv":"(18-20)x3","rt":2,"esp":"Retiene","costo":"30 mo","muni":"","estilos":["dm"]},
    {"id":"armas-de-asta-awl-pike","nombre":"Awl Pike","grupo":"Armas de asta","tipo":"cuerpo","dano":"","dm":"—","dg":"—","tam":"","peso":0,"crit":"—","adv":"—","rt":2,"esp":"Sin datos en el archivo original","costo":"","muni":"","estilos":[]},
    {"id":"armas-de-asta-bardiche","nombre":"Bardiche","grupo":"Armas de asta","tipo":"cuerpo","dano":"C","dm":"2d4","dg":"3d4","tam":"G","peso":8,"crit":"(20)x3","adv":"(18-20)x3","rt":2,"esp":"","costo":"7 mo","muni":"","estilos":["dm"]},
    {"id":"armas-de-asta-bec-de-corbin","nombre":"Bec de corbin","grupo":"Armas de asta","tipo":"cuerpo","dano":"P/G","dm":"1d8","dg":"1d6","tam":"G","peso":8,"crit":"(20)x4","adv":"(18-20)x4","rt":2,"esp":"","costo":"8 mo","muni":"","estilos":["dm"]},
    {"id":"armas-de-asta-bill-guisarme","nombre":"Bill-Guisarme","grupo":"Armas de asta","tipo":"cuerpo","dano":"P/C","dm":"2d4","dg":"1d10","tam":"G","peso":8,"crit":"(20)x3","adv":"(18-20)x3","rt":2,"esp":"","costo":"7 mo","muni":"","estilos":["dm"]},
    {"id":"armas-de-asta-fauchard","nombre":"Fauchard","grupo":"Armas de asta","tipo":"cuerpo","dano":"P/C","dm":"1d6","dg":"1d8","tam":"G","peso":9,"crit":"(20)x4","adv":"(18-20)x4","rt":2,"esp":"","costo":"5 mo","muni":"","estilos":["dm"]},
    {"id":"armas-de-asta-fauchard-fork","nombre":"Fauchard-Fork","grupo":"Armas de asta","tipo":"cuerpo","dano":"P/C","dm":"1d8","dg":"1d10","tam":"G","peso":8,"crit":"(20)x4","adv":"(18-20)x4","rt":2,"esp":"","costo":"8 mo","muni":"","estilos":["dm"]},
    {"id":"armas-de-asta-glaive-guja","nombre":"Glaive (Guja)","grupo":"Armas de asta","tipo":"cuerpo","dano":"C","dm":"1d6","dg":"1d10","tam":"G","peso":10,"crit":"(20)x4","adv":"(18-20)x4","rt":2,"esp":"Derriba jinete","costo":"6 mo","muni":"","estilos":["dm"]},
    {"id":"armas-de-asta-glaive-guisarme","nombre":"Glaive-Guisarme","grupo":"Armas de asta","tipo":"cuerpo","dano":"P/C","dm":"2d4","dg":"2d6","tam":"G","peso":9,"crit":"(20)x4","adv":"(18-20)x4","rt":2,"esp":"Derriba jinete","costo":"10 mo","muni":"","estilos":["dm"]},
    {"id":"armas-de-asta-guisarme","nombre":"Guisarme","grupo":"Armas de asta","tipo":"cuerpo","dano":"C","dm":"2d4","dg":"1d8","tam":"G","peso":9,"crit":"(20)x4","adv":"(18-20)x4","rt":2,"esp":"Derriba jinete","costo":"5 mo","muni":"","estilos":["dm"]},
    {"id":"armas-de-asta-guisarme-voulge","nombre":"Guisarme-Voulge","grupo":"Armas de asta","tipo":"cuerpo","dano":"P/C","dm":"2d4","dg":"2d4","tam":"G","peso":9,"crit":"(20)x4","adv":"(18-20)x4","rt":2,"esp":"Derriba jinete","costo":"7 mo","muni":"","estilos":["dm"]},
    {"id":"armas-de-asta-halberd","nombre":"Halberd","grupo":"Armas de asta","tipo":"cuerpo","dano":"P/C","dm":"1d10","dg":"2d6","tam":"G","peso":7,"crit":"(20)x3","adv":"(18-20)x3","rt":2,"esp":"","costo":"9 mo","muni":"","estilos":["dm"]},
    {"id":"armas-de-asta-hook-fauchard","nombre":"Hook Fauchard","grupo":"Armas de asta","tipo":"cuerpo","dano":"P/C","dm":"1d4","dg":"1d4","tam":"G","peso":7,"crit":"(20)x3","adv":"(18-20)x3","rt":2,"esp":"","costo":"10 mo","muni":"","estilos":["dm"]},
    {"id":"armas-de-asta-lucern-hammer","nombre":"Lucern Hammer","grupo":"Armas de asta","tipo":"cuerpo","dano":"P/G","dm":"2d4","dg":"1d6","tam":"G","peso":9,"crit":"(20)x4","adv":"(18-20)x4","rt":2,"esp":"","costo":"7 mo","muni":"","estilos":["dm"]},
    {"id":"armas-de-asta-military-fork","nombre":"Military Fork","grupo":"Armas de asta","tipo":"cuerpo","dano":"P","dm":"1d8","dg":"2d4","tam":"G","peso":8,"crit":"(20)x3","adv":"(18-20)x3","rt":2,"esp":"","costo":"5 mo","muni":"","estilos":["dm"]},
    {"id":"armas-de-asta-naginata","nombre":"Naginata","grupo":"Armas de asta","tipo":"cuerpo","dano":"P","dm":"1d8","dg":"1d10","tam":"G","peso":8,"crit":"(20)x3","adv":"(18-20)x3","rt":2,"esp":"","costo":"8 mo","muni":"","estilos":["dm"]},
    {"id":"armas-de-asta-partisan","nombre":"Partisan","grupo":"Armas de asta","tipo":"cuerpo","dano":"P","dm":"1d6","dg":"1d6+1","tam":"G","peso":8,"crit":"(20)x3","adv":"(18-20)x3","rt":2,"esp":"","costo":"10 mo","muni":"","estilos":["dm"]},
    {"id":"armas-de-asta-ranseur","nombre":"Ranseur","grupo":"Armas de asta","tipo":"cuerpo","dano":"P","dm":"2d4","dg":"2d4","tam":"G","peso":10,"crit":"(20)x3","adv":"(18-20)x3","rt":2,"esp":"","costo":"6 mo","muni":"","estilos":["dm"]},
    {"id":"armas-de-asta-spetum","nombre":"Spetum","grupo":"Armas de asta","tipo":"cuerpo","dano":"P","dm":"1d6+1","dg":"2d6","tam":"G","peso":4,"crit":"(20)x4","adv":"(18-20)x4","rt":2,"esp":"","costo":"5 mo","muni":"","estilos":["dm"]},
    {"id":"armas-de-asta-tetsubo","nombre":"Tetsubo","grupo":"Armas de asta","tipo":"cuerpo","dano":"P","dm":"1d8","dg":"1d8","tam":"G","peso":6,"crit":"(20)x4","adv":"(18-20)x4","rt":2,"esp":"","costo":"15 mo","muni":"","estilos":["dm"]},
    {"id":"armas-de-asta-tridente","nombre":"Tridente","grupo":"Armas de asta","tipo":"cuerpo","dano":"P","dm":"1d6+1","dg":"3d4","tam":"G","peso":6,"crit":"(20)x4","adv":"(18-20)x4","rt":2,"esp":"Bajo agua","costo":"15 mo","muni":"","estilos":["um","dm"]},
    {"id":"armas-de-proyectiles-arcabuz","nombre":"Arcabuz","grupo":"Armas de proyectiles","tipo":"distancia","dano":"P","dm":"1d10","dg":"1d10","tam":"M","peso":15,"crit":"8+ daño","adv":"6+ daño","rt":2,"esp":"+4 vs pesada, recarga","costo":"500 mo","muni":"polvora","estilos":["di"]},
    {"id":"armas-de-proyectiles-cerbatana","nombre":"Cerbatana","grupo":"Armas de proyectiles","tipo":"distancia","dano":"P","dm":"1","dg":"1","tam":"G","peso":5,"crit":"N/A","adv":"N/A","rt":3,"esp":"Veneno","costo":"10 mo","muni":"dardo_cerb","estilos":["di"]},
    {"id":"armas-de-proyectiles-trabuco","nombre":"Trabuco","grupo":"Armas de proyectiles","tipo":"cuerpo","dano":"","dm":"—","dg":"—","tam":"","peso":0,"crit":"—","adv":"—","rt":2,"esp":"Sin datos en el archivo original","costo":"","muni":"","estilos":[]},
    {"id":"armas-de-proyectiles-arco-largo-compuesto","nombre":"Arco Largo Compuesto","grupo":"Armas de proyectiles","tipo":"distancia","dano":"P","dm":"Por flecha","dg":"Por flecha","tam":"G","peso":7,"crit":"(20)x3","adv":"(18-20)x3","rt":4,"esp":"Proyectiles versátiles","costo":"100 mo","muni":"flecha","estilos":["di"]},
    {"id":"armas-de-proyectiles-arco-corto-compuesto","nombre":"Arco Corto Compuesto","grupo":"Armas de proyectiles","tipo":"distancia","dano":"P","dm":"Por flecha","dg":"Por flecha","tam":"G","peso":6,"crit":"(20)x3","adv":"(18-20)x3","rt":5,"esp":"Proyectiles versátiles","costo":"75 mo","muni":"flecha","estilos":["di"]},
    {"id":"armas-de-proyectiles-ballesta-de-mano","nombre":"Ballesta de mano","grupo":"Armas de proyectiles","tipo":"distancia","dano":"P","dm":"Por birote","dg":"Por birote","tam":"L","peso":5,"crit":"(20)x3","adv":"(18-20)x3","rt":1,"esp":"Recarga, proyectiles versátiles","costo":"300 mo","muni":"birote","estilos":["di"]},
    {"id":"armas-de-proyectiles-ballesta-pesada","nombre":"Ballesta Pesada","grupo":"Armas de proyectiles","tipo":"distancia","dano":"P","dm":"Por birote","dg":"Por birote","tam":"G","peso":11,"crit":"(20)x3","adv":"(18-20)x3","rt":1,"esp":"Recarga, proyectiles versátiles","costo":"50 mo","muni":"birote","estilos":["di"]},
    {"id":"armas-de-proyectiles-ballesta-ligera","nombre":"Ballesta Ligera","grupo":"Armas de proyectiles","tipo":"distancia","dano":"P","dm":"Por birote","dg":"Por birote","tam":"L","peso":7,"crit":"(20)x3","adv":"(18-20)x3","rt":1,"esp":"Recarga, proyectiles versátiles","costo":"35 mo","muni":"birote","estilos":["di"]},
    {"id":"armas-de-proyectiles-ballesta-repeticion","nombre":"Ballesta Repetición","grupo":"Armas de proyectiles","tipo":"distancia","dano":"P","dm":"Por birote","dg":"Por birote","tam":"M","peso":5,"crit":"(20)x3","adv":"(18-20)x3","rt":3,"esp":"Recarga, proyectiles versátiles","costo":"120 mo","muni":"birote","estilos":["di"]},
    {"id":"armas-de-proyectiles-arpon","nombre":"Arpón","grupo":"Armas de proyectiles","tipo":"distancia","dano":"P","dm":"1d4+1","dg":"1d6+1","tam":"G","peso":4,"crit":"(20)x3","adv":"(18-20)x3","rt":2,"esp":"Bajo agua","costo":"20 mo","muni":"","estilos":["di","um"]},
    {"id":"armas-de-proyectiles-jabalina","nombre":"Jabalina","grupo":"Armas de proyectiles","tipo":"distancia","dano":"P","dm":"1d4","dg":"1d4","tam":"L","peso":4,"crit":"(20)x3","adv":"(18-20)x3","rt":2,"esp":"","costo":"5 mp","muni":"","estilos":["di","um"]},
    {"id":"armas-de-proyectiles-lanza","nombre":"Lanza","grupo":"Armas de proyectiles","tipo":"distancia","dano":"P","dm":"1d6","dg":"1d6","tam":"M","peso":5,"crit":"(20)x3","adv":"(18-20)x3","rt":2,"esp":"","costo":"1 mo","muni":"","estilos":["di","um"]},
    {"id":"armas-de-proyectiles-resortera","nombre":"Resortera","grupo":"Armas de proyectiles","tipo":"distancia","dano":"G","dm":"Por munición","dg":"Por munición","tam":"L","peso":4,"crit":"(20)x3","adv":"(18-20)x3","rt":3,"esp":"","costo":"5 mc","muni":"honda","estilos":["di"]},
    {"id":"armas-de-proyectiles-honda","nombre":"Honda","grupo":"Armas de proyectiles","tipo":"distancia","dano":"G","dm":"Por munición","dg":"Por munición","tam":"L","peso":4,"crit":"(20)x3","adv":"(18-20)x3","rt":3,"esp":"","costo":"2 mc","muni":"honda","estilos":["di"]},
    {"id":"armas-de-proyectiles-mosquete","nombre":"Mosquete","grupo":"Armas de proyectiles","tipo":"distancia","dano":"P","dm":"1d12","dg":"1d12","tam":"G","peso":15,"crit":"8+ daño","adv":"6+ daño","rt":1,"esp":"+4 vs pesada, recarga","costo":"800 mo","muni":"polvora","estilos":["di"]},
    {"id":"armas-de-asta-pica-lucio","nombre":"Pica lucio","grupo":"Armas de asta","tipo":"cuerpo","dano":"P","dm":"1d6","dg":"1d12","tam":"G","peso":10,"crit":"(20)x3","adv":"(18-20)x3","rt":2,"esp":"","costo":"3 mo","muni":"","estilos":["dm"]},
    {"id":"sin-armas-sin-armas","nombre":"Sin armas","grupo":"Sin armas","tipo":"cuerpo","dano":"G","dm":"1d2","dg":"1d2","tam":"—","peso":0,"crit":"(20)x3","adv":"(18-20)x3","rt":2,"esp":"Natural","costo":"0","muni":"","estilos":["um"]},
    {"id":"navajas-daga","nombre":"Daga","grupo":"Navajas","tipo":"distancia","dano":"P","dm":"1d4","dg":"1d3","tam":"L","peso":1,"crit":"(19-20)x2","adv":"(17-20)x2","rt":2,"esp":"Sutil, arrojadizo","costo":"2 mo","muni":"","estilos":["um","di","da"]},
    {"id":"otras-latigo","nombre":"Látigo","grupo":"Otras","tipo":"cuerpo","dano":"G","dm":"1d2","dg":"1d2","tam":"L","peso":4,"crit":"(20)x3","adv":"(18-20)x3","rt":2,"esp":"Sutil","costo":"2 mo","muni":"","estilos":["um"]},
    {"id":"armas-de-proyectiles-pistola","nombre":"Pistola","grupo":"Armas de proyectiles","tipo":"distancia","dano":"P","dm":"1d10","dg":"1d10","tam":"—","peso":1,"crit":"10 daño","adv":"8+ daño","rt":4,"esp":"+4 vs pesada, recarga","costo":"500 mo","muni":"polvora","estilos":["di"]},
    {"id":"escudos-rodela","nombre":"Rodela","grupo":"Escudos","tipo":"cuerpo","dano":"B","dm":"1d4","dg":"1d4","tam":"P","peso":0,"crit":"—","adv":"—","rt":2,"esp":"Escudo","costo":"","muni":"","estilos":[],"escudo":{"ca":-1,"bloqueos":1}},
    {"id":"escudos-escudo-pequeno","nombre":"Escudo pequeño","grupo":"Escudos","tipo":"cuerpo","dano":"B","dm":"1d4","dg":"1d4","tam":"P","peso":0,"crit":"—","adv":"—","rt":2,"esp":"Escudo","costo":"","muni":"","estilos":[],"escudo":{"ca":-1,"bloqueos":1}},
    {"id":"escudos-escudo-medio","nombre":"Escudo medio","grupo":"Escudos","tipo":"cuerpo","dano":"B","dm":"1d4","dg":"1d4","tam":"M","peso":0,"crit":"—","adv":"—","rt":2,"esp":"Escudo","costo":"","muni":"","estilos":[],"escudo":{"ca":0,"bloqueos":0}},
    {"id":"escudos-escudo-corporal","nombre":"Escudo corporal","grupo":"Escudos","tipo":"cuerpo","dano":"B","dm":"1d4","dg":"1d4","tam":"G","peso":0,"crit":"—","adv":"—","rt":2,"esp":"Escudo","costo":"","muni":"","estilos":[],"escudo":{"ca":1,"bloqueos":-1}}
  ],
  especializacion: ['Competente', 'Diestro', 'Experto', 'Especialista', 'Maestro', 'Gran Maestro'],
  /* Efectos por nivel de cada estilo (cada nivel suma a los anteriores). Campos: gac0, dano, rt, ca, salv, bloq, man, notas */
  estilos: {
    "one": {
      "nombre": "Arma a una mano",
      "niveles": [
        {
          "desc": "2 puntos tácticos GAC0/CA · +1 maniobras",
          "man": 1
        },
        {
          "desc": "+1 RT",
          "rt": 1
        },
        {
          "desc": "2 puntos tácticos GAC0/CA · +1 maniobras",
          "man": 1
        },
        {
          "desc": "+1 RT",
          "rt": 1
        }
      ]
    },
    "two": {
      "nombre": "Dos armas",
      "max": 5,
      "niveles": [
        {
          "desc": "−2 penalización"
        },
        {
          "desc": "−2 penalización"
        },
        {
          "desc": "−2 penalización · Golpe/Parreo Doble si 0/0"
        },
        {
          "desc": "−2 penalización · rondas independientes"
        },
        {
          "desc": "−2 penalización"
        }
      ]
    },
    "shield": {
      "nombre": "Arma-Escudo",
      "niveles": [
        {
          "desc": "−1 CA · −1 salv. protegibles · +1 bloqueo",
          "ca": -1,
          "salv": -1,
          "bloq": 1
        },
        {
          "desc": "−1 CA · −1 salv. protegibles · +1 bloqueo",
          "ca": -1,
          "salv": -1,
          "bloq": 1
        },
        {
          "desc": "+2 maniobras · +1 bloqueo",
          "man": 2,
          "bloq": 1
        },
        {
          "desc": "20 natural se bloquea con 18 · +2 maniobras · +1 bloqueo",
          "man": 2,
          "bloq": 1,
          "notas": [
            "Bloquea 20 natural con 18"
          ]
        }
      ]
    },
    "ranged": {
      "nombre": "Armas a distancia",
      "niveles": [
        {
          "desc": "−1 GAC0 · +2 daño · +1 RT",
          "gac0": -1,
          "dano": 2,
          "rt": 1
        },
        {
          "desc": "−2 GAC0 · +1 daño",
          "gac0": -2,
          "dano": 1
        },
        {
          "desc": "+1 categoría de rango · +1 RT",
          "rt": 1
        },
        {
          "desc": "+4 maniobras de tiro",
          "man": 4
        }
      ]
    },
    "twohand": {
      "nombre": "Arma a dos manos",
      "niveles": [
        {
          "desc": "+1 daño · Barrido · Empalar",
          "dano": 1,
          "notas": [
            "Barrido",
            "Empalar"
          ]
        },
        {
          "desc": "+1 RT · +1 daño",
          "rt": 1,
          "dano": 1
        },
        {
          "desc": "Ataque en todas direcciones",
          "notas": [
            "Ataque en todas direcciones"
          ]
        },
        {
          "desc": "+1 RT · +2 daño",
          "rt": 1,
          "dano": 2
        }
      ]
    }
  },
  ordenEstilos: ['one', 'two', 'shield', 'ranged', 'twohand'],
  /* Nivel máximo de especialización por clase (las homebrew usan "espArmas" o el grupo de THAC0) */
  espMaxClase: {"guerrero":5,"paladin":4,"explorador":4,"espadachin":4,"barbaro":4,"cambiaformas":4,"sacerdote":2,"sacerdote_sp":2,"druida":2,"monje":2,"brujo":2,"ladron":1,"bardo":1,"techno":1,"psionico":1,"hechicero":0,"mago":0}
};
