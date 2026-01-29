// ============================================
// Ottawa Arab Points System - COMPLETE SCRIPT
// Version: 3.0.0
// Last Updated: 2024-01-28
// Features: Points System + Store Promotions
// ============================================

// ==================== GLOBAL STATE ====================
let currentUser = null;
let isAdmin = false;
let qrScanner = null;
let users = [];
let transactions = [];
let stores = [];
let rewards = [];
let promotions = [];

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', function() {
    console.log('Ottawa Arab Points System Initializing...');
    
    // Initialize mock data
    initializeMockData();
    
    // Check for existing session
    checkExistingSession();
    
    // Setup all event listeners
    setupAllEventListeners();
    
    // Load store promotions
    loadStorePromotions();
    
    // Create debug panel for development
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        setTimeout(createDebugPanel, 1000);
    }
    
    console.log('System initialized successfully');
});

// ==================== MOCK DATA INITIALIZATION ====================
function initializeMockData() {
    // Check if data already exists
    if (localStorage.getItem('ottawaInitialized')) {
        return; // Data already initialized
    }
    
    // Mock Users
    users = [
        { 
            id: 1, 
            email: 'demo@ottawaarabpoints.com', 
            password: 'demo123', 
            firstName: 'Demo', 
            lastName: 'User', 
            name: 'Demo User',
            phone: '(613) 555-1234',
            points: 350,
            joinDate: '2024-01-15',
            totalStoresVisited: 5,
            totalRewardsEarned: 2,
            totalPromotionsRedeemed: 1,
            memberSince: '2024',
            userLevel: 'Silver',
            isAdmin: false
        },
        { 
            id: 2, 
            email: 'admin@ottawaarabpoints.com', 
            password: 'admin123', 
            firstName: 'Admin', 
            lastName: 'User', 
            name: 'Admin User',
            phone: '(613) 555-5678',
            points: 1000,
            joinDate: '2024-01-10',
            totalStoresVisited: 12,
            totalRewardsEarned: 5,
            totalPromotionsRedeemed: 3,
            memberSince: '2024',
            userLevel: 'Gold',
            isAdmin: true
        }
    ];
    
    // Mock Stores
    stores = [
        { 
            id: 'store-001', 
            name: 'Aladdin Bakery', 
            category: 'Bakery', 
            location: 'Bank Street',
            points: 15,
            description: 'Fresh Arabic bread and pastries',
            active: true 
        },
        { 
            id: 'store-002', 
            name: 'Damascus Restaurant', 
            category: 'Restaurant', 
            location: 'Downtown',
            points: 25,
            description: 'Authentic Syrian cuisine',
            active: true 
        },
        { 
            id: 'store-003', 
            name: 'Beirut Market', 
            category: 'Grocery', 
            location: 'Carling Avenue',
            points: 10,
            description: 'Middle Eastern grocery store',
            active: true 
        },
        { 
            id: 'store-004', 
            name: 'Cairo Coffee House', 
            category: 'Cafe', 
            location: 'Rideau Street',
            points: 5,
            description: 'Egyptian coffee and tea',
            active: true 
        }
    ];
    
    // Mock Rewards
    rewards = [
        { 
            id: 1, 
            name: '10% Store Discount', 
            points: 100, 
            type: 'discount',
            description: 'Get 10% off your next purchase'
        },
        { 
            id: 2, 
            name: 'Free Baklava', 
            points: 150, 
            type: 'food',
            description: 'Complimentary baklava dessert'
        },
        { 
            id: 3, 
            name: '$10 Gift Card', 
            points: 500, 
            type: 'giftcard',
            description: '$10 store gift card'
        },
        { 
            id: 4, 
            name: 'Free Arabic Coffee', 
            points: 50, 
            type: 'food',
            description: 'Free medium Arabic coffee'
        },
        { 
            id: 5, 
            name: 'Premium Membership', 
            points: 1000, 
            type: 'membership',
            description: '1 month premium membership'
        }
    ];
    
    // Mock Transactions
    transactions = [
        { 
            id: 'TXN-001', 
            userId: 1, 
            storeId: 'store-001', 
            storeName: 'Aladdin Bakery',
            points: 15, 
            type: 'earned', 
            timestamp: '2024-01-28T10:30:00Z', 
            status: 'completed' 
        },
        { 
            id: 'TXN-002', 
            userId: 1, 
            storeId: 'store-002', 
            storeName: 'Damascus Restaurant',
            points: 25, 
            type: 'earned', 
            timestamp: '2024-01-27T12:15:00Z', 
            status: 'completed' 
        },
        { 
            id: 'TXN-003', 
            userId: 1, 
            storeId: 'store-001', 
            storeName: 'Aladdin Bakery',
            points: -50, 
            type: 'promotion_redeemed',
            promotionId: 'PROMO-001',
            promotionName: 'Free Bread with Purchase',
            timestamp: '2024-01-26T14:20:00Z', 
            status: 'completed' 
        }
    ];
    
    // Mock Business Data with Promotions
    const businessData = {
        businessPromotions: [
            {
                id: 'PROMO-001',
                storeId: 'store-001',
                storeName: 'Aladdin Bakery',
                title: 'Free Bread with Purchase',
                description: 'Get free pita bread with any purchase over $10',
                pointsRequired: 50,
                isActive: true,
                startDate: '2024-01-01',
                endDate: '2024-02-28',
                usageLimit: 100,
                usedCount: 25,
                promotionType: 'discount'
            },
            {
                id: 'PROMO-002',
                storeId: 'store-002',
                storeName: 'Damascus Restaurant',
                title: 'Lunch Special 20% Off',
                description: '20% off all lunch menu items from 11am-2pm',
                pointsRequired: 100,
                isActive: true,
                startDate: '2024-01-15',
                endDate: '2024-03-15',
                usageLimit: 200,
                usedCount: 45,
                promotionType: 'discount'
            },
            {
                id: 'PROMO-003',
                storeId: 'store-003',
                storeName: 'Beirut Market',
                title: 'Buy 1 Get 1 Free',
                description: 'Buy one package of Arabic sweets, get one free',
                pointsRequired: 75,
                isActive: true,
                startDate: '2024-01-20',
                endDate: '2024-02-20',
                usageLimit: 150,
                usedCount: 30,
                promotionType: 'free_item'
            },
            {
                id: 'PROMO-004',
                storeId: 'store-004',
                storeName: 'Cairo Coffee House',
                title: 'Free Coffee Upgrade',
                description: 'Free upgrade to large size coffee',
                pointsRequired: 25,
                isActive: true,
                startDate: '2024-01-10',
                endDate: '2024-04-10',
                usageLimit: 500,
                usedCount: 120,
                promotionType: 'upgrade'
            }
        ]
    };
    
    // Save to localStorage for persistence
    localStorage.setItem('ottawaUsers', JSON.stringify(users));
    localStorage.setItem('ottawaStores', JSON.stringify(stores));
    localStorage.setItem('ottawaRewards', JSON.stringify(rewards));
    localStorage.setItem('ottawaTransactions', JSON.stringify(transactions));
    localStorage.setItem('ottawaBusinessData', JSON.stringify(businessData));
    localStorage.setItem('ottawaInitialized', 'true');
}

// ==================== STORE PROMOTIONS FUNCTIONS ====================
function loadStorePromotions() {
    const businessData = JSON.parse(localStorage.getItem('ottawaBusinessData') || '{"businessPromotions": []}');
    
    // Get active promotions from all stores
    const activePromotions = businessData.businessPromotions.filter(p => 
        p.isActive && (!p.endDate || new Date(p.endDate) >= new Date())
    );
    
    promotions = activePromotions;
    
    // Display promotions in user app if on home section
    if (document.getElementById('promotionsContainer')) {
        displayPromotionsInUserApp(activePromotions);
    }
    
    // Display promotions in promotions section if active
    if (document.getElementById('promotionsSectionContainer')) {
        displayPromotionsInUserApp(activePromotions, 'promotionsSectionContainer');
    }
    
    return activePromotions;
}

function displayPromotionsInUserApp(promotions, containerId = 'promotionsContainer') {
    const promotionsContainer = document.getElementById(containerId);
    if (!promotionsContainer) return;
    
    promotionsContainer.innerHTML = '';
    
    if (promotions.length === 0) {
        promotionsContainer.innerHTML = `
            <div class="no-results">
                <i class="fas fa-percent"></i>
                <h3>No Current Promotions</h3>
                <p>Check back soon for store promotions!</p>
            </div>
        `;
        return;
    }
    
    promotions.forEach(promo => {
        const promoCard = document.createElement('div');
        promoCard.className = 'promotion-card';
        promoCard.innerHTML = `
            <div class="store-badge">${promo.storeName}</div>
            <h4>${promo.title}</h4>
            <p>${promo.description}</p>
            <div class="promotion-details">
                <div class="promotion-points">
                    <i class="fas fa-coins"></i> ${promo.pointsRequired} points
                </div>
                <div class="promotion-expiry">
                    <i class="far fa-calendar"></i> Expires: ${new Date(promo.endDate).toLocaleDateString()}
                </div>
                <div class="promotion-usage">
                    <i class="fas fa-users"></i> ${promo.usedCount || 0}/${promo.usageLimit || '∞'} used
                </div>
            </div>
            <button class="btn btn-small" onclick="redeemPromotion('${promo.id}')">
                Redeem Now
            </button>
        `;
        promotionsContainer.appendChild(promoCard);
    });
}

