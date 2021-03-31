import './css/style.css'
import './css/layout.scss'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { gsap } from 'gsap'
import overlayLoading from './modules/loadingOverlay'

// import waterVertexShader from './shaders/water/vertex.glsl'
// import waterFragmentShader from './shaders/water/fragment.glsl'

import firefliesVertexShader from './shaders/fireflies/vertex.glsl'
import firefliesFragmentShader from './shaders/fireflies/fragment.glsl'
import portalVertexShader from './shaders/portal/vertex.glsl'
import portalFragmentShader from './shaders/portal/fragment.glsl'

import * as dat from 'dat.gui'
import * as Stats from 'stats.js'

/**
 *  Stats util
 */
const body = document.querySelector('body')
const stats = new Stats()
stats.showPanel(0)
body.appendChild(stats.dom)

/**
 *  Degug
 */
const debugObject = {}
const gui = new dat.GUI({ width: 400, closed: true })

debugObject.portalColorStart = 0xf5f5f5
debugObject.portalColorEnd = 0x7d7d

gui.addColor(debugObject, 'portalColorStart').onChange(() => {
    portalLightMaterial.uniforms.uColorStart.value.set(debugObject.portalColorStart)
})

gui.addColor(debugObject, 'portalColorEnd').onChange(() => {
    portalLightMaterial.uniforms.uColorEnd.value.set(debugObject.portalColorEnd)
})

/**
 * ! LoadManager
 */

const loadingBarElement = document.querySelector('.loading-bar')

const loadingManager = new THREE.LoadingManager(
    () => {
        if (dc) dc.kill()
        var dc = gsap.delayedCall(0.5, () => {
            gsap.to(overlay.material.uniforms.uAlpha, {
                duration: 3,
                value: 0,
                onComplete: () => {
                    overlay.geometry.dispose()
                    overlay.material.dispose()
                    scene.remove(overlay)
                },
            })

            loadingBarElement.classList.add('ended')
            loadingBarElement.style.transform = ''
        })
    },
    (itemURL, itemsLoaded, itemsTotal) => {
        // Progress
        const progressRatio = itemsLoaded / itemsTotal
        loadingBarElement.style.transform = `scaleX(${progressRatio})`
        // console.log(progressRatio)
    }
)

//! Loaders
const textureLoader = new THREE.TextureLoader()

const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('./draco/')

const gltfLoader = new GLTFLoader(loadingManager)
// const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)

// gltfLoader.load('./models/DamagedHelmet/glTF/DamagedHelmet.gltf', (gltf) => {
//     gltf.scene.scale.set(0.15, 0.15, 0.15)
//     gltf.scene.position.y = 0.5
//     scene.add(gltf.scene)
// })

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/*------------------------------------------------------------------------------------------------------*
                        //! MATERIALS && TEXTURES
\*------------------------------------------------------------------------------------------------------*/
// baked Texture
const bakedTexture = textureLoader.load('./baked11.jpg')
bakedTexture.flipY = false
bakedTexture.encoding = THREE.sRGBEncoding

// Pole light material
const poleLightMaterial = new THREE.MeshBasicMaterial({ color: 0xffffe5 })

const portalLightMaterial = new THREE.ShaderMaterial({
    // side: THREE.DoubleSide,
    uniforms: {
        uTime: { value: 0 },
        uColorStart: { value: new THREE.Color(debugObject.portalColorStart) },
        uColorEnd: { value: new THREE.Color(debugObject.portalColorEnd) },
    },
    vertexShader: portalVertexShader,
    fragmentShader: portalFragmentShader,
})

const portalBackLightMaterial = new THREE.MeshBasicMaterial({
    color: '#0000ff',
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
    premultipliedAlpha: true,
    // blending: THREE.MultiplyBlending,
})

// Baked material
const bakedMaterial = new THREE.MeshBasicMaterial({ map: bakedTexture })

