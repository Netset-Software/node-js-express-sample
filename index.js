
const express = require('express');
const http = require('http');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const dotenv = require('dotenv');
var cron = require('node-cron');
var moment = require('moment-timezone');

dotenv.config();


var cors = require('cors')


const users = require('./server/routes/v1/users');


var options = {
  explorer: true,
};
app.use(cors())

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/dbName');

app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', "*");
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static(path.join(__dirname, 'public')))

app.use('/api/v1/users', users);



const port = process.env.PORT;
app.set('port', port);
const server = http.createServer(app);
server.listen(port, () => console.log(`API running on localhost:${port}`));
