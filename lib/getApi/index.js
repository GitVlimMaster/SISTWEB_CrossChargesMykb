/**
 * Get api
 * 
 * @author Josué Hernández
 */
function post(api, url, body){
    var back_consume = [];
    api.post({
        headers: {"Content-Type": "application/json"},
        url: url,
        body: JSON.stringify(body)
    }, (err, res, body) => {
        if(err != null){
            back_consume = err;    
        }else if(res != null){
            back_consume = res
        }else{
            back_consume = JSON.parse(body);
        }
    });
    return back_consume;
}

module.exports.post = (api, url, body) => {
    var consume = post(api, url, body);
    return consume;
}