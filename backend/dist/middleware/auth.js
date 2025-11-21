"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = void 0;
const auth = (req, res, next) => {
    if (!req.session.userId) {
        return res.status(401).json({ message: 'Not authenticated' });
    }
    next();
};
exports.auth = auth;
