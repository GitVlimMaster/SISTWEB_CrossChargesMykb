/**
 * Este es el archivo de worker
 * @author Josué Hernández <josue.hernandez@vlim.com.mx>
 */
const NET = require("net");
const XMLPARSE = require("xml-js");
const VALIDATEXML = require("fast-xml-parser");
const CONNECTTOAPI = require('../middlewares/ConnectToApi.middleware');
const {parentPort, workerData} = require("worker_threads");
 
parentPort.on("message", async (parentData) => {
    try{
        let generateConnection = new GenerateConnectionIFC();
        const operaResponse = await generateConnection.connectWithOpera(parentData)
        return parentPort.postMessage({data: operaResponse});
    }catch(error) {
        return parentPort.postMessage({error});
    };
});


class GenerateConnectionIFC {
    /**
     * Conecta con elservicio de opera
     * @param {Object} 
     */
    connectWithOpera({connectinfo, xmlpos}) {
        try {
            let WSError = null
            // Creamos una promesa que devolvera el resultado del envio por websocket a opera
            return new Promise((resolve, reject) => { // Retornamos la promesa
                // Creamos una conexion websocket a el puerto y host mandados dentro del parametro connectinfo
                const WEBSOCKET = NET.connect({ port: connectinfo.port, host: connectinfo.host }, () => {
                    // Escribimos a opera mediantte la conexion Websocket
                    WEBSOCKET.write(xmlpos.linkstart);
                    WEBSOCKET.write(xmlpos.description);                    
                    //WEBSOCKET.write(xmlpos.postinquiry);
                });// Connect

                var response = [];
                
                WEBSOCKET.on("data", data => {
                    var toText = data.toString();// Trasformamos la respuesta string
                    let responseXML = data.toString().replace(/\x02|\x03/g, "");
                    if(toText.includes("LinkAlive")) {
                        WEBSOCKET.write(xmlpos.postinquiry);
                    }
                    else {

                        if(responseXML.includes("PostList")) {
                            if(responseXML.includes("</PostList>")) {
                                response.push(responseXML);
                                const jsonText = XMLPARSE.xml2json(response.join(""), { compact: true, spaces: 4, sanitize: true });// Quitamos valore de inicio y fin
                                const response_data = [];
                                response_data.push(JSON.parse(jsonText));
                                resolve(response_data[0].PostList);
                                response = [];
                            }
                            else {
                                response.push(responseXML);
                            }
                        }
                        else {
                            const response_data = [];
                            const jsonText = XMLPARSE.xml2json(responseXML, { compact: true, spaces: 4, sanitize: true });// Quitamos valore de inicio y fin
                            response_data.push(JSON.parse(jsonText));
                            if ((response_data[0].PostAnswer.AnswerStatus = "IA")) {
                                resolve("501");
                            }// IF
                        }
                    }
                });// Data
                
                WEBSOCKET.setTimeout(180000, function(){
                    console.log(`Post Request TimeOut >>> Tardo demasiado`);
                    resolve("501");
                });

                // Esto saltara cuando el websocket produzca un error 
                WEBSOCKET.on("error", (error) => {
                    console.log('Code', error.code)
                    WSError = error.code
                    console.log(`Post Inquiry Error >>> ${error}`);
                    console.log("Log: >>> No se puede conectar con opera");
                    reject(error.code)
                });// Error
                WEBSOCKET.on("close", (event) => {
                    reject(WSError)
                })
            });// Promise
        }
        catch(error) {
            console.log('Error');
            throw new Error(error)
            WEBSOCKET.destroy()
        }
    }
}