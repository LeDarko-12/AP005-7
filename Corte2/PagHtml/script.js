const USUARIO = 'LeDarko-12';
const REPO = 'AP005-7';
const API_BASE = `https://api.github.com/repos/${USUARIO}/${REPO}/contents`;

document.addEventListener('DOMContentLoaded', () => {
  const contenedor = document.getElementById('contenedor-repo');
  const navCortes = document.getElementById('nav-cortes');
  
  // Referencias del modal
  const modal = document.getElementById('modal-detalle');
  const modalTitulo = document.getElementById('modal-titulo');
  const modalCuerpo = document.getElementById('modal-cuerpo');
  const btnCerrar = document.getElementById('btn-cerrar-modal');
  const btnCerrarX = document.getElementById('btn-cerrar-x');

  btnCerrar.addEventListener('click', () => modal.close());
  btnCerrarX.addEventListener('click', () => modal.close());
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.close();
  });

  // Función para abrir el modal y listar los archivos reales dentro de una subcarpeta
  async function verArchivosCarpeta(rutaCarpeta) {
    modalTitulo.textContent = rutaCarpeta;
    modalCuerpo.innerHTML = `<p><i class='bx bx-loader-alt bx-spin'></i> Leyendo archivos...</p>`;
    modal.showModal();

    try {
      const resp = await fetch(`${API_BASE}/${rutaCarpeta}`);
      if (!resp.ok) throw new Error('No se pudo leer el contenido');
      const items = await resp.json();

      if (items.length === 0) {
        modalCuerpo.innerHTML = `<p>Esta carpeta está vacía.</p>`;
        return;
      }

      const listaHTML = items.map(item => {
        const icono = item.type === 'dir' ? 'bx-folder' : 'bx-file';
        return `<li><i class='bx ${icono}'></i> <span>${item.name}</span></li>`;
      }).join('');

      modalCuerpo.innerHTML = `<ul class="file-list">${listaHTML}</ul>`;
    } catch (error) {
      modalCuerpo.innerHTML = `<p>Error al obtener los archivos de GitHub.</p>`;
    }
  }

  // Función principal que carga las carpetas del repositorio
  async function cargarRepositorio() {
    try {
      // 1. Obtener contenido de la raíz del repositorio
      const respuestaRaiz = await fetch(API_BASE);
      if (!respuestaRaiz.ok) throw new Error('Error al conectar con GitHub');
      const itemsRaiz = await respuestaRaiz.json();

      // Filtramos solo las carpetas principales (ej. Corte1, Corte2)
      const carpetasPrincipales = itemsRaiz.filter(item => item.type === 'dir');

      if (carpetasPrincipales.length === 0) {
        contenedor.innerHTML = `<div class="loading-state">No se encontraron carpetas en el repositorio.</div>`;
        return;
      }

      // Limpiamos el mensaje de carga
      contenedor.innerHTML = '';

      // 2. Por cada carpeta principal (Corte), obtenemos sus subcarpetas
      for (const corte of carpetasPrincipales) {
        // Agregar enlace al menú de navegación
        const liNav = document.createElement('li');
        liNav.innerHTML = `<a href="#sec-${corte.name}"><i class='bx bx-folder'></i> ${corte.name}</a>`;
        navCortes.appendChild(liNav);

        // Consultar el contenido interno del corte
        const respSub = await fetch(corte.url);
        const itemsInternos = await respSub.json();
        const subcarpetas = itemsInternos.filter(sub => sub.type === 'dir');

        // Crear la sección del corte
        const section = document.createElement('section');
        section.id = `sec-${corte.name}`;
        section.className = 'section-block';

        const tarjetasHTML = subcarpetas.map(sub => `
          <article class="folder-card">
            <div class="folder-top">
              <i class='bx bxs-folder'></i>
              <h3>${sub.name}</h3>
            </div>
            <div class="folder-actions">
              <a href="${sub.html_url}" target="_blank" rel="noopener noreferrer" class="btn-folder">
                <i class='bx bxl-github'></i> Abrir en GitHub
              </a>
              <button class="btn-info" data-ruta="${sub.path}" title="Ver archivos dentro">
                <i class='bx bx-info-circle'></i>
              </button>
            </div>
          </article>
        `).join('');

        section.innerHTML = `
          <div class="section-header">
            <div class="section-title-group">
              <h2><i class='bx bx-folder-open'></i> ${corte.name}</h2>
              <span class="count-badge">${subcarpetas.length} ${subcarpetas.length === 1 ? 'carpeta' : 'carpetas'}</span>
            </div>
            <a href="${corte.html_url}" target="_blank" rel="noopener noreferrer" class="btn-secondary">
              <i class='bx bxl-github'></i> Ver ${corte.name}
            </a>
          </div>
          <div class="folders-grid">
            ${tarjetasHTML || '<p>No hay subcarpetas aún.</p>'}
          </div>
        `;

        contenedor.appendChild(section);
      }

      // 3. Asignar eventos a todos los botones de información generados
      document.querySelectorAll('.btn-info').forEach(btn => {
        btn.addEventListener('click', () => {
          verArchivosCarpeta(btn.dataset.ruta);
        });
      });

    } catch (error) {
      contenedor.innerHTML = `
        <div class="error-state">
          <i class='bx bx-error-circle'></i> No se pudieron cargar las carpetas desde GitHub. Verifica tu conexión o el límite de la API.
        </div>
      `;
    }
  }

  cargarRepositorio();
});
