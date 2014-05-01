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
  
  
Parse.Cloud.beforeSave(Parse.User, function(request, response) {
//  query = new Parse.Query("User");
//  var inviteCode = request.object.get("inviteCode");
    console.log("Entering beforeSave! " + request.object);
    request.object.set("inviteCode", 12345);
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