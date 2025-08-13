// Simple authentication system
class Auth {
    constructor() {
        this.isLoggedIn = false;
        this.user = null;
        this.checkAuthStatus();
    }

    checkAuthStatus() {
        const token = localStorage.getItem('authToken');
        const user = localStorage.getItem('user');
        
        if (token && user) {
            this.isLoggedIn = true;
            this.user = JSON.parse(user);
        }
    }

    login(email, password) {
        // Check if user is registered
        const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        const user = registeredUsers.find(u => u.email === email && u.password === password);
        
        if (user) {
            const token = 'mock_token_' + Date.now();
            
            localStorage.setItem('authToken', token);
            localStorage.setItem('user', JSON.stringify(user));
            
            this.isLoggedIn = true;
            this.user = user;
            
            return true;
        }
        return false;
    }

    logout() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        this.isLoggedIn = false;
        this.user = null;
        window.location.href = '/home';
    }

    registerUser(email, password, name) {
        // Check if user already exists
        const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        const existingUser = registeredUsers.find(u => u.email === email);
        
        if (existingUser) {
            return { success: false, message: 'User already exists with this email' };
        }
        
        // Add new user
        const newUser = {
            id: 'user_' + Date.now(),
            email: email,
            password: password,
            name: name || email.split('@')[0],
            createdAt: new Date().toISOString()
        };
        
        registeredUsers.push(newUser);
        localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
        
        return { success: true, message: 'User registered successfully' };
    }

    requireAuth() {
        if (!this.isLoggedIn) {
            window.location.href = '/login';
            return false;
        }
        return true;
    }

    updateNavigation() {
        const nav = document.querySelector('nav');
        if (!nav) return;

        const authButtons = nav.querySelector('.auth-buttons');
        const userInfo = nav.querySelector('.user-info');
        
        if (this.isLoggedIn) {
            if (authButtons) authButtons.style.display = 'none';
            if (userInfo) {
                userInfo.style.display = 'flex';
                userInfo.innerHTML = `
                    <span class="text-gray-700 mr-4">Welcome, ${this.user.name}</span>
                    <button onclick="auth.logout()" class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">Logout</button>
                `;
            }
        } else {
            if (authButtons) authButtons.style.display = 'flex';
            if (userInfo) userInfo.style.display = 'none';
        }
    }
}

// Initialize auth
const auth = new Auth();

// Update navigation on page load
document.addEventListener('DOMContentLoaded', () => {
    auth.updateNavigation();
}); 