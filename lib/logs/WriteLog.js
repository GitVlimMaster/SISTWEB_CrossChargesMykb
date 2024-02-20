/**
 * Modue to generate a temporal log for checked the error in the app
 * @author Josué Hernández
 */
const fs = require('fs');
// const CONNECTTOAPI = require('./middlewares/ConnectToApi.middleware');

/**
 * 
 * @param {String} message - Mensaje a mostrar dentro del log
 * @param {String} section  - Sección donde se genero el error
 */
module.exports.WriteLogError = (section, error) => {
    var ActualDate = new Date();
    const URL = "log-errors.txt";
    const sayTheError = `\n[${ActualDate}] Section: ${section}, Error: ${error}`;
    fs.appendFile(URL, sayTheError, function (err) {
        if (err) {
            console.log(`Server Say: ${sayTheError}`);
        }
    });
}

/**
 * 
 * @param {String} message - Mensaje a mostrar dentro del log
 * @param {String} section  - Sección donde se genero el error
 */
module.exports.WriteLogSuccessful = (section, message) => {
    var ActualDate = new Date();
    const URL = "log-successful.txt";
    const sayTheError = `\n[${ActualDate}] Section: ${section}, Message: ${message}`;
    fs.appendFile(URL, sayTheError, function (err) {
        if (err) {
            console.log(`Server Say: ${sayTheError}`);
        }
    });
}