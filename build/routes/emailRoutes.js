"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const emailController_1 = __importDefault(require("../controllers/emailController"));
const emailRoutes = (0, express_1.Router)();
emailRoutes.get('/read', emailController_1.default.getAllEmails);
emailRoutes.post('/insert', emailController_1.default.insertEmail);
emailRoutes.post('/update', emailController_1.default.updateEmail);
emailRoutes.delete('/delete', emailController_1.default.deleteEmail);
exports.default = emailRoutes;
