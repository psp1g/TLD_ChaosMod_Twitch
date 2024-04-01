const express = require("express");
const http = require("http");
const tmi = require("tmi.js");
const path = require("path");
const WebSocket = require("ws");
const fs = require('fs');

let Channel = "";

function getChannelName() {
  try {
    // Read the config.json file
    const configData = fs.readFileSync('config.json');
    const config = JSON.parse(configData);

    // Assuming config.json has a property called 'channelName'
    const channelName = config.channelName;
    return channelName;
  } catch (error) {
    console.error('Error reading config file:', error);
    return null;
  }
}

Channel = getChannelName()


// Replace the channels in the tmi.Client configuration with the content of the file
const client = new tmi.Client({
  channels: [Channel] // Assuming the content of the file contains a single channel name
});
// Setups up http server
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

client.on("message", (channel, tags, message, self) => {
  // If already voted (nice try)
  if (voting["voters"].includes(tags["display-name"])) return;

  // Else, put it at the correct place
  if (message == "1") {
    voting["op1"]["n"]++;
    voting["voters"].push(tags["display-name"]);
  }
  if (message == "2") {
    voting["op2"]["n"]++;
    voting["voters"].push(tags["display-name"]);
  }
  if (message == "3") {
    voting["op3"]["n"]++;
    voting["voters"].push(tags["display-name"]);
  }
  if (message == "4") {
    voting["op4"]["n"]++;
    voting["voters"].push(tags["display-name"]);
  }

  const obj = {
    d: "votes",
    votes: [
      voting["op1"]["n"],
      voting["op2"]["n"],
      voting["op3"]["n"],
      voting["op4"]["n"],
    ],
  };

  // Send updated votes
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(obj));
    }
  });
});

app.use(express.static("public"));
app.use(express.json());

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Options
let voting = {
  op1: {
    name: "",
    n: 0,
  },
  op2: {
    name: "",
    n: 0,
  },
  op3: {
    name: "",
    n: 0,
  },
  op4: {
    name: "",
    n: 0,
  },
  voters: [],
};

let options = [];
let history = [];

function doOptions() {
  let op = [...options];
  op = op.filter(item => !history.includes(item));
  let randomOptions = op.sort(() => Math.random() - Math.random()).splice(0, 4);
  voting["op1"] = {
    name: randomOptions[0],
    n: 0,
  };
  voting["op2"] = {
    name: randomOptions[1],
    n: 0,
  };
  voting["op3"] = {
    name: randomOptions[2],
    n: 0,
  };
  voting["op4"] = {
    name: randomOptions[3],
    n: 0,
  };
  voting["voters"] = [];

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(
        JSON.stringify({
          d: "name",
          names: [
            voting["op1"]["name"],
            voting["op2"]["name"],
            voting["op3"]["name"],
            voting["op4"]["name"],
          ],
        })
      );
      client.send(
        JSON.stringify({
          d: "votes",
          votes: [0, 0, 0, 0],
        })
      );
    }
  });
}

/**
 * INTERVAL HERE
 */
/**let interval = 5;

setInterval(() => {
  //if (!modRunning) return;
  activeEvent();
}, interval * 1000);**/

// Twitch message receiver
client.connect();

/**
 * POST /mod/start = Starts the counter/voting
 * POST /mod/stop = Stops counter/voting
 * GET /activeevent = send the most voted event at that time.
 */

app.post("/mod/:action", (req, res) => {
  // console.log(req, res);
  const action = req.params.action;
  switch (action) {
    case "start":
      // Start the mod
      options = req.body;
      doOptions();
      res.send("MOD STARTED");
      break;
    case "stop":
      // Stop the mod
      // pspErm
      console.log("STOP");
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(
            JSON.stringify({
              d: "STOP"
            })
          );
        }
      });
      res.send("MOD STOPPED");
      break;
    default:
      console.log("How did you get here");
  }
});

app.get("/activeevent", (req, res) => {
  const item = activeEvent();
  res.send(item);
});

function activeEvent() {
  // Get the votes for each option
  const votes = [
    voting["op1"]["n"],
    voting["op2"]["n"],
    voting["op3"]["n"],
    voting["op4"]["n"],
  ];
  const maxVote = Math.max(...votes);

  // Find all options with the highest vote count
  const maxVoteOptions = votes
    .map((vote, index) => (vote === maxVote ? index + 1 : null))
    .filter((index) => index !== null);

  let votedItem;
  // If there's only one option with the highest vote, send that back
  if (maxVoteOptions.length === 1) {
    const optionNumber = maxVoteOptions[0];
    votedItem = voting[`op${optionNumber}`]["name"];
  } else {
    // If there are multiple options with the highest vote, pick one at random
    const randomOptionNumber =
      maxVoteOptions[Math.floor(Math.random() * maxVoteOptions.length)];
    votedItem = voting[`op${randomOptionNumber}`]["name"];
  }

  // Send to overlay
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(
        JSON.stringify({
          d: "voted",
          item: votedItem,
        })
      );
    }
  });

  if (history.length == 5) history.splice(0, 1);
  history.push(votedItem);

  // New options after 0.5s
  setTimeout(doOptions, 700);

  // Send this back to mod
  return votedItem;
}

const PORT = process.env.PORT || 3050;
server.listen(PORT, () => {
  //console.log(`Server is running on port ${PORT}`);
  console.log(`Overlay is up and running! The browser source link is http://localhost:${PORT}/index.html`)
});
