const Gpio = require('pigpio').Gpio;

/**
 * RGB light interface
 */
class Lights {

    /**
     * Constructor
     * @param redGpioPort GPIO pin corresponding to the red LED
     */
    constructor(ledPorts) {
        this.leds = []
        ledPorts.forEach(port => {
            this.leds.push(new Gpio(port.gpio,  {mode: Gpio.OUTPUT}))
        });
        this.flashTimer = null;
        this.flashStateIsOn = false;
    }

    /**
     * Start flashing a given color at a given frequency. LED will continue to flash until
     * the program stops, {@link stopFlashing} is called, or one of the specific color methods are
     * called, including {@link off}. {@link pwmWrite} and {@link write} do NOT stop flashing.
     * @param brightness PWM value to flash for the LED
     * @param frequency Frequency in milliseconds to flash the LEDs at.
     */
    startFlashing(brightness, frequency) {
        this.stopFlashing();

        this.flashTimer = setInterval(() => {
            if(this.flashStateIsOn) {
                this.pwmWrite(0);
            } else {
                this.pwmWrite(brightness);
            }

            this.flashStateIsOn = !this.flashStateIsOn;
        }, frequency);
    }

    /**
     * Stop the flashing interval
     */
    stopFlashing() {
        if(this.flashTimer != null) {
            clearInterval(this.flashTimer);
            this.flashTimer = null;
        }
    }

    /**
     * Turn off all three LEDs
     */
    off() {
        this.stopFlashing();
        this.leds.forEach(led => {
            led.digitalWrite(0);
        })
    }

    ledOn(index){
        this.stopFlashing();
        this.leds[index].digitalWrite(1); 
    }

    ledOff(index){
        this.stopFlashing();
        this.leds[index].digitalWrite(0); 
    }

    pwmWrite(value) {
        this.leds.forEach(led => {
            led.pwmWrite(value);
        }); 
    }
}

module.exports = Lights;
