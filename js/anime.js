// anime.js - Complete Anime page functionality with LIVE DATABASE and JUSTIFIED NOTES

let animeEntries = [];
let currentFilter = 'all';

// Initialize anime page
async function initAnimePage() {
    showLoading();
    
    // Check Database
    if (typeof Database === 'undefined') {
        console.error('❌ Database not loaded');
        showError('Database not loaded. Please check if database.js is included.');
        return;
    }
    
    try {
        // Get all entries
        const allEntries = await Database.getAllEntries();
        animeEntries = allEntries.filter(entry => entry.type === 'anime');
        
        console.log(`📊 Loaded ${animeEntries.length} anime entries`);
        
        // Update counts
        updateAnimeCounts();
        
        // Display entries
        displayAnimeEntries();
        
        // Check for edit parameter
        const urlParams = new URLSearchParams(window.location.search);
        const editId = urlParams.get('edit');
        if (editId) {
            const entry = animeEntries.find(e => e.id === editId);
            if (entry) {
                openEditModal(entry);
            }
        }
    } catch (error) {
        console.error('❌ Init error:', error);
        showError('Failed to load anime entries. Please refresh the page.');
    }
    
    hideLoading();
}

// Show error message
function showError(message) {
    const grid = document.getElementById('animeGrid');
    if (grid) {
        grid.innerHTML = `<div style="text-align: center; padding: 60px 20px;">
            <span style="font-size: 64px;">⚠️</span>
            <h3 style="margin: 20px 0 10px; color: #dc3545;">Error</h3>
            <p style="color: #666; margin-bottom: 20px;">${message}</p>
            <button onclick="location.reload()" style="
                padding: 12px 24px;
                background: #4263eb;
                color: white;
                border: none;
                border-radius: 8px;
                font-size: 16px;
                cursor: pointer;
            ">🔄 Refresh Page</button>
        </div>`;
    }
}

// Update anime counts
function updateAnimeCounts() {
    document.querySelectorAll('[data-count="anime-all"]').forEach(el => {
        el.textContent = animeEntries.length;
    });
    document.querySelectorAll('[data-count="anime-watching"]').forEach(el => {
        el.textContent = animeEntries.filter(e => e.status === 'watching').length;
    });
    document.querySelectorAll('[data-count="anime-dropped"]').forEach(el => {
        el.textContent = animeEntries.filter(e => e.status === 'dropped').length;
    });
    document.querySelectorAll('[data-count="anime-plan"]').forEach(el => {
        el.textContent = animeEntries.filter(e => e.status === 'plan').length;
    });
    document.querySelectorAll('[data-count="anime-complete"]').forEach(el => {
        el.textContent = animeEntries.filter(e => e.status === 'complete').length;
    });
}

