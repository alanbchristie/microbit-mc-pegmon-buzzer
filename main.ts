/**
 * MAIN
 * 
 * An audible buzzer, expected to paired with a Raspberry Pi "pegmon" alarm system.
 * 
 * Here we enable the bluetooth UART service (it's disabled by default) and set some control variables.
 */
/**
 * A function to clear the display, used when the device starts and after an alarm has been cleared. Just keep one LED lit, to indicate we're "awake" and have power.
 * 
 * We also reset the silent flag.
 */
/**
 * When the pegmon device connects, which is usually brief for the transmission of one command, we sit reading the UART, collecting characters that form a command up to a ":" delimiter. If the "command" is "buzz" we simply set the "buzz" boolean. We cease the alarm when if we get the "nobuzz" command and ignore everything else.
 */
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
            }
        }
    }
})
bluetooth.onBluetoothDisconnected(function () {
    connected = false
})
/**
 * If button "B" is pressed we set a control variable that silences the audible part of the alarm.
 * 
 * This essentially allows us to "acknowledge" the alarm, silencing it. The visual part of the alarm continues to operate until a command is received from pegmon.
 */
function clear () {
    silent = false
    led.setBrightness(4)
    basic.showLeds(`
        . . . . .
        . . . . .
        . . # . .
        . . . . .
        . . . . .
        `)
}
input.onButtonPressed(Button.B, function () {
    if (buzz) {
        silent = true
    }
})
let silent = false
let command = ""
let buzz = false
let connected = false
bluetooth.startUartService()
music.setVolume(255)
connected = false
buzz = false
clear()
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
            led.setBrightness(32)
            while (buzz) {
                if (!(silent)) {
                    soundExpression.giggle.play()
                }
                for (let index = 0; index < 20; index++) {
                    if (buzz) {
                        basic.showLeds(`
                            . . # . .
                            . . # . .
                            . . # . .
                            . . . . .
                            . . # . .
                            `)
                        basic.pause(500)
                        basic.showLeds(`
                            . . . . .
                            . . . . .
                            . . . . .
                            . . . . .
                            . . . . .
                            `)
                        basic.pause(500)
                    } else {
                        break;
                    }
                }
            }
            clear()
        }
        basic.pause(1000)
    }
})
