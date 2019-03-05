const express = require('express')
const router = express.Router()

const User = require('../model/user')
const Personal = require('../model/personal')
const PM = require('../model/pm')
const Group = require('../model/group')
const GC_Members = require('../model/member')
const GC = require('../model/gc')


router.post('/personal', async (req, res) => {
    let isAble = await Personal.findOne({ users_involve:  {$all:[req.body.sender, req.body.reciever]} })
    if (isAble) return res.send({message: '*Connected...'})

    const users = new Personal({
        users_involve : [req.body.user1, req.body.user2]
    });

    const result = await users.save();
    res.status(200).send({message : 'Connected...', data: result})
})

router.post('/personal_message', async (req, res) => {
    let sender = await User.findOne({ username: req.body.sender })
    if (!sender) return res.send({ error: 'Unknown Sender...'})

    let reciever = await User.findOne({ username: req.body.reciever })
    if(!reciever) return res.send({ error: 'Unknown Reciever...'})

    let personal = await Personal.findOne({ users_involve:  {$all:[req.body.sender, req.body.reciever]} })
    if (!personal) return res.send({ error: 'They are not connected...'})

    const message = new PM({
        p_id: personal._id,
        message: req.body.message,
        sender: req.body.sender
    })

    const result = await message.save();
    console.log(result)
    res.status(200).send({ message: 'Message successfully delivered...', data: result})
})

router.get('/personal_message/:sender/:reciever', async (req, res) => {
    let to = await User.findOne({ username: req.params.reciever })
    if (!to) return res.send({ error: 'Unknown User...'})

    let personal = await Personal.findOne({ users_involve:  {$all:[req.params.sender, req.params.reciever]} })
    if (!personal) return res.send({error : 'They are not connected...'})

    let message = await PM.find({ p_id: personal._id })
                .sort({timestamp: 1})
    res.status(200).send({ data: message })
})

router.get('/group', async (req, res) => {
    let group = await Group.find()
    res.status(200).send({ data: group})
})

router.post('/group', async (req, res) => {
    let group = await Group.findOne({ gc_name: req.body.gc_name })
    if (group) return res.send({ message: 'Group name already exist...' })

    const gc = new Group({
        gc_name: req.body.gc_name,
        gc_admin: req.body.gc_admin
    })

    let member = new GC_Members({
        gc_name: req.body.gc_name,
        gc_member: req.body.gc_admin
    })

    member = await member.save()
    let result = await gc.save()
    res.status(200).send({message : 'You created the group...', data: result})
})

router.get('/check_group/:gc_name/:gc_member', async (req, res) => {
    let group = await Group.findOne({ gc_name: req.params.gc_name })
    if (!group) return res.send({ error: 'Unknown Group...'})

    let isMember = await GC_Members.findOne({ gc_name: group.gc_name, gc_member: req.params.gc_member})
    if (isMember) return res.send({ isMember: true})

    res.send({ isMember: false })
})

router.post('/join_group',  async (req, res) => {
    let group = await Group.findOne({ gc_name: req.body.gc_name })
    if (!group) return res.send({ error: 'Unknown Group...'})

    let isMember = await GC_Members.findOne({ gc_name: group.gc_name, gc_member: req.body.gc_member})
    if (isMember) return res.send({ isMember: true, message: 'User already joined the group...'})

    const member = new GC_Members({
        gc_name: group.gc_name,
        gc_member: req.body.gc_member
    })

    let result = await member.save()
    res.status(200).send({ isMember: false, data: result })
})

router.post('/group_message', async (req, res) => {
    let group = await Group.findOne({ gc_name: req.body.gc_name })
    console.log(group)
    if (!group) return res.send({ error: 'Unknown Group...'})

    let sender = await User.findOne({ username: req.body.gc_member })
    console.log(sender)
    if (!sender) return res.send({ error: 'Unknown Sender...'})

    let isMember = await GC_Members.findOne({ gc_name: group.gc_name, gc_member: req.body.gc_member})
    console.log(isMember)
    if (!isMember) return res.send({ isMember: false, error: 'User does not belong to the group...'})

    const message = new GC({
        gc_name: group.gc_name,
        message: req.body.message,
        sender: req.body.gc_member
    })

    let result = await message.save()
    res.status(200).send({ result: result })
})

router.get('/group_messages/:gc_name', async (req, res) => {
    let group = await Group.findOne({ gc_name: req.params.gc_name })
    if (!group) return res.send({ error: 'Group does not exist...'})

    let messages = await GC.find({ gc_name: req.params.gc_name })
                   .sort({timestamp: 1})
    res.status(200).send({data: messages})
})

module.exports = router;