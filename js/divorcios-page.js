function toggleFaq(item) {
    const items = document.querySelectorAll(".faq-item");

    items.forEach((currentItem) => {
        if (currentItem !== item) {
            currentItem.classList.remove("active");
        }
    });

    item.classList.toggle("active");
}
window.toggleFaq = toggleFaq;
