const express = require("express");
const cors = require('cors')
const bodyParser = require('body-parser')
const morgan = require('morgan')




// const router = express.Router();
const app = express();

app.use(bodyParser.urlencoded({
    extended: true
  }));
app.use(morgan('dev'))

// if(process.env.NODE_ENV !== 'production'){
//     require('dotenv').config()
// }

const port = process.env.PORT || 5000

//start our server
app.listen(port, () => {
    console.log(`Server started on port ${port} :)`);
});

module.exports = app