function redeemPromotion(promoId) {
    if (!currentUser) {
        showMessage('Please login first', 'error');
        return;
    }
    
    // Get promotion data
    const businessData = JSON.parse(localStorage.getItem('ottawaBusinessData') || '{"businessPromotions": []}');
    const promotion = businessData.businessPromotions.find(p => p.id === promoId);
    
    if (!promotion) {
        showMessage('Promotion not found', 'error');
        return;
    }
    
    // Check if promotion is active
    if (!promotion.isActive) {
        showMessage('This promotion is no longer active', 'error');
        return;
    }
    
    // Check expiration
    if (promotion.endDate && new Date(promotion.endDate) < new Date()) {
        showMessage('This promotion has expired', 'error');
        return;
    }
    
    // Check usage limit
    if (promotion.usageLimit && promotion.usedCount >= promotion.usageLimit) {
        showMessage('This promotion has reached its usage limit', 'error');
        return;
    }
    
    // Check user points
    if (currentUser.points < promotion.pointsRequired) {
        showMessage(`You need ${promotion.pointsRequired} points to redeem this promotion`, 'error');
        return;
    }
    
    // Confirm redemption
    if (!confirm(`Redeem "${promotion.title}" for ${promotion.pointsRequired} points?`)) {
        return;
    }
    
    // Deduct points
    const oldPoints = currentUser.points;
    currentUser.points -= promotion.pointsRequired;
    currentUser.totalPromotionsRedeemed = (currentUser.totalPromotionsRedeemed || 0) + 1;
    
    // Update promotion usage
    promotion.usedCount = (promotion.usedCount || 0) + 1;
    
    // Create transaction record
    const transaction = {
        id: 'PROMO-' + Date.now(),
        userId: currentUser.id,
        storeId: promotion.storeId,
        storeName: promotion.storeName,
        promotionId: promotion.id,
        promotionName: promotion.title,
        points: -promotion.pointsRequired, // Negative for redemption
        type: 'promotion_redeemed',
        timestamp: new Date().toISOString(),
        status: 'completed'
    };
    
    // Save transaction
    const transactions = JSON.parse(localStorage.getItem('ottawaTransactions') || '[]');
    transactions.push(transaction);
    localStorage.setItem('ottawaTransactions', JSON.stringify(transactions));
    
    // Update promotion data
    localStorage.setItem('ottawaBusinessData', JSON.stringify(businessData));
    
    // Update user data
    const users = JSON.parse(localStorage.getItem('ottawaUsers') || '[]');
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
        users[userIndex].points = currentUser.points;
        users[userIndex].totalPromotionsRedeemed = currentUser.totalPromotionsRedeemed;
        localStorage.setItem('ottawaUsers', JSON.stringify(users));
    }
    
    // Save session
    saveSession();
    
    // Update UI
    updateUserUI();
    loadActivityList();
    
    // Show success message with promotion details
    const successMessage = `
        <div style="text-align: center;">
            <h4><i class="fas fa-check-circle" style="color: #2E8B57; margin-right: 10px;"></i>Promotion Redeemed!</h4>
            <p><strong>${promotion.title}</strong> from ${promotion.storeName}</p>
            <p>Promotion Code: <code style="background: #f0f0f0; padding: 2px 6px; border-radius: 3px;">${promotion.id}</code></p>
            <p>${promotion.pointsRequired} points deducted from your account.</p>
            <p><em>Show this screen to the store staff to claim your promotion.</em></p>
        </div>
    `;
    
    // Show modal with redemption details
    showRedemptionModal(successMessage);
    
    // Reload promotions
    loadStorePromotions();
    
    showMessage(`Promotion "${promotion.title}" redeemed successfully!`, 'success');
}

function showRedemptionModal(content) {
    // Create modal if it doesn't exist
    let modal = document.getElementById('redemptionModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'redemptionModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <div class="modal-body" id="redemptionModalContent"></div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="printRedemptionDetails()">
                        <i class="fas fa-print"></i> Print Details
                    </button>
                    <button class="btn btn-primary" onclick="closeRedemptionModal()">
                        OK
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Add close event
        modal.querySelector('.close-modal').addEventListener('click', closeRedemptionModal);
    }
    
    // Set content and show
    document.getElementById('redemptionModalContent').innerHTML = content;
    modal.style.display = 'block';
    modal.classList.add('active');
}

function closeRedemptionModal() {
    const modal = document.getElementById('redemptionModal');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('active');
    }
}

