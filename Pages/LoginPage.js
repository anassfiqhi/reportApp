var Observable = require("FuseJS/Observable");
var Fetch = require("modules/fetcher");
var storage = require("modules/storage");
var page = Observable('Login');
var username =  Observable();
var name =  Observable();
var processing = Observable(false);
var loginFailed =  Observable(false);
var regFailed =  Observable(false);

function goLogin() {
    page.value = 'Login';
}

function goRegister() {
    page.value = 'Register';
}

function goHome() {
    storage.getUser()
    .then(res => {
        if (res.id) {
            router.goto("main", res);
        } else {
            router.goto("main", {});
        }
    })
    .catch(err => {
        console.log(err);
        router.goto("main", {});
    })
            
}


function login() {
    processing.value = true;
    Fetch.login(username.value)
        .then(res => {
            storage.setUser(res)
                .then(resp => router.goto("main", res))
                .catch(err => {
                    console.log(err);
                    router.goto("main", res);
                })
            processing.value = false;
        })
        .catch(err => {
            processing.value = false;
            loginFailed.value = true;
            setTimeout(() => loginFailed.value = false, 1000)
        });
}

function register() {
    processing.value = true;
    Fetch.signup(username.value, name.value)
        .then(res => {
            storage.setUser(res)
                .then(resp => router.goto("main", res))
                .catch(err => router.goto("main", res))
            processing.value = false;
        })
        .catch(err => {
            processing.value = false;
            regFailed.value = true;
            setTimeout(() => regFailed.value = false, 1000)
        });
}

module.exports = {
    login: login,
    register: register,
    page: page,
    username: username,
    name: name,
    processing: processing,
    loginFailed: loginFailed,
    regFailed: regFailed,
    goLogin: goLogin,
    goRegister: goRegister,
    goHome: goHome
};