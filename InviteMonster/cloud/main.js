
//function checkDuplicatesAndErrorIfFound(request, response, userId, fieldName, successCallback) {
//    if (request.object.get(fieldName)) {
//        console.log("Checking for duplicate " + fieldName + ": " + request.object.get(fieldName));
//        var query = new Parse.Query(Parse.User);
//        query.equalTo(fieldName, request.object.get(fieldName));
//        if (userId) {
//            query.notEqualTo("objectId", userId);
//        }
//        query.find({
//            success: function(results) {
//                console.log("got results: " + fieldName + ", " + results);
//                if (results.length > 0) {
//                    // do NOT change "already exists" here - client depends on it.
//                    // TODO check if the user is an anonymous user. if so, create the user and return success. this means that an invited user is using the app. otherwise, it means that a user who already signed up previously is re-signing up (maybe on a different device). or, could mean that a user has entered someone else's phone number during the invite flow. therefore, we'd actually need to authenticate by having them re-enter the invite code. this means that we can't actually delete the invite code, and that the way to check whether a user is authenticated is actually by checking if they're anonymous users.
//                    response.error("User's " + fieldName + " " + request.object.get(fieldName) + " already exists in database");
//                    return;
//                }
//                successCallback();
//            },
//            error: function() {
//                response.error("Unable to lookup user to check for duplicates of " + request.object.get(fieldName));
//            }
//        });
//    } else {
//        successCallback();
//    }
//}

///**
// * Check for duplicates & set invite code
// */
//Parse.Cloud.beforeSave(Parse.User, function(request, response) {
//    // Either email or phone is required
//    if (!request.object.get("phoneNumber") && !request.object.get("email")) {
//        response.error("Missing phone number or email");
//        return;
//    }
//
//    // If any user has the same phone number or email address, return an error
//    console.log("Checking to see if any user has same phone number or email address: " + request.object.id);
//    checkDuplicatesAndErrorIfFound(request, response, request.object.id, "phoneNumber", function() {
//        checkDuplicatesAndErrorIfFound(request, response, request.object.id, "email", function() {
//            // Set the user's invite code if it hasn't been set and if it's a new user
//            if (! request.object.get("inviteCode") && request.object.isNew()) {
//                console.log("User's invite code not set and user is new - setting it now");
//                request.object.set("inviteCode", generateInviteCodeString());
//            }
//            console.log("About to success");
//            response.success();
//            console.log("After success");
//        });
//    });
//});

///**
// * Text user their invite code if they have one and if they're new
// */
//Parse.Cloud.afterSave(Parse.User, function(request) {
//    console.log("AFTERSAVE CALLED");
//    var inviterName = request.user.get("firstName") || request.user.get("username") || "";
//
//    // Send an SMS message with the invite code if they have a phone number
//    if (request.object.get("phoneNumber")) {
//        if (request.object.get("inviteCode")) {
//            var textBody = 'Your friend ' + inviterName + ' just invited you to go bumpin\'! Get InviteMonster (invite code ' + request.object.get("inviteCode") + ') to go bumpin\' with ' + inviterName + '.';
//            textUser(request.object.get("phoneNumber"), textBody);
//        }
//    } else {
//        console.error("User " + request.object.id + " did not have phoneNumber, so did not send text");
//    }
//});

function queryEvent(eventId, successCallback) {
    "use strict";
    var eventQuery = new Parse.Query("Event");
    eventQuery.get(eventId, {
        success: successCallback,
        error: function() {
            console.error("Unable to lookup event " + eventId);
        }
    });
}

