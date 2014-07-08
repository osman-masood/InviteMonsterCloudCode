/*
 Based on: https://gist.github.com/mikevansnell/5140654
 but invites based on phone number (by sending text) rather than email.

 If user already exists, text them their invite code. If not, create & then text.
 (However, if eventTitle is not provided, it does not text the user.)
 */


exports.inviteUser = function(creatingUser, phoneNumber, eventTitle, response)
{
    "use strict";

    getOrSignUpUser(phoneNumber, function(invitedUser, inviteCode) {

        // TODO do things here based on timesInvited and eventTitle. also figure out how to get invite code to send to user if user already exists

        if (eventTitle)  // event title provided - text the user the event info & invite code
        {
            textUserInviteCodeForEvent(phoneNumber, creatingUser.get("firstName"), eventTitle, inviteCode, {
                success: function() {
                    var timesInvited = invitedUser.get("timesInvited") || 0;
                    timesInvited += 1;
                    invitedUser.set("timesInvited", timesInvited);
                    invitedUser.save().then(
                        function(invitedUserAgain) {
                            response.success(invitedUser);
                        },
                        function(error) {
                            console.error("Failed to update timesInvited: " + error);
                            response.error("Failed to update timesInvited: " + error);
                        }
                    );
                },
                error: function(err) {
                    console.error("User " + createdUser.id + " created, but couldn't text them: " + err);
                    response.error("User " + createdUser.id + " created, but couldn't text them: " + err);
                }
            });
        }
    }, response);
};


exports.addGroupMember = function(creatingUser, phoneNumber, groupId, response)
{
    "use strict";

    getOrSignUpUser(phoneNumber, function(invitedUser, inviteCode) {

        // TODO can also verify that creatingUser is creator of groupId

        // If group member does not already exist, create it
        var groupMemberQuery = Parse.Query(Parse.GroupMember);
        groupMemberQuery.equalTo("member", invitedUser.id);
        groupMemberQuery.equalTo("group", groupId);
        groupMemberQuery.first({
            success: function(groupMemberObject) {

                if (groupMemberObject) {  // already exists! do nothing
                    response.success(groupMemberObject);
                } else {

                    // Doesn't exist - create it
                    groupMemberObject = new Parse.Object("GroupMember");
                    groupMemberObject.save({
                        member: invitedUser.id,
                        group: groupId
                    }, {
                        success: function(obj) {
                            response.success(obj);
                        },
                        error: function(obj, error) {
                            console.error("Error saving group member " + obj + ": " + error);
                            response.error("Error saving group member " + obj + ": " + error);
                        }
                    });

                    response.success(groupMemberObject);
                }

            }, error: function(groupMemberObject, error) {
                console.error("Failed to get the GroupMember of member=" + invitedUser + ", groupId=" + groupId + ", error=" + error);
                response.error("Failed to get the GroupMember of member=" + invitedUser + ", groupId=" + groupId + ", error=" + error);
            }
        });

    }, response);
};


function getOrSignUpUser(phoneNumber, successCallbackWithUserAndInviteCode, response)
{
    var userQuery = new Parse.Query(Parse.User);
    userQuery.equalTo("phoneNumber", phoneNumber);
    userQuery.first({
        success: function(queriedUser) {
            if (queriedUser)  // user exists
            {
                successCallbackWithUserAndInviteCode(queriedUser, queriedUser.get("inviteCode"));
            }
            else  // user doesn't exist
            {
                signUpUser(phoneNumber, function(createdUser, inviteCode) {
                    successCallbackWithUserAndInviteCode(createdUser, inviteCode);
                }, response);
            }
        },
        error: function(err) {
            console.error("Received error querying user to see if it exists: " + err);
            response.error("Received error querying user to see if it exists: " + err)
        }
    });
}


function signUpUser(phoneNumber, successCallback, response) {
    "use strict";

    var inviteCode = generateInviteCodeString();
    var user = new Parse.User();
    user.set("username", phoneNumber);
    user.set("phoneNumber", phoneNumber);
    user.set("password", inviteCode);
    user.set("inviteCode", inviteCode);
    user.set("timesInvited", 0);
    user.signUp(null, {
        success: function(createdUser)
        {
            successCallback(createdUser, inviteCode);
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
        error: function(user, error)
        {
            console.error("signUpUser error: couldn't create user " + error.code + " " + error.message);
            response.error("signUpUser error: couldn't create user " + error.code + " " + error.message);
        }
    });
}


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