const { execSync } = require("child_process")

const arg = process.argv[2]
if (!arg) throw new Error(`Pass the name for migration`)
const command = `typeorm-ts-node-esm migration:generate ./src/db/typeorm/migrations/${arg} -d ./src/db/typeorm/typeorm.config.ts`

execSync(command, { stdio: `inherit` })