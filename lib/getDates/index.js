/**
 * Get the actual date
 * 
 * @author Josué Hernández <josue.hernandez@vlim.com.mx>
 * @version 1.0 <Estable>
 * @license MIT
 */
module.exports._getDate = function() {
    var d = new Date();
    //get the month
    var month = d.getMonth();
    // get the day
    // convert day to string
    var day = d.getDate().toString();
    // get the year
    var year = d.getFullYear();
    
    // pull the last two digits of the year
    year = year.toString().substr(-2);
    
    // increment month by 1 since it is 0 indexed
    // converts month to a string
    month = (month + 1).toString();

    // if month is 1-9 pad right with a 0 for two digits
    if (month.length === 1){
        month = "0" + month;
    }

    // if day is between 1-9 pad right with a 0 for two digits
    if (day.length === 1){
        day = "0" + day;
    }
    //return the string "MMddyy"
    return year + month + day;
}

module.exports._getTime = function(){
    var time = new Date();
    var seconds = time.getSeconds();
    var minutes = time.getMinutes();
    var hours = time.getHours();
    
    seconds = seconds.toString();
    hours = hours.toString();
    minutes = minutes.toString();

    if(hours.length == 1){
        hours = "0" + hours;
    }
    if(seconds.length == 1){
        seconds = "0" + seconds;
    }
    if(minutes.length == 1){
        minutes = "0" + minutes;
    }
    return hours + minutes + seconds;
}