// FINAL, ULTIMATE "COSMIC PANTHEON" VERSION
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
    // CORRECTED: The query is a string value, not a key.
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
            query: query, // Use the query variable here
            variables: {
                userName: GITHUB_USERNAME
            }
        })
    });
    
    const data = await response.json();

    // Minor improvement: GitHub API returns an 'errors' object on failure. Check for it.
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
    // 1. Initial calculations
    let stars = '';
    for (let i = 0; i < 200; i++) {
        const x = Math.random() * GRID_WIDTH;
        const y = Math.random() * GRID_HEIGHT;
        const r = Math.random() * 0.7 + 0.2;
        stars += `<circle cx="${x}" cy="${y}" r="${r}" fill="#777" />`;
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

    // 2. Generate "Cosmic" Background Actions
    let ideaBursts = '';
    for (let i = 0; i < 5; i++) {
        const origin = contributionPoints[Math.floor(Math.random() * contributionPoints.length)];
        const dur = Math.random() * 0.8 + 0.5;
        const delay = Math.random() * 10;
        for (let j = 0; j < 8; j++) {
            const angle = (j / 8) * 2 * Math.PI;
            const distance = Math.random() * 20 + 15;
            const endX = origin.x + Math.cos(angle) * distance;
            const endY = origin.y + Math.sin(angle) * distance;
            ideaBursts += `<circle r="1.5" fill="white" opacity="0">
                <animateMotion path="M${origin.x},${origin.y}L${endX},${endY}" dur="${dur}s" begin="${delay}s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0; 1; 0" dur="${dur}s" begin="${delay}s" repeatCount="indefinite" />
            </circle>`;
        }
    }
    
    // NEW: Anchor the Pantheon to random contribution squares
    let pantheonArtifacts = '';
    const artifactPoints = [...contributionPoints].sort(() => 0.5 - Math.random()).slice(0, 5);
    const artifactDefs = [
        // Captain America's Shield
        `<g transform="scale(0.6)"><circle cx="0" cy="0" r="12" stroke="#FF4136" stroke-width="2.5"/><circle cx="0" cy="0" r="8" stroke="#FFFFFF" stroke-width="2.5"/><circle cx="0" cy="0" r="4" stroke="#0074D9" stroke-width="2.5"/><polygon points="0,-4.5 1.3,-1.8 4.28,-1.38 2.1,0.7 2.6,3.6 0,2.2 -2.6,3.6 -2.1,0.7 -4.28,-1.38 -1.3,-1.8" fill="#FFFFFF"/></g>`,
        // Iron Man's Arc Reactor
        `<g transform="scale(0.5)"><circle cx="0" cy="0" r="12" stroke="#00BFFF" stroke-width="3"/><circle cx="0" cy="0" r="4" fill="#FFFFFF"/><animateTransform attributeName="transform" type="rotate" from="0 0 0" to="360 0 0" dur="10s" repeatCount="indefinite" /></g>`,
        // Thor's Hammer
        `<g transform="scale(0.7)"><rect x="-10" y="-15" width="20" height="15" fill="#AAAAAA" /><rect x="-3" y="0" width="6" height="20" fill="#8B4513" /><g filter="url(#lightning-glow)"><path d="M5,-15 L-5,0 L5,0 L-5,15" stroke="#00BFFF" stroke-width="1.5"><animate attributeName="opacity" values="0;1;0" dur="2s" begin="${Math.random()*2}s" repeatCount="indefinite" /></path></g></g>`,
        // Crossed Lightsabers
        `<g transform="scale(0.6)"><g transform="rotate(-30)"><rect x="-2" y="-18" width="4" height="36" fill="#0074D9" /><rect x="-1" y="18" width="2" height="4" fill="#AAAAAA" /></g><g transform="rotate(30)"><rect x="-2" y="-18" width="4" height="36" fill="#FF4136" /><rect x="-1" y="18" width="2" height="4" fill="#AAAAAA" /></g></g>`,
        // Millennium Falcon
        `<g transform="scale(0.5)" stroke-width="2" stroke="#AAAAAA" fill="none"><path d="M0,0 C-20,15 -20,-15 0,0 M-10,0 L-18,5 L-18, -5 L-10,0 M-10,0 H10 A12 12 0 0 1 10,0"/><circle cx="10" cy="0" r="5"/></g>`
    ];

    artifactPoints.forEach((point, index) => {
        if(artifactDefs[index]){
            pantheonArtifacts += `<g transform="translate(${point.x}, ${point.y})">${artifactDefs[index]}</g>`;
        }
    });

    // 3. NEW: Slower, continuous patrol loop
    const forwardDuration = contributionPoints.length * 0.25; // SLOWER PACE
    const backwardDuration = forwardDuration * 0.7; // Faster return trip
    const totalLoopDuration = forwardDuration + backwardDuration;
    const t_start = 0, t_endForward = forwardDuration / totalLoopDuration, t_end = 1.0;

    const pathData = contributionPoints.map((p, i) => (i === 0 ? 'M' : 'L') + `${p.x} ${p.y}`).join(' ');
    const pathLength = contributionPoints.length * 20;

    // 4. Final SVG Assembly
    return `
    <svg width="${GRID_WIDTH}" height="${GRID_HEIGHT}" viewBox="0 0 ${GRID_WIDTH} ${GRID_HEIGHT}" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
        <defs>
            <rect id="loop"><animate attributeName="width" dur="${totalLoopDuration}s" from="1" to="1" repeatCount="indefinite" /></rect>
            <linearGradient id="trailGradient" gradientTransform="rotate(90)">
                <stop offset="0%" stop-color="rgba(255, 65, 54, 0.8)" /><stop offset="100%" stop-color="rgba(255, 65, 54, 0)" />
            </linearGradient>
            <filter id="engine-glow"><feGaussianBlur stdDeviation="2" /></filter>
            <filter id="lightning-glow"><feGaussianBlur stdDeviation="1" /></filter>
        </defs>

        <rect width="100%" height="100%" fill="#0D1117"/>
        <g id="starfield">${stars}</g>
        <g id="idea-bursts">${ideaBursts}</g>
        <g opacity="0.6">${gridSquares}</g>
        
        <!-- The Pantheon Artifacts, anchored to the grid -->
        <g id="pantheon-artifacts" opacity="0.8">${pantheonArtifacts}</g>

        <!-- Comet Trail - only appears on the forward journey -->
        <path d="${pathData}" fill="none" stroke="url(#trailGradient)" stroke-width="3" stroke-linecap="round" stroke-dasharray="${pathLength}" stroke-dashoffset="${pathLength}">
            <animate attributeName="stroke-dashoffset"
                keyTimes="${t_start}; ${t_endForward}; ${t_end}"
                values="${pathLength}; 0; ${pathLength}"
                dur="${totalLoopDuration}s" repeatCount="indefinite" />
        </path>
        
        <!-- The X-Wing Patrolling -->
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
            <animateMotion
                keyPoints="0; 1; 0"
                keyTimes="${t_start}; ${t_endForward}; ${t_end}"
                path="${pathData}"
                dur="${totalLoopDuration}s" repeatCount="indefinite" rotate="auto" />
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

    // --- THIS IS THE MISSING PART THAT NEEDS TO BE RESTORED ---
    // Flatten the weeks into a single array of days
    let days = weeks.flatMap(week => week.contributionDays);

    // Sort days from most recent to oldest
    days.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Declare and calculate the current streak
    let streak = 0;
    // Check if the most recent day has a contribution
    if (days.length > 0 && days[0].contributionCount > 0) {
        // Loop through the days to count consecutive contributions
        for (const day of days) {
            if (day.contributionCount > 0) {
                streak++;
            } else {
                // Stop counting as soon as we find a day with 0 contributions
                break;
            }
        }
    }
    // --- END OF THE MISSING PART ---

    // Now the 'streak' variable exists and can be used
    console.log(`Current streak: ${streak} days.`);
    const svg = generateSVG(streak, weeks);

    // This is the directory creation logic you added (it's correct)
    const dir = 'dist';
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync('dist/eye.svg', svg);
    
    console.log('Successfully generated dist/eye.svg');
}

main();