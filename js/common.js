// common.js
// Shared utility functions used across all pages

// ===========================================
// YOUTUBE FUNCTIONS
// ===========================================

// Get YouTube ID from URL
function getYoutubeId(url) {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

// Clean YouTube URL
function cleanYoutubeUrl(url) {
    if (!url) return url;
    const videoId = getYoutubeId(url);
    if (videoId) {
        return `https://www.youtube.com/watch?v=${videoId}`;
    }
    return url;
}

// DIRECT OPEN SA YOUTUBE - WALANG ERROR 153
function openYouTube(url) {
    if (!url) {
        alert('No YouTube URL provided');
        return;
    }
    const cleanUrl = cleanYoutubeUrl(url);
    window.open(cleanUrl, '_blank');
}

// YOUTUBE PREVIEW FUNCTION - ITO ANG GINAGAMIT SA MODAL
function updateVideoPreview(url, containerId = 'youtube-preview-container') {
    const container = document.getElementById(containerId);
    const playerDiv = document.getElementById('youtube-preview-player');
    
    if (!container || !playerDiv) return;
    
    // Clear previous preview
    playerDiv.innerHTML = '';
    
    if (!url) {
        container.style.display = 'none';
        return;
    }
    
    const videoId = getYoutubeId(url);
    
    if (videoId) {
        container.style.display = 'block';
        
        playerDiv.innerHTML = `
            <div style="position: relative; width: 100%; height: 100%;">
                <img src="https://img.youtube.com/vi/${videoId}/mqdefault.jpg" 
                     style="width: 100%; height: 100%; object-fit: cover;"
                     onerror="this.src='https://img.youtube.com/vi/${videoId}/hqdefault.jpg'">
                <div style="
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 50px;
                    height: 50px;
                    background: rgba(255,0,0,0.9);
                    border-radius: 50%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    cursor: pointer;
                    transition: all 0.3s;
                "
                onmouseover="this.style.background='#ff0000'; this.style.transform='translate(-50%, -50%) scale(1.1)'"
                onmouseout="this.style.background='rgba(255,0,0,0.9)'; this.style.transform='translate(-50%, -50%) scale(1)'"
                onclick="window.open('https://www.youtube.com/watch?v=${videoId}', '_blank')">
                    <span style="color: white; font-size: 24px; margin-left: 3px;">▶</span>
                </div>
            </div>
        `;
    } else {
        container.style.display = 'none';
    }
}

// ===========================================
// DATABASE FUNCTIONS
// ===========================================

// Check database connection
async function checkDatabaseConnection() {
    try {
        const response = await fetch(`${CONFIG.API_URL}?action=getAll&_=${Date.now()}`, {
            method: 'GET',
            mode: 'no-cors'
        });
        updateDatabaseStatus(true);
        return true;
    } catch (error) {
        console.log('Database connection check:', error);
        updateDatabaseStatus(false);
        return false;
    }
}

// Update database status indicator
function updateDatabaseStatus(isOnline) {
    const indicator = document.getElementById('dbStatus');
    if (indicator) {
        indicator.className = `db-indicator ${isOnline ? 'online' : 'offline'}`;
        indicator.innerHTML = isOnline ? '● ONLINE' : '● OFFLINE';
        indicator.style.color = isOnline ? '#00ff00' : '#ff0000';
    }
}

// Initialize database connection checker
function initDbChecker() {
    checkDatabaseConnection();
    setInterval(checkDatabaseConnection, DB_CHECK_INTERVAL);
}

// ===========================================
// LOADING SCREEN FUNCTIONS
// ===========================================

// Show loading screen - FIXED (Hindi na babalik sa loading)
function showLoading() {
    // Check kung nasa loading page na
    if (window.location.pathname.includes('loading.html')) {
        return; // Wag na mag-redirect kung nasa loading na
    }
    
    // Check kung kakapag-load lang
    if (sessionStorage.getItem('loading_completed')) {
        return; // Wag na mag-loading ulit
    }
    
    // Check kung may data na sa localStorage
    const entries = localStorage.getItem(STORAGE_KEYS.ENTRIES);
    const lastSync = localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
    
    if (entries && lastSync) {
        // May cached data na, wag na mag-loading
        const fiveMinutesAgo = Date.now() - 300000; // 5 minutes
        if (parseInt(lastSync) > fiveMinutesAgo) {
            return; // Recent cache, skip loading
        }
    }
    
    // Redirect to loading page
    window.location.href = 'loading.html';
}

// Hide loading screen
function hideLoading() {
    const loader = document.getElementById('loadingScreen');
    if (loader) {
        loader.style.display = 'none';
    }
}

// Reset loading state (for logout)
function resetLoadingState() {
    sessionStorage.removeItem('loading_completed');
}

// ===========================================
// NOTES MODAL FUNCTION - UPDATED (NASA LEFT NA)
// ===========================================

// Show full notes modal - FIXED (NASA LEFT NA)


// ===========================================
// FORMATTING FUNCTIONS
// ===========================================

// Format rating
function formatRating(rating) {
    return parseFloat(rating).toFixed(1);
}

// ===========================================
// COUNTING FUNCTIONS
// ===========================================

// Count entries by type and status
function countEntries(entries, type, status = null) {
    return entries.filter(entry => {
        if (entry.type !== type) return false;
        if (status && entry.status !== status) return false;
        return true;
    }).length;
}

// Update counts in navigation
function updateCounts(entries) {
    // Anime counts
    document.querySelectorAll('[data-count="anime-all"]').forEach(el => {
        el.textContent = countEntries(entries, 'anime');
    });
    document.querySelectorAll('[data-count="anime-watching"]').forEach(el => {
        el.textContent = countEntries(entries, 'anime', 'watching');
    });
    document.querySelectorAll('[data-count="anime-dropped"]').forEach(el => {
        el.textContent = countEntries(entries, 'anime', 'dropped');
    });
    document.querySelectorAll('[data-count="anime-plan"]').forEach(el => {
        el.textContent = countEntries(entries, 'anime', 'plan');
    });
    document.querySelectorAll('[data-count="anime-complete"]').forEach(el => {
        el.textContent = countEntries(entries, 'anime', 'complete');
    });
    
    // Manga counts
    document.querySelectorAll('[data-count="manga-all"]').forEach(el => {
        el.textContent = countEntries(entries, 'manga');
    });
    document.querySelectorAll('[data-count="manga-reading"]').forEach(el => {
        el.textContent = countEntries(entries, 'manga', 'reading');
    });
    document.querySelectorAll('[data-count="manga-dropped"]').forEach(el => {
        el.textContent = countEntries(entries, 'manga', 'dropped');
    });
    document.querySelectorAll('[data-count="manga-plan"]').forEach(el => {
        el.textContent = countEntries(entries, 'manga', 'plan');
    });
    document.querySelectorAll('[data-count="manga-complete"]').forEach(el => {
        el.textContent = countEntries(entries, 'manga', 'complete');
    });
    
    // Manhwa counts
    document.querySelectorAll('[data-count="manhwa-all"]').forEach(el => {
        el.textContent = countEntries(entries, 'manhwa');
    });
    document.querySelectorAll('[data-count="manhwa-reading"]').forEach(el => {
        el.textContent = countEntries(entries, 'manhwa', 'reading');
    });
    document.querySelectorAll('[data-count="manhwa-dropped"]').forEach(el => {
        el.textContent = countEntries(entries, 'manhwa', 'dropped');
    });
    document.querySelectorAll('[data-count="manhwa-plan"]').forEach(el => {
        el.textContent = countEntries(entries, 'manhwa', 'plan');
    });
    document.querySelectorAll('[data-count="manhwa-complete"]').forEach(el => {
        el.textContent = countEntries(entries, 'manhwa', 'complete');
    });
}

// ===========================================
// SEARCH FUNCTIONS
// ===========================================

// Search entries
function searchEntries(entries, query) {
    if (!query) return entries;
    query = query.toLowerCase();
    return entries.filter(entry => 
        entry.title && entry.title.toLowerCase().includes(query)
    );
}

// ===========================================
// USER FUNCTIONS
// ===========================================

// Get current user
function getCurrentUser() {
    return localStorage.getItem(STORAGE_KEYS.USER);
}

// Logout
function logout() {
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.ENTRIES);
    localStorage.removeItem(STORAGE_KEYS.LAST_SYNC);
    resetLoadingState(); // Clear loading flag para mag-load ulit sa susunod
    window.location.href = 'login.html';
}

