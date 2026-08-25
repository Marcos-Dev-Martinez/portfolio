# Portfolio — Marcos Martínez

Mi portfolio personal como desarrollador web. Una sola página con las secciones de perfil, tecnologías, proyectos y contacto, más tres páginas legales.

**En vivo:** https://marcosmartinez-portfolio.web.app

## Tecnologías

- HTML5 semántico
- CSS3 (Grid, Flexbox, propiedades personalizadas)
- JavaScript (sin frameworks ni dependencias)
- Firebase Hosting
- Formspree para el formulario

## Qué tiene de particular

- **Accesibilidad WCAG 2.1 AA**: enlace de salto al contenido, `<main>`, foco visible, contraste mínimo de 4,8:1, errores de formulario con `aria-invalid` y `aria-describedby`, y respeto a `prefers-reduced-motion`.
- **Cero peticiones a terceros**: las tipografías se sirven desde el propio dominio en lugar de Google Fonts, así el navegador del visitante no comunica su IP a nadie.
- **Funciona sin JavaScript**: las animaciones de entrada solo se aplican si JS está activo, de modo que un error de script nunca deja la página en blanco.
- **RGPD**: aviso legal, política de privacidad y política de cookies, con el encargado del tratamiento y la transferencia internacional declarados.

## Estructura

```
firebase.json     Configuración de Firebase Hosting y cabeceras de caché
.firebaserc       A qué proyecto de Firebase se despliega
public/           Todo lo que se publica
```

## Cómo desplegarlo

```bash
firebase deploy
```

---

Hecho por **Marcos Martínez** — desarrollador web en Valencia.
