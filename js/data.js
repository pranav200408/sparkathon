/* =====================================================
   CRITICAL CASE COMMAND CENTER - Sample Data
   ===================================================== */

// Bank Locations Data
const BANK_DATA = [
    // Americas
    { id: 'jpmorgan-nyc', name: 'JPMorgan Chase', city: 'New York', country: 'USA', region: 'americas', lat: 40.7580, lng: -73.9855, incidents: 3, severity: 'elevated' },
    { id: 'bofa-charlotte', name: 'Bank of America', city: 'Charlotte', country: 'USA', region: 'americas', lat: 35.2271, lng: -80.8431, incidents: 1, severity: 'low' },
    { id: 'citi-nyc', name: 'Citigroup', city: 'New York', country: 'USA', region: 'americas', lat: 40.7200, lng: -74.0100, incidents: 5, severity: 'high' },
    { id: 'wells-sf', name: 'Wells Fargo', city: 'San Francisco', country: 'USA', region: 'americas', lat: 37.7749, lng: -122.4194, incidents: 2, severity: 'elevated' },
    { id: 'goldman-nyc', name: 'Goldman Sachs', city: 'New York', country: 'USA', region: 'americas', lat: 40.7146, lng: -74.0071, incidents: 0, severity: 'low' },
    { id: 'morgan-nyc', name: 'Morgan Stanley', city: 'New York', country: 'USA', region: 'americas', lat: 40.7614, lng: -73.9776, incidents: 1, severity: 'low' },
    { id: 'td-toronto', name: 'TD Bank', city: 'Toronto', country: 'Canada', region: 'americas', lat: 43.6532, lng: -79.3832, incidents: 2, severity: 'elevated' },
    { id: 'rbc-toronto', name: 'Royal Bank of Canada', city: 'Toronto', country: 'Canada', region: 'americas', lat: 43.6489, lng: -79.3847, incidents: 1, severity: 'low' },
    { id: 'itau-saopaulo', name: 'Itaú Unibanco', city: 'São Paulo', country: 'Brazil', region: 'americas', lat: -23.5505, lng: -46.6333, incidents: 3, severity: 'elevated' },
    { id: 'bradesco-sp', name: 'Bradesco', city: 'São Paulo', country: 'Brazil', region: 'americas', lat: -23.5629, lng: -46.6544, incidents: 1, severity: 'low' },
    { id: 'santander-mexico', name: 'Santander Mexico', city: 'Mexico City', country: 'Mexico', region: 'americas', lat: 19.4326, lng: -99.1332, incidents: 2, severity: 'elevated' },
    
    // EMEA
    { id: 'hsbc-london', name: 'HSBC', city: 'London', country: 'UK', region: 'emea', lat: 51.5142, lng: -0.0931, incidents: 7, severity: 'critical' },
    { id: 'barclays-london', name: 'Barclays', city: 'London', country: 'UK', region: 'emea', lat: 51.5133, lng: -0.0886, incidents: 4, severity: 'high' },
    { id: 'lloyds-london', name: 'Lloyds Banking', city: 'London', country: 'UK', region: 'emea', lat: 51.5118, lng: -0.0950, incidents: 2, severity: 'elevated' },
    { id: 'deutsche-frankfurt', name: 'Deutsche Bank', city: 'Frankfurt', country: 'Germany', region: 'emea', lat: 50.1109, lng: 8.6821, incidents: 3, severity: 'elevated' },
    { id: 'commerzbank-frankfurt', name: 'Commerzbank', city: 'Frankfurt', country: 'Germany', region: 'emea', lat: 50.1155, lng: 8.6724, incidents: 1, severity: 'low' },
    { id: 'bnp-paris', name: 'BNP Paribas', city: 'Paris', country: 'France', region: 'emea', lat: 48.8716, lng: 2.3388, incidents: 2, severity: 'elevated' },
    { id: 'socgen-paris', name: 'Société Générale', city: 'Paris', country: 'France', region: 'emea', lat: 48.8742, lng: 2.3470, incidents: 1, severity: 'low' },
    { id: 'ubs-zurich', name: 'UBS', city: 'Zurich', country: 'Switzerland', region: 'emea', lat: 47.3769, lng: 8.5417, incidents: 4, severity: 'high' },
    { id: 'credit-zurich', name: 'Credit Suisse', city: 'Zurich', country: 'Switzerland', region: 'emea', lat: 47.3667, lng: 8.5500, incidents: 2, severity: 'elevated' },
    { id: 'santander-madrid', name: 'Santander', city: 'Madrid', country: 'Spain', region: 'emea', lat: 40.4168, lng: -3.7038, incidents: 3, severity: 'elevated' },
    { id: 'ing-amsterdam', name: 'ING Group', city: 'Amsterdam', country: 'Netherlands', region: 'emea', lat: 52.3676, lng: 4.9041, incidents: 1, severity: 'low' },
    { id: 'unicredit-milan', name: 'UniCredit', city: 'Milan', country: 'Italy', region: 'emea', lat: 45.4642, lng: 9.1900, incidents: 2, severity: 'elevated' },
    { id: 'sberbank-moscow', name: 'Sberbank', city: 'Moscow', country: 'Russia', region: 'emea', lat: 55.7558, lng: 37.6173, incidents: 5, severity: 'high' },
    { id: 'standard-joburg', name: 'Standard Bank', city: 'Johannesburg', country: 'South Africa', region: 'emea', lat: -26.2041, lng: 28.0473, incidents: 2, severity: 'elevated' },
    { id: 'emirates-dubai', name: 'Emirates NBD', city: 'Dubai', country: 'UAE', region: 'emea', lat: 25.2048, lng: 55.2708, incidents: 1, severity: 'low' },
    
    // APAC
    { id: 'icbc-beijing', name: 'ICBC', city: 'Beijing', country: 'China', region: 'apac', lat: 39.9042, lng: 116.4074, incidents: 6, severity: 'critical' },
    { id: 'ccb-beijing', name: 'China Construction Bank', city: 'Beijing', country: 'China', region: 'apac', lat: 39.9087, lng: 116.3975, incidents: 4, severity: 'high' },
    { id: 'boc-beijing', name: 'Bank of China', city: 'Beijing', country: 'China', region: 'apac', lat: 39.9139, lng: 116.3919, incidents: 3, severity: 'elevated' },
    { id: 'hsbc-hongkong', name: 'HSBC Hong Kong', city: 'Hong Kong', country: 'Hong Kong', region: 'apac', lat: 22.2808, lng: 114.1588, incidents: 2, severity: 'elevated' },
    { id: 'mufg-tokyo', name: 'MUFG Bank', city: 'Tokyo', country: 'Japan', region: 'apac', lat: 35.6804, lng: 139.7690, incidents: 3, severity: 'elevated' },
    { id: 'mizuho-tokyo', name: 'Mizuho Bank', city: 'Tokyo', country: 'Japan', region: 'apac', lat: 35.6762, lng: 139.6503, incidents: 2, severity: 'elevated' },
    { id: 'smbc-tokyo', name: 'SMBC', city: 'Tokyo', country: 'Japan', region: 'apac', lat: 35.6595, lng: 139.7006, incidents: 1, severity: 'low' },
    { id: 'dbs-singapore', name: 'DBS Bank', city: 'Singapore', country: 'Singapore', region: 'apac', lat: 1.2789, lng: 103.8536, incidents: 2, severity: 'elevated' },
    { id: 'ocbc-singapore', name: 'OCBC Bank', city: 'Singapore', country: 'Singapore', region: 'apac', lat: 1.2854, lng: 103.8515, incidents: 1, severity: 'low' },
    { id: 'cba-sydney', name: 'Commonwealth Bank', city: 'Sydney', country: 'Australia', region: 'apac', lat: -33.8688, lng: 151.2093, incidents: 4, severity: 'high' },
    { id: 'nab-melbourne', name: 'NAB', city: 'Melbourne', country: 'Australia', region: 'apac', lat: -37.8136, lng: 144.9631, incidents: 2, severity: 'elevated' },
    { id: 'anz-melbourne', name: 'ANZ Bank', city: 'Melbourne', country: 'Australia', region: 'apac', lat: -37.8149, lng: 144.9605, incidents: 1, severity: 'low' },
    { id: 'sbi-mumbai', name: 'State Bank of India', city: 'Mumbai', country: 'India', region: 'apac', lat: 19.0760, lng: 72.8777, incidents: 5, severity: 'high' },
    { id: 'hdfc-mumbai', name: 'HDFC Bank', city: 'Mumbai', country: 'India', region: 'apac', lat: 19.0596, lng: 72.8295, incidents: 3, severity: 'elevated' },
    { id: 'icici-mumbai', name: 'ICICI Bank', city: 'Mumbai', country: 'India', region: 'apac', lat: 19.0219, lng: 72.8347, incidents: 2, severity: 'elevated' },
    { id: 'kookmin-seoul', name: 'KB Kookmin Bank', city: 'Seoul', country: 'South Korea', region: 'apac', lat: 37.5665, lng: 126.9780, incidents: 2, severity: 'elevated' },
    { id: 'shinhan-seoul', name: 'Shinhan Bank', city: 'Seoul', country: 'South Korea', region: 'apac', lat: 37.5683, lng: 126.9831, incidents: 1, severity: 'low' },
];

