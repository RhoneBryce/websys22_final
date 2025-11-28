"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const passport_1 = __importDefault(require("../passport"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const db_1 = require("../db");
const User_1 = require("../entities/User");
const router = (0, express_1.Router)();
router.post('/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email and password are required' });
        }
        const existingUser = yield db_1.AppDataSource.manager.findOne(User_1.User, { where: { email } });
        if (existingUser) {
            return res.status(409).json({ message: 'Email already in use' });
        }
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        const user = db_1.AppDataSource.manager.create(User_1.User, { name, email, password: hashedPassword });
        yield db_1.AppDataSource.manager.save(user);
        res.status(201).json({ message: 'User registered' });
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Registration failed' });
    }
}));
router.post('/login', passport_1.default.authenticate('local'), (req, res) => {
    const user = req.user;
    res.json({ message: 'Logged in', user: { id: user.id, name: user.name, email: user.email } });
});
router.post('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).json({ message: 'Could not log out' });
        }
        res.json({ message: 'Logged out' });
    });
});
router.get('/status', (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
    }
    res.json({ id: req.user.id, name: req.user.name, email: req.user.email });
});
exports.default = router;
