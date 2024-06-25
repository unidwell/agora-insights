import express from 'express'
import bodyParser from 'body-parser'
import PredictionMarket from './prediction-market.js'

const app = express()
const port = 3000
const market = new PredictionMarket()

app.use(bodyParser.json())

app.post('/createEvent', (req, res) => {
  const { eventName } = req.body
  market.createEvent(eventName)
  res.status(200).send({ message: `Event ${eventName} has been created successfully!` })
})

app.post('/addOutcomes', (req, res) => {
  const { eventName, outcomes } = req.body
  market.addOutcomes(eventName, outcomes)
  res.status(200).send({ message: `Outcomes ${outcomes} added successfully` })
})

app.post('/placeBet', (req, res) => {
  const { eventName, outcomeName, participant, amount } = req.body
  market.placeBet(eventName, outcomeName, participant, amount)
  const betData = { eventName, outcomeName, participant, amount }
  res.status(200).send({ message: `Bet ${betData} placed successfully` })
})

app.post('/resolveMarket', (req, res) => {
  const { eventName, outcomeName } = req.body
  const result = market.resolveMarket(eventName, outcomeName)
  res.status(200).send({ message: `Market resolved successfully`, result })
})

app.get('/getMarketPrice', (req, res) => {
  const { eventName, outcomeName } = req.query
  const price = market.getCurrentOutcomePrice(eventName, outcomeName)
  res.status(200).send({ message: `Current market price for ${outcomeName} is ${price}` })
})

app.listen(port, () => {
  console.log(`PredictionMarket service running at http://localhost:${port}`)
})
