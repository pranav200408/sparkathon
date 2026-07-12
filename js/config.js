/* =====================================================
   CRITICAL CASE COMMAND CENTER - Configuration
   ===================================================== */

const CONFIG = {
    // API Configuration
    api: {
        nvidiaKey: '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',
        nvidiaUrl: 'https://integrate.api.nvidia.com/v1/chat/completions',
        nvidiaModel: 'mistralai/mistral-medium-3.5-128b',
        teamsWebhook: '', // Power Automate Webhook for Teams
        graphApiEndpoint: 'https://graph.microsoft.com/v1.0',
    },
    
    // Map Configuration
    map: {
        center: [30, 20],
        zoom: 3,
        minZoom: 2,
        maxZoom: 18,
        tileUrl: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
        tileAttribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    },
    
    // Cluster Configuration
    cluster: {
        maxClusterRadius: 50,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true,
        disableClusteringAtZoom: 10,
    },
    
    // Time Zones
    timeZones: {
        nyc: 'America/New_York',
        ldn: 'Europe/London',
        tyo: 'Asia/Tokyo',
        utc: 'UTC',
    },
    
    // Severity Levels
    severity: {
        critical: { label: 'CRITICAL', color: '#ff3b3b', priority: 1 },
        high: { label: 'HIGH', color: '#ff9500', priority: 2 },
        elevated: { label: 'ELEVATED', color: '#ffd700', priority: 3 },
        low: { label: 'LOW', color: '#00ff88', priority: 4 },
    },
    
    // Regions
    regions: {
        americas: { label: 'Americas', bounds: [[-60, -170], [70, -30]] },
        emea: { label: 'EMEA', bounds: [[-40, -30], [70, 60]] },
        apac: { label: 'APAC', bounds: [[-50, 60], [60, 180]] },
    },
    
    // Refresh Intervals (ms)
    intervals: {
        ticker: 30000,
        wire: 15000,
        clock: 1000,
        status: 60000,
    },
    
    // DEFCON Levels
    defcon: {
        1: { label: 'MAXIMUM', color: '#ff3b3b' },
        2: { label: 'SEVERE', color: '#ff9500' },
        3: { label: 'ELEVATED', color: '#ffd700' },
        4: { label: 'GUARDED', color: '#00d4ff' },
        5: { label: 'NORMAL', color: '#00ff88' },
    },
    
    // AI Configuration
    ai: {
        model: 'mistralai/mistral-medium-3.5-128b',
        maxTokens: 16384,
        temperature: 0.70,
        topP: 1.00,
        reasoningEffort: 'high',
        systemPrompt: `You are an AI assistant for the Critical Case Command Center. 
        You help users manage incidents, query bank data, and provide recommendations for escalations.
        Be concise, professional, and helpful. Focus on actionable insights.`,
    },
    
    // Animation Durations
    animation: {
        fast: 150,
        normal: 300,
        slow: 500,
    },
    
    // Toast Notification Duration
    toast: {
        duration: 5000,
    },
};

// Freeze config to prevent modifications
Object.freeze(CONFIG);
