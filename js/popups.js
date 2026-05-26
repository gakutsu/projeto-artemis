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

// membros do grupo

const openGroupCard = document.getElementById('openGroupCard');
const closeGroupCard = document.getElementById('closeGroupCard');
const groupPageOverlay = document.getElementById('groupPageOverlay');

openGroupCard.addEventListener('click', () => {
    groupPageOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
});

closeGroupCard.addEventListener('click', () => {
    groupPageOverlay.classList.remove('active');
    document.body.style.overflow = 'auto';
});

groupPageOverlay.addEventListener('click', (event) => {
    if (event.target === groupPageOverlay) {
        groupPageOverlay.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        groupPageOverlay.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
});

// popup membros
const memberModal = document.getElementById('memberModal');
const memberModalClose = document.getElementById('memberModalClose');
const memberModalName = document.getElementById('memberModalName');
const memberModalRole = document.getElementById('memberModalRole');
const memberModalText = document.getElementById('memberModalText');

document.querySelectorAll('.open-member-modal').forEach(card => {
    card.addEventListener('click', () => {
        memberModalName.textContent = card.dataset.name;
        memberModalRole.textContent = card.dataset.role;
        memberModalText.textContent = card.dataset.text;

        memberModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    });
});

function closeMemberModal() {
    memberModal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

memberModalClose.addEventListener('click', closeMemberModal);

memberModal.addEventListener('click', (event) => {
    if (event.target === memberModal) {
        closeMemberModal();
    }
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        closeMemberModal();
    }
});

// membros do grupo