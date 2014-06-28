/*
 Based on: https://gist.github.com/mikevansnell/5140654
 but invites based on phone number (by sending text) rather than email
 */

exports.inviteUser = function(creatingUser, phoneNumber, eventTitle, response)
{
    "use strict";
    var inviteCode = generateInviteCodeString();
    var user = new Parse.User();
    user.set("username", phoneNumber);
    user.set("phoneNumber", phoneNumber);
    user.set("password", inviteCode);
    user.signUp(null, {
        success: function(createdUser) {
            textUserInviteCodeForEvent(phoneNumber, creatingUser.get("firstName"), eventTitle, inviteCode, {
                success: function() {
                    response.success(createdUser);
                },
                error: function(err) {
                    console.error("User " + createdUser.id + " created, but couldn't text them: " + err);
                    response.error("User " + createdUser.id + " created, but couldn't text them: " + err);
                }
            });

//            sendInvitationEmail(email, subject, tempPass, {
//                success: function(httpResponse) {
//                    console.log("User " + createdUser.id + " created, and sent email: " + httpResponse.status);
//                    response.success(createdUser);
//                },
//                error: function (httpResponse) {
//                    console.error("user " + createdUser.id +" created, but couldn't email them. " + httpResponse.status + " " + httpResponse.text);
//                    response.error("user " + createdUser.id +" created, but couldn't email them. " + httpResponse.status);
//                }
//            });
        },
        error: function(user,error) {
            response.error("parse error: couldn't create user " + error.code + " " + error.message);
        }
    });
};

//4-digit number btwn 1000 and 9999
function generateInviteCodeString() {
    return "" + (Math.floor(Math.random() * 9000) + 1000);
}

//function sendInvitationEmail(email,subject,tempPass,callbackObject) {
//    "use strict";
//    var sendgrid = require("sendgrid");
//    var secrets = require("cloud/secrets.js");
//    sendgrid.initialize(secrets.sendgriduser, secrets.sendgridpw); // TODO: your creds here...
//
//    var fromname = "My Service";
//    var from = "noreply@myservice.com";
//    var subject = "Welcome to My Service";
//    var template = "hello {email} your temporary password is {pass}" ;
//    var emailText = template.replace(/{email}/g,email).replace(/{pass}/g,tempPass);
//
//    sendgrid.sendEmail({
//        to: email,
//        from: from,
//        fromname: fromname,
//        subject: subject,
//        text: emailText
//    }, callbackObject);
//}

// TODO: replace with send push to the user, since they already have the app
function textUserInviteCodeForEvent(phoneNumber, eventOwnerName, eventTitle, inviteCode, callbackObject) {
    var smsjsFile = require("cloud/sms.js");
    // eventOwnerName could be null
    if (!eventOwnerName) {
        eventOwnerName = "";
    }
    var textBody = 'Your friend ' + eventOwnerName + ' just invited you to ' + eventTitle + '! Get InviteMonster (invite code ' + inviteCode + ') to check it out!';
    smsjsFile.textUser(phoneNumber, textBody, callbackObject);
}