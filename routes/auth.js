const mongoose = require('mongoose')
const express = require('express')
const bcrypt = require('bcrypt')
const { User } = require('./user')
const Joi = require('joi')
const router = express.Router()

router.post('/', async (req, res) => {
    const { error } = validate(req.body)
    if (error) return res.status(400).send(error.details);

    let user = await User.findOne({ phone: req.body.phone })
    if (!user) return res.status(400).send([{ message: 'Invalid phone and password' }])

    const isValid = await bcrypt.compare(req.body.password, user.password);
    if(!isValid) return res.status(400).send([{ message: 'Invalid phone and password' }])

    res.send(true);
})

function validate(req) {
    const schema = {
        phone: Joi.string().min(9).max(9).required(),
        password: Joi.string().min(3).required()
    }

    return Joi.validate(req, schema, { abortEarly: false})
}

module.exports = router;