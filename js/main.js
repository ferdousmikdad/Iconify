// Main app entry point
// Import modules
import { AppState } from './state.js';
import { UIManager } from './ui.js';
import { IconService } from './services/icon-service.js';
import { Utils } from './utils.js';

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.init();
});

class App {
    constructor() {
        // Initialize core components
        this.state = new AppState();
        this.iconService = new IconService();
        this.ui = new UIManager(this.state, this.iconService);
        this.utils = Utils;
    }

    async init() {
        try {
            console.log('Initializing IconVault...');
            
            // Show loading indicator
            this.showLoadingIndicator(true);
            
            // Load icons
            const loaded = await this.loadIcons();
            if (!loaded) {
                throw new Error('Failed to load icon data');
            }
            
            // Initialize UI
            this.ui.renderCategories();
            await this.ui.renderIcons();
            this.ui.updateStats();
            
            // Set up event listeners
            this.ui.setupEventListeners();
            
            // Hide loading indicator
            this.showLoadingIndicator(false);
            
            console.log('IconVault initialized successfully');
        } catch (error) {
            console.error('Initialization error:', error);
            this.ui.showToast('Failed to load icons: ' + error.message, 'error');
            
            // Hide loading indicator
            this.showLoadingIndicator(false);
        }
    }

    async loadIcons() {
        try {
            console.log('Loading icon data...');
            const iconData = await this.iconService.fetchIcons();
            console.log('Icon data loaded:', iconData);
            
            if (!iconData || !iconData.items || iconData.items.length === 0) {
                console.error('No icon data found or empty data returned');
                return false;
            }
            
            this.state.setIcons(iconData);
            return true;
        } catch (error) {
            console.error('Error loading icons:', error);
            throw error;
        }
    }
    
    // Show/hide loading indicator
    showLoadingIndicator(show) {
        // Check if loading indicator exists
        let loadingEl = document.getElementById('loading-indicator');
        
        if (show) {
            // Create if it doesn't exist
            if (!loadingEl) {
                loadingEl = document.createElement('div');
                loadingEl.id = 'loading-indicator';
                loadingEl.className = 'fixed inset-0 bg-white bg-opacity-80 z-50 flex items-center justify-center';
                loadingEl.innerHTML = `
                    <div class="text-center">
                        <svg class="animate-spin h-10 w-10 text-primary mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p class="mt-3 text-gray-700">Loading icons...</p>
                    </div>
                `;
                document.body.appendChild(loadingEl);
            }
            loadingEl.style.display = 'flex';
        } else if (loadingEl) {
            // Hide if it exists
            loadingEl.style.display = 'none';
        }
    }
}