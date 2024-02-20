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
    try {
        let generateConnection = new GenerateConnectionIFC();
        const operaResponse = await generateConnection.connectWithOpera(parentData)
        parentPort.postMessage({data: operaResponse});
    } catch(error) {
        console.log('Error ' + error)
        parentPort.postMessage({error});
    };
 });

// 8010 
 
/**
 * Clase que obtine una conección con IFC8
 * @access {public} 
 */ 
class GenerateConnectionIFC {
     /**
      * Conecta con elservicio de opera
      * @param {Object} 
      */
     connectWithOpera({connectinfo, xmlpos}) {
         try {
            // Creamos una promesa que devolvera el resultado del envio por websocket a opera
            return new Promise((resolve, reject) => { // Retornamos la promesa
                // Creamos una conexion websocket a el puerto y host mandados dentro del parametro connectinfo
                const WEBSOCKET = NET.connect({ port: connectinfo.port, host: connectinfo.host }, () => {
                    // Escribimos a opera mediantte la conexion Websocket
                    WEBSOCKET.write(xmlpos.linkstart);
                    WEBSOCKET.write(xmlpos.description);
                    //WEBSOCKET.write(xmlpos.postrequest);
                });// Connect

                var counter = 0;
                
                // Este evento saltara encuanto nos responda IFC8(Opera)
                WEBSOCKET.on("data", data => {
                    const XML = data.toString().replace(/\x02|\x03/g, "");
                    if(VALIDATEXML.vaidate(XML) === true) {
                        if(XML.includes("LinkAlive")) {
                            console.log(XML, counter);
                            if(counter == 0) {
                                WEBSOCKET.write(xmlpos.postrequest);
                                counter = 1;
                                console.log(">>>>>>>>> LINKALIVE", xmlpos.postrequest);
                            }
                        }
                        else {
                            let response_data = [];
                            const response = XMLPARSE.xml2json(XML, { compact: true, spaces: 4, sanitize: true });
                            response_data.push(JSON.parse(response));// Guardamos el objeto en response_data
                            if (response_data[0].PostAnswer != null) {
                                const tmp_response = JSON.parse(response);// 
                                const tmp_foli_two = tmp_response.PostAnswer._attributes.ResponseText;
                                // const tmp_folio = tmp_foli_two.replace("Posting successful. Interface transaction number/s - ","");
                                if (tmp_response.PostAnswer._attributes.AnswerStatus != "OK") {
                                    CONNECTTOAPI.Post("sendMailDistributionList", {name: `${xmlpos.userinfo.tmp_opera_user.FirstName} ${xmlpos.userinfo.tmp_opera_user.LastName}`, room: xmlpos.userinfo.tmp_opera_user.RoomNumber, hotel_a: xmlpos.userinfo.user.id_hotel, hotel_b: xmlpos.userinfo.hotel_b, amount: xmlpos.userinfo.amount, consume_center: "CrossCharges", consume_cat: "Restaurante", currency: "MXN", user_name: xmlpos.userinfo.user_name, okerror: "error"});
                                }// If
                                // Retornamos la respuesta de opera dentro del promise 
                                resolve(tmp_response);
                            }//
                        }
                    }
                });// Data

                WEBSOCKET.setTimeout(90000, function(){
                    console.log(`Post Request TimeOut >>> Tardo demasiado`);
                    reject("error");
                });
                
                // Esto saltara cuando se produzca un error
                WEBSOCKET.on("error", function (error) {
                    // Solicitamos el servicio de envio de correos y los configuramos en error
                    if(error.code != 'ECONNRESET'){
                        CONNECTTOAPI.Post("sendMailDistributionList", {name: `${xmlpos.userinfo.tmp_opera_user.FirstName} ${xmlpos.userinfo.tmp_opera_user.LastName}`, room: xmlpos.userinfo.tmp_opera_user.RoomNumber, hotel_a: xmlpos.userinfo.user.id_hotel, hotel_b: xmlpos.userinfo.hotel_b, amount: xmlpos.userinfo.amount, consume_center: "CrossCharges", consume_cat: "Restaurante", currency: "MXN", user_name: xmlpos.userinfo.user_name, okerror: "error"})
                    }                    
                    console.log(`>> You have an error: ${error}`);
                    // Retornamos el error en forma de promesa
                    console.log("Log: >>> No se puede conectar con opera");
                    reject("error");                    
                });// Error
                WEBSOCKET.on("close", (event) => {
                    reject("error")
                })
            });// Promise
         }
         catch(error) {
             print(error);
         }
     }
 }