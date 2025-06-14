// FINAL, ULTIMATE "GODS OF THE FORGE" VERSION
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
        return `<svg width="${GRID_WIDTH}" height="${GRID_HEIGHT}" viewBox="0 0 ${GRID_WIDTH} ${GRID_HEIGHT}" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#0D1117"/><text x="${GRID_WIDTH/2}" y="${GRID_HEIGHT/2}" fill="#888" font-family="sans-serif" font-size="12" text-anchor="middle">Awaiting contributions to begin the run...</text></svg>`;
    }
    
    // 2. Main Animation Loop Logic
    const journeyDuration = contributionPoints.length * 0.18; // SLOWER PACE
    const fadeDuration = 0.5;
    const totalLoopDuration = journeyDuration + fadeDuration;

    const t_start = 0;
    const t_endJourney = journeyDuration / totalLoopDuration;
    const t_end = 1.0;

    const pathData = contributionPoints.map((p, i) => (i === 0 ? 'M' : 'L') + `${p.x} ${p.y}`).join(' ');
    const pathLength = contributionPoints.length * 20;

    // 3. Final SVG Assembly with ALL new features
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

        <!-- "GODS OF THE FORGE" - Animated Characters Layer -->
        <g id="gods-of-the-forge" opacity="0.3">
            <!-- Iron Man's Helmet -->
            <g transform="translate(100, 60) scale(0.7)">
                <path d="M0-20 C-15-20 -15-5 -10,5 L-5,15 L5,15 L10,5 C15,-5 15,-20 0,-20 Z M-7,5 L-2,5 L0,10 L-5,10 Z M2,5 L7,5 L5,10 L0,10 Z" fill="#B80000"/>
                <path d="M-7,5 L-2,5 L0,10 L-5,10 Z" fill="#FFD700"/><path d="M2,5 L7,5 L5,10 L0,10 Z" fill="#FFD700"/>
                <path d="M-5,15 L-2,17 L2,17 L5,15 Z" fill="#AAAAAA"/>
                <!-- Eye Slit Glow -->
                <path d="M-7,5 L7,5 L5,10 L-5,10 Z" fill="white">
                    <animate attributeName="opacity" values="0.5; 1; 0.5" dur="3s" repeatCount="indefinite" />
                </path>
                <animateTransform attributeName="transform" type="translate" values="0 0; 0 -5; 0 0" dur="10s" repeatCount="indefinite" />
            </g>
            <!-- Thor's Hammer (Mjolnir) -->
            <g transform="translate(850, 40) scale(0.8)">
                <rect x="-10" y="-15" width="20" height="15" fill="#AAAAAA" /><rect x="-3" y="0" width="6" height="20" fill="#8B4513" />
                <!-- Lightning -->
                <g filter="url(#lightning-glow)">
                    <path d="M5,-15 L-5,0 L5,0 L-5,15" stroke="#00BFFF" stroke-width="1.5">
                        <animate attributeName="opacity" values="0; 0; 1; 0; 0; 0" dur="5s" begin="1s" repeatCount="indefinite" />
                    </path>
                    <path d="M-15,-10 L0,-2 L-10,5" stroke="#00BFFF" stroke-width="1">
                        <animate attributeName="opacity" values="0; 0; 0; 1; 0; 0" dur="5s" begin="3s" repeatCount="indefinite" />
                    </path>
                </g>
                <animateTransform attributeName="transform" type="rotate" from="-5" to="5" dur="12s" values="-5; 5; -5" repeatCount="indefinite" />
            </g>
        </g>
        
        <g opacity="0.6">${gridSquares}</g>

        <!-- Comet Trail with new reset loop -->
        <path d="${pathData}" fill="none" stroke="url(#trailGradient)" stroke-width="3" stroke-linecap="round" stroke-dasharray="${pathLength}" stroke-dashoffset="${pathLength}">
            <animate attributeName="stroke-dashoffset"
                keyTimes="${t_start}; ${t_endJourney}; ${t_end}"
                values="${pathLength}; 0; 0"
                dur="${totalLoopDuration}s" repeatCount="indefinite" />
        </path>
        
        <!-- X-Wing Fighter with new reset loop -->
        <g id="x-wing">
            <!-- Opacity animation for the fade reset -->
            <animate attributeName="opacity" keyTimes="${t_start}; ${t_endJourney}; ${t_end}" values="1; 1; 0" dur="${totalLoopDuration}s" repeatCount="indefinite" />
            <!-- The Ship Itself -->
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
                keyPoints="0; 1"
                keyTimes="${t_start}; ${t_endJourney}"
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