/* =====================================================
   CRITICAL CASE COMMAND CENTER - Real-time Module
   Real-time updates, WebSocket simulation, and live data
   ===================================================== */

class RealTimeManager {
    constructor() {
        this.tickerIndex = 0;
        this.intervals = {};
    }

    init() {
        this.startClocks();
        this.startTicker();
        this.startStatusCheck();
        this.simulateRealTimeUpdates();
    }

    startClocks() {
        const updateClocks = () => {
            const now = new Date();

            // NYC (EST/EDT)
            const nycTime = now.toLocaleTimeString('en-US', {
                timeZone: CONFIG.timeZones.nyc,
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
            });
            document.getElementById('tz-nyc').textContent = nycTime;

            // London (GMT/BST)
            const ldnTime = now.toLocaleTimeString('en-US', {
                timeZone: CONFIG.timeZones.ldn,
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
            });
            document.getElementById('tz-ldn').textContent = ldnTime;

            // Tokyo (JST)
            const tyoTime = now.toLocaleTimeString('en-US', {
                timeZone: CONFIG.timeZones.tyo,
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
            });
            document.getElementById('tz-tyo').textContent = tyoTime;

            // UTC
            const utcTime = now.toLocaleTimeString('en-US', {
                timeZone: CONFIG.timeZones.utc,
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
            });
            document.getElementById('tz-utc').textContent = utcTime;
        };

        updateClocks();
        this.intervals.clocks = setInterval(updateClocks, CONFIG.intervals.clock);
    }

    startTicker() {
        const tickerText = document.getElementById('ticker-text');
        if (!tickerText) return;

        // Create ticker content (duplicate for seamless scrolling)
        const items = DATA.ticker.map(text => 
            `<span>${text} <span class="separator">★</span></span>`
        ).join('');

        tickerText.innerHTML = items + items;

        // Update ticker periodically with new items
        this.intervals.ticker = setInterval(() => {
            this.addTickerItem();
        }, CONFIG.intervals.ticker);
    }

    addTickerItem() {
        const newItems = [
            'BREAKING: Markets show volatility amid global uncertainty',
            'UPDATE: Central banks coordinate response to liquidity concerns',
            'ALERT: Cybersecurity threat level remains elevated',
            'NOTICE: Regulatory compliance deadline approaching',
            'INFO: System maintenance scheduled for this weekend',
        ];

        const randomItem = newItems[Math.floor(Math.random() * newItems.length)];
        
        // Could update ticker here if needed
        console.log('Ticker update:', randomItem);
    }

    startStatusCheck() {
        const checkStatus = () => {
            // Simulate status check
            const statuses = ['live', 'degraded', 'critical'];
            const weights = [0.9, 0.08, 0.02]; // 90% live, 8% degraded, 2% critical
            
            const random = Math.random();
            let status = 'live';
            let cumulative = 0;
            
            for (let i = 0; i < statuses.length; i++) {
                cumulative += weights[i];
                if (random <= cumulative) {
                    status = statuses[i];
                    break;
                }
            }

            this.updateSystemStatus(status);
        };

        this.intervals.status = setInterval(checkStatus, CONFIG.intervals.status);
    }

    updateSystemStatus(status) {
        const statusDot = document.querySelector('.system-status .status-dot');
        const statusText = document.querySelector('.system-status .status-text');
        const systemStatus = document.getElementById('system-status');

        if (!statusDot || !statusText) return;

        statusDot.className = `status-dot ${status}`;
        statusText.textContent = status.toUpperCase();

        // Update container style
        const colors = {
            live: 'var(--accent-green)',
            degraded: 'var(--accent-yellow)',
            critical: 'var(--accent-red)',
        };

        systemStatus.style.borderColor = colors[status];
        statusText.style.color = colors[status];

        // Show toast for non-live status
        if (status !== 'live') {
            Toast.show({
                type: status === 'critical' ? 'error' : 'warning',
                title: 'System Status',
                message: `System status changed to ${status.toUpperCase()}`,
            });
        }
    }

