import axios from 'axios'
import * as cheerio from 'cheerio'

type HtmlTag = keyof HTMLElementTagNameMap

export type JsonObject = {
  data?: string
  tag?: HtmlTag
  attribs?: { href: string }
  children?: JsonObject[]
  position?: number
}

class Scrap {
  async load(url: string) {
    try {
      const { data } = await axios.get(url)

      const $ = cheerio.load(data)
      return {
        getByTag: (tag) => this.getByTag($, tag),
      }
    } catch (err) {
      console.log(err.message)
    }
  }

  getByTag($, tag) {
    const element = $(tag)

    return {
      element,
      json: () => this.htmlToJson(element[0]),
    }
  }

  htmlToJson(element, position?: number): JsonObject {
    if (!element) return
    const { children, name, attribs, data } = element

    if (children) {
      const mapped = children.map((child, index) =>
        this.htmlToJson(child, index),
      )
      return {
        tag: name,
        children: mapped,
        attribs,
        position,
      }
    }

    return {
      tag: name,
      attribs,
      data,
      position,
    }
  }
}

export { Scrap }
