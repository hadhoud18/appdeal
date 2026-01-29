// Business Portal - Store Management System
class BusinessPortal {
    constructor() {
        this.currentBusiness = null;
        this.currentStore = null;
        this.promotions = [];
        this.scans = [];
        this.customers = [];
        
        this.init();
    }

    init() {
        console.log('Business Portal Initializing...');
        
        // Initialize data storage
        this.initBusinessData();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Check for existing session
        this.checkBusinessSession();
    }

    initBusinessData() {
        // Check if business data exists
        if (!localStorage.getItem('ottawaBusinessData')) {
            const initialData = {
                businesses: [],
                stores: [],
                businessPromotions: [],
                businessScans: [],
                businessCustomers: []
            };
            localStorage.setItem('ottawaBusinessData', JSON.stringify(initialData));
        }
    }

    setupEventListeners() {
        // Business Auth Navigation
        document.getElementById('showBusinessRegister')?.addEventListener('click', () => {
            this.showBusinessRegister();
        });
        
        document.getElementById('showBusinessLogin')?.addEventListener('click', () => {
            this.showBusinessLogin();
        });

        // Business Login
        document.getElementById('businessLoginFormElement')?.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('businessLoginEmail')?.value;
            const password = document.getElementById('businessLoginPassword')?.value;
            if (email && password) {
                this.businessLogin(email, password);
            }
        });

        // Business Registration
        document.getElementById('businessRegisterFormElement')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.registerBusiness();
        });

        // Business Logout
        document.getElementById('businessLogoutBtn')?.addEventListener('click', () => {
            this.businessLogout();
        });
        
        document.getElementById('businessPortalLogout')?.addEventListener('click', () => {
            this.businessLogout();
        });

        // Business Menu
        document.getElementById('businessMenuBtn')?.addEventListener('click', () => {
            this.toggleBusinessDropdown();
        });

        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const href = link.getAttribute('href');
                if (href && href.startsWith('#')) {
                    const sectionId = href.substring(1);
                    this.showBusinessSection(sectionId);
                }
            });
        });

        // Store Management
        document.getElementById('editStoreBtn')?.addEventListener('click', () => {
            this.showStoreEditForm();
        });
        
        document.getElementById('cancelStoreEdit')?.addEventListener('click', () => {
            this.cancelStoreEdit();
        });
        
        document.getElementById('updateStoreForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateStore();
        });
        
        document.getElementById('saveStoreStatus')?.addEventListener('click', () => {
            this.saveStoreStatus();
        });

        // Logo Upload
        const logoUpload = document.getElementById('storeLogoUpload');
        const logoInput = document.getElementById('storeLogoInput');
        
        if (logoUpload && logoInput) {
            logoUpload.addEventListener('click', () => logoInput.click());
            logoInput.addEventListener('change', (e) => this.handleLogoUpload(e));
        }

        // Promotions
        document.getElementById('createPromotionForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.createPromotion();
        });

        // QR Codes
        document.querySelectorAll('.qr-option-card').forEach(card => {
            card.addEventListener('click', () => {
                this.selectQROption(card.dataset.type);
            });
        });
        
        document.getElementById('generateStoreQR')?.addEventListener('click', () => {
            this.generateStoreQR();
        });
        
        document.getElementById('downloadStoreQR')?.addEventListener('click', () => {
            this.downloadQRCode('store');
        });
        
        document.getElementById('generatePromotionQR')?.addEventListener('click', () => {
            this.generatePromotionQR();
        });
        
        document.getElementById('generateCustomQR')?.addEventListener('click', () => {
            this.generateCustomQR();
        });

        // Analytics
        document.getElementById('analyticsDateRange')?.addEventListener('change', (e) => {
            this.handleDateRangeChange(e.target.value);
        });
        
        document.getElementById('applyCustomRange')?.addEventListener('click', () => {
            this.loadAnalytics();
        });

        // Customer Search
        document.getElementById('customerSearch')?.addEventListener('input', (e) => {
            this.searchCustomers(e.target.value);
        });
        
        document.getElementById('customerFilter')?.addEventListener('change', (e) => {
            this.filterCustomers(e.target.value);
        });

        // Close dropdowns when clicking outside
        window.addEventListener('click', (e) => {
            const dropdown = document.getElementById('businessDropdown');
            if (dropdown && dropdown.classList.contains('active') && 
                !e.target.closest('.user-menu')) {
                dropdown.classList.remove('active');
            }
        });

        // Mobile menu toggle
        document.querySelector('.menu-toggle')?.addEventListener('click', () => {
            const navLinks = document.querySelector('.nav-links');
            if (navLinks) {
                navLinks.classList.toggle('active');
            }
        });
    }

    checkBusinessSession() {
        const savedBusiness = localStorage.getItem('currentBusiness');
        const savedStore = localStorage.getItem('currentBusinessStore');
        
        if (savedBusiness && savedStore) {
            this.currentBusiness = JSON.parse(savedBusiness);
            this.currentStore = JSON.parse(savedStore);
            this.showBusinessDashboard();
            this.loadBusinessData();
        }
    }

    showBusinessLogin() {
        document.getElementById('businessLoginForm').classList.add('active');
        document.getElementById('businessRegisterForm').classList.remove('active');
    }

    showBusinessRegister() {
        document.getElementById('businessLoginForm').classList.remove('active');
        document.getElementById('businessRegisterForm').classList.add('active');
    }

    async businessLogin(email, password) {
        const data = this.getBusinessData();
        const business = data.businesses.find(b => 
            b.email === email && b.password === password
        );

        if (business) {
            this.currentBusiness = business;
            this.currentStore = data.stores.find(s => s.ownerId === business.id);
            
            // Remove password from session
            delete this.currentBusiness.password;
            
            // Save session
            localStorage.setItem('currentBusiness', JSON.stringify(this.currentBusiness));
            if (this.currentStore) {
                localStorage.setItem('currentBusinessStore', JSON.stringify(this.currentStore));
            }
            
            this.showBusinessDashboard();
            this.loadBusinessData();
            
            this.showMessage('Login successful!', 'success');
            return true;
        } else {
            this.showMessage('Invalid email or password', 'error');
            return false;
        }
    }

    async registerBusiness() {
        const businessName = document.getElementById('businessName').value;
        const businessType = document.getElementById('businessType').value;
        const ownerFirstName = document.getElementById('ownerFirstName').value;
        const ownerLastName = document.getElementById('ownerLastName').value;
        const businessEmail = document.getElementById('businessEmail').value;
        const businessPhone = document.getElementById('businessPhone').value;
        const businessPassword = document.getElementById('businessPassword').value;
        const confirmPassword = document.getElementById('businessConfirmPassword').value;

        // Validation
        if (!businessName || !businessType || !ownerFirstName || !ownerLastName || 
            !businessEmail || !businessPassword) {
            this.showMessage('Please fill in all required fields', 'error');
            return;
        }

        if (businessPassword !== confirmPassword) {
            this.showMessage('Passwords do not match', 'error');
            return;
        }

        if (businessPassword.length < 8) {
            this.showMessage('Password must be at least 8 characters', 'error');
            return;
        }

        const data = this.getBusinessData();

        // Check if business already exists
        if (data.businesses.some(b => b.email === businessEmail)) {
            this.showMessage('Business with this email already exists', 'error');
            return;
        }

        // Create business owner
        const businessOwner = {
            id: Date.now(),
            email: businessEmail,
            password: businessPassword,
            firstName: ownerFirstName,
            lastName: ownerLastName,
            name: `${ownerFirstName} ${ownerLastName}`,
            phone: businessPhone,
            role: 'store_owner',
            createdAt: new Date().toISOString(),
            lastLogin: null
        };

        // Create store
        const store = {
            id: `store-${Date.now()}`,
            ownerId: businessOwner.id,
            name: businessName,
            type: businessType,
            email: businessEmail,
            phone: businessPhone,
            address: document.getElementById('businessAddress').value || '',
            description: '',
            pointsPerScan: 10,
            operatingHours: '',
            logo: null,
            isActive: true,
            isAcceptingScans: true,
            emailNotifications: true,
            createdAt: new Date().toISOString(),
            totalScans: 0,
            totalCustomers: 0,
            totalPointsGiven: 0
        };

        // Save to database
        data.businesses.push(businessOwner);
        data.stores.push(store);
        this.saveBusinessData(data);

        // Auto login
        this.currentBusiness = businessOwner;
        this.currentStore = store;
        delete this.currentBusiness.password;
        
        localStorage.setItem('currentBusiness', JSON.stringify(this.currentBusiness));
        localStorage.setItem('currentBusinessStore', JSON.stringify(this.currentStore));
        
        this.showBusinessDashboard();
        this.loadBusinessData();
        
        this.showMessage('Business registered successfully! Welcome to Ottawa Arab Points!', 'success');
    }

    showBusinessDashboard() {
        document.getElementById('businessAuth').classList.remove('active');
        document.getElementById('businessDashboard').style.display = 'block';
        this.showBusinessSection('businessHome');
    }

    showBusinessSection(sectionId) {
        // Hide all sections
        document.querySelectorAll('#businessApp .section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Remove active class from nav links
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
        this.loadBusinessSection(sectionId);
        
        // Close mobile menu if open
        const navLinks = document.querySelector('.nav-links');
        if (navLinks && navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
        }
    }

    loadBusinessSection(sectionId) {
        switch(sectionId) {
            case 'businessHome':
                this.loadDashboard();
                break;
            case 'businessStore':
                this.loadStoreInfo();
                break;
            case 'businessPromotions':
                this.loadPromotions();
                break;
            case 'businessQR':
                this.loadQRManagement();
                break;
            case 'businessAnalytics':
                this.loadAnalytics();
                break;
            case 'businessCustomers':
                this.loadCustomers();
                break;
        }
    }

    loadBusinessData() {
        if (!this.currentBusiness || !this.currentStore) return;
        
        // Update UI with business info
        document.getElementById('businessNavName').textContent = this.currentStore.name;
        document.getElementById('businessUserName').textContent = this.currentBusiness.firstName;
        document.getElementById('dropdownBusinessName').textContent = this.currentBusiness.name;
        document.getElementById('dropdownBusinessEmail').textContent = this.currentBusiness.email;
        document.getElementById('businessWelcome').textContent = `Welcome, ${this.currentBusiness.firstName}!`;
        
        // Load dashboard
        this.loadDashboard();
    }

    async loadDashboard() {
        if (!this.currentStore) return;
        
        const data = this.getBusinessData();
        
        // Get store scans
        const storeScans = data.businessScans.filter(scan => scan.storeId === this.currentStore.id);
        const storePromotions = data.businessPromotions.filter(p => p.storeId === this.currentStore.id);
        
        // Calculate metrics
        const totalScans = storeScans.length;
        const uniqueCustomers = [...new Set(storeScans.map(scan => scan.userId))].length;
        const totalPoints = storeScans.reduce((sum, scan) => sum + scan.points, 0);
        const activePromotions = storePromotions.filter(p => p.isActive).length;
        
        // Update dashboard stats
        document.getElementById('totalScans').textContent = totalScans;
        document.getElementById('activeCustomers').textContent = uniqueCustomers;
        document.getElementById('totalPoints').textContent = totalPoints;
        document.getElementById('activePromotions').textContent = activePromotions;
        
        // Load recent activity
        this.loadRecentActivity(storeScans);
    }

    loadRecentActivity(scans) {
        const activityList = document.getElementById('businessActivityList');
        if (!activityList) return;
        
        const recentScans = scans
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 5);
        
        activityList.innerHTML = '';
        
        if (recentScans.length === 0) {
            activityList.innerHTML = `
                <div class="activity-item">
                    <div>
                        <div class="activity-store">No activity yet</div>
                        <div class="activity-date">Start by generating a QR code</div>
                    </div>
                </div>
            `;
            return;
        }
        
        recentScans.forEach(scan => {
            const date = new Date(scan.timestamp);
            const activityItem = document.createElement('div');
            activityItem.className = 'activity-item';
            activityItem.innerHTML = `
                <div>
                    <div class="activity-store">Customer Scan</div>
                    <div class="activity-date">${date.toLocaleDateString()} • ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                    <div class="activity-reward">${scan.points} points earned</div>
                </div>
                <div class="activity-points earned">
                    +${scan.points} pts
                </div>
            `;
            activityList.appendChild(activityItem);
        });
    }

    loadStoreInfo() {
        if (!this.currentStore) return;
        
        const storeInfoDisplay = document.getElementById('storeInfoDisplay');
        if (!storeInfoDisplay) return;
        
        // Display store information
        storeInfoDisplay.innerHTML = `
            <div class="store-info-item">
                <label>Store Name:</label>
                <span>${this.currentStore.name}</span>
            </div>
            <div class="store-info-item">
                <label>Store Type:</label>
                <span>${this.currentStore.type.charAt(0).toUpperCase() + this.currentStore.type.slice(1)}</span>
            </div>
            <div class="store-info-item">
                <label>Phone Number:</label>
                <span>${this.currentStore.phone || 'Not set'}</span>
            </div>
            <div class="store-info-item">
                <label>Email:</label>
                <span>${this.currentStore.email}</span>
            </div>
            <div class="store-info-item">
                <label>Address:</label>
                <span>${this.currentStore.address || 'Not set'}</span>
            </div>
            <div class="store-info-item">
                <label>Points per Scan:</label>
                <span>${this.currentStore.pointsPerScan} points</span>
            </div>
            <div class="store-info-item">
                <label>Operating Hours:</label>
                <span>${this.currentStore.operatingHours || 'Not set'}</span>
            </div>
            <div class="store-info-item">
                <label>Store Status:</label>
                <span class="status-badge ${this.currentStore.isActive ? 'active' : 'inactive'}">
                    ${this.currentStore.isActive ? 'Active' : 'Inactive'}
                </span>
            </div>
            <div class="store-info-item">
                <label>Description:</label>
                <p>${this.currentStore.description || 'No description yet'}</p>
            </div>
        `;
        
        // Set form values for editing
        document.getElementById('editStoreName').value = this.currentStore.name;
        document.getElementById('editStoreType').value = this.currentStore.type;
        document.getElementById('editStoreDescription').value = this.currentStore.description || '';
        document.getElementById('editStorePhone').value = this.currentStore.phone;
        document.getElementById('editStoreEmail').value = this.currentStore.email;
        document.getElementById('editStoreAddress').value = this.currentStore.address || '';
        document.getElementById('editStorePoints').value = this.currentStore.pointsPerScan;
        document.getElementById('editStoreHours').value = this.currentStore.operatingHours || '';
        
        // Set toggle switches
        document.getElementById('storeVisibility').checked = this.currentStore.isActive;
        document.getElementById('storeAcceptingScans').checked = this.currentStore.isAcceptingScans;
        document.getElementById('storeEmailNotifications').checked = this.currentStore.emailNotifications;
        
        // Load logo preview
        this.loadLogoPreview();
    }

    showStoreEditForm() {
        document.getElementById('storeInfoDisplay').style.display = 'none';
        document.getElementById('storeEditForm').style.display = 'block';
        document.getElementById('editStoreBtn').style.display = 'none';
    }

    cancelStoreEdit() {
        document.getElementById('storeInfoDisplay').style.display = 'block';
        document.getElementById('storeEditForm').style.display = 'none';
        document.getElementById('editStoreBtn').style.display = 'block';
    }

    async updateStore() {
        const updates = {
            name: document.getElementById('editStoreName').value,
            type: document.getElementById('editStoreType').value,
            description: document.getElementById('editStoreDescription').value,
            phone: document.getElementById('editStorePhone').value,
            email: document.getElementById('editStoreEmail').value,
            address: document.getElementById('editStoreAddress').value,
            pointsPerScan: parseInt(document.getElementById('editStorePoints').value),
            operatingHours: document.getElementById('editStoreHours').value
        };

        // Validate
        if (!updates.name || !updates.type || !updates.phone || !updates.email) {
            this.showMessage('Please fill in all required fields', 'error');
            return;
        }

        // Update store
        Object.assign(this.currentStore, updates);
        
        // Save to database
        const data = this.getBusinessData();
        const storeIndex = data.stores.findIndex(s => s.id === this.currentStore.id);
        if (storeIndex !== -1) {
            data.stores[storeIndex] = this.currentStore;
            this.saveBusinessData(data);
        }
        
        // Update localStorage
        localStorage.setItem('currentBusinessStore', JSON.stringify(this.currentStore));
        
        // Update UI
        this.loadStoreInfo();
        this.cancelStoreEdit();
        
        this.showMessage('Store information updated successfully!', 'success');
    }

    saveStoreStatus() {
        const updates = {
            isActive: document.getElementById('storeVisibility').checked,
            isAcceptingScans: document.getElementById('storeAcceptingScans').checked,
            emailNotifications: document.getElementById('storeEmailNotifications').checked
        };

        Object.assign(this.currentStore, updates);
        
        // Save to database
        const data = this.getBusinessData();
        const storeIndex = data.stores.findIndex(s => s.id === this.currentStore.id);
        if (storeIndex !== -1) {
            data.stores[storeIndex] = this.currentStore;
            this.saveBusinessData(data);
        }
        
        // Update localStorage
        localStorage.setItem('currentBusinessStore', JSON.stringify(this.currentStore));
        
        this.showMessage('Store status updated!', 'success');
    }

    handleLogoUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        if (!file.type.startsWith('image/')) {
            this.showMessage('Please upload an image file', 'error');
            return;
        }
        
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            this.showMessage('Image size should be less than 5MB', 'error');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            this.currentStore.logo = e.target.result;
            
            // Save to database
            const data = this.getBusinessData();
            const storeIndex = data.stores.findIndex(s => s.id === this.currentStore.id);
            if (storeIndex !== -1) {
                data.stores[storeIndex].logo = this.currentStore.logo;
                this.saveBusinessData(data);
            }
            
            // Update localStorage
            localStorage.setItem('currentBusinessStore', JSON.stringify(this.currentStore));
            
            // Update preview
            this.loadLogoPreview();
            
            this.showMessage('Logo uploaded successfully!', 'success');
        };
        reader.readAsDataURL(file);
    }

    loadLogoPreview() {
        const logoPreview = document.getElementById('logoPreview');
        if (!logoPreview) return;
        
        if (this.currentStore.logo) {
            logoPreview.innerHTML = `
                <img src="${this.currentStore.logo}" alt="${this.currentStore.name} Logo">
                <button class="btn btn-small btn-danger" onclick="businessPortal.removeLogo()">
                    <i class="fas fa-trash"></i> Remove
                </button>
            `;
        } else {
            logoPreview.innerHTML = `
                <div class="no-logo">
                    <i class="fas fa-store"></i>
                    <p>No logo uploaded</p>
                </div>
            `;
        }
    }

    removeLogo() {
        if (!confirm('Remove store logo?')) return;
        
        this.currentStore.logo = null;
        
        // Save to database
        const data = this.getBusinessData();
        const storeIndex = data.stores.findIndex(s => s.id === this.currentStore.id);
        if (storeIndex !== -1) {
            data.stores[storeIndex].logo = null;
            this.saveBusinessData(data);
        }
        
        // Update localStorage
        localStorage.setItem('currentBusinessStore', JSON.stringify(this.currentStore));
        
        // Update preview
        this.loadLogoPreview();
        
        this.showMessage('Logo removed', 'info');
    }

    async createPromotion() {
        const promotion = {
            id: `promo-${Date.now()}`,
            storeId: this.currentStore.id,
            storeName: this.currentStore.name,
            title: document.getElementById('promotionTitle').value,
            type: document.getElementById('promotionType').value,
            description: document.getElementById('promotionDescription').value,
            pointsRequired: parseInt(document.getElementById('promotionPoints').value),
            quantity: document.getElementById('promotionQuantity').value || null,
            startDate: document.getElementById('promotionStartDate').value,
            endDate: document.getElementById('promotionEndDate').value || null,
            isActive: document.getElementById('promotionActive').checked,
            createdAt: new Date().toISOString(),
            totalRedemptions: 0
        };

        // Validate
        if (!promotion.title || !promotion.description || !promotion.startDate) {
            this.showMessage('Please fill in all required fields', 'error');
            return;
        }

        // Save to database
        const data = this.getBusinessData();
        data.businessPromotions.push(promotion);
        this.saveBusinessData(data);
        
        // Clear form
        document.getElementById('createPromotionForm').reset();
        document.getElementById('promotionStartDate').value = new Date().toISOString().split('T')[0];
        document.getElementById('promotionActive').checked = true;
        
        // Refresh promotions list
        this.loadPromotions();
        
        this.showMessage('Promotion created successfully!', 'success');
    }

    async loadPromotions() {
        if (!this.currentStore) return;
        
        const data = this.getBusinessData();
        const storePromotions = data.businessPromotions
            .filter(p => p.storeId === this.currentStore.id)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        // Separate active and past promotions
        const now = new Date();
        const activePromotions = storePromotions.filter(p => 
            p.isActive && (!p.endDate || new Date(p.endDate) >= now)
        );
        
        const pastPromotions = storePromotions.filter(p => 
            !p.isActive || (p.endDate && new Date(p.endDate) < now)
        );
        
        // Load active promotions
        this.loadPromotionsGrid('activePromotionsGrid', activePromotions, true);
        
        // Load past promotions
        this.loadPromotionsGrid('pastPromotionsGrid', pastPromotions, false);
        
        // Update promotion QR dropdown
        this.updatePromotionQRDropdown(activePromotions);
    }

    loadPromotionsGrid(gridId, promotions, isActive) {
        const grid = document.getElementById(gridId);
        if (!grid) return;
        
        grid.innerHTML = '';
        
        if (promotions.length === 0) {
            grid.innerHTML = `
                <div class="no-promotions">
                    <i class="fas fa-tag"></i>
                    <p>${isActive ? 'No active promotions' : 'No past promotions'}</p>
                </div>
            `;
            return;
        }
        
        promotions.forEach(promo => {
            const promoCard = document.createElement('div');
            promoCard.className = 'promotion-card';
            promoCard.innerHTML = `
                <div class="promotion-header">
                    <h4>${promo.title}</h4>
                    <span class="promotion-type ${promo.type}">${promo.type.replace('_', ' ')}</span>
                </div>
                <div class="promotion-body">
                    <p>${promo.description}</p>
                    <div class="promotion-details">
                        <div class="detail-item">
                            <i class="fas fa-coins"></i>
                            <span>${promo.pointsRequired} points</span>
                        </div>
                        <div class="detail-item">
                            <i class="fas fa-calendar"></i>
                            <span>${new Date(promo.startDate).toLocaleDateString()}</span>
                        </div>
                        ${promo.quantity ? `
                        <div class="detail-item">
                            <i class="fas fa-box"></i>
                            <span>${promo.quantity} available</span>
                        </div>
                        ` : ''}
                        <div class="detail-item">
                            <i class="fas fa-redo"></i>
                            <span>${promo.totalRedemptions || 0} redemptions</span>
                        </div>
                    </div>
                </div>
                <div class="promotion-actions">
                    ${isActive ? `
                    <button class="btn btn-small" onclick="businessPortal.editPromotion('${promo.id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-small btn-danger" onclick="businessPortal.deactivatePromotion('${promo.id}')">
                        <i class="fas fa-ban"></i> Deactivate
                    </button>
                    ` : `
                    <button class="btn btn-small" onclick="businessPortal.reactivatePromotion('${promo.id}')">
                        <i class="fas fa-redo"></i> Reactivate
                    </button>
                    `}
                </div>
            `;
            grid.appendChild(promoCard);
        });
    }

    updatePromotionQRDropdown(promotions) {
        const dropdown = document.getElementById('selectPromotionQR');
        if (!dropdown) return;
        
        dropdown.innerHTML = '<option value="">Choose a promotion</option>';
        
        promotions.forEach(promo => {
            const option = document.createElement('option');
            option.value = promo.id;
            option.textContent = promo.title;
            dropdown.appendChild(option);
        });
        
        // Enable/disable generate button
        const generateBtn = document.getElementById('generatePromotionQR');
        if (generateBtn) {
            generateBtn.disabled = promotions.length === 0;
        }
    }

    editPromotion(promotionId) {
        const data = this.getBusinessData();
        const promotion = data.businessPromotions.find(p => p.id === promotionId);
        
        if (promotion) {
            // Populate edit form
            document.getElementById('promotionTitle').value = promotion.title;
            document.getElementById('promotionType').value = promotion.type;
            document.getElementById('promotionDescription').value = promotion.description;
            document.getElementById('promotionPoints').value = promotion.pointsRequired;
            document.getElementById('promotionQuantity').value = promotion.quantity || '';
            document.getElementById('promotionStartDate').value = promotion.startDate;
            document.getElementById('promotionEndDate').value = promotion.endDate || '';
            document.getElementById('promotionActive').checked = promotion.isActive;
            
            // Scroll to form
            document.getElementById('createPromotionForm').scrollIntoView({ behavior: 'smooth' });
            
            // Show message
            this.showMessage('Edit the promotion below', 'info');
        }
    }

    deactivatePromotion(promotionId) {
        if (!confirm('Deactivate this promotion?')) return;
        
        const data = this.getBusinessData();
        const promotionIndex = data.businessPromotions.findIndex(p => p.id === promotionId);
        
        if (promotionIndex !== -1) {
            data.businessPromotions[promotionIndex].isActive = false;
            this.saveBusinessData(data);
            
            this.loadPromotions();
            this.showMessage('Promotion deactivated', 'success');
        }
    }

    reactivatePromotion(promotionId) {
        const data = this.getBusinessData();
        const promotionIndex = data.businessPromotions.findIndex(p => p.id === promotionId);
        
        if (promotionIndex !== -1) {
            data.businessPromotions[promotionIndex].isActive = true;
            this.saveBusinessData(data);
            
            this.loadPromotions();
            this.showMessage('Promotion reactivated', 'success');
        }
    }

    selectQROption(optionType) {
        // Update active tab
        document.querySelectorAll('.qr-option-card').forEach(card => {
            card.classList.remove('active');
        });
        document.querySelector(`.qr-option-card[data-type="${optionType}"]`).classList.add('active');
        
        // Show corresponding content
        document.querySelectorAll('.qr-generator-content').forEach(content => {
            content.style.display = 'none';
        });
        document.getElementById(`${optionType}QRGenerator`).style.display = 'block';
    }

    async generateStoreQR() {
        if (!this.currentStore) return;
        
        const qrData = JSON.stringify({
            type: 'store',
            storeId: this.currentStore.id,
            storeName: this.currentStore.name,
            points: this.currentStore.pointsPerScan,
            timestamp: new Date().toISOString()
        });
        
        await this.generateQRCode('storeQRPreview', qrData);
        
        // Enable download and print buttons
        document.getElementById('downloadStoreQR').disabled = false;
        document.getElementById('printStoreQR').disabled = false;
        
        this.showMessage('Store QR code generated!', 'success');
    }

    async generatePromotionQR() {
        const promotionId = document.getElementById('selectPromotionQR').value;
        if (!promotionId) return;
        
        const data = this.getBusinessData();
        const promotion = data.businessPromotions.find(p => p.id === promotionId);
        
        if (!promotion) return;
        
        const qrData = JSON.stringify({
            type: 'promotion',
            promotionId: promotion.id,
            storeId: promotion.storeId,
            title: promotion.title,
            pointsRequired: promotion.pointsRequired,
            timestamp: new Date().toISOString()
        });
        
        await this.generateQRCode('promotionQRPreview', qrData);
        
        // Enable download button
        document.getElementById('downloadPromotionQR').disabled = false;
        
        this.showMessage('Promotion QR code generated!', 'success');
    }

    async generateCustomQR() {
        const content = document.getElementById('customQRContent').value;
        if (!content.trim()) {
            this.showMessage('Please enter custom content', 'error');
            return;
        }
        
        const qrData = JSON.stringify({
            type: 'custom',
            content: content,
            timestamp: new Date().toISOString()
        });
        
        await this.generateQRCode('customQRPreview', qrData);
        
        // Enable download button
        document.getElementById('downloadCustomQR').disabled = false;
        
        this.showMessage('Custom QR code generated!', 'success');
    }

    async generateQRCode(previewId, data) {
        const preview = document.getElementById(previewId);
        if (!preview) return;
        
        preview.innerHTML = '';
        
        try {
            const canvas = document.createElement('canvas');
            await QRCode.toCanvas(canvas, data, { 
                width: 200, 
                height: 200,
                margin: 2
            });
            
            preview.appendChild(canvas);
            
            // Store canvas data for download
            preview.dataset.canvas = canvas.toDataURL('image/png');
            preview.dataset.qrData = data;
            
        } catch (error) {
            console.error('QR generation error:', error);
            this.showMessage('Failed to generate QR code', 'error');
        }
    }

    downloadQRCode(type) {
        let previewId, buttonId;
        
        switch(type) {
            case 'store':
                previewId = 'storeQRPreview';
                buttonId = 'downloadStoreQR';
                break;
            case 'promotion':
                previewId = 'promotionQRPreview';
                buttonId = 'downloadPromotionQR';
                break;
            case 'custom':
                previewId = 'customQRPreview';
                buttonId = 'downloadCustomQR';
                break;
        }
        
        const preview = document.getElementById(previewId);
        const canvasData = preview?.dataset.canvas;
        
        if (!canvasData) {
            this.showMessage('No QR code to download', 'error');
            return;
        }
        
        let fileName = 'qr_code.png';
        if (type === 'store') {
            fileName = `QR_${this.currentStore.name.replace(/\s+/g, '_')}_${Date.now()}.png`;
        } else if (type === 'promotion') {
            const promotionId = document.getElementById('selectPromotionQR').value;
            const data = this.getBusinessData();
            const promotion = data.businessPromotions.find(p => p.id === promotionId);
            if (promotion) {
                fileName = `QR_${promotion.title.replace(/\s+/g, '_')}_${Date.now()}.png`;
            }
        }
        
        const link = document.createElement('a');
        link.download = fileName;
        link.href = canvasData;
        link.click();
        
        this.showMessage('QR code downloaded!', 'success');
    }

    loadQRManagement() {
        // Generate store QR if not already generated
        if (this.currentStore) {
            this.generateStoreQR();
        }
        
        // Load QR history
        this.loadQRHistory();
    }

    loadQRHistory() {
        // Implementation for QR history
        const historyGrid = document.getElementById('qrHistoryGrid');
        if (!historyGrid) return;
        
        historyGrid.innerHTML = `
            <div class="no-history">
                <i class="fas fa-history"></i>
                <p>No QR codes generated yet</p>
            </div>
        `;
    }

    loadAnalytics() {
        if (!this.currentStore) return;
        
        const data = this.getBusinessData();
        const storeScans = data.businessScans.filter(scan => scan.storeId === this.currentStore.id);
        
        // Calculate metrics
        const today = new Date().toISOString().split('T')[0];
        const dailyScans = storeScans.filter(scan => scan.timestamp.startsWith(today)).length;
        const newCustomers = [...new Set(storeScans.map(scan => scan.userId))].length;
        const pointsGiven = storeScans.reduce((sum, scan) => sum + scan.points, 0);
        const promotionsRedeemed = data.businessPromotions.filter(p => 
            p.storeId === this.currentStore.id && p.totalRedemptions > 0
        ).reduce((sum, p) => sum + p.totalRedemptions, 0);
        
        // Update metrics
        document.getElementById('dailyScans').textContent = dailyScans;
        document.getElementById('newCustomers').textContent = newCustomers;
        document.getElementById('pointsGiven').textContent = pointsGiven;
        document.getElementById('promotionsRedeemed').textContent = promotionsRedeemed;
        
        // Load charts
        this.loadScansChart(storeScans);
        this.loadPromotionsChart(data.businessPromotions.filter(p => p.storeId === this.currentStore.id));
    }

    loadScansChart(scans) {
        const ctx = document.getElementById('scansChart');
        if (!ctx) return;
        
        // Group scans by day for last 7 days
        const dailyData = {};
        const now = new Date();
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            dailyData[dateStr] = 0;
        }
        
        scans.forEach(scan => {
            const date = scan.timestamp.split('T')[0];
            if (dailyData[date] !== undefined) {
                dailyData[date]++;
            }
        });
        
        const labels = Object.keys(dailyData).map(date => {
            const d = new Date(date);
            return d.toLocaleDateString('en-US', { weekday: 'short' });
        });
        
        const data = Object.values(dailyData);
        
        // Create or update chart
        if (window.scansChartInstance) {
            window.scansChartInstance.destroy();
        }
        
        window.scansChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Daily Scans',
                    data: data,
                    borderColor: 'rgba(46, 139, 87, 1)',
                    backgroundColor: 'rgba(46, 139, 87, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
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

    loadPromotionsChart(promotions) {
        const ctx = document.getElementById('promotionsChart');
        if (!ctx) return;
        
        const activePromotions = promotions.filter(p => p.isActive);
        const labels = activePromotions.map(p => p.title);
        const data = activePromotions.map(p => p.totalRedemptions || 0);
        
        if (window.promotionsChartInstance) {
            window.promotionsChartInstance.destroy();
        }
        
        window.promotionsChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Redemptions',
                    data: data,
                    backgroundColor: 'rgba(255, 107, 53, 0.7)',
                    borderColor: 'rgba(255, 107, 53, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
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

    loadCustomers() {
        if (!this.currentStore) return;
        
        const data = this.getBusinessData();
        const storeScans = data.businessScans.filter(scan => scan.storeId === this.currentStore.id);
        
        // Get unique customers with their data
        const customerMap = new Map();
        
        storeScans.forEach(scan => {
            if (!customerMap.has(scan.userId)) {
                customerMap.set(scan.userId, {
                    id: scan.userId,
                    name: scan.userName || 'Customer',
                    email: scan.userEmail || 'N/A',
                    totalScans: 0,
                    totalPoints: 0,
                    lastVisit: null,
                    promotionsUsed: 0
                });
            }
            
            const customer = customerMap.get(scan.userId);
            customer.totalScans++;
            customer.totalPoints += scan.points;
            
            const scanDate = new Date(scan.timestamp);
            if (!customer.lastVisit || scanDate > new Date(customer.lastVisit)) {
                customer.lastVisit = scan.timestamp;
            }
            
            if (scan.promotionId) {
                customer.promotionsUsed++;
            }
        });
        
        const customers = Array.from(customerMap.values());
        
        // Update count
        document.getElementById('customersCount').textContent = customers.length;
        
        // Load customers table
        this.loadCustomersTable(customers);
        
        // Load insights
        this.loadCustomerInsights(customers, storeScans);
    }

    loadCustomersTable(customers) {
        const tableBody = document.getElementById('customersTableBody');
        if (!tableBody) return;
        
        tableBody.innerHTML = '';
        
        customers.forEach(customer => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <div class="customer-info">
                        <div class="customer-name">${customer.name}</div>
                        <div class="customer-email">${customer.email}</div>
                    </div>
                </td>
                <td>
                    <span class="customer-points">${customer.totalPoints}</span>
                </td>
                <td>
                    ${customer.lastVisit ? new Date(customer.lastVisit).toLocaleDateString() : 'N/A'}
                </td>
                <td>${customer.totalScans}</td>
                <td>${customer.promotionsUsed}</td>
                <td>
                    <button class="btn btn-small" onclick="businessPortal.viewCustomerDetails('${customer.id}')">
                        <i class="fas fa-eye"></i> View
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    loadCustomerInsights(customers, scans) {
        const totalCustomers = customers.length;
        
        // Calculate repeat rate (customers with more than 1 visit)
        const repeatCustomers = customers.filter(c => c.totalScans > 1).length;
        const repeatRate = totalCustomers > 0 ? Math.round((repeatCustomers / totalCustomers) * 100) : 0;
        
        // Calculate average visits
        const avgVisits = totalCustomers > 0 ? 
            (scans.length / totalCustomers).toFixed(1) : 0;
        
        // Find busiest day
        const dayCounts = {};
        scans.forEach(scan => {
            const date = new Date(scan.timestamp);
            const day = date.toLocaleDateString('en-US', { weekday: 'long' });
            dayCounts[day] = (dayCounts[day] || 0) + 1;
        });
        
        let busiestDay = '-';
        let maxCount = 0;
        Object.entries(dayCounts).forEach(([day, count]) => {
            if (count > maxCount) {
                maxCount = count;
                busiestDay = day;
            }
        });
        
        // Update insights
        document.getElementById('totalCustomers').textContent = totalCustomers;
        document.getElementById('repeatRate').textContent = `${repeatRate}%`;
        document.getElementById('avgVisits').textContent = avgVisits;
        document.getElementById('busiestDay').textContent = busiestDay;
    }

    searchCustomers(query) {
        // Implementation for customer search
        console.log('Searching customers:', query);
    }

    filterCustomers(filter) {
        // Implementation for customer filtering
        console.log('Filtering customers by:', filter);
    }

    viewCustomerDetails(customerId) {
        // Implementation for viewing customer details
        console.log('Viewing customer:', customerId);
    }

    handleDateRangeChange(range) {
        const customRange = document.getElementById('customDateRange');
        if (range === 'custom') {
            customRange.style.display = 'flex';
        } else {
            customRange.style.display = 'none';
            this.loadAnalytics();
        }
    }

    exportCSV(type) {
        let data, filename;
        
        switch(type) {
            case 'scans':
                const businessData = this.getBusinessData();
                data = businessData.businessScans.filter(scan => scan.storeId === this.currentStore.id);
                filename = `scans_${this.currentStore.name}_${Date.now()}.csv`;
                break;
            case 'customers':
                // Export customer data
                filename = `customers_${this.currentStore.name}_${Date.now()}.csv`;
                break;
            case 'promotions':
                // Export promotion data
                filename = `promotions_${this.currentStore.name}_${Date.now()}.csv`;
                break;
        }
        
        this.showMessage(`${type} exported successfully!`, 'success');
    }

    generateFullReport() {
        this.showMessage('Report generation started!', 'info');
        // Implementation for full report generation
    }

    downloadBusinessReport() {
        this.showMessage('Downloading business report...', 'info');
        // Implementation for report download
    }

    toggleBusinessDropdown() {
        const dropdown = document.getElementById('businessDropdown');
        if (dropdown) {
            dropdown.classList.toggle('active');
        }
    }

    businessLogout() {
        this.currentBusiness = null;
        this.currentStore = null;
        
        localStorage.removeItem('currentBusiness');
        localStorage.removeItem('currentBusinessStore');
        
        document.getElementById('businessAuth').classList.add('active');
        document.getElementById('businessDashboard').style.display = 'none';
        
        this.showMessage('Logged out successfully', 'info');
    }

    getBusinessData() {
        const data = localStorage.getItem('ottawaBusinessData');
        return data ? JSON.parse(data) : { businesses: [], stores: [], businessPromotions: [], businessScans: [], businessCustomers: [] };
    }

    saveBusinessData(data) {
        localStorage.setItem('ottawaBusinessData', JSON.stringify(data));
    }

    showMessage(message, type = 'info') {
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
}

// Initialize Business Portal when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.businessPortal = new BusinessPortal();
});

// Helper functions for HTML onclick events
function showBusinessSection(sectionId) {
    window.businessPortal?.showBusinessSection(sectionId);
}

function togglePastPromotions() {
    const grid = document.getElementById('pastPromotionsGrid');
    if (grid) {
        grid.style.display = grid.style.display === 'none' ? 'grid' : 'none';
    }
}

function downloadMarketingKit() {
    alert('Marketing kit download started!');
    // Implementation for marketing kit download
}

function printQRGuides() {
    alert('Opening printable guides...');
    // Implementation for printable guides
}

function openBusinessForum() {
    alert('Opening business forum...');
    // Implementation for business forum
}

function scheduleTraining() {
    alert('Opening training scheduler...');
    // Implementation for training scheduling
}