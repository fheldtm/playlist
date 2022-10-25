const express = require('express');
const app = express();

const axios = require('axios');

const path = require('path');
const fs = require('fs');
const getPlaylistInfo = () => 
	JSON.stringify(
		JSON.parse(
			fs.readFileSync(
				path.join(__dirname, 'public', 'datas', 'playlist.json'),
				'utf-8'
			)
		)
	)
const updatePlaylistInfo = (obj) => {
	fs.writeFileSync(
		path.join(__dirname, 'public', 'datas', 'playlist.json'),
		JSON.stringify(obj),
		'utf-8'
	)
}

const helmet = require('helmet')
app.use(helmet.hidePoweredBy())

app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.set('view engine', 'ejs');
app.engine('ejs', require('ejs').renderFile)

app.use(express.static('views'))
app.set('views', './views');

app.use(express.static('public'))

app.get('/', (req, res) => {
	const json = getPlaylistInfo()
	res.status(200).render('index', {
		json: json
	})
});

app.post('/api/youtube', async (req, res) => {
	try {
		const body = req.body;
		const link = body.link;
		const youtubeId = link.split('youtu.be/')[1];

		const youtubeApiKey = 'AIzaSyAx8MxO6CDNr1BH_ic1XjPAv5FzvpMSXmw';
		let youtubeApiURL = 'https://www.googleapis.com/youtube/v3/videos?'
		youtubeApiURL += `part=snippet`
		youtubeApiURL += `&id=${youtubeId}`
		youtubeApiURL += `&key=${youtubeApiKey}`

		const { data } = await axios.get(youtubeApiURL, { method: 'GET' })
		if (data.items.length === 0) {
			res.status(200).json({ name: '', channel: '', link: '' })
		}

		const { title, channelTitle } = data.items[0].snippet;
		const id = data.items[0].id;

		const json = getPlaylistInfo();
		const obj = JSON.parse(json);

		const isedolIdx = obj.playlist.findIndex(l => l.playlistName === 'Isedol');

		obj.playlist[isedolIdx].youtubeList.push({
			name: title,
			link: id,
			channel: channelTitle,
		})
		updatePlaylistInfo(obj)

		res.status(200).json({ name: title, channel: channelTitle, link: id })
	} catch(err) {
		console.error(err);
		res.status(200).json({ name: '', channel: '', link: '' })
	}
})

const port = 5678;
app.listen(port, () => {
	console.log(`SERVER ON!! http://localhost:${port}`);
})