'use strict';

var moment = require('moment');
var mongoosePaginate = require('mongoose-pagination');

var User = require('../models/user');
var Follow = require('../models/follow');
var Message = require('../models/message');

function probando(req, res) {
    res.status(200).send({ message: 'Hola que tal desde los mensajes privados' });
}

function saveMessage(req, res) {
    var params = req.body;

    if (!params.text || !params.receiver) return res.status(400).send({ message: 'Envía los datos necesarios' });

    var message = new Message();
    message.emitter = req.user._id; // Usar req.user._id para asignar el ID del usuario autenticado como emisor
    message.receiver = params.receiver;
    message.text = params.text;
    message.created_at = moment().unix();
    message.viewed = false; // Asegurarse de que viewed sea booleano

    message.save()
        .then(messageStored => {
            if (!messageStored) return res.status(500).send({ message: 'Error al enviar el mensaje' });
            // Devolver el mensaje almacenado junto con el emisor dentro del objeto message
            return res.status(200).send({ message: { ...messageStored.toObject(), emitter: req.user._id, receiver: params.receiver } });
        })
        .catch(err => {
            console.error(err);
            return res.status(500).send({ message: 'Error en la petición' });
        });
}

const ITEMS_PER_PAGE = 10; // Número de mensajes por página

function getReceivedMessages(req, res) {
    var userId = req.user._id;
    var page = 1; // Página por defecto

    if (req.params.page) {
        page = parseInt(req.params.page); // Obtener el número de página de los parámetros de la solicitud
    }

    // Utilizar el método countDocuments de Mongoose para contar el total de mensajes recibidos por el usuario
    Message.countDocuments({ receiver: userId })
        .then(count => {
            // Calcular el número total de páginas
            const totalPages = Math.ceil(count / ITEMS_PER_PAGE);

            // Utilizar el método find de Mongoose para buscar los mensajes recibidos por el usuario
            Message.find({ receiver: userId })
                .populate('emitter', 'name surname nick _id image') // Utilizar populate para obtener los detalles del emisor (nombre, apellido, nick, _id, imagen)
                .select('text created_at receiver') // Incluir los campos text, created_at y receiver
                .sort('-created_at') // Ordenar los mensajes por fecha de creación descendente
                .skip((page - 1) * ITEMS_PER_PAGE) // Calcular el número de documentos a omitir
                .limit(ITEMS_PER_PAGE) // Limitar el número de mensajes por página
                .then(messages => {
                    // Devolver el total de mensajes, el total de páginas y la lista de mensajes recibidos
                    return res.status(200).send({ totalMessages: count, totalPages: totalPages, messages: messages });
                })
                .catch(err => {
                    console.error(err);
                    return res.status(500).send({ message: 'Error en la petición' });
                });
        })
        .catch(err => {
            console.error(err);
            return res.status(500).send({ message: 'Error en la petición' });
        });
}

function getEmitMessages(req, res) {
    var userId = req.user._id;
    var page = 1; // Página por defecto

    if (req.params.page) {
        page = parseInt(req.params.page); // Obtener el número de página de los parámetros de la solicitud
    }

    // Utilizar el método countDocuments de Mongoose para contar el total de mensajes enviados por el usuario
    Message.countDocuments({ emitter: userId })
        .then(count => {
            // Calcular el número total de páginas
            const totalPages = Math.ceil(count / ITEMS_PER_PAGE);

            // Utilizar el método find de Mongoose para buscar los mensajes enviados por el usuario
            Message.find({ emitter: userId })
                .populate('receiver', '_id name surname nick') // Utilizar populate para obtener los detalles del receptor (nombre, apellido, nick, _id)
                .populate('emitter', 'name surname nick _id image') // Utilizar populate para obtener los detalles del emisor (nombre, apellido, nick, _id, imagen)
                .select('text created_at emitter receiver') // Incluir los campos text, created_at, emitter y receiver
                .sort('-created_at') // Ordenar los mensajes por fecha de creación descendente
                .skip((page - 1) * ITEMS_PER_PAGE) // Calcular el número de documentos a omitir
                .limit(ITEMS_PER_PAGE) // Limitar el número de mensajes por página
                .then(messages => {
                    // Devolver el total de mensajes, el total de páginas y la lista de mensajes enviados
                    return res.status(200).send({ totalMessages: count, totalPages: totalPages, messages: messages });
                })
                .catch(err => {
                    console.error(err);
                    return res.status(500).send({ message: 'Error en la petición' });
                });
        })
        .catch(err => {
            console.error(err);
            return res.status(500).send({ message: 'Error en la petición' });
        });
}

function getUnviewedMessages(req, res) {
    var userId = req.user._id;

    // Utilizar el método countDocuments de Mongoose para contar el total de mensajes no vistos por el usuario
    Message.countDocuments({ receiver: userId, viewed: false })
        .then(count => {
            // Utilizar el método find de Mongoose para buscar los mensajes no vistos por el usuario
            Message.find({ receiver: userId, viewed: false })
                .populate('emitter', 'name surname nick _id image') // Utilizar populate para obtener los detalles del emisor (nombre, apellido, nick, _id, imagen)
                .select('text created_at emitter viewed') // Incluir los campos text, created_at, emitter y viewed
                .sort('-created_at') // Ordenar los mensajes por fecha de creación descendente
                .then(messages => {
                    // Devolver el total de mensajes no vistos y la lista de mensajes
                    return res.status(200).send({ totalUnviewedMessages: count, messages: messages });
                })
                .catch(err => {
                    console.error(err);
                    return res.status(500).send({ message: 'Error en la petición' });
                });
        })
        .catch(err => {
            console.error(err);
            return res.status(500).send({ message: 'Error en la petición' });
        });
}

async function setViewedMessages(req, res) {
    var userId = req.user._id;

    try {
        const result = await Message.updateMany(
            { receiver: userId, viewed: false },
            { $set: { viewed: true } }
        );
        return res.status(200).send({ messages: result });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'Error en la petición' });
    }
}

module.exports = {
    probando,
    saveMessage,
    getReceivedMessages,
    getEmitMessages,
    getUnviewedMessages,
    setViewedMessages
}
