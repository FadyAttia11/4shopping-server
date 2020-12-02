const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDAPI_KEY_GRID) //enviromental variable (that i had created in dev.env)

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'fadyattia11@gmail.com',
        subject: 'Welcome to my website',
        text: `Hello ${name}, welcome to my website, i hope you like it!`
    })
}

const sendCancelationEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'fadyattia11@gmail.com',
        subject: 'sorry to see you go!',
        text: `Goodbye ${name}, i hope to see you sometime soon!`
    })
}

module.exports = {
    sendWelcomeEmail,
    sendCancelationEmail
}


    






