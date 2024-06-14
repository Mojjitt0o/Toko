const { User } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const secretKey = process.env.JWT_SECRET_KEY;

// Konfigurasi transporter Nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS 
    }
});

const baseUrl = process.env.BASE_URL

const userRegister = async (req, res) => {
    const { name, password, email, is_admin, address } = req.body;

    // Validasi input
    if (!email || !password || !name) {
        return res.status(400).send({
            message: "Silakan isikan Email, Password, dan Nama Lengkap"
        });
    }

    try {
        // Periksa apakah email sudah digunakan
        const existingEmail = await User.findOne({ where: { email } });
        if (existingEmail) {
            return res.status(400).send({
                message: "Email telah digunakan"
            });
        }

        // Hash password dan buat token verifikasi
        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationToken = jwt.sign({ email }, secretKey, { expiresIn: '1h' });

        // Buat pengguna baru
        const user = await User.create({
            name,
            email,
            is_admin,
            address,
            password: hashedPassword,
            is_verified: false,
            verification_token: verificationToken
        });

        // Kirim email verifikasi
        const verificationLink = `${baseUrl}/verify-email?token=${verificationToken}`;
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Email Verification',
            html: `<p>Hi ${name},</p><p>Please verify your email by clicking on the following link: <a href="${verificationLink}">${verificationLink}</a></p>`
        };

        if (process.env.NODE_ENV !== 'test') {
            await transporter.sendMail(mailOptions);
        } 
        
        // Kembalikan respons sukses
        return res.status(201).send({
            message: "Pengguna berhasil didaftarkan. Silakan verifikasi email Anda."
        });


    } catch (error) {
        console.error(error);

        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).send({
                message: "Email telah digunakan"
            });
        }
        return res.status(500).send({
            message: "Terjadi kesalahan saat mendaftarkan pengguna"
        });
    }
};



const verifyEmail = async (req, res) => {
    const { token } = req.query;

    try {
        if (!token) {
            return res.status(400).send({ message: "Token tidak disediakan." });
        }

        const payload = jwt.verify(token, secretKey);
        const user = await User.findOne({ where: { email: payload.email, verification_token: token } });

        if (!user) {
            return res.status(400).send({ message: "Token verifikasi tidak valid." });
        }

        user.is_verified = true;
        user.verification_token = null; // Menghapus token setelah diverifikasi
        await user.save();

        return res.redirect('http://localhost:3000/verification-success');

    } catch (error) {
        console.error("Error saat verifikasi email:", error);
        if(error.name === 'TokenExpiredError') {
            return res.status(400).send({
                message: "Token verifikasi telah kadaluarsa."
            });
        };
        return res.status(500).send({ message: "Gagal verifikasi token." });
    }
};



const getUsers = async (req, res) => {
    try {
        const users = await User.findAll();
        return res.status(200).json({
            success: true,
            data: users
        });
    } catch (error) {
        console.error("Error saat mengambil data pengguna", error)
        return res.status(500).json({ 
            message: error.message 
        });
    }
};



const userLogin = async (req, res) => {
    const { email, password } = req.body;
    
    // Jika Email dan Password kosong
    if (!email || !password) {
        return res.status(400).send({
            message: "Silakan isikan Email & Password"
        });
    }
    
    try {
        // Cari User di Database pakai Param Email
        const user = await User.findOne({ where: { email } });
        
        // Jika Email tidak ada di database
        if (!user) {
            return res.status(401).send({
                message: "Email tidak ditemukan"
            });
        }

        // Jika Email belum diverifikasi
        else if (!user.is_verified) {
            return res.status(401).send({
                message: "Email belum diverifikasi. Silakan cek email Anda."
            });

        } else {
            const passwordMatch = await bcrypt.compare(password, user.password);

            // Login Berhasil
            if (passwordMatch) {
                const token = jwt.sign(
                    { id: user.id, name: user.name, email: user.email, is_admin: user.is_admin },
                    secretKey,
                    { expiresIn: '1h' }
                );
                return res.status(200).json({
                    message: "Login berhasil",
                    token
                });
            // Jika Password salah
            } else {
                return res.status(401).send({
                    message: "Kombinasi Email dan Password salah!"
                });
            }
        }

    } catch (error) {
        console.error("Error saat login:", error)
        return res.status(500).send({
            message: "Terjadi kesalahan"
        });
    }

};



const userUpdate = async (req, res) => {
    const { id } = req.user;
    const { name, address, email, oldPassword, newPassword } = req.body;

    try {
        // Temukan pengguna berdasarkan ID
        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).send({
                message: "Pengguna tidak ditemukan"
            });
        }
        
        // Periksa apakah oldPassword diberikan user?
        if (oldPassword == null || oldPassword == "") {
            return res.status(401).send({
                message: "Silakan masukkan Old Password"
            });
        }
        
        // Verifikasi Old Password
        const passwordMatch = await bcrypt.compare(oldPassword, user.password);
        if (!passwordMatch) {
            return res.status(401).send({
                message: "Old Password salah!"
            });
        }

        // Cek jika tidak ada perubahan
        if (
            (name === undefined || name === user.name) &&
            (email === undefined || email === user.email) &&
            (address === undefined || address === user.address) &&
            (!newPassword || await bcrypt.compare(newPassword, user.password))
        ) {
            return res.status(400).send({
                message: "Tidak ada perubahan."
            });
        }

        // Jika email baru sudah dipakai
        if (email && email !== user.email) {
            const existingEmail = await User.findOne({where: { email } })
            if(existingEmail) {
                return res/status(400).send({
                    message: "Email telah digunakan"
                });
            }
        }

        // Enkripsi newPassword jika diberikan
        let hashedNewPassword;
        if (newPassword) {
            hashedNewPassword = await bcrypt.hash(newPassword, 10);
        }
        
        // Update informasi pengguna
        user.name = name || user.name;
        user.email = email || user.email;
        user.address = address || user.address;
        if (hashedNewPassword) {
            user.password = hashedNewPassword;
        }
    
        // Simpan perubahan user ke database
        await user.save();
    
    
        return res.status(200).send({
            message: "Success"
        });

    } catch (error) {
        console.error("Error saat memperbarui pengguna: ", error);
        return res.status(500).send({
            message: "Terjadi kesalahan saat memperbarui pengguna"
        })        
    }

};



const userDelete = async (req, res) => {
    const { id } = req.user;
    const { password } = req.body;

    if(!password) {
        return res.status(400).send({
            message: "Silakan masukkan password"
        });
    }

    try {
        // Temukan pengguna berdasarkan ID
        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).send({ message: "Pengguna tidak ditemukan" });
        }
        
        // Cek password
        const passwordMatch = await bcrypt.compare(password, user.password);

        // Jika password salah
        if (!passwordMatch) {
            return res.status(401).send({ message: "Password yang Anda masukkan salah" });
        }

        // Hapus pengguna dari database
        await User.destroy({ where: { id } });
        return res.status(200).send({
            message: "User deleted"
        });

    } catch (error) {
        console.error("Error saat menghapus user:", error);
        return res.sendStatus(500);    
    }
};



const whoAmI = (req, res) => {
    // Kembalikan data user yang relevan
    const { name, email, is_admin } = req.user;
    return res.status(200).json({ name, email, is_admin });
};



module.exports = {
    userRegister,
    getUsers,
    userLogin,
    userUpdate,
    userDelete,
    verifyEmail,
    whoAmI
};
