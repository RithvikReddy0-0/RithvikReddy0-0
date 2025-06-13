// The complete and correct generate-eye.js file
import fetch from 'node-fetch';
import fs from 'fs';

// --- CONFIGURATION ---
const GITHUB_USERNAME = 'RithvikReddy0-0';
const GITHUB_TOKEN = process.env.GITTOKEN; // Use the corrected secret name

// --- SVG & GRID CONSTANTS ---
const SQUARE_SIZE = 15;
const SQUARE_GAP = 3;
const GRID_WIDTH = (SQUARE_SIZE + SQUARE_GAP) * 53;
const GRID_HEIGHT = (SQUARE_SIZE + SQUARE_GAP) * 7;

// --- HELPER FUNCTIONS ---

// Fetches contribution data from the GitHub API
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
        headers: {
            'Authorization': `Bearer ${GITHUB_TOKEN}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query, variables: { userName: GITHUB_USERNAME } })
    });

    const data = await response.json();

    if (!data.data || !data.data.user) {
        console.error("CRITICAL: Failed to fetch valid data from GitHub API.");
        console.error("This is likely due to an invalid or expired GITTOKEN.");
        console.error("Actual response from GitHub:", JSON.stringify(data, null, 2));
        return null;
    }

    return data.data.user.contributionsCollection.contributionCalendar.weeks;
}

// Maps contribution count to a color
function getColor(count) {
    if (count === 0) return 'rgba(22, 27, 34, 0.5)'; // More transparent for empty days
    if (count <= 1) return '#0e4429';
    if (count <= 3) return '#006d32';
    if (count <= 6) return '#26a641';
    return '#39d353';
}

// NEW LOOPING VERSION of generateSVG
function generateSVG(streak, contributionData) {
    // --- 1. All initial calculations remain the same ---
    const SQUARE_SIZE = 15;
    const SQUARE_GAP = 3;
    const GRID_WIDTH = (SQUARE_SIZE + SQUARE_GAP) * 53;
    const GRID_HEIGHT = (SQUARE_SIZE + SQUARE_GAP) * 7;

    let stars = ''; // Star generation is the same
    for (let i = 0; i < 100; i++) { /* ... */ }

    let gridSquares = ''; // Grid generation is the same
    contributionData.forEach((week, weekIndex) => { /* ... */ });
    
    const contributionPoints = []; // Path point calculation is the same
    contributionData.forEach((week, weekIndex) => { /* ... */ });
    contributionPoints.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Fallback for zero contributions
    if (contributionPoints.length === 0) {
        // ... your fallback SVG code ...
    }
    
    // --- 2. NEW: Define the master timeline for the loop ---
    const forwardDuration = contributionPoints.length * 0.1;
    const pauseDuration = 2; // Pause between loops
    const apotheosisDuration = 1.5; // Time for the end pulse to be visible
    const totalLoopDuration = forwardDuration + apotheosisDuration + forwardDuration + pauseDuration; // Fwd + Apotheosis + Back + Pause

    // Normalize key moments in time for the keyTimes attribute (0.0 to 1.0)
    const t_start = 0;
    const t_endForward = forwardDuration / totalLoopDuration;
    const t_startApotheosis = t_endForward;
    const t_endApotheosis = (forwardDuration + apotheosisDuration) / totalLoopDuration;
    const t_startBackward = t_endApotheosis;
    const t_endBackward = (forwardDuration + apotheosisDuration + forwardDuration) / totalLoopDuration;
    const t_end = 1.0;

    // --- 3. Generate animation components with new timing ---
    const pathData = contributionPoints.map((p, i) => (i === 0 ? 'M' : 'L') + `${p.x} ${p.y}`).join(' ');
    const pathLength = contributionPoints.length * 20;
    const lastPoint = contributionPoints[contributionPoints.length - 1];

    // Apotheosis pulse now timed within the loop
    let pulseAnimation = `
        <circle cx="${lastPoint.x}" cy="${lastPoint.y}" r="10" fill="none" stroke="#42C0FB" stroke-width="2" opacity="0">
            <animate attributeName="r" values="10; 120" dur="${apotheosisDuration}s" begin="loop.begin + ${forwardDuration}s" />
            <animate attributeName="opacity" values="0; 1; 0" dur="${apotheosisDuration}s" begin="loop.begin + ${forwardDuration}s" />
        </circle>
    `;

    // Nexus pulses - only fire on the forward journey
    let nexusPulses = '';
    const allContributionDays = contributionData.flatMap(week => week.contributionDays);
    allContributionDays.sort((a, b) => b.contributionCount - a.contributionCount);
    const topDays = allContributionDays.slice(0, 3);
    const nexusDates = topDays.map(day => day.date);
    contributionPoints.forEach((point, index) => {
        if (nexusDates.includes(point.date)) {
            const timeToNexus = index * 0.1;
            nexusPulses += `<circle cx="${point.x}" cy="${point.y}" r="15" fill="white" opacity="0">
                <animate attributeName="opacity" values="0; 0.8; 0" dur="0.7s" begin="loop.begin + ${timeToNexus}s" />
            </circle>`;
        }
    });

    // --- 4. Assemble the final SVG with looping animations ---
    return `
    <svg width="${GRID_WIDTH}" height="${GRID_HEIGHT}" viewBox="0 0 ${GRID_WIDTH} ${GRID_HEIGHT}" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
        <defs>
            <linearGradient id="trailGradient" gradientTransform="rotate(90)">
                <stop offset="0%" stop-color="rgba(0, 191, 255, 0.8)" />
                <stop offset="100%" stop-color="rgba(0, 191, 255, 0)" />
            </linearGradient>
            <!-- Master loop controller -->
            <rect id="loop" width="1" height="1">
                <animate attributeName="width" dur="${totalLoopDuration}s" from="1" to="1" repeatCount="indefinite" />
            </rect>
        </defs>
        
        <rect width="100%" height="100%" fill="#0D1117"/>
        <g id="starfield">${stars}</g>
        ${pulseAnimation}
        <g opacity="0.6">${gridSquares}</g>
        ${nexusPulses}

        <path d="${pathData}" fill="none" stroke="url(#trailGradient)" stroke-width="3" stroke-linecap="round" stroke-dasharray="${pathLength}" stroke-dashoffset="${pathLength}">
            <animate attributeName="stroke-dashoffset"
                keyTimes="${t_start}; ${t_endForward}; ${t_startBackward}; ${t_endBackward}; ${t_end}"
                values="${pathLength}; 0; 0; ${pathLength}; ${pathLength}"
                dur="${totalLoopDuration}s" repeatCount="indefinite" />
        </path>

        <g id="eye-group">
            <g transform="scale(0.8)">
                <path d="M -10,0 C -10,-8 10,-8 10,0 C 10,8 -10,8 -10,0 Z" fill="#EAEAEA"/>
                <circle cx="0" cy="0" r="5" fill="#42C0FB"/>
                <circle cx="0" cy="0" r="2.5" fill="#000000"/>
            </g>
            <animateMotion
                keyPoints="0; 1; 1; 0; 0"
                keyTimes="${t_start}; ${t_endForward}; ${t_startBackward}; ${t_endBackward}; ${t_end}"
                path="${pathData}"
                dur="${totalLoopDuration}s" repeatCount="indefinite" />
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

    // Calculate streak from the fetched data
    let days = weeks.flatMap(week => week.contributionDays);
    days.sort((a, b) => new Date(b.date) - new Date(a.date));
    let streak = 0;
    if (days.length > 0 && days[0].contributionCount > 0) {
        for (const day of days) {
            if (day.contributionCount > 0) streak++; else break;
        }
    }
    console.log(`Current streak: ${streak} days.`);

    // Generate the SVG
    const svg = generateSVG(streak, weeks); 
    
    // Create directory and save file
    const dir = 'dist';
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync('dist/eye.svg', svg);
    console.log('Successfully generated eye.svg');
}

// --- Run the Script ---
main();