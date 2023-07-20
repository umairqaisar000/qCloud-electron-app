require("dotenv").config();
const fs = require("fs");
const http = require("http");
// const express = require("express");
const socketIO = require("socket.io");
const { v4: uuidv4 } = require("uuid");
const socketIOP2P = require("socket.io-p2p-server").Server;
// const cors = require("cors");
// const app = express();
// var bodyParser = require("body-parser");
// const idToSidDict = {};

const server = http.createServer();
const roomID = uuidv4();

// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.json());
// app.use(
//   cors({
//     origin: process.env.REACT_APP_URL,
//     methods: ["GET", "POST"],
//   })
// );
console.log(process.env.REACT_APP_URL);
const io = socketIO(server, {
  cors: {
    origin: process.env.REACT_APP_URL, // Replace with the origin of your React application
    methods: ["GET", "POST"], // Specify the allowed methods
  },
});

io.use(socketIOP2P);

io.on("connection", (socket) => {
  console.log("A client connected.");
  socket.emit("send_room_id", roomID);

  socket.join(roomID);

  socket.on("message", (data) => {
    console.log("Received message:", data);
    // Handle the received message as needed
  });

  socket.on("get_terminal_code", async (code) => {
    try {
      await execShellCommand(code, socket);
    } catch (e) {
      console.log(e);
    }
  });

  // socket.on("get_terminal_code", async ({ container, code }) => {
  //   console.log(`docker exec -d ${container} ${code}`);
  //   const output = await execShellCommand(
  //     `docker exec ${container} ${code} > output.txt`
  //   ); // Pass the socket as an argument
  //   let outputFileName = "output.txt";
  //   fs.readFile(outputFileName, "utf8", (err, data) => {
  //     if (err) {
  //       console.error("Error reading output file:", err);
  //       return;
  //     }

  //     // Emit the output to the client
  //     socket.emit("command_output", { output: data });

  //     // Remove the output file
  //     // fs.unlink(outputFileName, (err) => {
  //     //   if (err) {
  //     //     console.error("Error deleting output file:", err);
  //     //     return;
  //     //   }
  //     //   console.log("Output file deleted.");
  //     // });
  //   });
  // });

  socket.on("disconnect", () => {
    console.log("A client disconnected.");
  });
});

const execShellCommand = (cmd, socket) => {
  console.log(cmd, socket);
  const exec = require("child_process").exec;
  return new Promise((resolve, reject) => {
    const child = exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.log(error.message);
        socket.emit("command_output", error.message);
        reject(error);
      }
    });

    child.stdout.on("data", (data) => {
      // console.log("stdout:", data);
      socket.emit("command_output", data);
    });

    child.stderr.on("data", (data) => {
      socket.emit("command_output", data);
    });

    child.on("close", (code) => {
      console.log("Child process exited with code:", code);
    });
  });
};

// const execShellCommand = (cmd) => {
//   const exec = require("child_process").exec;

//   return new Promise((resolve, reject) => {
//     exec(cmd, (error, stdout, stderr) => {
//       if (error) {
//         reject(error);
//       } else {
//         resolve(stdout || stderr);
//       }
//     });
//   });
// };

// app.get("/", (req, res) => {
//   res.status(200).json({ message: "Hello From Qcloud Client!" });
// });

// // const port = 3001; // Choose a port number
server.listen(22, () => {
  console.log(`Server listening on port 22`);
});

// const index = (req, res) => {
//   // res.writeHead(200, { "Content-Type": "application/json" });
//   // res.end(JSON.stringify({ message: "HAHAHAHA" }));
// };

// io.on("connection", (socket) => {

//   console.log("connect", socket.id);
//   console.log(socket.handshake.headers["x-real-ip"]);

//   socket.on("set_id", (data) => {
//     const { id } = data;
//     idToSidDict[id] = socket.id;
//     console.log(idToSidDict);
//     console.log(id);
//     socket.emit("status", { status: "success" });
//   });

//   socket.on("live_gpu_data", (data) => {
//     console.log(`live_gpu_data from sid: ${socket.id}:`, data);
//   });

//   socket.on("disconnect", () => {
//     console.log("disconnect", socket.id);
//   });

//   socket.on("get_clients", () => {
//     // commented out for testing purposes //
//     // const clients = Object.keys(io.sockets.adapter.rooms['/']).filter((key) => key !== null);
//     // const clientsData = {};
//     // for (const id of clients) {
//     //   clientsData[id] = idToSidDict[id];
//     // }
//     // socket.emit('clients', clientsData);

//     const clientsData = {};
//     for (const [roomName, room] of io.sockets.adapter.rooms) {
//       const clients = Array.from(room);
//       clientsData[roomName] = clients;
//     }
//     socket.emit("clients", clientsData);
//   });

//   socket.on("code_run", (data) => {
//     const codeRequestDict = {};
//     console.log("Running Code");
//     const sid = uuidv4();
//     codeRequestDict[sid] = socket.id;
//     const jsonData = JSON.parse(data);
//     io.to(socket.id).emit("code_run", { code: jsonData.data.code, sid });
//   });

//   socket.on("code_output", (data) => {
//     const codeRequestDict = {};
//     console.log("Output From sid:", socket.id);
//     console.log(data);
//     io.to(codeRequestDict[socket.id]).emit("message", data);
//     delete codeRequestDict[socket.id];
//   });

//   const docker_start = async () => {
//     try {
//       const ackData = await io.to(socket.id).emit("docker_start", {});
//       console.log(ackData);
//       return true;
//     } catch (err) {
//       console.log(err);
//     }

//     console.log("docker started");
//   };
//   docker_start();

//   // socket.on("docker_start", async (peerSid) => {
//   // callback(ackData);
//   // });

//   socket.on("docker_stop", async (peerSid) => {
//     const ackData = await io.to(peerSid).emit("docker_stop", {});
//     // callback(ackData);
//   });
// });

// server.on("request", index);
// server.listen(process.env.PORT || 8002, () => {
//   console.log(`listening on port : ${process.env.PORT}`);
// });
