const express = require('express');
const morgan = require('morgan')
const dev = require('./config');
const connectDB = require('./config/db');


const app = express();
app.use(morgan('dev'))

const PORT = dev.app.serverPort;

app.get('/', (req, res) => {
    res.status(200).send('api is running fine');
})

app.listen(PORT, async() => {
    console.log(`server is runninng at http://localhost:${PORT}`)
    await connectDB();
})