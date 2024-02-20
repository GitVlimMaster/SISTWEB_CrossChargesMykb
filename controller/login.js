/**
 * Controladdor de inicio de sessión
 * 
 * @author Josué Hernández <josue.hernandez@vlim.com.mx>
 */
$(document).ready(function(e){
    $(document).on("submit", "#logfrm", function(){
        var obj = $(this);
        obj.find(".session-btn").html('<span class="spinner-border align-middle spinner-border-sm" role="status" aria-hidden="true"></span>');
        obj.find(".session-btn").attr("disabled", "");
        $.ajax({
            url: "/auth",
            data: {
                username: $("#rlhusrlog23").val(),
                password: $("#rlhpasslog23").val()
            },
            type: "POST",
            success: function(res){
                switch(res){
                    case "200":
                        location = "/";
                        break;
                    case "404":
                        obj.find(".session-btn").removeAttr("disabled");
                        obj.find(".session-btn").html('<span class="text">Iniciar sesión</span>');
                        iziToast.warning({
                            position: "topCenter",
                            message: 'Correo o contraseña incorrecta',
                        });
                        break;
                    case "405":
                        obj.find(".session-btn").removeAttr("disabled");
                        obj.find(".session-btn").html('<span class="text">Iniciar sesión</span>');
                        iziToast.error({
                            position: "topCenter",
                            message: 'Por favor ingresa correo y contraseña',
                        });
                        break;
                }
            }
        });
        return false;
    });
});