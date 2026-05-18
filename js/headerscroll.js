// header show / hide scroll

const header = document.querySelector(".site-header");

let lastScroll = 0;

window.addEventListener("scroll", () => {

    const currentScroll = window.pageYOffset || document.documentElement.scrollTop;

    // background ao rolar
    if (currentScroll > 40) {
        header.classList.add("scrolled");
    } else {
        header.classList.remove("scrolled");
    }

    // descendo = esconde
    if (currentScroll > lastScroll && currentScroll > 120) {
        header.classList.remove("show-header");
        header.classList.add("hide-header");
    }
    // subindo = mostra
    else {
        header.classList.remove("hide-header");
        header.classList.add("show-header");
    }

    lastScroll = currentScroll <= 0 ? 0 : currentScroll;
});