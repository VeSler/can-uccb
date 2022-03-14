"use strict";
/**
 * NOTES
 * 
 *   var logDiv = $( "#log_out" );
 *   var msgs = [
 *   "button = " + $( this ).index(),
 *   "event.data.value = " + event.data.value
 *   ];
 *   logDiv.append( msgs.join( ", " ) + "<br>" );
 * 
 */

/*
 * Created with @iobroker/create-adapter v1.26.3
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
const utils = require("@iobroker/adapter-core");
const { stringify } = require("querystring");
const { SerialPort } = require('serialport');


// Load your modules here, e.g.:
// const fs = require("fs");

class CanUccb extends utils.Adapter {

    portName; // 
    sp; // new SerialPort(this.portName, { baudRate: 115200, autoOpen: true });


    /**
     * @param {Partial<utils.AdapterOptions>} [options={}]
     */
    constructor(options) {
        super({
            ...options,
            name: "can-uccb",
        });
        this.on("ready", this.onReady.bind(this));
        //this.on("newCanMessage", this.onNewCanMessage.bind(this));
        this.on("stateChange", this.onStateChange.bind(this));
        // this.on("objectChange", this.onObjectChange.bind(this));
        this.on("message", this.onMessage.bind(this));
        this.on("unload", this.onUnload.bind(this));

        this.portName = '/dev/ttyACM0';


    }



    /**
     * Is called when databases are connected and adapter received configuration.
     */
    async onReady() {
        // Initialize your adapter here

        // Reset the connection indicator during startup
        this.setState("info.connection", false, true);

        // The adapters config (in the instance object everything under the attribute "native") is accessible via
        // this.config:
        this.log.info("config option1: " + this.config.option1);
        this.log.info("config option2: " + this.config.option2);

        this.sp = new SerialPort({ path: this.portName, baudRate: 115200, autoOpen: true }, function(err) {
            if (err) {
                return console.log('Error: ', err.message)
            }
        });
        this.sp.write('S4\rL\rO\r');
        this.sp.drain(function(err) {
            if (err) {
                console.log('ERROR: ', err.message);
            }
        });

        this.sp.on('data', function(data) {
            console.log('Data: ', data);
            /*            const pN = $('#can_log_out');
                        if (pN) {
                            pN.innerText += '<br>';
                            pN.innerText += data;
                        };
            */
            //            $('#can_log_out').addText
        })


        /*
        For every state in the system there has to be also an object of type state
        Here a simple template for a boolean variable named "testVariable"
        Because every adapter instance uses its own unique namespace variable names can't collide with other adapters variables
        */
        await this.setObjectNotExistsAsync("testVariable", {
            type: "state",
            common: {
                name: "testVariable",
                type: "boolean",
                role: "indicator",
                read: true,
                write: true,
            },
            native: {},
        });

        // In order to get state updates, you need to subscribe to them. The following line adds a subscription for our variable we have created above.
        this.subscribeStates("testVariable");
        // You can also add a subscription for multiple states. The following line watches all states starting with "lights."
        // this.subscribeStates("lights.*");
        // Or, if you really must, you can also watch all states. Don't do this if you don't need to. Otherwise this will cause a lot of unnecessary load on the system:
        // this.subscribeStates("*");

        /*
            setState examples
            you will notice that each setState will cause the stateChange event to fire (because of above subscribeStates cmd)
        */
        // the variable testVariable is set to true as command (ack=false)
        await this.setStateAsync("testVariable", true);

        // same thing, but the value is flagged "ack"
        // ack should be always set to true if the value is received from or acknowledged from the target system
        await this.setStateAsync("testVariable", { val: true, ack: true });

        // same thing, but the state is deleted after 30s (getState will return null afterwards)
        await this.setStateAsync("testVariable", { val: true, ack: true, expire: 30 });

        // examples for the checkPassword/checkGroup functions
        let result = await this.checkPasswordAsync("admin", "iobroker");
        this.log.info("check user admin pw iobroker: " + result);

        result = await this.checkGroupAsync("admin", "admin");
        this.log.info("check group user admin group admin: " + result);
    }




    /**
     * Is called when adapter shuts down - callback has to be called under any circumstances!
     * Вызывается при выключении адаптера - обратный вызов должен вызываться при любых обстоятельствах!
     * @param {() => void} callback
     */
    onUnload(callback) {
        try {
            // Here you must clear all timeouts or intervals that may still be active
            // clearTimeout(timeout1);
            // clearTimeout(timeout2);
            // ...
            // clearInterval(interval1);
            //close(callback ? : error => {}): void
            this.sp.close(function(error) {
                if (error) {
                    console.log("Error: ", error.message);
                }
            });
            callback();
        } catch (e) {
            callback();
        }
    }

    // If you need to react to object changes, uncomment the following block and the corresponding line in the constructor.
    // You also need to subscribe to the objects with `this.subscribeObjects`, similar to `this.subscribeStates`.
    // /**
    //  * Is called if a subscribed object changes
    //  * @param {string} id
    //  * @param {ioBroker.Object | null | undefined} obj
    //  */
    // onObjectChange(id, obj) {
    //     if (obj) {
    //         // The object was changed
    //         this.log.info(`object ${id} changed: ${JSON.stringify(obj)}`);
    //     } else {
    //         // The object was deleted
    //         this.log.info(`object ${id} deleted`);
    //     }
    // }

    /**
     * Is called if a subscribed state changes
     * @param {string} id
     * @param {ioBroker.State | null | undefined} state
     */
    onStateChange(id, state) {
        if (state) {
            // The state was changed
            this.log.info(`state ${id} changed: ${state.val} (ack = ${state.ack})`);
        } else {
            // The state was deleted
            this.log.info(`state ${id} deleted`);
        }
    }

    // If you need to accept messages in your adapter, uncomment the following block and the corresponding line in the constructor.
    // /**
    //  * Some message was sent to this instance over message box. Used by email, pushover, text2speech, ...
    //  * Using this method requires "common.message" property to be set to true in io-package.json
    //  * @param {ioBroker.Message} obj
    //  */
    onMessage(obj) {
        if (typeof obj === "object" && obj.message) {
            if (obj.command === "send") {
                // e.g. send email or pushover or whatever
                this.log.info("send command");

                // Send response in callback if required
                if (obj.callback) this.sendTo(obj.from, obj.command, "Message received", obj.callback);
            }
            if (obj.command === "runCMD") {
                // отправить команду в uart
                this.log.info("run command")
                if (obj.cmd) {
                    this.sp.write(obj.cmd);
                    return this.sendTo(obj.from, obj.command, { mes: 'cmd run' }, obj.callback);;
                }
            }
        }
    }

}


// @ts-ignore parent is a valid property on module
if (module.parent) {
    // Export the constructor in compact mode
    /**
     * @param {Partial<utils.AdapterOptions>} [options={}]
     */
    module.exports = (options) => new CanUccb(options);
} else {
    // otherwise start the instance directly
    new CanUccb();
}