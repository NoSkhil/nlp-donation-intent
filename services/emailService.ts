//@ts-nocheck
import client from '../db';
import { v4 as uuidv4 } from 'uuid';
import { Email, CreateEmailDTO, RawEmailData } from "../interfaces/emailDTO";
import nlp from 'compromise';
import datePlugin from 'compromise-dates';
import numbersPlugin from 'compromise-numbers';
nlp.plugin(datePlugin);
nlp.plugin(numbersPlugin);

const getAllData = async (email: string) => {
    try {
        return await client.query("SELECT * FROM Emails");
    }
    catch (err) {
        console.log(err);
        return { err: "Request failed!" };
    }
};

const insertEmail = async (emailData: CreateEmailDTO) => {
    try {
        
        const { name, birthdate, phone, email, amount, summary } = emailData;
        const queryString = "INSERT INTO Emails(name,birthdate,phone,email,amount,summary id) VALUES($1,$2,$3,$4,$5, $6) RETURNING *";
        const values = [name, birthdate, phone, email, amount, summary, uuidv4()];
        return await client.query(queryString, values);
    } catch (err) {
        console.log(err);
        return { err: "Request failed!" };
    }
};

const parseRawEmail = async (emailData: RawEmailData): Promise<CreateEmailDTO> => {
    try {
        const { fromEmail, senderName, senderEmail, bodyText } = emailData;

        // Use compromise to parse the text
        const doc = nlp(bodyText);

        // Extract names
        const names = doc.people().out('array');

        // Remove duplicate names
        const uniqueNames = [...new Set(names)];

        // Extract contact numbers
        const contactNumbers = doc.phoneNumbers().json().map(phone => parseInt(phone.text.replace(/\D/g, ''), 10));

        // Extract dates
        const dates = doc.dates().json().map(date => new Date(date.date));

        // Extract amounts
        const amounts = doc.money().json().map(money => money.text);

        // Extract emails using compromise
        const emailMatches = doc.emails().out('array');
        const emails = emailMatches ? emailMatches : [];

        // Use the full body text as the summary
        const summary = bodyText;

          // Construct the CreateEmailDTO
          const parsedEmail: CreateEmailDTO = {
            senderName: emailData.senderName,
            senderEmail: emailData.senderEmail,
            emailSubject: emailData.subject,
            names: uniqueNames,  // List of extracted names
            dates, // List of extracted dates
            contactNumbers, // List of extracted contact numbers
            emails, // List of extracted emails
            amounts, // List of extracted amounts
            summary, // Full body text as summary
        };

        return parsedEmail;
    } catch (err) {
        console.log(err);
        return { err: "Request failed!" } as any;
    }
};

const insertTables = async () => {
    try {
        return await client.query("CREATE TABLE Emails (id varchar(255), name varchar(255), birthdate date, phone bigint, email varchar(255), amount decimal, summary text)");
    } catch (err) {
        console.log(err);
        return { err: "Request failed!" };
    }
};

const updateEmail = async (emailData: Email) => {
    try {
      const { id, name, birthdate, phone, email, amount, summary } = emailData;
      const queryString = "UPDATE Emails SET name=$1, birthdate=$2, phone=$3, email=$4, amount=$5, summary=$6 WHERE id=$7 RETURNING *";
    const values = [name, birthdate, phone, email, amount, summary, id];
        return await client.query(queryString, values);
    } catch (err) {
        console.log(err);
        return { err: "Request failed!" };
    }
};

const deleteEmail = async (email: string) => {
    try {
        return await client.query("DELETE FROM Emails WHERE email=$1", [email]);
    } catch (err) {
        console.log(err);
        return { err: "Request failed!" };
    }
}

export default {
    getAllData,
    insertEmail,
    insertTables,
    deleteEmail,
    updateEmail,
    parseRawEmail
};