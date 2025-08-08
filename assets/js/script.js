// Portfolio - José Guizado | Analista de Sistemas
// Script principal para funcionalidades del portfolio

document.addEventListener('DOMContentLoaded', function() {
    console.log('Portfolio cargado correctamente');

    // Suprimir errores específicos de Power BI y Application Insights
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;
    
    // Lista de errores comunes de Power BI que podemos ignorar
    const ignoredErrors = [
        'Permissions policy violation: unload is not allowed',
        'Access to XMLHttpRequest at \'https://dc.services.visualstudio.com/v2/track\'',
        'CORS policy: Response to preflight request',
        'POST https://dc.services.visualstudio.com/v2/track net::ERR_FAILED'
    ];
    
    console.error = function(...args) {
        const message = args.join(' ');
        if (!ignoredErrors.some(error => message.includes(error))) {
            originalConsoleError.apply(console, args);
        }
    };
    
    console.warn = function(...args) {
        const message = args.join(' ');
        if (!ignoredErrors.some(error => message.includes(error))) {
            originalConsoleWarn.apply(console, args);
        }
    };

    // Manejo global de errores no capturados
    window.addEventListener('error', function(event) {
        // Filtrar errores de recursos externos (Power BI, CDNs, etc.)
        if (event.filename && (
            event.filename.includes('powerbi.com') ||
            event.filename.includes('visualstudio.com') ||
            event.filename.includes('reportembed') ||
            event.filename.includes('application-insights')
        )) {
            event.preventDefault();
            return true;
        }
        
        // Filtrar mensajes específicos de Power BI
        if (event.message && ignoredErrors.some(error => event.message.includes(error))) {
            event.preventDefault();
            return true;
        }
    });

    // Manejo de errores de recursos (CSS, JS, imágenes que fallan)
    window.addEventListener('unhandledrejection', function(event) {
        const reason = event.reason?.message || event.reason || '';
        if (ignoredErrors.some(error => reason.includes(error))) {
            event.preventDefault();
        }
    });

    // Funcionalidad de pantalla completa verdadera para el modal del dashboard
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    const exitFullscreenBtn = document.getElementById('exitFullscreenBtn');
    const fullscreenOverlay = document.getElementById('fullscreenOverlay');
    const powerBIFrame = document.getElementById('powerBIFrame');
    const fullscreenFrame = document.getElementById('fullscreenFrame');
    const modal = document.getElementById('staticBackdrop');
    
    if (fullscreenBtn && fullscreenOverlay && powerBIFrame && fullscreenFrame) {
        // Función para entrar en pantalla completa verdadera
        fullscreenBtn.addEventListener('click', function() {
            try {
                // Copiar la URL del iframe principal al iframe de pantalla completa
                fullscreenFrame.src = powerBIFrame.src;
                
                // Mostrar el overlay con animación
                fullscreenOverlay.style.display = 'block';
                fullscreenOverlay.classList.add('entering');
                
                // Ocultar el scroll del body
                document.body.style.overflow = 'hidden';
                
                // Cambiar a modo de pantalla completa del navegador si está disponible
                if (fullscreenOverlay.requestFullscreen) {
                    fullscreenOverlay.requestFullscreen().catch(err => {
                        console.log('Fullscreen API no disponible, usando overlay personalizado');
                    });
                } else if (fullscreenOverlay.webkitRequestFullscreen) {
                    fullscreenOverlay.webkitRequestFullscreen();
                } else if (fullscreenOverlay.msRequestFullscreen) {
                    fullscreenOverlay.msRequestFullscreen();
                }
                
                console.log('Pantalla completa activada');
            } catch (error) {
                console.log('Error al activar pantalla completa:', error);
            }
        });

        // Función para salir de pantalla completa
        function exitFullscreen() {
            fullscreenOverlay.classList.remove('entering');
            fullscreenOverlay.classList.add('exiting');
            
            // Salir del modo fullscreen del navegador
            if (document.exitFullscreen) {
                document.exitFullscreen().catch(() => {});
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
            
            // Restaurar el scroll del body
            document.body.style.overflow = '';
            
            setTimeout(() => {
                fullscreenOverlay.style.display = 'none';
                fullscreenOverlay.classList.remove('exiting');
                fullscreenFrame.src = '';
            }, 300);
            
            console.log('Pantalla completa desactivada');
        }

        // Event listener para el botón de salir
        exitFullscreenBtn.addEventListener('click', exitFullscreen);
        
        // Salir con tecla ESC
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && fullscreenOverlay.style.display === 'block') {
                exitFullscreen();
            }
        });

        // Manejar cambios de estado de pantalla completa del navegador
        document.addEventListener('fullscreenchange', function() {
            if (!document.fullscreenElement && fullscreenOverlay.style.display === 'block') {
                exitFullscreen();
            }
        });
        
        document.addEventListener('webkitfullscreenchange', function() {
            if (!document.webkitFullscreenElement && fullscreenOverlay.style.display === 'block') {
                exitFullscreen();
            }
        });
        
        document.addEventListener('msfullscreenchange', function() {
            if (!document.msFullscreenElement && fullscreenOverlay.style.display === 'block') {
                exitFullscreen();
            }
        });
    }

    // Navegación suave entre secciones
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Actualizar clase activa en navegación
                navLinks.forEach(navLink => navLink.classList.remove('active'));
                this.classList.add('active');
            }
        });
    });

    // Manejo mejorado del iframe de Power BI
    const powerBIModal = document.getElementById('staticBackdrop');
    if (powerBIModal) {
        powerBIModal.addEventListener('shown.bs.modal', function () {
            const iframe = this.querySelector('#powerBIFrame');
            if (iframe) {
                // Verificar si ya tiene los parámetros necesarios para navegación completa
                const currentSrc = iframe.src;
                if (currentSrc && !currentSrc.includes('navContentPaneEnabled=true')) {
                    // Agregar parámetros para habilitar navegación completa entre páginas
                    const separator = currentSrc.includes('?') ? '&' : '?';
                    iframe.src = currentSrc + separator + 'navContentPaneEnabled=true&filterPaneEnabled=true&showTabs=true';
                }
                
                // Manejar errores de carga del iframe
                iframe.addEventListener('error', function() {
                    console.log('Error al cargar el dashboard de Power BI');
                });
                
                iframe.addEventListener('load', function() {
                    console.log('Dashboard de Power BI cargado correctamente con navegación completa');
                });
            }
        });
    }

    // Observer de scroll inteligente para navegación activa
    const sections = document.querySelectorAll('section[id]');
    const observerOptions = {
        root: null,
        rootMargin: '-20% 0px -80% 0px',
        threshold: 0
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        observer.observe(section);
    });

    // Prevenir errores de tracking y analytics que pueden causar CORS
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
        return originalFetch.apply(this, args).catch(error => {
            if (error.message && error.message.includes('CORS')) {
                console.warn('Solicitud CORS bloqueada (esto es normal):', error.message);
                return Promise.resolve(new Response('{}', { status: 200 }));
            }
            throw error;
        });
    };

    // Funcionalidad de botones flotantes
    initFloatingButtons();
});

