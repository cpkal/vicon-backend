// signaling-server.js
const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

let rooms = {};

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    const data = JSON.parse(message);

    if (data.type === 'join') {
      console.log('join', data.peerId)

      if(!rooms[data.roomId]) {
        rooms[data.roomId] = [];
      }

      rooms[data.roomId].push({ peerId: data.peerId, ws });

      // peers.push(data.peerId);
      broadcastPeers(data.roomId);
    }

    ws.on('close', () => {
      // peers = peers.filter((peerId) => peerId !== data.peerId);
      // rooms[data.roomId] = rooms[data.roomId].filter((peer) => peer.peerId !== data.peerId);
      broadcastPeers(data.roomId);
    });
  });

  const broadcastPeers = (roomId) => {
    const peers = rooms[roomId];

    const message = JSON.stringify({ type: 'peers', peers });

    peers.forEach((peer) => {
      peer.ws.send(message);
    });
  };
});

console.log('Signaling server running on ws://localhost:8080');
