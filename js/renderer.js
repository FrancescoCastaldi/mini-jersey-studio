/**
 * MINIJERSEY STUDIO — HIGH-FIDELITY VECTOR & CANVAS RENDERER
 */

(function(window) {
  'use strict';

  class JerseyRenderer {
    constructor(containerElement, stateManager) {
      this.container = containerElement;
      this.stateManager = stateManager;
      this.activeElementHover = null;

      // Subscribe to state changes for automatic re-renders
      this.stateManager.subscribe(() => this.render());
    }

    /**
     * Main Render method that injects SVG into DOM
     */
    render() {
      const state = this.stateManager.getState();
      const svgMarkup = this.generateSVG(state);
      this.container.innerHTML = svgMarkup;

      // Apply zoom & transform
      const zoom = state.zoom || 1.0;
      this.container.style.transform = `scale(${zoom})`;

      // Bind interactive click-to-edit events on zones
      this.bindZoneInteractions();
    }

    /**
     * Generates pure SVG string from state
     */
    generateSVG(state) {
      const geo = window.JERSEY_GEOMETRY;
      const patterns = window.PATTERN_ENGINE;
      const isFront = state.view === 'front';
      const isMini = state.mode === 'mini';

      const colors = state.colors;
      const pattern = state.pattern;

      // Pattern fill for torso
      let torsoFill = colors.torso;
      if (['polka-dots', 'aero-honeycomb', 'gradient-fade', 'speed-chevrons', 'topo-mountains'].includes(pattern.type)) {
        torsoFill = "url(#jersey-active-pattern)";
      }

      let defs = patterns.generateDefs(state);

      // Add Torso Clipping Path
      const torsoPath = isFront ? geo.front.torso : geo.back.torso;
      defs += `
        <clipPath id="torso-clip">
          <path d="${torsoPath}" />
        </clipPath>
        <clipPath id="sleeve-left-clip">
          <path d="${isFront ? geo.front.sleeveLeft : geo.back.sleeveLeft}" />
        </clipPath>
        <clipPath id="sleeve-right-clip">
          <path d="${isFront ? geo.front.sleeveRight : geo.back.sleeveRight}" />
        </clipPath>
      `;

      let svg = `
        <svg id="jersey-svg-root" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${geo.width} ${geo.height}" width="${geo.width}" height="${geo.height}" preserveAspectRatio="${isMini ? 'xMidYMid meet' : 'none'}" style="overflow: visible;">
          <defs>
            ${defs}
          </defs>

          <!-- LAYER: 3D MINI HANGER (If in Mini Jersey Mode) -->
          ${isMini ? this.renderHanger() : ''}

          <!-- LAYER: SLEEVES & CUFFS -->
          <g id="group-sleeves">
            <!-- Left Sleeve -->
            <path id="zone-sleeveLeft" class="interactive-zone" data-zone="sleeveLeft"
                  d="${isFront ? geo.front.sleeveLeft : geo.back.sleeveLeft}" 
                  fill="${colors.sleeveLeft}" stroke="#1f242d" stroke-width="1.5" />
            <!-- Left Cuff -->
            <path id="zone-cuffLeft" class="interactive-zone" data-zone="cuffs"
                  d="${isFront ? geo.front.cuffLeft : geo.back.cuffLeft}" 
                  fill="${colors.cuffs}" stroke="#1f242d" stroke-width="1.5" />

            <!-- Right Sleeve -->
            <path id="zone-sleeveRight" class="interactive-zone" data-zone="sleeveRight"
                  d="${isFront ? geo.front.sleeveRight : geo.back.sleeveRight}" 
                  fill="${colors.sleeveRight}" stroke="#1f242d" stroke-width="1.5" />
            <!-- Right Cuff -->
            <path id="zone-cuffRight" class="interactive-zone" data-zone="cuffs"
                  d="${isFront ? geo.front.cuffRight : geo.back.cuffRight}" 
                  fill="${colors.cuffs}" stroke="#1f242d" stroke-width="1.5" />
          </g>

          <!-- LAYER: SIDE BREATHABLE MESH PANELS -->
          <g id="group-side-panels">
            <path id="zone-sidePanelLeft" class="interactive-zone" data-zone="sidePanels"
                  d="${isFront ? geo.front.sidePanelLeft : geo.back.sidePanelLeft}" 
                  fill="${colors.sidePanels}" stroke="#1f242d" stroke-width="1.2" />
            <path d="${isFront ? geo.front.sidePanelLeft : geo.back.sidePanelLeft}" fill="url(#mesh-panel-grad)" opacity="0.6" pointer-events="none" />

            <path id="zone-sidePanelRight" class="interactive-zone" data-zone="sidePanels"
                  d="${isFront ? geo.front.sidePanelRight : geo.back.sidePanelRight}" 
                  fill="${colors.sidePanels}" stroke="#1f242d" stroke-width="1.2" />
            <path d="${isFront ? geo.front.sidePanelRight : geo.back.sidePanelRight}" fill="url(#mesh-panel-grad)" opacity="0.6" pointer-events="none" />
          </g>

          <!-- LAYER: MAIN TORSO (BODY) & PATTERNS -->
          <g id="group-torso">
            <!-- Base Clipped Torso -->
            <path id="zone-torso" class="interactive-zone" data-zone="torso"
                  d="${torsoPath}" 
                  fill="${torsoFill}" stroke="#1f242d" stroke-width="2" />
            
            <!-- Torso Clipped Additional Pattern Layers (e.g. vintage band, uci stripes, diagonals) -->
            <g clip-path="url(#torso-clip)" pointer-events="none">
              ${patterns.renderTorsoPatternLayers(state)}
            </g>
          </g>

          <!-- LAYER: BACK POCKETS (Only on Back View) -->
          ${!isFront ? this.renderBackPockets(state) : ''}

          <!-- LAYER: ZIPPER (Only on Front View) -->
          ${isFront ? this.renderZipper(colors.zipper) : ''}

          <!-- LAYER: COLLAR -->
          <g id="group-collar">
            <path id="zone-collar" class="interactive-zone" data-zone="collar"
                  d="${isFront ? geo.front.collar : geo.back.collar}" 
                  fill="${colors.collar}" stroke="#1f242d" stroke-width="2" />
          </g>

          <!-- LAYER: BOTTOM SILICONE HEM GRIPPER -->
          <path id="zone-hem" class="interactive-zone" data-zone="hem"
                d="${isFront ? geo.front.hem : geo.back.hem}" 
                fill="${colors.hem}" stroke="#1f242d" stroke-width="1.5" />

          <!-- LAYER: TEXT & SPONSOR LOGOS -->
          <g id="group-texts" pointer-events="none">
            ${this.renderTexts(state)}
          </g>

          <!-- LAYER: APPLIED LOGOS & PHOTOS -->
          <g id="group-applied-logos">
            ${this.renderAppliedLogos(state)}
          </g>

          <!-- LAYER: REALISTIC FABRIC SHADING & LIGHTING OVERLAY -->
          <path d="${torsoPath}" fill="url(#fabric-lighting-front)" pointer-events="none" />

          <!-- Subtle Stitching Lines -->
          <g stroke="#ffffff" stroke-opacity="0.15" stroke-dasharray="3,2" stroke-width="1" fill="none" pointer-events="none">
            <path d="${isFront ? 'M 195,145 L 152,220 M 305,145 L 348,220' : 'M 190,130 L 152,220 M 310,130 L 348,220'}" />
          </g>

        </svg>
      `;

      return svg;
    }

    /**
     * Renders 3D Wooden Mini Hanger
     */
    renderHanger() {
      const h = window.JERSEY_GEOMETRY.hanger;
      return `
        <g id="group-mini-hanger" pointer-events="none">
          <!-- Hook Metallic Shadow -->
          <path d="${h.hook}" stroke="rgba(0,0,0,0.5)" stroke-width="6" fill="none" stroke-linecap="round" transform="translate(2, 2)" />
          <!-- Metallic Chrome Hook -->
          <path d="${h.hook}" stroke="url(#zipper-metal-grad)" stroke-width="5" fill="none" stroke-linecap="round" />
          <circle cx="${h.topTip.cx}" cy="${h.topTip.cy}" r="${h.topTip.r}" fill="#cbd5e1" />
          
          <!-- Hanger Bar (Wooden) -->
          <path d="${h.bar}" fill="url(#hanger-wood)" stroke="#451a03" stroke-width="1.5" />
          <path d="${h.woodTexture}" stroke="rgba(255,255,255,0.2)" stroke-width="1" fill="none" />
        </g>
      `;
    }

    /**
     * Renders Front Full-Length Zipper
     */
    renderZipper(zipperColor) {
      const z = window.JERSEY_GEOMETRY.front;
      return `
        <g id="group-zipper" class="interactive-zone" data-zone="zipper" style="cursor: pointer;">
          <!-- Zipper Track -->
          <path d="${z.zipperTrack}" stroke="#000000" stroke-width="4" stroke-opacity="0.4" />
          <path d="${z.zipperTrack}" stroke="${zipperColor}" stroke-width="2.5" stroke-dasharray="4,2" />
          
          <!-- Metal Puller Tab -->
          <g transform="translate(${z.zipperPuller.x}, ${z.zipperPuller.y})">
            <rect x="-4" y="-3" width="8" height="6" rx="2" fill="url(#zipper-metal-grad)" stroke="#374151" stroke-width="0.8" />
            <polygon points="-2.5,3 2.5,3 1.5,13 -1.5,13" fill="url(#zipper-metal-grad)" stroke="#374151" stroke-width="0.8" />
            <circle cx="0" cy="9" r="1.2" fill="#1f2937" />
          </g>
        </g>
      `;
    }

    /**
     * Renders the 3 Ergonomic Cycling Cargo Back Pockets
     */
    renderBackPockets(state) {
      const b = window.JERSEY_GEOMETRY.back;
      const pocketColor = state.colors.pockets;

      return `
        <g id="group-back-pockets" class="interactive-zone" data-zone="pockets" style="cursor: pointer;">
          <!-- Pockets Background with Drop Shadow -->
          <g filter="drop-shadow(0 -3px 4px rgba(0,0,0,0.35))">
            <!-- Left Pocket -->
            <path d="${b.pocketLeft}" fill="${pocketColor}" stroke="#1f242d" stroke-width="1.5" />
            <!-- Center Pocket -->
            <path d="${b.pocketCenter}" fill="${pocketColor}" stroke="#1f242d" stroke-width="1.5" />
            <!-- Right Pocket -->
            <path d="${b.pocketRight}" fill="${pocketColor}" stroke="#1f242d" stroke-width="1.5" />
          </g>

          <!-- Pockets Reinforced Top Elastic Band -->
          <path d="${b.pocketsTopBand}" fill="#09090b" stroke="#1f242d" stroke-width="1.2" />

          <!-- Center Reflective Safety Strip -->
          <path d="${b.reflectiveTab}" fill="#f8fafc" stroke="#94a3b8" stroke-width="0.8" />
          
          <!-- Pocket Seam Divider Lines -->
          <line x1="219" y1="380" x2="219" y2="488" stroke="#000000" stroke-width="2" opacity="0.4" />
          <line x1="281" y1="380" x2="281" y2="488" stroke="#000000" stroke-width="2" opacity="0.4" />
        </g>
      `;
    }

    /**
     * Renders Sponsor & Rider text
     */
    renderTexts(state) {
      const isFront = state.view === 'front';
      const sp = state.text.sponsor;
      const rd = state.text.rider;
      let textMarkup = '';

      // Main Sponsor Text
      if (sp && sp.content) {
        if ((isFront && sp.showFront) || (!isFront && sp.showBack)) {
          const yPos = isFront ? 285 : 220;
          textMarkup += `
            <text x="250" y="${yPos}" 
                  font-family="${sp.font}, sans-serif" 
                  font-size="${sp.size}" 
                  font-weight="800" 
                  letter-spacing="0.08em"
                  fill="${sp.color}" 
                  text-anchor="middle" 
                  dominant-baseline="middle"
                  style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.4));">
              ${this.escapeHtml(sp.content.toUpperCase())}
            </text>
          `;
        }
      }

      // Rider Name & Race Number (Only on Back View)
      if (!isFront && rd && rd.show) {
        if (rd.name) {
          textMarkup += `
            <text x="250" y="320" 
                  font-family="Plus Jakarta Sans, sans-serif" 
                  font-size="16" 
                  font-weight="700" 
                  letter-spacing="0.1em"
                  fill="${rd.color}" 
                  text-anchor="middle"
                  style="filter: drop-shadow(0 1px 3px rgba(0,0,0,0.5));">
              ${this.escapeHtml(rd.name.toUpperCase())}
            </text>
          `;
        }
        if (rd.number) {
          // Number inside center pocket
          textMarkup += `
            <!-- Race Number Badge on Center Pocket -->
            <g transform="translate(250, 435)">
              <rect x="-18" y="-18" width="36" height="36" rx="6" fill="#ffffff" stroke="#000000" stroke-width="1.5" />
              <text x="0" y="2" 
                    font-family="Impact, Plus Jakarta Sans, sans-serif" 
                    font-size="24" 
                    font-weight="900" 
                    fill="#09090b" 
                    text-anchor="middle" 
                    dominant-baseline="middle">
                ${this.escapeHtml(rd.number)}
              </text>
            </g>
          `;
        }
      }

      return textMarkup;
    }

    /**
     * Renders Uploaded Logos / Artwork layers
     */
    renderAppliedLogos(state) {
      const currentView = state.view;
      const logos = state.logos.filter(l => l.view === currentView);
      const selectedId = state.selectedLogoId;

      return logos.map(logo => {
        const isSelected = logo.id === selectedId;
        const scale = (logo.scale || 100) / 100;
        const rot = logo.rotation || 0;
        const op = (logo.opacity || 100) / 100;
        const blend = logo.blendMode || 'normal';

        // Size bounding box
        const size = 60 * scale;
        const halfSize = size / 2;

        let content = '';
        if (logo.type === 'svg' && logo.svgContent) {
          content = `
            <g transform="translate(-${halfSize}, -${halfSize}) scale(${size / 24})">
              ${logo.svgContent}
            </g>
          `;
        } else if (logo.dataUrl) {
          content = `
            <image href="${logo.dataUrl}" x="-${halfSize}" y="-${halfSize}" width="${size}" height="${size}" preserveAspectRatio="xMidYMid meet" />
          `;
        }

        return `
          <g id="${logo.id}" class="applied-logo-element ${isSelected ? 'logo-active-selection' : ''}"
             transform="translate(${logo.x}, ${logo.y}) rotate(${rot})"
             opacity="${op}"
             style="mix-blend-mode: ${blend}; cursor: grab;"
             data-logo-id="${logo.id}">
            
            ${content}

            ${isSelected ? `
              <!-- Visual Selection Bounding Box -->
              <rect x="-${halfSize + 4}" y="-${halfSize + 4}" width="${size + 8}" height="${size + 8}" 
                    fill="none" stroke="#38bdf8" stroke-width="1.8" stroke-dasharray="4,3" rx="4" pointer-events="none" />
              <circle cx="${halfSize + 4}" cy="-${halfSize + 4}" r="5" fill="#38bdf8" pointer-events="none" />
            ` : ''}
          </g>
        `;
      }).join('');
    }

    /**
     * Bind click events on zones so clicking on the jersey selects that zone in sidebar
     */
    bindZoneInteractions() {
      const zones = this.container.querySelectorAll('.interactive-zone');
      zones.forEach(el => {
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          const zoneName = el.getAttribute('data-zone');
          if (zoneName) {
            // Switch sidebar tab to Zones & highlight the picker
            const zonesTabBtn = document.querySelector('.tab-btn[data-tab="tab-zones"]');
            if (zonesTabBtn) zonesTabBtn.click();

            const zoneItem = document.querySelector(`.zone-item[data-zone="${zoneName}"]`);
            if (zoneItem) {
              zoneItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
              zoneItem.classList.add('highlighted');
              setTimeout(() => zoneItem.classList.remove('highlighted'), 1200);

              const colorInput = zoneItem.querySelector('input[type="color"]');
              if (colorInput) colorInput.focus();
            }
          }
        });
      });

      // Bind logo click & drag on stage
      const logoEls = this.container.querySelectorAll('.applied-logo-element');
      logoEls.forEach(el => {
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          const logoId = el.getAttribute('data-logo-id');
          if (logoId) {
            this.stateManager.selectLogo(logoId);
            const logosTabBtn = document.querySelector('.tab-btn[data-tab="tab-logos"]');
            if (logosTabBtn) logosTabBtn.click();
          }
        });

        // Stage Dragging implementation
        this.enableLogoDrag(el);
      });
    }

    /**
     * Interactive Drag-and-Drop of logos directly on the Jersey Canvas Stage
     */
    enableLogoDrag(logoEl) {
      const logoId = logoEl.getAttribute('data-logo-id');
      const renderer = this;

      let isDragging = false;
      let startX, startY;
      let initialLogoX, initialLogoY;

      const onMouseDown = (e) => {
        e.preventDefault();
        e.stopPropagation();
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;

        const currentLogo = renderer.stateManager.getState().logos.find(l => l.id === logoId);
        if (currentLogo) {
          initialLogoX = currentLogo.x;
          initialLogoY = currentLogo.y;
        }

        renderer.stateManager.selectLogo(logoId);

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
      };

      const onMouseMove = (e) => {
        if (!isDragging) return;
        const zoom = renderer.stateManager.getState().zoom || 1.0;
        const dx = (e.clientX - startX) / zoom;
        const dy = (e.clientY - startY) / zoom;

        const newX = Math.round(Math.max(40, Math.min(460, initialLogoX + dx)));
        const newY = Math.round(Math.max(100, Math.min(520, initialLogoY + dy)));

        renderer.stateManager.updateLogo(logoId, { x: newX, y: newY }, false);
      };

      const onMouseUp = () => {
        if (isDragging) {
          isDragging = false;
          renderer.stateManager.pushHistory();
          window.removeEventListener('mousemove', onMouseMove);
          window.removeEventListener('mouseup', onMouseUp);
        }
      };

      logoEl.addEventListener('mousedown', onMouseDown);
    }

    /**
     * High-Definition Canvas Render Engine (Exports up to 4K PNG)
     */
    renderToCanvas(targetView = 'front', targetMode = 'flat', width = 1500, height = 1800) {
      return new Promise((resolve, reject) => {
        const state = JSON.parse(JSON.stringify(this.stateManager.getState()));
        state.view = targetView;
        state.mode = targetMode;
        state.zoom = 1.0;
        state.selectedLogoId = null; // Unselect bounding box for clean render

        const svgMarkup = this.generateSVG(state);
        const svgBlob = new Blob([svgMarkup], { type: 'image/svg+xml;charset=utf-8' });
        const URL = window.URL || window.webkitURL || window;
        const blobURL = URL.createObjectURL(svgBlob);

        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');

          // Draw transparent or crisp clean background
          ctx.clearRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);

          URL.revokeObjectURL(blobURL);
          resolve(canvas);
        };
        img.onerror = (err) => {
          URL.revokeObjectURL(blobURL);
          reject(err);
        };
        img.src = blobURL;
      });
    }

    escapeHtml(str) {
      return str.replace(/[&<>"']/g, function(m) {
        return {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#039;'
        }[m];
      });
    }
  }

  window.JerseyRenderer = JerseyRenderer;

})(window);
