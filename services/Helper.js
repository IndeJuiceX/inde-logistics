import jwt from 'jsonwebtoken';
// Function to generate JWT token
export const generateJwtToken = (vendorId, companyName, companyNumber) => {
    // Payload for the JWT
    const payload = {
        vendorId,        // Vendor ID
        companyName,     // Company Name
        companyNumber,   // Company Number
    };

    // Sign the JWT with a secret key
    const token = jwt.sign(payload, process.env.APP_SECRET_KEY, {
        // We can omit 'expiresIn' to make the token non-expiring
    });

    return token;
};

export const decodeToken = (token) => {
    try {
        const decoded = jwt.verify(token, process.env.APP_SECRET_KEY);
        return decoded;  // Return the decoded object
    } catch (error) {
        console.error('Error decoding JWT:', error);
        return null;  // Return null if decoding fails
    }
};