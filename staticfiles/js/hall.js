// --- 1. SELECTORS & STATE ---
const nav = document.getElementById("hofSideNav");
const content = document.getElementById("hofContent");
const breadcrumb = document.getElementById("hofBreadcrumb");
const backBtn = document.getElementById("navBackBtn");

let path = [];
let navHistory = [];
let videoPlayers = {};
let progressIntervals = {};

// --- 2. YOUTUBE API CORE ---
function extractVideoID(url) {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length == 11) ? match[7] : url;
}

function initYouTubePlayers() {
    Object.values(progressIntervals).forEach(clearInterval);
    videoPlayers = {}; 
    
    document.querySelectorAll('.yt-player-element').forEach((el) => {
        const index = el.id.split('-')[1]; 
        const videoId = extractVideoID(el.getAttribute('data-video-link'));

        videoPlayers[index] = new YT.Player(el.id, {
            videoId: videoId,
            playerVars: { 
                'controls': 0, 
                'modestbranding': 1, 
                'rel': 0, 
                'showinfo': 0, 
                'iv_load_policy': 3 
            },
            events: {
                'onReady': (event) => { 
                    event.target.setVolume(50);
                    event.target.setPlaybackQuality('highres'); 
                },
                'onStateChange': (event) => onPlayerStateChange(event, index)
            }
        });
    });
}

function onYouTubeIframeAPIReady() {
    initYouTubePlayers();
}

// --- 3. NAVIGATION & AJAX LOGIC ---

function setActive(btn) {
    document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
}

function updateBreadcrumb() {
    breadcrumb.innerHTML = path.length > 0 ? path.join(" / ") : "All Categories";
}

function animateNavReplace(items, level) {
    nav.classList.add("slide-out");
    
    setTimeout(() => {
        nav.innerHTML = "";
        items.forEach((item, index) => {
            const btn = document.createElement("button");
            btn.className = "nav-btn";
            btn.innerText = item.title;
            btn.dataset.id = item.id;
            btn.dataset.level = level;
            btn.onclick = () => navClick(btn);
            nav.appendChild(btn);

            // NEW: If this is the first subcategory, make it active and click it
            if (index === 0) {
                btn.classList.add("active");
                // We don't call navClick recursively here to avoid animation loops, 
                // we handle the logic inside the fetch.
            }
        });
        nav.classList.remove("slide-out");
    }, 200);
}

function navClick(btn) {
    const level = btn.dataset.level;
    const id = btn.dataset.id;
    
    setActive(btn);

    fetch(`/hall/data/?type=${level}&id=${id}`)
    .then(r => r.json())
    .then(data => {
        // 1. UPDATE VIDEO GRID
        if (data.html) {
            content.innerHTML = data.html;
            initYouTubePlayers(); 
        }

        // 2. UPDATE SIDE NAV & AUTO-SELECT FIRST CHILD
        if (data.items && data.items.length > 0) {
            const nextLevel = "child_category";

            navHistory.push({
                navHtml: nav.innerHTML,
                contentHtml: content.innerHTML,
                path: [...path]
            });

            path.push(btn.innerText);
            updateBreadcrumb();
            
            // Replace the nav items
            animateNavReplace(data.items, nextLevel);

            // AUTO-CLICK LOGIC:
            // Since we want to show the specific videos of the first child 
            // as soon as the parent is clicked, we trigger a second fetch for index 0
            const firstChild = data.items[0];
            fetch(`/hall/data/?type=${nextLevel}&id=${firstChild.id}`)
            .then(r => r.json())
            .then(childData => {
                if (childData.html) {
                    content.innerHTML = childData.html;
                    initYouTubePlayers();
                    detailOverlay(); // <--- ADD THIS LINE HERE
                }
            });
        }
    });
}

/* BACK BUTTON */
backBtn.onclick = function() {
    if (navHistory.length === 0) return;

    const previous = navHistory.pop();
    
    nav.innerHTML = previous.navHtml;
    content.innerHTML = previous.contentHtml;
    path = previous.path;

    updateBreadcrumb();

    document.querySelectorAll(".nav-btn").forEach(btn => {
        btn.onclick = () => navClick(btn);
    });

    initYouTubePlayers();
    detailOverlay();
};

// --- 4. VIDEO INTERFACE CONTROLS ---

function playProjectVideo(index) {
    stopAllVideos(index);
    if(videoPlayers[index]) videoPlayers[index].playVideo();
}


