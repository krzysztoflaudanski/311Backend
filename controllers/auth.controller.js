const User = require('../models/user.model')
const bcrypt = require('bcryptjs')
const getImageFileType = require('../utils/getImageFileType')
const sanitize = require('mongo-sanitize');
const path = require('path');
const fs = require('fs');

exports.register = async (req, res) => {

    try {
        const cleanBody = sanitize(req.body)
        const { password, phone, login } = cleanBody;

        const fileType = req.file ? await getImageFileType(req.file) : 'unknown';

        if (login && typeof login === 'string' && password && typeof password === 'string' && phone && typeof parseInt(phone) === 'number'
            && req.file && ['image/png', 'image/jpeg', 'image/gif'].includes(fileType)) {
            const userWithLogin = await User.findOne({ login });
            if (userWithLogin) {
                if (req.file) {
                    const fileRoute = path.join(__dirname, '../img/uploads/', req.file.filename)
                    fs.unlinkSync(fileRoute)
                }
                return res.status(409).send({ message: 'User with this login already exists' })
            }

            const loginPattern = new RegExp(/([A-Za-z\d]*)/, 'g')
            const loginMatched = login.match(loginPattern).join('');

            const passwordPattern = new RegExp(/([A-Za-z\d.,;:"'/?!@#$%^&*()--+=]*)/, 'g')
            const passwordMatched = password.match(passwordPattern).join('');

            if (loginMatched.length < login.length || passwordMatched.length < password.length) {
                if (req.file) {
                    const fileRoute = path.join(__dirname, '../img/uploads/', req.file.filename)
                    fs.unlinkSync(fileRoute)
                }
                return res.status(400).json({ message: 'Invalid characters' });
            }

            function isStrongPassword(password) {
                // Sprawdzenie długości hasła
                if (password.length < 8) {
                    return false;
                }
                // Sprawdzenie, czy zawiera co najmniej jedną dużą literę
                if (!/[A-Z]/.test(password)) {
                    return false;
                }
                // Sprawdzenie, czy zawiera co najmniej jedną małą literę
                if (!/[a-z]/.test(password)) {
                    return false;
                }
                // Sprawdzenie, czy zawiera co najmniej jedną cyfrę
                if (!/\d/.test(password)) {
                    return false;
                }
                // Hasło spełnia wszystkie wymagania
                return true;
            }

            if (isStrongPassword(password)) {
                console.log("Strong password!");
            } else {
                if (req.file) {
                    const fileRoute = path.join(__dirname, '../img/uploads/', req.file.filename)
                    fs.unlinkSync(fileRoute)
                }
                return res.status(400).send({ message: 'Your password is too weak' })
            }

            const avatar = '/img/uploads/' + req.file.filename

            const user = await User.create({ login, phone, password: await bcrypt.hash(password, 10), avatar: avatar })
            res.status(201).send({ message: 'User created' + user.login });
        } else {
            if (req.file) {
                const fileRoute = path.join(__dirname, '../img/uploads/', req.file.filename)
                fs.unlinkSync(fileRoute)
            }
            res.status(400).send({ message: 'Bad request' })
        }
    } catch (err) {
        if (req.file) {
            const fileRoute = path.join(__dirname, '../img/uploads/', req.file.filename)
            fs.unlinkSync(fileRoute)
        }
        res.status(500).send({ message: err.message });
    }
}

exports.login = async (req, res) => {
    try {

        const cleanBody = sanitize(req.body)
        const { login, password } = cleanBody;

        if (login && typeof login === 'string' && password && typeof password === 'string') {

            const loginPattern = new RegExp(/([A-Za-z\d]*)/, 'g')
            const loginMatched = login.match(loginPattern).join('');

            const passwordPattern = new RegExp(/([A-Za-z\d.,;:"'/?!@#$%^&*()--+=]*)/, 'g')
            const passwordMatched = password.match(passwordPattern).join('');

            if (loginMatched.length < login.length || passwordMatched.length < password.length) {

                return res.status(400).json({ message: 'Invalid characters' });
            }

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
        if (process.env.NODE_ENV !== "production") {
            req.session.destroy((err) => {
                if (err) {
                    res.status(500).send({ message: err.message });
                } else {
                    res.status(200).send({ message: 'Logout succesfull' });
                }
            })
        };
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

exports.getUser = async (req, res) => {
    res.send({ login: req.session.user.login });
};