// Display anime entries
function displayAnimeEntries() {
    const grid = document.getElementById('animeGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    // Empty state
    if (animeEntries.length === 0) {
        grid.innerHTML = `<div style="text-align: center; padding: 60px 20px;">
            <span style="font-size: 64px;">📺</span>
            <h3 style="margin: 20px 0 10px; color: #333;">No Anime Yet</h3>
            <p style="color: #999; margin-bottom: 30px;">Start adding your favorite anime!</p>
            <button onclick="openAddModal()" style="
                padding: 14px 28px;
                background: #4263eb;
                color: white;
                border: none;
                border-radius: 8px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                display: inline-flex;
                align-items: center;
                gap: 8px;
                box-shadow: 0 4px 12px rgba(66, 99, 235, 0.3);
            ">
                <span style="font-size: 20px;">➕</span>
                Add Your First Anime
            </button>
        </div>`;
        return;
    }
    
    // Filter entries
    let filtered = animeEntries;
    if (currentFilter !== 'all') {
        filtered = animeEntries.filter(entry => entry.status === currentFilter);
    }
    
    // Display filtered entries
    filtered.forEach(entry => {
        const card = createAnimeCard(entry);
        grid.appendChild(card);
    });
    
    // Show no results
    if (filtered.length === 0) {
        grid.innerHTML = `<div style="text-align: center; padding: 60px 20px;">
            <span style="font-size: 64px;">🔍</span>
            <h3 style="margin: 20px 0 10px; color: #333;">No Results Found</h3>
            <p style="color: #999;">No anime match the current filter.</p>
        </div>`;
    }
}

// Safe notes converter
function safeNotes(notes) {
    if (!notes) return '';
    if (typeof notes === 'string') return notes;
    if (Array.isArray(notes)) return notes.join(' ');
    if (typeof notes === 'object') return JSON.stringify(notes);
    return String(notes);
}

// Escape HTML
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Create anime card - WITH JUSTIFIED NOTES SECTION
function createAnimeCard(entry) {
    const card = document.createElement('div');
    card.className = 'card';
    
    const imageUrl = entry.imageUrl || 'https://via.placeholder.com/300x200?text=No+Image';
    const notesText = safeNotes(entry.notes);
    const hasNotes = notesText.length > 0;
    const showSeeMore = notesText.length > 100;
    
    // Safe JSON for edit button
    let entryJson = '';
    try {
        const safeEntry = {
            id: entry.id,
            title: entry.title || '',
            status: entry.status || 'plan',
            episodes: entry.episodes || 0,
            rating: entry.rating || 0,
            imageUrl: entry.imageUrl || '',
            youtubeUrl: entry.youtubeUrl || '',
            notes: notesText,
            streamingUrl: entry.streamingUrl || '',
            type: 'anime'
        };
        entryJson = JSON.stringify(safeEntry).replace(/'/g, "\\'").replace(/"/g, '&quot;');
    } catch (e) {
        console.error('JSON error:', e);
    }
    
    card.innerHTML = `
        <div class="card-image" onclick="window.open('${entry.streamingUrl || '#'}', '_blank')">
            <img src="${imageUrl}" alt="${escapeHtml(entry.title || 'Untitled')}" loading="lazy" onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'">
        </div>
        <div class="card-content">
            <h3 class="card-title">${escapeHtml(entry.title || 'Untitled')}</h3>
            <div class="card-info">
                <span>📺 ${entry.episodes || 0} eps</span>
                <span class="rating">⭐ ${formatRating(entry.rating || 0)}/10</span>
            </div>
            <span class="status-badge status-${entry.status || 'plan'}">${formatStatus(entry.status || 'plan')}</span>
            
            <!-- 📌 NOTES SECTION - JUSTIFIED TEXT WITH MODERN DESIGN -->
            <div class="notes-container" style="
                margin-top: 15px;
                margin-bottom: 15px;
                width: 100%;
            ">
                <div class="notes-label" style="
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    color: var(--text-secondary);
                    font-size: 12px;
                    margin-bottom: 8px;
                    font-weight: 600;
                    text-align: left;
                    letter-spacing: 0.5px;
                    text-transform: uppercase;
                ">
                    <span style="font-size: 14px;">📝</span> Notes
                </div>
                <div class="notes-content" id="notes-${entry.id}" style="
                    color: var(--text-primary);
                    font-size: 13px;
                    line-height: 1.7;
                    max-height: 100px;
                    overflow-y: auto;
                    padding: 14px 18px;
                    background: var(--bg-hover);
                    border-radius: 12px;
                    border-left: 5px solid var(--accent-primary);
                    text-align: justify;
                    text-justify: inter-word;
                    word-wrap: break-word;
                    white-space: pre-wrap;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    hyphens: auto;
                    -webkit-hyphens: auto;
                    -ms-hyphens: auto;
                    transition: all 0.3s ease;
                "
                onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.15)'; this.style.borderLeftWidth='6px'"
                onmouseout="this.style.boxShadow='0 2px 8px rgba(0,0,0,0.1)'; this.style.borderLeftWidth='5px'">
                    ${hasNotes ? notesText : '<span style="color: var(--text-secondary); font-style: italic;">No notes added</span>'}
                </div>
             
            <div style="margin-top: 16px; display: flex; gap: 10px;">
                <button class="btn btn-edit" onclick='openEditModalFromCard(${entryJson})' style="
                    flex: 1;
                    padding: 10px;
                    background: var(--accent-primary);
                    color: white;
                    border: none;
                    border-radius: 6px;
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    transition: all 0.3s ease;
                "
                onmouseover="this.style.background='var(--accent-hover)'; this.style.transform='translateY(-2px)'"
                onmouseout="this.style.background='var(--accent-primary)'; this.style.transform='translateY(0)'">
                    ✏️ Edit
                </button>
                <button class="btn btn-delete" onclick="deleteAnimeEntry('${entry.id}')" style="
                    flex: 1;
                    padding: 10px;
                    background: #ff6b6b;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    transition: all 0.3s ease;
                "
                onmouseover="this.style.background='#ff8787'; this.style.transform='translateY(-2px)'"
                onmouseout="this.style.background='#ff6b6b'; this.style.transform='translateY(0)'">
                    🗑️ Delete
                </button>
            </div>
            
            <!-- YOUTUBE BUTTON -->
            ${entry.youtubeUrl ? `
            <button 
                onclick="openYouTube('${entry.youtubeUrl}')"
                class="youtube-btn"
                style="
                    width: 100%;
                    margin-top: 15px;
                    background: linear-gradient(45deg, #ff0000, #cc0000);
                    color: white;
                    border: none;
                    padding: 12px 16px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: bold;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 6px rgba(255,0,0,0.2);
                "
                onmouseover="this.style.background='linear-gradient(45deg, #cc0000, #990000)'; this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 12px rgba(255,0,0,0.3)'"
                onmouseout="this.style.background='linear-gradient(45deg, #ff0000, #cc0000)'; this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 6px rgba(255,0,0,0.2)'"
            >
                <span style="font-size: 22px;">▶</span>
                WATCH TRAILER
            </button>
            ` : ''}
            
            <!-- TYPE BADGE -->
            <div style="margin-top: 12px; text-align: right;">
                <span style="
                    display: inline-block;
                    padding: 4px 12px;
                    background: var(--bg-hover);
                    color: var(--text-secondary);
                    border-radius: 20px;
                    font-size: 11px;
                    text-transform: uppercase;
                    border: 1px solid var(--border-color);
                    font-weight: 600;
                    letter-spacing: 0.5px;
                ">
                    🎬 anime
                </span>
            </div>
        </div>
    `;
    
    return card;
}

// Show full notes modal - IMPROVED DESIGN
function showFullNotes(id, notes) {
    const existingModal = document.querySelector('.show-full-notes');
    if (existingModal) existingModal.remove();
    
    let cleanNotes = typeof notes === 'string' ? notes : String(notes || '');
    if (cleanNotes.startsWith('"') && cleanNotes.endsWith('"')) {
        cleanNotes = cleanNotes.slice(1, -1);
    }
    
    const modal = document.createElement('div');
    modal.className = 'show-full-notes';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        opacity: 0;
        transition: opacity 0.3s ease;
        backdrop-filter: blur(5px);
    `;
    
    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
        background: var(--bg-primary);
        max-width: 600px;
        width: 90%;
        max-height: 80vh;
        border-radius: 16px;
        padding: 28px;
        position: relative;
        transform: scale(0.9);
        transition: transform 0.3s ease;
        box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        border: 1px solid var(--border-color);
    `;
    
    modalContent.innerHTML = `
        <h3 style="
            margin: 0 0 20px 0; 
            color: var(--text-primary); 
            display: flex; 
            align-items: center; 
            gap: 10px; 
            font-size: 22px; 
            border-bottom: 2px solid var(--border-color); 
            padding-bottom: 16px;
        ">
            <span style="font-size: 28px;">📝</span> Full Notes
        </h3>
        <div style="
            background: var(--bg-hover);
            padding: 24px;
            border-radius: 12px;
            border-left: 5px solid var(--accent-primary);
            font-size: 15px;
            line-height: 1.8;
            color: var(--text-primary);
            white-space: pre-wrap;
            word-wrap: break-word;
            max-height: 60vh;
            overflow-y: auto;
            text-align: justify;
            text-justify: inter-word;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            hyphens: auto;
            box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);
        ">
            ${escapeHtml(cleanNotes).replace(/\n/g, '<br>')}
        </div>
        <button onclick="this.closest('.show-full-notes').remove()" style="
            position: absolute;
            top: 20px;
            right: 20px;
            background: var(--bg-hover);
            border: 1px solid var(--border-color);
            font-size: 28px;
            cursor: pointer;
            color: var(--text-secondary);
            padding: 0;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: all 0.2s;
            font-weight: 300;
        "
        onmouseover="this.style.background='var(--accent-primary)'; this.style.color='white'; this.style.transform='rotate(90deg)'"
        onmouseout="this.style.background='var(--bg-hover)'; this.style.color='var(--text-secondary)'; this.style.transform='rotate(0)'">
            ×
        </button>
    `;
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    setTimeout(() => {
        modal.style.opacity = '1';
        modalContent.style.transform = 'scale(1)';
    }, 10);
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.opacity = '0';
            modalContent.style.transform = 'scale(0.9)';
            setTimeout(() => modal.remove(), 300);
        }
    });
}

