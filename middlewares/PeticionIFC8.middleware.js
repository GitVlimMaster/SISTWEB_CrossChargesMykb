/**
 * +-----------------------------------------------+
 * | Comunication with post request a IFC8         |
 * +-----------------------------------------------+
 *
 * @author Josué Hernandez
 * @date 08/02/20
 */
var NET = require("net");
var XMLPARSE = require("xml-js");
const VALIDATEXML = require('fast-xml-parser');
const CONNECTTOAPI = require('../middlewares/ConnectToApi.middleware');

/**
 * +--------------------------------------+
 * | Limpiamos un valor quitandole 		  |
 * | los espacios, para asi transformar   |
 * |el valor a int     					  |
 * +--------------------------------------+
 *
 * @param string amount
 * @return string
 */
module.exports.amountConvertion = amount => {
	amount = amount.replace(/ /g, ""); // Remplasamos espacios en blanco
	return amount = amount * 100;
};

/**
 * +-----------------------------------------+
 * | Limpiamos el folio, solo dejamos los    |
 * | numeros								 |
 * +-----------------------------------------+
 * 
 * @param string folio
 * @return string 
 */
module.exports.getFolio = folio => {
	return folio.replace(
		"Posting successful. Interface transaction number/s - ",
		""
	);
}

/**
 * +-----------------------+
 * | Post request funtion  |
 * +-----------------------+
 *
 * @param obeject connectinfo
 * @param object xmlpos
 * @return mixed
 */
module.exports.Postrequest = (connectinfo, xmlpos) => {
	// Creamos una promesa que devolvera el resultado del envio por websocket a opera
	return new Promise((resolve, reject) => { // Retornamos la promesa
		// Creamos una conexion websocket a el puerto y host mandados dentro del parametro connectinfo
		const WEBSOCKET = NET.connect({ port: connectinfo.port, host: connectinfo.host }, () => {
			// Escribimos a opera mediantte la conexion Websocket
			WEBSOCKET.write(xmlpos.description);
			WEBSOCKET.write(xmlpos.linkstart);
			//WEBSOCKET.write(xmlpos.postrequest);
		});// Connect

		var counter = 0;
		
		WEBSOCKET.on("data", data => {
            const XML = data.toString().replace(/\x02|\x03/g, "");
            if(VALIDATEXML.validate(XML) === true) {
            	console.log(XML, counter);
                if(XML.includes("LinkAlive")) {
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
                    if (response_data[0].PostAnswer != undefined) {
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

		WEBSOCKET.setTimeout(280000, function(){
            console.log(`Post Request TimeOut >>> Tardo demasiado`);
            // WEBSOCKET.destroy();
            resolve("error");
        });
		
		// Esto saltara cuando se produzca un error
		WEBSOCKET.on("error", function (error) {
			// Solicitamos el servicio de envio de correos y los configuramos en error
			if(error.code != 'ECONNRESET'){
				CONNECTTOAPI.Post("sendMailDistributionList", {name: `${xmlpos.userinfo.tmp_opera_user.FirstName} ${xmlpos.userinfo.tmp_opera_user.LastName}`, room: xmlpos.userinfo.tmp_opera_user.RoomNumber, hotel_a: xmlpos.userinfo.user.id_hotel, hotel_b: xmlpos.userinfo.hotel_b, amount: xmlpos.userinfo.amount, consume_center: "CrossCharges", consume_cat: "Restaurante", currency: "MXN", user_name: xmlpos.userinfo.user_name, okerror: "error"})
			}
			console.log("Log: >>> No se puede conectar con opera");
			console.log(`>>> You have an error: ${error}`);
			// Retornamos el error en forma de promesa
			resolve("error");			
		});// Error
		WEBSOCKET.on("close", (event) => {
            resolve("error")
        })
	});// Promise
};

/**
 * +------------------------------+
 * | Post inquiry funtion         |
 * +------------------------------+
 *
 * @param obeject connectinfo
 * @param object xmlpos
 * @return mixed
 */
module.exports.Postinquiry = (connectinfo, xmlpos) => {
	// Retornamos la promesaa
	return new Promise((resolve, reject) => {// Cramos una nuea promesa para ejectora el seigiente codigo
		// Creamos una conexion websocket a opera, la configuración del puero y host esta dentro de connectinfo
		const WEBSOCKET = NET.connect({port: connectinfo.port, host: connectinfo.host}, () => {
			WEBSOCKET.write(xmlpos.description);
			WEBSOCKET.write(xmlpos.linkstart);
			// console.log(xmlpos.postinquiry)
			WEBSOCKET.write(xmlpos.postinquiry);
		});// Websocket
		// Enviamos una peticion post inquiry a opera
		// Esto saltara cuando opera responda a enviado anteriormente
		WEBSOCKET.on("data", data => {
			var tmp_text = data.toString();// Trasformamos la respuesta astring
			let responseXML = tmp_text.replace(/\x02|\x03/g, "");
			if(VALIDATEXML.validate(responseXML) === true) {
				// console.log(`Post Inquiry >>> ${tmp_text} `);
				var jsonText = XMLPARSE.xml2json(tmp_text.replace(/\x02|\x03/g, ""), { compact: true, spaces: 4, sanitize: true });// Quitamos valore de inicio y fin
				var response_data = [];// Guardamos temporalmente
				response_data.push(JSON.parse(jsonText));
				// Entrara si la respuesta no es nula
				if (response_data[0].PostList != null) {
					resolve(response_data[0].PostList);
				} else if (response_data[0].PostAnswer != null) {
					if ((response_data[0].PostAnswer.AnswerStatus = "IA")) {
						resolve("501");
					}// IF
				}
			}
			else {
				resolve("xmlinvalid");
			}
		});// Data


		WEBSOCKET.setTimeout(90000, function(){
			WEBSOCKET.destroy();
			resolve("error");
		});

		// Esto saltara cuando el websocket produzca un error 
		WEBSOCKET.on("error", function (error) {
			resolve("error");
			WEBSOCKET.destroy();
			console.log("Log: >>> No se puede conectar con opera");
		});// Error
	});// Promise
};