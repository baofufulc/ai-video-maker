const btn = document.getElementById("generateBtn");
const video = document.getElementById("outputVideo");
const statusDiv = document.getElementById("status");
const link = document.getElementById("downloadLink");

btn.onclick = async () => {
  const text = document.getElementById("inputText").value.trim();
  if (!text) return alert("请输入文字内容！");
  statusDiv.innerText = "🧠 正在分析文字情感...";
  video.src = "";
  link.style.display = "none";

  try {
    // 🎯 1. 文本情绪自动分析
    let mood = "平静";
    if (text.match(/痛|伤|泪|孤独|难过|失去|心碎/)) mood = "伤感";
    else if (text.match(/梦想|努力|坚持|希望|成功/)) mood = "励志";
    else if (text.match(/想念|回忆|曾经|爱过/)) mood = "思念";
    else if (text.match(/告别|再见|离开|放下/)) mood = "告别";

    statusDiv.innerText = `🎵 检测到情感：${mood}，正在生成语音...`;

    // 🎤 2. 使用 HuggingFace 免费语音（中文男声）
    const ttsUrl = "https://api-inference.huggingface.co/models/facebook/mms-tts-zh";
    const ttsResp = await fetch(ttsUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inputs: text })
    });

    if (!ttsResp.ok) throw new Error("语音生成失败！");
    const audioBlob = await ttsResp.blob();
    const audioUrl = URL.createObjectURL(audioBlob);

    statusDiv.innerText = `🎬 已生成语音，正在生成背景视频（${mood}风格）...`;

    // 🌄 3. 自动选择背景类型
    let bgType = "夜景";
    if (mood === "励志") bgType = "城市";
    else if (mood === "伤感") bgType = "雨夜";
    else if (mood === "思念") bgType = "夕阳";
    else if (mood === "告别") bgType = "旅途";

    // 🪄 4. 生成视频（调用 KlingAI）
    const klingResp = await fetch("https://api.klingai.com/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: `${mood}风格的${bgType}视频，搭配中文旁白`,
        voice: "male",
        audio_url: audioUrl
      })
    });

    if (!klingResp.ok) throw new Error("KlingAI 视频生成失败！");
    const klingData = await klingResp.json();
    const videoUrl = klingData.video_url || klingData.data?.video_url;

    // 🧩 5. 播放 & 提供下载
    if (!videoUrl) throw new Error("视频链接生成失败！");
    video.src = videoUrl;
    video.style.display = "block";
    link.href = videoUrl;
    link.download = "AI情感短视频.mp4";
    link.innerText = "⬇️ 下载视频";
    link.style.display = "block";
    statusDiv.innerText = "✅ 视频生成完成！";

  } catch (err) {
    console.error(err);
    statusDiv.innerText = "❌ 生成失败：" + err.message;
  }
};
