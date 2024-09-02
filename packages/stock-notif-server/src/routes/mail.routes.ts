import express from 'express';
import * as fs from 'fs';
import path from 'path';
import * as tracer from 'tracer';
import { sendMail } from '../utils/notifications';

/** Logger for mailPackage routes */
const mailPackageRoutesLogger = tracer.colorConsole({
  format: '{{timestamp}} [{{title}}] {{message}} (in {{file}}:{{line}})',
  dateformat: 'HH:MM:ss.L',
  transport(data) {
    // eslint-disable-next-line no-console
    console.log(data.output);
    const logDir = path.join(process.cwd() + '/openstockLog/');

    fs.mkdir(logDir, { recursive: true }, (err) => {
      if (err) {
        if (err) {
          // eslint-disable-next-line no-console
          console.log('data.output err ', err);
        }
      }
    });
    fs.appendFile(logDir + '/notif-server.log', data.rawoutput + '\n', err => {
      if (err) {
        // eslint-disable-next-line no-console
        console.log('raw.output err ', err);
      }
    });
  }
});


/**
 * Sends a verification email to the specified email with a token.
 * @param emailFrom - The email address of the sender.
 * @param emailTo - The email address of the recipient.
 * @param subject - The subject of the email.
 * @param message - The content of the email.
 * @returns A Promise that resolves to a boolean indicating whether the email was successfully sent.
 */
export const sendRandomEmail = (
  emailFrom: string,
  emailTo: string,
  subject: string,
  message: string
): Promise<boolean> => new Promise(resolve => {
  mailPackageRoutesLogger.info('sendTokenEmail');
  const mailOptions = {
    from: emailFrom,
    to: emailTo,
    subject,
    text: '',
    // html: 'Hello, <br> Please click on the link to veify you email.<br><a href=`${nowLink}`></a>'
    html: `<!DOCTYPE html>
    <html lang="en">
    <head>
<style>
body {
background: rgb(238, 238, 238);
}
.main-div {
max-width: 400px;
margin: 0 auto;
background: #fff;
font-weight: normal;
}
h2 {
text-align:center;
padding-top: 40px;
}

.body-div{
font-weight: lighter;
text-align: left;
width: 80%;
margin: 0 auto;
font-size: 0.8em;
}

.code-para{
font-size: 1.2em;
}

.last-divi {
padding-top: 30px;
text-align: center;
font-size: 0.7em;
}

.compny-divi {
padding-bottom: 40px;
text-align: center;
font-size: 0.7em;
}

.img-divi {
width: 75px;
height: 75px;
margin-left: calc(100% - 80px);
}

.img-divi-img {
width: 100%;
height: 100%;
}
</style>
</head>
    <body>
    <div class="main-div">
      <div class="img-divi">
        <img class="img-divi-img" src="https://eagleinfosolutions.com/dist/public/logo2.png" />
      </div>
    <h2>Confirm your email address<h2>
      <div class="body-div">

      ${message}

      <div class="last-divi">
        <a href="https://eagleinfosolutions.com/support">Help</a> | <a href="https://eagleinfosolutions.com/support">Contacts</a>
      </div>

      <div class="compny-divi"> Eagle Info Solutions Inc, Kampala Uganda</div>
      </div>
      </div>
      </body>
</html>`
  };

  sendMail(mailOptions).then(res => {
    mailPackageRoutesLogger.info('message sent', res);
    resolve(true);

    return;
  }).catch(error => {
    mailPackageRoutesLogger.error(
      'email verication with token error',
      JSON.stringify(error)
    );
    resolve(false);

    return;
  });
});


/**
 * Router for handling mailPackage-related routes.
 */
export const mailSenderRoutes = express.Router();

mailSenderRoutes.post('/sendmail', async(req, res) => {
  const { emailFrom, emailTo, subject, message } = req.body;
  const sent = await sendRandomEmail(emailFrom, emailTo, subject, message);

  if (!sent) {
    return res.status(500).send({ success: false, status: 500 });
  }

  return res.status(200).send({ success: true, status: 200 });
});


