// ===== AUTH INTEGRATION FOR TORISOM =====
const API_BASE = 'http://localhost:3000/api';

(function checkAuth() {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  if (token && userStr) {
    try {
      const user = JSON.parse(userStr);
      updateUIForLoggedInUser(user);
    } catch(e) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }
})();

function updateUIForLoggedInUser(user) {
  const loginBtn = document.getElementById('loginBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const dashboardLink = document.getElementById('dashboardLink');
  const loginStatus = document.getElementById('loginStatus');
  const homepageLoginBtn = document.getElementById('homepageLoginBtn');
  const homepageRatingForm = document.getElementById('homepageRatingForm');
  const loginToReviewBtn = document.getElementById('loginToReviewBtn');
  const ratingForm = document.getElementById('ratingForm');

  if (loginBtn) loginBtn.style.display = 'none';
  if (logoutBtn) logoutBtn.style.display = 'inline-block';
  if (loginStatus) loginStatus.textContent = 'Hi, ' + (user.name || user.email);
  if (dashboardLink) {
    dashboardLink.style.display = 'inline-block';
    if (user.role === 'admin') {
      dashboardLink.href = '/admin-dashboard';
      dashboardLink.innerHTML = '⚙️ Admin Panel';
    } else {
      dashboardLink.href = '/user-dashboard';
      dashboardLink.innerHTML = '📊 Dashboard';
    }
  }
  if (homepageLoginBtn) homepageLoginBtn.style.display = 'none';
  if (homepageRatingForm) homepageRatingForm.style.display = 'block';
  if (loginToReviewBtn) loginToReviewBtn.style.display = 'none';
  if (ratingForm) ratingForm.style.display = 'block';
}

function updateUIForLoggedOutUser() {
  const loginBtn = document.getElementById('loginBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const dashboardLink = document.getElementById('dashboardLink');
  const loginStatus = document.getElementById('loginStatus');
  const homepageLoginBtn = document.getElementById('homepageLoginBtn');
  const homepageRatingForm = document.getElementById('homepageRatingForm');
  const loginToReviewBtn = document.getElementById('loginToReviewBtn');
  const ratingForm = document.getElementById('ratingForm');

  if (loginBtn) loginBtn.style.display = 'inline-block';
  if (logoutBtn) logoutBtn.style.display = 'none';
  if (dashboardLink) dashboardLink.style.display = 'none';
  if (loginStatus) loginStatus.textContent = '';
  if (homepageLoginBtn) homepageLoginBtn.style.display = 'inline-block';
  if (homepageRatingForm) homepageRatingForm.style.display = 'none';
  if (loginToReviewBtn) loginToReviewBtn.style.display = 'inline-block';
  if (ratingForm) ratingForm.style.display = 'none';
}

async function loginUser() {
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  if (!email || !password) { alert('Please enter email and password'); return; }
  try {
    const res = await fetch(API_BASE + '/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (res.ok) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      updateUIForLoggedInUser(data.user);
      closeLoginModal();
    } else if (data.verification_required) {
      alert('Your email is not verified yet. Continue verification on the login page.');
      window.location.href = 'login.html';
    } else {
      alert(data.error || 'Login failed');
    }
  } catch (err) {
    alert('Connection error. Is the server running?');
  }
}

function logoutUser() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  updateUIForLoggedOutUser();
}

async function saveSpot(spotId) {
  const token = localStorage.getItem('token');
  if (!token) { showLoginModal(); return; }
  try {
    const res = await fetch(API_BASE + '/user/saved-spots/' + spotId, {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + token }
    });
    const data = await res.json();
    if (res.ok) { alert('Spot saved!'); } else { alert(data.error || 'Failed.'); }
  } catch (err) { alert('Connection error.'); }
}

async function unsaveSpot(spotId) {
  const token = localStorage.getItem('token');
  if (!token) return;
  try {
    const res = await fetch(API_BASE + '/user/saved-spots/' + spotId, {
      method: 'DELETE',
      headers: { 'Authorization': 'Bearer ' + token }
    });
    const data = await res.json();
    if (res.ok) { alert('Spot removed.'); } else { alert(data.error || 'Failed.'); }
  } catch (err) { alert('Connection error.'); }
}

document.addEventListener('click', function(e) {
  if (e.target.classList.contains('star')) {
    const container = e.target.parentElement;
    const value = parseInt(e.target.dataset.value);
    container.querySelectorAll('.star').forEach(s => {
      s.classList.toggle('active', parseInt(s.dataset.value) <= value);
      s.textContent = parseInt(s.dataset.value) <= value ? '★' : '☆';
    });
  }
});