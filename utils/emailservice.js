const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

async function sendverifyemail(user,token){
    const url = `https://roomai-6q5a.onrender.com/api/user/verify/${token}`

    const msg = {
        to:user.email,
        from:'roomai8769@gmail.com',
        subject:'Verify Email',
        text:'email to verify your account',
        html: `<p>Hey there ${user.username},</p>
           <p>Please verify your email by clicking below:</p>
           <a href="${url}">Verify Email</a>
           <p>Thank you for using our services</p>`
    }
    await sgMail.send(msg)
}

async function sendpassresetemail(user,token){
    const url = `https://roomai-6q5a.onrender.com/reset-password?token=${token}`

    const msg = {
        to: user.email,
        from:'roomai8769@gmail.com',
        subject:"Password Reset",
        text:'email to reset your password',
        html: `<p>Hey there ${user.username}, We received a request to reset your password. Click the button below to create a new one:</p>
                <a href="${url}">Click here</a>
            <p>For your security, this link will expire in [15 minutes].</p>
            <p>If you didn’t request a password reset, you can safely ignore this email.</p>
            <p>Thank you for using our services.</p>`
    }
    await sgMail.send(msg)
}
module.exports = {sendverifyemail,sendpassresetemail}