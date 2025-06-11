import { makeWASocket, DisconnectReason, useMultiFileAuthState, fetchLatestBaileysVersion, Browsers } from '@SoyMaycol/MayBailyes'
import qrcode from 'qrcode-terminal'
import fs from 'fs'
import { createRequire } from 'module'
import readline from 'readline'
import pino from 'pino'

const require = createRequire(import.meta.url)

const logger = pino({ level: 'silent' })

const banner = `
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║  ███╗   ███╗ █████╗ ██╗   ██╗██████╗  ██████╗ ████████╗                     ║
║  ████╗ ████║██╔══██╗╚██╗ ██╔╝██╔══██╗██╔═══██╗╚══██╔══╝                     ║
║  ██╔████╔██║███████║ ╚████╔╝ ██████╔╝██║   ██║   ██║                        ║
║  ██║╚██╔╝██║██╔══██║  ╚██╔╝  ██╔══██╗██║   ██║   ██║                        ║
║  ██║ ╚═╝ ██║██║  ██║   ██║   ██████╔╝╚██████╔╝   ██║                        ║
║  ╚═╝     ╚═╝╚═╝  ╚═╝   ╚═╝   ╚═════╝  ╚═════╝    ╚═╝                        ║
║                                                                              ║
║  ▓█████▄ ▓██   ██▓    ▐██▌ ▄▄▄       ▄████▄   ▒█████   ██▓                ║
║  ▒██▀ ██▌ ▒██  ██▒    ▐██▌▒████▄    ▒██▀ ▀█  ▒██▒  ██▒▓██▒                ║
║  ░██   █▌  ▒██ ██░    ▐██▌▒██  ▀█▄  ▒▓█    ▄ ▒██░  ██▒▒██▒                ║
║  ░▓█▄   ▌  ░ ▐██▓░    ▓██▒░██▄▄▄▄██ ▒▓▓▄ ▄██▒▒██   ██░░██░                ║
║  ░▒████▓   ░ ██▒▓░    ▒▄▄  ▓█   ▓██▒▒ ▓███▀ ░░ ████▓▒░░██░                ║
║   ▒▒▓  ▒    ██▒▒▒     ░▀▀▒ ▒▒   ▓▒█░░ ░▒ ▒  ░░ ▒░▒░▒░ ░▓                  ║
║   ░ ▒  ▒  ▓██ ░▒░     ░  ░  ▒   ▒▒ ░  ░  ▒     ░ ▒ ▒░  ▒ ░                ║
║   ░ ░  ░  ▒ ▒ ░░      ░     ░   ▒   ░        ░ ░ ░ ▒   ▒ ░                ║
║     ░     ░ ░         ░ ░       ░  ░░ ░          ░ ░   ░                   ║
║   ░       ░ ░         ░             ░                                       ║
║                                                                              ║
║  ┌─────────────────────────────────────────────────────────────────────┐     ║
║  │   🤖 WhatsApp Bot Avanzado con MayBailyes                           │     ║
║  │   ⚡ Desarrollado por: SoyMaycol                                     │     ║
║  │   🚀 Versión: 2.0 Ultra Edition                                     │     ║
║  │   💎 Sistema de Plugins Dinámico                                    │     ║
║  └─────────────────────────────────────────────────────────────────────┘     ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
`

const successIcon = `
  ████████╗
  ╚══██╔══╝
     ██║   
     ██║   
     ╚═╝   
`

const errorIcon = `
  ██╗  ██╗
  ╚██╗██╔╝
   ╚███╔╝ 
   ██╔██╗ 
   ╚═╝╚═╝ 
`

const successful = `
╔═══════════════════════════════════════════════════════════════╗
║  ✨🎉                OPERACIÓN EXITOSA                🎉✨  ║
║                                                               ║
║    ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄     ║
║   ╱                                                   ╲    ║
║  ╱     🚀 PROCESO COMPLETADO SATISFACTORIAMENTE       ╲   ║
║ ╱      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━      ╲  ║
║╱       📊 INFORMACIÓN DEL SISTEMA:                      ╲ ║
╚═══════════════════════════════════════════════════════════════╝
`

