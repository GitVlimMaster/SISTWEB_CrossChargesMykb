/**
 * +---------------------------------------+
 * | Transformar BASE64 a imagen y enviar  |
 * | el registro de nuevo cargo a servicio |
 * +---------------------------------------+
 * 
 * @author Josué Hernández
 * @copyright 2020 RLH Properties
 * @package MiddleWare
 */
const UPLOADIMG = require('../middlewares/UploadImage.middleware');
var FS = require('fs');

/**
 * +---------------------------------------+
 * | Guardamos y tranformamos una imagen   |
 * | desde base 64, el desarrollador debe  | 
 * |indicar la ruta donde se guarda        |
 * +---------------------------------------+
 * 
 * @param string base64
 * @param string route
 * @returns string
 * @example YOUINSTANCE.SaveIMG(data:image/png;base64,iVBORw0KGgoA..., "/img");
 */
module.exports.SaveIMG = (base64, route, prefix = "") => {
    return new Promise((resolve, reject) => {
        const DOCUMENT = UPLOADIMG.BaseToFile(base64);
        const RAMNUM = UPLOADIMG.RamNum();
        const NAME = prefix + RAMNUM;
        try{
            FS.writeFile(route + NAME + ".jpg", DOCUMENT, (err) => {
                return (err) ? reject("Error upload in server") : resolve(`${NAME}.jpg`);
            });
        } catch(err){
            reject(`Error in CreateDocuments.middleware: ${err}`);
        }
    });
}