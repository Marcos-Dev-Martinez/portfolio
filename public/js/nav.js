// ═══════════════════════════════════════════════════════════════
// MENÚ
// 1. Se esconde al bajar y vuelve al subir (deja más pantalla para
//    leer, sobre todo en el móvil).
// 2. Marca la sección en la que estás (IntersectionObserver).
// 3. Hamburguesa en móvil.
// 4. Barra de progreso cuando el navegador no la hace solo con CSS.
// ═══════════════════════════════════════════════════════════════

export function iniciarNav({ sinMovimiento }) {
  const nav = document.querySelector('.site-nav');
  const boton = document.getElementById('hamburger');
  const menu = document.getElementById('nav-menu');
  if (!nav) return;

  // ── Hamburguesa ──────────────────────────────────────────────
  const cerrarMenu = () => {
    if (!menu || !boton) return;
    menu.classList.remove('open');
    boton.setAttribute('aria-expanded', 'false');
    boton.setAttribute('aria-label', 'Abrir menú');
  };

  if (boton && menu) {
    boton.addEventListener('click', () => {
      const abierto = menu.classList.toggle('open');
      boton.setAttribute('aria-expanded', String(abierto));
      boton.setAttribute('aria-label', abierto ? 'Cerrar menú' : 'Abrir menú');
    });
    menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', cerrarMenu));
    // Escape cierra y devuelve el foco al botón (WCAG 2.1.2).
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menu.classList.contains('open')) {
        cerrarMenu();
        boton.focus();
      }
    });
  }

  // ── Esconder al bajar, mostrar al subir ──────────────────────
  // El scroll dispara muchos eventos por segundo; con
  // requestAnimationFrame se hace como mucho un cálculo por fotograma.
  let ultimaY = window.scrollY;
  let pendiente = false;

  const alHacerScroll = () => {
    const y = window.scrollY;
    const bajando = y > ultimaY + 6;
    const subiendo = y < ultimaY - 6;
    const menuAbierto = menu && menu.classList.contains('open');
    // Nunca se esconde arriba del todo, con el menú abierto o si el
    // foco del teclado está dentro (no se puede perder de vista).
    const focoDentro = nav.contains(document.activeElement);

    if (y < 80 || subiendo || menuAbierto || focoDentro) nav.classList.remove('nav-oculta');
    else if (bajando) nav.classList.add('nav-oculta');

    if (bajando || subiendo) ultimaY = y;
    actualizarProgreso();
    pendiente = false;
  };

  window.addEventListener('scroll', () => {
    if (pendiente) return;
    pendiente = true;
    requestAnimationFrame(alHacerScroll);
  }, { passive: true });

  // Si el foco del teclado entra en el menú escondido, vuelve a salir.
  nav.addEventListener('focusin', () => nav.classList.remove('nav-oculta'));

  // ── Barra de progreso (respaldo) ─────────────────────────────
  // Con animation-timeline: scroll() la barra va sola por CSS. Si el
  // navegador no lo soporta, o hay movimiento reducido, se calcula aquí.
  const barra = document.querySelector('.progreso');
  const cssLaHace = CSS.supports('animation-timeline: scroll()') && !sinMovimiento;
  function actualizarProgreso() {
    if (!barra || cssLaHace) return;
    const total = document.documentElement.scrollHeight - window.innerHeight;
    const p = total > 0 ? Math.min(window.scrollY / total, 1) : 0;
    barra.style.setProperty('--progreso', p.toFixed(4));
  }
  actualizarProgreso();

  // ── Sección activa ───────────────────────────────────────────
  // Una franja fina en el centro de la pantalla: la sección que la
  // cruza es la activa. Más barato que medir offsetTop en cada scroll.
  const enlaces = [...document.querySelectorAll('.nav-links a[href^="#"]')];
  const secciones = enlaces
    .map((a) => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);
  if (!secciones.length || !('IntersectionObserver' in window)) return;

  const marcar = (id) => {
    enlaces.forEach((a) => {
      const activo = a.getAttribute('href') === '#' + id;
      a.classList.toggle('activo', activo);
      if (activo) a.setAttribute('aria-current', 'location');
      else a.removeAttribute('aria-current');
    });
  };

  const observador = new IntersectionObserver((entradas) => {
    entradas.forEach((e) => { if (e.isIntersecting) marcar(e.target.id); });
  }, { rootMargin: '-45% 0px -54% 0px' });

  secciones.forEach((s) => observador.observe(s));

  // Arriba del todo (portada) no hay ninguna marcada.
  const portada = document.getElementById('inicio');
  if (portada) {
    new IntersectionObserver(([e]) => { if (e.isIntersecting) marcar(''); },
      { rootMargin: '-45% 0px -54% 0px' }).observe(portada);
  }
}
