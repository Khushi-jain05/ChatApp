import User from '../models/user.js';
import bcrypt from 'bcryptjs';
import { generateAuthToken } from '../lib/utils.js';
import cloudinary from '../lib/cloudinary.js';
export const signup=async (userData)=>{
    const {fullName,email,password,bio}=req.body;
    try {
        if(!fullName || !email || !password){
            return res.json({success:false,message:'All fields are required'});
        }
        const user=await User.findOne({email});
        if(user){
            return res.json({success:false,message:'User already exists'});
        }
        const salt=await bcrypt.genSalt(10);
        const hashedPassword=await bcrypt.hash(password,salt);
        const newUser=new User.create({
            fullName,
            email,
            password:hashedPassword,
            bio
        });
        const token=generateAuthToken(newUser._id);
        res.json({success:true,userData:newUser,token,
            message:"Account created successfully"});
    } catch (error) {
        console.log(error.message);
        
        res.json({success:false,
            message:error.message});
    }
}

export const login=async (req,res)=>{
    

    try {
        const {email,password}=req.body;
        const userData=await User.findOne({email});
        const isPasswordCorrect=await bcrypt.compare(password,userData.password);
        if(!isPasswordCorrect){
            return res.json({success:false,message:'Invalid credentials'});
        }
        const token=generateAuthToken(userData._id);
        res.json({success:true,userData,token,
            message:"Account created successfully"});
    } catch (error) {
        console.log(error.message);
        
        res.json({success:false,
            message:error.message});
    }
}
export const checkAuth =  (req, res) => {
    res.json({success:true,user:req.user});

}

export const updateProfile=async (req,res)=>{
    try {
        const {fullName,bio,profilePic}=req.body;
        const userId=req.user._id;
        let updateUser;
        if(!profilePic){
            await User.findByIdAndUpdate(userId,{
                fullName,
                bio},{new:true});
        }
        else{
            const upload=await cloudinary.uploader.upload(profilePic)
            updateUser=await User.findByIdAndUpdate(userId,{profilePic:upload.secure_url,bio,fullName},{new:true});
        }
        res.json({success:true,user:updateUser,});
       
    } catch (error) {
        console.log(error.message);
        
        res.json({success:false,user:error.message});
    }
}