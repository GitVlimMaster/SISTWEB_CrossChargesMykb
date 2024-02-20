var parser = require('fast-xml-parser');
//var he = require('he');

var options = {
    attributeNamePrefix : "@_",
    attrNodeName: "attr", //default is 'false'
    textNodeName : "#text",
    ignoreAttributes : true,
    ignoreNameSpace : false,
    allowBooleanAttributes : false,
    parseNodeValue : true,
    parseAttributeValue : false,
    trimValues: true,
    cdataTagName: "__cdata", //default is 'false'
    cdataPositionChar: "\\c",
    parseTrueNumberOnly: false,
    arrayMode: false, //"strict"
    attrValueProcessor: (val, attrName) => he.decode(val, {isAttributeValue: true}),//default is a=>a
    tagValueProcessor : (val, tagName) => he.decode(val), //default is a=>a
    stopNodes: ["parse-me-as-string"]
};

let xmlData = `
    <PostList SequenceNumber="1234" HotelId="1" PaymentMethod="16" RevenueCenter="100" WaiterId="Rosewood" WorkstationId="Station_1" Date="210722" Time="230051">
        <PostListItem RoomNumber="832" ReservationId="5201397" LastName="Braga" FirstName="Luiz Fernando" Title="Mr." PaymentMethod="AX USD RSV" NoPost="0" CreditLimit="990000000000" ProfileId="5036930" HotelId="1"/>
    </PostList>
`;

if( parser.validate(xmlData) === true) { //optional (it'll return an object in case it's not valid)
   console.log("Valid")
}
else {
    console.log("No valid");
}

// Intermediate obj
//var tObj = parser.getTraversalObj(xmlData,options);
///var jsonObj = parser.convertToJson(tObj,options);