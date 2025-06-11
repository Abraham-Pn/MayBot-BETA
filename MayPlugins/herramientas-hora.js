import moment from 'moment-timezone';
import { timezone } from '../settings.js';

let MayBot = async (m, { conn }) => {
  let now = moment().tz(timezone);
  let hora = now.format('HH:mm:ss');
  let fecha = now.format('dddd, DD [de] MMMM [del] YYYY');

  m.reply(`📅 *Fecha:* ${fecha}\n⏰ *Hora:* ${hora}\n🌎 *Zona horaria:* ${timezone}`);
};

MayBot.help = ['hora'];
MayBot.tags = ['info'];
MayBot.command = ['hora', 'tiempo']; // Puedes poner más alias

export default MayBot;
