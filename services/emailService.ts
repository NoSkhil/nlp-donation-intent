import client from '../db';
import { v4 as uuidv4 } from 'uuid';
import { Email, CreateEmailDTO, RawEmailData } from "../interfaces/emailDTO";
import nlp from 'compromise';
import nlpDates from 'compromise-dates';
nlp.plugin(nlpDates);

const getAllData = async () => {
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
        const { sendername, senderemail, emailsubject, names, dates, contactnumbers, emails, amounts, summary } = emailData;
        const queryString = "INSERT INTO Emails(sendername, senderemail, emailsubject, names, dates, contactnumbers, emails, amounts, summary) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *";
        const values = [
            sendername, 
            senderemail, 
            emailsubject, 
            names ? `{${names.map(name => `"${name}"`).join(',')}}` : null, 
            dates && dates[0] !==null ? `{${dates.map(date => typeof date === 'string' ? `"${date}"` : `"${date.toISOString()}"`).join(',')}}` : null, 
            contactnumbers ? `{${contactnumbers.join(',')}}` : null, 
            emails ? `{${emails.map(email => `"${email}"`).join(',')}}` : null, 
            amounts ? `{${amounts.map(amount => `"${amount}"`).join(',')}}` : null, 
            summary
        ];
        return await client.query(queryString, values);
    } catch (err) {
        console.log(err);
        return { err: "Request failed!" };
    }
};

const parseRawEmail = async (emailData: RawEmailData): Promise<CreateEmailDTO> => {
    try {
        const { bodyText } = emailData;

        const formattedText = bodyText.replace(/,/g, '').replace(/\n/g, ' \n ');
        const formattedTextForDates = bodyText.replace(/,/g, ' ').replace(/\n/g, ' \n ');
        console.log("TEXT",formattedText);

        // Use compromise to parse the text
        const doc = nlp(formattedText);
        const rawDoc = nlp(bodyText);
        const docForDates = nlp(formattedTextForDates);

        // Extract names and remove special characters
        const namesFormatted: string[] = doc.people().out('array').map((name:any) => name.replace(/[,-:]/g, '').trim());

        // Remove duplicate names
        const uniqueNames: string[] = [...new Set(namesFormatted)];

        // Extract contact numbers
        const contactnumbers = rawDoc.phoneNumbers().json().map((phone:any) => parseInt(phone.text.replace(/\D/g, ''), 10));
        // Extract dates
        //@ts-ignore
        const dates = docForDates.dates().json().map(date => new Date(date.dates.start));

        // Extract amounts
        const amounts = doc.money().json().map((money:any) => money.text);

        // Extract emails using compromise
        const emailMatches = doc.emails().out('array');
        const emails = emailMatches ? emailMatches : [];

        // Use the full body text as the summary
        const summary = bodyText;

        // Construct the CreateEmailDTO
        const parsedEmail: CreateEmailDTO = {
            sendername: emailData.senderName,
            senderemail: emailData.senderEmail,
            emailsubject: emailData.subject,
            names: uniqueNames.length ? uniqueNames : undefined,  // List of extracted names
            dates: dates.length ? dates : undefined, // List of extracted dates
            contactnumbers: contactnumbers.length ? contactnumbers : undefined, // List of extracted contact numbers
            emails: emails.length ? emails : undefined, // List of extracted emails
            amounts: amounts.length ? amounts : undefined, // List of extracted amounts
            summary // Full body text as summary
        };

        return parsedEmail;
    } catch (err) {
        console.log(err);
        return { err: "Request failed!" } as any;
    }
};

const insertTables = async () => {
    try {
        return await client.query("CREATE TABLE Emails (id varchar(255), sendername varchar(255), senderemail varchar(255), emailsubject varchar(255), names text[], dates text[], contactnumbers text[], emails text[], amounts text[], summary text)");
    } catch (err) {
        console.log(err);
        return { err: "Request failed!" };
    }
};

const updateEmail = async (emailData: Email) => {
    try {
        const { id, sendername, senderemail, emailsubject, names, dates, contactnumbers, emails, amounts, summary } = emailData;
        const queryString = "UPDATE Emails SET sendername=$1, senderemail=$2, emailsubject=$3, names=$4, dates=$5, contactnumbers=$6, emails=$7, amounts=$8, summary=$9 WHERE id=$10 RETURNING *";
        const values = [
            sendername, 
            senderemail, 
            emailsubject, 
            names ? `{${names.map(name => `"${name}"`).join(',')}}` : null, 
            dates && dates[0] !==null ? `{${dates.map(date => typeof date === 'string' ? `"${date}"` : `"${date.toISOString()}"`).join(',')}}` : null, 
            contactnumbers ? `{${contactnumbers.join(',')}}` : null, 
            emails ? `{${emails.map(email => `"${email}"`).join(',')}}` : null, 
            amounts ? `{${amounts.map(amount => `"${amount}"`).join(',')}}` : null, 
            summary, 
            id
        ];
        return await client.query(queryString, values);
    } catch (err) {
        console.log(err);
        return { err: "Request failed!" };
    }
};

const deleteEmail = async (id: string) => {
    try {
        const deleted = await client.query("DELETE FROM Emails WHERE id=$1", [id]);
        return deleted;
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