const canvas = document.querySelector('#canvas');
const fade = document.querySelector('#fade');
const body = document.getElementsByTagName("body")[0]
const dark = document.querySelector('#dark')
const light = document.querySelector('#light')

const ctx = canvas.getContext('2d');
canvas.width = document.body.clientWidth;
canvas.height = document.body.clientHeight; // use this instead of stretching it in CSS
const fadeCtx = fade.getContext('2d');
fade.width = document.body.clientWidth;
fade.height = document.body.clientHeight; // use this instead of stretching it in CSS

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

//let angles = {x: 0, y: 0, z: 0}

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
        // angles.x = 0
        figure.currX = 0
        figure.initXYZ = "done"
    } else if (typeof figure.initXYZ == "object") {
        rotateX(figure.initXYZ[0])
        rotateY(figure.initXYZ[1])
        rotateZ(figure.initXYZ[2])
        // angles.x = 0
        figure.currX = 0
        figure.initXYZ = "done"
    }
    draw()
}
setFigure(figure)


function rotateX(theta) {
    figure.currX += theta
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

function darkSwitch(onLoad) {
    if (darkMode) {
        darkMode = !darkMode
        hue = 140
        body.style.backgroundColor = "#191919"
        light.style.opacity = "0"
        if (onLoad)dark.style.opacity = "1" 
        else setTimeout(()=>{dark.style.opacity = "1"},400)
    } else {
        darkMode = !darkMode
        hue = 55
        body.style.backgroundColor = "white"
        dark.style.opacity = "0"
        if (onLoad)light.style.opacity = "1" 
        else setTimeout(()=>{light.style.opacity = "1"},400)
    }
    draw()
}

body.style.transition = "none"
dark.style.transition = "none"
light.style.transition = "none"
darkSwitch(true)
setTimeout(() => {
    body.style.transition = "background .9s ease-out"
    dark.style.transition = "opacity .5s ease-in"
    light.style.transition = "opacity .5s ease-in"
},0) // toss it to the event loop

draw()

function screenFade() {
    if (!darkMode) fadeCtx.fillStyle = "#191919"
    else fadeCtx.fillStyle = "#191919" 

    fadeCtx.fillRect(0,0,canvas.width,canvas.height)
    fade.style.zIndex = 2
    fade.style.opacity = 1
    return new Promise(res=>{
        setTimeout(()=>{
            fade.style.opacity = 0
            setTimeout(()=>{fade.style.zIndex = 0},500) 
            // time must be equal to the transition time
            res()
        },500)
    })
}

let mousePos = [0,0]
let isMouseMoving = false

function mouseDownListener() {
    isMouseMoving = false
}

function mouseUpListener(e) {
    console.log(e.target.id)
    if (!isMouseMoving && !e.target.classList.contains('darklight') && e.target.id !== "fade") {
        (async function fadeScreenAndSetFigure() {
            await screenFade()
            setFigure()
        })()

    } else if (!isMouseMoving && e.target.classList.contains('darklight')) {
        darkSwitch()
    }
    isMouseMoving = false
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
    // let thatMuch = angles.x
    let thatMuch = figure.currX
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
document.addEventListener("mouseup", (e) => {
    document.removeEventListener("mousemove", moveListener)
    document.querySelector("body").style.cursor = "pointer"
    mouseUpListener(e)
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

    fade.width = document.body.clientWidth
    fade.height = document.body.clientHeight
    screenY = fade.height
    screenX = fade.width

    ratio = screenX/screenY
    midX = screenX/2
    midY = screenY/2
    draw()
}
