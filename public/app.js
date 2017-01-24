(function () {


  //Setting up local video display


  // Create an endpoints database
  let endpoints = {};

  // RTC helper functions using ES6
  const startConnection = (from, to) => {
    const pc = new RTCPeerConnection();

    pc.onicecandidate = (e) => {
      if(e.candidate) {
        signallingChannel.send(to, from, 'CANDIDATE', e.candidate);
      } else {
        console.log("not sending emoty candidate");
      }
    }

    pc.onaddstream = (e) => {
      console.log('recieved remote stream for:' , from.name);
      let videoR = document.getElementById("videoR-display-"+to);
      console.log("remote video", videoR);
      videoR.srcObject = e.stream;
      videoR.play();
    }

    let options = {
      video: {width: 1280, height: 720},
      audio: true
    };

    navigator.mediaDevices.getUserMedia(options).then( function(avStream) {
      let videoL = document.getElementById("video-display-"+to);
      videoL.srcObject = avStream;
      videoL.onloadedmetadata = function(e) {
          videoL.play();
      }
    }).catch(function(err) {
        console.log(err.name + ": " + err.message);
    });

    return pc;
  }

  // Create a listener callback
  const listenerCb = (fromEndpoint, toEndpoint, method, data) => {
    switch(method) {
      case 'INIT':
        toEndpoint.data.status = 'FREE';
        break;

      case 'CALL_REQUEST':
        if(toEndpoint.data.status === 'FREE') {
          //1) create RTCpeercon object, store it on data!
          //2) pc.onIce... pc.onAddStream
          //3) our end ready... now call 'ACCEPT_CALL' to other party.
          let pc1 = startConnection(fromEndpoint.id, toEndpoint.id);
          toEndpoint.data.pc = pc1;
          signallingChannel.send(toEndpoint.id, fromEndpoint.id, 'CALL_ACCEPT');
        }
        break;

      case 'CALL_ACCEPT':

        let pc2 = startConnection(fromEndpoint.id, toEndpoint.id);
        toEndpoint.data.pc = pc2;

        //1) create pc from this end - creating instance.. & store in data.pc
        pc2.createOffer().then((offer) => {
          pc2.setLocalDescription(offer);
          signallingChannel.send(toEndpoint.id, fromEndpoint.id, 'OFFER', offer);
        })

        // 2) pc.createOffer. making a call 'OFFER' - sending json offer object
        break;

      case 'OFFER':

        let pc1 = toEndpoint.data.pc;

        pc1.setRemoteDescription(new RTCSessionDescription(data))
        .then( () => pc1.createAnswer())
        .then((answer) => {
          pc1.setLocalDescription(answer);
          signallingChannel.send(toEndpoint.id, fromEndpoint.id, 'ANSWER', answer)
          console.log("pc1 after creating answer", pc1);
        })
        break;

      case 'ANSWER':
      //calls "CANDIDATE", with data..this might happen many times..
        let pc3 = toEndpoint.data.pc;
        pc3.setRemoteDescription(new RTCSessionDescription(data))
        break;

      case 'CANDIDATE':
        console.log("ICE ICE BABY");
        console.log(data);

        break;

      case 'CALL_DENIED':
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
      endpoints[to].cb(endpoints[from], endpoints[to], method, data);
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
