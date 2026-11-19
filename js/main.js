/* =========================================================
   DON'T PET ME · Lógica de la página
   Las animaciones usan GSAP + ScrollTrigger (https://gsap.com)

   Partes:
   1. Menú
   2. Música y sonidos
   3. Mochi interactivo (¡no lo acaricies!)
   4. Animaciones con GSAP (parallax, entradas, mundo horizontal...)
   ========================================================= */

const hayGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
const prefiereMenosMovimiento = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------------------------------------------------------
   1. MENÚ
   --------------------------------------------------------- */
const menu = document.getElementById('menu');
const menuBoton = document.getElementById('menuBoton');
const menuEnlaces = document.getElementById('menuEnlaces');

function revisarMenu() {
  menu.classList.toggle('solido', window.scrollY > 60);
}
window.addEventListener('scroll', revisarMenu, { passive: true });
revisarMenu();

menuBoton.addEventListener('click', () => {
  const abierto = menuEnlaces.classList.toggle('abierto');
  menuBoton.setAttribute('aria-expanded', abierto);
});

// Al elegir una opción en el celular, se cierra el menú
menuEnlaces.querySelectorAll('a').forEach((enlace) => {
  enlace.addEventListener('click', () => {
    menuEnlaces.classList.remove('abierto');
    menuBoton.setAttribute('aria-expanded', false);
  });
});

// Los enlaces internos (#historia, #mochi...) bajan con un scroll suave hecho con GSAP.
// (No se usa "scroll-behavior: smooth" en el CSS porque choca con ScrollTrigger.)
document.querySelectorAll('a[href^="#"]').forEach((enlace) => {
  enlace.addEventListener('click', (evento) => {
    const destino = document.querySelector(enlace.getAttribute('href'));
    if (!destino || typeof window.ScrollToPlugin === 'undefined') return;
    evento.preventDefault();
    gsap.to(window, {
      scrollTo: { y: destino, offsetY: 60 },
      duration: prefiereMenosMovimiento() ? 0 : 1.1,
      ease: 'power2.inOut',
    });
  });
});

/* ---------------------------------------------------------
   2. MÚSICA Y SONIDOS
   Solo suena una canción a la vez.
   --------------------------------------------------------- */
const reproductor = new Audio();
reproductor.preload = 'none';
let pistaActual = null;

function botonDe(pista) {
  return pista.querySelector('.pista-play');
}

function marcarPista(pista, sonando) {
  const nombre = pista.querySelector('h3').textContent;
  pista.classList.toggle('sonando', sonando);
  botonDe(pista).innerHTML = `<svg class="icono" aria-hidden="true"><use href="#i-${sonando ? 'pausa' : 'play'}"/></svg>`;
  botonDe(pista).setAttribute('aria-label', `${sonando ? 'Pausar' : 'Reproducir'} ${nombre}`);
}

document.querySelectorAll('.pista').forEach((pista) => {
  botonDe(pista).addEventListener('click', () => {
    // Si es la misma canción, pausa o continúa
    if (pistaActual === pista) {
      if (reproductor.paused) {
        reproductor.play();
        marcarPista(pista, true);
      } else {
        reproductor.pause();
        marcarPista(pista, false);
      }
      return;
    }

    // Si es otra canción, se detiene la anterior y empieza la nueva
    if (pistaActual) {
      marcarPista(pistaActual, false);
      pistaActual.querySelector('.pista-progreso').style.width = '0%';
    }
    pistaActual = pista;
    reproductor.src = pista.dataset.audio;
    reproductor.play();
    marcarPista(pista, true);
  });

  // Hacer clic en la barra salta a esa parte de la canción
  pista.querySelector('.pista-barra').addEventListener('click', (evento) => {
    if (pistaActual !== pista || !reproductor.duration) return;
    const barra = evento.currentTarget.getBoundingClientRect();
    reproductor.currentTime = ((evento.clientX - barra.left) / barra.width) * reproductor.duration;
  });
});

reproductor.addEventListener('timeupdate', () => {
  if (!pistaActual || !reproductor.duration) return;
  const porcentaje = (reproductor.currentTime / reproductor.duration) * 100;
  pistaActual.querySelector('.pista-progreso').style.width = `${porcentaje}%`;
});

reproductor.addEventListener('ended', () => {
  if (pistaActual) marcarPista(pistaActual, false);
});

