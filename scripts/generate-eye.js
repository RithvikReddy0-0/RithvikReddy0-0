// FINAL CLEANED-UP "FORGE OF HEROES" VERSION
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
      }`;
    const response = await fetch('https://api.github.com/graphql', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${GITHUB_TOKEN}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, variables: { userName: GITHUB_USERNAME } })
    });
    const data = await response.json();
    if (!data.data || !data.data.user) {
        console.error("CRITICAL: Failed to fetch valid data from GitHub API. Check GITHUB_PAT.");
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
    for (let i = 0; i < 150; i++) {
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
        return `<svg width="${GRID_WIDTH}" height="${GRID_HEIGHT}" viewBox="0 0 ${GRID_WIDTH} ${GRID_HEIGHT}" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#0D1117"/><text x="${GRID_WIDTH/2}" y="${GRID_HEIGHT/2}" fill="#888" font-family="sans-serif" font-size="12" text-anchor="middle">Awaiting contributions...</text></svg>`;
    }

    // 2. Generate "Cosmic Forge" Background Actions
    let ideaBursts = ''; // Explosions
    for (let i = 0; i < 5; i++) {
        const origin = contributionPoints[Math.floor(Math.random() * contributionPoints.length)];
        const dur = Math.random() * 0.8 + 0.5;
        const delay = Math.random() * 10;
        for (let j = 0; j < 8; j++) { // 8 particles per burst
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

    // 3. Main Animation Loop Logic
    const forwardDuration = contributionPoints.length * 0.1;
    const pauseDuration = 2;
    const apotheosisDuration = 1.5;
    const totalLoopDuration = forwardDuration + apotheosisDuration + forwardDuration + pauseDuration;
    const t_start = 0, t_endForward = forwardDuration / totalLoopDuration, t_startApotheosis = t_endForward, t_endApotheosis = (forwardDuration + apotheosisDuration) / totalLoopDuration, t_startBackward = t_endApotheosis, t_endBackward = (forwardDuration + apotheosisDuration + forwardDuration) / totalLoopDuration, t_end = 1.0;
    const pathData = contributionPoints.map((p, i) => (i === 0 ? 'M' : 'L') + `${p.x} ${p.y}`).join(' ');
    const pathLength = contributionPoints.length * 20;
    
    // 4. Final SVG Assembly
    return `
    <svg width="${GRID_WIDTH}" height="${GRID_HEIGHT}" viewBox="0 0 ${GRID_WIDTH} ${GRID_HEIGHT}" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
        <defs>
            <rect id="loop"><animate attributeName="width" dur="${totalLoopDuration}s" from="1" to="1" repeatCount="indefinite" /></rect>
            <linearGradient id="trailGradient" gradientTransform="rotate(90)">
                <stop offset="0%" stop-color="rgba(0, 191, 255, 0.8)" /><stop offset="100%" stop-color="rgba(0, 191, 255, 0)" />
            </linearGradient>
        </defs>

        <rect width="100%" height="100%" fill="#0D1117"/>
        <g id="starfield">${stars}</g>

        <!-- Celestial Artifacts Layer -->
        <g id="celestial-artifacts" opacity="0.15" stroke-width="2">
            <!-- Captain America's Shield -->
            <g transform="translate(150, 40) scale(0.5)">
                <circle cx="0" cy="0" r="30" stroke="#FF4136"/>
                <circle cx="0" cy="0" r="20" stroke="#FFFFFF"/>
                <circle cx="0" cy="0" r="10" stroke="#0074D9"/>
                <polygon points="0,-10 2.939,-4.045 9.511,-3.09 4.755,1.545 5.878,8.09 -0,5 -5.878,8.09 -4.755,1.545 -9.511,-3.09 -2.939,-4.045" fill="#FFFFFF"/>
                <animateTransform attributeName="transform" type="rotate" from="0 0 0" to="360 0 0" dur="45s" repeatCount="indefinite" />
            </g>
            <!-- Crossed Lightsabers -->
            <g transform="translate(800, 80) scale(0.6)">
                <rect x="-5" y="-35" width="10" height="70" fill="#0074D9" transform="rotate(-30)" /><rect x="-2.5" y="35" width="5" height="10" fill="#AAAAAA" transform="rotate(-30)" />
                <rect x="-5" y="-35" width="10" height="70" fill="#FF4136" transform="rotate(30)" /><rect x="-2.5" y="35" width="5" height="10" fill="#AAAAAA" transform="rotate(30)" />
                <animateTransform attributeName="transform" type="translate" values="0 0; 0 -10; 0 0" dur="8s" repeatCount="indefinite" />
            </g>
            <!-- Iron Man's Arc Reactor -->
            <g transform="translate(400, 63) scale(0.4)">
                <circle cx="0" cy="0" r="30" stroke="#00BFFF" stroke-width="4"/>
                <circle cx="0" cy="0" r="10" fill="#FFFFFF"/>
                <animateTransform attributeName="transform" type="rotate" from="360 0 0" to="0 0 0" dur="30s" repeatCount="indefinite" />
            </g>
            <!-- Death Star -->
            <g transform="translate(600, 30) scale(0.3)">
                <circle cx="0" cy="0" r="30" stroke="#AAAAAA"/>
                <circle cx="0" cy="-15" r="8" stroke="#AAAAAA"/>
                <line x1="-30" y1="0" x2="30" y2="0" stroke="#AAAAAA" stroke-width="1"/>
                <animateTransform attributeName="transform" type="translate" values="0 0; 10 5; 0 0" dur="25s" repeatCount="indefinite" />
            </g>
        </g>
        
        <g id="idea-bursts">${ideaBursts}</g>
        <g opacity="0.6">${gridSquares}</g>

        <path d="${pathData}" fill="none" stroke="url(#trailGradient)" stroke-width="3" stroke-linecap="round" stroke-dasharray="${pathLength}" stroke-dashoffset="${pathLength}">
            <animate attributeName="stroke-dashoffset" keyTimes="${t_start}; ${t_endForward}; ${t_startBackward}; ${t_endBackward}; ${t_end}" values="${pathLength}; 0; 0; ${pathLength}; ${pathLength}" dur="${totalLoopDuration}s" repeatCount="indefinite" />
        </path>
        <g id="eye-group">
            <g transform="scale(0.8)">
                <path d="M-10,0 C-10,-8 10,-8 10,0 C 10,8 -10,8 -10,0 Z" fill="#EAEAEA"/>
                <circle cx="0" cy="0" r="5" fill="#42C0FB">
                    <animate attributeName="fill" keyTimes="${t_start}; ${t_endForward}; ${t_startBackward}; ${t_endBackward}; ${t_end}" values="#42C0FB; #FFD700; #FFD700; #42C0FB; #42C0FB" dur="${totalLoopDuration}s" repeatCount="indefinite" />
                </circle>
                <circle cx="0" cy="0" r="2.5" fill="#000000"/>
            </g>
            <animateMotion keyPoints="0; 1; 1; 0; 0" keyTimes="${t_start}; ${t_endForward}; ${t_startBackward}; ${t_endBackward}; ${t_end}" path="${pathData}" dur="${totalLoopDuration}s" repeatCount="indefinite" />
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
            if (day.contributionCount > 0) streak++; else break;
        }
    }
    console.log(`Current streak: ${streak} days.`);
    const svg = generateSVG(streak, weeks); 
    const dir = 'dist';
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync('dist/eye.svg', svg);
    console.log('Successfully generated eye.svg');
}

main();