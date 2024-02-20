/**
 * Function: Signature functions
 *
 * @author Josué Hernández
 */
// var signaturePad = new SignaturePad(document.getElementById("signature-pad"), {
//     backgroundColor: "rgba(255, 255, 255, 0)",
//     penColor: "rgb(0, 0, 0)"
// });
// var cancelButton = document.getElementById("clear");
// cancelButton.addEventListener("click", function (event) {
//     signaturePad.clear();
//     $("#emailcharge").val("");
// });

/**
 * Function: Input mask number
 *
 * @author Josué Hernández
 */
/*var currencyMask = IMask(document.getElementById("import"), {
    mask: "$num",
    blocks: {
        num: {
            // nested masks are available!
            mask: Number,
            thousandsSeparator: ",",
            mapToRadix: ["."],
            radix: "."
        }
    }
});*/

var imgobjectGlobal;
// Execute when start the documennt
$(document).ready(function () {
    /**
     * +--------------------------------------------------+
     * | Enviamos el cargo al un middleware en node       |
     * | donde se encargara de enviar el correo de cargo  |
     * | exitoso                                          |
     * +--------------------------------------------------+
     * 
     * @param string event
     * @param string DOMObject
     * @param callback
     * @return void
     */
    $(document).on("click", "#next_charge_offline", function(){
        const obj = $(this);
        const CANVAS = document.getElementById("signature-pad");
        const DATAURL = CANVAS.toDataURL("image/png");
        const FILE = document.getElementById("ticketFile").files[0]; // seleccionamos el archivo
        const FR = new FileReader(); // Creamos una instancia de file reader
        FR.addEventListener("load", function(e) {
            const CHARGEINFORMATION = {
                amount: $("#import").val(),
                room: $(".insert-room").val(),
                guest: $(".insert-guestname").val(),
                hotelB: $("#hotelname_").data("hotelid"),
                operaid: $("#hotelname_").data("operaid"),
                consumer: $("#consumer").val(),
                currency: $("#currency").val(),
                logged: obj.data("usr"),
                ticket: e.target.result.replace(/^data:.+;base64,/, ""),
                canvas: DATAURL,
                revenuecenter: $("#consumer").val(),
            }
            // Enviamos los datos a un servicio
            $.ajax({
                data: CHARGEINFORMATION,
                type: "POST",
                url: "/chargeoffline",
                success: (data) => {
                    if(data == "safe"){
                        Swal.fire({
                            title: "Cargo exitoso",
                            type: "success",
                            confirmButtonText: "Aceptar",
                            footer:
                                "El cargo fue realizado correctamente a la habitación del huesped."
                        }).then(result => {
                            if (result.value) {
                                location = "/";
                            }
                        });
                    }
                }
            })
        });
        FR.readAsDataURL(FILE);
    });



    $("#addTicket").click(function () {
        $("#ticketFile").trigger("click");
        return false;
    });
    $("#ticketFile").change(function () {
        $("#addTicket").text("Archivo Cargado");
        iziToast.info({
            position: "topCenter",
            message: "El archivo fue cargado correctamente"
        });

        var ticketInput = document.querySelector("#ticketFile");
        var ticketPreview = document.querySelector("#ticketPreview");

        const archivo = ticketInput.files;
        if (archivo.length != 0) {
            const first = archivo[0];
            const imgObject = URL.createObjectURL(first);
            imgobjectGlobal = imgObject;
            ticketPreview.src = imgobjectGlobal;
            $("#ticketPreview")
                .parent()
                .removeClass("hide");
        }
    });

    var actual_width = $(window).width();
    if (actual_width <= 700) {
        $("#signature-pad").attr("width", 300);
        $("#signature-pad").attr("height", 150);
    }

    /**
     * Function: Modal accept charge and open signature modal
     *
     * @author Josué Hernández
     */
    $(".charge").click(function () {
        iziToast.destroy();
        var file_con = document.querySelector("#ticketFile");
        const guestname = $(".insert-guestname").val();
        if (file_con.files.length == 0) {
            iziToast.error({
                position: "center",
                message: "Añade el ticket"
            });
        } 
        else if(guestname.length == 0){
            iziToast.error({
                position: "center",
                message: "Añade el nombre del huesped"
            });
        }else {
            var mount = $("#import").val();
            var currency = $(".currency").data("val");
            var category = $("#category");
            var consumer = $("#consumer");
            const ChargeData = {
                amount: $("#import").val(),
                currency: $(".currency").data("val"),
                category: $("#category").val(),
                consumer: $("#consumer").val(),
                logged: $(this).data("usr"),
                room: $("#informative_room").data("room"),
                hotelname: $("#hotelname_").data("hotelname"),
                name: $("#guest_name").data("name"),
                hotelid: $("#hotelname_").data("hotelid"),
                operaid: $("#hotelname_").data("operaid"),
                notes: $("#charges_info").val()
            }
            if (category.data("val") == 0) {
                iziToast.error({
                    position: "center",
                    message: "Seleccióna una categoria de consumo..."
                });
                category.addClass("is-invalid");
            } else if (consumer.data("val") == 0) {
                iziToast.error({
                    position: "center",
                    message: "Seleccióna un centro de consumo..."
                });
                consumer.addClass("is-invalid");
            } else {
                if (mount.length != 0) {
                    Swal.fire({
                        title: `${mount} ` + currency,
                        html:
                            "<p>Habitación " +
                            $("#informative_room").data("room") +
                            " - " +
                            $("#hotelname_").data("hotelname") +
                            "<p><p>" +
                            $(".insert-guestname").val() +
                            "</p>",
                        icon: "info",
                        type: "warning",
                        confirmButtonColor: "#3085d6",
                        cancelButtonColor: "#d33",
                        confirmButtonText: "Aprobar cargo",
                        footer:
                            "El cargo realizado se reflejará en la cuenta de la habitación del huesped.",
                        allowOutsideClick: false
                    }).then(result => {
                        if (result.value) {
                            $(".notes-amount").text(`${ChargeData.amount} ${ChargeData.currency}`);
                            $("#modal_notes").modal("show");
                        }
                    });
                } else {
                    iziToast.error({
                        position: "center",
                        message: "Ingresa un monto..."
                    });
                    $("#import").addClass("is-invalid");
                }
            }
        }
    });

    $(document).on("click", "#save_charges", function () {
        const obj = $(this);
        const FILE = document.getElementById("ticketFile").files[0]; // seleccionamos el archivo
        const FR = new FileReader(); // Creamos una instancia de file reader
        FR.addEventListener("load", function(e) {
            const CHARGEINFORMATION = {
                amount: $("#import").val(),
                room: $(".insert-room").val(),
                guest: $(".insert-guestname").val(),
                hotelB: $("#hotelname_").data("hotelid"),
                operaid: $("#hotelname_").data("operaid"),
                consumer: $("#consumer").val(),
                currency: $("#currency").val(),
                logged: obj.data("usr"),
                ticket: e.target.result.replace(/^data:.+;base64,/, ""),
                canvas: "",
                revenuecenter: $("#consumer").val(),
                notes: $("#charges_info").val()
            }
            // Enviamos los datos a un servicio
            $.ajax({
                data: CHARGEINFORMATION,
                type: "POST",
                url: "/chargeoffline",
                success: (data) => {
                    if(data == "safe"){
                        Swal.fire({
                            title: "Cargo exitoso",
                            type: "success",
                            confirmButtonText: "Aceptar",
                            footer:
                                "El cargo fue realizado correctamente a la habitación del huesped."
                        }).then(result => {
                            if (result.value) {
                                location = "/";
                            }
                        });
                    }
                }
            })
        });
        FR.readAsDataURL(FILE);
    });

    /**
     * Quitar la clase is-invalida cuendo el select cambie
     *
     * @param callback {jQuery}
     */
    $(document).on("change", "select", function () {
        $(this).removeClass("is-invalid");
    });

    /**
     * Abrir modal que contiene la imagen
     *
     */
    $(document).on("click", "#ticketPreview", function () {
        $("#modal_img_preview").removeClass("hide");
        $("#imgPreviewModal").attr("src", imgobjectGlobal);
    });

    /**
     * Cerra el modal que contien la imagen
     *
     */
    $(document).on("click", "#close_modal_img", function () {
        $("#modal_img_preview").addClass("hide");
    });
});
