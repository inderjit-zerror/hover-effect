// import * as THREE from "three";
// import vertex from "../src/shaders/vertex.glsl";
// import fragment from "../src/shaders/fragment.glsl";

// const canvas = document.querySelector(".canvas");

// // Scene
// const scene = new THREE.Scene();

// // Camera
// const camera = new THREE.PerspectiveCamera(
//   75,
//   window.innerWidth / window.innerHeight,
//   0.1,
//   100
// );
// camera.position.z = 1.5;

// // Renderer
// const renderer = new THREE.WebGLRenderer({
//   canvas,
//   antialias: true,
// });
// renderer.setSize(window.innerWidth, window.innerHeight);
// renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
// renderer.setClearColor(0xffffff, 1);

// // Texture Loader
// const loader = new THREE.TextureLoader();

// loader.load("/Logo_Dark.png", (texture) => {
//   const geometry = new THREE.PlaneGeometry(1, 1);

//   const material = new THREE.ShaderMaterial({
//     vertexShader: vertex,
//     fragmentShader: fragment,
//     uniforms: {
//       uTexture: { value: texture },
//     },
//   });

//   const mesh = new THREE.Mesh(geometry, material);
//   scene.add(mesh);

//   // First resize
//   fitImageByWidth(mesh, texture, camera);

//   // Resize event
//   window.addEventListener("resize", () => {
//     camera.aspect = window.innerWidth / window.innerHeight;
//     camera.updateProjectionMatrix();
//     renderer.setSize(window.innerWidth, window.innerHeight);

//     fitImageByWidth(mesh, texture, camera);
//   });
// });

// // Fit Image by WIDTH only
// function fitImageByWidth(mesh, texture, camera) {
//   const imgAspect = texture.image.width / texture.image.height;

//   // Screen width in world space
//   const distance = camera.position.z;
//   const vFov = (camera.fov * Math.PI) / 180;

//   const screenHeight = 2 * Math.tan(vFov / 2) * distance;
//   const screenWidth = screenHeight * camera.aspect;

//   // Size based on width ONLY
//   const width = screenWidth;
//   const height = width / imgAspect;

//   mesh.scale.set(width, height, 1);
// }

// // Animate
// function animate() {
//   requestAnimationFrame(animate);
//   renderer.render(scene, camera);
// }
// animate();

import * as THREE from "three";
import vertex from "../src/shaders/vertex.glsl";
import fragment from "../src/shaders/fragment.glsl";

const canvas = document.querySelector(".canvas");

// Scene
const scene = new THREE.Scene();

// Camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.z = 1.5;

// Renderer
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
renderer.setClearColor(0xffffff, 1);

// Mouse
const mouse = new THREE.Vector2(0.5, 0.5);
let mouseOver = false;

// Texture Loader
const loader = new THREE.TextureLoader();

loader.load("/Logo_Dark.png", (texture) => {
  const geometry = new THREE.PlaneGeometry(1, 1);

  const material = new THREE.ShaderMaterial({
    vertexShader: vertex,
    fragmentShader: fragment,
    uniforms: {
      uTexture: { value: texture },
      uMouse: { value: mouse },
      uStrength: { value: 0.0 },
      uTime: { value: 0.0 },
      uResolution: {
        value: new THREE.Vector2(window.innerWidth, window.innerHeight),
      },
      uRippleOrigin: { value: new THREE.Vector2(0.5, 0.5) },
      uRippleStart: { value: -1.0 }, // start in the past
    },
    transparent: true,
  });

  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  // First resize
  fitImageByWidth(mesh, texture, camera);

  // Resize event
  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);

    material.uniforms.uResolution.value.set(
      window.innerWidth,
      window.innerHeight
    );
    fitImageByWidth(mesh, texture, camera);
  });

  // // Mouse move
  // window.addEventListener("mousemove", (e) => {
  //   // Convert mouse to normalized device coordinates [0,1]
  //   const rect = canvas.getBoundingClientRect();
  //   const x = (e.clientX - rect.left) / rect.width;
  //   const y = 1 - (e.clientY - rect.top) / rect.height; // flip Y

  //   mouse.set(x, y);
  //   mouseOver = true;
  // });

  // window.addEventListener("mouseleave", () => {
  //   mouseOver = false;
  // });

  // Mouse move
  window.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = 1 - (e.clientY - rect.top) / rect.height; // flip Y

    // Check if mouse is over the image
    const imgLeft =
      (0.5 - (0.5 * mesh.scale.x) / camera.position.z) * window.innerWidth;
    const imgRight =
      (0.5 + (0.5 * mesh.scale.x) / camera.position.z) * window.innerWidth;
    const imgTop =
      (0.5 - (0.5 * mesh.scale.y) / camera.position.z) * window.innerHeight;
    const imgBottom =
      (0.5 + (0.5 * mesh.scale.y) / camera.position.z) * window.innerHeight;

    // Use bounding box in pixels
    const mouseX = e.clientX;
    const mouseY = e.clientY;

    mouseOver =
      mouseX >= imgLeft &&
      mouseX <= imgRight &&
      mouseY >= imgTop &&
      mouseY <= imgBottom;

    if (mouseOver) {
      mouse.set(x, y);

      // trigger ripple
    material.uniforms.uRippleOrigin.value.set(x, y);
    material.uniforms.uRippleStart.value = clock.getElapsedTime();
    }
  });

  window.addEventListener("mouseleave", () => {
    mouseOver = false;
  });

  // Animate
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

    const time = clock.getElapsedTime();
    material.uniforms.uTime.value = time;

    // // Smoothly animate strength
    // material.uniforms.uStrength.value = mouseOver
    //   ? THREE.MathUtils.lerp(material.uniforms.uStrength.value, 1.0, 0.1)
    //   : THREE.MathUtils.lerp(material.uniforms.uStrength.value, 0.0, 0.1);

    // Smoothly animate strength
    material.uniforms.uStrength.value = THREE.MathUtils.lerp(
      material.uniforms.uStrength.value,
      mouseOver ? 1.0 : 0.0, // only 1 if mouse is over image
      0.1
    );

    
    renderer.render(scene, camera);
  }
  animate();
});

// Fit Image by WIDTH only
function fitImageByWidth(mesh, texture, camera) {
  const imgAspect = texture.image.width / texture.image.height;

  // Screen width in world space
  const distance = camera.position.z;
  const vFov = (camera.fov * Math.PI) / 180;

  const screenHeight = 2 * Math.tan(vFov / 2) * distance;
  const screenWidth = screenHeight * camera.aspect;

  // Size based on width ONLY
  const width = screenWidth;
  const height = width / imgAspect;

  mesh.scale.set(width, height, 1);
}