function printRedemptionDetails() {
    const content = document.getElementById('redemptionModalContent').innerHTML;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
            <head>
                <title>Promotion Redemption</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    h4 { color: #2E8B57; }
                    code { background: #f0f0f0; padding: 2px 6px; border-radius: 3px; }
                    .note { font-style: italic; color: #666; margin-top: 20px; }
                    @media print { button { display: none; } }
                </style>
            </head>
            <body>
                ${content}
                <div class="note">
                    Printed on ${new Date().toLocaleString()}
                </div>
                <button onclick="window.print()">Print</button>
                <button onclick="window.close()">Close</button>
            </body>
        </html>
    `);
    printWindow.document.close();
}

// ==================== SESSION MANAGEMENT ====================
function checkExistingSession() {
    const savedUser = localStorage.getItem('currentUser');
    
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        isAdmin = currentUser.isAdmin || false;
        showMainApp();
        showSection('home');
        updateUserUI();
    } else {
        showAuthOverlay();
    }
}

function saveSession() {
    if (currentUser) {
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }
}

function clearSession() {
    currentUser = null;
    isAdmin = false;
    localStorage.removeItem('currentUser');
}

// ==================== UI NAVIGATION ====================
function showAuthOverlay() {
    document.getElementById('authOverlay').classList.add('active');
    document.getElementById('mainApp').style.display = 'none';
    showLoginForm();
}

function showMainApp() {
    document.getElementById('authOverlay').classList.remove('active');
    document.getElementById('mainApp').style.display = 'block';
}

function showLoginForm() {
    document.getElementById('loginForm').classList.add('active');
    document.getElementById('registerForm').classList.remove('active');
}

function showRegisterForm() {
    document.getElementById('loginForm').classList.remove('active');
    document.getElementById('registerForm').classList.add('active');
}

function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active class from all nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Show selected section
    const section = document.getElementById(sectionId);
    if (section) {
        section.classList.add('active');
    }
    
    // Update nav link
    const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
    if (navLink) {
        navLink.classList.add('active');
    }
    
    // Load section data
    loadSectionData(sectionId);
}

function loadSectionData(sectionId) {
    switch(sectionId) {
        case 'home':
            loadHomeData();
            break;
        case 'stores':
            loadStoresData();
            break;
        case 'rewards':
            loadRewardsData();
            break;
        case 'promotions':
            loadPromotionsData();
            break;
        case 'profile':
            loadProfileData();
            break;
        case 'admin':
            if (currentUser && currentUser.isAdmin) {
                loadAdminData();
            } else {
                showSection('home');
                showMessage('Admin access required', 'error');
            }
            break;
    }
}

// ==================== EVENT LISTENERS SETUP ====================
function setupAllEventListeners() {
    // Auth Navigation
    const showRegisterBtn = document.getElementById('showRegister');
    const showLoginBtn = document.getElementById('showLogin');
    
    if (showRegisterBtn) {
        showRegisterBtn.addEventListener('click', showRegisterForm);
    }
    
    if (showLoginBtn) {
        showLoginBtn.addEventListener('click', showLoginForm);
    }
    
    // Login Form
    const loginForm = document.getElementById('loginFormElement');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('loginEmail')?.value;
            const password = document.getElementById('loginPassword')?.value;
            if (email && password) {
                loginUser(email, password);
            }
        });
    }
    
    // Register Form
    const registerForm = document.getElementById('registerFormElement');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const firstName = document.getElementById('registerFirstName')?.value;
            const lastName = document.getElementById('registerLastName')?.value;
            const email = document.getElementById('registerEmail')?.value;
            const phone = document.getElementById('registerPhone')?.value;
            const password = document.getElementById('registerPassword')?.value;
            const confirmPassword = document.getElementById('registerConfirmPassword')?.value;
            if (firstName && lastName && email && password) {
                registerUser(firstName, lastName, email, phone, password, confirmPassword);
            }
        });
    }
    
    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const href = this.getAttribute('href');
            if (href && href.startsWith('#')) {
                const sectionId = href.substring(1);
                showSection(sectionId);
            }
        });
    });
    
    // User Menu
    const userMenuBtn = document.getElementById('userMenuBtn');
    if (userMenuBtn) {
        userMenuBtn.addEventListener('click', toggleUserDropdown);
    }
    
    // Logout buttons
    const logoutBtns = document.querySelectorAll('#logoutBtn, #footerLogout');
    logoutBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            logoutUser();
        });
    });
    
    // Scan Button
    const scanBtn = document.getElementById('scanBtn');
    if (scanBtn) {
        scanBtn.addEventListener('click', openQRScanner);
    }
    
    // Redeem Button
    const redeemBtn = document.getElementById('redeemBtn');
    if (redeemBtn) {
        redeemBtn.addEventListener('click', openRedeemModal);
    }
    
    // Edit Profile Button
    const editProfileBtn = document.getElementById('editProfileBtn');
    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', openEditProfileModal);
    }
    
    // Modal Close Buttons
    document.querySelectorAll('.close-modal').forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
                modal.classList.remove('active');
            }
        });
    });
    
    // Password visibility toggles
    document.querySelectorAll('.show-password').forEach(button => {
        button.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const input = document.getElementById(targetId);
            const icon = this.querySelector('i');
            
            if (input && icon) {
                if (input.type === 'password') {
                    input.type = 'text';
                    icon.className = 'fas fa-eye-slash';
                } else {
                    input.type = 'password';
                    icon.className = 'fas fa-eye';
                }
            }
        });
    });
    
    // Store Filters
    const storeCategoryFilter = document.getElementById('storeCategoryFilter');
    const storeLocationFilter = document.getElementById('storeLocationFilter');
    const storeSort = document.getElementById('storeSort');
    const clearStoreFilters = document.getElementById('clearStoreFilters');
    
    if (storeCategoryFilter) {
        storeCategoryFilter.addEventListener('change', filterStores);
    }
    
    if (storeLocationFilter) {
        storeLocationFilter.addEventListener('change', filterStores);
    }
    
    if (storeSort) {
        storeSort.addEventListener('change', filterStores);
    }
    
    if (clearStoreFilters) {
        clearStoreFilters.addEventListener('click', function() {
            if (storeCategoryFilter) storeCategoryFilter.value = 'all';
            if (storeLocationFilter) storeLocationFilter.value = 'all';
            if (storeSort) storeSort.value = 'name-asc';
            filterStores();
        });
    }
    
    // Reward Filters
    const rewardPointFilter = document.getElementById('rewardPointFilter');
    const rewardTypeFilter = document.getElementById('rewardTypeFilter');
    const rewardSort = document.getElementById('rewardSort');
    const clearRewardFilters = document.getElementById('clearRewardFilters');
    
    if (rewardPointFilter) {
        rewardPointFilter.addEventListener('change', filterRewards);
    }
    
    if (rewardTypeFilter) {
        rewardTypeFilter.addEventListener('change', filterRewards);
    }
    
    if (rewardSort) {
        rewardSort.addEventListener('change', filterRewards);
    }
    
    if (clearRewardFilters) {
        clearRewardFilters.addEventListener('click', function() {
            if (rewardPointFilter) rewardPointFilter.value = 'all';
            if (rewardTypeFilter) rewardTypeFilter.value = 'all';
            if (rewardSort) rewardSort.value = 'points-low';
            filterRewards();
        });
    }
    
    // Menu Toggle for Mobile
    const menuToggle = document.querySelector('.menu-toggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            const navLinks = document.querySelector('.nav-links');
            if (navLinks) {
                navLinks.classList.toggle('active');
            }
        });
    }
    
    // Close dropdowns when clicking outside
    window.addEventListener('click', function(e) {
        // Close user dropdown
        const userDropdown = document.getElementById('userDropdown');
        if (userDropdown && userDropdown.classList.contains('active') && 
            !e.target.closest('.user-menu')) {
            userDropdown.classList.remove('active');
        }
        
        // Close mobile menu
        const navLinks = document.querySelector('.nav-links');
        const menuToggle = document.querySelector('.menu-toggle');
        if (navLinks && navLinks.classList.contains('active') && 
            !e.target.closest('.nav-links') && 
            !e.target.closest('.menu-toggle')) {
            navLinks.classList.remove('active');
        }
    });
    
    // QR Scanner buttons (set up after DOM loads)
    setTimeout(() => {
        // Manual confirm button for QR scanner
        const manualConfirmBtn = document.getElementById('manualConfirm');
        if (manualConfirmBtn) {
            manualConfirmBtn.addEventListener('click', function() {
                const storeSelect = document.getElementById('storeSelect');
                const storeId = storeSelect ? storeSelect.value : null;
                
                if (!storeId) {
                    showMessage('Please select a store', 'error');
                    return;
                }
                
                processStoreScan(storeId);
            });
        }
        
        // Start scanner button
        const startScannerBtn = document.getElementById('startScanner');
        if (startScannerBtn) {
            startScannerBtn.addEventListener('click', startQRScanner);
        }
        
        // Stop scanner button
        const stopScannerBtn = document.getElementById('stopScanner');
        if (stopScannerBtn) {
            stopScannerBtn.addEventListener('click', stopQRScanner);
        }
        
        // Switch camera button
        const switchCameraBtn = document.getElementById('switchCamera');
        if (switchCameraBtn) {
            switchCameraBtn.addEventListener('click', initializeCameraSelection);
        }
    }, 100);
    
    // Edit profile form
    const editProfileForm = document.getElementById('editProfileForm');
    if (editProfileForm) {
        editProfileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveProfileChanges();
        });
    }
    
    // Cancel edit profile
    const cancelEditBtn = document.getElementById('cancelEditProfile');
    if (cancelEditBtn) {
        cancelEditBtn.addEventListener('click', function() {
            const modal = document.getElementById('editProfileModal');
            if (modal) {
                modal.style.display = 'none';
                modal.classList.remove('active');
            }
        });
    }
}

// ==================== AUTHENTICATION ====================
function loginUser(email, password) {
    // Get users from localStorage
    const storedUsers = JSON.parse(localStorage.getItem('ottawaUsers') || '[]');
    const user = storedUsers.find(u => u.email === email && u.password === password);
    
    if (user) {
        currentUser = { ...user };
        delete currentUser.password; // Don't store password in session
        
        isAdmin = user.isAdmin || false;
        
        saveSession();
        showMainApp();
        showSection('home');
        updateUserUI();
        showMessage('Login successful!', 'success');
        
        return true;
    } else {
        showMessage('Invalid email or password', 'error');
        return false;
    }
}

function registerUser(firstName, lastName, email, phone, password, confirmPassword) {
    // Validation
    if (!firstName || !lastName || !email || !password) {
        showMessage('Please fill in all required fields', 'error');
        return false;
    }
    
    if (password !== confirmPassword) {
        showMessage('Passwords do not match', 'error');
        return false;
    }
    
    if (password.length < 6) {
        showMessage('Password must be at least 6 characters', 'error');
        return false;
    }
    
    // Check if user already exists
    const storedUsers = JSON.parse(localStorage.getItem('ottawaUsers') || '[]');
    if (storedUsers.some(u => u.email === email)) {
        showMessage('User with this email already exists', 'error');
        return false;
    }
    
    // Create new user
    const newUser = {
        id: Date.now(), // Simple ID generation
        email: email,
        password: password,
        firstName: firstName,
        lastName: lastName,
        name: `${firstName} ${lastName}`,
        phone: phone || '',
        points: 100, // Welcome bonus
        joinDate: new Date().toISOString().split('T')[0],
        totalStoresVisited: 0,
        totalRewardsEarned: 0,
        totalPromotionsRedeemed: 0,
        memberSince: new Date().getFullYear().toString(),
        userLevel: 'Bronze',
        isAdmin: false
    };
    
    // Add to users array
    storedUsers.push(newUser);
    localStorage.setItem('ottawaUsers', JSON.stringify(storedUsers));
    
    // Auto login
    currentUser = { ...newUser };
    delete currentUser.password;
    saveSession();
    showMainApp();
    showSection('home');
    updateUserUI();
    showMessage('Account created successfully! Welcome bonus: 100 points', 'success');
    
    return true;
}

function logoutUser() {
    clearSession();
    showAuthOverlay();
    showMessage('Logged out successfully', 'info');
}

// ==================== USER INTERFACE UPDATES ====================
function updateUserUI() {
    if (!currentUser) return;
    
    // Update user name in navbar
    const userNameElement = document.getElementById('userName');
    const dropdownUserName = document.getElementById('dropdownUserName');
    const dropdownUserEmail = document.getElementById('dropdownUserEmail');
    
    if (userNameElement) userNameElement.textContent = currentUser.firstName || 'User';
    if (dropdownUserName) dropdownUserName.textContent = currentUser.name;
    if (dropdownUserEmail) dropdownUserEmail.textContent = currentUser.email;
    
    // Update profile page
    const profileUserName = document.getElementById('profileUserName');
    const profileUserEmail = document.getElementById('profileUserEmail');
    const profileUserPhone = document.getElementById('profileUserPhone');
    const userPoints = document.getElementById('userPoints');
    const currentUserPoints = document.getElementById('currentUserPoints');
    const totalStoresVisited = document.getElementById('totalStoresVisited');
    const totalRewardsEarned = document.getElementById('totalRewardsEarned');
    const totalPromotionsRedeemed = document.getElementById('totalPromotionsRedeemed');
    const memberSince = document.getElementById('memberSince');
    const userLevel = document.getElementById('userLevel');
    
    if (profileUserName) profileUserName.textContent = `Welcome, ${currentUser.firstName || 'User'}!`;
    if (profileUserEmail) profileUserEmail.textContent = currentUser.email;
    if (profileUserPhone) profileUserPhone.textContent = currentUser.phone || 'Not provided';
    if (userPoints) userPoints.textContent = currentUser.points;
    if (currentUserPoints) currentUserPoints.textContent = currentUser.points;
    if (totalStoresVisited) totalStoresVisited.textContent = currentUser.totalStoresVisited || 0;
    if (totalRewardsEarned) totalRewardsEarned.textContent = currentUser.totalRewardsEarned || 0;
    if (totalPromotionsRedeemed) totalPromotionsRedeemed.textContent = currentUser.totalPromotionsRedeemed || 0;
    if (memberSince) memberSince.textContent = currentUser.memberSince || '2024';
    if (userLevel) userLevel.textContent = currentUser.userLevel || 'Bronze';
    
    // Update edit form placeholders
    const editFirstName = document.getElementById('editFirstName');
    const editLastName = document.getElementById('editLastName');
    const editEmail = document.getElementById('editEmail');
    const editPhone = document.getElementById('editPhone');
    
    if (editFirstName) editFirstName.value = currentUser.firstName || '';
    if (editLastName) editLastName.value = currentUser.lastName || '';
    if (editEmail) editEmail.value = currentUser.email || '';
    if (editPhone) editPhone.value = currentUser.phone || '';
}

function toggleUserDropdown() {
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) {
        dropdown.classList.toggle('active');
    }
}

// ==================== SECTION DATA LOADING ====================
function loadHomeData() {
    // Update home stats
    const heroStats = document.querySelector('.hero-stats');
    if (heroStats) {
        const stores = JSON.parse(localStorage.getItem('ottawaStores') || '[]');
        const users = JSON.parse(localStorage.getItem('ottawaUsers') || '[]');
        const transactions = JSON.parse(localStorage.getItem('ottawaTransactions') || '[]');
        
        const stats = heroStats.querySelectorAll('.stat-number');
        if (stats.length >= 4) {
            stats[0].textContent = stores.length + '+';
            stats[1].textContent = users.length + '+';
            stats[2].textContent = transactions.reduce((sum, t) => sum + Math.abs(t.points), 0) + '+';
            
            // Count active promotions
            const businessData = JSON.parse(localStorage.getItem('ottawaBusinessData') || '{"businessPromotions": []}');
            const activePromotions = businessData.businessPromotions.filter(p => 
                p.isActive && (!p.endDate || new Date(p.endDate) >= new Date())
            );
            stats[3].textContent = activePromotions.length + '+';
        }
    }
    
    // Load promotions for home page
    loadStorePromotions();
}

function loadStoresData() {
    const storesContainer = document.getElementById('storesContainer');
    const storedStores = JSON.parse(localStorage.getItem('ottawaStores') || '[]');
    
    if (!storesContainer) return;
    
    // Update counters
    const storeCount = document.getElementById('storeCount');
    const storeTotal = document.getElementById('storeTotal');
    if (storeCount) storeCount.textContent = storedStores.length;
    if (storeTotal) storeTotal.textContent = storedStores.length;
    
    // Clear container
    storesContainer.innerHTML = '';
    
    if (storedStores.length === 0) {
        storesContainer.innerHTML = `
            <div class="no-results">
                <i class="fas fa-store-slash"></i>
                <h3>No Stores Available</h3>
                <p>Check back soon for participating stores!</p>
            </div>
        `;
        return;
    }
    
    // Display stores
    storedStores.forEach(store => {
        const storeCard = document.createElement('div');
        storeCard.className = 'store-card';
        storeCard.innerHTML = `
            <div class="store-image">
                <i class="fas fa-store"></i>
                <span class="store-category-badge ${store.category.toLowerCase()}">${store.category}</span>
            </div>
            <div class="store-info">
                <h3 class="store-name">${store.name}</h3>
                <p class="store-category">
                    <i class="fas fa-tag"></i> ${store.category}
                </p>
                <p class="store-location">
                    <i class="fas fa-map-marker-alt"></i> ${store.location}
                </p>
                <p class="store-description">${store.description}</p>
                <div class="store-points">
                    <i class="fas fa-coins"></i> ${store.points} points per scan
                </div>
                <button class="btn btn-small" onclick="openQRScannerForStore('${store.id}')">
                    <i class="fas fa-qrcode"></i> Scan QR Code
                </button>
                <button class="btn btn-small btn-secondary" onclick="viewStorePromotions('${store.id}')" style="margin-top: 5px;">
                    <i class="fas fa-percent"></i> View Promotions
                </button>
            </div>
        `;
        storesContainer.appendChild(storeCard);
    });
    
    // Apply any active filters
    filterStores();
}

function viewStorePromotions(storeId) {
    const businessData = JSON.parse(localStorage.getItem('ottawaBusinessData') || '{"businessPromotions": []}');
    const store = JSON.parse(localStorage.getItem('ottawaStores') || '[]').find(s => s.id === storeId);
    
    if (!store) {
        showMessage('Store not found', 'error');
        return;
    }
    
    const storePromotions = businessData.businessPromotions.filter(p => 
        p.storeId === storeId && p.isActive && (!p.endDate || new Date(p.endDate) >= new Date())
    );
    
    if (storePromotions.length === 0) {
        showMessage(`${store.name} has no active promotions at the moment.`, 'info');
        return;
    }
    
    // Show promotions in a modal
    let modal = document.getElementById('storePromotionsModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'storePromotionsModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <h3><i class="fas fa-percent"></i> Promotions at ${store.name}</h3>
                <div id="storePromotionsList" style="margin: 20px 0;"></div>
            </div>
        `;
        document.body.appendChild(modal);
        
        modal.querySelector('.close-modal').addEventListener('click', function() {
            modal.style.display = 'none';
            modal.classList.remove('active');
        });
    }
    
    const promotionsList = document.getElementById('storePromotionsList');
    promotionsList.innerHTML = '';
    
    storePromotions.forEach(promo => {
        const promoItem = document.createElement('div');
        promoItem.className = 'promotion-item';
        promoItem.style.cssText = `
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 10px;
            background: #f9f9f9;
        `;
        promoItem.innerHTML = `
            <h4 style="margin-top: 0; color: #2E8B57;">${promo.title}</h4>
            <p>${promo.description}</p>
            <div style="display: flex; justify-content: space-between; margin-top: 10px;">
                <div style="color: #666;">
                    <i class="fas fa-coins"></i> ${promo.pointsRequired} points
                </div>
                <div style="color: #666;">
                    <i class="far fa-calendar"></i> Expires: ${new Date(promo.endDate).toLocaleDateString()}
                </div>
            </div>
            <button class="btn btn-small" onclick="redeemPromotion('${promo.id}')" style="margin-top: 10px;">
                Redeem Promotion
            </button>
        `;
        promotionsList.appendChild(promoItem);
    });
    
    modal.style.display = 'block';
    modal.classList.add('active');
}

function filterStores() {
    const storesContainer = document.getElementById('storesContainer');
    if (!storesContainer) return;
    
    const storeCards = storesContainer.querySelectorAll('.store-card');
    const categoryFilter = document.getElementById('storeCategoryFilter')?.value || 'all';
    const locationFilter = document.getElementById('storeLocationFilter')?.value || 'all';
    const sortValue = document.getElementById('storeSort')?.value || 'name-asc';
    
    let visibleCount = 0;
    
    storeCards.forEach(card => {
        const category = card.querySelector('.store-category')?.textContent?.toLowerCase() || '';
        const location = card.querySelector('.store-location')?.textContent || '';
        const name = card.querySelector('.store-name')?.textContent || '';
        const pointsText = card.querySelector('.store-points')?.textContent || '0';
        const points = parseInt(pointsText) || 0;
        
        let show = true;
        
        // Apply category filter
        if (categoryFilter !== 'all' && !category.includes(categoryFilter.toLowerCase())) {
            show = false;
        }
        
        // Apply location filter
        if (locationFilter !== 'all' && !location.includes(locationFilter)) {
            show = false;
        }
        
        card.style.display = show ? 'block' : 'none';
        if (show) visibleCount++;
    });
    
    // Update counter
    const storeCount = document.getElementById('storeCount');
    if (storeCount) storeCount.textContent = visibleCount;
    
    // Sort stores
    const container = storesContainer;
    const cards = Array.from(container.querySelectorAll('.store-card'));
    
    cards.sort((a, b) => {
        const aName = a.querySelector('.store-name')?.textContent || '';
        const bName = b.querySelector('.store-name')?.textContent || '';
        const aPoints = parseInt(a.querySelector('.store-points')?.textContent || '0');
        const bPoints = parseInt(b.querySelector('.store-points')?.textContent || '0');
        
        switch(sortValue) {
            case 'name-asc':
                return aName.localeCompare(bName);
            case 'name-desc':
                return bName.localeCompare(aName);
            case 'points-high':
                return bPoints - aPoints;
            case 'points-low':
                return aPoints - bPoints;
            default:
                return 0;
        }
    });
    
    // Re-append sorted cards
    cards.forEach(card => container.appendChild(card));
}

function loadRewardsData() {
    const rewardsContainer = document.getElementById('rewardsContainer');
    const storedRewards = JSON.parse(localStorage.getItem('ottawaRewards') || '[]');
    
    if (!rewardsContainer) return;
    
    // Update counters
    const rewardCount = document.getElementById('rewardCount');
    const rewardTotal = document.getElementById('rewardTotal');
    if (rewardCount) rewardCount.textContent = storedRewards.length;
    if (rewardTotal) rewardTotal.textContent = storedRewards.length;
    
    // Clear container
    rewardsContainer.innerHTML = '';
    
    if (storedRewards.length === 0) {
        rewardsContainer.innerHTML = `
            <div class="no-results">
                <i class="fas fa-gift"></i>
                <h3>No Rewards Available</h3>
                <p>Check back soon for new rewards!</p>
            </div>
        `;
        return;
    }
    
    // Display rewards
    storedRewards.forEach(reward => {
        const canRedeem = currentUser && currentUser.points >= reward.points;
        const rewardCard = document.createElement('div');
        rewardCard.className = `reward-card ${canRedeem ? '' : 'disabled'}`;
        rewardCard.innerHTML = `
            <div class="reward-image">
                <i class="fas fa-gift"></i>
                <span class="reward-type-badge ${reward.type}">${reward.type}</span>
            </div>
            <div class="reward-info">
                <h3 class="reward-name">${reward.name}</h3>
                <p class="reward-description">${reward.description}</p>
                <div class="reward-points">
                    <i class="fas fa-coins"></i> ${reward.points} points
                </div>
                <button class="btn btn-small ${canRedeem ? 'btn-primary' : 'btn-disabled'}" 
                        onclick="redeemReward(${reward.id}, ${reward.points}, '${reward.name.replace(/'/g, "\\'")}')"
                        ${!canRedeem ? 'disabled' : ''}>
                    ${canRedeem ? 'Redeem Now' : 'Need More Points'}
                </button>
            </div>
        `;
        rewardsContainer.appendChild(rewardCard);
    });
    
    // Apply any active filters
    filterRewards();
}

function loadPromotionsData() {
    // Load and display promotions in promotions section
    const activePromotions = loadStorePromotions();
    const promotionsContainer = document.getElementById('promotionsSectionContainer');
    
    if (!promotionsContainer) return;
    
    // Update counter
    const promotionCount = document.getElementById('promotionCount');
    const promotionTotal = document.getElementById('promotionTotal');
    if (promotionCount) promotionCount.textContent = activePromotions.length;
    if (promotionTotal) promotionTotal.textContent = activePromotions.length;
    
    // Display promotions
    displayPromotionsInUserApp(activePromotions, 'promotionsSectionContainer');
}

function filterRewards() {
    const rewardsContainer = document.getElementById('rewardsContainer');
    if (!rewardsContainer) return;
    
    const rewardCards = rewardsContainer.querySelectorAll('.reward-card');
    const pointFilter = document.getElementById('rewardPointFilter')?.value || 'all';
    const typeFilter = document.getElementById('rewardTypeFilter')?.value || 'all';
    const sortValue = document.getElementById('rewardSort')?.value || 'points-low';
    
    let visibleCount = 0;
    
    rewardCards.forEach(card => {
        const pointsText = card.querySelector('.reward-points')?.textContent || '0';
        const points = parseInt(pointsText) || 0;
        const typeElement = card.querySelector('.reward-type-badge');
        const type = typeElement ? typeElement.textContent.toLowerCase() : '';
        const name = card.querySelector('.reward-name')?.textContent || '';
        
        let show = true;
        
        // Apply points filter
        if (pointFilter !== 'all') {
            const [min, max] = pointFilter === '1801+' ? [1801, Infinity] : pointFilter.split('-').map(Number);
            if (points < min || points > max) {
                show = false;
            }
        }
        
        // Apply type filter
        if (typeFilter !== 'all' && type !== typeFilter.toLowerCase()) {
            show = false;
        }
        
        card.style.display = show ? 'block' : 'none';
        if (show) visibleCount++;
    });
    
    // Update counter
    const rewardCount = document.getElementById('rewardCount');
    if (rewardCount) rewardCount.textContent = visibleCount;
    
    // Sort rewards
    const container = rewardsContainer;
    const cards = Array.from(container.querySelectorAll('.reward-card'));
    
    cards.sort((a, b) => {
        const aName = a.querySelector('.reward-name')?.textContent || '';
        const bName = b.querySelector('.reward-name')?.textContent || '';
        const aPoints = parseInt(a.querySelector('.reward-points')?.textContent || '0');
        const bPoints = parseInt(b.querySelector('.reward-points')?.textContent || '0');
        
        switch(sortValue) {
            case 'points-low':
                return aPoints - bPoints;
            case 'points-high':
                return bPoints - aPoints;
            case 'name-asc':
                return aName.localeCompare(bName);
            case 'name-desc':
                return bName.localeCompare(aName);
            default:
                return 0;
        }
    });
    
    // Re-append sorted cards
    cards.forEach(card => container.appendChild(card));
}

function loadProfileData() {
    if (!currentUser) return;
    
    updateUserUI();
    loadActivityList();
}

function loadActivityList() {
    const activityList = document.getElementById('activityList');
    if (!activityList || !currentUser) return;
    
    const transactions = JSON.parse(localStorage.getItem('ottawaTransactions') || '[]');
    const userTransactions = transactions
        .filter(t => t.userId === currentUser.id)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 10); // Last 10 transactions
    
    activityList.innerHTML = '';
    
    if (userTransactions.length === 0) {
        activityList.innerHTML = '<p class="no-activity">No recent activity</p>';
        return;
    }
    
    userTransactions.forEach(transaction => {
        const date = new Date(transaction.timestamp);
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        
        let activityTypeIcon = 'fas fa-qrcode';
        let activityTypeText = 'Store Scan';
        
        if (transaction.type === 'promotion_redeemed') {
            activityTypeIcon = 'fas fa-percent';
            activityTypeText = 'Promotion Redeemed';
        } else if (transaction.type === 'redeemed') {
            activityTypeIcon = 'fas fa-gift';
            activityTypeText = 'Reward Redeemed';
        }
        
        activityItem.innerHTML = `
            <div class="activity-icon">
                <i class="${activityTypeIcon}"></i>
            </div>
            <div class="activity-content">
                <div class="activity-store">${transaction.storeName || transaction.promotionName || activityTypeText}</div>
                ${transaction.promotionName ? `<div class="activity-reward">${transaction.promotionName}</div>` : ''}
                ${transaction.rewardName ? `<div class="activity-reward">${transaction.rewardName}</div>` : ''}
                <div class="activity-date">${date.toLocaleDateString()} • ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
            </div>
            <div class="activity-points ${transaction.type}">
                ${transaction.points > 0 ? '+' : ''}${transaction.points} pts
            </div>
        `;
        activityList.appendChild(activityItem);
    });
}

function loadAdminData() {
    if (!currentUser || !currentUser.isAdmin) {
        showSection('home');
        showMessage('Admin access required', 'error');
        return;
    }
    
    // Update admin greeting
    const adminGreeting = document.querySelector('.admin-header h3');
    if (adminGreeting && currentUser.name) {
        adminGreeting.textContent = `Welcome, ${currentUser.name}`;
    }
    
    // Load stores for QR generation dropdown
    const adminStoreSelect = document.getElementById('adminStoreSelect');
    const storeSelect = document.getElementById('storeSelect');
    const storedStores = JSON.parse(localStorage.getItem('ottawaStores') || '[]');
    
    [adminStoreSelect, storeSelect].forEach(select => {
        if (select) {
            select.innerHTML = '<option value="">Select a store</option>';
            storedStores.forEach(store => {
                const option = document.createElement('option');
                option.value = store.id;
                option.textContent = store.name;
                select.appendChild(option);
            });
        }
    });
    
    // Load admin stats
    updateAdminStats();
    
    // Load scan analytics
    loadScanAnalytics();
    
    // Setup admin event listeners
    setupAdminEventListeners();
    
    // Load promotions for admin management
    loadAdminPromotions();
}

function loadAdminPromotions() {
    const businessData = JSON.parse(localStorage.getItem('ottawaBusinessData') || '{"businessPromotions": []}');
    const promotionsTable = document.getElementById('adminPromotionsTable');
    
    if (!promotionsTable) return;
    
    const tbody = promotionsTable.querySelector('tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (businessData.businessPromotions.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 20px;">
                    <i class="fas fa-percent"></i> No promotions created yet
                </td>
            </tr>
        `;
        return;
    }
    
    businessData.businessPromotions.forEach(promo => {
        const row = document.createElement('tr');
        const isActive = promo.isActive && (!promo.endDate || new Date(promo.endDate) >= new Date());
        
        row.innerHTML = `
            <td>${promo.storeName}</td>
            <td>${promo.title}</td>
            <td>${promo.pointsRequired}</td>
            <td>
                <span class="status-badge ${isActive ? 'active' : 'inactive'}">
                    ${isActive ? 'Active' : 'Inactive'}
                </span>
            </td>
            <td>${new Date(promo.startDate).toLocaleDateString()}</td>
            <td>${new Date(promo.endDate).toLocaleDateString()}</td>
            <td>${promo.usedCount || 0}/${promo.usageLimit || '∞'}</td>
            <td>
                <button class="btn btn-small" onclick="editPromotion('${promo.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-small btn-danger" onclick="deletePromotion('${promo.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function updateAdminStats() {
    const transactions = JSON.parse(localStorage.getItem('ottawaTransactions') || '[]');
    const users = JSON.parse(localStorage.getItem('ottawaUsers') || '[]');
    const businessData = JSON.parse(localStorage.getItem('ottawaBusinessData') || '{"businessPromotions": []}');
    
    // Calculate stats
    const totalScans = transactions.length;
    const uniqueUsers = [...new Set(transactions.map(t => t.userId))].length;
    const totalPointsGiven = transactions.reduce((sum, t) => sum + (t.points > 0 ? t.points : 0), 0);
    
    // Today's scans
    const today = new Date().toISOString().split('T')[0];
    const todayScans = transactions.filter(t => t.timestamp.startsWith(today)).length;
    
    // Active promotions
    const activePromotions = businessData.businessPromotions.filter(p => 
        p.isActive && (!p.endDate || new Date(p.endDate) >= new Date())
    ).length;
    
    // Update UI
    const adminTotalScans = document.getElementById('adminTotalScans');
    const adminUniqueUsers = document.getElementById('adminUniqueUsers');
    const adminPointsGiven = document.getElementById('adminPointsGiven');
    const adminTodayScans = document.getElementById('adminTodayScans');
    const adminActivePromotions = document.getElementById('adminActivePromotions');
    
    if (adminTotalScans) adminTotalScans.textContent = totalScans;
    if (adminUniqueUsers) adminUniqueUsers.textContent = uniqueUsers;
    if (adminPointsGiven) adminPointsGiven.textContent = totalPointsGiven;
    if (adminTodayScans) adminTodayScans.textContent = todayScans;
    if (adminActivePromotions) adminActivePromotions.textContent = activePromotions;
}

function setupAdminEventListeners() {
    // QR Generation
    const generateQRBtn = document.getElementById('generateQRBtn');
    const adminStoreSelect = document.getElementById('adminStoreSelect');
    
    if (adminStoreSelect) {
        adminStoreSelect.addEventListener('change', function() {
            if (generateQRBtn) {
                generateQRBtn.disabled = !this.value;
            }
        });
    }
    
    if (generateQRBtn) {
        generateQRBtn.addEventListener('click', generateQRCode);
    }
    
    // QR Download
    const downloadQRBtn = document.getElementById('downloadQRBtn');
    if (downloadQRBtn) {
        downloadQRBtn.addEventListener('click', downloadQRCode);
    }
    
    // QR Print
    const printQRBtn = document.getElementById('printQRBtn');
    if (printQRBtn) {
        printQRBtn.addEventListener('click', printQRCode);
    }
    
    // Export Data
    const exportDataBtn = document.getElementById('exportDataBtn');
    if (exportDataBtn) {
        exportDataBtn.addEventListener('click', exportAdminData);
    }
    
    // Update Points
    const updatePointsBtn = document.getElementById('updatePointsBtn');
    if (updatePointsBtn) {
        updatePointsBtn.addEventListener('click', updatePointsPerScan);
    }
    
    // Analytics Period
    const analyticsPeriod = document.getElementById('analyticsPeriod');
    if (analyticsPeriod) {
        analyticsPeriod.addEventListener('change', loadScanAnalytics);
    }
    
    // Generate new QR button
    const generateNewQRBtn = document.getElementById('generateQR');
    if (generateNewQRBtn) {
        generateNewQRBtn.addEventListener('click', function() {
            const adminStoreSelect = document.getElementById('adminStoreSelect');
            if (adminStoreSelect) {
                adminStoreSelect.value = '';
                const generateQRBtn = document.getElementById('generateQRBtn');
                if (generateQRBtn) generateQRBtn.disabled = true;
                const qrContainer = document.getElementById('qrPreviewContainer');
                if (qrContainer) qrContainer.innerHTML = `
                    <div class="qr-placeholder">
                        <i class="fas fa-qrcode"></i>
                        <p>Select a store to generate QR code</p>
                    </div>
                `;
            }
        });
    }
    
    // Create promotion button
    const createPromotionBtn = document.getElementById('createPromotionBtn');
    if (createPromotionBtn) {
        createPromotionBtn.addEventListener('click', openCreatePromotionModal);
    }
}

function openCreatePromotionModal() {
    const modal = document.createElement('div');
    modal.id = 'createPromotionModal';
    modal.className = 'modal';
    
    // Load stores for dropdown
    const stores = JSON.parse(localStorage.getItem('ottawaStores') || '[]');
    const storeOptions = stores.map(store => 
        `<option value="${store.id}">${store.name}</option>`
    ).join('');
    
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-modal">&times;</span>
            <h3><i class="fas fa-plus-circle"></i> Create New Promotion</h3>
            <form id="createPromotionForm" style="margin-top: 20px;">
                <div class="form-group">
                    <label for="promotionStore">Store</label>
                    <select id="promotionStore" class="form-control" required>
                        <option value="">Select a store</option>
                        ${storeOptions}
                    </select>
                </div>
                <div class="form-group">
                    <label for="promotionTitle">Title</label>
                    <input type="text" id="promotionTitle" class="form-control" placeholder="e.g., Free Coffee Upgrade" required>
                </div>
                <div class="form-group">
                    <label for="promotionDescription">Description</label>
                    <textarea id="promotionDescription" class="form-control" rows="3" placeholder="Describe the promotion..." required></textarea>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="promotionPoints">Points Required</label>
                        <input type="number" id="promotionPoints" class="form-control" min="1" max="1000" value="50" required>
                    </div>
                    <div class="form-group">
                        <label for="promotionType">Promotion Type</label>
                        <select id="promotionType" class="form-control" required>
                            <option value="discount">Discount</option>
                            <option value="free_item">Free Item</option>
                            <option value="upgrade">Upgrade</option>
                            <option value="bogo">Buy One Get One</option>
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="promotionStartDate">Start Date</label>
                        <input type="date" id="promotionStartDate" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label for="promotionEndDate">End Date</label>
                        <input type="date" id="promotionEndDate" class="form-control" required>
                    </div>
                </div>
                <div class="form-group">
                    <label for="promotionUsageLimit">Usage Limit (optional)</label>
                    <input type="number" id="promotionUsageLimit" class="form-control" placeholder="Leave empty for unlimited">
                </div>
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="promotionActive" checked> Active
                    </label>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" onclick="closeCreatePromotionModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary">Create Promotion</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Set default dates
    const today = new Date().toISOString().split('T')[0];
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const nextMonthStr = nextMonth.toISOString().split('T')[0];
    
    document.getElementById('promotionStartDate').value = today;
    document.getElementById('promotionEndDate').value = nextMonthStr;
    
    // Add close event
    modal.querySelector('.close-modal').addEventListener('click', closeCreatePromotionModal);
    
    // Form submission
    document.getElementById('createPromotionForm').addEventListener('submit', function(e) {
        e.preventDefault();
        createPromotion();
    });
    
    modal.style.display = 'block';
    modal.classList.add('active');
}

function closeCreatePromotionModal() {
    const modal = document.getElementById('createPromotionModal');
    if (modal) {
        modal.remove();
    }
}

function createPromotion() {
    const storeId = document.getElementById('promotionStore').value;
    const store = JSON.parse(localStorage.getItem('ottawaStores') || '[]').find(s => s.id === storeId);
    
    if (!store) {
        showMessage('Please select a store', 'error');
        return;
    }
    
    const promotion = {
        id: 'PROMO-' + Date.now(),
        storeId: storeId,
        storeName: store.name,
        title: document.getElementById('promotionTitle').value,
        description: document.getElementById('promotionDescription').value,
        pointsRequired: parseInt(document.getElementById('promotionPoints').value),
        promotionType: document.getElementById('promotionType').value,
        isActive: document.getElementById('promotionActive').checked,
        startDate: document.getElementById('promotionStartDate').value,
        endDate: document.getElementById('promotionEndDate').value,
        usageLimit: document.getElementById('promotionUsageLimit').value || null,
        usedCount: 0
    };
    
    // Save to business data
    const businessData = JSON.parse(localStorage.getItem('ottawaBusinessData') || '{"businessPromotions": []}');
    businessData.businessPromotions.push(promotion);
    localStorage.setItem('ottawaBusinessData', JSON.stringify(businessData));
    
    closeCreatePromotionModal();
    loadAdminPromotions();
    showMessage('Promotion created successfully!', 'success');
}

function editPromotion(promoId) {
    const businessData = JSON.parse(localStorage.getItem('ottawaBusinessData') || '{"businessPromotions": []}');
    const promotion = businessData.businessPromotions.find(p => p.id === promoId);
    
    if (!promotion) {
        showMessage('Promotion not found', 'error');
        return;
    }
    
    // Open edit modal (similar to create modal)
    alert(`Edit promotion: ${promotion.title}\nThis would open an edit form in a full implementation.`);
    // For now, we'll just show a message
    showMessage('Edit functionality would be implemented here', 'info');
}

function deletePromotion(promoId) {
    if (!confirm('Are you sure you want to delete this promotion?')) {
        return;
    }
    
    const businessData = JSON.parse(localStorage.getItem('ottawaBusinessData') || '{"businessPromotions": []}');
    const index = businessData.businessPromotions.findIndex(p => p.id === promoId);
    
    if (index !== -1) {
        businessData.businessPromotions.splice(index, 1);
        localStorage.setItem('ottawaBusinessData', JSON.stringify(businessData));
        loadAdminPromotions();
        showMessage('Promotion deleted successfully', 'success');
    }
}

// ==================== QR SCANNER FUNCTIONS ====================
function openQRScanner() {
    const modal = document.getElementById('qrModal');
    if (modal) {
        modal.style.display = 'block';
        modal.classList.add('active');
        
        // Initialize camera selection
        initializeCameraSelection();
    }
}

function openQRScannerForStore(storeId) {
    const store = JSON.parse(localStorage.getItem('ottawaStores') || '[]')
        .find(s => s.id === storeId);
    
    if (!store) {
        showMessage('Store not found', 'error');
        return;
    }
    
    openQRScanner();
    
    // Pre-select the store in manual dropdown
    setTimeout(() => {
        const storeSelect = document.getElementById('storeSelect');
        if (storeSelect) {
            storeSelect.value = storeId;
        }
    }, 100);
}

async function initializeCameraSelection() {
    const cameraSelect = document.getElementById('cameraSelect');
    
    if (!cameraSelect) return;
    
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        
        cameraSelect.innerHTML = '<option value="">Select camera</option>';
        videoDevices.forEach(device => {
            const option = document.createElement('option');
            option.value = device.deviceId;
            option.textContent = device.label || `Camera ${cameraSelect.options.length}`;
            cameraSelect.appendChild(option);
        });
        
        if (videoDevices.length > 0) {
            cameraSelect.value = videoDevices[0].deviceId;
        }
    } catch (error) {
        console.error('Error accessing cameras:', error);
        showMessage('Could not access camera. Please check permissions.', 'error');
    }
}

function startQRScanner() {
    const startBtn = document.getElementById('startScanner');
    const stopBtn = document.getElementById('stopScanner');
    const cameraSelect = document.getElementById('cameraSelect');
    
    if (!cameraSelect || !cameraSelect.value) {
        showMessage('Please select a camera first', 'error');
        return;
    }
    
    if (qrScanner && qrScanner.isScanning) {
        showMessage('Scanner is already running', 'info');
        return;
    }
    
    try {
        // Initialize QR scanner
        qrScanner = new Html5Qrcode("qrReader");
        
        const config = {
            fps: 10,
            qrbox: { width: 250, height: 250 }
        };
        
        // Start scanning
        qrScanner.start(
            cameraSelect.value,
            config,
            handleQRScan,
            handleQRScanError
        ).then(() => {
            if (startBtn) startBtn.disabled = true;
            if (stopBtn) stopBtn.disabled = false;
            showMessage('Scanner started successfully', 'success');
        }).catch(error => {
            console.error('Scanner start error:', error);
            showMessage('Failed to start scanner: ' + error.message, 'error');
        });
        
    } catch (error) {
        console.error('QR Scanner error:', error);
        showMessage('QR Scanner initialization failed', 'error');
    }
}

function stopQRScanner() {
    if (qrScanner && qrScanner.isScanning) {
        qrScanner.stop().then(() => {
            const startBtn = document.getElementById('startScanner');
            const stopBtn = document.getElementById('stopScanner');
            if (startBtn) startBtn.disabled = false;
            if (stopBtn) stopBtn.disabled = true;
            showMessage('Scanner stopped', 'info');
        }).catch(error => {
            console.error('Scanner stop error:', error);
        });
    }
}

function handleQRScan(decodedText) {
    try {
        // Parse QR data (could be store ID or JSON)
        let storeId;
        try {
            const data = JSON.parse(decodedText);
            storeId = data.storeId;
        } catch {
            storeId = decodedText; // Assume it's just the store ID
        }
        
        // Process the scan
        processStoreScan(storeId);
        
        // Stop scanner after successful scan
        stopQRScanner();
        
    } catch (error) {
        console.error('Scan processing error:', error);
        showMessage('Error processing QR code', 'error');
    }
}

function handleQRScanError(error) {
    // Ignore normal scan errors
    if (!error.includes('NotFoundException')) {
        console.log('Scan error:', error);
    }
}

function processStoreScan(storeId) {
    // Get store data
    const stores = JSON.parse(localStorage.getItem('ottawaStores') || '[]');
    const store = stores.find(s => s.id === storeId);
    
    if (!store) {
        showMessage('Invalid QR code: Store not found', 'error');
        return;
    }
    
    if (!store.active) {
        showMessage('This store is currently inactive', 'error');
        return;
    }
    
    // Award points to user
    const oldPoints = currentUser.points;
    currentUser.points += store.points;
    currentUser.totalStoresVisited = (currentUser.totalStoresVisited || 0) + 1;
    
    // Create transaction record
    const transaction = {
        id: 'TXN-' + Date.now(),
        userId: currentUser.id,
        storeId: store.id,
        storeName: store.name,
        points: store.points,
        type: 'earned',
        timestamp: new Date().toISOString(),
        status: 'completed'
    };
    
    // Save transaction
    const transactions = JSON.parse(localStorage.getItem('ottawaTransactions') || '[]');
    transactions.push(transaction);
    localStorage.setItem('ottawaTransactions', JSON.stringify(transactions));
    
    // Update user data
    const users = JSON.parse(localStorage.getItem('ottawaUsers') || '[]');
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
        users[userIndex].points = currentUser.points;
        users[userIndex].totalStoresVisited = currentUser.totalStoresVisited;
        localStorage.setItem('ottawaUsers', JSON.stringify(users));
    }
    
    // Save current user session
    saveSession();
    
    // Update UI
    updateUserUI();
    loadActivityList();
    
    // Show success message
    const scanResult = document.getElementById('scanResult');
    if (scanResult) {
        scanResult.innerHTML = `
            <div class="scan-success">
                <i class="fas fa-check-circle"></i>
                <h4>Scan Successful!</h4>
                <p>You earned <strong>${store.points} points</strong> from ${store.name}</p>
                <p>New balance: <strong>${currentUser.points} points</strong></p>
                <p style="margin-top: 15px; font-size: 0.9em;">
                    <i class="fas fa-lightbulb"></i> 
                    <strong>Tip:</strong> Use your points to redeem promotions from this store!
                </p>
            </div>
        `;
        scanResult.className = 'scan-result success';
    }
    
    // Close modal after 3 seconds
    setTimeout(() => {
        const modal = document.getElementById('qrModal');
        if (modal) {
            modal.style.display = 'none';
            modal.classList.remove('active');
        }
        showMessage(`Earned ${store.points} points from ${store.name}!`, 'success');
    }, 3000);
}