// ===========================================
// FOOTER FUNCTIONS
// ===========================================

// Load footer
function loadFooter() {
    const footer = document.getElementById('mainFooter');
    if (footer) {
        footer.innerHTML = `
            <div style="text-align: center; padding: 20px; color: #888;">
                <hr style="border-color: #333;">
                <p>Developer: Mark Joseph Rogasan © ${new Date().getFullYear()}</p>
                <p>ListahanNgAniméMangaManhwa v${CONFIG.VERSION}</p>
            </div>
        `;
    }
}

// ===========================================
// INITIALIZATION FUNCTIONS
// ===========================================

// Initialize all common functionality
function initCommon() {
    initDbChecker();
    loadFooter();
    
    // Add logout listener if logout button exists
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
    
    // Add database status indicator if not exists
    if (!document.getElementById('dbStatus')) {
        const statusDiv = document.createElement('div');
        statusDiv.id = 'dbStatus';
        statusDiv.className = 'db-indicator';
        statusDiv.style.cssText = 'position: fixed; bottom: 10px; right: 10px; padding: 5px 10px; border-radius: 5px; font-size: 12px; z-index: 1000;';
        document.body.appendChild(statusDiv);
    }
}

// Run initCommon when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if not on login page
    if (!window.location.pathname.includes('login.html') && 
        !window.location.pathname.includes('loading.html')) {
        initCommon();
    }
});
// ===========================================
// USER DISPLAY FUNCTIONS
// ===========================================