// Format status
function formatStatus(status) {
    const statusMap = {
        'watching': '📺 Watching',
        'complete': '✅ Completed',
        'plan': '📅 Plan to Watch',
        'dropped': '❌ Dropped'
    };
    return statusMap[status] || status;
}

// Format rating
function formatRating(rating) {
    return rating ? Number(rating).toFixed(1) : '0.0';
}

// Open YouTube
function openYouTube(url) {
    if (url) {
        window.open(url, '_blank', 'noopener,noreferrer');
    }
}

// Open add modal
function openAddModal() {
    const modal = document.getElementById('animeModal');
    if (!modal) {
        alert('Modal not found! Please refresh the page.');
        return;
    }
    
    // Reset form
    const form = document.getElementById('animeForm');
    if (form) form.reset();
    
    // Set title
    const modalTitle = document.getElementById('modalTitle');
    if (modalTitle) modalTitle.textContent = 'Add New Anime';
    
    // Clear ID
    const entryId = document.getElementById('entryId');
    if (entryId) entryId.value = '';
    
    // Set defaults
    const title = document.getElementById('title');
    if (title) title.value = '';
    
    const status = document.getElementById('status');
    if (status) status.value = 'plan';
    
    const episodes = document.getElementById('episodes');
    if (episodes) episodes.value = 0;
    
    const rating = document.getElementById('rating');
    if (rating) rating.value = 0;
    
    const imageUrl = document.getElementById('imageUrl');
    if (imageUrl) imageUrl.value = '';
    
    const youtubeUrl = document.getElementById('youtubeUrl');
    if (youtubeUrl) youtubeUrl.value = '';
    
    const notes = document.getElementById('notes');
    if (notes) notes.value = '';
    
    const streamingUrl = document.getElementById('streamingUrl');
    if (streamingUrl) streamingUrl.value = '';
    
    // Clear preview
    const container = document.getElementById('youtube-preview-container');
    if (container) {
        container.style.display = 'none';
        container.innerHTML = '';
    }
    
    modal.classList.add('show');
}

