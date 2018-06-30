var Observable = require("FuseJS/Observable");
var storage = require("./storage");
var Environment = require('FuseJS/Environment');
var url;

if (Environment.preview) {
  url = "http://127.0.0.1:1337";
} else {
  url = "https://reportapp-dirisu.herokuapp.com";
}

module.exports = {
  logout: function () {
    return new Promise((resolve, reject) => {
      storage.clearData().then(res => resolve(res)).catch(err => reject(err));
    });
  },
  login: function (username) {
    return new Promise((resolve, reject) => {
      fetch(`${url}/user/login/?username=${username}`, {
          headers: {
            "Content-Type": "application/json"
          },
        })
        .then(res => resolve(res.json()))
        .catch(err => reject(err));
    });
  },
  getUser: function (id) {
    return new Promise((resolve, reject) => {
      fetch(`${url}/user/getuser/?id=${id}`, {
          headers: {
            "Content-Type": "application/json"
          },
        })
        .then(res => resolve(res.json()))
        .catch(err => reject(err));
    });
  },
  signup: function (username, name) {
    return new Promise((resolve, reject) => {
      fetch(`${url}/user/signup/?username=${username}&name=${name}`, {
          headers: {
            "Content-Type": "application/json"
          },
          method: 'POST'
        })
        .then(res => {
          resolve(res.json());
        })
        .catch(err => reject(err));
    });
  },
  getPosts: function () {
    return new Promise((resolve, reject) => {
      fetch(`${url}/post/getposts`, {
          headers: {
            "Content-Type": "application/json"
          }
        })
        .then(resp => resolve(resp.json()))
        .catch(err => reject(err));
    });
  },
  getRecPosts: function (time) {
    return new Promise((resolve, reject) => {
      fetch(`${url}/post/getrecposts/?time=${time}`, {
          headers: {
            "Content-Type": "application/json"
          }
        })
        .then(resp => resolve(resp.json()))
        .catch(err => reject(err));
    });
  },
  getPost: function (id) {
    return new Promise((resolve, reject) => {
      fetch(`${url}/post/getpost/?id=${id}`, {
          headers: {
            "Content-Type": "application/json"
          }
        })
        .then(resp => resolve(resp.json()))
        .catch(err => reject(err));
    });
  },
  addPost: function (body) {
    return new Promise((resolve, reject) => {
      fetch(`${url}/post/createpost`, {
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(body),
          method: 'POST'
        })
        .then(resp => resolve(resp.json()))
        .catch(err => reject(err));
    });
  },
  upVote: function (isPost, id) {
    return new Promise((resolve, reject) => {
      if (isPost) {
        fetch(`${url}/post/upvote/?id=${id}`, {
            headers: {
              "Content-Type": "application/json"
            },
            method: 'PUT'
          })
          .then(resp => resolve(resp.json()))
          .catch(err => reject(err));
      } else {
        fetch(`${url}/comments/upvote/?id=${id}`, {
            headers: {
              "Content-Type": "application/json"
            },
            method: 'PUT'
          })
          .then(resp => resolve(resp.json()))
          .catch(err => reject(err));
      }
    });
  },
  downVote: function (isPost, id) {
    return new Promise((resolve, reject) => {
      if (isPost) {
        fetch(`${url}/post/downvote/?id=${id}`, {
            headers: {
              "Content-Type": "application/json"
            },
            method: 'PUT'
          })
          .then(resp => resolve(resp.json()))
          .catch(err => reject(err));
      } else {
        fetch(`${url}/comments/downvote/?id=${id}`, {
            headers: {
              "Content-Type": "application/json"
            },
            method: 'PUT'
          })
          .then(resp => resolve(resp.json()))
          .catch(err => reject(err));
      }
    });
  },
  addComment: function (body) {
    return new Promise((resolve, reject) => {
      fetch(`${url}/comments/addcomment`, {
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(body),
          method: 'POST'
        })
        .then(resp => resolve(resp.json()))
        .catch(err => reject(err));
    });
  },
  getComments: function (post) {
    return new Promise((resolve, reject) => {
      fetch(`${url}/comments/getcomments/?post=${post}`, {
          headers: {
            "Content-Type": "application/json"
          }
        })
        .then(resp => resolve(resp.json()))
        .catch(err => reject(err));
    });
  },
  getStats: function(id) {
    return new Promise((resolve, reject) => {
      fetch(`${url}/user/getuserstat/?id=${id}`, {
        headers: {
          "Content-Type": "application/json"
        }
      })
      .then(res => resolve(res.json()))
      .catch(err => reject(err));
    });
  },
  updateProfile: function(body) {
    return new Promise((resolve, reject) => {
      fetch(`${url}/user/updateprofile`, {
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(body),
          method: 'PUT'
        })
        .then(resp => resolve(resp.json()))
        .catch(err => reject(err));
    });
  },
};