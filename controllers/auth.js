const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const database = "UserManagement";
const tableName = 'users';
const mysqlConnection = require("../connection");

exports.register = (req,res) => {
    console.log('@@');
    console.log(req.body);
    const { name, email, password, passwordConfirm, gender, phone, birthday } = req.body;

    console.log('gender:: ', gender);
    console.log('phone:: ', phone);
    console.log('birthday:: ', birthday);

    if(new Date(birthday) > new Date()) {
        return res.render('register',{
            message: 'Birth date can not be more than todays date.'
        })
    }

    const checkEamilQuery = `Select email from ${database}.${tableName} where email = '${email}';`;
    mysqlConnection.query(checkEamilQuery, async(error, result) => {
        if(error) {
            console.log(error);
        }
        if (result && result.length > 0) {
            return res.render('register', {
                message: 'This email is already in use'
            })
        } else if(password !== passwordConfirm){
            return res.render('register', {
                message: 'Passwords do not match'
            })
        }

        let hashPassword = await bcrypt.hash(password, 8);
        console.log(hashPassword);

        const sqlQuery = `Insert into ${database}.${tableName} (name, email, password) values ('${name}', '${email}', '${hashPassword}');`

        mysqlConnection.query(sqlQuery,async(err, result) => {
            if(err) {
                console.log(err);
            }
            else{
                console.log(result);
                mysqlConnection.query(checkEamilQuery,async(er, re) => {
                    if(er) {
                        console.log(error);
                    }
                    if (re && re.length > 0) {
                        const id = re[0].id;
                        const token = await jwt.sign({ id }, process.env.JWT_SECRET, {
                            expiresIn: process.env.JWT_EXPIRES_IN
                        });
                        console.log('token:: ', token);

                        const cookieOptions = {
                            expires: new Date(
                                Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
                            ),
                            httpOnly: true
                        };

                        res.cookie('jwt', token, cookieOptions);
                        res.status(200).render('index');
                    }
                });
            }
        });
    });
};

exports.login = async(req,res) => {
    try {
        const { email, password } = req.body;
        if(!email || !password) {
            return res.status(400).render('login', {
                message: 'Please provide email and password!'
            })
        }

        const sqlQuery = `Select * from ${database}.${tableName} where email = '${email}';`;
        mysqlConnection.query(sqlQuery, async(error, result) => {
            if(!result || !(await bcrypt.compare(password, result[0].password))) {
                res.status(401).render('login', {
                    message: 'Email or Password is incorrect'
                });
            } else{
                const id = result[0].id;
                const token = jwt.sign({ id }, process.env.JWT_SECRET, {
                    expiresIn: process.env.JWT_EXPIRES_IN
                });
                console.log('token:: ', token);

                const cookieOptions = {
                    expires: new Date(
                        Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
                    ),
                    httpOnly: true
                };

                res.cookie('jwt', token, cookieOptions);
                res.status(200).render('index');
            }
        });
    } catch (error) {
        console.log('login::error:: ', error);
    }
};

exports.logout = async(req,res) => {
    try {
        const token = req.cookies.jwt;
        const verifiedUser = jwt.verify(token, process.env.JWT_SECRET);
        res.clearCookie("jwt");
        res.status(200).render('home');
    } catch (error) {
        console.log('logout::error:: ', error);
        res.status(400).render('index', {
            message: error
        })
    }
};