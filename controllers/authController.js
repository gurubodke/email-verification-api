const db = require("../config/db");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const sendEmail = require("../services/emailService");
// const emailQueue = require("../queues/emailQueue");

/*
===========================
REGISTER USER
===========================
*/
exports.register = async (req, res) => {

  try {

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    // check if email already exists
    db.query(
      "SELECT id FROM users WHERE email = ?",
      [email],
      async (err, results) => {

        if (err) {
          return res.status(500).json({ error: err.message });
        }

        if (results.length > 0) {
          return res.status(409).json({
            message: "Email already registered"
          });
        }

        // hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // generate verification token
        const token = uuidv4();

        // token expiry 24 hours
        const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

        const query = `
        INSERT INTO users
        (name,email,password,verification_token,token_expiry,is_verified)
        VALUES (?,?,?,?,?,0)
        `;

        db.query(
          query,
          [name, email, hashedPassword, token, expiry],
          async (err) => {

            if (err) {
              return res.status(500).json({ error: err.message });
            }

            // send verification email
            await sendEmail(email, token);  //Send Email Immediately

            // await emailQueue.add("sendVerificationEmail", {
            //   email,
            //   token
            // });

            res.status(201).json({
              message: "User registered successfully. Please verify your email."
            });

          }
        );

      }
    );

  } catch (error) {

    res.status(500).json({
      error: error.message
    });

  }

};


/*
===========================
EMAIL VERIFICATION
===========================
*/
exports.verifyEmail = (req, res) => {

  const { token } = req.query;

  if (!token) {
    return res.status(400).json({
      message: "Token is required"
    });
  }

  const query = `
    SELECT * FROM users
    WHERE verification_token = ?
    AND token_expiry > NOW()
  `;

  db.query(query, [token], (err, results) => {

    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (results.length === 0) {
      return res.status(400).json({
        message: "Invalid or expired verification token"
      });
    }

    const userId = results[0].id;

    db.query(
      `UPDATE users 
       SET is_verified = 1,
           verification_token = NULL,
           token_expiry = NULL
       WHERE id = ?`,
      [userId],
      (err) => {

        if (err) {
          return res.status(500).json({ error: err.message });
        }

        res.json({
          message: "Email verified successfully. You can now login."
        });

      }
    );

  });

};


/*
===========================
LOGIN USER
===========================
*/
exports.login = (req, res) => {

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "Email and password are required"
    });
  }

  db.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (err, results) => {

      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (results.length === 0) {
        return res.status(404).json({
          message: "User not found"
        });
      }

      const user = results[0];

      // check email verified
      if (!user.is_verified) {
        return res.status(403).json({
          message: "Please verify your email before logging in"
        });
      }

      // compare password
      const passwordMatch = await bcrypt.compare(
        password,
        user.password
      );

      if (!passwordMatch) {
        return res.status(401).json({
          message: "Invalid password"
        });
      }

      res.json({
        message: "Login successful",
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        }
      });

    }
  );

};

/*
===========================
Resend Verification 
===========================
*/
exports.resendVerification = (req, res) => {

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      message: "Email is required"
    });
  }

  db.query(
    "SELECT * FROM users WHERE email=?",
    [email],
    async (err, results) => {

      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (results.length === 0) {
        return res.status(404).json({
          message: "User not found"
        });
      }

      const user = results[0];

      if (user.is_verified) {
        return res.status(400).json({
          message: "Email already verified"
        });
      }

      const token = uuidv4();
      const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

      db.query(
        `UPDATE users 
         SET verification_token=?, token_expiry=? 
         WHERE id=?`,
        [token, expiry, user.id],
        async (err) => {

          if (err) {
            return res.status(500).json({ error: err.message });
          }

          await sendEmail(email, token);  //Send Email Immediately
          // await emailQueue.add("sendVerificationEmail", {
          //   email,
          //   token
          // });

          res.json({
            message: "Verification email resent"
          });

        }
      );

    }
  );

};

/*
===========================
Email Verification Status Endpoint
===========================
*/

exports.checkVerificationStatus = (req, res) => {

  const { email } = req.query;

  if (!email) {
    return res.status(400).json({
      message: "Email is required"
    });
  }

  db.query(
    "SELECT is_verified FROM users WHERE email=?",
    [email],
    (err, results) => {

      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (results.length === 0) {
        return res.status(404).json({
          message: "User not found"
        });
      }

      res.json({
        email,
        verified: results[0].is_verified === 1
      });

    }
  );

};