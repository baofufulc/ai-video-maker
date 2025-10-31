const btn = document.getElementById("generateBtn");
const video = document.getElementById("outputVideo");
const statusDiv = document.getElementById("status");
const link = document.getElementById("downloadLink");

btn.onclick = async () => {
  const text = document.getElementById("textInput").value.trim();
  if (!text) return alert("请输入文字内容！");
  statusDiv.innerText = "🎤 正在分析情感并生成语音...";
  video.src = "";
  link.style.display = "none";

  try {
    // 1️⃣ 文本情绪分析
    let mood = "平静";
    if (text.match(/孤独|寂寞|心酸|想念/)) mood = "忧伤";
    else if (text.match(/梦想|拼命|奋斗|勇敢/)) mood = "励志";
    else if (text.match(/希望|阳光|美好|温暖/)) mood = "温暖";
    else if (text.match(/夜|回忆|遗憾/)) mood = "怀旧";

    // 2️⃣ 背景类型
    let bgType = "自然风景";
    if (mood === "忧伤" || mood === "怀旧") bgType = "夜景";
    else if (mood === "励志") bgType = "城市";
    else if (mood === "温暖") bgType = "海边";

    // 3️⃣ 根据情绪选择男声 Voice ID（ElevenLabs）
    const voiceMap = {
      "平静": "pNInz6obpgDQGcFmaJgB", // 柔和语气
      "励志": "TxGEqnHWrfWFTfGW9XjX", // 坚定有力
      "忧伤": "ErXwobaYiN019PkySvjV", // 低沉悲伤
      "温暖": "VR6AewLTigWG4xSOukaG", // 温柔
      "怀旧": "nPczCjzI2devNBz1zQrb"  // 稍沉稳
    };
    const voice_id = voiceMap[mood];

    // 4️⃣ 调用 ElevenLabs 中文男声生成语音
    const elevenResp = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice_id}`, {
      method: "POST",
      headers: {
        "xi-api-key": "GbMQTKbKAaynPhLfDArMMybmhYANaeea",  // ← ✅ 你的 ElevenLabs Key
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: { stability: 0.45, similarity_boost: 0.9 }
      })
    });

    if (!elevenResp.ok) throw new Error("语音生成失败，请检查 ElevenLabs Key");

    const audioBlob = await elevenResp.blob();
    const audioUrl = URL.createObjectURL(audioBlob);

    statusDiv.innerText = `🎬 检测为【${mood}】情绪，正在生成${bgType}背景视频...`;

    // 5️⃣ 调用 KlingAI 生成竖屏视频
    const klingResp = await fetch("https://api.klingai.cn/v1/video/generate", {
      method: "POST",
      headers: {
        "Authorization": "Bearer AfreDn3pFyRJdHC8yTnrPEkGdEtrePTa", // ← ✅ 你的 KlingAI Key
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        prompt: `一段${bgType}的真实竖屏视频，氛围与以下文字匹配：${text}`,
        aspect_ratio: "9:16"
      })
    });

    if (!klingResp.ok) throw new Error("KlingAI 请求失败，请检查 Key 或额度");

    const klingData = await klingResp.json();

    // ✅ 修正点：KlingAI 返回的数据结构不同，防止 video_url undefined
    const bgVideoUrl = klingData?.data?.video_url || klingData?.video_url;
    if (!bgVideoUrl) throw new Error("未返回视频URL，请检查 KlingAI 返回内容");

    statusDiv.innerText = "🧩 视频与语音合成中...";

    // 6️⃣ 同步播放视频 + 音频（改进点：视频加载后再播放音频）
    video.src = bgVideoUrl;
    video.onloadeddata = () => {
      video.play();
      const audio = new Audio(audioUrl);
      audio.play();
    };

    // 7️⃣ 下载链接
    link.href = bgVideoUrl;
    link.style.display = "inline";
    statusDiv.innerText = "✅ 视频生成完成！";
  } catch (err) {
    console.error("错误详情：", err);
    statusDiv.innerText = "❌ 出现错误：" + err.message;
  }
};
