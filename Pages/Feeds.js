var Observable = require("FuseJS/Observable");
var Fetch = require("modules/fetcher");
var storage = require("modules/storage");
var Timer = require("FuseJS/Timer");
var hasRequestedPosts = Observable(false);
var posts = Observable();
var noPosts = Observable(false);
var errMessage = Observable();
var processFailed = Observable(false);
var message = Observable();
var retrievePosts;

function gotoDetails(args) {
    router.pushRelative(nav, "feedDetail", args.data.id);
}

function getRecentPosts() {
    if (hasRequestedPosts.value === false) {
        hasRequestedPosts.value = true;
        var latest = posts.toArray()[0];
        Fetch.getRecPosts(latest.createdAt)
            .then(function (result) {
                if (result) {
                    if(result.length) {
                        noPosts.value = false;
                        posts.insertAll(0, result);
                        storage.addPosts(posts.value)
                            .then(res => '')
                            .catch(err => console.log(err));
                    } 
                    hasRequestedPosts.value = false;
                } else {
                    hasRequestedPosts.value = false;
                }
            }).catch(err => {
                hasRequestedPosts.value = false;
            });

    } else {
        console.log('illicit request');
    }
}

function getPosts() {
    if (hasRequestedPosts.value === false) {
        hasRequestedPosts.value = true;
        message.value = "Loading Posts...";
        Fetch.getPosts()
            .then(function (result) {
                if (result) {
                    if(result.length) {
                        noPosts.value = false;
                        posts.replaceAll(result);
                        storage.addPosts(result)
                            .then(res => '')
                            .catch(err => console.log(err));
                    } else {
                        noPosts.value = true;
                        message.value = "Sorry No recent posts";
                    }
                    hasRequestedPosts.value = false;
                } else {
                    noPosts.value = true;
                    message.value = "Sorry No recent posts";
                    hasRequestedPosts.value = false;
                }
            }).catch(err => {
                noPosts.value = true;
                message.value = "Ooops couldn't get posts";
                hasRequestedPosts.value = false;
            });

    } else {
        console.log('illicit request');
    }
}

// function retrieve() {
//     retrievePosts = Timer.create(function() {
//         getPosts();
//     }, 300000, true);
// }


// function clearRetrieval() {
//     Timer.delete(retrievePosts);
// }

this.Parameter.onValueChanged(module, res => {
    storage.getPosts()
    .then(data => {
        if (!data.length) {
            getPosts();
        } else {
            posts.replaceAll(data);
            getRecentPosts();
        }
    })
    .catch(err => getPosts());
});

// this.Post.onValueChanged(module, data => {
//     console.dir(data);
//     // var item = data.value !== null ? data.value : {}
//     // if (item.hasOwnProperty('id')) {
//     //     posts.insertAt(0, item);
//     // }
// });

module.exports = {
    // clearRetrieval: clearRetrieval,
    // retrieve: retrieve,
    posts: posts,
    noPosts: noPosts,
    message: message,
    details: gotoDetails,
    getPosts: getRecentPosts,
    errMessage: errMessage,
    processFailed: processFailed,
};