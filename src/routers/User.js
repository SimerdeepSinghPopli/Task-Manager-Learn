const express = require("express");
const userRouter = new express.Router();
const User = require("../models/User");
const auth = require("../middleware/Auth");
const multer = require("multer");
const sharp = require("sharp");
const { sendWelcomeMail, sendCancelMail } = require("../emails/account");


const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req,file,cb) {

        if(!file.originalname.match(/\.(jpf|jpeg|png)$/)){

            return cb(new Error("Please upload jpg or jpeg or png "));
        }

        cb(undefined,true);
    }
});

userRouter.post('/users', async (req,res) => {

    const user = new User(req.body);

    try{
        await user.save();
        sendWelcomeMail(user.email,user.name);
        const token = await user.generateAuthToken();
        res.status(201).send({user, token});
    }
    catch(e){
        res.status(400).send(e);
    }

})

userRouter.post('/users/login', async (req,res) => {

    try{
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateAuthToken();
        res.send({user, token});
    }
    catch(e){
        //console.log(e.toString())
        res.status(400).send(e.toString());
    }

})

userRouter.get('/users/me',auth,async (req,res) => {

    res.send(req.user);

})

userRouter.post('/users/logout',auth, async (req,res) => {

    try{
        req.user.tokens = req.user.tokens.filter((token) => token.token !== req.token);
        await req.user.save();
        res.send();
    }
    catch(e){
        res.status(500).send(e);
    }
});

userRouter.post('/users/logoutAll',auth, async (req,res) => {

    try{
        req.user.tokens = [];
        await req.user.save();
        res.send();
    }
    catch(e){
        res.status(500).send(e);
    }
});


userRouter.delete('/user/me',auth, async (req,res) => {    

    try{
        await req.user.remove();
        sendCancelMail(req.user.email,req.user.name);
        res.send(req.user);
    }
    catch(e){
        res.status(500).send(e)
    }
    
})

userRouter.patch('/user/me', auth , async (req,res) => {    

    const allowedUpdate = ["name","email","password","age"];
    const updates = Object.keys(req.body);
    const isValidOperation = updates.every((update) => allowedUpdate.includes(update) )

    if(!isValidOperation) {
        return res.status(400).send({ error: "Invalid Updates"});
    }

    try{
        const user = req.user;
        
        updates.forEach((update) => user[update] = req.body[update]);

        await user.save();

        res.send(user);
    }
    catch(e){
        res.status(400).send(e)
    }
    
})

userRouter.post('/users/me/avatar',auth, upload.single('avatar'), async (req,res) => {

   const buffer = await sharp(req.file.buffer).resize({ width: 50, height: 50 }).png().toBuffer();
   req.user.avatar = buffer;
   await req.user.save();
   res.send();

},(error,req,res,next) => {

    res.status(400).send({error: error.message});
})

userRouter.delete('/users/me/avatar',auth, async (req,res) => {

    req.user.avatar = undefined;
    await req.user.save();
    res.send();
 
 })

 userRouter.get('/users/:id/avatar', async (req,res) => {

   try{
    const user = await User.findById(req.params.id);

    if(!user || !user.avatar ){
        
        throw new Error("No user Exist");
    }

    res.set("Content-Type",'image/png');
    res.send(user.avatar);

   }
   catch(e){
    res.status(404).send()
   }
 
 })

module.exports = userRouter;
