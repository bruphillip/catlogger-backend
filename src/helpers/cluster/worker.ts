import { JsonObject, Scrap } from 'helpers/scrapping/scrap'

type ScrapReturn = {
  getByTag: (tag: any) => {
    element: any
    json: () => JsonObject
  }
}

type WorkerReturn = { url: string; scrap: ScrapReturn }

export async function Worker(url: string): Promise<WorkerReturn> {
  const scrapping = new Scrap()
  const scrap = await scrapping.load(url)
  return { url, scrap }
}