// Get current user
function getCurrentUser() {
    return localStorage.getItem(STORAGE_KEYS.USER);
}

// Update user display sa header
function updateUserDisplay() {
    const currentUser = getCurrentUser();
    const usernameElements = document.querySelectorAll('#currentUsername, #dropdownUsername');
    
    usernameElements.forEach(el => {
        if (el) {
            el.textContent = currentUser || 'Guest';
        }
    });
}

// Toggle user dropdown menu
function toggleUserMenu() {
    const menu = document.getElementById('userMenu');
    if (menu) {
        menu.classList.toggle('show');
        
        // Update username sa dropdown
        const dropdownUsername = document.getElementById('dropdownUsername');
        if (dropdownUsername) {
            dropdownUsername.textContent = getCurrentUser() || 'Guest';
        }
    }
}

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
    const userDropdown = document.querySelector('.user-dropdown');
    const userMenu = document.getElementById('userMenu');
    
    if (userDropdown && userMenu && !userDropdown.contains(event.target)) {
        userMenu.classList.remove('show');
    }
});

// Modified logout function
function logout() {
    localStorage.removeItem(STORAGE_KEYS.USER);
    sessionStorage.removeItem('loading_completed');
    window.location.href = 'login.html';
}

// Initialize user display on page load
document.addEventListener('DOMContentLoaded', function() {
    updateUserDisplay();
});
// ===========================================
// CHANGE PASSWORD FUNCTIONS
// ===========================================

