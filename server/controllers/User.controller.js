import sendEmail from "../config/sendEmail.js";
import UserModel from "../models/user.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import verifyEmailTemplate from "../utils/verifyEmailTamplate.js";
import generatedAccessToken from "../utils/generateAccessToken.js";
import genertedRefreshToken from "../utils/generateRefreshToken.js";
import uploadImageCoudinary from "../utils/uploadImageCoudinary.js";
import generatedOtp from "../utils/generatedOto.js";
import forgotPasswordTemplate from "../utils/forgotPasswordTemplate.js";


export async function registerUserController(req,res){
  try {
    const {name,email,password} = req.body;

    if(!name || !email || !password){
      return res.status(400).send({
        message : "Please provide all required fields",
        success : false,
        error : true
      })
    }
    
    const existingUser = await UserModel.findOne({email});
    if(existingUser){
      return res.status(409).send({
        message : "User with this email already exists",
        success : false,
        error : true
      })
    }


    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password,salt);

    const payload = {
      name,
      email,
      password : hashedPassword
    }
    const newUser = new UserModel(payload);
    const save = await newUser.save();
    const verifryUrl = `${process.env.FRONTEND_URL}/verify-email?code=${save._id}`;
    const veryfyEmail = await sendEmail({
      sendTo : email,
      subject : "Welcome to BestSell! Please verify your email",
      html : verifyEmailTemplate({name , url: verifryUrl})
    })
    res.status(201).send({
      message : "User registered successfully! Please check your email to verify your account.",
      success : true,
      error : false,
      data : save,
      
    })
  } catch (error) {
    res.status(500).send({message : "Internal Server Error",
    success : false,
    error:true

    })
    
  }
}

export async function verifyEmailController(req,res){
  try {
    const {code} = req.body;

    const user = await UserModel.findOne({_id : code});
    if(!user){
      return res.status(400).send({
        message : "Invalid verification code",
        success : false,
        error : true
      })
    }
    const updateUser = await UserModel.updateOne({_id : code}, {
      verify_email : true
    });
    res.status(200).send({
      message : "Email verified successfully",
      success : true,
      error : false
    })
    
  } catch (error) {
    res.status(500).send({message : "Internal Server Error",
    success : false,
    error:true

    })
    
  }
}

//login controller
export async function loginUserController(req,res){
  try {
    const {email,password} = req.body;

    if(!email || !password){
      return res.status(400).send({
        message : "Please provide all required fields",
        success : false,
        error : true
      })
    }
    const user = await UserModel.findOne({email});
    if(!user){
      return res.status(404).send({
        message : "User not found",
        success : false,
        error : true
      })
    }
    if(user.status !== "Active"){
      return res.status(400).send({
        message : "User is not active",
        success : false,
        error : true
      })
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch){
      return res.status(400).send({
        message : "Invalid credentials",
        success : false,
        error : true
      })
    }

    const accessToken = await generatedAccessToken(user._id);
    const refreshToken = await genertedRefreshToken(user._id);

    const updateUser = await UserModel.findByIdAndUpdate(user._id,{
      last_login_date : new Date(),
      
    })
    const cookieOption = {
      httpOnly : true,
      secure:true,
      sameSite : "None"
    }
    res.cookie("accessToken", accessToken,cookieOption)
   res.cookie("refreshToken", refreshToken,cookieOption)

    return res.status(200).json({
      message : "Login successful",
      success : true,
      error : false,
      data : {
        accessToken,
        refreshToken
      }
    })

  } catch (error) {
    return res.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })

  }
}

//logout controller

