var express = require('express');
const APP = express();
const { Worker, isMainThread }  = require('worker_threads');

APP.use(express.urlencoded({
    extended: true
}));

APP.get("/test/:ip/:port/:word", (req, res) => {
    try {
        const worker = new Worker("./test/serverConect.js");
        worker.on("message", result => {
            res.send(result.data);
        });
        worker.on("error", error => {
            res.send(error);
        });
        worker.postMessage({ip: req.params.ip, port: req.params.port, word: req.params.word});
    }
    catch(err) {
        res.send("Entraste al error maestro");
    }
});

APP.get("/hi/:word", (req, res) => {
    try {
        res.send(`Hi ${req.params.word}`);
    }
    catch(err) {
        req.send("Entraste al error mae");
    }
});

APP.listen(4000, () => {
    console.log(`>>> The server is ready in port: (4000)`);
    console.log(`>>> Press CTRL + c to finish the server`);
});