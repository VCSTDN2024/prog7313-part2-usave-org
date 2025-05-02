document.getElementById('greeting-btn').addEventListener('click', function() {
    alert('Welcome to USave!');
});

function navigateToLogin() {
    document.body.classList.add('fade-out');
    setTimeout(function() {
      window.location.href = 'login.html';
    }, 500);
  }