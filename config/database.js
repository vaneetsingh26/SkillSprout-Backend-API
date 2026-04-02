const mongoose = require('mongoose');

exports.connect = () => {
    mongoose.connect(process.env.DATABASE_URL)
    .then(() => {console.log("Database Connection Successful.")})
    .catch((error) => {
        console.log('Database Connection Problem.');
        console.error(error);
        process.exit(1);
    })
};