/* =====================================================
   CRITICAL CASE COMMAND CENTER - API Client
   Talks to the FastAPI backend (Phase 1).
   Falls back to the static data in data.js when the
   backend is unreachable, so the demo still works offline.
   ===================================================== */

const API_BASE = 'http://localhost:8003';

const Api = {
    baseUrl: API_BASE,
    online: false,
    token: null,  // set when backend auth is enabled (see loginToBackend)

    _headers(extra) {
        const h = Object.assign({}, extra || {});
        if (this.token) h['Authorization'] = `Bearer ${this.token}`;
        return h;
    },

    async _get(path) {
        const res = await fetch(`${API_BASE}${path}`, { headers: this._headers() });
        if (!res.ok) throw new Error(`GET ${path} -> ${res.status}`);
        return res.json();
    },

    async _post(path, body) {
        const res = await fetch(`${API_BASE}${path}`, {
            method: 'POST',
            headers: this._headers({ 'Content-Type': 'application/json' }),
            body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error(`POST ${path} -> ${res.status}`);
        return res.json();
    },

    async login(username, password) {
        const data = await this._post('/api/auth/login', { username, password });
        if (data && data.token) this.token = data.token;
        return data;
    },

    getIncidents() { return this._get('/api/incidents'); },
    getResources() { return this._get('/api/resources'); },
    getBanks() { return this._get('/api/banks'); },
    getActivities() { return this._get('/api/activities'); },
    createIncident(data) { return this._post('/api/incidents', data); },
    escalateIncident(id, level, user) {
        return this._post(`/api/incidents/${id}/escalate`, { level, user });
    },

    // Phase 3: communications
    draftCommunication(id, commType, channel) {
        return this._post(`/api/incidents/${id}/communications/draft`, { comm_type: commType, channel });
    },
    sendCommunication(id, commType, channel) {
        return this._post(`/api/incidents/${id}/communications/send`, { comm_type: commType, channel });
    },
    listCommunications(id) { return this._get(`/api/incidents/${id}/communications`); },
    getAllCommunications() { return this._get('/api/communications'); },
    createTeamsChannel(id, members) {
        return this._post(`/api/incidents/${id}/teams-channel`, { members: members || [], notify: true });
    },
    getStatus() { return this._get('/api/integrations/status'); },
    aiChat(messages) { return this._post('/api/ai/chat', { messages }); },
};

/**
 * Load core data from the backend into window.DATA before the app boots.
 * On any failure we keep the static seed data (already on window.DATA) so
 * the dashboard never renders empty.
 */
async function loadInitialData() {
    try {
        const [incidents, resources, banks, activities] = await Promise.all([
            Api.getIncidents(),
            Api.getResources(),
            Api.getBanks(),
            Api.getActivities(),
        ]);

        window.DATA.incidents = incidents;
        window.DATA.resources = resources;
        window.DATA.banks = banks;
        window.DATA.activities = activities;

        Api.online = true;
        console.log('[API] Loaded live data from backend:', {
            incidents: incidents.length,
            resources: resources.length,
            banks: banks.length,
        });

        // Detect whether server-side AI is configured (to route chat securely)
        try {
            const status = await Api.getStatus();
            window.AI_BACKEND = !!(status && status.ai && status.ai.configured);
        } catch (e) {
            window.AI_BACKEND = false;
        }
    } catch (err) {
        Api.online = false;
        console.warn('[API] Backend unreachable, using static fallback data.', err);
    }

    window.API_ONLINE = Api.online;
}

window.Api = Api;
window.loadInitialData = loadInitialData;
