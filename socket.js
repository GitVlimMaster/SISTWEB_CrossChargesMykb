const NET = require("net");
const XMLPARSE = require("xml-js");
const VALIDATEXML = require("fast-xml-parser");

const SOCKETPROCCESS = NET.connect(CONNECTINFO, (response) => {
    for(object in PAYLOAD){
        SOCKETPROCCESS.write(PAYLOAD[object]);
    }
});

// Se ejecuta cuando el servidor contesta nuestras peticiones
SOCKETPROCCESS.on("data", ResponseOfRequest => {
    resolve(this.parceInformation(ResponseOfRequest));
});

// Se ejecuta cuando el servidor tarda en responder
WEBSOCKET.setTimeout(10000, () => {
    WEBSOCKET.destroy();
    resolve({
        status: 302,
        message: "Al parecer el servidor no a resuelto la petición."
    });
});

// Se ejecuta cuando se tiene un error
WEBSOCKET.on("error", error => {
    WEBSOCKET.destroy();
    resolve({
        status: 303,
        message: error
    });
});// Error