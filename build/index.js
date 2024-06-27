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
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const cors_1 = __importDefault(require("cors"));
const db_1 = __importDefault(require("./db"));
const emailRoutes_1 = __importDefault(require("./routes/emailRoutes"));
const imap_1 = __importDefault(require("imap"));
const mailparser_1 = require("mailparser");
const emailService_1 = __importDefault(require("./services/emailService"));
const util_1 = __importDefault(require("util"));
const path_1 = __importDefault(require("path"));
const inspect = util_1.default.inspect;
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.static(path_1.default.join(__dirname, 'client')));
app.get('/', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, 'client', 'index.html'));
});
app.use('/api/email', emailRoutes_1.default);
var imap = new imap_1.default({
    user: 'akhilnekkanti98@gmail.com',
    password: process.env.GMAIL_PASSWORD,
    host: 'imap.gmail.com',
    port: 993,
    tls: true,
    tlsOptions: {
        rejectUnauthorized: false, // For testing, you can disable certificate rejection
    },
    connTimeout: 100000, // 60 seconds 
    authTimeout: 30000,
    debug: console.log,
});
function openInbox(cb) {
    imap.openBox('INBOX', true, cb);
}
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`12 server active on port ${PORT}`);
    db_1.default.connect((err) => {
        if (err)
            console.log(err);
        else {
            console.log("Connected to supabase postgres db");
        }
    });
    imap.once('ready', function () {
        openInbox(function (err, box) {
            if (err)
                throw err;
            imap.on('mail', function () {
                imap.search(['UNSEEN'], (err, results) => __awaiter(this, void 0, void 0, function* () {
                    if (err)
                        throw err;
                    if (results && results.length > 0) {
                        console.log("NEW EMAIL RECEIVED");
                        var f = imap.seq.fetch(results, { bodies: '' });
                        f.on('message', function (msg, seqno) {
                            console.log('Message #%d', seqno);
                            var prefix = '(#' + seqno + ') ';
                            let buffer = '';
                            msg.on('body', function (stream, info) {
                                stream.on('data', function (chunk) {
                                    buffer += chunk.toString('utf8');
                                });
                                stream.once('end', function () {
                                    return __awaiter(this, void 0, void 0, function* () {
                                        var _a, _b, _c, _d;
                                        let emailData = {
                                            fromEmail: '',
                                            senderName: '',
                                            senderEmail: '',
                                            bodyText: '',
                                            subject: ''
                                        };
                                        try {
                                            let parsed = yield (0, mailparser_1.simpleParser)(buffer);
                                            emailData.senderName = ((_b = (_a = parsed.from) === null || _a === void 0 ? void 0 : _a.value[0]) === null || _b === void 0 ? void 0 : _b.name) || '';
                                            emailData.senderEmail = ((_d = (_c = parsed.from) === null || _c === void 0 ? void 0 : _c.value[0]) === null || _d === void 0 ? void 0 : _d.address) || '';
                                            emailData.bodyText = parsed.text || '';
                                            emailData.subject = parsed.subject || '';
                                            // Extract username from email address
                                            if (emailData.senderEmail) {
                                                emailData.fromEmail = emailData.senderEmail.split('@')[0];
                                            }
                                            console.log('Email Data:', emailData);
                                            //NLP ANALYSIS TO EXTRACT RELEVANT DATA FROM THE EMAIL
                                            const parsedData = yield emailService_1.default.parseRawEmail(emailData);
                                            console.log("PARSED EMAIL DATA: \n");
                                            console.log(parsedData);
                                            const insertData = yield emailService_1.default.insertEmail(parsedData);
                                            console.log("EMAIL DATA INSERTED IN DATABASE");
                                        }
                                        catch (err) {
                                            console.log('Parsing error: ', err);
                                        }
                                    });
                                });
                            });
                            msg.once('attributes', function (attrs) {
                                console.log(prefix + 'Attributes: %s', inspect(attrs, false, 8));
                            });
                            msg.once('end', function () {
                                console.log(prefix + 'Finished');
                            });
                        });
                        f.once('error', function (err) {
                            console.log('Fetch error: ' + err);
                        });
                        f.once('end', function () {
                            console.log('Done fetching all messages!');
                            // imap.end();
                        });
                    }
                }));
            });
        });
    });
    imap.once('error', function (err) {
        console.log(err);
    });
    imap.once('end', function () {
        console.log('Connection ended');
    });
    imap.connect();
}));
