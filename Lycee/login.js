const body = document.querySelector("body");
const modal = document.querySelector(".modal");
const modalButton = document.querySelector(".modal-button");
const closeButton = document.querySelector(".close-button");
const scrollDown = document.querySelector(".scroll-down");
let isOpened = false;

const openModal = () => {
  modal.classList.add("is-open");
  body.style.overflow = "hidden";
};

const closeModal = () => {
  modal.classList.remove("is-open");
  body.style.overflow = "initial";
};

window.addEventListener("scroll", () => {
  if (window.scrollY > window.innerHeight / 3 && !isOpened) {
    isOpened = true;
    scrollDown.style.display = "none";
    openModal();
  }
});

modalButton.addEventListener("click", openModal);
closeButton.addEventListener("click", closeModal);

document.onkeydown = evt => {
  evt = evt || window.event;
  evt.keyCode === 27 ? closeModal() : false;
};

document.getElementById('loginForm').addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent the form from being submitted immediately

    let username = document.getElementById('username').value;
    let password = document.getElementById('password').value;
    let errorMessage = '';

    // Client-side validation
    if (username === '') {
        errorMessage += 'Username is required.\n';
    }
    if (password === '') {
        errorMessage += 'Password is required.\n';
    }

    if (errorMessage !== '') {
        alert(errorMessage); // Show error if validation fails
        return;
    }

    // If validation passes, submit the form
    this.submit();
});

// Close button functionality (optional)
document.querySelector('.close-button').addEventListener('click', function () {
    document.querySelector('.modal').style.display = 'none';
});
