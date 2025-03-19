// State management for the application
export class AppState {
    constructor() {
        this.icons = [];
        this.categories = [];
        this.subcategories = [];
        this.filteredIcons = [];
        this.currentCategory = 'all';
        this.currentSubcategory = 'all';
        this.currentType = 'solid';
        this.currentColor = '#000000';
        this.currentSize = 24;
        this.searchQuery = '';
    }

    // Icon data management
    setIcons(iconData) {
        if (iconData && iconData.items) {
            this.icons = iconData.items;
            this.filteredIcons = [...this.icons];
        } else {
            this.icons = [];
            this.filteredIcons = [];
        }
        
        if (iconData && iconData.categories) {
            this.categories = iconData.categories;
        } else {
            this.categories = [];
        }
        
        if (iconData && iconData.subcategories) {
            this.subcategories = iconData.subcategories;
        } else {
            this.subcategories = [];
        }
    }

    // Filter settings
    setCategory(category) {
        this.currentCategory = category;
    }
    
    setSubcategory(subcategory) {
        this.currentSubcategory = subcategory;
    }

    setType(type) {
        this.currentType = type;
    }

    setColor(color) {
        this.currentColor = color;
    }

    setSize(size) {
        this.currentSize = size;
    }

    setSearchQuery(query) {
        this.searchQuery = query;
    }

    // Apply all filters
    applyFilters() {
        this.filteredIcons = this.icons.filter(icon => {
            // Filter by main category
            const categoryMatch = this.currentCategory === 'all' || 
                                 icon.category === this.currentCategory;
            
            // Filter by subcategory
            const subcategoryMatch = this.currentSubcategory === 'all' || 
                                    (icon.subcategory && icon.subcategory.toLowerCase() === this.currentSubcategory);
            
            // Filter by type (solid or stroke)
            const typeMatch = this.currentType === 'all' || 
                             (this.currentType === 'solid' && icon.category === 'solid') || 
                             (this.currentType === 'stroke' && icon.category === 'stroke');
            
            // Filter by search query (search in name, description, and tags)
            const searchMatch = this.searchQuery === '' || 
                icon.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                (icon.description && icon.description.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
                (icon.subcategory && icon.subcategory.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
                (icon.tags && icon.tags.some(tag => tag.toLowerCase().includes(this.searchQuery.toLowerCase())));
                
            return categoryMatch && subcategoryMatch && typeMatch && searchMatch;
        });
        
        return this.filteredIcons;
    }

    // Get a single icon by id
    getIconById(id) {
        return this.icons.find(icon => icon.id === id);
    }
    
    // Get subcategories for a specific category
    getSubcategoriesForCategory(category) {
        if (category === 'all') {
            return this.subcategories;
        }
        
        // Get all subcategories used by icons in this category
        const subcategoryIds = new Set();
        this.icons
            .filter(icon => icon.category === category)
            .forEach(icon => {
                if (icon.subcategory) {
                    subcategoryIds.add(icon.subcategory.toLowerCase().replace(/\s+/g, '-'));
                }
            });
        
        // Filter subcategories to only those in this category
        return this.subcategories.filter(subcat => subcategoryIds.has(subcat.id));
    }
}