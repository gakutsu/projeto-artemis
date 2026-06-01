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

// timeline popup
const timelineGalleryModal = document.getElementById('timelineGalleryModal');
const timelineGalleryClose = document.getElementById('timelineGalleryClose');
const timelineGalleryTitle = document.getElementById('timelineGalleryTitle');
const timelineGalleryText = document.getElementById('timelineGalleryText');
const timelineGalleryGrid = document.getElementById('timelineGalleryGrid');

document.querySelectorAll('.open-timeline-gallery').forEach(card => {
    card.addEventListener('click', () => {
        const title = card.dataset.title;
        const text = card.dataset.text;
        const folder = card.dataset.folder;

        timelineGalleryTitle.textContent = title;
        timelineGalleryText.textContent = text;

        timelineGalleryGrid.innerHTML = '';

        for (let i = 1; i <= 10; i++) {
            const item = document.createElement('div');
            item.className = 'gallery-slot';

            item.innerHTML = `
                <img src="img/galeria/${folder}-${i}.jpg" 
                     alt="${title} - imagem ${i}">
            `;

            timelineGalleryGrid.appendChild(item);
        }

        timelineGalleryModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    });
});

function closeTimelineGallery() {
    timelineGalleryModal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

timelineGalleryClose.addEventListener('click', closeTimelineGallery);

timelineGalleryModal.addEventListener('click', (event) => {
    if (event.target === timelineGalleryModal) {
        closeTimelineGallery();
    }
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        closeTimelineGallery();
    }
});