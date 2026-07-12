/* =====================================================
   CRITICAL CASE COMMAND CENTER - Events Module
   Event Creation and Workflow Management
   ===================================================== */

class EventManager {
    constructor() {
        this.currentEvent = null;
        this.selectedResources = [];
    }

    init() {
        this.setupEventCreation();
        this.setupWorkflowPanels();
        this.setupEscalation();
        this.setupFormHandlers();
    }

    setupEventCreation() {
        const fabButton = document.getElementById('fab-create-event');
        const modalOverlay = document.getElementById('event-modal-overlay');
        const cancelBtn = document.getElementById('btn-cancel-event');

        fabButton?.addEventListener('click', () => this.openEventWorkflow());
        
        cancelBtn?.addEventListener('click', () => this.closeEventWorkflow());
        
        modalOverlay?.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                this.closeEventWorkflow();
            }
        });

        // Close workflow panels
        document.querySelectorAll('#event-workflow .close-panel').forEach(btn => {
            btn.addEventListener('click', () => this.closeEventWorkflow());
        });
    }

    openEventWorkflow() {
        const modalOverlay = document.getElementById('event-modal-overlay');
        modalOverlay.style.display = 'flex';

        // Generate case ID
        const caseId = `INC-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;
        document.getElementById('event-case-id').value = caseId;

        // Populate resource panel
        panelManager.showResourcePanel();

        // Populate activity timeline
        panelManager.populateActivityTimeline();

        // Animate panels in
        const panels = document.querySelectorAll('.workflow-panel');
        panels.forEach((panel, index) => {
            panel.style.opacity = '0';
            panel.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                panel.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                panel.style.opacity = '1';
                panel.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }

    closeEventWorkflow() {
        const modalOverlay = document.getElementById('event-modal-overlay');
        
        const panels = document.querySelectorAll('.workflow-panel');
        panels.forEach((panel, index) => {
            panel.style.opacity = '0';
            panel.style.transform = 'translateY(20px)';
        });

        setTimeout(() => {
            modalOverlay.style.display = 'none';
            this.resetForm();
        }, 300);
    }

    setupWorkflowPanels() {
        // Resource filters
        const regionFilter = document.getElementById('resource-region-filter');
        const roleFilter = document.getElementById('resource-role-filter');

        regionFilter?.addEventListener('change', () => {
            panelManager.filterResources(regionFilter.value, roleFilter.value);
        });

        roleFilter?.addEventListener('change', () => {
            panelManager.filterResources(regionFilter.value, roleFilter.value);
        });

        // Generate summary button
        document.getElementById('btn-generate-summary')?.addEventListener('click', () => {
            this.generateEventSummary();
        });

        // Export timeline button
        document.getElementById('btn-export-timeline')?.addEventListener('click', () => {
            this.exportTimeline();
        });
    }

    setupEscalation() {
        const escalateBtns = document.querySelectorAll('.btn-escalate');
        
        escalateBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const level = e.target.closest('.btn-escalate').dataset.level;
                this.initiateEscalation(level);
            });
        });
    }

    initiateEscalation(level) {
        const levels = document.querySelectorAll('.escalation-level');
        
        levels.forEach(lvl => {
            lvl.classList.remove('active');
            if (parseInt(lvl.dataset.level) <= parseInt(level)) {
                lvl.classList.add('active');
            }
        });

        // Add activity
        this.addActivity(`Escalated to Level ${level}`);

        // Persist escalation to the backend when an incident is active
        if (window.Api && window.Api.online && this.currentEvent && this.currentEvent.id) {
            window.Api.escalateIncident(this.currentEvent.id, parseInt(level), 'Operator')
                .catch(err => console.warn('[API] Escalation not persisted:', err));
        }

        // Show toast
        const levelNames = {
            '1': 'First Response (Service Desk)',
            '2': 'Technical Support',
            '3': 'Management',
            '4': 'Executive',
        };

        Toast.show({
            type: 'success',
            title: 'Escalation Initiated',
            message: `Escalated to ${levelNames[level]}`,
        });

        // Update AI suggestion
        const suggestion = document.querySelector('.ai-suggestion span');
        if (suggestion) {
            suggestion.textContent = `Escalation to L${level} completed. Monitoring for response.`;
        }
    }

    setupFormHandlers() {
        const eventForm = document.getElementById('event-form');
        
        eventForm?.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.createEvent();
        });

        // Severity change handler
        document.getElementById('event-severity')?.addEventListener('change', (e) => {
            this.updateEscalationSuggestion(e.target.value);
        });
    }

    updateEscalationSuggestion(severity) {
        const suggestion = document.querySelector('.ai-suggestion span');
        if (!suggestion) return;

        const recommendations = {
            critical: 'AI Recommendation: Critical severity detected. Immediate escalation to L3 recommended.',
            high: 'AI Recommendation: High severity incident. Consider escalating to L2.',
            elevated: 'AI Recommendation: Elevated severity. L1 team should handle with L2 standby.',
            low: 'AI Recommendation: Low severity. Standard L1 handling appropriate.',
        };

        suggestion.textContent = recommendations[severity] || recommendations.elevated;
    }

    async createEvent() {
        const formData = this.getFormData();
        
        if (!this.validateForm(formData)) {
            return;
        }

        // Show loading state
        const submitBtn = document.querySelector('#event-form button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating...';
        submitBtn.disabled = true;

        try {
            const title = formData.description
                ? formData.description.slice(0, 80)
                : `Manual incident (${formData.region.toUpperCase()})`;

            if (window.Api && window.Api.online) {
                // Persist to the backend
                const created = await window.Api.createIncident({
                    id: formData.caseId || null,
                    title: title,
                    location: formData.region,
                    severity: formData.severity,
                    region: formData.region,
                    description: formData.description,
                    tags: ['MANUAL'],
                    created_by: 'Operator',
                });

                this.currentEvent = {
                    id: created.id,
                    severity: created.severity,
                    region: created.region,
                    banks: formData.banks,
                    description: created.description,
                    createdAt: created.created_at || new Date().toISOString(),
                    status: created.status || 'active',
                };

                // Refresh the wire feed so the new incident shows up live
                try {
                    window.DATA.incidents = await window.Api.getIncidents();
                    panelManager.populateWireFeed();
                } catch (e) { /* non-fatal */ }
            } else {
                // Offline fallback: simulate as before
                await new Promise(resolve => setTimeout(resolve, 1500));
                this.currentEvent = {
                    id: formData.caseId,
                    severity: formData.severity,
                    region: formData.region,
                    banks: formData.banks,
                    description: formData.description,
                    createdAt: new Date().toISOString(),
                    status: 'active',
                };
            }

            // Add to activities
            this.addActivity(`Event ${this.currentEvent.id} created`);

            // Trigger Teams integration (simulated)
            await this.createTeamsChannel(this.currentEvent);

            // Show success
            Toast.show({
                type: 'success',
                title: 'Event Created',
                message: `Case ${this.currentEvent.id} has been created and Teams channel is ready.`,
            });

            // Close workflow after brief delay
            setTimeout(() => this.closeEventWorkflow(), 1500);

        } catch (error) {
            Toast.show({
                type: 'error',
                title: 'Creation Failed',
                message: 'Could not create event. Please try again.',
            });
            console.error('Event creation error:', error);
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    getFormData() {
        const banksSelect = document.getElementById('event-banks');
        const selectedBanks = Array.from(banksSelect.selectedOptions).map(opt => opt.value);

        return {
            caseId: document.getElementById('event-case-id').value,
            severity: document.getElementById('event-severity').value,
            region: document.getElementById('event-region').value,
            banks: selectedBanks,
            description: document.getElementById('event-description').value,
        };
    }

    validateForm(data) {
        if (!data.caseId) {
            Toast.show({ type: 'warning', title: 'Validation', message: 'Case ID is required' });
            return false;
        }
        if (!data.description) {
            Toast.show({ type: 'warning', title: 'Validation', message: 'Description is required' });
            return false;
        }
        return true;
    }

    resetForm() {
        document.getElementById('event-form')?.reset();
        this.selectedResources = [];
        
        // Reset escalation levels
        document.querySelectorAll('.escalation-level').forEach(lvl => {
            lvl.classList.remove('active');
        });
        document.querySelector('.escalation-level[data-level="1"]')?.classList.add('active');

        // Reset AI suggestion
        const suggestion = document.querySelector('.ai-suggestion span');
        if (suggestion) {
            suggestion.textContent = 'AI Recommendation: Based on severity, escalate to L2';
        }
    }

    async createTeamsChannel(event) {
        const members = this.getSelectedResourceEmails();

        // Preferred path: backend orchestrates channel creation + AI-drafted
        // initial notification (works in mock mode with no Teams tenant).
        if (window.Api && window.Api.online && event.id) {
            try {
                const result = await window.Api.createTeamsChannel(event.id, members);
                const mode = result?.channel?.mode === 'live' ? 'live' : 'simulated';
                this.addActivity(`Teams channel created (${mode})`);
                if (result?.notification) {
                    this.addActivity('AI initial notification posted to Teams');
                }
                return true;
            } catch (error) {
                console.error('Teams channel via backend failed:', error);
                // fall through to legacy path
            }
        }

        // Legacy fallback: direct Power Automate webhook if one is set in config.
        const payload = {
            channelName: `Incident-${event.id}`,
            description: event.description,
            members: members,
            severity: event.severity,
        };
        if (CONFIG.api.teamsWebhook) {
            try {
                await fetch(CONFIG.api.teamsWebhook, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });
            } catch (error) {
                console.error('Teams webhook error:', error);
            }
        }

        this.addActivity('Teams channel created');
        return true;
    }

    getSelectedResourceEmails() {
        const selectedItems = document.querySelectorAll('.resource-item.selected');
        return Array.from(selectedItems).map(item => {
            const resource = DATA.resources.find(r => r.id === item.dataset.id);
            return resource ? `${resource.name.toLowerCase().replace(' ', '.')}@company.com` : null;
        }).filter(Boolean);
    }

    addActivity(action) {
        const timeline = document.getElementById('activity-timeline');
        if (!timeline) return;

        const now = new Date();
        const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

        const activityHtml = `
            <div class="activity-item" style="opacity: 0; transform: translateX(-20px);">
                <div class="activity-dot"></div>
                <div class="activity-content">
                    <div class="activity-time">${timeStr}</div>
                    <div class="activity-text">
                        <span class="activity-user">System</span> ${action}
                    </div>
                </div>
            </div>
        `;

        timeline.insertAdjacentHTML('beforeend', activityHtml);

        // Animate in
        const newItem = timeline.lastElementChild;
        requestAnimationFrame(() => {
            newItem.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            newItem.style.opacity = '1';
            newItem.style.transform = 'translateX(0)';
        });

        timeline.scrollTop = timeline.scrollHeight;
    }

    async generateEventSummary() {
        if (!this.currentEvent) {
            Toast.show({
                type: 'info',
                title: 'Summary',
                message: 'Create an event first to generate summary',
            });
            return;
        }

        // Preferred: AI-drafted communication from the backend.
        if (window.Api && window.Api.online && this.currentEvent.id) {
            try {
                Toast.show({ type: 'info', title: 'AI', message: 'Drafting incident update...' });
                const comm = await window.Api.draftCommunication(this.currentEvent.id, 'initial', 'email');
                console.log(`SUBJECT: ${comm.subject}\n\n${comm.body}`);
                this.addActivity('AI drafted initial communication');
                Toast.show({
                    type: 'success',
                    title: 'AI Draft Ready',
                    message: comm.subject,
                });
                return;
            } catch (error) {
                console.error('AI draft failed, falling back to local summary:', error);
            }
        }

        const summary = `
INCIDENT SUMMARY
================
Case ID: ${this.currentEvent.id}
Severity: ${this.currentEvent.severity.toUpperCase()}
Region: ${this.currentEvent.region.toUpperCase()}
Created: ${new Date(this.currentEvent.createdAt).toLocaleString()}

Description:
${this.currentEvent.description}

Affected Banks:
${this.currentEvent.banks.join(', ') || 'None specified'}

Status: ${this.currentEvent.status.toUpperCase()}
        `;

        console.log(summary);
        
        Toast.show({
            type: 'success',
            title: 'Summary Generated',
            message: 'Check console for full summary. Export feature coming soon.',
        });
    }

    exportTimeline() {
        const timeline = document.getElementById('activity-timeline');
        const items = timeline?.querySelectorAll('.activity-item');

        if (!items || items.length === 0) {
            Toast.show({
                type: 'info',
                title: 'Export',
                message: 'No activity to export',
            });
            return;
        }

        let exportData = 'ACTIVITY TIMELINE\n=================\n\n';

        items.forEach(item => {
            const time = item.querySelector('.activity-time')?.textContent || '';
            const text = item.querySelector('.activity-text')?.textContent || '';
            exportData += `[${time}] ${text.trim()}\n`;
        });

        // Create download
        const blob = new Blob([exportData], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `timeline-${Date.now()}.txt`;
        a.click();
        URL.revokeObjectURL(url);

        Toast.show({
            type: 'success',
            title: 'Export Complete',
            message: 'Timeline exported successfully',
        });
    }
}

// Initialize Event Manager
const eventManager = new EventManager();
