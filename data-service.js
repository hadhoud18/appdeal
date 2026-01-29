// Data Service Layer - Simulates Backend API
class DataService {
    constructor() {
        this.storageKey = 'ottawaPointsData';
        this.initDataStructure();
    }

    initDataStructure() {
        const defaultData = {
            users: [],
            stores: [],
            rewards: [],
            transactions: [],
            adminStats: {
                totalScans: 0,
                uniqueUsers: 0,
                pointsGiven: 0,
                todayScans: 0
            },
            settings: {
                pointsPerScan: 50,
                qrExpiryDays: 30
            },
            lastUpdated: new Date().toISOString()
        };

        if (!localStorage.getItem(this.storageKey)) {
            localStorage.setItem(this.storageKey, JSON.stringify(defaultData));
        }
    }

    // User Management
    async createUser(userData) {
        const data = this.getData();
        const newUser = {
            id: Date.now(),
            ...userData,
            createdAt: new Date().toISOString(),
            points: 100, // Welcome bonus
            totalStoresVisited: 0,
            totalRewardsEarned: 0,
            memberSince: new Date().getFullYear(),
            userLevel: 'Bronze'
        };
        
        data.users.push(newUser);
        this.saveData(data);
        return newUser;
    }

    async getUserByEmail(email) {
        const data = this.getData();
        return data.users.find(user => user.email === email);
    }

    async updateUser(userId, updates) {
        const data = this.getData();
        const userIndex = data.users.findIndex(user => user.id === userId);
        
        if (userIndex !== -1) {
            data.users[userIndex] = { ...data.users[userIndex], ...updates };
            this.saveData(data);
            return data.users[userIndex];
        }
        return null;
    }

    // Store Management
    async createStore(storeData) {
        const data = this.getData();
        const newStore = {
            id: `store-${Date.now()}`,
            ...storeData,
            qrCode: null,
            qrGeneratedAt: null,
            active: true,
            totalScans: 0
        };
        
        data.stores.push(newStore);
        this.saveData(data);
        return newStore;
    }

    async updateStore(storeId, updates) {
        const data = this.getData();
        const storeIndex = data.stores.findIndex(store => store.id === storeId);
        
        if (storeIndex !== -1) {
            data.stores[storeIndex] = { ...data.stores[storeIndex], ...updates };
            this.saveData(data);
            return data.stores[storeIndex];
        }
        return null;
    }

    async deleteStore(storeId) {
        const data = this.getData();
        data.stores = data.stores.filter(store => store.id !== storeId);
        this.saveData(data);
    }

    // Transaction Management
    async createTransaction(transactionData) {
        const data = this.getData();
        const newTransaction = {
            id: `txn-${Date.now()}`,
            ...transactionData,
            timestamp: new Date().toISOString(),
            status: 'completed'
        };
        
        data.transactions.push(newTransaction);
        
        // Update admin stats
        data.adminStats.totalScans++;
        data.adminStats.pointsGiven += transactionData.points;
        
        // Check if today's scan
        const today = new Date().toISOString().split('T')[0];
        if (newTransaction.timestamp.startsWith(today)) {
            data.adminStats.todayScans++;
        }
        
        // Update unique users count
        const uniqueUserIds = [...new Set(data.transactions.map(t => t.userId))];
        data.adminStats.uniqueUsers = uniqueUserIds.length;
        
        this.saveData(data);
        return newTransaction;
    }

    // Rewards Management
    async createReward(rewardData) {
        const data = this.getData();
        const newReward = {
            id: Date.now(),
            ...rewardData,
            active: true,
            createdAt: new Date().toISOString()
        };
        
        data.rewards.push(newReward);
        this.saveData(data);
        return newReward;
    }

    async redeemReward(userId, rewardId) {
        const data = this.getData();
        const reward = data.rewards.find(r => r.id === rewardId);
        const user = data.users.find(u => u.id === userId);
        
        if (!reward || !user) {
            throw new Error('Reward or user not found');
        }
        
        if (user.points < reward.points) {
            throw new Error('Insufficient points');
        }
        
        // Update user points
        user.points -= reward.points;
        user.totalRewardsEarned++;
        
        // Create redemption transaction
        const redemptionTransaction = {
            id: `redeem-${Date.now()}`,
            userId,
            rewardId,
            rewardName: reward.name,
            points: -reward.points,
            type: 'redeemed',
            status: 'completed'
        };
        
        data.transactions.push(redemptionTransaction);
        this.saveData(data);
        
        return {
            user,
            reward,
            transaction: redemptionTransaction
        };
    }

