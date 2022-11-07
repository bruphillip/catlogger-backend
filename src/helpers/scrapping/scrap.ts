import axios, { AxiosInstance } from 'axios'
import axiosRetry from 'axios-retry'
import * as cheerio from 'cheerio'
import { compact, get, isArray } from 'lodash'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const rateLimit = require('axios-rate-limit')

interface AllTag {
  '*': HTMLElement
}

type HtmlTag = keyof HTMLElementTagNameMap | keyof AllTag

export type JsonObject = {
  data?: string
  tag?: HtmlTag
  attribs?: { href: string }
  children?: JsonObject[]
  position?: number
}

class Scrap {
  private http: AxiosInstance

  constructor() {
    this.http = rateLimit(axios, {
      maxRequests: 5,
      perMilliseconds: 1000,
      maxRPS: 5,
    })

    axiosRetry(this.http, { retries: 5 })
  }

  async load(url: string) {
    try {
      const { data } = await this.http.get(url)

      const $ = cheerio.load(data)

      return $
    } catch (err) {
      console.log(err.message)
      throw err
    }
  }

  getByTag($, tag, position: number | null) {
    if (position === null) {
      return $(tag)
    }

    return $(tag)[position]
  }

  getElementByText($, text: string | string[], matchTag: HtmlTag = '*') {
    return isArray(text)
      ? compact(text.map((t) => $(`${matchTag}:contains('${t}')`)))[0]
      : $(`${matchTag}:contains('${text}')`)
  }

  getElementByPath($: any, path: string) {
    return get($._root, path)
  }

  domPath(element: any) {
    const stack: string[] = []
    while (element.parentNode != null) {
      let sibCount = 0
      let sibIndex = 0
      for (let i = 0; i < element.parentNode.childNodes.length; i++) {
        const sib = element.parentNode.childNodes[i]
        if (sib.nodeName == element.nodeName) {
          if (sib === element) {
            sibIndex = sibCount
          }
          sibCount++
        }
      }
      stack.unshift(`children[${sibIndex}]`)

      element = element.parentNode
    }

    return stack.join('.')
  }
}

export { Scrap }