function reproducirSonido(ruta) {
  const sonido = new Audio(ruta);
  sonido.volume = 0.8;
  sonido.play();
}

document.querySelectorAll('.sonido').forEach((boton) => {
  boton.addEventListener('click', () => reproducirSonido(boton.dataset.sonido));
});

/* ---------------------------------------------------------
   3. MOCHI INTERACTIVO
   Si intentas acariciarlo, esquiva, se enoja y te lo dice.
   --------------------------------------------------------- */
const mochiBoton = document.getElementById('mochiBoton');
const mochiImagen = document.getElementById('mochiImagen');
const mochiGlobo = document.getElementById('mochiGlobo');
const mochiContador = document.getElementById('mochiContador');

const frasesMochi = [
  '¡Ni se te ocurra!',
  '¡No me toques!',
  '¡Soy un hámster salvaje!',
  'Grrr…',
  '¡Dije que NO!',
  '¡Que no me acaricies!',
  'Ok, ya en serio…',
  '¡Tengo una familia que encontrar!',
];
const sonidosMochi = ['audio/voz_enojado_tierno.wav', 'audio/esquivar_caricia.wav'];

let intentos = 0;
let ocultarGlobo = null;

mochiBoton.addEventListener('click', () => {
  intentos++;
  mochiGlobo.textContent = frasesMochi[(intentos - 1) % frasesMochi.length];
  mochiContador.textContent = `(intentos fallidos: ${intentos})`;
  reproducirSonido(sonidosMochi[intentos % sonidosMochi.length]);

  // Sin GSAP (o con "menos movimiento"), solo se muestra el globo
  if (!hayGsap || prefiereMenosMovimiento()) {
    mochiGlobo.classList.add('visible');
    clearTimeout(ocultarGlobo);
    ocultarGlobo = setTimeout(() => mochiGlobo.classList.remove('visible'), 1600);
    return;
  }

  // Mochi salta hacia un lado (cambia de lado en cada intento) y regresa con un rebote elástico
  const lado = intentos % 2 === 0 ? 1 : -1;
  gsap.timeline({ defaults: { overwrite: 'auto' } })
    .to(mochiImagen, { x: 70 * lado, y: -40, rotation: 14 * lado, duration: 0.18, ease: 'power2.out' })
    .to(mochiImagen, { x: -30 * lado, y: 0, rotation: -8 * lado, duration: 0.2, ease: 'power1.inOut' })
    .to(mochiImagen, { x: 0, rotation: 0, duration: 0.8, ease: 'elastic.out(1, 0.35)' });

  // El globo de texto aparece con un "pop" y se va solo
  gsap.fromTo(mochiGlobo,
    { autoAlpha: 0, scale: 0.4, rotation: -14 },
    { autoAlpha: 1, scale: 1, rotation: -4, duration: 0.45, ease: 'back.out(2.5)', overwrite: true });
  if (ocultarGlobo) ocultarGlobo.kill();
  ocultarGlobo = gsap.delayedCall(1.6, () => {
    gsap.to(mochiGlobo, { autoAlpha: 0, scale: 0.8, duration: 0.25 });
  });
});

/* ---------------------------------------------------------
   3b. FICHAS DE LOS ENEMIGOS
   Cada tarjeta tiene data-ficha="id-de-su-ficha". Al hacer clic se abre ese <dialog>.
   --------------------------------------------------------- */
function animarFichas() {
  return hayGsap && !prefiereMenosMovimiento();
}

function abrirFicha(ficha) {
  ficha.showModal();
  if (!animarFichas()) return;

  const imagen = ficha.querySelector('.ficha-imagen img');
  const partes = ficha.querySelectorAll('.ficha-texto > *');

  gsap.timeline()
    .fromTo(ficha, { autoAlpha: 0, scale: 0.85, y: 40 }, { autoAlpha: 1, scale: 1, y: 0, duration: 0.45, ease: 'back.out(1.6)' })
    .fromTo(imagen, { scale: 0.4, rotation: -15, autoAlpha: 0 }, { scale: 1, rotation: 0, autoAlpha: 1, duration: 0.7, ease: 'elastic.out(1, 0.5)' }, 0.1)
    .fromTo(partes, { autoAlpha: 0, x: 30 }, { autoAlpha: 1, x: 0, duration: 0.4, stagger: 0.05, ease: 'power2.out' }, 0.15);
}

