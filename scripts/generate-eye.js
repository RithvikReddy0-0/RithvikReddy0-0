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
    
    // ... The rest of the file writing logic remains the same ...
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

function generateSVG(streak, contributionData) {
    // --- PART 1: Generate the static grid of contribution squares ---
    let gridSquares = '';
    contributionData.forEach((week, weekIndex) => {
        week.contributionDays.forEach((day, dayIndex) => {
            gridSquares += `
                <rect 
                    x="${weekIndex * (SQUARE_SIZE + SQUARE_GAP)}" 
                    y="${dayIndex * (SQUARE_SIZE + SQUARE_GAP)}"
                    width="${SQUARE_SIZE}" 
                    height="${SQUARE_SIZE}"
                    fill="${getColor(day.contributionCount)}" 
                    rx="2" ry="2"
                />`;
        });
    });

    // --- PART 2: Calculate the animation path ---
    const contributionPoints = [];
    contributionData.forEach((week, weekIndex) => {
        week.contributionDays.forEach((day, dayIndex) => {
            if (day.contributionCount > 0) {
                contributionPoints.push({
                    date: day.date,
                    x: weekIndex * (SQUARE_SIZE + SQUARE_GAP) + SQUARE_SIZE / 2,
                    y: dayIndex * (SQUARE_SIZE + SQUARE_GAP) + SQUARE_SIZE / 2
                });
            }
        });
    });

    // Sort points by date to create the chronological path
    contributionPoints.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Create the SVG path string 'd' attribute
    const pathData = contributionPoints.map((p, i) => (i === 0 ? 'M' : 'L') + `${p.x} ${p.y}`).join(' ');

    // --- PART 3: Define the moving eye and pulses ---
    const lastPoint = contributionPoints[contributionPoints.length - 1] || { x: 0, y: 0 };
    let pulseAnimation = '';

    // The pulses will now radiate from the eye's final position
    if (streak >= 5) {
        const pulseCount = Math.min(5, Math.floor(streak / 5));
        for (let i = 0; i < pulseCount; i++) {
            pulseAnimation += `
                <circle cx="${lastPoint.x}" cy="${lastPoint.y}" r="10" fill="none" stroke="#00BFFF" stroke-width="1.5" opacity="0">
                    <animate attributeName="r" from="5" to="50" dur="4s" begin="animation.end+${i * 0.8}s" repeatCount="indefinite" />
                    <animate attributeName="opacity" from="1" to="0" dur="4s" begin="animation.end+${i * 0.8}s" repeatCount="indefinite" />
                </circle>
            `;
        }
    }

    // --- PART 4: Assemble the final SVG ---
    return `
    <svg width="${GRID_WIDTH}" height="${GRID_HEIGHT}" viewBox="0 0 ${GRID_WIDTH} ${GRID_HEIGHT}" fill="none" xmlns="http://www.w3.org/2000/svg">
        <style>
            /* Optional: Add a subtle hover effect to squares */
            rect:hover { stroke: white; stroke-width: 0.5; }
        </style>
        
        <!-- The background grid of all contributions -->
        <g>${gridSquares}</g>

        <!-- The invisible path for the eye to follow -->
        <path id="motion-path" d="${pathData}" fill="none" stroke="none" />

        <!-- The Neural Pulses, which start after the eye finishes its path -->
        ${pulseAnimation}

        <!-- The Eye Group (scaled down to fit in a square) -->
        <g id="eye-group">
            <g transform="scale(0.8)"> <!-- Scale the eye down a bit -->
                <path d="M -10,0 C -10,-8 10,-8 10,0 C 10,8 -10,8 -10,0 Z" fill="#EAEAEA"/>
                <circle cx="0" cy="0" r="5" fill="#42C0FB"/>
                <circle cx="0" cy="0" r="2.5" fill="#000000"/>
            </g>
            <!-- This makes the eye move along the path -->
            <animateMotion id="animation" dur="${contributionPoints.length * 0.1}s" fill="freeze" repeatCount="1">
                <mpath xlink:href="#motion-path"/>
            </animateMotion>
        </g>
    </svg>`;
}

main(); // Run the script