// Wire Feed / Incident Data
const INCIDENT_DATA = [
    {
        id: 'INC-2026-0001',
        title: 'Nearby Iranian positions (implied operational)',
        location: 'Middle East',
        severity: 'critical',
        region: 'emea',
        time: '12m ago',
        description: 'U.S. maintains a naval blockade on Iran while CENTCOM prepares expanded military options, including potential control...',
        tags: ['GEOPOLITICAL', 'BANKING'],
        level: 1208,
    },
    {
        id: 'INC-2026-0002',
        title: 'Iranian regime governmental centers (unspecified)',
        location: 'Tehran, Iran',
        severity: 'critical',
        region: 'emea',
        time: '1h ago',
        description: 'Escalating tensions affect regional banking operations and cross-border transactions.',
        tags: ['CRITICAL', 'OPERATIONS'],
        level: 455,
    },
    {
        id: 'INC-2026-0003',
        title: 'Southern Lebanon operations impacted',
        location: 'Lebanon',
        severity: 'critical',
        region: 'emea',
        time: '12m ago',
        description: 'The ceasefire in southern Lebanon remains non-functional as Hezbollah and Israel continue attacks, with Hezbollah employing...',
        tags: ['REGIONAL', 'ELEVATED'],
        level: 398,
    },
    {
        id: 'INC-2026-0004',
        title: 'Kenton United Synagogue, London',
        location: 'London, UK',
        severity: 'high',
        region: 'emea',
        time: '2h ago',
        description: 'Enhanced security measures implemented at financial district locations.',
        tags: ['SECURITY', 'UK'],
        level: 24,
    },
    {
        id: 'INC-2026-0005',
        title: 'Strait of Hormuz (Iranian coastline)',
        location: 'Persian Gulf',
        severity: 'critical',
        region: 'emea',
        time: '3h ago',
        description: 'Maritime traffic monitoring indicates potential disruption to trade routes affecting banking settlements.',
        tags: ['MARITIME', 'TRADE'],
        level: 1259,
    },
    {
        id: 'INC-2026-0006',
        title: 'India aviation industry disruption',
        location: 'India',
        severity: 'elevated',
        region: 'apac',
        time: '1h ago',
        description: 'Warning of potential shutdown of India\'s aviation industry affecting banking operations and personnel movement.',
        tags: ['AVIATION', 'INDIA'],
        level: 0,
    },
    {
        id: 'INC-2026-0007',
        title: 'APAC Data Center Network Latency',
        location: 'Singapore',
        severity: 'elevated',
        region: 'apac',
        time: '4h ago',
        description: 'Elevated network latency detected across APAC data centers impacting real-time transaction processing.',
        tags: ['NETWORK', 'INFRASTRUCTURE'],
        level: 0,
    },
    {
        id: 'INC-2026-0008',
        title: 'Americas Trading Platform Degradation',
        location: 'New York, USA',
        severity: 'high',
        region: 'americas',
        time: '30m ago',
        description: 'Trading platform experiencing intermittent slowdowns during peak hours. Investigation ongoing.',
        tags: ['TRADING', 'PLATFORM'],
        level: 0,
    },
];

