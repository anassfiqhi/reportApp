// var FirebaseUser = require("Firebase/Authentication/User");
var Observable = require("FuseJS/Observable");
var Fetch = require("modules/fetcher");
var Share = require("FuseJS/Share");
var storage = require("modules/storage");
var InterApp = require("FuseJS/InterApp");
var GeoLocation = require("FuseJS/GeoLocation");
// var camera = require('FuseJS/Camera');
// var cameraRoll = require("FuseJS/CameraRoll");
// var ImageTools = require("FuseJS/ImageTools");
var FileSystem = require("FuseJS/FileSystem");
var Base64 = require("FuseJS/Base64");
var user = Observable();
var notLoggedIn = Observable(false);
var img = Observable();
var b64 = Observable();
var hasImg = Observable(false);
var title = Observable();
var body = Observable();
var posts = Observable();
var noPosts = Observable(false);
var addedPost = Observable();
var errMessage = Observable();
var processFailed = Observable(false);
var message = Observable();
var captureMode = Observable();
var cameraFacing = Observable();
var flashMode = Observable();
var cameraReady = Observable(false);
var processing = Observable();
var status = Observable({'label': 'YES', 'value': 1}, {'label': 'NO', 'value': 0});
var anonymous = Observable();
var isAnon = Observable(false);

function capturePhoto() {
    var Camera = _cameraView;
    Camera.getCameraInfo()
    .then(function(info) {
        captureMode.value = info[Camera.INFO_CAPTURE_MODE];
        cameraFacing.value = info[Camera.INFO_CAMERA_FACING];
        flashMode.value = info[Camera.INFO_FLASH_MODE];
        cameraReady.value = true;
        Camera.setCaptureMode(Camera.CAPTURE_MODE_PHOTO)
        .then(function(newCaptureMode) {
            Camera.capturePhoto()
            .then(function(photo) {
                photo.save()
                    .then(function(filePath) {
                        var arrayBuff = FileSystem.readBufferFromFileSync(filePath);
                        img.value = filePath;
                        b64.value = Base64.encodeBuffer(arrayBuff);
                        hasImg.value = true;
                        photo.release();
                    })
                    .catch(function(error) {
                        console.log("Failed to save photo: " + error);
                        photo.release();
                    });
            })
            .catch(function(error) {
                console.log("Failed to capture photo: " + error);
            });
        })
        .catch(function(error) {});
    })
    .catch(function(error) {
        console.log("Failed to get camera info: " + error);
    });
}

function gotoDetails(args) {
    router.push("feedDetail", args.data);
}

function setAnon(args) {
    isAnon.value = args.data.value === 1 ? true : false;
}

function getLoc() {
    return new Promise((res, rej) => {
        GeoLocation.getLocation(0).then(function(location) {
            res({longitude: location.longitude, latitude: location.latitude});
        }).catch(function(fail) {
            res({longitude: 0, latitude: 0});
        });
    })
  }

function addPost() {
    if ((localStorage.getItem('id') && localStorage.getItem('id') === user.value.id) || isAnon.value) {
        processing.value = true;
        if ((title.value && body.value) || (localStorage.getItem('title') !== null && localStorage.getItem('body') !== null)) {
            getLoc().then(res => {
                Fetch.addPost({
                    title: title.value || localStorage.getItem('title'),
                    body: body.value || localStorage.getItem('body'),
                    author: localStorage.getItem('id'),
                    long: res.longitude,
                    lat: res.latitude,
                    img: b64.value,
                    anonymous: isAnon.value
                })
                .then(res => {
                    localStorage.removeItem('title')
                    localStorage.removeItem('body');
                    addedPost.value = true;
                    title.value = "";
                    body.value = "";
                    posts.insertAt(0, res);
                    processFailed.value = false;
                    processing.value = false;
                })
                .catch(err => {
                    processFailed.value = true;
                    processing.value = false;
                    errMessage.value = 'Your pot could not be added, may have lost your connection';
                });
            });
        } else {
            processFailed.value = true;
            processing.value = false;
            errMessage.value = 'Please provide title and content';
        }
    } else {
        localStorage.setItem('title', title.value);
        localStorage.setItem('body', body.value);
        notLoggedIn.value = true;
        setTimeout(() => router.goto("login"), 1000);
    }
}

// function takePicture() {
//     camera.takePicture(640,480).then(function(image)
//     {
//         //Do things with image here
//     }).catch(function(error) {
//         console.log(err);
//         //Something went wrong, see error for details
//     });
// }

// function openGallery() {
//     cameraRoll.getImage()
//     .then(function(image) {
//         img.value = image;
//         ImageTools.getBase64FromImage(image)
//             .then(function(base64Image) {
//                 hasImg.value = true;
//                 b64.value = base64Image;
//                 console.log("The base64 encoded image is \"" + base64Image + "\"");
//              }).catch(err => console.log(err))
//     }, function(error) {
//         // Will be called if the user aborted the selection or if an error occurred.
//     });
// }

function getPosts() {
    message.value = "Loading Posts...";
    Fetch.getPosts()
        .then(function (result) {
            if (result) {
                if(result.length) {
                    posts.replaceAll(result);
                    storage.addPosts(result)
                        .then(res => console.log('success'))
                        .catch(err => console.log(err));
                } else {
                    message.value = "Sorry No recent posts";
                }
            } else {
                noPosts.value = true;
                message.value = "Sorry No recent posts";
            }
        }).catch(err => {
            noPosts.value = true;
            message.value = "Ooops couldn't get posts";
        });
}

function signOutNow() {
    localStorage.clear();
    router.push("login");
};

this.Parameter.onValueChanged(module, res => {
    storage.getUser()
        .then(resp => user.value = resp)
        .catch(err => user.value =  res);
    storage.getPosts()
        .then(data => {
            posts.replaceAll(data);
        })
        .catch(err => console.log(err));
    // getPosts();
})

module.exports = {
    capturePhoto: capturePhoto,
    // takePicture: takePicture,
    // openGallery: openGallery,
    status: status,
    hasImg: hasImg,
    anonymous: anonymous,
    img: img,
    b64: b64,
    posts: posts,
    noPosts: noPosts,
    addedPost: addedPost,
    message: message,
    title: title,
    content: body,
    addPost: addPost,
    details: gotoDetails,
    signOut: signOutNow,
    getPosts: getPosts,
    user: user,
    setAnon: setAnon,
    errMessage: errMessage,
    processFailed: processFailed,
    processing: processing,
    notLoggedIn: notLoggedIn,
    shareFile: function () {
        Camera.takePicture(320, 240).then(function (image) {
            Share.shareFile(image.path, "image/*", "Photo from Fuse");
        });
    },
    shareText: function (args) {
        Share.shareText(`${args.data.title} ${args.data.body}`, "https://www.reportapp.com/");
    },
    shareToWhatsapp: function (args) {
        InterApp.on("receivedUri", function (uri) {
            console.log("Launched with URI", uri);
        });

        InterApp.on("error", function (uri) {
            console.log("error", uri);
        });

        InterApp.launchUri(`whatsapp://send?text=${args.data.title} ${args.data.body}`);
    }
};