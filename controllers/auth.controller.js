const User = require('../models/user.model')
const bcrypt = require('bcryptjs')
const getImageFileType = require('../utils/getImageFileType')
const sanitize = require('mongo-sanitize');

exports.register = async (req, res) => {

    try {
        const cleanBody = sanitize(req.body)
        const { password, phone, login } = cleanBody;

        const fileType = req.file ? await getImageFileType(req.file) : 'unknown';

        if (login && typeof login === 'string' && password && typeof password === 'string' && phone && typeof parseInt(phone) === 'number'
            && req.file && ['image/png', 'image.jpeg', 'image/gif', 'image/jpg'].includes(fileType)) {
            const userWithLogin = await User.findOne({ login });
            if (userWithLogin) {
                return res.status(409).send({ message: 'User with this login already exists' })
            }
            const avatar = '/img/uploads/' + req.file.filename

            const user = await User.create({ login, phone, password: await bcrypt.hash(password, 10), avatar: avatar })
            res.status(201).send({ message: 'User created' + user.login });
        } else {
            res.status(400).send({ message: 'Bad request' })
        }
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
}

exports.login = async (req, res) => {
    try {

        const cleanBody = sanitize(req.body)
        const { login, password } = cleanBody;

        if (login && typeof login === 'string' && password && typeof password === 'string') {
            const user = await User.findOne({ login });
            if (!user) {
                res.status(400).send({ message: 'Login or password are incorrect' });
            } else {
                if (bcrypt.compareSync(password, user.password)) {
                    req.session.user = {
                        id: user.id,
                        login: user.login,
                    };
                    res.status(200).send({ message: 'Login successful' });
                } else {
                    res.status(400).send({ message: 'Login or password are incorrect' });
                }
            }
        } else {
            res.status(400).send({ message: 'Bad request' });
        }
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

exports.logout = async (req, res) => {
    try {
        req.session.destroy((err) => {
            if (err) {
                res.status(500).send({ message: err.message });
            } else {
                res.status(200).send({ message: 'Logout succesfull' });
            }
        });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

exports.getUser = async (req, res) => {
    res.send({ login: req.session.user.login });
};