import * as THREE from 'three'
import {frame, speed} from './frame.js'
import {randomDir, resources} from './utils.js'
import {spawnTile} from './actorManager.js'

export default class Onimasu
{
    _scene 
    _scale 
    vOffset 
    object
    delay = 30 / speed
    rotationFrameDuration = 30 / speed
    fullRotation = Math.PI / 2
    timer = 0
    isRotating = false
    initialRotation 
    initialPosition
    initialStartedFrame 
    rotationPoint
    rotatingDir
    stepCount = 0

    constructor(scene, obj)
    {
        this._scene = scene
        this.object = obj
    }
    get scale() {
        return this._scale
    }
    set scale(n) {
        this._scale = n
        const offset = .00115
        this.object.scale.set(n * offset,n * offset ,n  * offset)
    }

    update() {
        if(!this.isRotating) {
            this.timer += 1
            if(this.timer >= this.delay)
                this.beginOnimasuRotate(randomDir(this.rotatingDir))
        }
        else this.doOnimasuRotate()
    }

    beginOnimasuRotate(dir)
    {
        this.isRotating = true
        this.timer = 0
        this.initialStartedFrame = frame
        this.initialPosition = this.object.position.clone()
        this.rotatingDir = dir
        this.initialQuaternion = this.object.quaternion.clone()
        this.initialRotation = dirToInitialRotation(dir, this.object)

        this.rotationPoint = new THREE.Vector3(
            this.object.position.x + (dirToAxis(dir).z * 0.5 * dirToSameAxisPosNeg(dir)) * this.scale, 
            -.5,  
            this.object.position.z + (dirToAxis(dir).x * 0.5 * dirToSameAxisPosNeg(dir)) * this.scale
        )
        let tilePoint = new THREE.Vector3(
            this.object.position.x + (dirToAxis(dir).z * dirToSameAxisPosNeg(dir)) * this.scale, 
            -.5,  
            this.object.position.z + (dirToAxis(dir).x * dirToSameAxisPosNeg(dir)) * this.scale
        )
        //generateTestCube(this._scene, this.rotationPoint)
        spawnTile(this._scene, tilePoint , this.scale)
    }

    doOnimasuRotate()
    {
        let elapsedFrames = frame - this.initialStartedFrame
        let rotationProgress = elapsedFrames / this.rotationFrameDuration
        let additionalRotationToAdd = this.fullRotation  * dirToRotationPosNeg(this.rotatingDir) * rotationProgress
        let newRotation = this.initialRotation + additionalRotationToAdd
            
        this.setRotationAroundPoint(
            this.object,
            this.initialPosition,
            this.rotationPoint,
            newRotation,
            this.initialRotation,
            dirToAxis(this.rotatingDir),
            this.initialQuaternion
        )
        
        if(rotationProgress >= 1) 
            this.endOnimasuRotate()
    }

    endOnimasuRotate()
    {
        this.isRotating = false

        let camera
        this._scene.traverse((object) => {
            if (object.isCamera) {
                camera = object
            }
        })
        let audioListeners = camera.children.filter(c => c.type === 'AudioListener')

        let sound = new THREE.Audio( audioListeners[0] )
        sound.setBuffer( resources.onimasu.audBuffer )
        sound.setLoop( false )
        sound.setVolume( 0.5 )
        sound.play()

        this.stepCount++
    }

    setRotationAroundPoint(obj, basePos, pivot, newAngle, initialAngle, axis, initialQuaternion ) 
    {
        const deltaAngle = newAngle - initialAngle
        const deltaQuat  = new THREE.Quaternion().setFromAxisAngle(axis, deltaAngle)

        const newWorldQuat = deltaQuat.clone().multiply(initialQuaternion)

        if (obj.parent) {
            obj.parent.updateMatrixWorld(true)
            const parentWorldQuat = obj.parent.getWorldQuaternion(new THREE.Quaternion())
            const localQuat = parentWorldQuat.clone().invert().multiply(newWorldQuat)
            obj.quaternion.copy(localQuat)
        } 
        else {
            obj.quaternion.copy(newWorldQuat)
        }

        const offset = basePos.clone().sub(pivot).applyQuaternion(deltaQuat)
        obj.position.copy(pivot).add(offset)
    }
}

//This entire section is trash but im tired so
function dirToInitialRotation(dir, obj)
{
    if(dir.includes('x')) return obj.rotation.z
    if(dir.includes('z')) return obj.rotation.x
}
function dirToAxis(dir)
{
    let axis 
    if(dir.includes('x')) axis = new THREE.Vector3(0,0,1) //rot around z
    if(dir.includes('z')) axis = new THREE.Vector3(1,0,0) //rot around x
    return axis
}
function dirToSameAxisPosNeg(dir)
{
    let posNeg 
    if(dir.includes('x+')) posNeg = 1
    if(dir.includes('x-')) posNeg = -1
    if(dir.includes('z+')) posNeg = 1
    if(dir.includes('z-')) posNeg = -1
    return posNeg
}
function dirToRotationPosNeg(dir)
{
    let rotationType
    if(dir == 'x+') rotationType = -1
    if(dir == 'x-') rotationType = 1
    if(dir == 'z+') rotationType = 1
    if(dir == 'z-') rotationType = -1
    return rotationType
}
function generateTestCube(scene, pos)
{
    const fgeometry = new THREE.BoxGeometry(.2, .2, .2)
    const fmaterial = new THREE.MeshBasicMaterial({ color: 0xFF0F00  })
    const fcube = new THREE.Mesh(fgeometry, fmaterial)
    fcube.position.copy(pos)
    scene.add(fcube)
}