firebase.initializeApp({
  projectId: "YOUR_FIREBASE_PROJECT_ID"
});

const db = firebase.firestore();
let user = "";
let room = "";

function login() {
  user = username.value.trim();
  if (!user) return alert("Enter username");

  document.getElementById("login").style.display = "none";
  document.getElementById("chat").style.display = "flex";
  loadRooms();
}

function loadRooms() {
  db.collection("rooms").onSnapshot(snap => {
    roomList.innerHTML = "";
    snap.forEach(doc => {
      let li = document.createElement("li");
      li.textContent = doc.id;
      li.onclick = () => joinRoom(doc.id);
      roomList.appendChild(li);
    });
  });
}

function createRoom() {
  let r = newRoom.value.trim();
  if (!r) return;
  db.collection("rooms").doc(r).set({ created: true });
}

function joinRoom(r) {
  room = r;
  messages.innerHTML = "";

  const userRef = db.collection("rooms").doc(room).collection("users").doc(user);

  userRef.get().then(d => {
    if (d.exists) {
      alert("Username already in this room!");
      room = "";
      return;
    }
    userRef.set({ online: true });
    sendSystem(`${user} joined`);
  });

  loadUsers();

  db.collection("rooms").doc(room).collection("messages")
    .orderBy("time")
    .onSnapshot(snap => {
      messages.innerHTML = "";
      snap.forEach(m => {
        let d = m.data();
        let div = document.createElement("div");
        div.innerHTML = d.text;
        messages.appendChild(div);
      });
      messages.scrollTop = messages.scrollHeight;
    });

  window.onbeforeunload = () => {
    sendSystem(`${user} left`);
    userRef.delete();
  };
}

function loadUsers() {
  db.collection("rooms").doc(room).collection("users")
    .onSnapshot(snap => {
      users.innerHTML = "";
      snap.forEach(u => {
        let li = document.createElement("li");
        li.textContent = u.id;
        users.appendChild(li);
      });
    });
}

function send() {
  let text = msg.value.trim();
  if (!text || !room) return;

  let safe = escape(text);
  let time = new Date().toLocaleTimeString();

  db.collection("rooms").doc(room).collection("messages").add({
    text: `<b>${user}</b>: ${safe} <small>${time}</small>`,
    time: Date.now()
  });

  msg.value = "";
}

function sendSystem(msg) {
  db.collection("rooms").doc(room).collection("messages").add({
    text: `<span class='system'>${msg}</span>`,
    time: Date.now()
  });
}

function format(type) {
  let m = msg.value;
  if (type == "bold") msg.value = "**" + m + "**";
  if (type == "italic") msg.value = "_" + m + "_";
  if (type == "link") msg.value = "[text](url)";
}

function escape(str) {
  return str.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
// Toggle emoji panel
function toggleEmoji() {
    const panel = document.getElementById("emojiPanel");
    if (panel.style.display === "none" || panel.style.display === "") {
        panel.style.display = "block";
    } else {
        panel.style.display = "none";
    }
}

// Insert emoji into message box when clicked
document.addEventListener("click", function (e) {
    if (e.target.closest("#emojiPanel")) {
        const emoji = e.target.innerText;
        if (emoji.trim() !== "") {
            document.getElementById("msg").value += emoji;
        }
    }
});
