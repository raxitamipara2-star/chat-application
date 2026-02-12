// 🔥 PASTE YOUR FIREBASE CONFIG HERE
const firebaseConfig = {
  apiKey: "AIzaSyDX_QAW9O4IyudEIbAMz4dyMPoG4o6DmlY",
  authDomain: "gym-management-system-5829d.firebaseapp.com",
  projectId: "gym-management-system-5829d",
  storageBucket: "gym-management-system-5829d.firebasestorage.app",
  messagingSenderId: "784832890384",
  appId: "1:784832890384:web:0adcd0817f596c4ddaec95",
  measurementId: "G-YFVSDWHMC0"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

let username = "";
let currentRoom = "";
let chatType = "room";
let privateChatId = "";

// LOGIN
function login() {
  username = document.getElementById("username").value;
  if (!username) return alert("Enter username");

  document.getElementById("login").style.display = "none";
  document.getElementById("chat").style.display = "flex";

  loadRooms();
}

// LOAD ROOMS (REAL-TIME)
function loadRooms() {
  db.collection("rooms").onSnapshot(snapshot => {
    const roomList = document.getElementById("roomList");
    roomList.innerHTML = "";

    snapshot.forEach(doc => {
      const li = document.createElement("li");
      li.textContent = doc.id;
      li.onclick = () => joinRoom(doc.id);
      roomList.appendChild(li);
    });
  });
}

// CREATE ROOM
function createRoom() {
  const roomName = document.getElementById("newRoom").value;
  if (!roomName) return;

  db.collection("rooms").doc(roomName).set({
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });

  document.getElementById("newRoom").value = "";
}

// JOIN ROOM
function joinRoom(roomName) {
  chatType = "room";
  currentRoom = roomName;
  privateChatId = "";

  document.getElementById("roomTitle").innerText = "Room: " + roomName;
  document.getElementById("messages").innerHTML = "";

  loadRoomMessages();
}

// LOAD ROOM MESSAGES
function loadRoomMessages() {
  db.collection("rooms")
    .doc(currentRoom)
    .collection("messages")
    .orderBy("timestamp")
    .onSnapshot(snapshot => {

      const messagesDiv = document.getElementById("messages");
      messagesDiv.innerHTML = "";

      snapshot.forEach(doc => {
        const data = doc.data();
        messagesDiv.innerHTML +=
          "<p><b>" + data.user + ":</b> " + data.text + "</p>";
      });

      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    });
}

// START PRIVATE CHAT
function startPrivateChat() {
  const otherUser = document.getElementById("privateUser").value;
  if (!otherUser || otherUser === username) return;

  const users = [username, otherUser].sort();
  privateChatId = users.join("_");

  chatType = "private";
  currentRoom = "";

  document.getElementById("roomTitle").innerText =
    "Private Chat: " + otherUser;

  loadPrivateMessages();
}

// LOAD PRIVATE MESSAGES
function loadPrivateMessages() {
  db.collection("privateChats")
    .doc(privateChatId)
    .collection("messages")
    .orderBy("timestamp")
    .onSnapshot(snapshot => {

      const messagesDiv = document.getElementById("messages");
      messagesDiv.innerHTML = "";

      snapshot.forEach(doc => {
        const data = doc.data();
        messagesDiv.innerHTML +=
          "<p><b>" + data.user + ":</b> " + data.text + "</p>";
      });

      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    });
}

// SEND MESSAGE
function sendMessage() {
  const text = document.getElementById("msg").value;
  if (!text) return;

  if (chatType === "room" && currentRoom) {

    db.collection("rooms")
      .doc(currentRoom)
      .collection("messages")
      .add({
        user: username,
        text: text,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      });

  } else if (chatType === "private" && privateChatId) {

    db.collection("privateChats")
      .doc(privateChatId)
      .collection("messages")
      .add({
        user: username,
        text: text,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      });
  }

  document.getElementById("msg").value = "";
}
