/**
 * +------------------------------+
 * | Hacer post y get a las api's |
 * +------------------------------+
 *  
 * @author Josué Hernández
 */
const CONSUMEAPI = require("request");
const SERVE = "https://dev.crosschargesrlh.com/rlh_ws/";
const WRITEINLOG = require("../lib/logs/WriteLog.js");
// const SERVE = "http://52.23.172.57/rlh_ws/";

/**
 * +--------------------------------+
 * | Peticiones api por metodo post |
 * +--------------------------------+
 * 
 * @param string url
 * @param object body
 * @return promise 
 */
module.exports.Post = (url, body) => {
    try {
        return new Promise((resolve, reject) => {
            CONSUMEAPI.post({
                headers: { "Content-Type": "application/json" },
                url: SERVE + url,
                body: JSON.stringify(body)
            }, (err, res, body) => {
                WRITEINLOG.WriteLogSuccessful("ConnectToApi", body);
                if(body.startsWith("SMTP")) {
                    console.log(body);
                    resolve({status: "error", message: "Fail to sent mail to distribution lists."})
                    return
                }
                resolve(JSON.parse(body));
            });
        });
    }
    catch(err) {
        WRITEINLOG.WriteLogError("ConnectToApi", err);
    }
}

/**
 * +-------------------------------+
 * | Peticiones api por metodo get |
 * +-------------------------------+
 * 
 * @param 
 */
module.exports.Get = (url) => {
    try {
        return new Promise((resolve, reject) => {
            CONSUMEAPI.get({
                headers: { "Content-Type": "application/json" },
                url: SERVE + url
            }, (err, res, body) => {
                WRITEINLOG.WriteLogSuccessful("ConnectToApi", body);
                resolve(JSON.parse(body));
            });
        });
    }
    catch(err){
        WRITEINLOG.WriteLogError("ConnectToApi", err);
    }
}