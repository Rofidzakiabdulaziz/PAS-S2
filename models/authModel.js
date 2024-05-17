const connection = require('../config/connection')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// register

async function registerUser(name, email, password, phone) {
  try {
    // cek apakah email ini sudah terdaftar / belum?
    const [existingEmailUser] = await connection.query('select * from user where email =?', [email]);
    if (existingEmailUser.length > 0) throw new Error('Email already exists');
    // cek apakah password yang dimasukkan benar?
    const hashedPassword = await bcrypt.hash(password, 16);
    // kalau tidak ada maka kita boleh buat email tersebut.
    const [newUser] = await connection.query(
      'insert into user (name, email, password, phone) values (?, ? , ? , ?)', [name, email, hashedPassword, phone]);

    const [createdUser] = await connection.query('SELECT * FROM user WHERE id = ?', [newUser.insertId]);

    return {
      success: true,
      message: 'User has been created',
      data: createdUser[0]
    }
  }
  catch (error) {
    throw new Error(error);
  }
}


// login

async function loginUser(email, password) {
  try {
    // Cek apakah email ini sudah terdaftar atau belum
    const [existingEmailUser] = await connection.query('SELECT * FROM user WHERE email = ?', [email]);
    if (existingEmailUser.length === 0) {
      throw new Error('Email does not exist');
    }

    const user = existingEmailUser[0];

    // Periksa apakah password yang dimasukkan benar
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Jika email dan password cocok, buat token JWT
    const token = jwt.sign({ id: user.id }, 'bazmaSecretKey', {
      expiresIn: '7h'
    });

    // Kembalikan informasi user dan token
    // await connection.query('UPDATE user SET token = ? WHERE id = ?', [token, user.id]);

    return {
      success: true,
      message: 'User has been logged in',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone
      },
      token
    };
  } catch (error) {
    console.error(error);
    throw new Error('Login failed');
  }
}

// get me dengan jwt

async function getMe(token) {
  try {
    const decoded = jwt.verify(token, 'bazmaSecretKey');
    const [checkUser] = await connection.query('select * from user where id =?', [decoded.id]);

    const user = checkUser[0];
    return {
      success: true,
      message: 'User data fetched successfully',
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone
      }
    }
  }
  catch (error) {
    throw new Error(error);
  }
}

// logout

async function logoutUser(token) {
  try {
    const decoded = jwt.verify(token, 'bazmaSecretKey');
    jwt.sign({ id: decoded.id }, 'bazmaSecretKey', {
      expiresIn: '7h'
    });

    return { success: true, message: 'Logout successful' };

  }
  catch (error) {
    throw new Error(error);
  }
}

module.exports = { registerUser, loginUser, getMe, logoutUser }