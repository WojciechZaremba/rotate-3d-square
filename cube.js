const canvas = document.querySelector('#canvas');
const ctx = canvas.getContext('2d');
canvas.width = document.body.clientWidth;
canvas.height = document.body.clientHeight; // use this instead of stretching it in CSS

let screenY = canvas.height
let screenX = canvas.width
// let ratio = screenX/screenY
// unused

let midX = screenX/2
let midY = screenY/2

// maybe those will be modifiable in the future:
let edgeLen = 100
let mSens = 1
let fog = .4
let hue = 55

/////////// CUBE ///////////
const cube = {
    vertices: {
        0: [-1,-1,-1],
        1: [-1, 1,-1],
        2: [ 1, 1,-1],
        3: [ 1,-1,-1],
        4: [-1,-1, 1],
        5: [-1, 1, 1],
        6: [ 1, 1, 1],
        7: [ 1,-1, 1],
    },
    edges: {
        0: [0,1],
        1: [0,3],
        2: [0,4],
        3: [2,1],
        4: [2,3],
        5: [2,6],
        6: [5,1],
        7: [5,4],
        8: [5,6],
        9: [7,3],
        10: [7,4],
        11: [7,6],
    }
}

///////// PIRAMIDE /////////
const piramideFaceHeight = Math.sqrt(Math.pow(2,2) - Math.pow(1,2))
const piramideHeight = Math.sqrt(Math.pow(2,2) - Math.pow(piramideFaceHeight*2/3,2))
const piramide = {
    vertices: {
        0: [-1,
            -piramideFaceHeight / 3,
            -piramideHeight / 3],
        1: [ 0, 
            piramideFaceHeight * 2 / 3,
            -piramideHeight / 3],
        2: [ 1, 
            -piramideFaceHeight / 3,
            -piramideHeight / 3],
        3: [ 0, 0, piramideHeight * 2 / 3],
    },
    edges: {
        0: [0,1],
        1: [0,2],
        2: [0,3],
        3: [1,2],
        4: [1,3],
        5: [2,3],
    }
}

/////////// PAPER //////////
const paper = {vertices: {}, edges: {}}
let meridians = 4
let longitudes = 5
let wrinkle = {x: 1, y: 1}
let paperCorner = [0 - (longitudes - 2) / 2, meridians / 2]

for (let i = 0; i < longitudes; i++) {
    for (let j = 0; j < meridians; j++) {
        let x = paperCorner[0]
        let y = paperCorner[1]
        paper.vertices[j + i * meridians] = [x, y, Math.random() / 6]
        paperCorner[0] += wrinkle.x
    }
    paperCorner[0] = -1.5
    paperCorner[1] -= 1
}


let figure = piramide

let verts = figure.vertices
let edges = figure.edges
let vertsKeys = Object.keys(verts)
let edgeKeys = Object.keys(edges)

function rotateX(theta) {
    const sinTheta = Math.sin(-theta)
    const cosTheta = Math.cos(-theta)

    for (let key of vertsKeys) {
        let vertex = verts[key]
        let y = vertex[1]
        let z = vertex[2]
        
        vertex[1] = y * cosTheta + z * sinTheta
        vertex[2] = z * cosTheta - y * sinTheta
    }
    draw()
}

function rotateY(theta) {
    const sinTheta = Math.sin(-theta)
    const cosTheta = Math.cos(-theta)

    for (let key of vertsKeys) {
        let vertex = verts[key]
        let x = vertex[0]
        let z = vertex[2]

        vertex[0] = x * cosTheta + z * sinTheta
        vertex[2] = z * cosTheta - x * sinTheta
    }
    draw()
}

function rotateZ(theta) {
    const sinTheta = Math.sin(theta)
    const cosTheta = Math.cos(theta)

    for (let key of vertsKeys) {
        let vertex = verts[key]
        let x = vertex[0]
        let y = vertex[1]

        vertex[0] = x * cosTheta + y * sinTheta
        vertex[1] = y * cosTheta - x * sinTheta
    }
    draw()
}


function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.lineWidth = 4
    for (let key of edgeKeys) {
        let fro = {
            x: verts[edges[key][0]][0],
            y: verts[edges[key][0]][1],
            z: verts[edges[key][0]][2]
        }
        let to = {
            x: verts[edges[key][1]][0],
            y: verts[edges[key][1]][1],
            z: verts[edges[key][1]][2],
        }
        
        fro.x = fro.x * edgeLen + midX
        fro.y = fro.y * edgeLen + midY
        
        to.x = to.x * edgeLen + midX
        to.y = to.y * edgeLen + midY
        
        let grad = ctx.createLinearGradient(fro.x, fro.y, to.x, to.y)

        let fogFro = (fro.z + 2) / 2 + fog
        let fogTo = (to.z + 2) / 2 + fog
        grad.addColorStop(0, `rgba(${hue},${hue},${hue},${fogFro})`);
        grad.addColorStop(1, `rgba(${hue},${hue},${hue},${fogTo})`);
        ctx.strokeStyle = grad

        ctx.beginPath()
        
        ctx.moveTo(fro.x, fro.y)
        ctx.lineTo(to.x, to.y)

        ctx.closePath()
        ctx.stroke()
    }
}

rotateX(.9)
rotateY(.3)
rotateZ(-.1)
draw()

let mousePos = [0,0]

function moveListener(e) {
    rotateY((mousePos[0]-e.offsetX)/200*mSens)
    rotateX((mousePos[1]-e.offsetY)/200*mSens)
    
    mousePos[0] = e.offsetX
    mousePos[1] = e.offsetY
}

document.addEventListener("mousedown", (e) => {
    mousePos[0] = e.offsetX
    mousePos[1] = e.offsetY
    document.addEventListener("mousemove", moveListener)
    document.querySelector("body").style.cursor = "grab";
})
document.addEventListener("mouseup", () => {
    document.removeEventListener("mousemove", moveListener)
    document.querySelector("body").style.cursor = "pointer";
})

window.onresize = () => {
    canvas.width = document.body.clientWidth;
    canvas.height = document.body.clientHeight;

    screenY = canvas.height
    screenX = canvas.width
    ratio = screenX/screenY

    midX = screenX/2
    midY = screenY/2

    draw()
}