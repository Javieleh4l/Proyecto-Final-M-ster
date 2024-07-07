'use strict';

const bcrypt = require('bcrypt-nodejs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const Follow = require('../models/follow'); // Importar el modelo Follow
const Publication = require('../models/publication');

// Configuración de multer para la carga de imágenes
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './uploads/avatars'); // Directorio donde se guardarán las imágenes
    },
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + '.' + file.originalname.split('.').pop());
    }
});

const upload = multer({ storage: storage });

function home(req, res) {
    res.status(200).send({
        message: 'Hola mundo desde el servidor de NodeJS'
    });
}

function pruebas(req, res) {
    console.log(req.body);
    res.status(200).send({
        message: 'Acción de pruebas en el servidor de NodeJS'
    });
}

function saveUser(req, res) {
    console.log("Llegó una solicitud para guardar un usuario:", req.body);

    var params = req.body;
    var user = new User();

    if (params.name && params.surname &&
        params.nick && params.email && params.password) {
        console.log("Todos los campos necesarios están presentes.");

        user.name = params.name;
        user.surname = params.surname;
        user.nick = params.nick;
        user.email = params.email;
        user.role = 'ROLE_USER';
        user.image = null;

        // Controlar usuarios duplicados
        User.findOne({ $or: [{ email: user.email }, { nick: user.nick }] })
            .then(existingUser => {
                console.log("Usuario existente:", existingUser);
                if (existingUser) {
                    if (existingUser.email.toLowerCase() === user.email.toLowerCase()) {
                        console.log("El correo electrónico ya está en uso.");
                        return Promise.reject('El correo electrónico ya está en uso');
                    } else if (existingUser.nick.toLowerCase() === user.nick.toLowerCase()) {
                        console.log("El nick ya está en uso.");
                        return Promise.reject('El nick ya está en uso');
                    }
                } else {
                    console.log("El usuario no existe en la base de datos.");
                    // Cifrar la contraseña y guardar los datos
                    return new Promise((resolve, reject) => {
                        bcrypt.hash(params.password, null, null, (err, hash) => {
                            if (err) {
                                console.error("Error al encriptar la contraseña:", err);
                                reject('Error al encriptar la contraseña');
                            } else {
                                console.log("Contraseña encriptada correctamente.");
                                resolve(hash);
                            }
                        });
                    });
                }
            })
            .then(hash => {
                user.password = hash;
                return user.save();
            })
            .then(userStored => {
                console.log("Usuario guardado correctamente:", userStored);
                // Exclude password field from response
                var userResponse = { _id: userStored._id, name: userStored.name, surname: userStored.surname, nick: userStored.nick, email: userStored.email, role: userStored.role, image: userStored.image };
                res.status(200).send({ user: userResponse });
            })
            .catch(err => {
                console.error("Error:", err);
                res.status(400).send({ message: err }); // Enviar mensaje de error si el usuario o el nick ya están en uso
            });
    } else {
        res.status(400).send({ message: 'Envía todos los campos necesarios' });
    }
}

function loginUser(req, res) {
    var params = req.body;

    var email = params.email;
    var password = params.password;

    User.findOne({ email: email })
        .then(user => {
            if (!user) {
                console.log("Usuario no encontrado en la base de datos.");
                return res.status(404).send({ message: 'El usuario no se ha podido identificar' });
            }
            console.log("Usuario encontrado:", user);
            console.log("Comparando contraseñas...");

            // Comparar contraseñas utilizando una promesa
            return new Promise((resolve, reject) => {
                bcrypt.compare(password, user.password, (err, check) => {
                    if (err) {
                        console.error("Error al comparar contraseñas:", err);
                        reject(err);
                    }
                    resolve({ user, check }); // Resuelve tanto el usuario como el resultado de la comparación
                });
            });
        })
        .then(({ user, check }) => { // Desestructurar el objeto devuelto por la promesa anterior
            if (!check) {
                console.log("Contraseña incorrecta.");
                return res.status(404).send({ message: 'Contraseña incorrecta' });
            }
            console.log("Usuario autenticado correctamente.");
            // Generate token
            var token = jwt.sign({ user_id: user._id }, 'mi_clave_secreta', { expiresIn: '1h' }); // Cambiar 'mi_clave_secreta' según necesites y el tiempo de expiración
            // Exclude password field from response
            var userResponse = { _id: user._id, name: user.name, surname: user.surname, nick: user.nick, email: user.email, role: user.role, image: user.image };
            res.status(200).send({ user: userResponse, token: token });
        })
        .catch(err => {
            console.error("Error al autenticar usuario:", err);
            res.status(500).send({ message: 'Error en la petición' });
        });
}


