
import { ColladaLoader } from 'three/addons/loaders/ColladaLoader.js'
import * as THREE from 'three'

export let resources = {
    onimasu: {
        object: undefined,
        audBuffer: undefined
    }
}

export async function importCollada()
{
    return new Promise(res=>{
        const loader = new ColladaLoader()
        loader.load('onimasu/Onimasu.dae', (collada) => {
            resources.onimasu.object = collada.scene

            let model = resources.onimasu.object
            model.traverse(child => {
                if (child.isMesh) {
                    child.geometry.computeVertexNormals()
                    child.geometry.attributes.normal.needsUpdate = true
                    child.castShadow = true
                    child.receiveShadow = true
    child.material.side = THREE.DoubleSide // helps with thin parts

                }
            })

            res()
        }, undefined, (error) => {
            console.error('error loading collada:', error)
        })
    })
}

export async function importAudio()
{
    const audioLoader = new THREE.AudioLoader()

    return new Promise(res=>{
        audioLoader.load( 'onimasu/rotate.mp3', function( buffer ) {
            resources.onimasu.audBuffer = buffer
            res()
        })
    })
}

export function randomDir(lastDir) {
    const dirs = ['x+', 'x-', 'z+']//z-

    if(lastDir) {
        const beh = dirs.indexOf(oppositeDir(lastDir))
        if (beh > -1) dirs.splice(beh, 1)
    }

    const index = Math.floor(Math.random() * dirs.length)
    return dirs[index]
}

function oppositeDir(dir)
{
    let opposite 
    if(dir.includes('+')) opposite = dir.replace('+','-')
    else opposite = dir.replace('-','+')

    return opposite
}