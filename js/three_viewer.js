/**
 * MINIJERSEY 3D STUDIO â€” GLTF/GLB VIEWER & IMPORTER
 * 
 * Supports loading default and user-uploaded 3D models.
 * Applies Planar Projection UV Mapping dynamically to ensure that the 
 * custom 2D SVG jersey graphics perfectly wrap around any loaded model.
 */

(function (window) {
  'use strict';

  class ThreeJerseyViewer {
    constructor(containerElement, stateManager, renderer2D) {
      this.container = containerElement;
      this.stateManager = stateManager;
      this.renderer2D = renderer2D;

      this.scene = null;
      this.camera = null;
      this.webglRenderer = null;
      this.controls = null;
      
      this.shirtModel = null;
      this.hangerGroup = null;

      this.isAutoRotating = false;
      this.animationFrameId = null;

      // Single texture atlas: 2048x1024 (Left=Front, Right=Back)
      this.textureCanvas = document.createElement('canvas');
      this.textureCanvas.width = 2048;
      this.textureCanvas.height = 1024;
      this.textureCtx = this.textureCanvas.getContext('2d');

      this.shirtTexture = new THREE.CanvasTexture(this.textureCanvas);
      this.shirtTexture.encoding = THREE.sRGBEncoding;
      this.shirtTexture.flipY = true;

      this.init();
    }

    /* ================================================================
     *  INITIALIZATION
     * ================================================================ */
    init() {
      const W = this.container.clientWidth || 800;
      const H = this.container.clientHeight || 700;

      this.scene = new THREE.Scene();

      this.camera = new THREE.PerspectiveCamera(32, W / H, 0.1, 100);
      this.camera.position.set(0, 0, 5);

      this.webglRenderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        preserveDrawingBuffer: true,
      });
      this.webglRenderer.setSize(W, H);
      this.webglRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.webglRenderer.outputEncoding = THREE.sRGBEncoding;
      this.webglRenderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.webglRenderer.toneMappingExposure = 1.1;
      this.webglRenderer.shadowMap.enabled = true;
      this.webglRenderer.shadowMap.type = THREE.PCFSoftShadowMap;

      this.container.innerHTML = '';
      this.container.appendChild(this.webglRenderer.domElement);

      if (window.THREE.OrbitControls) {
        this.controls = new THREE.OrbitControls(this.camera, this.webglRenderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.08;
        this.controls.enablePan = false;
        this.controls.minDistance = 2.0;
        this.controls.maxDistance = 8.0;
        this.controls.maxPolarAngle = Math.PI * 0.8;
        this.controls.minPolarAngle = Math.PI * 0.2;
        this.controls.target.set(0, 0, 0);
      }

      this.setupLighting();

      // Load Default Model
      const defaultModelUrl = window.SHIRT_GLB || 'models/shirt.glb';
      this.loadModelFromURL(defaultModelUrl);

      this.animate = this.animate.bind(this);
      this.animate();

      window.addEventListener('resize', () => this.onWindowResize());
    }

    /* ================================================================
     *  STUDIO LIGHTING
     * ================================================================ */
    setupLighting() {
      this.scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 0.8));
      
      const dirLight = new THREE.DirectionalLight(0xffffff, 0.9);
      dirLight.position.set(3, 10, 5);
      dirLight.castShadow = true;
      dirLight.shadow.mapSize.width = 1024;
      dirLight.shadow.mapSize.height = 1024;
      this.scene.add(dirLight);

      const rimLight = new THREE.DirectionalLight(0x93c5fd, 0.6);
      rimLight.position.set(-5, 5, -5);
      this.scene.add(rimLight);

      // Floor Shadow Plane
      const shadowGeo = new THREE.PlaneGeometry(4, 4);
      const shadowCanvas = document.createElement('canvas');
      shadowCanvas.width = 256; shadowCanvas.height = 256;
      const sCtx = shadowCanvas.getContext('2d');
      const grad = sCtx.createRadialGradient(128, 128, 10, 128, 128, 120);
      grad.addColorStop(0, 'rgba(0,0,0,0.4)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      sCtx.fillStyle = grad;
      sCtx.fillRect(0, 0, 256, 256);

      const shadowMat = new THREE.MeshBasicMaterial({
        map: new THREE.CanvasTexture(shadowCanvas),
        transparent: true, depthWrite: false
      });
      const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
      shadowMesh.rotation.x = -Math.PI / 2;
      shadowMesh.position.y = -1.4;
      this.scene.add(shadowMesh);
    }

    /* ================================================================
     *  MODEL LOADING (.GLB / .GLTF)
     * ================================================================ */
    loadModelFromURL(url) {
      if (!window.THREE.GLTFLoader) {
        console.error('GLTFLoader not found.');
        return;
      }

      if (this.shirtModel) {
        this.scene.remove(this.shirtModel);
        if (this.hangerGroup) this.scene.remove(this.hangerGroup);
      }

      const loader = new window.THREE.GLTFLoader();
      
      loader.load(url, (gltf) => {
        this.shirtModel = gltf.scene;

        // Center & Scale Model
        const box = new THREE.Box3().setFromObject(this.shirtModel);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 2.8 / maxDim; // Normalize to 2.8 units

        this.shirtModel.scale.setScalar(scale);
        this.shirtModel.position.sub(center.multiplyScalar(scale));
        this.shirtModel.position.y -= 0.05;
        this.shirtModel.updateMatrixWorld(true);

        const scaledBox = new THREE.Box3().setFromObject(this.shirtModel);

        // Apply dynamic Planar Projection UV Mapping and our Material
        this.shirtModel.traverse((child) => {
          if (child.isMesh) {
            this.applyPlanarMapping(child, scaledBox);

            child.material = new THREE.MeshStandardMaterial({
              map: this.shirtTexture,
              roughness: 0.8,   // Fabric feel
              metalness: 0.05,
              side: THREE.DoubleSide
            });
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        this.scene.add(this.shirtModel);

        // Build hanger at the top of the model
        this.hangerGroup = new THREE.Group();
        this.buildHanger(scaledBox.max.y);
        this.scene.add(this.hangerGroup);

        this.updateTextureMap();
        console.log('Model loaded & UVs projected successfully.');

      }, undefined, (error) => {
        console.error('Error loading 3D model:', error);
        alert('Unable to load 3D model. Verify it is a valid .glb or .gltf file.');
      });
    }

    applyPlanarMapping(mesh, boundingBox) {
      const pos = mesh.geometry.attributes.position;
      if (!pos) return;

      if (!mesh.geometry.attributes.uv) {
        mesh.geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(pos.count * 2), 2));
      }
      const uv = mesh.geometry.attributes.uv;
      const vertex = new THREE.Vector3();
      
      const min = boundingBox.min;
      const max = boundingBox.max;

      for (let i = 0; i < pos.count; i++) {
        vertex.fromBufferAttribute(pos, i);
        vertex.applyMatrix4(mesh.matrixWorld);

        // Normalize X and Y to 0..1 based on overall bounding box
        let u = (vertex.x - min.x) / (max.x - min.x);
        let v = (vertex.y - min.y) / (max.y - min.y);

        u = Math.max(0, Math.min(1, u));
        v = Math.max(0, Math.min(1, v));

        if (vertex.z > 0) {
          // Front side: left half of texture (0.0 to 0.5)
          u = u * 0.5;
        } else {
          // Back side: right half of texture (0.5 to 1.0)
          // Flip U horizontally so text isn't backward when looking from behind
          u = 0.5 + ((1 - u) * 0.5);
        }
        
        uv.setXY(i, u, v);
      }
      uv.needsUpdate = true;
    }

    /* ================================================================
     *  MINI HANGER
     * ================================================================ */
    buildHanger(topY) {
      const wood = new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.35, metalness: 0.1 });
      
      const barShape = new THREE.Shape();
      barShape.moveTo(-0.95, 0.0);
      barShape.lineTo(0, 0.18);
      barShape.lineTo(0.95, 0.0);
      barShape.lineTo(0.92, -0.06);
      barShape.lineTo(0, 0.10);
      barShape.lineTo(-0.92, -0.06);
      barShape.closePath();

      const bar = new THREE.Mesh(new THREE.ExtrudeGeometry(barShape, { depth: 0.05, bevelEnabled: true, bevelSegments: 3, bevelSize: 0.01, bevelThickness: 0.01 }), wood);
      bar.position.set(0, topY, -0.025);
      bar.castShadow = true;
      this.hangerGroup.add(bar);

      const chrome = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.15, metalness: 0.95 });
      const hookPath = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, topY + 0.13, 0), new THREE.Vector3(0, topY + 0.33, 0), new THREE.Vector3(-0.16, topY + 0.45, 0),
        new THREE.Vector3(-0.22, topY + 0.59, 0), new THREE.Vector3(-0.10, topY + 0.71, 0), new THREE.Vector3(0.08, topY + 0.69, 0), new THREE.Vector3(0.16, topY + 0.60, 0)
      ]);
      const hook = new THREE.Mesh(new THREE.TubeGeometry(hookPath, 32, 0.018, 12, false), chrome);
      hook.castShadow = true;
      this.hangerGroup.add(hook);
    }

    /* ================================================================
     *  TEXTURE BAKING
     * ================================================================ */
    async updateTextureMap() {
      try {
        const [renderedFront, renderedBack] = await Promise.all([
          this.renderer2D.renderToCanvas('front', 'flat', 1024, 1024),
          this.renderer2D.renderToCanvas('back', 'flat', 1024, 1024)
        ]);

        this.textureCtx.clearRect(0, 0, 2048, 1024);

        const state = this.stateManager.getState();
        this.textureCtx.fillStyle = state.colors.body || '#1e3a5f';
        this.textureCtx.fillRect(0, 0, 2048, 1024);

        // Draw Front on left half, Back on right half
        this.textureCtx.drawImage(renderedFront, 0, 0, 1024, 1024);
        this.textureCtx.drawImage(renderedBack, 1024, 0, 1024, 1024);

        this.shirtTexture.needsUpdate = true;
      } catch (err) {
        console.warn('Texture bake error:', err);
      }
    }

    /* ================================================================
     *  CONTROLS & UTILS
     * ================================================================ */
    snapCameraAngle(name) {
      if (!this.controls) return;
      const angles = {
        front: { theta: 0, phi: Math.PI / 2 },
        back: { theta: Math.PI, phi: Math.PI / 2 },
        left: { theta: Math.PI / 2, phi: Math.PI / 2 },
        right: { theta: -Math.PI / 2, phi: Math.PI / 2 },
        perspective: { theta: Math.PI / 5, phi: Math.PI / 2.3 },
      };
      const a = angles[name] || angles.front;
      this.animateCameraTo(a.theta, a.phi);
    }

    animateCameraTo(targetTheta, targetPhi, duration = 450) {
      const startTheta = this.controls.getAzimuthalAngle();
      const startPhi = this.controls.getPolarAngle();
      const startTime = performance.now();
      const updateCamera = (now) => {
        const progress = Math.min((now - startTime) / duration, 1.0);
        const ease = 0.5 - Math.cos(progress * Math.PI) / 2;
        const radius = this.camera.position.length();
        this.camera.position.set(
          radius * Math.sin(THREE.MathUtils.lerp(startPhi, targetPhi, ease)) * Math.sin(THREE.MathUtils.lerp(startTheta, targetTheta, ease)),
          radius * Math.cos(THREE.MathUtils.lerp(startPhi, targetPhi, ease)),
          radius * Math.sin(THREE.MathUtils.lerp(startPhi, targetPhi, ease)) * Math.cos(THREE.MathUtils.lerp(startTheta, targetTheta, ease))
        );
        this.camera.lookAt(0, 0, 0);
        if (progress < 1.0) requestAnimationFrame(updateCamera);
      };
      requestAnimationFrame(updateCamera);
    }

    toggleAutoRotate() {
      this.isAutoRotating = !this.isAutoRotating;
      if (this.controls) {
        this.controls.autoRotate = this.isAutoRotating;
        this.controls.autoRotateSpeed = 2.5;
      }
      return this.isAutoRotating;
    }

    toggleHanger(show) {
      if (this.hangerGroup) this.hangerGroup.visible = show;
    }

    animate() {
      this.animationFrameId = requestAnimationFrame(this.animate);
      if (this.controls) this.controls.update();
      if (this.webglRenderer) this.webglRenderer.render(this.scene, this.camera);
    }

    onWindowResize() {
      if (!this.container || !this.camera || !this.webglRenderer) return;
      const width = this.container.clientWidth;
      const height = this.container.clientHeight;
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.webglRenderer.setSize(width, height);
    }

    capture3DSnapshot(width = 2400, height = 2400) {
      return new Promise((resolve) => {
        const originalWidth = this.container.clientWidth;
        const originalHeight = this.container.clientHeight;
        this.webglRenderer.setSize(width, height);
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.webglRenderer.render(this.scene, this.camera);
        const dataUrl = this.webglRenderer.domElement.toDataURL('image/png');
        this.webglRenderer.setSize(originalWidth, originalHeight);
        this.camera.aspect = originalWidth / originalHeight;
        this.camera.updateProjectionMatrix();
        resolve(dataUrl);
      });
    }

    destroy() {
      if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
      if (this.controls) this.controls.dispose();
      if (this.webglRenderer) this.webglRenderer.dispose();
    }
  }

  window.ThreeJerseyViewer = ThreeJerseyViewer;
})(window);

