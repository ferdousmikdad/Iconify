# IconVault - SVG Icon Library

A modern, responsive SVG icon library web application inspired by Heroicons. This application allows users to browse, search, and customize SVG icons, with features for copying SVG and JSX code.

## Features

- **Browse and Search Icons**: Easily find icons by category or using the search bar
- **Customize Icons**: Change color and size with real-time preview
- **Copy to Clipboard**: One-click copy for both SVG and JSX formats
- **Category Filtering**: Filter icons by categories
- **Type Filtering**: Filter by icon types (solid, outline, micro)
- **Admin Panel**: Upload and manage your own SVG icons
- **Responsive Design**: Works on all devices from mobile to desktop
- **Tailwind CSS**: Easy customization of UI colors using Tailwind config

## File Structure will be like this

```
📦 IconVault
 ┣ 📂 css
 ┃ ┗ 📜 styles.css          # Custom CSS styles
 ┣ 📂 data
 ┃ ┗ 📜 icons-solid.json          # Icon data storage
 ┃ ┗ 📜 icons-outline.json
 ┣ 📂 js
 ┃ ┣ 📂 services
 ┃ ┃ ┗ 📜 icon-service.js   # Icon data management
 ┃ ┣ 📜 admin.js            # Admin panel functionality
 ┃ ┣ 📜 main.js             # Main application entry point
 ┃ ┣ 📜 state.js            # Application state management
 ┃ ┣ 📜 ui.js               # UI rendering and management
 ┃ ┗ 📜 utils.js            # Utility functions
 ┣ 📂 assets
 ┃ ┗ 📂 solid    all icon in svg format ...
 ┃ ┗ 📂 stroke        # Any assets you want to add
 ┣ 📜 index.html            # Main HTML file
 ┗ 📜 README.md             # Project documentation
```

## How It Works

### Core Components

1. **HTML Structure (index.html)**

   - Main layout and UI elements
   - Navigation, search bar, icon grid, etc.
   - Modals for icon preview and admin panel

2. **Styling (css/styles.css)**

   - Custom styles that enhance Tailwind CSS
   - Animation and interactive elements
   - Responsive design adjustments

3. **JavaScript Modules**

   - **main.js**: Initializes the application
   - **state.js**: Manages application state
   - **ui.js**: Handles UI rendering and updates
   - **utils.js**: Utility functions for common operations
   - **services/icon-service.js**: Manages icon data operations
   - **admin.js**: Admin panel functionality

4. **Data Storage**
   - **icons.json**: Stores icon data including paths, categories, and metadata

### Adding New Icons

1. Click the "Admin" button in the navigation
2. Fill in the icon details (name, category, type)
3. Either paste SVG code directly or upload an SVG file
4. Submit the form to add the icon to the library

## How to Use

1. **Setup**

   - Place all files in a web server directory
   - Ensure the file structure is maintained
   - Make sure the data directory is writable if you plan to use the admin features

2. **Customization**

   - Modify the Tailwind config in the HTML file to change the color scheme
   - Edit styles.css for additional customization
   - Add your own SVG icons using the admin panel

3. **Backend Integration (Optional)**
   - For a production environment, you'll need to implement a backend to handle
     saving the JSON file with new icons
   - The current implementation uses localStorage for temporary storage
     and provides exports for development purposes

## Extending the Project

### Adding New Features

- **Icon Collections**: Group icons into different collections
- **User Accounts**: Allow users to save favorite icons
- **Export Options**: Add more export formats (React Native, Vue, etc.)
- **Batch Operations**: Allow selecting multiple icons for operations
- **Version History**: Track changes to icons over time

### Performance Optimizations

- Implement lazy loading for icons to improve initial load time
- Add pagination for large icon collections
- Consider using IndexedDB for client-side storage of larger datasets

## Browser Compatibility

This application uses modern JavaScript and CSS features including:

- ES6 Modules
- Fetch API
- CSS Grid and Flexbox
- SVG manipulation

It's recommended to use modern browsers like Chrome, Firefox, Safari, or Edge.

## License

This project is open-source and available for personal and commercial use.
# Iconify