// Open edit modal from card
function openEditModalFromCard(entry) {
    openEditModal(entry);
}

// Open edit modal
function openEditModal(entry) {
    const modal = document.getElementById('animeModal');
    if (!modal) {
        alert('Modal not found! Please refresh the page.');
        return;
    }
    
    document.getElementById('modalTitle').textContent = 'Edit Anime';
    document.getElementById('entryId').value = entry.id || '';
    document.getElementById('title').value = entry.title || '';
    document.getElementById('status').value = entry.status || 'plan';
    document.getElementById('episodes').value = entry.episodes || 0;
    document.getElementById('rating').value = entry.rating || 0;
    document.getElementById('imageUrl').value = entry.imageUrl || '';
    document.getElementById('youtubeUrl').value = entry.youtubeUrl || '';
    document.getElementById('notes').value = safeNotes(entry.notes);
    document.getElementById('streamingUrl').value = entry.streamingUrl || '';
    
    modal.classList.add('show');
    
    // Preview YouTube
    setTimeout(() => {
        if (entry.youtubeUrl) {
            updateVideoPreview(entry.youtubeUrl, 'youtube-preview-container');
        }
    }, 200);
}

// Close modal
function closeModal() {
    const modal = document.getElementById('animeModal');
    if (modal) modal.classList.remove('show');
}

