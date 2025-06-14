// FINAL, ULTIMATE "CELESTIAL STREAM" VERSION
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
    // 1. Calculate Grid and Patrol Path Data
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

    // 2. NEW: The Celestial Stream of flowing artifacts
    let celestialStream = '';
    const artifactDefs = [
        // Captain America's Shield
        `<g transform="scale(0.6)"><circle cx="0" cy="0" r="12" stroke="#FF4136" stroke-width="2.5"/><circle cx="0" cy="0" r="8" stroke="#FFFFFF" stroke-width="2.5"/><circle cx="0" cy="0" r="4" stroke="#0074D9" stroke-width="2.5"/><polygon points="0,-4.5 1.3,-1.8 4.28,-1.38 2.1,0.7 2.6,3.6 0,2.2 -2.6,3.6 -2.1,0.7 -4.28,-1.38 -1.3,-1.8" fill="#FFFFFF"/></g>`,
        // Iron Man's Arc Reactor
        `<g transform="scale(0.5)"><circle cx="0" cy="0" r="12" stroke="#00BFFF" stroke-width="3"/><circle cx="0" cy="0" r="4" fill="#FFFFFF"/><animateTransform attributeName="transform" type="rotate" from="0 0 0" to="360 0 0" dur="10s" repeatCount="indefinite" /></g>`,
        // Thor's Hammer
        `<g transform="scale(0.7)"><rect x="-10" y="-15" width="20" height="15" fill="#AAAAAA" /><rect x="-3" y="0" width="6" height="20" fill="#8B4513" /><g filter="url(#lightning-glow)"><path d="M5,-15 L-5,0 L5,0 L-5,15" stroke="#00BFFF" stroke-width="1.5"><animate attributeName="opacity" values="0;1;0" dur="2s" begin="${Math.random()*2}s" repeatCount="indefinite" /></path></g></g>`,
        // Crossed Lightsabers
        `<g transform="scale(0.6)"><g transform="rotate(-30)"><rect x="-2" y="-18" width="4" height="36" fill="#0074D9" filter="url(#saber-glow-blue)" /><rect x="-1" y="18" width="2" height="4" fill="#AAAAAA" /></g><g transform="rotate(30)"><rect x="-2" y="-18" width="4" height="36" fill="#FF4136" filter="url(#saber-glow-red)" /><rect x="-1" y="18" width="2" height="4" fill="#AAAAAA" /></g></g>`,
        // Millennium Falcon
        `<g transform="scale(0.5)" stroke-width="2" stroke="#AAAAAA" fill="none"><path d="M0,0 C-20,15 -20,-15 0,0 M-10,0 L-18,5 L-18, -5 L-10,0 M-10,0 H10 A12 12 0 0 1 10,0"/><circle cx="10" cy="0" r="5"/></g>`
    ];

    artifactDefs.forEach((def, i) => {
        const duration = 25 + Math.random() * 15; // 25-40s orbit time
        const delay = (i / artifactDefs.length) * duration;
        
        celestialStream += `
            <g class="artifact">
                ${def}
                <animateMotion dur="${duration}s" begin="-${delay}s" repeatCount="indefinite" rotate="auto">
                    <mpath xlink:href="#celestial-path"/>
                </animateMotion>
                <animateTransform attributeName="transform" type="translate" additive="sum"
                    values="0 0; 0 5; 0 0" keyTimes="0; 0.5; 1" dur="${6 + Math.random()*4}s" repeatCount="indefinite" />
            </g>`;
    });

    // 3. Patrol Path for X-Wing
    const patrolPath = contributionPoints.map((p, i) => (i === 0 ? 'M' : 'L') + `${p.x} ${p.y}`).join(' ');

    // 4. Final SVG Assembly
    return `
    <svg width="${GRID_WIDTH}" height="${GRID_HEIGHT}" viewBox="0 0 ${GRID_WIDTH} ${GRID_HEIGHT}" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
        <style>
            .contribution-square:hover { stroke: rgba(255,255,255,0.7); stroke-width: 1; }
            .artifact { transition: transform 0.2s ease-out; }
            .artifact:hover { transform: scale(1.5); filter: url(#hover-glow); }
        </style>
        <defs>
            <!-- Filters -->
            <filter id="blur"><feGaussianBlur stdDeviation="5" /></filter>
            <filter id="hover-glow"><feGaussianBlur stdDeviation="3.5" /></filter>
            <filter id="engine-glow"><feGaussianBlur stdDeviation="2" /></filter>
            <filter id="lightning-glow"><feGaussianBlur stdDeviation="1.5" /></filter>
            <filter id="saber-glow-blue"><feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" /><feFlood flood-color="#00BFFF" /><feComposite in2="blur" operator="in" result="glow" /><feMerge><feMergeNode in="glow"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            <filter id="saber-glow-red"><feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" /><feFlood flood-color="#FF4136" /><feComposite in2="blur" operator="in" result="glow" /><feMerge><feMergeNode in="glow"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            
            <!-- Gradients -->
            <radialGradient id="iris-gradient"><stop offset="0%" stop-color="#FFD700" /><stop offset="50%" stop-color="#FF8C00" /><stop offset="100%" stop-color="#FF4500" /></radialGradient>
            <radialGradient id="nebula-lid-gradient" cx="50%" cy="50%" r="50%"><stop offset="60%" stop-color="rgba(138, 43, 226, 0)" /><stop offset="100%" stop-color="rgba(138, 43, 226, 0.4)" /></radialGradient>
            
            <!-- Paths -->
            <ellipse id="celestial-path" cx="${GRID_WIDTH/2}" cy="${GRID_HEIGHT/2}" rx="${GRID_WIDTH*0.45}" ry="${GRID_HEIGHT*0.3}" transform="rotate(10 ${GRID_WIDTH/2} ${GRID_HEIGHT/2})"/>
        </defs>

        <!-- Layer 0: Deep Space -->
        <rect width="100%" height="100%" fill="#0D1117"/>
        
        <!-- Layer 1: The Iris Nebula (New Eye) -->
        <g id="iris-nebula" transform="translate(${GRID_WIDTH/2} ${GRID_HEIGHT/2})">
            <!-- The 'Lids' are soft nebulae -->
            <path id="upper-lid" d="M -${GRID_WIDTH/2},0 C -${GRID_WIDTH/4},-${GRID_HEIGHT/2.5} ${GRID_WIDTH/4},-${GRID_HEIGHT/2.5} ${GRID_WIDTH/2},0" fill="url(#nebula-lid-gradient)" filter="url(#blur)">
                <animate attributeName="d" dur="0.4s" begin="12s" repeatCount="indefinite" values="M -${GRID_WIDTH/2},0 C -${GRID_WIDTH/4},-${GRID_HEIGHT/2.5} ${GRID_WIDTH/4},-${GRID_HEIGHT/2.5} ${GRID_WIDTH/2},0; M -${GRID_WIDTH/2},0 C -${GRID_WIDTH/4},-10 ${GRID_WIDTH/4},-10 ${GRID_WIDTH/2},0; M -${GRID_WIDTH/2},0 C -${GRID_WIDTH/4},-${GRID_HEIGHT/2.5} ${GRID_WIDTH/4},-${GRID_HEIGHT/2.5} ${GRID_WIDTH/2},0" />
            </path>
            <path id="lower-lid" d="M -${GRID_WIDTH/2},0 C -${GRID_WIDTH/4},${GRID_HEIGHT/2.5} ${GRID_WIDTH/4},${GRID_HEIGHT/2.5} ${GRID_WIDTH/2},0" fill="url(#nebula-lid-gradient)" filter="url(#blur)">
                 <animate attributeName="d" dur="0.4s" begin="12s" repeatCount="indefinite" values="M -${GRID_WIDTH/2},0 C -${GRID_WIDTH/4},${GRID_HEIGHT/2.5} ${GRID_WIDTH/4},${GRID_HEIGHT/2.5} ${GRID_WIDTH/2},0; M -${GRID_WIDTH/2},0 C -${GRID_WIDTH/4},10 ${GRID_WIDTH/4},10 ${GRID_WIDTH/2},0; M -${GRID_WIDTH/2},0 C -${GRID_WIDTH/4},${GRID_HEIGHT/2.5} ${GRID_WIDTH/4},${GRID_HEIGHT/2.5} ${GRID_WIDTH/2},0" />
            </path>
            
            <!-- The 'Iris' is a pulsing star -->
            <g id="iris-core">
                <animateTransform attributeName="transform" type="translate" dur="20s" repeatCount="indefinite" calcMode="spline" keyTimes="0; 0.4; 0.5; 0.6; 1" values="0,0; -40,5; 0,0; 40,-5; 0,0" keySplines="0.5 0 0.5 1; 0.5 0 0.5 1; 0.5 0 0.5 1; 0.5 0 0.5 1" />
                <circle r="40" fill="url(#iris-gradient)" opacity="0.8">
                     <animate attributeName="r" values="40; 42; 40" dur="7s" repeatCount="indefinite"/>
                </circle>
                <path d="M0-35 L5,-5 L35,0 L5,5 L0,35 L-5,5 L-35,0 L-5,-5 Z" fill="rgba(255, 223, 186, 0.4)">
                    <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="30s" repeatCount="indefinite"/>
                </path>
                <circle r="12" fill="#000" />
            </g>
        </g>
        
        <!-- Layer 2: Contribution Grid -->
        <g opacity="0.5">${gridSquares}</g>

        <!-- Layer 3: The Celestial Stream -->
        <g id="celestial-stream">${celestialStream}</g>

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
            <animateMotion dur="40s" repeatCount="indefinite" path="${patrolPath}" rotate="auto-reverse" />
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
    
    console.log('Successfully generated dist/eye.svg, featuring the Celestial Stream!');
}

main();