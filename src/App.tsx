import React, { useEffect, useRef } from 'react';
import './App.css';
import * as THREE from 'three';
import { Color } from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'

async function fetchCloudiness() {
  const cloudiness = await fetch('https://city-skyline.netlify.app/.netlify/functions/weather')
  const jsonBlob = await cloudiness.json()
  return { clouds: jsonBlob.clouds.all, temp: jsonBlob.main.feels_like }
}

const currentTime = new Date().getHours()
// const currentTime = 23
const skyColors = [
  0x000000, 0x1E0336, 0x2A044A, 0x370561, 0x3E1C80,
  0x573180, 0x693880, 0x773C80, 0x234AC2, 0x4070C2,
  0x4A81E0, 0x57B9E0, 0x83DAE0, 0x57B9E0, 0x4A81E0,
  0x4070C2, 0x234AC2, 0xE0548E, 0x693880, 0x573180,
  0x3E1C80, 0x370561, 0x2A044A, 0x1E0336,
]

const cloudColors = [
  { c1: 0x343440, c2: 0x59596E },
  { c1: 0x3D104A, c2: 0x5C4A70 },
  { c1: 0x55458F, c2: 0x9797BA },
  { c1: 0x6A56B3, c2: 0xA3A3C9 },
  { c1: 0x6757B5, c2: 0xB6B6E0 },
  { c1: 0xB1B0F5, c2: 0xCFCFFF },
  { c1: 0xEDACF5, c2: 0xF5CCC7 },
  { c1: 0xE98CF5, c2: 0xF5BCDD },
  { c1: 0x697AF5, c2: 0xB6CDF4 },
  { c1: 0x73AAF5, c2: 0x9BCFF5 },
  { c1: 0x73AAF5, c2: 0xAFD9F4 },
  { c1: 0x54D0F5, c2: 0xB6E4F2 },
  { c1: 0xA0F4F2, c2: 0xDFF3F4 },
  { c1: 0x54D0F5, c2: 0xB6E4F2 },
  { c1: 0x73AAF5, c2: 0xAFD9F4 },
  { c1: 0x73AAF5, c2: 0x9BCFF5 },
  { c1: 0x697AF5, c2: 0xB6CDF4 },
  { c1: 0xF58083, c2: 0xF5CFAD },
  { c1: 0xB1B0F5, c2: 0xCFCFFF },
  { c1: 0xB1B0F5, c2: 0xCFCFFF },
  { c1: 0x6757B5, c2: 0xB6B6E0 },
  { c1: 0x6A56B3, c2: 0xA3A3C9 },
  { c1: 0x55458F, c2: 0x9797BA },
  { c1: 0x3D104A, c2: 0x5C4A70 },


]
const skyColor = skyColors[currentTime];
const waterRGB = { r: 80, g: 100, b: 180 }
const waterShade = gradient({ r: new Color(skyColor).r * 255, g: new Color(skyColor).g, b: new Color(skyColor).b }, waterRGB, 5)[3]
const waterColor = RGBtoColor(waterShade)

const buildingRGB = { r: 170, g: 170, b: 170 }
const pink = { r: 51, g: 79, b: 181 }
// const buildingColor = new Color(`rgb(${buildingRGB.r}, ${buildingRGB.g}, ${buildingRGB.b})`)
const buildingColors = gradient(pink, buildingRGB, 35).map((color) => RGBtoColor(color))


function RGBtoColor(c: RGBColor): Color {
  return new Color(`rgb(${Math.floor(c.r)}, ${Math.floor(c.g)}, ${Math.floor(c.b)})`)
}

type RGBColor = { r: number, g: number, b: number }

function lerpNum(top: number, bottom: number, t: number): number {
  return top * (1 - t) + bottom * (t)
}

function lerpColor(top: RGBColor, bottom: RGBColor, t: number): RGBColor {
  return {
    r: lerpNum(top.r, bottom.r, t),
    g: lerpNum(top.g, bottom.g, t),
    b: lerpNum(top.b, bottom.b, t),
  }
}

