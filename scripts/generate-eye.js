// FINAL, ULTIMATE "COSMIC PANTHEON" VERSION - MORE ALIVE
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
    // 1. Initial calculations & Background Elements
    let stars = '';
    for (let i = 0; i < 200; i++) {
        const x = Math.random() * GRID_WIDTH;
        const y = Math.random() * GRID_HEIGHT;
        const r = Math.random() * 0.7 + 0.2;
        const animDur = Math.random() * 2 + 3; // 3-5 seconds duration
        const animDelay = Math.random() * 3;
        
        // Make ~25% of stars twinkle
        if (i % 4 === 0) {
             stars += `<circle cx="${x}" cy="${y}" r="${r}" fill="#FFF">
                <animate attributeName="opacity" values="0.3;1;0.3" dur="${animDur}s" begin="${animDelay}s" repeatCount="indefinite" />
             </circle>`;
        } else {
            stars += `<circle cx="${x}" cy="${y}" r="${r}" fill="#777" />`;
        }
    }

    let shootingStars = '';
    for (let i = 0; i < 3; i++) {
        const startX = Math.random() * GRID_WIDTH;
        const startY = Math.random() * GRID_HEIGHT;
        const endX = startX - (Math.random() * 100 + 50); // Move left
        const endY = startY + (Math.random() * 100 + 50); // Move down
        const dur = Math.random() * 1.5 + 0.8; // 0.8-2.3s duration
        const delay = Math.random() * 10 + 5; // 5-15s delay
        shootingStars += `<path d="M${startX},${startY} L${endX},${endY}" stroke="#FFF" stroke-width="1" stroke-linecap="round" opacity="0">
            <animate attributeName="opacity" values="0; 0.8; 0" dur="${dur}s" begin="${delay}s" repeatCount="indefinite" />
        </path>`;
    }

    let gridSquares = '';
    contributionData.forEach((week, weekIndex) => {
        week.contributionDays.forEach((day, dayIndex) => {
            gridSquares += `<rect x="${weekIndex * (SQUARE_SIZE + SQUARE_GAP)}" y="${dayIndex * (SQUARE_SIZE + SQUARE_GAP)}" width="${SQUARE_SIZE}" height="${SQUARE_SIZE}" fill="${getColor(day.contributionCount)}" rx="2" ry="2"/>`;
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

    // 2. NEW & IMPROVED: Anchor the *LIVING* Pantheon to random contribution squares
    let pantheonArtifacts = '';
    const artifactPoints = [...contributionPoints].sort(() => 0.5 - Math.random()).slice(0, 5);
    const artifactDefs = [
        // Captain America's Shield with Shine
        `<g transform="scale(0.6)">
            <defs><clipPath id="shield-clip"><circle cx="0" cy="0" r="12"/></clipPath></defs>
            <circle cx="0" cy="0" r="12" stroke="#FF4136" stroke-width="2.5"/><circle cx="0" cy="0" r="8" stroke="#FFFFFF" stroke-width="2.5"/><circle cx="0" cy="0" r="4" stroke="#0074D9" stroke-width="2.5"/><polygon points="0,-4.5 1.3,-1.8 4.28,-1.38 2.1,0.7 2.6,3.6 0,2.2 -2.6,3.6 -2.1,0.7 -4.28,-1.38 -1.3,-1.8" fill="#FFFFFF"/>
            <rect x="-20" y="-15" width="10" height="40" fill="white" opacity="0.4" transform="rotate(-45)" clip-path="url(#shield-clip)">
                <animateTransform attributeName="transform" type="translate" from="0 0" to="40 40" dur="2.5s" begin="${Math.random()*5}s" repeatCount="indefinite" />
            </rect>
        </g>`,
        // Iron Man's Arc Reactor with Pulse
        `<g transform="scale(0.5)" filter="url(#pulse-glow)">
            <circle cx="0" cy="0" r="12" stroke="#00BFFF" stroke-width="3"/><circle cx="0" cy="0" r="4" fill="#FFFFFF"/>
            <animateTransform attributeName="transform" type="rotate" from="0 0 0" to="360 0 0" dur="10s" repeatCount="indefinite" />
        </g>`,
        // Thor's Hammer with Lightning
        `<g transform="scale(0.7)">
            <rect x="-10" y="-15" width="20" height="15" fill="#AAAAAA" /><rect x="-3" y="0" width="6" height="20" fill="#8B4513" />
            <g filter="url(#lightning-glow)"><path d="M5,-15 L-5,0 L5,0 L-5,15" stroke="#00BFFF" stroke-width="1.5">
                <animate attributeName="opacity" values="0;1;0" dur="2s" begin="${Math.random()*2}s" repeatCount="indefinite" /></path>
            </g>
        </g>`,
        // Crossed Lightsabers with Humming Glow
        `<g transform="scale(0.6)">
            <g transform="rotate(-30)">
                <rect x="-2" y="-18" width="4" height="36" fill="#0074D9" filter="url(#saber-glow-blue)" /><rect x="-1" y="18" width="2" height="4" fill="#AAAAAA" />
            </g>
            <g transform="rotate(30)">
                <rect x="-2" y="-18" width="4" height="36" fill="#FF4136" filter="url(#saber-glow-red)" /><rect x="-1" y="18" width="2" height="4" fill="#AAAAAA" />
            </g>
        </g>`,
        // Millennium Falcon with Engine Glow
        `<g transform="scale(0.5)" stroke-width="2" stroke="#AAAAAA" fill="none">
            <path d="M0,0 C-20,15 -20,-15 0,0 M-10,0 L-18,5 L-18, -5 L-10,0 M-10,0 H10 A12 12 0 0 1 10,0"/><circle cx="10" cy="0" r="5"/>
            <path d="M-10,0 L-18,5 L-18, -5 L-10,0" fill="#00BFFF" stroke="none" filter="url(#engine-glow)">
                 <animate attributeName="opacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite"/>
            </path>
        </g>`
    ];

    artifactPoints.forEach((point, index) => {
        if(artifactDefs[index]){
            pantheonArtifacts += `<g transform="translate(${point.x}, ${point.y})">${artifactDefs[index]}</g>`;
        }
    });

    // 3. Slower, continuous patrol loop
    const forwardDuration = contributionPoints.length * 0.25;
    const backwardDuration = forwardDuration * 0.7; 
    const totalLoopDuration = forwardDuration + backwardDuration;
    const t_start = 0, t_endForward = forwardDuration / totalLoopDuration, t_end = 1.0;
    const pathData = contributionPoints.map((p, i) => (i === 0 ? 'M' : 'L') + `${p.x} ${p.y}`).join(' ');
    const pathLength = contributionPoints.length * 20;

    // 4. Final SVG Assembly
    return `
    <svg width="${GRID_WIDTH}" height="${GRID_HEIGHT}" viewBox="0 0 ${GRID_WIDTH} ${GRID_HEIGHT}" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
        <defs>
            <!-- Filters for Glow Effects -->
            <filter id="engine-glow"><feGaussianBlur stdDeviation="2" result="coloredBlur" /><feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
            <filter id="lightning-glow"><feGaussianBlur stdDeviation="1.5" /></filter>
            <filter id="pulse-glow">
                <feGaussianBlur stdDeviation="2.5">
                    <animate attributeName="stdDeviation" values="2.5; 3.5; 2.5" dur="3s" repeatCount="indefinite" />
                </feGaussianBlur>
            </filter>
            <filter id="saber-glow-blue">
                 <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
                 <feFlood flood-color="#00BFFF" result="color" />
                 <feComposite in="color" in2="blur" operator="in" result="glow" />
                 <feMerge><feMergeNode in="glow"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <filter id="saber-glow-red">
                 <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
                 <feFlood flood-color="#FF4136" result="color" />
                 <feComposite in="color" in2="blur" operator="in" result="glow" />
                 <feMerge><feMergeNode in="glow"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            
            <!-- Trail Gradient -->
            <linearGradient id="trailGradient" gradientTransform="rotate(90)">
                <stop offset="0%" stop-color="rgba(255, 65, 54, 0.8)" /><stop offset="100%" stop-color="rgba(255, 65, 54, 0)" />
            </linearGradient>

            <!-- Nebula Gradients -->
            <radialGradient id="nebula1" cx="50%" cy="50%" r="50%" fx="50%" fy="50%"><stop offset="0%" stop-color="rgba(0, 116, 217, 0.2)" /><stop offset="100%" stop-color="rgba(0, 116, 217, 0)" /></radialGradient>
            <radialGradient id="nebula2" cx="50%" cy="50%" r="50%" fx="50%" fy="50%"><stop offset="0%" stop-color="rgba(255, 65, 54, 0.15)" /><stop offset="100%" stop-color="rgba(255, 65, 54, 0)" /></radialGradient>
        </defs>

        <!-- Layer 1: Deep Space Background -->
        <rect width="100%" height="100%" fill="#0D1117"/>
        <rect width="800" height="400" x="${GRID_WIDTH/2 - 400}" y="${GRID_HEIGHT/2 - 200}" fill="url(#nebula1)" opacity="0.5">
             <animate attributeName="opacity" values="0.5; 0.8; 0.5" dur="25s" repeatCount="indefinite" />
        </rect>
        <rect width="600" height="300" x="${GRID_WIDTH/2 - 600}" y="${GRID_HEIGHT/2 - 100}" fill="url(#nebula2)" opacity="0.5">
             <animate attributeName="opacity" values="0.5; 0.9; 0.5" dur="35s" begin="-10s" repeatCount="indefinite" />
        </rect>
        
        <!-- Layer 2: Stars -->
        <g id="starfield">${stars}</g>
        <g id="shooting-stars">${shootingStars}</g>
        
        <!-- Layer 3: Contribution Grid -->
        <g opacity="0.6">${gridSquares}</g>
        
        <!-- Layer 4: Pantheon Artifacts -->
        <g id="pantheon-artifacts" opacity="0.9">${pantheonArtifacts}</g>

        <!-- Layer 5: The Patrol Ship & Trail -->
        <path d="${pathData}" fill="none" stroke="url(#trailGradient)" stroke-width="3" stroke-linecap="round" stroke-dasharray="${pathLength}" stroke-dashoffset="${pathLength}">
            <animate attributeName="stroke-dashoffset" keyTimes="${t_start}; ${t_endForward}; ${t_end}" values="${pathLength}; 0; ${pathLength}" dur="${totalLoopDuration}s" repeatCount="indefinite" />
        </path>
        
        <g id="x-wing">
            <g>
                <polygon points="-10,0 -5,-2 10,-2 12,0 10,2 -5,2" fill="#AAAAAA" />
                <polygon points="-8,-2 -12,-6 5,-3" fill="#D3D3D3" />
                <polygon points="-8,2 -12,6 5,3" fill="#D3D3D3" />
                <g transform="translate(-10, 0)" filter="url(#engine-glow)">
                    <circle cx="0" cy="-3.5" r="1.5" fill="#FF851B"><animate attributeName="r" values="1.5; 2; 1.5" dur="0.2s" repeatCount="indefinite" /></circle>
                    <circle cx="0" cy="3.5" r="1.5" fill="#FF851B"><animate attributeName="r" values="1.5; 2; 1.5" dur="0.2s" repeatCount="indefinite" /></circle>
                </g>
            </g>
            <animateMotion keyPoints="0; 1; 0" keyTimes="${t_start}; ${t_endForward}; ${t_end}" path="${pathData}" dur="${totalLoopDuration}s" repeatCount="indefinite" rotate="auto" />
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
    
    console.log('Successfully generated dist/eye.svg with enhanced animations!');
}

main();