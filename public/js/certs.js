// ═══════════════════════════════════════════════════════════════
// CERTIFICADOS QUE CADUCAN
// Enseñar como vigente uno caducado sería faltar a la verdad. Desde
// el día siguiente a data-caduca, el texto pasa a «Caducó el…», la
// tarjeta se apaga y baja al final. Para renovarlo, cambia las fechas
// en el HTML.
// ═══════════════════════════════════════════════════════════════

export function iniciarCertificados() {
  const d = new Date();
  const hoy = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  document.querySelectorAll('[data-caduca]').forEach((el) => {
    // Las fechas AAAA-MM-DD se pueden comparar como texto.
    if (hoy <= el.dataset.caduca) return;
    const fecha = el.querySelector('time');
    el.textContent = 'Caducó el ';
    if (fecha) el.appendChild(fecha);
    const tarjeta = el.closest('.cert-card');
    if (!tarjeta) return;
    tarjeta.classList.add('cert-caducado');
    const li = tarjeta.closest('li');
    li?.parentNode?.appendChild(li);
  });
}
