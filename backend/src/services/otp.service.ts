import mailService from "./mail.service.js";

export const sendLoginOtp = async (email: string) => {
  await mailService.sendOtp(email);
};

export const verifyLoginOtp = async (email: string, otp: string) => {
  return await mailService.verifyOtp(email, otp);
};