// Mostrar/ocultar botón de scroll to top
window.addEventListener('scroll', function() {
    const scrollTopBtn = document.getElementById('scrollToTopBtn');
    if (scrollTopBtn) {
        if (window.scrollY > 300) {
            scrollTopBtn.classList.add('show');
        } else {
            scrollTopBtn.classList.remove('show');
        }
    }
});

// Función para scroll to top suave
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Función para alternar tema
function toggleTheme() {
    const body = document.body;
    const themeIcon = document.querySelector('#themeToggleBtn i');
    
    console.log('Botón de tema clickeado');
    body.classList.toggle('dark-theme');
    console.log('Clase dark-theme:', body.classList.contains('dark-theme'));
    
    // Cambiar icono según el tema
    if (body.classList.contains('dark-theme')) {
        themeIcon.className = 'fas fa-sun';
        localStorage.setItem('theme', 'dark');
        console.log('Tema cambiado a oscuro');
    } else {
        themeIcon.className = 'fas fa-moon';
        localStorage.setItem('theme', 'light');
        console.log('Tema cambiado a claro');
    }
}

// Inicializar botones flotantes
function initFloatingButtons() {
    // Cargar tema guardado
    const savedTheme = localStorage.getItem('theme');
    const themeIcon = document.querySelector('#themeToggleBtn i');
    
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        if (themeIcon) themeIcon.className = 'fas fa-sun';
    } else {
        if (themeIcon) themeIcon.className = 'fas fa-moon';
    }
    
    // Event listeners para los botones flotantes
    const scrollTopBtn = document.getElementById('scrollToTopBtn');
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    
    if (scrollTopBtn) {
        scrollTopBtn.addEventListener('click', scrollToTop);
    }
    
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', toggleTheme);
    }

    // Año dinámico en el footer
    const currentYearElement = document.getElementById('currentYear');
    if (currentYearElement) {
        currentYearElement.textContent = new Date().getFullYear();
    }
}