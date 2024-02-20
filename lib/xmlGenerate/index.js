/**
 * XML IFC8 Generator
 * 
 * @package lib
 * @author Josué Hernández <josue.hernandez@vlim.com.mx>
 */

// LinkStart
function LinkStart(composer){
    const time = composer.time;
    const date = composer.date;
    if(time.length != "" || date.length != ""){
        return '\x02<LinkStart Date="' + date + '" Time="' + time + '"/>\x03'
    }else{
        return "Faltan parametros";
    }
}

// LinkAlive
function LinkAlive(composer){
    const time = composer.time;
    const date = composer.date;
    if(time.length != "" || date.length != ""){
        return '\x02<LinkAlive Date="' + date + '" Time="' + time + '"/>\x03'
    }else{
        return "Faltan parametros";
    }
}

// PostInquery
function PostInquery(composer){
    const time = composer.time;
    const date = composer.date;
    const inqueryinfo = composer.inqueryinfo; // InqueryInformation
    const maxreturnmatch = composer.maxreturnmatch; // MeximunReturnMatches
    const sequencenumber = composer.sequencenumber; //SecuenceNumber
    const requesttype = composer.requesttype; // RequestType
    const paymethod = composer.paymethod; //PaymentMethod
    const revenuecenter = composer.revenuecenter; //RevenueCenter
    const waiterid = composer.waiterid; // WaiterId
    const workstationid = composer.workstationid; // WorkstationId
    // return `\x02<PostInquiry InquiryInformation='" + inqueryinfo + "' MaximumReturnedMatches='" + maxreturnmatch + "' SequenceNumber='" + sequencenumber + "' RequestType='" + requesttype + "' PaymentMethod='" + paymethod + "' Date='" + date + "' Time='" + time + "' RevenueCenter='" + revenuecenter + "' WaiterId='" + waiterid + "' WorkstationId='" + workstationid + "'/>\x03`;
    return `\x02<PostInquiry InquiryInformation="${inqueryinfo}" MaximumReturnedMatches="${maxreturnmatch}" SequenceNumber="${sequencenumber}" RequestType="${requesttype}" PaymentMethod="${paymethod}" Date="${date}" Time="${time}" RevenueCenter="${revenuecenter}" WaiterId="${waiterid}" WorkstationId="${workstationid}"/>\x03`;
}

function PostRequest(composer){
    const checknumber = composer.checknumber;
    const covers = composer.covers;
    const date = composer.date;
    const discount = composer.discount;
    const hotelid = composer.hotel;
    const inquiryinformation = composer.inquiryinformation;
    const lastname = composer.lastname;
    const matchfrompostlist = composer.matchfrompostlist;
    const paymentmethod = composer.paymentmethod;
    const postingdescription = composer.postingdescription;
    const requesttype = composer.requesttype;
    const reservationid = composer.reservationid;
    const revenuecenter = composer.revenuecenter;
    const roomnumber = composer.roomnumber;
    const sequencenumber = composer.sequencenumber;
    const servicecharge = composer.servicecharge;
    const subtotal = composer.subtotal;
    const servingtime = composer.servingtime;
    const tax = composer.tax;
    const time = composer.time;
    const tip = composer.tip;
    const totalamount = composer.totalamount;
    const waiterid = composer.waiterid;
    const workstation = composer.workstation;
    const creditlimitoverride = composer.creditlimitoverride;
    return '\x02<PostRequest CheckNumber="' + checknumber + '" Covers="' + covers + '" Date="' + date + '" Discount1="' + discount + '" HotelId="' + hotelid + '" InquiryInformation="' + inquiryinformation + '" LastName="' + lastname + '" MatchfromPostList="1" CreditLimitOverride="' + creditlimitoverride + '"  PaymentMethod="' + paymentmethod + '" PostingDescription="' + postingdescription + '" RequestType="' + requesttype + '" ReservationId="' + reservationid + '" RevenueCenter="' + revenuecenter + '" RoomNumber="' + roomnumber + '" SequenceNumber="' + sequencenumber + '" ServiceCharge1="' + servicecharge + '" ServingTime="' + servingtime + '" Subtotal1="' + subtotal  + '" Tax1="' + tax + '" Time="' + time + '" Tip="' + tip + '" TotalAmount="' + totalamount + '" WaiterId="' + waiterid + '" WorkstationId="' + workstation + '"/>\x03';
}

// Description
function LinkDescription(composer){
    const time = composer.time;
    const date = composer.date;
    const vernum = composer.vernum; // version
    return '\x02<LinkDescription Date="' + date + '" Time="' + time +'" VerNum="' + vernum + '"/>\x03';
}

// Generate PostList PO
function PostList(composer){
    const time = composer.time;
    const date = composer.date;
    const sequencenumber = composer.sequencenumber; //SecuenceNumber
    const hotelid = composer.hotelid; // Get the hotel id
    const paymethod = composer.paymethod; //PaymentMethod
    const revenuecenter = composer.revenuecenter; //RevenueCenter
    const waiterid = composer.waiterid; // WaiterId
    const workstationid = composer.workstationid; // WorkstationId
    const roomnumber = composer.postlistitem.roomnumber;
    const reservationid = composer.postlistitem.reservationid;
    const lastname = composer.postlistitem.lastname;
    const firstname = composer.postlistitem.firstname;
    const title = composer.postlistitem.title;
    const isvip = composer.postlistitem.isvip;
    const nopost = composer.postlistitem.nopost;
    const creditlimit = composer.postlistitem.creditlimit;
    const paymethod_2 = composer.postlistitem.paymethod;
    const profileid = composer.postlistitem.profileid;
    const first_reference = composer.postlistitem.first_reference;
    const second_reference = composer.postlistitem.second_reference;
    const hotelid_2 = composer.postlistitem.hotelid;
    return "\x02<PostList SequenceNumber='" + sequencenumber + "' HotelId='" + hotelid + "' PaymentMethod='" + paymethod + "' RevenueCenter='" + revenuecenter + "' WaiterId='" + waiterid + "' WorkstationId='" + workstationid + "' Date='" + date + "' Time='" + time + "'><PostListItem RoomNumber='" + roomnumber + "' ReservationId='" + reservationid + "' LastName='" + lastname + "' FirstName='" + firstname + "' Title='" + title + "' Vip='" + isvip + "' NoPost='" + nopost + "' CreditLimit='" + creditlimit + "' PaymentMethod='" + paymethod_2 + "' ProfileId='" + profileid + "' Reference1='" + first_reference + "' Reference2='" + second_reference + "' HotelId='" + hotelid_2 + "' />" + "</PostList>\x03";
}

// Modules export
module.exports.IFC8 = function(type, object){
    switch(type){
        case "LinkStart":
            var xml = LinkStart(object);
            return xml;
            break;
        case "LinkAlive":
            var xml = LinkAlive(object);
            return xml;
            break;
        case "PostInquery":
            var xml = PostInquery(object);
            return xml;
            break;
        case "LinkDescription":
            var xml = LinkDescription(object);
            return xml;
            break;
        case "PostList":
            var xml = PostList(object);
            return xml;
            break;
        case "PostRequest":
            var xml = PostRequest(object);
            return xml;
            break;
        default:
            return "Not exist this option";
            break;
    }
};