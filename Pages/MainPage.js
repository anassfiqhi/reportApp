var Observable = require("FuseJS/Observable");
var Fetch = require("modules/fetcher");
var storage = require("modules/storage");
var GeoLocation = require("FuseJS/GeoLocation");
var ImageTools = require("FuseJS/ImageTools");
var FileSystem = require("FuseJS/FileSystem");
var Base64 = require("FuseJS/Base64");
// var Reader = require("Reader");
var Recorder = require("Recorder");
var user = Observable();
var isRecording = Observable(false);
var isRecordingAudio = Observable(false);
var Environment = require('FuseJS/Environment');
var counter = Observable(0);
var isVideo = Observable(false);
var isAudio = Observable(false);
var recordingSession;
var pagetitle = Observable("Upright");
var notLoggedIn = Observable(false);
var img = Observable();
var vid = Observable();
var aud = Observable();
var playing = Observable(false);
var b64 = Observable();
var post = Observable({});
var hasImg = Observable(false);
var hasId = Observable(false);
var title = Observable();
var searchTitle = Observable();
var searchRes = Observable();
var noRes = Observable();
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
var hasmadeReq = Observable(false);
var status = Observable({ label: "YES", value: 1 }, { label: "NO", value: 0 });
var anonymous = Observable();
var isAnon = Observable(false);
var Camera = _cameraView;
var cameraBack = true;
var flashMode = Observable(Camera.FLASH_MODE_AUTO);

