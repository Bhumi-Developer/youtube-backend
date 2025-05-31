require('dotenv').config({ path: './.env' });
const connectDB = require('./db/index');
const app = require('./app'); 

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log("Server running");
    });
  })
  .catch((error) => {
    console.log(error);
  });
