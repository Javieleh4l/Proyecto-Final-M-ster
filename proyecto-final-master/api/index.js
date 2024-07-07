'use strict'

const mongoose = require('mongoose');
var app = require('./app');
var port = 3800;

// Conexión Database
// Conexión Database
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/Base_Datos_Red_Social')
    .then(() => {
        console.log("La conexión a la base de datos Base_Red_Social se ha realizado correctamente!!");

        // crear servidor
        app.listen(port, () => {
            console.log("Servidor corriendo en http://localhost:3800");
        });
    })
    .catch(err => console.error(err));

