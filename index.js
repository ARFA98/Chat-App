
function dropDown() {
    document.getElementById("myDropdown").classList.toggle("show");
  }
  
  // Close the dropdown if the user clicks outside of it
  window.onclick = function(event) {
    if (!event.target.matches('.dropbtn')) {
      var dropdowns = document.getElementsByClassName("dropdown-content");
      var i;
      for (i = 0; i < dropdowns.length; i++) {
        var openDropdown = dropdowns[i];
        if (openDropdown.classList.contains('show')) {
          openDropdown.classList.remove('show');
        }
      }
    }
  }

function show(){
    let modal=document.getElementById('modal');
    modal.showModal();
}

function closeModal(){
    let modal=document.getElementById('modal');
    modal.close();
}

function showProfile(){
    let modal=document.getElementById('profile-modal');
    modal.showModal();
}

function closeProfileModal(){
    let modal=document.getElementById('profile-modal');
    modal.close();
}

// Update Header

const username=localStorage.getItem('name');
const email=localStorage.getItem('email');
const image=localStorage.getItem('image');
const id=localStorage.getItem('id');

const Url='http://127.0.0.1:5500/';

if(username&&email&&image&&id){
    const profileImage=document.getElementById('profile-img')
    const userImage=document.getElementById('user-img')
    const userName=document.getElementById('user-name')
    const user_Name=document.getElementById('user_name')
    const userEmail=document.getElementById('user-email')
    const copyText=document.getElementById('copyText')
    userImage.src=image;
    profileImage.src=image;
    userName.innerText=username;
    user_Name.innerText=username;
    userEmail.innerText=email;
    copyText.value=Url+id;


    const copyBtn = document.getElementById('copyBtn');

    copyBtn.onclick = () => {
        copyText.select();    // Selects the text inside the input
        document.execCommand('copy');    // Simply copies the selected text to clipboard 
    }
}
else{
    window.location.replace(Url+"Login/");
}
let rightSide = document.getElementById('rightSide');
rightSide.style.display="none";






