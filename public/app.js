(function () {

  let options = {
    video: {width: 1280, height: 720},
    audio: true
  };

  // Setting up local video display
  // navigator.mediaDevices.getUserMedia(options).then( function(avStream) {
  //   var videoId = 1;
  //   var video = document.getElementById("video-display-"+videoId);
  //   video.srcObject = avStream;
  //   video.onloadedmetadata = function(e) {
  //       video.play();
  //   }
  // }).catch(function(err) {
  //     console.log(err.name + ": " + err.message);
  // });

  // Create an endpoints database
  let endpoints = {};

  // RTC helper functions using ES6
  const startConnection = () => {
    const pc = new RTCPeerConnection();
    let options = {
      'audio': true,
      'video': true,
    }

    pc.onicecandidate = (evt) => {
      if(evt.candidate) {
        signallingChannel.send({
          'candidate': evt.candidate
        }));
      }
    }

    navigator.getUserMedia(options).then( (stream) => {
      pc.addTrack(stream);
    }).catch((err) => {
      console.log(err.name + ": " + err.message);
    }));

    return pc;
  }

  // Create a listener callback
  const listenerCb = (from, toEndpoint, method, data) => {
    switch(method) {
      case 'INIT':
        toEndpoint.data.status = 'FREE';
        break;

      case 'CALL_REQUEST':
        if(toEndpoint.data.status === 'FREE') {
          //1) create RTCpeercon object, store it on data!
          //2) pc.onIce... pc.onAddStream
          //3) our end ready... now call 'ACCEPT_CALL' to other party.
          let pc = startConnection();

          toEndpoint.data.pc = pc;
          //toEndpoint = { id: "user1", name: "nick", data: { status: free, pc: XX}, cb: function }
          signallingChannel.send(toEndpoint.id, from, 'ACCEPT_CALL', toEndpoint.data.pc);
        }
        break;

      case 'CALL_ACCEPT':
      console.log("pc data", data);
        //1) create pc from this end - creating instance.. & store in data.pc
        // 2) pc.createOffer. making a call 'OFFER' - sending json offer object
        break;

      case 'CALL_DENIED':
        break;

      case 'OFFER':
      //pc.createAnswer then call 'ANSWER'
        break;

      case 'ANSWER':
      //calls "ICE_CANDIDATE", with data..this might happen many times..
        break;

      case 'ICE_CANDIDATE':

        break;

      default:
        //do default
    }
  }
  // Create a signalling channel
  const signallingChannel = {
    registerUser: (userId, userInfo, listenerCb) => {
      var newUser = endpoints[userId] = {
        id: userId,
        name: userInfo.name,
        data: userInfo.data || {},
        cb: listenerCb
      }
      listenerCb("system", newUser, "INIT");
    },
    send: (from, to, method, data) => {
      endpoints[to].cb(from, endpoints[to], method, data);
    }
  }

  // Register all users
  signallingChannel.registerUser("user1", {name: "Marina"}, listenerCb);
  signallingChannel.registerUser("user2", {name: "Will"}, listenerCb);
  signallingChannel.registerUser("user3", {name: "Nick"}, listenerCb);
  signallingChannel.registerUser("user4", {name: "Marko"}, listenerCb);


  //register click event to call buttons
  const callBtns = document.querySelectorAll(".call-btn");
  Array.prototype.forEach.call(callBtns, (button) => {
    button.addEventListener('click', () => {
      let from = button.parentElement.getAttribute("id");
      let to = "user" + document.getElementById(from+'-dropdown').value;
      signallingChannel.send(from, to, 'CALL_REQUEST');
    })
  })


})();
