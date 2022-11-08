import axios from 'axios'

import { booksHtml, morango } from './mock'
import { Scrap } from './scrap'

jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

describe('Scrapping', () => {
  let scrap: Scrap

  beforeEach(async () => {
    jest.restoreAllMocks()
    scrap = new Scrap()
  })

  it('should load html page from url', async () => {
    const fakeUrl = 'http://bbm.fakeurl.com'

    mockedAxios.get.mockImplementation((params) => {
      expect(params).toBe(fakeUrl)

      return Promise.resolve({ data: booksHtml })
    })

    await scrap.load(fakeUrl)
  })

  it('should element by given text', async () => {
    const fakeUrl = 'http://bbm.fakeurl.com'

    mockedAxios.get.mockImplementation((params) => {
      expect(params).toBe(fakeUrl)

      return Promise.resolve({ data: morango })
    })

    const html = await scrap.load(fakeUrl)
    const authorElement = scrap.getElementByText(html, 'Autor', 'strong')[0]

    expect(authorElement.name).toBe('strong')
    expect((authorElement.children[0] as any).data).toBe('Autor')
  })

  it('should give element path', async () => {
    const fakeUrl = 'http://bbm.fakeurl.com'
    const computedPath =
      'children[1].children[2].children[10].children[5].children[1].children[4].children[1].children[1].children[1].children[3].children[8]'

    mockedAxios.get.mockImplementation((params) => {
      expect(params).toBe(fakeUrl)

      return Promise.resolve({ data: morango })
    })

    const html = await scrap.load(fakeUrl)
    const authorEl = scrap.getElementByText(html, 'Autor', 'strong')[0]
    const authorPath = scrap.domPath(authorEl)
    expect(authorPath).toEqual(computedPath)
  })

  it('should math element when search by given path', async () => {
    const fakeUrl = 'http://bbm.fakeurl.com'

    mockedAxios.get.mockImplementation((params) => {
      expect(params).toBe(fakeUrl)

      return Promise.resolve({ data: morango })
    })

    const html = await scrap.load(fakeUrl)
    const authorEl = scrap.getElementByText(html, 'Autor', 'strong')[0]
    const authorPath = scrap.domPath(authorEl)
    const matchEl = scrap.getElementByPath(html, authorPath)

    expect(matchEl).toBe(authorEl)
  })
})
