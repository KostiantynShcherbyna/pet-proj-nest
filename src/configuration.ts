
export const configuration = () => {
    return {
        PORT: Number(process.env.PORT) || 5000,
        MONGOOSE_URI: process.env.MONGOOSE_URI || "mongodb+srv://kostyalys:bagrat10n@cluster0.7mo0iox.mongodb.net/BE-2-0-DEV?retryWrites=true&w=majority",

        ACCESS_JWT_SECRET: process.env.ACCESS_JWT_SECRET || "ACCESSJWTSECRET",
        REFRESH_JWT_SECRET: process.env.REFRESH_JWT_SECRET || "REFRESHJWTSECRET",
        PASSWORD_RECOVERY_CODE_SECRET: process.env.PASSWORD_RECOVERY_CODE_SECRET || "PASSWORDRECOVERYCODESECRET",
    }
}
export type ConfigType = ReturnType<typeof configuration>
// type ConfigurationConfigType = ReturnType<typeof configuration>
// export type ConfigType = ConfigurationConfigType & {
//     PORT: string
//     MONGOOSE_URI: string

//     ACCESS_JWT_SECRET: string
//     REFRESH_JWT_SECRET: string
//     PASSWORD_RECOVERY_CODE_SECRET: string
// }