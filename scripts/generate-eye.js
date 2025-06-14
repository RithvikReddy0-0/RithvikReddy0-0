// FINAL, ULTIMATE "LIVING COSMIC NEXUS" VERSION
import fetch from 'node-fetch';
import fs from 'fs';

// --- CONFIGURATION ---
const GITHUB_USERNAME = 'RithvikReddy0-0';
const GITHUB_TOKEN = process.env.GITTOKEN;

// --- SVG & GRID CONSTANTS ---
const SQUARE_SIZE = 15;
const SQUARE_GAP = 3;
const GRID_WIDTH = (SQUARE_SIZE + SQUARE_GAP) * 53;
const GRID_HEIGHT = (SQUARE_SIZE + SQUARE_GAP) * 7;

// --- HELPER FUNCTIONS ---
async function fetchData() {
    const query = `
      query($userName: String!) {
        user(login: $userName) {
          contributionsCollection {
            contributionCalendar {
              weeks {
                contributionDays {
                  contributionCount
                  date
                }
              }
            }
          }
        }
      }
    `;

    const response = await fetch('https://api.github.com/graphql', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${GITHUB_TOKEN}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            query: query,
            variables: {
                userName: GITHUB_USERNAME
            }
        })
    });
    
    const data = await response.json();

    if (data.errors || !data.data || !data.data.user) {
        console.error("CRITICAL: Failed to fetch valid data from GitHub API. Check GITHUB_TOKEN and username.");
        console.error("Actual response from GitHub:", JSON.stringify(data, null, 2));
        return null;
    }
    
    return data.data.user.contributionsCollection.contributionCalendar.weeks;
}

function getColor(count) {
    if (count === 0) return 'rgba(22, 27, 34, 0.5)';
    if (count <= 1) return '#0e4429';
    if (count <= 3) return '#006d32';
    if (count <= 6) return '#26a641';
    return '#39d353';
}

