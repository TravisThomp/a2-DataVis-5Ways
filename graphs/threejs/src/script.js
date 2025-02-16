import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'

/**
 * Car Data
 */

function Car(name, manufacturer, mpg, weight)
{
    this.name = name
    this.manufacturer = manufacturer
    this.mpg = mpg
    this.weight = weight
}

let carPoints = []

const loadCarPoints = (cars) =>
{
    cars.forEach(car => 
        {
            const material = getMaterial(car.manufacturer)
    
            const sphere = new THREE.Mesh(
                new THREE.SphereGeometry(car.weight/300, 16, 16),
                material
            )
            sphere.position.x = getHorizontalCord(car.weight)
            sphere.position.y = getVerticleCord(car.mpg)
    
            //console.log("SPHERE AT: X:" + sphere.position.x + " Y:" + sphere.position.y + " Z:" + sphere.position.z)
            carPoints.push(sphere)
            scene.add(sphere)
        })
    
}

// Loading car-sample.csv file
const getCarData = async () =>
{
    const response = await fetch('./cars-sample.csv')
    const data = await response.text()
    return data
}

// Parsing car csv data to car object
const parseCarData = async () =>
{
    const cars = []
    await getCarData().then(data => data.replaceAll("\"", "")
    .split("\n")
    .forEach(car =>
    {
        const rawCar = car.split(",")
        const newCar = new Car(rawCar[1], rawCar[2], +rawCar[3], +rawCar[7])
        if(!isNaN(newCar.mpg) || !isNaN(newCar.weight))
            cars.push(newCar)

    }))
    loadCarPoints(cars)
}

parseCarData()

/**
 * Base
 */
// Canvas
const canvas = document.querySelector("canvas.webgl")

// Scene
const scene = new THREE.Scene()

/**
 * Sizes
 */

const margins = {
    x: window.innerWidth * .2,
    y: window.innerHeight * .2
}

 const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    margins.x = window.innerWidth * .2,
    margins.y = window.innerHeight * .2

    // Update Camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
})

/**
 * Axis Information
 */

 function Axis(start, end, majorTicks)
 {
     this.start = start
     this.end = end
     this.majorTicks = majorTicks
 }
 
 const horizontalAxis = new Axis(1500, 5000, [2000, 3000, 4000, 5000])
 const verticleAxis = new Axis(7, 43, [10, 20, 30, 40])
 
 const getCord = (value, axis, canvasDimension) => 
 {
    const axisLength = axis.end - axis.start
    const scaleAxis = axisLength > canvasDimension ? (canvasDimension / axisLength) : (canvasDimension / axisLength)

    const scaledValue = value * scaleAxis  - (canvasDimension / 2) - axis.start*scaleAxis;
    
    return scaledValue;
 }


 const getHorizontalCord = (weight) => 
 {
    return getCord(weight, horizontalAxis, sizes.width - margins.x)
 }

 const getVerticleCord = (mpg) => 
 {
    return getCord(mpg, verticleAxis, sizes.height - margins.y)

 }

/**
 * Materials
 */
 const bmwMaterial = new THREE.MeshBasicMaterial()
 bmwMaterial.color = new THREE.Color("red")
 bmwMaterial.transparent = true
 bmwMaterial.opacity = .5

 const fordMaterial = new THREE.MeshBasicMaterial()
 fordMaterial.color = new THREE.Color("green")
 fordMaterial.transparent = true
 fordMaterial.opacity = .5


 const hondaMaterial = new THREE.MeshBasicMaterial()
 hondaMaterial.color = new THREE.Color("teal")
 hondaMaterial.transparent = true
 hondaMaterial.opacity = .5


 const mercedesMaterial = new THREE.MeshBasicMaterial()
 mercedesMaterial.color = new THREE.Color("aqua")
 mercedesMaterial.transparent = true
 mercedesMaterial.opacity = .5


 const toyotaMaterial = new THREE.MeshBasicMaterial()
 toyotaMaterial.color = new THREE.Color("pink")
 toyotaMaterial.transparent = true
 toyotaMaterial.opacity = .5


 const getMaterial = (carManufacturer) => 
 {
    switch(carManufacturer)
    {
        case 'bmw':
            return bmwMaterial
        case 'ford':
            return fordMaterial
        case 'honda':
            return hondaMaterial
        case 'mercedes':
            return mercedesMaterial
        case 'toyota':
            return toyotaMaterial
        default:
            return bmwMaterial;
    }
 }


// Axis Text
const fontLoader = new FontLoader()

fontLoader.load(
    './fonts/helvetiker_regular.typeface.json',
    (font) =>
    {
        const fastTextCreator = (text) =>
        {
            const textGeometry = new TextGeometry(
                text,
                {
                    font: font,
                    size: 20,
                    height: 2.5,
                    curveSegments: 10,
                    bevelEnabled: true,
                    bevelThickness: 0.03,
                    bevelSize: 0.02,
                    bevelOffset: 0,
                    bevelSegments: 5
                }
            )
            const textMaterial = new THREE.MeshNormalMaterial()
            return new THREE.Mesh(textGeometry, textMaterial)
        }
        
        horizontalAxis.majorTicks.forEach(majorTick =>
            {
                const text = fastTextCreator("|\n" + majorTick.toString())
                text.position.x = getHorizontalCord(majorTick)
                text.position.y = sizes.height / -2 + margins.y / 2
                scene.add(text)
            })
        
        verticleAxis.majorTicks.forEach(majorTick =>
            {
                const text = fastTextCreator(majorTick.toString()+ "-")
                text.position.x = sizes.width / -2 + margins.x /3
                text.position.y = getVerticleCord(majorTick)
                scene.add(text)
            })

        const mpgLabel = fastTextCreator("M\nP\nG")
        mpgLabel.position.x = sizes.width / -2 + margins.x / 4
        mpgLabel.position.y = 0
        scene.add(mpgLabel)

        const weightLabel = fastTextCreator("Weight")
        weightLabel.position.x = 0
        weightLabel.position.y = sizes.height/-2 + margins.y /5
        scene.add(weightLabel)
    }
)


/**
 * Camera
 */

const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 10000)

camera.position.z = 550
camera.lookAt(new THREE.Vector3(0, 500, 500))


scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true


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

 const tick = () =>
 {
     controls.update()
    
 
     // Render
     renderer.render(scene, camera)
 
     // Call tick again on the next frame
     window.requestAnimationFrame(tick)
 }
 
 tick()
