/**
 * MINIJERSEY STUDIO —” PRODUCTION TECH PACK & 3D PAPERCRAFT GENERATOR
 * Generates factory-ready sublimation apparel specifications & physical papercraft templates.
 */

(function(window) {
  'use strict';

  const TECH_PACK_GENERATOR = {

    /**
     * Estimates nearest Pantone / CMYK reference for dye sublimation printing
     */
    hexToColorSpecs: function(hex) {
      hex = hex.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16) || 0;
      const g = parseInt(hex.substring(2, 4), 16) || 0;
      const b = parseInt(hex.substring(4, 6), 16) || 0;

      // RGB to CMYK conversion
      const c1 = 1 - (r / 255);
      const m1 = 1 - (g / 255);
      const y1 = 1 - (b / 255);
      const k = Math.min(c1, Math.min(m1, y1));
      const c = k === 1 ? 0 : Math.round(((c1 - k) / (1 - k)) * 100);
      const m = k === 1 ? 0 : Math.round(((m1 - k) / (1 - k)) * 100);
      const y = k === 1 ? 0 : Math.round(((y1 - k) / (1 - k)) * 100);
      const kVal = Math.round(k * 100);

      return {
        hex: '#' + hex.toUpperCase(),
        rgb: `RGB(${r}, ${g}, ${b})`,
        cmyk: `C:${c}% M:${m}% Y:${y}% K:${kVal}%`
      };
    },

    /**
     * Generates a Factory-Grade Tech Pack Canvas (3000 x 2000 px at 300 DPI)
     */
    generateTechPackCanvas: async function(renderer, stateManager) {
      const state = stateManager.getState();
      const canvas = document.createElement('canvas');
      canvas.width = 3000;
      canvas.height = 2000;
      const ctx = canvas.getContext('2d');

      // 1. Background & Blueprint Grid
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Blueprint subtle grid
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 40) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 40) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
      }

      // 2. Header Box & Metadata
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(50, 50, 2900, 160);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.strokeRect(50, 50, 2900, 160);

      // Title & Logo
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 36px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('TECHNICAL SPECIFICATION & APPAREL PRODUCTION PACK', 90, 110);
      ctx.fillStyle = '#38bdf8';
      ctx.font = '600 20px "JetBrains Mono", monospace';
      ctx.fillText('MINIJERSEY STUDIO —” PROFESSIONAL CYCLING KIT SUITE', 90, 150);

      // Metadata Block (Right)
      ctx.fillStyle = '#94a3b8';
      ctx.font = '16px "JetBrains Mono", monospace';
      const dateStr = new Date().toLocaleDateString('it-IT', { year: 'numeric', month: '2-digit', day: '2-digit' });
      ctx.fillText(`DATE: ${dateStr}`, 2300, 100);
      ctx.fillText(`MODEL: PRO RACE FIT AERO SS JERSEY`, 2300, 130);
      ctx.fillText(`PRINT: HIGH-DENSITY DYE SUBLIMATION 300 DPI`, 2300, 160);

      // 3. Render Front & Back Flat Mockups
      const frontCanvas = await renderer.renderToCanvas('front', 'flat', 850, 1020);
      const backCanvas = await renderer.renderToCanvas('back', 'flat', 850, 1020);

      // Draw Front View Box
      ctx.fillStyle = '#141e33';
      ctx.fillRect(80, 250, 920, 1200);
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.strokeRect(80, 250, 920, 1200);

      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 22px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('1. FRONT PANEL TECHNICAL SPEC', 110, 295);
      ctx.drawImage(frontCanvas, 115, 340);

      // Front Annotations
      ctx.fillStyle = '#38bdf8';
      ctx.font = '14px "JetBrains Mono", monospace';
      ctx.fillText('â—„ Full Camlock YKK Zipper with Garage', 560, 480);
      ctx.fillText('â—„ 130 GSM Micro-Mesh Stretch Fabric', 560, 720);
      ctx.fillText('â—„ 45mm Laser-Cut Silicone Arm Gripper', 110, 980);

      // Draw Back View Box
      ctx.fillStyle = '#141e33';
      ctx.fillRect(1040, 250, 920, 1200);
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.strokeRect(1040, 250, 920, 1200);

      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 22px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('2. REAR PANEL & 3 CARGO POCKETS', 1070, 295);
      ctx.drawImage(backCanvas, 1075, 340);

      // Back Annotations
      ctx.fillText('â—„ Reinforced 3 Cargo Pockets with 3M Reflective Strip', 1480, 880);
      ctx.fillText('â—„ Breathable Honeycomb Side Ventilation Panel', 1480, 680);
      ctx.fillText('â—„ Elastic Silicone Waistband Gripper', 1070, 1040);

      // 4. Color Swatches & Sublimation Values Table (Right Panel)
      ctx.fillStyle = '#141e33';
      ctx.fillRect(2000, 250, 950, 800);
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.strokeRect(2000, 250, 950, 800);

      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 22px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('3. FABRIC & COLORWAY SPECIFICATIONS (HEX / CMYK)', 2030, 295);

      const colorEntries = [
        { label: 'Torso Primary Panel', hex: state.colors.torso },
        { label: 'Collar & Neckband', hex: state.colors.collar },
        { label: 'Sleeves (Left & Right)', hex: state.colors.sleeveLeft },
        { label: 'Arm Cuffs (Gripper)', hex: state.colors.cuffs },
        { label: 'Breathable Side Panels', hex: state.colors.sidePanels },
        { label: 'Rear Cargo Pockets', hex: state.colors.pockets },
        { label: 'Pattern Accent Color', hex: state.pattern.secondaryColor || '#ffffff' },
        { label: 'Zipper & Detail Accent', hex: state.colors.zipper }
      ];

      let swatchY = 340;
      colorEntries.forEach((c, idx) => {
        const specs = this.hexToColorSpecs(c.hex);

        // Swatch square
        ctx.fillStyle = specs.hex;
        ctx.fillRect(2030, swatchY, 44, 44);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(2030, swatchY, 44, 44);

        // Labels
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px "Plus Jakarta Sans", sans-serif';
        ctx.fillText(`${idx + 1}. ${c.label}`, 2090, swatchY + 20);

        ctx.fillStyle = '#38bdf8';
        ctx.font = '14px "JetBrains Mono", monospace';
        ctx.fillText(`${specs.hex}  |  ${specs.cmyk}`, 2090, swatchY + 40);

        swatchY += 56;
      });

      // 5. Production & Stitching Notes Box (Bottom Right)
      ctx.fillStyle = '#141e33';
      ctx.fillRect(2000, 1080, 950, 370);
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.strokeRect(2000, 1080, 950, 370);

      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 22px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('4. FACTORY PRODUCTION & FINISHING NOTES', 2030, 1125);

      const notes = [
        '—¢ STITCHING: 4-needle Flatlock anti-abrasion elastic seams throughout.',
        '—¢ PRINT METHOD: Full HD Dye-Sublimation printing at 300 DPI on Italian Poly-Elastane.',
        '—¢ ZIPPER: Full length hidden/visible YKK inverted Camlock zipper with bottom stop.',
        '—¢ WAISTBAND: 45mm rear powerband silicone gripper with anti-slip micro-dots.',
        '—¢ SAFETY: Dual 3M Scotchlite reflective tabs inserted at rear center pocket hem.'
      ];

      ctx.fillStyle = '#cbd5e1';
      ctx.font = '15px "Plus Jakarta Sans", sans-serif';
      let noteY = 1170;
      notes.forEach(note => {
        ctx.fillText(note, 2030, noteY);
        noteY += 38;
      });

      // 6. Footer Sign-off Block
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(80, 1490, 2870, 200);
      ctx.strokeStyle = '#334155';
      ctx.strokeRect(80, 1490, 2870, 200);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '15px "JetBrains Mono", monospace';
      ctx.fillText('APPROVED FOR MANUFACTURING: _____________________________', 120, 1560);
      ctx.fillText('SIGNATURE: _____________________________', 120, 1610);
      ctx.fillText('FACTORY SAMPLE STAGE: [  ] PROTO 1   [  ] SIZE SET   [ X ] BULK PRODUCTION', 1700, 1560);
      ctx.fillText('CERTIFIED ISO 9001 APPAREL SUBLIMATION STANDARDS', 1700, 1610);

      return canvas;
    },

    /**
     * Generates a Printable 3D Papercraft A4 Canvas (2480 x 3508 px at 300 DPI)
     * For cutting, folding and creating a physical 3D mini jersey!
     */
    generatePapercraftCanvas: async function(renderer, stateManager) {
      const state = stateManager.getState();
      const canvas = document.createElement('canvas');
      canvas.width = 2480;
      canvas.height = 3508;
      const ctx = canvas.getContext('2d');

      // Crisp White Paper Background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Header & Assembly Instructions
      ctx.fillStyle = '#09090b';
      ctx.font = 'bold 44px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('MINIJERSEY 3D —” PRINTABLE DIY TEMPLATE (A4)', 120, 140);

      ctx.fillStyle = '#475569';
      ctx.font = '22px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('1. Print on A4 cardstock (180-250g/m²)  —  2. Cut along solid lines (✂️)  —  3. Fold tabs and glue to create your 3D mini jersey!', 120, 190);

      // Render Flat Front and Flat Back
      const frontCanvas = await renderer.renderToCanvas('front', 'flat', 950, 1140);
      const backCanvas = await renderer.renderToCanvas('back', 'flat', 950, 1140);

      // Draw Front Jersey Flat + Glue Tabs
      ctx.fillStyle = '#f1f5f9';
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 6]);

      // Folding & Glue Tabs Left & Right for Front
      ctx.strokeRect(170, 380, 80, 900);
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(170, 380, 80, 900);
      ctx.fillStyle = '#64748b';
      ctx.font = '16px "JetBrains Mono", monospace';
      ctx.save();
      ctx.translate(220, 800);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText('FRONT LEFT GLUE TAB', 0, 0);
      ctx.restore();

      ctx.strokeRect(1210, 380, 80, 900);
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(1210, 380, 80, 900);
      ctx.save();
      ctx.translate(1260, 800);
      ctx.rotate(Math.PI / 2);
      ctx.fillText('FRONT RIGHT GLUE TAB', 0, 0);
      ctx.restore();

      ctx.setLineDash([]);
      // Draw Front Jersey
      ctx.drawImage(frontCanvas, 250, 280);

      ctx.fillStyle = '#09090b';
      ctx.font = 'bold 28px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('FRONT PANEL (FRONT)', 480, 1460);

      // Draw Back Jersey Flat (Bottom Half)
      ctx.drawImage(backCanvas, 250, 1600);
      ctx.fillText('REAR PANEL (BACK)', 480, 2780);

      // Draw Mini Standee / Desktop Base at the bottom
      ctx.fillStyle = '#f8fafc';
      ctx.strokeStyle = '#09090b';
      ctx.lineWidth = 3;
      ctx.fillRect(1450, 400, 850, 2400);
      ctx.strokeRect(1450, 400, 850, 2400);

      ctx.fillStyle = '#09090b';
      ctx.font = 'bold 32px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('DESKTOP STAND / BASE', 1520, 480);

      ctx.fillStyle = '#64748b';
      ctx.font = '20px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('Fold into triangle to create display base for your mini jersey:', 1520, 530);

      // Standee graphics & sponsor
      ctx.fillStyle = state.colors.torso;
      ctx.fillRect(1520, 600, 710, 200);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 42px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(state.text.sponsor.content || 'MINIJERSEY PRO', 1520 + 355, 715);
      ctx.textAlign = 'left';

      // Guide Lines
      ctx.strokeStyle = '#ef4444';
      ctx.setLineDash([12, 8]);
      ctx.beginPath(); ctx.moveTo(1520, 1200); ctx.lineTo(2230, 1200); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(1520, 1800); ctx.lineTo(2230, 1800); ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 18px "JetBrains Mono", monospace';
      ctx.fillText('--- BASE FOLD LINE ---', 1700, 1185);
      ctx.fillText('--- BASE FOLD LINE ---', 1700, 1785);

      return canvas;
    }
  };

  window.TECH_PACK_GENERATOR = TECH_PACK_GENERATOR;

})(window);






