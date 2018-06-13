var Observable = require("FuseJS/Observable");
var FirebaseUser = require("Firebase/Authentication/User");
var InterApp = require("FuseJS/InterApp");
var EAuth = require("Firebase/Authentication/Email");
var GAuth = require("Firebase/Authentication/Google");

var defaultStatusMessage = "Status OK";
var signedInStatusText = Observable(defaultStatusMessage);
var lobbyStatusText = Observable(defaultStatusMessage);

var userName = Observable("-");
var userEmail = Observable("-");
var userPhotoUrl = Observable("-");

function aunthenticateTWTR() {
    InterApp.on("receivedUri", function(uri) {
        console.log("Launched with URI", uri);
    });  
    InterApp.launchUri('google.navigation:q=Sanusi+Fafunwa,+Lagos+Nigeria');
    // https://api.twitter.com/oauth/authorize?oauth_token=e35Y_AAAAAAA6czzAAABY9vkL7g
}

function signedIn() {
    router.goto("feeds");
    // signedInStatusText.value = defaultStatusMessage;
}

function signedOut() {
    currentPage.value = mainPage;
}

FirebaseUser.onError = function(errorMsg, errorCode) {
    console.log("ERROR(" + errorCode + "): " + errorMsg);
    lobbyStatusText.value = "Error: " + errorMsg;
};

FirebaseUser.signedInStateChanged = function() {
    if (FirebaseUser.isSignedIn)
        signedIn();
    else
        signedOut();
};

var userEmailInput = Observable("");
var userPasswordInput = Observable("");

var createUser = function() {
    var email = userEmailInput.value;
    var password = userPasswordInput.value;
    EAuth.createWithEmailAndPassword(email, password).then(function(user) {
        console.log(e);
        signedIn();
    }).catch(function(e) {
        console.log("Signup failed: " + e);
        FirebaseUser.onError(e, -1);
    });
};

var signInWithEmail = function() {
    var email = userEmailInput.value;
    var password = userPasswordInput.value;
    EAuth.signInWithEmailAndPassword(email, password).then(function(user) {
        signedIn();
    }).catch(function(e) {
        console.log("SignIn failed: " + e);
        FirebaseUser.onError(e, -1);
    });
};

var reauthenticate = function() {
    FirebaseUser.reauthenticate().then(function(message) {
        console.log(message);
    }).catch(function(e) {
        console.log("reauthentication failed:" + e);
    });
};

var signOutNow = function() {
    FirebaseUser.signOut();
};


module.exports = {
    userEmailInput: userEmailInput,
    userPasswordInput: userPasswordInput,
    createUser: createUser,
    signInWithEmail: signInWithEmail,
    signedInStatusText: signedInStatusText,
    userName: userName,
    userEmail: userEmail,
    userPhotoUrl: userPhotoUrl,
    reauthenticate: reauthenticate,
    aunthenticateTWTR: aunthenticateTWTR,
    signedIn: signedIn
};