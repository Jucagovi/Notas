$(document).ready(function(e) {
    
    /*
     * CONFIGURACIONES DE INICIO
     */
    
    //Añado fucnión al evento click. Con él muestro los botones de subsección si existen al pulsar sobre la sección.
    $(document).on("click", ".seccion", function(){
       $("#sub_"+$(this).attr('id')).slideToggle(); 
    });
    
   function imprimirSecciones(){
       $.ajax({
            url: './includes/secciones.php',
            type: 'POST',
            data: {
                modulo: $(this).text()
                },
            dataType: 'html',
            error: function(){
                alert("Ha habido un error con los datos.");
            },
            success: function(datos){
                //Inserto en el aside el contenido del menú.
                $("aside").html(datos).hide().fadeIn(200);
                //Oculto todas los objetos con clase "subsecciones" (que son los botones de las subsecciones).
                $(".subsecciones").hide();
            }
        });// Fin ajax
   }
   
   $(document).on("click", ".menu", imprimirSecciones );
   $(".menu").keypress(function(e){ if(e.which === 13) imprimirSecciones(); });
   
});// Fin document.ready


