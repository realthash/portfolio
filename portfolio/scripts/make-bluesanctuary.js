import sharp from 'sharp';
import fs from 'fs';

const svg = `
<svg width="1200" height="750" viewBox="0 0 1200 750" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0a192f"/>
      <stop offset="50%" stop-color="#0d2b45"/>
      <stop offset="100%" stop-color="#051329"/>
    </linearGradient>
    <linearGradient id="cyanGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#00d2ff"/>
      <stop offset="100%" stop-color="#3a7bd5"/>
    </linearGradient>
    <linearGradient id="waveGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#00f2fe" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#4facfe" stop-opacity="0.05"/>
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="30" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Background -->
  <rect width="1200" height="750" fill="url(#bg)"/>

  <!-- Subtle grid lines -->
  <path d="M0 100 H1200 M0 200 H1200 M0 300 H1200 M0 400 H1200 M0 500 H1200 M0 600 H1200" stroke="#ffffff" stroke-opacity="0.03" stroke-width="1"/>
  <path d="M200 0 V750 M400 0 V750 M600 0 V750 M800 0 V750 M1000 0 V750" stroke="#ffffff" stroke-opacity="0.03" stroke-width="1"/>

  <!-- Glowing sphere in background -->
  <circle cx="950" cy="280" r="180" fill="#00d2ff" opacity="0.15" filter="url(#glow)"/>

  <!-- Top Navbar mockup -->
  <rect x="80" y="50" width="1040" height="60" rx="12" fill="#132742" fill-opacity="0.6" stroke="#2a4365" stroke-width="1"/>
  <circle cx="120" cy="80" r="14" fill="#00d2ff"/>
  <text x="145" y="86" fill="#ffffff" font-family="system-ui, sans-serif" font-weight="700" font-size="16" letter-spacing="1.5">BLUE SANCTUARY</text>
  
  <text x="750" y="85" fill="#a0aec0" font-family="system-ui, sans-serif" font-size="14">Mission</text>
  <text x="830" y="85" fill="#a0aec0" font-family="system-ui, sans-serif" font-size="14">Solutions</text>
  <text x="915" y="85" fill="#a0aec0" font-family="system-ui, sans-serif" font-size="14">Impact</text>
  <rect x="990" y="65" width="105" height="32" rx="16" fill="url(#cyanGrad)"/>
  <text x="1018" y="86" fill="#ffffff" font-family="system-ui, sans-serif" font-weight="600" font-size="13">Donate</text>

  <!-- Hero Content -->
  <text x="100" y="210" fill="#00d2ff" font-family="system-ui, sans-serif" font-weight="600" font-size="14" letter-spacing="3">SUSTAINABLE DEVELOPMENT GOAL 6</text>
  <text x="100" y="275" fill="#ffffff" font-family="system-ui, sans-serif" font-weight="800" font-size="52" letter-spacing="-1">Clean Water &amp;</text>
  <text x="100" y="340" fill="url(#cyanGrad)" font-family="system-ui, sans-serif" font-weight="800" font-size="52" letter-spacing="-1">Sanitation For All.</text>

  <text x="100" y="405" fill="#a0aec0" font-family="system-ui, sans-serif" font-size="18" max-width="600">
    Empowering communities worldwide through smart ecological water purification,
  </text>
  <text x="100" y="435" fill="#a0aec0" font-family="system-ui, sans-serif" font-size="18">
    real-time watershed monitoring and sustainable sanitation infrastructure.
  </text>

  <!-- Interactive buttons -->
  <rect x="100" y="480" width="170" height="48" rx="8" fill="url(#cyanGrad)"/>
  <text x="135" y="510" fill="#ffffff" font-family="system-ui, sans-serif" font-weight="600" font-size="15">Explore Project</text>
  <rect x="290" y="480" width="150" height="48" rx="8" fill="transparent" stroke="#4a5568" stroke-width="1.5"/>
  <text x="325" y="510" fill="#e2e8f0" font-family="system-ui, sans-serif" font-weight="500" font-size="15">Read Report</text>

  <!-- Stats cards on right -->
  <g transform="translate(680, 180)">
    <rect width="420" height="200" rx="16" fill="#142848" fill-opacity="0.8" stroke="#2b4772" stroke-width="1"/>
    <text x="35" y="55" fill="#64748b" font-family="system-ui, sans-serif" font-size="13" font-weight="600" letter-spacing="1">WATER PURIFIED</text>
    <text x="35" y="115" fill="#38bdf8" font-family="system-ui, sans-serif" font-size="44" font-weight="800">4.2M Liters</text>
    <text x="35" y="155" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="14">Across 18 regional community clean hubs</text>
  </g>

  <g transform="translate(680, 410)">
    <rect width="420" height="150" rx="16" fill="#142848" fill-opacity="0.8" stroke="#2b4772" stroke-width="1"/>
    <text x="35" y="45" fill="#64748b" font-family="system-ui, sans-serif" font-size="13" font-weight="600" letter-spacing="1">SANITATION METRICS</text>
    <text x="35" y="95" fill="#34d399" font-family="system-ui, sans-serif" font-size="34" font-weight="700">99.8% Safety Index</text>
    <text x="35" y="125" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="14">Zero contaminants detected in filtration audits</text>
  </g>

  <!-- Decorative stylized waves at bottom -->
  <path d="M0 640 Q 300 590 600 640 T 1200 620 L 1200 750 L 0 750 Z" fill="url(#waveGrad)"/>
  <path d="M0 670 Q 350 630 700 680 T 1200 660 L 1200 750 L 0 750 Z" fill="#00d2ff" fill-opacity="0.12"/>
</svg>
`;

async function run() {
  const buf = Buffer.from(svg);
  await sharp(buf).png().toFile('public/BlueSanctuary.PNG');
  await sharp(buf).png().toFile('src/assets/BlueSanctuary.PNG');
  console.log('BlueSanctuary.PNG generated successfully!');
}
run();
