# La habitación de Juan Fer · Portafolio 3D

Portafolio interactivo: una habitación en 3D de estilo pastel. Tres letreros colgantes en la pared (**Mi trabajo**, **Sobre mí**, **Contacto**) y el computador abren ventanas modales con el contenido del CV; el piano suena de verdad al hacer clic en sus teclas. Tiene pantalla de entrada, cambio día/noche, música ambiente y botón de silencio.

## Stack

- **Three.js** (escena, luces, sombras, `OrbitControls`, raycasting para hover y clic)
- **GSAP** (vuelo de cámara, rebote de los objetos al pasar el mouse, animación de modales y transición día/noche)
- **Web Audio API** (piano, clic y música ambiente sintetizados; no se envían archivos de audio)
- **TypeScript** + **Vite**
- **Tailwind CSS** solo para los estilos del HTML (pantalla de carga, HUD y modales)

Sin React ni ningún framework de UI: todo el DOM se construye con TypeScript plano.

## Comandos

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # genera dist/
npm run preview  # sirve dist/
npm run lint     # revisa tipos con tsc
```

## Estructura

```
src/
  main.ts                   arranque: experiencia, pantalla de carga, HUD, modales, audio
  data/profile.ts           toda la información del CV (edita aquí los textos)
  audio/AudioEngine.ts      sonidos sintetizados con Web Audio (piano, pop, ambiente, mute)
  experience/
    Experience.ts           raíz: escena, cámara, renderer, mundo, hover y clic en objetos
    Camera.ts               cámara + OrbitControls + vuelo de entrada con GSAP
    Renderer.ts             WebGLRenderer
    utils/                  Sizes, Time, EventEmitter
    World/
      builders.ts           ayudas para crear cajas, materiales y texturas de texto
      Room.ts               habitación: paredes, cama, escritorio, computador, letreros, lámpara...
      Piano.ts              piano con teclas clicables
      Environment.ts        luces, fondo y niebla (día/noche)
      World.ts              une todo y anima el cambio día/noche
  ui/
    Loading.ts              pantalla de entrada ("¡Entrar!" / "entrar sin sonido")
    Hud.ts                  nombre, enlaces, botones de sonido y de tema
    Modals.ts               ventanas "Mi trabajo", "Sobre mí" y "Contacto"
    icons.ts                iconos (lucide + GitHub/LinkedIn)
```

## Cómo funciona la interacción

Cualquier objeto de la escena se vuelve clicable poniendo en su `userData` un `action` (abre un modal con ese nombre) o un `onClick`. `Experience` recorre la escena al iniciar, hace raycasting con el mouse y anima la escala del objeto con GSAP al pasar por encima.

## Parámetros de URL útiles

- `?entrar` salta la pantalla de entrada.
- `?modal=work` | `about` | `contact` abre un modal directamente.
- `?dia` / `?noche` fuerzan el tema (por defecto depende de la hora).
