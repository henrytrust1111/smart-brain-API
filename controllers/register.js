const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Function to generate a random 6-digit OTP
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// Function to send email using Nodemailer
const sendOTPEmail = (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: 'noreply@yourapp.com',
    to: email,
    subject: 'Verify your email',
    html: `
      <h3>Your OTP for verification is:</h3>
      <h2 style="color: blue;">${otp}</h2>
      <p>It is valid for the next 10 minutes. Please do not share it with anyone.</p>
    `,
  };

  return transporter.sendMail(mailOptions);
};

const handleRegister = (req, res, db, bcrypt) => {
  const { email, name, password } = req.body;
  if (!email || !name || !password) {
    return res.status(400).json('incorrect form submission');
  }

  const hash = bcrypt.hashSync(password);
  const otp = generateOTP(); // Generate OTP
  const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // OTP expires in 10 minutes

  db.transaction(trx => {
    trx.insert({
      hash: hash,
      email: email
    })
    .into('login')
    .returning('email')
    .then(loginEmail => {
      return trx('users')
        .returning('*')
        .insert({
          email: loginEmail[0].email,
          name: name,
          joined: new Date(),
          isverified: false, // Add a field to mark email verification status
          otp: otp, // Store OTP
          otpexpiresat: otpExpiresAt // Store OTP expiration time
        })
        .then(user => {
          // Send OTP via email
          sendOTPEmail(email, otp)
            .then(() => {
              res.status(201).json({ message: 'User registered! OTP sent to email.' });
            })
            .catch(err => {
              res.status(500).json({ message: `Error sending OTP email. ${err}` });
            });
        });
    })
    .then(trx.commit)
    .catch(trx.rollback);
  })
  .catch(error => res.status(400).json(`unable to register ${error}`));
};

module.exports = {
  handleRegister: handleRegister
};







// const handleRegister = (req, res, db, bcrypt) => {
//     const { email, name, password } = req.body;
//     if(!email || !name || !password){
//       return res.status(400).json('incorrect form submission')
//     }
//     var hash = bcrypt.hashSync(password);
//     db.transaction(trx => {
//       trx.insert({
//         hash: hash,
//         email : email
//       })
//       .into('login')
//       .returning('email')
//       .then(loginEmail => {
//         return trx('users')
//         .returning('*')
//         .insert({
//           email: loginEmail[0].email,
//           name: name,
//           joined: new Date()
//         })
//         .then(user => {
//           res.json(user[0]);
//         })
//       })
//       .then(trx.commit)
//       .catch(trx.rollback)
//     })
//     .catch(error => res.status(400).json('unable to register'))
//   };

//   module.exports = {
//     handleRegister: handleRegister
//   }