// Open Change Password Modal
function openChangePasswordModal() {
    // Remove existing modal
    const existingModal = document.querySelector('.password-modal');
    if (existingModal) existingModal.remove();
    
    const currentUser = getCurrentUser();
    if (!currentUser) {
        alert('You must be logged in');
        return;
    }
    
    const modal = document.createElement('div');
    modal.className = 'password-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.95);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        backdrop-filter: blur(5px);
    `;
    
    modal.innerHTML = `
        <div style="
            background: #1a1a1a;
            padding: 40px;
            border-radius: 20px;
            max-width: 450px;
            width: 90%;
            border: 2px solid #ff6b6b;
            box-shadow: 0 15px 50px rgba(0,0,0,0.4);
        ">
            <h2 style="
                color: #ff6b6b;
                margin-bottom: 30px;
                font-size: 28px;
                display: flex;
                align-items: center;
                gap: 12px;
                border-bottom: 2px solid #333;
                padding-bottom: 15px;
            ">
                <span>🔒</span> Change Password
            </h2>
            
            <div id="passwordError" style="
                color: #ff4444;
                margin-bottom: 20px;
                font-size: 14px;
                display: none;
                padding: 12px;
                background: rgba(255,68,68,0.1);
                border-radius: 8px;
                border-left: 4px solid #ff4444;
            "></div>
            
            <div id="passwordSuccess" style="
                color: #00c851;
                margin-bottom: 20px;
                font-size: 14px;
                display: none;
                padding: 12px;
                background: rgba(0,200,81,0.1);
                border-radius: 8px;
                border-left: 4px solid #00c851;
            "></div>
            
            <div style="margin-bottom: 20px;">
                <label style="
                    color: #888;
                    display: block;
                    margin-bottom: 8px;
                    font-size: 14px;
                    font-weight: 600;
                ">👤 Current Password</label>
                <input type="password" id="currentPassword" style="
                    width: 100%;
                    padding: 14px;
                    background: #222;
                    border: 2px solid #444;
                    color: white;
                    border-radius: 10px;
                    font-size: 15px;
                " placeholder="Enter current password">
            </div>
            
            <div style="margin-bottom: 20px;">
                <label style="
                    color: #888;
                    display: block;
                    margin-bottom: 8px;
                    font-size: 14px;
                    font-weight: 600;
                ">🔑 New Password</label>
                <input type="password" id="newPassword" style="
                    width: 100%;
                    padding: 14px;
                    background: #222;
                    border: 2px solid #444;
                    color: white;
                    border-radius: 10px;
                    font-size: 15px;
                " placeholder="Enter new password">
                <small style="color: #888; display: block; margin-top: 5px;">
                    Password must be at least 6 characters
                </small>
            </div>
            
            <div style="margin-bottom: 30px;">
                <label style="
                    color: #888;
                    display: block;
                    margin-bottom: 8px;
                    font-size: 14px;
                    font-weight: 600;
                ">✅ Confirm New Password</label>
                <input type="password" id="confirmPassword" style="
                    width: 100%;
                    padding: 14px;
                    background: #222;
                    border: 2px solid #444;
                    color: white;
                    border-radius: 10px;
                    font-size: 15px;
                " placeholder="Confirm new password">
            </div>
            
            <div style="display: flex; gap: 15px;">
                <button onclick="changePassword()" style="
                    flex: 2;
                    background: #ff6b6b;
                    color: white;
                    border: none;
                    padding: 15px;
                    border-radius: 12px;
                    cursor: pointer;
                    font-size: 16px;
                    font-weight: bold;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    transition: all 0.3s;
                "
                onmouseover="this.style.background='#ff5252'; this.style.transform='scale(1.02)'"
                onmouseout="this.style.background='#ff6b6b'; this.style.transform='scale(1)'">
                    <span>💾</span> Save New Password
                </button>
                <button onclick="this.closest('.password-modal').remove()" style="
                    flex: 1;
                    background: #333;
                    color: white;
                    border: 1px solid #444;
                    padding: 15px;
                    border-radius: 12px;
                    cursor: pointer;
                    font-size: 16px;
                    font-weight: bold;
                    transition: all 0.3s;
                "
                onmouseover="this.style.background='#444'"
                onmouseout="this.style.background='#333'">
                    Cancel
                </button>
            </div>
            
            <p style="color: #888; margin-top: 20px; font-size: 12px; text-align: center;">
                User: ${currentUser}
            </p>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Change Password Function
async function changePassword() {
    const currentPassword = document.getElementById('currentPassword')?.value;
    const newPassword = document.getElementById('newPassword')?.value;
    const confirmPassword = document.getElementById('confirmPassword')?.value;
    const errorDiv = document.getElementById('passwordError');
    const successDiv = document.getElementById('passwordSuccess');
    const userId = getCurrentUser();
    
    // Hide previous messages
    if (errorDiv) errorDiv.style.display = 'none';
    if (successDiv) successDiv.style.display = 'none';
    
    // Validate
    if (!currentPassword || !newPassword || !confirmPassword) {
        if (errorDiv) {
            errorDiv.textContent = '⚠️ All fields are required';
            errorDiv.style.display = 'block';
        }
        return;
    }
    
    if (newPassword.length < 6) {
        if (errorDiv) {
            errorDiv.textContent = '⚠️ New password must be at least 6 characters';
            errorDiv.style.display = 'block';
        }
        return;
    }
    
    if (newPassword !== confirmPassword) {
        if (errorDiv) {
            errorDiv.textContent = '⚠️ New passwords do not match';
            errorDiv.style.display = 'block';
        }
        return;
    }
    
    // Show loading
    const saveBtn = document.querySelector('.password-modal button[onclick="changePassword()"]');
    const originalText = saveBtn?.innerHTML;
    if (saveBtn) {
        saveBtn.innerHTML = '<span>⏳</span> Changing password...';
        saveBtn.disabled = true;
    }
    
    try {
        const formData = new URLSearchParams();
        formData.append('action', 'changePassword');
        formData.append('userId', userId);
        formData.append('currentPassword', currentPassword);
        formData.append('newPassword', newPassword);
        
        const response = await fetch(CONFIG.API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            if (successDiv) {
                successDiv.textContent = '✅ Password changed successfully!';
                successDiv.style.display = 'block';
            }
            
            // Clear fields
            document.getElementById('currentPassword').value = '';
            document.getElementById('newPassword').value = '';
            document.getElementById('confirmPassword').value = '';
            
            // Close modal after 2 seconds
            setTimeout(() => {
                const modal = document.querySelector('.password-modal');
                if (modal) modal.remove();
            }, 2000);
        } else {
            if (errorDiv) {
                errorDiv.textContent = data.error || '❌ Failed to change password';
                errorDiv.style.display = 'block';
            }
        }
    } catch (error) {
        console.error('Error:', error);
        if (errorDiv) {
            errorDiv.textContent = '❌ Cannot connect to server. Please try again.';
            errorDiv.style.display = 'block';
        }
    } finally {
        // Restore button
        if (saveBtn) {
            saveBtn.innerHTML = originalText || '<span>💾</span> Save New Password';
            saveBtn.disabled = false;
        }
    }
}