// ═══════════════════════════════════════════════════════════════
// 2 · PORTADA
// - «MARCOS / MARTÍNEZ» gigante: cada letra sube desde detrás de una
//   máscara, una detrás de otra.
// - «DESARROLLADOR WEB»: cada 3–4 s, 1 o 2 letras al azar ruedan hacia
//   arriba y entra su copia desde abajo, como un marcador.
// - Al bajar, la portada se desvanece y sube un poco (scroll ligado a
//   ScrollTrigger con scrub).
// Sin JS o con movimiento reducido se ve todo quieto desde el principio.
// ═══════════════════════════════════════════════════════════════

import { movimiento, cargaLista } from './motion.js';

export function iniciarHero({ sinMovimiento }) {
  const { gsap } = movimiento;
  const seccion = document.getElementById('inicio');
  const titulo = seccion?.querySelector('.hero-name');
  const rol = seccion?.querySelector('[data-intercambio]');
  if (!seccion || !titulo) return;
  if (sinMovimiento || !gsap) return; // el CSS ya lo enseña todo

  const movil = !window.matchMedia('(min-width: 769px)').matches;

  // ── Partir el nombre en letras ────────────────────────────────
  // El lector de pantalla lee el aria-label del h1 («Marcos Martínez»)
  // y no las letras sueltas, que van con aria-hidden.
  titulo.setAttribute('aria-label', titulo.textContent.replace(/\s+/g, ' ').trim());
  const letras = [];
  titulo.querySelectorAll('.hero-linea').forEach((linea) => {
    const texto = linea.textContent.trim();
    linea.textContent = '';
    linea.setAttribute('aria-hidden', 'true');
    for (const caracter of texto) {
      const mascara = document.createElement('span');
      mascara.className = 'letra-mascara';
      const letra = document.createElement('span');
      letra.className = 'letra';
      letra.textContent = caracter;
      mascara.append(letra);
      linea.append(mascara);
      letras.push(letra);
    }
  });
  gsap.set(letras, { yPercent: 115 });   // escondidas bajo la máscara
  titulo.classList.add('partido');        // el CSS deja de ocultar el h1

  const cajas = rol ? prepararIntercambio(rol, gsap) : [];

  // ── Entrada, cuando termine la carga ──────────────────────────
  cargaLista.then(() => {
    gsap.timeline({ onComplete: () => arrancarIntercambio(cajas, gsap, seccion) })
      .to(letras, {
        yPercent: 0,
        duration: movil ? 0.8 : 1.1,
        ease: 'expo.out',
        stagger: movil ? 0.025 : 0.035
      })
      .fromTo(seccion.querySelectorAll('.hero-sube'),
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: movil ? 0.5 : 0.7, ease: 'power3.out', stagger: 0.08 },
        movil ? 0.1 : 0.2);
  });

  // ── Salida al hacer scroll ────────────────────────────────────
  // scrub: la animación va pegada a la barra de scroll, adelante y atrás.
  gsap.to(seccion.querySelector('.hero-contenido'), {
    y: () => -window.innerHeight * 0.12,
    opacity: 0,
    ease: 'none',
    scrollTrigger: { trigger: seccion, start: 'top top', end: 'bottom top', scrub: true }
  });
}

// ── Intercambio de letras ───────────────────────────────────────
// Cada letra va en una caja con overflow oculto y dos copias dentro:
// la visible (a) y otra esperando debajo (b).
function prepararIntercambio(el, gsap) {
  const texto = el.textContent.trim();
  el.textContent = '';
  const cajas = [];
  for (const caracter of texto) {
    if (caracter === ' ') { el.append(' '); continue; }
    const caja = document.createElement('span');
    caja.className = 'giro';
    const a = document.createElement('span');
    const b = document.createElement('span');
    a.className = 'giro-a';
    b.className = 'giro-b';
    a.textContent = b.textContent = caracter;
    caja.append(a, b);
    el.append(caja);
    cajas.push({ a, b, girando: false });
  }
  gsap.set(cajas.map((c) => c.b), { yPercent: 100 });
  return cajas;
}

function arrancarIntercambio(cajas, gsap, seccion) {
  if (!cajas.length) return;

  // Solo gira si la portada se ve, la pestaña está activa y nadie ha
  // pulsado «Pausar animaciones».
  let visible = true;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(seccion);

  const girar = (caja, retraso) => {
    caja.girando = true;
    const opciones = { duration: 0.55, ease: 'power3.inOut', delay: retraso };
    gsap.to(caja.a, { yPercent: -100, ...opciones });
    gsap.fromTo(caja.b, { yPercent: 100 }, {
      yPercent: 0,
      ...opciones,
      onComplete: () => {
        // Se cambian los papeles: la que ha entrado pasa a ser la visible.
        [caja.a, caja.b] = [caja.b, caja.a];
        gsap.set(caja.b, { yPercent: 100 });
        caja.girando = false;
      }
    });
  };

  const ciclo = () => {
    if (visible && !document.hidden && !movimiento.pausado) {
      const libres = cajas.filter((c) => !c.girando).sort(() => Math.random() - 0.5);
      const cuantas = Math.random() < 0.5 ? 1 : 2;
      libres.slice(0, cuantas).forEach((c, i) => girar(c, i * (0.15 + Math.random() * 0.15)));
    }
    gsap.delayedCall(3 + Math.random(), ciclo);   // cada 3–4 s
  };
  // Con «Pausar animaciones» el ciclo sigue contando pero no gira nada.
  gsap.delayedCall(1.5, ciclo);
}