// Resource / Personnel Data
const RESOURCE_DATA = [
    { id: 'R001', name: 'John Smith', initials: 'JS', role: 'Event Manager', region: 'americas', status: 'available', skills: ['incident-response', 'escalation'] },
    { id: 'R002', name: 'Sarah Johnson', initials: 'SJ', role: 'Event Manager', region: 'emea', status: 'busy', skills: ['incident-response', 'communication'] },
    { id: 'R003', name: 'Michael Chen', initials: 'MC', role: 'ESS', region: 'apac', status: 'available', skills: ['technical', 'networking'] },
    { id: 'R004', name: 'Emily Williams', initials: 'EW', role: 'ESS', region: 'americas', status: 'available', skills: ['security', 'compliance'] },
    { id: 'R005', name: 'David Brown', initials: 'DB', role: 'HCC', region: 'emea', status: 'offline', skills: ['communication', 'media'] },
    { id: 'R006', name: 'Lisa Anderson', initials: 'LA', role: 'HCC', region: 'americas', status: 'available', skills: ['communication', 'stakeholder'] },
    { id: 'R007', name: 'James Wilson', initials: 'JW', role: 'FLS', region: 'apac', status: 'busy', skills: ['first-line', 'triage'] },
    { id: 'R008', name: 'Jennifer Taylor', initials: 'JT', role: 'FLS', region: 'emea', status: 'available', skills: ['first-line', 'documentation'] },
    { id: 'R009', name: 'Robert Martinez', initials: 'RM', role: 'SEAM', region: 'americas', status: 'available', skills: ['expert', 'architecture'] },
    { id: 'R010', name: 'Amanda Garcia', initials: 'AG', role: 'SEAM', region: 'apac', status: 'available', skills: ['expert', 'database'] },
    { id: 'R011', name: 'Christopher Lee', initials: 'CL', role: 'Event Manager', region: 'apac', status: 'busy', skills: ['incident-response', 'leadership'] },
    { id: 'R012', name: 'Michelle Davis', initials: 'MD', role: 'ESS', region: 'emea', status: 'available', skills: ['security', 'forensics'] },
];

