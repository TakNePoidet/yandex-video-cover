import { createConnection, Connection, MysqlError } from 'mysql';

export interface ConfigDatabase {
	host: string;
	port: number;
	user: string;
	password: string;
	database: string;
}

export interface InsertIntroResponse {
	fieldCount: number,
	affectedRows: number,
	insertId: number,
	serverStatus: number,
	warningCount: number,
	message: string,
	protocol41: boolean,
	changedRows: number;
}
export default class DataBaseConstructor {
	private connection: Connection;

	private interval: ReturnType<typeof setTimeout>;

	constructor(config: ConfigDatabase) {
		this.connection = createConnection({
			...config,
			...{
				dateStrings: true
			}
		});
		this.interval = setInterval(() => {
			this.query('SELECT 1');
		}, 5000);
	}

	query<T>(sql: string, args: any | null = null): Promise<T> {
		return new Promise((resolve, reject) => {
			this.connection.query(sql, args, (err: MysqlError | null, rows: T) => {
				if (err) { reject(err); }
				resolve(rows);
			});
		});
	}

	close(): Promise<void> {
		return new Promise((resolve, reject) => {
			clearInterval(this.interval);
			this.connection.end(err => {
				if (err) { reject(err); }
				resolve();
			});
		});
	}

	get beginTransaction(): Connection['beginTransaction'] {
		return this.connection.beginTransaction;
	}

	rollback(): Promise<void> {
		return new Promise((resolve, reject) => {
			this.connection.rollback((err) => {
				if (err) {
					reject();
				}
				resolve();
			});
		});
	}

	commit(): Promise<void> {
		return new Promise((resolve, reject) => {
			this.connection.commit((err) => {
				if (err) {
					this.connection.rollback(() => {
						reject();
					});
				}
				resolve();
			});
		});
	}
}
