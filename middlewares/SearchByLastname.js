/**
 * Buscar un huesped por appellido en un hotel
 * @author Josué Hernández <josue.hernandez@vlim.com.mx>
 */
 const NET = require("net");
 const XMLPARSE = require("xml-js");
  const VALIDATEXML = require('fast-xml-parser');
 var parser = require('xml2json');
 
 class SearchByLastname {
     /**
      * Connexión del websocket de opera
      * @param {String} url 
      * @param {Object} payload 
      */
     connnectWithOpera(url, payload) {
         return new Promise((resolve, reject) => {
             var urlObjectSplit = this.divideUrlPortAndIp(url);
             try {
                 const WEBSOCKET = NET.connect({host: urlObjectSplit[0], port: urlObjectSplit[1]}, () => {
                     for(var obj in payload) {
                         WEBSOCKET.write(payload[obj]);
                     }
                 });
                 WEBSOCKET.on("data", data => {
                    const dataResponse = data.toString().replace(/\x02|\x03|\n|\t/g, "");
                    if(VALIDATEXML.validate(dataResponse) === true) {
                        if(!/LinkAlive/g.test(dataResponse)) {
                            resolve(XMLPARSE.xml2json(dataResponse,{ 
                                compact: true,
                                spaces: 4,
                                sanitize: true
                            }));
                        }
                    }
                    else {
                        reject({
                            code: 3001
                        });
                    }
                 });

                WEBSOCKET.setTimeout(20000, function(){
                    WEBSOCKET.destroy();
                    reject({
                        code: 3002
                    });
                });

                 WEBSOCKET.on("error", err => {
                     reject(err);
                 });
             }
             catch(err) {
                 reject(err);
             }
         });
     }
 
     /**
      * Divide un string con ip y puerta
      * @param {Strng} url
      * @return {Object}
      */
     divideUrlPortAndIp(url) {
         return url.split(":");
     }
 }
 
 /**
  * Clase que se conecta con el route.js
  * @param {String} url 
  * @param {Object} payload 
  * @returns {Object}
  */
 module.exports.SLastname = (url, payload) => {
     const searchByLastname = new SearchByLastname();
     return searchByLastname.connnectWithOpera(url, payload);
 }