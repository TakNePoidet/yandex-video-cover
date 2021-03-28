import express, { Request, Response } from 'express';
import axios from 'axios';
import { parse } from 'node-html-parser';
import '../dotenv';
import fs from 'fs';
import path from 'path';
import { getFolderImages } from '../libs/util';
import { DB_DATABASE, DB_HOST, DB_PASSWORD, DB_PORT, DB_USERNAME, SERVER_PORT } from '../constant';
import DataBaseConstructor, { InsertIntroResponse } from '../libs/DataBase';

const database = new DataBaseConstructor({
	host: DB_HOST,
	port: DB_PORT,
	user: DB_USERNAME,
	password: DB_PASSWORD,
	database: DB_DATABASE
});
const app = express();

app.get('/p/:id', async (request: Request, response: Response) => {
	const { id: hash } = request.params;

	if (/^[a-f0-9]{32}$/.exec(hash)) {
		try {
			const folder = getFolderImages(hash, 15);
			const filepath = `/storage/images${folder}/${hash}.jpg`;

			if (fs.existsSync(path.resolve(__dirname, `..${filepath}`))) {
				response.header('X-Accel-Redirect', filepath);
				response.send();
				return;
			}
			// eslint-disable-next-line max-len
			const rows = await database.query<Array<{ path: string; file: string; url: string; }>>('SELECT `images`.`path`,`images`.`file`,`images`.`url` FROM `video`  JOIN `images` ON `video`.`id` = `images`.video_id WHERE `video`.`hash` = ?', [hash]);

			if (rows.length > 0) {
				const [{ url }] = rows;

				response.redirect(url);
				return;
			}
			const urlYandexVideo = `https://frontend.vh.yandex.ru/player/${hash}/orig`;
			const { data: html } = await axios.get(urlYandexVideo, {
				headers: {
					'Content-Type': 'text/html'
				}
			});
			const root = parse(html);
			const mataImg = root.querySelector('link[rel="image_src"]');

			if (mataImg) {
				database.beginTransaction();
				const url = new URL(`https:${mataImg.getAttribute('href')}` ?? '/');
				const images = `${url.origin}${url.pathname}`;

				const { insertId: videoId } = await database.query<InsertIntroResponse>('INSERT INTO `video` (`hash`) VALUES (?)', [hash]);

				await database.query('INSERT INTO `images` (`video_id`, `url`) VALUES (?, ?)', [videoId, images]);
				database.commit();
				await database.query('INSERT INTO `queue` (`name`, `data`) VALUES (?, ?)', ['download', JSON.stringify({
					videoId, images
				})]);
				response.status(301).redirect(images);
			} else {
				response.status(503).json({
					response: 'error',
					error: 'Изображение не найдено'
				});
			}
		} catch (error) {
			database.rollback();
			response.status(503).json({
				response: 'error',
				error: error.message
			});
		}
	} else {
		response.status(503).json({
			response: 'error'
		});
	}
});
app.listen(SERVER_PORT, () => console.log('Open'));
