import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const canvas = document.getElementById('sceneCanvas');
const fallback = document.getElementById('webglFallback');

function showRuntimeError(message, error) {
  canvas.hidden = true;
  fallback.hidden = false;
  fallback.textContent = `${message}\n${error?.message || 'Unknown error.'}`;
}

try {
  const renderer = createRenderer();
  if (!renderer) {
    throw new Error('WebGL initialization failed in this browser.');
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x9fc9e8);
  scene.fog = new THREE.Fog(0x9fc9e8, 10, 30);

  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  const defaultCameraPosition = new THREE.Vector3(4.4, 3.2, 7.4);
  camera.position.copy(defaultCameraPosition);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.target.set(0, 1.4, 0);
  controls.minDistance = 3;
  controls.maxDistance = 16;

  addLights(scene);
  addGround(scene);
  const model = createToySoldier();
  scene.add(model.root);

  const animationState = {
    mode: 'march',
    isPlaying: true,
    elapsed: 0
  };

  const playPauseBtn = document.getElementById('playPauseBtn');
  const animationSelect = document.getElementById('animationSelect');
  const resetCameraBtn = document.getElementById('resetCameraBtn');
  const autoRotateToggle = document.getElementById('autoRotateToggle');
  const colorSelect = document.getElementById('colorSelect');

  playPauseBtn.addEventListener('click', () => {
    animationState.isPlaying = !animationState.isPlaying;
    playPauseBtn.textContent = animationState.isPlaying ? 'Pause Animation' : 'Play Animation';
    playPauseBtn.setAttribute('aria-pressed', String(!animationState.isPlaying));
  });

  animationSelect.addEventListener('change', (event) => {
    animationState.mode = event.target.value;
    animationState.elapsed = 0;
  });

  resetCameraBtn.addEventListener('click', () => {
    camera.position.copy(defaultCameraPosition);
    controls.target.set(0, 1.4, 0);
    controls.update();
  });

  autoRotateToggle.addEventListener('change', (event) => {
    controls.autoRotate = Boolean(event.target.checked);
    controls.autoRotateSpeed = 0.9;
  });

  colorSelect.addEventListener('change', (event) => {
    applyColorTheme(model.materialTargets, event.target.value);
  });

  applyColorTheme(model.materialTargets, colorSelect.value);

  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);

    const delta = Math.min(clock.getDelta(), 1 / 20);
    if (animationState.isPlaying) {
      animationState.elapsed += delta;
      runAnimation(model.rig, animationState);
    }

    controls.update();
    renderer.render(scene, camera);
  }

  function resize() {
    const container = canvas.parentElement;
    const width = container.clientWidth;
    const height = container.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  }

  window.addEventListener('resize', resize);
  resize();
  animate();
} catch (error) {
  console.error('Viewer runtime initialization failed:', error);
  showRuntimeError('Unable to initialize the 3D viewer.', error);
}

function createRenderer() {
  const rendererOptions = [
    { antialias: true, powerPreference: 'high-performance' },
    { antialias: false, powerPreference: 'high-performance' },
    { antialias: false, powerPreference: 'default' }
  ];

  for (const options of rendererOptions) {
    try {
      return new THREE.WebGLRenderer({ canvas, ...options });
    } catch {
      // Try the next renderer configuration.
    }
  }

  return null;
}

function addLights(parent) {
  const hemi = new THREE.HemisphereLight(0xd5eeff, 0x334455, 0.65);
  parent.add(hemi);

  const key = new THREE.DirectionalLight(0xffffff, 1.15);
  key.position.set(5, 9, 4);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.near = 0.5;
  key.shadow.camera.far = 30;
  key.shadow.camera.left = -8;
  key.shadow.camera.right = 8;
  key.shadow.camera.top = 8;
  key.shadow.camera.bottom = -8;
  parent.add(key);

  const fill = new THREE.DirectionalLight(0xb0c8ff, 0.45);
  fill.position.set(-4, 3, -4);
  parent.add(fill);
}

