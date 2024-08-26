// signaling-server.js
const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

let rooms = {};

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    const data = JSON.parse(message);

    console.log(data.type)

    if (data.type === 'join') {
      console.log('join', data.peerId)

      if(!rooms[data.roomId]) {
        rooms[data.roomId] = [];
      }

      rooms[data.roomId].push({ peerId: data.peerId, ws });

      if(data.isPresentation === true) {
        broadcastPeersPresentation(data.roomId, data.peerId);
      } else {
        broadcastPeers(data.roomId);
      }
    } else if(data.type === 'leave') {
      console.log('leave', data.peerId);

      //remove user from call
      rooms[data.roomId] = rooms[data.roomId].filter((peer) => peer.peerId !== data.peerId);

      broadcastLeaveUser(data.roomId, data.peerId);
      broadcastPeers(data.roomId);
    } else if(data.type === 'toggle-mic') {
      console.log('toggling mic',  data)
      // broadcastPeers(data.roomId);
    } else if(data.type === 'raise-hand') {
      console.log('raising hand', data)
      broadcastRaiseHand(data.roomId);
    } else if(data.type === 'presentation') {
      console.log('presentation', data)
    }

    ws.on('close', () => {
      // peers = peers.filter((peerId) => peerId !== data.peerId);
      // rooms[data.roomId] = rooms[data.roomId].filter((peer) => peer.peerId !== data.peerId);
      //remove user from call
      rooms[data.roomId] = rooms[data.roomId].filter((peer) => peer.peerId !== data.peerId);

      broadcastLeaveUser(data.roomId, data.peerId);
      broadcastPeers(data.roomId);

    });
  });

  const broadcastRaiseHand = (roomId, peerId) => {
    const peers = rooms[roomId];
    const message = JSON.stringify({ type: 'raise-hand', peerId });

    peers.forEach((peer) => {
      if(peer.peerId !== peerId) {
        peer.ws.send(message);
      }
    });
  }

  const broadcastLeaveUser = (roomId, peerId) => {
    const peers = rooms[roomId];
    const message = JSON.stringify({ type: 'leave', peerId });

    peers.forEach((peer) => {
      if(peer.peerId !== peerId) {
        peer.ws.send(message);
      }
    });
  }

  const broadcastPeersPresentation = (roomId, peerId) => {
    const peers = rooms[roomId];
    const message = JSON.stringify({ type: 'peers-presentation', peers, isPresentation: true, peerPresenting: peerId });
    peers.forEach((peer) => {
      peer.ws.send(message);
    })
  }

  const broadcastPeers = (roomId) => {
    const peers = rooms[roomId];
    const message = JSON.stringify({ type: 'peers', peers });

    console.log('total_peers_in_room', peers.length)

    peers.forEach((peer) => {
      peer.ws.send(message);
    });
  };
});

console.log('Signaling server running on ws://localhost:8080');
