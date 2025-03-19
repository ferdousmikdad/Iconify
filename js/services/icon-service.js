// Service for handling icons data and operations
export class IconService {
    constructor() {
        this.solidIconsUrl = 'data/solid.json';
        this.strokeIconsUrl = 'data/stroke.json';
        this.customIconsUrl = 'data/custom.json';
    }

    // Fetch icons from all JSON files
    async fetchIcons() {
        try {
            // Fetch solid icons
            const solidResponse = await fetch(this.solidIconsUrl);
            let solidIcons = [];
            let solidCategories = [];
            if (solidResponse.ok) {
                const solidData = await solidResponse.json();
                solidIcons = solidData.items || [];
                solidCategories = solidData.categories || [];
                
                // Ensure solid category is set
                solidIcons = solidIcons.map(icon => ({
                    ...icon,
                    category: 'solid',
                    subcategory: icon.subcategory || 'general'
                }));
            } else {
                console.warn(`Failed to fetch solid icons: ${solidResponse.status}`);
            }
            
            // Fetch stroke icons
            const strokeResponse = await fetch(this.strokeIconsUrl);
            let strokeIcons = [];
            let strokeCategories = [];
            if (strokeResponse.ok) {
                const strokeData = await strokeResponse.json();
                strokeIcons = strokeData.items || [];
                strokeCategories = strokeData.categories || [];
                
                // Ensure stroke category is set
                strokeIcons = strokeIcons.map(icon => ({
                    ...icon,
                    category: 'stroke',
                    subcategory: icon.subcategory || 'general'
                }));
            } else {
                console.warn(`Failed to fetch stroke icons: ${strokeResponse.status}`);
            }
            
            // Fetch custom icons
            const customResponse = await fetch(this.customIconsUrl);
            let customIcons = [];
            let customCategories = [];
            if (customResponse.ok) {
                const customData = await customResponse.json();
                customIcons = customData.items || [];
                customCategories = customData.categories || [];
            } else {
                console.warn(`Failed to fetch custom icons: ${customResponse.status}`);
            }
            
            // Combine icons and categories
            const allIcons = [...solidIcons, ...strokeIcons, ...customIcons];
            
            // If all fetches failed, fallback to sample data
            if (allIcons.length === 0) {
                console.warn('No icons loaded from files, using sample data');
                return this.getSampleIconData();
            }
            
            // Create categories based on subcategories from icons
            const categories = [
                ...solidCategories, 
                ...strokeCategories,
                ...customCategories
            ];
            
            // Add subcategories if they don't already exist
            const subcategories = this.extractSubcategories(allIcons);
            
            return {
                items: allIcons,
                categories: this.combineCategories(categories),
                subcategories: subcategories
            };
        } catch (error) {
            console.error('Error fetching icons:', error);
            // Return sample data as fallback
            return this.getSampleIconData();
        }
    }

    // Extract subcategories from icons
    extractSubcategories(icons) {
        const subcategoryMap = new Map();
        
        icons.forEach(icon => {
            if (icon.subcategory) {
                const subcatId = icon.subcategory.toLowerCase().replace(/\s+/g, '-');
                
                if (!subcategoryMap.has(subcatId)) {
                    subcategoryMap.set(subcatId, {
                        id: subcatId,
                        name: icon.subcategory,
                        count: 1
                    });
                } else {
                    const subcat = subcategoryMap.get(subcatId);
                    subcat.count += 1;
                }
            }
        });
        
        return Array.from(subcategoryMap.values());
    }

    // Combine categories ensuring uniqueness
    combineCategories(categories) {
        const categoryMap = new Map();
        
        // Add base categories
        categoryMap.set('solid', {
            id: 'solid',
            name: 'Solid Icons',
            count: 0,
            icon: 'home'
        });
        
        categoryMap.set('stroke', {
            id: 'stroke',
            name: 'Stroke Icons',
            count: 0,
            icon: 'heart'
        });
        
        // Add additional categories
        categories.forEach(category => {
            if (category.id && !categoryMap.has(category.id)) {
                categoryMap.set(category.id, {
                    ...category,
                    count: category.count || 0
                });
            }
        });
        
        return Array.from(categoryMap.values());
    }