function addGround(parent) {
  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(12, 50),
    new THREE.MeshStandardMaterial({ color: 0x5e7f57, roughness: 0.9, metalness: 0.05 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.85;
  ground.receiveShadow = true;
  parent.add(ground);

  const ring = new THREE.Mesh(
    new THREE.RingGeometry(3.9, 4.5, 48),
    new THREE.MeshBasicMaterial({ color: 0x94bba5, transparent: true, opacity: 0.35, side: THREE.DoubleSide })
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = -0.84;
  parent.add(ring);
}

function createToySoldier() {
  const root = new THREE.Group();

  const materialTargets = [];
  const rig = {
    leftArm: new THREE.Group(),
    rightArm: new THREE.Group(),
    leftLeg: new THREE.Group(),
    rightLeg: new THREE.Group(),
    leftHand: new THREE.Group(),
    rightHand: new THREE.Group(),
    torso: new THREE.Group(),
    head: new THREE.Group()
  };

  const uniformMat = new THREE.MeshStandardMaterial({ color: 0x556b2f, roughness: 0.78, metalness: 0.1, flatShading: true });
  const skinMat = new THREE.MeshStandardMaterial({ color: 0xffcfad, roughness: 0.72, metalness: 0.03, flatShading: true });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.52, metalness: 0.32, flatShading: true });
  const accentMat = new THREE.MeshStandardMaterial({ color: 0xf6d369, roughness: 0.55, metalness: 0.25, flatShading: true });

  root.add(rig.torso, rig.leftArm, rig.rightArm, rig.leftLeg, rig.rightLeg, rig.head);

  rig.torso.position.set(0, 1.35, 0);
  rig.head.position.set(0, 2.22, 0);
  rig.leftArm.position.set(0.57, 1.86, 0);
  rig.rightArm.position.set(-0.57, 1.86, 0);
  rig.leftLeg.position.set(0.24, 0.77, 0);
  rig.rightLeg.position.set(-0.24, 0.77, 0);

  const torso = mesh(new THREE.BoxGeometry(1.25, 1.45, 0.65), uniformMat, materialTargets);
  torso.castShadow = true;
  rig.torso.add(torso);

  const belt = mesh(new THREE.BoxGeometry(1.3, 0.22, 0.68), darkMat, materialTargets);
  belt.position.y = -0.55;
  rig.torso.add(belt);

  const strap = mesh(new THREE.BoxGeometry(0.16, 1.55, 0.7), darkMat, materialTargets);
  strap.rotation.z = 0.34;
  strap.position.set(0.23, 0, 0);
  rig.torso.add(strap);

  const medal = mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.08, 6), accentMat, materialTargets);
  medal.rotation.x = Math.PI / 2;
  medal.position.set(-0.3, 0.15, 0.35);
  rig.torso.add(medal);

  const head = mesh(new THREE.BoxGeometry(0.74, 0.74, 0.72), skinMat, materialTargets);
  head.castShadow = true;
  rig.head.add(head);

  const nose = mesh(new THREE.BoxGeometry(0.12, 0.1, 0.15), skinMat, materialTargets);
  nose.position.set(0, -0.02, 0.43);
  rig.head.add(nose);

  const helmet = mesh(new THREE.CylinderGeometry(0.47, 0.58, 0.42, 6), uniformMat, materialTargets);
  helmet.position.y = 0.43;
  helmet.castShadow = true;
  rig.head.add(helmet);

  const plume = mesh(new THREE.BoxGeometry(0.14, 0.32, 0.12), accentMat, materialTargets);
  plume.position.set(0, 0.74, 0);
  plume.castShadow = true;
  rig.head.add(plume);

  const visor = mesh(new THREE.BoxGeometry(0.78, 0.08, 0.25), darkMat, materialTargets);
  visor.position.set(0, 0.32, 0.26);
  rig.head.add(visor);

  const leftArmMesh = mesh(new THREE.BoxGeometry(0.34, 1.05, 0.34), uniformMat, materialTargets);
  leftArmMesh.position.y = -0.52;
  leftArmMesh.castShadow = true;
  rig.leftArm.add(leftArmMesh, rig.leftHand);

  const rightArmMesh = mesh(new THREE.BoxGeometry(0.34, 1.05, 0.34), uniformMat, materialTargets);
  rightArmMesh.position.y = -0.52;
  rightArmMesh.castShadow = true;
  rig.rightArm.add(rightArmMesh, rig.rightHand);

  rig.leftHand.position.set(0, -1.07, 0);
  rig.rightHand.position.set(0, -1.07, 0);

  const leftHandMesh = mesh(new THREE.BoxGeometry(0.24, 0.24, 0.24), skinMat, materialTargets);
  leftHandMesh.castShadow = true;
  rig.leftHand.add(leftHandMesh);

  const rightHandMesh = mesh(new THREE.BoxGeometry(0.24, 0.24, 0.24), skinMat, materialTargets);
  rightHandMesh.castShadow = true;
  rig.rightHand.add(rightHandMesh);

  const rifleBody = mesh(new THREE.BoxGeometry(0.14, 1.25, 0.14), darkMat, materialTargets);
  rifleBody.position.set(0.15, -0.08, 0.26);
  rifleBody.rotation.z = -0.18;
  rifleBody.castShadow = true;
  rig.rightHand.add(rifleBody);

  const rifleStock = mesh(new THREE.BoxGeometry(0.2, 0.35, 0.2), accentMat, materialTargets);
  rifleStock.position.set(0.19, -0.69, 0.27);
  rig.rightHand.add(rifleStock);

  const leftLegMesh = mesh(new THREE.BoxGeometry(0.42, 1.08, 0.42), uniformMat, materialTargets);
  leftLegMesh.position.y = -0.54;
  leftLegMesh.castShadow = true;
  rig.leftLeg.add(leftLegMesh);

  const rightLegMesh = mesh(new THREE.BoxGeometry(0.42, 1.08, 0.42), uniformMat, materialTargets);
  rightLegMesh.position.y = -0.54;
  rightLegMesh.castShadow = true;
  rig.rightLeg.add(rightLegMesh);

  const leftBoot = mesh(new THREE.BoxGeometry(0.5, 0.28, 0.88), darkMat, materialTargets);
  leftBoot.position.set(0, -1.16, 0.16);
  leftBoot.castShadow = true;
  rig.leftLeg.add(leftBoot);

  const rightBoot = mesh(new THREE.BoxGeometry(0.5, 0.28, 0.88), darkMat, materialTargets);
  rightBoot.position.set(0, -1.16, 0.16);
  rightBoot.castShadow = true;
  rig.rightLeg.add(rightBoot);

  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(1.25, 1.35, 0.22, 8),
    new THREE.MeshStandardMaterial({ color: 0x6b7280, roughness: 0.9, metalness: 0.08, flatShading: true })
  );
  base.position.y = -0.75;
  base.receiveShadow = true;
  base.castShadow = true;
  root.add(base);

  return { root, rig, materialTargets };
}

