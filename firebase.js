const firebaseConfig = {
  apiKey: "AIzaSyCMJlpkEnkhbsdrcyu7MWq3s-ba2aq_D_g",
  authDomain: "chat-app-af5eb.firebaseapp.com",
  projectId: "chat-app-af5eb",
  storageBucket: "chat-app-af5eb.appspot.com",
  messagingSenderId: "703698169077",
  appId: "1:703698169077:web:ef3891d1a5fd41051b29bc",
  measurementId: "G-N7H4VY9QPS"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();
const storage = firebase.storage();

const baseUrl = 'https://arfa98.github.io/Chat-App/';


//signup function
function signUp(event) {
  event.preventDefault();
  var name = event.target.name.value;
  var date = event.target.date.value;
  var email = event.target.email.value;
  var password = event.target.password.value;
  var image = event.target.imageUrl.value || null;
  console.log(image)
  if (!image) {
    alert("Please enter a valid image");
    return;
  }
  auth.createUserWithEmailAndPassword(email, password)
    .then((res) => {
      db.collection('users').doc(res.user.uid).set({
        name: name,
        email: email,
        date: date,
        image: image,
      })
        .then((docRef) => {
          localStorage.setItem('id', res.user.uid);
          localStorage.setItem('name', name);
          // localStorage.setItem('email', email);
          localStorage.setItem('image', image);
          localStorage.setItem('currentChat', '');
          localStorage.setItem('currentChatId', '');
          window.location.replace(baseUrl + "home.html")
        })
        .catch((error) => {
          console.log("abcd")
          Swal.fire({
            icon: 'error',
            title: 'Register',
            text: error,
          });
        });

    })
    .catch(e => {
      console.log("xyz")
      Swal.fire({
        icon: 'error',
        title: 'Register',
        text: e.message,
      })
    })

}

//signIN function
function signIn(event) {
  event.preventDefault();
  var email = event.target.email.value;
  var password = event.target.password.value;
  console.log(email, password);
  auth.signInWithEmailAndPassword(email, password)
    .then((res) => {
      console.log(res.user.uid)
      db.collection('users').doc(res.user.uid).get().then(doc => {
        let result = doc.data();
        console.log(result);
        localStorage.setItem('id', res.user.uid);
        localStorage.setItem('name', result.name);
        localStorage.setItem('email', result.email);
        localStorage.setItem('image', result.image);
        localStorage.setItem('currentChat', '');
        localStorage.setItem('currentChatId', '');
        window.location.replace(baseUrl + "home.html")
      })
    })
    .catch(err => Swal.fire({
      icon: 'error',
      title: 'Login',
      text: err.message,
    }));

}
//signOut

function signOut() {
  auth.signOut();
  localStorage.removeItem('id');
  localStorage.removeItem('name');
  localStorage.removeItem('email');
  localStorage.removeItem('image');
  localStorage.removeItem('currentChat');
  localStorage.removeItem('currentChatId');
  window.location.replace(Url + "Login/");
}


// Upload Image
function uploadImage(e) {
  const metadata = {
    contentType: 'image/jpeg',
  };
  let register_btn = document.getElementById('register-btn');
  register_btn.value = "Uploading image ....";
  const file = e.target.files[0];
  const storageRef = storage.ref().child('user/images/' + new Date().getTime() + '.jpg')
  storageRef.put(file).then(function (result) {
    storageRef.getDownloadURL().then(function (result) {
      const imageUrl = document.getElementById('imageUrl');
      imageUrl.value = result;
      let register_btn = document.getElementById('register-btn');
      register_btn.value = "Register";
    })
      .catch(err => {
        Swal.fire({
          icon: 'error',
          title: 'Image Upload',
          text: err.message,
        })
      })
  })
    .catch(err => {
      Swal.fire({
        icon: 'error',
        title: 'Image Upload',
        text: err.message,
      })
    })
}

// Send Invitation

// Create chat

function createChat(e) {
  e.preventDefault();
  const userId = localStorage.getItem('id');
  const image = localStorage.getItem('image');
  const name = localStorage.getItem('name');
  let link = e.target.link.value;
  link = link.split(baseUrl)[1];
  console.log(userId, link);

  db.collection('users').doc(userId).collection('chat').doc(link).get()
    .then(docRef => {
      if (docRef.exists) {
        alert('You already have a chat with this user');
        return;
      }
      else {
        db.collection('chat').add({
          member: [userId, link],
          messages: [],
        })
          .then(chat => {

            db.collection('notification').doc(link).collection('data').add({
              type: 'invite',
              chatId: chat.id,
              accept: 0,
              senderId: {
                id: userId,
                name: name,
                image: image
              }
            })


            Swal.fire({
              icon: 'success',
              title: 'Friend Request',
              text: 'Request has been sent successfully',
            })
          });
      }
    });

};

function acceptRequest({ n_id, s_id, chatId }) {
  const id = s_id;
  console.log(n_id, s_id, chatId);
  const userId = localStorage.getItem('id');
  const image = localStorage.getItem('image');
  const name = localStorage.getItem('name');
  db.collection('users').doc(userId).collection('chat').doc(id).get()
    .then(docRef => {
      if (docRef.exists) {
        alert('You already have a chat with this user');
        return;
      }
      else {
        db.collection('chat').doc(chatId).get().then(res => {
          let data = res.data().messages.reverse();
          let lastMessage = data.length > 0 ? data[0] : {
            type: 'text',
            message: 'Start Conversation',
            sender: {
              id: '',
              image: '',
              name: ''
            },
            timestamp: 0
          };

          db.collection('users').doc(id).collection('chat').doc(userId).set({
            chatId: chatId,
            member: [userId, id],
            type: '',
            message: 'Start conversation',
            senderId: {},
            timestamp: 0,
            unread: false
          })
            .then(res => {

            });

          db.collection('users').doc(userId).collection('chat').doc(id).set({
            chatId: chatId,
            member: [userId, id],
            type: lastMessage.type,
            message: lastMessage.message,
            senderId: {
              id: lastMessage.sender.id ? lastMessage.sender.id : '',
              image: lastMessage.sender.image ? lastMessage.sender.image : '',
              name: lastMessage.sender.name ? lastMessage.sender.name : ""
            },
            timestamp: lastMessage.timestamp
          })
            .then(res => {
              db.collection('notification').doc(id).collection('data').add({
                type: 'accept',
                senderId: {
                  id: userId,
                  name: name,
                  image: image
                }
              });
              db.collection('notification').doc(userId).collection('data').doc(n_id).update({
                accept: 1
              });
              db.collection('notification').doc(id).doc('unSeen').get().then(doc => {
                if (doc.exists) {
                  db.collection('notification').doc(id).update({ unSeen: doc.data() + 1 })
                } else {
                  db.collection('notification').doc(id).doc('unSeen').set(1)
                }

              })

            });

        })

      }
    });
};

function rejectRequest({ n_id, s_id, chatId }) {
  const id = s_id;
  const userId = localStorage.getItem('id');
  db.collection('notification').doc(userId).collection('data').doc(id).delete().then(() => {
    db.collection('notification').doc(userId).collection('data').doc(n_id).update({
      accept: 2
    });
    db.collection('notification').doc(id).doc('unSeen').get().then(doc => {
      if (doc.exists) {
        db.collection('notification').doc(id).update({ unSeen: doc.data() + 1 })
      } else {
        db.collection('notification').doc(id).doc('unSeen').set(1)
      }

    })
  }).catch((error) => {
    console.error("Error removing document: ", error);
  });
};

let messages;

function sendMessage(e) {
  e.preventDefault();
  const currentChat = localStorage.getItem('currentChat');
  const userId = localStorage.getItem('id');
  const name = localStorage.getItem('name');
  const image = localStorage.getItem('image');
  let message = e.target.message.value;

  messages.push({
    type: 'text',
    message,
    sender: {
      id: userId,
      name,
      image
    },
    timestamp: new Date().getTime()
  })
  db.collection('users').doc(userId).collection('chat').doc(currentChat).get().then((doc) => {
    const chatId = doc.data().chatId;
    db.collection('chat').doc(chatId).update({
      messages: firebase.firestore.FieldValue.arrayUnion({
        type: 'text',
        message,
        sender: {
          id: userId,
          name,
          image
        },
        timestamp: new Date().getTime()
      })
    })
  })

  db.collection('users').doc(userId).collection('chat').doc(currentChat).update({
    type: 'text',
    message: message,
    senderId: {
      id: userId,
      name,
      image
    },
    timestamp: new Date().getTime(),
    unread: true
  })

  getCurrentChat();
  document.getElementById("chat-input").reset();
};

function getNotifications() {
  let userId = localStorage.getItem('id');
  const notificationList = document.getElementById("myDropdown");
  const badge = document.getElementById('badge');



  db.collection('notification').doc(userId).collection('data').get()
    .then((querySnapshot) => {
      let result = [];
      let html = '';
      querySnapshot.forEach((doc) => {
        let code = doc.data().type.includes('invite') ?
          `<div>
      <div style="display:flex;align-items:center">
      <img src="${doc.data().senderId.image}" style="width:30px;height:30px;border-radius:15px" />
      <h6 style="font-size:15px;margin-left:7px">${doc.data().senderId.name} invited to join for chatting!</h6>
      </div>
      <div class="copy-body" style="display:flex;justify-content:flex-end;width:100%">
      ${doc.data().accept === 1 ? `<button style="background-color:green">Request Acctepted</button>` : ''}
      ${doc.data().accept === 2 ? `<button style="background-color:red">Request Rejected</button>` : ''}
      ${doc.data().accept === 0 ?
            `<button  onclick="acceptRequest({n_id:'${doc.id}', s_id:'${doc.data().senderId.id}', chatId:'${doc.data().chatId}'})" style="margin-right:10px;cursor:pointer;background-color:green">Accept</button>
      <button n_id="${doc.id}" s_id="${doc.data().senderId.id}" onclick="rejectRequest({n_id:'${doc.id}', s_id:'${doc.data().senderId.id}', chatId:'${doc.data().chatId}'})" style="cursor:pointer;background-color:red">Reject</button>` : ''}
      </div>
      </div>`
          : (
            doc.data().type.includes('accept') ?
              `<div>
      <div style="display:flex;align-items:center">
      <img src="${doc.data().senderId.image}" style="width:30px;height:30px;border-radius:15px" />
      <h6 style="color:green;font-size:15px;margin-left:10px">${doc.data().senderId.name} accepted your request!</h6>
      </div>
      </div>`
              :
              `<div>
      <div style="display:flex;align-items:center">
      <img src="${doc.data().senderId.image}" style="width:30px;height:30px;border-radius:15px" />
      <h6 style="color:red;font-size:15px;margin-left:10px">${doc.data().senderId.name} reject your request</h6>
      </div>
      </div>`
          )
        html += code;
      });
      notificationList.innerHTML = html;
    })
    .catch((error) => {
      console.log("Error getting documents: ", error);
    });
}

getNotifications();

function changeBadge() {
  const userId = localStorage.getItem('id');
  db.collection('notification').doc(userId).update({ unSeen: 0 });
  getNotifications();
}

function getChatRoomList() {
  const userId = localStorage.getItem('id');
  let currentChat = localStorage.getItem('currentChat');

  const chatList = document.getElementById('chatList');

  db.collection('users').doc(userId).collection('chat').get().then(querySnapshot => {
    let result = [];
    var html = '';

    querySnapshot.forEach(async doc => {
      let userList = doc.data().member.filter(m => m !== userId);
      var user = {};
      await db.collection('users').doc(userList[0]).get()
        .then(res => {

          user = res.data();
          let code = `
      <div id="chat_${doc.data().chatId}" class="block ${currentChat && currentChat === doc.id && "active"}" onclick="setCurrentChat({id:'${doc.id}',chatId:'${doc.data().chatId}'})">
        <div class="imgBox">
            <img src="${user.image}" class="cover" alt="">
        </div>
        <div class="details">
            <div class="listHead">
                <h4>${user.name}</h4>
                <p id="msg_d_${doc.data().chatId}" class="time">${doc.data().timestamp === 0 ? '' : new Date(doc.data().timestamp).toLocaleDateString()}</p>
            </div>
            <div class="message_p">
                <p id="msg_s_${doc.data().chatId}">${doc.data().senderId.name ? `${doc.data().senderId.name} : ` : ''} ${doc.data().message ? doc.data().message : ""}</p>
                <b id="chat_b_${doc.data().chatId}">1</b>
            </div>
        </div>
    </div>
      
      `
          html += code;
        })


    })
    setTimeout(() => {
      chatList.innerHTML = html;
    }, 1000)



  })
};

getChatRoomList();

function setCurrentChat({ id, chatId }) {
  const userId = localStorage.getItem('id');
  localStorage.setItem('currentChat', id);
  localStorage.setItem('currentChatId', chatId);
  getCurrentChat();

  let chat = document.getElementById(`chat_${chatId}`);
  if (chat) chat.classList.remove('unread');
  let badge = document.getElementById(`chat_b_${chatId}`);
  if (badge) badge.style.display = "none";
  db.collection('users').doc(userId).collection('chat').doc(id).update({ unread: false });

  let rightSide = document.getElementById('rightSide');
  rightSide.style.display = "block";
  let start = document.getElementById('start');
  start.style.display = "none";


}



function getCurrentChat() {
  const userId = localStorage.getItem('id');
  const id = localStorage.getItem('currentChat');

  const chatHeader = document.getElementById('header');
  const chatBox = document.getElementById('chatBox');
  db.collection('users').doc(userId).collection('chat').doc(id).get().then(doc => {
    db.collection('users').doc(id).get()
      .then(res => {
        chatHeader.innerHTML = `
          <div class="imgText">
                    <div class="userimg">
                        <img src="${res.data().image}" alt="" class="cover">
                    </div>
                    <h4>${res.data().name}</h4>
                </div>
          `
      })

    db.collection('chat').doc(doc.data().chatId).get().then(res => {
      messages = res.data().messages;
      let html = "";

      messages.forEach(message => {
        let code = `
        <div class="message ${userId === message.sender.id ? "my_msg" : "friend_msg"}">
          <p>${message.message} <br><span>${new Date(message.timestamp).toLocaleDateString()}</span></p>
        </div>
      `
        html += code;
      })

      chatBox.innerHTML = html;
    })

  })

};


let userId = localStorage.getItem('id');

let currentChat = localStorage.getItem('currentChat');

db.collection('chat')
  .onSnapshot((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      let chat = document.getElementById(`chat_${doc.id}`);
      if (chat) chat.classList.add('unread');
      let badge = document.getElementById(`chat_b_${doc.id}`);
      if (badge) badge.style.display = 'block';
      let data = doc.data().messages.reverse();
      let lastMessage = data[0];

      let msg_s = document.getElementById(`msg_s_${doc.id}`);
      let msg_d = document.getElementById(`msg_d_${doc.id}`);
      console.log(msg_d);
      if (msg_s && msg_d) {
        msg_d.innerText = new Date(lastMessage.timestamp).toLocaleDateString();
        msg_s.innerText = `${lastMessage.sender.name} : ${lastMessage.message}`
      }

    });

  });


db.collection('users').doc(userId).collection('chat')
  .onSnapshot((querySnapshot) => {
    getChatRoomList();

  });



let register_btn = document.getElementById('register-btn');
if (register_btn) register_btn.value = "Please fill all fields";


