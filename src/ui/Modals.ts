import gsap from 'gsap';
import { ExternalLink, Globe, GraduationCap, Mail, MapPin, Phone, Sparkles, X } from 'lucide';
import { profile } from '../data/profile';
import { Github, icon, Linkedin } from './icons';

export type ModalId = 'work' | 'about' | 'contact';

interface ModalHandlers {
  onOpen: () => void;
  onClose: () => void;
}

const chip = (s: string) => `<span class="chip">${s}</span>`;

/* ---------- ~ Mi trabajo ~ ---------- */
function work(): string {
  return `
    <h2 class="modal-title">~ Mi trabajo ~</h2>
    <p class="modal-intro">Convierto procesos manuales en software que la gente usa todos los días. Estos son algunos resultados y proyectos en producción.</p>
    <div class="highlights">
      ${profile.highlights.map((h) => `
        <div class="highlight">
          <div class="highlight-value">${h.value}</div>
          <div class="highlight-label">${h.label}</div>
        </div>`).join('')}
    </div>
    <div class="work-grid">
      ${profile.projects.map((p) => `
        <article class="work-project">
          <div class="work-image" style="--c:${p.color}">
            <span>${p.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}</span>
          </div>
          <div class="work-body">
            <h3 class="work-title">
              ${p.url ? `<a href="${p.url}" target="_blank" rel="noreferrer">${p.name} ${icon(ExternalLink, 'w-3.5 h-3.5')}</a>` : p.name}
            </h3>
            <div class="work-tag">${p.tag}</div>
            <p class="work-text">${p.description}</p>
            <div class="chips">${p.stack.map(chip).join('')}</div>
          </div>
        </article>`).join('')}
    </div>
    <p class="modal-foot">
      <a href="${profile.links.portfolio}" target="_blank" rel="noreferrer" class="text-link">Ver más proyectos con demos en vivo ${icon(ExternalLink, 'w-3.5 h-3.5')}</a>
    </p>`;
}

/* ---------- ~ Sobre mí ~ ---------- */
function about(): string {
  return `
    <h2 class="modal-title">~ Sobre mí ~</h2>
    <div class="about-head">
      <div class="avatar">JF</div>
      <div>
        <div class="about-name">${profile.name}</div>
        <div class="about-role">${profile.role}</div>
        <div class="about-meta">${icon(MapPin, 'w-3.5 h-3.5')} ${profile.location}</div>
      </div>
    </div>
    ${profile.summary.map((p) => `<p class="modal-paragraph-text">${p}</p>`).join('')}

    <h3 class="modal-paragraph-header">${icon(Sparkles)} Experiencia</h3>
    <ul class="timeline">
      ${profile.experience.map((j) => `
        <li>
          <div class="tl-role">${j.role}</div>
          <div class="tl-meta">${j.company} · ${j.period} · ${j.place}</div>
          <ul class="tl-bullets">${j.bullets.slice(0, 3).map((b) => `<li>${b}</li>`).join('')}</ul>
        </li>`).join('')}
    </ul>

    <h3 class="modal-paragraph-header">Habilidades</h3>
    ${profile.skills.map((g) => `
      <div class="skill-group">
        <div class="skill-name">${g.group}</div>
        <div class="chips">${g.items.map(chip).join('')}</div>
      </div>`).join('')}

    <h3 class="modal-paragraph-header">${icon(GraduationCap)} Educación</h3>
    <ul class="plain-list">
      ${profile.education.map((e) => `<li><b>${e.title}</b> · ${e.school}${e.period ? ` · ${e.period}` : ''}</li>`).join('')}
      ${profile.languages.map((l) => `<li><b>${l.name}</b> · ${l.level}</li>`).join('')}
    </ul>

    <h3 class="modal-paragraph-header">Me interesa</h3>
    <div class="chips">${profile.interests.map(chip).join('')}</div>`;
}

/* ---------- ~ Contacto ~ ---------- */
function contact(): string {
  const links = [
    { icon: Mail, label: 'Correo', href: `mailto:${profile.email}`, value: profile.email },
    { icon: Phone, label: 'Teléfono', href: profile.phoneHref, value: profile.phone },
    { icon: Linkedin, label: 'LinkedIn', href: profile.links.linkedin, value: 'juan-fer-agudelo' },
    { icon: Github, label: 'GitHub', href: profile.links.github, value: 'Juan-Fer-Agudelo' },
    { icon: Globe, label: 'Portafolio', href: profile.links.portfolio, value: 'juan-fer-digital.vercel.app' },
  ];
  return `
    <h2 class="modal-title">~ ¡Hablemos! ~</h2>
    <p class="modal-intro">Si tienes un proceso manual que quieras convertir en software, o un proyecto web que llevar a producción, escríbeme.</p>
    <div class="contact-button-wrapper">
      ${links.map((l) => `
        <a href="${l.href}" ${l.href.startsWith('http') ? 'target="_blank" rel="noreferrer"' : ''} class="contact-link" aria-label="${l.label}">
          <span class="contact-svg">${icon(l.icon, 'w-6 h-6')}</span>
          <span class="contact-label">${l.label}</span>
          <span class="contact-value">${l.value}</span>
        </a>`).join('')}
    </div>
    <p class="modal-foot">${icon(MapPin, 'w-3.5 h-3.5')} ${profile.location} · Disponible para trabajo remoto</p>`;
}

const CONTENT: Record<ModalId, () => string> = { work, about, contact };

export function createModals(container: HTMLElement, h: ModalHandlers): { open: (id: ModalId) => void; close: () => void } {
  container.className = 'modal-wrapper';
  container.innerHTML = `
    <div class="overlay" data-overlay></div>
    ${(['work', 'about', 'contact'] as ModalId[]).map((id) => `
      <div class="modal ${id} modal-hidden" data-modal="${id}" role="dialog" aria-modal="true">
        <button type="button" class="modal-exit-button" data-close aria-label="Cerrar">${icon(X, 'w-5 h-5')}</button>
        <div class="modal-content-wrapper"><div class="modal-content">${CONTENT[id]()}</div></div>
      </div>`).join('')}`;

  let current: HTMLElement | null = null;

  const close = () => {
    if (!current) return;
    const el = current;
    current = null;
    container.classList.remove('is-open');
    gsap.to(el, { autoAlpha: 0, scale: 0.92, y: 20, duration: 0.3, ease: 'power2.in', onComplete: () => el.classList.add('modal-hidden') });
    h.onClose();
  };

  const open = (id: ModalId) => {
    if (current) {
      if (current.dataset.modal === id) return;
      current.classList.add('modal-hidden');
      gsap.set(current, { autoAlpha: 0 });
    }
    const el = container.querySelector(`[data-modal="${id}"]`) as HTMLElement;
    el.classList.remove('modal-hidden');
    el.querySelector('.modal-content-wrapper')!.scrollTop = 0;
    current = el;
    container.classList.add('is-open');
    gsap.fromTo(el, { autoAlpha: 0, scale: 0.9, y: 30 }, { autoAlpha: 1, scale: 1, y: 0, duration: 0.5, ease: 'back.out(1.6)' });
    h.onOpen();
  };

  container.querySelector('[data-overlay]')!.addEventListener('click', close);
  container.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', close));
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });

  return { open, close };
}