// --- The Main SVG Generation Function ---
function generateSVG(streak, contributionData) {
    // 1. Calculate Grid and Path Data
    let gridSquares = '';
    contributionData.forEach((week, weekIndex) => {
        week.contributionDays.forEach((day, dayIndex) => {
            gridSquares += `<rect x="${weekIndex * (SQUARE_SIZE + SQUARE_GAP)}" y="${dayIndex * (SQUARE_SIZE + SQUARE_GAP)}" width="${SQUARE_SIZE}" height="${SQUARE_SIZE}" fill="${getColor(day.contributionCount)}" rx="2" ry="2" class="contribution-square"/>`;
        });
    });
    
    const contributionPoints = [];
    contributionData.forEach((week, weekIndex) => {
        week.contributionDays.forEach((day, dayIndex) => {
            if (day.contributionCount > 0) {
                contributionPoints.push({
                    date: day.date, x: weekIndex * (SQUARE_SIZE + SQUARE_GAP) + SQUARE_SIZE / 2, y: dayIndex * (SQUARE_SIZE + SQUARE_GAP) + SQUARE_SIZE / 2
                });
            }
        });
    });
    contributionPoints.sort((a, b) => new Date(a.date) - new Date(b.date));

    if (contributionPoints.length < 2) {
        return `<svg width="${GRID_WIDTH}" height="${GRID_HEIGHT}" viewBox="0 0 ${GRID_WIDTH} ${GRID_HEIGHT}" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#0D1117"/><text x="${GRID_WIDTH/2}" y="${GRID_HEIGHT/2}" fill="#888" font-family="sans-serif" font-size="12" text-anchor="middle">Awaiting contributions to begin the patrol...</text></svg>`;
    }

    // 2. Interactive and Animated Pantheon Artifacts
    let pantheonArtifacts = '';
    let nexusConduits = '';
    const artifactPoints = [...contributionPoints].sort(() => 0.5 - Math.random()).slice(0, 5);
    const artifactDefs = [
        // Captain America's Shield
        { id: 'shield', def: `<g class="artifact" id="shield-artifact"><g transform="scale(0.6)"><circle cx="0" cy="0" r="12" stroke="#FF4136" stroke-width="2.5"/><circle cx="0" cy="0" r="8" stroke="#FFFFFF" stroke-width="2.5"/><circle cx="0" cy="0" r="4" stroke="#0074D9" stroke-width="2.5"/><polygon points="0,-4.5 1.3,-1.8 4.28,-1.38 2.1,0.7 2.6,3.6 0,2.2 -2.6,3.6 -2.1,0.7 -4.28,-1.38 -1.3,-1.8" fill="#FFFFFF"/></g><circle class="hover-effect" cx="0" cy="0" r="1" fill="none" stroke="white" stroke-width="2"><animate attributeName="r" values="1; 20" dur="0.5s" begin="indefinite" fill="freeze" /><animate attributeName="opacity" values="1; 0" dur="0.5s" begin="indefinite" fill="freeze" /></circle></g>`},
        // Iron Man's Arc Reactor
        { id: 'reactor', def: `<g class="artifact" id="reactor-artifact"><g transform="scale(0.5)" class="main-icon"><circle cx="0" cy="0" r="12" stroke="#00BFFF" stroke-width="3"/><circle cx="0" cy="0" r="4" fill="#FFFFFF"/><animateTransform attributeName="transform" type="rotate" from="0 0 0" to="360 0 0" dur="10s" repeatCount="indefinite" /></g><circle cx="0" cy="0" r="8" fill="#00BFFF" filter="url(#pulse-glow)" class="hover-effect" opacity="0.3"><animate attributeName="r" values="8; 12; 8" dur="2s" begin="indefinite" repeatCount="indefinite" /></circle></g>`},
        // Thor's Hammer
        { id: 'hammer', def: `<g class="artifact" id="hammer-artifact"><g transform="scale(0.7)"><rect x="-10" y="-15" width="20" height="15" fill="#AAAAAA" /><rect x="-3" y="0" width="6" height="20" fill="#8B4513" /><g filter="url(#lightning-glow)"><path d="M5,-15 L-5,0 L5,0 L-5,15" stroke="#00BFFF" stroke-width="1.5"><animate attributeName="opacity" values="0;1;0" dur="2s" begin="${Math.random()*2}s" repeatCount="indefinite" /></path></g></g><path class="hover-effect" d="M-15,0 L-10,-10 L0,-5 L10,-10 L15,0 L10,10 L0,5 L-10,10 Z" fill="rgba(0, 191, 255, 0.7)" opacity="0"><animate attributeName="opacity" values="0;1;0" dur="0.4s" begin="indefinite" fill="freeze"/></path></g>`},
        // Crossed Lightsabers
        { id: 'sabers', def: `<g class="artifact" id="sabers-artifact"><g transform="scale(0.6)"><g transform="rotate(-30)"><rect x="-2" y="-18" width="4" height="36" fill="#0074D9" filter="url(#saber-glow-blue)" /><rect x="-1" y="18" width="2" height="4" fill="#AAAAAA" /></g><g transform="rotate(30)"><rect x="-2" y="-18" width="4" height="36" fill="#FF4136" filter="url(#saber-glow-red)" /><rect x="-1" y="18" width="2" height="4" fill="#AAAAAA" /></g></g><path class="hover-effect" d="M-4,2 L0,-2 L4,2 L0,6 Z" fill="white" transform="scale(1.5)"><animate attributeName="opacity" values="0;1;0" dur="0.3s" begin="indefinite" fill="freeze"/></path></g>`},
        // Millennium Falcon
        { id: 'falcon', def: `<g class="artifact" id="falcon-artifact"><g transform="scale(0.5)" stroke-width="2" stroke="#AAAAAA" fill="none"><path d="M0,0 C-20,15 -20,-15 0,0 M-10,0 L-18,5 L-18, -5 L-10,0 M-10,0 H10 A12 12 0 0 1 10,0"/><circle cx="10" cy="0" r="5"/><path class="main-icon" d="M-10,0 L-18,5 L-18, -5 L-10,0" fill="#00BFFF" stroke="none" filter="url(#engine-glow)"><animate attributeName="opacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite"/></path></g><path class="hover-effect" d="M-20,-2 L-10,0 L-20,2" stroke-width="2" stroke="white"><animateTransform attributeName="transform" type="translate" from="0 0" to="40 0" dur="0.5s" begin="indefinite" fill="freeze"/><animate attributeName="opacity" values="1;0" dur="0.5s" begin="indefinite" fill="freeze"/></path></g>`},
    ];

    artifactPoints.forEach((point, index) => {
        if(artifactDefs[index]){
            pantheonArtifacts += `<g transform="translate(${point.x}, ${point.y})">${artifactDefs[index].def}</g>`;
        }
    });

    // Create pulsing conduits between artifacts
    for (let i = 0; i < artifactPoints.length; i++) {
        const p1 = artifactPoints[i];
        const p2 = artifactPoints[(i + 2) % artifactPoints.length]; // Connect in a pentagram shape
        const len = Math.hypot(p2.x - p1.x, p2.y - p1.y);
        nexusConduits += `<path d="M${p1.x},${p1.y} L${p2.x},${p2.y}" stroke-width="1" stroke="rgba(0, 191, 255, 0.5)" stroke-dasharray="5 ${len-5}" stroke-linecap="round">
            <animate attributeName="stroke-dashoffset" from="0" to="${len}" dur="${5 + Math.random()*5}s" begin="${Math.random()*3}s" repeatCount="indefinite"/>
        </path>`;
    }


    // 3. Patrol Path
    const forwardDuration = contributionPoints.length * 0.25;
    const backwardDuration = forwardDuration * 0.7; 
    const totalLoopDuration = forwardDuration + backwardDuration;
    const pathData = contributionPoints.map((p, i) => (i === 0 ? 'M' : 'L') + `${p.x} ${p.y}`).join(' ');

    // 4. Final SVG Assembly
    return `
    <svg width="${GRID_WIDTH}" height="${GRID_HEIGHT}" viewBox="0 0 ${GRID_WIDTH} ${GRID_HEIGHT}" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
        <style>
            .artifact .hover-effect { visibility: hidden; }
            .artifact:hover .hover-effect { visibility: visible; }
            .artifact:hover .hover-effect > animate,
            .artifact:hover .hover-effect > animateTransform {
                begin: 0s;
            }
            #reactor-artifact:hover .main-icon {
                animation: reactor-pulse 0.5s ease-in-out;
            }
            @keyframes reactor-pulse { 0% { transform: scale(0.5); } 50% { transform: scale(0.55); } 100% { transform: scale(0.5); } }
            .contribution-square:hover {
                stroke: rgba(255,255,255,0.7);
                stroke-width: 1;
            }
        </style>
        <defs>
            <!-- Filters -->
            <filter id="engine-glow"><feGaussianBlur stdDeviation="2" /></filter>
            <filter id="lightning-glow"><feGaussianBlur stdDeviation="1.5" /></filter>
            <filter id="pulse-glow"><feGaussianBlur stdDeviation="3" /></filter>
            <filter id="saber-glow-blue"><feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" /><feFlood flood-color="#00BFFF" /><feComposite in2="blur" operator="in" result="glow" /><feMerge><feMergeNode in="glow"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            <filter id="saber-glow-red"><feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" /><feFlood flood-color="#FF4136" /><feComposite in2="blur" operator="in" result="glow" /><feMerge><feMergeNode in="glow"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            <filter id="eye-glow"><feGaussianBlur stdDeviation="5" /></filter>

            <!-- Gradients -->
            <radialGradient id="nebula1"><stop offset="0%" stop-color="rgba(0, 116, 217, 0.2)" /><stop offset="100%" stop-color="rgba(0, 116, 217, 0)" /></radialGradient>
            <radialGradient id="planet-gradient" cx="30%" cy="30%"><stop offset="0%" stop-color="#556" /><stop offset="100%" stop-color="#111" /></radialGradient>
            <linearGradient id="eye-gradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="rgba(255,255,255,0.1)"/><stop offset="100%" stop-color="rgba(255,255,255,0)"/></linearGradient>
            <radialGradient id="iris-gradient"><stop offset="0%" stop-color="#FFD700" /><stop offset="100%" stop-color="#FF8C00" /></radialGradient>
        </defs>

        <!-- Layer 0: Deep Space -->
        <rect width="100%" height="100%" fill="#0D1117"/>
        <rect width="800" height="400" x="${GRID_WIDTH/2 - 400}" y="${GRID_HEIGHT/2 - 200}" fill="url(#nebula1)" opacity="0.5" />
        
        <!-- Layer 1: Celestial Bodies -->
        <circle id="orbit-path" cx="${GRID_WIDTH/2}" cy="${GRID_HEIGHT*1.5}" r="${GRID_WIDTH*0.8}" fill="none"/>
        <g><circle r="40" fill="url(#planet-gradient)"><animateMotion dur="90s" repeatCount="indefinite" rotate="auto"><mpath xlink:href="#orbit-path"/></animateMotion></circle></g>
        <g id="guardian-eye" transform="translate(${GRID_WIDTH/2} ${GRID_HEIGHT/2})" opacity="0.4">
            <path d="M-150,0 Q0,-50 150,0 Q0,50 -150,0 Z" fill="url(#eye-gradient)" />
            <g id="iris" transform="translate(0, 0)">
                <circle r="25" fill="url(#iris-gradient)" filter="url(#eye-glow)"/>
                <circle r="10" fill="#000"/>
                <animateTransform attributeName="transform" type="translate" dur="15s" repeatCount="indefinite" calcMode="spline" keyTimes="0; 0.4; 0.5; 0.6; 1" values="0,0; -40,5; 0,0; 40,-5; 0,0" keySplines="0.5 0 0.5 1; 0.5 0 0.5 1; 0.5 0 0.5 1; 0.5 0 0.5 1" />
            </g>
            <path d="M-150,0 Q0,-50 150,0" stroke="#FFF" stroke-width="1" fill="none" opacity="0.5" id="upper-lid" />
            <path d="M-150,0 Q0,0 150,0" stroke="#000" stroke-width="20" fill="none" id="blink" opacity="1">
                <animate attributeName="d" dur="0.25s" begin="10s" repeatCount="indefinite" values="M-150,0 Q0,0 150,0; M-150,0 Q0,-50 150,0; M-150,0 Q0,0 150,0" />
            </path>
        </g>
        
        <!-- Layer 2: Contribution Grid & Nexus -->
        <g opacity="0.6">${gridSquares}</g>
        <g id="nexus-conduits" opacity="0.7">${nexusConduits}</g>

        <!-- Layer 3: Pantheon -->
        <g id="pantheon-artifacts">${pantheonArtifacts}</g>

        <!-- Layer 4: The Patrol -->
        <g id="x-wing">
            <g transform="scale(1.2)">
                <polygon points="-10,0 -5,-2 10,-2 12,0 10,2 -5,2" fill="#AAAAAA" />
                <polygon points="-8,-2 -12,-6 5,-3" fill="#D3D3D3" />
                <polygon points="-8,2 -12,6 5,3" fill="#D3D3D3" />
                <g transform="translate(-10, 0)" filter="url(#engine-glow)">
                    <circle cx="0" cy="-3.5" r="1.5" fill="#FF851B"><animate attributeName="r" values="1.5; 2; 1.5" dur="0.2s" repeatCount="indefinite" /></circle>
                    <circle cx="0" cy="3.5" r="1.5" fill="#FF851B"><animate attributeName="r" values="1.5; 2; 1.5" dur="0.2s" repeatCount="indefinite" /></circle>
                </g>
            </g>
            <animateMotion dur="${totalLoopDuration}s" repeatCount="indefinite" path="${pathData}" rotate="auto-reverse" />
        </g>
    </svg>`;
}

// --- Main Execution Logic ---
async function main() {
    const weeks = await fetchData();
    if (!weeks) {
        console.error('Execution stopped due to data fetch failure.');
        return;
    }

    let days = weeks.flatMap(week => week.contributionDays);
    days.sort((a, b) => new Date(b.date) - new Date(a.date));

    let streak = 0;
    if (days.length > 0 && days[0].contributionCount > 0) {
        for (const day of days) {
            if (day.contributionCount > 0) {
                streak++;
            } else {
                break;
            }
        }
    }

    console.log(`Current streak: ${streak} days.`);
    const svg = generateSVG(streak, weeks);

    const dir = 'dist';
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync('dist/eye.svg', svg);
    
    console.log('Successfully forged dist/eye.svg, the Living Cosmic Nexus!');
}

main();