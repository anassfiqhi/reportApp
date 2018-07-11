var Observable = require("FuseJS/Observable");
var Fetch = require("modules/fetcher");
var storage = require("modules/storage");
var GeoLocation = require("FuseJS/GeoLocation");
var ImageTools = require("FuseJS/ImageTools");
var FileSystem = require("FuseJS/FileSystem");
var Base64 = require("FuseJS/Base64");
var user = Observable();
var isRecording = Observable(false);
var counter = Observable(0);
var isVideo = Observable(false);
var recordingSession;
var pagetitle = Observable('Upright');
var notLoggedIn = Observable(false);
var img = Observable();
var b64 = Observable();
var post = Observable({});
var hasImg = Observable(false);
var hasId = Observable(false);
var title = Observable();
var body = Observable();
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
var isAnon = Observable('False');

function getCamInfo() {
    var Camera = _cameraView;
    Camera.getCameraInfo()
    .then(function(info) {
        captureMode.value = info[Camera.INFO_CAPTURE_MODE];
        cameraFacing.value = info[Camera.INFO_CAMERA_FACING];
        flashMode.value = info[Camera.INFO_FLASH_MODE];
        cameraReady.value = true;
    })
    .catch(function(error) {
        console.log("Failed to get camera info: " + error);
    });
}

function capturePhoto() {
    var Camera = _cameraView;
    Camera.setCaptureMode(Camera.CAPTURE_MODE_PHOTO)
        .then(function(newCaptureMode) {
        Camera.capturePhoto()
        .then(function(photo) {
            photo.save()
                .then(function(filePath) {
                    isVideo.value = false;
                    img.value = filePath;                    
                    hasImg.value = true;
                    FileSystem.readBufferFromFile(filePath)
                        .then(function(buff) {
                            ImageTools.getImageFromBuffer(buff)
                                .then(image => {
                                    var options = {
                                        mode: ImageTools.IGNORE_ASPECT,
                                        desiredWidth: 400,
                                        desiredHeight: 300
                                    };
                                    
                                    ImageTools.resize(image, options)
                                        .then(function(newPic) {
                                            ImageTools.getBase64FromImage(image)
                                                .then(function(base64Image) {
                                                    b64.value = base64Image;
                                                }
                                            );
                                            photo.release();
                                        }
                                    ).catch(err => console.log(err));
                                }
                            )
                        }
                    )
                })
                .catch(function(error) {
                    console.log("Failed to save photo: " + error);
                    photo.release();
                });
            })
        .catch(function(error) {});
    })
    .catch(function(error) {
        console.log("Failed to capture photo: " + error);
    });
}

function startRecording() {
    isRecording.value = true;
    counter.value = 30;
    var Camera = _cameraView;
    Camera.setCaptureMode(Camera.CAPTURE_MODE_VIDEO)
        .then(function(newCaptureMode) {
        Camera.startRecording()
            .then(function (session) {
                recordingSession = session;
                var cntDwn = setInterval(() => counter.value = counter.value -1, 1000);
                setTimeout(() => {
                    clearInterval(cntDwn);
                    counter.value = 0;
                    stopRecording();
                }, 30000)
            })
            .catch(function (error) {
                console.log("Failed to start recording: " + error);
                isRecording.value = false;
            });
    })
    .catch(function(error) {
        console.log(error);
    });
}

function makeBuffer(file) {
    var time = new Date().valueOf();
    FileSystem.readBufferFromFile(file)
    .then(function(buff) {
            isVideo.value = true;
            b64.value = Base64.encodeBuffer(buff);
        }
    )
    .catch(function(error) {
        console.log(error);
    });
}

function stopRecording() {
    isRecording.value = false;
    recordingSession.stop()
        .then(function (recording) {
            isVideo.value = true;
            img.value = recording.filePath();
            makeBuffer(recording.filePath());
        })
        .catch(function (error) {
            console.log(error);
        });
    recordingSession = null;
}


function gotoHome() {
    router.pushRelative(subnav, "feeds");
}

