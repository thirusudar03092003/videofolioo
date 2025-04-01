// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Enable tooltips
  var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
  var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl)
  });

  // Auto-close alerts after 5 seconds
  setTimeout(function() {
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(function(alert) {
      const bsAlert = new bootstrap.Alert(alert);
      bsAlert.close();
    });
  }, 5000);

  // Handle project reordering if jQuery UI is available
  if (typeof $ !== 'undefined' && $.fn.sortable) {
    $("#sortable-projects").sortable({
      placeholder: "sortable-placeholder",
      update: function(event, ui) {
        const projects = [];
        
        // Get the new order
        $(this).find('.col-md-4').each(function(index) {
          projects.push({
            id: $(this).data('id'),
            order: index
          });
        });
        
        // Save the new order via AJAX
        $.ajax({
          url: '/projects/reorder',
          method: 'PUT',
          data: { projects: projects },
          success: function(response) {
            if (response.success) {
              // Show success message
              const alertHtml = `
                <div class="alert alert-success alert-dismissible fade show" role="alert">
                  Project order updated successfully
                  <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                </div>
              `;
              $('#sortable-projects').before(alertHtml);
              
              // Auto-close alert
              setTimeout(function() {
                $('.alert').alert('close');
              }, 3000);
            }
          },
          error: function() {
            // Show error message
            const alertHtml = `
              <div class="alert alert-danger alert-dismissible fade show" role="alert">
                Failed to update project order
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
              </div>
            `;
            $('#sortable-projects').before(alertHtml);
          }
        });
      }
    });
  }
});
