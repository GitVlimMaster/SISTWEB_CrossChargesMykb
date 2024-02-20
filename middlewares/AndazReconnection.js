//Envio de conexion a Andaz para mantener activa su VPN
const { spawnSync } = require('child_process');
const os = require('os');
var NET = require("net");
// Windows: ping -n 1 HOSTNAME
// Linux: ping -c 1 HOSTNAME

function pingHostname(hostname) {
   const result = spawnSync('ping', os.platform() === 'win32' ? ['-n', '1', hostname] : ['-c', '1', hostname]);
   // console.log(result);
   // console.log(result.stdout.toString().includes('Reply from'));
}
const time = 1000 * 60 * 3; //3 Minutos
// pingHostname("10.91.12.40:5040");
// setInterval(pingHostname, time, "10.91.12.40:5040");

function sendLinkStart(){
	return new Promise((res,rej) => {
		const date = new Date().toJSON().slice(2, 10).split("-").join("")
		const time = new Date().toLocaleTimeString([], { hour12: false }).split(":").join("")
		try {
		const WEBSOCKET = NET.connect({port: 5040, host: "10.91.12.40"}, () => {
			WEBSOCKET.write('\x02<LinkDescription Date="' + date + '" Time="' + time +'" VerNum="1.0"/>\x03');
			WEBSOCKET.write('\x02<LinkStart Date="' + date + '" Time="' + time + '"/>\x03');						
		})
		WEBSOCKET.on("data", data => {
			var tmp_text = data.toString();// Trasformamos la respuesta astring
			let responseXML = tmp_text.replace(/\x02|\x03/g, "")
			console.log(responseXML)
			res('ok')
		})
		WEBSOCKET.on("error", e => {
			if(e.code) {
				console.log('AndazPing', e.code)
				res(e.code)
			} else {
				console.log('AndazPing', e.message)
				res(e.message)
			}
		})
		} catch(e) {
			if(e.code) {
				console.log('AndazPing', e.code)
				res(e.code)
			} else {
				console.log('AndazPing', e.message)
				res(e.message)
			}
		}
	})
}
sendLinkStart()
setInterval(async () => await sendLinkStart(), time)