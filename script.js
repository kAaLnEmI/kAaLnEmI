// Application State
let appData = {
    mobileNumber: '',
    captchaText: '',
    personalInfo: {
        fullName: '',
        dateOfBirth: '',
        pan: '',
        fatherName: '',
        email: '',
        emailVerified: false,
        creditLimit: 50000,
        addonRequired: false,
        addons: []
    },
    selectedCard: null,
    cardType: null,
    termsAccepted: false
};

// DOM Elements
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');
const body = document.body;

// Initialize application
$(document).ready(function() {
    initializeTheme();
    generateCaptcha();
    bindEvents();
    
    // Check which page we're on and initialize accordingly
    const path = window.location.pathname;
    if (path.includes('step') || path.includes('card-type') || path.includes('status')) {
        updateProgressBar();
    }
});

// Theme Management
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    body.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

function toggleTheme() {
    const currentTheme = body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    if (themeIcon) {
        themeIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
}

// Captcha Generation
function generateCaptcha() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let captcha = '';
    for (let i = 0; i < 6; i++) {
        captcha += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    appData.captchaText = captcha;
    const captchaDisplay = document.getElementById('captchaText');
    if (captchaDisplay) {
        captchaDisplay.textContent = captcha;
    }
}

// Form Validation
function validateMobile(mobile) {
    const mobileRegex = /^[0-9]{10}$/;
    return mobileRegex.test(mobile);
}

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePAN(pan) {
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return panRegex.test(pan.toUpperCase());
}

// Progress Bar Management
function updateProgressBar() {
    const path = window.location.pathname;
    let currentStep = 0;
    
    if (path.includes('step1') || path.includes('step-1')) currentStep = 1;
    else if (path.includes('step2') || path.includes('step-2')) currentStep = 2;
    else if (path.includes('step3') || path.includes('step-3')) currentStep = 3;
    else if (path.includes('step4') || path.includes('step-4')) currentStep = 4;
    
    const steps = document.querySelectorAll('.step');
    const progressFill = document.querySelector('.progress-line-fill');
    
    steps.forEach((step, index) => {
        const stepNumber = index + 1;
        step.classList.remove('active', 'completed');
        
        if (stepNumber < currentStep) {
            step.classList.add('completed');
        } else if (stepNumber === currentStep) {
            step.classList.add('active');
        }
    });
    
    if (progressFill) {
        const fillPercentage = ((currentStep - 1) / 3) * 100;
        progressFill.style.width = fillPercentage + '%';
    }
}

// Range Slider Management
function initializeRangeSlider() {
    const rangeSlider = document.getElementById('creditLimitRange');
    const rangeValue = document.getElementById('rangeValue');
    const minValue = document.getElementById('minValue');
    const maxValue = document.getElementById('maxValue');
    
    if (rangeSlider && rangeValue) {
        rangeSlider.addEventListener('input', function() {
            const value = parseInt(this.value);
            rangeValue.textContent = '₹' + value.toLocaleString('en-IN');
            appData.personalInfo.creditLimit = value;
        });
        
        // Set initial values
        if (minValue) minValue.textContent = '₹' + parseInt(rangeSlider.min).toLocaleString('en-IN');
        if (maxValue) maxValue.textContent = '₹' + parseInt(rangeSlider.max).toLocaleString('en-IN');
        rangeValue.textContent = '₹' + parseInt(rangeSlider.value).toLocaleString('en-IN');
    }
}

// Addon Management
function addAddon() {
    const addonsContainer = document.getElementById('addonsContainer');
    const currentAddons = addonsContainer.querySelectorAll('.addon-group').length;
    
    if (currentAddons >= 4) {
        alert('Maximum 4 addons allowed');
        return;
    }
    
    const addonNumber = currentAddons + 1;
    const addonHtml = `
        <div class="addon-group" data-addon="${addonNumber}">
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h6 class="mb-0">Addon ${addonNumber}</h6>
                <button type="button" class="round-btn btn-remove" onclick="removeAddon(${addonNumber})">
                    <i class="fas fa-minus"></i>
                </button>
            </div>
            <div class="row">
                <div class="col-md-6 mb-3">
                    <label class="form-label">Addon Name</label>
                    <input type="text" class="form-control" name="addonName${addonNumber}" required>
                </div>
                <div class="col-md-6 mb-3">
                    <label class="form-label">Mobile Number</label>
                    <input type="tel" class="form-control" name="addonMobile${addonNumber}" pattern="[0-9]{10}" required>
                </div>
                <div class="col-md-6 mb-3">
                    <label class="form-label">Date of Birth</label>
                    <input type="date" class="form-control" name="addonDob${addonNumber}" required>
                </div>
                <div class="col-md-6 mb-3">
                    <label class="form-label">Relationship</label>
                    <select class="form-select" name="addonRelationship${addonNumber}" required>
                        <option value="">Select Relationship</option>
                        <option value="spouse">Spouse</option>
                        <option value="child">Child</option>
                        <option value="parent">Parent</option>
                        <option value="sibling">Sibling</option>
                        <option value="other">Other</option>
                    </select>
                </div>
            </div>
        </div>
    `;
    
    addonsContainer.insertAdjacentHTML('beforeend', addonHtml);
    updateAddonButtons();
}

function removeAddon(addonNumber) {
    const addonGroup = document.querySelector(`[data-addon="${addonNumber}"]`);
    if (addonGroup) {
        addonGroup.remove();
        updateAddonNumbers();
        updateAddonButtons();
    }
}

function updateAddonNumbers() {
    const addonGroups = document.querySelectorAll('.addon-group');
    addonGroups.forEach((group, index) => {
        const newNumber = index + 1;
        group.setAttribute('data-addon', newNumber);
        group.querySelector('h6').textContent = `Addon ${newNumber}`;
        
        // Update input names
        const inputs = group.querySelectorAll('input, select');
        inputs.forEach(input => {
            const name = input.name;
            if (name.includes('addonName')) input.name = `addonName${newNumber}`;
            else if (name.includes('addonMobile')) input.name = `addonMobile${newNumber}`;
            else if (name.includes('addonDob')) input.name = `addonDob${newNumber}`;
            else if (name.includes('addonRelationship')) input.name = `addonRelationship${newNumber}`;
        });
        
        // Update remove button
        const removeBtn = group.querySelector('.btn-remove');
        removeBtn.setAttribute('onclick', `removeAddon(${newNumber})`);
    });
}

function updateAddonButtons() {
    const addonsContainer = document.getElementById('addonsContainer');
    const currentAddons = addonsContainer.querySelectorAll('.addon-group').length;
    const addBtn = document.getElementById('addAddonBtn');
    
    if (addBtn) {
        if (currentAddons >= 4) {
            addBtn.disabled = true;
            addBtn.innerHTML = '<i class="fas fa-plus"></i> Maximum Reached';
        } else {
            addBtn.disabled = false;
            addBtn.innerHTML = '<i class="fas fa-plus"></i> Add Another Addon';
        }
    }
}

// Email Verification
function sendOTP() {
    const email = document.getElementById('email').value;
    
    if (!validateEmail(email)) {
        alert('Please enter a valid email address');
        return;
    }
    
    // Simulate OTP sending
    const otpContainer = document.getElementById('otpContainer');
    otpContainer.style.display = 'block';
    
    // Simulate OTP (in real app, this would be sent to email)
    appData.otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('OTP sent:', appData.otp); // For demo purposes
    
    alert('OTP sent to your email! (Demo OTP: ' + appData.otp + ')');
}

function verifyOTP() {
    const enteredOTP = document.getElementById('otpInput').value;
    
    if (enteredOTP === appData.otp) {
        appData.personalInfo.emailVerified = true;
        
        // Show verified badge
        const verifiedBadge = document.createElement('span');
        verifiedBadge.className = 'verified-badge';
        verifiedBadge.innerHTML = '<i class="fas fa-check"></i> Verified';
        
        const emailField = document.getElementById('email');
        emailField.parentNode.appendChild(verifiedBadge);
        
        // Hide OTP container
        document.getElementById('otpContainer').style.display = 'none';
        
        alert('Email verified successfully!');
    } else {
        alert('Invalid OTP. Please try again.');
    }
}

// Credit Card Selection
function selectCard(cardElement, cardId) {
    // Remove selection from all cards
    document.querySelectorAll('.credit-card-item').forEach(card => {
        card.classList.remove('selected');
    });
    
    // Add selection to clicked card
    cardElement.classList.add('selected');
    appData.selectedCard = cardId;
}

// Card Type Selection
function selectCardType(type) {
    // Remove selection from all options
    document.querySelectorAll('.card-type-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    // Add selection to clicked option
    document.querySelector(`[data-type="${type}"]`).classList.add('selected');
    appData.cardType = type;
}

// Modal Management
function showTermsModal() {
    const modal = new bootstrap.Modal(document.getElementById('termsModal'));
    modal.show();
}

function showAddonModal() {
    const modal = new bootstrap.Modal(document.getElementById('addonModal'));
    modal.show();
}

function closeAddonModal() {
    const modal = bootstrap.Modal.getInstance(document.getElementById('addonModal'));
    modal.hide();
    
    // Mark addon checkbox as checked and disabled
    const addonCheckbox = document.getElementById('addonRequired');
    addonCheckbox.checked = true;
    addonCheckbox.disabled = true;
    appData.personalInfo.addonRequired = true;
}

// Form Submissions
function handleLogin(event) {
    event.preventDefault();
    
    const mobile = document.getElementById('mobileNumber').value;
    const captchaInput = document.getElementById('captchaInput').value;
    
    if (!validateMobile(mobile)) {
        alert('Please enter a valid 10-digit mobile number');
        return;
    }
    
    if (captchaInput.toUpperCase() !== appData.captchaText) {
        alert('Invalid captcha. Please try again.');
        generateCaptcha();
        document.getElementById('captchaInput').value = '';
        return;
    }
    
    appData.mobileNumber = mobile;
    
    // Add loading state
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<div class="loading"></div> Logging in...';
    submitBtn.disabled = true;
    
    // Simulate API call
    setTimeout(() => {
        window.location.href = 'step1.html';
    }, 1500);
}

function handleStep1(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const fullName = formData.get('fullName');
    const dateOfBirth = formData.get('dateOfBirth');
    const pan = formData.get('pan');
    
    if (!fullName || !dateOfBirth || !pan) {
        alert('Please fill all required fields');
        return;
    }
    
    if (!validatePAN(pan)) {
        alert('Please enter a valid PAN number (e.g., ABCDE1234F)');
        return;
    }
    
    appData.personalInfo.fullName = fullName;
    appData.personalInfo.dateOfBirth = dateOfBirth;
    appData.personalInfo.pan = pan.toUpperCase();
    
    // Add loading state
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<div class="loading"></div> Validating...';
    submitBtn.disabled = true;
    
    setTimeout(() => {
        window.location.href = 'step2.html';
    }, 2000);
}

function handleStep2(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const fatherName = formData.get('fatherName');
    const email = formData.get('email');
    
    if (!fatherName || !email) {
        alert('Please fill all required fields');
        return;
    }
    
    if (!appData.personalInfo.emailVerified) {
        alert('Please verify your email address first');
        return;
    }
    
    appData.personalInfo.fatherName = fatherName;
    appData.personalInfo.email = email;
    
    // Collect addon data if required
    if (appData.personalInfo.addonRequired) {
        const addonGroups = document.querySelectorAll('.addon-group');
        appData.personalInfo.addons = [];
        
        addonGroups.forEach((group, index) => {
            const addon = {
                name: group.querySelector(`[name="addonName${index + 1}"]`).value,
                mobile: group.querySelector(`[name="addonMobile${index + 1}"]`).value,
                dob: group.querySelector(`[name="addonDob${index + 1}"]`).value,
                relationship: group.querySelector(`[name="addonRelationship${index + 1}"]`).value
            };
            appData.personalInfo.addons.push(addon);
        });
    }
    
    window.location.href = 'step3.html';
}

function handleStep3(event) {
    event.preventDefault();
    
    if (!appData.selectedCard) {
        alert('Please select a credit card');
        return;
    }
    
    window.location.href = 'step4.html';
}

function handleStep4(event) {
    event.preventDefault();
    
    if (!appData.termsAccepted) {
        alert('Please accept the terms and conditions');
        return;
    }
    
    window.location.href = 'card-type.html';
}

function handleCardTypeSelection(event) {
    event.preventDefault();
    
    if (!appData.cardType) {
        alert('Please select a card type');
        return;
    }
    
    window.location.href = 'status.html';
}

// Navigation
function goBack() {
    window.history.back();
}

function goToNext(page) {
    window.location.href = page;
}

// Event Binding
function bindEvents() {
    // Theme toggle
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    // Captcha refresh
    const refreshCaptcha = document.getElementById('refreshCaptcha');
    if (refreshCaptcha) {
        refreshCaptcha.addEventListener('click', generateCaptcha);
    }
    
    // Form submissions
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    const step1Form = document.getElementById('step1Form');
    if (step1Form) {
        step1Form.addEventListener('submit', handleStep1);
    }
    
    const step2Form = document.getElementById('step2Form');
    if (step2Form) {
        step2Form.addEventListener('submit', handleStep2);
    }
    
    const step3Form = document.getElementById('step3Form');
    if (step3Form) {
        step3Form.addEventListener('submit', handleStep3);
    }
    
    const step4Form = document.getElementById('step4Form');
    if (step4Form) {
        step4Form.addEventListener('submit', handleStep4);
    }
    
    const cardTypeForm = document.getElementById('cardTypeForm');
    if (cardTypeForm) {
        cardTypeForm.addEventListener('submit', handleCardTypeSelection);
    }
    
    // Range slider
    initializeRangeSlider();
    
    // Terms checkbox
    const termsCheckbox = document.getElementById('termsAccepted');
    if (termsCheckbox) {
        termsCheckbox.addEventListener('change', function() {
            appData.termsAccepted = this.checked;
        });
    }
    
    // Addon checkbox
    const addonCheckbox = document.getElementById('addonRequired');
    if (addonCheckbox) {
        addonCheckbox.addEventListener('change', function() {
            if (this.checked && !this.disabled) {
                showAddonModal();
            }
        });
    }
    
    // Mobile number formatting
    const mobileInput = document.getElementById('mobileNumber');
    if (mobileInput) {
        mobileInput.addEventListener('input', function() {
            this.value = this.value.replace(/\D/g, '').slice(0, 10);
        });
    }
    
    // PAN formatting
    const panInput = document.getElementById('pan');
    if (panInput) {
        panInput.addEventListener('input', function() {
            this.value = this.value.toUpperCase().slice(0, 10);
        });
    }
}

// Load application data from localStorage if available
function loadAppData() {
    const savedData = localStorage.getItem('creditCardAppData');
    if (savedData) {
        appData = { ...appData, ...JSON.parse(savedData) };
    }
}

// Save application data to localStorage
function saveAppData() {
    localStorage.setItem('creditCardAppData', JSON.stringify(appData));
}

// Populate forms with saved data
function populateFormData() {
    // This function would populate form fields with saved data
    // Implementation depends on which page is loaded
}

// Utility functions
function formatCurrency(amount) {
    return '₹' + amount.toLocaleString('en-IN');
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN');
}

function generateApplicationId() {
    return 'CC' + Date.now().toString().slice(-8);
}

// Auto-save form data
$(document).on('input change', 'form input, form select, form textarea', function() {
    saveAppData();
});

// Load data on page load
$(document).ready(function() {
    loadAppData();
    populateFormData();
});