const error = `
╔═══════════════════════════════════════════════════════════════╗
║  ⚠️ 💥               ERROR DETECTADO                💥⚠️   ║
║                                                               ║
║    ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄     ║
║   ╱                                                   ╲    ║
║  ╱     🔥 ALGO SALIÓ MAL EN EL PROCESO                ╲   ║
║ ╱      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━      ╲  ║
║╱       🚨 DETALLES DEL PROBLEMA:                        ╲ ║
╚═══════════════════════════════════════════════════════════════╝
`

const welcomeMessage = `
╔═══════════════════════════════════════════════════════════════════════════════╗
║                                                                               ║
║    ████████╗██████╗  ██████╗██╗ ██████╗███╗   ██╗██╗ ██████╗███████╗██╗      ║
║    ╚══██╔══╝██╔══██╗██╔════╝██║██╔════╝████╗  ██║██║██╔════╝██╔════╝██║      ║
║       ██║   ██████╔╝██║     ██║██║     ██╔██╗ ██║██║██║     █████╗  ██║      ║
║       ██║   ██╔══██╗██║     ██║██║     ██║╚██╗██║██║██║     ██╔══╝  ╚═╝      ║
║       ██║   ██║  ██║╚██████╗██║╚██████╗██║ ╚████║██║╚██████╗███████╗██╗      ║
║       ╚═╝   ╚═╝  ╚═╝ ╚═════╝╚═╝ ╚═════╝╚═╝  ╚═══╝╚═╝ ╚═════╝╚══════╝╚═╝      ║
║                                                                               ║
║  ┌─────────────────────────────────────────────────────────────────────────┐  ║
║  │  🎯 ¡Bienvenido al sistema de autenticación de MayBot!                 │  ║
║  │  🔐 Selecciona tu método de conexión preferido:                        │  ║
║  │                                                                         │  ║
║  │  ┌───────────────┐     ┌─────────────────────┐                        │  ║
║  │  │   📱 QR CODE  │     │  📲 PHONE NUMBER     │                        │  ║
║  │  │   ═══════════  │     │  ═══════════════     │                        │  ║
║  │  │   Opción: 1   │     │   Opción: 2         │                        │  ║
║  │  │   Rápido ⚡   │     │   Seguro 🛡️         │                        │  ║
║  │  └───────────────┘     └─────────────────────┘                        │  ║
║  └─────────────────────────────────────────────────────────────────────────┘  ║
╚═══════════════════════════════════════════════════════════════════════════════╝
`

const phonePrompt = `
╔═══════════════════════════════════════════════════════════════════════════════╗
║                                                                               ║
║  ████████╗███████╗██╗     ███████╗███████╗ ██████╗ ███╗   ██╗ ██████╗        ║
║  ╚══██╔══╝██╔════╝██║     ██╔════╝██╔════╝██╔═══██╗████╗  ██║██╔═══██╗       ║
║     ██║   █████╗  ██║     █████╗  █████╗  ██║   ██║██╔██╗ ██║██║   ██║       ║
║     ██║   ██╔══╝  ██║     ██╔══╝  ██╔══╝  ██║   ██║██║╚██╗██║██║   ██║       ║
║     ██║   ███████╗███████╗███████╗██║     ╚██████╔╝██║ ╚████║╚██████╔╝       ║
║     ╚═╝   ╚══════╝╚══════╝╚══════╝╚═╝      ╚═════╝ ╚═╝  ╚═══╝ ╚═════╝        ║
║                                                                               ║
║  ┌─────────────────────────────────────────────────────────────────────────┐  ║
║  │  📞 INGRESA TU NÚMERO DE TELÉFONO                                       │  ║
║  │                                                                         │  ║
║  │  🌍 Formato Internacional: [CÓDIGO_PAÍS][NÚMERO]                       │  ║
║  │  📱 Ejemplo: 51987654321                                               │  ║
║  │                                                                         │  ║
║  │  ⚠️  IMPORTANTE: Solo números, sin espacios ni símbolos                │  ║
║  └─────────────────────────────────────────────────────────────────────────┘  ║
╚═══════════════════════════════════════════════════════════════════════════════╝
`

