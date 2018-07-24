var Observable = require("FuseJS/Observable");
var LocalNotify = require("FuseJS/LocalNotifications");
var Fetch = require("modules/fetcher");
var storage = require("modules/storage");
var GeoLocation = require("FuseJS/GeoLocation");
var ImageTools = require("FuseJS/ImageTools");
var FileSystem = require("FuseJS/FileSystem");
var Base64 = require("FuseJS/Base64");
// var Reader = require("Reader");
var Recorder = require("Recorder");
var user = Observable();
var width = Observable();
var isRecording = Observable(false);
var isRecordingAudio = Observable(false);
var Environment = require('FuseJS/Environment');
var counter = Observable('05:00');
var isVideo = Observable(false);
var isAudio = Observable(false);
var takePic_ = Observable(false);
var capVid_ = Observable(false);
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
var hasCapturedImg = Observable(false);
var tempImg = Observable();
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
var status = Observable({
  label: "YES",
  value: 1
}, {
  label: "NO",
  value: 0
});
var anonymous = Observable();
var isAnon = Observable(false);
var Camera = _cameraView;
var cameraBack = true;
var flashMode = Observable(Camera.FLASH_MODE_AUTO);

function getCamInfo() {
  Camera.getCameraInfo()
    .then(function (info) {
      captureMode.value = info[Camera.INFO_CAPTURE_MODE];
      cameraFacing.value = info[Camera.INFO_CAMERA_FACING];
      flashMode.value = info[Camera.INFO_FLASH_MODE];
      cameraReady.value = true;
    })
    .catch(function (error) {
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
    .then(function (newFacing) {
      cameraBack = newFacing == back;
      getCameraInfo();
      console.log(
        "Camera facing set to: " + (newFacing == back ? "back" : "front")
      );
    })
    .catch(function (err) {
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
    .then(function (newFlashMode) {
      flashMode.value = newFlashMode;
      console.log("Flash mode set to: " + flashMode.value);
    })
    .catch(function (err) {
      console.log("Failed to set flash mode: " + err);
    });
}

function capturePhoto() {
  Camera.setCaptureMode(Camera.CAPTURE_MODE_PHOTO)
    .then(function (newCaptureMode) {
      Camera.capturePhoto()
        .then(function (photo) {
          photo
            .save()
            .then(function (filePath) {
              tempImg.value = filePath;
              hasCapturedImg.value = true;
              photo.release();
            })
            .catch(function (error) {
              console.log("Failed to capture photo: " + error);
              photo.release();
            });
        })
        .catch(function (error) {});
    })
    .catch(function (error) {
      console.log("Failed to set capture mode: " + error);
    }
  );
}

function confirmImg() {
  isVideo.value = false;
  isAudio.value = false;
  hasImg.value = true;
  img.value = tempImg.value;
  FileSystem.readBufferFromFile(img.value).then(function (buff) {
    hasCapturedImg.value = false;
    ImageTools.getImageFromBuffer(buff).then(image => {
      var options = {
        mode: ImageTools.IGNORE_ASPECT,
        desiredWidth: 400,
        desiredHeight: 300
      };

      ImageTools.resize(image, options)
        .then(function (newPic) {
          ImageTools.getBase64FromImage(image).then(function (
            base64Image
          ) {
            b64.value = base64Image;
          });
        })
        .catch(err => console.log(err));
    });
  });
}

function discardImg() {
  hasCapturedImg.value = false;
}

var cntDwn;
var timeout;

function makeBuffer(file) {
  return new Promise((res, rej) => {
    if (hasImg.value) {
      res(b64.value);
    } else {
      var BufferType = isAudio.value ? FileSystem.readBufferFromFile(aud.value) : FileSystem.readBufferFromFile(file || '');
      BufferType
        .then(function (buff) {
          res(Base64.encodeBuffer(buff) || "");
        })
        .catch(function (error) {
          console.log(error);
          res("");
        });
    }
  });
}

function setLowResolution(resolutions) {
  return resolutions[resolutions.length - 1];
}

function startRecording() {
  if (!isRecording.value && !isRecordingAudio.value) {
    Camera.setCaptureMode(Camera.CAPTURE_MODE_VIDEO)
      .then(function (newCaptureMode) {
        Camera.getCameraInfo().then(function (info) {
          if ("photoResolutions" in info) {
            var resolution = setLowResolution(info["photoResolutions"]);
            var options = {};
            options[Camera.OPTION_PHOTO_RESOLUTION] = resolution;
            counter.value = 30;
            Camera.setPhotoOptions(options)
              .then(function () {
                Camera.startRecording()
                  .then(function (session) {
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
                  .catch(function (error) {
                    console.log("Failed to start recording: " + error);
                    isRecording.value = false;
                    counter.value = 0;
                  });
              })
              .catch(function (error) {
                counter.value = "Capture Failed";
                setTimeout(() => (counter.value = 0), 500);
              });
          } else {
            counter.value = 30;
            Camera.setPhotoOptions(options)
              .then(function () {
                Camera.startRecording()
                  .then(function (session) {
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
                  .catch(function (error) {
                    console.log("Failed to start recording: " + error);
                    isRecording.value = false;
                    counter.value = 0;
                  });
              })
              .catch(function (error) {
                counter.value = "Capture Failed";
                setTimeout(() => (counter.value = 0), 500);
              });
          }
        });
      })
      .catch(function (error) {
        isRecording.value = false;
        console.log(error);
      });
  }
}

function stopRecording() {
  isRecording.value = false;
  clearInterval(cntDwn);
  clearTimeout(timeout);
  counter.value = '05:00';
  recordingSession
    .stop()
    .then(function (recording) {
      vid.value = recording.filePath();
      isVideo.value = true;
      isAudio.value = false;
      hasImg.value = false;
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
      .then(function (location) {
        res({
          longitude: location.longitude,
          latitude: location.latitude
        });
      })
      .catch(function (fail) {
        message.value = fail;
        res({
          longitude: 0,
          latitude: 0
        });
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
    processFailed.value = false;
    if (
      (title.value && body.value) ||
      (localStorage.getItem("title") !== null &&
        localStorage.getItem("body") !== null)
    ) {
      var progress = 0
      var cnDw =  setInterval(() => {
        progress += 1;
        if (progress === 100) {
          progress = 0;
        }
        width.value = `${progress}%`;
      }, 10);
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
              isVideo: isAudio.value ? 'audio' : isVideo.value
            })
            .then(res => {
              localStorage.removeItem("title");
              localStorage.removeItem("body");
              b64.value = "";
              title.value = "";
              body.value = "";
              hasImg.value = false;
              isVideo.value = false;
              isAudio.value = false;
              clearInterval(cnDw);
              toggle.IsActive = isAnon.value;
              addedPost.value = true;
              processing.value = false;
              processFailed.value = false;
              hasmadeReq.value = false;
              notLoggedIn.value = false;
              LocalNotify.now("UPRIGHT NG Post", "Your post has being uploaded", res.title);
              setTimeout(() => {
                addedPost.value = false;
                isAnon.value = "False";
              }, 10000);
            })
            .catch(err => {
              addedPost.value = false;
              processing.value = false;
              clearInterval(cnDw);
              processFailed.value = true;
              notLoggedIn.value = false;
              hasmadeReq.value = false;
              LocalNotify.now("UPRIGHT NG Post", "Your post could not be uploaded", "failed");
              errMessage.value = "An error occured and your post could not be added";
              setTimeout(() => {
                processFailed.value = false;
              }, 10000);
            });
        });
      });
    } else {
      addedPost.value = false;
      processing.value = false;
      processFailed.value = true;
      notLoggedIn.value = false;
      hasmadeReq.value = false;
      errMessage.value = "Please provide title and content";
      setTimeout(() => {
        processFailed.value = false;
      }, 10000);
    }
  } else {
    title.value ? localStorage.setItem("title", title.value) : "";
    body.value ? localStorage.setItem("body", body.value) : "";
    addedPost.value = false;
    processing.value = false;
    processFailed.value = false;
    notLoggedIn.value = true;
    hasmadeReq.value = false;
    setTimeout(() => {
      notLoggedIn.value = false;
    }, 10000);
  }
}

var cntDwnMin;

function recordAudio() {
  var seconds = 59;
  var minutes = 4;
  if (Environment.android) {
    if (!isRecording.value && !isRecordingAudio.value) {
      counter.value = `0${minutes}:${seconds}`;
      Recorder.startRecording();
      isRecordingAudio.value = true;
      cntDwn = setInterval(() => {
        if (seconds === 0) {
          seconds = 59;
        }
        seconds -= 1;
        counter.value = `0${minutes}:${seconds}`;
      }, 1000);
      cntDwnMin = setInterval(() => {
        minutes -= 1;
        counter.value = `0${minutes}:${seconds}`;
      }, 60000);
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
    clearInterval(cntDwnMin);
    clearTimeout(timeout);
    aud.value = Recorder.stopRecording();
    counter.value = '05:00';
    isRecordingAudio.value = false;
    if (aud.value) {
      isAudio.value = true;
      isVideo.value = false;
      hasImg.value = false;
    }
  } catch (e) {
    isRecordingAudio.value = false;
    console.log('Platform not supported', e);
  }
}

function playSound() {
  try {
    if (playing.value === true) {
      Recorder.playRecording();
      playing.value = false;
    } else {
      Recorder.playRecording();
      playing.value = true;
    }
  } catch (e) {
    console.log('Platform not supported', e);
  }
}

function takePic() {
  takePic_.value = true;
  capVid_.value = false;
}

function capVid() {
  capVid_.value = true;
  takePic_.value = false;
}

this.Parameter.onValueChanged(module, res => {
  user.value = res.hasOwnProperty("id") ?
    res :
    {
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

function signOutNow() {
  storage
    .clearData()
    .then(res => {
      router.goto("login");
      localStorage.clear();
    })
    .catch(err => router.goto("login"));
}

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
  searchRes: searchRes,
  gotoDetails: gotoDetails,
  noRes: noRes,
  takePic: takePic,
  takePic_: takePic_,
  capVid: capVid,
  capVid_: capVid_,
  hasCapturedImg: hasCapturedImg,
  confirmImg: confirmImg,
  discardImg: discardImg,
  tempImg: tempImg,
  width: width
};