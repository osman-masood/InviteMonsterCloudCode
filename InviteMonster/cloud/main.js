// 
// // Use Parse.Cloud.define to define as many cloud functions as you want.
// // For example:
// Parse.Cloud.define("invite", function(request, response) {
//  var phoneNumber = request.params.phoneNumber;
//  response.success(phoneNumber);
//  
//  
//  var query = new Parse.Query("User");
//  query.equalTo("phoneNumber", phoneNumber);
//  query.find({
//      success: function(results) {
//          var user = results[0];
//          response.success("User found: " + user.get("phoneNumber"));
//      },
//      error: function() {
//          response.error("User lookup failed");
//      }
//  });
// });

var twilioAccountSid = 'AC50d3202d08057a85736be77107e7c453';
var twilioAuthToken = '5c3603a3a2766b24e43159e27cd0eea9';

Parse.Cloud.beforeSave(Parse.User, function(request, response) {
//  query = new Parse.Query("User");
//  var inviteCode = request.object.get("inviteCode");
    console.log("Entering beforeSave! " + request.object);

    // Set the user's invite code to random 4-digit number
    var inviteCode = Math.floor((Math.random() * 10000));
    request.object.set("inviteCode", inviteCode);

    console.log("Before success!");
    response.success();
    console.log("After success!");
//  var query = new Parse.Query("User");
//  query.equalTo("phoneNumber", phoneNumber);
//  query.find({
//      success: function(results) {
//          var user = results[0];
//          response.success("User found: " + user.get("phoneNumber"));
//      },
//      error: function() {
//          response.error("User lookup failed");
//      }
//  });
});

Parse.Cloud.afterSave(Parse.User, function(request) {
    // Text the user the invite code
    // Require and initialize the Twilio module with your credentials

    var client = require('twilio')(twilioAccountSid, twilioAuthToken);

    // Send an SMS message
    client.sendSms({
            to: '+14085152051',
            from: '+14085152051',
            body: 'Your friend Osman just invited you to go bumpin\'! Get InviteMonster to respond.'
        },
        function(err, responseData) {
            if (err) {
                console.log("Error happened when sending text message to user ", request.object.get("phoneNumber"));
                console.log(err);
            } else {
                console.log(responseData.from);
                console.log(responseData.body);
            }
        }
    );
});