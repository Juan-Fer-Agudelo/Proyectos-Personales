import { Moon, Sun, Volume2, VolumeX } from 'lucide';
import { profile } from '../data/profile';
import { Github, icon, Linkedin } from './icons';

interface HudHandlers {
  onToggleNight: () => void;
  onToggleMute: () => void;
}

export interface Hud {
  show: () => void;
  setNight: (n: boolean) => void;
  setMuted: (m: boolean) => void;
}

export function createHud(container: HTMLElement, h: HudHandlers): Hud {
  container.className = 'hud';
  container.innerHTML = `
    <div class="hud-name">
      <div class="hud-title">${profile.shortName}</div>
      <div class="hud-role">${profile.role}</div>
    </div>
    <div class="hud-actions">
      <a href="${profile.links.github}" target="_blank" rel="noreferrer" aria-label="GitHub" class="toggle-button">${icon(Github)}</a>
      <a href="${profile.links.linkedin}" target="_blank" rel="noreferrer" aria-label="LinkedIn" class="toggle-button">${icon(Linkedin)}</a>
      <button type="button" data-mute aria-label="Silenciar o activar el sonido" class="toggle-button">
        <span class="sound-on">${icon(Volume2)}</span><span class="sound-off">${icon(VolumeX)}</span>
      </button>
      <button type="button" data-theme aria-label="Cambiar entre día y noche" class="toggle-button">
        <span class="sun-svg">${icon(Sun)}</span><span class="moon-svg">${icon(Moon)}</span>
      </button>
    </div>
    <div class="hud-hint">Haz clic en los letreros, el computador o el piano</div>`;

  container.querySelector('[data-theme]')!.addEventListener('click', h.onToggleNight);
  container.querySelector('[data-mute]')!.addEventListener('click', h.onToggleMute);

  return {
    show: () => container.classList.add('is-visible'),
    setNight: (n) => container.classList.toggle('is-night', n),
    setMuted: (m) => container.classList.toggle('is-muted', m),
  };
}
