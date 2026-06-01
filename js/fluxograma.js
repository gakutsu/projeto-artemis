const image = document.getElementById("flowchartImage");
const container = document.querySelector(".flowchart-container");

const zoomIn = document.getElementById("zoomIn");
const zoomOut = document.getElementById("zoomOut");
const zoomReset = document.getElementById("zoomReset");
const zoomValue = document.getElementById("zoomValue");

let scale = 1;

function updateZoom() {
    image.style.transform = `scale(${scale})`;
    zoomValue.textContent = `${Math.round(scale * 100)}%`;
}

zoomIn.onclick = () => {
    scale += 0.1;
    updateZoom();
};

zoomOut.onclick = () => {
    scale = Math.max(0.3, scale - 0.1);
    updateZoom();
};

zoomReset.onclick = () => {
    scale = 1;
    updateZoom();
};

let isDragging = false;
let startX;
let startY;
let scrollLeft;
let scrollTop;

container.addEventListener("mousedown", e => {

    isDragging = true;

    container.classList.add("dragging");

    startX = e.pageX;
    startY = e.pageY;

    scrollLeft = container.scrollLeft;
    scrollTop = container.scrollTop;
});

container.addEventListener("mouseup", () => {
    isDragging = false;
    container.classList.remove("dragging");
});

container.addEventListener("mouseleave", () => {
    isDragging = false;
    container.classList.remove("dragging");
});

container.addEventListener("mousemove", e => {

    if (!isDragging) return;

    e.preventDefault();

    const walkX = e.pageX - startX;
    const walkY = e.pageY - startY;

    container.scrollLeft = scrollLeft - walkX;
    container.scrollTop = scrollTop - walkY;
});

updateZoom();