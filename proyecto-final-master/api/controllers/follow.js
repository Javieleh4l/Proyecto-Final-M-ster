'use strict';

const User = require('../models/user');
const Follow = require('../models/follow');

function followUser(req, res) {
    const userId = req.user._id;
    const followedId = req.params.followed;

    const follow = new Follow({
        user: userId,
        followed: followedId
    });

    follow.save()
        .then(followStored => {
            if (!followStored) return res.status(404).send({ message: 'No se ha podido seguir al usuario.' });
            return res.status(200).send({ follow: followStored });
        })
        .catch(err => {
            return res.status(500).send({ message: 'Error al seguir al usuario.', error: err });
        });
}


function unfollowUser(req, res) {
    const userId = req.user._id;
    const followedId = req.params.followed;

    Follow.deleteOne({ user: userId, followed: followedId })
        .then(result => {
            if (result.deletedCount === 0) {
                return res.status(404).send({ message: 'No se encontró la relación de seguimiento.' });
            }
            return res.status(200).send({ message: 'Se ha dejado de seguir al usuario.' });
        })
        .catch(err => {
            return res.status(500).send({ message: 'Error al dejar de seguir al usuario.', error: err });
        });
}


function getFollowingUsers(req, res) {
    const userId = req.params.id || req.user._id;
    const perPage = 10; // Número de usuarios por página
    let page = req.params.page || 1; // Página actual

    Follow.find({ user: userId }).populate('followed')
        .then(follows => {
            if (!follows || follows.length === 0) {
                return res.status(404).send({ message: 'No sigues a ningún usuario.' });
            }
            
            // Cálculo del total de usuarios seguidos y el total de páginas
            const totalFollows = follows.length;
            const totalPages = Math.ceil(totalFollows / perPage);

            // Paginación de los resultados
            follows = follows.slice((page - 1) * perPage, page * perPage);

            return res.status(200).send({ follows, totalFollows, totalPages, userId, currentPage: page });
        })
        .catch(err => {
            console.error('Error en el servidor:', err);
            return res.status(500).send({ message: 'Error en el servidor.' });
        });
}

function getFollowedUsers(req, res) {
    const userId = req.params.id || req.user._id;
    const perPage = 10; // Número de usuarios por página
    let page = req.params.page || 1; // Página actual

    Follow.find({ followed: userId }).populate('user')
        .then(follows => {
            if (!follows || follows.length === 0) {
                return res.status(404).send({ message: 'No tienes seguidores.' });
            }
            
            // Cálculo del total de seguidores y el total de páginas
            const totalFollowers = follows.length;
            const totalPages = Math.ceil(totalFollowers / perPage);

            // Paginación de los resultados
            follows = follows.slice((page - 1) * perPage, page * perPage);

            return res.status(200).send({ followers: follows, totalFollowers, totalPages, userId, currentPage: page });
        })
        .catch(err => {
            console.error('Error en el servidor:', err);
            return res.status(500).send({ message: 'Error en el servidor.' });
        });
}

function getMyFollows(req, res) {
    const userId = req.user._id;
    const includeFollowers = req.params.followed === 'true';

    // Promesa para buscar los usuarios que yo sigo
    const followingPromise = Follow.find({ user: userId }).populate('followed');

    // Si se incluyen los seguidores, buscar también los usuarios que me siguen
    const followersPromise = includeFollowers ? Follow.find({ followed: userId }).populate('user') : Promise.resolve([]);

    // Ejecutar ambas promesas en paralelo
    Promise.all([followingPromise, followersPromise])
        .then(([follows, followers]) => {
            if (!follows || follows.length === 0) {
                return res.status(404).send({ message: 'No sigues a ningún usuario.' });
            }

            const response = { follows };

            // Si se incluyeron los seguidores, agregarlos a la respuesta
            if (includeFollowers) {
                response.followers = followers;
            }

            return res.status(200).send(response);
        })
        .catch(err => {
            console.error('Error en el servidor:', err);
            return res.status(500).send({ message: 'Error en el servidor.' });
        });
}

module.exports = {
    followUser,
    unfollowUser,
    getFollowingUsers,
    getFollowedUsers,
    getMyFollows,
};

