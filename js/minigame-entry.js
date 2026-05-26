(function () {
    const openButton = document.querySelector("[data-minigame-open]");
    const panel = document.querySelector("[data-minigame-panel]");

    if (!openButton || !panel) return;

    function refreshGameCanvas() {
        window.dispatchEvent(new Event("resize"));
    }

    function openMinigame() {
        if (panel.hidden) {
            panel.hidden = false;

            requestAnimationFrame(() => {
                panel.classList.add("is-open");
                openButton.setAttribute("aria-expanded", "true");
                refreshGameCanvas();
                panel.scrollIntoView({ behavior: "smooth", block: "start" });
            });

            return;
        }

        refreshGameCanvas();
        panel.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    openButton.addEventListener("click", openMinigame);
})();
