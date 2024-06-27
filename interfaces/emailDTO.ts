interface Email {
    id:string,
    senderName:string, 
    senderEmail: string,
    emailSubject: string,
    names: string[],
    dates:Date[],
    contactNumbers:number[],
    emails:string[],
    amounts:string[],
    summary: string
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