function cerrarFicha(ficha) {
  if (!ficha.open) return;
  if (!animarFichas()) {
    ficha.close();
    return;
  }
  gsap.to(ficha, {
    autoAlpha: 0,
    scale: 0.9,
    y: 30,
    duration: 0.25,
    ease: 'power2.in',
    onComplete: () => ficha.close(),
  });
}

document.querySelectorAll('[data-ficha]').forEach((tarjeta) => {
  tarjeta.addEventListener('click', () => abrirFicha(document.getElementById(tarjeta.dataset.ficha)));
});

document.querySelectorAll('.ficha').forEach((ficha) => {
  ficha.querySelector('.ficha-cerrar').addEventListener('click', () => cerrarFicha(ficha));

  // Clic fuera de la ficha (en el fondo oscuro) también la cierra
  ficha.addEventListener('click', (evento) => {
    if (evento.target === ficha) cerrarFicha(ficha);
  });

  // La tecla Esc cierra la ficha con la misma animación
  ficha.addEventListener('cancel', (evento) => {
    evento.preventDefault();
    cerrarFicha(ficha);
  });

  // Que la rueda del ratón sobre el fondo oscuro no mueva la página de atrás
  ficha.addEventListener('wheel', (evento) => {
    if (evento.target === ficha) evento.preventDefault();
  }, { passive: false });
});

document.querySelectorAll('.boton-sonido').forEach((boton) => {
  boton.addEventListener('click', () => reproducirSonido(boton.dataset.sonido));
});

/* ---------------------------------------------------------
   4. ANIMACIONES CON GSAP
   --------------------------------------------------------- */
if (hayGsap) {
  gsap.registerPlugin(ScrollTrigger);
  if (window.SplitText) gsap.registerPlugin(SplitText);
  if (window.ScrollToPlugin) gsap.registerPlugin(ScrollToPlugin);
  iniciarAnimaciones();
}

function iniciarAnimaciones() {
  /*
    gsap.matchMedia() prepara animaciones distintas según el tamaño de pantalla.
    Si la pantalla cambia (por ejemplo, giras el celular), deshace todo y lo vuelve a crear.
    Si la persona pidió "menos movimiento" en su sistema, no se anima nada.
  */
  const mm = gsap.matchMedia();

  mm.add(
    {
      escritorio: '(min-width: 901px)',
      celular: '(max-width: 900px)',
      menosMovimiento: '(prefers-reduced-motion: reduce)',
    },
    (contexto) => {
      const { escritorio, menosMovimiento } = contexto.conditions;
      if (menosMovimiento) return;

      const limpiezas = [];
      const escenarios = document.querySelector('.escenarios');

      // ¿El elemento está antes, dentro o después de la sección horizontal de los mundos?
      const estaAntes = (el) => escenarios.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_PRECEDING;
      const estaDentro = (el) => escenarios.contains(el);

      const capas = gsap.utils.toArray('[data-velocidad]');
      const apariciones = gsap.utils.toArray('.aparecer');

      // Las animaciones con scroll se crean en el orden de la página (de arriba a abajo),
      // así ScrollTrigger calcula bien las posiciones alrededor de la parte fija (pin).
      limpiezas.push(animarPortada());
      animarHistoria();
      animarMochi();

      if (escritorio) {
        crearParallax(capas.filter((el) => estaAntes(el) && !estaDentro(el)));
        crearApariciones(apariciones.filter((el) => estaAntes(el) && !estaDentro(el)));
        limpiezas.push(crearMundoHorizontal());
        crearParallax(capas.filter((el) => !estaAntes(el) && !estaDentro(el)));
        crearApariciones(apariciones.filter((el) => !estaAntes(el) && !estaDentro(el)));
      } else {
        // En celular los mundos van uno debajo del otro, con parallax normal
        crearParallax(capas);
        crearApariciones(apariciones);
      }

      animarContadores();
      animarEnemigos();
      animarFlotado();

      // Las imágenes ya traen su tamaño en el HTML, así que no mueven la página al cargar.
      // Solo las tipografías pueden cambiar un poco el alto del texto: al terminar de cargar, se recalcula.
      document.fonts.ready.then(refrescarPronto);

      // Lo que GSAP no deshace solo (clases y eventos) se limpia aquí
      return () => limpiezas.forEach((limpiar) => limpiar && limpiar());
    }
  );
}

