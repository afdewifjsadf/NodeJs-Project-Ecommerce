const monogoose = require('mongoose');


const connectDB = async () => {
    try {
        // mongodb connection string
        const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/shop01';
        const con = await monogoose.connect(dbUrl, {
            useNewUrlParser: true,
            userUnifiedTopology: true,
            useFindAndModify: true,
            useCreateIndex: true
        })
        
        const db = mongoose.connection;
        db.on("error", console.error.bind(console, "connection error:"));
        db.once("open", () => {
            console.log(`MongoDB connected : ${con.connection.host}`);
        });

    } catch (err) {
        console.log(err);
        process.exit(1);

    }
}

module.exports = connectDB