const codePrompt = `
╔═══════════════════════════════════════════════════════════════════════════════╗
║                                                                               ║
║   ██████╗ ██████╗ ██████╗ ██╗ ██████╗  ██████╗                              ║
║  ██╔════╝██╔═══██╗██╔══██╗██║██╔════╝ ██╔═══██╗                             ║
║  ██║     ██║   ██║██║  ██║██║██║  ███╗██║   ██║                             ║
║  ██║     ██║   ██║██║  ██║██║██║   ██║██║   ██║                             ║
║  ╚██████╗╚██████╔╝██████╔╝██║╚██████╔╝╚██████╔╝                             ║
║   ╚═════╝ ╚═════╝ ╚═════╝ ╚═╝ ╚═════╝  ╚═════╝                              ║
║                                                                               ║
║  ┌─────────────────────────────────────────────────────────────────────────┐  ║
║  │  🔐 CÓDIGO DE VERIFICACIÓN                                              │  ║
║  │                                                                         │  ║
║  │  📲 Revisa tu WhatsApp para obtener el código                          │  ║
║  │  🔢 Formato: ABCD-1234                                                 │  ║
║  │                                                                         │  ║
║  │  ⏰ El código tiene un tiempo limitado de validez                      │  ║
║  └─────────────────────────────────────────────────────────────────────────┘  ║
╚═══════════════════════════════════════════════════════════════════════════════╝
`

const qrMessage = `
╔═══════════════════════════════════════════════════════════════════════════════╗
║                                                                               ║
║   ██████╗ ██████╗      ██████╗ ██████╗ ██████╗ ███████╗                     ║
║  ██╔═══██╗██╔══██╗    ██╔════╝██╔═══██╗██╔══██╗██╔════╝                     ║
║  ██║   ██║██████╔╝    ██║     ██║   ██║██║  ██║█████╗                       ║
║  ██║▄▄ ██║██╔══██╗    ██║     ██║   ██║██║  ██║██╔══╝                       ║
║  ╚██████╔╝██║  ██║    ╚██████╗╚██████╔╝██████╔╝███████╗                     ║
║   ╚══▀▀═╝ ╚═╝  ╚═╝     ╚═════╝ ╚═════╝ ╚═════╝ ╚══════╝                     ║
║                                                                               ║
║  ┌─────────────────────────────────────────────────────────────────────────┐  ║
║  │  📱 ESCANEA EL CÓDIGO QR CON TU WHATSAPP                                │  ║
║  │                                                                         │  ║
║  │  1️⃣  Abre WhatsApp en tu teléfono                                      │  ║
║  │  2️⃣  Ve a Configuración > Dispositivos vinculados                     │  ║
║  │  3️⃣  Toca "Vincular un dispositivo"                                    │  ║
║  │  4️⃣  Escanea el código QR que aparece abajo                           │  ║
║  └─────────────────────────────────────────────────────────────────────────┘  ║
╚═══════════════════════════════════════════════════════════════════════════════╝
`