// Espera un momento antes de recalcular, para no hacerlo 20 veces seguidas si cargan muchas imágenes juntas
let refrescoPendiente = null;
function refrescarPronto() {
  if (refrescoPendiente) refrescoPendiente.kill();
  refrescoPendiente = gsap.delayedCall(0.2, () => ScrollTrigger.refresh());
}

/* ---------- Parallax ----------
   Cada elemento con data-velocidad se mueve mientras su contenedor cruza la pantalla:
     - número positivo  -> se mueve MÁS LENTO (se siente lejos, como un fondo)
     - número negativo  -> se mueve MÁS RÁPIDO (se siente cerca)
   GSAP anima la variable --py y el CSS la usa en la propiedad "translate".
   Así no choca con otras animaciones que usan "transform". */
function crearParallax(elementos) {
  elementos.forEach((elemento) => {
    const velocidad = parseFloat(elemento.dataset.velocidad);
    if (!velocidad) return;

    const contenedor = elemento.parentElement;
    const recorrido = () => ((window.innerHeight + contenedor.offsetHeight) / 2) * velocidad;

    gsap.fromTo(elemento,
      { '--py': () => `${-recorrido()}px` },
      {
        '--py': () => `${recorrido()}px`,
        ease: 'none',
        scrollTrigger: {
          trigger: contenedor,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
          invalidateOnRefresh: true,
        },
      });
  });
}

/* ---------- Apariciones ----------
   Los elementos con la clase "aparecer" suben y se hacen visibles al entrar en pantalla.
   ScrollTrigger.batch junta los que entran al mismo tiempo para animarlos en cascada. */
function crearApariciones(elementos) {
  if (!elementos.length) return;
  gsap.set(elementos, { autoAlpha: 0, y: 50 });
  ScrollTrigger.batch(elementos, {
    start: 'top 88%',
    once: true,
    onEnter: (grupo) => gsap.to(grupo, {
      autoAlpha: 1,
      y: 0,
      duration: 0.8,
      ease: 'power3.out',
      stagger: 0.12,
      overwrite: 'auto', // solo reemplaza y/opacity; no cancela el "flotar" (yPercent/rotation)
    }),
  });
}

