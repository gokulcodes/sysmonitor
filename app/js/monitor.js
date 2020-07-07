const path = require('path')
const { ipcRenderer } = require("electron")
const osu = require('node-os-utils');
const cpu = osu.cpu;
const mem = osu.mem;
const os = osu.os;

let cpuOverload
let alertFrequency

ipcRenderer.on("settings:get", (e, settings) => {
    cpuOverload = +settings.cpuOverload
    alertFrequency = +settings.alertFrequency
})

setInterval(() => {
    cpu.usage().then(info => {
        document.querySelector("#cpu-usage").innerHTML = info + "%";
        document.querySelector("#cpu-progress").style.width = info + "%"
        if(info >= cpuOverload){
        document.querySelector("#cpu-progress").style.background = "red"
        }else{
        document.querySelector("#cpu-progress").style.background = "#30c88b"
        }

        if(info >= cpuOverload && runNotify(alertFrequency)){
            notifyuser({
                title: "Cpu Overload",
                body: `CPU is over ${cpuOverload}`,
                icon: path.join(__dirname, "img", "icon.png")
            })

            localStorage.setItem("lastNotify", +new Date())
        }
    })
    cpu.free().then(info => {
        document.querySelector("#cpu-free").innerHTML = info + "%"
    })
    document.querySelector("#sys-uptime").innerHTML = secondstoDHMS(os.uptime())
}, 2000)


document.querySelector('#cpu-model').innerHTML = cpu.model()

document.querySelector('#comp-name').innerHTML = os.hostname()

document.querySelector("#os").innerHTML = `${os.type()} ${os.arch()}`


mem.info().then((info) => {
        document.querySelector("#mem-total").innerHTML = info.totalMemMb
        document.querySelector("#used-mem").innerHTML = info.usedMemMb
})


function secondstoDHMS(seconds){
    seconds = +seconds
    const d = Math.floor((seconds / (3600 * 24)))
    const h = Math.floor((seconds % (3600 *24)) / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = Math.floor(seconds % 60)
    return `${d}d ${h}h ${m}m ${s}s`
}

function notifyuser(options){
    new Notification(options.title, options)
}

function runNotify(freq){
    if (localStorage.getItem("lastNotify") === null){
        localStorage.setItem("lastNotify", +new Date()) 
        return true
    }

    const notifyTime = new Date(parseInt(localStorage.getItem("lastNotify")))
    const now = new Date()
    const diffTime = Math.abs(now - notifyTime)
    const minutesPassed = Math.ceil(diffTime / (1000 * 60))

    if(minutesPassed > freq) {
        return true
    }else{
        return false
    }
}