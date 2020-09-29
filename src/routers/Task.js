const express = require("express");
const TaskRouter = new express.Router();
const Task = require("../models/Task");
const auth = require("../middleware/Auth");

TaskRouter.post('/tasks',auth, async (req,res) => {

    const task = new Task({
        ...req.body,
        owner: req.user._id
    });

    try{
        await task.save();
        res.status(201).send(task);
    }
    catch(e){
        res.status(400).send(e)
    }

})

TaskRouter.get('/tasks',auth, async (req,res) => {

    const match = {};
    const sort = {};

    if(req.query.completed)
        match.completed = req.query.completed === "true"
    
    if(req.query.sortBy){
        const [sortBy,sortOrder] = req.query.sortBy.split(":");
        sort[sortBy] = sortOrder === "desc" ? -1 : 1
    }

    try{
        const Tasks = await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate();
        res.send(req.user.tasks);
    }
    catch(e){
        res.status(500).send(e)
    }
    
})

TaskRouter.get('/tasks/:id',auth,  async (req,res) => {    

    const _id = req.params.id;

    try{
        
        const newTask = await Task.findOne({_id, owner: req.user._id });

        if(!newTask)
        return res.status(404).send();

        res.send(newTask);
    }
    catch(e){
        
        res.status(500).send(e)
    }
    
})

TaskRouter.delete('/tasks/:id',auth, async (req,res) => {    

    const _id = req.params.id;

    try{
        const task = await Task.findOneAndDelete({_id, owner: req.user._id});
        if(!task)
            return res.status(404).send();

        res.send(task);
    }
    catch(e){
        res.status(500).send(e)
    }
    
})

TaskRouter.patch('/tasks/:id', auth, async (req,res) => {    

    const allowedUpdate = ["description","completed"];
    const updates = Object.keys(req.body);
    const isValidOperation = updates.every((update) => allowedUpdate.includes(update) )

    if(!isValidOperation) {
        return res.status(400).send({ error: "Invalid Updates"});
    }

    const _id = req.params.id;

    try{
    
        const newTask = await Task.findOne({_id, owner: req.user._id});

        if(!newTask)
            return res.status(404).send();

        updates.forEach((update) => newTask[update] = req.body[update]);
        await newTask.save();
        res.send(newTask);
    }
    catch(e){
        res.status(400).send(e)
    }
    
})

module.exports = TaskRouter;