/* ---------- 1. Portada ---------- */
function animarPortada() {
  const portada = document.querySelector('.portada');

  // Entrada: el logo rebota, luego la frase, los botones y las semillas
  gsap.timeline({ defaults: { ease: 'power3.out' } })
    .from('.portada-logo', { autoAlpha: 0, scale: 0.5, rotation: -8, duration: 1.1, ease: 'back.out(1.7)' })
    .from('.portada-frase', { autoAlpha: 0, y: 30, duration: 0.6 }, '-=0.5')
    .from('.portada .boton', { autoAlpha: 0, y: 30, stagger: 0.12, duration: 0.5 }, '-=0.3')
    .from('.semilla', { autoAlpha: 0, scale: 0, stagger: 0.1, duration: 0.6, ease: 'back.out(2)' }, '-=0.6')
    .from('.flecha-abajo', { autoAlpha: 0, duration: 0.5 }, '-=0.2');

  // Las semillas flotan sin parar, cada una a su ritmo
  gsap.to('.semilla', {
    y: -18,
    rotation: 8,
    duration: 3,
    ease: 'sine.inOut',
    repeat: -1,
    yoyo: true,
    stagger: { each: 0.7, from: 'random' },
  });

  // Al bajar, el logo se encoge y se desvanece
  gsap.to('.portada-contenido', {
    autoAlpha: 0,
    scale: 0.85,
    ease: 'none',
    scrollTrigger: { trigger: portada, start: 'top top', end: 'bottom 30%', scrub: true },
  });

  // Las capas con data-raton también siguen al ratón
  const capasRaton = gsap.utils.toArray('[data-raton]');
  gsap.set(capasRaton, { '--mx': '0px', '--my': '0px' });

  const moverConRaton = (evento) => {
    const x = (evento.clientX / window.innerWidth - 0.5) * 2; // de -1 a 1
    const y = (evento.clientY / window.innerHeight - 0.5) * 2;
    capasRaton.forEach((capa) => {
      const fuerza = parseFloat(capa.dataset.raton);
      gsap.to(capa, {
        '--mx': `${x * fuerza}px`,
        '--my': `${y * fuerza}px`,
        duration: 0.8,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    });
  };

  portada.addEventListener('mousemove', moverConRaton);
  return () => portada.removeEventListener('mousemove', moverConRaton);
}

/* ---------- 2. Historia ---------- */
function animarHistoria() {
  // La narración aparece palabra por palabra (SplitText separa el texto en palabras)
  gsap.utils.toArray('.narracion').forEach((parrafo) => {
    const partes = window.SplitText ? SplitText.create(parrafo, { type: 'words' }).words : parrafo;
    gsap.from(partes, {
      autoAlpha: 0,
      y: 30,
      rotation: 4,
      duration: 0.6,
      ease: 'back.out(2)',
      stagger: 0.05,
      scrollTrigger: { trigger: parrafo, start: 'top 85%', toggleActions: 'play none none reverse' },
    });
  });

  // Las viñetas entran volando desde los lados, como hojas que caen sobre la mesa,
  // y después se quedan balanceándose suavemente
  gsap.utils.toArray('.vineta').forEach((vineta, i) => {
    const desdeIzquierda = vineta.classList.contains('v-izq') || (vineta.classList.contains('v-centro') && i % 2 === 0);
    gsap.from(vineta, {
      autoAlpha: 0,
      x: desdeIzquierda ? -140 : 140,
      rotation: desdeIzquierda ? -12 : 12,
      scale: 0.9,
      duration: 0.9,
      ease: 'power3.out',
      scrollTrigger: { trigger: vineta, start: 'top 90%', once: true },
      onComplete: () => flotar(vineta, { giro: 1.5, subida: 2.5 }),
    });
  });

  // El remate "no se deja acariciar" aparece de golpe
  gsap.from('.remate', {
    autoAlpha: 0,
    scale: 0.4,
    rotation: -6,
    duration: 1,
    ease: 'back.out(2)',
    scrollTrigger: { trigger: '.remate', start: 'top 85%', toggleActions: 'play none none reverse' },
  });
}

/* ---------- 3. Mochi ---------- */
function animarMochi() {
  // Mochi "respira" todo el tiempo
  gsap.to(mochiImagen, {
    scaleX: 1.02,
    scaleY: 0.98,
    transformOrigin: 'bottom center',
    duration: 1.5,
    ease: 'sine.inOut',
    repeat: -1,
    yoyo: true,
  });

  // Y entra a la sección con un salto
  gsap.from(mochiBoton, {
    autoAlpha: 0,
    y: 120,
    scale: 0.6,
    rotation: -10,
    duration: 1,
    ease: 'back.out(1.6)',
    scrollTrigger: { trigger: '.mochi', start: 'top 70%', toggleActions: 'play none none reverse' },
  });
}

/* ---------- 4. El mundo en horizontal (solo escritorio) ----------
   La sección se queda fija (pin) y, mientras bajas, los 3 mundos pasan de lado. */
function crearMundoHorizontal() {
  const ventana = document.querySelector('.escenarios');
  const pista = ventana.querySelector('.escenarios-pista');
  const barra = ventana.querySelector('.escenarios-progreso span');

  const marco = ventana.querySelector('.escenarios-marco');
  const primerEscenario = ventana.querySelector('.escenario');

  ventana.classList.add('mundo-horizontal');

  const distancia = () => pista.scrollWidth - window.innerWidth;

  // Entrada: mientras te acercas, el marco crece desde una tarjeta redondeada hasta llenar la pantalla
  // y el fondo del primer mundo se acerca un poco (zoom suave)
  gsap.timeline({
    scrollTrigger: { trigger: ventana, start: 'top 85%', end: 'top top', scrub: 0.6 },
  })
    .fromTo(marco,
      { clipPath: 'inset(14% 10% 14% 10% round 48px)' },
      { clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'power2.inOut' })
    .fromTo(primerEscenario.querySelector('.escenario-fondo img'),
      { scale: 1.25 },
      { scale: 1, ease: 'power2.out' }, 0)
    .fromTo('.mundo-intro',
      { autoAlpha: 1, y: 0 },
      { autoAlpha: 0, y: -80, ease: 'power1.in' }, 0)
    .fromTo(barra.parentElement,
      { autoAlpha: 0 },
      { autoAlpha: 1, ease: 'none' }, 0.6);

  // Importante: ease "none" para que el scroll y el movimiento vayan 1 a 1
  const viaje = gsap.to(pista, {
    x: () => -distancia(),
    ease: 'none',
    scrollTrigger: {
      trigger: ventana,
      start: 'top top',
      end: () => `+=${distancia()}`,
      pin: true,
      scrub: 1,
      anticipatePin: 1, // evita un pequeño salto justo cuando la sección se queda fija
      invalidateOnRefresh: true,
      onUpdate: (self) => gsap.set(barra, { scaleX: self.progress }),
    },
  });

  gsap.utils.toArray('.escenario', ventana).forEach((escenario, i) => {
    const fondo = escenario.querySelector('.escenario-fondo');
    const tarjeta = escenario.querySelector('.tarjeta');
    const fotos = escenario.querySelectorAll('.foto');

    // El fondo se mueve más lento que el resto: parallax horizontal
    gsap.fromTo(fondo, { xPercent: -8 }, {
      xPercent: 8,
      ease: 'none',
      scrollTrigger: { trigger: escenario, containerAnimation: viaje, start: 'left right', end: 'right left', scrub: true },
    });

    // Las fotos se mueven más rápido, como si estuvieran más cerca
    gsap.fromTo(fotos, { xPercent: 25, rotation: 6 }, {
      xPercent: -25,
      rotation: -4,
      ease: 'none',
      scrollTrigger: { trigger: escenario, containerAnimation: viaje, start: 'left right', end: 'right left', scrub: true },
    });

    // La tarjeta salta a la vista cuando llega su mundo.
    // La del primer mundo aparece mientras el marco crece (antes de que empiece el viaje de lado).
    const cuando = i === 0
      ? { trigger: ventana, start: 'top 45%', toggleActions: 'play none none reverse' }
      : { trigger: escenario, containerAnimation: viaje, start: 'left 65%', toggleActions: 'play none none reverse' };

    gsap.fromTo(tarjeta, { autoAlpha: 0, y: 80, rotation: -4 }, {
      autoAlpha: 1,
      y: 0,
      rotation: 0,
      duration: 0.9,
      ease: 'back.out(1.6)',
      scrollTrigger: cuando,
    });
  });

  return () => ventana.classList.remove('mundo-horizontal');
}

/* ---------- 5. Contadores (0 → 71) ---------- */
function animarContadores() {
  gsap.utils.toArray('.numero-caja strong').forEach((numero) => {
    const final = parseInt(numero.textContent, 10);
    if (Number.isNaN(final)) return; // el "∞" se queda igual

    gsap.from(numero, {
      textContent: 0,
      snap: { textContent: 1 },
      duration: 1.6,
      ease: 'power2.out',
      scrollTrigger: { trigger: numero, start: 'top 90%' },
    });
  });
}

/* ---------- Flotar ----------
   Movimiento suave y sin fin para que las imágenes no se vean estáticas.
   "subida" se mide en % del alto de la imagen (yPercent) y "giro" en grados.
   Cada imagen usa un ritmo al azar para que no se muevan todas igual. */
function flotar(elemento, { subida = 3, giro = 0 } = {}) {
  const valores = {
    yPercent: -gsap.utils.random(subida * 0.6, subida),
    duration: gsap.utils.random(2.4, 3.8),
    delay: gsap.utils.random(0, 1.5),
    ease: 'sine.inOut',
    repeat: -1,
    yoyo: true,
  };
  if (giro) valores.rotation = gsap.utils.random(-giro, giro);
  return gsap.to(elemento, valores);
}

function animarFlotado() {
  // Tarjetas de Mochi, clips, foto del yunque y Mochi del cierre: suben y bajan, y se ladean un poco
  gsap.utils.toArray('.pose, .clip, .troll-foto, .cierre-mochi').forEach((el) => flotar(el, { subida: 2.5, giro: 1.5 }));

  // Fotos de los mundos y enemigos: solo suben y bajan
  // (su giro ya lo usan otras animaciones y no deben chocar)
  gsap.utils.toArray('.foto').forEach((el) => flotar(el, { subida: 3 }));
  gsap.utils.toArray('.enemigo img').forEach((el) => flotar(el, { subida: 6 }));
}

/* ---------- 6. Enemigos ---------- */
function animarEnemigos() {
  // Cada enemigo salta fuera de su tarjeta al aparecer
  gsap.utils.toArray('.enemigo').forEach((tarjeta, i) => {
    gsap.from(tarjeta.querySelector('img'), {
      y: 70,
      scale: 0.5,
      rotation: i % 2 === 0 ? -14 : 14,
      duration: 0.9,
      ease: 'back.out(1.8)',
      scrollTrigger: { trigger: tarjeta, start: 'top 85%', toggleActions: 'play none none reverse' },
    });
  });
}
