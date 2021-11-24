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

let angles = {x: 0, y: 0, z: 0}

function setFigure(fig = figures[[Math.floor(Math.random()*figures.length)]]) {
    if (figure === fig) return setFigure()
    figure = fig
    verts = fig.vertices
    edges = fig.edges
    vertsKeys = Object.keys(verts)
    edgeKeys = Object.keys(edges)
    edgeLen = 100 * fig.scale
    if (figure.initXYZ === 90) {
        rotateX(Math.PI/2)
        angles.x = 0
        figure.initXYZ = "done"
    } else if (typeof figure.initXYZ == "object") {
        rotateX(figure.initXYZ[0])
        rotateY(figure.initXYZ[1])
        rotateZ(figure.initXYZ[2])
        angles.x = 0
        figure.initXYZ = "done"
    }
    draw()
}
setFigure(figure)


function rotateX(theta) {
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
    // angles.y += theta // don't need that
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
    // angles.z += theta // don't need that
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
        grad.addColorStop(0, `rgba(${hue},${hue},${hue},${fogFro})`)
        grad.addColorStop(1, `rgba(${hue},${hue},${hue},${fogTo})`)

        ctx.strokeStyle = grad
        ctx.beginPath()
        ctx.moveTo(fro.x, fro.y)
        ctx.lineTo(to.x, to.y)
        ctx.closePath()
        ctx.stroke()
    }
}

let darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches


function darkSwitch() {
    if (darkMode) {
        darkMode = !darkMode
        hue = 140
        document.getElementsByTagName("body")[0].style.backgroundColor = "#191919"
        draw()
    } else {
        darkMode = !darkMode
        hue = 55
        document.getElementsByTagName("body")[0].style.backgroundColor = "ivory"
        draw()
    }
}
document.getElementsByTagName("body")[0].style.transition = "none"
darkSwitch()
setTimeout(() => {
    document.getElementsByTagName("body")[0].style.transition = "background .9s ease-out"
},0) // toss it to the event loop

draw()

let mousePos = [0,0]
let isMouseMoving = false

function mouseDownListener() {
    isMouseMoving = false
}

function mouseUpListener() {
    if (!isMouseMoving) {
        setFigure()
        isMouseMoving = false
    }
}

function moveListener(e) {
    window.requestAnimationFrame(() => {
        isMouseMoving = true
        let x = (mousePos[0]-e.offsetX)/200*mSens
        let y = (mousePos[1]-e.offsetY)/200*mSens

        if (figure.lockView) {
            moveLocked(x, y)
        } else {
            rotateY(x)
            rotateX(y)
        }
        mousePos[0] = e.offsetX
        mousePos[1] = e.offsetY
    draw()
    })
}

function touchListener(e) {
    window.requestAnimationFrame(()=> {
        let x = (mousePos[0]-e.targetTouches[0].pageX)/200
        let y = (mousePos[1]-e.targetTouches[0].pageY)/200
        if (figure.lockView) {
            moveLocked(x, y)
        } else {
            rotateX(y)
            rotateY(x)
        }
        mousePos[0] = e.targetTouches[0].pageX
        mousePos[1] = e.targetTouches[0].pageY
        draw()
    })
}

function moveLocked(x, y) {
    let thatMuch = angles.x
    rotateX(-thatMuch)
    rotateY(x)
    rotateX(thatMuch)
    rotateX(y)
}

////////// mouse events ///////////////////////
document.addEventListener("mousedown", (e) => {
    mousePos[0] = e.offsetX
    mousePos[1] = e.offsetY
    document.addEventListener("mousemove", moveListener)
    document.querySelector("body").style.cursor = "grab"
    mouseDownListener()
})
document.addEventListener("mouseup", () => {
    document.removeEventListener("mousemove", moveListener)
    document.querySelector("body").style.cursor = "pointer"
    mouseUpListener()
})

///////// mobile touch screen /////////////////
document.addEventListener("touchmove", (e) => {
    touchListener(e)
}, {passive: false})
document.addEventListener("touchstart", (e) => {
    mousePos[0] = e.targetTouches[0].pageX
    mousePos[1] = e.targetTouches[0].pageY
}, {passive: false})

window.onresize = () => {
    canvas.width = document.body.clientWidth
    canvas.height = document.body.clientHeight
    screenY = canvas.height
    screenX = canvas.width
    ratio = screenX/screenY
    midX = screenX/2
    midY = screenY/2
    draw()
}
