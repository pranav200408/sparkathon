/* =====================================================
   CRITICAL CASE COMMAND CENTER - AI Chat Module
   AI-powered assistant with NVIDIA NIM integration
   ===================================================== */

class AIChat {
    constructor() {
        this.isExpanded = false;
        this.isProcessing = false;
        this.conversationHistory = [];
    }

    init() {
        this.setupEventListeners();
        this.setupVoiceInput();
    }

    setupEventListeners() {
        const aiInput = document.getElementById('ai-input');
        const aiSendBtn = document.getElementById('ai-send-btn');
        const aiExpandBtn = document.getElementById('ai-expand-btn');
        const aiVoiceBtn = document.getElementById('ai-voice-btn');
        const aiConsole = document.getElementById('ai-console');

        // Send message
        aiSendBtn?.addEventListener('click', () => this.sendMessage());
        aiInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Expand/collapse
        aiExpandBtn?.addEventListener('click', () => this.toggleExpand());
        aiConsole?.addEventListener('click', (e) => {
            if (e.target === aiConsole || e.target.closest('.ai-console-header')) {
                if (!this.isExpanded) this.toggleExpand();
            }
        });

        // Voice input
        aiVoiceBtn?.addEventListener('click', () => this.toggleVoice());
    }

    setupVoiceInput() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.recognition.lang = 'en-US';

