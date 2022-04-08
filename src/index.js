const Imap = require('imap');
const { simpleParser } = require('mailparser');

const imapConfig = {
  user: 'testedin@previsa.com.br',
  password: 'p4Agard@',
  host: 'outlook.office365.com',
  port: 993,
  tls: true,
};


const getEmails = () => {
  try {
    const imap = new Imap(imapConfig);
    imap.once('ready', () => {
      imap.openBox('INBOX', false, () => {
        imap.search(['UNSEEN', ['BEFORE', new Date()]], (err, results) => {
          const f = imap.fetch(results, { bodies: '' });
          f.on('message', msg => {
            msg.on('body', stream => {
              simpleParser(stream, async (err, parsed) => {
                // const {from, subject, textAsHtml, text} = parsed;
                const { subject, from, to } = parsed
                const sender = parsed.from.text
                // console.log(parsed.subject + '\n' + parsed.from.text + '\n' + parsed.to.text);
                console.log(sender);
                /* Make API call to save the data
                   Save the retrieved data into a database.
                   E.t.c
                */
              });
            });
            msg.once('attributes', attrs => {
              const { uid } = attrs;
              imap.addFlags(uid, ['\\Seen'], () => {
                // Mark the email as read after reading it
                console.log('Marked as read!');
              });
            });
          });
          f.once('error', ex => {
            return Promise.reject(ex);
          });
          f.once('end', () => {
            console.log('Done fetching all messages!');
            imap.end();
          });
        });
      });
    });

    imap.once('error', err => {
      console.log(err);
    });

    imap.once('end', () => {
      console.log('Connection ended');
    });

    imap.connect();
  } catch (ex) {
    console.log('an error occurred');
  }
};

getEmails();