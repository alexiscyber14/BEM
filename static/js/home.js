
    // Timecode Clock (HH:MM:SS:FF)
    function updateClock() {
        const now = new Date();
        const h = String(now.getHours()).padStart(2, '0');
        const m = String(now.getMinutes()).padStart(2, '0');
        const s = String(now.getSeconds()).padStart(2, '0');
        const f = String(Math.floor(Math.random() * 24)).padStart(2, '0');
        document.getElementById('digital-clock').innerText = `${h}:${m}:${s}:${f}`;
    }
    setInterval(updateClock, 40);


(function () {
    const elements = document.querySelectorAll(".reveal-text-two");

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("active");
            }
        });
    }, {
        threshold: 0.3
    });

    elements.forEach(el => observer.observe(el));
})();


    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.scroll-reveal').forEach(el => observer.observe(el));

document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('offerModal');
    const form = document.getElementById('ajax-offer-form');
    const statusBox = document.getElementById('form-status');

    // 1. Capture the Data-Offer from buttons
    document.querySelectorAll('.deal-btn').forEach(btn => {
        btn.onclick = function(e) {
            e.preventDefault();
            const offerTitle = this.getAttribute('data-offer');
            
            // Set values in the modal
            document.getElementById('hidden-offer-title').value = offerTitle;
            const cleanTitle = offerTitle.replace(/<br\s*\/?>/gi, ' ');
            document.getElementById('display-offer-title').innerText = cleanTitle.toUpperCase();

            
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden'; // Lock scroll
        };
    });

    // 2. Handle AJAX Submission
    form.onsubmit = function(e) {
        e.preventDefault();
        
        statusBox.style.display = 'block';
        statusBox.className = 'status-box'; // Reset classes
        statusBox.innerText = 'PROCESSING INQUIRY...';

        const formData = new FormData(this);

        fetch('/submit-offer/', { // Replace with your Django URL
            method: 'POST',
            body: formData,
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                statusBox.classList.add('status-success');
                statusBox.innerText = 'SUCCESS: Inquiry Submitted. We Will be in touch soon.';
                form.reset();
                setTimeout(() => { 
                    statusBox.innerText=' ';
                    closeOfferModal(); 
                }, 3000);
            } else {
                statusBox.classList.add('status-error');
                statusBox.innerText = 'ERROR: UNABLE TO SUBMIT. CHECK FIELDS.';
            }
        })
        .catch(err => {
            statusBox.classList.add('status-error');
            statusBox.innerText = 'CONNECTION ERROR. TRY AGAIN.';
        });
    };
});

function closeOfferModal() {
    document.getElementById('offerModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}
