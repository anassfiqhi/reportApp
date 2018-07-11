var Observable = require("FuseJS/Observable");
var Fetch = require("modules/fetcher");
var storage = require("modules/storage");
var Timer = require("FuseJS/Timer");
var hasRequestedPosts = Observable(false);
var posts = Observable();
var Tposts = Observable();
var Fposts = Observable();
var noPosts = Observable(false);
var errMessage = Observable();
var processFailed = Observable(false);
var message = Observable();
var retrievePosts;

function gotoDetails(args) {
    router.pushRelative(nav, "feedDetail", args.data.id);
}

function getRecentPosts() {
    if (hasRequestedPosts.value === false && (posts.value !== undefined && posts.toArray().length !== 0 )) {
        hasRequestedPosts.value = true;
        var latest = posts.toArray()[0];
        return Promise.all([Fetch.getRecPosts(latest.createdAt), Fetch.getTrendingPosts(), Fetch.getFeaturedPosts()])
            .then(function(result) {
                if (result[0].length) {
                    noPosts.value = false;
                    var newPosts = result[0].map(post => {
                        return {
                            "comments": post.comments,
                            "author": post.author,
                            "upvotes": post.upvotes,
                            "downvotes": post.downvotes,
                            "title": post.title,
                            "body": post.body,
                            "time": post.time,
                            "loc": post.loc,
                            "lat": post.lat,
                            "long": post.long,
                            "image": post.image,
                            "anonymous": post.anonymous,
                            "from_twitter": post.from_twitter,
                            "urls": post.urls,
                            "featured": post.featured,
                            "hasVideo": post.hasOwnProperty("hasVideo") ? post.hasVideo : false,
                            "createdAt": post.createdAt,
                            "id": post.id
                        };
                    });
                    posts.insertAll(0, newPosts);
                    storage.addPosts(posts.value)
                        .then(res => '')
                        .catch(err => console.log(err));
                }
                if (result[1].length) {
                    var trendyPosts = result[1].map(post => {
                        return {
                            "comments": post.comments,
                            "author": post.author,
                            "upvotes": post.upvotes,
                            "downvotes": post.downvotes,
                            "title": post.title,
                            "body": post.body,
                            "time": post.time,
                            "loc": post.loc,
                            "lat": post.lat,
                            "long": post.long,
                            "image": post.image,
                            "anonymous": post.anonymous,
                            "from_twitter": post.from_twitter,
                            "urls": post.urls,
                            "featured": post.featured,
                            "hasVideo": post.hasOwnProperty("hasVideo") ? post.hasVideo : false,
                            "createdAt": post.createdAt,
                            "id": post.id
                        };
                    });
                    Tposts.replaceAll(trendyPosts);
                    storage.addTrendingPosts(result[1])
                        .then(res => '')
                        .catch(err => console.log(err));
                }
                if (result[2].length) {
                    var featPosts = result[2].map(post => {
                        return {
                            "comments": post.comments,
                            "author": post.author,
                            "upvotes": post.upvotes,
                            "downvotes": post.downvotes,
                            "title": post.title,
                            "body": post.body,
                            "time": post.time,
                            "loc": post.loc,
                            "lat": post.lat,
                            "long": post.long,
                            "image": post.image,
                            "anonymous": post.anonymous,
                            "from_twitter": post.from_twitter,
                            "urls": post.urls,
                            "featured": post.featured,
                            "hasVideo": post.hasOwnProperty("hasVideo") ? post.hasVideo : false,
                            "createdAt": post.createdAt,
                            "id": post.id
                        };
                    });
                    Fposts.replaceAll(featPosts);
                    storage.addFeaturedPosts(result[2])
                        .then(res => '')
                        .catch(err => console.log(err));
                }
                console.dir(result);
                hasRequestedPosts.value = false;
            }).catch(err => {
                hasRequestedPosts.value = false;
            });

    } else {
        console.log('illicit request');
        getPosts();
    }
}

