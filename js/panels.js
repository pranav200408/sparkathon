/* =====================================================
   CRITICAL CASE COMMAND CENTER - Panels Module
   Floating Panels and Sidebars
   ===================================================== */

class PanelManager {
    constructor() {
        this.activePanels = new Map();
        this.draggedPanel = null;
        this.dragOffset = { x: 0, y: 0 };
    }

    init() {
        this.setupSidebarButtons();
        this.setupPanelDragging();
        this.setupPanelControls();
        this.populateWireFeed();
        this.populateChatMessages();
        this.populateOutbreaks();
        this.populateAvailablePanel();
        this.setupCommsPanel();
    }

    setupCommsPanel() {
        document.getElementById('comms-refresh')?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.populateComms();
        });
    }

    setupSidebarButtons() {
        const sidebarBtns = document.querySelectorAll('.sidebar-btn');
        
        sidebarBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const panelId = btn.dataset.panel;
                this.togglePanel(panelId, btn);
            });
        });
    }

    togglePanel(panelId, btn) {
        const panelElement = document.getElementById(`${panelId}-panel`);
        
        if (!panelElement) {
            // Special panels that don't have floating versions
            this.handleSpecialPanel(panelId, btn);
            return;
        }

        const isVisible = panelElement.style.display !== 'none';
        
        if (isVisible) {
            this.hidePanel(panelId);
            btn?.classList.remove('active');
        } else {
            this.showPanel(panelId);
            btn?.classList.add('active');
        }
    }

    handleSpecialPanel(panelId, btn) {
        // Toggle active state for sidebar buttons without floating panels
        const sidebarBtns = document.querySelectorAll('.sidebar-btn');
        sidebarBtns.forEach(b => {
            if (b !== btn) b.classList.remove('active');
        });
        btn.classList.toggle('active');

        // Handle available panel specially - it has a floating panel
        if (panelId === 'available') {
            this.populateAvailablePanel();
            return;
        }

        // Show toast for panels under development
        if (['teams', 'predictions', 'templates', 'escalation'].includes(panelId)) {
            const panelNames = {
                'teams': 'Teams',
                'predictions': 'Predictions',
                'templates': 'Templates',
                'escalation': 'Escalation Matrix'
            };
            Toast.show({
                type: 'info',
                title: panelNames[panelId] || panelId.toUpperCase(),
                message: 'This module is coming soon',
            });
        }
    }

    populateAvailablePanel() {
        const availableList = document.getElementById('available-list');
        if (!availableList) return;

        // Update stats
        const availableCount = DATA.resources.filter(r => r.status === 'available').length;
        const busyCount = DATA.resources.filter(r => r.status === 'busy').length;
        const offlineCount = DATA.resources.filter(r => r.status === 'offline').length;

        document.getElementById('available-online').textContent = availableCount;
        document.getElementById('available-busy').textContent = busyCount;
        document.getElementById('available-offline').textContent = offlineCount;

        // Populate list - show available first
        const sortedResources = [...DATA.resources].sort((a, b) => {
            const order = { 'available': 0, 'busy': 1, 'offline': 2 };
            return order[a.status] - order[b.status];
        });

        availableList.innerHTML = sortedResources.map(resource => `
            <div class="available-item" data-id="${resource.id}">
                <div class="resource-avatar">${resource.initials}</div>
                <div class="resource-info">
                    <span class="resource-name">${resource.name}</span>
                    <span class="resource-role">${resource.role} • ${resource.region.toUpperCase()}</span>
                </div>
                <span class="resource-status ${resource.status}">${resource.status.toUpperCase()}</span>
            </div>
        `).join('');

        // Setup filters
        this.setupAvailableFilters();
    }

    setupAvailableFilters() {
        const regionFilter = document.getElementById('available-region-filter');
        const roleFilter = document.getElementById('available-role-filter');

        const filterAvailable = () => {
            const region = regionFilter?.value || 'all';
            const role = roleFilter?.value || 'all';
            const items = document.querySelectorAll('.available-item');

            items.forEach(item => {
                const resource = DATA.resources.find(r => r.id === item.dataset.id);
                if (!resource) return;

                const matchRegion = region === 'all' || resource.region === region;
                const matchRole = role === 'all' || resource.role.toLowerCase().includes(role.replace('-', ' '));

                item.style.display = matchRegion && matchRole ? '' : 'none';
            });
        };

        regionFilter?.addEventListener('change', filterAvailable);
        roleFilter?.addEventListener('change', filterAvailable);
    }

    showPanel(panelId) {
        const panel = document.getElementById(`${panelId}-panel`);
        if (!panel) return;

        // Refresh dynamic panels each time they are opened
        if (panelId === 'comms') this.populateComms();

        panel.style.display = 'flex';
        this.activePanels.set(panelId, panel);

        // Animate in
        panel.style.opacity = '0';
        panel.style.transform = 'scale(0.95)';
        
        requestAnimationFrame(() => {
            panel.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            panel.style.opacity = '1';
            panel.style.transform = 'scale(1)';
        });
    }

    hidePanel(panelId) {
        const panel = document.getElementById(`${panelId}-panel`);
        if (!panel) return;

        panel.style.opacity = '0';
        panel.style.transform = 'scale(0.95)';
        
        setTimeout(() => {
            panel.style.display = 'none';
            this.activePanels.delete(panelId);
        }, CONFIG.animation.normal);
    }

    setupPanelDragging() {
        const draggableHeaders = document.querySelectorAll('.panel-header.draggable, .draggable');

        draggableHeaders.forEach(header => {
            header.addEventListener('mousedown', (e) => this.startDrag(e));
        });

        document.addEventListener('mousemove', (e) => this.drag(e));
        document.addEventListener('mouseup', () => this.endDrag());
    }

    startDrag(e) {
        const panel = e.target.closest('.floating-panel, .workflow-panel');
        if (!panel) return;

        this.draggedPanel = panel;
        const rect = panel.getBoundingClientRect();
        this.dragOffset = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };

        panel.style.cursor = 'grabbing';
        panel.style.zIndex = '1000';
        panel.style.transition = 'none';
    }

    drag(e) {
        if (!this.draggedPanel) return;

        const x = e.clientX - this.dragOffset.x;
        const y = e.clientY - this.dragOffset.y;

        // Keep panel within viewport
        const maxX = window.innerWidth - this.draggedPanel.offsetWidth;
        const maxY = window.innerHeight - this.draggedPanel.offsetHeight;

        this.draggedPanel.style.left = `${Math.max(0, Math.min(x, maxX))}px`;
        this.draggedPanel.style.top = `${Math.max(0, Math.min(y, maxY))}px`;
        this.draggedPanel.style.right = 'auto';
        this.draggedPanel.style.bottom = 'auto';
    }

    endDrag() {
        if (!this.draggedPanel) return;

        this.draggedPanel.style.cursor = '';
        this.draggedPanel.style.transition = '';
        this.draggedPanel = null;
    }

    setupPanelControls() {
        // Close buttons
        document.querySelectorAll('.close-panel').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const panel = e.target.closest('.floating-panel, .workflow-panel');
                if (panel) {
                    const panelId = panel.id.replace('-panel', '');
                    this.hidePanel(panelId);
                    
                    // Update sidebar button state
                    const sidebarBtn = document.querySelector(`.sidebar-btn[data-panel="${panelId}"]`);
                    sidebarBtn?.classList.remove('active');
                }
            });
        });

        // Minimize buttons
        document.querySelectorAll('.panel-btn[title="Minimize"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const panel = e.target.closest('.floating-panel, .workflow-panel');
                if (panel) {
                    const content = panel.querySelector('.panel-content, .chat-messages, .stream-content, .outbreak-list');
                    if (content) {
                        content.style.display = content.style.display === 'none' ? '' : 'none';
                    }
                }
            });
        });

        // Maximize buttons
        document.querySelectorAll('.panel-btn[title="Maximize"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const panel = e.target.closest('.floating-panel');
                if (panel) {
                    panel.classList.toggle('maximized');
                    if (panel.classList.contains('maximized')) {
                        panel.style.width = '80vw';
                        panel.style.height = '80vh';
                        panel.style.left = '10vw';
                        panel.style.top = '10vh';
                    } else {
                        panel.style.width = '';
                        panel.style.height = '';
                    }
                }
            });
        });
    }

    populateWireFeed() {
        const wireFeed = document.getElementById('wire-feed');
        if (!wireFeed) return;

        // Update stats
        const criticalCount = DATA.incidents.filter(i => i.severity === 'critical').length;
        const highCount = DATA.incidents.filter(i => i.severity === 'high').length;
        const elevatedCount = DATA.incidents.filter(i => i.severity === 'elevated').length;

        document.getElementById('wire-critical').textContent = criticalCount;
        document.getElementById('wire-high').textContent = highCount;
        document.getElementById('wire-elevated').textContent = elevatedCount;

        // Populate items
        wireFeed.innerHTML = DATA.incidents.map(incident => `
            <div class="wire-item ${incident.severity}" data-id="${incident.id}">
                <div class="wire-item-header">
                    <span class="wire-item-location">${incident.title}</span>
                    <span class="wire-item-badge ${incident.severity}">${incident.severity.toUpperCase()}${incident.level ? ` +${incident.level}` : ''}</span>
                </div>
                <div class="wire-item-meta">
                    <span><i class="fas fa-map-marker-alt"></i> ${incident.location}</span>
                    <span><i class="fas fa-clock"></i> ${incident.time}</span>
                </div>
                <div class="wire-item-description">${incident.description}</div>
                <div class="wire-item-tags">
                    ${incident.tags.map(tag => `<span class="wire-tag">${tag}</span>`).join('')}
                </div>
            </div>
        `).join('');

        // Add click handlers
        wireFeed.querySelectorAll('.wire-item').forEach(item => {
            item.addEventListener('click', () => {
                this.onWireItemClick(item.dataset.id);
            });
        });
    }

    onWireItemClick(incidentId) {
        const incident = DATA.incidents.find(i => i.id === incidentId);
        if (!incident) return;

        // Find related bank and focus on map
        const relatedBank = DATA.banks.find(b => b.region === incident.region);
        if (relatedBank) {
            worldMap.focusOnBank(relatedBank.id);
        }

        Toast.show({
            type: 'info',
            title: 'Incident Selected',
            message: incident.title,
        });
    }

    populateChatMessages() {
        const chatMessages = document.getElementById('chat-messages');
        if (!chatMessages) return;

        // Add system message
        chatMessages.innerHTML = `
            <div class="chat-system-message">
                <i class="fas fa-info-circle"></i>
                You're in #lobby. Sign in to access #general, #markets, #crypto, #incidents, secure your unique username and rank up.
            </div>
        `;

        // Add user messages
        DATA.chat.forEach(msg => {
            chatMessages.innerHTML += `
                <div class="chat-message">
                    <div class="chat-message-header">
                        <span class="chat-username">${msg.username}</span>
                        ${msg.isVerified ? '<i class="fas fa-star" style="color: var(--accent-yellow);"></i>' : ''}
                        <span class="chat-timestamp">${msg.time}</span>
                    </div>
                    <div class="chat-message-content">${msg.message}</div>
                </div>
            `;
        });

        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Setup chat input
        this.setupChatInput();
    }

    setupChatInput() {
        const chatInput = document.getElementById('chat-input');
        const chatSend = document.getElementById('chat-send');

        if (!chatInput || !chatSend) return;

        const sendMessage = () => {
            const message = chatInput.value.trim();
            if (!message) return;

            const chatMessages = document.getElementById('chat-messages');
            const username = `Anon_${Math.floor(Math.random() * 900000) + 100000}`;

            chatMessages.innerHTML += `
                <div class="chat-message">
                    <div class="chat-message-header">
                        <span class="chat-username">${username}</span>
                        <span class="chat-timestamp">now</span>
                    </div>
                    <div class="chat-message-content">${message}</div>
                </div>
            `;

            chatInput.value = '';
            chatMessages.scrollTop = chatMessages.scrollHeight;
        };

        chatSend.addEventListener('click', sendMessage);
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage();
        });
    }

    populateOutbreaks() {
        const outbreakList = document.getElementById('outbreak-list');
        if (!outbreakList) return;

        outbreakList.innerHTML = DATA.outbreaks.map(outbreak => `
            <div class="outbreak-item" data-id="${outbreak.id}">
                <div class="outbreak-item-header">
                    <span class="outbreak-name">
                        <i class="fas fa-virus"></i>
                        ${outbreak.name}
                    </span>
                    <span class="outbreak-time">${outbreak.time}</span>
                </div>
                <div class="outbreak-meta">
                    <span class="outbreak-badge ${outbreak.severity}">${outbreak.severity.toUpperCase()}</span>
                    <span class="outbreak-badge airborne">${outbreak.type}</span>
                    <span class="outbreak-badge airborne">${outbreak.cases} CASES</span>
                    ${outbreak.deaths ? `<span class="outbreak-badge deaths">${outbreak.deaths} DEATHS</span>` : ''}
                    ${outbreak.cfr ? `<span class="outbreak-badge cfr">${outbreak.cfr} CFR</span>` : ''}
                </div>
                <div class="outbreak-description">
                    ${outbreak.location} - ${outbreak.description}
                </div>
            </div>
        `).join('');
    }

    // Panel-specific methods
    showResourcePanel() {
        const panel = document.getElementById('panel-resources');
        if (!panel) return;

        const resourceList = document.getElementById('resource-list');
        resourceList.innerHTML = DATA.resources.map(resource => `
            <div class="resource-item" data-id="${resource.id}">
                <div class="resource-avatar">${resource.initials}</div>
                <div class="resource-info">
                    <span class="resource-name">${resource.name}</span>
                    <span class="resource-role">${resource.role} • ${resource.region.toUpperCase()}</span>
                </div>
                <span class="resource-status ${resource.status}">${resource.status.toUpperCase()}</span>
            </div>
        `).join('');

        // Add click handlers
        resourceList.querySelectorAll('.resource-item').forEach(item => {
            item.addEventListener('click', () => {
                item.classList.toggle('selected');
            });
        });
    }

    filterResources(region, role) {
        const resourceList = document.getElementById('resource-list');
        const items = resourceList.querySelectorAll('.resource-item');

        items.forEach(item => {
            const resource = DATA.resources.find(r => r.id === item.dataset.id);
            if (!resource) return;

            const matchRegion = region === 'all' || resource.region === region;
            const matchRole = role === 'all' || resource.role.toLowerCase().includes(role.replace('-', ' '));

            item.style.display = matchRegion && matchRole ? '' : 'none';
        });
    }

    async populateComms() {
        const list = document.getElementById('comms-feed');
        if (!list) return;

        let comms = [];
        let offline = false;
        try {
            if (window.Api && window.Api.online) {
                comms = await window.Api.getAllCommunications();
            } else {
                offline = true;
            }
        } catch (e) {
            offline = true;
        }

        const sent = comms.filter(c => c.status === 'sent').length;
        const draft = comms.filter(c => c.status === 'draft').length;
        document.getElementById('comms-sent').textContent = sent;
        document.getElementById('comms-draft').textContent = draft;
        document.getElementById('comms-total').textContent = comms.length;

        if (offline) {
            list.innerHTML = `<div class="comms-empty">Backend offline — communications are stored server-side. Start the API to view the audit trail.</div>`;
            return;
        }
        if (comms.length === 0) {
            list.innerHTML = `<div class="comms-empty">No communications yet. Create an event or use "Generate Summary" to draft one.</div>`;
            return;
        }

        list.innerHTML = comms.map(c => {
            const channelIcon = c.channel === 'teams' ? 'fa-users' : 'fa-envelope';
            const when = this.formatTimestamp(c.sent_at || c.created_at);
            return `
            <div class="comms-item ${c.comm_type}">
                <div class="comms-item-header">
                    <span class="comms-type ${c.comm_type}">${(c.comm_type || '').toUpperCase()}</span>
                    <span class="comms-channel"><i class="fas ${channelIcon}"></i> ${(c.channel || '').toUpperCase()}</span>
                    <span class="comms-status ${c.status}">${(c.status || '').toUpperCase()}</span>
                </div>
                <div class="comms-incident"><i class="fas fa-hashtag"></i> ${this.escapeHtml(c.incident_id)}</div>
                <div class="comms-subject">${this.escapeHtml(c.subject)}</div>
                <pre class="comms-body">${this.escapeHtml(c.body)}</pre>
                <div class="comms-meta">${this.escapeHtml(c.generated_by || '')} • ${when}</div>
            </div>`;
        }).join('');
    }

    formatTimestamp(iso) {
        if (!iso) return '';
        const d = new Date(iso);
        if (isNaN(d)) return iso;
        return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }

    escapeHtml(value) {
        if (value === null || value === undefined) return '';
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    populateActivityTimeline() {
        const timeline = document.getElementById('activity-timeline');
        if (!timeline) return;

        timeline.innerHTML = DATA.activities.map(activity => `
            <div class="activity-item">
                <div class="activity-dot ${activity.type}"></div>
                <div class="activity-content">
                    <div class="activity-time">${activity.time}</div>
                    <div class="activity-text">
                        <span class="activity-user">${activity.user}</span> ${activity.action}
                    </div>
                </div>
            </div>
        `).join('');
    }
}

// Initialize panel manager
const panelManager = new PanelManager();
