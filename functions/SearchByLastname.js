/**
 * Este es el archivo de worker
 * @author Josué Hernández <josue.hernandez@vlim.com.mx>
 */
const NET = require("net");
const XMLPARSE = require("xml-js");
const VALIDATEXML = require("fast-xml-parser");
const {parentPort, WORKERDATA} = require("worker_threads");

parentPort.on("message", parentData => {
    const searchByLastname = new SearchByLastname();
    // ParentData ned a url and payload
    searchByLastname.connectWithOpera(parentData).then(operaResponse => {
        parentPort.postMessage({data: JSON.parse(operaResponse)});
    }).catch(error => {
        parentPort.postMessage({data: error});
    });
});

/**
 * Manda a la url un payload que es incluido por argumento al metodo connectWithOpera
 * @access {public}
 */
class SearchByLastname {
    /**
     * Connexión del websocket de opera
     * @param {String} url 
     * @param {Object} payload 
     */
    connectWithOpera({url, payload, postinquiry}) {
        return new Promise((resolve, reject) => {
            var urlObjectSplit = this.divideUrlPortAndIp(url);
            try {
                const WEBSOCKET = NET.connect({host: urlObjectSplit[0], port: urlObjectSplit[1]}, () => {
                    for(var obj in payload) {
                        WEBSOCKET.write(payload[obj]);
                    }
                });
                WEBSOCKET.on("data", data => {
                   const dataResponse = data.toString().replace(/\x02|\x03/g, "");
                   const dataResponse2 = data.toString();
                   if(VALIDATEXML.validate(dataResponse) === true) {
                        if(/LinkAlive/g.test(dataResponse)) {
                            console.log(">>>",postinquiry);
                            WEBSOCKET.write(postinquiry);
                        }
                        else {
                            resolve(XMLPARSE.xml2json(dataResponse,{ 
                                compact: true,
                                spaces: 4,
                                sanitize: true
                            }));
                            WEBSOCKET.destroy();
                        }
                   }
                   else {
                        WEBSOCKET.destroy();
                        reject({
                            code: 3001
                        });
                   }
                });

                // WEBSOCKET.setTimeout(10000, function(){
                //     WEBSOCKET.destroy();
                //     reject({
                //         code: 3002
                //     });
                // });

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