export async function logoutController(req,res){
    try {
        const userid = req.userId //middleware

        const cookiesOption = {
            httpOnly : true,
            secure : true,
            sameSite : "None"
        }

        res.clearCookie("accessToken",cookiesOption)
        res.clearCookie("refreshToken",cookiesOption)

        const removeRefreshToken = await UserModel.findByIdAndUpdate(userid,{
            refresh_token : ""
        })

        return res.json({
            message : "Logout successfully",
            error : false,
            success : true
        })
    } catch (error) {
        return res.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

//upload user avtar controller
export async function uploadUserAvatarController(req,res){
  try {
    const userId = req.userId; //auth middleware
    const image = req.file; //multer middleware

    const upload = await uploadImageCoudinary(image);

    const updateUser = await UserModel.findByIdAndUpdate(userId,{
      avatar : upload.url
    });
  
    return res.status(200).json({
      message : "Image uploaded successfully",
      error : false,
      success : true,
      data : {
        _id :userId,
        avatar : upload.url
        
      }
    })
    
  } catch (error) {
    return res.status(500).json({
      message : error.message || error,
      error : true,
      success : false
  })
    
  }
}

//update user details controller
export async function updateUserDetailsController(req,res){
  try {
    const userId = req.userId //auth middleware
            const { name, email, mobile, password } = req.body 
    
            let hashPassword = ""
    
            if(password){
                const salt = await bcrypt.genSalt(10)
                hashPassword = await bcrypt.hash(password,salt)
            }
    
            const updateUser = await UserModel.updateOne({ _id : userId},{
                ...(name && { name : name }),
                ...(email && { email : email }),
                ...(mobile && { mobile : mobile }),
                ...(password && { password : hashPassword })
            })
    
            return res.json({
                message : "Updated successfully",
                error : false,
                success : true,
                data : updateUser
            })
    
    
    
  } catch (error) {
    return res.status(500).json({
      message : error.message || error,
      error : true,
      success : false
  })
    
  }
}


//forgot password not login
export async function forgotPasswordController(req,res) {
    try {
        const { email } = req.body 

        const user = await UserModel.findOne({ email })

        if(!user){
            return res.status(400).json({
                message : "Email not available",
                error : true,
                success : false
            })
        }

        const otp = generatedOtp()
        const expireTime = new Date() + 60 * 60 * 1000 // 1hr

        const update = await UserModel.findByIdAndUpdate(user._id,{
            forgot_password_otp : otp,
            forgot_password_expiry : new Date(expireTime).toISOString()
        })

        await sendEmail({
            sendTo : email,
            subject : "Forgot password from Bestsell",
            html : forgotPasswordTemplate({
                name : user.name,
                otp : otp
            })
        })

        return res.json({
            message : "check your email",
            error : false,
            success : true
        })

    } catch (error) {
        return res.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}
 
//verify forgot password otp
export async function verifyForgotPasswordOtp(req,res){
    try {
        const { email , otp }  = req.body

        if(!email || !otp){
            return res.status(400).json({
                message : "Provide required field email, otp.",
                error : true,
                success : false
            })
        }

        const user = await UserModel.findOne({ email })

        if(!user){
            return res.status(400).json({
                message : "Email not available",
                error : true,
                success : false
            })
        }

        const currentTime = new Date().toISOString()

        if(user.forgot_password_expiry < currentTime  ){
            return res.status(400).json({
                message : "Otp is expired",
                error : true,
                success : false
            })
        }

        if(otp !== user.forgot_password_otp){
            return res.status(400).json({
                message : "Invalid otp",
                error : true,
                success : false
            })
        }

        //if otp is not expired
        //otp === user.forgot_password_otp

        const updateUser = await UserModel.findByIdAndUpdate(user?._id,{
            forgot_password_otp : "",
            forgot_password_expiry : ""
        })
        
        return res.json({
            message : "Verify otp successfully",
            error : false,
            success : true
        })

    } catch (error) {
        return res.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

//reset the password
export async function resetpassword(req,res){
    try {
        const { email , newPassword, confirmPassword } = req.body 

        if(!email || !newPassword || !confirmPassword){
            return res.status(400).json({
                message : "provide required fields email, newPassword, confirmPassword"
            })
        }

        const user = await UserModel.findOne({ email })

        if(!user){
            return res.status(400).json({
                message : "Email is not available",
                error : true,
                success : false
            })
        }

        if(newPassword !== confirmPassword){
            return res.status(400).json({
                message : "newPassword and confirmPassword must be same.",
                error : true,
                success : false,
            })
        }

        const salt = await bcrypt.genSalt(10)
        const hashPassword = await bcrypt.hash(newPassword,salt)

        const update = await UserModel.findOneAndUpdate(user._id,{
            password : hashPassword
        })

        return res.json({
            message : "Password updated successfully.",
            error : false,
            success : true
        })

    } catch (error) {
        return res.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

//refresh token controler
export async function refreshToken(req,res){
    try {
        const refreshToken = req.cookies.refreshToken || req?.headers?.authorization?.split(" ")[1]  /// [ Bearer token]
        

        if(!refreshToken){
            return res.status(401).json({
                message : "Invalid token",
                error  : true,
                success : false
            })
        }

        const verifyToken = await jwt.verify(refreshToken,process.env.SECRET_KEY_REFRESH_TOKEN)

        if(!verifyToken){
            return res.status(401).json({
                message : "token is expired",
                error : true,
                success : false
            })
        }

        const userId = verifyToken?._id

        const newAccessToken = await generatedAccessToken(userId)

        const cookiesOption = {
            httpOnly : true,
            secure : true,
            sameSite : "None"
        }

        res.cookie('accessToken',newAccessToken,cookiesOption)

        return res.json({
            message : "New Access token generated",
            error : false,
            success : true,
            data : {
                accessToken : newAccessToken
            }
        })


    } catch (error) {
        return res.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

//get login user datails

export async function userDetails(req,res){
    try {
        const userId  = req.userId

        

        const user = await UserModel.findById(userId).select('-password -refresh_token')

        return res.json({
            message : 'user details',
            data : user,
            error : false,
            success : true
        })
    } catch (error) {
        return res.status(500).json({
            message : "Something is wrong",
            error : true,
            success : false
        })
    }
}