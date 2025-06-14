// FINAL, ULTIMATE "COSMIC GENESIS" VERSION
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

// Generates a unique, looping, organic path for each fragment
function generateCosmicPath(id) {
    const cx = GRID_WIDTH / 2;
    const cy = GRID_HEIGHT / 2;
    let path = `M ${cx}, ${cy} C`;
    const points = 4 + Math.floor(Math.random() * 3); // 4 to 6 control points
    for(let i = 0; i < points; i++){
        const angle = (i/points) * 2 * Math.PI;
        const r1 = GRID_WIDTH * (0.3 + Math.random() * 0.2);
        const r2 = GRID_HEIGHT * (0.3 + Math.random() * 0.2);
        const x = cx + r1 * Math.cos(angle + Math.random() * 0.5 - 0.25);
        const y = cy + r2 * Math.sin(angle + Math.random() * 0.5 - 0.25);
        const c1x = cx + r1 * 0.8 * Math.cos(angle - 0.3);
        const c1y = cy + r2 * 0.8 * Math.sin(angle - 0.3);
        const c2x = cx + r1 * 0.8 * Math.cos(angle + 0.3);
        const c2y = cy + r2 * 0.8 * Math.sin(angle + 0.3);
        path += ` ${c1x} ${c1y}, ${c2x} ${c2y}, ${x} ${y} S`;
    }
    path += ` ${cx} ${cy}, ${cx} ${cy}`; // Loop back to center
    return `<path id="path-${id}" d="${path}" fill="none"/>`;
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

    // 2. Genesis Fragments (Artifacts) with dynamic creation
    let genesisFragments = '';
    let fragmentPaths = '';
    const artifactDefs = [
        `<g transform="scale(0.6)"><circle cx="0" cy="0" r="12" stroke="#FF4136" stroke-width="2.5"/><circle cx="0" cy="0" r="8" stroke="#FFFFFF" stroke-width="2.5"/><circle cx="0" cy="0" r="4" stroke="#0074D9" stroke-width="2.5"/><polygon points="0,-4.5 1.3,-1.8 4.28,-1.38 2.1,0.7 2.6,3.6 0,2.2 -2.6,3.6 -2.1,0.7 -4.28,-1.38 -1.3,-1.8" fill="#FFFFFF"/></g>`,
        `<g transform="scale(0.5)"><circle cx="0" cy="0" r="12" stroke="#00BFFF" stroke-width="3"/><circle cx="0" cy="0" r="4" fill="#FFFFFF"/><animateTransform attributeName="transform" type="rotate" from="0 0 0" to="360 0 0" dur="10s" repeatCount="indefinite" /></g>`,
        `<g transform="scale(0.7)"><rect x="-10" y="-15" width="20" height="15" fill="#AAAAAA" /><rect x="-3" y="0" width="6" height="20" fill="#8B4513" /><g filter="url(#lightning-glow)"><path d="M5,-15 L-5,0 L5,0 L-5,15" stroke="#00BFFF" stroke-width="1.5"><animate attributeName="opacity" values="0;1;0" dur="2s" begin="${Math.random()*2}s" repeatCount="indefinite" /></path></g></g>`,
        `<g transform="scale(0.6)"><g transform="rotate(-30)"><rect x="-2" y="-18" width="4" height="36" fill="#0074D9" filter="url(#saber-glow-blue)" /><rect x="-1" y="18" width="2" height="4" fill="#AAAAAA" /></g><g transform="rotate(30)"><rect x="-2" y="-18" width="4" height="36" fill="#FF4136" filter="url(#saber-glow-red)" /><rect x="-1" y="18" width="2" height="4" fill="#AAAAAA" /></g></g>`,
        `<g transform="scale(0.5)" stroke-width="2" stroke="#AAAAAA" fill="none"><path d="M0,0 C-20,15 -20,-15 0,0 M-10,0 L-18,5 L-18, -5 L-10,0 M-10,0 H10 A12 12 0 0 1 10,0"/><circle cx="10" cy="0" r="5"/></g>`
    ];

    artifactDefs.forEach((def, i) => {
        fragmentPaths += generateCosmicPath(i);
        const duration = 20 + Math.random() * 20; // 20-40s orbit
        genesisFragments += `
            <g class="fragment" opacity="0">
                ${def}
                <animate attributeName="opacity" values="0; 1; 1; 0" dur="${duration}s" begin="${i * 4}s" repeatCount="indefinite" />
                <animateTransform attributeName="transform" type="scale" values="0; 1; 1; 0" dur="${duration}s" begin="${i * 4}s" repeatCount="indefinite" additive="sum"/>
                <animateMotion dur="${duration}s" begin="${i * 4}s" repeatCount="indefinite" rotate="auto">
                    <mpath xlink:href="#path-${i}"/>
                </animateMotion>
            </g>`;
    });

    // 3. Patrol Ship with Dynamic Speed
    const patrolPath = contributionPoints.map((p, i) => (i === 0 ? 'M' : 'L') + `${p.x} ${p.y}`).join(' ');
    const forwardDuration = Math.max(5, contributionPoints.length * 0.15); // Faster pace, 5s minimum
    const backwardDuration = forwardDuration * 0.7; 
    const totalLoopDuration = forwardDuration + backwardDuration;
    const t_endForward = forwardDuration / totalLoopDuration;

    // 4. Final SVG Assembly
    return `
    <svg width="${GRID_WIDTH}" height="${GRID_HEIGHT}" viewBox="0 0 ${GRID_WIDTH} ${GRID_HEIGHT}" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
        <style>
            .contribution-square:hover { stroke: rgba(255,255,255,0.7); stroke-width: 1; }
            .fragment:hover { filter: url(#hover-glow); transform: scale(1.5); }
        </style>
        <defs>
            <!-- Filters -->
            <filter id="blur"><feGaussianBlur stdDeviation="3" /></filter>
            <filter id="hover-glow"><feDropShadow dx="0" dy="0" stdDeviation="4" flood-color="rgba(255, 255, 180, 0.7)"/></filter>
            <filter id="engine-glow"><feGaussianBlur stdDeviation="2" /></filter>
            <filter id="lightning-glow"><feGaussianBlur stdDeviation="1.5" /></filter>
            <filter id="saber-glow-blue"><feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" /><feFlood flood-color="#00BFFF" /><feComposite in2="blur" operator="in" result="glow" /><feMerge><feMergeNode in="glow"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            <filter id="saber-glow-red"><feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" /><feFlood flood-color="#FF4136" /><feComposite in2="blur" operator="in" result="glow" /><feMerge><feMergeNode in="glow"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            
            <!-- Fragment Paths -->
            ${fragmentPaths}

            <!-- Cosmic Dust Path -->
            <path id="dust-path" d="M0,${GRID_HEIGHT*0.2} q${GRID_WIDTH*0.25},${GRID_HEIGHT*0.5} ${GRID_WIDTH*0.5},0 t${GRID_WIDTH*0.5},0" />
        </defs>

        <!-- Layer 0: Deep Space & Cosmic Dust -->
        <rect width="100%" height="100%" fill="#0D1117"/>
        <g stroke-dasharray="1 80" stroke-linecap="round" stroke="rgba(255,255,255,0.3)">
            <use xlink:href="#dust-path" y="-${GRID_HEIGHT*0.1}" stroke-width="1"><animate attributeName="stroke-dashoffset" from="0" to="81" dur="15s" repeatCount="indefinite" /></use>
            <use xlink:href="#dust-path" y="${GRID_HEIGHT*0.4}" stroke-width="2"><animate attributeName="stroke-dashoffset" from="0" to="-81" dur="12s" repeatCount="indefinite" /></use>
        </g>

        <!-- Layer 1: The Genesis Core (New Eye) -->
        <g id="genesis-core" transform="translate(${GRID_WIDTH/2} ${GRID_HEIGHT/2})">
            <g id="iris-corona" opacity="0.8">
                 <path d="M0-40 L10,-10 L40,0 L10,10 L0,40 L-10,10 L-40,0 L-10,-10 Z" fill="rgba(255, 165, 0, 0.5)" transform="scale(1.2)">
                    <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="45s" repeatCount="indefinite"/>
                    <animateTransform attributeName="transform" type="scale" values="1.2; 1.3; 1.2" dur="8s" repeatCount="indefinite" additive="sum"/>
                 </path>
                 <path d="M0-30 L7,-7 L30,0 L7,7 L0,30 L-7,7 L-30,0 L-7,-7 Z" fill="rgba(255, 215, 0, 0.7)">
                     <animateTransform attributeName="transform" type="rotate" from="360" to="0" dur="30s" repeatCount="indefinite"/>
                 </path>
            </g>
            <g id="accretion-disk" fill="none" stroke-linecap="round" opacity="0.7">
                <path d="M30,0 A30,30 0 0 0 -15,26" stroke="rgba(255,255,255,0.8)" stroke-width="1.5"><animate attributeName="stroke-dashoffset" values="50;0;0" dur="3s" repeatCount="indefinite" keyTimes="0;0.5;1" pathLength="50"/></path>
                <path d="M-25,-15 A29,29 0 0 1 20,-22" stroke="white" stroke-width="1"><animate attributeName="stroke-dashoffset" values="45;0;0" dur="4s" begin="-1.5s" repeatCount="indefinite" keyTimes="0;0.5;1" pathLength="45"/></path>
            </g>
            <circle r="12" fill="#000" />
        </g>

        <!-- Layer 2: Contribution Grid -->
        <g opacity="0.4">${gridSquares}</g>

        <!-- Layer 3: Genesis Fragments -->
        <g id="genesis-fragments">${genesisFragments}</g>

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
            <animateMotion keyPoints="0; 1; 0" keyTimes="0; ${t_endForward}; 1" path="${patrolPath}" dur="${totalLoopDuration}s" repeatCount="indefinite" rotate="auto" />
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
    
    console.log('Successfully forged dist/eye.svg - The Cosmic Genesis is complete!');
}

main();