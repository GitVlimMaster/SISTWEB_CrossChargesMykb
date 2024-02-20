/**
 * +----------------------------------------------+
 * | Postreques worker - connecta con el servicio |
 * | de inserción de datos en opera               |
 * +----------------------------------------------+
 * 
 * @param string type
 * @param callback 
 * @return promise - json
 */
self.addEventListener('message', (charge_info) => {
    charge_info.data.amount = charge_info.data.amount.replace(/\$(?=[$&`'\d])/g, "");
    charge_info.data.amount = charge_info.data.amount.replace(/,/g, "");
    fetch(`/postrequest/${charge_info.hotelB}`, {
        method: 'POST', // or 'PUT'
        body: JSON.stringify(charge_info.data), // data can be `string` or {object}!
        headers:{
            'Content-Type': 'application/json'
        }
    }).then(res => res.json()).catch(error => console.error('Error:', error)).then(response => self.postMessage(response));
});