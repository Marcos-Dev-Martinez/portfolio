// ═══════════════════════════════════════════════════════════════
// 1 · PANTALLA DE CARGA
// El porcentaje es real: cuenta las fuentes, las imágenes que se ven
// en pantalla y el evento load de la página. No obliga a descargar las
// imágenes de abajo (eso empeoraría la carga en lugar de mejorarla).
// Tiene un tiempo máximo, aunque falte algo por cargar. Al llegar a 100, las columnas suben desde el centro, descubren
// la portada y en ese momento arranca la animación del título.
// Solo sale en la primera visita de la sesión y nunca con movimiento
// reducido (eso lo decide el script del <head>, antes de pintar nada).
// ═══════════════════════════════════════════════════════════════

import { movimiento, avisarCargaLista } from './motion.js';

// La cuenta se corta a los 0,9 s; con la salida, todo dura como mucho
// 1,5 s más o menos.
const LIMITE_MS = 900;

export function iniciarCarga() {
  const h = document.documentElement;
  const carga = document.querySelector('.carga');
  const { gsap } = movimiento;

  // Sin pantalla de carga (visita repetida, movimiento reducido o GSAP
  // que no ha llegado): la portada arranca ya.
  if (!carga || !gsap || !h.classList.contains('con-carga')) {
    carga?.remove();
    h.classList.remove('con-carga');
    avisarCargaLista();
    return;
  }

  // Mientras tapa la página, lo de debajo no recibe el foco del teclado.
  const resto = [...document.body.children].filter((el) => el !== carga && el.tagName !== 'SCRIPT');
  resto.forEach((el) => { el.inert = true; });
  movimiento.lenis?.stop();

  const num = carga.querySelector('.carga-num');
  const barra = carga.querySelector('.carga-barra');

  // ── Tareas que cuentan para el porcentaje ─────────────────────
  const enPantalla = [...document.images].filter((img) => {
    const r = img.getBoundingClientRect();
    return !img.complete && r.top < innerHeight && r.bottom > 0;
  });
  const tareas = [
    document.fonts.load('900 1em Inter'),
    document.fonts.load('500 1em "JetBrains Mono"'),
    document.fonts.load('400 1em "JetBrains Mono"'),
    ...enPantalla.map((img) => img.decode()),
    new Promise((ok) => {
      if (document.readyState === 'complete') ok();
      else addEventListener('load', ok, { once: true });
    })
  ];
  let hechas = 0;
  let objetivo = 0;
  tareas.forEach((t) => {
    Promise.resolve(t).catch(() => {}).finally(() => {
      hechas++;
      objetivo = (hechas / tareas.length) * 100;
    });
  });

  // ── El número persigue al objetivo ────────────────────────────
  // Se acerca un 16 % de lo que le falta en cada fotograma: rápido al
  // principio y frenando al final. Nunca pasa de 100.
  let mostrado = 0;
  const avanzar = () => {
    const meta = performance.now() >= LIMITE_MS ? 100 : objetivo;
    if (mostrado < meta) mostrado = Math.min(meta, mostrado + (meta - mostrado) * 0.16 + 0.5);
    // Siempre tres cifras (007, 042, 100): el ancho no cambia y nada se mueve.
    num.textContent = String(Math.round(mostrado)).padStart(3, '0');
    barra.style.transform = `scaleX(${mostrado / 100})`;
    if (mostrado >= 100) salir();
    else requestAnimationFrame(avanzar);
  };
  requestAnimationFrame(avanzar);

  // ── Salida ────────────────────────────────────────────────────
  function salir() {
    const movil = !window.matchMedia('(min-width: 769px)').matches;
    const columnas = carga.querySelectorAll('.carga-columnas span');
    gsap.timeline({ onComplete: limpiar })
      .to(carga.querySelectorAll('.carga-cifra, .carga-marca'), {
        yPercent: -30, opacity: 0, duration: 0.2, ease: 'power2.in'
      })
      .to(barra, { opacity: 0, duration: 0.2 }, '<')
      // La portada empieza a entrar justo cuando se abren las columnas.
      .add(avisarCargaLista)
      .to(columnas, {
        yPercent: -100,
        duration: movil ? 0.55 : 0.65,
        ease: 'power4.inOut',
        stagger: { each: 0.05, from: 'center' }
      }, '-=0.15');
  }

  function limpiar() {
    carga.remove();
    resto.forEach((el) => { el.inert = false; });
    h.classList.remove('con-carga');
    try { sessionStorage.setItem('mm-carga', '1'); } catch (e) { /* modo privado */ }
    movimiento.lenis?.start();
    window.ScrollTrigger?.refresh();
  }
}
