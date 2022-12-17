enum PingUnit {
    //% block="μs"
    MicroSeconds,
    //% block="cm"
    Centimeters,
    //% block="inches"
    Inches
}

/**
 * Funbit and ping utilities
 */
//% color="#2c3e50" weight=10
namespace Funbit {
    /**
     * Send a ping and get the echo time (in microseconds) as a result
     * @param trig tigger pin
     * @param echo echo pin
     * @param unit desired conversion unit
     * @param maxCmDistance maximum distance in centimeters (default is 500)
     */
    let IR_Val = 0
    //% blockId=Funbit_ping block="ping trig %trig|echo %echo|unit %unit"
    export function ping(trig: DigitalPin, echo: DigitalPin, unit: PingUnit, maxCmDistance = 500): number {
        // send pulse
        pins.setPull(trig, PinPullMode.PullNone);
        pins.digitalWritePin(trig, 0);
        control.waitMicros(2);
        pins.digitalWritePin(trig, 1);
        control.waitMicros(10);
        pins.digitalWritePin(trig, 0);

        // read pulse
        const d = pins.pulseIn(echo, PulseValue.High, maxCmDistance * 58);

        switch (unit) {
            case PingUnit.Centimeters: return Math.idiv(d, 58);
            case PingUnit.Inches: return Math.idiv(d, 148);
            default: return d;
        }
    }
    /**
     * IR controller button
     */
    export enum IRButtons {
        //% blcok="Menu"
        Menu = 2,
        //% blcok="Up"
        Up = 5,
        //% blcok="Left"
        Left = 8,
        //% blcok="Right"
        Right = 10,
        //% blcok="Down"
        Down = 13,
        //% blcok="OK"
        OK = 9,
        //% blcok="Plus"
        Plus = 4,
        //% blcok="Minus"
        Minus = 12,
        //% blcok="Back"
        Back = 6,
        //% block="0"
        Zero = 14,
        //% block="1"
        One = 16,
        //% block="2"
        Two = 17,
        //% block="3"
        Three = 18,
        //% block="4"
        Four = 20,
        //% block="5"
        Five = 21,
        //% block="6"
        Six = 22,
        //% block="7"
        Seven = 24,
        //% block="8"
        Eight = 25,
        //% block="9"
        Nine = 26
    }

    //% shim=FunbitIR::irCode
    function irCode(): number {
        return 0;
    }
    //% weight=25
    //% block="On IR receiving"
    export function IR_callback(handler: () => void) {
        pins.setPull(DigitalPin.P16, PinPullMode.PullUp)
        control.onEvent(98, 3500, handler)
        control.inBackground(() => {
            while (true) {
                IR_Val = irCode()
                if (IR_Val != 0xff00) {
                    control.raiseEvent(98, 3500, EventCreationMode.CreateAndFire)
                }
                basic.pause(20)
            }
        })
    }
    /**
     * TODO: Get IR value
     */
    //% block="IR Button %Button is pressed"
    //% weight=15
    export function IR_Button(Button: IRButtons): boolean {
        return (IR_Val & 0x00ff) == Button
    }

}
