var Observable = require("FuseJS/Observable");
var Fetch = require("modules/fetcher");
var Share = require("FuseJS/Share");
var LocalNotify = require("FuseJS/LocalNotifications");
var storage = require("modules/storage");
var Timer = require("FuseJS/Timer");
var hasRequestedPosts = Observable(false);
var posts = Observable();
var Tposts = Observable();
var Fposts = Observable();
var noPosts = Observable(false);
var noTPosts = Observable(false);
var noFPosts = Observable(false);
var errMessage = Observable();
var processFailed = Observable(false);
var message = Observable();
var retrievePosts;
var offset = Observable(0);
var limit = Observable(5);

function increaseLimit() {
    setTimeout(() => {
        limit.value += 5;
    }, 200);
}

function decreaseLimit() {
    // if (limit.value > 5) {
    //     limit.value = 5;
    // }
}

function gotoDetails(args) {
    router.pushRelative(nav, "feedDetail", args.data.id);
}

function parseRes(post) {
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
        "hasVideo": post.image.endsWith('.mp4') ? true : post.image.endsWith('.m4a') ? 'audio' : false,
        "createdAt": post.createdAt,
        "id": post.id,
        "commentCnt": 0
    };
}

function getRecentPosts() {
    if (hasRequestedPosts.value === false && (posts.value !== undefined && posts.toArray().length !== 0 )) {
        hasRequestedPosts.value = true;
        var latest = posts.toArray()[0];
        return Promise.all([Fetch.getRecPosts(latest.createdAt), Fetch.getTrendingPosts(), Fetch.getFeaturedPosts()])
            .then(function(result) {
                if (result[0].length) {
                    noPosts.value = false;
                    var newPosts = result[0].map(post => parseRes(post));
                    posts.insertAll(0, newPosts);
                    storage.addPosts(posts.value)
                        .then(res => '')
                        .catch(err => console.log(err));
                } else {
                    noPosts.value = true;
                }

                if (result[1].length) {
                    noTPosts.value = false;
                    var trendyPosts = result[1].map(post => parseRes(post));
                    Tposts.replaceAll(trendyPosts);
                    storage.addTrendingPosts(trendyPosts)
                        .then(res => '')
                        .catch(err => console.log(err));
                } else {
                    noTPosts.value = true;
                }

                if (result[2].length >= 5) {
                    noFPosts.value = false;
                    var featPosts = result[2].map(post => parseRes(post));
                    Fposts.replaceAll(featPosts);
                    storage.addFeaturedPosts(featPosts)
                        .then(res => '')
                        .catch(err => console.log(err));
                } else {
                    noFPosts.value = true;
                }
                // console.dir(result);
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
                var newPosts = result[0].map(post => parseRes(post));
                posts.replaceAll(newPosts);
                storage.addPosts(newPosts)
                    .then(res => '')
                    .catch(err => console.log(err));
            } else {
                noPosts.value = true;
            }
            if (result[1].length) {
                noTPosts.value = false;
                var trendyPosts = result[1].map(post => parseRes(post));
                Tposts.replaceAll(trendyPosts);
                storage.addTrendingPosts(trendyPosts)
                    .then(res => '')
                    .catch(err => console.log(err));
            } else {
                noTPosts.value = true;
            }
            if (result[2].length >= 5) {
                noFPosts.value = false;
                var featPosts = result[2].map(post => parseRes(post));
                Fposts.replaceAll(featPosts);
                storage.addFeaturedPosts(featPosts)
                    .then(res => '')
                    .catch(err => console.log(err));
            } else {
                noFPosts.value = true;
            }
            hasRequestedPosts.value = false;
            // if (!result[0].length && !result[1].length && !result[2].length)  {
            //     hasRequestedPosts.value = false;
            //     noPosts.value = true;
            //     message.value = "Sorry No recent posts";
            // }
        }).catch(err => {
            noPosts.value = true;
            noTPosts.value = true;
            noFPosts.value = true;
            message.value = "Ooops couldn't get posts";
            hasRequestedPosts.value = false;
        });
    } else {
        console.log('illicit request');
    }
}

this.Parameter.onValueChanged(module, res => {
    storage.getPosts()
    .then(data => {
        if (!data.length) {
            getPosts();
        } else {
            noPosts.value = false;
            posts.replaceAll(data);
            storage.getTrendingPosts()
                .then(trending => {
                    if (trending.length) {
                        noTPosts.value = false;
                        Tposts.replaceAll(trending);
                        storage.getFeaturedPosts()
                            .then(featured => {
                                if (featured.length) {
                                    noFPosts.value = false;
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
    posts: posts,
    Fposts: Fposts,
    Tposts: Tposts,
    noPosts: noPosts,
    noTPosts: noTPosts,
    noFPosts: noFPosts,
    message: message,
    details: gotoDetails,
    getPosts: getRecentPosts,
    errMessage: errMessage,
    processFailed: processFailed,
    limit: limit,
    offset: offset,
    increaseLimit: increaseLimit,
    decreaseLimit: decreaseLimit,
    shareText: function(args) {
        Share.shareText(`${args.data.title}\n${args.data.body}\n${args.data.image}`, "Upright NG");
    }
};