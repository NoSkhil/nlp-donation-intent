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
const db_1 = __importDefault(require("../db"));
const compromise_1 = __importDefault(require("compromise"));
const compromise_dates_1 = __importDefault(require("compromise-dates"));
compromise_1.default.plugin(compromise_dates_1.default);
const getAllData = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield db_1.default.query("SELECT * FROM Emails");
    }
    catch (err) {
        console.log(err);
        return { err: "Request failed!" };
    }
});
const insertEmail = (emailData) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { sendername, senderemail, emailsubject, names, dates, contactnumbers, emails, amounts, summary } = emailData;
        const queryString = "INSERT INTO Emails(sendername, senderemail, emailsubject, names, dates, contactnumbers, emails, amounts, summary) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *";
        const values = [
            sendername,
            senderemail,
            emailsubject,
            names ? `{${names.map(name => `"${name}"`).join(',')}}` : null,
            dates && dates[0] !== null ? `{${dates.map(date => typeof date === 'string' ? `"${date}"` : `"${date.toISOString()}"`).join(',')}}` : null,
            contactnumbers ? `{${contactnumbers.join(',')}}` : null,
            emails ? `{${emails.map(email => `"${email}"`).join(',')}}` : null,
            amounts ? `{${amounts.map(amount => `"${amount}"`).join(',')}}` : null,
            summary
        ];
        return yield db_1.default.query(queryString, values);
    }
    catch (err) {
        console.log(err);
        return { err: "Request failed!" };
    }
});
const parseRawEmail = (emailData) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { bodyText } = emailData;
        const formattedText = bodyText.replace(/,/g, '').replace(/\n/g, ' \n ');
        const formattedTextForDates = bodyText.replace(/,/g, ' ').replace(/\n/g, ' \n ');
        console.log("TEXT", formattedText);
        // Use compromise to parse the text
        const doc = (0, compromise_1.default)(formattedText);
        const rawDoc = (0, compromise_1.default)(bodyText);
        const docForDates = (0, compromise_1.default)(formattedTextForDates);
        // Extract names and remove special characters
        const namesFormatted = doc.people().out('array').map((name) => name.replace(/[,-:]/g, '').trim());
        // Remove duplicate names
        const uniqueNames = [...new Set(namesFormatted)];
        // Extract contact numbers
        const contactnumbers = rawDoc.phoneNumbers().json().map((phone) => parseInt(phone.text.replace(/\D/g, ''), 10));
        // Extract dates
        //@ts-ignore
        const dates = docForDates.dates().json().map(date => new Date(date.dates.start));
        // Extract amounts
        const amounts = doc.money().json().map((money) => money.text);
        // Extract emails using compromise
        const emailMatches = doc.emails().out('array');
        const emails = emailMatches ? emailMatches : [];
        // Use the full body text as the summary
        const summary = bodyText;
        // Construct the CreateEmailDTO
        const parsedEmail = {
            sendername: emailData.senderName,
            senderemail: emailData.senderEmail,
            emailsubject: emailData.subject,
            names: uniqueNames.length ? uniqueNames : undefined, // List of extracted names
            dates: dates.length ? dates : undefined, // List of extracted dates
            contactnumbers: contactnumbers.length ? contactnumbers : undefined, // List of extracted contact numbers
            emails: emails.length ? emails : undefined, // List of extracted emails
            amounts: amounts.length ? amounts : undefined, // List of extracted amounts
            summary // Full body text as summary
        };
        return parsedEmail;
    }
    catch (err) {
        console.log(err);
        return { err: "Request failed!" };
    }
});
const insertTables = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield db_1.default.query("CREATE TABLE Emails (id varchar(255), sendername varchar(255), senderemail varchar(255), emailsubject varchar(255), names text[], dates text[], contactnumbers text[], emails text[], amounts text[], summary text)");
    }
    catch (err) {
        console.log(err);
        return { err: "Request failed!" };
    }
});
const updateEmail = (emailData) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id, sendername, senderemail, emailsubject, names, dates, contactnumbers, emails, amounts, summary } = emailData;
        const queryString = "UPDATE Emails SET sendername=$1, senderemail=$2, emailsubject=$3, names=$4, dates=$5, contactnumbers=$6, emails=$7, amounts=$8, summary=$9 WHERE id=$10 RETURNING *";
        const values = [
            sendername,
            senderemail,
            emailsubject,
            names ? `{${names.map(name => `"${name}"`).join(',')}}` : null,
            dates && dates[0] !== null ? `{${dates.map(date => typeof date === 'string' ? `"${date}"` : `"${date.toISOString()}"`).join(',')}}` : null,
            contactnumbers ? `{${contactnumbers.join(',')}}` : null,
            emails ? `{${emails.map(email => `"${email}"`).join(',')}}` : null,
            amounts ? `{${amounts.map(amount => `"${amount}"`).join(',')}}` : null,
            summary,
            id
        ];
        return yield db_1.default.query(queryString, values);
    }
    catch (err) {
        console.log(err);
        return { err: "Request failed!" };
    }
});
const deleteEmail = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const deleted = yield db_1.default.query("DELETE FROM Emails WHERE id=$1", [id]);
        return deleted;
    }
    catch (err) {
        console.log(err);
        return { err: "Request failed!" };
    }
});
exports.default = {
    getAllData,
    insertEmail,
    insertTables,
    deleteEmail,
    updateEmail,
    parseRawEmail
};
