import express,{Request, Response} from 'express';
import dotenv from 'dotenv';
dotenv.config();
import cors from 'cors';
import client from './db';
import emailRoutes from './routes/emailRoutes';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req:Request,res:Response)=> res.status(200).send({data:"12 server."}));
app.use('/api/email', emailRoutes);

app.listen(8000, async ()=>{
    console.log("12 server active on port 8000");
    client.connect((err:any)=>{
        if(err) console.log(err);
        else {
            console.log("Connected to supabase postgres db");
        }
    });
});