// ==================== REWARDS SYSTEM ====================
function openRedeemModal() {
    const modal = document.getElementById('redeemModal');
    const redeemOptions = document.getElementById('redeemOptions');
    
    if (!currentUser) {
        showMessage('Please login first', 'error');
        return;
    }
    
    // Get rewards
    const rewards = JSON.parse(localStorage.getItem('ottawaRewards') || '[]');
    
    if (!redeemOptions) return;
    
    redeemOptions.innerHTML = '';
    
    if (rewards.length === 0) {
        redeemOptions.innerHTML = `
            <div class="no-rewards">
                <i class="fas fa-gift"></i>
                <h4>No Rewards Available</h4>
                <p>Check back soon for new rewards!</p>
            </div>
        `;
    } else {
        rewards.forEach(reward => {
            const canRedeem = currentUser.points >= reward.points;
            const option = document.createElement('div');
            option.className = 'redeem-option';
            option.innerHTML = `
                <h4>${reward.name}</h4>
                <p>${reward.description}</p>
                <div class="redeem-points">
                    <i class="fas fa-coins"></i> ${reward.points} points
                </div>
                <button class="btn ${canRedeem ? 'btn-primary' : 'btn-disabled'}" 
                        onclick="redeemReward(${reward.id}, ${reward.points}, '${reward.name.replace(/'/g, "\\'")}')"
                        ${!canRedeem ? 'disabled' : ''}>
                    ${canRedeem ? 'Redeem Now' : 'Need More Points'}
                </button>
            `;
            redeemOptions.appendChild(option);
        });
    }
    
    if (modal) {
        modal.style.display = 'block';
        modal.classList.add('active');
    }
}

