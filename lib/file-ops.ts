import fs from 'fs'

export const moveFile = (
  source: string,
  destination: string,
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const readStream = fs.createReadStream(source)
    const writeStream = fs.createWriteStream(destination)

    readStream.on('error', (error) => {
      reject(error)
    })

    writeStream.on('error', (error) => {
      reject(error)
    })

    // When writing is finished, delete the source file
    writeStream.on('finish', () => {
      fs.unlink(source, (error) => {
        if (error) {
          reject(error)
        } else {
          resolve()
        }
      })
    })

    // Pipe the source file's readable stream into the destination file's writable stream
    readStream.pipe(writeStream)
  })
}

export const createFolder = (folderPath: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    fs.mkdir(folderPath, { recursive: true }, (error) => {
      if (error) {
        reject(error)
      } else {
        resolve()
      }
    })
  })
}

export const deleteFolderIfEmpty = (folderPath: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    fs.readdir(folderPath, (error, files) => {
      if (error) {
        reject(error)
        return
      }

      if (files.length > 0) {
        reject(new Error('The folder is not empty!'))
        return
      }

      fs.rmdir(folderPath, (rmdirError) => {
        if (rmdirError) {
          reject(rmdirError)
        } else {
          resolve()
        }
      })
    })
  })
}
