const mongoose = require('mongoose')
const morgan = require('morgan')
const express = require('express')
const dotenv = require('dotenv')
dotenv.config({path:'./config.env'})
const userRoutes = require('../Routes/userRoutes')
const cors = require ('cors')


app = express()
app.use(cors( {
    origin : '*',
    methods:["GET", "POST","PUT", "PATCH", "DELETE"],
    credentials: true
}))
app.use(express.json())
app.use(morgan());


const DB = process.env.MONGODB_ATLAS_CONN_STR
mongoose.connect(DB)
    .then(con=>{
        console.log("connected to mongoDB")
    })
    .catch(err => {
        console.log(`error connecting to db ${err}`)
    })

app.get('/',(req,res)=>{
    res.status(200).json({
        message: "Api is working,"
    })
})
app.use('/api/user',userRoutes);

app.all('*', (req, res, next) => {
    console.log(`Can't find ${req.originalUrl} on this server!`, 404);
})

const port = process.env.PORT ||5000   
app.listen(port,()=>{
    console.log(`App running on http://localhost:${port}`)
})


module.exports = app;

