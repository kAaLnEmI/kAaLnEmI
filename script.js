// Global Application State
const AppState = {
    currentStep: 0,
    userData: {
        mobileNumber: '',
        fullName: '',
        dateOfBirth: '',
        pan: '',
        fatherName: '',
        email: '',
        emailVerified: false,
        creditLimit: 50000,
        addonRequired: false,
        addons: [],
        selectedCard: null,
        cardType: '',
        termsAccepted: false
    },
    captcha: ''
};

// Local Storage Management
const Storage = {
    save() {
        localStorage.setItem('creditCardApp', JSON.stringify(AppState));
    },
    
    load() {
        const saved = localStorage.getItem('creditCardApp');
        if (saved) {
            Object.assign(AppState, JSON.parse(saved));
        }
    },
    
    clear() {
        localStorage.removeItem('creditCardApp');
    }
};

// Theme Management
const ThemeManager = {
    init() {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        this.setTheme(savedTheme);
        
        document.getElementById('themeToggle').addEventListener('click', () => {
            const currentTheme = document.body.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            this.setTheme(newTheme);
        });
    },
    
    setTheme(theme) {
        document.body.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        
        const themeIcon = document.querySelector('#themeToggle i');
        if (themeIcon) {
            themeIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    }
};

// Captcha Generator
const CaptchaManager = {
    generate() {
        const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
        let captcha = '';
        for (let i = 0; i < 5; i++) {
            captcha += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        AppState.captcha = captcha;
        
        const captchaDisplay = document.getElementById('captchaDisplay');
        if (captchaDisplay) {
            captchaDisplay.textContent = captcha;
        }
        
        return captcha;
    },
    
    verify(input) {
        return input.toLowerCase() === AppState.captcha.toLowerCase();
    }
};

// Form Validation
const Validator = {
    mobile(number) {
        const pattern = /^[6-9]\d{9}$/;
        return pattern.test(number);
    },
    
    email(email) {
        const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return pattern.test(email);
    },
    
    pan(pan) {
        const pattern = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
        return pattern.test(pan.toUpperCase());
    },
    
    name(name) {
        return name.trim().length >= 2 && /^[a-zA-Z\s]+$/.test(name);
    },
    
    date(date) {
        const selectedDate = new Date(date);
        const today = new Date();
        const age = today.getFullYear() - selectedDate.getFullYear();
        return age >= 18 && age <= 80;
    }
};

// Progress Bar Management
const ProgressManager = {
    update(currentStep) {
        const steps = document.querySelectorAll('.step');
        const progressFill = document.querySelector('.progress-fill');
        
        if (!steps.length) return;
        
        steps.forEach((step, index) => {
            step.classList.remove('active', 'completed');
            
            if (index < currentStep) {
                step.classList.add('completed');
            } else if (index === currentStep) {
                step.classList.add('active');
            }
        });
        
        if (progressFill) {
            const progress = (currentStep / (steps.length - 1)) * 100;
            progressFill.style.width = `${progress}%`;
        }
    }
};

// Navigation Management
const Navigation = {
    updateActiveLink(currentPage) {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.href.includes(currentPage)) {
                link.classList.add('active');
            }
        });
    },
    
    goToPage(page) {
        window.location.href = page;
    },
    
    goBack() {
        window.history.back();
    }
};

