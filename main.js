
const { app, BrowserWindow, Menu, ipcMain, screen } = require("electron");
const robot = require('robotjs');
const iohook = require('iohook');
const fs = require('fs');
const path = require('path');

let mainWindow;
let events = [];
let isRecording = false;
let isReplaying = false;

let lastRecordedTime = 0;
const RECORD_INTERVAL = 0;


app.on('ready', () => {
    //get screen widht and height
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;

    mainWindow = new BrowserWindow({
        width: 720,
        height: 179,
        resizable: true,
        alwaysOnTop: true,
        webPreferences: {
            preload : path.join(__dirname, 'renderer.js'),
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    // Remove the menu bar
    Menu.setApplicationMenu(null);

    //set window to position bottom right
    mainWindow.setBounds({
        x: width - 720,
        y: height - 179,
        width: 720,
        height: 179,
    })

    mainWindow.loadFile('index.html')

    //prevent manual resize
    mainWindow.on('will-resize', (e) => {
        e.preventDefault();
    })
    //listen to resize
    ipcMain.on('resize-window-height', (event, cwidth, cheight) => {
        mainWindow.setSize(cwidth, cheight);
        mainWindow.setPosition(width - cwidth, height - cheight);
    })
    ipcMain.on('resize-window-revert-height', (event, cwidth, cheight) => {
        mainWindow.setSize(cwidth, cheight);
        mainWindow.setPosition(width - cwidth, height - cheight);
    })

    
    iohook.on('keydown', (event) => {
        console.log("start noting key:", event.keycode)
        if(event.keycode == 63){
                startRecording()
                mainWindow.webContents.send('f5-was-clicked', true)
                console.log("STARTED RECORDING!")
        }else if (event.keycode == 64){
                stopRecording()

                const eventLength = JSON.parse(fs.readFileSync(path.join(__dirname, 'events.json'))).length > 0 ? true : false;

                mainWindow.webContents.send('f6-was-clicked', true, eventLength)
                console.log("END RECORDING!")
        }else if (event.keycode == 62){
            console.log("EARLY TERMINATION")
            isReplaying = false;
        }
    })



    //mouse event
    ipcMain.on('start-recording', startRecording);
    ipcMain.on('stop-recording', stopRecording);
    ipcMain.on('replay-event', replayEvents);

    ipcMain.on('check-events', (event) => {
        const eventLength = JSON.parse(fs.readFileSync(path.join(__dirname, 'events.json'))).length > 0 ? true : false;

        event.sender.send("check-event-result", eventLength);
    })

    iohook.setMaxListeners(100);
    iohook.start(); // Start iohook to capture events
})

//listening mouse

function startRecording(){
    fs.writeFileSync(path.join(__dirname, 'events.json'), JSON.stringify([]));

    isRecording = true;
    console.log("Recording started...")



    //const pos = robot.getMousePos();
    //events.push({type: 'move', x:pos.x, y:pos.y, time: Date.now()});
    iohook.on('mousedown', (event) => {
        const now = Date.now();
        if(now - lastRecordedTime >= RECORD_INTERVAL){
            events.push({type: 'mousedown', x:event.x, y:event.y, time: Date.now()});
            lastRecordedTime = now;
        }
        
    })
    iohook.on('mouseup', (event) => {
        const now = Date.now();
        if(now - lastRecordedTime >= RECORD_INTERVAL){
            events.push({type: 'mouseup', x:event.x, y:event.y, time: Date.now()});
            lastRecordedTime = now;
        }
      
    })
    iohook.on('mousemove', (event) => {
        const now = Date.now();
        if(now - lastRecordedTime >= RECORD_INTERVAL){
            events.push({type: 'mousemove', x:event.x, y:event.y, time: Date.now()});
            lastRecordedTime = now;
        }
    })



}

function stopRecording(){
    isRecording = false;
    console.log("Recording stopped.")

    //iohook.removeAllListeners(); // Remove all listeners when stopping recording
    //iohook.stop(); // Stop iohook to free resources

    // Save events to a JSON file for persistence
    fs.writeFileSync(path.join(__dirname, 'events.json'), JSON.stringify(events));
    console.log("Events saved to events.json")
}

function replayEvents(){
    console.log("Replaying events...");
    const savedEvents = JSON.parse(fs.readFileSync(path.join(__dirname, 'events.json')))

    isReplaying = true;

    let startTime = savedEvents[0].time;

    function playEvents(index){
        if(!isReplaying || index >= savedEvents.length){
            console.log("Replay completed.")
            return
        }

        const event = savedEvents[index];
        const delay = event.time - startTime;
    
        setTimeout(() => {
        
            if(isReplaying){
                if(event.type === 'mousemove'){
                    robot.moveMouse(event.x, event.y)
                }else if (event.type === 'mousedown') {
                    //robot.moveMouse(event.x, event.y);
                    robot.mouseToggle('down');
                    
                }else if (event.type === 'mouseup') {
                    //robot.moveMouse(event.x, event.y);
                    robot.mouseToggle('up');
                }
            }
            playEvents(index+1)
            
        }, 0)

    }
    playEvents(0)
}


app.on('window-all-closed', () => {
    if(process.platform !== 'darwin'){
        app.quit()
    }
})
