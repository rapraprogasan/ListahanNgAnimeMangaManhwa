// manhwa.js - Complete Manhwa page functionality with FIXED TITLE DISPLAY

let manhwaEntries = [];
let currentManhwaFilter = 'all';

// Initialize manhwa page
async function initManhwaPage() {
    showLoading();
    initDbChecker();
    
    try {
        // Get all entries and filter manhwa
        const allEntries = await Database.getAllEntries();
        manhwaEntries = allEntries.filter(entry => entry.type === 'manhwa');
        
        console.log(`📊 Loaded ${manhwaEntries.length} manhwa entries`);
        
        // Update counts
        updateManhwaCounts();
        
        // Display entries
        displayManhwaEntries();
        
        // Check for edit parameter
        const urlParams = new URLSearchParams(window.location.search);
        const editId = urlParams.get('edit');
        if (editId) {
            const entry = manhwaEntries.find(e => e.id === editId);
            if (entry) {
                openManhwaEditModal(entry);
            }
        }
    } catch (error) {
        console.error('❌ Init error:', error);
        showError('Failed to load manhwa entries. Please refresh the page.');
    }
    
    hideLoading();
}

// Show error message
function showError(message) {
    const grid = document.getElementById('manhwaGrid');
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

// Update manhwa counts
function updateManhwaCounts() {
    document.querySelectorAll('[data-count="manhwa-all"]').forEach(el => {
        el.textContent = manhwaEntries.length;
    });
    document.querySelectorAll('[data-count="manhwa-watching"]').forEach(el => {
        el.textContent = manhwaEntries.filter(e => e.status === 'watching').length;
    });
    document.querySelectorAll('[data-count="manhwa-dropped"]').forEach(el => {
        el.textContent = manhwaEntries.filter(e => e.status === 'dropped').length;
    });
    document.querySelectorAll('[data-count="manhwa-plan"]').forEach(el => {
        el.textContent = manhwaEntries.filter(e => e.status === 'plan').length;
    });
    document.querySelectorAll('[data-count="manhwa-complete"]').forEach(el => {
        el.textContent = manhwaEntries.filter(e => e.status === 'complete').length;
    });
}

// Display manhwa entries based on filter
function displayManhwaEntries() {
    const grid = document.getElementById('manhwaGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    // Empty state
    if (manhwaEntries.length === 0) {
        grid.innerHTML = `<div style="text-align: center; padding: 60px 20px;">
            <span style="font-size: 64px;">📖</span>
            <h3 style="margin: 20px 0 10px; color: #333;">No Manhwa Yet</h3>
            <p style="color: #999; margin-bottom: 30px;">Start adding your favorite manhwa!</p>
            <button onclick="openManhwaAddModal()" style="
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
                Add Your First Manhwa
            </button>
        </div>`;
        return;
    }
    
    // Filter entries
    let filtered = manhwaEntries;
    if (currentManhwaFilter !== 'all') {
        filtered = manhwaEntries.filter(entry => entry.status === currentManhwaFilter);
    }
    
    // Display filtered entries
    filtered.forEach(entry => {
        const card = createManhwaCard(entry);
        grid.appendChild(card);
    });
    
    // Show no results
    if (filtered.length === 0) {
        grid.innerHTML = `<div style="text-align: center; padding: 60px 20px;">
            <span style="font-size: 64px;">🔍</span>
            <h3 style="margin: 20px 0 10px; color: #333;">No Results Found</h3>
            <p style="color: #999;">No manhwa match the current filter.</p>
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

// Format status
function formatManhwaStatus(status) {
    const statusMap = {
        'watching': '📖 Reading',
        'complete': '✅ Completed',
        'plan': '📅 Plan to Read',
        'dropped': '❌ Dropped'
    };
    return statusMap[status] || status;
}

// Format rating
function formatRating(rating) {
    return rating ? Number(rating).toFixed(1) : '0.0';
}

// Create manhwa card - FIXED TITLE DISPLAY
function createManhwaCard(entry) {
    const card = document.createElement('div');
    card.className = 'card';
    
    const imageUrl = entry.imageUrl || 'https://via.placeholder.com/300x200?text=No+Image';
    const notesText = safeNotes(entry.notes);
    const hasNotes = notesText.length > 0;
    const showSeeMore = notesText.length > 100;
    
    // SAFE JSON for edit button - FIXED
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
            type: 'manhwa'
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
                <span>📖 ${entry.episodes || 0} ch</span>
                <span class="rating">⭐ ${formatRating(entry.rating || 0)}/10</span>
            </div>
            <span class="status-badge status-${entry.status || 'plan'}">${formatManhwaStatus(entry.status || 'plan')}</span>
            
            <!-- NOTES SECTION WITH SCROLL AND SEE MORE -->
            <div class="notes-container" style="margin-top: 12px;">
                <div class="notes-label" style="display: flex; align-items: center; gap: 5px; color: #666; font-size: 12px; font-weight: 600; margin-bottom: 4px;">
                    <span style="font-size: 14px;">📝</span> NOTES
                </div>
                <div class="notes-content" id="manhwa-notes-${entry.id}" style="
                    max-height: 80px;
                    overflow-y: auto;
                    padding: 10px 12px;
                    background: #f8f9fa;
                    border-radius: 8px;
                    font-size: 13px;
                    color: #2c3e50;
                    line-height: 1.5;
                    border: 1px solid #e9ecef;
                    word-wrap: break-word;
                ">
                    ${hasNotes ? escapeHtml(notesText).replace(/\n/g, '<br>') : '<span style="color: #adb5bd; font-style: italic;">No notes added</span>'}
                </div>
                ${showSeeMore ? `
                <button class="see-more-btn" onclick='showManhwaFullNotes("${entry.id}", ${JSON.stringify(notesText)})' style="
                    background: none;
                    border: none;
                    color: #4263eb;
                    font-size: 12px;
                    font-weight: 500;
                    margin-top: 6px;
                    cursor: pointer;
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    padding: 6px 12px;
                    border-radius: 20px;
                    transition: all 0.2s;
                ">
                    See full notes <span style="font-size: 14px;">→</span>
                </button>
                ` : ''}
            </div>
            
            <div style="margin-top: 16px; display: flex; gap: 10px;">
                <button class="btn btn-edit" onclick='openManhwaEditModalFromCard(${entryJson})'>
                    ✏️ Edit
                </button>
                <button class="btn btn-delete" onclick="deleteManhwaEntry('${entry.id}')">
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
                    transition: all 0.3s;
                    box-shadow: 0 4px 6px rgba(255,0,0,0.2);
                "
            >
                <span style="font-size: 22px;">▶</span>
                WATCH TRAILER
            </button>
            ` : ''}
            
        </div>
    `;
    
    return card;
}

// Show full notes modal for manhwa
function showManhwaFullNotes(id, notes) {
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
        background: white;
        max-width: 600px;
        width: 90%;
        max-height: 80vh;
        border-radius: 16px;
        padding: 28px;
        position: relative;
        transform: scale(0.9);
        transition: transform 0.3s ease;
        box-shadow: 0 20px 40px rgba(0,0,0,0.3);
    `;
    
    modalContent.innerHTML = `
        <h3 style="margin: 0 0 20px 0; color: #1a1e24; display: flex; align-items: center; gap: 10px; font-size: 22px; border-bottom: 2px solid #e9ecef; padding-bottom: 16px;">
            <span style="font-size: 28px;">📝</span> Full Notes
        </h3>
        <div style="
            background: #f8f9fa;
            padding: 24px;
            border-radius: 12px;
            border-left: 4px solid #4263eb;
            font-size: 15px;
            line-height: 1.7;
            color: #2c3e50;
            white-space: pre-wrap;
            word-wrap: break-word;
            max-height: 60vh;
            overflow-y: auto;
        ">
            ${escapeHtml(cleanNotes).replace(/\n/g, '<br>')}
        </div>
        <button onclick="this.closest('.show-full-notes').remove()" style="
            position: absolute;
            top: 20px;
            right: 20px;
            background: white;
            border: none;
            font-size: 28px;
            cursor: pointer;
            color: #868e96;
            padding: 0;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: all 0.2s;
            border: 1px solid #e9ecef;
        ">
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

// Open edit modal from card
function openManhwaEditModalFromCard(entry) {
    openManhwaEditModal(entry);
}

// Open add modal
function openManhwaAddModal() {
    const modal = document.getElementById('manhwaModal');
    if (!modal) {
        alert('Modal not found! Please refresh the page.');
        return;
    }
    
    // Reset form
    const form = document.getElementById('manhwaForm');
    if (form) form.reset();
    
    // Set title
    const modalTitle = document.getElementById('manhwaModalTitle');
    if (modalTitle) modalTitle.textContent = 'Add New Manhwa';
    
    // Clear ID
    const entryId = document.getElementById('manhwaEntryId');
    if (entryId) entryId.value = '';
    
    // Set defaults
    const title = document.getElementById('manhwaTitle');
    if (title) title.value = '';
    
    const status = document.getElementById('manhwaStatus');
    if (status) status.value = 'plan';
    
    const chapters = document.getElementById('manhwaChapters');
    if (chapters) chapters.value = 0;
    
    const rating = document.getElementById('manhwaRating');
    if (rating) rating.value = 0;
    
    const imageUrl = document.getElementById('manhwaImageUrl');
    if (imageUrl) imageUrl.value = '';
    
    const youtubeUrl = document.getElementById('manhwaYoutubeUrl');
    if (youtubeUrl) youtubeUrl.value = '';
    
    const notes = document.getElementById('manhwaNotes');
    if (notes) notes.value = '';
    
    const streamingUrl = document.getElementById('manhwaStreamingUrl');
    if (streamingUrl) streamingUrl.value = '';
    
    // Clear preview
    const container = document.getElementById('manhwa-youtube-preview-container');
    if (container) {
        container.style.display = 'none';
        container.innerHTML = '';
    }
    
    modal.classList.add('show');
}

// Open edit modal
function openManhwaEditModal(entry) {
    const modal = document.getElementById('manhwaModal');
    if (!modal) {
        alert('Modal not found! Please refresh the page.');
        return;
    }
    
    document.getElementById('manhwaModalTitle').textContent = 'Edit Manhwa';
    document.getElementById('manhwaEntryId').value = entry.id || '';
    document.getElementById('manhwaTitle').value = entry.title || '';
    document.getElementById('manhwaStatus').value = entry.status || 'plan';
    document.getElementById('manhwaChapters').value = entry.episodes || 0;
    document.getElementById('manhwaRating').value = entry.rating || 0;
    document.getElementById('manhwaImageUrl').value = entry.imageUrl || '';
    document.getElementById('manhwaYoutubeUrl').value = entry.youtubeUrl || '';
    document.getElementById('manhwaNotes').value = safeNotes(entry.notes);
    document.getElementById('manhwaStreamingUrl').value = entry.streamingUrl || '';
    
    modal.classList.add('show');
    
    // Preview YouTube
    setTimeout(() => {
        if (entry.youtubeUrl && typeof updateManhwaVideoPreview === 'function') {
            updateManhwaVideoPreview(entry.youtubeUrl, 'manhwa-youtube-preview-container');
        }
    }, 200);
}

// Close manhwa modal
function closeManhwaModal() {
    const modal = document.getElementById('manhwaModal');
    if (modal) modal.classList.remove('show');
}

// Save manhwa entry - FIXED
async function saveManhwaEntry() {
    try {
        // Check Database
        if (typeof Database === 'undefined') {
            alert('❌ Database not loaded. Please refresh the page.');
            return;
        }
        
        // Get form values
        const id = document.getElementById('manhwaEntryId').value;
        const titleInput = document.getElementById('manhwaTitle');
        const statusInput = document.getElementById('manhwaStatus');
        const chaptersInput = document.getElementById('manhwaChapters');
        const ratingInput = document.getElementById('manhwaRating');
        const imageUrlInput = document.getElementById('manhwaImageUrl');
        const youtubeUrlInput = document.getElementById('manhwaYoutubeUrl');
        const notesInput = document.getElementById('manhwaNotes');
        const streamingUrlInput = document.getElementById('manhwaStreamingUrl');
        
        // Validate title
        if (!titleInput.value || titleInput.value.trim() === '') {
            alert('❌ Please enter a manhwa title');
            titleInput.focus();
            return;
        }
        
        // Prepare data
        const entryData = {
            type: 'manhwa',
            title: titleInput.value.trim(),
            status: statusInput.value || 'plan',
            episodes: parseInt(chaptersInput.value) || 0,
            rating: parseFloat(ratingInput.value) || 0,
            imageUrl: imageUrlInput.value || '',
            youtubeUrl: youtubeUrlInput.value || '',
            notes: String(notesInput.value || ''),
            streamingUrl: streamingUrlInput.value || '',
            lastUpdated: new Date().toISOString()
        };
        
        console.log('💾 Saving manhwa:', entryData);
        
        // Save to database
        let result;
        if (id) {
            result = await Database.updateEntry(id, entryData);
        } else {
            result = await Database.addEntry(entryData);
        }
        
        if (result && result.success) {
            closeManhwaModal();
            
            // Refresh data
            const allEntries = await Database.getAllEntries();
            manhwaEntries = allEntries.filter(entry => entry.type === 'manhwa');
            
            updateManhwaCounts();
            displayManhwaEntries();
            showNotification('✅ Manhwa saved successfully!', 'success');
        } else {
            alert('❌ Error: ' + (result?.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('❌ Save error:', error);
        alert('❌ Error saving: ' + error.message);
    }
}

// Delete manhwa entry
async function deleteManhwaEntry(id) {
    if (confirm('❓ Are you sure you want to delete this manhwa?')) {
        try {
            if (typeof Database === 'undefined') {
                alert('❌ Database not loaded. Please refresh the page.');
                return;
            }
            
            const result = await Database.deleteEntry(id);
            
            if (result && result.success) {
                // Refresh data
                const allEntries = await Database.getAllEntries();
                manhwaEntries = allEntries.filter(entry => entry.type === 'manhwa');
                
                updateManhwaCounts();
                displayManhwaEntries();
                showNotification('🗑️ Manhwa deleted successfully!', 'success');
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
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Set manhwa filter
function setManhwaFilter(filter) {
    currentManhwaFilter = filter;
    
    // Update active button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const activeBtn = document.querySelector(`[data-filter="${filter}"]`);
    if (activeBtn) activeBtn.classList.add('active');
    
    // Display entries
    displayManhwaEntries();
}

// Search manhwa
function searchManhwa() {
    const searchInput = document.getElementById('searchManhwa');
    if (!searchInput) return;
    
    const query = searchInput.value.toLowerCase();
    
    if (query.length > 2) {
        const filtered = manhwaEntries.filter(entry => 
            entry.title && entry.title.toLowerCase().includes(query)
        );
        
        const grid = document.getElementById('manhwaGrid');
        if (grid) {
            grid.innerHTML = '';
            filtered.forEach(entry => {
                const card = createManhwaCard(entry);
                grid.appendChild(card);
            });
        }
    } else if (query.length === 0) {
        displayManhwaEntries();
    }
}

// Open YouTube
function openYouTube(url) {
    if (url) {
        window.open(url, '_blank', 'noopener,noreferrer');
    }
}

// Play manhwa video (legacy support)
function playManhwaVideo(url) {
    openYouTube(url);
}

// Get YouTube ID
function getYoutubeId(url) {
    if (!url) return null;
    
    let videoId = '';
    if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1].split('?')[0];
    } else if (url.includes('v=')) {
        videoId = url.split('v=')[1].split('&')[0];
    } else if (url.includes('youtube.com/embed/')) {
        videoId = url.split('embed/')[1].split('?')[0];
    }
    
    return videoId || null;
}

// Show loading
function showLoading() {
    const grid = document.getElementById('manhwaGrid');
    if (grid) {
        grid.innerHTML = `<div style="text-align: center; padding: 60px;">
            <span style="font-size: 48px;">⌛</span>
            <h3 style="margin-top: 20px; color: #666;">Loading manhwa entries...</h3>
        </div>`;
    }
}

// Hide loading
function hideLoading() {}

// Initialize DB checker
function initDbChecker() {
    if (typeof Database === 'undefined') {
        console.error('Database not loaded');
    }
}

// Load footer
async function loadFooter() {
    // Footer loading logic here
}

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
            background: #f1f3f5;
            border-radius: 10px;
        }
        .notes-content::-webkit-scrollbar-thumb {
            background: #ced4da;
            border-radius: 10px;
        }
        .notes-content::-webkit-scrollbar-thumb:hover {
            background: #adb5bd;
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
        }
        .card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 20px rgba(0,0,0,0.1);
        }
        
        .btn-edit, .btn-delete {
            transition: all 0.2s;
        }
        .btn-edit:hover, .btn-delete:hover {
            transform: translateY(-2px);
        }
        
        .youtube-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 12px rgba(255,0,0,0.3);
        }
    `;
    document.head.appendChild(style);
    
    // Initialize if on manhwa page
    if (document.getElementById('manhwaGrid')) {
        // Wait for Database
        let attempts = 0;
        const maxAttempts = 20;
        
        function waitForDatabase() {
            if (typeof Database !== 'undefined') {
                console.log('✅ Database found, initializing manhwa page...');
                initManhwaPage();
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
window.initManhwaPage = initManhwaPage;
window.openManhwaAddModal = openManhwaAddModal;
window.openManhwaEditModal = openManhwaEditModal;
window.openManhwaEditModalFromCard = openManhwaEditModalFromCard;
window.closeManhwaModal = closeManhwaModal;
window.saveManhwaEntry = saveManhwaEntry;
window.deleteManhwaEntry = deleteManhwaEntry;
window.setManhwaFilter = setManhwaFilter;
window.searchManhwa = searchManhwa;
window.playManhwaVideo = playManhwaVideo;
window.openYouTube = openYouTube;
window.showManhwaFullNotes = showManhwaFullNotes;
window.getYoutubeId = getYoutubeId;