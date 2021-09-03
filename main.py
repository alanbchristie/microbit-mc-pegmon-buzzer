"""

MAIN

An audible buzzer, expected to paired with a Raspberry Pi "pegmon" alarm system.

Here we enable the bluetooth UART service (it's disabled by default) and set some control variables.

"""
"""

A function to clear the display, used when the device starts and after an alarm has been cleared. Just keep one LED lit, to indicate we're "awake" and have power.

We also reset the silent flag.

"""
"""

If button "B" is pressed we set a control variable that silences the audible part of the alarm.

This essentially allows us to "acknowledge" the alarm, silencing it. The visual part of the alarm continues to operate until a command is received from pegmon.

"""
"""

When the pegmon device connects, which is usually brief for the transmission of one command, we sit reading the UART, collecting characters that form a command up to a ":" delimiter. If the "command" is "buzz" we simply set the "buzz" boolean. Any other command results in the "buzz" being cleared.

"""
"""

When pegmon disconnects from us we simply set connected to false. This really has no effect at the moment, We handle it simply to indicate we know we can handle it.

"""

def on_bluetooth_connected():
    global connected, command, buzz
    connected = True
    while connected:
        command = bluetooth.uart_read_until(serial.delimiters(Delimiters.COLON))
        if command == "buzz":
            buzz = True
        else:
            buzz = False
bluetooth.on_bluetooth_connected(on_bluetooth_connected)

def on_bluetooth_disconnected():
    global connected
    connected = False
bluetooth.on_bluetooth_disconnected(on_bluetooth_disconnected)

def clear():
    global silent
    silent = False
    led.set_brightness(4)
    basic.show_leds("""
        . . . . .
                . . . . .
                . . # . .
                . . . . .
                . . . . .
    """)

def on_button_pressed_b():
    global silent
    if buzz:
        silent = True
input.on_button_pressed(Button.B, on_button_pressed_b)

silent = False
command = ""
buzz = False
connected = False
bluetooth.start_uart_service()
music.set_volume(255)
connected = False
buzz = False
clear()
"""

The alarm loop - operating continuously in the background.

Here, if "buzz" is True we start the alarm sequence, which consists of making a warning sound and then flashing a visual symbol (an exclamation mark). We continue to do this, checking the "buzz" variable regularly, until "buzz" is false.

If "silent" is True (which is set by pressing button "B" during the alarm sequence) we silence the audible part of the alarm but continue the visual part.

We increase the brightness of the LEDs which are dimmed again (by the "clear()" function) when the alarm ceases.

"""

def on_in_background():
    while True:
        if buzz:
            led.set_brightness(32)
            while buzz:
                if not (silent):
                    soundExpression.giggle.play()
                for index in range(20):
                    if buzz:
                        basic.show_leds("""
                            . . # . .
                                                        . . # . .
                                                        . . # . .
                                                        . . . . .
                                                        . . # . .
                        """)
                        basic.pause(500)
                        basic.show_leds("""
                            . . . . .
                                                        . . . . .
                                                        . . . . .
                                                        . . . . .
                                                        . . . . .
                        """)
                        basic.pause(500)
                    else:
                        break
            clear()
        basic.pause(1000)
control.in_background(on_in_background)
