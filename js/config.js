// config.js
// Website configuration and constants

const CONFIG = {
    // Google Apps Script Web App URL - REPLACE WITH YOUR DEPLOYED URL
    API_URL: 'https://script.google.com/macros/s/AKfycbwlecDZ4hwgrvMPkEsJFIAgqRjsco3RJjCk8R5Ao2VZBIaT5xJHctZgQ29KxtY42c2s/exec',
    
    // App info
    APP_NAME: 'ListahanNgAniméMangaManhwa',
    DEVELOPER: 'Mark Joseph Rogasan',
    
    // Status options
    STATUSES: ['watching', 'dropped', 'plan', 'complete'],
    
    // Types
    TYPES: ['anime', 'manga', 'manhwa'],
    
    // Default values
    DEFAULT_RATING: 0,
    DEFAULT_EPISODES: 0,
    
    // YouTube embed settings
    YOUTUBE_WIDTH: 560,
    YOUTUBE_HEIGHT: 315,
    
    // Version
    VERSION: '1.0.0'
};

// Database connection checker
const DB_CHECK_INTERVAL = 30000; // 30 seconds

// Local storage keys
const STORAGE_KEYS = {
    USER: 'anime_tracker_user',
    ENTRIES: 'anime_tracker_entries',
    LAST_SYNC: 'anime_tracker_last_sync'
};