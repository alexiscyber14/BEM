function scrollToSection(type) {
    let target;
    if(type === 'recap') target = document.querySelector('.recap-section'); // First section
    if(type === 'high') target = document.querySelectorAll('.recap-section')[1]; // Second section
    if(type === 'stills') target = document.querySelector('.stills-section'); // Placeholder for next section
    
    if(target) {
        target.scrollIntoView({ behavior: 'smooth' });
    }
}


let videoPlayers = {};
let progressIntervals = {};

// 1. YouTube API Initialization
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

function extractVideoID(url) {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length == 11) ? match[7] : url;
}

function onYouTubeIframeAPIReady() {
    document.querySelectorAll('.yt-player-element').forEach((el) => {
        // Extracts the key (e.g., 'recap-1' or 'high-1') from the ID 'player-recap-1'
        const playerKey = el.id.split('player-')[1]; 
        const videoId = extractVideoID(el.getAttribute('data-video-link'));

        videoPlayers[playerKey] = new YT.Player(el.id, {
            videoId: videoId,
            playerVars: { 'controls': 0, 'modestbranding': 1, 'rel': 0, 'showinfo': 0, 'iv_load_policy': 3, 'vq': 'hd1080' },
            events: {
                    'onReady': (event) => { 
                        event.target.setVolume(50);
                        // Force the high quality on ready
                        if (event.target.setPlaybackQuality) {
                            event.target.setPlaybackQuality('highres'); 
                        }
                    },
                    'onStateChange': (event) => onPlayerStateChange(event, playerKey)
                }
        });
    });
}

// 2. Playback Controls
function playProjectVideo(key) {
    stopAllVideos(key);
    if(videoPlayers[key]) videoPlayers[key].playVideo();
}

function togglePlayPause(key) {
    const player = videoPlayers[key];
    const state = player.getPlayerState();
    if (state === YT.PlayerState.PLAYING) {
        player.pauseVideo();
    } else {
        stopAllVideos(key);
        player.playVideo();
    }
}

function stopAllVideos(exceptKey = null) {
    Object.keys(videoPlayers).forEach(key => {
        if (key !== exceptKey && videoPlayers[key].pauseVideo) {
            videoPlayers[key].pauseVideo();
        }
    });
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

// 4. Interface Updates
function onPlayerStateChange(event, key) {
    const overlay = document.getElementById(`interface-${key}`);
    const playPauseBtn = document.getElementById(`play-pause-${key}`);
    
    const pauseIcon = `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`;
    const playIcon = `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>`;

    if (event.data === YT.PlayerState.PLAYING) {
        event.target.setPlaybackQuality('highres');
        overlay.classList.add('is-playing');
        playPauseBtn.innerHTML = pauseIcon;
        
        progressIntervals[key] = setInterval(() => {
            const current = event.target.getCurrentTime();
            const total = event.target.getDuration();
            const progBar = document.getElementById(`progress-${key}`);
            if(progBar) progBar.value = (current / total) * 100;
        }, 1000);
    } else {
        overlay.classList.remove('is-playing');
        playPauseBtn.innerHTML = playIcon;
        clearInterval(progressIntervals[key]);
    }
}
detailOverlay();

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
