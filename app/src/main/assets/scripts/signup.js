document.addEventListener('DOMContentLoaded', function () {
    const nameInput = document.querySelector('input[type="text"]');
    const emailInput = document.querySelector('input[type="email"]');
    const phoneInput = document.querySelector('input[type="tel"]');
    const passwordInputs = document.querySelectorAll('input[type="password"]');
    const termsCheckbox = document.querySelector('.terms-checkbox');
    const signupButton = document.querySelector('.signup-button');
    const loginLink = document.querySelector('.login-link span');
    const eyeIcons = document.querySelectorAll('.eye-icon');
    const errorContainer = document.createElement('div');
    errorContainer.className = 'error-message';
    errorContainer.style.display = 'none';
    errorContainer.style.color = '#ff4d4f';
    errorContainer.style.marginTop = '10px';
    errorContainer.style.textAlign = 'center';
    errorContainer.style.fontSize = '14px';
    document.querySelector('.terms-container').after(errorContainer);

    const successContainer = document.getElementById('successMessage');

    eyeIcons.forEach((eyeIcon, index) => {
        eyeIcon.addEventListener('click', function () {
            const passwordInput = passwordInputs[index];
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
        });
    });

    loginLink.addEventListener('click', function () {
        window.location.href = 'login.html';
    });

    signupButton.addEventListener('click', async function () {
        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const phone = phoneInput.value.trim();
        const password = passwordInputs[0].value;
        const confirmPassword = passwordInputs[1].value;
        if (!name || !email || !phone || !password || !confirmPassword) {
            showError('Please fill in all fields');
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showError('Please enter a valid email address');
            return;
        }
        const phoneRegex = /^\d{9,12}$/;
        const cleanPhone = phone.replace(/\s+/g, '');
        if (!phoneRegex.test(cleanPhone)) {
            showError('Please enter a valid phone number');
            return;
        }
        if (password !== confirmPassword) {
            showError('Passwords do not match');
            return;
        }
        if (password.length < 8) {
            showError('Password must be at least 8 characters');
            return;
        }
        if (!termsCheckbox.checked) {
            showError('Please agree to the Terms and Conditions');
            return;
        }
        try {
            const exists = await userExists(cleanPhone, email);
            if (exists) {
                showError('User already exists');
                return;
            }
            await createAccount(name, email, cleanPhone, password);
            showSuccess('Signup successful! Redirecting to login...');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        } catch (e) {
            console.error("Database error:", e);
            showError('Signup failed');
        }
    });
    const prompt = document.getElementById('signupPrompt');
    const promptText = document.getElementById('signupPromptText');


    function showPrompt(message, type) {
        promptText.textContent = message;
        prompt.classList.remove('error', 'success');
        prompt.classList.add(type);
        prompt.style.display = 'block';
        setTimeout(() => {
            prompt.style.display = 'none';
        }, 2500);
    }

    function showError(message) {
        showPrompt(message, 'error');
        if (successContainer) successContainer.style.display = 'none';
    }

    function showSuccess(message) {
        showPrompt(message, 'success');
        if (successContainer) {
            successContainer.textContent = message;
            successContainer.style.display = 'block';
        }
        errorContainer.style.display = 'none';
    }

    function showError(message) {
        errorContainer.textContent = message;
        errorContainer.style.display = 'block';
        if (successContainer) successContainer.style.display = 'none';
        setTimeout(() => {
            errorContainer.style.display = 'none';
        }, 3000);
    }

    function showSuccess(message) {
        if (successContainer) {
            successContainer.textContent = message;
            successContainer.style.display = 'block';
        }
        errorContainer.style.display = 'none';
    }

    async function userExists(phone, email) {
        const sql = 'SELECT id FROM users WHERE phone = ? OR email = ? LIMIT 1';
        const params = [phone, email];
        const result = JSON.parse(window.AndroidDB.query(sql, JSON.stringify(params)));
        return result.length > 0;
    }

    async function createAccount(name, email, phone, password) {
        const sql = 'INSERT INTO users (name, email, phone, password) VALUES (?, ?, ?, ?)';
        const params = [name, email, phone, password];
        window.AndroidDB.execute(sql, JSON.stringify(params));
    }
});