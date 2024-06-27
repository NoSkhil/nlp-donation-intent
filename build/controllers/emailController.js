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
const emailService_1 = __importDefault(require("../services/emailService"));
const getAllEmails = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const emailData = yield emailService_1.default.getAllData();
        res.status(200).send({ data: emailData });
    }
    catch (err) {
        res.status(500).send(err);
    }
});
const insertEmail = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const emailData = req.body;
        const email = yield emailService_1.default.insertEmail(emailData);
        res.status(200).send({ data: email });
    }
    catch (err) {
        res.status(500).send(err);
    }
});
const updateEmail = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const emailData = req.body;
        const email = yield emailService_1.default.updateEmail(emailData);
        res.status(200).send({ data: email });
    }
    catch (err) {
        res.status(500).send(err);
    }
});
const createEmailTable = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const emailData = yield emailService_1.default.insertTables();
        res.status(200).send({ data: emailData });
    }
    catch (err) {
        res.status(500).send(err);
    }
});
const deleteEmail = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.body;
        const deletedEmail = yield emailService_1.default.deleteEmail(id);
        res.status(200).send({ data: deletedEmail });
    }
    catch (err) {
        res.status(500).send(err);
    }
});
exports.default = {
    getAllEmails,
    insertEmail,
    createEmailTable,
    deleteEmail,
    updateEmail
};
