import * as fs from 'fs'
import axios from 'axios'
import { Scrap } from './scrap'

jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>
const bbmSpecReq = `${__dirname}/mock/bbm_books_publishers.spec.txt`

describe('Scrapping', () => {
  let scrap: Scrap

  beforeEach(async () => {
    scrap = new Scrap()
  })

  it('should load html page from url', async () => {
    const html = fs.readFileSync(bbmSpecReq).toString()
    const fakeUrl = 'http://bbm.fakeurl.com'

    mockedAxios.get.mockImplementation((params) => {
      expect(params).toBe(fakeUrl)

      return Promise.resolve({ data: html })
    })

    await scrap.load(fakeUrl)
  })

  it.only('should load and get html from webpage', async () => {
    const html = fs.readFileSync(bbmSpecReq).toString()
    const fakeUrl = 'http://bbm.fakeurl.com'

    mockedAxios.get.mockImplementation((params) => {
      expect(params).toBe(fakeUrl)

      return Promise.resolve({ data: html })
    })
  })
})
