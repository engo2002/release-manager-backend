import { readFileSync } from "fs";
import { join } from "path";

const packageJsonPath = join(process.cwd(), "package.json");
const packageJsonContent = readFileSync(packageJsonPath, "utf8");
const packageJson = JSON.parse(packageJsonContent);
const version = packageJson.version;

export { version };
