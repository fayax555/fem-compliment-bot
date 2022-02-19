import fetch from 'node-fetch'
import { chromium } from 'playwright'

const getData = async () => {
  const { data } = await (
    await fetch('https://backend.frontendmentor.io/rest/v2/solutions?page=1')
  ).json()

  const filterAndModifyData = data.map(({ slug, repoURL }) => ({
    url: `https://frontendmentor.io/solutions/${slug}`,
    user: repoURL.split('/')[3],
  }))

  return filterAndModifyData
}

;(async function main() {
  try {
    const browser = await chromium.launch({
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      proxy: {
        server: '187.19.152.182:3128',
      },
    })

    const page = await browser.newPage()

    await page.goto(
      'https://www.frontendmentor.io/solutions/rest-country-finder-y8glEosLZ'
    )
  } catch (err) {
    console.error(err)
  }

  // const data = await getData()
  // console.log(data)

  // await browser.close()
})()
