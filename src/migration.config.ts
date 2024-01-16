import {DataSource} from "typeorm";
import {getConfig} from "./data-source";

const datasource = new DataSource(getConfig()); // config is one that is defined in datasource.config.ts file
console.log(process.env.DB_USER);
datasource.initialize();
export default datasource;
