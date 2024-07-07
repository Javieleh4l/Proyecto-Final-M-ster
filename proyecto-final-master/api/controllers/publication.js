'use strict'

var path = require('path');
var fs = require('fs');
var moment = require('moment');
var mongoosePaginate = require('mongoose-pagination');

var Publication = require('../models/publication');
var User = require('../models/user');
var Follow = require('../models/follow');

function probando(req, res){
    res.status(200).send({
        message: "Hola desde el CONTROLADOR DE PUBLICACIONES"
    });
}

async function savePublication(req, res) {
    const params = req.body;

    if (!params.text) {
        return res.status(400).send({ message: 'Debes enviar un texto!!' });
    }

    try {
        console.log('req.user:', req.user); // Registrar el objeto req.user para verificar si está presente y contiene la información del usuario

        const publication = new Publication({
            text: params.text,
            file: null, // Asignar null directamente en lugar de la cadena 'null'
            user: req.user ? req.user._id : null, // Utiliza req.user._id en lugar de req.user.sub si el middleware establece user._id
            created_at: moment().unix()
        });        

        const publicationStored = await publication.save();

        // Obtener el ID del usuario solo si req.user está definido
        const userId = req.user ? req.user.sub : null;
        console.log('userId:', userId); // Registrar el ID del usuario para verificar si se está asignando correctamente

        return res.status(200).send({ 
            publication: publicationStored.toObject()
        });
    } catch (error) {
        return res.status(500).send({ message: 'Error al guardar la publicación' });
    }
}


async function getPublications(req, res) {
    let page = 1; // Página por defecto
    const itemsPerPage = 10; // Número de publicaciones por página

    // Verificar si se proporciona el parámetro de página en la solicitud
    if (req.params.page) {
        page = parseInt(req.params.page); // Convertir el número de página a entero
    }

    try {
        const count = await Publication.countDocuments(); // Contar el total de publicaciones

        // Calcular el total de páginas
        const totalPages = Math.ceil(count / itemsPerPage);

        // Verificar si la página solicitada está dentro del rango válido
        if (page < 1 || page > totalPages) {
            return res.status(404).send({ message: 'Página no encontrada' });
        }

        // Obtener las publicaciones para la página actual
        const publications = await Publication.find()
            .populate('user')
            .sort('-created_at')
            .skip((page - 1) * itemsPerPage)
            .limit(itemsPerPage)
            .exec();

        return res.status(200).send({ 
            total_items: count,
            pages: totalPages,
            page: page,
            publications: publications 
        });
    } catch (error) {
        return res.status(500).send({ message: 'Error al obtener las publicaciones' });
    }
}

async function getPublication(req, res) {
    const publicationId = req.params.id; // Obtener el ID de la publicación de los parámetros de la solicitud

    try {
        // Buscar la publicación por su ID
        const publication = await Publication.findById(publicationId)
            .populate('user') // Poblar el campo 'user' con los detalles del usuario asociado a la publicación
            .exec();

        // Verificar si la publicación existe
        if (!publication) {
            return res.status(404).send({ message: 'Publicación no encontrada' });
        }

        // Devolver la publicación encontrada
        return res.status(200).send({ publication });
    } catch (error) {
        // Manejar errores
        console.error('Error al obtener la publicación:', error);
        return res.status(500).send({ message: 'Error al obtener la publicación' });
    }
}

async function deletePublication(req, res) {
    const publicationId = req.params.id; // Obtener el ID de la publicación de los parámetros de la solicitud

    try {
        // Buscar la publicación por su ID y eliminarla
        const deletedPublication = await Publication.findByIdAndDelete(publicationId);

        // Verificar si la publicación existe
        if (!deletedPublication) {
            return res.status(404).send({ message: 'Publicación no encontrada' });
        }

        // Devolver un mensaje de éxito después de eliminar la publicación
        return res.status(200).send({ message: 'Publicación eliminada correctamente' });
    } catch (error) {
        // Manejar errores
        console.error('Error al eliminar la publicación:', error);
        return res.status(500).send({ message: 'Error al eliminar la publicación' });
    }
}

async function uploadImage(req, res) {
    const publicationId = req.params.id; // Obtener el ID de la publicación de los parámetros de la solicitud
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

    try {
        // Buscar la publicación por su ID
        const publication = await Publication.findById(publicationId);

        // Verificar si la publicación existe
        if (!publication) {
            return res.status(404).send({ message: 'Publicación no encontrada' });
        }

        // Crear un nombre único para el archivo de imagen
        const uniqueFilename = `${publicationId}-${Date.now()}.${fileExtension}`;

        // Definir la ruta donde se guardará el archivo de imagen
        const uploadPath = path.join(__dirname, '..', 'uploads', 'publications', uniqueFilename);

        // Mover el archivo de imagen al directorio de subidas
        fs.rename(file.path, uploadPath, async (err) => {
            if (err) {
                console.error('Error al subir el archivo de imagen:', err);
                return res.status(500).send({ message: 'Error al subir el archivo de imagen.' });
            }

            // Guardar la ruta de la imagen en la publicación
            publication.file = uniqueFilename; // Aquí debería ser `publication.file` en lugar de `publication.image`
            await publication.save();

            // Devolver el objeto de la publicación que contiene el ID de la imagen
            return res.status(200).send({ publication });
        });
    } catch (error) {
        console.error('Error al procesar la subida de la imagen:', error);
        return res.status(500).send({ message: 'Error al procesar la subida de la imagen' });
    }
}

async function getImageFile(req, res) {
    const imageFile = req.params.imageFile; // Obtener el nombre del archivo de imagen de los parámetros de la solicitud
    const imagePath = path.join(__dirname, '..', 'uploads', 'publications', imageFile); // Construir la ruta de la imagen

    // Verificar si el archivo de imagen existe en el servidor
    if (fs.existsSync(imagePath)) {
        // Devolver el archivo de imagen
        return res.sendFile(imagePath);
    } else {
        // Si el archivo de imagen no existe, devolver un mensaje de error
        return res.status(404).send({ message: 'Imagen no encontrada' });
    }
}

module.exports = {
    probando,
    savePublication,
    getPublications,
    getPublication,
    deletePublication,
    uploadImage,
    getImageFile
}

