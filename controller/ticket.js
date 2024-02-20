/**
 * Controladdor de altas de tickets
 * 
 * @author Jovani Hernández <jovani.hernandez@vlim.com.mx>
 */

 let dataEditor;
 let arrayFiles = [];
//  const BASE = "http://52.23.172.57/rlh_ws/";
 const BASE = "https://dev.crosschargesrlh.com/rlh_ws/";
 
 window.addEventListener("load", () => {
     getSelectTicket();
     getConsumerCenter($("#hotel_variable").val());
 });
 
 function getConsumerCenter(hotel) {
     try {
         $.ajax({
             url: BASE + "getCCByHotel",
             dataType: "JSON",
             type: "POST",
             data: JSON.stringify({
                 id_hotel: hotel
             }),
             success(data) {
                 data.consumeCenters.forEach(item => {
                     $("#comsumer_center").append(`
                         <option value="${item.id_consume_center}">${item.name}</option>
                     `);
                 });
             }
         });
     }
     catch(e) {
         console.log(e);
     }
 }
 
 /**
  * Se dibuja un select
  * @returns {void}
  */
 function getSelectTicket() {
     try {
         $.ajax({
             url: BASE + "getTypeTicket",
             dataType: "JSON",
             type: "GET",
             success(data){
                 data.data.forEach(item => {
                     $("#tipo").append(`
                         <option value="${item.id_cat_ticket}">${item.name}</option>
                     `);
                 });
             }
         });
     }
     catch(err) {
         console.log(err);
     }
 }
 
 ClassicEditor.create(document.getElementById('detalle')).then(editor => {
     dataEditor = editor;
 });
 
 const button = document.getElementById('button');
 let myDrop = null;
 
 Dropzone.options.myDropzone = {
     url: "/",
     autoProcessQueue: false,
     uploadMultiple: true,
     parallelUploads: 100,
     maxFiles: 100,
 
     init: function () {
 
         let wrapperThis = this;
         myDrop = this;
 
         this.on("addedfile", function (file) {
             // Crea el arreglo de archivos 
             arrayFiles.push(file);
 
             let removeButton = Dropzone.createElement("<button class='btn btn-lg dark'>Eliminar archivo</button>");
             removeButton.addEventListener("click", function (e) {
                 e.preventDefault();
                 e.stopPropagation();
 
                 wrapperThis.removeFile(file);
             });
             
             file.previewElement.appendChild(removeButton);
         });
 
         this.on("removedfile", function (file) {
             let index = arrayFiles.indexOf(file);
             arrayFiles.splice(index, 1);
         });
     }
 };
 
 function msgIzi(msg, status = false) {
     iziToast.destroy();
     if (!status) {
         iziToast.error({
             position: "topCenter",
             message: msg
         });
     }else{
         iziToast.success({
             position: "topCenter",
             message: msg
         });
     }
 }
 
 button.addEventListener('click', () => {
     if ($('#asunto').val() === '') { msgIzi('Inserte el asunto del Ticket...'); return; }
     if (dataEditor.getData() === '') { msgIzi('Inserte el detalle del problema...'); return; }
     /* if (arrayFiles.length === 0) { msgIzi('Cargue al menos un archivo...'); return; } */
 
     button.innerHTML = '<span class="spinner-border align-middle spinner-border-sm" role="status" aria-hidden="true"></span>';
 
     let formData = new FormData();
     formData.append("subject", $('#asunto').val());
     formData.append("cveUser", $('#usuario_variable').val());
     formData.append("description", dataEditor.getData());
     formData.append("hotel", $('#hotel_variable').val());
     formData.append("consume_center", $("#comsumer_center").val());
     formData.append("tipo_ticket", $("#tipo").val());
     formData.append("priority", $('#prioridad').val());
     for (let i = 0; i < arrayFiles.length; i++) {
         formData.append("file[]", arrayFiles[i]);
     }
 
     $.ajax({
         url: BASE + "createTicket",
         type: "POST",
         data: formData,
         enctype: 'multipart/form-data',
         cache: false,
         contentType: false,
         processData: false,
         dataType: 'json',
         success: (response) => {
             button.innerHTML = '<span class="text">Levantar ticket</span>';
             console.log(response);
             if (response.status === 'OK') {
                 msgIzi('Ticket registrado con éxito.', true);
                 setTimeout(() => {
                     location.href = '/';
                 }, 1500);
                 // $('#asunto').val('');
                 // $('#prioridad').val('1');
                 // dataEditor.setData('');
                 // myDrop.removeAllFiles();
             }else{
                 msgIzi('Error al dar de alta el ticket, inténtelo más tarde.');
             }
         },
         error: (err) => {
             msgIzi('Error al establecer comunicación con el servidor, inténtelo más tarde.');
         }
     });
 });
 