function redeemReward(rewardId, points, rewardName) {
    if (!currentUser) {
        showMessage('Please login first', 'error');
        return;
    }
    
    if (currentUser.points < points) {
        showMessage('Not enough points to redeem this reward', 'error');
        return;
    }
    
    // Confirm redemption
    if (!confirm(`Redeem ${rewardName} for ${points} points?`)) {
        return;
    }
    
    // Deduct points
    const oldPoints = currentUser.points;
    currentUser.points -= points;
    currentUser.totalRewardsEarned = (currentUser.totalRewardsEarned || 0) + 1;
    
    // Create transaction record
    const transaction = {
        id: 'RED-' + Date.now(),
        userId: currentUser.id,
        rewardId: rewardId,
        rewardName: rewardName,
        points: -points, // Negative for redemption
        type: 'redeemed',
        timestamp: new Date().toISOString(),
        status: 'completed'
    };
    
    // Save transaction
    const transactions = JSON.parse(localStorage.getItem('ottawaTransactions') || '[]');
    transactions.push(transaction);
    localStorage.setItem('ottawaTransactions', JSON.stringify(transactions));
    
    // Update user data
    const users = JSON.parse(localStorage.getItem('ottawaUsers') || '[]');
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
        users[userIndex].points = currentUser.points;
        users[userIndex].totalRewardsEarned = currentUser.totalRewardsEarned;
        localStorage.setItem('ottawaUsers', JSON.stringify(users));
    }
    
    // Save session
    saveSession();
    
    // Update UI
    updateUserUI();
    loadActivityList();
    
    // Close modal and show success
    const modal = document.getElementById('redeemModal');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('active');
    }
    showMessage(`Successfully redeemed ${rewardName}! ${points} points deducted.`, 'success');
    
    // Update rewards section
    loadRewardsData();
}