// Save anime entry
async function saveAnimeEntry() {
    try {
        // Check Database
        if (typeof Database === 'undefined') {
            alert('❌ Database not loaded. Please refresh the page.');
            return;
        }
        
        // Get form values
        const id = document.getElementById('entryId').value;
        const titleInput = document.getElementById('title');
        const statusInput = document.getElementById('status');
        const episodesInput = document.getElementById('episodes');
        const ratingInput = document.getElementById('rating');
        const imageUrlInput = document.getElementById('imageUrl');
        const youtubeUrlInput = document.getElementById('youtubeUrl');
        const notesInput = document.getElementById('notes');
        const streamingUrlInput = document.getElementById('streamingUrl');
        
        // Validate title
        if (!titleInput.value || titleInput.value.trim() === '') {
            alert('❌ Please enter an anime title');
            titleInput.focus();
            return;
        }
        
        // Prepare data
        const entryData = {
            type: 'anime',
            title: titleInput.value.trim(),
            status: statusInput.value || 'plan',
            episodes: parseInt(episodesInput.value) || 0,
            rating: parseFloat(ratingInput.value) || 0,
            imageUrl: imageUrlInput.value || '',
            youtubeUrl: youtubeUrlInput.value || '',
            notes: String(notesInput.value || ''),
            streamingUrl: streamingUrlInput.value || '',
            lastUpdated: new Date().toISOString()
        };
        
        console.log('💾 Saving:', entryData);
        
        // Save to database
        let result;
        if (id) {
            result = await Database.updateEntry(id, entryData);
        } else {
            result = await Database.addEntry(entryData);
        }
        
        if (result && result.success) {
            closeModal();
            
            // Refresh data
            const allEntries = await Database.getAllEntries();
            animeEntries = allEntries.filter(entry => entry.type === 'anime');
            
            updateAnimeCounts();
            displayAnimeEntries();
            showNotification('✅ Anime saved successfully!', 'success');
        } else {
            alert('❌ Error: ' + (result?.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('❌ Save error:', error);
        alert('❌ Error saving: ' + error.message);
    }
}

// Delete anime entry
async function deleteAnimeEntry(id) {
    if (confirm('❓ Are you sure you want to delete this anime?')) {
        try {
            if (typeof Database === 'undefined') {
                alert('❌ Database not loaded. Please refresh the page.');
                return;
            }
            
            const result = await Database.deleteEntry(id);
            
            if (result && result.success) {
                // Refresh data
                const allEntries = await Database.getAllEntries();
                animeEntries = allEntries.filter(entry => entry.type === 'anime');
                
                updateAnimeCounts();
                displayAnimeEntries();
                showNotification('🗑️ Anime deleted successfully!', 'success');
            } else {
                alert('❌ Error: ' + (result?.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('❌ Delete error:', error);
            alert('❌ Error deleting: ' + error.message);
        }
    }
}

// Show notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 14px 24px;
        background: ${type === 'success' ? '#51cf66' : '#ff6b6b'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        font-weight: 500;
        animation: slideIn 0.3s ease;
        max-width: 400px;
        border-left: 4px solid white;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Set filter
function setFilter(filter) {
    currentFilter = filter;
    
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const activeBtn = document.querySelector(`[data-filter="${filter}"]`);
    if (activeBtn) activeBtn.classList.add('active');
    
    displayAnimeEntries();
}

// Search anime
function searchAnime() {
    const searchInput = document.getElementById('searchAnime');
    if (!searchInput) return;
    
    const query = searchInput.value.toLowerCase();
    
    if (query.length > 2) {
        const filtered = animeEntries.filter(entry => 
            entry.title && entry.title.toLowerCase().includes(query)
        );
        
        const grid = document.getElementById('animeGrid');
        if (grid) {
            grid.innerHTML = '';
            filtered.forEach(entry => {
                const card = createAnimeCard(entry);
                grid.appendChild(card);
            });
        }
    } else if (query.length === 0) {
        displayAnimeEntries();
    }
}

// Update video preview
function updateVideoPreview(url, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (!url) {
        container.style.display = 'none';
        container.innerHTML = '';
        return;
    }
    
    let videoId = '';
    if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1].split('?')[0];
    } else if (url.includes('v=')) {
        videoId = url.split('v=')[1].split('&')[0];
    } else if (url.includes('youtube.com/embed/')) {
        videoId = url.split('embed/')[1].split('?')[0];
    }
    
    if (videoId) {
        container.style.display = 'block';
        container.innerHTML = `
            <div style="margin-top: 15px;">
                <label style="display: block; margin-bottom: 8px; color: var(--text-secondary); font-weight: 600;">🎬 Preview:</label>
                <iframe 
                    width="100%" 
                    height="200" 
                    src="https://www.youtube.com/embed/${videoId}" 
                    frameborder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen
                    style="border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);"
                ></iframe>
            </div>
        `;
    } else {
        container.style.display = 'none';
        container.innerHTML = '';
    }
}

// Show loading
function showLoading() {
    const grid = document.getElementById('animeGrid');
    if (grid) {
        grid.innerHTML = `<div style="text-align: center; padding: 60px;">
            <span style="font-size: 48px;">⌛</span>
            <h3 style="margin-top: 20px; color: var(--text-secondary);">Loading anime entries...</h3>
        </div>`;
    }
}

// Hide loading
function hideLoading() {}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Add global styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        
        .notes-content::-webkit-scrollbar {
            width: 6px;
        }
        .notes-content::-webkit-scrollbar-track {
            background: var(--bg-primary);
            border-radius: 10px;
        }
        .notes-content::-webkit-scrollbar-thumb {
            background: var(--accent-primary);
            border-radius: 10px;
            opacity: 0.7;
        }
        .notes-content::-webkit-scrollbar-thumb:hover {
            background: var(--accent-hover);
        }
        
        .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            margin-top: 8px;
        }
        .status-watching { background: #ffd43b; color: #343a40; }
        .status-complete { background: #51cf66; color: #343a40; }
        .status-plan { background: #339af0; color: white; }
        .status-dropped { background: #868e96; color: white; }
        
        .card {
            transition: transform 0.3s, box-shadow 0.3s;
            background: var(--bg-card);
            border: 1px solid var(--border-color);
        }
        .card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 20px rgba(0,0,0,0.1);
        }
        
        .filter-btn {
            transition: all 0.3s ease;
        }
        .filter-btn:hover {
            transform: translateY(-2px);
        }
        .filter-btn.active {
            background: var(--accent-primary);
            color: white;
            border-color: var(--accent-primary);
        }
    `;
    document.head.appendChild(style);
    
    // Initialize if on anime page
    if (document.getElementById('animeGrid')) {
        // Wait for Database
        let attempts = 0;
        const maxAttempts = 20;
        
        function waitForDatabase() {
            if (typeof Database !== 'undefined') {
                console.log('✅ Database found, initializing...');
                initAnimePage();
            } else {
                attempts++;
                if (attempts < maxAttempts) {
                    console.log(`⏳ Waiting for database... (${attempts}/${maxAttempts})`);
                    setTimeout(waitForDatabase, 250);
                } else {
                    showError('Database failed to load. Please check if database.js is included.');
                }
            }
        }
        
        waitForDatabase();
    }
});

// Export functions
window.initAnimePage = initAnimePage;
window.openAddModal = openAddModal;
window.openEditModal = openEditModal;
window.openEditModalFromCard = openEditModalFromCard;
window.closeModal = closeModal;
window.saveAnimeEntry = saveAnimeEntry;
window.deleteAnimeEntry = deleteAnimeEntry;
window.setFilter = setFilter;
window.searchAnime = searchAnime;
window.openYouTube = openYouTube;
window.showFullNotes = showFullNotes;
window.updateVideoPreview = updateVideoPreview;