function gradient(top: RGBColor, bottom: RGBColor, steps: number): RGBColor[] {
  return new Array(steps).fill(null).map((_, i) => lerpColor(top, bottom, i / (steps - 1)))
}

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
      const mesh = new THREE.Mesh(box, new THREE.MeshBasicMaterial({ color: 0x887CA3 }))
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
      const mesh = new THREE.Mesh(box, new THREE.MeshBasicMaterial({ color: buildingColors[j + 20] }))
      mesh.position.x = i;
      mesh.position.y = j / 10 - 0.4;
      buildings.add(mesh)
      if (lights > 4 && (Math.floor((100 * j + 10 * i + lights)) % 3) === 2) {
        const light = new THREE.BoxGeometry(.005 * lights, .01, .2)
        const lightMesh = new THREE.Mesh(light, new THREE.MeshBasicMaterial({ color: 0xFFFFFF }))
        lightMesh.position.x = i - .03;
        lightMesh.position.y = j / 10 - 0.4;
        buildings.add(lightMesh)
      }
    }
    for (let j = -1 * height; j <= 0; j += 1) {
      const box = new THREE.BoxGeometry(.1, .1, .1)
      const mesh = new THREE.Mesh(box, new THREE.MeshBasicMaterial({ color: buildingColors[-1 * j + 4] }))
      mesh.position.x = i;
      mesh.position.y = j / 10 - 0.5;
      buildings.add(mesh)

      if (lights > 4 && (Math.floor((100 * -j + 10 * i + lights)) % 3) === 2) {
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

  // load cloud
  const cloud = await new Promise<THREE.Group>((resolve) => {
    const cloud_loader = new OBJLoader()
    cloud_loader.load('/cloud.obj', resolve);
  })

  cloud.rotateOnAxis(new THREE.Vector3(0, 1, 0), Math.PI)

  cloud.scale.x = .1
  cloud.scale.y = .1
  cloud.scale.z = .1
  cloud.position.z += .15
  cloud.position.y += .9
  const cloudPosX = randBetween(-15, 5) / 4
  cloud.position.x = cloudPosX






  let cloudCount = 0
  cloud.traverse((obj) => {
    if (obj instanceof THREE.Mesh) {
      console.log(cloudCount)
      cloudCount += 1
      const cloudColor = cloudCount === 1 ? cloudColors[currentTime].c1 : cloudColors[currentTime].c2
      obj.geometry.computeVertexNormals();
      obj.material = new THREE.MeshBasicMaterial({ color: new THREE.Color(cloudColor) })
    }
  })

  const weather = await fetchCloudiness()
  // const weather = { clouds: 20, temp: 45.3 }
  const numClouds = weather.clouds * 2.5
  // const temperature = weather.temp

  const cloudMesh = new THREE.Group()
  for (var cloudsCount = 0; cloudsCount < numClouds; cloudsCount++) {
    const newCloud = cloud.clone()
    const newCloudPosX = randBetween(-15, 9) / 4

    const cloudOffset = randBetween(-2, 4) / 10
    const cloudStretch = randBetween(8, 20) / 100
    newCloud.scale.x = cloudStretch
    newCloud.position.y += cloudOffset
    newCloud.position.x = newCloudPosX
    cloudMesh.add(newCloud)
  }

  // load boat
  const boat = await new Promise<THREE.Group>((resolve) => {
    const boat_loader = new OBJLoader()
    boat_loader.load('/boat.obj', resolve);
  })

  // load boat reflection
  const boatRef = await new Promise<THREE.Group>((resolve) => {
    const boat_loader = new OBJLoader()
    boat_loader.load('/boat.obj', resolve);
  })

  boat.scale.x = .1
  boat.scale.y = .1
  boat.scale.z = .1
  boat.rotateOnAxis(new THREE.Vector3(0, 1, 0), Math.PI / 2)
  boat.position.z += .15
  boat.position.y -= .45
  const boatPosX = randBetween(-10, 10) / 4
  boat.position.x = boatPosX

  let boatCount = 0
  boat.traverse((obj) => {
    if (obj instanceof THREE.Mesh) {
      boatCount += 1
      const boatColor = boatCount === 1 ? 0xA37C87 : 0xDBBFE0
      obj.geometry.computeVertexNormals();
      obj.material = new THREE.MeshBasicMaterial({ color: new THREE.Color(boatColor) })
    }
  })

  boatRef.scale.x = .1
  boatRef.scale.y = .1
  boatRef.scale.z = .1
  boatRef.rotateOnAxis(new THREE.Vector3(0, 1, 0), 3 * Math.PI / 2)
  boatRef.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI)
  boatRef.position.z += .15
  boatRef.position.y -= .65
  boatRef.position.x = boatPosX
  let boatRefCount = 0
  boatRef.traverse((obj) => {
    if (obj instanceof THREE.Mesh) {
      console.log(boatRefCount)
      boatRefCount += 1
      const boatColor = boatRefCount === 1 ? 0x866CA3 : 0xADACDE
      obj.geometry.computeVertexNormals();
      obj.material = new THREE.MeshBasicMaterial({ color: new THREE.Color(boatColor) })
    }
  })

  scene.add(water, sky, background, buildings, boat, boatRef, cloudMesh)
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