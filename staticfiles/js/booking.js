const productionServices = {
    'cinema': [
        'Feature Film Production',
        'Short Film',
        'Documentary',
        'Scriptwriting & Storyboarding',
        'Post-Production & Color Grading'
    ],
    'music': [
        'Official Music Video',
        'Behind the Scenes (BTS)',
        'Live Performance Session',
        'Artist Promo Loops'
    ],
    'photography': [
        'Cinematic Portraiture',
        'Event & Red Carpet Stills',
        'Commercial Product Shots',
        'Fashion & Editorial',
    ],
    'commercial': [
        'Corporate Brand Story',
        'Social Media Ad Campaign',
        'Real Estate Cinematic Tour',
        'Interview / Podcast Setup'
    ],
    'event': [
        'Wedding or Engagement Coverage',
        'Corporate Gala & Awards',
        'Art Outreach & Workshops', // Reflecting your outreach experience
        'Music Festival Aftermovie',
        'Keynote & Conference Coverage'
    ],
};

function updateSubCategories() {
    const mainCat = document.getElementById('main-category').value;
    const subWrap = document.getElementById('sub-category-wrap');
    const subSelect = document.getElementById('sub-category');

    // Reset and Animate
    subSelect.innerHTML = '';
    
    if (productionServices[mainCat]) {
        // Show the sub-category with a neat transition
        subWrap.style.display = 'block';
        subWrap.classList.add('fade-in-up');

        productionServices[mainCat].forEach(service => {
            const opt = document.createElement('option');
            opt.value = service.toLowerCase().replace(/\s+/g, '-');
            opt.innerText = service;
            subSelect.appendChild(opt);
        });
    } else {
        subWrap.style.display = 'none';
    }
}

    document.getElementById('production-booking-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const form = this;
    const btn = document.getElementById('bk-sub');
    
    // Defensive check: ensure the button exists before looking for .btn-text
    if (!btn) {
        console.error("Button with ID 'prd-submit-btn' not found.");
        return;
    }
    
    const btnText = btn.querySelector('.btn-text');
    
    // 1. Enter Loading State
    if (btnText) btnText.innerText = "INITIATING BRIEF...";
    btn.style.opacity = "0.6";
    btn.style.pointerEvents = "none";

    // 2. Data Preparation
    const formData = new FormData(form);
    const csrftoken = form.querySelector('[name=csrfmiddlewaretoken]')?.value;

    // 3. Fetch call
    fetch('/submit-booking/', { // Ensure this matches your urls.py
        method: 'POST',
        body: formData,
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRFToken': csrftoken
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showToast("SUCCESS: Form Submitted Successfully. We will be in touch shortly. Thank you!", "success");
            form.reset();
            
        } else {
            showToast(`ERROR: ${data.error || 'INVALID DATA'}`, "error");
        }
    })
    .catch(err => {
        showToast("CONNECTION TIMEOUT - TRY AGAIN", "error");
    })
    .finally(() => {
        setTimeout(() => {
            if (btnText) btnText.innerText = "SUBMIT";
            btn.style.opacity = "1";
            btn.style.pointerEvents = "all";
        }, 600);
    });
});

function showToast(message, type) {
    const toast = document.getElementById('bk-status-toast');
    if (!toast) {
        alert(message); // Fallback if toast element is missing
        return;
    }
    toast.innerText = message;
    toast.className = `bstatus-toast show ${type}`;
    setTimeout(() => toast.classList.remove('show'), 4000);
}
