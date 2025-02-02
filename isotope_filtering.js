$(document).ready(function() {
    console.log('Initializing isotype filtering...');

    // Initialize Isotope
    var grid = document.querySelector('.isogrid');
    var iso = new Isotope(grid, {
        itemSelector: '.isogrid-item',
        layoutMode: 'fitRows'
    });

    // Store filter for each group
    var filters = {};

    // Click handler
    $('.filters-btn-group .btn').on('click', function(event) {
        var $button = $(this);
        console.log('Button clicked');

        // Get the filter group and value
        var $buttonGroup = $button.parents('.filters-btn-group');
        var filterGroup = $buttonGroup.attr('data-filter-group');
        var filterValue = $button.attr('data-filter');

        console.log('Group:', filterGroup, 'Value:', filterValue);

        // Store the filter value for this group
        filters[filterGroup] = filterValue;

        // Combine all filter values
        var combinedFilter = '';
        for (var group in filters) {
            combinedFilter += filters[group];
        }

        console.log('Combined filter:', combinedFilter);

        // Apply combined filter
        iso.arrange({ filter: combinedFilter });

        // Update active class
        $buttonGroup.find('.active').removeClass('active');
        $button.addClass('active');
    });
});
