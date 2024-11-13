const {ipcRenderer} = require("electron");

// document.getElementById("js_layout_compact").addEventListener("click", () => {
//     document.getElementById("js_display").style.display = "none";

//     ipcRenderer.send("resize-window-height", 720, 179)

// })

// document.getElementById("js_layout_details").addEventListener("click", () => {
//     document.getElementById("js_display").style.display = "block";

//     ipcRenderer.send("resize-window-revert-height", 720, 500)

// })

ipcRenderer.on("check-event-result", (event, checkEvent) => {
    if(checkEvent){
        console.log("event is longer than 0")
        document.getElementById("js_replay").classList.add("background_color_playBtn-active");
    }else {
        console.log("event is 0")
        document.getElementById("js_replay").classList.remove("background_color_playBtn-active");
    }
})

ipcRenderer.on("f5-was-clicked", (event, state) => {
    if(state){
        document.getElementById("js_startRecording").classList.remove("background_color_recordBtn-active")
        document.getElementById("js_startRecording").classList.add("background_color_recordBtn-recording")
        document.getElementById("js_stopRecording").classList.add("background_color_stopBtn-active")
    }
})

ipcRenderer.on("f6-was-clicked", (event, state, eventLength) => {
    if(state){
        document.getElementById("js_stopRecording").classList.remove("background_color_stopBtn-active")
        document.getElementById("js_startRecording").classList.remove("background_color_recordBtn-recording")
        document.getElementById("js_startRecording").classList.add("background_color_recordBtn-active")
    }
    if(eventLength){
        console.log("event is longer than 0")
        document.getElementById("js_replay").classList.add("background_color_playBtn-active");
    }else {
        console.log("event is 0")
        document.getElementById("js_replay").classList.remove("background_color_playBtn-active");
    }
})


//default active buttons
//start recording should be active as default
//play & stop should not be active 
//stop should be active when start recording clicked or started
//play should be active when we have some events.json recording
document.getElementById("js_startRecording").classList.add("background_color_recordBtn-active")


document.getElementById("js_startRecording").addEventListener("click", () => {
    ipcRenderer.send("start-recording")
    document.getElementById("js_startRecording").classList.remove("background_color_recordBtn-active")
    document.getElementById("js_startRecording").classList.add("background_color_recordBtn-recording")

    document.getElementById("js_stopRecording").classList.add("background_color_stopBtn-active")
})
document.getElementById("js_stopRecording").addEventListener("click", () => {
    ipcRenderer.send("stop-recording")
    ipcRenderer.send("check-events");
    document.getElementById("js_stopRecording").classList.remove("background_color_stopBtn-active")
    document.getElementById("js_startRecording").classList.remove("background_color_recordBtn-recording")
    document.getElementById("js_startRecording").classList.add("background_color_recordBtn-active")
})

document.getElementById("js_replay").addEventListener("click", () => {
    ipcRenderer.send("replay-event")
})