const processModal = document.getElementById('processModal');
const processModalClose = document.getElementById('processModalClose');
const modalImage = document.getElementById('modalImage');
const processModalTitle = document.getElementById('processModalTitle');
const processModalText = document.getElementById('processModalText');
const processModalImage = document.getElementById('processModalImage');

document.querySelectorAll('.open-process-modal').forEach(card => {

    card.addEventListener('click', () => {

        processModalTitle.textContent = card.dataset.title;
        processModalText.textContent = card.dataset.text;

        processModalImage.src = card.dataset.image;
        processModalImage.alt = card.dataset.title;

        processModal.classList.add('active');

        document.body.style.overflow = 'hidden';
    });

});

function closeProcessModal() {
    processModal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

processModalClose.addEventListener('click', closeProcessModal);

processModal.addEventListener('click', (e) => {

    if (e.target === processModal) {
        closeProcessModal();
    }

});

document.addEventListener('keydown', (e) => {

    if (e.key === 'Escape') {
        closeProcessModal();
    }

});

document.querySelectorAll('.open-modal').forEach(button => {

    button.addEventListener('click', () => {

        modalTitle.textContent = button.dataset.title;
        modalText.textContent = button.dataset.text;

        modalIcon.className = `fa-solid ${button.dataset.icon}`;

        // IMAGEM
        modalImage.src = button.dataset.image;
        modalImage.alt = button.dataset.title;

        modalOverlay.classList.add('active');

    });

});