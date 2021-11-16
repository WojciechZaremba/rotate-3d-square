const canvas = document.querySelector('#canvas');
const ctx = canvas.getContext('2d');
canvas.width = document.body.clientWidth;
canvas.height = document.body.clientHeight; // use this instead of stretching it in CSS

let screenY = canvas.height
let screenX = canvas.width
let ratio = screenX/screenY

let midX = screenX/2
let midY = screenY/2

let edgeLen = 100

let mSens = 100

const verts = {
    0: [-1,-1,-1],
    1: [-1, 1,-1],
    2: [ 1, 1,-1],
    3: [ 1,-1,-1],
    4: [-1,-1, 1],
    5: [-1, 1, 1],
    6: [ 1, 1, 1],
    7: [ 1,-1, 1],
}
const edges = {
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
const vertsKeys = Object.keys(verts)
const edgeKeys = Object.keys(edges)

function rotateX(theta) {
    const sinTheta = Math.sin(theta)
    const cosTheta = Math.cos(theta)

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
    const sinTheta = Math.sin(theta)
    const cosTheta = Math.cos(theta)

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
            y: verts[edges[key][0]][1]
        }
        let to = {
            x: verts[edges[key][1]][0],
            y: verts[edges[key][1]][1]
        }

        fro.x = fro.x * edgeLen + midX
        fro.y = fro.y * edgeLen + midY

        to.x = to.x * edgeLen + midX
        to.y = to.y * edgeLen + midY

        ctx.beginPath()

        ctx.moveTo(fro.x, fro.y)
        ctx.lineTo(to.x, to.y)

        ctx.closePath()
        ctx.stroke()
    }
}

rotateX(-.2)
rotateY(.3)
rotateZ(.005)
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
    canvas.height = document.body.clientHeight; // use this instead of stretching it in CSS

    screenY = canvas.height
    screenX = canvas.width
    ratio = screenX/screenY

    midX = screenX/2
    midY = screenY/2

    draw()
}