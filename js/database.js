// ============================================
// database.js - Google Sheets Database with ONLINE Status
// ============================================

// database.js - UPDATED WITH USER ID

const Database = {
    // Fetch all entries for current user
    async getAllEntries() {
        const userId = getCurrentUser();
        if (!userId) {
            console.error('No user logged in');
            return [];
        }
        
        try {
            const response = await fetch(`${CONFIG.API_URL}?action=getAll&userId=${userId}&_=${Date.now()}`);
            const data = await response.json();
            
            if (data.success) {
                localStorage.setItem(STORAGE_KEYS.ENTRIES + '_' + userId, JSON.stringify(data.data));
                localStorage.setItem(STORAGE_KEYS.LAST_SYNC + '_' + userId, Date.now().toString());
                return data.data;
            }
            return this.getLocalEntries();
        } catch (error) {
            console.error('Error fetching entries:', error);
            return this.getLocalEntries();
        }
    },
    
    // Get local entries for current user
    getLocalEntries() {
        const userId = getCurrentUser();
        if (!userId) return [];
        
        const entries = localStorage.getItem(STORAGE_KEYS.ENTRIES + '_' + userId);
        return entries ? JSON.parse(entries) : [];
    },
    
    // Add new entry for current user
    async addEntry(entry) {
        const userId = getCurrentUser();
        if (!userId) {
            return { success: false, error: 'No user logged in' };
        }
        
        const formData = new FormData();
        formData.append('action', 'add');
        formData.append('userId', userId);  // ✅ Send userId
        Object.keys(entry).forEach(key => {
            formData.append(key, entry[key]);
        });
        
        try {
            const response = await fetch(CONFIG.API_URL, {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            
            if (data.success) {
                await this.getAllEntries(); // Refresh cache
                return { success: true, id: data.id };
            }
            return { success: false, error: data.error };
        } catch (error) {
            console.error('Error adding entry:', error);
            return { success: false, error: error.message };
        }
    },
    
    // Update entry for current user
    async updateEntry(id, updates) {
        const userId = getCurrentUser();
        if (!userId) {
            return { success: false, error: 'No user logged in' };
        }
        
        const formData = new FormData();
        formData.append('action', 'update');
        formData.append('id', id);
        formData.append('userId', userId);  // ✅ Send userId
        Object.keys(updates).forEach(key => {
            formData.append(key, updates[key]);
        });
        
        try {
            const response = await fetch(CONFIG.API_URL, {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            
            if (data.success) {
                await this.getAllEntries(); // Refresh cache
                return { success: true };
            }
            return { success: false, error: data.error };
        } catch (error) {
            console.error('Error updating entry:', error);
            return { success: false, error: error.message };
        }
    },
    
    // Delete entry for current user
    async deleteEntry(id) {
        const userId = getCurrentUser();
        if (!userId) {
            return { success: false, error: 'No user logged in' };
        }
        
        const formData = new FormData();
        formData.append('action', 'delete');
        formData.append('id', id);
        formData.append('userId', userId);  // ✅ Send userId
        
        try {
            const response = await fetch(CONFIG.API_URL, {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            
            if (data.success) {
                await this.getAllEntries(); // Refresh cache
                return { success: true };
            }
            return { success: false, error: data.error };
        } catch (error) {
            console.error('Error deleting entry:', error);
            return { success: false, error: error.message };
        }
    }
};

    // ============================================
    // 🟢 UPDATE ONLINE STATUS IN UI
    // ============================================
    updateOnlineStatus(isOnline) {
        // Update dbStatus element
        const dbStatus = document.getElementById('dbStatus');
        if (dbStatus) {
            if (isOnline) {
                dbStatus.innerHTML = '● ONLINE';
                dbStatus.className = 'db-indicator online';
                dbStatus.style.color = '#10b981';
                dbStatus.title = 'Google Sheets Connected';
            } else {
                dbStatus.innerHTML = '● OFFLINE';
                dbStatus.className = 'db-indicator offline';
                dbStatus.style.color = '#ff6b6b';
                dbStatus.title = 'Using offline cache';
            }
        }

        // Update all elements with db-indicator class
        document.querySelectorAll('.db-indicator').forEach(el => {
            if (isOnline) {
                el.innerHTML = '● ONLINE';
                el.classList.remove('offline');
                el.classList.add('online');
                el.style.color = '#10b981';
            } else {
                el.innerHTML = '● OFFLINE';
                el.classList.remove('online');
                el.classList.add('offline');
                el.style.color = '#ff6b6b';
            }
        });

        console.log(`📡 Google Sheets Status: ${isOnline ? 'ONLINE' : 'OFFLINE'}`);
    },

    // ============================================
    // 🟢 CHECK CONNECTION TO GOOGLE SHEETS
    // ============================================
    async checkConnection() {
        try {
            const response = await fetch(`${CONFIG.API_URL}?action=getAll&_=${Date.now()}`, {
                method: 'GET',
                headers: {
                    'Cache-Control': 'no-cache'
                }
            });
            
            const data = await response.json();
            const isOnline = data.success === true;
            
            this.updateOnlineStatus(isOnline);
            return isOnline;
            
        } catch (error) {
            console.error('Connection check failed:', error);
            this.updateOnlineStatus(false);
            return false;
        }
    },

    // ============================================
    // 🟢 INITIALIZE STATUS MONITORING
    // ============================================
    initStatusListener() {
        // Initial check
        setTimeout(() => {
            this.checkConnection();
        }, 500);
        
        // Check connection every 30 seconds
        setInterval(() => {
            this.checkConnection();
        }, 30000);
        
        // Listen for browser online/offline events
        window.addEventListener('online', () => {
            console.log('🌐 Browser is online, checking Google Sheets...');
            this.checkConnection();
        });
        
        window.addEventListener('offline', () => {
            console.log('📴 Browser is offline');
            this.updateOnlineStatus(false);
        });
        
        console.log('📡 Database status listener initialized');
    }
};

// ============================================
// 🟢 AUTO-INITIALIZE ON PAGE LOAD
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    if (typeof Database !== 'undefined') {
        // Wait a bit for other scripts to load
        setTimeout(() => {
            Database.initStatusListener();
        }, 1000);
    }
});

// Make Database global
window.Database = Database;


console.log('✅ database.js loaded with ONLINE status fix');
