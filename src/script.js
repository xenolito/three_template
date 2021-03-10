import './css/style.css'
import './css/layout.scss'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { gsap } from 'gsap'

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
 * ! Loading +++
 */

/**
 * TODO: CHECK github ssh...
 */

const loadingBarElement = document.querySelector('.loading-bar')

const loadingManager = new THREE.LoadingManager(
    () => {
        if (dc) dc.kill()
        var dc = gsap.delayedCall(0.5, () => {
            gsap.to(overlayMaterial.uniforms.uAlpha, { duration: 3, value: 0 })
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

const gltfLoader = new GLTFLoader(loadingManager)

// gltfLoader.load('./models/DamagedHelmet/glTF/DamagedHelmet.gltf', (gltf) => {
//     gltf.scene.scale.set(0.15, 0.15, 0.15)
//     gltf.scene.position.y = 0.5
//     scene.add(gltf.scene)
// })

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 *  ! Loader Overlay
 */

// const overlayGeometry = new THREE.PlaneBufferGeometry(2, 2, 1, 1)
// const overlayMaterial = new THREE.ShaderMaterial({
//     transparent: true,
//     uniforms: {
//         uAlpha: { value: 1 },
//     },
//     vertexShader: `

//         void main()
//         {
//             // vec4 modelPosition = modelMatrix * vec4(position, 1.0);
//             // vec4 viewPosition = viewMatrix * modelPosition;
//             // vec4 projectedPosition = projectionMatrix * viewPosition;

//             // vec4 pos = projectionMatrix * modelViewMatrix * vec4(position,1.0);
//             vec4 pos = vec4(position,1.0);

//             gl_Position = pos;
//         }
//     `,
//     fragmentShader: `

//     uniform float uAlpha;

//     void main()
//     {
//         vec4 color = vec4(0.0,0.0,0.0,uAlpha);

//         gl_FragColor = vec4(color);
//     }

//     `,
// })
// const overlay = new THREE.Mesh(overlayGeometry, overlayMaterial)
// scene.add(overlay)

/**
 * Water
 */
// Geometry
const waterGeometry = new THREE.PlaneGeometry(2, 2, 384, 384)

// Color
debugObject.depthColor = '#186691'
debugObject.surfaceColor = '#9bd8ff'
debugObject.fogColor = '#ffffff'
// Fog
const fog = new THREE.Fog(debugObject.fogColor, 1, 2)
scene.fog = fog

debugObject.fog = scene.fog ? true : false
debugObject.fogColor = debugObject.fogColor || false
debugObject.fogNear = scene.fog?.near || 0
debugObject.fogFar = scene.fog?.far || 0

// Material
const waterMaterial = new THREE.ShaderMaterial({
    wireframe: false,
    vertexShader: waterVertexShader,
    fragmentShader: waterFragmentShader,
    uniforms: {
        uTime: { value: 0 },

        uBigWavesElevation: { value: 0.2 },
        uBigWavesFrequency: { value: new THREE.Vector2(4, 1.5) },
        uBigWavesSpeed: { value: 1.0 },

        uSmallWavesElevation: { value: 0.1 },
        uSmallWavesFrequency: { value: 3 },
        uSmallWavesSpeed: { value: 0.2 },
        uSmallWavesIterations: { value: 4.2 },

        uDepthColor: { value: new THREE.Color(debugObject.depthColor) },
        uSurfaceColor: { value: new THREE.Color(debugObject.surfaceColor) },
        uColorOffset: { value: 0.08 },
        uColorMultiplier: { value: 5 },

        fogColor: { type: 'c', value: scene.fog?.color || false },
        fogNear: { type: 'f', value: scene.fog?.near || false },
        fogFar: { type: 'f', value: scene.fog?.far || false },
    },
    fog: true,
    side: THREE.DoubleSide,
})

// Degug
gui.add(waterMaterial, 'wireframe').name('Wireframe')
gui.add(waterMaterial.uniforms.uBigWavesElevation, 'value').min(0).max(1).step(0.001).name('uBigWavesElevation')
gui.add(waterMaterial.uniforms.uBigWavesFrequency.value, 'x').min(0).max(10).step(0.001).name('uBigWavesFrequencyX')
gui.add(waterMaterial.uniforms.uBigWavesFrequency.value, 'y').min(0).max(10).step(0.001).name('uBigWavesFrequencyY')
gui.add(waterMaterial.uniforms.uBigWavesSpeed, 'value').min(0).max(4).step(0.001).name('uBigWavesSpeed')

gui.add(waterMaterial.uniforms.uSmallWavesElevation, 'value').min(0).max(1).step(0.001).name('uSmallWavesElevation')
gui.add(waterMaterial.uniforms.uSmallWavesFrequency, 'value').min(0).max(30).step(0.001).name('uSmallWavesFrequency')
gui.add(waterMaterial.uniforms.uSmallWavesSpeed, 'value').min(0).max(4).step(0.001).name('uSmallWavesSpeed')
gui.add(waterMaterial.uniforms.uSmallWavesIterations, 'value').min(0).max(8).step(1).name('uSmallWavesIteration')

gui.addColor(debugObject, 'depthColor')
    .name('depthColor')
    .onChange(() => {
        waterMaterial.uniforms.uDepthColor.value.set(debugObject.depthColor)
    })
gui.addColor(debugObject, 'surfaceColor')
    .name('surfaceColor')
    .onChange(() => {
        waterMaterial.uniforms.uSurfaceColor.value.set(debugObject.surfaceColor)
    })

gui.add(debugObject, 'fog')
    .name('Fog Enabled')
    .onChange(() => {
        // add fog
        if (debugObject.fog) {
            scene.fog.far = debugObject.fogFar
            scene.fog.near = debugObject.fogNear
        } // remove fog
        else {
            scene.fog.far = 30
        }
    })

gui.addColor(debugObject, 'fogColor')
    .name('fogColor')
    .onChange(() => {
        waterMaterial.uniforms.fogColor.value.set(debugObject.fogColor)
        renderer.setClearColor(debugObject.fogColor)
    })

gui.add(waterMaterial.uniforms.uColorOffset, 'value').min(0).max(1).step(0.001).name('uColorOffset')
gui.add(waterMaterial.uniforms.uColorMultiplier, 'value').min(0).max(10).step(0.001).name('uColorMultiplier')

// Mesh
const water = new THREE.Mesh(waterGeometry, waterMaterial)
water.rotation.x = -Math.PI * 0.5
scene.add(water)

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
// const cameraInitialPosition = new THREE.Vector3(0.25, 1, 1)
// const cameraInitialPosition = new THREE.Vector3(-0.042, -0.325, -0.077)
const cameraInitialPosition = new THREE.Vector3(-0.521, -0.471, -0.831)
camera.position.set(cameraInitialPosition.x, cameraInitialPosition.y, cameraInitialPosition.z)
scene.add(camera)

// gui.add(camera.position, 'x').min(-10).max(10).step(0.01).name('CameraX')
// gui.add(camera.position, 'y').min(-10).max(10).step(0.01).name('CameraY')

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
controls.target = new THREE.Vector3(-0.0422, -0.3255, -0.0773)

// controls.addEventListener('end', (e) => {
//     console.log('camera position', controls.object.position)
//     console.log('camera target', controls.target)
// })

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setClearColor(debugObject.fogColor)

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () => {
    const elapsedTime = clock.getElapsedTime()

    // Update water
    waterMaterial.uniforms.uTime.value = elapsedTime
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
