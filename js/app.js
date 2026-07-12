/* =====================================================
   CRITICAL CASE COMMAND CENTER - Main Application
   Application initialization and global event handlers
   ===================================================== */

class App {
    constructor() {
        this.isInitialized = false;
    }

    async init() {
        try {
            // Wait for DOM
            await this.waitForDOM();

            // Load live data from the backend (falls back to static data)
            if (typeof loadInitialData === 'function') {
                await loadInitialData();
            }

            // Initialize modules
            await this.initializeModules();

            // Setup global event handlers
            this.setupGlobalHandlers();

            // Setup keyboard shortcuts
            this.setupKeyboardShortcuts();

            // Setup admin panel
            this.setupAdminPanel();

            // Hide loading screen
            this.hideLoadingScreen();

            this.isInitialized = true;
            console.log('Critical Case Command Center initialized successfully');

        } catch (error) {
            console.error('Initialization failed:', error);
            this.showError(error);
        }
    }

    waitForDOM() {
        return new Promise(resolve => {
            if (document.readyState === 'complete') {
                resolve();
            } else {
                window.addEventListener('load', resolve);
            }
        });
    }

    async initializeModules() {
        // Initialize map
        worldMap.init();

        // Initialize panels
        panelManager.init();

        // Initialize AI chat
        aiChat.init();

        // Initialize event manager
        eventManager.init();

        // Initialize real-time updates
        realTimeManager.init();
    }

    setupGlobalHandlers() {
        // Global search
        const globalSearch = document.getElementById('global-search');
        globalSearch?.addEventListener('input', (e) => this.handleSearch(e.target.value));
        globalSearch?.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                e.target.value = '';
                e.target.blur();
            }
        });

        // Navigation buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const view = e.target.dataset.view;
                this.switchView(view);
            });
        });

        // Sign in button
        document.getElementById('btn-signin')?.addEventListener('click', () => {
            this.showSignInModal();
        });

        // Window resize
        window.addEventListener('resize', () => this.handleResize());

        // Prevent context menu on map
        document.getElementById('world-map')?.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });

        // Close modals on escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ignore if typing in input
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }

            // Cmd/Ctrl + K: Focus search
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                document.getElementById('global-search')?.focus();
            }

            // / : Focus search
            if (e.key === '/' && !e.shiftKey) {
                e.preventDefault();
                document.getElementById('global-search')?.focus();
            }

            // N: New event
            if (e.key === 'n' && !e.metaKey && !e.ctrlKey) {
                e.preventDefault();
                document.getElementById('fab-create-event')?.click();
            }

            // C: Toggle chat
            if (e.key === 'c' && !e.metaKey && !e.ctrlKey) {
                e.preventDefault();
                panelManager.togglePanel('chat', document.querySelector('.sidebar-btn[data-panel="chat"]'));
            }

            // A: Focus AI
            if (e.key === 'a' && !e.metaKey && !e.ctrlKey) {
                e.preventDefault();
                document.getElementById('ai-input')?.focus();
                if (!aiChat.isExpanded) {
                    aiChat.toggleExpand();
                }
            }

            // R: Reset map
            if (e.key === 'r' && !e.metaKey && !e.ctrlKey) {
                e.preventDefault();
                document.getElementById('btn-reset')?.click();
            }

            // +/-: Zoom
            if (e.key === '+' || e.key === '=') {
                e.preventDefault();
                worldMap.map?.zoomIn();
            }
            if (e.key === '-') {
                e.preventDefault();
                worldMap.map?.zoomOut();
            }

            // 1-5: Set DEFCON level
            if (/^[1-5]$/.test(e.key) && e.altKey) {
                e.preventDefault();
                realTimeManager.updateDefconLevel(parseInt(e.key));
            }
        });
    }

    setupAdminPanel() {
        const adminBtn = document.getElementById('btn-admin');
        const adminOverlay = document.getElementById('admin-modal-overlay');
        const closeAdminBtn = document.querySelector('.close-admin');

        adminBtn?.addEventListener('click', () => {
            adminOverlay.style.display = 'flex';
        });

        closeAdminBtn?.addEventListener('click', () => {
            adminOverlay.style.display = 'none';
        });

        adminOverlay?.addEventListener('click', (e) => {
            if (e.target === adminOverlay) {
                adminOverlay.style.display = 'none';
            }
        });

        // Admin nav
        document.querySelectorAll('.admin-nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const section = e.target.dataset.section;
                this.switchAdminSection(section);
            });
        });
    }

    switchAdminSection(section) {
        // Update nav buttons
        document.querySelectorAll('.admin-nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.section === section);
        });

        // Update sections
        document.querySelectorAll('.admin-section').forEach(s => {
            s.classList.toggle('active', s.id === `section-${section}`);
        });
    }

    handleSearch(query) {
        if (!query) return;

        const lowerQuery = query.toLowerCase();

        // Search banks
        const matchingBanks = DATA.banks.filter(bank =>
            bank.name.toLowerCase().includes(lowerQuery) ||
            bank.city.toLowerCase().includes(lowerQuery) ||
            bank.country.toLowerCase().includes(lowerQuery)
        );

        if (matchingBanks.length === 1) {
            worldMap.focusOnBank(matchingBanks[0].id);
        }

        // Search incidents
        const matchingIncidents = DATA.incidents.filter(inc =>
            inc.title.toLowerCase().includes(lowerQuery) ||
            inc.location.toLowerCase().includes(lowerQuery)
        );

        if (matchingIncidents.length > 0) {
            console.log('Found incidents:', matchingIncidents);
        }
    }

    switchView(view) {
        // Update nav buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
        });

        // Handle view switch
        if (view === 'globe') {
            Toast.show({
                type: 'info',
                title: '3D Globe',
                message: '3D Globe view coming soon',
            });
        } else if (view === 'wire') {
            // Focus on wire panel
            document.getElementById('wire-panel')?.classList.add('highlight');
            setTimeout(() => {
                document.getElementById('wire-panel')?.classList.remove('highlight');
            }, 1000);
        }
    }

    showSignInModal() {
        Toast.show({
            type: 'info',
            title: 'Sign In',
            message: 'Authentication system coming soon',
        });
    }

    closeAllModals() {
        document.getElementById('event-modal-overlay').style.display = 'none';
        document.getElementById('admin-modal-overlay').style.display = 'none';
        document.getElementById('bank-popup').style.display = 'none';
    }

    handleResize() {
        // Handle responsive adjustments
        worldMap.map?.invalidateSize();
    }

    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        const app = document.getElementById('app');

        // Loading screen has CSS animation, just show app
        setTimeout(() => {
            loadingScreen.style.display = 'none';
            app.classList.remove('hidden');
        }, 2500);
    }

    showError(error) {
        const loadingScreen = document.getElementById('loading-screen');
        const loadingText = loadingScreen?.querySelector('.loading-text');
        
        if (loadingText) {
            loadingText.textContent = `Error: ${error.message}. Please refresh.`;
            loadingText.style.color = 'var(--accent-red)';
        }
    }
}

// Initialize application
const app = new App();

// Start initialization when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});

// Handle visibility change
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Pause updates when tab is hidden
        console.log('Tab hidden - pausing updates');
    } else {
        // Resume updates
        console.log('Tab visible - resuming updates');
    }
});

// Handle before unload
window.addEventListener('beforeunload', () => {
    realTimeManager.destroy();
});

// Expose for debugging
window.DEBUG = {
    app,
    worldMap,
    panelManager,
    aiChat,
    eventManager,
    realTimeManager,
    CONFIG,
    DATA,
};