function togglePlayPause(index) {
    const player = videoPlayers[index];
    if (!player) return;
    const state = player.getPlayerState();
    if (state === YT.PlayerState.PLAYING) {
        player.pauseVideo();
    } else {
        stopAllVideos(index);
        player.playVideo();
    }
}


// 3. Media Controls
function setVolume(key, value) {
    if(videoPlayers[key]) videoPlayers[key].setVolume(value);
}

function toggleMute(key) {
    const p = videoPlayers[key];
    p.isMuted() ? p.unMute() : p.mute();
}

function scrubVideo(key, value) {
    const p = videoPlayers[key];
    p.seekTo((value / 100) * p.getDuration(), true);
}

function toggleFullscreen(key) {
    const container = document.getElementById(`recap-wrap-${key}`);
    if (!document.fullscreenElement) {
        container.requestFullscreen?.() || container.webkitRequestFullscreen?.();
    } else {
        document.exitFullscreen?.();
    }
}


function stopAllVideos(exceptIndex = null) {
    Object.keys(videoPlayers).forEach(id => {
        if (id !== exceptIndex && videoPlayers[id].pauseVideo) {
            videoPlayers[id].pauseVideo();
        }
    });
}

function onPlayerStateChange(event, index) {
    const overlay = document.getElementById(`interface-${index}`);
    const playPauseBtn = document.getElementById(`play-pause-${index}`);
    
    const pauseIcon = `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`;
    const playIcon = `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>`;

    if (event.data === YT.PlayerState.PLAYING) {
        event.target.setPlaybackQuality('highres'); 
        overlay.classList.add('is-playing');
        if (playPauseBtn) playPauseBtn.innerHTML = pauseIcon;
        
        progressIntervals[index] = setInterval(() => {
            const current = event.target.getCurrentTime();
            const total = event.target.getDuration();
            const progBar = document.getElementById(`progress-${index}`);
            if (progBar) progBar.value = (current / total) * 100;
        }, 1000);
    } else {
        overlay.classList.remove('is-playing');
        if (playPauseBtn) playPauseBtn.innerHTML = playIcon;
        clearInterval(progressIntervals[index]);
    }
}

// --- 5. INITIALIZE ---
document.querySelectorAll(".nav-btn").forEach((btn, i) => {
    btn.onclick = () => navClick(btn);
    // Mark the first top-level button as active but don't force click it 
    // unless you want the page to load data immediately.
    if(i === 0) btn.classList.add("active");
});
detailOverlay();


function openLightbox(imageUrl) {
    // Basic implementation: You could trigger a hidden modal here
    // Or use a professional library call:
    console.log("Opening high-res source: " + imageUrl);
    
    // Quick custom lightbox logic
    const lb = document.createElement('div');
    lb.id = 'custom-lightbox';
    lb.style = "position:fixed; inset:0; background:rgba(0,0,0,0.95); z-index:9999; display:flex; align-items:center; justify-content:center; cursor:zoom-out;";
    lb.innerHTML = `<img src="${imageUrl}" style="max-width:90%; max-height:90%; box-shadow:0 0 50px rgba(0,0,0,0.5);">`;
    lb.onclick = () => lb.remove();
    document.body.appendChild(lb);
}


function detailOverlay() {
    const detailers = document.querySelectorAll(".video-detailer");
    detailers.forEach(detailer => {
        const showBtn = detailer.querySelector(".show-video-detail-btn");        
        const overlayMain = detailer.nextElementSibling;
        // Safety check: Ensure we actually found the overlay and it has the right class
        if (!showBtn || !overlayMain || !overlayMain.classList.contains("vid-details")) return;
        const wrapper = overlayMain.querySelector(".vid-details-wrapper");
        const hideBtn = overlayMain.querySelector(".close-detail");

        // --- OPEN LOGIC ---
        showBtn.onclick = (e) => {
            console.log(e)
            e.preventDefault();
            e.stopPropagation();
            overlayMain.classList.add("active-detail-main");
            if (wrapper) wrapper.classList.add("active-detail");
            document.body.style.overflow = 'hidden'; // Lock background scroll
        };

        // --- CLOSE LOGIC ---
        const closeAction = () => {
            if (wrapper) wrapper.classList.remove("active-detail");
            overlayMain.classList.remove("active-detail-main");
            document.body.style.overflow = 'auto'; // Restore scroll
        };

        if (hideBtn) hideBtn.onclick = closeAction;

        // Close on clicking the dark background (scrim)
        overlayMain.onclick = (e) => {
            if (e.target === overlayMain) closeAction();
        };
    });
}