function getCamInfo() {
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

function nextFlashMode() {
  if (flashMode.value == Camera.FLASH_MODE_AUTO) return Camera.FLASH_MODE_ON;
  else if (flashMode.value == Camera.FLASH_MODE_ON)
    return Camera.FLASH_MODE_OFF;
  else if (flashMode.value == Camera.FLASH_MODE_OFF)
    return Camera.FLASH_MODE_AUTO;
  else throw "Invalid flash mode";
}

function changeCameraFacing() {
  var front = Camera.CAMERA_FACING_FRONT;
  var back = Camera.CAMERA_FACING_BACK;
  Camera.setCameraFacing(cameraBack ? front : back)
    .then(function(newFacing) {
      cameraBack = newFacing == back;
      getCameraInfo();
      console.log(
        "Camera facing set to: " + (newFacing == back ? "back" : "front")
      );
    })
    .catch(function(err) {
      console.log("Failed to set camera facing: " + err);
    });
}

function searchPosts() {
  if (searchTitle.value) {
    Fetch.searchPost(searchTitle.value)
      .then(res => {
        if (res.length) {
          noRes.value = false;
          searchRes.replaceAll(res);
        } else {
          noRes.value = true;
        }
      })
      .catch(err => console.log(err));
  }
}

function changeFlashMode() {
  Camera.setFlashMode(nextFlashMode())
    .then(function(newFlashMode) {
      flashMode.value = newFlashMode;
      console.log("Flash mode set to: " + flashMode.value);
    })
    .catch(function(err) {
      console.log("Failed to set flash mode: " + err);
    });
}

function capturePhoto() {
  if (!isRecording.value) {
    Camera.setCaptureMode(Camera.CAPTURE_MODE_PHOTO)
      .then(function(newCaptureMode) {
        Camera.capturePhoto()
          .then(function(photo) {
            photo
              .save()
              .then(function(filePath) {
                img.value = filePath;
                isVideo.value = false;
                hasImg.value = true;
                FileSystem.readBufferFromFile(filePath).then(function(buff) {
                  ImageTools.getImageFromBuffer(buff).then(image => {
                    var options = {
                      mode: ImageTools.IGNORE_ASPECT,
                      desiredWidth: 400,
                      desiredHeight: 300
                    };

                    ImageTools.resize(image, options)
                      .then(function(newPic) {
                        ImageTools.getBase64FromImage(image).then(function(
                          base64Image
                        ) {
                          b64.value = base64Image;
                        });
                        photo.release();
                      })
                      .catch(err => photo.release());
                  });
                });
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
}

var cntDwn;
var timeout;

function makeBuffer(file) {
  return new Promise((res, rej) => {
    if (!isVideo.value) {
      res(b64.value);
    } else {
      FileSystem.readBufferFromFile(file)
        .then(function(buff) {
          res(Base64.encodeBuffer(buff) || "");
        })
        .catch(function(error) {
          console.log(error);
          res("");
        });
    }
  });
}

// function sampleBuffer() {
//     // FileSystem.readBufferFromFile("C:/Users/elsupridad/Desktop/Media/slow.mp4")
//     // .then(function(buff) {
//     //         console.dir(buff);
//     //         const data = Base64.encodeBuffer(buff);
//     //         // setTimeout(() => {
//     //         //     console.dir(atob(data));
//     //         // }, 5000)
//     //         var reader = new FileReader();

//     //     }
//     // )
//     // .catch(function(error) {
//     //     console.log(error);
//     //     res('');
//     // });
//     var data = Reader.FileRead("C:/Users/elsupridad/Desktop/Media/slow.mp4");
//     // data = Base64.encodeBuffer(data);
//     // var reader = new FileReader();
//     // reader.onload = function(event) {
//     //     // The file's text will be printed here
//     //     console.log(event.target.result)
//     // };

//     // reader.readAsArrayBuffer("C:/Users/elsupridad/Desktop/Media/slow.mp4");
//     console.log(data);
//     console.log('data');
// }

function setLowResolution(resolutions) {
  return resolutions[resolutions.length - 1];
}

function startRecording() {
  if (!isRecording.value && !isRecordingAudio.value) {
    Camera.setCaptureMode(Camera.CAPTURE_MODE_VIDEO)
      .then(function(newCaptureMode) {
        Camera.getCameraInfo().then(function(info) {
          if ("photoResolutions" in info) {
            var resolution = setLowResolution(info["photoResolutions"]);
            var options = {};
            options[Camera.OPTION_PHOTO_RESOLUTION] = resolution;
            counter.value = 30;
            Camera.setPhotoOptions(options)
              .then(function() {
                Camera.startRecording()
                  .then(function(session) {
                    isRecording.value = true;
                    recordingSession = session;
                    cntDwn = setInterval(
                      () => (counter.value = counter.value - 1),
                      1000
                    );
                    timeout = setTimeout(() => {
                      stopRecording();
                    }, 30000);
                  })
                  .catch(function(error) {
                    console.log("Failed to start recording: " + error);
                    isRecording.value = false;
                    counter.value = 0;
                  });
              })
              .catch(function(error) {
                counter.value = "Capture Failed";
                setTimeout(() => (counter.value = 0), 500);
              });
          } else {
            counter.value = 30;
            Camera.setPhotoOptions(options)
              .then(function() {
                Camera.startRecording()
                  .then(function(session) {
                    isRecording.value = true;
                    recordingSession = session;
                    cntDwn = setInterval(
                      () => (counter.value = counter.value - 1),
                      1000
                    );
                    timeout = setTimeout(() => {
                      stopRecording();
                    }, 30000);
                  })
                  .catch(function(error) {
                    console.log("Failed to start recording: " + error);
                    isRecording.value = false;
                    counter.value = 0;
                  });
              })
              .catch(function(error) {
                counter.value = "Capture Failed";
                setTimeout(() => (counter.value = 0), 500);
              });
          }
        });
      })
      .catch(function(error) {
        isRecording.value = false;
        console.log(error);
      });
  }
}

function stopRecording() {
  isRecording.value = false;
  clearInterval(cntDwn);
  clearTimeout(timeout);
  counter.value = 0;
  recordingSession
    .stop()
    .then(function(recording) {
      vid.value = recording.filePath();
      isVideo.value = true;
      isAudio.value = false;
      hasImg.value = false;
    })
    .catch(function(error) {
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

function gotoDetails(args) {
  router.pushRelative(subnav, "feedDetail", args.data.id);
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
    GeoLocation.getLocation(10000)
      .then(function(location) {
        res({ longitude: location.longitude, latitude: location.latitude });
      })
      .catch(function(fail) {
        message.value = fail;
        res({ longitude: 0, latitude: 0 });
      });
  });
}

function clearMessages() {
  setTimeout(() => {
    addedPost.value = false;
    processFailed.value = false;
    processing.value = false;
    hasmadeReq.value = false;
    notLoggedIn.value = false;
  }, 60000);
}

function addPost() {
  var anon = isAnon.value === "True" ? true : false;
  if ((hasId.value || anon) && !hasmadeReq.value) {
    hasmadeReq.value = true;
    processing.value = true;
    if (
      (title.value && body.value) ||
      (localStorage.getItem("title") !== null &&
        localStorage.getItem("body") !== null)
    ) {
      getLoc().then(res => {
        makeBuffer(vid.value).then(data => {
          Fetch.addPost({
            title: title.value || localStorage.getItem("title"),
            body: body.value || localStorage.getItem("body"),
            author: user.value.id,
            long: res.longitude,
            lat: res.latitude,
            img: data,
            anonymous: anon,
            isVideo: isVideo.value
          })
            .then(res => {
              localStorage.removeItem("title");
              localStorage.removeItem("body");
              b64.value = "";
              title.value = "";
              body.value = "";
              isAnon.value = "False";
              toggle.IsActive = isAnon.value;
              addedPost.value = true;
              hasmadeReq.value = false;
              clearMessages();
              console.dir(res);
            })
            .catch(err => {
              processFailed.value = true;
              hasmadeReq.value = false;
              clearMessages();
              errMessage.value =
                "An error occured and your post could not be added";
            });
        });
      });
    } else {
      processFailed.value = true;
      clearMessages();
      hasmadeReq.value = false;
      errMessage.value = "Please provide title and content";
    }
  } else {
    title.value ? localStorage.setItem("title", title.value) : "";
    body.value ? localStorage.setItem("body", body.value) : "";
    notLoggedIn.value = true;
    clearMessages();
  }
}

function recordAudio() {
  if (Environment.android) {
      counter.value = 0;
      if (!isRecording.value && !isRecordingAudio.value) {
          Recorder.startRecording();
          isRecordingAudio.value = true;
          cntDwn = setInterval(() => {
            counter.value += 1000;
          }, 1000);
          timeout = setTimeout(() => {
              stopAudio();
          }, 300000);
      }
  } else {
      console.log('Platform not supported');
  }
}

function stopAudio() {
    try {
        clearInterval(cntDwn);
        clearTimeout(timeout);
        Recorder.stopRecording();
        counter.value = 0;
        isRecordingAudio.value = false;
        isAudio.value = true;
        isVideo.value = false;
        hasImg.value = false;
    } catch(e) {
        console.log('Platform not supported', e);
    }
}

function playSound() {
    try { 
        if (playing.value === true) {
            Recorder.playRecording();
            playing.value = false;
        } else {
            aud.value = Recorder.playRecording();
            playing.value = true;
        }
    } catch(e) {
        console.log('Platform not supported', e);
    }
}

function signOutNow() {
  storage
    .clearData()
    .then(res => {
      router.goto("login");
      localStorage.clear();
    })
    .catch(err => router.goto("login"));
}

this.Parameter.onValueChanged(module, res => {
  user.value = res.hasOwnProperty("id")
    ? res
    : {
        name: "Anonymous User",
        username: "anonymous",
        avatar: "https://www.gravatar.com/avatar"
      };
  hasId.value = res.hasOwnProperty("id");
  if (res.hasOwnProperty("id")) {
    localStorage.setItem("id", res.id);
    storage
      .getUser()
      .then(res => (user.value = res))
      .catch(err => console.log(err));
  }
});

getCamInfo();

module.exports = {
  capturePhoto: capturePhoto,
  gotoProfile: gotoProfile,
  pagetitle: pagetitle,
  hasId: hasId,
  gotoTop: gotoTop,
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
  isRecordingAudio: isRecordingAudio,
  startRecording: startRecording,
  stopRecording: stopRecording,
  counter: counter,
  makeBuffer: makeBuffer,
  flashMode: flashMode,
  changeCameraFacing: changeCameraFacing,
  changeFlashMode: changeFlashMode,
  // sampleBuffer: sampleBuffer,
  vid: vid,
  recordAudio: recordAudio,
  stopAudio: stopAudio,
  playSound: playSound,
  playing: playing,
  isAudio: isAudio,
  aud: aud,
  searchPosts: searchPosts,
  searchTitle: searchTitle,
  searchRes:  searchRes,
  gotoDetails: gotoDetails,
  noRes: noRes
};
