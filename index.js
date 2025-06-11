import { makeWASocket, DisconnectReason, useMultiFileAuthState, fetchLatestBaileysVersion, Browsers } from '@SoyMaycol/MayBailyes'
import qrcode from 'qrcode-terminal'
import fs from 'fs'
import { createRequire } from 'module'
import readline from 'readline'
import pino from 'pino'

const require = createRequire(import.meta.url)

// Crear logger silenciado

const logger = pino({ level: 'silent' })

// const logger = pino() 

//Avisos

const successful = `✨✅ ¡Hecho exitosamente! ✨
━━━━━━━━━━━━━━━━━━━━
📦 Información:
`;

const error = `❌ ¡Ups! Ocurrió un error...
━━━━━━━━━━━━━━━━━━━━
📛 Detalles del problema:
`;

// Configuración para silenciar logs de MayBailyes
console.originalLog = console.log
console.log = (...args) => {
    const message = args.join(' ')
    if (message.includes('Baileys') || message.includes('baileys') || message.includes('connection')) {
        return
    }
    console.originalLog(...args)
}

class WhatsAppBot {
    constructor() {
        this.sock = null
        this.commands = new Map()
        this.prefix = ['/', '.']
        this.loadCommands()
    }

    async loadCommands() {
        const commandsPath = './MayPlugins'
        
        if (!fs.existsSync(commandsPath)) {
            fs.mkdirSync(commandsPath, { recursive: true })
            console.log(`${successful}📁 Carpeta MayPlugins creada`)
        }

        try {
            const files = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'))
            
            for (const file of files) {
                try {
                    const { default: command } = await import(`./MayPlugins/${file}`)
                    if (command && command.comando) {
                        this.commands.set(file, command)
                        
                    }
                } catch (error) {
                    console.log(`${error}Error cargando ${file}:`, error.message)
                }
            }
            
            
        } catch (error) {
            console.log(`${error}Error leyendo carpeta MayPlugins:`, error.message)
        }
    }

