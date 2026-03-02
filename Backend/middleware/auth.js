import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
    try {
        // 1. Check token inside header
        const token = req.headers["authorization"]?.split(" ")[1];

        if (!token) {
            return res.status(401).json({ error: "No token provided" });
        }

        // 2. Verify token
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(401).json({ error: "Invalid or expired token" });
            }

            // 3. Save user info inside req
            req.user = decoded; // id, role
            next();
        });

    } catch (error) {
        return res.status(500).json({ error: "Authentication error" });
    }
};