/*------------------------------------------------------------------------------------------------------*
                        //!MODELS
\*------------------------------------------------------------------------------------------------------*/
gltfLoader.load('./Portal_11.glb', (gltf) => {
    scene.add(gltf.scene)

    // Get each object
    gltf.scene.traverse((child) => {
        child.material = bakedMaterial
    })

    // const bakedMesh = gltf.scene.children.find((child) => child.name === 'merged')
    const portalLightMesh = gltf.scene.children.find((child) => child.name === 'portalLight')
    const portalBackLightMesh = gltf.scene.children.find((child) => child.name === 'portalLight_BACK')
    const poleLightAMesh = gltf.scene.children.find((child) => child.name === 'poleLightA')
    const poleLightBMesh = gltf.scene.children.find((child) => child.name === 'poleLightB')

    // bakedMesh.material = bakedMaterial
    poleLightAMesh.material = poleLightMaterial
    poleLightBMesh.material = poleLightMaterial
    portalLightMesh.material = portalLightMaterial
    portalBackLightMesh.material = portalBackLightMaterial
})

/*------------------------------------------------------------------------------------------------------*
                        FIREFLIES
\*------------------------------------------------------------------------------------------------------*/

const firefliesGeometry = new THREE.BufferGeometry()
const firefliesCount = 30
const firefliesPositionArray = new Float32Array(firefliesCount * 3)

for (let i = 0; i < firefliesCount; i++) {
    firefliesPositionArray[i * 3 + 0] = (Math.random() - 0.5) * 4
    firefliesPositionArray[i * 3 + 1] = Math.random() * 1.5
    firefliesPositionArray[i * 3 + 2] = (Math.random() - 0.5) * 4
}

firefliesGeometry.setAttribute('position', new THREE.BufferAttribute(firefliesPositionArray, 3))

const scaleArray = new Float32Array(firefliesCount)
for (let i = 0; i < firefliesCount; i++) {
    scaleArray[i] = Math.random()
}

firefliesGeometry.setAttribute('aScale', new THREE.BufferAttribute(scaleArray, 1))

// fireflies Material
// const firefliesMaterial = new THREE.PointsMaterial({ size: 0.1, sizeAttenuation: true })
const firefliesMaterial = new THREE.ShaderMaterial({
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,

    uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
        uSize: { value: 200 },
    },
    vertexShader: firefliesVertexShader,
    fragmentShader: firefliesFragmentShader,
})

// fireflies Points
const fireflies = new THREE.Points(firefliesGeometry, firefliesMaterial)
scene.add(fireflies)

gui.add(firefliesMaterial.uniforms.uSize, 'value').min(0).max(500).step(1).name('firefliesSize')

// const axishelper = new THREE.AxesHelper()
// scene.add(axishelper)

const overlay = overlayLoading(scene)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
}

window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    // Update pixel ratios for shaders
    firefliesMaterial.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 2)
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100)
camera.position.set(2, 2, 6)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
controls.maxPolarAngle = Math.PI * 0.48
controls.maxDistance = 15
controls.minDistance = 2

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.outputEncoding = THREE.sRGBEncoding

debugObject.clearColor = '#3e2e2e'
renderer.setClearColor(debugObject.clearColor)

gui.addColor(debugObject, 'clearColor').onChange(() => {
    renderer.setClearColor(debugObject.clearColor)
})

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () => {
    const elapsedTime = clock.getElapsedTime()

    firefliesMaterial.uniforms.uTime.value = elapsedTime
    portalLightMaterial.uniforms.uTime.value = elapsedTime
    // Update controls
    controls.update()
    stats.update()

    // console.log(camera.position)
    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

/**
 * ! Fullscreen
 */
window.addEventListener('dblclick', () => {
    const fullscreenElement = document.fullscreenElement || document.webkitFullscreenElement
    const fullscreenTarget = body || canvas

    if (!fullscreenElement) {
        if (fullscreenTarget.requestFullscreen) {
            fullscreenTarget.requestFullscreen()
        } else if (fullscreenTarget.webkitRequestFullscreen) {
            fullscreenTarget.webkitRequestFullscreen()
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen()
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen()
        }
    }
})

tick()
