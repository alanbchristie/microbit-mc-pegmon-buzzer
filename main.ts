bluetooth.onUartDataReceived(serial.delimiters(Delimiters.Colon), function () {
	
})
input.onButtonPressed(Button.A, function () {
    if (buzz) {
        buzz = false
    } else {
        buzz = true
    }
})
function clear () {
    silent = false
    led.setBrightness(64)
    basic.showLeds(`
        . . . . .
        . . . . .
        . . # . .
        . . . . .
        . . . . .
        `)
}
input.onButtonPressed(Button.B, function () {
    silent = true
})
let silent = false
let buzz = false
music.setVolume(64)
buzz = false
clear()
control.inBackground(function () {
    while (true) {
        if (buzz) {
            led.setBrightness(195)
            while (buzz) {
                if (!(silent)) {
                    soundExpression.giggle.play()
                }
                basic.showString("ALARM")
                for (let index = 0; index <= 9; index++) {
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
