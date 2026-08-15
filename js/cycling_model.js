/**
 * MINIJERSEY 3D STUDIO — PRO CYCLING JERSEY 3D GEOMETRY ENGINE
 * 
 * Generates an ultra-high-fidelity, aerodynamic race-fit cycling jersey in Three.js.
 * Features:
 * - Anatomical race-cut torso with athletic chest and tapered waist
 * - Drop-tail rear hem (extended back coverage)
 * - Pro mid-arm raglan sleeves with elastic cuffs
 * - Aero mandarin zip collar with neck relief
 * - 3D Physical Triple Rear Cargo Pockets with elastic top band
 * - Physical front zipper track and metallic slider pull tab
 * - Dual-Hemisphere Planar UV coordinates pre-mapped to 2048x1024 SVG Canvas
 */

(function (window) {
  'use strict';

  class CyclingJersey3DBuilder {
    constructor() {
      this.group = new THREE.Group();
    }

    /**
     * Builds the complete 3D Pro Cycling Jersey mesh hierarchy.
     * @param {THREE.Texture} textureMap - The dynamic 2048x1024 SVG canvas texture.
     * @returns {THREE.Group}
     */
    build(textureMap) {
      const jerseyGroup = new THREE.Group();
      jerseyGroup.name = 'ProCyclingJersey_RaceFit';

      const fabricMaterial = new THREE.MeshStandardMaterial({
        map: textureMap,
        roughness: 0.78,
        metalness: 0.04,
        side: THREE.DoubleSide,
        shadowSide: THREE.DoubleSide
      });

      const zipperMaterial = new THREE.MeshStandardMaterial({
        color: 0xcccccc,
        metalness: 0.85,
        roughness: 0.25
      });

      const cuffMaterial = new THREE.MeshStandardMaterial({
        map: textureMap,
        roughness: 0.65,
        metalness: 0.08,
        side: THREE.DoubleSide
      });

      // 1. Build Main Aerodynamic Torso Geometry
      const torsoMesh = this.buildRaceFitTorso(fabricMaterial);
      jerseyGroup.add(torsoMesh);

      // 2. Build Pro Raglan Sleeves
      const leftSleeve = this.buildRaglanSleeve(-1, fabricMaterial, cuffMaterial);
      const rightSleeve = this.buildRaglanSleeve(1, fabricMaterial, cuffMaterial);
      jerseyGroup.add(leftSleeve);
      jerseyGroup.add(rightSleeve);

      // 3. Build Aero Mandarin Collar
      const collarMesh = this.buildAeroCollar(fabricMaterial);
      jerseyGroup.add(collarMesh);

      // 4. Build 3D Triple Rear Cargo Pockets (Physical Depth & Seams)
      const pocketsGroup = this.buildTripleRearPockets(fabricMaterial);
      jerseyGroup.add(pocketsGroup);

      // 5. Build Front Zipper Track & Metallic Pull Tab
      const zipperGroup = this.buildFrontZipper(zipperMaterial);
      jerseyGroup.add(zipperGroup);

      // 6. Build Silicone Waist Gripper Hem
      const hemMesh = this.buildWaistHem(cuffMaterial);
      jerseyGroup.add(hemMesh);

      // Normalize and calibrate bounding box
      const box = new THREE.Box3().setFromObject(jerseyGroup);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 2.8 / maxDim;

      jerseyGroup.scale.setScalar(scale);
      jerseyGroup.position.sub(center.multiplyScalar(scale));

      return jerseyGroup;
    }

    /**
     * 1. AERODYNAMIC RACE-FIT TORSO
     * Parametrically lofts an athletic silhouette from neck to dropped rear hem.
     */
    buildRaceFitTorso(material) {
      const vRings = 28;
      const hSegments = 40;
      const positions = [];
      const uvs = [];
      const indices = [];

      // Loft rings from top of chest (Y=0.98) down to hem (Y=-1.12)
      for (let r = 0; r <= vRings; r++) {
        const t = r / vRings; // 0 (top) to 1 (bottom)
        const y = 0.98 - t * 2.10;

        // Radii profile for cycling athletic shape
        let rx, rz, zOffset = 0;

        if (t < 0.25) {
          // Upper chest & shoulders
          const p = t / 0.25;
          rx = THREE.MathUtils.lerp(0.52, 0.74, Math.sin(p * Math.PI * 0.5));
          rz = THREE.MathUtils.lerp(0.36, 0.46, Math.sin(p * Math.PI * 0.5));
          zOffset = 0.04 * (1 - p); // slight forward neck lean
        } else if (t < 0.65) {
          // Mid chest down to tapered aero waist
          const p = (t - 0.25) / 0.40;
          rx = THREE.MathUtils.lerp(0.74, 0.56, Math.sin(p * Math.PI * 0.5));
          rz = THREE.MathUtils.lerp(0.46, 0.38, Math.sin(p * Math.PI * 0.5));
          zOffset = 0.02 * (1 - p);
        } else {
          // Waist to hips with drop-tail rear elongation
          const p = (t - 0.65) / 0.35;
          rx = THREE.MathUtils.lerp(0.56, 0.62, Math.sin(p * Math.PI * 0.5));
          rz = THREE.MathUtils.lerp(0.38, 0.41, Math.sin(p * Math.PI * 0.5));
        }

        // Apply Drop-Tail curve: Back vertices dip lower at the bottom
        for (let s = 0; s <= hSegments; s++) {
          const theta = (s / hSegments) * Math.PI * 2;
          const sinT = Math.sin(theta);
          const cosT = Math.cos(theta);

          // x and z with athletic cross-section (elliptical with subtle chest convexity)
          let px = cosT * rx;
          let pz = sinT * rz + zOffset;

          // Chest muscle bulge on front (sinT > 0)
          if (sinT > 0 && t > 0.15 && t < 0.50) {
            pz += Math.sin(sinT * Math.PI) * 0.035 * Math.sin((t - 0.15) / 0.35 * Math.PI);
          }

          // Drop-tail Y adjustment for rear hem (sinT < 0 at bottom)
          let py = y;
          if (t > 0.70 && sinT < 0) {
            const dropAmount = Math.pow((t - 0.70) / 0.30, 2) * 0.14 * Math.abs(sinT);
            py -= dropAmount;
          }

          positions.push(px, py, pz);

          // Planar UV Mapping aligned with SVG canvas:
          // Front (sinT >= 0): U in [0.0, 0.5]
          // Back (sinT < 0):   U in [0.5, 1.0] (horizontally mirrored)
          const normX = (px + 1.2) / 2.4;
          const normY = (py + 1.3) / 2.6;
          let u, v;

          v = THREE.MathUtils.clamp(normY, 0, 1);
          if (pz >= 0) {
            u = THREE.MathUtils.clamp(normX * 0.5, 0, 0.5);
          } else {
            u = THREE.MathUtils.clamp(0.5 + (1 - normX) * 0.5, 0.5, 1.0);
          }

          uvs.push(u, v);
        }
      }

      // Generate Indices
      for (let r = 0; r < vRings; r++) {
        for (let s = 0; s < hSegments; s++) {
          const i1 = r * (hSegments + 1) + s;
          const i2 = i1 + 1;
          const i3 = (r + 1) * (hSegments + 1) + s;
          const i4 = i3 + 1;

          indices.push(i1, i3, i2);
          indices.push(i2, i3, i4);
        }
      }

      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
      geo.setIndex(indices);
      geo.computeVertexNormals();

      const mesh = new THREE.Mesh(geo, material);
      mesh.name = 'TorsoMesh';
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      return mesh;
    }

    /**
     * 2. PRO RAGLAN SLEEVES
     * Extended aero length down to mid-bicep with natural cycling forward rotation.
     * @param {number} side - (-1 for left sleeve, 1 for right sleeve)
     */
    buildRaglanSleeve(side, sleeveMaterial, cuffMaterial) {
      const sleeveGroup = new THREE.Group();
      sleeveGroup.name = side === -1 ? 'Sleeve_Left' : 'Sleeve_Right';

      const length = 0.92;
      const radialSegments = 24;
      const heightSegments = 16;
      const positions = [];
      const uvs = [];
      const indices = [];

      // Loft sleeve from shoulder socket down to arm cuff
      for (let r = 0; r <= heightSegments; r++) {
        const t = r / heightSegments;
        const radius = THREE.MathUtils.lerp(0.29, 0.20, t);
        const y = -t * length;

        for (let s = 0; s <= radialSegments; s++) {
          const theta = (s / radialSegments) * Math.PI * 2;
          const px = Math.cos(theta) * radius;
          const pz = Math.sin(theta) * radius * 0.92;
          const py = y;

          positions.push(px, py, pz);

          // Approximate UV coordinate mapped to SVG sleeve zones
          let uNorm = (px + 0.3) / 0.6;
          let vNorm = (py + length) / length;
          let u = side === -1 ? uNorm * 0.35 : 0.65 + uNorm * 0.35;
          let v = THREE.MathUtils.clamp(0.4 + vNorm * 0.5, 0, 1);

          uvs.push(u, v);
        }
      }

      for (let r = 0; r < heightSegments; r++) {
        for (let s = 0; s < radialSegments; s++) {
          const i1 = r * (radialSegments + 1) + s;
          const i2 = i1 + 1;
          const i3 = (r + 1) * (radialSegments + 1) + s;
          const i4 = i3 + 1;

          indices.push(i1, i3, i2);
          indices.push(i2, i3, i4);
        }
      }

      const sleeveGeo = new THREE.BufferGeometry();
      sleeveGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      sleeveGeo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
      sleeveGeo.setIndex(indices);
      sleeveGeo.computeVertexNormals();

      const sleeveMesh = new THREE.Mesh(sleeveGeo, sleeveMaterial);
      sleeveMesh.castShadow = true;
      sleeveMesh.receiveShadow = true;

      // Position and rotate sleeve onto shoulder
      sleeveGroup.position.set(side * 0.64, 0.88, -0.02);
      sleeveGroup.rotation.z = side * 0.72; // Arm outward flare
      sleeveGroup.rotation.x = -0.15;       // Natural forward reach

      sleeveGroup.add(sleeveMesh);

      // Add Elastic Aero Cuff Ring at the end
      const cuffGeo = new THREE.CylinderGeometry(0.205, 0.20, 0.08, 24, 1, true);
      const cuffMesh = new THREE.Mesh(cuffGeo, cuffMaterial);
      cuffMesh.position.set(0, -length + 0.04, 0);
      cuffMesh.castShadow = true;
      sleeveGroup.add(cuffMesh);

      return sleeveGroup;
    }

    /**
     * 3. AERO MANDARIN ZIP COLLAR
     * Low profile ergonomic cycling neck band with V-throat notch.
     */
    buildAeroCollar(material) {
      const curveSegments = 32;
      const positions = [];
      const uvs = [];
      const indices = [];

      const topY = 1.14;
      const botY = 0.96;
      const rx = 0.42;
      const rz = 0.35;

      for (let s = 0; s <= curveSegments; s++) {
        const theta = (s / curveSegments) * Math.PI * 2;
        const sinT = Math.sin(theta);
        const cosT = Math.cos(theta);

        let notchDrop = 0;
        // V-throat drop at the front center (theta ~ PI/2)
        if (sinT > 0.85) {
          notchDrop = (sinT - 0.85) * 0.12;
        }

        const px = cosT * rx;
        const pz = sinT * rz;

        // Bottom point
        positions.push(px, botY - notchDrop, pz);
        // Top point
        positions.push(px * 0.94, topY - notchDrop, pz * 0.94);

        let u = sinT >= 0 ? 0.25 : 0.75;
        uvs.push(u, 0.90);
        uvs.push(u, 0.98);
      }

      for (let s = 0; s < curveSegments; s++) {
        const i1 = s * 2;
        const i2 = i1 + 1;
        const i3 = (s + 1) * 2;
        const i4 = i3 + 1;

        indices.push(i1, i2, i3);
        indices.push(i2, i4, i3);
      }

      const collarGeo = new THREE.BufferGeometry();
      collarGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      collarGeo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
      collarGeo.setIndex(indices);
      collarGeo.computeVertexNormals();

      const collarMesh = new THREE.Mesh(collarGeo, material);
      collarMesh.name = 'AeroCollar';
      collarMesh.castShadow = true;
      collarMesh.receiveShadow = true;
      return collarMesh;
    }

    /**
     * 4. 3D TRIPLE REAR CARGO POCKETS
     * Physical, volumetric pockets on the lower back with elastic top band and distinct compartments.
     */
    buildTripleRearPockets(material) {
      const pocketsGroup = new THREE.Group();
      pocketsGroup.name = 'RearCargoPockets_3Bay';

      const pocketY = -0.58;
      const pocketHeight = 0.52;
      const pocketDepth = 0.048;

      // 3 Pockets: Left, Center, Right
      const pocketConfigs = [
        { name: 'Pocket_Left',   cx: -0.34, width: 0.32, rotY: 0.18,  uCenter: 0.65 },
        { name: 'Pocket_Center', cx:  0.00, width: 0.34, rotY: 0.00,  uCenter: 0.75 },
        { name: 'Pocket_Right',  cx:  0.34, width: 0.32, rotY: -0.18, uCenter: 0.85 }
      ];

      pocketConfigs.forEach(cfg => {
        const pGeo = new THREE.BoxGeometry(cfg.width, pocketHeight, pocketDepth, 6, 8, 2);
        
        // Curve the pocket slightly to follow back curvature
        const pos = pGeo.attributes.position;
        for (let i = 0; i < pos.count; i++) {
          const x = pos.getX(i);
          const y = pos.getY(i);
          const z = pos.getZ(i);

          // Slight bow outwards
          const bowZ = Math.cos(x / (cfg.width * 0.5) * Math.PI * 0.5) * 0.015;
          // Taper at bottom
          const taperZ = y < 0 ? y * 0.01 : 0;
          pos.setZ(i, z + bowZ + taperZ);
        }
        pGeo.computeVertexNormals();

        // Map UV coordinates specifically to rear pocket zone on the texture
        const uv = pGeo.attributes.uv;
        for (let i = 0; i < uv.count; i++) {
          let u = cfg.uCenter + (uv.getX(i) - 0.5) * 0.18;
          let v = 0.15 + uv.getY(i) * 0.28;
          uv.setXY(i, THREE.MathUtils.clamp(u, 0.5, 1.0), THREE.MathUtils.clamp(v, 0, 1));
        }

        const pocketMesh = new THREE.Mesh(pGeo, material);
        pocketMesh.name = cfg.name;
        // Position on rear surface
        const backZ = -0.38 - Math.abs(cfg.cx) * 0.04;
        pocketMesh.position.set(cfg.cx, pocketY, backZ);
        pocketMesh.rotation.y = cfg.rotY;
        pocketMesh.castShadow = true;
        pocketMesh.receiveShadow = true;
        pocketsGroup.add(pocketMesh);
      });

      // Top Reinforced Elastic Pocket Band across all 3 pockets
      const bandGeo = new THREE.BoxGeometry(1.04, 0.035, 0.052);
      const bandMesh = new THREE.Mesh(bandGeo, material);
      bandMesh.name = 'Pockets_ElasticTopBand';
      bandMesh.position.set(0, pocketY + pocketHeight * 0.5 + 0.015, -0.40);
      bandMesh.castShadow = true;
      pocketsGroup.add(bandMesh);

      // Reflective Safety Tab in the center
      const refMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1, metalness: 0.9 });
      const refGeo = new THREE.BoxGeometry(0.04, 0.06, 0.055);
      const refMesh = new THREE.Mesh(refGeo, refMat);
      refMesh.position.set(0, pocketY - pocketHeight * 0.5 + 0.04, -0.41);
      pocketsGroup.add(refMesh);

      return pocketsGroup;
    }

    /**
     * 5. FRONT FULL ZIPPER & METALLIC PULL TAB
     */
    buildFrontZipper(zipperMaterial) {
      const zipperGroup = new THREE.Group();
      zipperGroup.name = 'FrontZipper_Assembly';

      // Full length zipper teeth track
      const trackLength = 2.02;
      const trackGeo = new THREE.BoxGeometry(0.018, trackLength, 0.012);
      const trackMesh = new THREE.Mesh(trackGeo, zipperMaterial);
      trackMesh.position.set(0, -0.04, 0.445);
      trackMesh.castShadow = true;
      zipperGroup.add(trackMesh);

      // Metallic Zipper Slider & Pull Tab
      const sliderGeo = new THREE.BoxGeometry(0.038, 0.065, 0.032);
      const sliderMesh = new THREE.Mesh(sliderGeo, zipperMaterial);
      sliderMesh.position.set(0, 0.88, 0.475);
      sliderMesh.castShadow = true;
      zipperGroup.add(sliderMesh);

      // Pull Tab hanging down
      const pullerGeo = new THREE.BoxGeometry(0.024, 0.085, 0.008);
      const pullerMesh = new THREE.Mesh(pullerGeo, zipperMaterial);
      pullerMesh.position.set(0, 0.81, 0.490);
      pullerMesh.rotation.x = 0.12;
      pullerMesh.castShadow = true;
      zipperGroup.add(pullerMesh);

      return zipperGroup;
    }

    /**
     * 6. SILICONE WAIST GRIPPER HEM
     */
    buildWaistHem(hemMaterial) {
      const hemGeo = new THREE.CylinderGeometry(0.625, 0.635, 0.07, 40, 1, true);
      const hemMesh = new THREE.Mesh(hemGeo, hemMaterial);
      hemMesh.name = 'SiliconeWaistHem';
      hemMesh.position.set(0, -1.14, 0.0);
      hemMesh.castShadow = true;
      return hemMesh;
    }
  }

  window.CyclingJersey3DBuilder = CyclingJersey3DBuilder;

})(window);
