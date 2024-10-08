// rush md wa bot








// ❐▓▓▓▓▓▓❐        ❐▓❐      ❐▓❐        ❐▓▓▓▓▓▓▓▓❐         ❐▓❐
// ❐▓❐❐❐▓❐         ❐▓❐      ❐▓❐        ❐▓                   ❐▓❐
// ❐▓❐   ▓❐         ❐▓❐      ❐▓❐        ❐▓▓▓▓▓▓▓▓❐         ❐▓▓▓▓▓▓▓▓▓❐
// ❐▓▓▓▓▓▓❐         ❐▓❐      ❐▓❐                 ▓❐         ❐▓❐      ❐▓❐       
// ❐▓❐      ▛❐       ❐▓❐      ❐▓❐                 ▓❐         ❐▓❐      ❐▓❐
// ❐▓        ▛❐       ❐▓▓▓▓▓▓▓▓▓❐      ❐▓▓▓▓▓▓▓▓▓❐         ❐▓❐      ❐▓❐
                             

















import pkg, { prepareWAMessageMedia } from '@whiskeysockets/baileys';
const { generateWAMessageFromContent, proto } = pkg;
import pkgg from 'nayan-media-downloader';
const { tikdown } = pkgg;


const searchResultsMap = new Map();
let searchIndex = 1;

const tiktokCommand = async (m, Matrix) => {
  let selectedListId;
  const selectedButtonId = m?.message?.templateButtonReplyMessage?.selectedId;
  const interactiveResponseMessage = m?.message?.interactiveResponseMessage;

  if (interactiveResponseMessage) {
    const paramsJson = interactiveResponseMessage.nativeFlowResponseMessage?.paramsJson;
    if (paramsJson) {
      const params = JSON.parse(paramsJson);
      selectedListId = params.id;
    }
  }

  const selectedId = selectedListId || selectedButtonId;

  const prefixMatch = m.body.match(/^[\\/!#.]/);
  const prefix = prefixMatch ? prefixMatch[0] : '/';
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
  const text = m.body.slice(prefix.length + cmd.length).trim();

  const validCommands = ['tiktok', 'tt', 'ttdl'];

  if (validCommands.includes(cmd)) {
    if (!text) {
      return m.reply('TIKTOK URL එක දිය යුතුයි.');
    }

    try {
      await m.React("📤");


      const tikTokData = await tikdown(text);
      if (!tikTokData.status) {
        await m.reply('No results found.');
        await m.React("❌");
        return;
      }


      searchResultsMap.set(searchIndex, tikTokData);


      const currentResult = searchResultsMap.get(searchIndex);
      const buttons = [
        {
          "name": "quick_reply",
          "buttonParamsJson": JSON.stringify({
            display_text: "✨PENETI VIDEO",
            id: `media_video_${searchIndex}`
          })
        },
        {
          "name": "quick_reply",
          "buttonParamsJson": JSON.stringify({
            display_text: "🎵 MUSIC",
            id: `media_audio_${searchIndex}`
          })
        }
      ];

      const msg = generateWAMessageFromContent(m.from, {
        viewOnceMessage: {
          message: {
            messageContextInfo: {
              deviceListMetadata: {},
              deviceListMetadataVersion: 2
            },
            interactiveMessage: proto.Message.InteractiveMessage.create({
              body: proto.Message.InteractiveMessage.Body.create({
                text: `𝗣𝗘𝗡𝗘𝗧𝗜-𝗠𝗗 TikTok Download\n\nTitle: ${currentResult.data.title}\nAuthor: ${currentResult.data.author.nickname}\nViews: ${currentResult.data.view}\nDuration: ${currentResult.data.duration}s\n`
              }),
              footer: proto.Message.InteractiveMessage.Footer.create({
                text: "® Powered By 𝗣𝗘𝗡𝗘𝗧𝗜-𝗠𝗗"
              }),
              header: proto.Message.InteractiveMessage.Header.create({
                 ...(await prepareWAMessageMedia({ image: { url: `https://telegra.ph/file/e1fd8689e69a7baa4920d.jpg` } }, { upload: Matrix.waUploadToServer })),
                title: "",
                gifPlayback: true,
                subtitle: "",
                hasMediaAttachment: false 
              }),
              nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                buttons
              }),
              contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 9999,
                isForwarded: true,
              }
            }),
          },
        },
      }, {});

      await Matrix.relayMessage(msg.key.remoteJid, msg.message, {
        messageId: msg.key.id
      });
      await m.React("✨");

      searchIndex += 1; 
    } catch (error) {
      console.error("Error:", error);
      await m.reply('Error.');
      await m.React("❌");
    }
  } else if (selectedId) { 
    if (selectedId.startsWith('media_')) {
      const parts = selectedId.split('_');
      const type = parts[1];
      const key = parseInt(parts[2]);
      const selectedMedia = searchResultsMap.get(key);

      if (selectedMedia) {
        try {
          const videoUrl = selectedMedia.data.video;
          const audioUrl = selectedMedia.data.audio;
          let finalMediaBuffer, mimeType, content;

          if (type === 'video') {
            finalMediaBuffer = await getStreamBuffer(videoUrl);
            mimeType = 'video/mp4';
          } else if (type === 'audio') {
            finalMediaBuffer = await getStreamBuffer(audioUrl);
            mimeType = 'audio/mpeg';
          }

          const fileSizeInMB = finalMediaBuffer.length / (1024 * 1024);

          if (type === 'video' && fileSizeInMB <= 300) {
            content = { video: finalMediaBuffer, mimetype: 'video/mp4', caption: '> ® Powered by 𝗥𝗨𝗦𝗛-𝗠𝗗' };
          } else if (type === 'audio' && fileSizeInMB <= 300) {
            content = { audio: finalMediaBuffer, mimetype: 'audio/mpeg', caption: '> ® Powered by 𝗥𝗨𝗦𝗛-𝗠𝗗' };
          }

          await Matrix.sendMessage(m.from, content, { quoted: m });
        } catch (error) {
          console.error("Error:", error);
          await m.reply('Error.');
          await m.React("❌");
        }
      }
    }
  }
};

const getStreamBuffer = async (url) => {
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  return Buffer.from(buffer);
};

export default tiktokCommand;

