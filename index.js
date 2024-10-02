import * as THREE from "three";
import { OrbitControls } from "jsm/controls/OrbitControls.js";
import { getFresnelMat } from "./getFresnelMat.js";

const w = window.innerWidth;
const h = window.innerHeight;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 10000);
camera.position.z = 2;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(w, h);
document.body.appendChild(renderer.domElement);

const earthGroup = new THREE.Group();
earthGroup.rotation.x = (-23.4 * Math.PI) / 180;
scene.add(earthGroup);

const controls = new OrbitControls(camera, renderer.domElement);
const loader = new THREE.TextureLoader();

const detail = 12;
const geo = new THREE.IcosahedronGeometry(1, detail);
const mat = new THREE.MeshStandardMaterial({
  map: loader.load("earthmap1k.jpg"),
});
const earthMesh = new THREE.Mesh(geo, mat);
earthGroup.add(earthMesh);

const LightMat = new THREE.MeshBasicMaterial({
  map: loader.load("earthlights1k.jpg"),
  blending: THREE.AdditiveBlending,
});
const LightMesh = new THREE.Mesh(geo, LightMat);

const cloudeMat = new THREE.MeshStandardMaterial({
  map: loader.load("cloud_combined_2048.jpg"),
  transparent: true,
  opacity: 0.8,
  blending: THREE.AdditiveBlending,
});
const cloudeMesh = new THREE.Mesh(geo, cloudeMat);
cloudeMesh.scale.setScalar(1.003);
earthGroup.add(cloudeMesh);

const fresnelMat = getFresnelMat()
const glowMesh = new THREE.Mesh(geo , fresnelMat)
glowMesh.scale.setScalar(1.01)
earthGroup.add(glowMesh)

earthGroup.add(LightMesh);

const sunLight = new THREE.DirectionalLight(0xffffff);
sunLight.position.set(-2.5, 0.5, 1.5);
scene.add(sunLight);

const pointLight = new THREE.PointLight(0xffffff, 1, 100);
pointLight.position.set(5, 5, 5);
scene.add(pointLight);

// Add stars
function addStars() {
  const geometry = new THREE.BufferGeometry();
  const starCount = 7000; // Reduced star count

  const positions = new Float32Array(starCount * 3);
  const colors = new Float32Array(starCount * 3);

  for (let i = 0; i < starCount * 3; i += 3) {
    const radius = 1000;
    const theta = 2 * Math.PI * Math.random();
    const phi = Math.acos(2 * Math.random() - 1);
    
    positions[i] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i + 2] = radius * Math.cos(phi);

    // Vary star brightness
    const brightness = Math.random() * 0.5 + 0.5; // 0.5 to 1
    colors[i] = colors[i + 1] = colors[i + 2] = brightness;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    color: 0xFFFFFF,
    size: 1, // Reduced size
    sizeAttenuation: false,
    vertexColors: true, // Use vertex colors for star brightness
    transparent: true,
    opacity: 0.8 // Slightly reduce overall star brightness
  });

  const stars = new THREE.Points(geometry, material);
  scene.add(stars);
}


addStars();

function animate(t = 0) {
  requestAnimationFrame(animate);
  earthMesh.rotation.y += 0.002;
  LightMesh.rotation.y += 0.002;
  cloudeMesh.rotation.y += 0.002;
  glowMesh.rotation.y += 0.002;
  controls.update();
  renderer.render(scene, camera);
}

// Handle window resizing
window.addEventListener("resize", () => {
  const newWidth = window.innerWidth;
  const newHeight = window.innerHeight;
  camera.aspect = newWidth / newHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(newWidth, newHeight);
});

// Extend the far plane of the camera
camera.far = 2000;
camera.updateProjectionMatrix();

animate();