// ==================== ADMIN FUNCTIONS ====================
function generateQRCode() {
    const storeSelect = document.getElementById('adminStoreSelect');
    const storeId = storeSelect ? storeSelect.value : null;
    
    if (!storeId) {
        showMessage('Please select a store first', 'error');
        return;
    }
    
    // Get store data
    const stores = JSON.parse(localStorage.getItem('ottawaStores') || '[]');
    const store = stores.find(s => s.id === storeId);
    
    if (!store) {
        showMessage('Store not found', 'error');
        return;
    }
    
    // Create QR code data
    const qrData = JSON.stringify({
        storeId: store.id,
        storeName: store.name,
        points: store.points,
        timestamp: new Date().toISOString()
    });
    
    // Generate QR code
    const qrContainer = document.getElementById('qrPreviewContainer');
    if (!qrContainer) return;
    
    qrContainer.innerHTML = '';
    
    QRCode.toCanvas(qrData, { width: 200, height: 200 }, function(error, canvas) {
        if (error) {
            console.error('QR Code generation error:', error);
            showMessage('Failed to generate QR code', 'error');
            return;
        }
        
        qrContainer.appendChild(canvas);
        
        // Update QR info
        const qrStoreId = document.getElementById('qrStoreId');
        const qrStoreName = document.getElementById('qrStoreName');
        const qrPoints = document.getElementById('qrPoints');
        const qrGenerated = document.getElementById('qrGenerated');
        
        if (qrStoreId) qrStoreId.textContent = store.id;
        if (qrStoreName) qrStoreName.textContent = store.name;
        if (qrPoints) qrPoints.textContent = store.points;
        if (qrGenerated) qrGenerated.textContent = new Date().toLocaleString();
        
        // Enable download and print buttons
        const downloadQRBtn = document.getElementById('downloadQRBtn');
        const printQRBtn = document.getElementById('printQRBtn');
        
        if (downloadQRBtn) downloadQRBtn.disabled = false;
        if (printQRBtn) printQRBtn.disabled = false;
        
        // Store canvas for download
        qrContainer.dataset.canvas = canvas.toDataURL('image/png');
    });
}

