console.log("validation done")
const form = document.getElementById('register-form');
const username = document.getElementById('name');
const password = document.getElementById('pass');
const email = document.getElementById('email');
const phno = document.getElementById('phone');
 
form.addEventListener('submit', (e) => {
    console.log("validation done")

    e.preventDefault();
    validateInputs();
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

const validateInputs = () => {
    const usernameValue = username.value.trim();
    const passwordValue = password.value.trim();
    const emailValue = email.value.trim();
    const phoneValue = phno.value.trim();
 
    if (usernameValue === '') {
        setError(username, 'Please enter your name')
    } else {
        setSuccuss(username);
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
    }


    //phone number validation
    if (phoneValue === '') {
        setError(phone, 'Phone number is required');
    } else if (!phoneValidate(phoneValue)) {
        setError(phone, 'Please enter a valid phone number');
    } else {
        setSuccuss(phone);
    }
}
/ Perform client-side validation
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
