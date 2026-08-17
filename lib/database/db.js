import chalk from 'chalk'

let _jsonMode = false

export function isJsonMode() {
  return _jsonMode
}

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI

  if (!uri) {
    _jsonMode = true
    console.log(
      chalk.bold.bgYellow.black(' [DB] '),
      chalk.bold.yellowBright('Sem MONGODB_URI — usando armazenamento JSON local.'),
      chalk.gray('(lib/database/data/)')
    )
    return false
  }

  try {
    const mongoose = (await import('mongoose')).default

    mongoose.set('strictQuery', false)
    console.log(chalk.bold.cyanBright('\n⏳ Conectando ao banco de dados...'))

    await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 })

    console.log(
      chalk.bold.bgGreen.white(' [DB OK] '),
      chalk.bold.greenBright('Conectado ao MongoDB com sucesso!\n')
    )

    mongoose.connection.on('disconnected', () =>
      console.log(chalk.bold.bgRed.white(' [DB DESCONECTADO] '), chalk.bold.redBright('A conexão com o MongoDB foi perdida.'))
    )
    mongoose.connection.on('reconnected', () =>
      console.log(chalk.bold.bgGreen.white(' [DB RECONECTADO] '), chalk.bold.greenBright('A conexão com o MongoDB foi restaurada.'))
    )

    return true
  } catch (error) {
    _jsonMode = true
    console.warn(
      chalk.bold.bgYellow.black(' [DB FALLBACK] '),
      chalk.bold.yellowBright('Não foi possível conectar ao MongoDB. Usando JSON como alternativa.')
    )
    console.warn(chalk.gray('  →', error.message))
    return false
  }
}
