(function () {

  const startConnection = (from, to) => {
    // After 'CALL_REQUEST', set up RTCPeerConnection
    const pc = new RTCPeerConnection();

    // Listener for when candidate received
    pc.onicecandidate = (e) => {
      console.log("....receiving candidate....");
      if(e.candidate) {
        console.log(".....Sending candidate....")
        signallingChannel.send(to.id, from, 'CANDIDATE', e.candidate);
      } else {
        return;
      }
    }

    // Listener for when stream received
    pc.onaddstream = (e) => {
      // Add peers stream to right side
      let videoR = document.getElementById("videoR-display-"+to.id);
      videoR.srcObject = e.stream;
      videoR.play();
      console.log('(Displaying ' + from + 's video stream)')
    }

    let options = {
      video: {width: 1280, height: 720},
      audio: true
    };

    // Set peer connection object to db
    to.data.pc = pc;

    // Initialise users webcam before peer answers call
    return navigator.mediaDevices.getUserMedia(options)
    .then(function(avStream) {
      console.log("Setting up users webcam before peer answers")
      let videoL = document.getElementById("video-display-"+to.id);
      videoL.srcObject = avStream;
      videoL.onloadedmetadata = function(e) {
          videoL.play();
      }
      console.log("Add stream to peer connection")
      pc.addStream(avStream);
    })
    .catch(function(err) {
        console.log(err.name + ": " + err.message);
    });

  }

  // Create a listener callback
  const listenerCb = (fromEndpoint, toEndpoint, method, data) => {
    switch(method) {
      // Called when registered
      case 'INIT':
        console.log('User is now registerd and free.')
        toEndpoint.data.status = 'FREE';
        break;

      case 'CALL_REQUEST':
        if(toEndpoint.data.status === 'FREE') {
          // Make new Peer Connection and pass userId object
          startConnection(fromEndpoint.id, toEndpoint);
          //Send message after Peer connection set up to accept
          console.log("Receiving call from " + fromEndpoint.id);
          signallingChannel.send(toEndpoint.id, fromEndpoint.id, 'CALL_ACCEPT');
        }
        break;

      case 'CALL_ACCEPT':
        // Set own connection after user has called me
        console.log('Setting up connection for ' + toEndpoint.id)
        startConnection(fromEndpoint.id, toEndpoint)
        .then( () => {
          // Get connection data
          var pc2 = toEndpoint.data.pc;
          console.log(toEndpoint.id + ' is making offer')
          pc2.createOffer().then((offer) => {
            console.log(toEndpoint.id + ' has stored own offer')
            pc2.setLocalDescription(offer);
            console.log('Sending offer to ' + fromEndpoint.id)
            signallingChannel.send(toEndpoint.id, fromEndpoint.id, 'OFFER', offer);
          })
        });

        // 2) pc.createOffer. making a call 'OFFER' - sending json offer object
        break;

      case 'OFFER':

        let pc1 = toEndpoint.data.pc;
        console.log(toEndpoint.id + ' is storing offer from ' + fromEndpoint.id)
        pc1.setRemoteDescription(new RTCSessionDescription(data))
        .then( () => pc1.createAnswer())
        .then((answer) => {
          console.log(fromEndpoint.id + ' is storing own answer, and sending answer to ' + toEndpoint.id)
          pc1.setLocalDescription(answer);
          signallingChannel.send(toEndpoint.id, fromEndpoint.id, 'ANSWER', answer)
        })
        break;

      case 'ANSWER':
      // Set remote description
        let pc3 = toEndpoint.data.pc;
        console.log(fromEndpoint.id + ' has received answer from ' + toEndpoint.id + ' and is storing it')
        pc3.setRemoteDescription(new RTCSessionDescription(data))
        break;

      case 'CANDIDATE':
        console.log(".....Candidate identified.....");
        let pc4=toEndpoint.data.pc;
        console.log(".....Adding ice candidate.....");
        pc4.addIceCandidate(new RTCIceCandidate(data));
        break;

      case 'CALL_DENIED':
        break;

      default:
        return;
    }
  }

  // Create an endpoints database
  let endpoints = {};

  // Create a signalling channel to interact with callback functions and endpoints db
  const signallingChannel = {
    // Adds user object to database
    registerUser: (userId, userInfo, listenerCb) => {
      var newUser = endpoints[userId] = {
        id: userId,
        name: userInfo.name,
        data: userInfo.data || {},
        cb: listenerCb
      }
      // Calls new user object in database with INIT message ('system' = not concerned about 'from')
      listenerCb("system", newUser, "INIT");
    },
    // Takes static 'from' and 'to' string, sends database objects of from/to users
    // Sends string message and data
    send: (from, to, method, data) => {
      endpoints[to].cb(endpoints[from], endpoints[to], method, data);
    }
  }

  // Register all users with userId, name and callback function
  signallingChannel.registerUser("user1", {name: "Marina"}, listenerCb);
  signallingChannel.registerUser("user2", {name: "Will"}, listenerCb);
  signallingChannel.registerUser("user3", {name: "Nick"}, listenerCb);
  signallingChannel.registerUser("user4", {name: "Marko"}, listenerCb);


  // Register click event to call buttons
  const callBtns = document.querySelectorAll(".call-btn");
  Array.prototype.forEach.call(callBtns, (button) => {
    button.addEventListener('click', () => {
      // Get parents userId
      let from = button.parentElement.getAttribute("id");
      // Get select menu value
      let to = "user" + document.getElementById(from+'-dropdown').value;
      // Send call request to signalling channel
      signallingChannel.send(from, to, 'CALL_REQUEST');
    })
  })
})();
