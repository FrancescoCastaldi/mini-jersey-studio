/**
 * MINIJERSEY STUDIO — SVG GEOMETRY, PATH DEFINITIONS & ANATOMICAL ZONES
 */

(function(window) {
  'use strict';

  // Standard Canvas / ViewBox coordinates: 500 x 600
  const VIEWBOX = { width: 500, height: 600 };

  const JERSEY_GEOMETRY = {
    viewBox: `0 0 ${VIEWBOX.width} ${VIEWBOX.height}`,
    width: VIEWBOX.width,
    height: VIEWBOX.height,

    // Smart Snap Placement Coordinates (Front & Back)
    snapTargets: {
      'chest-center': { view: 'front', x: 250, y: 235, defaultScale: 90, label: 'Centro Petto' },
      'chest-left':   { view: 'front', x: 195, y: 200, defaultScale: 60, label: 'Scudo Cuore (Sx)' },
      'chest-right':  { view: 'front', x: 305, y: 200, defaultScale: 60, label: 'Logo Tecnico (Dx)' },
      'sleeve-left':  { view: 'front', x: 100, y: 195, defaultScale: 55, label: 'Manica Sinistra' },
      'sleeve-right': { view: 'front', x: 400, y: 195, defaultScale: 55, label: 'Manica Destra' },
      'collar-center':{ view: 'front', x: 250, y: 142, defaultScale: 40, label: 'Colletto Fronte' },
      
      'back-upper':   { view: 'back',  x: 250, y: 220, defaultScale: 95, label: 'Retro Alto Schiena' },
      'back-pocket-center': { view: 'back', x: 250, y: 440, defaultScale: 65, label: 'Tasca Post. Centro' },
      'back-pocket-left':   { view: 'back', x: 185, y: 440, defaultScale: 55, label: 'Tasca Post. Sx' },
      'back-pocket-right':  { view: 'back', x: 315, y: 440, defaultScale: 55, label: 'Tasca Post. Dx' }
    },

    // -------------------------------------------------------------
    // FRONT VIEW PATHS
    // -------------------------------------------------------------
    front: {
      // Main Body / Torso
      torso: "M 195,142 C 215,152 285,152 305,142 L 348,220 C 342,280 340,360 345,490 L 155,490 C 160,360 158,280 152,220 Z",
      
      // Aerodynamic Front Collar
      collar: "M 195,142 C 215,152 285,152 305,142 C 298,124 280,118 250,118 C 220,118 202,124 195,142 Z",
      
      // Left Sleeve (Viewer's Left)
      sleeveLeft: "M 195,142 L 152,220 L 76,228 L 52,148 L 195,142 Z",
      
      // Right Sleeve (Viewer's Right)
      sleeveRight: "M 305,142 L 348,220 L 424,228 L 448,148 L 305,142 Z",
      
      // Left Arm Cuff (Elastic Band)
      cuffLeft: "M 76,228 L 52,148 L 42,154 L 64,235 Z",
      
      // Right Arm Cuff (Elastic Band)
      cuffRight: "M 424,228 L 448,148 L 458,154 L 436,235 Z",
      
      // Left Side Breathable Mesh Panel
      sidePanelLeft: "M 152,220 C 158,280 160,360 155,490 L 140,490 C 145,360 142,280 135,220 Z",
      
      // Right Side Breathable Mesh Panel
      sidePanelRight: "M 348,220 C 342,280 340,360 345,490 L 360,490 C 355,360 358,280 365,220 Z",

      // Bottom Silicone Waistband Gripper
      hem: "M 138,490 L 362,490 L 362,504 C 300,508 200,508 138,504 Z",

      // Full Length Front Zipper Line & Slider
      zipperTrack: "M 250,147 L 250,494",
      zipperPuller: { x: 250, y: 156 }
    },

    // -------------------------------------------------------------
    // BACK VIEW PATHS
    // -------------------------------------------------------------
    back: {
      // Main Back Torso
      torso: "M 190,126 C 220,132 280,132 310,126 L 348,220 C 342,280 340,360 345,490 L 155,490 C 160,360 158,280 152,220 Z",
      
      // Rear High Collar
      collar: "M 190,126 C 220,132 280,132 310,126 C 302,112 280,108 250,108 C 220,108 198,112 190,126 Z",
      
      // Left Sleeve (Viewer's Left from Back)
      sleeveLeft: "M 190,126 L 152,220 L 76,228 L 52,148 L 190,126 Z",
      
      // Right Sleeve (Viewer's Right from Back)
      sleeveRight: "M 310,126 L 348,220 L 424,228 L 448,148 L 310,126 Z",
      
      // Left Arm Cuff
      cuffLeft: "M 76,228 L 52,148 L 42,154 L 64,235 Z",
      
      // Right Arm Cuff
      cuffRight: "M 424,228 L 448,148 L 458,154 L 436,235 Z",
      
      // Side Panels
      sidePanelLeft: "M 152,220 C 158,280 160,360 155,490 L 140,490 C 145,360 142,280 135,220 Z",
      sidePanelRight: "M 348,220 C 342,280 340,360 345,490 L 360,490 C 355,360 358,280 365,220 Z",

      // The Iconic 3 Cargo Pockets Section
      // Left Cargo Pocket
      pocketLeft: "M 156,380 L 218,380 L 218,488 L 156,488 Z",
      // Center Cargo Pocket
      pocketCenter: "M 220,378 L 280,378 L 280,488 L 220,488 Z",
      // Right Cargo Pocket
      pocketRight: "M 282,380 L 344,380 L 344,488 L 282,488 Z",

      // Pocket Top Reinforced Elastic Seam
      pocketsTopBand: "M 155,380 C 220,376 280,376 345,380 L 345,388 C 280,384 220,384 155,388 Z",

      // Reflective Safety Tab
      reflectiveTab: "M 246,478 L 254,478 L 254,488 L 246,488 Z",

      // Bottom Gripper
      hem: "M 138,490 L 362,490 L 362,504 C 300,508 200,508 138,504 Z"
    },

    // -------------------------------------------------------------
    // ACCESSORIES & 3D MINI HANGER / STAND
    // -------------------------------------------------------------
    hanger: {
      hook: "M 250,55 C 235,55 228,68 228,80 C 228,95 250,98 250,116",
      topTip: { cx: 250, cy: 55, r: 4 },
      bar: "M 170,146 L 250,118 L 330,146 C 330,152 170,152 170,146 Z",
      woodTexture: "M 180,144 L 250,122 L 320,144"
    }
  };

  // Stock Badges SVG content (for immediate use without uploading files)
  const STOCK_BADGES = {
    'velox': `
      <g fill="currentColor">
        <!-- Velocity Aero Wing V Emblem -->
        <path d="M12 18.5L18.8 3H15.2L10.8 13.5L7.2 8.2H4.8L9.2 15L12 18.5Z"/>
        <path d="M1.5 3L10.2 9.5L9.2 11.2L2.8 6.5Z"/>
        <path d="M3.2 5.8L8.8 11.2L7.8 12.8L4.6 9.5Z"/>
        <text x="12" y="23" font-family="'Plus Jakarta Sans', -apple-system, sans-serif" font-weight="800" font-size="3.4" letter-spacing="0.22em" text-anchor="middle" fill="currentColor">VELOX</text>
      </g>
    `,
    'aero-apex': `
      <g stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 2L3 9L12 16L21 9L12 2Z"/>
        <path d="M6 12.5L12 17.5L18 12.5"/>
        <path d="M8 16L12 19.5L16 16"/>
      </g>
    `,
    'bike': `
      <g stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="18.5" cy="17.5" r="3.5"/>
        <circle cx="5.5" cy="17.5" r="3.5"/>
        <circle cx="15" cy="5" r="1"/>
        <path d="M12 17.5V14l-3-3 4-3 2 3h2"/>
      </g>
    `,
    'mountains': `
      <g stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <path d="m8 3 4 8 5-5 5 15H2L8 3z"/>
      </g>
    `,
    'shield': `
      <g stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        <path d="M12 7v10M8 11h8"/>
      </g>
    `,
    'lightning': `
      <g fill="currentColor">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
      </g>
    `,
    'crown': `
      <g stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"/>
      </g>
    `,
    'flag-ita': `
      <g>
        <rect x="2" y="4" width="6.6" height="16" fill="#009246"/>
        <rect x="8.6" y="4" width="6.6" height="16" fill="#ffffff"/>
        <rect x="15.2" y="4" width="6.8" height="16" fill="#ce2b37"/>
        <rect x="2" y="4" width="20" height="16" fill="none" stroke="rgba(0,0,0,0.3)" stroke-width="1"/>
      </g>
    `
  };

  window.JERSEY_GEOMETRY = JERSEY_GEOMETRY;
  window.STOCK_BADGES = STOCK_BADGES;

})(window);
