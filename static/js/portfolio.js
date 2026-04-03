// --- GLOBAL VARIABLES ---
let players = {};
let currentIndex = 0;
let serviceSections = [];
let carouselIndicators = [];
// --- 1. CAROUSEL LOGIC ---
function initCarousel() {
    // Re-select elements because AJAX replaces them
    serviceSections = document.querySelectorAll(".service-container");
    carouselIndicators = document.querySelectorAll(".c-dot");
    // Find initially active card or default to 0
    currentIndex = [...serviceSections].findIndex(sec => sec.classList.contains("active-card"));
    if (currentIndex === -1) currentIndex = 0;
    updateCarousel();
}

function updateCarousel() {
    serviceSections.forEach(sec => sec.classList.remove("active-card"));
    carouselIndicators.forEach(dot => dot.classList.remove("active-dot"));
    if (serviceSections[currentIndex]) {
        serviceSections[currentIndex].classList.add("active-card");
    }
    if (carouselIndicators[currentIndex]) {
        carouselIndicators[currentIndex].classList.add("active-dot");
    }
}

// --- 2. YOUTUBE API LOGIC ---
function onYouTubeIframeAPIReady() {
    // Clear old player instances before re-init
    players = {}; 
    document.querySelectorAll(".bg-video").forEach(iframe => {
        const id = iframe.id;
        players[id] = new YT.Player(id, {
            events: { 'onStateChange': onPlayerStateChange }
        });
    });
}

function stopAllVideos(exceptId = null) {
    Object.keys(players).forEach(id => {
        if (id !== exceptId && players[id] && typeof players[id].pauseVideo === 'function') {
            players[id].pauseVideo();
        }
    });
}

function onPlayerStateChange(event) {
    const iframe = event.target.getIframe();
    const card = iframe.closest(".service-container");
    const overlay = card.querySelector(".media-overlay");
    const content = card.querySelector(".inner-content");
    if (event.data === YT.PlayerState.PAUSED || event.data === YT.PlayerState.ENDED) {
        overlay.classList.remove('hidden');
        content.classList.remove('hidden');
    } else if (event.data === YT.PlayerState.PLAYING) {
        overlay.classList.add('hidden');
        content.classList.add('hidden');
    }
}

// --- 3. EVENT BINDING ---
function attachEventListeners() {
    // Play Buttons
    document.querySelectorAll(".service-cta").forEach(button => {
        button.addEventListener("click", () => {
            const card = button.closest(".service-container");
            const iframe = card.querySelector(".bg-video");
            const currentId = iframe.id;
            stopAllVideos(currentId);
            if (players[currentId] && players[currentId].playVideo) {
                players[currentId].playVideo();
            }
        });
    });

    // Carousel Nav
    document.querySelectorAll(".click-right").forEach(btn => {
        btn.onclick = () => {
            stopAllVideos();
            currentIndex = (currentIndex + 1) % serviceSections.length;
            updateCarousel();
        };
    });

    document.querySelectorAll(".click-left").forEach(btn => {
        btn.onclick = () => {
            stopAllVideos();
            currentIndex = (currentIndex - 1 + serviceSections.length) % serviceSections.length;
            updateCarousel();
        };
    });

    // Dots
    carouselIndicators.forEach((dot, index) => {
        dot.onclick = () => {
            stopAllVideos();
            currentIndex = index;
            updateCarousel();
        };
    });
}

function photoLogic() {
    const galleries = document.querySelectorAll(".gallery");
    galleries.forEach(gallery => {
        const featured = gallery.querySelector(".featured-image");
        const thumbs = gallery.querySelectorAll(".thumbnail");
        let locked = featured.src;
        // Helper function for smooth swapping
        const swapImage = (newSrc) => {
            if (featured.src === newSrc) return; // Skip if it's the same image
            featured.classList.add("fade-out");
            // Wait for the fade-out duration (0.25s in your CSS)
            setTimeout(() => {
                featured.src = newSrc;
                featured.classList.remove("fade-out");
            }, 250); 
        };

        thumbs.forEach(t => {
            t.onmouseover = () => swapImage(t.src);
            t.onmouseout = () => swapImage(locked);
            t.onclick = () => {
                locked = t.src;
                swapImage(t.src);               
                // Match your CSS class: .active-thumb
                thumbs.forEach(thumb => thumb.classList.remove('active-thumb'));
                t.classList.add('active-thumb');
            };
        });
    });
}

function detailOverlay() {
    const detailers = document.querySelectorAll(".detailer");
    detailers.forEach(detail => {
        const gallery = detail.closest(".service-container");
        if (!gallery) return;
        const showDetail = gallery.querySelector(".service-cta-two");
        const hideDetail = gallery.querySelector(".close-detail");
        const overlay = gallery.querySelector(".detail-content");
        if (!showDetail || !hideDetail || !overlay) return;
        // Use onclick to overwrite existing listeners (cleaner for AJAX)
        showDetail.onclick = () => {
            overlay.classList.add("active-detail");
        };
        hideDetail.onclick = () => {
            overlay.classList.remove("active-detail");
        };
        overlay.onclick = (e) => {
            if (e.target === overlay) {
                overlay.classList.remove("active-detail");
            }
        };
    });
}

// --- 4. AJAX FILTER LOGIC ---
document.querySelectorAll(".portfolio-filter button").forEach(button => {
    button.addEventListener("click", () => {
        const filterId = button.dataset.filter;      
        // Visual feedback
        document.querySelectorAll(".portfolio-filter button").forEach(btn => btn.classList.remove("active"));
        button.classList.add("active");

        fetch(`/explore-our-portfolio?id=${filterId}`, {
            headers: { "X-Requested-With": "XMLHttpRequest" }
        })
        .then(response => response.text())
        .then(html => {
            const section = document.querySelector(".hero-overlayh");           
            // Remove old cards without breaking the shell
            section.querySelectorAll(".service-container").forEach(c => c.remove());
            // Injects new cards before the left nav button
            const navLeft = document.getElementById("nvleft");
            navLeft.insertAdjacentHTML('beforebegin', html);
            setTimeout(() => {
                onYouTubeIframeAPIReady(); 
                initCarousel();          
                attachEventListeners();    
                // Call the function after page load
                detailOverlay();
                const portfolioData = document.getElementById("portfolio-data");
                const isPhoto = portfolioData && portfolioData.dataset.isPhoto.toLowerCase() === "true";
                if (isPhoto) {
                    photoLogic();
                }
            }, 50);
        })
        .catch(err => console.error("AJAX Error:", err));
    });
});

// Initial Run on Page Load
document.addEventListener("DOMContentLoaded", () => {
    initCarousel();
    attachEventListeners();
    detailOverlay();
});
