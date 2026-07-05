/**
 * OYE 99.9 - ANIMATIONS.JS
 * Animaciones y efectos visuales del sitio público.
 * NO contiene lógica de backend ni conexión a Firebase.
 * El archivo main.js (futuro) contendrá la lógica central.
 *
 * Funcionalidades incluidas:
 *  - Scroll reveal (animaciones al hacer scroll)
 *  - Navegación suave y active state
 *  - Header con efecto scroll
 *  - Menú móvil toggle
 *  - Timeline horizontal con scroll por flechas
 *  - Indicador EN VIVO con pulso
 *  - Botón "Volver arriba"
 *  - Marquee de patrocinadores (pausa al hover)
 *  - Efectos hover en tarjetas glass
 *  - Partículas decorativas en el hero
 */

document.addEventListener('DOMContentLoaded', () => {

    /* ================================================================ */
    /* REFERENCIAS AL DOM                                                */
    /* ================================================================ */
    const header = document.getElementById('header');
    const headerToggle = document.getElementById('headerToggle');
    const headerNav = document.getElementById('headerNav');
    const scrollTopBtn = document.getElementById('scrollTop');
    const timelineTrack = document.getElementById('timelineTrack');
    const timelineLeft = document.getElementById('timelineLeft');
    const timelineRight = document.getElementById('timelineRight');
    const sponsorsTrack = document.getElementById('sponsorsTrack');
    const heroParticles = document.getElementById('heroParticles');
    const allNavLinks = document.querySelectorAll('[data-scroll]');
    const revealElements = document.querySelectorAll(
        '.upcoming-card, .host-card, .news-card, .connect__form, .sponsors__item, .hero__stat, .contact-form__group, .directory-card'
    );

    /* ================================================================ */
    /* 1. SCROLL REVEAL (Intersection Observer)                         */
    /* ================================================================ */
    const revealObserverOptions = {
        root: null,
        rootMargin: '0px 0px -60px 0px',
        threshold: 0.1
    };

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal--visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, revealObserverOptions);

    // Asignar clases y observar
    revealElements.forEach((el, index) => {
        el.classList.add('reveal');
        // Delay escalonado para elementos en grid
        const delayClass = `reveal--delay-${(index % 5) + 1}`;
        el.classList.add(delayClass);
        revealObserver.observe(el);
    });

    /* ================================================================ */
    /* 2. HEADER SCROLL EFFECT                                          */
    /* ================================================================ */
    let lastScrollY = 0;

    const handleHeaderScroll = () => {
        const currentScrollY = window.scrollY;

        if (currentScrollY > 80) {
            header.classList.add('header--scrolled');
        } else {
            header.classList.remove('header--scrolled');
        }

        lastScrollY = currentScrollY;
    };

    /* ================================================================ */
    /* 3. ACTIVE NAV LINK (SPY SCROLL)                                  */
    /* ================================================================ */
    const sections = [];
    const navLinksArr = Array.from(allNavLinks);

    navLinksArr.forEach(link => {
        const targetId = link.getAttribute('href')?.replace('#', '');
        if (targetId) {
            const section = document.getElementById(targetId);
            if (section) {
                sections.push({ id: targetId, el: section });
            }
        }
    });

    const updateActiveLink = () => {
        const scrollPos = window.scrollY + 120;

        let currentSection = sections[0]?.id || '';

        sections.forEach(({ id, el }) => {
            const top = el.offsetTop;
            const bottom = top + el.offsetHeight;

            if (scrollPos >= top && scrollPos < bottom) {
                currentSection = id;
            }
        });

        document.querySelectorAll('.header__link').forEach(link => {
            const href = link.getAttribute('href')?.replace('#', '');
            link.classList.toggle('active', href === currentSection);
        });
    };

    /* ================================================================ */
    /* 4. SMOOTH SCROLL PARA NAV LINKS                                  */
    /* ================================================================ */
    allNavLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href')?.replace('#', '');
            const target = document.getElementById(targetId);
            if (target) {
                const headerHeight = header.offsetHeight;
                const targetPosition = target.offsetTop - headerHeight - 16;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });

                // Cerrar menú móvil si está abierto
                closeMobileMenu();
            }
        });
    });

    /* ================================================================ */
    /* 5. MENÚ MÓVIL TOGGLE                                             */
    /* ================================================================ */
    let mobileMenuOpen = false;
    let overlayEl = null;

    const createOverlay = () => {
        overlayEl = document.createElement('div');
        overlayEl.className = 'header__overlay';
        overlayEl.setAttribute('aria-hidden', 'true');
        document.body.appendChild(overlayEl);

        overlayEl.addEventListener('click', closeMobileMenu);
    };

    const openMobileMenu = () => {
        mobileMenuOpen = true;
        headerNav.classList.add('header__nav--open');
        headerToggle.classList.add('active');
        headerToggle.setAttribute('aria-expanded', 'true');
        headerToggle.setAttribute('aria-label', 'Cerrar menú');
        if (overlayEl) overlayEl.classList.add('header__overlay--visible');
        document.body.style.overflow = 'hidden';
    };

    const closeMobileMenu = () => {
        mobileMenuOpen = false;
        headerNav.classList.remove('header__nav--open');
        headerToggle.classList.remove('active');
        headerToggle.setAttribute('aria-expanded', 'false');
        headerToggle.setAttribute('aria-label', 'Abrir menú');
        if (overlayEl) overlayEl.classList.remove('header__overlay--visible');
        document.body.style.overflow = '';
    };

    const toggleMobileMenu = () => {
        if (mobileMenuOpen) {
            closeMobileMenu();
        } else {
            openMobileMenu();
        }
    };

    createOverlay();
    headerToggle.addEventListener('click', toggleMobileMenu);

    // Cerrar menú al presionar Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileMenuOpen) {
            closeMobileMenu();
        }
    });

    /* ================================================================ */
    /* 6. BOTÓN VOLVER ARRIBA                                           */
    /* ================================================================ */
    const toggleScrollTop = () => {
        if (window.scrollY > 500) {
            scrollTopBtn.classList.add('scroll-top--visible');
        } else {
            scrollTopBtn.classList.remove('scroll-top--visible');
        }
    };

    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    /* ================================================================ */
    /* 7. TIMELINE HORIZONTAL - FLECHAS DE SCROLL                       */
    /* ================================================================ */
    const scrollTimeline = (direction) => {
        const scrollAmount = 250;
        const currentScroll = timelineTrack.scrollLeft;
        const targetScroll = direction === 'left'
            ? currentScroll - scrollAmount
            : currentScroll + scrollAmount;

        timelineTrack.scrollTo({
            left: targetScroll,
            behavior: 'smooth'
        });
    };

    timelineLeft?.addEventListener('click', () => scrollTimeline('left'));
    timelineRight?.addEventListener('click', () => scrollTimeline('right'));

    // Scroll horizontal del timeline con rueda del mouse
    timelineTrack?.addEventListener('wheel', (e) => {
        if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return; // Respetar scroll horizontal nativo
        e.preventDefault();
        timelineTrack.scrollLeft += e.deltaY;
    }, { passive: false });

    /* ================================================================ */
    /* 8. CLICK EN ITEMS DEL TIMELINE                                   */
    /* ================================================================ */
    const timelineItems = document.querySelectorAll('.timeline__item');
    timelineItems.forEach(item => {
        item.addEventListener('click', () => {
            // Remover activo de todos
            timelineItems.forEach(i => i.classList.remove('timeline__item--active'));
            // Activar el clickeado
            item.classList.add('timeline__item--active');
            // Centrar el item en el track
            const trackWidth = timelineTrack.offsetWidth;
            const itemLeft = item.offsetLeft;
            const itemWidth = item.offsetWidth;
            const scrollTarget = itemLeft - (trackWidth / 2) + (itemWidth / 2);
            timelineTrack.scrollTo({ left: scrollTarget, behavior: 'smooth' });

            // Actualizar nombre del programa actual en el hero
            const title = item.querySelector('.timeline__card-title')?.textContent;
            const host = item.querySelector('.timeline__card-host')?.textContent;
            const time = item.querySelector('.timeline__time')?.textContent;
            const currentShowEl = document.getElementById('currentShow');
            const nowPlayingTime = document.querySelector('.hero__now-playing-time');

            if (currentShowEl && title && host) {
                currentShowEl.textContent = `${title} con ${host}`;
            }
            if (nowPlayingTime && time) {
                // Buscar el siguiente tiempo para el rango
                const allTimes = Array.from(timelineItems).map(i => i.querySelector('.timeline__time')?.textContent);
                const currentIndex = allTimes.indexOf(time);
                const nextTime = allTimes[currentIndex + 1] || '...';
                nowPlayingTime.textContent = `${time} - ${nextTime}`;
            }
        });
    });

    /* ================================================================ */
    /* 9. MARQUEE DE PATROCINADORES - PAUSA AL HOVER                    */
    /* ================================================================ */
    if (sponsorsTrack) {
        sponsorsTrack.addEventListener('mouseenter', () => {
            sponsorsTrack.style.animationPlayState = 'paused';
        });

        sponsorsTrack.addEventListener('mouseleave', () => {
            sponsorsTrack.style.animationPlayState = 'running';
        });

        // También pausar en focus para accesibilidad
        sponsorsTrack.addEventListener('focusin', () => {
            sponsorsTrack.style.animationPlayState = 'paused';
        });

        sponsorsTrack.addEventListener('focusout', () => {
            sponsorsTrack.style.animationPlayState = 'running';
        });
    }

    /* ================================================================ */
    /* 10. PARTÍCULAS DECORATIVAS EN EL HERO                            */
    /* ================================================================ */
    const createHeroParticles = () => {
        if (!heroParticles) return;

        const particleCount = 35;
        const fragment = document.createDocumentFragment();

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            const size = Math.random() * 3 + 1.5;

            particle.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                border-radius: 50%;
                background: rgba(191, 4, 107, ${Math.random() * 0.5 + 0.15});
                top: ${Math.random() * 100}%;
                left: ${Math.random() * 100}%;
                animation: floatParticle ${Math.random() * 10 + 12}s linear infinite;
                animation-delay: ${Math.random() * 8}s;
            `;

            fragment.appendChild(particle);
        }

        heroParticles.appendChild(fragment);

        // Inyectar keyframes de partículas
        const styleSheet = document.createElement('style');
        styleSheet.textContent = `
            @keyframes floatParticle {
                0% {
                    transform: translateY(0) translateX(0) scale(1);
                    opacity: 0;
                }
                20% {
                    opacity: 1;
                }
                80% {
                    opacity: 0.6;
                }
                100% {
                    transform: translateY(-120px) translateX(${Math.random() > 0.5 ? '' : '-'}40px) scale(0.3);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(styleSheet);
    };

    createHeroParticles();

    /* ================================================================ */
    /* 11. INDICADOR "EN VIVO" - ANIMACIÓN DE PULSO CONTINUA            */
    /* ================================================================ */
    const liveDot = document.querySelector('.hero__live-dot');
    if (liveDot) {
        // La animación CSS ya maneja el pulso, pero añadimos un pequeño
        // efecto adicional de brillo aleatorio para más realismo
        setInterval(() => {
            const randomScale = 0.85 + Math.random() * 0.3;
            liveDot.style.transform = `scale(${randomScale})`;
            setTimeout(() => {
                liveDot.style.transform = 'scale(1)';
            }, 150);
        }, 2000);
    }

    /* ================================================================ */
    /* 12. EFECTO GLASS EN TARJETAS - MOVIMIENTO SUTIL CON MOUSE        */
    /* ================================================================ */
    const glassCards = document.querySelectorAll('.glass-card');

    glassCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / centerY * -4;
            const rotateY = (x - centerX) / centerX * 4;

            card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-2px)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) translateY(0)';
            card.style.transition = 'transform 0.5s ease';
            setTimeout(() => {
                card.style.transition = '';
            }, 500);
        });
    });

    /* ================================================================ */
    /* 13. CONTADOR REGRESIVO PARA PRÓXIMO PROGRAMA (SIMULADO)          */
    /* ================================================================ */
    const countdownEl = document.getElementById('nextShowCountdown');
    if (countdownEl) {
        let minutes = 22;
        const updateCountdown = () => {
            if (minutes <= 0) {
                minutes = 22;
            }
            countdownEl.textContent = `${minutes} min`;
            minutes--;
        };

        // Actualizar cada minuto
        updateCountdown();
        setInterval(updateCountdown, 60000);
    }

    /* ================================================================ */
    /* 14. CONTADOR DE OYENTES (SIMULADO)                               */
    /* ================================================================ */
    const listenerCountEl = document.getElementById('listenerCount');
    if (listenerCountEl) {
        const baseListeners = 1247;

        const updateListeners = () => {
            const variation = Math.floor(Math.random() * 60) - 30;
            const newCount = baseListeners + variation;
            listenerCountEl.textContent = newCount.toLocaleString();
        };

        updateListeners();
        setInterval(updateListeners, 15000);
    }

    /* ================================================================ */
    /* 15. SCROLL LISTENER UNIFICADO                                    */
    /* ================================================================ */
    window.addEventListener('scroll', () => {
        handleHeaderScroll();
        updateActiveLink();
        toggleScrollTop();
    }, { passive: true });

    // Ejecutar al cargar
    handleHeaderScroll();
    updateActiveLink();
    toggleScrollTop();

    /* ================================================================ */
    /* 16. REDIMENSIONAR - AJUSTES                                      */
    /* ================================================================ */
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            // Cerrar menú móvil en resize a escritorio
            if (window.innerWidth > 768 && mobileMenuOpen) {
                closeMobileMenu();
            }
        }, 200);
    });

    /* ================================================================ */
    /* 17. BOTONES DEL REPRODUCTOR: COMPARTIR, ME GUSTA, PANTALLA COMPLETA */
    /* ================================================================ */
    const shareBtn      = document.getElementById('shareBtn');
    const likeBtn       = document.getElementById('likeBtn');
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    const livePlayerEl  = document.getElementById('livePlayer');

    // Compartir
    if (shareBtn) {
        shareBtn.addEventListener('click', async () => {
            const shareData = {
                title: 'Oye 99.9 — Radio en Vivo',
                text: '¡Escucha Oye 99.9 en vivo!',
                url: window.location.href
            };
            if (navigator.share) {
                try { await navigator.share(shareData); } catch (_) {}
            } else {
                try {
                    await navigator.clipboard.writeText(window.location.href);
                    const icon = shareBtn.querySelector('i');
                    icon.className = 'ri-check-line';
                    shareBtn.title = '¡Enlace copiado!';
                    setTimeout(() => {
                        icon.className = 'ri-share-forward-line';
                        shareBtn.title = 'Compartir';
                    }, 2000);
                } catch (_) {}
            }
        });
    }

    // Me gusta
    let liked = localStorage.getItem('oye999_liked') === 'true';
    function actualizarEstadoLike() {
        if (!likeBtn) return;
        const icon = likeBtn.querySelector('i');
        if (liked) {
            icon.className = 'ri-heart-fill';
            likeBtn.classList.add('liked');
            likeBtn.title = 'Quitar me gusta';
        } else {
            icon.className = 'ri-heart-line';
            likeBtn.classList.remove('liked');
            likeBtn.title = 'Me gusta';
        }
    }
    if (likeBtn) {
        actualizarEstadoLike();
        likeBtn.addEventListener('click', () => {
            liked = !liked;
            localStorage.setItem('oye999_liked', liked);
            actualizarEstadoLike();
            likeBtn.classList.add('like-pop');
            likeBtn.addEventListener('animationend', () => likeBtn.classList.remove('like-pop'), { once: true });
        });
    }

    // Pantalla completa (compatible con móvil)
    if (fullscreenBtn && livePlayerEl) {
        let isFakeFS = false;

        function actualizarIconoFS(activo) {
            const icon = fullscreenBtn.querySelector('i');
            icon.className = activo ? 'ri-fullscreen-exit-line' : 'ri-fullscreen-line';
            fullscreenBtn.title = activo ? 'Salir de pantalla completa' : 'Pantalla completa';
        }

        function activarFakeFullscreen() {
            isFakeFS = true;
            livePlayerEl.classList.add('fake-fullscreen');
            document.body.classList.add('fs-active');
            actualizarIconoFS(true);
            if (screen.orientation && screen.orientation.lock) {
                screen.orientation.lock('landscape').catch(() => {});
            }
        }

        function salirFakeFullscreen() {
            isFakeFS = false;
            livePlayerEl.classList.remove('fake-fullscreen');
            document.body.classList.remove('fs-active');
            actualizarIconoFS(false);
            if (screen.orientation && screen.orientation.unlock) {
                screen.orientation.unlock();
            }
        }

        function estaEnFS() {
            return !!(document.fullscreenElement ||
                      document.webkitFullscreenElement ||
                      document.mozFullScreenElement ||
                      isFakeFS);
        }

        fullscreenBtn.addEventListener('click', () => {
            if (estaEnFS()) {
                // Salir
                if (isFakeFS) {
                    salirFakeFullscreen();
                } else {
                    (document.exitFullscreen ||
                     document.webkitExitFullscreen ||
                     document.mozCancelFullScreen ||
                     document.msExitFullscreen).call(document);
                }
                return;
            }

            // Intentar fullscreen nativo (con prefijos)
            const requestFS = livePlayerEl.requestFullscreen ||
                              livePlayerEl.webkitRequestFullscreen ||
                              livePlayerEl.mozRequestFullScreen ||
                              livePlayerEl.msRequestFullscreen;

            if (requestFS) {
                requestFS.call(livePlayerEl).catch(() => activarFakeFullscreen());
            } else {
                // iOS Safari: intentar en el video primero
                const video = document.getElementById('liveVideoElement');
                if (video && video.webkitEnterFullscreen && video.style.display !== 'none') {
                    video.webkitEnterFullscreen();
                } else {
                    activarFakeFullscreen();
                }
            }
        });

        // Detectar salida nativa (Escape, botón del SO, etc.)
        ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange'].forEach(ev => {
            document.addEventListener(ev, () => {
                if (!document.fullscreenElement && !document.webkitFullscreenElement) {
                    actualizarIconoFS(false);
                } else {
                    actualizarIconoFS(true);
                }
            });
        });

        // Tecla Escape para fake fullscreen
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && isFakeFS) salirFakeFullscreen();
        });
    }

    console.log('%c🎙️ Oye 99.9 %c| %cSitio Público listo %c✓',
        'color: #D989B5; font-weight: bold; font-size: 16px;',
        'color: #fff;',
        'color: #F2F2F2;',
        'color: #22c55e;'
    );
    console.log('%cAnimaciones cargadas. Conecta main.js para la lógica central.',
        'color: #737373; font-size: 11px;'
    );
});