/**
 * MINIJERSEY 3D STUDIO â€” MAIN APPLICATION CONTROLLER
 */

(function(window) {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize State Manager & 2D Vector Renderer
    const stateManager = new window.JerseyStateManager();
    const renderTarget2D = document.getElementById('jersey-render-target');
    const renderer2D = new window.JerseyRenderer(renderTarget2D, stateManager);

    // Initial 2D Render
    renderer2D.render();

    // 2. Initialize 3D Three.js Interactive Viewer
    const viewport3D = document.getElementById('webgl-3d-viewport');
    let threeViewer = null;
    if (window.THREE && window.ThreeJerseyViewer) {
      threeViewer = new window.ThreeJerseyViewer(viewport3D, stateManager, renderer2D);
    }

    // 3. Cache DOM Elements
    const elements = {
      // Top Toolbar
      btnUndo: document.getElementById('btn-undo'),
      btnRedo: document.getElementById('btn-redo'),
      btnAutoRotate: document.getElementById('btn-auto-rotate'),
      autoRotateText: document.getElementById('auto-rotate-text'),
      camAngleButtons: document.querySelectorAll('.cam-angle-btn'),
      btnToggleHanger: document.getElementById('btn-toggle-hanger'),
      btnSnapFront: document.getElementById('btn-snap-front'),
      btnSnapBack: document.getElementById('btn-snap-back'),
      
      btnImport: document.getElementById('btn-import-project'),
      btnSave: document.getElementById('btn-save-project'),
      btnOpenExport: document.getElementById('btn-open-export'),
      fileImportInput: document.getElementById('file-import-input'),

      // Tabs & Navigation
      tabButtons: document.querySelectorAll('.tab-btn'),
      tabPanels: document.querySelectorAll('.panel-tab'),

      // Presets & Reset
      presetCards: document.querySelectorAll('.preset-card'),
      btnResetJersey: document.getElementById('btn-reset-jersey'),

      // Zone Colors
      colorInputs: {
        torso: document.getElementById('color-zone-torso'),
        collar: document.getElementById('color-zone-collar'),
        sleeveLeft: document.getElementById('color-zone-sleeveLeft'),
        sleeveRight: document.getElementById('color-zone-sleeveRight'),
        cuffs: document.getElementById('color-zone-cuffs'),
        sidePanels: document.getElementById('color-zone-sidePanels'),
        zipper: document.getElementById('color-zone-zipper'),
        pockets: document.getElementById('color-zone-pockets'),
        hem: document.getElementById('color-zone-hem')
      },
      hexLabels: {
        torso: document.getElementById('hex-zone-torso'),
        collar: document.getElementById('hex-zone-collar'),
        sleeveLeft: document.getElementById('hex-zone-sleeveLeft'),
        sleeveRight: document.getElementById('hex-zone-sleeveRight'),
        cuffs: document.getElementById('hex-zone-cuffs'),
        sidePanels: document.getElementById('hex-zone-sidePanels'),
        zipper: document.getElementById('hex-zone-zipper'),
        pockets: document.getElementById('hex-zone-pockets'),
        hem: document.getElementById('hex-zone-hem')
      },
      btnSyncSleeves: document.getElementById('btn-sync-sleeves'),
      quickSwatches: document.querySelectorAll('.quick-swatch'),

      // Patterns
      patternCards: document.querySelectorAll('.pattern-card'),
      patternSecondaryColor: document.getElementById('pattern-color-secondary'),
      patternTertiaryColor: document.getElementById('pattern-color-tertiary'),
      hexPatternSecondary: document.getElementById('hex-pattern-secondary'),
      hexPatternTertiary: document.getElementById('hex-pattern-tertiary'),
      patternScaleSlider: document.getElementById('pattern-scale-slider'),
      patternScaleVal: document.getElementById('pattern-scale-val'),

      // Logos & Photos
      logoDropzone: document.getElementById('logo-dropzone'),
      logoFileInput: document.getElementById('logo-file-input'),
      stockBadgeButtons: document.querySelectorAll('.stock-badge-btn'),
      appliedLogosList: document.getElementById('applied-logos-list'),
      logosEmptyMsg: document.getElementById('logos-empty-msg'),
      logoCountText: document.getElementById('logo-count'),
      btnClearLogos: document.getElementById('btn-clear-logos'),

      // Selected Logo Controls
      selectedLogoControls: document.getElementById('selected-logo-controls'),
      selectedLogoTitle: document.getElementById('selected-logo-title'),
      snapButtons: document.querySelectorAll('.snap-btn'),
      logoScaleSlider: document.getElementById('logo-scale-slider'),
      logoScaleVal: document.getElementById('logo-scale-val'),
      logoRotateSlider: document.getElementById('logo-rotate-slider'),
      logoRotateVal: document.getElementById('logo-rotate-val'),
      logoOpacitySlider: document.getElementById('logo-opacity-slider'),
      logoOpacityVal: document.getElementById('logo-opacity-val'),
      logoBlendSelect: document.getElementById('logo-blend-select'),
      btnCenterLogo: document.getElementById('btn-center-logo'),
      btnFlipLogoH: document.getElementById('btn-flip-logo-h'),
      btnDeleteLogo: document.getElementById('btn-delete-logo'),

      // Text & Sponsor
      inputSponsorText: document.getElementById('input-sponsor-text'),
      selectSponsorFont: document.getElementById('select-sponsor-font'),
      colorSponsorText: document.getElementById('color-sponsor-text'),
      hexSponsorText: document.getElementById('hex-sponsor-text'),
      sliderSponsorSize: document.getElementById('slider-sponsor-size'),
      valSponsorSize: document.getElementById('val-sponsor-size'),
      checkSponsorEnabled: document.getElementById('check-sponsor-enabled'),
      checkSponsorBack: document.getElementById('check-sponsor-back'),

      inputRiderName: document.getElementById('input-rider-name'),
      inputRiderNumber: document.getElementById('input-rider-number'),
      colorRiderText: document.getElementById('color-rider-text'),
      hexRiderText: document.getElementById('hex-rider-text'),
      checkRiderEnabled: document.getElementById('check-rider-enabled'),

      // Export Modal
      exportModal: document.getElementById('export-modal'),
      btnCloseModal: document.getElementById('btn-close-modal'),
      btnDownload3DShot: document.getElementById('btn-download-3d-shot'),
      btnDownloadTechPack: document.getElementById('btn-download-techpack-png'),
      btnPrintTechPack: document.getElementById('btn-print-techpack'),
      btnDownloadMockupFront: document.getElementById('btn-download-mockup-front'),
      btnDownloadMockupBack: document.getElementById('btn-download-mockup-back'),
      btnDownloadSVG: document.getElementById('btn-download-svg'),
      btnDownloadPapercraft: document.getElementById('btn-download-papercraft'),

      // Toast
      toast: document.getElementById('toast'),
      toastMessage: document.getElementById('toast-message')
    };

    // -------------------------------------------------------------
    // 4. UI SYNC & 3D REAL-TIME TEXTURE RE-BAKING
    // -------------------------------------------------------------
    let bakeTimeout = null;
    function syncUIFromState(state) {
      // Undo / Redo Buttons
      elements.btnUndo.disabled = !stateManager.canUndo();
      elements.btnRedo.disabled = !stateManager.canRedo();

      // Colors
      Object.keys(elements.colorInputs).forEach(zone => {
        if (state.colors[zone] && elements.colorInputs[zone]) {
          elements.colorInputs[zone].value = state.colors[zone];
          if (elements.hexLabels[zone]) elements.hexLabels[zone].textContent = state.colors[zone];
        }
      });

      // Patterns
      elements.patternCards.forEach(card => {
        const pType = card.getAttribute('data-pattern');
        card.classList.toggle('active', pType === state.pattern.type);
      });
      if (elements.patternSecondaryColor) {
        elements.patternSecondaryColor.value = state.pattern.secondaryColor;
        elements.hexPatternSecondary.textContent = state.pattern.secondaryColor;
      }
      if (elements.patternTertiaryColor) {
        elements.patternTertiaryColor.value = state.pattern.tertiaryColor;
        elements.hexPatternTertiary.textContent = state.pattern.tertiaryColor;
      }
      if (elements.patternScaleSlider) {
        elements.patternScaleSlider.value = state.pattern.scale;
        elements.patternScaleVal.textContent = state.pattern.scale + '%';
      }

      // Sponsor Text
      if (elements.inputSponsorText) elements.inputSponsorText.value = state.text.sponsor.content;
      if (elements.selectSponsorFont) elements.selectSponsorFont.value = state.text.sponsor.font;
      if (elements.colorSponsorText) {
        elements.colorSponsorText.value = state.text.sponsor.color;
        elements.hexSponsorText.textContent = state.text.sponsor.color;
      }
      if (elements.sliderSponsorSize) {
        elements.sliderSponsorSize.value = state.text.sponsor.size;
        elements.valSponsorSize.textContent = state.text.sponsor.size + 'px';
      }
      if (elements.checkSponsorEnabled) elements.checkSponsorEnabled.checked = state.text.sponsor.showFront;
      if (elements.checkSponsorBack) elements.checkSponsorBack.checked = state.text.sponsor.showBack;

      // Rider Text
      if (elements.inputRiderName) elements.inputRiderName.value = state.text.rider.name;
      if (elements.inputRiderNumber) elements.inputRiderNumber.value = state.text.rider.number;
      if (elements.colorRiderText) {
        elements.colorRiderText.value = state.text.rider.color;
        elements.hexRiderText.textContent = state.text.rider.color;
      }
      if (elements.checkRiderEnabled) elements.checkRiderEnabled.checked = state.text.rider.show;

      // Logos & Photo List UI
      syncLogosUI(state);

      // Trigger 3D WebGL Texture Bake
      if (threeViewer) {
        clearTimeout(bakeTimeout);
        bakeTimeout = setTimeout(() => {
          threeViewer.updateTextureMap();
        }, 16);
      }
    }

    function syncLogosUI(state) {
      elements.logoCountText.textContent = state.logos.length;
      elements.logosEmptyMsg.style.display = state.logos.length === 0 ? 'block' : 'none';

      const currentListHTML = state.logos.map(logo => {
        const isSelected = logo.id === state.selectedLogoId;
        const iconSvg = logo.type === 'svg'
          ? `<div class="logo-thumb" style="display:flex;align-items:center;justify-content:center;color:#fff;">â˜…</div>`
          : `<img src="${logo.dataUrl}" class="logo-thumb" alt="${logo.name}">`;

        return `
          <div class="applied-logo-card ${isSelected ? 'selected' : ''}" data-logo-id="${logo.id}">
            <div class="logo-card-info">
              ${iconSvg}
              <div style="display:flex;flex-direction:column;">
                <span class="logo-name">${logo.name}</span>
                <span style="font-size:10px;color:var(--text-muted);font-family:var(--font-mono)">${logo.view.toUpperCase()} â€¢ ${logo.snapTarget || 'Custom'}</span>
              </div>
            </div>
            <button class="btn-remove-single-logo" data-remove-id="${logo.id}" style="background:none;border:none;color:#ef4444;cursor:pointer;font-size:16px;" title="Rimuovi">&times;</button>
          </div>
        `;
      }).join('');

      elements.appliedLogosList.innerHTML = (state.logos.length === 0) 
? `<div class="empty-state-small" id="logos-empty-msg"><span>No logos or images applied. Upload a photo to get started!</span></div>`
        : currentListHTML;

      // Click on items in applied logos list
      elements.appliedLogosList.querySelectorAll('.applied-logo-card').forEach(card => {
        card.addEventListener('click', (e) => {
          if (e.target.classList.contains('btn-remove-single-logo')) return;
          const id = card.getAttribute('data-logo-id');
          stateManager.selectLogo(id);
        });
      });

      elements.appliedLogosList.querySelectorAll('.btn-remove-single-logo').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const id = btn.getAttribute('data-remove-id');
          stateManager.removeLogo(id);
          showToast("Element removed");
        });
      });

      // Update Selected Logo Editor
      const selected = state.logos.find(l => l.id === state.selectedLogoId);
      if (selected) {
        elements.selectedLogoControls.style.display = 'block';
        elements.selectedLogoTitle.textContent = selected.name;
        elements.logoScaleSlider.value = selected.scale;
        elements.logoScaleVal.textContent = selected.scale + '%';
        elements.logoRotateSlider.value = selected.rotation;
        elements.logoRotateVal.textContent = selected.rotation + '°';
        elements.logoOpacitySlider.value = selected.opacity;
        elements.logoOpacityVal.textContent = selected.opacity + '%';
        elements.logoBlendSelect.value = selected.blendMode;
      } else {
        elements.selectedLogoControls.style.display = 'none';
      }
    }

    stateManager.subscribe(syncUIFromState);
    syncUIFromState(stateManager.getState());

    // -------------------------------------------------------------
    // 5. EVENT LISTENERS: 3D VIEWPORT & CAMERA CONTROLS
    // -------------------------------------------------------------
    if (threeViewer) {
      // Camera Angles Buttons
      elements.camAngleButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          elements.camAngleButtons.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const angle = btn.getAttribute('data-angle');
          threeViewer.snapCameraAngle(angle);
        });
      });

      // Auto-Rotate Showroom Toggle
      elements.btnAutoRotate.addEventListener('click', () => {
        const isRotating = threeViewer.toggleAutoRotate();
        elements.btnAutoRotate.classList.toggle('active', isRotating);
        elements.autoRotateText.textContent = isRotating ? 'Pause 360°' : '360° Auto-Rotate';
        showToast(isRotating ? "360° auto-rotation active" : "Auto-rotation paused");
      });

      // Hanger Toggle
      let showHanger = true;
      elements.btnToggleHanger.addEventListener('click', () => {
        showHanger = !showHanger;
        threeViewer.toggleHanger(showHanger);
        showToast(showHanger ? "Mini hanger visible" : "Mini hanger hidden");
      });

      // Snap Front / Back floating buttons
      elements.btnSnapFront.addEventListener('click', () => {
        threeViewer.snapCameraAngle('front');
        elements.camAngleButtons.forEach(b => b.classList.toggle('active', b.getAttribute('data-angle') === 'front'));
      });

      elements.btnSnapBack.addEventListener('click', () => {
        threeViewer.snapCameraAngle('back');
        elements.camAngleButtons.forEach(b => b.classList.toggle('active', b.getAttribute('data-angle') === 'back'));
      });
    }

    // -------------------------------------------------------------
    // 6. EVENT LISTENERS: TABS & NAVIGATION
    // -------------------------------------------------------------
    elements.tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.getAttribute('data-tab');
        elements.tabButtons.forEach(b => b.classList.remove('active'));
        elements.tabPanels.forEach(p => p.classList.remove('active'));

        btn.classList.add('active');
        const activePanel = document.getElementById(targetTab);
        if (activePanel) activePanel.classList.add('active');
      });
    });

    // -------------------------------------------------------------
    // 7. EVENT LISTENERS: TOOLBAR & HISTORY (Undo/Redo)
    // -------------------------------------------------------------
    elements.btnUndo.addEventListener('click', () => {
      if (stateManager.undo()) showToast("Change undone (Undo)");
    });

    elements.btnRedo.addEventListener('click', () => {
      if (stateManager.redo()) showToast("Change restored (Redo)");
    });

    // -------------------------------------------------------------
    // 8. EVENT LISTENERS: ZONE COLORS & PRESETS
    // -------------------------------------------------------------
    Object.keys(elements.colorInputs).forEach(zone => {
      const input = elements.colorInputs[zone];
      if (input) {
        input.addEventListener('input', (e) => {
          stateManager.setZoneColor(zone, e.target.value, false);
        });
        input.addEventListener('change', (e) => {
          stateManager.setZoneColor(zone, e.target.value, true);
        });
      }
    });

    if (elements.btnSyncSleeves) {
      elements.btnSyncSleeves.addEventListener('click', () => {
        stateManager.toggleSleeveSync();
        showToast(stateManager.getState().syncSleeves ? "Sleeves synced" : "Sleeves independent");
      });
    }

    elements.quickSwatches.forEach(swatch => {
      swatch.addEventListener('click', () => {
        const color = swatch.getAttribute('data-color');
        stateManager.setZoneColor('torso', color, true);
        showToast(`Color ${color} applied`);
      });
    });

    // Presets
    elements.presetCards.forEach(card => {
      card.addEventListener('click', () => {
        const presetKey = card.getAttribute('data-preset');
        stateManager.applyPreset(presetKey);
        showToast(`3D livery applied: ${card.querySelector('.preset-name').textContent}`);
      });
    });

    if (elements.btnResetJersey) {
      elements.btnResetJersey.addEventListener('click', () => {
        if (confirm("Do you really want to reset the jersey to base values?")) {
          stateManager.reset();
          showToast("Jersey reset");
        }
      });
    }

    // -------------------------------------------------------------
    // 9. EVENT LISTENERS: PATTERNS & ARTWORK
    // -------------------------------------------------------------
    elements.patternCards.forEach(card => {
      card.addEventListener('click', () => {
        const pType = card.getAttribute('data-pattern');
        stateManager.setPattern(pType);
        showToast(`3D Pattern: ${card.querySelector('span').textContent}`);
      });
    });

    if (elements.patternSecondaryColor) {
      elements.patternSecondaryColor.addEventListener('input', (e) => {
        stateManager.setPattern(undefined, e.target.value, undefined, undefined);
      });
    }

    if (elements.patternTertiaryColor) {
      elements.patternTertiaryColor.addEventListener('input', (e) => {
        stateManager.setPattern(undefined, undefined, e.target.value, undefined);
      });
    }

    if (elements.patternScaleSlider) {
      elements.patternScaleSlider.addEventListener('input', (e) => {
        stateManager.setPattern(undefined, undefined, undefined, parseInt(e.target.value, 10));
      });
    }

    // -------------------------------------------------------------
    // 10. EVENT LISTENERS: INTELLIGENT LOGO / PHOTO UPLOADER & SNAPPING
    // -------------------------------------------------------------
    elements.logoDropzone.addEventListener('click', () => elements.logoFileInput.click());

    ['dragenter', 'dragover'].forEach(name => {
      elements.logoDropzone.addEventListener(name, (e) => {
        e.preventDefault(); e.stopPropagation();
        elements.logoDropzone.classList.add('dragover');
      });
    });
    ['dragleave', 'drop'].forEach(name => {
      elements.logoDropzone.addEventListener(name, (e) => {
        e.preventDefault(); e.stopPropagation();
        elements.logoDropzone.classList.remove('dragover');
      });
    });

    elements.logoDropzone.addEventListener('drop', (e) => {
      if (e.dataTransfer && e.dataTransfer.files.length > 0) {
        handleImageUpload(e.dataTransfer.files[0]);
      }
    });

    elements.logoFileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files.length > 0) {
        handleImageUpload(e.target.files[0]);
        e.target.value = '';
      }
    });

    function handleImageUpload(file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target.result;
        const defaultSnap = 'chest-center';
        const snapCoords = window.JERSEY_GEOMETRY.snapTargets[defaultSnap];

        stateManager.addLogo({
          name: file.name.substring(0, 18),
          dataUrl: dataUrl,
          type: 'image',
          view: 'front',
          snapTarget: defaultSnap,
          x: snapCoords ? snapCoords.x : 250,
          y: snapCoords ? snapCoords.y : 230,
          scale: snapCoords ? snapCoords.defaultScale : 90,
          rotation: 0,
          opacity: 100,
          blendMode: 'normal'
        });

        // Rotate to front view if not already
        if (threeViewer) threeViewer.snapCameraAngle('front');
        showToast(`Image "${file.name}" applied to 3D jersey!`);
      };
      reader.readAsDataURL(file);
    }

    // Stock Badges
    elements.stockBadgeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const badgeKey = btn.getAttribute('data-stock');
        const badgeSVG = window.STOCK_BADGES[badgeKey];
        if (!badgeSVG) return;

        const snapKey = 'chest-left';
        const snapCoords = window.JERSEY_GEOMETRY.snapTargets[snapKey];

        stateManager.addLogo({
          name: btn.querySelector('span').textContent,
          svgContent: badgeSVG,
          type: 'svg',
          view: 'front',
          snapTarget: snapKey,
          x: snapCoords ? snapCoords.x : 250,
          y: snapCoords ? snapCoords.y : 200,
          scale: snapCoords ? snapCoords.defaultScale : 65,
          rotation: 0,
          opacity: 100,
          blendMode: 'normal'
        });

        if (threeViewer) threeViewer.snapCameraAngle('front');
        showToast(`Symbol added`);
      });
    });

    // Smart Snapping Buttons
    elements.snapButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const snapKey = btn.getAttribute('data-snap');
        const snapCoords = window.JERSEY_GEOMETRY.snapTargets[snapKey];
        const selectedId = stateManager.getState().selectedLogoId;

        if (snapCoords && selectedId) {
          stateManager.updateLogo(selectedId, {
            view: snapCoords.view,
            snapTarget: snapKey,
            x: snapCoords.x,
            y: snapCoords.y,
            scale: snapCoords.defaultScale,
            rotation: 0
          });

          // Rotate 3D camera to front or back depending on snap
          if (threeViewer) {
            threeViewer.snapCameraAngle(snapCoords.view);
          }

          showToast(`Positioned in 3D: ${snapCoords.label}`);
        }
      });
    });

    // Logo Sliders
    if (elements.logoScaleSlider) {
      elements.logoScaleSlider.addEventListener('input', (e) => {
        const id = stateManager.getState().selectedLogoId;
        if (id) stateManager.updateLogo(id, { scale: parseInt(e.target.value, 10) }, false);
      });
      elements.logoScaleSlider.addEventListener('change', (e) => {
        const id = stateManager.getState().selectedLogoId;
        if (id) stateManager.updateLogo(id, { scale: parseInt(e.target.value, 10) }, true);
      });
    }

    if (elements.logoRotateSlider) {
      elements.logoRotateSlider.addEventListener('input', (e) => {
        const id = stateManager.getState().selectedLogoId;
        if (id) stateManager.updateLogo(id, { rotation: parseInt(e.target.value, 10) }, false);
      });
      elements.logoRotateSlider.addEventListener('change', (e) => {
        const id = stateManager.getState().selectedLogoId;
        if (id) stateManager.updateLogo(id, { rotation: parseInt(e.target.value, 10) }, true);
      });
    }

    if (elements.logoOpacitySlider) {
      elements.logoOpacitySlider.addEventListener('input', (e) => {
        const id = stateManager.getState().selectedLogoId;
        if (id) stateManager.updateLogo(id, { opacity: parseInt(e.target.value, 10) }, false);
      });
      elements.logoOpacitySlider.addEventListener('change', (e) => {
        const id = stateManager.getState().selectedLogoId;
        if (id) stateManager.updateLogo(id, { opacity: parseInt(e.target.value, 10) }, true);
      });
    }

    if (elements.logoBlendSelect) {
      elements.logoBlendSelect.addEventListener('change', (e) => {
        const id = stateManager.getState().selectedLogoId;
        if (id) stateManager.updateLogo(id, { blendMode: e.target.value }, true);
      });
    }

    if (elements.btnCenterLogo) {
      elements.btnCenterLogo.addEventListener('click', () => {
        const id = stateManager.getState().selectedLogoId;
        if (id) stateManager.updateLogo(id, { x: 250, rotation: 0 }, true);
      });
    }

    if (elements.btnFlipLogoH) {
      elements.btnFlipLogoH.addEventListener('click', () => {
        const id = stateManager.getState().selectedLogoId;
        const current = stateManager.getState().logos.find(l => l.id === id);
        if (current) stateManager.updateLogo(id, { rotation: (current.rotation + 180) % 360 }, true);
      });
    }

    if (elements.btnDeleteLogo) {
      elements.btnDeleteLogo.addEventListener('click', () => {
        const id = stateManager.getState().selectedLogoId;
        if (id) {
          stateManager.removeLogo(id);
          showToast("Logo deleted");
        }
      });
    }

    if (elements.btnClearLogos) {
      elements.btnClearLogos.addEventListener('click', () => {
        if (confirm("Remove all applied photos and logos?")) {
          stateManager.clearAllLogos();
          showToast("All logos have been removed");
        }
      });
    }

    // -------------------------------------------------------------
    // 11. EVENT LISTENERS: SPONSOR & RIDER TEXT
    // -------------------------------------------------------------
    if (elements.inputSponsorText) {
      elements.inputSponsorText.addEventListener('input', (e) => {
        stateManager.updateText('sponsor', 'content', e.target.value, false);
      });
    }
    if (elements.selectSponsorFont) {
      elements.selectSponsorFont.addEventListener('change', (e) => {
        stateManager.updateText('sponsor', 'font', e.target.value, true);
      });
    }
    if (elements.colorSponsorText) {
      elements.colorSponsorText.addEventListener('input', (e) => {
        stateManager.updateText('sponsor', 'color', e.target.value, true);
      });
    }
    if (elements.sliderSponsorSize) {
      elements.sliderSponsorSize.addEventListener('input', (e) => {
        stateManager.updateText('sponsor', 'size', parseInt(e.target.value, 10), false);
      });
    }
    if (elements.checkSponsorEnabled) {
      elements.checkSponsorEnabled.addEventListener('change', (e) => {
        stateManager.updateText('sponsor', 'showFront', e.target.checked, true);
      });
    }
    if (elements.checkSponsorBack) {
      elements.checkSponsorBack.addEventListener('change', (e) => {
        stateManager.updateText('sponsor', 'showBack', e.target.checked, true);
      });
    }

    if (elements.inputRiderName) {
      elements.inputRiderName.addEventListener('input', (e) => {
        stateManager.updateText('rider', 'name', e.target.value, false);
      });
    }
    if (elements.inputRiderNumber) {
      elements.inputRiderNumber.addEventListener('input', (e) => {
        stateManager.updateText('rider', 'number', e.target.value, false);
      });
    }
    if (elements.colorRiderText) {
      elements.colorRiderText.addEventListener('input', (e) => {
        stateManager.updateText('rider', 'color', e.target.value, true);
      });
    }
    if (elements.checkRiderEnabled) {
      elements.checkRiderEnabled.addEventListener('change', (e) => {
        stateManager.updateText('rider', 'show', e.target.checked, true);
      });
    }

    // -------------------------------------------------------------
    // 12. PROJECT SAVE & IMPORT (.jersey JSON)
    // -------------------------------------------------------------
    elements.btnSave.addEventListener('click', () => {
      const json = stateManager.exportProjectJSON();
      downloadFile(json, 'cycling_jersey_project.jersey', 'application/json');
      showToast("Project saved successfully (.jersey)");
    });

    elements.btnImport.addEventListener('click', () => elements.fileImportInput.click());

    elements.fileImportInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files.length > 0) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (ev) => {
          const success = stateManager.importProjectJSON(ev.target.result);
          if (success) {
            showToast("3D project loaded successfully!");
          } else {
            alert("Error loading project file.");
          }
        };
        reader.readAsText(file);
        e.target.value = '';
      }
    });

    // -------------------------------------------------------------
    // 3D MODEL SWITCHER & CUSTOM MODEL UPLOAD (.GLB / .GLTF)
    // -------------------------------------------------------------
    const modelSwitchButtons = document.querySelectorAll('.model-switch-btn');
    modelSwitchButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        modelSwitchButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const modelType = btn.getAttribute('data-model');
        if (threeViewer) {
          threeViewer.loadModelByType(modelType);
          showToast(modelType === 'pro-jersey' ? "Loaded Pro Aero Cycling Jersey!" : "Loaded Classic T-Shirt!");
        }
      });
    });

    const modelUploadInput = document.getElementById('model-upload');
    if (modelUploadInput) {
      modelUploadInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files.length > 0) {
          const file = e.target.files[0];
          const url = URL.createObjectURL(file);
          if (threeViewer) {
            modelSwitchButtons.forEach(b => b.classList.remove('active'));
            threeViewer.loadModelFromURL(url);
            showToast(`Custom model "${file.name}" loaded!`);
          }
          e.target.value = '';
        }
      });
    }

    // -------------------------------------------------------------
    // 13. EXPORT MODAL & PRODUCTION DOWNLOADS
    // -------------------------------------------------------------
    elements.btnOpenExport.addEventListener('click', () => {
      elements.exportModal.style.display = 'flex';
    });

    elements.btnCloseModal.addEventListener('click', () => {
      elements.exportModal.style.display = 'none';
    });

    elements.exportModal.addEventListener('click', (e) => {
      if (e.target === elements.exportModal) elements.exportModal.style.display = 'none';
    });

    // Option 3D Shot: Capture Current 3D Viewport in 4K PNG
    if (elements.btnDownload3DShot && threeViewer) {
      elements.btnDownload3DShot.addEventListener('click', async () => {
        showToast("Capturing 3D render...");
        const dataUrl = await threeViewer.capture3DSnapshot(2400, 2400);
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = 'Render_Jersey_3D_Studio.png';
        a.click();
        showToast("3D image downloaded in high resolution!");
      });
    }

    // Option 1: Download Factory Tech Pack PNG (300 DPI)
    elements.btnDownloadTechPack.addEventListener('click', async () => {
      showToast("Generating Production Tech Pack...");
      const techCanvas = await window.TECH_PACK_GENERATOR.generateTechPackCanvas(renderer2D, stateManager);
      techCanvas.toBlob(blob => {
        downloadBlob(blob, 'Tech_Pack_Production_Jersey.png');
        showToast("Tech Pack downloaded!");
      });
    });

    // Option 1B: Print Tech Pack / PDF
    elements.btnPrintTechPack.addEventListener('click', async () => {
      showToast("Preparing print document...");
      const techCanvas = await window.TECH_PACK_GENERATOR.generateTechPackCanvas(renderer2D, stateManager);
      const dataUrl = techCanvas.toDataURL('image/png');
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head><title>Scheda Tecnica di Produzione â€” MiniJersey 3D Studio</title></head>
            <body style="margin:0;display:flex;justify-content:center;align-items:center;background:#fff;">
              <img src="${dataUrl}" style="max-width:100%;height:auto;" onload="window.print();">
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    });

    // Option 2: Mockups (Front, Back, SVG)
    elements.btnDownloadMockupFront.addEventListener('click', async () => {
      const canvas = await renderer2D.renderToCanvas('front', 'mini', 2000, 2400);
      canvas.toBlob(blob => downloadBlob(blob, 'Mockup_Jersey_Front.png'));
      showToast("Front mockup downloaded!");
    });

    elements.btnDownloadMockupBack.addEventListener('click', async () => {
      const canvas = await renderer2D.renderToCanvas('back', 'mini', 2000, 2400);
      canvas.toBlob(blob => downloadBlob(blob, 'Mockup_Jersey_Back.png'));
      showToast("Back mockup downloaded!");
    });

    elements.btnDownloadSVG.addEventListener('click', () => {
      const svgMarkup = renderer2D.generateSVG(stateManager.getState());
      downloadFile(svgMarkup, 'Jersey_Vector.svg', 'image/svg+xml');
      showToast("Vector SVG file downloaded!");
    });

    // Option 3: 3D Papercraft A4 Template
    elements.btnDownloadPapercraft.addEventListener('click', async () => {
      showToast("Generating 3D Papercraft A4 Template...");
      const paperCanvas = await window.TECH_PACK_GENERATOR.generatePapercraftCanvas(renderer2D, stateManager);
      paperCanvas.toBlob(blob => {
        downloadBlob(blob, 'Template_MiniJersey_3D_Papercraft_A4.png');
        showToast("3D template ready for printing!");
      });
    });

    // -------------------------------------------------------------
    // 14. KEYBOARD SHORTCUTS (Ctrl+Z, Ctrl+Y, Space)
    // -------------------------------------------------------------
    window.addEventListener('keydown', (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          stateManager.redo();
        } else {
          stateManager.undo();
        }
        e.preventDefault();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        stateManager.redo();
        e.preventDefault();
      } else if (e.code === 'Space') {
        if (threeViewer) {
          const currentAngle = elements.camAngleButtons[0].classList.contains('active') ? 'back' : 'front';
          threeViewer.snapCameraAngle(currentAngle);
          elements.camAngleButtons.forEach(b => b.classList.toggle('active', b.getAttribute('data-angle') === currentAngle));
        }
        e.preventDefault();
      }
    });

    // Helper functions for downloads and toast
    function downloadBlob(blob, filename) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }

    function downloadFile(content, filename, mimeType) {
      const blob = new Blob([content], { type: mimeType });
      downloadBlob(blob, filename);
    }

    function showToast(msg) {
      elements.toastMessage.textContent = msg;
      elements.toast.classList.add('show');
      setTimeout(() => elements.toast.classList.remove('show'), 2400);
    }

    console.log("MiniJersey 3D Studio pronto con motore WebGL a 360°!");
  });

})(window);







