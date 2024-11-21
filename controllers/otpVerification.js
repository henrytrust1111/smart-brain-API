const handleVerifyOTP = (req, res, db) => {
    const { email, otp } = req.body;
  
    db.select('*').from('users').where({ email })
      .then(user => {
        console.log(user[0].otpExpiresAt)
        if (user.length) {
          const currentTime = new Date();
          if (user[0].otp === otp && user[0].otpexpiresat > currentTime) {
            // OTP is valid and not expired, mark email as verified
            return db('users')
              .where({ email })
              .update({
                isverified: true, // Mark as verified
                otp: null, // Clear OTP
                otpexpiresat: null // Clear OTP expiry time
              })
              .then(() => {
                res.status(200).json({ message: 'Email verified successfully!' });
              })
              .catch(err => res.status(400).json(`unable to verify email ${err}`));
          } else {
            res.status(400).json('Invalid or expired OTP');
          }
        } else {
          res.status(400).json('User not found');
        }
      })
      .catch(err => res.status(400).json('error verifying OTP'));
  };
  
  module.exports = {
    handleVerifyOTP: handleVerifyOTP
  };
  