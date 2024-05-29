// Getting form and input elements
const form = document.getElementById('register-form');
const username = document.getElementById('name');
const password = document.getElementById('pass');
const confirmPassword = document.getElementById('confirmPassword');
const email = document.getElementById('email');
const phno = document.getElementById('phone');

// Event listener for form submission
form.addEventListener('submit', (e) => {
    e.preventDefault(); // Prevent form from submitting
    const result = validateInputs(); // Validate inputs
    // console.log("Validation result:", result);
    if (result) {
        // console.log("Validation passed");
        validationCompleted(); // Proceed to server submission if validation passes
    }
});

// Function to set error message
const setError = (element, message) => {
    const inputControl = element.parentElement;
    const errorDisplay = inputControl.querySelector('.error');
    errorDisplay.innerText = message;
};

// Function to clear error message
const setSuccess = (element) => {
    const inputControl = element.parentElement;
    const errorDisplay = inputControl.querySelector('.error');
    errorDisplay.innerText = '';
};

// Email validation function
const emailValidate = (email) => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
};

// Phone number validation function
const phoneValidate = (phone) => {
    const re = /^\d{10}$/;
    return re.test(phone.trim());
};

// Password validation function
const passwordValidate = (password) => {
    const re = /^.{8,15}$/;
    return re.test(password.trim());
};

// Function to validate all inputs
const validateInputs = () => {
    const usernameValue = username.value.trim();
    const passwordValue = password.value.trim();
    const confirmPasswordValue = confirmPassword.value.trim();
    const emailValue = email.value.trim();
    const phoneValue = phno.value.trim();
    let valCount = 0;
var letters = /^[A-Za-z\s]*$/;
    if (usernameValue === '') {
        setError(username, 'Please enter your name');
    } else if (!letters.test(usernameValue)) {
                setError(username, 'Name can only have alphabets');

    }
    else {
        setSuccess(username);
        valCount++;
    }

    if (emailValue === '') {
        setError(email, 'Email is required');
    } else if (!emailValidate(emailValue)) {
        setError(email, 'Please enter a valid email');
    } else {
        setSuccess(email);
        valCount++;
    }

    if (phoneValue === '') {
        setError(phno, 'Phone number is required');
    } else if (!phoneValidate(phoneValue)) {
        setError(phno, 'Please enter a valid phone number');
    } else {
        setSuccess(phno);
        valCount++;
    }

    if (passwordValue === '') {
        setError(password, 'Password is required');
    } else if (!passwordValidate(passwordValue)) {
        setError(password, 'Password must be 8-15 characters');
    } else if (passwordValue !== confirmPasswordValue) {
        setError(confirmPassword, 'Passwords must match');
    } else {
        setSuccess(password);
        setSuccess(confirmPassword);
        valCount++;
    }

    return (valCount === 4); // Return true if all validations pass
};

// Function to handle form submission after validation
const validationCompleted = async () => {
    const formData = new FormData(form);
    const formObject = {};
    formData.forEach((value, key) => {
        formObject[key] = value;
    });

    try {
        const response = await axios.post('/signup', formObject);
        if (response.status === 200) {
            window.location.href = "/verify-user";
        }
    } catch (error) {
        const message = document.querySelector('#alertMessage');
        message.style.display = 'block';
        message.textContent = "Email already exists!";
        console.error('Error:', error);
    }
};
