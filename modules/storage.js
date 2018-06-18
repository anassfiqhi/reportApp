var fs = require("FuseJS/FileSystem");
var path = `${fs.dataDirectory}/posts.tmp`;

module.exports = {
  addPosts: function(data) {
    return new Promise((resolve, reject) => {
      fs
        .writeTextToFile(path, JSON.stringify(data) || '')
        .then(success => {
          resolve(success);
        })
        .catch(err => reject(err));
    })
  },
  getPosts: function() {
    return new Promise((resolve, reject) => {
      fs
        .readTextFromFile(path)
        .then(data => {
          resolve(JSON.parse(data));
        })
        .catch(err => reject(err));
    })
  },
  setUser: function (data) {
    return new Promise((resolve, reject) => {
      localStorage.setItem('user', JSON.stringify(data))
      resolve(JSON.parse(localStorage.getItem('user')));
    });
  },
  setId: function (data) {
    return new Promise((resolve, reject) => {
      localStorage.setItem('id', data);
      resolve(localStorage.getItem('id'));
    });
  },
  getId: function () {
    return new Promise((resolve, reject) => {
      if (localStorage.getItem('id')) {
        resolve(localStorage.getItem('id'));
      } else {
        reject(false);
      }
    });
  },
  getUser: function () {
    return new Promise((resolve, reject) => {
      if (localStorage.getItem('user')) {
        resolve(JSON.parse(localStorage.getItem('user')));
      } else {
        reject(false);
      }
    });
  },
  userDataExists: function () {
    return new Promise((resolve, reject) => {
      if (localStorage.getItem('user')) {
        resolve(true);
      } else {
        reject(false);
      }
    });
  },
  clearData: function () {
    return Promise.all([fs.delete(userPath), fs.delete(basePath)]);
  }
};