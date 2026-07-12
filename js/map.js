/* =====================================================
   CRITICAL CASE COMMAND CENTER - Map Module
   Interactive World Map with Markers
   ===================================================== */

class WorldMap {
    constructor() {
        this.map = null;
        this.markersLayer = null;
        this.markers = [];
        this.selectedBank = null;
    }

    init() {
        this.createMap();
        this.addTileLayer();
        this.createMarkerCluster();
        this.addBankMarkers();
        this.setupControls();
        this.setupEventListeners();
    }

    createMap() {
        this.map = L.map('world-map', {
            center: CONFIG.map.center,
            zoom: CONFIG.map.zoom,
            minZoom: CONFIG.map.minZoom,
            maxZoom: CONFIG.map.maxZoom,
            zoomControl: false,
            attributionControl: false,
        });
    }

    addTileLayer() {
        L.tileLayer(CONFIG.map.tileUrl, {
            attribution: CONFIG.map.tileAttribution,
            subdomains: 'abcd',
            maxZoom: CONFIG.map.maxZoom,
        }).addTo(this.map);
    }

    createMarkerCluster() {
        this.markersLayer = L.markerClusterGroup({
            maxClusterRadius: CONFIG.cluster.maxClusterRadius,
            spiderfyOnMaxZoom: CONFIG.cluster.spiderfyOnMaxZoom,
            showCoverageOnHover: CONFIG.cluster.showCoverageOnHover,
            zoomToBoundsOnClick: CONFIG.cluster.zoomToBoundsOnClick,
            disableClusteringAtZoom: CONFIG.cluster.disableClusteringAtZoom,
            iconCreateFunction: (cluster) => this.createClusterIcon(cluster),
        });
        this.map.addLayer(this.markersLayer);
    }

    createClusterIcon(cluster) {
        const childCount = cluster.getChildCount();
        let size = 'small';
        let className = 'small';

        if (childCount >= 50) {
            size = 'large';
            className = 'large';
        } else if (childCount >= 20) {
            size = 'medium';
            className = 'medium';
        }

        const severities = cluster.getAllChildMarkers().map(m => m.options.severity);
        const hasCritical = severities.includes('critical');
        const hasHigh = severities.includes('high');
        
        let color = '#00ff88';
        if (hasCritical) color = '#ff3b3b';
        else if (hasHigh) color = '#ff9500';
        else if (severities.includes('elevated')) color = '#ffd700';

        return L.divIcon({
            html: `<div class="cluster-marker ${className}" style="background: ${color}; box-shadow: 0 0 20px ${color};">${childCount}</div>`,
            className: 'custom-cluster-icon',
            iconSize: L.point(50, 50),
        });
    }

    addBankMarkers() {
        DATA.banks.forEach(bank => {
            const marker = this.createBankMarker(bank);
            this.markers.push({ bank, marker });
            this.markersLayer.addLayer(marker);
        });
    }

    createBankMarker(bank) {
        const icon = L.divIcon({
            className: 'custom-marker-icon',
            html: `
                <div class="bank-marker ${bank.severity}">
                    <div class="bank-marker-inner">${bank.incidents}</div>
                </div>
            `,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
        });

        const marker = L.marker([bank.lat, bank.lng], {
            icon,
            severity: bank.severity,
            bankId: bank.id,
        });

        marker.bindPopup(() => this.createPopupContent(bank), {
            className: 'custom-popup',
            maxWidth: 300,
        });

        marker.on('click', () => this.onMarkerClick(bank));

        return marker;
    }

    createPopupContent(bank) {
        const severityConfig = CONFIG.severity[bank.severity];
        return `
            <div class="map-popup">
                <div class="map-popup-header">
                    <div class="map-popup-icon">
                        <i class="fas fa-university"></i>
                    </div>
                    <div class="map-popup-title">
                        <h4>${bank.name}</h4>
                        <span>${bank.city}, ${bank.country}</span>
                    </div>
                </div>
                <div class="map-popup-stats">
                    <div class="popup-stat">
                        <span class="popup-stat-value" style="color: ${severityConfig.color}">${bank.incidents}</span>
                        <span class="popup-stat-label">Active</span>
                    </div>
                    <div class="popup-stat">
                        <span class="popup-stat-value">12</span>
                        <span class="popup-stat-label">Systems</span>
                    </div>
                    <div class="popup-stat">
                        <span class="popup-stat-value">24/7</span>
                        <span class="popup-stat-label">Coverage</span>
                    </div>
                </div>
                <div class="map-popup-actions">
                    <button class="btn-secondary" onclick="worldMap.viewBankDetails('${bank.id}')">
                        <i class="fas fa-info-circle"></i> Details
                    </button>
                    <button class="btn-primary" onclick="worldMap.createIncident('${bank.id}')">
                        <i class="fas fa-plus"></i> New Incident
                    </button>
                </div>
            </div>
        `;
    }

