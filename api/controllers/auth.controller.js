import User from '../models/user.model.js';
import bcryptjs from 'bcryptjs';
import {errorHandler} from '../utils/error.js';
import jwt from 'jsonwebtoken';
export const signup = async (req,res,next)=>{   
  const {username,email,password}=req.body;
  const hashpassword=bcryptjs.hashSync(password,10);
  const newUser=new  User ({username,email,password:hashpassword});
  try{
    await newUser.save();
    res.status(201).json('user created successfully');
  }catch(error){
     next(error);
  }
 
};

export const Signin=async (req,res,next)=>{
  const {email,password}=req.body;
  try{
    const validUser=await User.findOne({email});
    if(!validUser) return next(errorHandler(404,'wrong email !! Plzz provide a valid email'));
    const validpassword = bcryptjs.compareSync(password,validUser.password);
    if(!validpassword) return next(errorHandler(404,'Wrong password!'));
    const token = jwt.sign({id: validUser._id},process.env.JWT_SECRET);
    const { password:pass,...rest}=validUser._doc;
    res.cookie('access_token',token,{httpOnly:true}).status(200).json(rest);
  }catch(error)
  {
    next(error);
  }
}

export const Google = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
      const { password: pass, ...rest } = user._doc;
      res
        .cookie('access_token', token, { httpOnly: true })
        .status(200)
        .json(rest);
    } else {
      const generatedPassword =
        Math.random().toString(36).slice(-8) +
        Math.random().toString(36).slice(-8);
      const hashedPassword = bcryptjs.hashSync(generatedPassword, 10);
      const newUser = new User({
        username:
          req.body.name.split(' ').join('').toLowerCase() +
          Math.random().toString(36).slice(-4),
        email: req.body.email,
        password: hashedPassword,
        avatar: req.body.photo,
      });
      await newUser.save();
      const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET);
      const { password: pass, ...rest } = newUser._doc;
      res
        .cookie('access_token', token, { httpOnly: true })
        .status(200)
        .json(rest);
    }
  } catch (error) {
    next(error);
  }
};
export const signOut = async (req, res, next) => {
  try {
    res.clearCookie('access_token');
    res.status(200).json('User has been logged out!');
  } catch (error) {
    next(error);
  }
};
