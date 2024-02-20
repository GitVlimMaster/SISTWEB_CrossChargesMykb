/**
 * +------------------------------------------------+
 * | RLH Properties project developed by VLIM Team  |
 * +------------------------------------------------+
 *
 * @author Josué Hernandez
 * @date 09-01-20
 * @copyright RLH Properties
 */
 var express = require('express');
 var exphbs = require('express-handlebars');
 var session = require("express-session");
 var bodyParser = require('body-parser');
 var fileUpload = require('express-fileupload');
 var date = require('./lib/getDates');
 const aes256 = require('aes256');
 const helmet = require('helmet');
 const XMLGENERATE = require("./lib/xmlGenerate");
 const APP = express();
 const PATH = require("path");
 const PORT = 3000; // Puerto por defecto
 const DEVPORT = 4000;
 const GETPOSTIFC8 = require("./middlewares/PeticionIFC8.middleware");
 const CONNECTTOAPI = require('./middlewares/ConnectToApi.middleware');
 const CREATEDOCUMENT = require("./middlewares/CreateDocuments.middleware");
 const ACTUALPROCESS = require("./middlewares/ProcessMultiple.middleware");
 const WRITEINLOG = require("./lib/logs/WriteLog.js");
 const SEARCHLASTNAME = require("./middlewares/SearchByLastname");
 const { Worker, isMainThread }  = require('worker_threads');
 
 // Algoritmo de encriptacion //
 const crypto = require('crypto');
 function sha1(input) {
     return crypto.createHash('sha1').update(input).digest();
 }
 
 function passwordDeriveBytes(password, salt, iterations, len) {
     var key = Buffer.from(password + salt);
     for(var i = 0; i < iterations; i++) {
         key = sha1(key);
     }
     if (key.length < len) {
         var hx = passwordDeriveBytes(password, salt, iterations - 1, 20);
         for (var counter = 1; key.length < len; ++counter) {
             key = Buffer.concat([key, sha1(Buffer.concat([Buffer.from(counter.toString()), hx]))]);
         }
     }
     return Buffer.alloc(len, key);
 }
 
 /**
  * +------------------------------------------+
  * | Configuración global de express api      |
  * +------------------------------------------+
  *
  * @param {string} method
  */
 APP.use(express.static(PATH.join(__dirname + '/src/css/')));
 APP.use(express.static(PATH.join(__dirname + '/workers/')));
 APP.use(express.static(PATH.join(__dirname + '/src/vendor/')));
 APP.use(express.static(PATH.join(__dirname + '/public/pdf/')));
 // APP.use(express.static(PATH.join(__dirname + '/public/ticket/')));
 // APP.use(express.static(PATH.join(__dirname + '/public/signature/')));
 APP.use(express.static(PATH.join(__dirname + '/public/hotels/')));
 APP.use(express.static(PATH.join(__dirname + '/src/js/')));
 APP.use(express.static(PATH.join(__dirname + '/controller/')));
 APP.use(express.static(PATH.join(__dirname + '/src/img/')));
 APP.use(session({ secret: 'secret', resave: true, saveUninitialized: true, secure: true })); // Añadimos el controlador de session dentro del entorno express
 APP.use(bodyParser.json({ limit: '50mb' }));// Aumentamos el limite permitido de BITS
 APP.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));// Aumentamos el espacio de memoria
 APP.use(fileUpload());// Utilizamos el metodo de subir archivos
 APP.use(bodyParser.urlencoded({ extended: true }));// El encode es en base64
 APP.use(bodyParser.json());//
 APP.set('view engine', '.hbs');// Utilizamos la extención .hbs
 APP.engine('.hbs', exphbs({ extname: '.hbs', defaultLayout: "main" }));// Usamos el controlador de platillas handlebars
 // Opciones de seguridad
 APP.use(helmet.frameguard());
 APP.use(helmet.noSniff()); // Se usa para proteger contra vulnerabilidades de rastreo MIME
 APP.use(helmet.xssFilter({ setOnOldIE: true }));
 // APP.use(helmet());
 APP.disable('x-powered-by');
 
 /**
  * +-------------------------------------------------------+
  * | Aqui se agregan a la variable express los encabezados |
  * | HTTP. Donde se añaden variables de configuración      |
  * +-------------------------------------------------------+
  *
  * @callback
  * @return {void}
  */
 APP.use(function (req, res, next) {
     // Website you wish to allow to connect
     res.setHeader('Access-Control-Allow-Origin', 
        //'http://localhost:3000'
        '*'
        );
     // Request methods you wish to allow
     res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
     // Request headers you wish to allow
     res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
     // Set to true if you need the website to include cookies in the requests sent
     // to the API (e.g. in case you use sessions)
     res.setHeader('Access-Control-Allow-Credentials', true);
     // Pass to next layer of middleware
     next();
 });
 
 /**
  * +----------------------------------------------------------+
  * | Definimos variables array, estas son variables           |
  * | temporales las cuales se van llenando en el transcurso   |
  * | de la ejecución                                          |
  * +----------------------------------------------------------+
  */
 var logeddUser = [];
 var allHotels = [];
 var consumerCat = [];
 var currency = [];
 
 /**
  * +---------------------------------------------------+
  * | Obtener el catologo de hoteles por medio de un id |
  * +---------------------------------------------------+
  * @param {string} URI
  * @return {void}
  */
 CONNECTTOAPI.Get("getCatHotels").then((resolve) => {
     allHotels = resolve;
 });
 
 /**
  * +---------------------------------------------------------+
  * | Obtener la lista de centros de consumo de una API REST  |
  * +---------------------------------------------------------+
  * @param {string} URI
  * @param {object} POSTData
  * @return {void}
  */
 CONNECTTOAPI.Post("getConsumeCat", { "id_consume_cat": "" }).then((resolve) => {
     consumerCat = resolve;
 });
 
 /**
  * +----------------------------------------------------+
  * | Obtener los centros de consumo de una API REST     |
  * +----------------------------------------------------+
  *
  * @param {string} URI
  * @param {object} POSTData
  * @return {void}
  */
 CONNECTTOAPI.Post("getConsumeCenter", { "id_consume_center": "" }).then((resolve) => {
     consumerCenter = resolve;
 });
 
 /**
  * +------------------------------------------+
  * | Obtenemos los tipos de moneda existentes |
  * +------------------------------------------+
  *
  * @param {string} URI
  * @return {void}
  */
 CONNECTTOAPI.Get("getCatCurrency").then((resolve) => {
     currency = resolve;
 });
 
 /**
  * +--------------------------------------------+
  * | Guardamos al usuario buscado temporalmente |
  * +--------------------------------------------+
  *
  * @param {string} URLDECLARE
  * @param {callback}
  * @return void
  */
 APP.post("/recivetmpuser", (req, res) => {
     req.session.tmp_opera_user = {
         RoomNumber: req.body.RoomNumber,
         ReservationId: req.body.ReservationId,
         LastName: req.body.LastName,
         FirstName: req.body.FirstName,
         PaymentMethod: req.body.PaymentMethod,
         NoPost: req.body.NoPost,
         CreditLimit: req.body.CreditLimit,
         ProfileId: req.body.ProfileId,
         HotelId: req.body.HotelId,
     };
     res.send(200);
 });
 
 /**
  * +-----------------------------------------------------+
  * | Declaramos e inicializamos esta variable de control |
  * | de accesso para el servido IFC8 OPERA               |
  * +-----------------------------------------------------+
  *
  * @see 'src/sample/IFC8_compose_xml.js'
  * @var {string} linkstart
  */
 const linkstart = XMLGENERATE.IFC8("LinkStart", {
     time: date._getTime(),
     date: date._getDate(),
 });
 
 /**
  * +---------------------------------------------------------+
  * | Declaramos e inicializamos una variable de control      |
  * | la cual verifica que la sesion en IFC8 continue abierta |
  * +---------------------------------------------------------+
  *
  * @see 'src/sample/IFC8_compose_xml.js'
  * @var {string} linkalive
  */
 const linkalive = XMLGENERATE.IFC8("LinkAlive", {
     time: date._getTime(),
     date: date._getDate(),
 });
 
 /**
  * +-------------------------------------------------------+
  * | Declaramos la variable de descripción linkdescription |
  * +-------------------------------------------------------+
  *
  * @see 'src/sample/IFC8_compose_xml.js'
  * @var string descrition
  */
 const description = XMLGENERATE.IFC8("LinkDescription", {
     time: date._getTime(),
     date: date._getDate(),
     vernum: "1.0"
 });
 
 /**
  * +-------------------------------------+
  * | Important - Socket inquiry open     |
  * +-------------------------------------+
  *
  * @param {string} URI
  * @param {callback}
  * @returns {void}
  */
 APP.post("/inquiry", (req, res) => {
     // Utilizamos el controlador de errores try
     try {
         CONNECTTOAPI.Post("getHotelById", { id_hotel: req.body.hotel }).then((response) => {
             if (response.hotelsData.status != "OK") {
                 const inquiry = XMLGENERATE.IFC8("PostInquery", { 
                     time: date._getTime(), 
                     date: date._getDate(), 
                     inqueryinfo: req.body.room, 
                     maxreturnmatch: "16", 
                     sequencenumber: "1234", 
                     revenuecenter: (req.session.hotelInformation != undefined) ? req.session.hotelInformation.hotelsData.opera_id_center : "NOTOPERAIDCENTER_CROSSCHARGES", 
                     requesttype: "4", 
                     paymethod: "16", 
                     waiterid: response.hotelsData.name, 
                     workstationid: "Station_1" 
                 });
 
                 const WORKER_MAIN = new Worker("./functions/PostInquiry.js");
 
                 WORKER_MAIN.on("message", result => {
                     res.send(result.data);
                     WRITEINLOG.WriteLogSuccessful("PostInquiry", JSON.stringify(result.data));
                     // res.send((result.data.PostListItem.length > 1) ? "error" : result.data);
                 });
                 WORKER_MAIN.on("error", error => {
                     res.send(error);
                     console.log("Error", error);
                     WRITEINLOG.WriteLogError("PostInquiry", error);
                 });
 
                 WORKER_MAIN.postMessage({connectinfo: { port: response.hotelsData.port, host: response.hotelsData.ip }, xmlpos: { linkalive, linkstart, description, postinquiry: inquiry }});
 
                 // GETPOSTIFC8.Postinquiry({ port: response.hotelsData.port, host: response.hotelsData.ip }, { linkstart: linkstart, description: description, postinquiry: inquiry }).then((value) => {
                 //     console.log(`Postiquiry: ${value}`);
                 //     res.send(value);
                 //     WRITEINLOG.WriteLogSuccessful("PostInquiry", JSON.stringify(value));
                 //     res.send((value.PostListItem.length > 1) ? "error" : value);
                 // }).catch(err => {
                 //     console.log(`Error Inquiry: ${err}`);
                 // });
             } // If
             else {
                 res.send("500");
             }// Else
         });
     } catch (error) {
         res.send(error);
         WRITEINLOG.WriteLogError("PostInquiry", error);
         console.log(`You have an error: ${error}`);
     } // Try
 });
 
 /**
  * +----------------------------------------------------------+
  * | Enviamos el cargo a la conexión IFC8 con los datos       |
  * | obtenidos del metodo post                                 |
  * +----------------------------------------------------------+
  *
  * @description Los hoteles son variables
  * @example /postrequest/1
  * @param {string} URL
  * @param {callback}
  * @returns {void}
  */
 APP.post("/postrequest/:hotel", (req, res) => {
     try {
         CONNECTTOAPI.Post("getLastCheckNumber", { id_hotel_b: req.body.hotelB }).then((consecutivenumber) => {
             const CONSECUTIVENUMBER = consecutivenumber;
             // Transformamos el monto en Int Por lo cual quitamos caracteres especiales
             let AMOUNT = GETPOSTIFC8.amountConvertion(req.body.amount);
             // Contiene la información requerida para el Opera y para abrir la conección con el socket
             const CHARGEINFO = {
                 thread: req.body.logged, 
                 hotel_b: req.body.hotelB, 
                 postrequest: XMLGENERATE.IFC8("PostRequest", { 
                     checknumber: parseInt(CONSECUTIVENUMBER.last_number) + 1 + req.body.revenuecenter[0], 
                     covers: "1", 
                     date: date._getDate(), 
                     discount: "0", 
                     hotel: req.session.tmp_opera_user.HotelId, 
                     creditlimitoverride: "", 
                     inquiryinformation: req.session.tmp_opera_user.RoomNumber, 
                     lastname: req.session.tmp_opera_user.LastName, 
                     matchfrompostlist: "1", 
                     paymentmethod: "1", // (req.session.tmp_opera_user.HotelId == "3") ? "16" : "1"
                     postingdescription: `Atendio: ${req.session.user.ti_name}`, 
                     requesttype: "4", 
                     reservationid: req.session.tmp_opera_user.ReservationId, 
                     revenuecenter: req.session.hotelInformation.hotelsData.opera_id_center, 
                     roomnumber: req.session.tmp_opera_user.RoomNumber, 
                     sequencenumber: "1234", 
                     servicecharge: "0", 
                     servingtime: "4", 
                     subtotal: AMOUNT, 
                     tax: "0", 
                     time: date._getTime(), 
                     tip: "0", 
                     totalamount: AMOUNT, 
                     waiterid: "CrossCharges", 
                     workstation: req.session.user.id_hotel
                 }), 
                 userinfo: { 
                     amount: AMOUNT, 
                     hotel_b: req.body.hotelB, 
                     tmp_opera_user: req.session.tmp_opera_user, 
                     user: req.session,
                     user_name: req.session.user.ti_name,
                 } 
             }
             
             // Enviamos los datos del cargo a un middleware que se encarga de conectar con IFC8
             ACTUALPROCESS.PostrequestProcess(CHARGEINFO).then((IFC8RESPONSE) => { // Enviamos los datos necesarios que nesecita opra para realizar un cargo mediante un middleware
                 const FOLIOTMP = IFC8RESPONSE.PostAnswer._attributes.ResponseText;
                 const FOLIO = FOLIOTMP.replace("Posting successful. Interface transaction number/s - ","");
                 const CROSSCHARGE = {
                     amount: req.body.amount, 
                     currency: req.body.currency, 
                     file: req.body.canvas, 
                     ticket: req.body.ticket, 
                     hotel_b: req.body.hotelB,
                     consumer: req.body.revenuecenter,
                     notes: req.body.notes,
                     dolar_change: req.body.dolar_change || 0,
                     complex: req.session.user.complex
                 };
                 CREATEDOCUMENT.SaveIMG(CROSSCHARGE.ticket, "./public/ticket/", "ticket_").then((ticket_name) => {
                     CROSSCHARGE.amount = CROSSCHARGE.amount.replace(/ /g, "");
                     const CHARGEINFO = {
                         room_number: req.session.tmp_opera_user.RoomNumber, 
                         first_name: req.session.tmp_opera_user.FirstName, 
                         last_name: req.session.tmp_opera_user.LastName, 
                         id_hotel_a: req.session.user.id_hotel, 
                         id_hotel_b: CROSSCHARGE.hotel_b, 
                         subtotal: CROSSCHARGE.amount, 
                         discount: "0.00", 
                         service_charge: CROSSCHARGE.amount, 
                         tax: 0.00, 
                         tip: 0.00, 
                         revenue_center: CROSSCHARGE.consumer, 
                         consume_center: CROSSCHARGE.category, 
                         folio: FOLIO, 
                         waiter_id: req.session.user.ti_name, 
                         signature_image: "", 
                         ticket_image: ticket_name, 
                         status_sent: 1, 
                         status_paid: 0,
                         currency: CROSSCHARGE.currency,
                         check_num: parseInt(CONSECUTIVENUMBER.last_number) + 1,
                         notes: CROSSCHARGE.notes
                     }
                     CONNECTTOAPI.Post("saveCrossCharge", CHARGEINFO).then((resolve) => {
                         if(req.session.consume_center != null) {
                             CONNECTTOAPI.Post("sendMailDistributionListByCC", { 
                                 folio: FOLIO, 
                                 name: `${req.session.tmp_opera_user.FirstName} ${req.session.tmp_opera_user.LastName}`, 
                                 room: req.session.tmp_opera_user.RoomNumber, 
                                 hotel_a: req.session.user.id_hotel, 
                                 hotel_b: CROSSCHARGE.hotel_b, 
                                 amount: CROSSCHARGE.amount, 
                                 consume_center: req.session.consume_center, 
                                 consume_cat: "CrossCharges", 
                                 currency: "MXN", 
                                 user_name: req.session.user.ti_name, 
                                 ticket_name: ticket_name, 
                                 check_num: parseInt(CONSECUTIVENUMBER.last_number) + 1, 
                                 okerror: "ok" 
                             }).then((resolve) => {
                                 res.json(IFC8RESPONSE);
                                 WRITEINLOG.WriteLogSuccessful("Postrequest", JSON.stringify(IFC8RESPONSE));
                             });
                         }
                         else {
                             CONNECTTOAPI.Post("sendMailDistributionList", { 
                                 folio: FOLIO, 
                                 name: `${req.session.tmp_opera_user.FirstName} ${req.session.tmp_opera_user.LastName}`, 
                                 room: req.session.tmp_opera_user.RoomNumber, 
                                 hotel_a: req.session.user.id_hotel, 
                                 hotel_b: CROSSCHARGE.hotel_b, 
                                 amount: CROSSCHARGE.amount, 
                                 consume_center: CROSSCHARGE.consumer, 
                                 consume_cat: "CrossCharges", 
                                 currency: "MXN", 
                                 user_name: req.session.user.ti_name, 
                                 ticket_name: ticket_name, 
                                 check_num: parseInt(CONSECUTIVENUMBER.last_number) + 1, 
                                 okerror: "ok" 
                             }).then((resolve) => {
                                 res.json(IFC8RESPONSE);
                                 WRITEINLOG.WriteLogSuccessful("Postrequest", JSON.stringify(IFC8RESPONSE));
                             });
                         }
                     })
                     .catch(err => {
                         WRITEINLOG.WriteLogError("Postrequest", err);
                         console.error(err);
                     }); 
                 });
             })
             .catch(err => {
                 WRITEINLOG.WriteLogError("Postrequest", err);
                 console.error(err);
             });
         });
     } catch (error) {
         console.log(error);
         WRITEINLOG.WriteLogError("Postrequest", err);
         res.send("error");
     }
 });
 
 /**
  * +--------------------------------+
  * | Return hotels to peticion ajax |
  * +--------------------------------+
  *
  * @param {string} URL
  * @param {callback}
  * @returns {void}
  */
 APP.post("/gethotel", (req, res) => {
     var gethotelpost = req.body.hotel;
     var contain_tmp_hotels = allHotels.hotelsData;
     for (let i = 0; i <= contain_tmp_hotels.length; i++) {
         if (contain_tmp_hotels[i].id_hotel == gethotelpost) {
             res.send(contain_tmp_hotels[i].name);
              break;
         }
     }
 });
 
 /**
  * +-----------------------------------------------------+
  * | Enviar la petición de cambio al servicio de correos |
  * +-----------------------------------------------------+
  *
  * @param {string} URL
  * @param {callback}
  * @returns {void}
  */
 APP.post("/reset_peticion", (req, res) => {
     let email = req.body.email;
     CONNECTTOAPI.Post("sendMailForgotPassword", { "email": email }).then((respuesta_api) => {
         res.json(respuesta_api);
     });
 });
 
 /**
  * +----------------------------------------------------------------+
  * | Upload signature temporal y guarda el cargo en el servicio     |
  * | y enviamos el mail de satisfacion                              |
  * +----------------------------------------------------------------+
  *
  * @param {string} URL
  * @param {callback}
  * @see https://www.npmjs.com/package/express-fileupload
  * @returns {void}
  */
 APP.post("/upload", (req, res) => {
     const CROSSCHARGE = {
         amount: req.body.amount,
         currency: req.body.currency,
         file: req.body.canvas,
         ticket: req.body.ticket,
         hotel_b: req.body.hotelB,
         consumer: req.body.revenuecenter,
     };
     CREATEDOCUMENT.SaveIMG(CROSSCHARGE.file, "./public/signature/", "signature_").then((name) => {
         const signature_name = name;
         REATEDOCUMENT.SaveIMG(CROSSCHARGE.ticket, "./public/signature/", "signature_").then((name) => {
             CROSSCHARGE.amount = CROSSCHARGE.amount.replace(/ /g, "");
             const ticket_name = name;
             const CHARGEINFO = {room_number: req.session.tmp_opera_user.RoomNumber, first_name: req.session.tmp_opera_user.FirstName,  last_name: req.session.tmp_opera_user.LastName, id_hotel_a: req.session.user.id_hotel,  id_hotel_b: CROSSCHARGE.hotel_b, subtotal: CROSSCHARGE.amount, discount: "0.00", service_charge: CROSSCHARGE.amount, tax: 0.00, tip: 0.00, revenue_center: CROSSCHARGE.consumer, consume_center: "CrossCharges", folio: FOLIO, waiter_id: req.session.user.ti_name, signature_image: signature_name, ticket_image: ticket_name, status_sent: 1, currency: CROSSCHARGE.currency}
             CONNECTTOAPI.Post("saveCrossCharge", CHARGEINFO).then((resolve) => {
                 CONNECTTOAPI.Post("sendMailDistributionList", { folio: FOLIO, name: `${req.session.tmp_opera_user.FirstName} ${req.session.tmp_opera_user.LastName}`, room: req.session.tmp_opera_user.RoomNumber, hotel_a: req.session.user.id_hotel,hotel_b: req_content.hotelB, amount: req_content.amount, consume_center: CROSSCHARGE.consumer, consume_cat: "CrossCharges", currency: "MXN", user_name: req.session.user.name, ticket_name: ticket_name, "okerror": "ok" }).then((resolve) => {
                     res.send(resolve);
                 });
             });
         });
     });
 });
 
 /**
  * +---------------------------------------------------------+
  * | Methodo de logeo, nos asigna a variables anteriormente  |
  * | declaradas los datos de el usuario logeado              |
  * +---------------------------------------------------------+
  *
  * @param {string} URL
  * @param {callback}
  * @returns {void}
  */
 APP.post('/auth', function (req, res) {
     var username = req.body.username;
     var usr_password = req.body.password;
     if ((username.length != 0) && (usr_password.length != 0)) {
         var password = 'averylongstringtocypheranythingc';
         var iv = password.substr(0, 16);
         var key = passwordDeriveBytes(password, '', 0, 32); // How it is
         var cipher = crypto.createCipheriv('aes-256-cbc', key, Buffer.from(iv));
         var decipher = crypto.createDecipheriv('aes-256-cbc', key, Buffer.from(iv));
         var encrypted = Buffer.concat([cipher.update(usr_password, 'utf8'), cipher.final()]).toString('base64');
 
         // Consumimos el servicio de inicio de session, que nos trae los datos del usuario logeado
         CONNECTTOAPI.Post("login", { "mac": "none", "user": username, "password": encrypted }).then((resolve) => {
             logeddUser = resolve;
             if (logeddUser.status == "success") {
                 CONNECTTOAPI.Post("getHotelById", {id_hotel: logeddUser.userData.id_hotel}).then((hotelData)=>{
                    req.session.hotelsession = hotelData.hotelsData;
                    req.session.newproccess = 0;
                    req.session.consume_center = logeddUser.consume_center;
                    req.session.loggedin = true; // Creamos una session en true (activa)
                    req.session.user = logeddUser.userData; // Guardamos el id del usuario logeado
                    req.session.hotelid = logeddUser.userData.id_hotel; // Guardamos el id del hotel
                    if (logeddUser.length != 0) {
                        res.send('200');
                    } // If
                    console.log(`>>> User logged: (${logeddUser.userData.user})`);
                 });
             } // If
             else {
                 res.send('404');
             }// Else
         });// Post
     } // If
     else {
         res.send('405');
     } // Else
 });
 
 /**
  * +--------------------------------------------+
  * | Cerramos la session del navegador          |
  * +--------------------------------------------+
  *
  * @param {string} URL
  * @param {callback}
  * @return {void}
  */
 APP.get("/logout", (req, res) => {
     req.session.loggedin = false;
     res.redirect("/login");
 });
 
 /**
  * Se manda una petición al POS de Opera y se obtiene los usuarios por 
  * su nombre
  * @url "/getHuespedLastname"
  * @param {Object} req.body.search
  */
  APP.post("/getHuespedLastname", (req, res) => {
     try {
         CONNECTTOAPI.Post("getHotelById", { id_hotel: req.body.hotelToSearch}).then(getHotelInfo => {
             const postinquiry = XMLGENERATE.IFC8("PostInquery", { 
                 time: date._getTime(), 
                 date: date._getDate(), 
                 inqueryinfo: req.body.search,
                 maxreturnmatch: "40", 
                 sequencenumber: "1234", 
                 revenuecenter: "VLIM REQUEST", 
                 requesttype: "10", 
                 paymethod: "16", 
                 waiterid: "VLIM", 
                 workstationid: "Station_1"
             });
             const WORKER_MAIN = new Worker("./functions/SearchByLastname.js");
 
             WORKER_MAIN.on("message", result => {
                 res.send(result.data);
                 console.log(result.data)
                 WRITEINLOG.WriteLogSuccessful("Postrequest", result.data);
             });
             WORKER_MAIN.on("error", error => {
                 res.send(error);
                 console.log("Error", error);
                 WRITEINLOG.WriteLogError("GetHuespedLastname", error);
             });
 
             WORKER_MAIN.postMessage({url: `${getHotelInfo.hotelsData.ip}:${getHotelInfo.hotelsData.port}`, payload: {
                 description: description,
                 postinquiry: postinquiry
             }});
         });
     }
     catch(err) {
         console.log(err);
     }
 });
 
 /**
  * +------------------------------------------------------+
  * | Vista principal, aqui se carga la información del    |
  * | usuario logeado y mas sobre el hotel donde pertenece |
  * +------------------------------------------------------+
  *
  * @param {string} URL
  * @param {callback}
  * @returns {void}
  */
 APP.get('/', function (req, res) {
     if (req.session.loggedin) {
         var tmp_hotels_for_count = allHotels.hotelsData;
         var notLoggedHotel = [];
 
         // Quitamos en la lista de hoteles el hotels con en que se logeo el usuario
         for (let i = 0; i < tmp_hotels_for_count.length; i++) {
             if (tmp_hotels_for_count[i].id_hotel != req.session.user.id_hotel) {
                 notLoggedHotel.push(tmp_hotels_for_count[i]);
             }
         }
 
         // Buscamos el hotel donde el usuario esta logeado
         CONNECTTOAPI.Post("getHotelById", { "id_hotel": req.session.hotelid }).then((resolve) => {
             req.session.hotelInformation = resolve;
             // Mandamos a vista las variables necesarias para mostrarlas
             res.render('index', {
                 pageTitle: "Seleccion de huésped - RLH",
                 bodyClass: "index",
                 hotelInformation: resolve,
                 logeddUser: req.session.user,
                 catHotels: notLoggedHotel
             });
         });
     } else {
         res.redirect("/login");
     }
 });
 
 /**
  * +----------------------------------------------------------------+
  * | Mostramos la vista del login, aqui solo mandamos configuración |
  * | basica para la vista como variables con texto y el tipo        |
  * | de vista                                                       |
  * +----------------------------------------------------------------+
  *
  * @author Josué Hernández
  * @see https://handlebarsjs.com/guide
  */
 APP.get("/login", (req, res) => {
     if (req.session.loggedin) {
         res.redirect("/");
     } else {
         res.render("login", {
             pageTitle: "Inicia sesión - RLH",
             bodyClass: "login-form"
         });
     }
 });
 
 /**
  * +------------------------------------------------------+
  * | Vista de cambio de contraseña, enviamos información  |
  * | Basica para la vista                                 |
  * +------------------------------------------------------+
  *
  * @param {string} URL
  * @param {callback}
  * @returns {void}
  */
 APP.get("/reset", (req, res) => {
     if (req.session.loggedin) {
         res.redirect("/");
     }
     else {
         res.render("repassword", {
             pageTitle: "Recupera tu contraseña - RLH",
             bodyClass: "login-form"
         });
     }
 });
 
 /**
  * +-----------------------------------------------+
  * | Vista para cambiar la contraseña del usurio   \
  * +-----------------------------------------------+
  *
  * @param {string} URL
  * @param {callback}
  * @returns {void}
  */
 APP.get("/resetpassword/:sha", (req, res) => {
     var sha = req.params.sha;
     if (req.session.loggedin) {
         res.redirect("/");
     } else {
         CONNECTTOAPI.Post("validateHash", { hashh: sha }).then((getData) => {
             let status;
             if (getData.status == "error") {
                 status = true;
             } else {
                 status = false;
             }
             res.render("update_password", {
                 pageTitle: "Inicia sesión - RLH",
                 bodyClass: "login-form",
                 backTreeDir: true,
                 sha: sha,
                 status: status
             });
         });
     }
 });
 
 /**
  * +-----------------------------------------------+
  * | Vista de usuario para realizar cargo          |
  * +-----------------------------------------------+
  *
  * @param {string} URL
  * @param {callback}
  * @returns {void}
  */
 APP.get("/user/:id/:hotel", (req, res) => {
     if (req.session.loggedin) {
         var contain_hotel_request = [];
         CONNECTTOAPI.Post("getHotelById", { id_hotel: req.params.hotel }).then((resolve) => {
             contain_hotel_request = resolve;
             res.render("user", {
                 pageTitle: "Cross Charge - RLH",
                 bodyClass: "user",
                 backTreeDir: true,
                 userContent: req.session.tmp_opera_user,
                 userLogged: req.session.user,
                 hotelInformation: contain_hotel_request,
                 consumerCat: consumerCat.consumecatData[0],
                 consumerCenter: req.session.hotelInformation,
                 getCurrency: currency.currencyData[0],
             });
         });
     } else {
         res.redirect("/login");
     }
 });
 
 /**
  * +-----------------------------------+
  * | Vista para generar cargo offline  |
  * +-----------------------------------+
  *
  * @param {string} URL
  * @param {callback}
  * @returns {void}
  */
 APP.get("/charge-offline/:room/:hotel", (req, res) => {
     if (req.session.loggedin) {
         var contain_hotel_request = [];
         CONNECTTOAPI.Post("getHotelById", { id_hotel: req.params.hotel }).then((resolve) => {
             contain_hotel_request = resolve;
             res.render("user-offline", {
                 pageTitle: "Cargos offline - RLH",
                 bodyClass: "user",
                 backTreeDir: true,
                 roomnumber: req.params.room,
                 userLogged: req.session.user,
                 hotelInformation: contain_hotel_request,
                 consumerCat: consumerCat.consumecatData[0],
                 consumerCenter: req.session.hotelInformation,
                 getCurrency: currency.currencyData[0],
             });
         });
     } else {
         res.redirect("/login");
     }
 });
 
 /**
  * +----------------------------------+
  * | Guardamos un nuevo cargo offline |
  * +----------------------------------+
  *
  * @param {string} URL
  * @param {callback}
  * @returns {void}
  */
 APP.post("/chargeoffline", (req, res) => {
     try {
         const REQUESTDATA = req.body;
         REQUESTDATA.amount = REQUESTDATA.amount.replace(/\$(?=[$&`'\d])/g, "");
         REQUESTDATA.amount = REQUESTDATA.amount.replace(/,/g, "");
         // Guardamos los archivos
         CREATEDOCUMENT.SaveIMG(REQUESTDATA.ticket, "./public/ticket/", "ticket_").then((TICKET) => {
             CONNECTTOAPI.Post("getLastCheckNumber", { id_hotel_b: REQUESTDATA.hotelB }).then((CONSECUTIVENUMBER) => {
                 const CHARGEINFO = {
                     room_number: REQUESTDATA.room,
                     first_name: REQUESTDATA.guest,
                     last_name: "",
                     id_hotel_a: req.session.user.id_hotel,
                     id_hotel_b: REQUESTDATA.hotelB,
                     subtotal: REQUESTDATA.amount,
                     discount: "0.00",
                     service_charge: REQUESTDATA.amount,
                     tax: 0.00,
                     tip: 0.00,
                     revenue_center: REQUESTDATA.consumer,
                     consume_center: "CrossCharges",
                     waiter_id: req.session.user.ti_name,
                     signature_image: "",
                     ticket_image: TICKET,
                     status_sent: 1,
                     status_paid: 0,
                     offline: 1,
                     notes: REQUESTDATA.notes,
                     currency: REQUESTDATA.currency,
                     check_num: parseInt(CONSECUTIVENUMBER.last_number) + 1
                 }
                 CONNECTTOAPI.Post("saveCrossCharge", CHARGEINFO).then((resolve) => {
                     if(req.session.consume_center != null) {
                         CONNECTTOAPI.Post("sendMailDistributionListByCC", {
                             name: `${REQUESTDATA.guest}`,
                             room: REQUESTDATA.room,
                             hotel_a: req.session.user.id_hotel,
                             hotel_b: REQUESTDATA.hotelB,
                             amount: REQUESTDATA.amount,
                             consume_center: req.session.consume_center,
                             consume_cat: "CrossCharges",
                             currency: "MXN",
                             user_name: req.session.user.ti_name,
                             ticket_name: TICKET,
                             "okerror": "ok",
                             check_num: parseInt(CONSECUTIVENUMBER.last_number) + 1,
                             offline: 1
                         }).then((resolve) => {
                             res.send("safe");
                             WRITEINLOG.WriteLogSuccessful("Offline", JSON.stringify(resolve));
                         });
                     }
                     else {
                         CONNECTTOAPI.Post("sendMailDistributionList", {
                             name: `${REQUESTDATA.guest}`,
                             room: REQUESTDATA.room,
                             hotel_a: req.session.user.id_hotel,
                             hotel_b: REQUESTDATA.hotelB,
                             amount: REQUESTDATA.amount,
                             consume_center: REQUESTDATA.consumer,
                             consume_cat: "CrossCharges",
                             currency: "MXN",
                             user_name: req.session.user.ti_name,
                             ticket_name: TICKET,
                             "okerror": "ok",
                             check_num: parseInt(CONSECUTIVENUMBER.last_number) + 1,
                             offline: 1
                         }).then((resolve) => {
                             WRITEINLOG.WriteLogSuccessful("Postrequest", JSON.stringify(resolve));
                             res.send("safe");
                         });
                     }
                 });
             });
         });
     }
     catch(err){
         WRITEINLOG.WriteLogError("Offline", err);
     }
 });
 
 /**
  * +-----------------------------------+
  * | Vista para generar un Ticket      |
  * +-----------------------------------+
  * 
  * @param {string} URL
  * @param {callback}
  * @returns {void}
  */
  APP.get("/ticket", (req, res) => {
     if (req.session.loggedin) {
         res.render("ticket", {
             pageTitle: "Add Ticket - RLH",
             bodyClass: "index",
             id_hotel: req.session.hotelid,
             id_usuer: req.session.user.id_user,
             hotel: req.session.hotelsession.name
         });
     } else {
         res.redirect("/");
     }
 });
 
 /**
  * +-------------------------------------------------+
  * | Obtener la lista de cargos por Hotel y Usuario  |
  * +-------------------------------------------------+
  * 
  * @param {string} URL
  * @param {callback}
  * @returns {void}
  */
  APP.get("/getCharges", (req, res) => {
     if(req.session.hotelsession != undefined) {
         CONNECTTOAPI.Post("getChargesByHotelUser", { "id_hotel": req.session.hotelsession.id_hotel, "user": req.session.user.ti_name }).then((resolve) => {
             res.send(resolve);
         });
     }
     else {
         res.send({
             status: "error"
         });
     }
 });
 
 /**
  * +-----------------------------------------------------+
  * | Creamos un puerto de comunicación para un servidor  |
  * +-----------------------------------------------------+
  *
  * @returns {void}
  */
 APP.listen(DEVPORT, () => {
     console.log(`>>> The server is ready in port: (${DEVPORT})`);
     console.log(`>>> Press CTRL + c to finish the server`);
 });