// SPA Navigation Logic
let calculadorasScriptPromise = null;
const MOBILE_MENU_TRANSITION_MS = 320;
const MOBILE_MENU_EASING = 'cubic-bezier(0.22, 1, 0.36, 1)';

function ensureCalculadorasScriptLoaded() {
    if (typeof window.calcularSueldoNeto === 'function') return;

    const scriptSrc = window.__TB_CALCULADORAS_SRC;
    if (!scriptSrc || calculadorasScriptPromise) return;

    calculadorasScriptPromise = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = scriptSrc;
        script.async = true;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

function ensureLazyView(viewId) {
    const viewDomId = `view-${viewId}`;
    let section = document.getElementById(viewDomId);

    if (section) {
        if (viewId === 'calculadoras') ensureCalculadorasScriptLoaded();
        return section;
    }

    const template = document.getElementById(`template-view-${viewId}`);
    const mainContent = document.getElementById('main-content');
    if (!template || !mainContent || !template.content) return null;

    const fragment = template.content.cloneNode(true);
    mainContent.appendChild(fragment);
    section = document.getElementById(viewDomId);

    // Template is no longer needed after first hydration.
    template.remove();

    if (viewId === 'calculadoras') ensureCalculadorasScriptLoaded();
    return section;
}

function runAfterFirstPaint(callback) {
    if ('requestIdleCallback' in window) {
        window.requestIdleCallback(callback, { timeout: 1200 });
    } else {
        setTimeout(callback, 300);
    }
}

function queueMenuAnimationFrame(mobileMenu, callback) {
    if (!mobileMenu) return;

    if (mobileMenu._tbMenuFrameA) cancelAnimationFrame(mobileMenu._tbMenuFrameA);
    if (mobileMenu._tbMenuFrameB) cancelAnimationFrame(mobileMenu._tbMenuFrameB);

    mobileMenu._tbMenuFrameA = requestAnimationFrame(() => {
        mobileMenu._tbMenuFrameA = null;
        mobileMenu._tbMenuFrameB = requestAnimationFrame(() => {
            mobileMenu._tbMenuFrameB = null;
            callback();
        });
    });
}

function navigate(viewId) {
    const ensuredTarget = ensureLazyView(viewId);

    // Hide all views
    document.querySelectorAll('.view-section').forEach(section => {
        section.classList.remove('active');
        // small timeout to allow display none after opacity animation
        setTimeout(() => {
            section.style.display = 'none';
        }, 300);
    });

    // Show target view
    const targetSection = ensuredTarget || document.getElementById(`view-${viewId}`);
    if (targetSection) {
        setTimeout(() => {
            targetSection.style.display = 'block';
            // Let browser paint first, then activate transition without forcing layout sync.
            requestAnimationFrame(() => {
                targetSection.classList.add('active');
            });
        }, 310);
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Close mobile menu if open
    closeMobileMenu();

    // Update URL hash safely without triggering infinite loops
    if (window.location.hash.substring(1) !== viewId) {
        window.location.hash = viewId;
    }
}

function getMobileMenuElement() {
    // Keep backward compatibility with previous id naming.
    return document.getElementById('mob-menu') || document.getElementById('mob-ag');
}

function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function removeMobileMenuTransitionHandler(mobileMenu) {
    if (!mobileMenu || !mobileMenu._tbMenuTransitionHandler) return;
    mobileMenu.removeEventListener('transitionend', mobileMenu._tbMenuTransitionHandler);
    mobileMenu._tbMenuTransitionHandler = null;
}

function clearMobileMenuInlineStyles(mobileMenu) {
    if (!mobileMenu) return;
    if (mobileMenu._tbMenuFrameA) cancelAnimationFrame(mobileMenu._tbMenuFrameA);
    if (mobileMenu._tbMenuFrameB) cancelAnimationFrame(mobileMenu._tbMenuFrameB);
    mobileMenu._tbMenuFrameA = null;
    mobileMenu._tbMenuFrameB = null;
    mobileMenu.style.transition = '';
    mobileMenu.style.overflow = '';
    mobileMenu.style.height = '';
    mobileMenu.style.opacity = '';
    mobileMenu.style.transform = '';
}

function animateMobileMenu(openMenu) {
    const mobileMenu = getMobileMenuElement();
    if (!mobileMenu) return;

    const isHidden = mobileMenu.classList.contains('hidden');
    if (openMenu && !isHidden) return;
    if (!openMenu && isHidden) return;

    removeMobileMenuTransitionHandler(mobileMenu);
    clearMobileMenuInlineStyles(mobileMenu);

    if (prefersReducedMotion()) {
        if (openMenu) mobileMenu.classList.remove('hidden');
        else {
            mobileMenu.classList.add('hidden');
            resetMobileSubmenus();
        }
        return;
    }

    const transitionValue = `height ${MOBILE_MENU_TRANSITION_MS}ms ${MOBILE_MENU_EASING}, opacity ${Math.round(MOBILE_MENU_TRANSITION_MS * 0.85)}ms ease, transform ${MOBILE_MENU_TRANSITION_MS}ms ${MOBILE_MENU_EASING}`;

    if (openMenu) {
        mobileMenu.classList.remove('hidden');
        const targetHeight = mobileMenu.scrollHeight;
        mobileMenu.style.overflow = 'hidden';
        mobileMenu.style.transition = 'none';
        mobileMenu.style.height = '0px';
        mobileMenu.style.opacity = '0';
        mobileMenu.style.transform = 'translateY(-6px)';

        queueMenuAnimationFrame(mobileMenu, () => {
            mobileMenu.style.transition = transitionValue;
            mobileMenu.style.height = `${targetHeight}px`;
            mobileMenu.style.opacity = '1';
            mobileMenu.style.transform = 'translateY(0)';
        });

        const onOpenEnd = (event) => {
            if (event.propertyName !== 'height') return;
            removeMobileMenuTransitionHandler(mobileMenu);
            clearMobileMenuInlineStyles(mobileMenu);
        };
        mobileMenu._tbMenuTransitionHandler = onOpenEnd;
        mobileMenu.addEventListener('transitionend', onOpenEnd);
        return;
    }

    const currentHeight = mobileMenu.scrollHeight;
    mobileMenu.style.overflow = 'hidden';
    mobileMenu.style.transition = 'none';
    mobileMenu.style.height = `${currentHeight}px`;
    mobileMenu.style.opacity = '1';
    mobileMenu.style.transform = 'translateY(0)';

    queueMenuAnimationFrame(mobileMenu, () => {
        mobileMenu.style.transition = transitionValue;
        mobileMenu.style.height = '0px';
        mobileMenu.style.opacity = '0';
        mobileMenu.style.transform = 'translateY(-6px)';
    });

    const onCloseEnd = (event) => {
        if (event.propertyName !== 'height') return;
        removeMobileMenuTransitionHandler(mobileMenu);
        mobileMenu.classList.add('hidden');
        clearMobileMenuInlineStyles(mobileMenu);
        resetMobileSubmenus();
    };
    mobileMenu._tbMenuTransitionHandler = onCloseEnd;
    mobileMenu.addEventListener('transitionend', onCloseEnd);
}

function closeMobileMenu() {
    animateMobileMenu(false);
}

// Mobile Menu Toggle
function toggleMobileMenu() {
    const mobileMenu = getMobileMenuElement();
    if (!mobileMenu) return;
    animateMobileMenu(mobileMenu.classList.contains('hidden'));
}

function bindCloseMobileMenuOnOutsideTap() {
    const nav = document.querySelector('nav');
    if (!nav) return;

    document.addEventListener('pointerdown', (event) => {
        const mobileMenu = getMobileMenuElement();
        if (!mobileMenu || mobileMenu.classList.contains('hidden')) return;

        const target = event.target;
        if (!(target instanceof Node)) return;

        // Keep menu open while interacting inside navbar/mobile menu.
        if (nav.contains(target)) return;

        closeMobileMenu();
    });
}

function bindCloseMobileMenuOnLinkActivation() {
    const mobileMenu = getMobileMenuElement();
    if (!mobileMenu) return;

    mobileMenu.addEventListener('click', (event) => {
        const target = event.target;
        if (!(target instanceof Element) || !target.closest('a')) return;
        closeMobileMenu();
    });
}

function setWhyChooseItemState(item, isOpen, isMobile) {
    const front = item.querySelector('.why-choose-front');
    const back = item.querySelector('.why-choose-back');
    if (!front || !back) return;

    item.dataset.open = isOpen ? 'true' : 'false';
    item.setAttribute('aria-expanded', isOpen ? 'true' : 'false');

    if (isMobile) {
        const title = item.querySelector('h3')?.textContent.trim() || 'Este valor';
        front.setAttribute('aria-hidden', isOpen ? 'true' : 'false');
        back.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
        item.setAttribute('aria-label', `${title}: ${isOpen ? 'ocultar' : 'mostrar'} descripción`);
    } else {
        front.removeAttribute('aria-hidden');
        back.removeAttribute('aria-hidden');
        item.removeAttribute('aria-expanded');
        item.removeAttribute('aria-label');
    }
}

function initWhyChooseUsMobileToggle() {
    const grid = document.getElementById('why-choose-us-grid');
    if (!grid) return;

    const items = Array.from(grid.querySelectorAll('.why-choose-item'));
    if (!items.length) return;

    const mobileQuery = window.matchMedia('(max-width: 767px)');

    const applyViewportState = () => {
        const isMobile = mobileQuery.matches;

        items.forEach((item) => {
            if (isMobile) {
                item.setAttribute('role', 'button');
                item.setAttribute('tabindex', '0');
            } else {
                item.removeAttribute('role');
                item.removeAttribute('tabindex');
            }
        });

        if (isMobile) {
            items.forEach((item) => {
                const isOpen = item.dataset.open === 'true';
                setWhyChooseItemState(item, isOpen, true);
            });
            return;
        }

        items.forEach((item) => {
            // Keep desktop content visible while resetting the next mobile visit to the front face.
            setWhyChooseItemState(item, false, false);
        });
    };

    const toggleItem = (activeItem) => {
        if (!mobileQuery.matches) return;

        const shouldOpen = activeItem.dataset.open !== 'true';

        items.forEach((item) => {
            setWhyChooseItemState(item, item === activeItem ? shouldOpen : false, true);
        });
    };

    items.forEach((item) => {
        item.dataset.open = 'false';
        item.setAttribute('aria-expanded', 'false');

        item.addEventListener('click', () => {
            toggleItem(item);
        });

        item.addEventListener('keydown', (event) => {
            if (event.key !== 'Enter' && event.key !== ' ') return;
            event.preventDefault();
            toggleItem(item);
        });
    });

    if (typeof mobileQuery.addEventListener === 'function') {
        mobileQuery.addEventListener('change', applyViewportState);
    } else if (typeof mobileQuery.addListener === 'function') {
        mobileQuery.addListener(applyViewportState);
    }

    applyViewportState();
}

function ensureReviewCarouselStyles() {
    if (document.getElementById('reviews-carousel-styles')) return;

    const style = document.createElement('style');
    style.id = 'reviews-carousel-styles';
    style.textContent = `
        .reviews-carousel-dots {
            display: none;
        }

        @media (max-width: 767px) {
            .reviews-carousel-track {
                display: flex !important;
                gap: 1rem !important;
                overflow-x: auto;
                overscroll-behavior-inline: contain;
                scroll-behavior: smooth;
                scroll-snap-type: x mandatory;
                scrollbar-width: none;
                -webkit-overflow-scrolling: touch;
                padding: 1.5rem 0 0.25rem;
            }

            .reviews-carousel-track::-webkit-scrollbar {
                display: none;
            }

            .reviews-carousel-track > * {
                flex: 0 0 100%;
                min-width: 0;
                scroll-snap-align: start;
                scroll-snap-stop: always;
            }

            .reviews-carousel-dots {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 0.6rem;
                margin-top: 1rem;
            }

            .reviews-carousel-dot {
                width: 0.65rem;
                height: 0.65rem;
                padding: 0;
                border: 0;
                border-radius: 9999px;
                background: #d1d5db;
                transition: width 180ms ease, background-color 180ms ease;
            }

            .reviews-carousel-dot[aria-current="true"] {
                width: 1.6rem;
                background: #c5a059;
            }

            .reviews-carousel-dot:focus-visible {
                outline: 2px solid #333333;
                outline-offset: 3px;
            }
        }

        @media (prefers-reduced-motion: reduce) {
            .reviews-carousel-track {
                scroll-behavior: auto;
            }
        }
    `;
    document.head.appendChild(style);
}

function findReviewTracks() {
    const ratingSummaries = Array.from(document.querySelectorAll('p')).filter((paragraph) =>
        paragraph.textContent.trim().startsWith('Excelente 5.0 de 5')
    );

    return ratingSummaries.reduce((tracks, summary) => {
        const section = summary.closest('#reviews-section') || summary.closest('.bg-white');
        const track = section && section.querySelector('.grid.grid-cols-1.md\\:grid-cols-3');

        if (track && !tracks.includes(track)) tracks.push(track);
        return tracks;
    }, []);
}

function initReviewCarousels() {
    const tracks = findReviewTracks();
    if (!tracks.length) return;

    ensureReviewCarouselStyles();

    tracks.forEach((track, carouselIndex) => {
        if (track.dataset.reviewCarouselReady === 'true') return;

        const slides = Array.from(track.children);
        if (slides.length < 2) return;

        track.dataset.reviewCarouselReady = 'true';
        track.classList.add('reviews-carousel-track');
        track.setAttribute('role', 'region');
        track.setAttribute('aria-roledescription', 'carrusel');
        track.setAttribute('aria-label', 'Opiniones de clientes');
        track.setAttribute('tabindex', '0');

        const dots = document.createElement('div');
        dots.className = 'reviews-carousel-dots';
        dots.setAttribute('aria-label', 'Elegir opinión');

        const dotButtons = slides.map((slide, slideIndex) => {
            slide.setAttribute('role', 'group');
            slide.setAttribute('aria-roledescription', 'diapositiva');
            slide.setAttribute('aria-label', `${slideIndex + 1} de ${slides.length}`);

            const dot = document.createElement('button');
            dot.type = 'button';
            dot.className = 'reviews-carousel-dot';
            dot.setAttribute('aria-label', `Ver opinión ${slideIndex + 1}`);
            dot.setAttribute('aria-current', slideIndex === 0 ? 'true' : 'false');
            dot.addEventListener('click', () => {
                slides[slideIndex].scrollIntoView({
                    behavior: prefersReducedMotion() ? 'auto' : 'smooth',
                    block: 'nearest',
                    inline: 'start'
                });
            });
            dots.appendChild(dot);
            return dot;
        });

        track.insertAdjacentElement('afterend', dots);

        let updateFrame = null;
        const updateActiveDot = () => {
            updateFrame = null;
            const trackLeft = track.getBoundingClientRect().left;
            let activeIndex = 0;
            let closestDistance = Infinity;

            slides.forEach((slide, slideIndex) => {
                const distance = Math.abs(slide.getBoundingClientRect().left - trackLeft);
                if (distance < closestDistance) {
                    closestDistance = distance;
                    activeIndex = slideIndex;
                }
            });

            dotButtons.forEach((dot, dotIndex) => {
                dot.setAttribute('aria-current', dotIndex === activeIndex ? 'true' : 'false');
            });
        };

        track.addEventListener('scroll', () => {
            if (updateFrame) cancelAnimationFrame(updateFrame);
            updateFrame = requestAnimationFrame(updateActiveDot);
        }, { passive: true });

        track.addEventListener('keydown', (event) => {
            if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
            event.preventDefault();

            const activeIndex = dotButtons.findIndex((dot) => dot.getAttribute('aria-current') === 'true');
            const direction = event.key === 'ArrowRight' ? 1 : -1;
            const nextIndex = Math.min(slides.length - 1, Math.max(0, activeIndex + direction));
            dotButtons[nextIndex].click();
        });

        track.id = track.id || `reviews-carousel-${carouselIndex + 1}`;
    });
}

const MOBILE_SUBMENU_IDS = ['mob-servicios', 'mob-calculadoras', 'mob-consumo'];

function setMobSubmenuState(submenuId, isOpen) {
    const submenu = document.getElementById(submenuId);
    const icon = document.getElementById(`${submenuId}-icon`);
    const btn = document.getElementById(`${submenuId}-btn`);
    if (!submenu) return;

    submenu.classList.toggle('hidden', !isOpen);
    if (icon) icon.style.transform = isOpen ? 'rotate(180deg)' : 'rotate(0deg)';
    if (btn) {
        btn.classList.toggle('text-gold', isOpen);
        btn.classList.toggle('text-gray-300', !isOpen);
    }
}

function resetMobileSubmenus() {
    MOBILE_SUBMENU_IDS.forEach((submenuId) => setMobSubmenuState(submenuId, false));
}

// Mobile Submenu Accordion Toggle
function toggleMobSubmenu(submenuId) {
    const submenu = document.getElementById(submenuId);
    if (!submenu) return;

    const shouldOpen = submenu.classList.contains('hidden');

    if (shouldOpen && submenuId === 'mob-servicios') {
        setMobSubmenuState('mob-calculadoras', false);
    }

    if (shouldOpen && submenuId === 'mob-calculadoras') {
        setMobSubmenuState('mob-servicios', false);
        setMobSubmenuState('mob-consumo', false);
    }

    setMobSubmenuState(submenuId, shouldOpen);

    if (!shouldOpen && submenuId === 'mob-servicios') {
        setMobSubmenuState('mob-consumo', false);
    }
}

// Specific Navigations
function navigateServicio(servicioId) {
    if (document.getElementById(`view-${servicioId}`)) {
        // Navigate to the specific service subpage if it exists
        navigate(servicioId);
    } else {
        // Navigate to general servicios view for others
        navigate('servicios');
        setTimeout(() => {
            console.log(`Scroll or show details for: ${servicioId}`);
        }, 400);
    }
}

function navigateArea(areaId) {
    // Primero cambiamos a la vista de servicios
    navigate('servicios');

    // Esperamos a que termine la animación de opacidad para scrollear
    setTimeout(() => {
        const area = document.getElementById(areaId);
        if (area) {
            // Calculamos la posición restando un margen para no quedar tapado por el navbar fijo
            const y = area.getBoundingClientRect().top + window.scrollY - 120;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    }, 400);
}

function navigateCalc(calcId) {
    navigate('calculadoras');
    setTimeout(() => {
        console.log(`Scroll or show calc for: ${calcId}`);
        // Later: populate or scroll.
    }, 400);
}

// Navbar scroll effect (rAF-throttled to minimize style recalculation on scroll)
const navElement = document.querySelector('nav');
let navScrolled = false;
let navTicking = false;
const getScrollY = () => window.scrollY || window.pageYOffset || 0;
let lastKnownScrollY = getScrollY();

function updateNavOnScroll(scrollYValue = lastKnownScrollY) {
    if (!navElement) return;

    const shouldBeScrolled = scrollYValue > 50;
    if (shouldBeScrolled === navScrolled) return;

    navScrolled = shouldBeScrolled;
    navElement.classList.toggle('shadow-lg', shouldBeScrolled);
    navElement.classList.toggle('bg-opacity-95', shouldBeScrolled);
}

window.addEventListener('scroll', () => {
    lastKnownScrollY = getScrollY();
    if (navTicking) return;
    navTicking = true;
    requestAnimationFrame(() => {
        updateNavOnScroll(lastKnownScrollY);
        navTicking = false;
    });
}, { passive: true });

// Initial Router based on Hash on load
window.addEventListener('DOMContentLoaded', () => {
    const hash = window.location.hash.substring(1);
    const viewHome = document.getElementById('view-home');
    const initialScrollY = getScrollY();

    bindCloseMobileMenuOnOutsideTap();
    bindCloseMobileMenuOnLinkActivation();
    initWhyChooseUsMobileToggle();
    initReviewCarousels();

    // Run before major DOM writes to avoid forced reflow after style invalidation.
    updateNavOnScroll(initialScrollY);

    if (hash) ensureLazyView(hash);

    if (hash && document.getElementById(`view-${hash}`)) {
        // immediately show without animation for initial load
        document.querySelectorAll('.view-section').forEach(section => {
            section.classList.remove('active');
            section.style.display = 'none';
        });
        const target = document.getElementById(`view-${hash}`);
        target.style.display = 'block';
        requestAnimationFrame(() => {
            target.classList.add('active');
        });
    } else if (viewHome) {
        // default to home if we are in the SPA
        viewHome.style.display = 'block';
    }

    // Defer non-critical UI init until the browser has painted first content.
    runAfterFirstPaint(() => {
        if (document.getElementById('hero-carousel')) initHeroCarousel();
        if (document.getElementById('services-track')) initServCarousel();
    });

    // Smooth scroll if hash is present (not for SPA views)
    if (hash && !document.getElementById(`view-${hash}`)) {
        setTimeout(() => {
            const targetElement = document.getElementById(hash);
            if (targetElement) {
                const navHeight = 100; // Adjusted for fixed navbar
                const elementPosition = targetElement.getBoundingClientRect().top + window.scrollY;
                window.scrollTo({
                    top: elementPosition - navHeight,
                    behavior: 'smooth'
                });
            }
        }, 800); // Wait for potential animations or content load
    }
});

// Listen for hash changes to navigate without reloading
window.addEventListener('hashchange', () => {
    let hash = window.location.hash.substring(1);
    if (!hash || hash === 'home') hash = 'home';

    ensureLazyView(hash);

    if (document.getElementById(`view-${hash}`)) {
        navigate(hash);
    }
});

// --- Hero Carousel Logic ---
let currentSlide = 0;
let carouselInterval;
const slideCount = 6;
const SWIPE_THRESHOLD_PX = 40;

function bindHorizontalSwipe(element, onSwipeLeft, onSwipeRight) {
    if (!element) return;

    let startX = 0;
    let startY = 0;

    element.addEventListener('touchstart', (event) => {
        const touch = event.changedTouches && event.changedTouches[0];
        if (!touch) return;
        startX = touch.clientX;
        startY = touch.clientY;
    }, { passive: true });

    element.addEventListener('touchend', (event) => {
        const touch = event.changedTouches && event.changedTouches[0];
        if (!touch) return;

        const deltaX = touch.clientX - startX;
        const deltaY = touch.clientY - startY;
        const absX = Math.abs(deltaX);
        const absY = Math.abs(deltaY);

        // Only react to clear horizontal gestures so vertical page scroll keeps working.
        if (absX < SWIPE_THRESHOLD_PX || absX <= absY) return;

        if (deltaX < 0) onSwipeLeft();
        else onSwipeRight();
    }, { passive: true });
}

function initHeroCarousel() {
    const carousel = document.getElementById('hero-carousel');
    if (!carousel) return;

    // Start autoplay
    startCarousel();

    // Pause on hover
    carousel.addEventListener('mouseenter', stopCarousel);
    carousel.addEventListener('mouseleave', startCarousel);

    // Swipe navigation on touch devices
    bindHorizontalSwipe(
        carousel,
        () => nextSlide(true),
        () => prevSlide(true)
    );
}

function startCarousel() {
    stopCarousel(); // ensure no duplicates
    carouselInterval = setInterval(() => {
        nextSlide(false);
    }, 5000);
}

function stopCarousel() {
    clearInterval(carouselInterval);
}

function updateCarouselDOM() {
    const slides = document.querySelectorAll('#hero-carousel .carousel-slide');
    const dots = document.querySelectorAll('#carousel-dots > div');

    if (!slides.length || !dots.length) return;

    slides.forEach((slide, index) => {
        if (index === currentSlide) {
            slide.classList.remove('opacity-0', 'pointer-events-none', 'z-0');
            slide.classList.add('opacity-100', 'z-10');
        } else {
            slide.classList.remove('opacity-100', 'z-10');
            slide.classList.add('opacity-0', 'pointer-events-none', 'z-0');
        }
    });

    dots.forEach((dot, index) => {
        if (index === currentSlide) {
            dot.classList.remove('bg-white/30');
            dot.classList.add('bg-gold');
        } else {
            dot.classList.remove('bg-gold');
            dot.classList.add('bg-white/30');
        }
    });
}

function goToSlide(index, manual = true) {
    currentSlide = index;
    updateCarouselDOM();
    if (manual) startCarousel();
}

function nextSlide(manual = true) {
    currentSlide = (currentSlide + 1) % slideCount;
    updateCarouselDOM();
    if (manual) startCarousel();
}

function prevSlide(manual = true) {
    currentSlide = (currentSlide - 1 + slideCount) % slideCount;
    updateCarouselDOM();
    if (manual) startCarousel();
}

// --- Services Carousel Logic ---
let currentServSlide = 0;
let servCarouselInterval;
let servCardOffset = 0;
let servMaxSlide = 0;
let servResizeTimer = null;

function computeServCarouselMetrics() {
    const track = document.getElementById('services-track');
    if (!track) return false;

    const cards = track.children;
    if (cards.length < 2) {
        servCardOffset = 0;
        servMaxSlide = 0;
        return false;
    }

    const cardWidth = cards[0].getBoundingClientRect().width;
    if (cardWidth <= 0) return false;

    const trackContainerWidth = track.parentElement.getBoundingClientRect().width;
    const visibleCards = Math.max(1, Math.round(trackContainerWidth / cardWidth));

    servCardOffset = cardWidth;
    servMaxSlide = Math.max(0, cards.length - visibleCards);

    if (currentServSlide > servMaxSlide) currentServSlide = 0;
    if (currentServSlide < 0) currentServSlide = servMaxSlide;

    return true;
}

function initServCarousel() {
    const track = document.getElementById('services-track');
    const container = document.getElementById('services-slider-container');
    if (!track || !container) return;

    computeServCarouselMetrics();
    updateServCarousel();

    // Start autoplay
    startServCarousel();

    // Pause on hover
    container.addEventListener('mouseenter', stopServCarousel);
    container.addEventListener('mouseleave', startServCarousel);

    // Swipe navigation on touch devices
    bindHorizontalSwipe(
        container,
        () => nextServSlide(true),
        () => prevServSlide(true)
    );

    // Keep aligned on resize (debounced)
    window.addEventListener('resize', () => {
        clearTimeout(servResizeTimer);
        servResizeTimer = setTimeout(() => {
            servCardOffset = 0;
            computeServCarouselMetrics();
            updateServCarousel();
        }, 120);
    }, { passive: true });
}

function startServCarousel() {
    clearInterval(servCarouselInterval);
    servCarouselInterval = setInterval(() => {
        nextServSlide(false);
    }, 4500); // 4.5 seconds
}

function stopServCarousel() {
    clearInterval(servCarouselInterval);
}

function updateServCarousel() {
    const track = document.getElementById('services-track');
    if (!track) return;

    if (!servCardOffset && !computeServCarouselMetrics()) return;

    // Enforce limits and wrap around
    if (currentServSlide > servMaxSlide) currentServSlide = 0;
    if (currentServSlide < 0) currentServSlide = servMaxSlide;

    track.style.transform = `translateX(-${currentServSlide * servCardOffset}px)`;
}

function nextServSlide(manual = true) {
    currentServSlide++;
    updateServCarousel();
    if (manual) startServCarousel(); // Reset timer if clicked manually
}

function prevServSlide(manual = true) {
    currentServSlide--;
    updateServCarousel();
    if (manual) startServCarousel(); // Reset timer if clicked manually
}
