class EnhancedQRScanner {
    constructor() {
        this.scanner = null;
        this.isScanning = false;
        this.cameras = [];
        this.currentCamera = null;
        this.scanHistory = [];
        this.maxHistory = 50;
    }

    async initialize(containerId) {
        try {
            // Request camera permissions
            await this.requestCameraPermission();
            
            // Get available cameras
            this.cameras = await this.getAvailableCameras();
            
            // Setup UI
            this.setupCameraSelection();
            
            return true;
        } catch (error) {
            console.error('QR Scanner initialization failed:', error);
            this.showError('Camera access denied. Please enable camera permissions.');
            return false;
        }
    }

    async requestCameraPermission() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'environment' } 
            });
            
            // Stop the stream immediately after permission check
            stream.getTracks().forEach(track => track.stop());
            
            return true;
        } catch (error) {
            throw new Error('Camera permission denied');
        }
    }

    async getAvailableCameras() {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            return devices
                .filter(device => device.kind === 'videoinput')
                .map((device, index) => ({
                    id: device.deviceId,
                    label: device.label || `Camera ${index + 1}`,
                    facingMode: this.detectFacingMode(device)
                }));
        } catch (error) {
            console.error('Error getting cameras:', error);
            return [];
        }
    }

    detectFacingMode(device) {
        if (device.label.toLowerCase().includes('back')) return 'environment';
        if (device.label.toLowerCase().includes('front')) return 'user';
        return 'environment'; // Default assumption
    }

    setupCameraSelection() {
        const selectElement = document.getElementById('cameraSelect');
        if (!selectElement) return;

        selectElement.innerHTML = '';
        
        this.cameras.forEach((camera, index) => {
            const option = document.createElement('option');
            option.value = camera.id;
            option.textContent = camera.label || `Camera ${index + 1}`;
            
            // Prefer back camera
            if (camera.facingMode === 'environment') {
                selectElement.prepend(option);
            } else {
                selectElement.appendChild(option);
            }
        });

        if (this.cameras.length > 0) {
            this.currentCamera = this.cameras[0].id;
            selectElement.value = this.currentCamera;
        }

        // Add event listener for camera switching
        selectElement.addEventListener('change', (e) => {
            this.currentCamera = e.target.value;
            if (this.isScanning) {
                this.restartWithCamera(this.currentCamera);
            }
        });
    }

    async startScanning(containerId, onSuccess, onError) {
        if (this.isScanning) {
            console.warn('Scanner is already running');
            return;
        }

        try {
            if (!this.currentCamera && this.cameras.length > 0) {
                this.currentCamera = this.cameras[0].id;
            }

            // Initialize scanner
            this.scanner = new Html5Qrcode(containerId);
            
            const config = {
                fps: 10,
                qrbox: { width: 250, height: 250 },
                aspectRatio: 1.0,
                disableFlip: false
            };

            // Start scanning
            await this.scanner.start(
                this.currentCamera,
                config,
                (decodedText) => {
                    this.handleSuccessfulScan(decodedText, onSuccess);
                },
                (errorMessage) => {
                    // Ignore common error messages
                    if (!errorMessage.includes('NotFoundException')) {
                        console.log('Scan error:', errorMessage);
                    }
                }
            );

            this.isScanning = true;
            this.updateUIState(true);
            this.showMessage('Scanner started. Point at QR code.', 'info');
            
        } catch (error) {
            console.error('Failed to start scanner:', error);
            onError?.(error.message || 'Failed to start scanner');
            this.showError('Failed to start scanner. Please try again.');
        }
    }

    async stopScanning() {
        if (!this.scanner || !this.isScanning) {
            return;
        }

        try {
            await this.scanner.stop();
            this.isScanning = false;
            this.updateUIState(false);
            this.showMessage('Scanner stopped', 'info');
        } catch (error) {
            console.error('Error stopping scanner:', error);
        }
    }

    async restartWithCamera(cameraId) {
        await this.stopScanning();
        this.currentCamera = cameraId;
        
        // Small delay to ensure scanner is properly stopped
        setTimeout(() => {
            this.startScanning('qrReader');
        }, 500);
    }

    handleSuccessfulScan(decodedText, onSuccess) {
        try {
            // Prevent duplicate scans within 3 seconds
            const now = Date.now();
            const recentScan = this.scanHistory.find(
                scan => scan.text === decodedText && 
                (now - scan.timestamp) < 3000
            );
            
            if (recentScan) {
                console.log('Duplicate scan prevented');
                return;
            }

            // Parse QR data
            let qrData;
            try {
                qrData = JSON.parse(decodedText);
            } catch {
                qrData = { storeId: decodedText };
            }

            // Validate QR data
            if (!qrData.storeId) {
                throw new Error('Invalid QR code format');
            }

            // Add to history
            this.scanHistory.push({
                text: decodedText,
                timestamp: now,
                data: qrData
            });

            // Keep history size manageable
            if (this.scanHistory.length > this.maxHistory) {
                this.scanHistory.shift();
            }

            // Play success sound
            this.playSuccessSound();

            // Show visual feedback
            this.showScanSuccess();

            // Call success callback
            onSuccess?.(qrData);

            // Auto-stop after successful scan (optional)
            setTimeout(() => this.stopScanning(), 2000);

        } catch (error) {
            console.error('Error processing scan:', error);
            this.showError('Invalid QR code. Please try again.');
        }
    }

    playSuccessSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(1200, audioContext.currentTime + 0.1);
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
            
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.2);
        } catch (error) {
            // Fallback: Simple beep using Web Audio API if available
            console.log('Could not play success sound');
        }
    }

    showScanSuccess() {
        const scannerContainer = document.getElementById('qrReader');
        if (!scannerContainer) return;

        // Add success animation
        scannerContainer.classList.add('scan-success');
        
        // Remove after animation completes
        setTimeout(() => {
            scannerContainer.classList.remove('scan-success');
        }, 1000);
    }

    updateUIState(isScanning) {
        const startBtn = document.getElementById('startScanner');
        const stopBtn = document.getElementById('stopScanner');
        const cameraSelect = document.getElementById('cameraSelect');

        if (startBtn) startBtn.disabled = isScanning;
        if (stopBtn) stopBtn.disabled = !isScanning;
        if (cameraSelect) cameraSelect.disabled = isScanning;
    }

    showMessage(message, type = 'info') {
        const statusElement = document.getElementById('scanStatus');
        if (!statusElement) return;

        const messageElement = statusElement.querySelector('.status-message') || 
                              document.createElement('div');
        
        messageElement.className = `status-message status-${type}`;
        messageElement.textContent = message;
        
        if (!statusElement.contains(messageElement)) {
            statusElement.appendChild(messageElement);
        }

        // Auto-hide info messages after 3 seconds
        if (type === 'info') {
            setTimeout(() => {
                messageElement.style.opacity = '0';
                setTimeout(() => {
                    if (messageElement.parentNode) {
                        messageElement.remove();
                    }
                }, 300);
            }, 3000);
        }
    }

    showError(errorMessage) {
        this.showMessage(errorMessage, 'error');
    }

    // Advanced features
    async scanFromFile(file) {
        return new Promise((resolve, reject) => {
            if (!this.scanner) {
                reject('Scanner not initialized');
                return;
            }

            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const imageUrl = e.target.result;
                    const decodedText = await this.scanner.scanFile(imageUrl, false);
                    resolve(decodedText);
                } catch (error) {
                    reject('Could not read QR code from image');
                }
            };
            reader.readAsDataURL(file);
        });
    }

    getScanStats() {
        const now = Date.now();
        const lastHour = this.scanHistory.filter(
            scan => (now - scan.timestamp) < 3600000
        );
        const lastDay = this.scanHistory.filter(
            scan => (now - scan.timestamp) < 86400000
        );

        return {
            totalScans: this.scanHistory.length,
            scansLastHour: lastHour.length,
            scansLastDay: lastDay.length,
            lastScan: this.scanHistory.length > 0 ? 
                new Date(this.scanHistory[this.scanHistory.length - 1].timestamp) : 
                null
        };
    }

    clearHistory() {
        this.scanHistory = [];
    }

    // Cleanup
    destroy() {
        this.stopScanning();
        this.scanner = null;
        this.cameras = [];
        this.currentCamera = null;
        this.scanHistory = [];
    }
}

// Export singleton instance
const enhancedQRScanner = new EnhancedQRScanner();
window.enhancedQRScanner = enhancedQRScanner;