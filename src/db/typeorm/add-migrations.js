const { execSync } = require("child_process")

const arg = process.argv[2]
if (!arg) throw new Error(`Pass the name for migration`)
const command = `typeorm-ts-node-esm migration:generate ./src/db/orm/migrations/${arg} -d ./src/db/orm/data-source.ts`

execSync(command, { stdio: `inherit` })