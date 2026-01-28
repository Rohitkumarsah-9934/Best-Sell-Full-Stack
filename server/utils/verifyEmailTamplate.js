const verifyEmailTemplate = ({name, url}) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
      <h2>Welcome to BestSell, ${name}!</h2>
      <p>Thank you for signing up. Please verify your email by clicking the button below:</p>
      <a href="${url}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Verify Email</a>
      <p>If you didn't sign up for BestSell, please ignore this email.</p>
    </div>
  `;
};
export default verifyEmailTemplate;