// FINAL, ULTIMATE "STELLAR LOG" VERSION
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
                  color
                }
              }
            }
          }
          repositories(first: 50, orderBy: {field: PUSHED_AT, direction: DESC}, ownerAffiliations: OWNER) {
            nodes {
              name
              languages(first: 10, orderBy: {field: SIZE, direction: DESC}) {
                edges {
                  size
                  node {
                    name
                    color
                  }
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
    
    // Process top languages
    const langMap = new Map();
    data.data.user.repositories.nodes.forEach(repo => {
        repo.languages.edges.forEach(langEdge => {
            const lang = langEdge.node;
            const size = langEdge.size;
            if (langMap.has(lang.name)) {
                langMap.set(lang.name, {
                    ...langMap.get(lang.name),
                    size: langMap.get(lang.name).size + size
                });
            } else {
                langMap.set(lang.name, { color: lang.color, size: size });
            }
        });
    });

    const topLanguages = Array.from(langMap.entries())
        .sort((a, b) => b[1].size - a[1].size)
        .slice(0, 5)
        .map(entry => ({ name: entry[0], color: entry[1].color }));

    return {
        weeks: data.data.user.contributionsCollection.contributionCalendar.weeks,
        topLanguages: topLanguages
    };
}

function generateCosmicPath(id) {
    const cx = GRID_WIDTH / 2;
    const cy = GRID_HEIGHT / 2;
    let path = `M ${cx}, ${cy} C`;
    const points = 4 + Math.floor(Math.random() * 3);
    for(let i = 0; i < points; i++){
        const angle = (i/points) * 2 * Math.PI;
        const r1 = GRID_WIDTH * (0.3 + Math.random() * 0.2);
        const r2 = GRID_HEIGHT * (0.3 + Math.random() * 0.2);
        const x = cx + r1 * Math.cos(angle + Math.random() * 0.5 - 0.25);
        const y = cy + r2 * Math.sin(angle + Math.random() * 0.5 - 0.25);
        path += ` ${x} ${y},`;
    }
    path = path.slice(0,-1); // remove last comma
    return `<path id="path-${id}" d="${path}" fill="none"/>`;
}

// --- The Main SVG Generation Function ---
function generateSVG(apiData) {
    const { weeks, topLanguages } = apiData;

    // 1. Calculate Grid and Patrol Path Data
    let gridSquares = '';
    weeks.forEach((week, weekIndex) => {
        week.contributionDays.forEach((day, dayIndex) => {
            const x = weekIndex * (SQUARE_SIZE + SQUARE_GAP);
            const y = dayIndex * (SQUARE_SIZE + SQUARE_GAP);
            const count = day.contributionCount;
            const onclick = count > 0 ? `showLog('${day.date}', ${count}, ${x + SQUARE_SIZE/2}, ${y + SQUARE_SIZE/2})` : 'hideLog()';
            gridSquares += `<rect x="${x}" y="${y}" width="${SQUARE_SIZE}" height="${SQUARE_SIZE}" fill="${day.color}" rx="2" ry="2" class="contribution-square" onclick="${onclick}" data-date="${day.date}"/>`;
        });
    });
    
    const contributionPoints = weeks.flatMap((week, weekIndex) =>
        week.contributionDays.map((day, dayIndex) => ({ day, x: weekIndex * (SQUARE_SIZE + SQUARE_GAP) + SQUARE_SIZE / 2, y: dayIndex * (SQUARE_SIZE + SQUARE_GAP) + SQUARE_SIZE / 2 }))
    ).filter(p => p.day.contributionCount > 0).sort((a,b) => new Date(a.day.date) - new Date(b.day.date));

    if (contributionPoints.length < 2) {
        return `<svg width="${GRID_WIDTH}" height="${GRID_HEIGHT}" viewBox="0 0 ${GRID_WIDTH} ${GRID_HEIGHT}" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#0D1117"/><text x="${GRID_WIDTH/2}" y="${GRID_HEIGHT/2}" fill="#888" font-family="sans-serif" font-size="12" text-anchor="middle">Awaiting contributions to begin the patrol...</text></svg>`;
    }

    // 2. Genesis Fragments
    let genesisFragments = '';
    let fragmentPaths = '';
    const artifactDefs = topLanguages.map(lang => 
        `<text font-family="monospace" font-weight="bold" font-size="24" fill="${lang.color}" text-anchor="middle" dominant-baseline="middle">${lang.name}</text>`
    );
    artifactDefs.forEach((def, i) => {
        fragmentPaths += generateCosmicPath(i);
        const duration = 20 + Math.random() * 20;
        genesisFragments += `<g class="fragment" opacity="0">${def}<animate attributeName="opacity" values="0;1;1;0" dur="${duration}s" begin="${i * 4}s" repeatCount="indefinite"/><animateTransform attributeName="transform" type="scale" values="0;1;1;0" dur="${duration}s" begin="${i * 4}s" repeatCount="indefinite"/><animateMotion dur="${duration}s" begin="${i * 4}s" repeatCount="indefinite" rotate="auto"><mpath xlink:href="#path-${i}"/></animateMotion></g>`;
    });

    // 3. Patrol Ship
    const patrolPath = contributionPoints.map(p => `${p.x},${p.y}`).join(' ');

    // 4. Final SVG Assembly
    return `
    <svg width="${GRID_WIDTH}" height="${GRID_HEIGHT}" viewBox="0 0 ${GRID_WIDTH} ${GRID_HEIGHT}" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
        <style>
            .contribution-square { cursor: pointer; }
            .contribution-square:hover { stroke: rgba(0, 191, 255, 0.7); stroke-width: 1.5; }
            .fragment:hover { filter: url(#hover-glow); }
            #hologram text { font-family: 'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif; }
        </style>
        <script>
            // <![CDATA[
            const svg = document.querySelector('svg');
            const hologram = svg.querySelector('#hologram');
            const holoDate = svg.querySelector('#holo-date');
            const holoCount = svg.querySelector('#holo-count');
            const scanBeam = svg.querySelector('#scan-beam path');
            const coreX = ${GRID_WIDTH/2};
            const coreY = ${GRID_HEIGHT/2};

            let activeTimeout = null;

            function showLog(dateStr, count, x, y) {
                clearTimeout(activeTimeout);
                hologram.setAttribute('transform', 'translate(' + (x - 75) + ' ' + (y - 120) + ')');
                holoDate.textContent = new Date(dateStr).toDateString();
                holoCount.textContent = count + ' contributions';
                hologram.style.visibility = 'visible';
                hologram.style.opacity = '1';
                
                scanBeam.setAttribute('d', 'M' + coreX + ',' + coreY + ' L' + x + ',' + y);
                scanBeam.beginElement();
            }

            function hideLog() {
                hologram.style.opacity = '0';
                activeTimeout = setTimeout(() => { hologram.style.visibility = 'hidden'; }, 500);
            }
            // ]]>
        </script>
        <defs>
            <filter id="hover-glow"><feDropShadow dx="0" dy="0" stdDeviation="4" flood-color="rgba(255, 255, 180, 0.7)"/></filter>
            <filter id="engine-glow"><feGaussianBlur stdDeviation="2" /></filter>
            <filter id="holo-blur"><feGaussianBlur in="SourceGraphic" stdDeviation="2"/></filter>
            ${fragmentPaths}
        </defs>

        <!-- Layer 0: Deep Space -->
        <rect width="100%" height="100%" fill="#0D1117"/>

        <!-- Layer 1: The Genesis Core -->
        <g id="genesis-core" transform="translate(${GRID_WIDTH/2} ${GRID_HEIGHT/2})">
            <g id="iris-corona" opacity="0.8">
                 <path d="M0-40 L10,-10 L40,0 L10,10 L0,40 L-10,10 L-40,0 L-10,-10 Z" fill="rgba(255, 165, 0, 0.5)" transform="scale(1.2)"><animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="45s" repeatCount="indefinite"/><animateTransform attributeName="transform" type="scale" values="1.2;1.3;1.2" dur="8s" repeatCount="indefinite" additive="sum"/></path>
                 <path d="M0-30 L7,-7 L30,0 L7,7 L0,30 L-7,7 L-30,0 L-7,-7 Z" fill="rgba(255, 215, 0, 0.7)"><animateTransform attributeName="transform" type="rotate" from="360" to="0" dur="30s" repeatCount="indefinite"/></path>
            </g>
            <circle r="12" fill="#000" />
        </g>
        
        <!-- Layer 2: Contribution Grid -->
        <g opacity="0.6">${gridSquares}</g>

        <!-- Layer 3: Genesis Fragments (Languages) -->
        <g id="genesis-fragments">${genesisFragments}</g>

        <!-- Layer 4: The Patrol -->
        <g id="x-wing"><g transform="scale(1.2)"><polygon points="-10,0 -5,-2 10,-2 12,0 10,2 -5,2" fill="#AAAAAA"/><polygon points="-8,-2 -12,-6 5,-3" fill="#D3D3D3"/><polygon points="-8,2 -12,6 5,3" fill="#D3D3D3"/><g transform="translate(-10, 0)" filter="url(#engine-glow)"><circle cx="0" cy="-3.5" r="1.5" fill="#FF851B"><animate attributeName="r" values="1.5;2;1.5" dur="0.2s" repeatCount="indefinite"/></circle><circle cx="0" cy="3.5" r="1.5" fill="#FF851B"><animate attributeName="r" values="1.5;2;1.5" dur="0.2s" repeatCount="indefinite"/></circle></g></g><animateMotion dur="25s" repeatCount="indefinite" rotate="auto-reverse"><mpath xlink:href="data:text/plain;charset=utf-8,M${patrolPath}"/></animateMotion></g>

        <!-- Layer 5: The Interactive Layer -->
        <g id="scan-beam">
            <path stroke="rgba(0, 191, 255, 0.7)" stroke-width="2" stroke-linecap="round" stroke-dasharray="1000" stroke-dashoffset="1000">
                <animate id="scan-beam-anim" attributeName="stroke-dashoffset" values="1000;0;1000" dur="1s" begin="indefinite" fill="freeze"/>
            </path>
        </g>
        <g id="hologram" style="visibility: hidden; opacity: 0; transition: opacity 0.5s;">
            <rect x="0" y="0" width="150" height="110" fill="rgba(0, 20, 40, 0.85)" stroke="rgba(0, 191, 255, 0.5)" rx="4" filter="url(#holo-blur)"/>
            <text id="holo-date" x="10" y="20" fill="#00BFFF" font-size="12"></text>
            <text id="holo-count" x="10" y="38" fill="white" font-size="10"></text>
            <line x1="5" y1="48" x2="145" y2="48" stroke="rgba(0, 191, 255, 0.3)"/>
            ${topLanguages.map((lang, i) => `
                <g transform="translate(10, ${60 + i * 12})">
                    <circle cx="2" cy="2" r="3" fill="${lang.color || '#FFF'}"/>
                    <text x="10" y="5" fill="#DDD" font-size="10">${lang.name}</text>
                </g>
            `).join('')}
            <text onclick="hideLog()" x="140" y="15" fill="#888" font-size="14" style="cursor: pointer; text-anchor: end;">×</text>
        </g>
    </svg>`;
}

// --- Main Execution Logic ---
async function main() {
    console.log("Fetching cosmic data from GitHub API...");
    const apiData = await fetchData();
    if (!apiData) {
        console.error('Execution stopped due to data fetch failure.');
        return;
    }
    console.log("Top Languages Found:", apiData.topLanguages.map(l => l.name).join(', '));

    console.log("Forging the Stellar Log...");
    const svg = generateSVG(apiData);

    const dir = 'dist';
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync('dist/eye.svg', svg);
    
    console.log('Successfully forged dist/eye.svg! The Stellar Log is now live.');
}

main();