// Login Page Functionality
const LoginPage = {
    init() {
        Storage.load();
        ThemeManager.init();
        CaptchaManager.generate();
        
        // Refresh captcha button
        const refreshBtn = document.getElementById('refreshCaptcha');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                CaptchaManager.generate();
            });
        }
        
        // Login form submission
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', this.handleLogin.bind(this));
        }
    },
    
    handleLogin(e) {
        e.preventDefault();
        
        const mobileNumber = document.getElementById('mobileNumber').value;
        const captchaInput = document.getElementById('captcha').value;
        
        // Reset validation
        document.querySelectorAll('.form-control').forEach(input => {
            input.classList.remove('is-invalid');
        });
        
        let isValid = true;
        
        // Validate mobile number
        if (!Validator.mobile(mobileNumber)) {
            document.getElementById('mobileNumber').classList.add('is-invalid');
            isValid = false;
        }
        
        // Validate captcha
        if (!CaptchaManager.verify(captchaInput)) {
            document.getElementById('captcha').classList.add('is-invalid');
            isValid = false;
        }
        
        if (isValid) {
            AppState.userData.mobileNumber = mobileNumber;
            Storage.save();
            
            // Add loading state
            const submitBtn = document.querySelector('.login-btn');
            submitBtn.classList.add('loading');
            
            setTimeout(() => {
                Navigation.goToPage('step1.html');
            }, 1000);
        }
    }
};

// Step 1 Page Functionality
const Step1Page = {
    init() {
        Storage.load();
        ThemeManager.init();
        ProgressManager.update(0);
        
        // Pre-fill form if data exists
        this.populateForm();
        
        // Form submission
        const validateForm = document.getElementById('validateForm');
        if (validateForm) {
            validateForm.addEventListener('submit', this.handleValidation.bind(this));
        }
        
        // Back button
        const backBtn = document.getElementById('backBtn');
        if (backBtn) {
            backBtn.addEventListener('click', () => Navigation.goToPage('index.html'));
        }
    },
    
    populateForm() {
        const { fullName, dateOfBirth, pan } = AppState.userData;
        
        if (fullName) document.getElementById('fullName').value = fullName;
        if (dateOfBirth) document.getElementById('dateOfBirth').value = dateOfBirth;
        if (pan) document.getElementById('pan').value = pan;
    },
    
    handleValidation(e) {
        e.preventDefault();
        
        const fullName = document.getElementById('fullName').value;
        const dateOfBirth = document.getElementById('dateOfBirth').value;
        const pan = document.getElementById('pan').value.toUpperCase();
        
        // Reset validation
        document.querySelectorAll('.form-control').forEach(input => {
            input.classList.remove('is-invalid');
        });
        
        let isValid = true;
        
        // Validate full name
        if (!Validator.name(fullName)) {
            document.getElementById('fullName').classList.add('is-invalid');
            isValid = false;
        }
        
        // Validate date of birth
        if (!Validator.date(dateOfBirth)) {
            document.getElementById('dateOfBirth').classList.add('is-invalid');
            isValid = false;
        }
        
        // Validate PAN
        if (!Validator.pan(pan)) {
            document.getElementById('pan').classList.add('is-invalid');
            isValid = false;
        }
        
        if (isValid) {
            AppState.userData.fullName = fullName;
            AppState.userData.dateOfBirth = dateOfBirth;
            AppState.userData.pan = pan;
            Storage.save();
            
            const submitBtn = document.querySelector('#validateForm button[type="submit"]');
            submitBtn.classList.add('loading');
            
            setTimeout(() => {
                Navigation.goToPage('step2.html');
            }, 1000);
        }
    }
};

