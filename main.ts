/**
 * MAIN
 * 
 * An audible buzzer, expected to paired with a Raspberry Pi "pegmon" alarm system.
 * 
 * Here we enable the bluetooth UART service (it's disabled by default) and set some control variables.
 */
/**
 * The alarm bacjground task. Here we make a sound every 20 seconds or so and continuously flash an exclamation mark if "buzz" is true.
 * 
 * We don't make a sound if "silent" is true, which is true if the user has hit button "B"
 */
/**
 * The "ping" background task - it just changes the idle indicator row from the top or bottom row.
 */
/**
 * When the pegmon device connects, which is usually brief for the transmission of one command, we sit reading the UART, collecting characters that form a command up to a ":" delimiter.
 * 
 * If the "command" is "buzz" we simply set the "buzz" boolean which cause the background task handling the alarm to run. We cease the alarm when if we get the "nobuzz" command and ignore everything else.
 * 
 * Th "ping" command causes the idle screen to go blank for a short period of time (if "buzz" is false).
 */
function toggleidlerow () {
    if (idlerow == 0) {
        idlerow = 4
    } else {
        idlerow = 0
    }
}
// When pegmon disconnects from us we simply set connected to false. This really has no effect at the moment, We handle it simply to indicate we know we can handle it.
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
bluetooth.onBluetoothDisconnected(function () {
    connected = false
})
/**
 * A function to clear the display, used when the device starts and after an alarm has been cleared. Just keep one LED lit, to indicate we're "awake" and have power. 
 * 
 * Each time clear is called the lit LED changes position - this helps the user gain confidence the device is being communicated with 
 * 
 * We also reset the silent flag.
 */
/**
 * If button "B" is pressed we set a control variable that silences the audible part of the alarm.
 * 
 * This essentially allows us to "acknowledge" the alarm, silencing it. The visual part of the alarm continues to operate until a command is received from pegmon.
 */
function clear () {
    led.unplot(4, 2)
    silent = false
    displayidle()
}
input.onButtonPressed(Button.B, function () {
    if (buzz) {
        silent = true
        led.plotBrightness(4, 2, lednormal)
    }
})
function displayidle () {
    led.unplot(0, 0)
    led.unplot(4, 0)
    led.unplot(0, 4)
    led.unplot(4, 4)
    led.plotBrightness(0, idlerow, lednormal)
    led.plotBrightness(4, idlerow, lednormal)
}
let silent = false
let command = ""
let ping = false
let buzz = false
let connected = false
let lednormal = 0
let idlerow = 0
bluetooth.startUartService()
idlerow = 0
lednormal = 2
let ledbuzz = 4
music.setVolume(255)
connected = false
buzz = false
ping = false
let gotping = false
clear()
/**
 * This background task monitors the ping receipts. If we don't get a ping at least one every 10 minutes we rapidly toggle the idle LEDs
 */
// The alarm loop - operating continuously in the background.
// 
// Here, if "buzz" is True we start the alarm sequence, which consists of making a warning sound and then flashing a visual symbol (an exclamation mark). We continue to do this, checking the "buzz" variable regularly, until "buzz" is false.
// 
// If "silent" is True (which is set by pressing button "B" during the alarm sequence) we silence the audible part of the alarm but continue the visual part.
// 
// We increase the brightness of the LEDs which are dimmed again (by the "clear()" function) when the alarm ceases.
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
