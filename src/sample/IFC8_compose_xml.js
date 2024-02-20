/**
 * |-----------------------------------------------------------------------------| 
 * | NOTA: para que esto funcione en otra vista nesecitas
 * | el complemento: var xmlGenerate = require("./lib/xmlGenerate");
 * | de la misma forma para el Time y Date: var date = require('./lib/getDates');
 * |-----------------------------------------------------------------------------|
 * Para generar un PostInquery
 */
const message = xmlGenerate.IFC8("PostInquery", {
    time: date._getTime(),
    date: date._getDate(),
    inqueryinfo: "508", // Nombre o numero de habitación del huesped
    maxreturnmatch: "16", // Numero limite de respuestas
    sequencenumber: "1234", //
    requesttype: "4", // Tipo de consulta
    paymethod: "16", // Tipo de metodo de pago
    waiterid: "Waiter_1", 
    workstationid: "Station_1"
});

/**
 * Genera un PostList
 */
const message = xmlGenerate.IFC8("PostList", {
    time: date._getTime(),
    date: date._getDate(),
    sequencenumber: "1234", //
    hotelid: "3",
    revenuecenter: "3",
    paymethod: "16", // Tipo de metodo de pago
    waiterid: "Waiter_1", 
    workstationid: "Station_1",
    postlistitem: {
        roomnumber: "508",
        reservationid: "3",
        lastname: "Cobain",
        firstname: "Kurt",
        title: "Mr.",
        isvip: 0,
        nopost: "0",
        creditlimit: "200.00",
        paymethod: "Diners Club",
        profileid: "12345678",
        first_reference: "Definable Value1",
        second_reference: "Definable Value2",
        hotelid: "1"
    }
});

/**
 * Genera un LinkStart
 */
const linkstart = xmlGenerate.IFC8("LinkStart", {
    time: date._getTime(),
    date: date._getDate(),
});

/**
 * Genera un LinkAlive
 */
const message = xmlGenerate.IFC8("LinkAlive", {
    time: date._getTime(),
    date: date._getDate(),
});

/**
 * Genera LinkDescription
 */
const description = xmlGenerate.IFC8("LinkDescription", {
    time: date._getTime(),
    date: date._getDate(),
    vernum: "1.0"
});