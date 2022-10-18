import { BBM } from './bbm'
import * as fs from 'fs'
import axios from 'axios'
import API from 'constant/api'

jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>
const bbmSpecReq = `${__dirname}/../mock/bbm_books_publishers.spec.txt`
const bbmVolumesSpecReq = `${__dirname}/../mock/bbm_book_volumes.spec.txt`

describe('BBM', () => {
  let bbm: BBM

  beforeEach(async () => {
    bbm = new BBM()
  })

  it('should load books title and publisher', async () => {
    const html = fs.readFileSync(bbmSpecReq).toString()

    mockedAxios.get.mockImplementation(() => Promise.resolve({ data: html }))
    const scrap = await bbm.scrapBooks()

    expect(scrap.books.length).toBeGreaterThan(0)
    expect(scrap.publishers.length).toBeGreaterThan(0)
  })

  it.only('should load and get html from webpage', async () => {
    const htmlList = fs.readFileSync(bbmSpecReq).toString()
    const htmlVolumes = fs.readFileSync(bbmVolumesSpecReq).toString()
    mockedAxios.get.mockImplementation((param) => {
      let html
      switch (param) {
        case API.BBM:
          html = htmlList
          break

        default:
          html = htmlVolumes
          break
      }
      return Promise.resolve({ data: html })
    })

    const scrap = await bbm.scrapBooks()

    const booksVolume = await bbm.getBooksVolume(scrap.books)

    // expect(booksVolume.length).toBeGreaterThan(0)
  })
})
