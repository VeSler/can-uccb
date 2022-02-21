/**
 * CAN adapter
 * 
 * @param {*} onChange 
 */
'use strict'

const SerialPort = require('serialport');

function getUartList(onChange) {
    //TODO: 

    SerialPort.list().then(
        ports => {
            ports.forEach(console.log)

            const list = ports; // !!!!!


            if (!list) return;
            const element = $('#ports');
            for (let j = 0; j < list.length; j++) {
                element.append('<li><a href="#!">' + list[j].path + '</a></li>');
            }
            $('#ports a').click(function() {
                $('#port').val($(this).text());
                Materialize.updateTextFields();
                onChange();
            });

        },
        err => console.error(err)

    )
}

/*

SerialPort.list().then(
    ports => ports.forEach((port) => {
        if (port.path) {console.log(`port.path = ${port.path}`)}
    //    console.log(port.comName);
        if (port.pnpId) {console.log(`port.pnpId = ${port.pnpId}`)};
        if (port.manufacturer) {console.log(`port.manufacturer = ${port.manufacturer}`)};
    }),
    err => console.error(err)
);
*/