const axios = require('axios')
const dotenv = require('dotenv')
const sendEmail = require('./utils')

dotenv.config()

const tokens = process.env.BEARER_TOKENS.split(',')

const startUrl = 'https://tg-bot-tap.laborx.io/api/v1/farming/start'
const finishUrl = 'https://tg-bot-tap.laborx.io/api/v1/farming/finish'

let lastEmailSentTime = 0
const emailInterval = 24 * 60 * 60 * 1000

async function startFarming(token) {
  const headers = { Authorization: `Bearer ${token}` }
  try {
    const response = await axios.post(startUrl, {}, { headers })
    const farmingDurationInSec = response.data.farmingDurationInSec
    console.log(`Farming started with token ${token}. Waiting for ${farmingDurationInSec} seconds.`)

    setTimeout(async () => {
      await claimFarming(token)
    }, farmingDurationInSec * 1000)
  } catch (error) {
    console.error(`Error starting farming with token ${token}:`, error.message)
    await sendErrorEmailIfNeeded()
    setTimeout(() => startFarming(token), 10000)
  }
}

async function claimFarming(token) {
  const headers = { Authorization: `Bearer ${token}` }
  try {
    const response = await axios.post(finishUrl, {}, { headers })
    console.log(`Farming claimed successfully with token ${token}:`, response.data)
    await startFarming(token)
  } catch (error) {
    console.error(`Error claiming farming with token ${token}:`, error.message)
    await sendErrorEmailIfNeeded()
    setTimeout(() => claimFarming(token), 10000)
  }
}

async function sendErrorEmailIfNeeded() {
  const currentTime = Date.now()
  if (currentTime - lastEmailSentTime >= emailInterval) {
    await sendEmail({
      html: `<p>Token expired</p>`,
      subject: 'Token expired',
      text: `Hi your auth token has expired`,
      to: process.env.YOUR_EMAIL,
    })
    lastEmailSentTime = currentTime
  }
}

function startAllFarmings() {
  tokens.forEach((token) => {
    startFarming(token)
  })
}

startAllFarmings()
