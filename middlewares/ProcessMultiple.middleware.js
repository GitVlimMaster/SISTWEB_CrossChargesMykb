/**
 * +------------------------------------------+
 * | Retornamos el objecto del proceso actual |
 * +------------------------------------------+
 */
const GETPOSTIFC8 = require("../middlewares/PeticionIFC8.middleware");
const CONNECTTOAPI = require('../middlewares/ConnectToApi.middleware');
const XMLGENERATE = require("../lib/xmlGenerate");
const date = require('../lib/getDates');

/**
 * +----------------------------------------------------+
 * | Declaramos la variable de acceso linkstart a opera |
 * +----------------------------------------------------+
 * 
 * @var string linstart
 */
const linkalive = XMLGENERATE.IFC8("LinkAlive", {
    time: date._getTime(),
    date: date._getDate(),
});

/**
 * +----------------------------------------------------+
 * | Declaramos la variable de acceso linkstart a opera |
 * +----------------------------------------------------+
 * 
 * @var string linstart
 */
const linkstart = XMLGENERATE.IFC8("LinkStart", {
    time: date._getTime(),
    date: date._getDate(),
});

/**
 * +-------------------------------------------------------+
 * | Declaramos la variable de descripción linkdescription |
 * +-------------------------------------------------------+
 * 
 * @var string descrition
 */
const description = XMLGENERATE.IFC8("LinkDescription", {
    time: date._getTime(),
    date: date._getDate(),
    vernum: "1.0"
});

module.exports.PostrequestProcess = (object) => {
    return new Promise((resolve, reject) => {
        // Obtenemos el monto tranformado en entero
        // Obtenemos al id del hotel al que se le realiza el cargo
        CONNECTTOAPI.Post("getHotelById", { id_hotel: object.hotel_b }).then((response) => {
            if (response.status == "OK") { // If body status is Ok enter in the condition
                // Generamos la petición xml con nuestro convertidor de objeto-xml
                // Y la enviamos al metodo post request que conecta con opera y envia el xml
                GETPOSTIFC8.Postrequest({
                    port: response.hotelsData.port,
                    host: response.hotelsData.ip
                }, {
                    linkstart: linkstart,
                    description: description,
                    linkalive: linkalive,
                    postrequest: object.postrequest,
                    userinfo: object.userinfo
                }).then((value) => {
                    // Enviamos la respuesta de Opera
                    resolve(value);
                }).catch((e) => { resolve(e) });// GETPOSTIFC8
            }//if
        });
    });
}