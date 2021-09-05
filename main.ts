// A function to toggle the idle row - the row used for the idle LEDs. It's either 0 (top) or 4 (bottom)
function toggleidlerow () {
    if (idlerow == 0) {
        idlerow = 4
    } else {
        idlerow = 0
    }
}
// When the pegmon device connects, which is usually brief for the transmission of one command, we sit reading the UART, collecting characters that form a command up to a ":" delimiter.
// 
// If the "command" is "buzz" we simply set the "buzz" boolean which cause the background task handling the alarm to run. We cease the alarm when if we get the "nobuzz" command and ignore everything else.
// 
// Th "ping" command causes the idle screen to go blank for a short period of time (if "buzz" is false).
bluetooth.onBluetoothConnected(function () {
    connected = true
    while (connected) {
        command = bluetooth.uartReadUntil(serial.delimiters(Delimiters.Colon))
        if (command == "buzz") {
            buzz = true
        } else {
            if (command == "nobuzz") {
                buzz = false
            } else {
                if (command == "ping") {
                    ping = true
                }
            }
        }
    }
})
// Does nothing really, other than acknowledge that there ia s "on disconnect" event
bluetooth.onBluetoothDisconnected(function () {
    connected = false
})
// A function to clear the display, used when the device starts and after an alarm has been cleared. Just keep one LED lit, to indicate we're "awake" and have power. 
// 
// Each time clear is called the lit LED changes position - this helps the user gain confidence the device is being communicated with 
// 
// We also reset the silent flag.
function clear () {
    led.unplot(4, 2)
    silent = false
    displayidle()
}
// If button "B" is pressed we set a control variable that silences the audible part of the alarm.
// 
// This essentially allows us to "acknowledge" the alarm, silencing it. The visual part of the alarm continues to operate until a command is received from pegmon.
input.onButtonPressed(Button.B, function () {
    if (buzz) {
        silent = true
        led.plotBrightness(4, 2, lednormal)
    }
})
// A function to display the idle LEDs. These appear either on the top row or bottom, depending on the value of "idle-row"
function displayidle () {
    led.unplot(0, 0)
    led.unplot(4, 0)
    led.unplot(0, 4)
    led.unplot(4, 4)
    led.plotBrightness(0, idlerow, lednormal)
    led.plotBrightness(4, idlerow, lednormal)
}
// MAIN
// 
// An audible buzzer, expected to paired with a Raspberry Pi "pegmon" alarm system.
// 
// Here we enable the bluetooth UART service (it's disabled by default) and set some control variables.
let silent = false
let command = ""
let ping = false
let buzz = false
let connected = false
let lednormal = 0
let idlerow = 0
bluetooth.startUartService()
idlerow = 0
lednormal = 1
let ledbuzz = 64
music.setVolume(255)
connected = false
buzz = false
ping = false
let gotping = false
clear()
// The "alert" background task.
// 
// Here we make a sound every 20 seconds or so and continuously flash an exclamation mark if "buzz" is true.
// 
// We don't make a sound if "silent" is true, which is true if the user has hit button "B"
control.inBackground(function () {
    while (true) {
        if (buzz) {
            while (buzz) {
                if (!(silent)) {
                    soundExpression.giggle.play()
                }
                for (let index = 0; index < 20; index++) {
                    if (buzz) {
                        led.plotBrightness(2, 0, ledbuzz)
                        led.plotBrightness(2, 1, ledbuzz)
                        led.plotBrightness(2, 2, ledbuzz)
                        led.plotBrightness(2, 4, ledbuzz)
                        basic.pause(500)
                        led.unplot(2, 0)
                        led.unplot(2, 1)
                        led.unplot(2, 2)
                        led.unplot(2, 4)
                        basic.pause(1000)
                    } else {
                        break;
                    }
                }
            }
            clear()
        }
        basic.pause(2000)
    }
})
// The "ping" background task.
// 
// Wet just change the idle indicator row from the top or bottom row and sets the "got-ping" variable, which prevents the "lost connection" background task from runnign it's alarm.
control.inBackground(function () {
    while (true) {
        if (ping) {
            gotping = true
            ping = false
            toggleidlerow()
            displayidle()
        }
        basic.pause(2000)
    }
})
// The "lost connection" background task.
// 
// This background task monitors the ping receipts. If we don't get a ping at least one every 10 minutes we rapidly toggle the idle LEDs
control.inBackground(function () {
    while (true) {
        gotping = false
        for (let index = 0; index <= 59; index++) {
            basic.pause(10000)
        }
        while (!(gotping)) {
            toggleidlerow()
            displayidle()
            if (!(gotping)) {
                basic.pause(1000)
            }
        }
    }
})
