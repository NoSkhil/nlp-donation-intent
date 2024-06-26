interface Email {
    id:string,
    name:string, 
    birthdate:Date,
    phone:number,
    email:string,
    amount:number,
    summary: string
}

interface CreateEmailDTO extends Omit<Email, 'id'> {}

export {Email, CreateEmailDTO};