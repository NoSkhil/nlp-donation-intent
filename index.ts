//@ts-nocheck
import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
dotenv.config();
import cors from 'cors';
import client from './db';
import emailRoutes from './routes/emailRoutes';
import Imap from 'imap';
import { simpleParser } from 'mailparser';
import util from 'util';
const inspect = util.inspect;

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req: Request, res: Response) => res.status(200).send({ data: "12 server." }));
app.use('/api/email', emailRoutes);

var imap = new Imap({
  user: 'akhilnekkanti98@gmail.com',
  password: process.env.GMAIL_PASSWORD,
  host: 'imap.gmail.com',
  port: 993,
  tls: true,
  tlsOptions: {
    rejectUnauthorized: false, // For testing, you can disable certificate rejection
  },
  connectTimeout: 100000, // 60 seconds 
  authTimeout: 30000,
  debug: console.log,
});

function openInbox(cb) {
  imap.openBox('INBOX', true, cb);
}

app.listen(8000, async () => {

  console.log("12 server active on port 8000");
  client.connect((err: any) => {
    if (err) console.log(err);
    else {
      console.log("Connected to supabase postgres db");
    }
  });

  imap.once('ready', function () {
    openInbox(function (err, box) {
      if (err) throw err;
      imap.on('mail', function () {
        imap.search(['UNSEEN'], async (err, results) => {
          if (err) throw err;
          if (results && results.length > 0) {
            console.log("NEW EMAIL RECEIVED");
            var f = imap.seq.fetch(results, { bodies: '' });
            f.on('message', function (msg, seqno) {
              console.log('Message #%d', seqno);
              var prefix = '(#' + seqno + ') ';
              let buffer = '';

              msg.on('body', function (stream, info) {
                stream.on('data', function (chunk) {
                  buffer += chunk.toString('utf8');
                });

                stream.once('end', async function () {
                  let emailData = {
                    fromEmail: '',
                    senderName: '',
                    senderEmail: '',
                    bodyText: ''
                  };

                  try {
                    let parsed = await simpleParser(buffer);
                    emailData.fromEmail = parsed.from?.text || '';
                    emailData.senderName = parsed.from?.value[0]?.name || '';
                    emailData.senderEmail = parsed.from?.value[0]?.address || '';
                    emailData.bodyText = parsed.text || '';

                    console.log('Email Data:', emailData);
                    // Here you can store emailData object in your database or use it as needed

                  } catch (err) {
                    console.log('Parsing error: ', err);
                  }
                });
              });

              msg.once('attributes', function (attrs) {
                console.log(prefix + 'Attributes: %s', inspect(attrs, false, 8));
              });

              msg.once('end', function () {
                console.log(prefix + 'Finished');
              });
            });

            f.once('error', function (err) {
              console.log('Fetch error: ' + err);
            });

            f.once('end', function () {
              console.log('Done fetching all messages!');
              // imap.end();
            });
          }
        });
      });
    });
  });

  imap.once('error', function (err) {
    console.log(err);
  });

  imap.once('end', function () {
    console.log('Connection ended');
  });

  imap.connect();
});