    // Analytics
    async getAnalytics(period = '7days') {
        const data = this.getData();
        const now = new Date();
        let startDate;
        
        switch(period) {
            case '7days':
                startDate = new Date(now.setDate(now.getDate() - 7));
                break;
            case '30days':
                startDate = new Date(now.setDate(now.getDate() - 30));
                break;
            case '90days':
                startDate = new Date(now.setDate(now.getDate() - 90));
                break;
            default:
                startDate = new Date(0);
        }
        
        const filteredTransactions = data.transactions.filter(t => 
            new Date(t.timestamp) >= startDate
        );
        
        // Group by day
        const dailyData = {};
        filteredTransactions.forEach(t => {
            const date = t.timestamp.split('T')[0];
            if (!dailyData[date]) {
                dailyData[date] = { scans: 0, points: 0 };
            }
            dailyData[date].scans++;
            dailyData[date].points += Math.abs(t.points);
        });
        
        return {
            summary: {
                totalScans: filteredTransactions.length,
                totalPoints: filteredTransactions.reduce((sum, t) => sum + Math.abs(t.points), 0),
                uniqueUsers: [...new Set(filteredTransactions.map(t => t.userId))].length
            },
            dailyData,
            recentTransactions: filteredTransactions.slice(-10).reverse()
        };
    }

    // Helper methods
    getData() {
        const data = localStorage.getItem(this.storageKey);
        return data ? JSON.parse(data) : {};
    }

    saveData(data) {
        data.lastUpdated = new Date().toISOString();
        localStorage.setItem(this.storageKey, JSON.stringify(data));
    }

    // Export/Import
    exportData() {
        return JSON.stringify(this.getData(), null, 2);
    }

    importData(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            localStorage.setItem(this.storageKey, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    }

    // Reset to demo data
    resetToDemoData() {
        const demoData = {
            users: [
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
                    memberSince: '2024',
                    userLevel: 'Silver',
                    isAdmin: false,
                    createdAt: '2024-01-15T10:00:00Z'
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
                    memberSince: '2024',
                    userLevel: 'Gold',
                    isAdmin: true,
                    createdAt: '2024-01-10T09:00:00Z'
                }
            ],
            stores: [
                { 
                    id: 'store-001', 
                    name: 'Aladdin Bakery', 
                    category: 'Bakery', 
                    location: 'Bank Street',
                    points: 15,
                    description: 'Fresh Arabic bread and pastries',
                    qrCode: null,
                    qrGeneratedAt: null,
                    active: true,
                    totalScans: 0
                },
                { 
                    id: 'store-002', 
                    name: 'Damascus Restaurant', 
                    category: 'Restaurant', 
                    location: 'Downtown',
                    points: 25,
                    description: 'Authentic Syrian cuisine',
                    qrCode: null,
                    qrGeneratedAt: null,
                    active: true,
                    totalScans: 0
                }
            ],
            rewards: [
                { 
                    id: 1, 
                    name: '10% Store Discount', 
                    points: 100, 
                    type: 'discount',
                    description: 'Get 10% off your next purchase',
                    active: true
                },
                { 
                    id: 2, 
                    name: 'Free Baklava', 
                    points: 150, 
                    type: 'food',
                    description: 'Complimentary baklava dessert',
                    active: true
                }
            ],
            transactions: [
                { 
                    id: 'txn-001', 
                    userId: 1, 
                    storeId: 'store-001', 
                    storeName: 'Aladdin Bakery',
                    points: 15, 
                    type: 'earned', 
                    timestamp: '2024-01-28T10:30:00Z', 
                    status: 'completed' 
                }
            ],
            adminStats: {
                totalScans: 1,
                uniqueUsers: 1,
                pointsGiven: 15,
                todayScans: 0
            },
            settings: {
                pointsPerScan: 50,
                qrExpiryDays: 30
            },
            lastUpdated: new Date().toISOString()
        };
        
        localStorage.setItem(this.storageKey, JSON.stringify(demoData));
    }
}

// Export singleton instance
const dataService = new DataService();
window.dataService = dataService;