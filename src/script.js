import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'
// import GUI from 'lil-gui'
import testFragment from "./shaders/test/fragment.glsl"
import testVertex from "./shaders/test/vertex.glsl" 
/**
 * Base
 */
// Debug
// const gui = new GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Group to hold the flag and text
const group = new THREE.Group()
scene.add(group)

/**
 * Fonts
 */
const fontLoader = new FontLoader()

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
const flagTexture = textureLoader.load('/textures/Flag_of_India.png')

/**
 * Test mesh
 */
// Geometry
const geometry = new THREE.PlaneGeometry(1, 1, 32, 32)
const count = geometry.attributes.position.count
console.log('Vertex Count:', count) // Log the number of vertices
const randoms = new Float32Array(count);

for (let i = 0; i < count; i++) {
    randoms[i] = Math.random();
}

geometry.setAttribute("aRandom", new THREE.BufferAttribute(randoms,1))

// Material
const material = new THREE.ShaderMaterial({
    vertexShader: testVertex,
    fragmentShader: testFragment,
    uniforms: {
        uTime: { type : 'float', value: 0 },
        uFrequency: { type: 'vec2', value: new THREE.Vector2(5.0, 10.0) },
        uColor: { type: 'vec3', value: new THREE.Color('#000000') },
        uTexture : { type: 'sampler2D', value: flagTexture }
    },
    side: THREE.DoubleSide
})
 
//gui
// gui.add(material.uniforms.uFrequency.value, 'x').min(0).max(20).step(0.01).name('Frequency X')
// gui.add(material.uniforms.uFrequency.value, 'y').min(0).max(20).step(0.01).name('Frequency Y')

// Mesh
const mesh = new THREE.Mesh(geometry, material)
const scaleFlag = 7

mesh.scale.y = (scaleFlag * 2) / 3
mesh.scale.x = scaleFlag

mesh.position.y += 5


/**
 * 3D Text
 */
fontLoader.load(
    'https://threejs.org/examples/fonts/helvetiker_regular.typeface.json',
    (font) => {
        // Text geometry
        const textGeometry = new TextGeometry('Happy Independence Day', {
            font: font,
            size: 0.5,
            height: 0.2,
            curveSegments: 12,
            bevelEnabled: true,
            bevelThickness: 0.03,
            bevelSize: 0.02,
            bevelOffset: 0,
            bevelSegments: 5
        })

        // Center the text
        textGeometry.center()

        // Text material
        const textMaterial = new THREE.MeshStandardMaterial({
            map: textureLoader.load('/textures/Flag_of_India.png')
        })

        // Text mesh
        const text = new THREE.Mesh(textGeometry, textMaterial)
        text.name = 'independenceText'
        text.position.y = 1.5 // Position above the flag
        group.add(text)

        // Store a simple animation function on the mesh for use in the render loop
        text.userData.animate = (time) => {
            text.rotation.y = Math.sin(time * 0.5) * 0.1
        }
    },
    // onProgress - optional
    undefined,
    // onError
    (err) => {
        console.error('Failed to load font:', err)
    }
)

group.add(mesh)
group.position.y -= 1
group.scale.set(0.2, 0.2, 0.2)


const ambientLight = new THREE.AmbientLight('#ffffff', 0.5)
scene.add(ambientLight)


const countStars = 5000

const starTexture = textureLoader.load('/textures/8.png')


const pointMaterial = new THREE.PointsMaterial({
    color: '#ffffff',
    size: 0.05,
    sizeAttenuation: true,
    map: starTexture,
    transparent: true,
    alphaMap: starTexture
})



const pointGeometry = new THREE.BufferGeometry()

const positions = new Float32Array(countStars * 3)
for (let i = 0; i < countStars; i++) {
    const x = (Math.random() - 0.5) * 10
    const y = (Math.random() - 0.5) * 10
    const z = (Math.random() - 0.5) * 10
    positions.set([x, y, z], i * 3)
}
pointGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

const stars = new THREE.Points(pointGeometry, pointMaterial)
scene.add(stars)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

const directLight = new THREE.DirectionalLight('#00ff08ff', 2)
group.add(directLight)


window.addEventListener('resize', () =>
{
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
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(0, 0, 3)
scene.add(camera)


// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
controls.minDistance = 1      // Minimum zoom distance
controls.maxDistance = 7     // Maximum zoom distance

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))



/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update uniforms
    material.uniforms.uTime.value = elapsedTime

    // Animate text if it has an animation attached
    const text = group.getObjectByName('independenceText')
    if (text && typeof text.userData.animate === 'function') {
        text.userData.animate(elapsedTime)
    }

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
