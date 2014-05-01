var twilioAccountSid = 'AC50d3202d08057a85736be77107e7c453';
var twilioAuthToken = '5c3603a3a2766b24e43159e27cd0eea9';

//4-digit number btwn 1000 and 9999
function generateInviteCode() {
    return Math.floor(Math.random() * 9000) + 1000;
}

function checkDuplicatesAndErrorIfFound(request, response, fieldName, successCallback) {
    if (request.object.get(fieldName)) {
        console.info("Checking for duplicate " + fieldName);
        var query = new Parse.Query(Parse.User);
        query.equalTo(fieldName, request.object.get(fieldName));
        query.find({
            success: function(results) {
                if (results.length > 0) {
                    response.error("User's " + fieldName + " " + request.object.get(fieldName) + " already exists in database");
                }
                successCallback();
            },
            error: function() {
                response.error("Unable to lookup user to check for duplicates of " + request.object.get(fieldName));
            }
        });
    } else {
        successCallback();
    }
}

Parse.Cloud.beforeSave(Parse.User, function(request, response) {
    console.log("BeforeSave call");

    // Either email or phone is required
    if (!request.object.get("phoneNumber") && !request.object.get("email")) {
        response.error("Missing phone number or email");
    }

    // If any user has the same phone number or email address, return an error
    console.log("Checking to see if any user has same phone number or email address");
    checkDuplicatesAndErrorIfFound(request, response, "phoneNumber", function() {
        checkDuplicatesAndErrorIfFound(request, response, "email", function() {
            // Set the user's invite code
            request.object.set("inviteCode", generateInviteCode());
            response.success();
        });
    });
});

Parse.Cloud.afterSave(Parse.User, function(request) {
    // Require and initialize the Twilio module with your credentials
    var twilioClient = require('twilio')(twilioAccountSid, twilioAuthToken);

    // Send an SMS message with the invite code
    if (request.object.get("phoneNumber")) {
        twilioClient.sendSms({
                to: request.object.get("phoneNumber"),
                from: '+19257054413',
                body: 'Your friend Osman just invited you to go bumpin\'! Get InviteMonster (invite code ' + request.object.get("inviteCode") + ') to go bumpin\' with Osman.'
            },
            function(err, responseData) {
                if (err) {
                    console.error("Error happened when sending text message to user " + request.object.get("phoneNumber"));
                    console.error(err);
                } else {
                    console.log(responseData.from);
                    console.log(responseData.body);
                }
            }
        );
    } else {
        console.error("User " + request.object.id + " did not have phoneNumber, so did not send text");
    }
});