/**
 * Reset password
 * 
 * @author Josué Hernández
 */
$(document).ready(function(){
    $(document).on("submit", "#reset_passForm", function(){
        $.ajax({
            url: "/reset_peticion",
            data: {
                email: $("#email_recover").val()
            },
            type: "POST",
            success: function(data){
                if(data.error != ""){
                    $("#reset_passForm_btn").prop( "disabled", true );
                    iziToast.success({
                        position: "topCenter",
                        title: 'OK',
                        message: 'Se envio una liga de recuperación a tu correo',
                    });
                }
            }
        });
        return false;
    });
    
    /**
     * Enviar contrseña nueva
     * 
     * @author Josué Hernández 
     */
    $(document).on("submit", "#change_pass", function(){
        var new_pass = $("#new_pass").val();
        var repeat_pass = $("#repeat_pass").val();
        var hash = $(this).data("idrequest");
        if(new_pass.length != 0 || repeat_pass.length != 0){
            if(new_pass == repeat_pass){
                $.ajax({
                    url: "https://dev.crosschargesrlh.com/rlh_ws/modifyPassUser",
                    data: JSON.stringify({
                        "hashh": hash,
                        "pass": new_pass
                    }),
                    type: "POST",
                    success: function(data){
                        if(data.status != "error"){
                            iziToast.success({
                                position: "topCenter",
                                title: 'OK',
                                message: 'Se actualizo correctamente la contraseña',
                                onClosed: function(instance, toast, closedBy){
                                    location = "/login";
                                }
                            });
                        }else{
                            iziToast.error({
                                position: "topCenter",
                                title: 'ERROR',
                                message: data.text,
                            });
                        }
                    }
                })
            }else{
                iziToast.error({
                    position: "topCenter",
                    title: 'ERROR',
                    message: 'Las contraseñas no coinciden',
                }); 
            }
        }else{
            iziToast.error({
                position: "topCenter",
                title: 'ERROR',
                message: 'Por favor llena los campos de contraseña',
            });
        }
        return false;
    });
});