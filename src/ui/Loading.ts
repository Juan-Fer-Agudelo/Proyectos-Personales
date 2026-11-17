import { profile } from '../data/profile';

export function createLoading(container: HTMLElement, onEnter: (withSound: boolean) => void): { ready: () => void; hide: () => void } {
  container.className = 'loading-screen';
  container.innerHTML = `
    <div class="loading-card">
      <div class="loading-kicker">Portafolio interactivo</div>
      <h1 class="loading-title">La habitación de ${profile.shortName}</h1>
      <p class="loading-sub">${profile.role}</p>
      <div class="loading-text" data-loading>Cargando<span class="dots"></span></div>
      <button type="button" class="loading-button" data-enter hidden>¡Entrar!</button>
      <button type="button" class="no-sound-button" data-enter-muted hidden>entrar sin sonido :(</button>
      <p class="instructions desktop-instructions">Usa clic izquierdo, clic derecho y la rueda del mouse para moverte.<br>Haz clic en los letreros, el computador y el piano.</p>
      <p class="instructions mobile-instructions">Usa uno o dos dedos para moverte.<br>Toca los letreros, el computador y el piano.</p>
    </div>`;
  const btn = container.querySelector('[data-enter]') as HTMLButtonElement;
  const btnMuted = container.querySelector('[data-enter-muted]') as HTMLButtonElement;
  const txt = container.querySelector('[data-loading]') as HTMLElement;
  const hide = () => {
    container.classList.add('is-hidden');
    window.setTimeout(() => { container.style.display = 'none'; }, 900);
  };
  btn.addEventListener('click', () => {
    hide();
    onEnter(true);
  });
  btnMuted.addEventListener('click', () => {
    hide();
    onEnter(false);
  });
  return {
    ready: () => {
      txt.hidden = true;
      btn.hidden = false;
      btnMuted.hidden = false;
    },
    hide,
  };
}
