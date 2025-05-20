import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import {frameAdd, fps} from './helpers/frame.js'
import {importCollada, importAudio, resources} from './helpers/utils.js'
import {spawnOnimasu,actors} from './helpers/actorManager.js'

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 )
const renderer = new THREE.WebGLRenderer({ antialias: true })
const controls = new OrbitControls( camera, renderer.domElement )

setup()
async function setup ()
{
    renderer.shadowMap.enabled = true
    renderer.setSize( window.innerWidth, window.innerHeight )
    renderer.outputEncoding = THREE.sRGBEncoding
    renderer.physicallyCorrectLights = true
    document.body.appendChild( renderer.domElement )

    camera.position.z = -10
    camera.add( new THREE.AudioListener() )
    scene.add(camera)

    setupControls()
    await importAudio(camera)
    await importCollada()

    spawnOnimasu(scene, resources.onimasu.object)
    actors.onimasu[0].scale = 3
    scene.add(actors.onimasu[0].object)

    scene.add(new THREE.AmbientLight(0xFFFFFF))

    setInterval(() => {
        update()
    }, 1000/fps)
}

function setupControls()
{
    controls.listenToKeyEvents( window ) // optional
    controls.enableDamping = true // an animation loop is required when either damping or auto-rotation are enabled
    controls.dampingFactor = 0.05
    controls.screenSpacePanning = false
    controls.minDistance = 5
    controls.maxDistance = 10000
    controls.maxPolarAngle = Math.PI
}

function update() {
    frameAdd()
    updateActors()
    updateControls()
    updateStepCount()
    renderer.render( scene, camera )
}

function updateActors()
{
    //Onimasu
    actors.onimasu.forEach(t=>t.update())
    //Tiles
    actors.tile.forEach(t=>t.update())
}

function updateStepCount()
{
    const urlString = window.location.search
    const urlParams = new URLSearchParams(urlString)
    const paramValue = urlParams.get('showSteps')
    if(paramValue)
        document.querySelector('.stepcount').innerHTML = actors.onimasu[0].stepCount
}

function updateControls()
{
    const offset = new THREE.Vector3().subVectors(camera.position, controls.target)
    controls.target.copy(actors.onimasu[0].object.position)
    camera.position.copy(actors.onimasu[0].object.position).add(offset)
    controls.update()
}