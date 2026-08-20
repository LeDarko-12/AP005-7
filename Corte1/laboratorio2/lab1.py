from machine import Pin
from time import sleep

led = Pin(2, Pin.OUT)

for i in range(5):
    led.on()
    sleep(0.5)
    led.off()
    sleep(0.5)

led.off()

