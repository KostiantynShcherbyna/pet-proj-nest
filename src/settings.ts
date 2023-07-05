export const settings = {
    PORT: process.env.PORT || 3000,
    MONGOOSE_URI: process.env.MONGOOSE_URL || 'mongodb://0.0.0.0:27017',

    ACCESS_JWT_SECRET: process.env.JWT_SECRET || "ACCESSJWTSECRET",
    REFRESH_JWT_SECRET: process.env.JWT_SECRET || "REFRESHJWTSECRET",
    PASSWORD_RECOVERY_CODE: process.env.PASSWORD_RECOVERY_CODE || "PASSWORDRECOVERYCODE",
}