function getPosts() {
    if (hasRequestedPosts.value === false) {
        hasRequestedPosts.value = true;
        message.value = "Loading Posts...";
        return Promise.all([Fetch.getPosts(), Fetch.getTrendingPosts(), Fetch.getFeaturedPosts()])
        .then(function(result) {
            hasRequestedPosts.value = false;
            if (result[0].length) {
                noPosts.value = false;
                var newPosts = result[0].map(post => {
                    return {
                        "comments": post.comments,
                        "author": post.author,
                        "upvotes": post.upvotes,
                        "downvotes": post.downvotes,
                        "title": post.title,
                        "body": post.body,
                        "time": post.time,
                        "loc": post.loc,
                        "lat": post.lat,
                        "long": post.long,
                        "image": post.image,
                        "anonymous": post.anonymous,
                        "from_twitter": post.from_twitter,
                        "urls": post.urls,
                        "featured": post.featured,
                        "hasVideo": post.hasOwnProperty("hasVideo") ? post.hasVideo : false,
                        "createdAt": post.createdAt,
                        "id": post.id
                    };
                });
                posts.replaceAll(newPosts);
                storage.addPosts(result[0])
                    .then(res => '')
                    .catch(err => console.log(err));
            }
            if (result[1].length) {
                var trendyPosts = result[1].map(post => {
                    return {
                        "comments": post.comments,
                        "author": post.author,
                        "upvotes": post.upvotes,
                        "downvotes": post.downvotes,
                        "title": post.title,
                        "body": post.body,
                        "time": post.time,
                        "loc": post.loc,
                        "lat": post.lat,
                        "long": post.long,
                        "image": post.image,
                        "anonymous": post.anonymous,
                        "from_twitter": post.from_twitter,
                        "urls": post.urls,
                        "featured": post.featured,
                        "hasVideo": post.hasOwnProperty("hasVideo") ? post.hasVideo : false,
                        "createdAt": post.createdAt,
                        "id": post.id
                    };
                });
                Tposts.replaceAll(trendyPosts);
                storage.addTrendingPosts(result[1])
                    .then(res => '')
                    .catch(err => console.log(err));
            }
            if (result[2].length) {
                var featPosts = result[2].map(post => {
                    return {
                        "comments": post.comments,
                        "author": post.author,
                        "upvotes": post.upvotes,
                        "downvotes": post.downvotes,
                        "title": post.title,
                        "body": post.body,
                        "time": post.time,
                        "loc": post.loc,
                        "lat": post.lat,
                        "long": post.long,
                        "image": post.image,
                        "anonymous": post.anonymous,
                        "from_twitter": post.from_twitter,
                        "urls": post.urls,
                        "featured": post.featured,
                        "hasVideo": post.hasOwnProperty("hasVideo") ? post.hasVideo : false,
                        "createdAt": post.createdAt,
                        "id": post.id
                    };
                });
                Fposts.replaceAll(featPosts);
                storage.addFeaturedPosts(result[2])
                    .then(res => '')
                    .catch(err => console.log(err));
            }
            if (!result[0].length && !result[1].length && !result[2].length)  {
                hasRequestedPosts.value = false;
                noPosts.value = true;
                message.value = "Sorry No recent posts";
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
            storage.getTrendingPosts()
                .then(trending => {
                    if (trending.length) {
                        Tposts.replaceAll(trending);
                        storage.getFeaturedPosts()
                            .then(featured => {
                                if (featured.length) {
                                    Fposts.replaceAll(featured);
                                    getRecentPosts();
                                }
                            })
                            .catch(err => {
                                getRecentPosts();
                            }
                        );
                    } else {
                        getRecentPosts();
                    }
                })
                .catch(err => {
                    getRecentPosts();
                }
            );
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
    Fposts: Fposts,
    Tposts: Tposts,
    noPosts: noPosts,
    message: message,
    details: gotoDetails,
    getPosts: getRecentPosts,
    errMessage: errMessage,
    processFailed: processFailed,
};