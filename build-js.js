const { Worker, isMainThread, parentPort } = require('worker_threads')
const { readdir, readFile, writeFile, mkdir } = require('fs').promises
const { resolve } = require('path')
const Terser = require('terser')

async function* recursiveSearch(dir) {
  const dirents = await readdir(dir, { withFileTypes: true })
  for (const dirent of dirents) {
    const res = resolve(dir, dirent.name)
    if (dirent.isDirectory()) {
      yield* recursiveSearch(res)
    } else {
      yield res
    }
  }
}

async function processJs() {
  for await (const file of recursiveSearch(`${__dirname}/src/js/`)) {
    readFile(file, { encoding: 'utf8' })
      .then((data) => {
        const dest = file.replace(/src\\/g, 'docs/dist/')
        const dest2 = file.replace(/src\\/g, 'dist/')
        const code = Terser.minify(data).code.replace(/(\\n\s+)+/g, '')
        mkdir(dest.substring(0, dest.lastIndexOf('\\')), { recursive: true })
          .then(() => {
            writeFile(`${dest.substr(0, dest.lastIndexOf('.'))}.min.js`, code)
          })
          .then(() => {
            mkdir(dest2.substring(0, dest2.lastIndexOf('\\')), { recursive: true })
              .then(() => {
                writeFile(`${dest2.substr(0, dest2.lastIndexOf('.'))}.min.js`, code)
              })
          })
      })
  }
}

if (isMainThread) {
  const worker = new Worker(__filename)
  worker.postMessage('message')
} else {
  parentPort.once('message', () => {
    processJs()
  })
}
