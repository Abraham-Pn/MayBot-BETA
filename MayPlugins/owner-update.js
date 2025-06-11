import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { owner } from '../settings.js';

const execAsync = promisify(exec);
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

let MayBot = async (m, { conn }) => {
  if (!owner.includes(m.sender)) {
    return conn.reply(m.chat, '⛔ Solo el dueño puede usar este comando.', m);
  }

  m.reply(`${emoji2} Actualizando el bot...`);

  try {
    const { stdout, stderr } = await execAsync('git pull');

    if (stderr) console.warn('Advertencia durante la actualización:', stderr);

    if (stdout.includes('Already up to date.')) {
      return conn.reply(m.chat, `${emoji4} El bot ya está actualizado.`, m);
    }

    conn.reply(m.chat, `${emoji} Actualización realizada con éxito.\n\n${stdout}`, m);

    await delay(2000); // Esperamos 2 segundos

    const updatedFiles = stdout
      .split('\n')
      .filter(line => line.match(/\.js$/))
      .map(line => line.trim().split('|')[0].trim());

    for (let file of updatedFiles) {
      let fullPath = path.resolve(process.cwd(), file);
      if (fs.existsSync(fullPath)) {
        delete require.cache[require.resolve(fullPath)];
        try {
          require(fullPath);
          console.log(`✅ Recargado: ${file}`);
        } catch (err) {
          console.error(`❌ Error al recargar ${file}:`, err);
        }
      }
    }

    conn.reply(m.chat, '✨ Archivos recargados sin reiniciar el bot ✨', m);

  } catch (err) {
    conn.reply(m.chat, `❌ Error al actualizar: ${err.message}`, m);
  }
};

MayBot.ejemplo = ['update'];
MayBot.tag = ['owner'];
MayBot.comando = ['update'];
MayBot.descripcion = ['Este comando matiene al bot activo y esta disponible solo para los creadores del bot.'];
MayBot.rowner = true;

export default MayBot