    simulateRealTimeUpdates() {
        const online = window.API_ONLINE;

        if (online) {
            // Live mode: poll the backend so ingested incidents (ServiceNow /
            // monitoring / manual) appear in the Wire feed without a reload.
            this.intervals.liveSync = setInterval(() => this.syncFromBackend(), 15000);
        } else {
            // Offline demo mode: fabricate incidents so the feed still moves.
            this.intervals.incidents = setInterval(() => {
                if (Math.random() < 0.1) {
                    this.addNewIncident();
                }
            }, 30000);
        }

        // Simulate marker updates (ambiance in both modes)
        this.intervals.markers = setInterval(() => {
            this.updateRandomMarker();
        }, 45000);

        // Simulate chat messages
        this.intervals.chat = setInterval(() => {
            if (Math.random() < 0.3) { // 30% chance
                this.addChatMessage();
            }
        }, 20000);
    }

    async syncFromBackend() {
        if (!window.Api || !window.Api.online) return;
        try {
            const incidents = await window.Api.getIncidents();
            const prevCount = (window.DATA.incidents || []).length;
            window.DATA.incidents = incidents;
            panelManager.populateWireFeed();
            this.updateWireStats();

            // Refresh the communications panel if it is open
            const commsPanel = document.getElementById('comms-panel');
            if (commsPanel && commsPanel.style.display !== 'none') {
                panelManager.populateComms();
            }

            if (incidents.length > prevCount) {
                Toast.show({
                    type: 'info',
                    title: 'Live Update',
                    message: `${incidents.length - prevCount} new incident(s) ingested`,
                });
            }
        } catch (e) {
            // transient; ignore
        }
    }

    addNewIncident() {
        const newIncident = {
            id: `INC-${Date.now()}`,
            title: this.generateIncidentTitle(),
            location: this.getRandomLocation(),
            severity: this.getRandomSeverity(),
            region: this.getRandomRegion(),
            time: 'Just now',
            description: 'New incident detected and being investigated...',
            tags: ['NEW', 'MONITORING'],
        };

        DATA.incidents.unshift(newIncident);
        panelManager.populateWireFeed();

        // Update stats
        this.updateWireStats();

        // Show notification
        if (newIncident.severity === 'critical' || newIncident.severity === 'high') {
            Toast.show({
                type: 'warning',
                title: `New ${newIncident.severity.toUpperCase()} Incident`,
                message: newIncident.title,
            });
        }

        // Flash the wire panel
        const wirePanel = document.getElementById('wire-panel');
        wirePanel?.classList.add('flash');
        setTimeout(() => wirePanel?.classList.remove('flash'), 500);
    }

    generateIncidentTitle() {
        const titles = [
            'Network latency spike detected',
            'Unusual trading activity observed',
            'Authentication service degradation',
            'Database connection pool exhaustion',
            'API rate limiting triggered',
            'Payment gateway timeout',
            'Security alert: anomalous access pattern',
            'Infrastructure: disk space warning',
        ];
        return titles[Math.floor(Math.random() * titles.length)];
    }

    getRandomLocation() {
        const locations = [
            'New York, USA', 'London, UK', 'Tokyo, Japan', 'Singapore',
            'Frankfurt, Germany', 'Hong Kong', 'Sydney, Australia', 'Mumbai, India',
        ];
        return locations[Math.floor(Math.random() * locations.length)];
    }

    getRandomSeverity() {
        const severities = ['low', 'low', 'elevated', 'elevated', 'high', 'critical'];
        return severities[Math.floor(Math.random() * severities.length)];
    }

    getRandomRegion() {
        const regions = ['americas', 'emea', 'apac'];
        return regions[Math.floor(Math.random() * regions.length)];
    }

