// auth.js
// Authentication and user management

const Auth = {
    // Register new user
    async register(userId, password) {
        const formData = new FormData();
        formData.append('action', 'register');
        formData.append('userId', userId);
        formData.append('password', password);
        
        try {
            const response = await fetch(CONFIG.API_URL, {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Registration error:', error);
            return { success: false, error: error.message };
        }
    },
    
    // Login user
    async login(userId, password) {
        const formData = new FormData();
        formData.append('action', 'login');
        formData.append('userId', userId);
        formData.append('password', password);
        
        try {
            const response = await fetch(CONFIG.API_URL, {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            
            if (data.success) {
                localStorage.setItem(STORAGE_KEYS.USER, userId);
            }
            return data;
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: error.message };
        }
    },
    
    // Check if user is logged in
    isAuthenticated() {
        return localStorage.getItem(STORAGE_KEYS.USER) !== null;
    },
    
    // Logout
    logout() {
        localStorage.removeItem(STORAGE_KEYS.USER);
        window.location.href = 'login.html';
    }
};

// Auth guard - redirect to login if not authenticated
function requireAuth() {
    if (!Auth.isAuthenticated() && 
        !window.location.pathname.includes('login.html') && 
        !window.location.pathname.includes('register.html')) {
        window.location.href = 'login.html';
    }
}

// Execute on page load
document.addEventListener('DOMContentLoaded', function() {
    if (!window.location.pathname.includes('loading.html')) {
        requireAuth();
    }
});
