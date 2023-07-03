export const settings = {
    MONGO_URI: process.env.MONGO_URL || 'mongodb://0.0.0.0:27017',
    ACCESS_JWT_SECRET: process.env.JWT_SECRET || "ACCESSJWTSECRET",
    REFRESH_JWT_SECRET: process.env.JWT_SECRET || "REFRESHJWTSECRET",
    PASSWORD_RECOVERY_CODE: process.env.PASSWORD_RECOVERY_CODE || "PASSWORDRECOVERYCODE",
    // MAIL_PASS: "jwaxprnjtbtweljn"
    // SECRET_KEY: process.env.SECRET_KEY || "YOURSECRETKEYGOESHERE"
}