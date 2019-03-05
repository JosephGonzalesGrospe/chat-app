const mongoose = require('mongoose')
const auth = require('../middleware/auth')
const User = require('../model/user')
const config = require('config')
const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const Joi = require('joi')
const router = express.Router()

// register user
router.post('/_', async (req, res) => {
    const { error } = validateUser(req.body)
    if (error) return res.send(error.details)

    let user = await User.findOne({ username: req.body.username });
    if (user) return res.send([{ message: `Username '${req.body.username}' does exist...` }])

    const salt = await bcrypt.genSalt(10)
    const hash =  await bcrypt.hash(req.body.password, salt)

    user = new User({
        username: req.body.username,
        password: hash
    })

    const token = jwt.sign({ _id: user._id,  username: user.username }, config.get('jwtPrivateKey'))
    const result = await user.save();
    res.status(200).header('x-auth-token', token).send({data: result})
})

// log user
router.post('/', async (req, res) => {
    // const { error } = validateLogin(req.body)
    // if (error) return res.send(error.details);

    let user = await User.findOne({ username: req.body.username })
    console.log(user)
    if (!user) return res.send([{ message: 'Invalid username and password' }])

    const isValid = await bcrypt.compare(req.body.password, user.password);
    console.log(isValid)
    if(!isValid) return res.send([{ message: 'Invalid username and password' }])

    const _token = jwt.sign({ _id: user._id,  username: user.username }, config.get('jwtPrivateKey'))
    res.status(200).header('x-auth-token', _token).send({auth: true, token: _token});
})

router.get('/:me', async (req, res) => {
    let users = await User.find({ username: { $ne:req.params.me }});
    console.log(users)
    return res.status(200).send({ data: users })
})

function validateUser(user) {
    const schema = {
        username: Joi.string().min(3).required(),
        password: Joi.string().min(3).required()
    }

    return Joi.validate(user, schema, { abortEarly: false})
}

module.exports = router;