import fs from 'fs'
import path from 'path'
import { compileTemplate } from '@vue/compiler-sfc'

const resolve = (url: string) => path.join(path.resolve(), url)

const config = {
  input: resolve('/src/icons'),
  output: resolve('/src/assets/icons'),
}

const cache = {
  iconsName: [] as string[],
}

// svg 转成 vue的render  js文件
export function svgToRender() {
  const svgs = fs.readdirSync(config.input)
  if (svgs.length === 0) return

  // 获取一下缓存icons文件
  cacheIcons()

  svgs
    .filter(n => n.endsWith('.svg'))
    .forEach(n => {
      const svgname = n.replace(/\.svg/, '.js')
      // 判断svg是否存在文件名一致的js文件
      if (cache.iconsName.includes(svgname)) {
        // 获取svg文件内容
        const code = compilerSvg(n).replace(/\s+/g, '')

        // 获取与svg同文件名的js文件内容
        const cachePath = path.join(
          path.resolve(),
          `/src/assets/icons/${cache.iconsName.find(
            cn => cn === svgname
          )}`
        )
        const cacheFile = fs
          .readFileSync(cachePath, 'utf8')
          .replace(/\s+/g, '')

        // 对比内容是否一致，如果一致则不需要重新生成
        if (code === cacheFile) {
          return
        }
      }

      const code = compilerSvg(n)

      fs.writeFileSync(
        path.join(config.output, `/${n.replace(/\.svg/, '.js')}`),
        code,
        'utf8'
      )
    })
}

// 读取输出目录，缓存目录下的icons的js文件
function cacheIcons() {
  const icons = fs.readdirSync(config.output)
  cache.iconsName = icons.filter(n => n.endsWith('.js'))
}

// 判断icons js文件的内容是否一致
function compilerSvg(filename: string) {
  const n = filename
  const svgContent = fs.readFileSync(
    path.join(config.input, `/${n}`),
    'utf8'
  )

  const { code } = compileTemplate({
    source: svgContent,
    filename: n, // 用于错误提示
    id: `data-v-${Date.now()}`,
  })

  const newCode = code.replace(
    /\s+}\s+from\s+/,
    ', defineComponent } from '
  )

  const matchRender = /function.*[\d\D]+/g
  const renderCode = newCode.match(matchRender)?.[0]

  const renderContent = ` default defineComponent({
    name: '${n.replace(/\.svg/, '')}',
    render: ${renderCode}
  })`

  const result = newCode.replace(matchRender, renderContent)

  return result
}
