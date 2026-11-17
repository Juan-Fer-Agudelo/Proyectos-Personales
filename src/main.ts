import './index.css';
import { AudioEngine } from './audio/AudioEngine';
import { Experience } from './experience/Experience';
import { createHud } from './ui/Hud';
import { createLoading } from './ui/Loading';
import { createModals, type ModalId } from './ui/Modals';

const params = new URLSearchParams(window.location.search);

function hasWebGL(): boolean {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

const audio = new AudioEngine();
const canvas = document.getElementById('webgl') as HTMLCanvasElement;
const modals = createModals(document.getElementById('modals')!, {
  onOpen: () => experience?.lockPointer(true),
  onClose: () => experience?.lockPointer(false),
});

let experience: Experience | null = null;

if (!hasWebGL()) {
  // No 3D available: show the content directly.
  document.body.classList.add('no-webgl');
  document.getElementById('loading')!.remove();
  modals.open('about');
} else {
  experience = new Experience(canvas, audio);

  const hour = new Date().getHours();
  let night = params.has('noche') ? true : params.has('dia') ? false : hour < 6 || hour >= 18;
  const applyTheme = () => {
    document.body.classList.toggle('dark-theme', night);
    document.body.classList.toggle('light-theme', !night);
    hud.setNight(night);
  };

  const hud = createHud(document.getElementById('hud')!, {
    onToggleNight: () => {
      night = !night;
      experience!.world.setNight(night);
      applyTheme();
      audio.pop();
    },
    onToggleMute: () => {
      audio.setMuted(!audio.isMuted);
      hud.setMuted(audio.isMuted);
    },
  });
  experience.world.setNight(night, false);
  applyTheme();

  experience.on('action', (id) => {
    audio.pop();
    modals.open(id as ModalId);
  });

  const start = (withSound: boolean) => {
    audio.unlock();
    audio.setMuted(!withSound);
    hud.setMuted(!withSound);
    audio.startAmbient();
    hud.show();
  };

  const loading = createLoading(document.getElementById('loading')!, (withSound) => {
    start(withSound);
    experience!.camera.enter();
  });
  // Everything is procedural, so "loading" only waits for the first rendered frame.
  requestAnimationFrame(() => requestAnimationFrame(() => loading.ready()));

  // ?entrar skips the loading screen; ?modal=work|about|contact opens one directly (handy for testing).
  if (params.has('entrar') || params.has('modal')) {
    loading.hide();
    hud.show();
    experience.camera.enter(true);
    const m = params.get('modal') as ModalId | null;
    if (m) modals.open(m);
  }
}
