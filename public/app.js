(function () {
  var options = {
    video: {width: 1280, height: 720},
    audio: true
  };

  navigator.mediaDevices.getUserMedia(options).then( function(avStream) {
    var videoId = 1;
    var video = document.getElementById("video-display-"+videoId);
    video.srcObject = avStream;
    video.onloadedmetadata = function(e) {
        video.play();
    }
  }).catch(function(err) {
      console.log(err.name + ": " + err.message);
  });

  // Create an endpoints database
  var endpoints = {};

  // Create a listener callback
  var listenerCb = function(from, toEndpoint, method, data) {
    switch(method) {
      case 'INIT':
        toEndpoint.data.status = 'FREE';

      case 'CALL':
        //do something
        //if accepting, send message back to caller!
        //THEN CREATE YOUR END OF THE CALL.. PEER CONNECTOR
        break;
      default:
        //do default
    }
  }
  // Create a signalling channel
  var signallingChannel = {
    registerUser: function(userId, userInfo, listenerCb) {
      var newUser = endpoints[userId] = {
        name: userInfo.name,
        data: userInfo.data || {},
        cb: listenerCb
      }
      listenerCb("", newUser, "INIT");
    },
    // to be implemented properly!!!
    send: function(from, to, method, data) {
      endpoints[to].cb(from, endpoints[to], method, data);
    }
  }
  // Register all users
  signallingChannel.registerUser("user1", {name: "Marina"}, listenerCb);
  signallingChannel.registerUser("user2", {name: "Will"}, listenerCb);
  signallingChannel.registerUser("user3", {name: "Nick"}, listenerCb);
  signallingChannel.registerUser("user4", {name: "Marko"}, listenerCb);


  //register click event to call buttons
  var callBtns = document.querySelectorAll(".call-btn");
  Array.prototype.forEach.call(callBtns, function(button) {
    button.addEventListener('click', function() {
      var from = button.parentElement.getAttribute("id");
      var to = "user" + document.getElementById(from+'-dropdown').value;
      signallingChannel.send(from, to, 'CALL');
    })
  })


})();
