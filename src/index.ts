// 自动导入icon
import type { Plugin } from 'vite'
import fs from 'fs'
import path from 'path'
import { svgToRender } from './svgto'
import { copyViconsFile } from './vicons'

const resolve = (url: string) => path.join(path.resolve(), url)

interface ConfigOptions {
  useIconNames: string[]
}

export default function (configOptions: ConfigOptions) {
  return {
    name: 'autoIcons',
    load(id) {
      if (id.endsWith('App.vue')) {
        svgToRender()
        copyViconsFile(configOptions.useIconNames)
        // generateExportIcons()
        generateImportIconsAll()
      }
    },
  } as Plugin
}

// 生成所有icon的导入文件
export function generateImportIconsAll() {
  const output = resolve('/src/assets/icons')
  const icons = fs.readdirSync(output)
  const iconsAll = icons
    .filter(n => n.endsWith('.js') && !/index/.test(n))
    .map(n => n.replace(/\.js/, ''))

  const head = `${iconsAll
    .map(n => `import ${n} from './${n}'`)
    .join('\n')}`
  const content = `${iconsAll.join(',')}`

  const result = `${head}\n\nconst icons = { ${content} }\n\nexport default icons`

  const writeFile = (filename: string) => {
    fs.writeFileSync(filename, result, 'utf8')
  }
  writeFile(resolve('/src/assets/icons/index.d.ts'))
  writeFile(resolve('/src/assets/icons/index.js'))
}