function updateUser(req, res) {
    const userId = req.user._id; // Get user ID from authenticated request
    const updateData = req.body; // Get updated data from request body

    User.findByIdAndUpdate(userId, updateData, { new: true })
        .then(updatedUser => {
            if (!updatedUser) {
                return res.status(404).send({ message: 'Usuario no encontrado.' });
            }
            res.status(200).send({ user: updatedUser });
        })
        .catch(err => {
            console.error('Error al actualizar usuario:', err);
            res.status(500).send({ message: 'Error en la petición' });
        });
}

function getUserProfile(req, res) {
    const userId = req.params.id; // Obtener el ID de usuario de los parámetros de la solicitud
    const loggedInUserId = req.user._id; // Obtener el ID de usuario autenticado
    const Follow = require('../models/follow'); // Importar el modelo Follow

    User.findById(userId)
        .then(user => {
            if (!user) {
                return res.status(404).send({ message: 'Usuario no encontrado.' });
            }

            // Verificar si el usuario autenticado sigue al usuario del perfil
            const followQuery = Follow.findOne({ user: loggedInUserId, followed: userId });

            // Verificar si el usuario del perfil sigue al usuario autenticado
            const followerQuery = Follow.findOne({ user: userId, followed: loggedInUserId });

            // Ejecutar ambas consultas en paralelo
            Promise.all([followQuery, followerQuery])
                .then(([following, follower]) => {
                    // Construir la respuesta con los resultados de las consultas
                    const userProfile = {
                        user: user,
                        following: following, // Devolver el objeto completo del usuario seguido
                        follower: follower // Devolver el objeto completo del usuario que te está siguiendo
                    };
                    res.status(200).send(userProfile);
                })
                .catch(err => {
                    console.error('Error al verificar seguimiento:', err);
                    res.status(500).send({ message: 'Error en la petición' });
                });
        })
        .catch(err => {
            console.error('Error al buscar usuario:', err);
            res.status(500).send({ message: 'Error en la petición' });
        });
}

async function FollowUsersIds(req, res) {
    const userId = req.user._id;

    try {
        // Obtener los IDs de los usuarios que seguimos
        const following = await Follow.find({ user: userId }).select('followed');
        const followingIds = following.map(f => f.followed);

        // Obtener los IDs de los usuarios que nos siguen
        const followers = await Follow.find({ followed: userId }).select('user');
        const followerIds = followers.map(f => f.user);

        // Obtener la información completa de los usuarios que seguimos
        const usersFollowing = await User.find({ _id: { $in: followingIds } });

        // Obtener la información completa de los usuarios que nos siguen
        const usersFollowers = await User.find({ _id: { $in: followerIds } });

        res.status(200).send({
            usersFollowing: usersFollowing,
            usersFollowers: usersFollowers
        });
    } catch (err) {
        console.error('Error al obtener usuarios:', err);
        res.status(500).send({ message: 'Error en la petición' });
    }
}

async function getCountFollow(req, res) {
    const userId = req.user._id;

    try {
        // Obtener el número de usuarios que seguimos
        const followingCount = await Follow.countDocuments({ user: userId });

        // Obtener el número de usuarios que nos siguen
        const followerCount = await Follow.countDocuments({ followed: userId });

        res.status(200).send({
            followingCount: followingCount,
            followerCount: followerCount
        });
    } catch (err) {
        console.error('Error al obtener el contador de seguimiento:', err);
        res.status(500).send({ message: 'Error en la petición' });
    }
}

async function getCounters(req, res) {
    let userId = req.user._id; // Obtener el ID del usuario autenticado por defecto

    // Verificar si se proporcionó un ID de usuario en los parámetros de la URL
    if (req.params.id) {
        userId = req.params.id;
    }

    try {
        // Obtener el número de usuarios que seguimos
        const followingCount = await Follow.countDocuments({ user: userId });

        // Obtener el número de usuarios que nos siguen
        const followerCount = await Follow.countDocuments({ followed: userId });

        // Obtener el número de publicaciones del usuario
        const publicationCount = await Publication.countDocuments({ user: userId });

        res.status(200).send({
            followingCount: followingCount,
            followerCount: followerCount,
            publicationCount: publicationCount
        });
    } catch (err) {
        console.error('Error al obtener contadores:', err);
        res.status(500).send({ message: 'Error en la petición' });
    }
}