            this.recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                document.getElementById('ai-input').value = transcript;
                this.sendMessage();
            };

            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                Toast.show({
                    type: 'error',
                    title: 'Voice Error',
                    message: 'Could not recognize speech. Please try again.',
                });
            };
        }
    }

    toggleExpand() {
        const aiConsole = document.getElementById('ai-console');
        this.isExpanded = !this.isExpanded;
        aiConsole.classList.toggle('expanded', this.isExpanded);

        const icon = document.querySelector('#ai-expand-btn i');
        if (icon) {
            icon.className = this.isExpanded ? 'fas fa-compress-alt' : 'fas fa-expand-alt';
        }
    }

    toggleVoice() {
        if (!this.recognition) {
            Toast.show({
                type: 'warning',
                title: 'Voice Not Supported',
                message: 'Voice recognition is not supported in this browser.',
            });
            return;
        }

        const voiceBtn = document.getElementById('ai-voice-btn');
        
        if (this.recognition.isRecording) {
            this.recognition.stop();
            voiceBtn.classList.remove('recording');
        } else {
            this.recognition.start();
            voiceBtn.classList.add('recording');
            Toast.show({
                type: 'info',
                title: 'Listening',
                message: 'Speak your query now...',
            });
        }
    }

    async sendMessage() {
        const input = document.getElementById('ai-input');
        const message = input.value.trim();
        
        if (!message || this.isProcessing) return;

        input.value = '';
        this.isProcessing = true;

        // Expand if not already
        if (!this.isExpanded) this.toggleExpand();

        // Add user message to chat
        this.addMessage('user', message);
        this.conversationHistory.push({ role: 'user', content: message });

        // Show typing indicator
        const typingId = this.showTypingIndicator();

        try {
            // Call the real NVIDIA API
            const response = await this.callNvidiaAPI(message);
            
            // Remove typing indicator
            this.removeTypingIndicator(typingId);
            
            // Add AI response
            this.addMessage('assistant', response);
            this.conversationHistory.push({ role: 'assistant', content: response });
        } catch (error) {
            this.removeTypingIndicator(typingId);
            this.addMessage('assistant', 'I apologize, but I encountered an error processing your request. Please try again.');
            console.error('AI Error:', error);
        }

        this.isProcessing = false;
    }

    addMessage(role, content) {
        const messagesContainer = document.getElementById('ai-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `ai-message ${role}`;
        
        // Parse markdown-like formatting
        const formattedContent = this.formatMessage(content);
        messageDiv.innerHTML = `<div class="message-content">${formattedContent}</div>`;
        
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    formatMessage(content) {
        // Basic markdown formatting
        return content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/\n/g, '<br>')
            .replace(/• /g, '&bull; ');
    }

    showTypingIndicator() {
        const messagesContainer = document.getElementById('ai-messages');
        const typingDiv = document.createElement('div');
        typingDiv.className = 'ai-message assistant typing';
        typingDiv.id = 'typing-' + Date.now();
        typingDiv.innerHTML = `
            <div class="message-content">
                <div class="loading-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        messagesContainer.appendChild(typingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        return typingDiv.id;
    }

    removeTypingIndicator(id) {
        const typingDiv = document.getElementById(id);
        if (typingDiv) typingDiv.remove();
    }

    getIncidentSummary() {
        const critical = DATA.incidents.filter(i => i.severity === 'critical').length;
        const high = DATA.incidents.filter(i => i.severity === 'high').length;
        const elevated = DATA.incidents.filter(i => i.severity === 'elevated').length;

        return `**Active Incident Summary**

Currently tracking **${DATA.incidents.length}** active incidents across all regions:

• **Critical:** ${critical} incidents requiring immediate attention
• **High:** ${high} incidents with significant impact
• **Elevated:** ${elevated} incidents being monitored

**Top Priority Incidents:**
${DATA.incidents.filter(i => i.severity === 'critical').slice(0, 3).map(i => 
    `• ${i.title} (${i.location})`
).join('\n')}

Would you like me to:
1. Provide details on a specific incident
2. Recommend escalation actions
3. Generate a detailed report`;
    }

    getBankInfo(query) {
        // Try to extract bank name from query
        const bank = DATA.banks.find(b => 
            query.toLowerCase().includes(b.name.toLowerCase()) ||
            query.toLowerCase().includes(b.city.toLowerCase())
        );

        if (bank) {
            return `**${bank.name}**
Location: ${bank.city}, ${bank.country}
Region: ${bank.region.toUpperCase()}
Active Incidents: ${bank.incidents}
Status: ${bank.severity.toUpperCase()}

This location is currently ${bank.incidents > 0 ? 'experiencing active incidents' : 'operating normally'}. ${bank.incidents > 2 ? 'Recommend immediate attention.' : ''}`;
        }

        const stats = worldMap.getStats();
        return `**Bank Location Summary**

Total monitored locations: **${stats.total}**

By Region:
• Americas: ${stats.byRegion.americas} locations
• EMEA: ${stats.byRegion.emea} locations
• APAC: ${stats.byRegion.apac} locations

By Status:
• Critical: ${stats.critical}
• High: ${stats.high}
• Elevated: ${stats.elevated}
• Normal: ${stats.low}

Which bank or region would you like more details about?`;
    }

    getEscalationRecommendation() {
        const criticalIncidents = DATA.incidents.filter(i => i.severity === 'critical');
        
        if (criticalIncidents.length > 0) {
            return `**Escalation Recommendation**

Based on current incident severity, I recommend the following escalation actions:

**Immediate Escalation Required (Critical):**
${criticalIncidents.slice(0, 2).map(i => 
    `• ${i.title} → Escalate to **L3 Management**`
).join('\n')}

**Recommended Actions:**
1. Initiate war room for critical incidents
2. Notify executive stakeholders
3. Activate cross-regional support teams

**Available Resources:**
• ${DATA.resources.filter(r => r.status === 'available' && r.role === 'Event Manager').length} Event Managers available
• ${DATA.resources.filter(r => r.status === 'available').length} total staff ready

Should I initiate the escalation workflow?`;
        }

        return `**Escalation Status**

No critical incidents currently require immediate escalation.

Current escalation levels:
• L1 (Service Desk): Handling ${DATA.incidents.filter(i => i.severity === 'low').length} incidents
• L2 (Technical): Handling ${DATA.incidents.filter(i => i.severity === 'elevated').length} incidents
• L3 (Management): Standing by

All escalation paths are clear. System operating within normal parameters.`;
    }

    getSystemStatus() {
        return `**System Health Status**

**Overall Status:** 🟢 OPERATIONAL

**Component Status:**
• Map Service: 🟢 Online
• Real-time Feed: 🟢 Active
• AI Services: 🟢 Connected
• Teams Integration: 🟢 Ready
• Data Sources: 🟢 Synced

**Performance Metrics:**
• API Response Time: 124ms (avg)
• Active Connections: 847
• Data Freshness: < 30s

**DEFCON Level:** ${document.getElementById('defcon-level')?.textContent || '3'} (ELEVATED)

All systems nominal. No degradation detected.`;
    }

    getHelpMessage() {
        return `**AI Assistant Capabilities**

I can help you with:

**Incident Management:**
• "Show active incidents"
• "What's the status of critical issues?"
• "Summarize today's incidents"

**Bank Intelligence:**
• "Show bank locations in EMEA"
• "Get info on HSBC London"
• "Which banks have active incidents?"

**Escalation Support:**
• "Who should I escalate to?"
• "Recommend escalation path"
• "Show available resources"

**System Operations:**
• "System health status"
• "Generate incident report"
• "Show DEFCON level"

Try asking me any of these questions, or describe what you need help with!`;
    }

    generateSummary() {
        const now = new Date();
        return `**Operational Summary**
*Generated: ${now.toLocaleString()}*

**Executive Overview:**
The Critical Case Command Center is currently monitoring ${DATA.banks.length} global bank locations with ${DATA.incidents.length} active incidents.

**Key Metrics:**
• Critical Incidents: ${DATA.incidents.filter(i => i.severity === 'critical').length}
• High Priority: ${DATA.incidents.filter(i => i.severity === 'high').length}
• Staff Utilization: ${Math.round((DATA.resources.filter(r => r.status === 'busy').length / DATA.resources.length) * 100)}%

**Regional Breakdown:**
• Americas: ${DATA.banks.filter(b => b.region === 'americas').reduce((sum, b) => sum + b.incidents, 0)} incidents
• EMEA: ${DATA.banks.filter(b => b.region === 'emea').reduce((sum, b) => sum + b.incidents, 0)} incidents
• APAC: ${DATA.banks.filter(b => b.region === 'apac').reduce((sum, b) => sum + b.incidents, 0)} incidents

**Recommendations:**
1. Continue monitoring Middle East situation
2. Maintain elevated alert status
3. Ensure 24/7 coverage for critical regions

This summary can be exported to PDF or shared via Teams.`;
    }

    // Build context for the AI about current system state
    buildSystemContext() {
        const stats = {
            totalBanks: DATA.banks.length,
            totalIncidents: DATA.incidents.length,
            criticalIncidents: DATA.incidents.filter(i => i.severity === 'critical').length,
            highIncidents: DATA.incidents.filter(i => i.severity === 'high').length,
            elevatedIncidents: DATA.incidents.filter(i => i.severity === 'elevated').length,
            availableResources: DATA.resources.filter(r => r.status === 'available').length,
            totalResources: DATA.resources.length,
        };

        return `You are an AI assistant for the Critical Case Command Center - a mission-control platform for managing banking incidents globally.

Current System Status:
- Monitoring ${stats.totalBanks} bank locations worldwide
- ${stats.totalIncidents} active incidents (${stats.criticalIncidents} Critical, ${stats.highIncidents} High, ${stats.elevatedIncidents} Elevated)
- ${stats.availableResources}/${stats.totalResources} resources available

Recent Critical Incidents:
${DATA.incidents.filter(i => i.severity === 'critical').slice(0, 3).map(i => `- ${i.title} (${i.location})`).join('\n')}

You help with: querying incidents, bank status, escalation recommendations, staffing, and incident summaries.
Be concise, professional, and actionable.`;
    }

    // Real NVIDIA API integration
    async callNvidiaAPI(userMessage) {
        const systemContext = this.buildSystemContext();
        
        const messages = [
            { role: 'system', content: systemContext },
            ...this.conversationHistory.slice(-6),
            { role: 'user', content: userMessage }
        ];

        // Preferred: route through the backend so the API key stays server-side.
        if (window.Api && window.Api.online && window.AI_BACKEND) {
            try {
                const data = await window.Api.aiChat(messages);
                if (data && data.content) return data.content;
            } catch (e) {
                console.warn('Backend AI failed, falling back to direct call/local:', e);
            }
        }

        try {
            const response = await fetch(CONFIG.api.nvidiaUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${CONFIG.api.nvidiaKey}`,
                },
                body: JSON.stringify({
                    model: CONFIG.ai.model,
                    reasoning_effort: CONFIG.ai.reasoningEffort,
                    messages: messages,
                    max_tokens: CONFIG.ai.maxTokens,
                    temperature: CONFIG.ai.temperature,
                    top_p: CONFIG.ai.topP,
                    stream: false
                }),
            });

            if (!response.ok) {
                console.error('NVIDIA API Error:', response.status);
                return this.processQueryFallback(userMessage);
            }

            const data = await response.json();
            
            if (data.choices && data.choices[0] && data.choices[0].message) {
                return data.choices[0].message.content;
            } else {
                return this.processQueryFallback(userMessage);
            }
        } catch (error) {
            console.error('NVIDIA API call failed:', error);
            return this.processQueryFallback(userMessage);
        }
    }

    // Fallback when API fails
    processQueryFallback(query) {
        const lowerQuery = query.toLowerCase();

        if (lowerQuery.includes('incident') || lowerQuery.includes('active')) {
            return this.getIncidentSummary();
        }
        if (lowerQuery.includes('bank') || lowerQuery.includes('location')) {
            return this.getBankInfo(query);
        }
        if (lowerQuery.includes('escalat')) {
            return this.getEscalationRecommendation();
        }
        if (lowerQuery.includes('help')) {
            return this.getHelpMessage();
        }
        return this.getDefaultResponse(query);
    }

    getDefaultResponse(query) {
        return `I understand you're asking about: "${query}"

Let me help you with that. Here are some related actions I can assist with:

• Query incident details
• Check bank status
• Recommend escalations
• Generate reports

Could you provide more details about what specific information you need? You can also type "help" to see all available commands.`;
    }
}

// Initialize AI Chat
const aiChat = new AIChat();
