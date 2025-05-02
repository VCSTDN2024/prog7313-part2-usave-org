document.addEventListener('DOMContentLoaded', function() {
    const loginButton = document.getElementById('loginButton');
    const phoneInput = document.getElementById('phoneNumber');
    const passwordInput = document.getElementById('password');
    const togglePassword = document.getElementById('togglePassword');
    const createAccountLink = document.getElementById('createAccountLink');

    // Toggle password visibility
    togglePassword.addEventListener('click', function() {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
    });

    // Login button click handler
    loginButton.addEventListener('click', function(e) {
        e.preventDefault();
        const phone = phoneInput.value.replace(/\s+/g, '').trim();
        const password = passwordInput.value.trim();
        if (!phone || !password) {
            showError('Please fill in all fields');
            return;
        }
        const phoneRegex = /^\d{9,12}$/;
        if (!phoneRegex.test(phone)) {
            showError('Please enter a valid phone number');
            return;
        }
        login(phone, password);
    });

    // Navigate to signup
    createAccountLink.addEventListener('click', function() {
        window.location.href = 'signup.html';
    });

    // Show error as toast
    function showError(message) {
        const toast = document.getElementById('toast');
        if (toast) {
            toast.textContent = message;
            toast.className = 'toast show';
            setTimeout(() => {
                toast.className = 'toast';
            }, 2500);
        }
    }

    // Login logic
    function login(phone, password) {
        loginButton.querySelector('p').textContent = 'Logging in...';
        loginButton.style.backgroundColor = 'rgba(193, 157, 0, 1)';
        try {
            const sql = 'SELECT id, name, phone, email FROM users WHERE REPLACE(phone, " ", "") = ? AND password = ? LIMIT 1';
            const params = [phone, password];
            const result = JSON.parse(window.AndroidDB.query(sql, JSON.stringify(params)));
            if (result.length > 0) {
                const user = result[0];
                localStorage.setItem('currentUser', JSON.stringify(user));
                // Add console log for debugging
                console.log("User logged in successfully:", user);
                window.location.href = 'overview.html';
            } else {
                showError('Invalid phone number or password');
                loginButton.querySelector('p').textContent = 'Login';
                loginButton.style.backgroundColor = 'rgba(253, 197, 0, 1)';
            }
        } catch (e) {
            console.error("Login error:", e);
            showError('Login failed');
            loginButton.querySelector('p').textContent = 'Login';
            loginButton.style.backgroundColor = 'rgba(253, 197, 0, 1)';
        }
    }
});