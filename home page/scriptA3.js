let savedList = document.querySelector('.saved-list');

document.querySelector('#heart-btn').onclick = () =>{
    savedList.classList.toggle('active');
}