const connectionMessages = {
    connecting: `
┌─────────────────────────────────────────────────────────────────┐
│  🔄 ESTABLECIENDO CONEXIÓN...                                   │
│                                                                 │
│  ████▒▒▒▒▒▒▒▒▒▒▒▒ 30%                                         │
│                                                                 │
│  🌐 Conectando con los servidores de WhatsApp                  │
│  ⚡ Sincronizando datos del dispositivo                        │
└─────────────────────────────────────────────────────────────────┘`,
    
    connected: `
╔═══════════════════════════════════════════════════════════════════════════════╗
║                                                                               ║
║   ██████╗ ██████╗ ███╗   ██╗███████╗ ██████╗████████╗ █████╗ ██████╗  ██████╗ ║
║  ██╔════╝██╔═══██╗████╗  ██║██╔════╝██╔════╝╚══██╔══╝██╔══██╗██╔══██╗██╔═══██╗║
║  ██║     ██║   ██║██╔██╗ ██║█████╗  ██║        ██║   ███████║██║  ██║██║   ██║║
║  ██║     ██║   ██║██║╚██╗██║██╔══╝  ██║        ██║   ██╔══██║██║  ██║██║   ██║║
║  ╚██████╗╚██████╔╝██║ ╚████║███████╗╚██████╗   ██║   ██║  ██║██████╔╝╚██████╔╝║
║   ╚═════╝ ╚═════╝ ╚═╝  ╚═══╝╚══════╝ ╚═════╝   ╚═╝   ╚═╝  ╚═╝╚═════╝  ╚═════╝ ║
║                                                                               ║
║  ┌─────────────────────────────────────────────────────────────────────────┐  ║
║  │  🎉 ¡MAYBOT ESTÁ ONLINE Y LISTO PARA ACCIÓN!                           │  ║
║  │                                                                         │  ║
║  │  ✅ Conexión establecida exitosamente                                  │  ║
║  │  🚀 Todos los sistemas operativos                                      │  ║
║  │  📱 Bot activo y monitoreando mensajes                                 │  ║
║  │  🔧 Plugins cargados y funcionando                                     │  ║
║  └─────────────────────────────────────────────────────────────────────────┘  ║
╚═══════════════════════════════════════════════════════════════════════════════╝`,
    
    reconnecting: `
┌─────────────────────────────────────────────────────────────────┐
│  🔄 RECONECTANDO...                                             │
│                                                                 │
│  ████████▒▒▒▒▒▒▒▒ 60%                                         │
│                                                                 │
│  ⚠️  Conexión perdida, reestableciendo enlace                  │
│  ⏰ Reintentando en 5 segundos...                              │
└─────────────────────────────────────────────────────────────────┘`,
    
    closed: `
╔═══════════════════════════════════════════════════════════════════════════════╗
║                                                                               ║
║   ██████╗███████╗██████╗ ██████╗  █████╗ ██████╗  ██████╗                   ║
║  ██╔════╝██╔════╝██╔══██╗██╔══██╗██╔══██╗██╔══██╗██╔═══██╗                  ║
║  ██║     █████╗  ██████╔╝██████╔╝███████║██║  ██║██║   ██║                  ║
║  ██║     ██╔══╝  ██╔══██╗██╔══██╗██╔══██║██║  ██║██║   ██║                  ║
║  ╚██████╗███████╗██║  ██║██║  ██║██║  ██║██████╔╝╚██████╔╝                  ║
║   ╚═════╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝  ╚═════╝                   ║
║                                                                               ║
║  ┌─────────────────────────────────────────────────────────────────────────┐  ║
║  │  🔌 CONEXIÓN TERMINADA                                                  │  ║
║  │                                                                         │  ║
║  │  📴 MayBot se ha desconectado del servidor                             │  ║
║  │  🔄 Para reiniciar, ejecuta el bot nuevamente                          │  ║
║  └─────────────────────────────────────────────────────────────────────────┘  ║
╚═══════════════════════════════════════════════════════════════════════════════╝`
}

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
        this.prefix = '.'
        this.loadCommands()
    }

    displayBanner() {
        console.clear()
        console.log(banner)
        setTimeout(() => {
            console.log('🔥 Inicializando MayBot...')
        }, 1000)
    }

    async loadCommands() {
        const commandsPath = './MayPlugins'
        
        if (!fs.existsSync(commandsPath)) {
            fs.mkdirSync(commandsPath, { recursive: true })
            console.log(`${successful}
📁 Directorio MayPlugins creado exitosamente
🎯 Ubicación: ./MayPlugins/
💡 Aquí puedes agregar tus plugins personalizados`)
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
                    console.log(`${error}
❌ Error cargando plugin: ${file}
🔍 Motivo: ${error.message}
💡 Verifica la sintaxis del archivo`)
                }
            }
            
            console.log(`${successful}
📚 Sistema de plugins inicializado
🔢 Total de comandos cargados: ${this.commands.size}
⚡ Todos los plugins están listos para usar`)
        } catch (error) {
            console.log(`${error}
❌ Error accediendo a la carpeta MayPlugins
🔍 Motivo: ${error.message}
💡 Verifica que la carpeta exista y tenga permisos`)
        }
    }

    async getAuthMethod() {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        })

        return new Promise((resolve) => {
            console.log(welcomeMessage)
            
            rl.question('\n┌──[ MayBot@Authentication ]─[ ~ ]\n└─▶ Selecciona una opción (1 o 2): ', (answer) => {
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
            console.log(phonePrompt)
            rl.question('\n┌──[ MayBot@Phone ]─[ ~ ]\n└─▶ Número: ', (number) => {
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
            console.log(codePrompt)
            rl.question('\n┌──[ MayBot@Code ]─[ ~ ]\n└─▶ Código: ', (code) => {
                rl.close()
                resolve(code)
            })
        })
    }

    async startBot() {
        this.displayBanner()
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        const authMethod = await this.getAuthMethod()
        const { state, saveCreds } = await useMultiFileAuthState('./session')
        const { version } = await fetchLatestBaileysVersion()

        console.log(`
╔═══════════════════════════════════════════════════════════════════════════════╗
║  🚀 INICIANDO MAYBOT                                                          ║
║                                                                               ║
║  📊 Información del Sistema:                                                  ║
║  ├─ 🔧 MayBailyes v${version.join('.')}                                     ║
║  ├─ 🤖 MayBot v2.0 Ultra Edition                                             ║
║  ├─ 👨‍💻 Desarrollado por: SoyMaycol                                           ║
║  ├─ 🌐 Plataforma: Node.js                                                   ║
║  └─ 📱 Método de Auth: ${authMethod === 'qr' ? 'Código QR' : 'Número de Teléfono'}              ║
╚═══════════════════════════════════════════════════════════════════════════════╝`)

        let phoneNumber = null
        if (authMethod === 'code' && !state.creds.registered) {
            phoneNumber = await this.getPhoneNumber()
        }

        this.sock = makeWASocket({
            version,
            auth: state,
            logger,
            browser: ['MayBot', 'Chrome', '121.0.0.0'],
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
                console.log(qrMessage)
                qrcode.generate(qr, { small: true })
                console.log('\n⏰ El código QR expira en 40 segundos')
            }

            if (connection === 'close') {
                const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut
                console.log(connectionMessages.closed)
                
                if (lastDisconnect?.error?.output?.statusCode === DisconnectReason.badSession) {
                    console.log(`${error}
🗑️  Sesión corrupta detectada
🔧 Eliminando archivos de sesión dañados
🔄 Reinicia MayBot para crear una nueva sesión`)
                    if (fs.existsSync('./session')) {
                        fs.rmSync('./session', { recursive: true, force: true })
                    }
                    process.exit(1)
                }
                
                if (shouldReconnect) {
                    console.log(connectionMessages.reconnecting)
                    setTimeout(() => this.startBot(), 5000)
                } else {
                    console.log(`
╔═══════════════════════════════════════════════════════════════════════════════╗
║  👋 SESIÓN TERMINADA                                                          ║
║                                                                               ║
║  📴 MayBot se ha desconectado permanentemente                                 ║
║  🔄 Para reconectar, reinicia la aplicación                                  ║
║  💡 Asegúrate de que tu WhatsApp esté activo                                 ║
╚═══════════════════════════════════════════════════════════════════════════════╝`)
                    process.exit(1)
                }
            } else if (connection === 'open') {
                console.log(connectionMessages.connected)
            } else if (connection === 'connecting') {
                console.log(connectionMessages.connecting)
                
                if (authMethod === 'code' && phoneNumber && !state.creds.registered) {
                    console.log(`
╔═══════════════════════════════════════════════════════════════════════════════╗
║  📞 ENVIANDO CÓDIGO DE VERIFICACIÓN                                           ║
║                                                                               ║
║  📱 Número de destino: ${phoneNumber}                                        ║
║  ⏰ Generando código de emparejamiento...                                     ║
╚═══════════════════════════════════════════════════════════════════════════════╝`)
                    try {
                        await new Promise(resolve => setTimeout(resolve, 5000))
                        const code = await this.sock.requestPairingCode(phoneNumber)
                        console.log(`
╔═══════════════════════════════════════════════════════════════════════════════╗
║  🔐 CÓDIGO DE EMPAREJAMIENTO GENERADO                                         ║
║                                                                               ║
║  ┌─────────────────────────────────────────────────────────────────────────┐  ║
║  │                                                                         │  ║
║  │                        🔢 ${code}                        │  ║
║  │                                                                         │  ║
║  └─────────────────────────────────────────────────────────────────────────┘  ║
║                                                                               ║
║  📲 INSTRUCCIONES:                                                            ║
║  1️⃣  Abre WhatsApp en tu teléfono                                            ║
║  2️⃣  Ve a: Configuración > Dispositivos Vinculados                          ║
║  3️⃣  Toca: "Vincular Dispositivo"                                            ║
║  4️⃣  Selecciona: "Vincular con número de teléfono"                           ║
║  5️⃣  Ingresa el código: ${code}                                              ║
║                                                                               ║
║  ⚠️  IMPORTANTE: El código expira en 20 segundos                              ║
╚═══════════════════════════════════════════════════════════════════════════════╝`)
                    } catch (error) {
                        console.log(`${error}
❌ Error solicitando código de emparejamiento
🔍 Motivo: ${error.message}
🔄 Reintentando en 5 segundos...`)
                        setTimeout(async () => {
                            try {
                                const code = await this.sock.requestPairingCode(phoneNumber)
                                console.log(`
╔═══════════════════════════════════════════════════════════════════════════════╗
║  🔄 NUEVO CÓDIGO GENERADO                                                     ║
║                                                                               ║
║  🔢 Código: ${code}                                                          ║
║  ⏰ Válido por 20 segundos                                                    ║
╚═══════════════════════════════════════════════════════════════════════════════╝`)
                            } catch (retryError) {
                                console.log(`${error}
❌ Error en segundo intento: ${retryError.message}
💡 Verifica tu conexión a internet y el número de teléfono`)
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
                    console.log(`
┌─────────────────────────────────────────────────────────────────┐
│  🚀 EJECUTANDO COMANDO                                          │
│                                                                 │
│  📝 Comando: ${commandName}                                    │
│  👤 Usuario: ${message.key.participant || message.key.remoteJid} │
│  💬 Chat: ${message.key.remoteJid}                             │
│  🔧 Plugin: ${fileName}                                        │
└─────────────────────────────────────────────────────────────────┘`)

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

                    console.log(`${successful}
✅ Comando ejecutado exitosamente
🎯 Plugin: ${fileName}
⚡ Comando: ${commandName}`)
                } catch (error) {
                    console.log(`${error}
❌ Error ejecutando comando
🔧 Plugin: ${fileName}
💥 Motivo: ${error.message}
📍 Línea de error: ${error.stack?.split('\n')[1] || 'No disponible'}`)
                    await this.sock.sendMessage(message.key.remoteJid, {
                        text: `╔═══════════════════════════════════════╗
║  ⚠️  ERROR EN COMANDO                 ║
║                                       ║
║  🤖 MayBot encontró un problema       ║
║  🔧 Comando: ${commandName}                    ║
║  💥 ${error.message}                  ║
║                                       ║
║  💡 Contacta al administrador         ║
╚═══════════════════════════════════════╝`
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

console.log(`
╔═══════════════════════════════════════════════════════════════════════════════╗
║                                                                               ║
║   ██╗███╗   ██╗██╗ ██████╗██╗ █████╗ ███╗   ██╗██████╗  ██████╗              ║
║   ██║████╗  ██║██║██╔════╝██║██╔══██╗████╗  ██║██╔══██╗██╔═══██╗             ║
║   ██║██╔██╗ ██║██║██║     ██║███████║██╔██╗ ██║██║  ██║██║   ██║             ║
║   ██║██║╚██╗██║██║██║     ██║██╔══██║██║╚██╗██║██║  ██║██║   ██║             ║
║   ██║██║ ╚████║██║╚██████╗██║██║  ██║██║ ╚████║██████╔╝╚██████╔╝             ║
║   ╚═╝╚═╝  ╚═══╝╚═╝ ╚═════╝╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝╚═════╝  ╚═════╝              ║
║                                                                               ║
║  ┌─────────────────────────────────────────────────────────────────────────┐  ║
║  │  🤖 Preparando MayBot para la acción...                                │  ║
║  │  ⚡ Cargando módulos del sistema                                        │  ║
║  │  🔧 Inicializando componentes                                          │  ║
║  └─────────────────────────────────────────────────────────────────────────┘  ║
╚═══════════════════════════════════════════════════════════════════════════════╝`)

const bot = new WhatsAppBot()
bot.startBot().catch(error => {
    console.log(`${error}
💥 Error crítico en MayBot
🔍 Motivo: ${error.message}
📍 Stack: ${error.stack}
🔄 Reinicia la aplicación`)
})

process.on('SIGINT', () => {
    console.log(`
╔═══════════════════════════════════════════════════════════════════════════════╗
║                                                                               ║
║  ████████╗███████╗██████╗ ███╗   ███╗██╗███╗   ██╗ █████╗ ███╗   ██╗██████╗  ║
║  ╚══██╔══╝██╔════╝██╔══██╗████╗ ████║██║████╗  ██║██╔══██╗████╗  ██║██╔══██╗ ║
║     ██║   █████╗  ██████╔╝██╔████╔██║██║██╔██╗ ██║███████║██╔██╗ ██║██║  ██║ ║
║     ██║   ██╔══╝  ██╔══██╗██║╚██╔╝██║██║██║╚██╗██║██╔══██║██║╚██╗██║██║  ██║ ║
║     ██║   ███████╗██║  ██║██║ ╚═╝ ██║██║██║ ╚████║██║  ██║██║ ╚████║██████╔╝ ║
║     ╚═╝   ╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝╚═╝  ╚═══╝╚═════╝  ║
║                                                                               ║
║  ┌─────────────────────────────────────────────────────────────────────────┐  ║
║  │  👋 MayBot se está cerrando de forma segura                             │  ║
║  │  💾 Guardando datos de sesión                                          │  ║
║  │  🔌 Desconectando servicios                                            │  ║
║  │                                                                         │  ║
║  │  ✨ ¡Gracias por usar MayBot!                                          │  ║
║  │  💻 Desarrollado con ❤️  por SoyMaycol                                 │  ║
║  └─────────────────────────────────────────────────────────────────────────┘  ║
╚═══════════════════════════════════════════════════════════════════════════════╝`)
    process.exit(0)
})

process.on('uncaughtException', (error) => {
    console.log(`${error}
💥 Excepción no capturada en MayBot
🔍 Error: ${error.message}
📍 Stack: ${error.stack}
🚨 Esto puede indicar un problema serio`)
})

process.on('unhandledRejection', (error) => {
    console.log(`${error}
⚠️  Promesa rechazada en MayBot
🔍 Error: ${error.message}
📍 Origen: ${error.stack}
💡 Verifica las operaciones asíncronas`)
})