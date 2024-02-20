/**
 * @author Josue Hernández <josue.hernandez@vlim.com.mx>
 * @package /
 */
 const express = require("express");
 const APP = express();
 const NET = require("net");
 const XMLPARSE = require("xml-js");
 const VALIDATEXML = require("fast-xml-parser");
 const XMLGENERATE = require("./lib/xmlGenerate");
 const date = require('./lib/getDates');
 
 const linkstart = XMLGENERATE.IFC8("LinkStart", {
     time: date._getTime(),
     date: date._getDate(),
 });
 
 const description = XMLGENERATE.IFC8("LinkDescription", {
     time: date._getTime(),
     date: date._getDate(),
     vernum: "1.0"
 });
 
 const postinquiry = XMLGENERATE.IFC8("PostInquery", { 
     time: date._getTime(), 
     date: date._getDate(), 
     inqueryinfo: "334",
     maxreturnmatch: "50", 
     sequencenumber: "1235", 
     revenuecenter: "VLIM REQUEST", 
     requesttype: "12", 
     paymethod: "16", 
     waiterid: "VLIM", 
     workstationid: "Station_1"
 });
 
 function initSocket() {
     return new Promise((resolve, reject) => {
         try {
             // Crea la conexión y envía peticiones al servidor
             const socket = NET.connect({port: 5010, host: "10.140.169.6"}, () => {
                 socket.write(linkstart);
                 socket.write(description);
                 socket.write(postinquiry);
             });
 
             // Respuestas emitidas por el socket
             socket.on("data", data => {
                let result = data.toString();
                if(result.includes("LinkAlive")) {
                    socket.write(postinquiry);
                } 
                else {
                    resolve(result);
                }
             });
             
             // Error en el socket
             socket.on("error", error => {
                 reject(error);
             });
         }
         catch(err) {
             reject(`Socket: ${err}`);
         }
     });
 }
 
 APP.get("/", (req, res) =>  {
     console.log(`>>> Use: ${linkstart}`);
     console.log(`>>> Use: ${description}`);
     console.log(`>>> Use: ${postinquiry}`);
     res.send(`envíando...`);
     initSocket().then(data => {
         console.log(data);
     }).catch(err => {
         console.log("Error response: ", err);
     });
 });
 
 APP.listen(4043, () => {
     console.log(`>>> The server is ready in port: (4043)`);
     console.log(`>>> Press CTRL + c to finish the server`);
 });