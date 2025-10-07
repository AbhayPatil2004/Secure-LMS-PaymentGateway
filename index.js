// require("dotenv").config()
import dotenv from "dotenv"
import express from "express"
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
// import mongooseSanitizer from "mongoose-sanitize";
import hpp from "hpp";
import cookieParser from "cookie-parser";
import cors from 'cors';

dotenv.config();
console.log("Hello world")
console.log(process.env.PORT)

const app = express()
const PORT = process.env.PORT

// Global rate limiting
const limiter = rateLimit({
    windowMs : 15 * 60 * 1000 ,
    limit : 100 ,
    message : "Too mant request from this ip please try again",

})
// security middleware
app.use(helmet())
app.use(hpp())
app.use( '/api' , limiter)


// logging middleware
if( process.env.NODE_ENV === "developmet"){
    app.use(morgan('dev'))
}

// Body parser middleware
app.use(express.json({ limit : '10kb'}))
app.use(express.urlencoded({ extended :true , limit : '10kb'}))
app.use(cookieParser())

// global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});


// cors configuration
app.use(cors({
    origin : process.env.CLINET_URL || "http://localhost:5173",
    credentials : true ,
    methods : [ "GET" , "POST" , "PUT" , "DELETE" , "PATCH" , "HEAD" , "OPTIONS"],
    allowedHeaders : [
        "content-Type",
        "Authorization",
        "X-Requested-With",
        "device-remember-token",
        "Access-Cotrol-Allow-Origin",
        "Origin",
        "Accept"
    ]
}))

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