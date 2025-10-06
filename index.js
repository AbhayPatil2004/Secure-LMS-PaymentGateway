// require("dotenv").config()
import dotenv from "dotenv"
import express from "express"

dotenv.config();
console.log("Hello world")
console.log(process.env.PORT)

const app = express()
const PORT = process.env.PORT

app.listen( PORT , () => {
    console.log("Server is Running ")
})