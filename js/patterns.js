/**
 * MINIJERSEY STUDIO — PROCEDURAL PATTERNS & ARTWORK GENERATOR
 */

(function(window) {
  'use strict';

  const PATTERN_ENGINE = {

    /**
     * Generates SVG <defs> elements for patterns, gradients, and clips
     */
    generateDefs: function(state) {
      const p = state.pattern;
      const primary = state.colors.torso;
      const secondary = p.secondaryColor || '#ffffff';
      const tertiary = p.tertiaryColor || '#09090b';
      const scale = (p.scale || 100) / 100;

      let defsContent = `
        <!-- Base Filters for Realistic Fabric Texture & Drop Shadows -->
        <filter id="fabric-texture" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.04 0.04" numOctaves="3" result="noise" />
          <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.04 0" result="noiseAlpha" />
          <feComposite in="SourceGraphic" in2="noiseAlpha" operator="over" />
        </filter>

        <linearGradient id="fabric-lighting-front" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.12" />
          <stop offset="50%" stop-color="#ffffff" stop-opacity="0" />
          <stop offset="100%" stop-color="#000000" stop-opacity="0.25" />
        </linearGradient>

        <linearGradient id="mesh-panel-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#000000" stop-opacity="0.3" />
          <stop offset="50%" stop-color="#000000" stop-opacity="0" />
          <stop offset="100%" stop-color="#000000" stop-opacity="0.3" />
        </linearGradient>

        <linearGradient id="zipper-metal-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#9ca3af" />
          <stop offset="50%" stop-color="#f3f4f6" />
          <stop offset="100%" stop-color="#4b5563" />
        </linearGradient>

        <linearGradient id="hanger-wood" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#854d0e" />
          <stop offset="50%" stop-color="#ca8a04" />
          <stop offset="100%" stop-color="#713f12" />
        </linearGradient>
      `;

      // Procedural Pattern Defs
      switch (p.type) {
        case 'polka-dots': {
          const dotSize = 14 * scale;
          const spacing = 42 * scale;
          defsContent += `
            <pattern id="jersey-active-pattern" x="0" y="0" width="${spacing}" height="${spacing}" patternUnits="userSpaceOnUse">
              <rect width="${spacing}" height="${spacing}" fill="${primary}" />
              <circle cx="${spacing / 2}" cy="${spacing / 2}" r="${dotSize / 2}" fill="${secondary}" />
              <circle cx="0" cy="0" r="${dotSize / 2}" fill="${secondary}" />
              <circle cx="${spacing}" cy="0" r="${dotSize / 2}" fill="${secondary}" />
              <circle cx="0" cy="${spacing}" r="${dotSize / 2}" fill="${secondary}" />
              <circle cx="${spacing}" cy="${spacing}" r="${dotSize / 2}" fill="${secondary}" />
            </pattern>
          `;
          break;
        }

        case 'aero-honeycomb': {
          const hexW = 20 * scale;
          const hexH = 34.64 * scale;
          defsContent += `
            <pattern id="jersey-active-pattern" width="${hexW}" height="${hexH}" patternUnits="userSpaceOnUse">
              <rect width="${hexW}" height="${hexH}" fill="${primary}" />
              <path d="M 0,0 L ${hexW/2},${hexH/4} L ${hexW/2},${3*hexH/4} L 0,${hexH} M ${hexW/2},${hexH/4} L ${hexW},0 M ${hexW/2},${3*hexH/4} L ${hexW},${hexH}" 
                    stroke="${secondary}" stroke-width="1.2" fill="none" stroke-opacity="0.35" />
              <circle cx="${hexW/2}" cy="${hexH/2}" r="${2 * scale}" fill="${tertiary}" opacity="0.4"/>
            </pattern>
          `;
          break;
        }

        case 'gradient-fade': {
          defsContent += `
            <linearGradient id="jersey-active-pattern" x1="0%" y1="10%" x2="0%" y2="90%">
              <stop offset="0%" stop-color="${primary}" />
              <stop offset="50%" stop-color="${secondary}" />
              <stop offset="100%" stop-color="${tertiary}" />
            </linearGradient>
          `;
          break;
        }

        case 'speed-chevrons': {
          const chH = 32 * scale;
          defsContent += `
            <pattern id="jersey-active-pattern" width="60" height="${chH}" patternUnits="userSpaceOnUse">
              <rect width="60" height="${chH}" fill="${primary}" />
              <path d="M 0,${chH/2} L 30,${chH} L 60,${chH/2} L 60,${chH*0.2} L 30,${chH*0.7} L 0,${chH*0.2} Z" fill="${secondary}" opacity="0.85" />
            </pattern>
          `;
          break;
        }

        case 'topo-mountains': {
          defsContent += `
            <pattern id="jersey-active-pattern" width="120" height="120" patternUnits="userSpaceOnUse">
              <rect width="120" height="120" fill="${primary}" />
              <ellipse cx="60" cy="60" rx="${20*scale}" ry="${15*scale}" fill="none" stroke="${secondary}" stroke-width="1.5" stroke-dasharray="3,3" opacity="0.6"/>
              <ellipse cx="60" cy="60" rx="${38*scale}" ry="${28*scale}" fill="none" stroke="${secondary}" stroke-width="1.5" opacity="0.5"/>
              <ellipse cx="60" cy="60" rx="${55*scale}" ry="${42*scale}" fill="none" stroke="${secondary}" stroke-width="1.5" stroke-dasharray="6,3" opacity="0.4"/>
              <path d="M 0,20 Q 30,35 60,10 T 120,30" fill="none" stroke="${tertiary}" stroke-width="1.8" opacity="0.4"/>
            </pattern>
          `;
          break;
        }

        default:
          // For solid or custom drawn patterns (vintage band, uci rainbow, diagonal)
          break;
      }

      return defsContent;
    },

    /**
     * Renders extra vector layers for compound patterns inside the Torso clipping mask
     */
    renderTorsoPatternLayers: function(state) {
      const p = state.pattern;
      const primary = state.colors.torso;
      const secondary = p.secondaryColor || '#ffffff';
      const tertiary = p.tertiaryColor || '#09090b';

      let markup = '';

      switch (p.type) {
        case 'vintage-chest-band': {
          // Classic Retro chest band (like Molteni / Peugeot / Bianchi)
          markup += `
            <!-- Vintage Chest Band Group -->
            <g id="layer-vintage-band">
              <!-- Upper Thin Stripe -->
              <rect x="100" y="240" width="300" height="8" fill="${tertiary}" />
              <!-- Center Main Broad Stripe -->
              <rect x="100" y="248" width="300" height="68" fill="${secondary}" />
              <!-- Lower Thin Stripe -->
              <rect x="100" y="316" width="300" height="8" fill="${tertiary}" />
            </g>
          `;
          break;
        }

        case 'uci-rainbow': {
          // Official UCI World Champion 5 Rainbow Stripes
          const stripeH = 10;
          markup += `
            <g id="layer-uci-rainbow">
              <rect x="100" y="235" width="300" height="70" fill="${secondary}" opacity="0.95" />
              <rect x="100" y="245" width="300" height="${stripeH}" fill="#2563eb" />
              <rect x="100" y="255" width="300" height="${stripeH}" fill="#ef4444" />
              <rect x="100" y="265" width="300" height="${stripeH}" fill="#09090b" />
              <rect x="100" y="275" width="300" height="${stripeH}" fill="#eab308" />
              <rect x="100" y="285" width="300" height="${stripeH}" fill="#16a34a" />
            </g>
          `;
          break;
        }

        case 'diagonal-racing': {
          // Dynamic angled racing band
          markup += `
            <g id="layer-diagonal-racing">
              <polygon points="120,140 210,140 370,500 280,500" fill="${secondary}" opacity="0.9" />
              <polygon points="215,140 230,140 390,500 375,500" fill="${tertiary}" opacity="0.8" />
            </g>
          `;
          break;
        }

        case 'twin-vertical-stripes': {
          // Dual Center GT Stripes
          markup += `
            <g id="layer-vertical-stripes">
              <rect x="230" y="140" width="14" height="370" fill="${secondary}" />
              <rect x="256" y="140" width="14" height="370" fill="${secondary}" />
              <rect x="226" y="140" width="4" height="370" fill="${tertiary}" />
              <rect x="270" y="140" width="4" height="370" fill="${tertiary}" />
            </g>
          `;
          break;
        }

        default:
          break;
      }

      return markup;
    }
  };

  window.PATTERN_ENGINE = PATTERN_ENGINE;

})(window);
