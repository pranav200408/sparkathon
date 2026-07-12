# Critical Case Command Center

A real-time Critical Case Communication & Incident Management Platform with a dark cyber-intelligence UI inspired by the World Monitor interface.

## Features

### 🗺️ Interactive World Map
- Full-screen interactive world map with Leaflet.js
- Global bank locations with clustered markers
- Color-coded severity indicators (Critical, High, Elevated, Low)
- Region-based grouping (Americas, EMEA, APAC)
- Smooth zoom, pan, and hover interactions
- Pulsing markers for real-time activity

### 💬 AI Chat Console
- Fixed center-bottom input bar
- Natural language queries powered by NVIDIA NIM integration
- Capabilities:
  - Query incidents
  - Pull bank data
  - Suggest escalation actions
  - Generate summaries

### ⚡ Event Workflow
Multi-panel workflow system for incident management:

1. **Event Creation Panel** (Green)
   - Case ID / Incident Number
   - Severity Level selection
   - Affected Bank(s)
   - Region selection
   - Description
   - Microsoft Teams integration trigger

2. **Resource Availability Panel** (Yellow)
   - Available personnel by role (Event Managers, ESS, HCC, FLS, SEAM)
   - Status indicators (Available / Busy / Offline)
   - Smart filtering by region and skillset

3. **Escalation Matrix Panel** (Red)
   - L1 → L2 → L3 → Executive hierarchy
   - AI-powered escalation suggestions
   - One-click escalation triggers

4. **AI Activity Tracker Panel** (Blue)
   - Real-time timeline of actions
   - Auto-summary generation
   - Export functionality

### 📡 Live Wire Feed
- Real-time incident stream
- Severity-based filtering
- Regional filtering

### 🎨 UI/UX Features
- Dark cyber-intelligence theme (black/green neon)
- Glassmorphism panels
- Draggable and stackable panels
- Subtle animations and pulsing markers
- Responsive design
- Keyboard shortcuts

## Installation

1. Clone or download this repository
2. Open with a local server (e.g., Live Server for VS Code)
3. Navigate to `http://localhost:5500` (or your server's port)

```bash
# If using Python
python -m http.server 8000

# If using Node.js
npx serve .

# If using VS Code Live Server
# Right-click index.html -> Open with Live Server
```

## Configuration

Edit `js/config.js` to configure:

```javascript
const CONFIG = {
    api: {
        nvidiaKey: 'your-nvidia-nim-api-key',
        teamsWebhook: 'your-power-automate-webhook-url',
    },
    // ... other settings
};
```

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `/` or `Ctrl+K` | Focus search |
| `N` | Create new event |
| `C` | Toggle chat panel |
| `A` | Focus AI assistant |
| `R` | Reset map view |
| `+/-` | Zoom in/out |
| `Alt+1-5` | Set DEFCON level |
| `Esc` | Close modals |

## Technology Stack

- **Frontend**: Vanilla HTML5, CSS3, JavaScript (ES6+)
- **Mapping**: Leaflet.js with MarkerCluster
- **Icons**: Font Awesome 6
- **Styling**: Custom CSS with CSS Variables
- **AI Integration**: NVIDIA NIM API (configurable)
- **Collaboration**: Microsoft Teams via Power Automate

## Project Structure

```
worldmap/
├── index.html              # Main HTML file
├── css/
│   ├── main.css           # Core styles and theme
│   ├── panels.css         # Panel and modal styles
│   └── components.css     # UI component styles
├── js/
│   ├── config.js          # Configuration settings
│   ├── data.js            # Sample data definitions
│   ├── map.js             # Map initialization and controls
│   ├── panels.js          # Panel management
│   ├── ai-chat.js         # AI assistant functionality
│   ├── events.js          # Event creation workflow
│   ├── realtime.js        # Real-time updates
│   └── app.js             # Main application entry
└── README.md              # This file
```

## API Integration

### NVIDIA NIM
Configure your NVIDIA NIM API key in `config.js` for AI-powered features:
- Incident analysis
- Escalation recommendations
- Summary generation

### Microsoft Teams (Power Automate)
Set up a Power Automate flow with an HTTP trigger to:
- Create Teams channels for incidents
- Add team members automatically
- Send notifications

## Future Enhancements

- [ ] Voice command integration
- [ ] Predictive incident detection
- [ ] Auto-war-room creation
- [ ] SLA tracking dashboard
- [ ] Audit & compliance logs
- [ ] 3D Globe view
- [ ] WebSocket real-time sync
- [ ] User authentication (SSO)

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

MIT License - Feel free to use and modify for your needs.

---

Built with ❤️ for Critical Case Communication
