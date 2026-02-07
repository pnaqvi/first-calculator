/**
 * Main Application Module
 * Handles tab navigation and module initialization
 */
(function() {
    // DOM Elements
    const tabButtons = document.querySelectorAll('.tab-btn');
    const sections = document.querySelectorAll('.calculator-section');

    // Switch tab
    function switchTab(tabName) {
        // Update buttons
        tabButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });

        // Update sections
        sections.forEach(section => {
            section.classList.toggle('active', section.id === tabName);
        });

        // Store active tab
        localStorage.setItem('activeCalculatorTab', tabName);
    }

    // Setup tab navigation
    function setupTabs() {
        tabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                switchTab(btn.dataset.tab);
            });
        });

        // Restore last active tab
        const savedTab = localStorage.getItem('activeCalculatorTab');
        if (savedTab && document.getElementById(savedTab)) {
            switchTab(savedTab);
        }
    }

    // Initialize all modules
    function init() {
        setupTabs();
        StandardCalculator.init();
        ScientificCalculator.init();
        GraphingCalculator.init();
    }

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
