// require("dotenv").config()
import dotenv from "dotenv"
import express from "express"
import morgan from "morgan";

dotenv.config();
console.log("Hello world")
console.log(process.env.PORT)

const app = express()
const PORT = process.env.PORT

// logging middleware
if( process.env.NODE_ENV === "developmet"){
    app.use(morgan('dev'))
}

// Body parser middleware
app.use(express.json({ limit : '10kb'}))
app.use(express.urlencoded({ extended :true , limit : '10kb'}))

// global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});


// api route

// 404 handler
app.use( ( req , res ) => {
    res.status(404).json({
        status : "404",
        message : "route not found"
    })
})

app.listen( PORT , () => {
    console.log("Server is Running ")
})