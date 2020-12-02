// const AdminBro = require('admin-bro')
// const AdminBroExpress = require('@admin-bro/express')
// const AdminBroMongoose = require('@admin-bro/mongoose')

// const mongoose = require('mongoose')

// AdminBro.registerAdapter(AdminBroMongoose)

// const adminBro = new AdminBro({
//   databases: [mongoose],
//   rootPath: '/admin',
// })

// const ADMIN = {
//     email: "admin@4shopping.com",
//     password: "qaz123"
// }


// const router = AdminBroExpress.buildAuthenticatedRouter(adminBro, {
//     cookieName: process.env.ADMIN_COOKIE_NAME || 'admin-bro',
//     cookiePassword: process.env.ADMIN_COOKIE_PASS || 'secret-and-very-very-long-password-that-no-one-knows',
//     authenticate: async (email, password) => {
//         if(email === ADMIN.email && password === ADMIN.password) {
//             return ADMIN
//         }
//         return null
//     }
// })

// module.exports = router