
document.addEventListener('DOMContentLoaded', function() {

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const group = entry.target.querySelector('.text-group');
      if (entry.isIntersecting && group) {
        group.style.opacity = "1";
        group.style.transform = "translateX(0)";
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.niche-service-card').forEach(card => {
    const group = card.querySelector('.text-group');

    if (!group) return;

    group.style.opacity = "0";
    group.style.transform = "translateX(-50px)";
    group.style.transition = "all 0.8s ease-out";

    observer.observe(card);
  });

});

document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('offerModal');
    const form = document.getElementById('ajax-offer-form');
    const statusBox = document.getElementById('form-status');

    // 1. Capture the Data-Offer from buttons
    document.querySelectorAll('.niche-btn').forEach(btn => {
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

        fetch('/submit-service/', { // Replace with your Django URL
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
