import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-trackmysem';

export const authMiddleware = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Invalid or expired token' });
    }
};

export const hashPassword = async (password) => {
    return await bcrypt.hash(password, 10);
};

export const comparePassword = async (password, hash) => {
    return await bcrypt.compare(password, hash);
};

export const generateToken = (user) => {
    return jwt.sign(
        {
            id: user.id,
            email: user.email,
            programmeType: user.programmeType,
            courseName: user.courseName,
            programmeSlug: user.programmeSlug,
            currentSemester: user.currentSemester
        },
        JWT_SECRET,
        { expiresIn: '24h' }
    );
};
