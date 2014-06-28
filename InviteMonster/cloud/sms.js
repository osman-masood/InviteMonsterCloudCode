var twilioAccountSid = 'AC50d3202d08057a85736be77107e7c453';
var twilioAuthToken = '5c3603a3a2766b24e43159e27cd0eea9';

exports.textUser = function(phoneNumber, textBody, callbackObject) {
    "use strict";
    // Require and initialize the Twilio module with your credentials
    var twilioClient = require('twilio')(twilioAccountSid, twilioAuthToken);

    // Text the user
    twilioClient.sendSms({
            to: phoneNumber,
            from: '+19257054413',
            body: textBody
        },
        function(err, responseData) {
            if (err) {
                console.error("Error happened when sending text message to user " + phoneNumber + ": " + textBody);
                console.error(err);
                if (callbackObject.error) {
                    callbackObject.error(err);
                }
            } else {
                console.log("Successfully texted user " + phoneNumber + " message: " + textBody);
                console.log(responseData.from);
                console.log(responseData.body);
                if (callbackObject.success) {
                    callbackObject.success();
                }
            }
        }
    );
};
