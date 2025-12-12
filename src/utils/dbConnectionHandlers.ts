import mongoose from "mongoose";

// Define a TypeScript type for the connection object
type ConnectionObject={
    isConnected?:boolean // Optional property that indicates whether the database is connected (true/false)
}
// Create an empty connection object based on the defined type
const connection:ConnectionObject={};

async function dbConnect():Promise<void> {  
    if(connection.isConnected){
        console.log("Already connected to database")
        return 
    }

    try {
        const db=await mongoose.connect(process.env.MONGODB_RUI||"")
        connection.isConnected=db.connections[0].readyState===1;  // Sets isConnected to true only if readyState is 1 (connected)

        console.log("Database connected successfully")
        
    } catch (error) {
        console.log("Database connection is failed due to ", error);
        process.exit(1);
        
        
    }
    
}
export default  dbConnect