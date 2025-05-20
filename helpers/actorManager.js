import Onimasu from './onimasu.js'
import Tile from './tile.js'

let tilesSpawned = 0

export let actors = {
    onimasu: [],
    tile: []
}

export function spawnOnimasu(scene, model)
{
    let actor = new Onimasu(scene, model)
    actors.onimasu.push(actor)
    return actor
}
export function spawnTile(scene, pos, scale)
{
    tilesSpawned++
    let actor = new Tile(scene, pos, scale, tilesSpawned)
    actors.tile.push(actor)
    return actor
}
export function killTile(id)
{
    let indexOf = actors.tile.findIndex(item => item.id == id)
    let tile = actors.tile[indexOf]

    tile.object.removeFromParent()
    actors.tile.splice(indexOf,1)
}