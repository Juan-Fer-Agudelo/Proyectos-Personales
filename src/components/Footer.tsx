interface FooterProps {
  onNavigate: (sectionId: string) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-zinc-200 bg-white">
      <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-zinc-500">
        <p className="whitespace-nowrap">
          © {currentYear} Mi Espacio
        </p>

        <div className="flex items-center gap-6">
          <a
            href="#inicio"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('inicio');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="hover:text-zinc-900 transition-colors whitespace-nowrap"
          >
            Inicio
          </a>
          <a
            href="#proyectos"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('proyectos');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="hover:text-zinc-900 transition-colors whitespace-nowrap"
          >
            Proyectos
          </a>
          <a
            href="#contacto"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('contacto');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="hover:text-zinc-900 transition-colors whitespace-nowrap"
          >
            Contacto
          </a>
        </div>
      </div>
    </footer>
  );
}