function downloadQRCode() {
    const qrContainer = document.getElementById('qrPreviewContainer');
    const canvasData = qrContainer ? qrContainer.dataset.canvas : null;
    
    if (!canvasData) {
        showMessage('No QR code generated yet', 'error');
        return;
    }
    
    const storeName = document.getElementById('qrStoreName')?.textContent || 'store';
    const link = document.createElement('a');
    link.download = `QR_${storeName.replace(/\s+/g, '_')}_${Date.now()}.png`;
    link.href = canvasData;
    link.click();
    
    showMessage('QR code downloaded successfully', 'success');
}

function printQRCode() {
    const qrContainer = document.getElementById('qrPreviewContainer');
    const canvas = qrContainer ? qrContainer.querySelector('canvas') : null;
    
    if (!canvas) {
        showMessage('No QR code to print', 'error');
        return;
    }
    
    const win = window.open('');
    win.document.write('<img src="' + canvas.toDataURL('image/png') + '"/>');
    win.print();
    win.close();
}

function exportAdminData() {
    const transactions = JSON.parse(localStorage.getItem('ottawaTransactions') || '[]');
    
    if (transactions.length === 0) {
        showMessage('No data to export', 'info');
        return;
    }
    
    // Convert to CSV
    const headers = ['ID', 'User ID', 'Store Name', 'Promotion/Reward', 'Points', 'Type', 'Date'];
    const rows = transactions.map(t => [
        t.id,
        t.userId,
        t.storeName || t.storeId,
        t.promotionName || t.rewardName || '',
        t.points,
        t.type,
        new Date(t.timestamp).toLocaleString()
    ]);
    
    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ottawa_scan_data_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    showMessage('Data exported successfully', 'success');
}

function updatePointsPerScan() {
    const pointsInput = document.getElementById('pointsPerScan');
    if (!pointsInput) return;
    
    const points = parseInt(pointsInput.value);
    if (isNaN(points) || points < 1 || points > 1000) {
        showMessage('Please enter a valid number between 1 and 1000', 'error');
        return;
    }
    
    showMessage(`Points per scan updated to ${points}`, 'success');
    // Note: In a real app, this would update the store's points configuration
}

function loadScanAnalytics() {
    const transactions = JSON.parse(localStorage.getItem('ottawaTransactions') || '[]');
    
    // Update recent scans table
    const tableBody = document.getElementById('scansTableBody');
    if (tableBody) {
        let html = '';
        const recentScans = transactions.slice(-10).reverse(); // Last 10 scans, newest first
        
        if (recentScans.length === 0) {
            html = '<tr><td colspan="4">No scans yet</td></tr>';
        } else {
            recentScans.forEach(scan => {
                const date = new Date(scan.timestamp);
                html += `
                    <tr>
                        <td>${date.toLocaleDateString()}</td>
                        <td>${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
                        <td>Customer ${scan.userId}</td>
                        <td>${scan.points}</td>
                    </tr>
                `;
            });
        }
        
        tableBody.innerHTML = html;
    }
    
    // Update chart if Chart.js is available
    if (typeof Chart !== 'undefined') {
        const ctx = document.getElementById('scansChart');
        if (ctx) {
            // Group by date for the selected period
            const period = document.getElementById('analyticsPeriod')?.value || '7days';
            const days = period === '7days' ? 7 : period === '30days' ? 30 : period === '90days' ? 90 : 365;
            
            const dailyScans = {};
            const now = new Date();
            
            // Initialize last X days
            for (let i = days - 1; i >= 0; i--) {
                const date = new Date(now);
                date.setDate(date.getDate() - i);
                const dateStr = date.toISOString().split('T')[0];
                dailyScans[dateStr] = 0;
            }
            
            // Count scans per day
            transactions.forEach(t => {
                const date = t.timestamp.split('T')[0];
                if (dailyScans[date] !== undefined) {
                    dailyScans[date]++;
                }
            });
            
            // Prepare chart data
            const labels = Object.keys(dailyScans).map(date => {
                const d = new Date(date);
                return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            });
            const data = Object.values(dailyScans);
            
            // Create or update chart
            if (window.scansChartInstance) {
                window.scansChartInstance.destroy();
            }
            
            window.scansChartInstance = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Scans per Day',
                        data: data,
                        backgroundColor: 'rgba(46, 139, 87, 0.5)',
                        borderColor: 'rgba(46, 139, 87, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                stepSize: 1
                            }
                        }
                    }
                }
            });
        }
    }
}

