/**
 * MINIJERSEY STUDIO — STATE MANAGEMENT & HISTORY SYSTEM
 */

(function(window) {
  'use strict';

  // Default initial jersey configuration
  const defaultState = {
    view: 'front',           // 'front' | 'back'
    mode: 'mini',            // 'mini' | 'flat'
    zoom: 1.0,
    
    // Zone Colors
    colors: {
      torso: '#e11d48',
      collar: '#09090b',
      sleeveLeft: '#e11d48',
      sleeveRight: '#e11d48',
      cuffs: '#09090b',
      sidePanels: '#18181b',
      zipper: '#ffffff',
      pockets: '#be123c',
      hem: '#09090b'
    },
    syncSleeves: true,

    // Pattern & Artwork
    pattern: {
      type: 'solid',         // 'solid', 'vintage-chest-band', 'uci-rainbow', 'polka-dots', 'speed-chevrons', 'gradient-fade', 'aero-honeycomb', 'topo-mountains', 'diagonal-racing', 'twin-vertical-stripes'
      secondaryColor: '#ffffff',
      tertiaryColor: '#09090b',
      scale: 100
    },

    // Uploaded / Applied Logos & Photos
    logos: [],
    selectedLogoId: null,

    // Sponsor & Rider Typography
    text: {
      sponsor: {
        content: 'VELOCE CORSA',
        font: 'Plus Jakarta Sans',
        color: '#ffffff',
        size: 36,
        showFront: true,
        showBack: true
      },
      rider: {
        name: 'F. CASTALDI',
        number: '7',
        color: '#ffffff',
        show: true
      }
    }
  };

  // 100% Original, Copyright-Checked Pro Presets
  const PRESETS = {
    'velox-aero-minimal': {
      name: "VELOX Aero Pro Minimalist",
      tag: "Ultra Modern Minimal Light",
      colors: {
        torso: '#0f172a',
        collar: '#06b6d4',
        sleeveLeft: '#1e293b',
        sleeveRight: '#1e293b',
        cuffs: '#06b6d4',
        sidePanels: '#09090b',
        zipper: '#06b6d4',
        pockets: '#1e293b',
        hem: '#06b6d4'
      },
      pattern: { type: 'speed-chevrons', secondaryColor: '#06b6d4', tertiaryColor: '#38bdf8', scale: 100 },
      text: {
        sponsor: { content: 'VELOX APEX', font: 'Plus Jakarta Sans', color: '#ffffff', size: 36, showFront: true, showBack: true },
        rider: { name: 'F. CASTALDI', number: '1', color: '#06b6d4', show: true }
      }
    },
    'dolomiti-peak': {
      name: "Dolomiti Peak Alpine Pro",
      tag: "Alte Quote & Altimetria",
      colors: {
        torso: '#0f172a',
        collar: '#06b6d4',
        sleeveLeft: '#0f172a',
        sleeveRight: '#0f172a',
        cuffs: '#06b6d4',
        sidePanels: '#1e293b',
        zipper: '#06b6d4',
        pockets: '#1e293b',
        hem: '#06b6d4'
      },
      pattern: { type: 'topo-mountains', secondaryColor: '#06b6d4', tertiaryColor: '#38bdf8', scale: 100 },
      text: {
        sponsor: { content: 'DOLOMITI APEX', font: 'Plus Jakarta Sans', color: '#ffffff', size: 36, showFront: true, showBack: true },
        rider: { name: 'F. CASTALDI', number: '18', color: '#06b6d4', show: true }
      }
    },
    'corsa-rosa-heritage': {
      name: "Corsa Rosa Granfondo",
      tag: "Italian Grand Tour Style",
      colors: {
        torso: '#f43f5e',
        collar: '#881337',
        sleeveLeft: '#f43f5e',
        sleeveRight: '#f43f5e',
        cuffs: '#881337',
        sidePanels: '#fda4af',
        zipper: '#ffffff',
        pockets: '#e11d48',
        hem: '#881337'
      },
      pattern: { type: 'solid', secondaryColor: '#ffffff', tertiaryColor: '#881337', scale: 100 },
      text: {
        sponsor: { content: 'CORSA ITALIA', font: 'Plus Jakarta Sans', color: '#ffffff', size: 36, showFront: true, showBack: true },
        rider: { name: 'F. CASTALDI', number: '1', color: '#ffffff', show: true }
      }
    },
    'aero-stealth-carbon': {
      name: "Stealth Carbon Velocity",
      tag: "Criterium Aero Dark",
      colors: {
        torso: '#18181b',
        collar: '#09090b',
        sleeveLeft: '#27272a',
        sleeveRight: '#27272a',
        cuffs: '#eab308',
        sidePanels: '#09090b',
        zipper: '#eab308',
        pockets: '#27272a',
        hem: '#eab308'
      },
      pattern: { type: 'aero-honeycomb', secondaryColor: '#3f3f46', tertiaryColor: '#eab308', scale: 110 },
      text: {
        sponsor: { content: 'STEALTH LAB', font: 'JetBrains Mono', color: '#eab308', size: 36, showFront: true, showBack: true },
        rider: { name: 'F. CASTALDI', number: '7', color: '#eab308', show: true }
      }
    },
    'retro-eroica-wool': {
      name: "Eroica Classic Heritage",
      tag: "Vintage Wool '70s",
      colors: {
        torso: '#c2410c',
        collar: '#1e1b4b',
        sleeveLeft: '#c2410c',
        sleeveRight: '#c2410c',
        cuffs: '#1e1b4b',
        sidePanels: '#c2410c',
        zipper: '#1e1b4b',
        pockets: '#c2410c',
        hem: '#1e1b4b'
      },
      pattern: { type: 'vintage-chest-band', secondaryColor: '#1e1b4b', tertiaryColor: '#ffffff', scale: 100 },
      text: {
        sponsor: { content: 'VELODROMO', font: 'Georgia', color: '#ffffff', size: 40, showFront: true, showBack: true },
        rider: { name: 'E. MERCKX', number: '51', color: '#ffffff', show: true }
      }
    },
    'crest-kom-dots': {
      name: "King of the Crest (KOM)",
      tag: "Re della Montagna",
      colors: {
        torso: '#ffffff',
        collar: '#ef4444',
        sleeveLeft: '#ffffff',
        sleeveRight: '#ffffff',
        cuffs: '#ef4444',
        sidePanels: '#ffffff',
        zipper: '#ef4444',
        pockets: '#ffffff',
        hem: '#ef4444'
      },
      pattern: { type: 'polka-dots', secondaryColor: '#ef4444', tertiaryColor: '#ef4444', scale: 85 },
      text: {
        sponsor: { content: 'CREST CLIMBER', font: 'Plus Jakarta Sans', color: '#ef4444', size: 34, showFront: true, showBack: true },
        rider: { name: 'F. CASTALDI', number: '100', color: '#ef4444', show: true }
      }
    },
    'cosmic-crit': {
      name: "Cosmic Neon Criterium",
      tag: "Night Race Cyber Glow",
      colors: {
        torso: '#06b6d4',
        collar: '#09090b',
        sleeveLeft: '#a855f7',
        sleeveRight: '#06b6d4',
        cuffs: '#ec4899',
        sidePanels: '#18181b',
        zipper: '#ffffff',
        pockets: '#a855f7',
        hem: '#09090b'
      },
      pattern: { type: 'gradient-fade', secondaryColor: '#ec4899', tertiaryColor: '#a855f7', scale: 100 },
      text: {
        sponsor: { content: 'CRIT SPEED', font: 'Impact', color: '#ffffff', size: 38, showFront: true, showBack: true },
        rider: { name: 'SPEED RIDER', number: '99', color: '#ffffff', show: true }
      }
    },
    'sunburst-monument': {
      name: "Sunburst Classic Monument",
      tag: "Giallo Tour & Grandi Classiche",
      colors: {
        torso: '#facc15',
        collar: '#1e3a8a',
        sleeveLeft: '#facc15',
        sleeveRight: '#facc15',
        cuffs: '#1e3a8a',
        sidePanels: '#eab308',
        zipper: '#1e3a8a',
        pockets: '#eab308',
        hem: '#1e3a8a'
      },
      pattern: { type: 'diagonal-racing', secondaryColor: '#1e3a8a', tertiaryColor: '#ffffff', scale: 100 },
      text: {
        sponsor: { content: 'MONUMENT TOUR', font: 'Plus Jakarta Sans', color: '#1e3a8a', size: 36, showFront: true, showBack: true },
        rider: { name: 'F. CASTALDI', number: '24', color: '#1e3a8a', show: true }
      }
    },
    'monochrome-apex': {
      name: "Monochrome Pro Apex",
      tag: "Minimalist Scandinavian Kit",
      colors: {
        torso: '#f8fafc',
        collar: '#0f172a',
        sleeveLeft: '#f8fafc',
        sleeveRight: '#f8fafc',
        cuffs: '#0f172a',
        sidePanels: '#e2e8f0',
        zipper: '#0f172a',
        pockets: '#f8fafc',
        hem: '#0f172a'
      },
      pattern: { type: 'twin-vertical-stripes', secondaryColor: '#0f172a', tertiaryColor: '#94a3b8', scale: 100 },
      text: {
        sponsor: { content: 'APEX RACING', font: 'Plus Jakarta Sans', color: '#0f172a', size: 36, showFront: true, showBack: true },
        rider: { name: 'F. CASTALDI', number: '12', color: '#0f172a', show: true }
      }
    }
  };

  class JerseyStateManager {
    constructor() {
      this.state = JSON.parse(JSON.stringify(defaultState));
      this.history = [];
      this.historyIndex = -1;
      this.maxHistory = 50;
      this.listeners = [];
      
      // Save initial state into history
      this.pushHistory();
    }

    getState() {
      return this.state;
    }

    subscribe(listener) {
      this.listeners.push(listener);
      return () => {
        this.listeners = this.listeners.filter(l => l !== listener);
      };
    }

    notify() {
      this.listeners.forEach(fn => fn(this.state));
    }

    pushHistory() {
      // If we made changes after an undo, prune redo history
      if (this.historyIndex < this.history.length - 1) {
        this.history = this.history.slice(0, this.historyIndex + 1);
      }

      const snapshot = JSON.stringify(this.state);
      // Avoid pushing duplicates
      if (this.history.length > 0 && this.history[this.history.length - 1] === snapshot) {
        return;
      }

      this.history.push(snapshot);
      if (this.history.length > this.maxHistory) {
        this.history.shift();
      } else {
        this.historyIndex++;
      }
    }

    canUndo() {
      return this.historyIndex > 0;
    }

    canRedo() {
      return this.historyIndex < this.history.length - 1;
    }

    undo() {
      if (!this.canUndo()) return false;
      this.historyIndex--;
      this.state = JSON.parse(this.history[this.historyIndex]);
      this.notify();
      return true;
    }

    redo() {
      if (!this.canRedo()) return false;
      this.historyIndex++;
      this.state = JSON.parse(this.history[this.historyIndex]);
      this.notify();
      return true;
    }

    // Direct State Mutators with Automatic History Tracking
    setZoneColor(zone, color, saveHistory = true) {
      if (this.state.colors[zone] !== undefined) {
        this.state.colors[zone] = color;
        
        // Handle sleeve sync
        if (this.state.syncSleeves) {
          if (zone === 'sleeveLeft') this.state.colors.sleeveRight = color;
          if (zone === 'sleeveRight') this.state.colors.sleeveLeft = color;
        }

        if (saveHistory) this.pushHistory();
        this.notify();
      }
    }

    toggleSleeveSync() {
      this.state.syncSleeves = !this.state.syncSleeves;
      if (this.state.syncSleeves) {
        this.state.colors.sleeveRight = this.state.colors.sleeveLeft;
      }
      this.pushHistory();
      this.notify();
    }

    setPattern(type, secondaryColor, tertiaryColor, scale) {
      if (type !== undefined) this.state.pattern.type = type;
      if (secondaryColor !== undefined) this.state.pattern.secondaryColor = secondaryColor;
      if (tertiaryColor !== undefined) this.state.pattern.tertiaryColor = tertiaryColor;
      if (scale !== undefined) this.state.pattern.scale = scale;
      this.pushHistory();
      this.notify();
    }

    setView(view) {
      this.state.view = view;
      this.notify();
    }

    setMode(mode) {
      this.state.mode = mode;
      this.notify();
    }

    setZoom(zoom) {
      this.state.zoom = Math.max(0.5, Math.min(2.5, zoom));
      this.notify();
    }

    // Logo / Photo management
    addLogo(logoObj) {
      const id = 'logo_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
      const newLogo = {
        id: id,
        name: logoObj.name || 'Logo',
        dataUrl: logoObj.dataUrl,
        type: logoObj.type || 'image', // 'image' | 'svg'
        view: logoObj.view || this.state.view, // 'front' | 'back'
        snapTarget: logoObj.snapTarget || 'chest-center',
        x: logoObj.x !== undefined ? logoObj.x : 250,
        y: logoObj.y !== undefined ? logoObj.y : 220,
        scale: logoObj.scale || 100,
        rotation: logoObj.rotation || 0,
        opacity: logoObj.opacity !== undefined ? logoObj.opacity : 100,
        blendMode: logoObj.blendMode || 'normal',
        flipH: false
      };
      this.state.logos.push(newLogo);
      this.state.selectedLogoId = id;
      this.pushHistory();
      this.notify();
      return id;
    }

    updateLogo(id, updates, saveHistory = true) {
      const idx = this.state.logos.findIndex(l => l.id === id);
      if (idx !== -1) {
        this.state.logos[idx] = { ...this.state.logos[idx], ...updates };
        if (saveHistory) this.pushHistory();
        this.notify();
      }
    }

    removeLogo(id) {
      this.state.logos = this.state.logos.filter(l => l.id !== id);
      if (this.state.selectedLogoId === id) {
        this.state.selectedLogoId = this.state.logos.length > 0 ? this.state.logos[0].id : null;
      }
      this.pushHistory();
      this.notify();
    }

    clearAllLogos() {
      this.state.logos = [];
      this.state.selectedLogoId = null;
      this.pushHistory();
      this.notify();
    }

    selectLogo(id) {
      this.state.selectedLogoId = id;
      this.notify();
    }

    // Text & Sponsor updates
    updateText(section, key, value, saveHistory = true) {
      if (this.state.text[section] && this.state.text[section][key] !== undefined) {
        this.state.text[section][key] = value;
        if (saveHistory) this.pushHistory();
        this.notify();
      }
    }

    // Apply Preset
    applyPreset(presetKey) {
      const preset = PRESETS[presetKey];
      if (!preset) return;

      this.state.colors = JSON.parse(JSON.stringify(preset.colors));
      this.state.pattern = JSON.parse(JSON.stringify(preset.pattern));
      if (preset.text) {
        this.state.text = JSON.parse(JSON.stringify(preset.text));
      }
      this.pushHistory();
      this.notify();
    }

    // Reset to defaults
    reset() {
      this.state = JSON.parse(JSON.stringify(defaultState));
      this.pushHistory();
      this.notify();
    }

    // Import / Export JSON Project
    exportProjectJSON() {
      return JSON.stringify({
        version: '1.0',
        generator: 'MiniJersey Studio',
        exportedAt: new Date().toISOString(),
        state: this.state
      }, null, 2);
    }

    importProjectJSON(jsonString) {
      try {
        const parsed = JSON.parse(jsonString);
        if (parsed.state) {
          this.state = parsed.state;
        } else {
          this.state = parsed;
        }
        this.pushHistory();
        this.notify();
        return true;
      } catch (err) {
        console.error("Invalid JSON project:", err);
        return false;
      }
    }
  }

  // Expose globally
  window.JerseyStateManager = JerseyStateManager;
  window.JERSEY_PRESETS = PRESETS;

})(window);
