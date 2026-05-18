// timeline scroll

const timeline = document.getElementById("scroll-timeline");
const prevBtn = document.getElementById("timeline-prev");
const nextBtn = document.getElementById("timeline-next");

if (timeline && prevBtn && nextBtn) {

    nextBtn.addEventListener("click", () => {
        timeline.scrollBy({
            left: 340,
            behavior: "smooth"
        });
    });

    prevBtn.addEventListener("click", () => {
        timeline.scrollBy({
            left: -340,
            behavior: "smooth"
        });
    });

}