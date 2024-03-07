const form = document.getElementById('register-form');
const username = document.getElementById('name');
const password = document.getElementById('pass');
const confirmPassword = document.getElementById('confirmPassword');
const email = document.getElementById('email');
const phno = document.getElementById('phone');

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const result = validateInputs();
    console.log("resultr", result);
    if (result) console.log("validation done3");
    validationPassed();
})

const setError = (element, message) => {
    const inputControl = element.parentElement;
    const errorDisplay = inputControl.querySelector('.error')
    errorDisplay.innerText = message
}

const setSuccuss = (element) => {
    const inputControl = element.parentElement;
    const errorDisplay = inputControl.querySelector('.error');
    errorDisplay.innerText = ''
}
const emailValidate = (email) => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    return re.test(String(email).toLowerCase());
}

const phoneValidate = (phone) => {
    const re = /^\d{10}$/;
    return re.test(phone.trim());
}
const passwordValidate = (password) => {
    const re = /^.{8,15}$/;
    return re.test(password.trim());
}

const validateInputs = () => {
    const usernameValue = username.value.trim();
    const passwordValue = password.value.trim();
    const confirmPasswordValue = confirmPassword.value.trim();
    const emailValue = email.value.trim();
    const phoneValue = phno.value.trim();
    let valCount = 0

    if (usernameValue === '') {
        setError(username, 'Please enter your name')
    } else {
        setSuccuss(username);
        valCount++;
    }

    //email validation
    if (emailValue === '') {
        setError(email, 'Email is required');
    }
    else if (!emailValidate(emailValue)) {
        setError(email, 'Please enter a valid email');
    }
    else {
        setSuccuss(email);
        valCount++;

    }


    //phone number validation
    if (phoneValue === '') {
        setError(phone, 'Phone number is required');
    } else if (!phoneValidate(phoneValue)) {
        setError(phone, 'Please enter a valid phone number');
    } else {
        setSuccuss(phone);
        valCount++;

    }

    //passwords validation
    if (passwordValue == "") {
        setError(pass, 'Password  is required');
    } else if (!passwordValidate(passwordValue)) {
        setError(pass, 'Password must be 8-15 characters');
    } else if (passwordValue != confirmPasswordValue) {
        setError(pass, 'Password must be same!');
    } else {
        setSuccuss(pass);
        valCount++;

    }
    return (valCount === 4);
}
// Perform client-side validations


// Perform client-side validation
const validationPassed = validateInputs();

if (validationPassed) {
    // If validation passed, send an AJAX request to the server
    const formData = new FormData(form);
    try {
        const response = await fetch('/submit', {
            method: 'POST',
            body: formData,
        });

        if (response.ok) {
            // Server responded with success, redirect to login page
            window.location.href = '/login';
        } else {
            // Server responded with error, handle accordingly
            const errorData = await response.json();
            console.error('Server error:', errorData.error);
        }
    } catch (error) {
        console.error('Network error:', error);
    }
}