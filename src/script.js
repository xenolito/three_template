import './css/style.css'
import './css/layout.scss'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { gsap } from 'gsap'
import overlayLoading from './modules/loadingOverlay'

import waterVertexShader from './shaders/water/vertex.glsl'
import waterFragmentShader from './shaders/water/fragment.glsl'
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
const gui = new dat.GUI({ width: 340 })
const debugObject = {}

/**
 * ! LoadManager
 */

const loadingBarElement = document.querySelector('.loading-bar')

const loadingManager = new THREE.LoadingManager(
    () => {
        if (dc) dc.kill()
        var dc = gsap.delayedCall(0.5, () => {
            gsap.to(overlay.material.uniforms.uAlpha, { duration: 3, value: 0 })
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

const overlay = overlayLoading(scene)

/*------------------------------------------------------------------------------------------------------*
                        //! MATERIALS && TEXTURES
\*------------------------------------------------------------------------------------------------------*/
// baked Texture
const bakedTexture = textureLoader.load('./baked.jpg')
bakedTexture.flipY = false
bakedTexture.encoding = THREE.sRGBEncoding

// Pole light material
const poleLightMaterial = new THREE.MeshBasicMaterial({ color: 0xffffe5 })
const portalLightMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff })

// Baked material
const bakedMaterial = new THREE.MeshBasicMaterial({ map: bakedTexture })

/*------------------------------------------------------------------------------------------------------*
                        //!MODELS
\*------------------------------------------------------------------------------------------------------*/
gltfLoader.load('./Portal.glb', (gltf) => {
    scene.add(gltf.scene)

    // Get each object
    const bakedMesh = gltf.scene.children.find((child) => child.name === 'merged')
    const portalLightMesh = gltf.scene.children.find((child) => child.name === 'portalLight')
    const poleLightAMesh = gltf.scene.children.find((child) => child.name === 'poleLightA')
    const poleLightBMesh = gltf.scene.children.find((child) => child.name === 'poleLightB')

    // console.log(`portal = ${portalLightMesh}`)
    // console.log(`pole light A = ${poleLightAMesh}`)
    // console.log(`pole light B = ${poleLightBMesh}`)

    bakedMesh.material = bakedMaterial
    poleLightAMesh.material = poleLightMaterial
    poleLightBMesh.material = poleLightMaterial
    portalLightMesh.material = portalLightMaterial
})

// Degug
// gui.add(cube, 'width').name('Cube_Width')

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
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100)
// const cameraInitialPosition = new THREE.Vector3(-0.521, -0.471, -0.831)
camera.position.set(2, 2, 6)
scene.add(camera)

// gui.add(camera.position, 'x').min(-10).max(10).step(0.01).name('CameraX')
// gui.add(camera.position, 'y').min(-10).max(10).step(0.01).name('CameraY')

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
controls.maxPolarAngle = Math.PI * 0.4
controls.maxDistance = 15
controls.minDistance = 3
// controls.minPolarAngle = Math.PI * 0.5

// controls.target = new THREE.Vector3(-0.0422, -0.3255, -0.0773)

// controls.addEventListener('end', (e) => {
//     console.log('camera position', controls.object.position)
//     console.log('camera target', controls.target)
// })

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
// renderer.setClearColor(0x000000)

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () => {
    const elapsedTime = clock.getElapsedTime()

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
