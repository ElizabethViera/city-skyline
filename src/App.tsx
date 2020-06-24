import React, { useEffect, useRef } from 'react';
import './App.css';
import * as THREE from 'three';
import { Color } from 'three';

const currentTime = new Date().getHours()
const skyColors = [
  0x000000, 0x1E0336, 0x2A044A, 0x370561, 0x3E1C80,
  0x573180, 0x693880, 0x773C80, 0x234AC2, 0x4070C2,
  0x4A81E0, 0x57B9E0, 0x83DAE0, 0x57B9E0, 0x4A81E0,
  0x4070C2, 0x234AC2, 0xE0548E, 0x693880, 0x573180,
  0x3E1C80, 0x370561, 0x2A044A, 0x1E0336,
]
const skyColor = skyColors[currentTime];
const waterColor = 0xAAAAFF;

function randBetween(lo: number, hi: number): number {
  const range = hi - lo + 1;
  return Math.floor(Math.random() * range) + lo;
}

function genBackGroundBuildings() {
  const buildings = new THREE.Group()
  for (let i = -10; i < 10; i += .1) {
    let height = randBetween(6, 9)
    for (let j = height; j >= 0; j -= 1) {
      const box = new THREE.BoxGeometry(.1, .1, .1)
      const mesh = new THREE.Mesh(box, new THREE.MeshBasicMaterial({ color: 0x888888 }))
      mesh.position.x = i;
      mesh.position.y = j / 10 - 0.4;
      buildings.add(mesh)
    }

  }
  return buildings
}

function genBuildings() {
  const buildings = new THREE.Group()
  for (let i = -10; i < 10; i += .1) {
    let height = randBetween(0, 11)
    let lights = randBetween(0, 10)
    for (let j = height; j >= 0; j -= 1) {

      const box = new THREE.BoxGeometry(.1, .1, .1)
      const mesh = new THREE.Mesh(box, new THREE.MeshBasicMaterial({ color: 0xAAAAAA }))
      mesh.position.x = i;
      mesh.position.y = j / 10 - 0.4;
      buildings.add(mesh)
      if (lights > 4 && (Math.floor((100 * j + 10 * i + lights)) % 3) == 2) {
        const light = new THREE.BoxGeometry(.005 * lights, .01, .2)
        const lightMesh = new THREE.Mesh(light, new THREE.MeshBasicMaterial({ color: 0xFFFFFF }))
        lightMesh.position.x = i - .03;
        lightMesh.position.y = j / 10 - 0.4;
        buildings.add(lightMesh)
      }
    }
    for (let j = -1 * height; j <= 0; j += 1) {
      const box = new THREE.BoxGeometry(.1, .1, .1)
      const mesh = new THREE.Mesh(box, new THREE.MeshBasicMaterial({ color: 0x8888AA }))
      mesh.position.x = i;
      mesh.position.y = j / 10 - 0.5;
      buildings.add(mesh)

      if (lights > 4 && (Math.floor((100 * -j + 10 * i + lights)) % 3) == 2) {
        const light = new THREE.BoxGeometry(.005 * lights, .01, .2)
        const lightMesh = new THREE.Mesh(light, new THREE.MeshBasicMaterial({ color: 0xCCCCFF }))
        lightMesh.position.x = i - .03;
        lightMesh.position.y = j / 10 - 0.5;
        buildings.add(lightMesh)
      }
    }

  }
  return buildings
}


function genSky() {
  const sky = new THREE.Group()
  for (let i = -10; i < 10; i += .1) {
    for (let j = 1; j > -.4; j -= .1) {
      const box = new THREE.BoxGeometry(.1, .1, .1)
      const mesh = new THREE.Mesh(box, new THREE.MeshBasicMaterial({ color: skyColor }))
      mesh.position.x = i;
      mesh.position.y = j;
      sky.add(mesh)
    }
  }
  return sky;
}

function genWater() {
  const water = new THREE.Group()
  for (let i = -10; i < 10; i += .1) {
    for (let j = -.4; j > -1; j -= .1) {
      const box = new THREE.BoxGeometry(.1, .1, .1)
      const mesh = new THREE.Mesh(box, new THREE.MeshBasicMaterial({ color: waterColor }))
      mesh.position.x = i;
      mesh.position.y = j;
      water.add(mesh)
    }
  }
  return water;
}

async function draw(container: HTMLElement) {


  var scene = new THREE.Scene();
  var camera = new THREE.OrthographicCamera(-window.innerWidth / window.innerHeight, window.innerWidth / window.innerHeight, 1, -1, 0.1, 100);
  var light = new THREE.AmbientLight(new Color("#888"))

  scene.add(light)
  var renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);


  camera.position.z = 5;

  const water = genWater()
  const sky = genSky()
  const background = genBackGroundBuildings()
  const buildings = genBuildings()
  scene.add(water, sky, background, buildings)
  renderer.render(scene, camera)
}


function App() {
  const ref = useRef<HTMLDivElement>(null as any)
  useEffect(() => {
    draw(ref.current);
  }, [ref])
  return <div ref={ref} />
}

export default App;