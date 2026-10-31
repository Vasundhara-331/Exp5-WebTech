// Client-side checks give instant feedback. They mirror the server rules but are NOT a security
// control: the Express API validates everything again with express-validator.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateRegister({ name = '', email = '', password = '' }) {
  const errors = {};
  if (name.trim().length < 2) errors.name = 'Name must be at least 2 characters';
  if (!EMAIL.test(email.trim())) errors.email = 'Enter a valid email address';
  if (password.length < 8) errors.password = 'Password must be at least 8 characters';
  else if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    errors.password = 'Password needs a letter and a number';
  }
  return errors;
}

export function validateLogin({ email = '', password = '' }) {
  const errors = {};
  if (!EMAIL.test(email.trim())) errors.email = 'Enter a valid email address';
  if (!password) errors.password = 'Enter your password';
  return errors;
}

export function validateFeedback({ message = '', rating }) {
  const errors = {};
  const len = message.trim().length;
  if (len < 3 || len > 500) errors.message = 'Feedback must be 3-500 characters';
  if (!(rating >= 1 && rating <= 5)) errors.rating = 'Pick a rating from 1 to 5';
  return errors;
}
