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
                router.goto("feeds", res);
            } else {
                storage.setUser({name: 'Anonymous User', username: 'anonymous', 'avatar': 'https://www.gravatar.com/avatar'})
                .then(resp => router.goto("feeds", resp))
            }
        })
        .catch(err => {
            storage.setUser({name: 'Anonymous User', username: 'anonymous', 'avatar': 'https://www.gravatar.com/avatar'})
            .then(resp => router.goto("feeds", resp))
        });
}


function login() {
    processing.value = true;
    Fetch.login(username.value)
        .then(res => {
            localStorage.setItem('id', res.id);
            storage.setUser(res)
                .then(resp => router.goto("feeds", resp))
                .catch(err => router.goto("feeds", res))
            // router.goto("feeds", res)
            processing.value = false;
        })
        .catch(err => {
            processing.value = false;
            loginFailed.value = true;
        });
}

function register() {
    processing.value = true;
    Fetch.signup(username.value, name.value)
        .then(res => {
            localStorage.setItem('id', res.id);
            storage.setUser(res)
                .then(resp => router.goto("feeds", resp))
                .catch(err => router.goto("feeds", res))
            // router.goto("feeds", res)
            processing.value = false;
        })
        .catch(err => {
            processing.value = false;
            regFailed.value = true;
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