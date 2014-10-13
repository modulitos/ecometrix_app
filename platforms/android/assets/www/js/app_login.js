// Returns a JSON of the user's information from the EXISTING USER login form.
// Returns false if any field is left blank.
function getUserLoginInfo() {
    var errorCount = 0;
    var formIsBlank = true;
    console.log("validating for empty fields: ");
    $("#login").find("input").each(function(index, val) {
        formIsBlank = false;
        if ($(this).val() === "") {
            errorCount++;
        }
    });
    console.log("errorCount: " + errorCount);

    // Check and make sure errorCount's still at zero
    if (errorCount === 0 && !formIsBlank) {

        // If it is, compile all user info into one object
        var username = $("#username");
        var newUserInfo = {
            "username": username.val().trim(),
            "password": $.md5($("#password").val()),
            "token": $.md5($.now(), username.val())
        };
    } else {
        // If errorCount is more than 0, error out
        alert("Please fill in all fields");
        return false;
    }
    return newUserInfo;
}

// Returns a JSON of the user's information from the NEW USER login form.
// Returns false if any field is left blank.
function getNewUserInfo() {
    var errorCount = 0;
    var formIsBlank = true;
    // If we have any empty fields, notify the user
    // and reject the form submission.
    console.log("validating for empty fields: ");
    $("#addUser").find("input").filter(".required").each(function(index, val) {
        formIsBlank = false;
        if ($(this).val() === "") {
            errorCount++;
        }
    });
    console.log("errorCount: " + errorCount);

    // Check and make sure errorCount is at zero.
    if (errorCount === 0 && !formIsBlank) {

        // If it is, compile all user info into one object
        var username = $("#username");
        var newUserInfo = {
            "username": username.val().trim(),
            "password": $.md5($("#password").val()),
            "email": $("#email").val().trim(),
            "fullName": $("#fullName").val().trim(),
            "age": $("#age").val().trim(),
            "location": $("#location").val().trim(),
            "cumulativePoints": 0,
            "token": $.md5($.now(), username.val())
        };
        console.log("new user addition token: %s", newUserInfo.token);
    } else {
        // If errorCount is more than 0, error out.
        alert("Please fill in all fields");
        return false;
    }
    return newUserInfo;
}

// Sends user information from EXISTING USER login form to the server for
// login verification.
function requestUserInfoViaAJAX(event) {
    /* stop form from submitting normally */
    event.preventDefault();

// Get user info from the form.
    var userinfo = getUserLoginInfo();
//    console.log("retrieved userinfo: ");
//    console.log("new login token: %s", userinfo.token);
//    console.log(userinfo);
    if (!userinfo)
        return false;

    $.ajax({
        type: "GET",
        data: jQuery.param(userinfo),
        url: "/login/verify",
        dataType: "JSON"
    }).done(function(response) {
        if (response.msg == "") {
            var message = "Welcome to Ecometrix, " + userinfo.username + "!";
            alert(message);
            window.location.href = "/index.html";
        } else {
            alert("error: " + response.msg);
        }
        $(".field").val("");
    });

    return true;
}

// Sends user information from NEW USER login form to the server to
// create a new user.
function insertUserInfoViaAJAX(event) {
    /* stop form from submitting normally */
    event.preventDefault();

    // Get user info from the form.
    var userinfo = getNewUserInfo();
    console.log("retrieved userinfo: ");
    console.log(userinfo);
    console.log("new user addition token: %s", userinfo.token);
    if (!userinfo)
        return false;

    // Use AJAX to post the object to our adduser service
    $.ajax({
        type: "POST",
        data: userinfo,
        url: "/login/adduser",
        dataType: "JSON"
    }).done(function(response) {
        if (response.msg == "") {
            var message = "Welcome to Ecometrix, " + userinfo.username + "!";
            message += "\nWe love having new users! Please have patience while we are in alpha mode :)";
            alert(message);
            window.location.href = "/index.html";
        } else {
            // If we get an error, send alert with the error message
            // from our service.
            alert("Error: " + response.msg);
        }
        // Clear the form inputs
        $(".field").val("");
    });
    return true;
}

// Reloads the user's session, redirecting to the main app's page.
// If there is no active session, redirect to the login page.
function resumeSession(event) {
    /* stop form from submitting normally */
    event.preventDefault();

    // Use AJAX to post the object to our adduser service
    $.ajax({
        type: "GET",
        data: {}, // The AJAX request will not work without a "data" value.
        url: "/login/resumeSession",
        dataType: "JSON"
    }).done(function(response) {
        if (response.msg == "") {
            console.log("Session is active, redirecting to main app.");
            window.location.href = "/index.html";
        } else {
            alert("Have you logged in?\n" + response.msg);
            window.location.href = "/app_login.html";
        }
    });
}

$(document).ready(function() {
    /* attach a submit handler to the new user and previous user login forms */
    $("#userinfo").submit(requestUserInfoViaAJAX);
    $("#adduserinfo").submit(insertUserInfoViaAJAX);
    // Resume an existing session without logging in.
    // Uses the url: /login/resumeSession
    $("#resume-session").click(resumeSession);
});
