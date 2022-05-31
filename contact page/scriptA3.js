let savedList = document.querySelector('.saved-list');

document.querySelector('#heart-btn').onclick = () =>{
    savedList.classList.toggle('active');
}



let menu = document.querySelector('#menu-bars');
let navbar = document.querySelector('.navbar');

menu.onclick = () =>{
    navbar.classList.toggle('active');
}