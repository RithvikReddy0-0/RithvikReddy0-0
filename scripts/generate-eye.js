// scripts/generate-eye.js
import fetch from 'node-fetch';
import fs from 'fs';

// Your GitHub username
const GITHUB_USERNAME = 'RithvikReddy0-0'; // <-- CHANGE THIS

// The PAT you stored in GitHub Secrets
const GITHUB_TOKEN = process.env.GITTOKEN;

// The main function that runs everything
async function main() {
    const streak = await getContributionStreak();
    console.log(`Current streak: ${streak} days.`);

    const svg = generateSVG(streak);
    
    // Ensure the 'dist' directory exists
    if (!fs.existsSync('dist')) {
        fs.mkdirSync('dist');
    }
    
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

function generateSVG(streak) {
    // --- Define different animation states based on streak ---
    let eyeAnimation = '';
    let pulseAnimation = '';

    // State 1: Living Eye (blinking/looking) - Activates with any streak > 0
    if (streak > 0) {
        eyeAnimation = `
            <!-- Pupil looking left and right -->
            <animate attributeName="cx" dur="8s" repeatCount="indefinite"
                keyTimes="0; 0.1; 0.2; 0.8; 0.9; 1"
                values="100; 95; 100; 105; 100; 100" />
            <!-- Eyelid blink animation -->
            <animateTransform attributeName="transform" type="scale"
                dur="8s" repeatCount="indefinite"
                keyTimes="0; 0.4; 0.45; 0.5; 1"
                values="1 1; 1 1; 1 0.1; 1 1; 1 1" />
        `;
    }

    // State 2: Neural Pulses - The longer the streak, the more complex the pulses
    if (streak >= 5) { // First pulse appears at a 5-day streak
        const pulseCount = Math.min(5, Math.floor(streak / 5)); // Add a new pulse every 5 days, max 5 pulses
        for (let i = 0; i < pulseCount; i++) {
            pulseAnimation += `
                <circle cx="100" cy="100" r="20" fill="none" stroke="#00BFFF" stroke-width="2">
                    <animate attributeName="r" from="20" to="100" dur="4s" begin="${i * 0.8}s" repeatCount="indefinite" />
                    <animate attributeName="opacity" from="1" to="0" dur="4s" begin="${i * 0.8}s" repeatCount="indefinite" />
                </circle>
            `;
        }
    }

    // --- Assemble the final SVG ---
    // The main SVG canvas with a dark background
    return `
    <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="200" fill="#0D1117"/>
        
        <!-- The Neural Pulses (rendered behind the eye) -->
        ${pulseAnimation}
        
        <!-- The Eye Group -->
        <g id="eye-group" transform-origin="100 100">
            <!-- Sclera (white part) -->
            <path d="M 50,100 C 50,70 150,70 150,100 C 150,130 50,130 50,100 Z" fill="#EAEAEA"/>
            <!-- Iris (colored part) - A vibrant blue -->
            <circle id="iris" cx="100" cy="100" r="25" fill="#42C0FB"/>
            <!-- Pupil (black part) -->
            <circle id="pupil" cx="100" cy="100" r="12" fill="#000000"/>
            
            <!-- Link the animations to the eye group -->
            ${eyeAnimation}
        </g>
    </svg>`;
}

main(); // Run the script