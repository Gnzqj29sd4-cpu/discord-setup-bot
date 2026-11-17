'use strict';

const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  MessageFlags,
  EmbedBuilder,
} = require('discord.js');
const { theme } = require('../config');
const { saveFrame, saveZone, clearFrameCache, findHole } = require('../lib/frame');

/** "30,8,40,80" → { left: 30, top: 8, width: 40, height: 80 } */
function parseZone(value) {
  if (!value) return null;
  const parts = value.split(',').map((part) => Number.parseFloat(part.trim()));
  if (parts.length !== 4 || parts.some((part) => !Number.isFinite(part))) {
    throw new Error('zone must look like: 30,8,40,80 (left,top,width,height in percent)');
  }
  const [left, top, width, height] = parts;
  return { left, top, width, height };
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('cadre')
    .setDescription('Set the CortisolClips frame applied to every photo posted')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .setDMPermission(false)
    .addAttachmentOption((option) =>
      option
        .setName('image')
        .setDescription('The frame image (PNG)')
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName('zone')
        .setDescription(
          'Optional: photo area as left,top,width,height in percent, e.g. 12,18,76,68',
        )
        .setRequired(false),
    ),

  async execute(interaction) {
    const attachment = interaction.options.getAttachment('image', true);
    const zoneOption = interaction.options.getString('zone');

    if (!(attachment.contentType ?? '').startsWith('image/')) {
      await interaction.reply({
        content: '❌ This file is not an image. Send a PNG.',
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    try {
      const response = await fetch(attachment.url, { signal: AbortSignal.timeout(15_000) });
      if (!response.ok) throw new Error(`Download failed (HTTP ${response.status})`);

      const buffer = Buffer.from(await response.arrayBuffer());

      const zone = parseZone(zoneOption);
      if (zone) saveZone(zone);

      saveFrame(buffer);
      clearFrameCache();

      const hole = await findHole(buffer);

      const embed = new EmbedBuilder()
        .setColor(theme.primary)
        .setTitle('Frame saved')
        .setDescription(
          (hole
            ? `Photo area: **${hole.width} × ${hole.height}** px in a ` +
              `${hole.frameWidth} × ${hole.frameHeight} frame.\n\n`
            : '⚠️ No transparent area found and no zone given.\nUse `zone:left,top,width,height` ' +
              '(in percent) to tell me where the photo goes.\n\n') +
            'Every photo posted from now on is placed inside the frame, ' +
            'with the author nickname at the bottom.\n\n' +
            '**To keep it after a redeploy**, add this variable where the bot runs:\n' +
            `\`FRAME_URL\` = \`${attachment.url}\``,
        )
        .setImage(attachment.url);

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      await interaction.editReply({ content: `❌ ${error.message}` });
    }
  },
};
