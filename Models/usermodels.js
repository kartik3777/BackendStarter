const mongoose = require('mongoose')
const slugify = require('slugify')
const validator = require('validator')
const bcryptjs = require('bcryptjs')
const crypto = require('crypto')

const userSchema = new mongoose.Schema({
    name : {
        type : String,
        requied: true
    },
    email : {
        type: String,
        required : true,
        unique: false,
        lowercase : true,
        validator : validator.isEmail
    },
    password : {
        type : String,
        required : true,
        select : false
    },
    confirmpassword : {
        type : String,
        required : true,
        validate : {
            //this works on create and on save
            validator : function(el){
                return el === this.password
            }
        }

    },
    passwordResetToken : String,
    passwordResetExpires : Date
})


//don't work on find only works on save and creATE
userSchema.pre('save',async function(next){
    if(!this.modifiedPaths('password')) return next()

    this.password = await bcryptjs.hash(this.password,12)
    this.confirmpassword = ""
    next()
})
userSchema.pre('save',function(next){
    if(!this.isModified('password') || this.isNew) {
        return next()
    }
    this.passwordChangedAt = Date.now() - 1000
    next()
})

userSchema.methods.checkPassword = async function(enteredpass,userpass){
    return await bcryptjs.compare(enteredpass,userpass)
}

userSchema.methods.changedpasswordafter = function(JWTtimestamp){
    if(this.passwordChangedAt){
        const changedTimeStamp = parseInt(
            this.passwordChangedAt.getTime()/1000,
            10
        )
        return JWTtimestamp < changedTimeStamp
    }
    return false;
}

userSchema.methods.createPasswordResetToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex');
  
    this.passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
  
    // console.log({ resetToken }, this.passwordResetToken);
  
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  
    return resetToken;
  };


const User = mongoose.model('User',userSchema)

module.exports = {User}