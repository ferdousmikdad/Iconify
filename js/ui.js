// UI Management for the application
import { Utils, SvgUtils } from './utils.js';

export class UIManager {
    constructor(state, iconService) {
        this.state = state;
        this.iconService = iconService;
        this.iconCache = {}; // Cache for loaded SVGs
        
        // DOM Elements
        this.elements = {
            iconsGrid: document.getElementById('iconsGrid'),
            categoryFilter: document.getElementById('categoryFilter'),
            subcategoryFilter: document.getElementById('subcategoryFilter'),
            mainSearchInput: document.getElementById('mainSearchInput'),
            iconCount: document.getElementById('iconCount'),
            totalCount: document.getElementById('totalCount'),
            visibleCount: document.getElementById('visibleCount'),
            sizeRange: document.getElementById('sizeRange'),
            sizeValue: document.getElementById('sizeValue'),
            colorButtons: document.querySelectorAll('[data-color]'),
            customColor: document.getElementById('customColor'),
            hexColor: document.getElementById('hexColor'),
            iconModal: document.getElementById('iconModal'),
            closeModal: document.getElementById('closeModal'),
            modalTitle: document.getElementById('modalTitle'),
            previewIcon: document.getElementById('previewIcon'),
            svgCode: document.getElementById('svgCode'),
            jsxCode: document.getElementById('jsxCode'),
            copySvg: document.getElementById('copySvg'),
            copyJsx: document.getElementById('copyJsx'),
            solidFilterBtn: document.getElementById('solidFilterBtn'),
            strokeFilterBtn: document.getElementById('strokeFilterBtn')
        };
    }

