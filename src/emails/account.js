const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeMail = (email,name) => {

    sgMail.send({
        to: email,
        from: "smrdp15@gmail.com",
        subject: "Thanks for joining in",
        text: `Welcome to the app ${name}. Let me know how you get along with the app`
    });

}

const sendCancelMail = (email,name) => {

    sgMail.send({
        to: email,
        from: "smrdp15@gmail.com",
        subject: "Cancellation",
        text: `We are sorry that you cancelled ${name}. Let me call you to understand more`
    });

}

module.exports ={
    sendWelcomeMail,
    sendCancelMail
}
