require('dotenv').config();

const dev = {
    app: {
        serverPort: process.env.SERVER_PORT || 3001,
        JwtSecretKey: process.env.JWT_SECRET_KEY,
        smtpUserName: process.env.SMTP_USERNAME,
        smptpPassword: process.env.SMTP_PASSWORD,
        clientUrl: process.env.CLIENT_URL,
        sessionSecretKey: process.env.SESSION_SECRET_KEY
    },
    db: {
        url: process.env.MONGO_URL
            //||"mongodb://localhost:27017/usersDB"
    },

}
module.exports = dev;