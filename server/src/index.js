const express = require('express');
const morgan = require('morgan')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const dev = require('./config');
const connectDB = require('./config/db');
const usersRouter = require('./routes/users');
const adminRouter = require('./routes/admin')



const app = express();
app.use(cookieParser())
app.use(morgan('dev'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api/users', usersRouter);
app.use('/api/admin', adminRouter);

const PORT = dev.app.serverPort;

app.get('/', (req, res) => {
    res.status(200).send('api is running fine');
})

app.listen(PORT, async() => {
    console.log(`server is runninng at http://localhost:${PORT}`)
    await connectDB();
})