// Step 2 Page Functionality
const Step2Page = {
    init() {
        Storage.load();
        ThemeManager.init();
        ProgressManager.update(1);
        
        this.initRangeSlider();
        this.populateForm();
        this.initEmailValidation();
        this.initAddonModal();
        
        // Navigation buttons
        document.getElementById('backBtn').addEventListener('click', () => Navigation.goToPage('step1.html'));
        document.getElementById('nextBtn').addEventListener('click', this.handleNext.bind(this));
    },
    
    initRangeSlider() {
        const rangeInput = document.getElementById('creditLimit');
        const rangeValue = document.getElementById('rangeValue');
        
        if (rangeInput && rangeValue) {
            rangeInput.value = AppState.userData.creditLimit;
            rangeValue.textContent = `₹${AppState.userData.creditLimit.toLocaleString()}`;
            
            rangeInput.addEventListener('input', (e) => {
                const value = parseInt(e.target.value);
                rangeValue.textContent = `₹${value.toLocaleString()}`;
                AppState.userData.creditLimit = value;
                Storage.save();
            });
        }
    },
    
    populateForm() {
        const { fatherName, email } = AppState.userData;
        
        if (fatherName) document.getElementById('fatherName').value = fatherName;
        if (email) document.getElementById('email').value = email;
        
        if (AppState.userData.emailVerified) {
            this.showEmailVerified();
        }
        
        document.getElementById('addonRequired').checked = AppState.userData.addonRequired;
        if (AppState.userData.addonRequired) {
            document.querySelector('.addon-status').style.display = 'block';
        }
    },
    
    initEmailValidation() {
        const validateEmailBtn = document.getElementById('validateEmail');
        
        validateEmailBtn.addEventListener('click', () => {
            const email = document.getElementById('email').value;
            
            if (!Validator.email(email)) {
                document.getElementById('email').classList.add('is-invalid');
                return;
            }
            
            document.getElementById('email').classList.remove('is-invalid');
            AppState.userData.email = email;
            Storage.save();
            
            this.showOTPField();
        });
    },
    
    showOTPField() {
        const otpContainer = document.getElementById('otpContainer');
        otpContainer.style.display = 'block';
        otpContainer.classList.add('fade-in');
        
        const validateOTPBtn = document.getElementById('validateOTP');
        validateOTPBtn.addEventListener('click', () => {
            const otp = document.getElementById('otp').value;
            
            if (otp.length === 6) {
                AppState.userData.emailVerified = true;
                Storage.save();
                this.showEmailVerified();
                otpContainer.style.display = 'none';
            }
        });
    },
    
    showEmailVerified() {
        const emailContainer = document.querySelector('.email-container');
        const verifiedBadge = document.createElement('span');
        verifiedBadge.className = 'verified-badge';
        verifiedBadge.innerHTML = '<i class="fas fa-check"></i>Verified';
        
        // Remove existing badge if any
        const existingBadge = emailContainer.querySelector('.verified-badge');
        if (existingBadge) existingBadge.remove();
        
        emailContainer.appendChild(verifiedBadge);
    },
    
    initAddonModal() {
        const addonCheckbox = document.getElementById('addonRequired');
        const addonModal = new bootstrap.Modal(document.getElementById('addonModal'));
        
        addonCheckbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                addonModal.show();
            } else {
                AppState.userData.addonRequired = false;
                AppState.userData.addons = [];
                this.updateAddonStatus();
                Storage.save();
            }
        });
        
        this.initAddonForm();
    },
    
    initAddonForm() {
        let addonCount = 1;
        
        const addAddonBtn = document.getElementById('addAddon');
        const addonContainer = document.getElementById('addonContainer');
        const saveAddonsBtn = document.getElementById('saveAddons');
        
        addAddonBtn.addEventListener('click', () => {
            if (addonCount < 4) {
                addonCount++;
                this.createAddonGroup(addonCount, addonContainer);
            }
        });
        
        saveAddonsBtn.addEventListener('click', () => {
            this.saveAddons();
            bootstrap.Modal.getInstance(document.getElementById('addonModal')).hide();
        });
    },
    
    createAddonGroup(number, container) {
        const addonGroup = document.createElement('div');
        addonGroup.className = 'addon-group';
        addonGroup.dataset.addonNumber = number;
        
        addonGroup.innerHTML = `
            <div class="addon-header">
                <h6 class="addon-title">Addon ${number}</h6>
                <button type="button" class="btn btn-remove-addon" onclick="Step2Page.removeAddon(${number})">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="row">
                <div class="col-md-6 mb-3">
                    <label class="form-label">Addon Name</label>
                    <input type="text" class="form-control" data-field="name" required>
                </div>
                <div class="col-md-6 mb-3">
                    <label class="form-label">Mobile Number</label>
                    <input type="tel" class="form-control" data-field="mobile" required>
                </div>
                <div class="col-md-6 mb-3">
                    <label class="form-label">Date of Birth</label>
                    <input type="date" class="form-control" data-field="dob" required>
                </div>
                <div class="col-md-6 mb-3">
                    <label class="form-label">Relationship</label>
                    <select class="form-control" data-field="relationship" required>
                        <option value="">Select Relationship</option>
                        <option value="spouse">Spouse</option>
                        <option value="child">Child</option>
                        <option value="parent">Parent</option>
                        <option value="sibling">Sibling</option>
                    </select>
                </div>
            </div>
        `;
        
        container.appendChild(addonGroup);
    },
    
    removeAddon(number) {
        const addonGroup = document.querySelector(`[data-addon-number="${number}"]`);
        if (addonGroup) {
            addonGroup.remove();
        }
    },
    
    saveAddons() {
        const addonGroups = document.querySelectorAll('.addon-group');
        const addons = [];
        
        addonGroups.forEach(group => {
            const addon = {};
            const inputs = group.querySelectorAll('input, select');
            
            inputs.forEach(input => {
                addon[input.dataset.field] = input.value;
            });
            
            if (addon.name && addon.mobile && addon.dob && addon.relationship) {
                addons.push(addon);
            }
        });
        
        AppState.userData.addons = addons;
        AppState.userData.addonRequired = addons.length > 0;
        this.updateAddonStatus();
        Storage.save();
    },
    
    updateAddonStatus() {
        const statusElement = document.querySelector('.addon-status');
        const checkbox = document.getElementById('addonRequired');
        
        if (AppState.userData.addonRequired && AppState.userData.addons.length > 0) {
            statusElement.style.display = 'block';
            statusElement.innerHTML = `<i class="fas fa-check text-success"></i> ${AppState.userData.addons.length} addon(s) configured`;
            checkbox.checked = true;
            checkbox.disabled = true;
        } else {
            statusElement.style.display = 'none';
            checkbox.disabled = false;
        }
    },
    
    handleNext() {
        const fatherName = document.getElementById('fatherName').value;
        
        if (!Validator.name(fatherName)) {
            document.getElementById('fatherName').classList.add('is-invalid');
            return;
        }
        
        if (!AppState.userData.emailVerified) {
            alert('Please verify your email address before proceeding.');
            return;
        }
        
        AppState.userData.fatherName = fatherName;
        Storage.save();
        
        Navigation.goToPage('step3.html');
    }
};