    async getAuthMethod() {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        })

        return new Promise((resolve) => {
            console.log('\n🤖 ¡Bienvenido al Bot de WhatsApp con MayBailyes!')
            console.log('\n¿Cómo deseas autenticarte?')
            console.log('1. Código QR')
            console.log('2. Código de verificación')
            
            rl.question('\nSelecciona una opción (1 o 2): ', (answer) => {
                rl.close()
                resolve(answer === '2' ? 'code' : 'qr')
            })
        })
    }

    async getPhoneNumber() {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        })

        return new Promise((resolve) => {
            console.log('\n📱 INGRESA TU NÚMERO DE TELÉFONO')
            console.log('Formato: 51987654321 (con código de país)')
            rl.question('\n> ', (number) => {
                rl.close()
                resolve(number.replace(/\D/g, ''))
            })
        })
    }

    async getVerificationCode() {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        })

        return new Promise((resolve) => {
            console.log('\n🔐 INGRESA EL CÓDIGO DE VERIFICACIÓN')
            console.log('Formato: ABCD-1234')
            rl.question('\n> ', (code) => {
                rl.close()
                resolve(code)
            })
        })
    }

    async startBot() {
        const authMethod = await this.getAuthMethod()
        const { state, saveCreds } = await useMultiFileAuthState('./session')
        const { version } = await fetchLatestBaileysVersion()

        console.log(`\n🚀 Iniciando bot con MayBailyes v${version.join('.')}`)

        // Si es código de verificación y no hay credenciales, obtener número primero
        let phoneNumber = null
        if (authMethod === 'code' && !state.creds.registered) {
            phoneNumber = await this.getPhoneNumber()
        }

        this.sock = makeWASocket({
            version,
            auth: state,
            logger,
            browser: ['Windows', 'Chrome', '121.0.0.0'],
            syncFullHistory: false,
            markOnlineOnConnect: false,
            printQRInTerminal: false,
            defaultQueryTimeoutMs: 30000,
            connectTimeoutMs: 30000,
            qrTimeout: 40000,
            generateHighQualityLinkPreview: false,
        })

        this.sock.ev.on('creds.update', saveCreds)

        this.sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr, isNewLogin } = update

            if (qr && authMethod === 'qr') {
                console.log('\n📱 Escanea este código QR con tu WhatsApp:')
                qrcode.generate(qr, { small: true })
            }

            if (connection === 'close') {
                const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut
                console.log('🔄 Conexión cerrada.')
                
                if (lastDisconnect?.error?.output?.statusCode === DisconnectReason.badSession) {
                    console.log('🗑️ Sesión corrupta, eliminando...')
                    if (fs.existsSync('./session')) {
                        fs.rmSync('./session', { recursive: true, force: true })
                    }
                    console.log('🔄 Reinicia el bot para crear una nueva sesión')
                    process.exit(1)
                }
                
                if (shouldReconnect) {
                    console.log('🔄 Reconectando en 5 segundos...')
                    setTimeout(() => this.startBot(), 5000)
                } else {
                    console.log('❌ Sesión cerrada. Reinicia el bot.')
                    process.exit(1)
                }
            } else if (connection === 'open') {
                console.log('✅ Bot conectado exitosamente!')
            } else if (connection === 'connecting') {
                console.log('🔄 Conectando...')
                
                // Solicitar código de verificación cuando se conecta por primera vez
                if (authMethod === 'code' && phoneNumber && !state.creds.registered) {
                    console.log(`\n📞 Enviando código a: ${phoneNumber}`)
                    try {
                        await new Promise(resolve => setTimeout(resolve, 5000)) // Esperar 2 segundos
                        const code = await this.sock.requestPairingCode(phoneNumber)
                        console.log(`\n🔐 Tu código de verificación es: ${code}`)
                        console.log('📲 Ve a WhatsApp > Dispositivos Vinculados > Vincular Dispositivo > Vincular con número de teléfono')
                        console.log('📲 Ingresa el código que aparece arriba')
                        console.log('⏰ El código expira en 20 segundos')
                    } catch (error) {
                        console.log('❌ Error solicitando código:', error.message)
                        console.log('🔄 Reintentando en 5 segundos...')
                        setTimeout(async () => {
                            try {
                                const code = await this.sock.requestPairingCode(phoneNumber)
                                console.log(`\n🔐 Nuevo código: ${code}`)
                            } catch (retryError) {
                                console.log('❌ Error en reintento:', retryError.message)
                            }
                        }, 5000)
                    }
                }
            }
        })

        this.sock.ev.on('messages.upsert', async ({ messages }) => {
            for (const message of messages) {
                await this.handleMessage(message)
            }
        })
    }

    async handleMessage(message) {
        if (message.key.fromMe || !message.message) return

        const messageText = message.message.conversation || 
                           message.message.extendedTextMessage?.text || ''
        
        if (!messageText.startsWith(this.prefix)) return

        const args = messageText.slice(this.prefix.length).trim().split(' ')
        const commandName = args.shift().toLowerCase()

        for (const [fileName, command] of this.commands) {
            if (Array.isArray(command.comando) && command.comando.includes(commandName)) {
                try {
                    const m = {
                        ...message,
                        chat: message.key.remoteJid,
                        sender: message.key.participant || message.key.remoteJid,
                        quoted: message.message.extendedTextMessage?.contextInfo?.quotedMessage ? {
                            text: this.getQuotedText(message.message.extendedTextMessage.contextInfo.quotedMessage)
                        } : null,
                        react: async (emoji) => {
                            await this.sock.sendMessage(message.key.remoteJid, {
                                react: { text: emoji, key: message.key }
                            })
                        }
                    }

                    const conn = {
                        ...this.sock,
                        reply: async (chatId, text, quotedMsg) => {
                            await this.sock.sendMessage(chatId, { text }, { quoted: quotedMsg })
                        }
                    }

                    await command(m, { 
                        conn, 
                        args, 
                        usedPrefix: this.prefix, 
                        command: commandName 
                    })
                } catch (error) {
                    console.log(`${error}Error ejecutando comando ${fileName}:`, error.message)
                    await this.sock.sendMessage(message.key.remoteJid, {
                        text: `${error}Error ejecutando el comando: ${error.message}`
                    }, { quoted: message })
                }
                break
            }
        }
    }

    getQuotedText(quotedMessage) {
        return quotedMessage.conversation || 
               quotedMessage.extendedTextMessage?.text || 
               quotedMessage.imageMessage?.caption || 
               quotedMessage.videoMessage?.caption || ''
    }
}

// Iniciar el bot
const bot = new WhatsAppBot()
bot.startBot().catch(console.error)

// Manejar cierre del proceso
process.on('SIGINT', () => {
    console.log('\n👋 Cerrando bot...')
    process.exit(0)
})

process.on('uncaughtException', (error) => {
    console.log(`${error} Error no capturado:`, error.message)
})

process.on('unhandledRejection', (error) => {
    console.log(`${error} Promesa rechazada:`, error.message)
})
