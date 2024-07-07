const jwt = require('jsonwebtoken');
const User = require('../models/user');
const fs = require('fs');

function authMiddleware(req, res, next) {
    // Obtener el token de la cabecera de autorización
    const token = req.headers.authorization;

    // Verificar si existe el token
    if (!token) {
        return res.status(401).send({ message: 'Acceso no autorizado. Token no proporcionado.' });
    }

    try {
        // Verificar y decodificar el token
        const decodedToken = jwt.verify(token, 'mi_clave_secreta');
        // Obtener el ID de usuario del token decodificado
        const userId = decodedToken.user_id;

        // Buscar al usuario en la base de datos por su ID
        User.findById(userId)
            .then(user => {
                if (!user) {
                    // Si no se encuentra el usuario, enviar una respuesta de error
                    return res.status(401).send({ message: 'Usuario no encontrado.' });
                }

                // Agregar el objeto de usuario al objeto de solicitud para su uso posterior
                req.user = user;

                // Llamar a next() para pasar al siguiente middleware o controlador
                next();
            })
            .catch(err => {
                console.error('Error al buscar usuario:', err);
                res.status(500).send({ message: 'Error en la petición' });
            });
    } catch (error) {
        console.error('Error al verificar el token:', error);
        return res.status(401).send({ message: 'Token inválido o expirado.' });
    }
}

module.exports = authMiddleware;