function gotoTop() {
    router.pushRelative(subnav, "topcont");
}

function gotoAbout() {
    router.pushRelative(subnav, "about");
}

function gotoProfile() {
    router.pushRelative(subnav, "profile", {});
}

function gotoTnC() {
    router.pushRelative(subnav, "terms", {});
}

function gotoSugg() {
    router.pushRelative(subnav, "suggestions");
}

function gotoReport() {
    router.pushRelative(subnav, "report");
}

function setAnon(args) {
    isAnon.value = args.data.value === 1 ? true : false;
}

function getLoc() {
    return new Promise((res, rej) => {
        GeoLocation.getLocation(10000).then(function(location) {
            res({longitude: location.longitude, latitude: location.latitude});
        }).catch(function(fail) {
            message.value = fail;
            res({longitude: 0, latitude: 0});
        });
    })
}

function addPost() {
    var anon = isAnon.value === 'True' ? true : false;
    console.log(isVideo.value);
    if (hasId.value || anon) {
        processing.value = true;
        if ((title.value && body.value) || (localStorage.getItem('title') !== null && localStorage.getItem('body') !== null)) {
            getLoc().then(res => {
                Fetch.addPost({
                    title: title.value || localStorage.getItem('title'),
                    body: body.value || localStorage.getItem('body'),
                    author: user.value.id,
                    long: res.longitude,
                    lat: res.latitude,
                    img: b64.value || '',
                    anonymous: anon,
                    isVideo: isVideo.value,
                })
                .then(res => {
                    console.dir(res);
                    localStorage.removeItem('title');
                    localStorage.removeItem('body');
                    addedPost.value = true;
                    title.value = "";
                    body.value = "";
                    isAnon.value = 'False';
                    toggle.IsActive = isAnon.value;
                    processFailed.value = false;
                    processing.value = false;
                })
                .catch(err => {
                    processFailed.value = true;
                    processing.value = false;
                    errMessage.value = 'Your post could not be added, may have lost your connection';
                });
            });
        } else {
            processFailed.value = true;
            processing.value = false;
            errMessage.value = 'Please provide title and content';
        }
    } else {
        title.value ? localStorage.setItem('title', title.value) : '';
        body.value ? localStorage.setItem('body', body.value): '';
        notLoggedIn.value = true;
    }
}

function signOutNow() {
    storage.clearData()
        .then(res => {
            router.goto("login");
            localStorage.clear();
        })
        .catch(err => router.goto("login"));
};

this.Parameter.onValueChanged(module, res => {
    user.value = res.hasOwnProperty('id') ? res : {name: 'Anonymous User', username: 'anonymous', 'avatar': 'https://www.gravatar.com/avatar'};
    hasId.value = res.hasOwnProperty('id');
    if (res.hasOwnProperty('id')) {
        localStorage.setItem('id', res.id);
        storage.getUser()
            .then(res => user.value = res)
            .catch(err => console.log(err));
    }
});

getCamInfo();

module.exports = {
    capturePhoto: capturePhoto,
    gotoProfile: gotoProfile,
    pagetitle: pagetitle,
    hasId:  hasId,
    gotoTop:  gotoTop,
    gotoAbout: gotoAbout,
    gotoTnC: gotoTnC,
    gotoHome: gotoHome,
    gotoSugg: gotoSugg,
    status: status,
    hasImg: hasImg,
    anonymous: anonymous,
    img: img,
    post: post,
    isAnon: isAnon,
    b64: b64,
    gotoReport: gotoReport,
    addedPost: addedPost,
    message: message,
    title: title,
    content: body,
    addPost: addPost,
    signOut: signOutNow,
    user: user,
    setAnon: setAnon,
    errMessage: errMessage,
    processFailed: processFailed,
    processing: processing,
    notLoggedIn: notLoggedIn,
    isVideo: isVideo,
    isRecording: isRecording,
    startRecording: startRecording,
    stopRecording: stopRecording,
    counter: counter,
    makeBuffer: makeBuffer
};