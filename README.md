# Don't Pet Me · Página web

Página de presentación de **Don't Pet Me**, un videojuego de plataformas 3D en el que Mochi, un pequeño hámster, escapa de su jaula y cruza una casa llena de peligros gigantes para volver con su familia.

Tiene efecto **parallax** y animaciones hechas con HTML, CSS y JavaScript, más la librería de animación **[GSAP](https://gsap.com)** (ScrollTrigger, SplitText y ScrollToPlugin), que se carga desde internet. No hay que instalar nada.

- **Juego:** https://iisunnyii29.itch.io/dont-petme
- **Canal de YouTube:** https://www.youtube.com/channel/UCwrgNJMjuqe6yDbM3uZjHgA

**Desarrollado por:** Bryan Chuc, Dhayan Drollat, Bruno Llovera, Giovanni Medina y Ahuizotl Morales.

## Publicarla gratis con GitHub Pages

Como la página es solo HTML, CSS y JavaScript, GitHub la puede publicar sin costo:

1. Sube este repositorio a GitHub.
2. En el repositorio, ve a **Settings > Pages**.
3. En **Branch** elige `main` y la carpeta `/ (root)`, y guarda.
4. En uno o dos minutos la página queda en `https://TU-USUARIO.github.io/NOMBRE-DEL-REPO/`.

## Cómo verla en VS Code

1. Abre la carpeta `PaginaDontPetMeGSAP` en VS Code (Archivo > Abrir carpeta).
2. Instala la extensión **Live Server** (de Ritwick Dey).
3. Da clic derecho en `index.html` y elige **Open with Live Server**.
4. Se abre en el navegador, y cada vez que guardas un cambio la página se actualiza sola.

> Si abres `index.html` con doble clic, casi todo funciona, pero la música y los videos van mejor con Live Server.

## Qué hay en cada archivo

| Archivo | Qué hace |
|---|---|
| `index.html` | Todo el contenido y los textos de la página, separados por secciones con comentarios. |
| `css/estilos.css` | Colores, tamaños y animaciones. Los colores del juego están arriba de todo (`--rojo`, `--crema`, etc.). |
| `js/main.js` | Las animaciones con GSAP, el Mochi que no se deja acariciar, el menú y el reproductor de música. |
| `img/` | Personajes (sacados de los modelos 3D), capturas de los niveles, viñetas del cómic y GIFs. |
| `audio/` | Las 4 canciones en MP3 y algunos sonidos de Mochi. |
| `video/` | La fogata animada de la portada. El tráiler se ve desde el canal de YouTube (sección **TRÁILER** de `index.html`). |

## Cómo funciona el parallax

Cualquier elemento con el atributo `data-velocidad` se mueve a otra velocidad al hacer scroll:

- **Número positivo** (por ejemplo `0.3`): se mueve más lento, como un fondo lejano.
- **Número negativo** (por ejemplo `-0.2`): se mueve más rápido, como algo muy cerca.
- **Más cerca de 0**: un efecto más suave.

En la portada, `data-raton` hace que las capas también sigan al ratón.

## Animaciones con GSAP

GSAP se carga al final de `index.html` con tres archivos:

- **gsap**: el motor de animación.
- **ScrollTrigger**: une las animaciones con el scroll.
- **SplitText**: separa un texto en palabras para animarlas una por una.

En `js/main.js`, la parte 4 tiene una función para cada sección:

| Función | Qué hace |
|---|---|
| `animarPortada` | El logo rebota al entrar, las semillas flotan y todo se desvanece al bajar. |
| `crearParallax` | Mueve cada capa con `data-velocidad` según el scroll. |
| `crearApariciones` | Hace que los elementos con la clase `aparecer` suban en cascada al entrar en pantalla. |
| `animarHistoria` | La narración aparece palabra por palabra y las viñetas entran volando. |
| `animarMochi` | Mochi respira y entra con un salto. El esquive al intentar acariciarlo está en la parte 3. |
| `crearMundoHorizontal` | **Solo en escritorio:** la sección se queda fija y los 3 mundos pasan de lado al hacer scroll. |
| `animarContadores` | Los números suben de 0 a su valor (por ejemplo 0 → 71). |
| `animarEnemigos` | Cada enemigo salta fuera de su tarjeta. |

Notas:

- En celular (900 px o menos) los mundos van uno debajo del otro, sin la parte horizontal.
- Si la persona activó "reducir movimiento" en su sistema, no se anima nada.
- Si GSAP no carga (por ejemplo, sin internet), la página se ve completa, solo que sin animaciones.
- **No pongas `scroll-behavior: smooth` en el CSS:** hace que ScrollTrigger mida mal y la sección de los mundos se encime con otras. El scroll suave de los enlaces del menú ya lo hace GSAP (ScrollToPlugin).
- **Si agregas una imagen**, ponle `width` y `height` con su tamaño real (como las demás), para que la página no "salte" al cargarla.
- Los íconos están dibujados en SVG al inicio de `index.html` (`<symbol id="i-...">`). Para usar uno: `<svg class="icono"><use href="#i-nota"/></svg>`.

## Fichas de los enemigos

En la sección **ENEMIGOS** de `index.html` cada enemigo tiene dos partes:

1. Una **tarjeta** (`<button class="enemigo" data-ficha="ficha-arania">`) que solo muestra al personaje.
2. Su **ficha** (`<dialog class="ficha" id="ficha-arania">`), justo debajo, con el mundo donde aparece, la descripción, cómo ataca, un consejo, el nivel de peligro y su sonido.

El `data-ficha` de la tarjeta debe ser igual al `id` de su ficha. Para cambiar un texto, edítalo directo en la ficha. Para el nivel de peligro, cambia el número de `--nivel` (de 1 a 5).

## Enlace del juego

Los botones **Jugar** (menú) y **Jugar ahora en itch.io** (cierre) llevan a https://iisunnyii29.itch.io/dont-petme. Si cambia la dirección, búscala en `index.html` y reemplázala en los dos lugares.
