var fs = require("FuseJS/FileSystem");
var path = `${fs.dataDirectory}/posts.tmp`;
var featured = `${fs.dataDirectory}/featuredposts.tmp`;
var trending = `${fs.dataDirectory}/trendingposts.tmp`;
var user = `${fs.dataDirectory}/user.tmp`;
var baseData = `${fs.dataDirectory}/base.tmp`;
var stats = `${fs.dataDirectory}/stats.tmp`;

module.exports = {
  isFirstVisit: function() {
    return new Promise((resolve, reject) => {
      fs.exists(baseData)
      .then(function(x) {
        if (x) {
          reject(x)
        } else {
          resolve(true);
        }
      }, function(error) {
        resolve(true);
      });
    })
  },
  writeBaseData: function() {
    return new Promise((resolve, reject) => {
      fs.writeTextToFile(baseData, JSON.stringify({'firstVisit': false}))
      .then(success => resolve(success))
      .catch(err => reject(err))
    })
  },
  addPosts: function(data) {
    return new Promise((resolve, reject) => {
      fs
        .writeTextToFile(path, JSON.stringify(data) || '{}')
        .then(success => {
          resolve(success);
        })
        .catch(err => reject(err));
    })
  },
  addFeaturedPosts: function(data) {
    return new Promise((resolve, reject) => {
      fs
        .writeTextToFile(featured, JSON.stringify(data) || '{}')
        .then(success => {
          resolve(success);
        })
        .catch(err => reject(err));
    })
  },
  addTrendingPosts: function(data) {
    return new Promise((resolve, reject) => {
      fs
        .writeTextToFile(trending, JSON.stringify(data) || '{}')
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
    });
  },
  getFeaturedPosts: function() {
    return new Promise((resolve, reject) => {
      fs
        .readTextFromFile(featured)
        .then(data => {
          resolve(JSON.parse(data));
        })
        .catch(err => reject(err));
    });
  },
  getTrendingPosts: function() {
    return new Promise((resolve, reject) => {
      fs
        .readTextFromFile(trending)
        .then(data => {
          resolve(JSON.parse(data));
        })
        .catch(err => reject(err));
    });
  },
  getPostById: function(id) {
    return new Promise((resolve, reject) => {
      fs
        .readTextFromFile(path)
        .then(data => {
          resolve(JSON.parse(data).filter(res => res.id === id)[0]);
        })
        .catch(err => {
          fs
            .readTextFromFile(featured)
            .then(data => {
              resolve(JSON.parse(data).filter(res => res.id === id)[0]);
            })
            .catch(err => {
              fs
                .readTextFromFile(trending)
                .then(data => {
                  resolve(JSON.parse(data).filter(res => res.id === id)[0]);
                })
                .catch(err => {
                  reject(err);
                });
            });
        });
    });
  },
  setUser: function (data) {
    return new Promise((resolve, reject) => {
      fs
        .writeTextToFile(user, JSON.stringify(data) || '{}')
        .then(success => resolve(success))
        .catch(err => reject(err))
    });
  },
  getUser: function () {
    return new Promise((resolve, reject) => {
      fs
        .readTextFromFile(user)
        .then(data => {
          resolve(JSON.parse(data));
        })
        .catch(err => reject(err));
    });
  },
  userDataExists: function () {
    return new Promise((resolve, reject) => {
      fs.exists(user)
      .then(function(x) {
        if (x) {
          resolve(x)
        } else {
          reject(false);
        }
      }, function(error) {
        reject(false);
      });
    });
  },
  setStats: function (data) {
    return new Promise((resolve, reject) => {
      fs.writeTextToFile(stats, JSON.stringify(data) || {})
      .then(success => resolve(success))
      .catch(err => reject(err))
    })
  },
  getStats: function () {
    return new Promise((resolve, reject) => {
      fs
        .readTextFromFile(stats)
        .then(data => {
          resolve(JSON.parse(data));
        })
        .catch(err => reject(err));
    });
  },
  clearData: function () {
    return Promise.all([fs.delete(user), fs.delete(stats)]);
  }
};