// ==================== PROFILE EDITING ====================
function openEditProfileModal() {
    const modal = document.getElementById('editProfileModal');
    if (modal) {
        modal.style.display = 'block';
        modal.classList.add('active');
    }
}

function saveProfileChanges() {
    const firstName = document.getElementById('editFirstName')?.value;
    const lastName = document.getElementById('editLastName')?.value;
    const email = document.getElementById('editEmail')?.value;
    const phone = document.getElementById('editPhone')?.value;
    const password = document.getElementById('editPassword')?.value;
    const confirmPassword = document.getElementById('editConfirmPassword')?.value;
    
    // Basic validation
    if (!firstName || !lastName || !email) {
        showMessage('Please fill in all required fields', 'error');
        return;
    }
    
    if (password && password !== confirmPassword) {
        showMessage('Passwords do not match', 'error');
        return;
    }
    
    // Update current user
    currentUser.firstName = firstName;
    currentUser.lastName = lastName;
    currentUser.name = `${firstName} ${lastName}`;
    currentUser.email = email;
    currentUser.phone = phone;
    
    // Update password if provided
    if (password) {
        // Update in stored users
        const users = JSON.parse(localStorage.getItem('ottawaUsers') || '[]');
        const userIndex = users.findIndex(u => u.id === currentUser.id);
        if (userIndex !== -1) {
            users[userIndex].password = password;
            localStorage.setItem('ottawaUsers', JSON.stringify(users));
        }
    }
    
    // Save session
    saveSession();
    
    // Update UI
    updateUserUI();
    
    // Close modal
    const modal = document.getElementById('editProfileModal');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('active');
    }
    showMessage('Profile updated successfully', 'success');
}

// ==================== UTILITY FUNCTIONS ====================
function showMessage(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `message message-${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
        <span>${message}</span>
        <button class="message-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// ==================== DEBUGGING FUNCTIONS ====================
function createDebugPanel() {
    const debugPanel = document.createElement('div');
    debugPanel.id = 'debugPanel';
    debugPanel.style.cssText = `
        position: fixed;
        bottom: 10px;
        right: 10px;
        background: rgba(0, 0, 0, 0.9);
        color: white;
        padding: 15px;
        border-radius: 8px;
        font-family: monospace;
        font-size: 12px;
        z-index: 9999;
        max-width: 300px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        border: 1px solid #666;
    `;
    
    debugPanel.innerHTML = `
        <div style="margin-bottom: 10px; font-weight: bold; color: #4ECDC4;">
            <i class="fas fa-bug"></i> Debug Panel
        </div>
        <div style="margin-bottom: 10px; font-size: 11px; opacity: 0.8;">
            Session: ${currentUser ? currentUser.name : 'Not logged in'}
        </div>
        <div style="display: flex; flex-direction: column; gap: 8px;">
            <button onclick="runTests()" style="padding: 6px; background: #2E8B57; color: white; border: none; border-radius: 4px; cursor: pointer;">
                <i class="fas fa-vial"></i> Run Tests
            </button>
            <button onclick="generateTestTransactions(5)" style="padding: 6px; background: #FF6B35; color: white; border: none; border-radius: 4px; cursor: pointer;">
                <i class="fas fa-plus"></i> Add Test Data
            </button>
            <button onclick="resetTestData()" style="padding: 6px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;">
                <i class="fas fa-redo"></i> Reset All Data
            </button>
            <button onclick="showSystemInfo()" style="padding: 6px; background: #6f42c1; color: white; border: none; border-radius: 4px; cursor: pointer;">
                <i class="fas fa-info-circle"></i> System Info
            </button>
            <button onclick="this.parentElement.parentElement.style.display='none'" style="padding: 6px; background: #666; color: white; border: none; border-radius: 4px; cursor: pointer;">
                <i class="fas fa-times"></i> Close
            </button>
        </div>
    `;
    
    document.body.appendChild(debugPanel);
}

function runTests() {
    console.group('=== OTTWA ARAB POINTS SYSTEM TESTS ===');
    
    // Test 1: Check localStorage initialization
    const requiredKeys = ['ottawaUsers', 'ottawaStores', 'ottawaTransactions', 'ottawaRewards', 'ottawaBusinessData'];
    let allPassed = true;
    
    requiredKeys.forEach(key => {
        const data = localStorage.getItem(key);
        if (data) {
            try {
                JSON.parse(data);
                console.log(`✓ ${key}: OK (${JSON.parse(data).length} items)`);
            } catch (e) {
                console.error(`✗ ${key}: Invalid JSON`);
                allPassed = false;
            }
        } else {
            console.error(`✗ ${key}: Missing`);
            allPassed = false;
        }
    });
    
    // Test 2: Test user authentication
    const storedUsers = JSON.parse(localStorage.getItem('ottawaUsers') || '[]');
    const demoUser = storedUsers.find(u => u.email === 'demo@ottawaarabpoints.com' && u.password === 'demo123');
    if (demoUser) {
        console.log('✓ Demo user exists and credentials work');
    } else {
        console.error('✗ Demo user not found or credentials incorrect');
    }
    
    // Test 3: Test promotions system
    const businessData = JSON.parse(localStorage.getItem('ottawaBusinessData') || '{"businessPromotions": []}');
    if (businessData.businessPromotions && businessData.businessPromotions.length > 0) {
        console.log(`✓ ${businessData.businessPromotions.length} promotions loaded`);
    } else {
        console.error('✗ No promotions found');
    }
    
    // Test 4: Test QR scanner library
    if (typeof Html5Qrcode === 'undefined') {
        console.error('✗ HTML5 QR Code library not loaded');
    } else {
        console.log('✓ QR Scanner library loaded');
    }
    
    // Test 5: Test points system
    const transactions = JSON.parse(localStorage.getItem('ottawaTransactions') || '[]');
    const users = JSON.parse(localStorage.getItem('ottawaUsers') || '[]');
    console.log(`✓ ${transactions.length} total transactions`);
    console.log(`✓ ${users.length} registered users`);
    
    console.groupEnd();
    showMessage('System tests completed. Check console for results.', 'success');
}

function generateTestTransactions(count = 10) {
    const stores = JSON.parse(localStorage.getItem('ottawaStores') || '[]');
    const users = JSON.parse(localStorage.getItem('ottawaUsers') || '[]');
    const transactions = JSON.parse(localStorage.getItem('ottawaTransactions') || '[]');
    
    if (stores.length === 0 || users.length === 0) {
        showMessage('No stores or users available for test transactions', 'error');
        return;
    }
    
    const newTransactions = [];
    const now = new Date();
    
    for (let i = 0; i < count; i++) {
        const user = users[Math.floor(Math.random() * users.length)];
        const store = stores[Math.floor(Math.random() * stores.length)];
        const daysAgo = Math.floor(Math.random() * 30);
        const date = new Date(now);
        date.setDate(date.getDate() - daysAgo);
        
        const transaction = {
            id: `TEST-TXN-${Date.now()}-${i}`,
            userId: user.id,
            storeId: store.id,
            storeName: store.name,
            points: store.points,
            type: 'earned',
            timestamp: date.toISOString(),
            status: 'completed'
        };
        
        newTransactions.push(transaction);
        
        // Update user points
        const userIndex = users.findIndex(u => u.id === user.id);
        if (userIndex !== -1) {
            users[userIndex].points += store.points;
            users[userIndex].totalStoresVisited = (users[userIndex].totalStoresVisited || 0) + 1;
        }
    }
    
    // Save updated data
    localStorage.setItem('ottawaTransactions', JSON.stringify([...transactions, ...newTransactions]));
    localStorage.setItem('ottawaUsers', JSON.stringify(users));
    
    showMessage(`Generated ${count} test transactions`, 'success');
    console.log(`Generated ${count} test transactions`);
    
    // Refresh UI if user is logged in
    if (currentUser) {
        updateUserUI();
        loadActivityList();
    }
}

function resetTestData() {
    if (confirm('Reset all test data? This will clear all user progress and restore demo data.')) {
        localStorage.clear();
        initializeMockData();
        clearSession();
        showAuthOverlay();
        showMessage('Test data reset successfully', 'success');
        console.log('Test data reset complete');
    }
}

function showSystemInfo() {
    const businessData = JSON.parse(localStorage.getItem('ottawaBusinessData') || '{"businessPromotions": []}');
    const activePromotions = businessData.businessPromotions.filter(p => 
        p.isActive && (!p.endDate || new Date(p.endDate) >= new Date())
    );
    
    const info = `
        === SYSTEM INFO ===
        Users: ${JSON.parse(localStorage.getItem('ottawaUsers') || '[]').length}
        Stores: ${JSON.parse(localStorage.getItem('ottawaStores') || '[]').length}
        Transactions: ${JSON.parse(localStorage.getItem('ottawaTransactions') || '[]').length}
        Rewards: ${JSON.parse(localStorage.getItem('ottawaRewards') || '[]').length}
        Promotions: ${businessData.businessPromotions.length} (${activePromotions.length} active)
        Current User: ${currentUser ? currentUser.name : 'None'}
        Admin Mode: ${isAdmin}
        LocalStorage Usage: ${Math.round((JSON.stringify(localStorage).length / 1024) * 100) / 100} KB
        Browser: ${navigator.userAgent.split(') ')[0].split('(')[1]}
    `;
    
    console.log(info);
    alert(info.replace(/        /g, ''));
}

// ==================== GLOBAL FUNCTION EXPORTS ====================
// Make functions available globally for HTML event handlers
window.openQRScannerForStore = openQRScannerForStore;
window.redeemReward = redeemReward;
window.redeemPromotion = redeemPromotion;
window.viewStorePromotions = viewStorePromotions;
window.startQRScanner = startQRScanner;
window.stopQRScanner = stopQRScanner;
window.runTests = runTests;
window.resetTestData = resetTestData;
window.generateTestTransactions = generateTestTransactions;
window.showSystemInfo = showSystemInfo;
window.generateQRCode = generateQRCode;
window.downloadQRCode = downloadQRCode;
window.printQRCode = printQRCode;
window.printRedemptionDetails = printRedemptionDetails;
window.closeRedemptionModal = closeRedemptionModal;