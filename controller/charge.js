/**
 * +--------------------------------------------+
 * | Enviamos los datos del usuario y del hotel |
 * | al que se le hara el cargo                 |
 * +--------------------------------------------+
 *
 * @author Josué Hernández <josue.hernandez@vlim.com.mx>
 * @see https://jquery.com
 */
$(document).ready(function () {
    $(document).on("click", "#next_charge", function () {
        $("#loaderCharge").removeClass("hide");
        const canvas = document.getElementById("signature-pad");
        const dataURL = canvas.toDataURL("image/png");
        var file = document.getElementById("ticketFile").files[0]; // seleccionamos el archivo
        const FR = new FileReader(); // Creamos una instancia de file reader
        console.log(">>> i'm out of the loadend");
        // IMPORTANT: not remove this event
        FR.addEventListener("load", function(e) {
            console.log(">>> in loadend img");
            const charge_info = {
                amount: $("#import").val(),
                hotelB: $("#hotelname_").data("hotelid"),
                operaid: $("#hotelname_").data("operaid"),
                consumer: $("#consumer").val(),
                currency: $("#currency").val(),
                logged: $(this).data("usr"),
                ticket: e.target.result.replace(/^data:.+;base64,/, ""),
                canvas: dataURL,
                revenuecenter: $("#consumer").val(),
            };
            const worker = new Worker("../../../postrequest.worker.js");
            worker.postMessage(charge_info);
            worker.addEventListener("message", (e) => {
                console.log(">>> Sent in worker");
                let data = e.data;
                const postrequest = data;
                if (postrequest == "error") {
                    $("#loaderCharge").addClass("hide");
                    Swal.fire({
                        title: "Error al conectar",
                        text: "No podemos conectar con opera",
                        type: "error",
                        confirmButtonText: "Aceptar",
                        footer: "Este error ya fue enviado al administrador del hotel"
                    });
                } else if (postrequest.PostAnswer._attributes.AnswerStatus != "OK") {
                    $("#loaderCharge").addClass("hide");
                    Swal.fire({
                        title: "Error al hacer el cargo",
                        text: postrequest.PostAnswer._attributes.ResponseText,
                        type: "error",
                        confirmButtonText: "Aceptar",
                        footer: "Este error ya fue enviado al administrador del hotel"
                    });
                } else {
                    Swal.fire({
                        title: "Cargo exitoso",
                        text: postrequest.PostAnswer._attributes.ResponseText,
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
            });
        });   
        FR.readAsDataURL(file);
    });
});