// Step 3 Page Functionality
const Step3Page = {
    init() {
        Storage.load();
        ThemeManager.init();
        ProgressManager.update(2);
        
        this.loadCreditCards();
        
        document.getElementById('backBtn').addEventListener('click', () => Navigation.goToPage('step2.html'));
        document.getElementById('nextBtn').addEventListener('click', this.handleNext.bind(this));
    },
    
    loadCreditCards() {
        const cards = [
            {
                id: 'platinum',
                name: 'Platinum Rewards',
                features: ['5% cashback on dining', '2% on groceries', 'No annual fee', 'Travel insurance'],
                icon: 'fas fa-gem'
            },
            {
                id: 'gold',
                name: 'Gold Cashback',
                features: ['3% cashback on fuel', '1.5% on all purchases', 'Airport lounge access', 'EMI conversion'],
                icon: 'fas fa-coins'
            },
            {
                id: 'signature',
                name: 'Signature Elite',
                features: ['10% on premium brands', '24/7 concierge', 'Golf privileges', 'Priority banking'],
                icon: 'fas fa-crown'
            },
            {
                id: 'titanium',
                name: 'Titanium Business',
                features: ['Business rewards', 'Expense tracking', 'Fleet management', 'Corporate benefits'],
                icon: 'fas fa-briefcase'
            }
        ];
        
        const container = document.getElementById('cardContainer');
        container.innerHTML = '';
        
        cards.forEach(card => {
            const cardElement = this.createCardElement(card);
            container.appendChild(cardElement);
        });
    },
    
    createCardElement(card) {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'credit-card';
        cardDiv.dataset.cardId = card.id;
        
        cardDiv.innerHTML = `
            <div class="card-image">
                <i class="${card.icon}"></i>
            </div>
            <div class="card-details">
                <h5>${card.name}</h5>
                <ul class="card-features">
                    ${card.features.map(feature => `<li>${feature}</li>`).join('')}
                </ul>
            </div>
        `;
        
        cardDiv.addEventListener('click', () => this.selectCard(card.id, cardDiv));
        
        if (AppState.userData.selectedCard === card.id) {
            cardDiv.classList.add('selected');
        }
        
        return cardDiv;
    },
    
    selectCard(cardId, cardElement) {
        document.querySelectorAll('.credit-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        cardElement.classList.add('selected');
        AppState.userData.selectedCard = cardId;
        Storage.save();
    },
    
    handleNext() {
        if (!AppState.userData.selectedCard) {
            alert('Please select a credit card to continue.');
            return;
        }
        
        Navigation.goToPage('step4.html');
    }
};

// Step 4 Page Functionality
const Step4Page = {
    init() {
        Storage.load();
        ThemeManager.init();
        ProgressManager.update(3);
        
        this.loadSummary();
        this.initTermsModal();
        
        document.getElementById('backBtn').addEventListener('click', () => Navigation.goToPage('step3.html'));
        document.getElementById('submitApplication').addEventListener('click', this.handleSubmit.bind(this));
    },
    
    loadSummary() {
        const summaryContent = document.getElementById('summaryContent');
        const { userData } = AppState;
        
        summaryContent.innerHTML = `
            <div class="summary-row">
                <span class="summary-label">Mobile Number</span>
                <span class="summary-value">${userData.mobileNumber}</span>
            </div>
            <div class="summary-row">
                <span class="summary-label">Full Name</span>
                <span class="summary-value">${userData.fullName}</span>
            </div>
            <div class="summary-row">
                <span class="summary-label">Date of Birth</span>
                <span class="summary-value">${new Date(userData.dateOfBirth).toLocaleDateString()}</span>
            </div>
            <div class="summary-row">
                <span class="summary-label">PAN Number</span>
                <span class="summary-value">${userData.pan}</span>
            </div>
            <div class="summary-row">
                <span class="summary-label">Father's Name</span>
                <span class="summary-value">${userData.fatherName}</span>
            </div>
            <div class="summary-row">
                <span class="summary-label">Email</span>
                <span class="summary-value">${userData.email} <i class="fas fa-check-circle text-success"></i></span>
            </div>
            <div class="summary-row">
                <span class="summary-label">Credit Limit</span>
                <span class="summary-value">₹${userData.creditLimit.toLocaleString()}</span>
            </div>
            <div class="summary-row">
                <span class="summary-label">Selected Card</span>
                <span class="summary-value">${userData.selectedCard}</span>
            </div>
            ${userData.addonRequired ? `
            <div class="summary-row">
                <span class="summary-label">Addon Cards</span>
                <span class="summary-value">${userData.addons.length} addon(s)</span>
            </div>
            ` : ''}
        `;
    },
    
    initTermsModal() {
        const termsCheckbox = document.getElementById('termsAccepted');
        const termsModal = new bootstrap.Modal(document.getElementById('termsModal'));
        
        termsCheckbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                termsModal.show();
            }
        });
        
        document.getElementById('acceptTerms').addEventListener('click', () => {
            AppState.userData.termsAccepted = true;
            Storage.save();
            termsModal.hide();
        });
    },
    
    handleSubmit() {
        if (!AppState.userData.termsAccepted) {
            alert('Please accept the terms and conditions to continue.');
            return;
        }
        
        const submitBtn = document.getElementById('submitApplication');
        submitBtn.classList.add('loading');
        
        setTimeout(() => {
            Navigation.goToPage('card-selection.html');
        }, 2000);
    }
};

