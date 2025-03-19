// Utility functions for the application

// General utilities
export const Utils = {
    // Copy text to clipboard
    copyToClipboard: async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (error) {
            console.error('Copy to clipboard failed:', error);
            return false;
        }
    },
    
    // Format string to title case
    toTitleCase: (str) => {
        return str.replace(/\w\S*/g, (txt) => {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
    },
    
    // Format kebab-case to camelCase
    toCamelCase: (str) => {
        return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
    },
    
    // Format kebab-case to PascalCase
    toPascalCase: (str) => {
        const camelCase = str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
        return camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
    },
    
    // Debounce function to limit rapid function calls
    debounce: (func, timeout = 300) => {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => { func.apply(this, args); }, timeout);
        };
    },
    
    // Format hex color code
    formatHexColor: (color) => {
        // Add # if missing
        if (color.charAt(0) !== '#') {
            color = '#' + color;
        }
        
        // Check if valid hex color
        const isValid = /^#([0-9A-F]{3}){1,2}$/i.test(color);
        return isValid ? color : '#000000';
    },
    
    // Validate hex color
    isValidHexColor: (color) => {
        return /^#([0-9A-F]{3}){1,2}$/i.test(color);
    }
};

// SVG specific utilities
export const SvgUtils = {
    // Create SVG element from SVG content
    createSvgElementFromText: (svgText, color = 'currentColor', size = 24) => {
        // Create a temporary DOM element
        const div = document.createElement('div');
        div.innerHTML = svgText.trim();
        
        // Get the SVG element
        const svgElement = div.querySelector('svg');
        if (!svgElement) {
            console.error('No SVG element found in SVG text');
            return null;
        }
        
        // Set attributes
        svgElement.setAttribute('width', size);
        svgElement.setAttribute('height', size);
        svgElement.setAttribute('fill', color);
        
        return svgElement;
    },
    
    // Generate SVG code string for display and copying
    generateSvgCode: (svgText, color = 'currentColor') => {
        // Create a temporary DOM element
        const div = document.createElement('div');
        div.innerHTML = svgText.trim();
        
        // Get the SVG element
        const svgElement = div.querySelector('svg');
        if (!svgElement) {
            console.error('No SVG element found in SVG text');
            return '';
        }
        
        // Set color
        svgElement.setAttribute('fill', color);
        
        // Return formatted SVG string
        return div.innerHTML;
    },
    
    // Generate JSX code string
    generateJsxCode: (svgText, iconName) => {
        // Create a temporary DOM element
        const div = document.createElement('div');
        div.innerHTML = svgText.trim();
        
        // Get the SVG element
        const svgElement = div.querySelector('svg');
        if (!svgElement) {
            console.error('No SVG element found in SVG text');
            return '';
        }
        
        // Get viewBox
        const viewBox = svgElement.getAttribute('viewBox') || '0 0 24 24';
        
        // Get inner content
        const innerContent = svgElement.innerHTML.trim();
        
        // Generate component name
        const componentName = Utils.toPascalCase(iconName);
        
        return `export function ${componentName}Icon(props) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="${viewBox}" 
      width={24} 
      height={24} 
      fill="currentColor" 
      {...props}
    >
      ${innerContent}
    </svg>
  );
}`
    },
    
    // Extract viewBox from SVG
    getViewBox: (svgText) => {
        // Create a temporary DOM element
        const div = document.createElement('div');
        div.innerHTML = svgText.trim();
        
        // Get the SVG element
        const svg = div.querySelector('svg');
        if (!svg) {
            return '0 0 24 24';
        }
        
        return svg.getAttribute('viewBox') || '0 0 24 24';
    }
};