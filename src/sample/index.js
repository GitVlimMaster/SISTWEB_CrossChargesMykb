/**
 * Websocket connection to opera IFC8 service
 * 
 * @see https://www.npmjs.com/package/xml-js <XML parse documentation>
 * @author VLIM
 */
var net = require('net');
var date = require('./lib/getDates');
var xmlParse = require('xml-js');
var xmlGenerate = require("./lib/xmlGenerate");

// Create the conection in this server
const clients = net.connect({port: 5249, host: '189.254.95.131'}, () => {
     // Create the start message
     const linkstart = xmlGenerate.IFC8("LinkStart", {
        time: date._getTime(),
        date: date._getDate(),
    });
    // Create the description message
    const description = xmlGenerate.IFC8("LinkDescription", {
        time: date._getTime(),
        date: date._getDate(),
        vernum: "1.0"
    });
    const postrequest = xmlGenerate.IFC8("PostRequest", {
        checknumber: "1",
        covers: "1",
        date: date._getDate(),
        discount: "0",
        hotelid: "1",
        creditlimitoverride: "",
        inquiryinformation: "508",
        lastname: "Cook",
        matchfrompostlist: "1",
        paymentmethod: "1",
        postingdescription: "Hola",
        requesttype: "4",
        reservationid: "15242894",
        revenuecenter: "1",
        roomnumber: "508",
        sequencenumber: "1234",
        servicecharge: "3000",
        servingtime: "4",
        subtotal: "3480",
        tax: "0",
        time: date._getTime(),
        tip: "0",
        totalamount: "3480",
        waiterid: "Waiter_1",
        workstation: "Station_1"
    });
    // Send the mensaje in the server
    clients.write(linkstart);
    clients.write(description);
    clients.write(postrequest);
});

// When the server return somethings
clients.on('data', (data) => {
    // Eliminamos el inicio y fin del texto
    var tmp_text = data.toString();
    tmp_text = tmp_text.replace(/\x02|\x03/g, "");
    // Catch the array parse
    var jsonText = xmlParse.xml2json(tmp_text, {compact: true, spaces: 4});
    // Print the parse results 
    console.log(JSON.parse(jsonText));
})

// Close the connection
clients.on('end', () => {   
    console.log("Disconnect");
});