// Card Selection Page
const CardSelectionPage = {
    init() {
        Storage.load();
        ThemeManager.init();
        
        this.initCardTypeSelection();
    },
    
    initCardTypeSelection() {
        const cardTypes = document.querySelectorAll('.card-type-option');
        
        cardTypes.forEach(cardType => {
            cardType.addEventListener('click', () => {
                cardTypes.forEach(ct => ct.classList.remove('selected'));
                cardType.classList.add('selected');
                
                const cardTypeValue = cardType.dataset.cardType;
                AppState.userData.cardType = cardTypeValue;
                Storage.save();
                
                setTimeout(() => {
                    Navigation.goToPage('status.html');
                }, 1000);
            });
        });
    }
};

// Application Status Page
const StatusPage = {
    init() {
        Storage.load();
        ThemeManager.init();
        
        this.displayApplicationDetails();
    },
    
    displayApplicationDetails() {
        const { userData } = AppState;
        
        document.getElementById('personalDetails').innerHTML = this.createDetailGrid({
            'Full Name': userData.fullName,
            'Date of Birth': new Date(userData.dateOfBirth).toLocaleDateString(),
            'PAN Number': userData.pan,
            'Father\'s Name': userData.fatherName,
            'Mobile Number': userData.mobileNumber,
            'Email': userData.email
        });
        
        document.getElementById('applicationDetails').innerHTML = this.createDetailGrid({
            'Selected Card': userData.selectedCard,
            'Credit Limit': `₹${userData.creditLimit.toLocaleString()}`,
            'Card Type': userData.cardType,
            'Addon Cards': userData.addonRequired ? `${userData.addons.length} addon(s)` : 'None'
        });
        
        if (userData.addonRequired && userData.addons.length > 0) {
            const addonDetailsContainer = document.getElementById('addonDetails');
            addonDetailsContainer.style.display = 'block';
            
            let addonHtml = '';
            userData.addons.forEach((addon, index) => {
                addonHtml += `
                    <div class="detail-card mb-2">
                        <h6 class="text-primary mb-2">Addon ${index + 1}</h6>
                        ${this.createDetailGrid({
                            'Name': addon.name,
                            'Mobile': addon.mobile,
                            'Date of Birth': new Date(addon.dob).toLocaleDateString(),
                            'Relationship': addon.relationship
                        })}
                    </div>
                `;
            });
            
            document.getElementById('addonDetailsList').innerHTML = addonHtml;
        }
    },
    
    createDetailGrid(data) {
        return Object.entries(data).map(([label, value]) => `
            <div class="detail-item">
                <span class="detail-label">${label}</span>
                <span class="detail-value">${value}</span>
            </div>
        `).join('');
    }
};