    updateWireStats() {
        const critical = DATA.incidents.filter(i => i.severity === 'critical').length;
        const high = DATA.incidents.filter(i => i.severity === 'high').length;
        const elevated = DATA.incidents.filter(i => i.severity === 'elevated').length;

        document.getElementById('wire-critical').textContent = critical;
        document.getElementById('wire-high').textContent = high;
        document.getElementById('wire-elevated').textContent = elevated;
    }

    updateRandomMarker() {
        const randomIndex = Math.floor(Math.random() * DATA.banks.length);
        const bank = DATA.banks[randomIndex];
        
        // Randomly change incident count
        const change = Math.random() < 0.5 ? 1 : -1;
        bank.incidents = Math.max(0, bank.incidents + change);

        // Update severity based on incidents
        if (bank.incidents >= 6) bank.severity = 'critical';
        else if (bank.incidents >= 4) bank.severity = 'high';
        else if (bank.incidents >= 2) bank.severity = 'elevated';
        else bank.severity = 'low';

        // Refresh markers
        worldMap.refreshMarkers();
    }

    addChatMessage() {
        const messages = [
            'Anyone monitoring the EMEA situation?',
            'Heads up team, new alert coming through',
            'Confirmed - escalating to L2',
            'Status update: incident contained',
            'Standby for briefing',
            'Roger that, monitoring',
            'All clear on APAC front',
            'Shift handover complete',
        ];

        const username = `Anon_${Math.floor(Math.random() * 900000) + 100000}`;
        const message = messages[Math.floor(Math.random() * messages.length)];

        const chatMessages = document.getElementById('chat-messages');
        if (!chatMessages) return;

        chatMessages.innerHTML += `
            <div class="chat-message">
                <div class="chat-message-header">
                    <span class="chat-username">${username}</span>
                    <span class="chat-timestamp">now</span>
                </div>
                <div class="chat-message-content">${message}</div>
            </div>
        `;

        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Update online count
        const onlineCount = document.getElementById('chat-online');
        if (onlineCount) {
            const current = parseInt(onlineCount.textContent) || 42;
            onlineCount.textContent = `${current + Math.floor(Math.random() * 3) - 1} in chat`;
        }
    }

    // DEFCON Level Management
    updateDefconLevel(level) {
        const defconLevel = document.getElementById('defcon-level');
        const defconIndicator = document.getElementById('defcon-indicator');
        
        if (!defconLevel || !defconIndicator) return;

        const config = CONFIG.defcon[level];
        if (!config) return;

        defconLevel.textContent = level;
        defconLevel.style.color = config.color;
        defconLevel.style.textShadow = `0 0 30px ${config.color}`;
        
        defconIndicator.style.borderColor = config.color;
        
        const statusEl = defconIndicator.querySelector('.defcon-status');
        if (statusEl) {
            statusEl.textContent = config.label;
            statusEl.style.color = config.color;
        }
    }

    // Clean up
    destroy() {
        Object.values(this.intervals).forEach(interval => clearInterval(interval));
    }
}

// Toast Notification System
class ToastManager {
    constructor() {
        this.container = document.getElementById('toast-container');
    }

    show({ type = 'info', title, message, duration = CONFIG.toast.duration }) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle',
        };

        toast.innerHTML = `
            <div class="toast-icon">
                <i class="${icons[type]}"></i>
            </div>
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                ${message ? `<div class="toast-message">${message}</div>` : ''}
            </div>
            <button class="toast-close">
                <i class="fas fa-times"></i>
            </button>
        `;

        this.container.appendChild(toast);

        // Close button
        toast.querySelector('.toast-close').addEventListener('click', () => {
            this.dismiss(toast);
        });

        // Auto dismiss
        setTimeout(() => this.dismiss(toast), duration);

        return toast;
    }

    dismiss(toast) {
        toast.classList.add('removing');
        setTimeout(() => toast.remove(), 300);
    }
}

// Initialize managers
const realTimeManager = new RealTimeManager();
const Toast = new ToastManager();