    // Render categories in the dropdown (removed sidebar rendering)
    renderCategories() {
        // Add 'All' option
        const categories = [
            {id: 'all', name: 'All Icons'}, 
            ...this.state.categories
        ];
        
        // Clear and rebuild the categories dropdown
        this.elements.categoryFilter.innerHTML = '';
        
        // Add to category dropdown
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            if (this.state.currentCategory === category.id) {
                option.selected = true;
            }
            this.elements.categoryFilter.appendChild(option);
        });
        
        // Add event listener for category dropdown
        this.elements.categoryFilter.addEventListener('change', (e) => {
            this.state.setCategory(e.target.value);
            this.state.setSubcategory('all'); // Reset subcategory when changing category
            this.state.applyFilters();
            this.renderSubcategories(); // Update subcategory dropdown
            this.renderIcons();
            this.updateStats();
        });
        
        // Initial render of subcategories
        this.renderSubcategories();
    }
    
    // Render subcategories in the dropdown
    renderSubcategories() {
        // Get subcategories for the current category
        const subcategories = this.state.getSubcategoriesForCategory(this.state.currentCategory);
        
        // Add 'All' option
        const allSubcategories = [
            {id: 'all', name: 'All Subcategories'}, 
            ...subcategories
        ];
        
        // Clear the dropdown
        this.elements.subcategoryFilter.innerHTML = '';
        
        // Add options to dropdown
        allSubcategories.forEach(subcategory => {
            const option = document.createElement('option');
            option.value = subcategory.id;
            option.textContent = subcategory.name;
            if (this.state.currentSubcategory === subcategory.id) {
                option.selected = true;
            }
            this.elements.subcategoryFilter.appendChild(option);
        });
        
        // Add event listener for subcategory dropdown
        this.elements.subcategoryFilter.addEventListener('change', (e) => {
            this.state.setSubcategory(e.target.value);
            this.state.applyFilters();
            this.renderIcons();
            this.updateStats();
        });
    }

    // Update the active category highlight (simplified without sidebar)
    updateCategoryHighlight() {
        // Update dropdown
        this.elements.categoryFilter.value = this.state.currentCategory;
    }

    // Render the icons grid
    async renderIcons() {
        this.elements.iconsGrid.innerHTML = '';
        const icons = this.state.filteredIcons;
        
        if (icons.length === 0) {
            this.elements.iconsGrid.innerHTML = `
                <div class="col-span-full text-center py-10">
                    <svg class="w-16 h-16 mx-auto text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                    </svg>
                    <p class="mt-4 text-gray-500">No icons found matching your criteria</p>
                </div>
            `;
            return;
        }
        
        // Create a document fragment to avoid multiple DOM updates
        const fragment = document.createDocumentFragment();
        const loadPromises = [];
        
        // Create placeholders for all icons
        icons.forEach(icon => {
            const iconDiv = document.createElement('div');
            iconDiv.className = 'icon-item bg-white border border-gray-200 rounded-lg p-4 flex flex-col items-center cursor-pointer relative';
            iconDiv.setAttribute('data-id', icon.id);
            
            // Create placeholder structure
            iconDiv.innerHTML = `
                <div class="flex justify-center items-center h-20 w-full mb-3 svg-container">
                    <div class="animate-pulse bg-gray-200 w-16 h-16 rounded"></div>
                </div>
                <div class="mt-2 text-center">
                    <p class="text-sm font-medium truncate w-full text-gray-900">
                        ${Utils.toTitleCase(icon.name)}
                    </p>
                </div>
                <div class="icon-actions">
                    <button class="download-svg-btn bg-gray-800 hover:bg-gray-900 text-white text-xs py-2 px-4 rounded w-40 flex items-center justify-center gap-2"
                        data-id="${icon.id}">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download SVG
                    </button>
                    <div class="dropdown w-40">
                        <button class="copy-svg-btn bg-white border border-gray-300 hover:bg-gray-100 text-gray-800 text-xs py-2 px-4 rounded w-full flex items-center justify-center gap-2"
                            data-id="${icon.id}">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            Copy SVG
                            <svg class="w-4 h-4 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        <div class="dropdown-content">
                            <a href="#" class="copy-jsx-btn flex items-center gap-2" data-id="${icon.id}">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                </svg>
                                Copy JSX
                            </a>
                        </div>
                    </div>
                </div>
            `;
            
            fragment.appendChild(iconDiv);
            
            // Create a promise to load the SVG
            const loadPromise = this.loadIconSvg(icon, iconDiv);
            loadPromises.push(loadPromise);
        });
        
        this.elements.iconsGrid.appendChild(fragment);
        
        // Load all SVGs in parallel
        Promise.allSettled(loadPromises).then(() => {
            console.log('All icons loaded or attempted to load');
        });
        
        // Set up event listeners after rendering
        this.setupIconEventListeners();
    }

    // Set up event listeners for the icons
    setupIconEventListeners() {
        // Set up download button functionality
        document.querySelectorAll('.download-svg-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const iconId = button.getAttribute('data-id');
                const icon = this.state.getIconById(iconId);
                if (icon) {
                    this.downloadSvg(icon);
                }
            });
        });
        
        // Set up copy SVG functionality
        document.querySelectorAll('.copy-svg-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const iconId = button.getAttribute('data-id');
                const icon = this.state.getIconById(iconId);
                if (icon) {
                    this.copySvgToClipboard(icon);
                }
            });
        });
        
        // Set up copy JSX functionality
        document.querySelectorAll('.copy-jsx-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const iconId = button.closest('.dropdown').querySelector('.copy-svg-btn').getAttribute('data-id');
                const icon = this.state.getIconById(iconId);
                if (icon) {
                    this.copyJsxToClipboard(icon);
                }
            });
        });
        
        // Set up click on icon to open modal
        document.querySelectorAll('.icon-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (!e.target.closest('.download-svg-btn') && 
                    !e.target.closest('.copy-svg-btn') && 
                    !e.target.closest('.copy-jsx-btn') &&
                    !e.target.closest('.dropdown-content')) {
                    
                    const iconId = item.getAttribute('data-id');
                    const icon = this.state.getIconById(iconId);
                    if (icon) {
                        this.openIconModal(icon);
                    }
                }
            });
        });
    }
    
    // Load SVG for an icon
    async loadIconSvg(icon, iconDiv) {
        try {
            // Get SVG content (from cache or fetch new)
            let svgContent;
            if (this.iconCache[icon.id]) {
                svgContent = this.iconCache[icon.id];
            } else {
                svgContent = await this.iconService.loadSvg(icon);
                if (svgContent) {
                    this.iconCache[icon.id] = svgContent;
                } else {
                    throw new Error(`Failed to load SVG for ${icon.name}`);
                }
            }
            
            // Create SVG element
            const svgElement = SvgUtils.createSvgElementFromText(
                svgContent, 
                this.state.currentColor,
                this.state.currentSize
            );
            
            if (!svgElement) {
                throw new Error(`Could not create SVG element for ${icon.name}`);
            }
            
            // Replace placeholder with actual SVG
            const svgContainer = iconDiv.querySelector('.svg-container');
            svgContainer.innerHTML = '';
            svgContainer.appendChild(svgElement);
            
            return true;
        } catch (error) {
            console.error(`Error loading icon ${icon.name}:`, error);
            
            // Replace placeholder with error state
            const svgContainer = iconDiv.querySelector('.svg-container');
            svgContainer.innerHTML = `
                <svg class="w-10 h-10 text-gray-300" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
            `;
            
            return false;
        }
    }

    // Download SVG
    async downloadSvg(icon) {
        try {
            if (!this.iconCache[icon.id]) {
                const svgContent = await this.iconService.loadSvg(icon);
                if (svgContent) {
                    this.iconCache[icon.id] = svgContent;
                } else {
                    throw new Error('Failed to load icon');
                }
            }
            
            const svg = SvgUtils.generateSvgCode(this.iconCache[icon.id], this.state.currentColor);
            
            // Create a blob from the SVG content
            const blob = new Blob([svg], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(blob);
            
            // Create a temporary link to download the file
            const link = document.createElement('a');
            link.href = url;
            link.download = `${icon.name}.svg`;
            document.body.appendChild(link);
            link.click();
            
            // Clean up
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            this.showToast('SVG downloaded!');
        } catch (error) {
            console.error('Failed to download SVG:', error);
            this.showToast('Failed to download SVG', 'error');
        }
    }

    // Open icon modal
    async openIconModal(icon) {
        try {
            // Load SVG if not cached
            if (!this.iconCache[icon.id]) {
                const svgContent = await this.iconService.loadSvg(icon);
                if (svgContent) {
                    this.iconCache[icon.id] = svgContent;
                } else {
                    throw new Error('Failed to load icon');
                }
            }
            
            const svgContent = this.iconCache[icon.id];
            
            // Set modal title
            this.elements.modalTitle.textContent = Utils.toTitleCase(icon.name);
            
            // Create preview SVG
            const svgElement = SvgUtils.createSvgElementFromText(
                svgContent, 
                this.state.currentColor,
                96 // Preview is larger
            );
            
            // Set preview content
            this.elements.previewIcon.innerHTML = '';
            if (svgElement) {
                this.elements.previewIcon.appendChild(svgElement);
            } else {
                this.elements.previewIcon.innerHTML = `
                    <svg class="w-24 h-24 text-gray-300" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                    </svg>
                    <p class="text-gray-500 mt-2">Icon preview unavailable</p>
                `;
            }
            
            // Generate code snippets
            const svgCode = SvgUtils.generateSvgCode(svgContent, this.state.currentColor);
            const jsxCode = SvgUtils.generateJsxCode(svgContent, icon.name);

            // Set code display
            this.elements.svgCode.textContent = svgCode;
            this.elements.jsxCode.textContent = jsxCode;
            
            // Show modal
            this.elements.iconModal.classList.remove('hidden');
            this.elements.iconModal.classList.add('flex');
        } catch (error) {
            console.error('Error opening modal:', error);
            this.showToast('Failed to load icon details', 'error');
        }
    }

    // Copy SVG to clipboard
    async copySvgToClipboard(icon) {
        try {
            if (!this.iconCache[icon.id]) {
                const svgContent = await this.iconService.loadSvg(icon);
                if (svgContent) {
                    this.iconCache[icon.id] = svgContent;
                } else {
                    throw new Error('Failed to load icon');
                }
            }
            
            const svg = SvgUtils.generateSvgCode(this.iconCache[icon.id], this.state.currentColor);
            
            const success = await Utils.copyToClipboard(svg);
            if (success) {
                this.showToast('SVG copied to clipboard!');
            } else {
                throw new Error('Copy operation failed');
            }
        } catch (error) {
            console.error('Failed to copy SVG:', error);
            this.showToast('Failed to copy to clipboard', 'error');
        }
    }

    // Copy JSX to clipboard
    async copyJsxToClipboard(icon) {
        try {
            if (!this.iconCache[icon.id]) {
                const svgContent = await this.iconService.loadSvg(icon);
                if (svgContent) {
                    this.iconCache[icon.id] = svgContent;
                } else {
                    throw new Error('Failed to load icon');
                }
            }
            
            const jsx = SvgUtils.generateJsxCode(this.iconCache[icon.id], icon.name);
            
            const success = await Utils.copyToClipboard(jsx);
            if (success) {
                this.showToast('JSX copied to clipboard!');
            } else {
                throw new Error('Copy operation failed');
            }
        } catch (error) {
            console.error('Failed to copy JSX:', error);
            this.showToast('Failed to copy to clipboard', 'error');
        }
    }

    // Update statistics
    updateStats() {
        const totalCount = this.state.icons.length;
        const visibleCount = this.state.filteredIcons.length;
        
        this.elements.totalCount.textContent = totalCount;
        this.elements.visibleCount.textContent = visibleCount;
        this.elements.iconCount.textContent = `(${visibleCount})`;
    }

    // Set up event listeners
    setupEventListeners() {
        // Search input
        this.elements.mainSearchInput.addEventListener('input', Utils.debounce((e) => {
            this.state.setSearchQuery(e.target.value);
            this.state.applyFilters();
            this.renderIcons();
            this.updateStats();
        }, 300));
        
        // Size range slider
        this.elements.sizeRange.addEventListener('input', (e) => {
            this.state.setSize(parseInt(e.target.value));
            this.elements.sizeValue.textContent = `${this.state.currentSize}px`;
            this.renderIcons();
        });
        
        // Color buttons
        this.elements.colorButtons.forEach(button => {
            button.addEventListener('click', () => {
                const color = button.dataset.color;
                this.state.setColor(color);
                this.elements.customColor.value = color;
                this.elements.hexColor.value = color;
                this.renderIcons();
            });
        });
        
        // Custom color picker
        this.elements.customColor.addEventListener('input', (e) => {
            const color = e.target.value;
            this.state.setColor(color);
            this.elements.hexColor.value = color;
            this.renderIcons();
        });
        
        // Hex color input
        this.elements.hexColor.addEventListener('input', (e) => {
            let color = e.target.value;
            // Add # if missing
            if (color.charAt(0) !== '#') {
                color = '#' + color;
            }
            if (Utils.isValidHexColor(color)) {
                this.state.setColor(color);
                this.elements.customColor.value = color;
                this.renderIcons();
            }
        });
        
        // Solid/Stroke filter buttons
        this.elements.solidFilterBtn.addEventListener('click', () => {
            this.setTypeFilter('solid');
        });
        
        this.elements.strokeFilterBtn.addEventListener('click', () => {
            this.setTypeFilter('stroke');
        });
        
        // Modal close button
        this.elements.closeModal.addEventListener('click', () => {
            this.elements.iconModal.classList.add('hidden');
            this.elements.iconModal.classList.remove('flex');
        });
        
        // Close modal when clicking outside
        this.elements.iconModal.addEventListener('click', (e) => {
            if (e.target === this.elements.iconModal) {
                this.elements.iconModal.classList.add('hidden');
                this.elements.iconModal.classList.remove('flex');
            }
        });
        
        // Copy buttons in modal
        this.elements.copySvg.addEventListener('click', () => {
            Utils.copyToClipboard(this.elements.svgCode.textContent)
                .then(() => this.showToast('SVG copied to clipboard!'))
                .catch(() => this.showToast('Failed to copy', 'error'));
        });
        
        this.elements.copyJsx.addEventListener('click', () => {
            Utils.copyToClipboard(this.elements.jsxCode.textContent)
                .then(() => this.showToast('JSX copied to clipboard!'))
                .catch(() => this.showToast('Failed to copy', 'error'));
        });
        
        // Handle Escape key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !this.elements.iconModal.classList.contains('hidden')) {
                this.elements.iconModal.classList.add('hidden');
                this.elements.iconModal.classList.remove('flex');
            }
        });
    }
    
    // Set type filter (solid/stroke)
    setTypeFilter(type) {
        this.state.setType(type);
        this.state.applyFilters();
        this.renderIcons();
        this.updateStats();
        
        // Update button states
        if (type === 'solid') {
            this.elements.solidFilterBtn.classList.remove('bg-white', 'text-gray-700', 'border');
            this.elements.solidFilterBtn.classList.add('bg-primary', 'text-white');
            this.elements.strokeFilterBtn.classList.remove('bg-primary', 'text-white');
            this.elements.strokeFilterBtn.classList.add('bg-white', 'text-gray-700', 'border', 'border-gray-300');
        } else {
            this.elements.strokeFilterBtn.classList.remove('bg-white', 'text-gray-700', 'border');
            this.elements.strokeFilterBtn.classList.add('bg-primary', 'text-white');
            this.elements.solidFilterBtn.classList.remove('bg-primary', 'text-white');
            this.elements.solidFilterBtn.classList.add('bg-white', 'text-gray-700', 'border', 'border-gray-300');
        }
    }

    // Show toast notification
    showToast(message, type = 'success') {
        // Remove any existing toasts
        const existingToast = document.querySelector('.toast');
        if (existingToast) {
            existingToast.remove();
        }
        
        // Create new toast
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.style.backgroundColor = type === 'success' ? '#10b981' : '#ef4444';
        toast.textContent = message;
        
        // Add to document
        document.body.appendChild(toast);
        
        // Trigger animation
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        // Auto remove
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 3000);
    }
}