// Chat Messages Data
const CHAT_DATA = [
    { id: 1, username: 'Anon_609350', time: '1h ago', message: "It's all cap" },
    { id: 2, username: 'Anon_712198', time: '1h ago', message: "G13.c12.p109 delta" },
    { id: 3, username: 'Anon_503064', time: '1h ago', message: "Algum brasileiro????" },
    { id: 4, username: 'Anon_503064', time: '1h ago', message: "Agora???" },
    { id: 5, username: 'Anon_503064', time: '1h ago', message: "brasil caralhooo0 🇧🇷🇧🇷🇧🇷🇧🇷🇧🇷🇧🇷" },
    { id: 6, username: 'Anon_805158', time: '41m ago', message: "hi" },
    { id: 7, username: 'Anon_427978', time: '41m ago', message: "Yo" },
    { id: 8, username: 'penx', time: '11m ago', message: "morning", isVerified: true },
];

// News Ticker Data
const TICKER_DATA = [
    "PATIENTS, STUDY SUGGESTS",
    "US SUPREME COURT CONSERVATIVES SEEM TO FAVOR ENDING TPS FOR HAITIANS AND SYRIANS",
    "UKRAINE ASKS ISRAEL TO SEIZE VESSEL IT CLAIMS IS CARRYING GRAIN STOLEN BY RUSSIA",
    "FAMILY OF AILING IRANIAN NOBEL LAUREATE SAY KEEPING HER IN JAIL IS A DEATH SENTENCE",
    "THOUSANDS OF US AVIATION EMPLOYEES BRACE FOR LAYOFFS",
    "ADMIT SELLING FAKE PICASSO AND BANKSY WORKS, DUPING ART WORLD",
    "CHRISTCHURCH GUNMAN FAILS IN BID TO APPEAL AGAINST GUILTY PLEAS IN NEW ZEALAND COURT",
    "BONDI ROYAL COMMISSION: REPORT CALLS FOR BETTER POLICING OF JEWISH FESTIVALS AFTER 'HIGH' TERROR RISK FLAGGED FOR HANUKKAH EVENT",
    "MARKETS REACT TO CENTRAL BANK POLICY ANNOUNCEMENTS",
    "GLOBAL BANKING SECTOR FACES INCREASED CYBERSECURITY THREATS",
];

