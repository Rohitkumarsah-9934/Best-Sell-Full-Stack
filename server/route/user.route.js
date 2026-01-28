import {Router} from "express";
import { forgotPasswordController, loginUserController, logoutController, refreshToken, registerUserController, resetpassword, updateUserDetailsController, uploadUserAvatarController, userDetails, verifyEmailController, verifyForgotPasswordOtp } from "../controllers/User.controller.js";
import auth from "../middleware/auth.js";
import upload from "../middleware/multer.js";


const userRouter = Router();

userRouter.post("/register" , registerUserController);
userRouter.post("/verify-email" , verifyEmailController);
userRouter.post("/login" , loginUserController);
userRouter.get("/logout",auth ,logoutController)
userRouter.put("/upload-avtar" , auth , upload.single("avatar"),uploadUserAvatarController)
userRouter.put("/update-user",auth , updateUserDetailsController)
userRouter.put("/forgot-password", forgotPasswordController)
userRouter.put("/verify-forgot-password-otp", verifyForgotPasswordOtp)
userRouter.put("/reset-password",  resetpassword)
userRouter.post("/refresh-token",refreshToken)
userRouter.get("/user-details" , auth,userDetails)
export default userRouter;