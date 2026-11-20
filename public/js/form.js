// ═══════════════════════════════════════════════════════════════
// FORMULARIO DE CONTACTO: validación accesible
// Cada error va pegado a su campo (aria-describedby), el campo se
// marca como inválido (aria-invalid) y el foco salta al primero que
// falla (WCAG 3.3.1). En el paso 7 se añade el envío sin recargar y
// el botón que pasa a «Enviado».
// ═══════════════════════════════════════════════════════════════

const CAMPOS = [
  { id: 'nombre',  msg: 'Por favor, introduce tu nombre.' },
  { id: 'email',   msg: 'Por favor, introduce tu email.' },
  { id: 'mensaje', msg: 'Por favor, escribe un mensaje.' }
];

function limpiarError(campo, contenedor) {
  contenedor.querySelector('.field-error')?.remove();
  campo.removeAttribute('aria-invalid');
  campo.removeAttribute('aria-describedby');
}

function ponerError(campo, contenedor, texto) {
  const id = campo.id + '-error';
  const span = document.createElement('span');
  span.className = 'field-error';
  span.id = id;
  span.textContent = texto;
  contenedor.appendChild(span);
  campo.setAttribute('aria-invalid', 'true');
  campo.setAttribute('aria-describedby', id);
}

export function iniciarFormulario() {
  const form = document.querySelector('.contact-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    let primerFallo = null;

    CAMPOS.forEach(({ id, msg }) => {
      const input = document.getElementById(id);
      if (!input) return;
      const contenedor = input.parentElement;
      limpiarError(input, contenedor);

      const vacio = !input.value.trim();
      const emailMal = id === 'email' && !vacio &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value);

      if (vacio || emailMal) {
        ponerError(input, contenedor, emailMal ? 'Introduce un email válido.' : msg);
        primerFallo ??= input;
      }
    });

    const rgpd = document.getElementById('rgpd');
    if (rgpd) {
      const caja = rgpd.closest('.form-rgpd');
      limpiarError(rgpd, caja);
      if (!rgpd.checked) {
        ponerError(rgpd, caja, 'Debes aceptar la política de privacidad.');
        primerFallo ??= rgpd;
      }
    }

    if (primerFallo) {
      e.preventDefault();
      primerFallo.focus();
    }
  });

  // El error se borra en cuanto se corrige el campo.
  form.querySelectorAll('input, textarea').forEach((input) => {
    input.addEventListener('input', () => {
      const contenedor = input.type === 'checkbox' ? input.closest('.form-rgpd') : input.parentElement;
      if (contenedor) limpiarError(input, contenedor);
    });
  });
}
