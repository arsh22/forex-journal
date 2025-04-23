document.addEventListener('DOMContentLoaded', function() {
  // Set today's date as default in the trade form
  const dateInput = document.getElementById('date');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
  }
  
  // Form validation
  const tradeForm = document.getElementById('tradeForm');
  if (tradeForm) {
    tradeForm.addEventListener('submit', function(e) {
      const requiredFields = this.querySelectorAll('[required]');
      let isValid = true;
      
      requiredFields.forEach(field => {
        if (!field.value.trim()) {
          field.style.borderColor = '#e74c3c';
          isValid = false;
        }
      });
      
      if (!isValid) {
        e.preventDefault();
        alert('Please fill all required fields');
      }
    });
    
    // Reset field borders when user starts typing
    const fields = tradeForm.querySelectorAll('input, textarea, select');
    fields.forEach(field => {
      field.addEventListener('input', function() {
        this.style.borderColor = '';
      });
    });
  }
  
  // Image modal functionality
  const modal = document.getElementById('imageModal');
  if (modal) {
    const modalImg = document.getElementById('modalImage');
    const captionText = document.getElementById('caption');
    
    // Get all trade images and add click event
    const tradeImages = document.querySelectorAll('.trade-image');
    
    tradeImages.forEach(img => {
      img.addEventListener('click', function() {
        modal.style.display = 'block';
        modalImg.src = this.src;
        captionText.innerHTML = this.alt || 'Trade screenshot';
      });
    });
    
    // Close modal
    const span = document.getElementsByClassName('close')[0];
    
    span.addEventListener('click', function() {
      modal.style.display = 'none';
    });
    
    // Also close when clicking outside the image
    modal.addEventListener('click', function(event) {
      if (event.target === modal) {
        modal.style.display = 'none';
      }
    });
    
    // Close with ESC key
    document.addEventListener('keydown', function(event) {
      if (event.key === 'Escape') {
        modal.style.display = 'none';
      }
    });
  }
  
  // Expand/collapse trade descriptions
  document.querySelectorAll('.trade-description').forEach(desc => {
    desc.addEventListener('click', function() {
      this.classList.toggle('expanded');
    });
  });
});