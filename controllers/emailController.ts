import emailService from "../services/emailService";
import {Request, Response, NextFunction} from "express";
import { Email, CreateEmailDTO } from "../interfaces/emailDTO";


const getAllEmails = async (req:Request,res:Response,next:NextFunction) => {
    try{
        const {email} = req.body;
        const emailData = await emailService.getAllData(email);
        res.status(200).send({data:emailData});
    } catch (err) {
        res.status(500).send(err);
    }
}

const insertEmail = async (req:Request,res:Response,next:NextFunction) => {
    try{
        const emailData : CreateEmailDTO = req.body;
        const email = await emailService.insertEmail(emailData);
        res.status(200).send({data:email});
    } catch (err) {
        res.status(500).send(err);
    }
}

const updateEmail = async (req:Request,res:Response,next:NextFunction) => {
    try{
        const emailData : Email = req.body;
        const email = await emailService.updateEmail(emailData);
        res.status(200).send({data:email});
    } catch (err) {
        res.status(500).send(err);
    }
}

const createEmailTable = async (req:Request,res:Response,next:NextFunction) => {
    try{
        const emailData = await emailService.insertTables();
        res.status(200).send({data:emailData});
    } catch (err) {
        res.status(500).send(err);
    }
}

const deleteEmail =  async (req:Request, res:Response, next:NextFunction) => {
    try{
        const {email} = req.body;
        const deletedEmail = await emailService.deleteEmail(email)
        res.status(200).send({data:deletedEmail})
    }catch(err){
        res.status(500).send(err);
    }
}

export default {
    getAllEmails, 
    insertEmail, 
    createEmailTable,
    deleteEmail,
    updateEmail
};