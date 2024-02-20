var express = require('express');
var date = require('../lib/getDates');
const XMLGENERATE = require("../lib/xmlGenerate");
var XMLPARSE = require("xml-js");
const SEARCHLASTNAME = require("../middlewares/SearchByLastnameDemo");
const {parentPort, workerData} = require("worker_threads");

parentPort.on("message", data => {
    socketConnect(data).then(socketResponse => {
        parentPort.postMessage({data: socketResponse});
    }).catch(err => {
        parentPort.postMessage({data: err});
    });
});

function socketConnect({port, ip, word}) {
    return new Promise((resolve, reject) => {
        const description = XMLGENERATE.IFC8("LinkDescription", {
            time: date._getTime(),
            date: date._getDate(),
            vernum: "1.0"
        });
        
        const postinquiry = XMLGENERATE.IFC8("PostInquery", { 
            time: date._getTime(), 
            date: date._getDate(), 
            inqueryinfo: word,
            maxreturnmatch: "40", 
            sequencenumber: "1234", 
            revenuecenter: "VLIM REQUEST", 
            requesttype: "14",
            //requesttype: "10", 
            paymethod: "16", 
            waiterid: "VLIM", 
            workstationid: "Station_1"
        });
        
        SEARCHLASTNAME.SLastname(`${ip}:${port}`, {
            //linkstart: linkstart,
            description: description,
            postinquiry: postinquiry
        }).then(response => {
            resolve(response);
        }).catch(err => {
            reject(err);
        });
    });
}