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
let fog = -.2
let hue = 55

let figure = figures[[Math.floor(Math.random()*figures.length)]]

let verts = figure.vertices
let edges = figure.edges
let vertsKeys = Object.keys(verts)
let edgeKeys = Object.keys(edges)
edgeLen = 100 * figure.scale

function setFigure(figure) {
    figure = figure
    verts = figure.vertices
    edges = figure.edges
    vertsKeys = Object.keys(verts)
    edgeKeys = Object.keys(edges)
    edgeLen = 100 * figure.scale
    draw()
}

let angles = {
    x: 0,
    y: 0,
    z: 0
}

///
setFigure(head)
rotateX(Math.PI/2)
angles.x = 0
rotateX(-Math.PI/2)

let ang = .5
// rotateY(ang)
// rotateZ(-Math.sin(angles.x)*ang)
// rotateX(-Math.cos(anglex.x)*ang)

// let a = setInterval(()=>{
//     rotateY(ang)
//     rotateZ(-Math.PI/2)
//     rotateX(ang)

//     draw()
// },32)


function rotateX(theta) {
    //console.log(theta)
    angles.x += theta
    const sinTheta = Math.sin(-theta)
    const cosTheta = Math.cos(-theta)

    for (let key of vertsKeys) {
        let vertex = verts[key]
        let y = vertex[1]
        let z = vertex[2]
        
        vertex[1] = y * cosTheta + z * sinTheta
        vertex[2] = z * cosTheta - y * sinTheta
    }
}

function rotateY(theta) {
    angles.y += theta
    const sinTheta = Math.sin(-theta)
    const cosTheta = Math.cos(-theta)

    for (let key of vertsKeys) {
        let vertex = verts[key]
        let x = vertex[0]
        let z = vertex[2]

        vertex[0] = x * cosTheta + z * sinTheta
        vertex[2] = z * cosTheta - x * sinTheta
    }
}

function rotateZ(theta) {
    angles.z += theta
    const sinTheta = Math.sin(theta)
    const cosTheta = Math.cos(theta)

    for (let key of vertsKeys) {
        let vertex = verts[key]
        let x = vertex[0]
        let y = vertex[1]

        vertex[0] = x * cosTheta + y * sinTheta
        vertex[1] = y * cosTheta - x * sinTheta
    }
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
            z: verts[edges[key][1]][2]
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

// rotateX(.9)
// rotateY(.3)
// rotateZ(-.1)
draw()

let mousePos = [0,0]

function moveListener(e) {
    rotateY((mousePos[0]-e.offsetX)/200*mSens)
    rotateX((mousePos[1]-e.offsetY)/200*mSens)
    
    mousePos[0] = e.offsetX
    mousePos[1] = e.offsetY

    draw()
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