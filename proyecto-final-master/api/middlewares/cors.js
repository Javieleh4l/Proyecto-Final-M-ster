const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');  // Importar cors

const app = express();
const user_routes = require('./routes/user');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Configuración detallada de CORS
const corsOptions = {
  origin: 'http://localhost:4200',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: false,
  optionsSuccessStatus: 204,
  allowedHeaders: 'Content-Type, Authorization'
};

app.use(cors(corsOptions));  // Usar cors con opciones

// Rutas base
app.use('/api', user_routes);

module.exports = app;
