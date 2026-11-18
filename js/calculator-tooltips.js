(() => {
    const compact = window.matchMedia('(max-width: 767px), (hover: none)');
    const navbar = document.querySelector('.tb-navbar');
    const margin = 12;
    const gap = 8;
    let active;

    function closeTooltip() {
        if (!active) return;
        active.wrapper.classList.remove('is-open');
        if (compact.matches) active.trigger.setAttribute('aria-expanded', 'false');
        active.card?.classList.remove('has-open-popover');
        active = undefined;
    }

    function positionTooltip() {
        if (!compact.matches || !active) return;

        const { trigger, tooltip } = active;
        const viewport = window.visualViewport;
        const root = document.documentElement;
        const leftEdge = viewport?.offsetLeft ?? 0;
        const topEdge = viewport?.offsetTop ?? 0;
        const width = viewport?.width ?? root.clientWidth;
        const height = viewport?.height ?? root.clientHeight;
        const bounds = trigger.getBoundingClientRect();
        const navbarBottom = navbar?.getBoundingClientRect().bottom ?? 0;
        const topLimit = Math.max(topEdge, navbarBottom) + margin;
        const bottomLimit = topEdge + height - margin;

        if (!bounds.height || bounds.bottom <= Math.max(topEdge, navbarBottom) || bounds.top >= topEdge + height) {
            closeTooltip();
            return;
        }

        const below = Math.max(topLimit, bounds.bottom + gap);
        const above = Math.min(bottomLimit, bounds.top - gap);
        const roomBelow = bottomLimit - below;
        const roomAbove = above - topLimit;
        const availableHeight = Math.floor(Math.max(roomAbove, roomBelow));
        if (availableHeight < 24) {
            closeTooltip();
            return;
        }
        tooltip.style.setProperty('--info-max-width', `${width - 2 * margin}px`);
        tooltip.style.setProperty('--info-max-height', `${availableHeight}px`);

        const { width: tooltipWidth, height: tooltipHeight } = tooltip.getBoundingClientRect();
        const left = Math.max(leftEdge + margin, Math.min(bounds.left, leftEdge + width - margin - tooltipWidth));
        const top = tooltipHeight <= roomBelow ? below : Math.max(topLimit, above - tooltipHeight);

        tooltip.style.setProperty('--info-left', `${left}px`);
        tooltip.style.setProperty('--info-top', `${top}px`);
    }

    const triggers = [...document.querySelectorAll('.calc-info-wrap, .context-info-wrap')].map((wrapper) => {
        const trigger = wrapper.querySelector('.calc-info-trigger') ?? wrapper;
        const tooltip = wrapper.querySelector('[role="tooltip"]');
        const card = wrapper.closest('.method-card');
        trigger.setAttribute('aria-controls', tooltip.id);

        function toggleTooltip(event) {
            if (!compact.matches && wrapper !== trigger) return;
            event.stopPropagation();
            if (tooltip.contains(event.target)) return;

            const alreadyOpen = active?.wrapper === wrapper;
            closeTooltip();
            if (alreadyOpen) return;

            active = { wrapper, trigger, tooltip, card };
            wrapper.classList.add('is-open');
            if (compact.matches) trigger.setAttribute('aria-expanded', 'true');
            card?.classList.add('has-open-popover');
            positionTooltip();
        }

        trigger.addEventListener('click', toggleTooltip);
        trigger.addEventListener('keydown', (event) => {
            if (event.key !== 'Escape' || active?.wrapper !== wrapper) return;
            closeTooltip();
            if (!compact.matches) trigger.blur();
        });
        return trigger;
    });

    function resetTooltips() {
        closeTooltip();
        triggers.forEach((trigger) => {
            if (compact.matches) trigger.setAttribute('aria-expanded', 'false');
            else trigger.removeAttribute('aria-expanded');
        });
    }

    resetTooltips();
    compact.addEventListener('change', resetTooltips);
    document.addEventListener('click', closeTooltip);
    document.addEventListener('focusin', (event) => {
        if (active && !active.wrapper.contains(event.target)) closeTooltip();
    });
    window.addEventListener('scroll', positionTooltip, { passive: true });
    window.addEventListener('resize', positionTooltip);
    window.visualViewport?.addEventListener('resize', positionTooltip);
    window.visualViewport?.addEventListener('scroll', positionTooltip);
})();
