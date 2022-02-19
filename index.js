import 'dotenv/config'
import fetch from 'node-fetch'
import puppeteer from 'puppeteer-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
import { getRandom } from 'random-useragent'
import { sleep } from './utils.js'
import { getRandomCompliment } from './compliment.js'

const launchPuppeteer = async () => {
  puppeteer.use(StealthPlugin())

  const USER_AGENT =
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.75 Safari/537.36'

  const browser = await puppeteer.launch({
    headless: false,
    executablePath: process.env.CHROME_BIN || null,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      // `--proxy-server='${newProxyUrl}`,
    ],
    ignoreHTTPSErrors: true,
    dumpio: false,
  })
  const page = await browser.newPage({ headless: false })
  const userAgent = getRandom()
  const UA = userAgent || USER_AGENT

  //Randomize viewport size
  // await page.setViewport({
  //   width: 1920 + Math.floor(Math.random() * 100),
  //   height: 3000 + Math.floor(Math.random() * 100),
  //   deviceScaleFactor: 1,
  //   hasTouch: false,
  //   isLandscape: false,
  //   isMobile: false,
  // })

  await page.setUserAgent(UA)
  await page.setJavaScriptEnabled(true)
  page.setDefaultNavigationTimeout(0)
  await page.goto('https://www.frontendmentor.io/', {
    waitUntil: 'networkidle0',
  })

  return { page, browser }
}

const auth = async () => {
  const { page, browser } = await launchPuppeteer()

  await Promise.all([
    page.waitForNavigation(),
    page.click(
      'html.js body div#__next div#content main section.Home__Intro-sc-irpn59-0.iROMog.intro div.container div.Home__Content-sc-irpn59-1.eTfqHg span.GithubAuthButton__Wrapper-sc-1t3homg-0.iTwlcw.gh-auth a.GithubAuthButton__Link-sc-1t3homg-1.edcjIF'
    ),
  ])
  await page.type('#login_field', process.env.EMAIL, { delay: 100 })
  await page.type('#password', process.env.PASSWORD, { delay: 100 })
  await page.click(
    '#login > div.auth-form-body.mt-3 > form > div > input.btn.btn-primary.btn-block.js-sign-in-button'
  )

  await page.waitForSelector(
    '#__next > header > div > div > button > div.Avatar__Wrapper-sc-1t4kc72-0.jNTFqT'
  )

  return { page, browser }
}

const getFullData = async () => {
  const fullData = []

  for (let i = 1; i <= 2; i++) {
    await sleep(500)
    const { data } = await (
      await fetch(
        `https://backend.frontendmentor.io/rest/v2/solutions?page=${i}`
      )
    ).json()
    fullData.push(...data)
  }

  console.log('----------------------------')
  console.log('----------------------------')
  console.log('----------------------------')
  console.log('----------------------------')

  return fullData
}

const getData = async () => {
  const filterAndModifyData = (await getFullData())
    .map(({ slug, repoURL, comments }) => {
      // ignore if already commented
      if (comments.includes('6210dfaa145c6a78f01599f3')) return null

      return {
        solutionUrl: `https://frontendmentor.io/solutions/${slug}`,
        user: repoURL.split('/')[3],
      }
    })
    .filter(Boolean)

  return filterAndModifyData
}

;(async function main() {
  const { browser, page } = await auth()

  const data = await getData()

  for (let i = 0; i < data.length; i++) {
    const { solutionUrl, user } = data[i]
    await page.goto(solutionUrl)
    const [el] = await page.$x(
      '/html/body/div[1]/div[3]/div[2]/div[2]/section/div/form/div/div/textarea'
    )
    console.log(`Hey @${user}, ${getRandomCompliment()}`)
    await el.type(`Hey @${user}, ${getRandomCompliment()}`)
    await sleep(1000)
  }

  await browser.close()
})()
