/**
 * Product Name: Funbit 
 * Copyright (c) Shenzhen Hengjiaan Technology Co., Ltd
 * 
 * Support email:  support@haljia.com
 */
//% color="#6167d5" weight=20 icon="\uf0d1"
namespace Funbit {
    const ADDR = 0x10
    const CMD_MOTOR = 0x10
    const CMD_ALL = 0xFF
    const CMD_STOP = 0x00
    const CMD_SERVO = 0x11
    const CMD_RGBLED = 0x12
    const CMD_STEPPERMOTOR28 = 0x19
    /**
     * Send a ping and get the echo time (in microseconds) as a result
     * @param trig tigger pin
     * @param echo echo pin
     * @param unit desired conversion unit
     * @param maxCmDistance maximum distance in centimeters (default is 500)
     */

    export enum PingUnit {
        //% blockId="Centimeters" block="Centimeters"
        Centimeters = 1,
        //% blockId="Inches" block="Inches"
        Inches = 2
    }

    //% weight=91
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
    //% weight=99
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

    //% weight=98
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

    //% weight=97
    //% blockId=FunbitMotorStopAll block="Motor Stop All"
    export function FunbitMotorStopAll(): void {
        let buf = pins.createBuffer(4);
        buf[0] = CMD_MOTOR;
        buf[1] = CMD_ALL;
        buf[2] = CMD_STOP; //stop
        buf[3] = 0x00;
        pins.i2cWriteBuffer(ADDR, buf);
    }

    //% weight=96
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


    //% weight=95
    //% inlineInputMode=inline
    //% blockId=FunbitRGBLED block="RGB LED%LEDMODE Red%red Green%green Blue%blue"
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

    //% weight=93
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

    export enum position 
    {
        //% blockId="LeftSide" block="Left side"
        LeftSide = 0,
        //% blockId="RightSide" block="Right side"
        RightSide = 1
    }

    export enum line
    {
        //% blockId="White" block="White Line"
        White = 0,
        //% blockId="Black" block="Black Line"
        Black = 1
    }

    //% blockId=Tracking block="Tracking|position %position|line %line"
    //% weight=92
    export function Tracking(pos: position, l: line): boolean
    {
        let ret: boolean = false;
        pins.setPull(DigitalPin.P13, PinPullMode.PullNone);
        pins.setPull(DigitalPin.P16, PinPullMode.PullNone);
        switch (pos) 
        {
            case position.LeftSide: 
            {
                if (pins.digitalReadPin(DigitalPin.P13) == l) 
                    ret = true;
                else
                    ret = false;
                break;
            }

            case position.RightSide: 
            {
                if (pins.digitalReadPin(DigitalPin.P16) == l) 
                    ret = true;
                else 
                    ret = false;
                break;
            }
        }
        return ret;
    }

    export enum StepperMotors {
        SM1 = 0x1,
        SM2 = 0x2
    }

    //% weight=81
    //% inlineInputMode=inline
    //% blockId=StepperMotor28Start block="Stepper Motor 28|%index|dir|%Dirs|speed|%speed"
    //% speed.min=0 speed.max=10 speed.defl=6
    //% index.fieldEditor="gridpicker" index.fieldOptions.columns=2
    //% direction.fieldEditor="gridpicker" direction.fieldOptions.columns=2
    export function StepperMotor28Start(index: StepperMotors, direction: Dirs, speed: number): void {
        let buf = pins.createBuffer(6);
        buf[0] = CMD_STEPPERMOTOR28;
        buf[1] = index;
        buf[2] = direction;
        buf[3] = speed;
        buf[4] = 0x00;
        buf[5] = 0x00;
        pins.i2cWriteBuffer(ADDR, buf);
    }

    //% weight=80
    //% inlineInputMode=inline
    //% blockId=StepperMotor28StartWithSteps block="Stepper Motor 28|%index|dir|%Dirs|speed|%speed|steps|%steps"
    //% speed.min=0 speed.max=10 speed.defl=6
    //% steps.min=1 steps.max=60000 steps.defl=20
    //% index.fieldEditor="gridpicker" index.fieldOptions.columns=2
    //% direction.fieldEditor="gridpicker" direction.fieldOptions.columns=2
    export function StepperMotor28StartWithSteps(index: StepperMotors, direction: Dirs, speed: number, steps: number): void {
        let buf = pins.createBuffer(6);
        buf[0] = CMD_STEPPERMOTOR28;
        buf[1] = index;
        buf[2] = direction;
        buf[3] = speed;
        buf[4] = steps / 256;
        buf[5] = steps & 0xff;
        pins.i2cWriteBuffer(ADDR, buf);
    }

    //% weight=79
    //% blockId=StepperMotor28Stop block="Stepper Motor 28 Stop |%index"
    //% index.fieldEditor="gridpicker" index.fieldOptions.columns=2
    export function StepperMotor28Stop(index: StepperMotors): void {
        let buf = pins.createBuffer(6);
        buf[0] = CMD_STEPPERMOTOR28;
        buf[1] = index;
        buf[2] = CMD_STOP; //stop
        buf[3] = 0x00;
        buf[4] = 0x00;
        buf[5] = 0x00;
        pins.i2cWriteBuffer(ADDR, buf);
    }

    //% weight=78
    //% blockId=StepperMotor28StopAll block="Stepper Motor 28 Stop All"
    export function StepperMotor28StopAll(): void {
        let buf = pins.createBuffer(6);
        buf[0] = CMD_STEPPERMOTOR28;
        buf[1] = CMD_ALL;
        buf[2] = CMD_STOP; //stop
        buf[3] = 0x00;
        buf[4] = 0x00;
        buf[5] = 0x00;
        pins.i2cWriteBuffer(ADDR, buf);
    }

}
