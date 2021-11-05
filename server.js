require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const ShortUrl = require('./models/shortUrl')
const app = express()

mongoose.connect(process.env.MONGO_URI, {
   useNewUrlParser: true, useUnifiedTopology: true
}) 

app.set('view engine', 'ejs')
app.set('trust proxy', true)
app.use(express.urlencoded({extended: false}))

app.get('/', async (req,res) => {
   const shortUrls = await ShortUrl.find()
   res.render('index', {shortUrls: shortUrls})
})

app.get('/myurls', async (req,res) => {
   const shortUrls = await ShortUrl.find(({ ip: req.ip }))
   res.render('myurls', {shortUrls: shortUrls})
})

app.post('/shortUrls', async (req,res) => {
   await ShortUrl.create({full: req.body.fullUrl, ip: req.ip})
   res.redirect('/myurls')
}) 

app.get('/:shortUrl', async (req, res) => {
   const shortUrl = await ShortUrl.findOne({ short: req.params.shortUrl })
   if(shortUrl == null) return res.sendStatus(404)
   shortUrl.clicks++
   shortUrl.save()
   res.render('redirect', {fullUrl: shortUrl.full})
})

app.get('/:shortUrl/delete', async (req, res) => {
   const shortUrl = await ShortUrl.findOne({ short: req.params.shortUrl }).deleteOne().exec()
   if(shortUrl == null) return res.sendStatus(404)
   res.redirect('/myurls')
})

app.listen(process.env.PORT || 5000, '0.0.0.0');