// ═══════════════════════════════════════════════════════════════
// MOVIMIENTO: lo común a todas las animaciones
// - Registra los plugins de GSAP.
// - Scroll suave con Lenis, solo con ratón y sin movimiento reducido.
//   En móvil se deja el scroll nativo del sistema.
// - Un único bucle: el reloj (ticker) de GSAP mueve Lenis, y Lenis
//   avisa a ScrollTrigger en cada fotograma. Nada de dos
//   requestAnimationFrame compitiendo.
// - El botón «Pausar animaciones» (WCAG 2.2.2).
// - La promesa cargaLista: la portada espera a que acabe la carga.
// ═══════════════════════════════════════════════════════════════

const raton = window.matchMedia('(hover: hover) and (pointer: fine)');

// Estado compartido por todos los módulos.
export const movimiento = {
  gsap: window.gsap,                 // undefined si no ha cargado
  reducido: false,
  conRaton: raton.matches,
  lenis: null,
  pausado: false
};

// La portada no arranca hasta que la carga termina (o se salta).
let avisar;
export const cargaLista = new Promise((resolver) => { avisar = resolver; });
export const avisarCargaLista = () => avisar();

// Quien tenga un bucle (intercambio de letras, marquesina…) se apunta
// aquí para enterarse de cuándo se pausa o se reanuda.
const oyentesPausa = new Set();
export const alCambiarPausa = (fn) => oyentesPausa.add(fn);

export function iniciarMovimiento({ sinMovimiento }) {
  movimiento.reducido = sinMovimiento;
  const { gsap } = movimiento;
  if (!gsap) return;

  gsap.registerPlugin(window.ScrollTrigger);

  iniciarPausa(sinMovimiento);

  if (sinMovimiento || !movimiento.conRaton || !window.Lenis) return;

  // ── Lenis ─────────────────────────────────────────────────────
  const lenis = new window.Lenis({
    lerp: 0.1,           // cuánto se acerca al destino en cada fotograma
    smoothWheel: true,
    autoRaf: false       // el bucle lo pone GSAP, abajo
  });
  movimiento.lenis = lenis;

  lenis.on('scroll', window.ScrollTrigger.update);
  gsap.ticker.add((tiempo) => lenis.raf(tiempo * 1000)); // GSAP da segundos; Lenis quiere ms
  gsap.ticker.lagSmoothing(0); // sin «saltos» si un fotograma tarda

  // Enlaces internos (#proyectos…): los lleva Lenis con suavidad y
  // además mueve el foco al destino, como haría el navegador, para que
  // el teclado y el lector de pantalla sigan donde está la vista.
  document.addEventListener('click', (e) => {
    const enlace = e.target.closest('a[href^="#"]');
    if (!enlace) return;
    const id = enlace.getAttribute('href');
    const destino = id.length > 1 && document.querySelector(id);
    if (!destino) return;
    e.preventDefault();
    // El hueco del menú lo pone el scroll-padding-top del CSS, que Lenis respeta.
    lenis.scrollTo(destino, { duration: 1.2 });
    history.pushState(null, '', id);
    if (!destino.matches('a, button, input, textarea, select, [tabindex]')) {
      destino.setAttribute('tabindex', '-1');
    }
    destino.focus({ preventScroll: true });
  });
}

// ── Botón «Pausar animaciones» ─────────────────────────────────
// Para todo lo que se mueve solo (intercambio de letras, marquesina,
// texto que gira…). Se recuerda en este navegador.
function iniciarPausa(sinMovimiento) {
  const boton = document.getElementById('pausa');
  if (!boton || sinMovimiento) return;   // sin movimiento no hay nada que pausar

  const aplicar = (pausado) => {
    movimiento.pausado = pausado;
    boton.setAttribute('aria-pressed', String(pausado));
    boton.title = pausado ? 'Reanudar animaciones' : 'Pausar animaciones';
    document.documentElement.classList.toggle('pausado', pausado);
    oyentesPausa.forEach((fn) => fn(pausado));
  };

  let guardado = false;
  try { guardado = localStorage.getItem('mm-pausa') === '1'; } catch (e) { /* modo privado */ }
  aplicar(guardado);

  boton.addEventListener('click', () => {
    const pausado = !movimiento.pausado;
    aplicar(pausado);
    try { localStorage.setItem('mm-pausa', pausado ? '1' : '0'); } catch (e) { /* da igual */ }
  });
}
