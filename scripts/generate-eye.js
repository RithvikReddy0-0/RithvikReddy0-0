// scripts/generate-eye.js
import fetch from 'node-fetch';
import fs from 'fs';

// Your GitHub username
const GITHUB_USERNAME = 'RithvikReddy0-0'; // <-- CHANGE THIS

// The PAT you stored in GitHub Secrets
const GITHUB_TOKEN = process.env.GITTOKEN;

// The main function that runs everything
// In scripts/generate-eye.js
// Update the getContributionStreak and main functions like this

async function fetchData() {
    const GITHUB_USERNAME = 'RithvikReddy0-0'; // Your username
    const GITHUB_TOKEN = process.env.GITTOKEN; // Your secret token

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

    // THIS IS THE CRUCIAL PART THAT WAS MISSING
    const response = await fetch('https://api.github.com/graphql', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${GITHUB_TOKEN}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query, variables: { userName: GITHUB_USERNAME } })
    });
    // END OF MISSING PART

    const data = await response.json();

    // Add a check for errors from the API
    if (data.errors || !data.data.user) {
        console.error("Error fetching data from GitHub API:", data.errors);
        return null; // Return null to handle the error gracefully
    }

    return data.data.user.contributionsCollection.contributionCalendar.weeks;
}

async function main() {
    const weeks = await fetchData();
    if (!weeks) {
        console.error('Failed to fetch contribution data.');
        return;
    }

    // Calculate streak (this logic can be moved or kept)
    let days = weeks.flatMap(week => week.contributionDays);
    days.sort((a, b) => new Date(b.date) - new Date(a.date));
    let streak = 0;
    if (days[0].contributionCount > 0) {
        for (const day of days) {
            if (day.contributionCount > 0) streak++; else break;
        }
    }
    console.log(`Current streak: ${streak} days.`);

    // Generate the SVG, passing BOTH the streak and the full contribution data
    const svg = generateSVG(streak, weeks); 
    
    // --- THIS IS THE FIX ---
    const dir = 'dist';
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir, { recursive: true });
    }
    // ----------------------

    console.log("--- GENERATED SVG CONTENT ---");
    console.log(svg);
    console.log("---------------------------");
    
    fs.writeFileSync('dist/eye.svg', svg);
    console.log('Successfully generated eye.svg');
}

// Fetches data and calculates the current contribution streak
async function getContributionStreak() {
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
    const weeks = data.data.user.contributionsCollection.contributionCalendar.weeks;
    
    let days = weeks.flatMap(week => week.contributionDays);
    days.sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort days in descending order

    let currentStreak = 0;
    let streakBroken = false;

    // Check if there was a contribution today. If not, streak starts at 0.
    if (days[0].contributionCount === 0) {
        return 0;
    }

    for (const day of days) {
        if (day.contributionCount > 0) {
            currentStreak++;
        } else {
            break; // Streak is broken
        }
    }

    return currentStreak;
}

// In scripts/generate-eye.js
// Replace the old generateSVG function with this new one.

// Helper constants for the grid
const SQUARE_SIZE = 15;
const SQUARE_GAP = 3;
const GRID_WIDTH = (SQUARE_SIZE + SQUARE_GAP) * 53;
const GRID_HEIGHT = (SQUARE_SIZE + SQUARE_GAP) * 7;

// Function to map contribution count to a color
function getColor(count) {
    if (count === 0) return '#161b22'; // Dark background for empty days
    if (count <= 1) return '#0e4429';
    if (count <= 3) return '#006d32';
    if (count <= 6) return '#26a641';
    return '#39d353'; // Brightest green
}

// NEW VERSION of generateSVG
function generateSVG(streak, contributionData) {
    // --- SETUP & CALCULATIONS ---
    const SQUARE_SIZE = 15;
    const SQUARE_GAP = 3;
    const GRID_WIDTH = (SQUARE_SIZE + SQUARE_GAP) * 53;
    const GRID_HEIGHT = (SQUARE_SIZE + SQUARE_GAP) * 7;

    // Generate stars for the background
    let stars = '';
    for (let i = 0; i < 100; i++) {
        const x = Math.random() * GRID_WIDTH;
        const y = Math.random() * GRID_HEIGHT;
        const r = Math.random() * 0.8 + 0.2;
        stars += `<circle cx="${x}" cy="${y}" r="${r}" fill="#555" />`;
    }

    let gridSquares = '';
    // ... grid square generation remains the same ...
    contributionData.forEach((week, weekIndex) => { /* ... */ });

    const contributionPoints = [];
    // ... contribution point calculation remains the same ...
    contributionData.forEach((week, weekIndex) => { /* ... */ });
    contributionPoints.sort((a, b) => new Date(a.date) - new Date(b.date));

    if (contributionPoints.length === 0) {
        // ... fallback for zero contributions remains the same ...
    }

    const pathData = contributionPoints.map((p, i) => (i === 0 ? 'M' : 'L') + `${p.x} ${p.y}`).join(' ');
    
    // Quick and dirty way to estimate path length for the trail effect
    const pathLength = contributionPoints.length * (SQUARE_SIZE + SQUARE_GAP); 
    const animationDuration = contributionPoints.length * 0.1;

    const lastPoint = contributionPoints[contributionPoints.length - 1];
    let pulseAnimation = ''; // We'll add the Apotheosis pulse later

    // --- SVG ASSEMBLY ---
    return `
    <svg width="${GRID_WIDTH}" height="${GRID_HEIGHT}" viewBox="0 0 ${GRID_WIDTH} ${GRID_HEIGHT}" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
        <defs>
            <linearGradient id="trailGradient" gradientTransform="rotate(90)">
                <stop offset="0%" stop-color="rgba(0, 191, 255, 0.8)" />
                <stop offset="100%" stop-color="rgba(0, 191, 255, 0)" />
            </linearGradient>
        </defs>
        
        <!-- Layer 1: Parallax Starfield -->
        <g id="starfield">
            ${stars}
            <animateTransform attributeName="transform" type="translate" dur="20s" values="0 0; -5 0; 0 0" repeatCount="indefinite" />
        </g>
        
        <!-- Layer 2: Contribution Grid -->
        <g opacity="0.6">${gridSquares}</g>

        <!-- Layer 3: Comet Trail -->
        <path d="${pathData}" fill="none" stroke="url(#trailGradient)" stroke-width="3" stroke-linecap="round"
              stroke-dasharray="${pathLength}" stroke-dashoffset="${pathLength}">
            <animate attributeName="stroke-dashoffset" to="0" dur="${animationDuration}s" fill="freeze" />
        </path>

        <!-- Layer 4: The Eye -->
        <g id="eye-group">
            <g transform="scale(0.8)">
                <path d="M -10,0 C -10,-8 10,-8 10,0 C 10,8 -10,8 -10,0 Z" fill="#EAEAEA"/>
                <circle cx="0" cy="0" r="5" fill="#42C0FB"/>
                <circle cx="0" cy="0" r="2.5" fill="#000000"/>
            </g>
            <animateMotion id="animation" dur="${animationDuration}s" fill="freeze" repeatCount="1">
                <mpath xlink:href="#motion-path"/>
            </animateMotion>
        </g>
        
        <!-- Invisible path for motion -->
        <path id="motion-path" d="${pathData}" fill="none" stroke="none" />
    </svg>`;
}

main(); // Run the script