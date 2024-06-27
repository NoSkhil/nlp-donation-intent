interface Email {
    id:string,
    sendername:string, 
    senderemail: string,
    emailsubject: string,
    names?: string[],
    dates?:Date[],
    contactnumbers?:number[],
    emails?:string[],
    amounts?:string[],
    summary?: string
}

interface CreateEmailDTO extends Omit<Email, 'id'> {}

interface RawEmailData {
    fromEmail: string,
    senderName: string,
    senderEmail: string,
    bodyText: string,
    subject: string,
}

export {Email, CreateEmailDTO, RawEmailData};