const cookieParser = require('cookie-parser')
const express = require('express')
const app = express()
const cors = require('cors')
const userRouter = require('./routes/user.routes')


app.use(cors({
    origin : ['http://localhost:5173'],
    credentials: true
}))
app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true,limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

app.use("/api/v1/users", userRouter)

module.exports =  app 