const limit = 100; // Definir el límite de usuarios por página
async function getUsersByPage(req, res) {
    const page = req.params.page; // Obtener el número de página de los parámetros de la solicitud

    const skip = (page - 1) * limit; // Calcular el número de documentos a omitir

    try {
        const users = await User.find().skip(skip);

        if (!users || users.length === 0) {
            return res.status(404).send({ message: 'No se encontraron usuarios para esta página.' });
        }

        const totalUsers = await User.countDocuments();
        const totalPages = Math.ceil(totalUsers / limit); // Calcular el número total de páginas

        // Obtener los IDs de los usuarios que seguimos
        const loggedInUserId = req.user._id;
        const following = await Follow.find({ user: loggedInUserId }).select('followed');
        const followingIds = following.map(f => f.followed);

        // Obtener los IDs de los usuarios que nos siguen
        const followers = await Follow.find({ followed: loggedInUserId }).select('user');
        const followerIds = followers.map(f => f.user);

        res.status(200).send({ 
            users: users,
            totalUsers: totalUsers, // Enviar el número total de usuarios
            totalPages: totalPages, // Enviar el número total de páginas
            followingIds: followingIds, // Enviar los IDs de los usuarios que seguimos
            followerIds: followerIds // Enviar los IDs de los usuarios que nos siguen
        });
    } catch (err) {
        console.error('Error al buscar usuarios:', err);
        res.status(500).send({ message: 'Error en la petición' });
    }
}

function uploadImage(req, res) {
    const userId = req.params.id; // Obtener el ID de usuario de los parámetros de la solicitud
    const file = req.file; // Obtener el archivo de imagen del cuerpo de la solicitud

    // Verificar si se proporcionó un archivo de imagen
    if (!file) {
        return res.status(400).send({ message: 'No se proporcionó ningún archivo de imagen.' });
    }

    // Obtener la extensión del archivo de imagen
    const fileExtension = file.originalname.split('.').pop();

    // Definir las extensiones permitidas
    const allowedExtensions = ['jpg', 'jpeg', 'png'];

    // Verificar si la extensión del archivo es permitida
    if (!allowedExtensions.includes(fileExtension.toLowerCase())) {
        return res.status(400).send({ message: 'La extensión del archivo no es válida. Por favor, utiliza archivos JPG, JPEG o PNG.' });
    }

    // Buscar el usuario en la base de datos por ID
    User.findById(userId)
        .then(user => {
            // Verificar si el usuario existe
            if (!user) {
                return res.status(404).send({ message: 'Usuario no encontrado.' });
            }

            // Crear un nombre único para el archivo de imagen
            const uniqueFilename = `${userId}-${Date.now()}.${fileExtension}`;

            // Definir la ruta donde se guardará el archivo de imagen
            const uploadPath = path.join(__dirname, '..', 'uploads', 'avatars', uniqueFilename);

            // Mover el archivo de imagen al directorio de subidas
            fs.rename(file.path, uploadPath, err => {
                if (err) {
                    console.error('Error al subir el archivo de imagen:', err);
                    return res.status(500).send({ message: 'Error al subir el archivo de imagen.' });
                }

                // Actualizar el campo de imagen del usuario en la base de datos con el nombre del archivo
                user.image = uniqueFilename;
                user.save()
                    .then(updatedUser => {
                        res.status(200).send({ user: updatedUser });
                    })
                    .catch(err => {
                        console.error('Error al actualizar la imagen del usuario:', err);
                        res.status(500).send({ message: 'Error en la petición' });
                    });
            });
        })
        .catch(err => {
            console.error('Error al buscar usuario:', err);
            res.status(500).send({ message: 'Error en la petición' });
        });
}

function getUserAvatar(req, res) {
    const imageId = req.params.id; // Obtener el ID de imagen de los parámetros de la solicitud

    // Obtener la ruta de la imagen de avatar
    const imagePath = path.join(__dirname, '..', 'uploads', 'avatars', imageId);

    // Verificar si la imagen existe en el sistema de archivos
    if (!fs.existsSync(imagePath)) {
        return res.status(404).send({ message: 'La imagen de avatar no está disponible.' });
    }

    // Devolver la imagen como respuesta
    res.sendFile(imagePath);
}


module.exports = {
    home,
    pruebas,
    saveUser,
    loginUser,
    updateUser,
    getUserProfile,
    getUsersByPage,
    uploadImage,
    getUserAvatar,
    FollowUsersIds,
    getCounters
};
