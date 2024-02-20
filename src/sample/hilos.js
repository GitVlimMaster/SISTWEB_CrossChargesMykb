var tmp_session_users = [];
tmp_session_users.push([
    {
        user: req.session.user.id_user
    },
    {
        checknumber: "1",
        covers: "1",
        date: date._getDate(),
        discount: "0",
        hotel: req.session.tmp_opera_user.HotelId,
        creditlimitoverride: "",
        inquiryinformation: req.session.tmp_opera_user.RoomNumber,
        lastname: req.session.tmp_opera_user.LastName,
        matchfrompostlist: "1",
        paymentmethod: "1",
        postingdescription: "Cross Charge",
        requesttype: "4",
        reservationid: "15242894",
        revenuecenter: "1",
        roomnumber: req.session.tmp_opera_user.RoomNumber,
        sequencenumber: "1234",
        servicecharge: "0",
        servingtime: "4",
        subtotal: amount,
        tax: "0",
        time: date._getTime(),
        tip: "0",
        totalamount: amount,
        waiterid: "CrossCharges",
        workstation: req.session.user.id_hotel
    }
]);
console.log(tmp_session_users);


for (let index = 0; index < tmp_thread.length; index++) {
    var millisecondsToWait = 500;
    setTimeout(function() {
        res.send(tmp_thread[index]);
        console.log(tmp_thread[index]);
        tmp_success_proccess.push(tmp_thread[index].thread);
    }, millisecondsToWait);
}

tmp_thread.push({thread: req.body.logged, checknumber: "1", covers: "1", date: date._getDate(), discount: "0", hotel: req.session.tmp_opera_user.HotelId, creditlimitoverride: "", inquiryinformation: req.session.tmp_opera_user.RoomNumber, lastname: req.session.tmp_opera_user.LastName, matchfrompostlist: "1", paymentmethod: "1", postingdescription: "Cross Charge", requesttype: "4", reservationid: "15242894", revenuecenter: "1", roomnumber: req.session.tmp_opera_user.RoomNumber, sequencenumber: "1234", servicecharge: "0", servingtime: "4", subtotal: amount, tax: "0", time: date._getTime(), tip: "0", totalamount: amount, waiterid: "CrossCharges", workstation: req.session.user.id_hotel});
