/**
 * Product Name: Funbit 
 * Copyright (c) Shenzhen Hengjiaan Technology Co., Ltd
 * 
 * Support email:  support@haljia.com
 */
//% color="#6167d5" weight=10 icon="\uf0d1"
namespace Funbit {
    const ADDR = 0x10
    const CMD_MOTOR = 0x10
    const CMD_ALL = 0xFF
    const CMD_STOP = 0x00
    const CMD_SERVO = 0x11
    const CMD_RGBLED = 0x12
    /**
     * Send a ping and get the echo time (in microseconds) as a result
     * @param trig tigger pin
     * @param echo echo pin
     * @param unit desired conversion unit
     * @param maxCmDistance maximum distance in centimeters (default is 500)
     */
    let IR_Val = 0

    export enum PingUnit {
        //% blockId="Centimeters" block="Centimeters"
        Centimeters = 1,
        //% blockId="Inches" block="Inches"
        Inches = 2
    }

    //% blockId=Funbit_ping block="Ultrasonic trig %trig|echo %echo|unit %unit"
    //% inlineInputMode=inline
    export function Funbit_ping(trig: DigitalPin, echo: DigitalPin, unit: PingUnit, maxCmDistance = 500): number {
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
        //% blockId="Up1" blcok="Up1"
        Up = 5,
        //% blockId="Left1" blcok="Left1"
        Left = 8,
        //% blockId="Right1" blcok="Right1"
        Right = 10,
        //% blockId="Down1" blcok="Down1"
        Down = 13,
        //% blockId="OK" blcok="OK"
        OK = 9,
        //% blockId="Plus" blcok="Plus"
        Plus = 4,
        //% blockId="Minus" blcok="Minus"
        Minus = 12,
        //% blockId="Back" blcok="Back"
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
    /**
     * The user selects the 4-way dc motor.
     */
    export enum Motors {
        M1 = 0x1,
        M2 = 0x2,
        M3 = 0x3,
        M4 = 0x4
    }

    export enum Dirs {
        //% blockId="Forward" block="Forward"
        Forward = 0x1,
        //% blockId="Backward" block="Backward"
        Backward = 0x2
    }

    export enum Servos {
        S1 = 0x1,
        S2 = 0x2,
        S3 = 0x3,
        S4 = 0x4,
        S5 = 0x5,
        S6 = 0x6,
        S7 = 0x7,
        S8 = 0x8
    }

    export enum LEDMODE {
        //% block="ON"
        ON = 0x1,
        //% block="Blinking"
        Blinking = 0x2
    }

    /**
     * Execute a motor
     * M1~M4.
     * speed(0~255).
    */
    //% weight=90
    //% blockId=FunbitMotorStart block="Motor|%index|dir|%Dirs|speed|%speed"
    //% speed.min=0 speed.max=255 speed.defl=200
    //% index.fieldEditor="gridpicker" index.fieldOptions.columns=2
    //% direction.fieldEditor="gridpicker" direction.fieldOptions.columns=2
    export function FunbitMotorStart(index: Motors, direction: Dirs, speed: number): void {
        let buf = pins.createBuffer(4);
        buf[0] = CMD_MOTOR;
        buf[1] = index;
        buf[2] = direction;
        buf[3] = speed;
        pins.i2cWriteBuffer(ADDR, buf);
    }

    //% weight=89
    //% blockId=FunbitMotorStop block="Motor Stop|%index"
    //% index.fieldEditor="gridpicker" index.fieldOptions.columns=2
    export function FunbitMotorStop(index: Motors): void {
        let buf = pins.createBuffer(4);
        buf[0] = CMD_MOTOR;
        buf[1] = index;
        buf[2] = CMD_STOP; //stop
        buf[3] = 0x00;
        pins.i2cWriteBuffer(ADDR, buf);
    }

    //% weight=87
    //% blockId=FunbitMotorStopAll block="Motor StopAll"
    export function FunbitMotorStopAll(): void {
        let buf = pins.createBuffer(4);
        buf[0] = CMD_MOTOR;
        buf[1] = CMD_ALL;
        buf[2] = CMD_STOP; //stop
        buf[3] = 0x00;
        pins.i2cWriteBuffer(ADDR, buf);
    }

    //% weight=86
    //% blockId=FunbitServoStart block="Servo|%index|degree|%degree"
    //% degree.min=0 degree.max=180
    //% index.fieldEditor="gridpicker" index.fieldOptions.columns=2
    export function FunbitServoStart(index: Servos, degree: number): void {
        let buf = pins.createBuffer(4);
        buf[0] = CMD_SERVO;
        buf[1] = index;
        buf[2] = degree;
        buf[3] = 0x00;
        pins.i2cWriteBuffer(ADDR, buf);
    }


    //% weight=85
    //% inlineInputMode=inline
    //% blockId=FunbitRGBLED block="LED%LEDMODE Red%red Green%green Blue%blue"
    //% red.min=0 red.max=255
    //% green.min=0 green.max=255
    //% blue.min=0 blue.max=255
    //% mode.fieldEditor="gridpicker" mode.fieldOptions.columns=2
    export function FunbitRGBLED(mode: LEDMODE, red: number, green: number, blue: number): void {
        let buf = pins.createBuffer(5);
        buf[0] = CMD_RGBLED;
        buf[1] = red;
        buf[2] = green;
        buf[3] = blue;
        buf[4] = mode;
        pins.i2cWriteBuffer(ADDR, buf);
    }

    //% weight=83
    //% blockId=FunbitRGBLEDOFF block="RGB LED OFF"
    export function FunbitRGBLEDOFF(): void {
        let buf = pins.createBuffer(5);
        buf[0] = CMD_RGBLED;
        buf[1] = 0;
        buf[2] = 0;
        buf[3] = 0;
        buf[4] = 0;  //off
        pins.i2cWriteBuffer(ADDR, buf);
    }

}
