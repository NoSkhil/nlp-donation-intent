import client from '../db';
import { v4 as uuidv4 } from 'uuid';
import { Email, CreateEmailDTO } from "../interfaces/emailDTO";

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
    updateEmail
};