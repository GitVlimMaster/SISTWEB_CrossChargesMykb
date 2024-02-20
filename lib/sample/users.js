/**
 * Show the sample to users
 * 
 * @author Josué Hernández <josue.hernandez@vlim.com.mx>
 */
module.exports.get = () => {
    return [
        {
            id: 30,
            room: 508,
            name: "Josue Hernández",    
            hotel: 1,
            credit: false,
            limitCredit: "3205",
            boolCheckOut: true,
            checkOut: "22/08/20",
        },
        {
            id: 50,
            room: 508,
            name: "Karla Doe",    
            hotel: 1,
            credit: true,
            limitCredit: "3205",
            boolCheckOut: true,
            checkOut: "22/08/20",
        },
        {
            id: 51,
            room: 508,
            name: "Arturo Wong",    
            hotel: 1,
            credit: true,
            limitCredit: "3205",
            boolCheckOut: true,
            checkOut: "22/02/20",
        },
    ];
};