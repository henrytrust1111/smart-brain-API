const handleSignin = (db, bcrypt) => (req, res) => {
    const { email, password } = req.body;
    if(!email || !password){
      return res.status(400).json('incorrect form submission')
    }
    db.select('email', 'hash').from('login')
    .where('email', '=', email)
    .then(data => {
      const isvalid = bcrypt.compareSync(password, data[0].hash); // true
      if(isvalid){
       return db.select('*').from('users')
        .where('email', '=', email)
        .then(user =>{
          res.json(user[0])
        })
        .catch(error => {
          res.status(400).json('unable to get user')
        })
      } else {
        res.status(400).json('wrong credentials')
      }
    })
    .catch(error => {
      res.status(400).json('wrong credentials')
    })
  }

  module.exports = {
    handleSignin: handleSignin
  }