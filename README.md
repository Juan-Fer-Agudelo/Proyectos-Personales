# Echoes from Below · Portafolio de Juan Fernando Agudelo

Portafolio interactivo bajo el agua: un submarino con linterna recorre una estructura hundida. Cada roca que la luz alcanza es un proyecto; al enfocarla aparece su nombre y, si tiene sitio, se abre con **Enter**. En las paredes están la experiencia laboral, la educación y un mapa de Medellín.

Está construido sobre el portafolio de código abierto de [Paweł Bród](https://pawel-brod.com) ([repositorio](https://github.com/Unruly-Coder/portfolio), licencia MIT), que a su vez se inspira en el juego [INSIDE](https://playdead.com/games/inside/) de Playdead. Los modelos, sonidos y la mecánica son suyos; el contenido, los letreros, el póster y la tipografía 3D de los letreros son de este proyecto.

## Stack

- **Three.js** para la escena, las luces y el raycasting de la linterna
- **Cannon-es** (en un Web Worker) para la física del submarino y los obstáculos
- **Tween.js** para las animaciones
- **Howler** para el sonido
- **TypeScript** + **Vite**

## Comandos

```bash
npm install
npm run dev      # abre el navegador en el puerto que indique Vite
npm run build    # genera dist/
npm run preview  # sirve dist/
```

## Dónde está el contenido

Todo lo personal vive en `src/application/data/portfolio.ts`:

- `projects`: las rocas de proyectos. Cada una tiene nombre, subtítulo, enlace opcional y posición `x, y` en el mapa.
- `contacts`: las rocas de LinkedIn, GitHub y correo.
- `signs`: los letreros de las paredes (experiencia, educación, fondo), con el nombre del mesh del modelo que reemplazan.

Los textos de la portada, el título y la descripción están en `src/index.html`. El póster de la pared es `static/textures/medellin.png`.

## Controles

| Acción | Ratón | Táctil |
| --- | --- | --- |
| Moverse | Clic izquierdo sostenido hacia el cursor | Palanca izquierda |
| Impulso fuerte | Clic derecho sostenido y soltar | Botón POWER |
| Abrir un proyecto enfocado | Enter | Botón ENTER |

Con el impulso fuerte se rompen los tablones que cierran el paso hacia abajo.

## Estructura

```
src/
  index.html, main.ts, main.css   portada, carga y arranque
  application/
    Application.ts                raíz: escena, cámara, renderer, bucle
    data/portfolio.ts             todo el contenido personal
    experience/
      Experience.ts               une submarino, mapa, obstáculos y rocas
      active-elements/            rocas con texto que se abren con Enter
      map/                        modelo del mapa, colisiones y letreros propios
      submarine/                  submarino, linterna, burbujas
      obstacle/                   tablones que se rompen
      dust/                       partículas en suspensión
    physic/                       Cannon-es en un worker
    controls/                     ratón y controles táctiles
    resources/                    carga de modelos, texturas, sonidos y fuentes
static/                           modelos, sonidos, texturas, fuentes
```
