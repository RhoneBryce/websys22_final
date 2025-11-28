"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Session-based authentication implemented
const express_1 = __importDefault(require("express"));
const express_session_1 = __importDefault(require("express-session"));
const cors_1 = __importDefault(require("cors"));
const passport_1 = __importDefault(require("./passport"));
const db_1 = require("./db");
const auth_1 = __importDefault(require("./routes/auth"));
const aiProfiles_1 = __importDefault(require("./routes/aiProfiles"));
const matches_1 = __importDefault(require("./routes/matches"));
const threads_1 = __importDefault(require("./routes/threads"));
const messages_1 = __importDefault(require("./routes/messages"));
const groups_1 = __importDefault(require("./routes/groups"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 4200;
app.use((0, cors_1.default)({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use((0, express_session_1.default)({
    secret: process.env.SESSION_SECRET || 'default_secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Set to true in production with HTTPS
}));
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
app.use(express_1.default.json());
app.get('/', (req, res) => {
    res.json({ message: 'AI Platform API is running' });
});
app.use('/auth', auth_1.default);
app.use('/ai-profiles', aiProfiles_1.default);
app.use('/matches', matches_1.default);
app.use('/threads', threads_1.default);
app.use('/messages', messages_1.default);
app.use('/groups', groups_1.default);
db_1.AppDataSource.initialize().then(() => {
    console.log('Database connected');
    app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
    });
}).catch(error => console.log(error));
