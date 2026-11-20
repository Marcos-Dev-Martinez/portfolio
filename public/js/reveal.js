// ═══════════════════════════════════════════════════════════════
// APARICIÓN AL HACER SCROLL
// Un único IntersectionObserver vigila todos los [data-reveal].
// Cuando uno entra en pantalla le pone .is-visible (el CSS hace la
// animación) y deja de vigilarlo: cada elemento se anima una vez.
//
// Uso en el HTML:
//   <div data-reveal="fade-up">          fade-up | fade | clip | scale
//   <div data-reveal="fade" data-delay="2">   espera 2 × --stagger
//   <ul data-stagger> <li data-reveal="fade-up">…   escalonado automático
// ═══════════════════════════════════════════════════════════════

export function iniciarReveal({ sinMovimiento }) {
  const nodos = document.querySelectorAll('[data-reveal]');
  if (!nodos.length) return;

  // data-delay="n" → variable CSS --i, que multiplica a --stagger.
  nodos.forEach((n) => {
    if (n.dataset.delay) n.style.setProperty('--i', n.dataset.delay);
  });

  // En un grupo [data-stagger], cada hijo espera un poco más que el
  // anterior. Se calcula aquí para no escribir data-delay a mano.
  document.querySelectorAll('[data-stagger]').forEach((grupo) => {
    grupo.querySelectorAll(':scope > [data-reveal]').forEach((hijo, i) => {
      if (!hijo.dataset.delay) hijo.style.setProperty('--i', i);
    });
  });

  const mostrar = (n) => n.classList.add('is-visible');

  // Sin movimiento o sin IntersectionObserver (navegador antiguo):
  // todo visible desde el principio, sin animar.
  if (sinMovimiento || !('IntersectionObserver' in window)) {
    nodos.forEach(mostrar);
    return;
  }

  const observador = new IntersectionObserver((entradas) => {
    for (const entrada of entradas) {
      if (!entrada.isIntersecting) continue;
      mostrar(entrada.target);
      observador.unobserve(entrada.target); // ya no hace falta vigilarlo
    }
  }, {
    threshold: 0.15,                 // cuando se ve un 15 %
    rootMargin: '0px 0px -8% 0px'    // un poco antes del borde de abajo
  });

  nodos.forEach((n) => observador.observe(n));

  // Si se navega con el teclado a algo que aún está oculto (por
  // ejemplo, saltando con Tab), se muestra al recibir el foco.
  document.addEventListener('focusin', (e) => {
    const oculto = e.target.closest('[data-reveal]:not(.is-visible)');
    if (oculto) { mostrar(oculto); observador.unobserve(oculto); }
  });
}
