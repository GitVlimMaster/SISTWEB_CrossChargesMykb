/**
 * +------------------------------------------+
 * | Generamos numeros aleatrios para en      |
 * | un futuro usarlos como nombre de archivo |
 * +------------------------------------------+
 * 
 * @example RamNum = 12346654321
 * @return int
 */
module.exports.RamNum = () => {
    // Generamos un nombre de numeros aleatorios
    return Math.floor(Math.random() * 99999999999);
}

/**
 * +---------------------------------------+
 * | Tranformarmos la imagen de base 64 a  |
 * | un archivo jpg                        |
 * +---------------------------------------+
 * 
 * @return mixed
 */
module.exports.BaseToFile = (base64) => {
    return Buffer.from(base64.replace(/^data:image\/\w+;base64,/, ""), 'base64');
}

