// ═══════════════════════════════════════════════════════════════
// PUNTO DE ENTRADA
// Cada parte de la web es un módulo. Aquí se arrancan uno a uno,
// cada uno en su try/catch: si uno falla, los demás siguen.
// GSAP, ScrollTrigger y Lenis se cargan antes (js/vendor/, con defer)
// y quedan como variables globales.
// ═══════════════════════════════════════════════════════════════

import { iniciarMovimiento, avisarCargaLista } from './motion.js';
import { iniciarCarga } from './loader.js';
import { iniciarHero } from './hero.js';
import { iniciarReveal } from './reveal.js';
import { iniciarNav } from './nav.js';
import { iniciarFormulario } from './form.js';
import { iniciarCertificados } from './certs.js';
import { iniciarFichas } from './fichas.js';

const html = document.documentElement;

// Avisa al script del <head> de que los módulos han cargado: así no
// salta la red de seguridad que lo enseña todo sin animar.
html.classList.add('js-ok');

// ¿La persona ha pedido menos movimiento en su sistema?
const sinMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const contexto = { sinMovimiento };

// Qué hacer si un módulo falla, para que nada se quede oculto.
const planB = {
  carga() {
    document.querySelector('.carga')?.remove();
    html.classList.remove('con-carga');
    [...document.body.children].forEach((el) => { el.inert = false; });
    avisarCargaLista();
  },
  hero() {
    html.classList.remove('movimiento');
    window.gsap?.set('.hero-name .letra, .hero-sube', { clearProps: 'all' });
  },
  reveal() {
    document.querySelectorAll('[data-reveal]').forEach((n) => n.classList.add('is-visible'));
  }
};

function arrancar(nombre, fn) {
  try {
    fn(contexto);
  } catch (error) {
    console.error(`[portfolio] fallo en «${nombre}»:`, error);
    planB[nombre]?.();
  }
}

arrancar('movimiento', iniciarMovimiento);
arrancar('hero', iniciarHero);      // prepara la portada y espera a la carga
arrancar('carga', iniciarCarga);
arrancar('reveal', iniciarReveal);
arrancar('nav', iniciarNav);
arrancar('formulario', iniciarFormulario);
arrancar('certificados', iniciarCertificados);
arrancar('fichas', iniciarFichas);
arrancar('año', () => {
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
});
