import bcrypt from 'bcryptjs';

// Hash the password
export const hashPassword = async (password) => {
  const saltRounds = 10; // The higher the salt rounds, the longer it takes to hash (more secure, but slower)
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
};


// Compare the input password with the hashed password
export const verifyPassword = async (inputPassword, hashedPassword) => {
  console.log('Input Password:', inputPassword);
  console.log('Hashed Password:', hashedPassword);
  const isMatch = await bcrypt.compare(inputPassword, hashedPassword);
  console.log('Password Match:', isMatch);

  return isMatch;  // Returns true if passwords match, false otherwise
};