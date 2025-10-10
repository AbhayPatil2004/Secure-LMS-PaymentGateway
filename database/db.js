import mongoose from "mongoose";

const MAX_RETRIES = 3 
const RETRY_INTERVAL = 5000

class DatabaseConnection{

    constructor(){

        this.retryCount = 0 ;
        this.isConnected = false ;

        mongoose.set('strictQuery',true)

        mongoose.connection.on('connected' , () => {
            console.log("MongoDB Connected Succesfully")
            this.isConnected = true
        })
        mongoose.connection.on('error' , () => {
            console.log("MongoDB Connected Error")
            this.isConnected = false ;
        })
        mongoose.connection.on('disconnected' , () => {
            console.log("MongoDB disConnected ")
            // this.isConnected = false ;
             this.handelDisconnection()

        })

        process.on('SIGTERM' , this.handelAppTermination.bind(this))

    }

    async connect(){
        
        try {
            if( !process.env.MONGO_URL ){
                throw new Error("Mongo DB url is not present")
            }
    
            const connectionOptions = {
                useNewUrlParser : true ,
                useUnifiedTopology : true ,
                maxPoolSize : 10 ,
                serverSelectionTimeOutMS : 5000 ,
                socketTimeoutMS : 45000 ,
                family : 4
            }
    
            if( process.env.NODE_ENv === "devlopment" ){
                mongoose.set('debug',true)
            }
    
            await mongoose.connect( process.env.MONGO_URL , connectionOptions )
            this.retryCount = 0 

        } catch (error) {
            console.log(error.message)
            await this.handelConnection()
        }

    }

    async handelConnection(){

        if( this.retryCount < MAX_RETRIES ){
            this.retryCount ++ ;
            console.log(`Retrying Connection ...`)

            await new Promise( resolve => setTimeout(() => {
                resolve
            },RETRY_INTERVAL))
            return this.connect()

        }
        else{
            console.error("failed to connect")
            process.exit(1)
        }
    }

    async handelDisconnection(){

        if( !this.isConnected ){
            console.log("Attemping to connecting")
            this.connect()
        }
    }

    async handelAppTermination(){
        try{
            await mongoose.connection.close()
            console.log("Mongo DB connection Closed")
            process.exit(0)
        }
        catch(error){
            console.error("Error during database disconnection")
            process.exit(1)

        }
    }

    getConnectionStatus(){
        return {
            isConnected : this.isConnected ,
            readyState : mongoose.connection.readyState ,
            host : mongoose.connection.host ,
            name : mongoose.connection.name ,

        }
    }

}

const dbConnection = new DatabaseConnection()

export default dbConnection.connection.bind(dbConnection)
export const getDBStatus = dbConnection.getConnectionStatus.bind