import '../dotenv';
import { Commander } from 'console-commander';
import { database } from './database';
import { Download } from './commands/Download';

const commander = new Commander();

commander.registration(Download);
commander.start().finally(() => {
	database.close();
});
