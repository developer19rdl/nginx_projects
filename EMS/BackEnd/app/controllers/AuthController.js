const { connection, CustomError } = require('../config/dbSql2');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

//below Vaishak code 






// exports.login = async (req, res) => {
//     try {
//         const { email: userName, password } = req.body;

//         const fetchQuery = `SELECT * FROM user WHERE userName = ?`;



//         const [userRows] = await connection.query(fetchQuery, [userName]);

//         if (userRows.length > 0) {
//             const bcryptResult = await bcrypt.compare(password, userRows[0].password);

//             if (bcryptResult) {




//                 const accessToken = jwt.sign({ username: userName }, process.env.APP_SECRET_KEY, { expiresIn: process.env.SECRET_KEY_EXP });
//                 const refreshToken = jwt.sign({ username: userName }, process.env.APP_REFRESH_KEY, { expiresIn: process.env.REFRESH_KEY_EXP });

//                 return res.status(200).json({
//                     success: true,
//                     userDetails: userDetails,
//                     accessToken: accessToken,
//                     refreshToken: refreshToken
//                 });
//             }

//         } else {
//             return res.status(400).json({ success: false, message: "User Name is not valid!" });
//         }
//     } catch (error) {
//         return res.status(500).json({ success: false, message: 'Internal server error!', error: error.message });
//     }
// };
exports.login = async (req, res) => {
    try {
        const { email: userName, password } = req.body;

        const fetchQuery = `SELECT * FROM user WHERE userName = ?`;

        const [userRows] = await connection.query(fetchQuery, [userName]);

        if (userRows.length > 0) {
            const bcryptResult = await bcrypt.compare(password, userRows[0].password);

            if (bcryptResult) {
                const userDetails = {
                    id: userRows[0].id,
                    userId: userRows[0].userId,
                    name: userRows[0].name,
                    email: userRows[0].email,
                    phoneNo: userRows[0].phoneNo,
                    department: userRows[0].department,
                    companyName: userRows[0].companyName,
                    userRole: userRows[0].userRole,
                    // rights: userRows[0].rights,
                    // groupRights: rolRows // Include role details if needed
                };

                const accessToken = jwt.sign({ username: userName, userId: userRows[0].id }, process.env.APP_SECRET_KEY, { expiresIn: process.env.SECRET_KEY_EXP });
                const refreshToken = jwt.sign({ username: userName, userId: userRows[0].id }, process.env.APP_REFRESH_KEY, { expiresIn: process.env.REFRESH_KEY_EXP });

                return res.status(200).json({
                    success: true,
                    userDetails: userDetails,
                    accessToken: accessToken,
                    refreshToken: refreshToken
                });
            }

        } else {
            return res.status(400).json({ success: false, message: "User Name is not valid!" });
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Internal server error!', error: error.message });
    }
};

exports.refreshToken = (req, res) => {
    const refreshToken = req.body.refreshToken;
    if (!refreshToken) return res.status(400).json({ message: "Please send refresh token!" });

    // Validate the refresh token (verify signature, expiration, etc.)
    jwt.verify(refreshToken, process.env.APP_REFRESH_KEY, (err, decoded) => {
        if (err) return res.status(401).json({ success: false, message: 'Invalid refresh token' });

        const accessToken = jwt.sign(
            { username: decoded.username, userId: decoded.userId },
            process.env.APP_SECRET_KEY,
            { expiresIn: process.env.SECRET_KEY_EXP }
        );

        return res.status(200).json({
            success: true,
            userEmail: decoded.username,
            accessToken: accessToken
        });
    });
};
