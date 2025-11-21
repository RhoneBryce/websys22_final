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
exports.AuthController = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../db");
const User_1 = require("../entities/User");
class AuthController {
    static register(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name, email, password } = req.body;
            const hashedPassword = yield bcrypt_1.default.hash(password, 10);
            const user = db_1.AppDataSource.manager.create(User_1.User, { name, email, password: hashedPassword });
            yield db_1.AppDataSource.manager.save(user);
            res.status(201).json({ message: 'User registered' });
        });
    }
    static login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, password } = req.body;
            const user = yield db_1.AppDataSource.manager.findOne(User_1.User, { where: { email } });
            if (!user || !(yield bcrypt_1.default.compare(password, user.password))) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }
            const token = jsonwebtoken_1.default.sign({ id: user.id }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
            res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
        });
    }
}
exports.AuthController = AuthController;