    // Load a single SVG (either from inline data or file)
    async loadSvg(icon) {
        try {
            // If icon has inline SVG data, use that
            if (icon.svg) {
                console.log(`Using inline SVG for ${icon.name}`);
                
                // Process SVG content to ensure compatibility
                let svgContent = icon.svg;
                
                // Add namespace if missing
                if (!svgContent.includes('xmlns=')) {
                    svgContent = svgContent.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
                }
                
                // Remove any width/height attributes
                svgContent = svgContent.replace(/\s+width=["'][^"']*["']/g, '');
                svgContent = svgContent.replace(/\s+height=["'][^"']*["']/g, '');
                
                // Ensure it has a viewBox
                if (!svgContent.includes('viewBox=')) {
                    svgContent = svgContent.replace('<svg', '<svg viewBox="0 0 24 24"');
                }
                
                return svgContent;
            }
            
            // If no inline SVG, try to load from file path
            if (icon.filePath) {
                console.log(`Trying to load SVG from: ${icon.filePath}`);
                
                // Handle relative paths
                let path = icon.filePath;
                if (path.startsWith('../')) {
                    path = path.substring(3);  // Remove '../' prefix
                } else if (path.startsWith('./')) {
                    path = path.substring(2);  // Remove './' prefix
                }
                
                console.log(`Adjusted path: ${path}`);
                
                const response = await fetch(path);
                console.log(`Fetch response status: ${response.status}`);
                
                if (!response.ok) {
                    throw new Error(`Failed to load SVG: ${response.status} ${response.statusText}`);
                }
                
                let svgContent = await response.text();
                
                // Process SVG content
                // Add namespace if missing
                if (!svgContent.includes('xmlns=')) {
                    svgContent = svgContent.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
                }
                
                // Remove any width/height attributes
                svgContent = svgContent.replace(/\s+width=["'][^"']*["']/g, '');
                svgContent = svgContent.replace(/\s+height=["'][^"']*["']/g, '');
                
                // Ensure it has a viewBox
                if (!svgContent.includes('viewBox=')) {
                    svgContent = svgContent.replace('<svg', '<svg viewBox="0 0 24 24"');
                }
                
                console.log(`SVG loaded successfully, content length: ${svgContent.length}`);
                return svgContent;
            }
            
            throw new Error('Icon has neither inline SVG nor file path');
        } catch (error) {
            console.error(`Error loading SVG for ${icon.name}:`, error);
            // Return fallback SVG
            return this.getFallbackSvg();
        }
    }

    // Get fallback SVG content
    getFallbackSvg() {
        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
        </svg>`;
    }

    // Get sample icon data (fallback if fetch fails)
    getSampleIconData() {
        return {
            "items": [
                {
                    "id": "home-solid",
                    "name": "home",
                    "description": "Home icon",
                    "category": "solid",
                    "subcategory": "interface",
                    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\"><path d=\"M12 2L2 9.5L3.5 11.5L5 10.5V19.5C5 20.05 5.196 20.5 5.588 20.85C5.979 21.2 6.45 21.375 7 21.375H17C17.55 21.375 18.021 21.2 18.412 20.85C18.804 20.5 19 20.05 19 19.5V10.5L20.5 11.5L22 9.5L12 2Z\"/></svg>"
                },
                {
                    "id": "search-solid",
                    "name": "search",
                    "description": "Search or magnifying glass",
                    "category": "solid",
                    "subcategory": "interface",
                    "filePath": "assets/solid/search.svg"
                },
                {
                    "id": "heart-stroke",
                    "name": "heart",
                    "description": "Heart or favorite",
                    "category": "stroke",
                    "subcategory": "interface",
                    "filePath": "assets/stroke/heart.svg"
                }
            ],
            "categories": [
                {
                    "id": "solid",
                    "name": "Solid Icons",
                    "count": 2,
                    "icon": "home"
                },
                {
                    "id": "stroke",
                    "name": "Stroke Icons",
                    "count": 1,
                    "icon": "heart"
                }
            ],
            "subcategories": [
                {
                    "id": "interface",
                    "name": "Interface",
                    "count": 3
                }
            ]
        };
    }
}