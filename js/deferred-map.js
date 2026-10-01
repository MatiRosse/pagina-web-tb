// Native lazy loading may fetch an off-screen map several screens too early.
// Keep its reserved space and load the existing embed as the user approaches it.
document.querySelectorAll('iframe[data-map-src]').forEach(function (frame) {
    function loadMap() {
        frame.src = frame.dataset.mapSrc;
    }
    if (!('IntersectionObserver' in window)) {
        loadMap();
        return;
    }
    var observer = new IntersectionObserver(function (entries) {
        if (entries.some(function (entry) { return entry.isIntersecting; })) {
            loadMap();
            observer.disconnect();
        }
    }, { rootMargin: '150px 0px' });
    observer.observe(frame);
});
