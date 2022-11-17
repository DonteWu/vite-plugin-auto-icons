import fs from 'fs'
import path from 'path'

const resolve = (url: string) => path.join(path.resolve(), url)

const config = {
  input: 'node_modules/@vicons/material/es',
  output: resolve('/src/assets/icons'),
  useIconNames: [],
}

const cache = {
  iconsName: [] as string[], // ['icon.js']
}

// 拷贝需要的vicon js文件到指定目录使用
export function copyViconsFile(useIconNames: string[]) {
  const vicons = fs.readdirSync(config.input)

  if (vicons.length === 0) {
    throw new Error(`找不到 ${config.input} 路径的包`)
  }

  cacheIcons()

  useIconNames.forEach(n => {
    if (cache.iconsName.includes(`${n}.js`)) {
      return
    }

    const iconContent = fs.readFileSync(
      `${config.input}/${n}.js`,
      'utf8'
    )
    fs.writeFileSync(
      path.join(config.output, `/${n}.js`),
      iconContent,
      'utf8'
    )
  })
}

// 读取输出目录，缓存目录下的icons的js文件
function cacheIcons() {
  const icons = fs.readdirSync(config.output)
  cache.iconsName = icons.filter(n => n.endsWith('.js'))
}