// Outbreak Data
const OUTBREAK_DATA = [
    {
        id: 'OUT001',
        name: 'Measles',
        location: 'Bangladesh',
        severity: 'high',
        type: 'AIRBORNE',
        transmission: 'DROPLET',
        cases: '19.2K',
        deaths: 146,
        cfr: '0.9%',
        time: '6d ago',
        description: 'Bangladesh is experiencing a nationwide measles outbreak affecting 58 of 64 districts across all...',
    },
    {
        id: 'OUT002',
        name: 'Avian Influenza A(H9N2)',
        location: 'Italy',
        severity: 'low',
        type: 'ZOONOTIC',
        cases: '1',
        time: '19d ago',
        description: 'Italy has reported an imported human case of avian influenza A(H9N2) in an adult male returning from...',
    },
    {
        id: 'OUT003',
        name: 'International food safety event',
        location: 'Global',
        severity: 'moderate',
        type: 'FOODBORNE',
        cases: '144',
        time: '47d ago',
        description: 'A multi-country food safety event involving infant formula and nutritional products contaminated with...',
    },
    {
        id: 'OUT004',
        name: 'Mpox: recombinant virus',
        location: 'Global',
        severity: 'low',
        type: 'CONTACT',
        cases: '2',
        time: '74d ago',
        description: 'Novel recombinant mpox virus strain detected requiring enhanced surveillance protocols.',
    },
];

// Activity Timeline Data
const ACTIVITY_DATA = [
    { id: 1, time: '10:45 AM', user: 'John Smith', action: 'Created incident INC-2026-0008', type: 'create' },
    { id: 2, time: '10:47 AM', user: 'System', action: 'Auto-assigned to Americas region team', type: 'assign' },
    { id: 3, time: '10:52 AM', user: 'Sarah Johnson', action: 'Escalated to L2 - Technical Support', type: 'escalate' },
    { id: 4, time: '11:05 AM', user: 'Michael Chen', action: 'Added diagnostic notes', type: 'update' },
    { id: 5, time: '11:15 AM', user: 'AI Assistant', action: 'Generated root cause analysis', type: 'ai' },
];

// Export data for use in other modules
window.DATA = {
    banks: BANK_DATA,
    incidents: INCIDENT_DATA,
    resources: RESOURCE_DATA,
    chat: CHAT_DATA,
    ticker: TICKER_DATA,
    outbreaks: OUTBREAK_DATA,
    activities: ACTIVITY_DATA,
};
