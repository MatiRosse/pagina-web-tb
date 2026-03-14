// SPA Navigation Logic
let calculadorasScriptPromise = null;

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

    // Close mobile menu if open (safely checking if it exists)
    const mobileMenu = document.getElementById('mob-ag'); // id used in the unified navbar
    if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
        mobileMenu.classList.add('hidden');
    }

    // Update URL hash safely without triggering infinite loops
    if (window.location.hash.substring(1) !== viewId) {
        window.location.hash = viewId;
    }
}

// Mobile Menu Toggle
function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mob-menu');
    if (mobileMenu) {
        mobileMenu.classList.toggle('hidden');
    }
}

// Mobile Submenu Accordion Toggle
function toggleMobSubmenu(submenuId) {
    const submenu = document.getElementById(submenuId);
    const icon = document.getElementById(`${submenuId}-icon`);
    const btn = document.getElementById(`${submenuId}-btn`);

    if (submenu) {
        const isHidden = submenu.classList.contains('hidden');

        // Close other submenus first (optional, but cleaner)
        // document.querySelectorAll('[id^="mob-"][id$="-submenu"]').forEach(s => s.classList.add('hidden'));

        if (isHidden) {
            submenu.classList.remove('hidden');
            if (icon) icon.style.transform = 'rotate(180deg)';
            if (btn) {
                btn.classList.remove('text-gray-300');
                btn.classList.add('text-gold');
            }
        } else {
            submenu.classList.add('hidden');
            if (icon) icon.style.transform = 'rotate(0deg)';
            if (btn) {
                btn.classList.remove('text-gold');
                btn.classList.add('text-gray-300');
            }
        }
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

function initHeroCarousel() {
    const carousel = document.getElementById('hero-carousel');
    if (!carousel) return;

    // Start autoplay
    startCarousel();

    // Pause on hover
    carousel.addEventListener('mouseenter', stopCarousel);
    carousel.addEventListener('mouseleave', startCarousel);
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