function mesh(geometry, material, list) {
  const result = new THREE.Mesh(geometry, material);
  if (list) {
    list.push(result);
  }
  return result;
}

function runAnimation(rig, state) {
  const t = state.elapsed;

  if (state.mode === 'march') {
    const step = Math.sin(t * 5.4);
    rig.leftLeg.rotation.x = step * 0.62;
    rig.rightLeg.rotation.x = -step * 0.62;
    rig.leftArm.rotation.x = -step * 0.52;
    rig.rightArm.rotation.x = step * 0.52;
    rig.leftHand.rotation.z = Math.sin(t * 10.8) * 0.08;
    rig.rightHand.rotation.z = -Math.sin(t * 10.8) * 0.08;
    rig.torso.rotation.z = Math.sin(t * 2.7) * 0.04;
    rig.head.rotation.y = Math.sin(t * 1.4) * 0.12;
  } else if (state.mode === 'wave') {
    const wave = Math.sin(t * 6.5);
    rig.leftLeg.rotation.x = Math.sin(t * 2.2) * 0.08;
    rig.rightLeg.rotation.x = -Math.sin(t * 2.2) * 0.08;
    rig.leftArm.rotation.x = Math.sin(t * 2.1) * 0.18;
    rig.rightArm.rotation.x = -0.65;
    rig.rightArm.rotation.z = -0.36;
    rig.rightHand.rotation.x = -1.1 + wave * 0.5;
    rig.rightHand.rotation.y = wave * 0.22;
    rig.leftHand.rotation.x = 0;
    rig.torso.rotation.z = Math.sin(t * 2) * 0.06;
    rig.head.rotation.y = Math.sin(t * 2.3) * 0.18;
  } else {
    const breathe = Math.sin(t * 2.3) * 0.03;
    rig.leftLeg.rotation.x = 0;
    rig.rightLeg.rotation.x = 0;
    rig.leftArm.rotation.x = -0.1 + breathe;
    rig.rightArm.rotation.x = -0.14 - breathe;
    rig.rightArm.rotation.z = -0.08;
    rig.leftHand.rotation.x = 0;
    rig.rightHand.rotation.x = 0;
    rig.torso.rotation.z = breathe;
    rig.head.rotation.y = Math.sin(t * 1.3) * 0.1;
  }
}

function applyColorTheme(parts, theme) {
  const palettes = {
    olive: { uniform: 0x556b2f, dark: 0x1f2937, accent: 0xf6d369 },
    blue: { uniform: 0x2f4f76, dark: 0x111827, accent: 0xc5d8ff },
    red: { uniform: 0x8d2f2f, dark: 0x1f1724, accent: 0xffd166 },
    tan: { uniform: 0xb89b6f, dark: 0x39342f, accent: 0xdde6cf }
  };

  const colors = palettes[theme] || palettes.olive;

  for (const part of parts) {
    const { material } = part;
    if (!(material instanceof THREE.MeshStandardMaterial)) {
      continue;
    }

    const hex = material.color.getHex();
    if (hex === 0x556b2f || hex === 0x2f4f76 || hex === 0x8d2f2f || hex === 0xb89b6f) {
      material.color.setHex(colors.uniform);
    } else if (hex === 0x1f2937 || hex === 0x111827 || hex === 0x1f1724 || hex === 0x39342f) {
      material.color.setHex(colors.dark);
    } else if (hex === 0xf6d369 || hex === 0xc5d8ff || hex === 0xffd166 || hex === 0xdde6cf) {
      material.color.setHex(colors.accent);
    }
  }
}