// Page Router
const PageRouter = {
    init() {
        const page = this.getCurrentPage();
        
        switch (page) {
            case 'index.html':
            case '':
                LoginPage.init();
                break;
            case 'step1.html':
                Step1Page.init();
                break;
            case 'step2.html':
                Step2Page.init();
                break;
            case 'step3.html':
                Step3Page.init();
                break;
            case 'step4.html':
                Step4Page.init();
                break;
            case 'card-selection.html':
                CardSelectionPage.init();
                break;
            case 'status.html':
                StatusPage.init();
                break;
        }
    },
    
    getCurrentPage() {
        return window.location.pathname.split('/').pop();
    }
};

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    PageRouter.init();
});

// Utility Functions
const Utils = {
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount);
    },
    
    formatDate(date) {
        return new Date(date).toLocaleDateString('en-IN');
    },
    
    showToast(message, type = 'success') {
        // Create toast notification
        const toast = document.createElement('div');
        toast.className = `toast align-items-center text-white bg-${type} border-0`;
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'assertive');
        toast.setAttribute('aria-atomic', 'true');
        
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">${message}</div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        `;
        
        document.body.appendChild(toast);
        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();
        
        toast.addEventListener('hidden.bs.toast', () => {
            toast.remove();
        });
    }
};

// Global error handler
window.addEventListener('error', (e) => {
    console.error('Application Error:', e.error);
    Utils.showToast('An unexpected error occurred. Please try again.', 'danger');
});

// Make functions globally available for onclick handlers
window.Step2Page = Step2Page;