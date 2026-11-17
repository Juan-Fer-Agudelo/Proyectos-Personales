/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Footer } from './components/Footer';
import { Navbar } from './components/Navbar';

export default function App() {
  const [activeSection, setActiveSection] = useState('inicio');

  return (
    <div className="min-h-screen flex flex-col bg-white text-zinc-900">
      <Navbar activeSection={activeSection} onNavigate={setActiveSection} />

      <main
        id={activeSection}
        className="flex-1 w-full max-w-6xl mx-auto px-6 py-12"
      >
        {/* Espacio en blanco listo para tus proyectos personales */}
      </main>

      <Footer onNavigate={setActiveSection} />
    </div>
  );
}
