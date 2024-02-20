/**
 * Contain all general functions
 * 
 * @author Josué Hernández <josue.hernandez@vlim.com.mx>
 * @see https://jquery.com/
 */
 $(document).ready(function () {
    let api = axios.create({
        baseURL: "https://dev.crosschargesrlh.com/rlh_ws/"
    });

    verifyLastnameIsInit();
    getDolar();

    $(document).on("change", "#select_hotel", function(){
        if($(this).val() == '5' || $(this).val() == '3') {
            $("#not-fairmont").hide();
            $("#search_by_lastname").hide();
            $("#search_by_numberroom").show();
        }
        else{
            $("#not-fairmont").show();
            verifyLastnameIsInit();
        }
    }); 

    function verifyLastnameIsInit() {
        if($("#search_lastname").is(":checked")) {
            $("#search_by_lastname").show();
            $("#search_by_numberroom").hide();
        }
        else {
            $("#search_by_lastname").hide();
            $("#search_by_numberroom").show();
        }
    }

    /**
     * Validamos que el campo de nombre o apellido solo contenga letras
     * @return {void}
     */
    $(document).on("keypress", "#nameorlastname", function(e) {
        var regex = new RegExp("^[a-zA-Z ]+$");
        var key = String.fromCharCode(!e.charCode ? e.which : e.charCode);
        if (!regex.test(key)) {
            e.preventDefault();
            return false;
        }
    });

    /**
     * Mostrar el input para tipo de busqueda nombre apellido
     * @returns {void}
     */
    $(document).on("change", "#search_lastname", function(e) {
        try {
            iziToast.destroy();
            if($(this).is(":checked")){
                $("#search_by_lastname").show();
                $("#search_by_numberroom").hide();
                iziToast.success({
                    timeout: 1500,
                    position: "bottomCenter",
                    message: "Ahora puedes buscar huéspedes por nombre y/o apellidos"
                });
            }
            else{
                $("#search_by_lastname").hide();
                $("#search_by_numberroom").show();
                iziToast.success({
                    timeout: 1500,
                    position: "bottomCenter",
                    message: "Ahora puedes buscar huéspedes por número de habitación"
                });
            }
        }
        catch(err) {
            console.log(err);
        }
    });

    /**
     * +------------------------------------------+
     * | Botton offline - Envia el id del hotel y |
     * | el numero de la habitación               |
     * +------------------------------------------+
     * 
     * @param string event
     * @param string DOM Object
     * @param callback
     * @return void
     */
    $(document).on("click", ".btn-offline", function(){
        const GUESTREFERENSE = {
            room: $("#room").val(),
            hotel: $("#select_hotel").val()
        }
        location = `/charge-offline/${GUESTREFERENSE.room}/${GUESTREFERENSE.hotel}`;
    });

    /**
     * Block the event submit in form
     * 
     * @param callback {jQuery}
     */
    $(document).on("submit", ".block-submit", function (e) {
        e.preventDefault();
    });

    const showHuesped = (tmp, count, hotel_val) => {
        const jsonString = JSON.stringify(tmp).replace(/\"/g,"&quot;");
        if (tmp.NoPost === '0') {
            $("#guest_content").append(`<li onClick="loadTempUser(${jsonString},'${count}','${hotel_val}')" class="list-group-item list-group-item-action flex-column align-items-start"><div class="d-flex w-100 justify-content-between"><h5 class="mb-1">${tmp.FirstName} ${tmp.LastName}</h5></div><small>Credito activo</small></li>`);
        } else {
            $("#guest_content").append(`<li class="list-group-item list-group-item-action list-group-item-danger flex-column align-items-start"><div class="d-flex w-100 justify-content-between"><h5 class="mb-1">${tmp.FirstName} ${tmp.LastName}</h5></div><small>Sin credito</small></li>`);
        }
    }

    function searchFHPRoom(room) {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: "https://dev.crosschargesrlh.com/rlh_ws/getRoomFairmont",
                data: JSON.stringify({code: room}),
                dataType: "JSON",
                type: "POST",
                success(data) {
                    resolve((data.status != 500) ? data.result : 0);
                }
            });
        });
    }

    function getInMultiple() {

    }
    /**
     * Open guest modal  Mandarina - validate empty inputs
     * 
     * @param callback {jQuery}
     */
     $(document).on("click", ".open-guest-modal-mandarina", function () {
        $(this).attr("disabled", true);
        $(this).html(`<div class="spinner-border text-light" role="status"><span class="sr-only">Loading...</span></div>`);
        let validation = validateData({hotel: GetHotel, room: RoomNumber, guess: LastnameGuess});
        let return_guees = {};
        if(validation.validate) {
            getMandarinaOneAndOnly(GetHotel.value, RoomNumber.value).then(result => {
                if("PostList" in result) {
                    if(Array.isArray(result.PostList.PostListItem)) {
                        if(Array.isArray(result.PostList.PostListItem)) {
                            result.PostList.PostListItem.forEach(elm => {
                                if(elm._attributes.LastName == LastnameGuess.value && elm._attributes.NoPost == "0") {
                                    return_guees = elm._attributes;
                                }
                            });
                        }
                        else {
                            return_guees = result.PostList.PostListItem.find(elm => elm._attributes.RoomNumber == RoomNumber.value && elm._attributes.NoPost == "0");
                        }
                    }
                    else {
                        for (let [key, value] of Object.entries(result.PostList.PostListItem._attributes)) {
                            if(key == "LastName") {
                                return_guees = (value == LastnameGuess.value) ? result.PostList.PostListItem._attributes : undefined;
                            }
                        }
                    }
                    saveChargeMandarina(return_guees, GetHotel.value);
                }
                else {
                    iziToast.destroy();
                    iziToast.error({
                        position: "topCenter",
                        message: `Lo sentimos, pero no hay ningun registro con este apellido: <b>${LastnameGuess.value}<b>.`
                    });
                }
                $(this).attr("disabled", false);
                $(this).html(`<span class="text">Buscar Huésped</span>`);
            });
        }
        else {
            iziToast.destroy();
            iziToast.error({
                position: "topCenter",
                message: "Por favor, completa todos los datos solicitados."
            });
            $(this).attr("disabled", false);
            $(this).html(`<span class="text">Buscar Huésped</span>`);
        }
    });

    function saveChargeMandarina(user, hotel_id) {
        if(user != undefined) {
            if(user.NoPost == "0") {
                $.ajax({
                    url: "/recivetmpuser",
                    data: user,
                    type: "POST",
                    success: (data) => {
                        window.location = `/user/1/${hotel_id}/`;
                    }
                });
            }
            else {
                iziToast.destroy();
                iziToast.error({
                    position: "topCenter",
                    message: `Lo sentimos, pero este huésped no tiene credito activo.`
                });
            }
        }
        else {
            iziToast.destroy();
            iziToast.error({
                position: "topCenter",
                message: `Lo sentimos, pero número de habitación ingresado no coincide.`
            });
        }
    }

    function getDolar() {
        api.get("/getActiveDolar").then(({ data }) => {
            if(data.status == 200) {
                $("#PriceDolarActive").html(`$${data.message.tipo_cambio} <span>USD</span>`);
                localStorage.setItem("id_dolar", data.message.id_tipo_cambio);
            }
        });
    }

    $(document).on("change", ".remove-validation", function() {
        $(this).parent().removeClass("empty-i");
    });

    /**
     * validateData: Validaciones para la sección de busqueda
     * @params Object objects
     */
    function validateData(objects) {
        let last_validate = null;
        for(let elem in objects) {
            if(objects[elem].value.length == 0 || objects[elem].value == 0) {
                objects[elem].parentNode.classList.add("empty-i");
                last_validate = elem;
                break;
            }
        }
        return {
            validate: (last_validate == null) ? 1 : 0,
            type: last_validate
        }
    }

    /**
     * Manda un fetch a un endpoint
     * @param {Int} id_hotel 
     * @param {String} guest_info 
     */
     function getMandarinaOneAndOnly(id_hotel, lastname) {
        return new Promise((resolve, reject) => {
            try {
                axios.post("/getHuespedLastname", {
                    hotelToSearch: id_hotel,
                    search: lastname
                }).then(({data}) => {
                    
                    if("PostList" in data) {
                        resolve(data);
                    }
                    else if ("PostAnswer" in data){
                        if(data['PostAnswer']['_attributes']['AnswerStatus'] == "NG") {
                            iziToast.destroy();
                            iziToast.error({
                                position: "topCenter",
                                message: "Usuario no encontrado, revise que los datos ingresados sean correctos."
                            });
                            $(".open-guest-modal-mandarina").attr("disabled", false);
                            $(".open-guest-modal-mandarina").html(`<span class="text">Buscar Huésped</span>`);
                        }
                    }
                    else {
                        window.location = `/charge-offline/${RoomNumber.value}/${GetHotel.value}`;
                    }
                });
            }
            catch(err) {
                reject(err);
            }
        });
    }


    /**
     * Open guest modal - validate empty inputs
     * 
     * @param callback {jQuery}
     */
    $(document).on("click", ".open-guest-modal", async function () {
        const hotel = $("#select_hotel");
        const hotel_val = hotel.val();
        var room = $("#room").val();

        if(hotel.val() == "5"){
            room = await searchFHPRoom(room);
            $("#search_by_lastname").hide();
            $("#search_by_numberroom").show();
        }

        $("#guest_content").html("");
        $(this).html('<span class="spinner-border align-middle spinner-border-sm" role="status" aria-hidden="true"></span>');
        $("#peticion_guest_spiner").show();
        $(".hide-offline").addClass("charge-offline");
        if($("#search_lastname").is(":checked")){
            if (hotel.val() == 0) {
                $(this).html('<span class="text">Buscar Huésped</span>');
                hotel.parent(".input-index").addClass("empty-i");
                iziToast.destroy();
                iziToast.error({
                    position: "topCenter",
                    message: "Indica el hotel donde deseas buscar..."
                });
            } 
            else if ($("#nameorlastname").val().length == 0) {
                $(this).html('<span class="text">Buscar Huésped</span>');
                iziToast.destroy();
                iziToast.error({
                    position: "topCenter",
                    message: "Ingresa el apellido del huésped que deseas buscar..."
                });
                $("#nameorlastname").parent().parent(".input-index").addClass("empty-i");
            }
            else {
                getGuestByLastname(hotel_val, $("#nameorlastname").val());
            }
        }
        else {
            $.ajax({
                url: "/inquiry",
                data: {
                    room: room,
                    hotel: hotel_val
                },
                type: "POST",
                success: (data) => {
                    $(this).html('<span class="text">Buscar Huésped</span>');
                    $("#peticion_guest_spiner").hide();
                    if(data != "error"){ // Error en opera
                        if(data != "500"){ // Error de hotel no encontrado
                            if(data != "501"){
                                $(".hide-offline").addClass("charge-offline")
                                if (data.PostListItem.constructor === Array) {
                                    var count = 0;
                                    data.PostListItem.forEach(element => {
                                        var tmp = element._attributes;
                                        showHuesped(tmp, count, hotel_val);
                                        count++;
                                    });
                                }else{
                                    var tmp = data.PostListItem._attributes;
                                    var count = 0;
                                    showHuesped(tmp, count, hotel_val);
                                    count++;
                                }
                            }else{
                                $("#guest_content").append(`<li class="list-group-item disabled text-center">No hay registros en esta habitación</li>`);        
                            }
                        }else{
                            $("#guest_content").append(`<li class="list-group-item disabled text-center">El hotel que intentas buscar no existe</li>`);    
                        }
                    }else{
                        $("#guest_content").append(`<li class="list-group-item disabled text-center">Error al conectar con Opera</li>`);
                        $(".hide-offline").removeClass("charge-offline");
                    }
                }
            });
    
            if (hotel.val() == 0) {
                $(this).html('<span class="text">Buscar Huésped</span>');
                hotel.parent(".input-index").addClass("empty-i");
                iziToast.destroy();
                iziToast.error({
                    position: "topCenter",
                    message: "Indica el hotel donde deseas buscar..."
                });
            } else if (room.length == 0) {
                $(this).html('<span class="text">Buscar Huésped</span>');
                iziToast.destroy();
                iziToast.error({
                    position: "topCenter",
                    message: "Ingresa el numero de la habitación que deseas buscar..."
                });
                $("#room").parent().parent(".input-index").addClass("empty-i");
            } else {
                // const hotel_name;
                $.ajax({
                    url: "/gethotel",
                    data: {
                        hotel: hotel.val(),
                    },
                    type: "POST",
                    success: (data) => {
                        $(".info-hotel").text(`Room: ${room} - Hotel: ${data}`);
                    }
                });
                $("#usrview23").modal("show");
            }
            return false;
        }
    });
    /**
     * Manda un fetch a un endpoint
     * @param {Int} id_hotel 
     * @param {String} guest_info 
     */
    function getGuestByLastname(id_hotel, guest_info) {
        try {
            $("#guest_lastname_content").html("");
            fetch("/getHuespedLastname", {
                method: "POST",
                headers: {"Content-type": "Application/json"},
                body: JSON.stringify({
                    hotelToSearch: id_hotel,
                    search: guest_info
                })
            }).then(data => data.json()).then(LastnameRequest => {
                if("code" in LastnameRequest) {
                    switch (LastnameRequest.code) {
                        case 3001:
                            $("#guest_lastname_content").html(`<li class="list-group-item disabled text-center">Lo sentimos pero ocurrio un error al obtener la información</li>`);
                            $("#hide-offline-lastname").show();
                            break;

                        case 3002:
                            $("#guest_lastname_content").html(`<li class="list-group-item disabled text-center">Lo sentimos el servidor tardo demasiado en responder.</li>`);
                            $("#hide-offline-lastname").show();
                            break;
                    
                        default:
                            $("#guest_lastname_content").html(`<li class="list-group-item disabled text-center">Error al conectar con Opera</li>`);
                            $("#hide-offline-lastname").show();
                            break;
                    }
                }
                else {
                    if("PostAnswer" in LastnameRequest) {
                        $("#guest_lastname_content").html(`<li class="list-group-item disabled text-center">No existen registros con ese Apellido</li>`);
                    }
                    else {
                        const PostListItem = LastnameRequest.PostList.PostListItem;
                        localStorage.setItem("lastnameResult", JSON.stringify(PostListItem));
                        localStorage.setItem("hotel_id", id_hotel);
                        if(PostListItem.length > 0){
                            PostListItem.forEach(item => {
                                $("#guest_lastname_content").append(`
                                    <li data-position="${item._attributes.ProfileId}" class="list-group-item list-group-item-action ${(item._attributes.NoPost == "0") ? "get-result" : "list-group-item-danger not-credit"} flex-column align-items-start">
                                        <div class="d-flex w-100 justify-content-between">
                                            <h5 class="mb-1">${item._attributes.FirstName} ${item._attributes.LastName}</h5>
                                            <small>Room: ${item._attributes.RoomNumber}</small>
                                        </div>
                                        <small>Credito: ${(item._attributes.NoPost == "0") ? '<span class="badge badge-success">Activo</span>': '<span class="badge badge-danger">Inactivo</span>'}</small>
                                    </li>
                                `);
                            });
                        }
                        else {
                            if(typeof PostListItem == 'object') {
                                const item = PostListItem;
                                $("#guest_lastname_content").html(`
                                    <li data-position="${item._attributes.ProfileId}" class="list-group-item get-result list-group-item-action ${(item._attributes.NoPost == "0") ? "get-result" : "list-group-item-danger not-credit"} flex-column align-items-start">
                                        <div class="d-flex w-100 justify-content-between">
                                            <h5 class="mb-1">${item._attributes.FirstName} ${item._attributes.LastName}</h5>
                                            <small>Room: ${item._attributes.RoomNumber}</small>
                                        </div>
                                        <small>Credito: ${(item._attributes.NoPost == "0") ? '<span class="badge badge-success">Activo</span>': '<span class="badge badge-danger">Inactivo</span>'}</small>
                                    </li>
                                `);
                            }
                        }
                    }
                }
                $("#lastnameview").modal("show");
                $(".open-guest-modal").html('<span class="text">Buscar Huésped</span>');
            });
        }
        catch(err){
            $(".open-guest-modal").html('<span class="text">Buscar Huésped</span>');
            console.log(err);
        }
    }

    /**
     * Guarda en sesión el huesped al que se le aplicara el cargo
     */
    $(document).on("click", ".get-result", function() {
        try {
            const getInquiryResponse = JSON.parse(localStorage.getItem("lastnameResult"));
            const guestId = `${$(this).data("position")}`;
            const hotelID = localStorage.getItem("hotel_id");
            if(getInquiryResponse.length > 0) {
                getInquiryResponse.forEach(item => {
                    const searchGuest = [item].find(returned => returned._attributes.ProfileId === guestId);
                    if(searchGuest != undefined) {
                        $.ajax({
                            url: "/recivetmpuser",
                            data: searchGuest._attributes,
                            type: "POST",
                            success: (data) => {
                                window.location = `/user/1/${hotelID}/`;
                                localStorage.removeItem("hotel_id");
                            }
                        });
                    }
                });
            }
            else {
                const searchGuest = [getInquiryResponse].find(returned => returned._attributes.ProfileId === guestId);
                if(searchGuest != undefined) {
                    $.ajax({
                        url: "/recivetmpuser",
                        data: searchGuest._attributes,
                        type: "POST",
                        success: (data) => {
                            window.location = `/user/1/${hotelID}/`;
                            localStorage.removeItem("hotel_id");
                        }
                    });
                }
            }
        }
        catch(err){
            console.log(err);
        }
    });

    function saveInSession(data, hotel_id) {
        try {
            $.ajax({
                url: "/recivetmpuser",
                data: searchGuest._attributes,
                type: "POST",
                success: (data) => {
                    window.location = `/user/1/${hotelID}/`;
                    localStorage.removeItem("hotel_id");
                }
            });
        }
        catch(err) {
            console.log(err);
        }
    }

    /**
     * Ocultamos el offline cuando el modal se cierre
     */
    $('#lastnameview').on('hidden.bs.modal', function (e) {
        $("#hide-offline-lastname").hide(); 
        localStorage.removeItem("lastnameResult");
        localStorage.removeItem("hotel_id");
    });

    /**
     * Delete class empty-i in input room
     * 
     * @param callback {jQuery}
     */
    $(document).on("change", "#room", function () {
        $(this).parent().parent(".input-index").removeClass("empty-i");
    });

    /**
     * Delete class empty-i in select
     * 
     * @param callback {jQuery}
     */
    $(document).on("change", "#select_hotel", function () {
        $(this).parent(".input-index").removeClass("empty-i");
        if($(this).val() == 5){
            $("#room").attr("type", "text");
            $("#room").attr("placeholder", "Residencia");
        }
        else {
            $("#room").attr("type", "number");
            $("#room").attr("placeholder", "Número de habitación");
        }
    });

    /**
     * Delete class empty-i in select
     * 
     * @param callback {jQuery}
     */
     $(document).on("change", "#nameorlastname", function () {
        $(this).parent(".input-index").removeClass("empty-i");
    });

    /**
     * Boton de ayuda - enter mouse
     * 
     */
    $(document).on("mouseenter", ".btn-outline-dark", function(){
        $(this).children("i").css({"color": "#fff"});
    });

    /**
     * Boton de ayuda - mouse leave
     * 
     */
    $(document).on("mouseleave", ".btn-outline-dark", function(){
        $(this).children("i").css({"color": "#000"});
    });

    /**
     * +-----------------------------------------+
     * | Limpiamos el log de busqueda de usuario |
     * +-----------------------------------------+
     * 
     * @param string DOM Object
     * @param callback
     * @return void
     */
    $(".close-offline-botton").click(function(){
        $(".open-guest-modal").html('<span class="text">Buscar Huésped</span>');
        $("#peticion_guest_spiner").show();
        $(".hide-offline").addClass("charge-offline");
        $("#guest_content").html();
    });

    function getCharges() {
        $.ajax({
            url: "/getCharges",
            type: "GET",
            success: (data) => {
                if (data.status === 'OK') {
                    $('#tbodyCharges').html('');

                    const { charges } = data;

                    charges.forEach(charge => {
                        var now = moment(charge.fecha, 'HH:mm');
                        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
                        $('#tbodyCharges').append(`<tr>
                            <td>${charge.mesero}</td>
                            <td>${charge.name_hotel_b}</td>
                            <td class="text-center">${charge.room_number}</td>
                            <td>${charge.first_name} ${charge.last_name}</td>
                            <td class="text-center">${charge.subtotal.replace(/\s/g, '')}</td>
                            <td class="text-center">
                                <span class=" badge ${charge.offline_num > 0 ? 'badge-warning' : 'badge-primary'}">
                                    ${charge.offline_num > 0 ? 'Offline' : 'Online'}
                                </span>
                            </td>
                            <td>${now.format('YYYY/MM/DD HH:mm')}</td>
                        </tr>`);
                    });

                    $('#tableCharges').DataTable( {
                        dom: 'B',
                        buttons: [
                            {
                                extend:'pdfHtml5',
                                attr: { class: 'btn btn-outline-danger mb-2 py-1'},
                                text:'PDF',
                                title: 'Reporte de cargos',
                                customize : function(doc){
                                    let colCount = new Array();
                                    $('#tableCharges').find('tbody tr:first-child td').each(function(){
                                        if($(this).attr('colspan')){
                                            for(var i=1;i<=$(this).attr('colspan');$i++){
                                                colCount.push('*');
                                            }
                                        }else{ colCount.push('*'); }
                                    });
                                    doc.content[1].table.widths = colCount;

                                    doc.content.splice( 0, 0, {
                                        alignment: 'left',
                                        height: 45,
                                        width: 160,
                                        image: 'data:image/png;base64,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'
                                    } );
                                }
                            },
                            {
                                extend: 'excelHtml5',
                                attr: { class: 'btn btn-outline-success mb-2 py-1'},
                                text:'Excel',
                                title: 'Reporte de cargos - RLH',
                            }
                        ]
                    } );
                }else{
                    $('#tbodyCharges').html('<tr><td colspan="5" class="text-center">No se encuentra ningún cargo por el momento</td></tr>');
                }
            }
        });
    };

    getCharges();

    const changeAnimation = () => {
        $('#div-background').toggleClass('div-background');
        $('.vp-width').toggleClass('acttive');
        
        $('#notifications').toggleClass('d-none');
        $('#notifications').toggleClass('a-intro');
        
        $('#notifications2').toggleClass('d-none');
        $('#notifications2').toggleClass('a-intro');
    }

    $('#notifications').click(() => {
        changeAnimation();
    });
    $('#notifications2').click(() => {
        changeAnimation();
    });
    $('#div-background').click(() => {
        changeAnimation();
    });
});

const loadTempUser = (tmp, count, hotel_val) => {
    $.ajax({
        url: "/recivetmpuser",
        data: tmp,
        type: "POST",
        success: (data) => {
            console.log(data);
            location.href = `/user/${count}/${hotel_val}/`;
        }
    });
}