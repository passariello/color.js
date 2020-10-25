type Args = {
  amount: number;
  format: string;
  group: number;
  sample: number;
}

type Data = Uint8ClampedArray

type Handler = (data: Data, args: Args) => Output

type Input = (string | Rgb)[]

type Item = string | HTMLImageElement

type Output = string | Rgb | (string | Rgb)[]

type Rgb = number[]

const getSrc = (item: Item): string =>
  typeof item === 'string' ? item : item.src

const getArgs = ({
  amount = 3,
  format = 'array',
  group = 20,
  sample = 10,
} = {}): Args => ({ amount, format, group, sample })

const format = (input: Input, args: Args): Output => {
  const list = input.map((val) => {
    const rgb = Array.isArray(val) ? val : val.split(',').map(Number)

    return args.format === 'hex' ? rgbToHex(rgb) : rgb
  })

  return args.amount === 1 || list.length === 1 ? list[0] : list
}

const group = (number: number, grouping: number): number => {
  const grouped = Math.round(number / grouping) * grouping

  return Math.min(grouped, 255)
}

const rgbToHex = (rgb: Rgb): string => '#' + rgb.map((val) => {
  const hex = val.toString(16)

  return hex.length === 1 ? '0' + hex : hex
}).join('')

const getImageData = (src: string): Promise<Data> =>
  new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const context = <CanvasRenderingContext2D>canvas.getContext('2d')
    const img = new Image

    img.onload = () => {
      canvas.height = img.height
      canvas.width = img.width
      context.drawImage(img, 0, 0)

      const data = context.getImageData(0, 0, img.width, img.height).data

      resolve(data)
    }
    img.onerror = () => reject(Error('Image loading failed.'))
    img.crossOrigin = ''
    img.src = src
  })

const getAverage = (data: Data, args: Args): Output => {
  const gap = 4 * args.sample
  const amount = data.length / gap
  const rgb = { r: 0, g: 0, b: 0 }

  for (let i = 0; i < data.length; i += gap) {
    rgb.r += data[i]
    rgb.g += data[i + 1]
    rgb.b += data[i + 2]
  }

  return format([[
    Math.round(rgb.r / amount),
    Math.round(rgb.g / amount),
    Math.round(rgb.b / amount)
  ]], args)
}

const getProminent = (data: Data, args: Args): Output => {
  const gap = 4 * args.sample
  const colors = {}

  for (let i = 0; i < data.length; i += gap) {
    const rgb = [
      group(data[i], args.group),
      group(data[i + 1], args.group),
      group(data[i + 2], args.group),
    ].join()

    colors[rgb] = colors[rgb] ? colors[rgb] + 1 : 1
  }

  return format(
    Object.entries(colors)
      .sort(([keyA, valA], [keyB, valB]) => valA > valB ? -1 : 1)
      .slice(0, args.amount)
      .map(([rgb]) => rgb),
    args
  )
}

const process = (item: Item, args: Args, handler: Handler): Promise<Output> =>
  new Promise((resolve, reject) =>
    getImageData(getSrc(item))
      .then((data) => resolve(handler(data, getArgs(args))))
      .catch((error) => reject(error))
)

const average = (item: Item, args: Args) => process(item, args, getAverage)
const prominent = (item: Item, args: Args) => process(item, args, getProminent)

export { average, prominent }
