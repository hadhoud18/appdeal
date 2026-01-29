class AdminManagement {
    constructor() {
        this.dataService = window.dataService;
        this.currentlyEditing = null;
        this.init();
    }

    async init() {
        // Load initial data
        await this.loadStores();
        await this.loadRewards();
        this.setupEventListeners();
    }

    async loadStores() {
        const data = this.dataService.getData();
        const storesContainer = document.getElementById('storesManagementContainer');
        
        if (!storesContainer) return;

        if (data.stores.length === 0) {
            storesContainer.innerHTML = `
                <div class="no-data-message">
                    <i class="fas fa-store-slash"></i>
                    <h4>No Stores Found</h4>
                    <p>Add your first store to get started!</p>
                </div>
            `;
            return;
        }

        let html = '<div class="stores-management-grid">';
        
        data.stores.forEach(store => {
            html += `
                <div class="store-management-card" data-store-id="${store.id}">
                    <div class="store-management-header">
                        <h4>${store.name}</h4>
                        <span class="store-status ${store.active ? 'active' : 'inactive'}">
                            ${store.active ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                    
                    <div class="store-management-body">
                        <div class="store-info-item">
                            <i class="fas fa-tag"></i>
                            <span>${store.category}</span>
                        </div>
                        <div class="store-info-item">
                            <i class="fas fa-map-marker-alt"></i>
                            <span>${store.location}</span>
                        </div>
                        <div class="store-info-item">
                            <i class="fas fa-coins"></i>
                            <span>${store.points} points/scan</span>
                        </div>
                        <div class="store-info-item">
                            <i class="fas fa-qrcode"></i>
                            <span>${store.totalScans || 0} total scans</span>
                        </div>
                        
                        <p class="store-description">${store.description}</p>
                    </div>
                    
                    <div class="store-management-actions">
                        <button class="btn btn-small btn-edit-store" data-store-id="${store.id}">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-small btn-delete-store" data-store-id="${store.id}">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                        <button class="btn btn-small btn-toggle-store" data-store-id="${store.id}" 
                                data-active="${store.active}">
                            <i class="fas fa-${store.active ? 'ban' : 'check'}"></i> 
                            ${store.active ? 'Deactivate' : 'Activate'}
                        </button>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        storesContainer.innerHTML = html;
        
        // Add event listeners to the newly created buttons
        this.setupStoreCardListeners();
    }

    async loadRewards() {
        const data = this.dataService.getData();
        const rewardsContainer = document.getElementById('rewardsManagementContainer');
        
        if (!rewardsContainer) return;

        if (data.rewards.length === 0) {
            rewardsContainer.innerHTML = `
                <div class="no-data-message">
                    <i class="fas fa-gift"></i>
                    <h4>No Rewards Found</h4>
                    <p>Add your first reward to get started!</p>
                </div>
            `;
            return;
        }

        let html = '<div class="rewards-management-grid">';
        
        data.rewards.forEach(reward => {
            html += `
                <div class="reward-management-card" data-reward-id="${reward.id}">
                    <div class="reward-management-header">
                        <h4>${reward.name}</h4>
                        <span class="reward-points-badge">
                            <i class="fas fa-coins"></i> ${reward.points}
                        </span>
                    </div>
                    
                    <div class="reward-management-body">
                        <div class="reward-info-item">
                            <i class="fas fa-tag"></i>
                            <span class="reward-type ${reward.type}">${reward.type}</span>
                        </div>
                        
                        <p class="reward-description">${reward.description}</p>
                        
                        <div class="reward-stats">
                            <div class="reward-stat">
                                <i class="fas fa-calendar"></i>
                                <span>Created: ${new Date(reward.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div class="reward-stat">
                                <i class="fas fa-toggle-${reward.active ? 'on' : 'off'}"></i>
                                <span>${reward.active ? 'Active' : 'Inactive'}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="reward-management-actions">
                        <button class="btn btn-small btn-edit-reward" data-reward-id="${reward.id}">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-small btn-delete-reward" data-reward-id="${reward.id}">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                        <button class="btn btn-small btn-toggle-reward" data-reward-id="${reward.id}" 
                                data-active="${reward.active}">
                            <i class="fas fa-${reward.active ? 'ban' : 'check'}"></i> 
                            ${reward.active ? 'Deactivate' : 'Activate'}
                        </button>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        rewardsContainer.innerHTML = html;
        
        // Add event listeners to the newly created buttons
        this.setupRewardCardListeners();
    }

    setupEventListeners() {
        // Store Management
        const addStoreBtn = document.getElementById('addStoreBtn');
        const saveStoreBtn = document.getElementById('saveStoreBtn');
        const cancelStoreBtn = document.getElementById('cancelStoreBtn');

        if (addStoreBtn) {
            addStoreBtn.addEventListener('click', () => this.showStoreForm());
        }

        if (saveStoreBtn) {
            saveStoreBtn.addEventListener('click', () => this.saveStore());
        }

        if (cancelStoreBtn) {
            cancelStoreBtn.addEventListener('click', () => this.cancelStoreEdit());
        }

        // Reward Management
        const addRewardBtn = document.getElementById('addRewardBtn');
        const saveRewardBtn = document.getElementById('saveRewardBtn');
        const cancelRewardBtn = document.getElementById('cancelRewardBtn');

        if (addRewardBtn) {
            addRewardBtn.addEventListener('click', () => this.showRewardForm());
        }

        if (saveRewardBtn) {
            saveRewardBtn.addEventListener('click', () => this.saveReward());
        }

        if (cancelRewardBtn) {
            cancelRewardBtn.addEventListener('click', () => this.cancelRewardEdit());
        }

        // Data Management
        const exportDataBtn = document.getElementById('exportDataBtn');
        const importDataBtn = document.getElementById('importDataBtn');
        const resetDataBtn = document.getElementById('resetDataBtn');

        if (exportDataBtn) {
            exportDataBtn.addEventListener('click', () => this.exportAllData());
        }

        if (importDataBtn) {
            importDataBtn.addEventListener('click', () => this.importData());
        }

        if (resetDataBtn) {
            resetDataBtn.addEventListener('click', () => this.resetToDemoData());
        }
    }

    setupStoreCardListeners() {
        // Edit store buttons
        document.querySelectorAll('.btn-edit-store').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const storeId = e.target.closest('button').dataset.storeId;
                this.editStore(storeId);
            });
        });

        // Delete store buttons
        document.querySelectorAll('.btn-delete-store').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const storeId = e.target.closest('button').dataset.storeId;
                this.deleteStore(storeId);
            });
        });

        // Toggle store activation buttons
        document.querySelectorAll('.btn-toggle-store').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const storeId = e.target.closest('button').dataset.storeId;
                const currentActive = e.target.closest('button').dataset.active === 'true';
                this.toggleStoreActive(storeId, !currentActive);
            });
        });
    }

    setupRewardCardListeners() {
        // Edit reward buttons
        document.querySelectorAll('.btn-edit-reward').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const rewardId = parseInt(e.target.closest('button').dataset.rewardId);
                this.editReward(rewardId);
            });
        });

        // Delete reward buttons
        document.querySelectorAll('.btn-delete-reward').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const rewardId = parseInt(e.target.closest('button').dataset.rewardId);
                this.deleteReward(rewardId);
            });
        });

        // Toggle reward activation buttons
        document.querySelectorAll('.btn-toggle-reward').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const rewardId = parseInt(e.target.closest('button').dataset.rewardId);
                const currentActive = e.target.closest('button').dataset.active === 'true';
                this.toggleRewardActive(rewardId, !currentActive);
            });
        });
    }

    showStoreForm(store = null) {
        const formContainer = document.getElementById('storeFormContainer');
        const storeListContainer = document.getElementById('storesManagementContainer');
        
        if (!formContainer || !storeListContainer) return;

        this.currentlyEditing = store;

        if (store) {
            // Edit existing store
            document.getElementById('storeFormTitle').textContent = 'Edit Store';
            document.getElementById('storeId').value = store.id;
            document.getElementById('storeName').value = store.name;
            document.getElementById('storeCategory').value = store.category;
            document.getElementById('storeLocation').value = store.location;
            document.getElementById('storePoints').value = store.points;
            document.getElementById('storeDescription').value = store.description;
            document.getElementById('storeActive').checked = store.active;
        } else {
            // Add new store
            document.getElementById('storeFormTitle').textContent = 'Add New Store';
            document.getElementById('storeId').value = '';
            document.getElementById('storeName').value = '';
            document.getElementById('storeCategory').value = 'Grocery';
            document.getElementById('storeLocation').value = '';
            document.getElementById('storePoints').value = 50;
            document.getElementById('storeDescription').value = '';
            document.getElementById('storeActive').checked = true;
        }

        storeListContainer.style.display = 'none';
        formContainer.style.display = 'block';
    }

    async saveStore() {
        const storeData = {
            name: document.getElementById('storeName').value,
            category: document.getElementById('storeCategory').value,
            location: document.getElementById('storeLocation').value,
            points: parseInt(document.getElementById('storePoints').value),
            description: document.getElementById('storeDescription').value,
            active: document.getElementById('storeActive').checked
        };

        // Validation
        if (!storeData.name || !storeData.category || !storeData.location) {
            this.showMessage('Please fill in all required fields', 'error');
            return;
        }

        if (storeData.points < 1 || storeData.points > 1000) {
            this.showMessage('Points must be between 1 and 1000', 'error');
            return;
        }

        try {
            let store;
            const storeId = document.getElementById('storeId').value;
            
            if (storeId) {
                // Update existing store
                store = await this.dataService.updateStore(storeId, storeData);
                this.showMessage('Store updated successfully!', 'success');
            } else {
                // Create new store
                store = await this.dataService.createStore(storeData);
                this.showMessage('Store created successfully!', 'success');
            }

            // Reload stores list
            await this.loadStores();
            
            // Hide form and show list
            this.cancelStoreEdit();
            
        } catch (error) {
            console.error('Error saving store:', error);
            this.showMessage('Error saving store: ' + error.message, 'error');
        }
    }

    cancelStoreEdit() {
        const formContainer = document.getElementById('storeFormContainer');
        const storeListContainer = document.getElementById('storesManagementContainer');
        
        if (formContainer && storeListContainer) {
            formContainer.style.display = 'none';
            storeListContainer.style.display = 'block';
            this.currentlyEditing = null;
        }
    }

    async editStore(storeId) {
        const data = this.dataService.getData();
        const store = data.stores.find(s => s.id === storeId);
        
        if (store) {
            this.showStoreForm(store);
        }
    }

    async deleteStore(storeId) {
        if (!confirm('Are you sure you want to delete this store? This action cannot be undone.')) {
            return;
        }

        try {
            await this.dataService.deleteStore(storeId);
            this.showMessage('Store deleted successfully!', 'success');
            await this.loadStores();
        } catch (error) {
            console.error('Error deleting store:', error);
            this.showMessage('Error deleting store: ' + error.message, 'error');
        }
    }

    async toggleStoreActive(storeId, active) {
        try {
            await this.dataService.updateStore(storeId, { active });
            this.showMessage(`Store ${active ? 'activated' : 'deactivated'} successfully!`, 'success');
            await this.loadStores();
        } catch (error) {
            console.error('Error toggling store active:', error);
            this.showMessage('Error updating store: ' + error.message, 'error');
        }
    }

    showRewardForm(reward = null) {
        const formContainer = document.getElementById('rewardFormContainer');
        const rewardListContainer = document.getElementById('rewardsManagementContainer');
        
        if (!formContainer || !rewardListContainer) return;

        this.currentlyEditing = reward;

        if (reward) {
            // Edit existing reward
            document.getElementById('rewardFormTitle').textContent = 'Edit Reward';
            document.getElementById('rewardId').value = reward.id;
            document.getElementById('rewardName').value = reward.name;
            document.getElementById('rewardType').value = reward.type;
            document.getElementById('rewardPoints').value = reward.points;
            document.getElementById('rewardDescription').value = reward.description;
            document.getElementById('rewardActive').checked = reward.active;
        } else {
            // Add new reward
            document.getElementById('rewardFormTitle').textContent = 'Add New Reward';
            document.getElementById('rewardId').value = '';
            document.getElementById('rewardName').value = '';
            document.getElementById('rewardType').value = 'discount';
            document.getElementById('rewardPoints').value = 100;
            document.getElementById('rewardDescription').value = '';
            document.getElementById('rewardActive').checked = true;
        }

        rewardListContainer.style.display = 'none';
        formContainer.style.display = 'block';
    }

    async saveReward() {
        const rewardData = {
            name: document.getElementById('rewardName').value,
            type: document.getElementById('rewardType').value,
            points: parseInt(document.getElementById('rewardPoints').value),
            description: document.getElementById('rewardDescription').value,
            active: document.getElementById('rewardActive').checked
        };

        // Validation
        if (!rewardData.name || !rewardData.type || !rewardData.description) {
            this.showMessage('Please fill in all required fields', 'error');
            return;
        }

        if (rewardData.points < 1 || rewardData.points > 5000) {
            this.showMessage('Points must be between 1 and 5000', 'error');
            return;
        }

        try {
            let reward;
            const rewardId = parseInt(document.getElementById('rewardId').value);
            
            if (rewardId) {
                // Update existing reward
                reward = await this.dataService.updateReward(rewardId, rewardData);
                this.showMessage('Reward updated successfully!', 'success');
            } else {
                // Create new reward
                reward = await this.dataService.createReward(rewardData);
                this.showMessage('Reward created successfully!', 'success');
            }

            // Reload rewards list
            await this.loadRewards();
            
            // Hide form and show list
            this.cancelRewardEdit();
            
        } catch (error) {
            console.error('Error saving reward:', error);
            this.showMessage('Error saving reward: ' + error.message, 'error');
        }
    }

    cancelRewardEdit() {
        const formContainer = document.getElementById('rewardFormContainer');
        const rewardListContainer = document.getElementById('rewardsManagementContainer');
        
        if (formContainer && rewardListContainer) {
            formContainer.style.display = 'none';
            rewardListContainer.style.display = 'block';
            this.currentlyEditing = null;
        }
    }

    async editReward(rewardId) {
        const data = this.dataService.getData();
        const reward = data.rewards.find(r => r.id === rewardId);
        
        if (reward) {
            this.showRewardForm(reward);
        }
    }

    async deleteReward(rewardId) {
        if (!confirm('Are you sure you want to delete this reward? This action cannot be undone.')) {
            return;
        }

        try {
            const data = this.dataService.getData();
            data.rewards = data.rewards.filter(r => r.id !== rewardId);
            this.dataService.saveData(data);
            
            this.showMessage('Reward deleted successfully!', 'success');
            await this.loadRewards();
        } catch (error) {
            console.error('Error deleting reward:', error);
            this.showMessage('Error deleting reward: ' + error.message, 'error');
        }
    }

    async toggleRewardActive(rewardId, active) {
        try {
            const data = this.dataService.getData();
            const rewardIndex = data.rewards.findIndex(r => r.id === rewardId);
            
            if (rewardIndex !== -1) {
                data.rewards[rewardIndex].active = active;
                this.dataService.saveData(data);
                
                this.showMessage(`Reward ${active ? 'activated' : 'deactivated'} successfully!`, 'success');
                await this.loadRewards();
            }
        } catch (error) {
            console.error('Error toggling reward active:', error);
            this.showMessage('Error updating reward: ' + error.message, 'error');
        }
    }

    exportAllData() {
        const data = this.dataService.exportData();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `ottawa-points-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showMessage('Data exported successfully!', 'success');
    }

    importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const success = this.dataService.importData(e.target.result);
                    
                    if (success) {
                        this.showMessage('Data imported successfully!', 'success');
                        await this.loadStores();
                        await this.loadRewards();
                    } else {
                        this.showMessage('Error importing data. Invalid format.', 'error');
                    }
                } catch (error) {
                    console.error('Error importing data:', error);
                    this.showMessage('Error importing data: ' + error.message, 'error');
                }
            };
            reader.readAsText(file);
        };
        
        input.click();
    }

    async resetToDemoData() {
        if (!confirm('Are you sure you want to reset all data to demo state? This will delete all current data.')) {
            return;
        }

        try {
            this.dataService.resetToDemoData();
            this.showMessage('Data reset to demo state successfully!', 'success');
            await this.loadStores();
            await this.loadRewards();
        } catch (error) {
            console.error('Error resetting data:', error);
            this.showMessage('Error resetting data: ' + error.message, 'error');
        }
    }

    showMessage(message, type = 'info') {
        // Create or update message element
        let messageElement = document.getElementById('adminMessage');
        
        if (!messageElement) {
            messageElement = document.createElement('div');
            messageElement.id = 'adminMessage';
            messageElement.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 1rem 1.5rem;
                border-radius: var(--border-radius);
                box-shadow: var(--shadow);
                z-index: 9999;
                max-width: 400px;
                display: flex;
                align-items: center;
                gap: 10px;
                animation: slideIn 0.3s ease;
            `;
            document.body.appendChild(messageElement);
        }
        
        messageElement.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        `;
        
        messageElement.className = `message-${type}`;
        messageElement.style.display = 'flex';
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            messageElement.style.display = 'none';
        }, 5000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('admin')) {
        window.adminManagement = new AdminManagement();
    }
});