///**
// * Send an SMS message with the invite code if user hasn't been invited yet.
// * If the user has been invited, send an invitation message.
// */
//Parse.Cloud.afterSave("EventAttendee", function(request) {
//    "use strict";
//    var eventAttendeeUserId = request.object.get("eventAttendee");
//    var eventId = request.object.get("event");
//
//    // Now query for the event attendee User object to get their phone number & invited status
//    var eventAttendeeUserQuery = new Parse.Query(Parse.User);
//    eventAttendeeUserQuery.get(eventAttendeeUserId, {
//        success: function(eventAttendeeUser) {
//
//            // Get the Event object so we can get the event's title and owner
//            queryEvent(eventId, function(event) {
//                var eventTitle = event.get("eventTitle");
//
//                // Now query for event's owner so we can get his name
//                var eventOwnerQuery = new Parse.Query(Parse.User);
//                eventOwnerQuery.get(event.get("eventOwner"), {
//                    success: function(eventOwner) {
//
//                        // Text the attendee the invite code if he doesn't have an account, or a normal message if he does
//                        var eventOwnerName = eventOwner.get("firstName");
//                        var eventAttendeePhoneNumber = eventAttendeeUser.get("phoneNumber");
//                        var eventAttendeeInviteCode = eventAttendeeUser.get("inviteCode");
//
//                        if (!eventAttendeePhoneNumber) {
//                            console.error("Event attendee " + eventAttendeeUser + " does not have a phone number!");
//                        } else if (eventAttendeeInviteCode) {
//                            textUserInviteCode(eventAttendeePhoneNumber, eventOwnerName, eventTitle, eventAttendeeInviteCode);
//                        } else {
//                            textUserInvitation(eventAttendeePhoneNumber, eventOwnerName, eventTitle);
//                        }
//                    },
//                    error: function(eventOwner, error) {
//                        console.error("Error occurred when retrieving event's owner " + eventOwner + " : " + error);
//                    }
//                });
//            });
//        },
//        error: function(eventAttendeeUser, error) {
//            console.error("Could not find User corresponding to eventAttendee " + eventAttendeeUserId + " : " + error);
//        }
//    });
//});

/**
 * Input: user
 * Does not authenticate because this is public data, for now
 */
Parse.Cloud.define('countGroupsUserIsMemberOf', function(request, response) {
    "use strict";
    var user = request.user;

    var query = new Parse.Query("GroupMember");
    query.equalTo("member", request.user);
    query.count({
        success: function(count) {
            response.success(count);
        },
        error: function() {
            response.error("Failed to get the count of group membership");
        }
    });
});

/**
 * Input: user
 * Does not authenticate because this is public data, for now
 */
Parse.Cloud.define('countListedUsers', function(request, response) {
    "use strict";
    var user = request.user;

    // First get all groups owned by the user, then get count of # of users in those groups.
    var query = new Parse.Query("Group");
    query.equalTo("owner", request.user);
    query.find({
        success: function(groups) {
            var groupMemberQuery = new Parse.Query("GroupMember");
            groupMemberQuery.containedIn("group", groups);
            groupMemberQuery.count({
                success: function(count) {
                    response.success(count);
                },
                error: function() {
                    response.error("Failed to get the count of GroupMembers in groups owned by the user");
                }
            });

        },
        error: function() {
            response.error("Failed to get the groups owned by the user");
        }

    });
});

/**
 * Based on: https://gist.github.com/mikevansnell/5140654
 * Inputs: phoneNumber, eventTitle
 */
Parse.Cloud.define("inviteUser", function(request, response)
{
    "use strict";
    var creatingUser = request.user;
    var phoneNumber = request.params.phoneNumber;  // string required
    phoneNumber = cleanPhoneNumber(phoneNumber);
    console.log("inviteUser: cleaned phoneNumber: " + phoneNumber);
    var eventTitle = request.params.eventTitle;
    var invitejsFile = require("cloud/invite.js");
    invitejsFile.inviteUser(creatingUser, phoneNumber, eventTitle, response);
});


/**
 * Should really have a single call for creating a group.
 *
 */
Parse.Cloud.define("addGroupMember", function(request, response)
{
    "use strict";
    var creatingUser = request.user;
    var groupId = request.params.groupId;  // string required
    var phoneNumber = request.params.groupMemberPhone;
    phoneNumber = cleanPhoneNumber(phoneNumber);
    var invitejsFile = require("cloud/invite.js");
    invitejsFile.addGroupMember(creatingUser, phoneNumber, groupId, response);
});

function cleanPhoneNumber(phoneNumber) {
    "use strict";
    return phoneNumber.replace(/[^0-9]/g, "");  // remove all non-numeric phone digits
}