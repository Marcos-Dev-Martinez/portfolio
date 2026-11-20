// ═══════════════════════════════════════════════════════════════
// FICHAS DE PROYECTO
// Cada tarjeta abre un <dialog> con la explicación del proyecto.
// Los botones usan commandfor/command: en los navegadores actuales
// abren y cierran la ficha incluso sin JavaScript. Aquí se añade:
// - respaldo para navegadores que aún no lo entienden;
// - cerrar al pulsar fuera (por si no entienden closedby="any");
// - devolver el foco a la tarjeta al cerrar (Safari no lo hace solo);
// - parar el scroll suave de Lenis mientras está abierta;
// - una entrada escalonada del contenido (no con movimiento reducido).
// ═══════════════════════════════════════════════════════════════

import { movimiento } from './motion.js';

export function iniciarFichas() {
  const fichas = document.querySelectorAll('dialog.ficha');
  if (!fichas.length) return;

  const nativo = 'commandForElement' in HTMLButtonElement.prototype;
  let origen = null;   // el botón que abrió la ficha

  document.addEventListener('click', (e) => {
    const boton = e.target.closest('button[commandfor]');
    if (!boton) return;
    const ficha = document.getElementById(boton.getAttribute('commandfor'));
    if (!ficha?.matches('dialog.ficha')) return;
    const orden = boton.getAttribute('command');
    if (orden === 'show-modal') origen = boton;
    if (nativo) return;                       // el navegador ya lo hace
    if (orden === 'show-modal' && !ficha.open) ficha.showModal();
    else if (orden === 'close') ficha.close();
  });

  fichas.forEach((ficha) => {
    // Un clic en el fondo oscuro llega al propio <dialog>; dentro de la caja, no.
    ficha.addEventListener('click', (e) => { if (e.target === ficha) ficha.close(); });

    ficha.addEventListener('close', () => {
      const activo = document.activeElement;
      if (origen && (!activo || activo === document.body)) origen.focus();
    });

    // Abrir o cerrar cambia el atributo «open», da igual quién lo haga.
    new MutationObserver(() => (ficha.open ? alAbrir(ficha) : alCerrar()))
      .observe(ficha, { attributes: true, attributeFilter: ['open'] });
  });
}

function alAbrir(ficha) {
  ficha.scrollTop = 0;
  movimiento.lenis?.stop();
  const { gsap, reducido, pausado } = movimiento;
  if (!gsap || reducido || pausado) return;
  gsap.fromTo(ficha.querySelectorAll('.ficha-entra'),
    { opacity: 0, y: 16 },
    { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out', stagger: 0.05, delay: 0.06, clearProps: 'opacity,transform' });
}

function alCerrar() {
  movimiento.lenis?.start();
}
