import * as THREE from 'three'
import {frame, speed} from './frame.js'
import {killTile} from './actorManager.js'

export default class tile {
    object 
    active = true
    id
    _material
    _initFrame 
    fadeDur = 60//in frames
    lifespan = 50//in seconds

    constructor(scene, pos, scale, id)
    {
        this.id = id
        this.generateFloorCube(scene, pos, scale)
        this._initFrame = frame
    }

    update()
    {
        let elapsedFrames = frame - this._initFrame  
        let progress = elapsedFrames / (this.fadeDur / speed)
        this._material.opacity = progress

        if(elapsedFrames > this.lifespan * (60 / speed)) {
            killTile(this.id)
        }
    }

    generateFloorCube(scene, pos, scale)
    {
        const fgeometry = new THREE.BoxGeometry(scale, .1, scale)
        this._material = new THREE.MeshBasicMaterial({ color: 0x770F00  })
        this._material.transparent = true
        this._material.opacity = 0
        this.object = new THREE.Mesh(fgeometry, this._material)
        this.object.position.copy(pos)
        scene.add(this.object)
    }
}
