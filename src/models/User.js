const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Task = require("./Task");

const userSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
        trim: true,
        validate(value) {
            if(value.toString().includes("password"))
                throw new Error("Password should not be password")
        }
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if(!validator.isEmail(value))
                throw new Error("Email is not valid")
        }   
    },
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if(value < 0)
                throw new Error("Age must be positive number")
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar:{
        type: Buffer
    }
},
{
    timestamps: true
});

userSchema.virtual('tasks',{
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner' 
});

userSchema.statics.findByCredentials = async (email,password) => {
    const user = await User.findOne({ email });

    if(!user)
        throw new Error("No user exist");

    const match = await bcrypt.compare(password,user.password);
    
    if(!match)
        throw new Error("Password not correct");

    return user;
}

userSchema.methods.generateAuthToken = async function() {
    
    const user = this;
    const token = jwt.sign({ _id: user._id.toString()}, process.env.JWT_SECRET);

    user.tokens = user.tokens.concat({ token});
    await user.save();
    return token;
}

userSchema.methods.toJSON = function() {
    
    const user = this;
    const userObject = user.toObject();

    delete userObject.password;
    delete userObject.tokens;
    delete userObject.avatar;

    return userObject;
}

//Delete user task when user is removed

userSchema.pre('remove', async function(next){
    
    const user  = this;

    await Task.deleteMany({ owner: user._id});

    next();

})


//For hashing password
userSchema.pre('save', async function(next){
    
    const user  = this;

    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password,8);
    }

    next();

});

const User = mongoose.model('User',userSchema);

module.exports = User;