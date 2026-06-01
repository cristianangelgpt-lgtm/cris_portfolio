import PhotoSwipeLightbox from "photoswipe/lightbox";

const lightbox = new PhotoSwipeLightbox({
  gallery: ".pswp-gallery",
  children: "a",
  pswpModule: () => import("photoswipe"),
});

lightbox.on("uiRegister", () => {
  lightbox.pswp?.ui?.registerElement({
    name: "custom-caption",
    order: 9,
    isButton: false,
    appendTo: "root",
    html: "",
    onInit: (element, pswp) => {
      const updateCaption = () => {
        const slideElement = pswp.currSlide?.data.element as HTMLElement | undefined;
        const caption = slideElement?.dataset.caption || slideElement?.querySelector("span")?.textContent || "";
        element.textContent = caption;
        element.toggleAttribute("hidden", !caption);
      };

      pswp.on("change", updateCaption);
      updateCaption();
    },
  });
});

lightbox.init();

const projectCarousels = document.querySelectorAll<HTMLElement>("[data-project-carousel]");

projectCarousels.forEach((carousel) => {
  const slides = Array.from(carousel.querySelectorAll<HTMLAnchorElement>("[data-carousel-slide]"));
  const previousButton = carousel.querySelector<HTMLButtonElement>("[data-carousel-prev]");
  const nextButton = carousel.querySelector<HTMLButtonElement>("[data-carousel-next]");
  const status = carousel.querySelector<HTMLElement>("[data-carousel-status]");
  let activeIndex = 0;

  const showSlide = (nextIndex: number) => {
    if (slides.length === 0) return;

    activeIndex = (nextIndex + slides.length) % slides.length;
    slides.forEach((slide, index) => {
      const isActive = index === activeIndex;
      slide.classList.toggle("is-active", isActive);
      slide.setAttribute("aria-hidden", String(!isActive));
      slide.tabIndex = isActive ? 0 : -1;
    });

    if (status) status.textContent = `${activeIndex + 1} / ${slides.length}`;
  };

  previousButton?.addEventListener("click", () => showSlide(activeIndex - 1));
  nextButton?.addEventListener("click", () => showSlide(activeIndex + 1));
  showSlide(0);
});

const themeToggle = document.querySelector<HTMLButtonElement>("[data-theme-toggle]");
const themeLabel = document.querySelector<HTMLElement>("[data-theme-label]");

function setTheme(theme: "light" | "dark") {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem("theme", theme);
  if (themeLabel) themeLabel.textContent = theme === "dark" ? "Light" : "Dark";
}

const activeTheme = document.documentElement.dataset.theme === "dark" ? "dark" : "light";
setTheme(activeTheme);
themeToggle?.addEventListener("click", () => {
  setTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark");
});

const revealTargets = document.querySelectorAll<HTMLElement>("[data-reveal]");

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.12 },
  );

  revealTargets.forEach((target) => observer.observe(target));
} else {
  revealTargets.forEach((target) => target.classList.add("is-visible"));
}