    onMarkerClick(bank) {
        this.selectedBank = bank;
        // Highlight the bank in the wire feed if applicable
        const wireItems = document.querySelectorAll('.wire-item');
        wireItems.forEach(item => item.classList.remove('selected'));
    }

    viewBankDetails(bankId) {
        const bank = DATA.banks.find(b => b.id === bankId);
        if (!bank) return;

        const popup = document.getElementById('bank-popup');
        const nameEl = document.getElementById('bank-popup-name');
        const incidentsEl = document.getElementById('bank-active-incidents');
        const dependenciesEl = document.getElementById('bank-dependencies');
        const systemsEl = document.getElementById('bank-critical-systems');
        const incidentsList = document.getElementById('bank-incidents-list');

        nameEl.textContent = bank.name;
        incidentsEl.textContent = bank.incidents;
        dependenciesEl.textContent = Math.floor(Math.random() * 15) + 5;
        systemsEl.textContent = Math.floor(Math.random() * 20) + 10;

        // Populate incidents list
        const bankIncidents = DATA.incidents.filter(i => i.region === bank.region).slice(0, 3);
        incidentsList.innerHTML = bankIncidents.map(inc => `
            <div class="bank-incident-item">
                <div class="incident-title">${inc.title}</div>
                <div class="incident-meta">${inc.time} • ${inc.severity.toUpperCase()}</div>
            </div>
        `).join('');

        popup.style.display = 'block';
        this.map.closePopup();
    }

    createIncident(bankId) {
        const bank = DATA.banks.find(b => b.id === bankId);
        if (!bank) return;

        // Pre-fill the event creation form
        document.getElementById('event-region').value = bank.region;
        
        // Open the event creation modal
        document.getElementById('event-modal-overlay').style.display = 'flex';
        document.getElementById('fab-create-event').click();
        this.map.closePopup();
    }

    setupControls() {
        // Zoom In
        document.getElementById('btn-zoom-in')?.addEventListener('click', () => {
            this.map.zoomIn();
        });

        // Zoom Out
        document.getElementById('btn-zoom-out')?.addEventListener('click', () => {
            this.map.zoomOut();
        });

        // Reset View
        document.getElementById('btn-reset')?.addEventListener('click', () => {
            this.map.setView(CONFIG.map.center, CONFIG.map.zoom);
        });

        // Filter
        document.getElementById('btn-filter')?.addEventListener('click', () => {
            this.showFilterPanel();
        });
    }

    setupEventListeners() {
        // Close bank popup
        document.querySelector('.close-popup')?.addEventListener('click', () => {
            document.getElementById('bank-popup').style.display = 'none';
        });

        // Map events
        this.map.on('zoomend', () => {
            this.updateMarkerVisibility();
        });
    }

    updateMarkerVisibility() {
        const zoom = this.map.getZoom();
        // Update marker size based on zoom level
        this.markers.forEach(({ marker }) => {
            const icon = marker.getIcon();
            // Could adjust icon size based on zoom
        });
    }

    showFilterPanel() {
        Toast.show({
            type: 'info',
            title: 'Filter',
            message: 'Filter panel coming soon',
        });
    }

    filterBySeverity(severity) {
        this.markersLayer.clearLayers();
        
        this.markers.forEach(({ bank, marker }) => {
            if (severity === 'all' || bank.severity === severity) {
                this.markersLayer.addLayer(marker);
            }
        });
    }

    filterByRegion(region) {
        this.markersLayer.clearLayers();
        
        this.markers.forEach(({ bank, marker }) => {
            if (region === 'all' || bank.region === region) {
                this.markersLayer.addLayer(marker);
            }
        });

        // Zoom to region
        if (region !== 'all' && CONFIG.regions[region]) {
            this.map.fitBounds(CONFIG.regions[region].bounds);
        }
    }

    focusOnBank(bankId) {
        const bankData = this.markers.find(m => m.bank.id === bankId);
        if (bankData) {
            this.map.setView([bankData.bank.lat, bankData.bank.lng], 12);
            bankData.marker.openPopup();
        }
    }

    refreshMarkers() {
        this.markersLayer.clearLayers();
        this.markers = [];
        this.addBankMarkers();
    }

    // Get statistics
    getStats() {
        const stats = {
            total: DATA.banks.length,
            critical: 0,
            high: 0,
            elevated: 0,
            low: 0,
            byRegion: { americas: 0, emea: 0, apac: 0 },
        };

        DATA.banks.forEach(bank => {
            stats[bank.severity]++;
            stats.byRegion[bank.region]++;
        });

        return stats;
    }
}

// Initialize map
const worldMap = new WorldMap();
