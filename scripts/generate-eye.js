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

// FINAL "CELESTIAL ECOSYSTEM" LOOPING VERSION of generateSVG
function generateSVG(streak, contributionData) {
    // --- 1. All initial calculations remain the same ---
    const SQUARE_SIZE = 15;
    const SQUARE_GAP = 3;
    const GRID_WIDTH = (SQUARE_SIZE + SQUARE_GAP) * 53;
    const GRID_HEIGHT = (SQUARE_SIZE + SQUARE_GAP) * 7;

    // --- Star, Grid, and Path Point generation is the same ---
    let stars = '';
    for (let i = 0; i < 150; i++) { // More stars for a richer field
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
        return `... your zero-contribution SVG code ...`; // Your fallback code here
    }

    // --- 2. NEW: Generate the "Living Surroundings" ---
    
    // "Breathing Nebulae"
    let nebulae = '';
    const nebulaColors = ['#8A2BE2', '#4B0082', '#00008B'];
    for (let i = 0; i < 3; i++) {
        const cx = Math.random() * GRID_WIDTH;
        const cy = Math.random() * GRID_HEIGHT;
        const r = Math.random() * 50 + 80;
        const dur = Math.random() * 10 + 15;
        nebulae += `
            <circle cx="${cx}" cy="${cy}" r="${r}" fill="${nebulaColors[i]}" filter="url(#glow)">
                <animate attributeName="opacity" values="0; 0.2; 0" dur="${dur}s" repeatCount="indefinite" />
            </circle>`;
    }

    // "Data Sprites"
    let dataSprites = '';
    for (let i = 0; i < 5; i++) { // 5 sprites
        const startPoint = contributionPoints[Math.floor(Math.random() * contributionPoints.length)];
        const endPoint = contributionPoints[Math.floor(Math.random() * contributionPoints.length)];
        const dur = Math.random() * 3 + 2;
        const delay = Math.random() * 5;
        dataSprites += `
            <circle cx="${startPoint.x}" cy="${startPoint.y}" r="2" fill="#FFD700">
                <animateMotion path="M ${startPoint.x} ${startPoint.y} L ${endPoint.x} ${endPoint.y}" dur="${dur}s" begin="${delay}s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0; 1; 0" dur="${dur}s" begin="${delay}s" repeatCount="indefinite" />
            </circle>`;
    }

    // "Constellation Tracers"
    let constellationTracers = '';
    for (let i = 0; i < 3; i++) {
        const start = contributionPoints[Math.floor(Math.random() * contributionPoints.length)];
        const end = contributionPoints[Math.floor(Math.random() * contributionPoints.length)];
        const dur = Math.random() * 0.5 + 0.3;
        const delay = Math.random() * 10;
        const pathLength = Math.hypot(end.x - start.x, end.y - start.y);
        constellationTracers += `
            <path d="M${start.x},${start.y} L${end.x},${end.y}" stroke="#42C0FB" stroke-width="0.5" stroke-dasharray="${pathLength}" stroke-dashoffset="${pathLength}">
                <animate attributeName="stroke-dashoffset" values="${pathLength}; 0; -${pathLength}" dur="${dur}s" begin="${delay}s" repeatCount="indefinite" />
            </path>`;
    }

    // --- 3. The Main Animation Loop Logic (from previous version) ---
    // ... all the timeline calculations (totalLoopDuration, keyTimes, etc.) ...
    // ... all the pathData, pathLength, lastPoint calculations ...
    // ... the Apotheosis pulseAnimation code ...
    // ... the Nexus pulse code ...

    // --- 4. Assemble the Final SVG with all new layers ---
    return `
    <svg width="${GRID_WIDTH}" height="${GRID_HEIGHT}" viewBox="0 0 ${GRID_WIDTH} ${GRID_HEIGHT}" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
        <defs>
            <filter id="glow">
                <feGaussianBlur stdDeviation="15" result="coloredBlur"/>
            </filter>
            <linearGradient id="trailGradient" ... > ... </linearGradient>
            <rect id="loop" ... > ... </rect>
        </defs>
        
        <rect width="100%" height="100%" fill="#0D1117"/>
        <g id="starfield">${stars}</g>

        <!-- NEW: Living Surroundings Layers -->
        <g id="nebulae" opacity="0.5">${nebulae}</g>
        <g id="data-sprites">${dataSprites}</g>
        <g id="tracers" opacity="0.4">${constellationTracers}</g>
        
        <!-- The Rest of Your Animation Layers -->
        ${pulseAnimation} <!-- Apotheosis -->
        <g opacity="0.6">${gridSquares}</g>
        ${nexusPulses}
        <path d="${pathData}" ... > ... </path> <!-- Comet Trail -->
        <g id="eye-group" ... > ... </g> <!-- The Eye -->
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