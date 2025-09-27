// DOM Elements
const loginBtn = document.getElementById('loginBtn');
const userMenu = document.getElementById('userMenu');
const userDropdown = document.getElementById('userDropdown');
const logoutBtn = document.getElementById('logoutBtn');
const loginModal = document.getElementById('loginModal');
const modalClose = document.getElementById('modalClose');
const userAvatar = document.querySelector('.user-avatar');
const loginTabs = document.querySelectorAll('.login-tab');
const loginForms = document.querySelectorAll('.login-form');
const searchTabs = document.querySelectorAll('.tab');
const returnGroup = document.getElementById('returnGroup');
const flightSearchForm = document.getElementById('flightSearchForm');

// Check if user is logged in (simulated)
let isLoggedIn = false;
let userRole = null; // 'user', 'agent', 'admin'

// Show/hide login button and user menu based on login status
function updateAuthUI() {
    if (isLoggedIn) {
        loginBtn.style.display = 'none';
        userMenu.style.display = 'block';
    } else {
        loginBtn.style.display = 'block';
        userMenu.style.display = 'none';
    }
}

// Login button click
loginBtn.addEventListener('click', () => {
    loginModal.classList.add('active');
});

// Modal close button
modalClose.addEventListener('click', () => {
    loginModal.classList.remove('active');
});

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === loginModal) {
        loginModal.classList.remove('active');
    }
});

// User avatar click to toggle dropdown
userAvatar.addEventListener('click', () => {
    userDropdown.classList.toggle('active');
});

// Close dropdown when clicking outside
window.addEventListener('click', (e) => {
    if (!userMenu.contains(e.target)) {
        userDropdown.classList.remove('active');
    }
});

// Logout button
logoutBtn.addEventListener('click', () => {
    isLoggedIn = false;
    userRole = null;
    updateAuthUI();
    userDropdown.classList.remove('active');
    alert('You have been logged out successfully');
});

// Login tabs
loginTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        // Remove active class from all tabs and forms
        loginTabs.forEach(t => t.classList.remove('active'));
        loginForms.forEach(f => f.classList.remove('active'));
        
        // Add active class to clicked tab
        tab.classList.add('active');
        
        // Show corresponding form
        const loginType = tab.getAttribute('data-login');
        document.getElementById(`${loginType}Login`).classList.add('active');
    });
});

// Search tabs
searchTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        // Remove active class from all tabs
        searchTabs.forEach(t => t.classList.remove('active'));
        
        // Add active class to clicked tab
        tab.classList.add('active');
        
        // Show/hide return date based on tab
        const tabType = tab.getAttribute('data-tab');
        if (tabType === 'oneway' || tabType === 'multicity') {
            returnGroup.style.display = 'none';
        } else {
            returnGroup.style.display = 'flex';
        }
    });
});

// Flight search form submission
flightSearchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Get form values
    const origin = document.getElementById('origin').value;
    const destination = document.getElementById('destination').value;
    const departure = document.getElementById('departure').value;
    const returnDate = document.getElementById('return').value;
    const passengers = document.getElementById('passengers').value;
    
    // Basic validation
    if (!origin || !destination || !departure) {
        alert('Please fill in all required fields');
        return;
    }
    
     // Redirect to results.html with query params
    const url = `result/result.html?origin=${origin}&destination=${destination}&departure=${departure}&returnDate=${returnDate}&passengers=${passengers}`;
    window.location.href = url;
    
    // In a real app, this would redirect to search results page
    // window.location.href = 'search-results.html';
});

// Simulate login
document.querySelectorAll('.login-form form').forEach(form => {
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get the login type based on active form
        const activeForm = document.querySelector('.login-form.active');
        const loginType = activeForm.id.replace('Login', '');
        
        // Set user as logged in
        isLoggedIn = true;
        userRole = loginType;
        
        // Update UI
        updateAuthUI();
        loginModal.classList.remove('active');
        
        // Show success message
        alert(`Successfully logged in as ${loginType}`);
    });
});

// Google login button
document.querySelector('.google-login').addEventListener('click', () => {
    // Set user as logged in
    isLoggedIn = true;
    userRole = 'user';
    
    // Update UI
    updateAuthUI();
    loginModal.classList.remove('active');
    
    // Show success message
    alert('Successfully logged in with Google');
});

// Initialize UI
updateAuthUI();