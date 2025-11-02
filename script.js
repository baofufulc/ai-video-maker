// AI视频生成器：HuggingFace + KlingAI

const btn = document.getElementById("generateBtn");
const video = document.getElementById("outputVideo");
const statusDiv = document.getElementById("status");
const link = document.getElementById("downloadLink");
const loading = document.getElementById("loading");

// API密钥
const HUGGINGFACE_KEY = "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";
const KLINGAI_KEY = "AfreDn3pFyRJdHC8yTnrPEkGdEtrePTa";

btn.onclick = async () => {
  const text = document.getElementById("inputText").value.trim();
  if (!text) return alert("请输入文字内容！");

  statusDiv.innerText = "🪄 正在分析文字情绪...";
  video.style.display = "none";
  link.style.display = "none";
  loading.classList.remove("hidden");

  try {
    // 🎭 情绪分析
    let mood = "平静";
    if (text.match(/痛苦|难过|失恋|孤独|夜/)) mood = "悲伤";
    else if (text.match(/拼命|努力|梦想|坚持/)) mood = "励志";
    else if (text.match(/幸福|温暖|笑/)) mood = "温暖";
    else mood = "治愈";

    // 背景类型
    let bgType = "夜景";
    if (mood === "悲伤") bgType = "夜景";
    else if (mood === "励志") bgType = "城市";
    else if (mood === "温暖") bgType = "阳光";
    else bgType = "星空";

    statusDiv.innerText = `🎧 检测到情绪：${mood}，生成语音中...`;

    // 🗣️ 调用 HuggingFace 生成语音
    const ttsUrl = "https://api-inference.huggingface.co/models/facebook/mms-tts-zh";
    const ttsResp = await fetch(ttsUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HUGGINGFACE_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ inputs: text })
    });

    if (!ttsResp.ok) throw new Error("语音生成失败！");
    const audioBlob = await ttsResp.blob();
    const audioUrl = URL.createObjectURL(audioBlob);

    statusDiv.innerText = "🎬 语音生成完成，合成视频中...";

    // 🎥 调用 KlingAI 生成视频
    const klingResp = await fetch("https://api.klingai.com/generate", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${KLINGAI_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        prompt: `${mood}风格的${bgType}视频，配合旁白：${text}`,
        voice: "male",
        audio_url: audioUrl
      })
    });

    if (!klingResp.ok) throw new Error("KlingAI 视频生成失败！");
    const klingData = await klingResp.json();
    const videoUrl = klingData.video_url || klingData.data?.video_url;
    if (!videoUrl) throw new Error("未返回视频链接！");

    // ✅ 显示视频
    video.src = videoUrl;
    video.style.display = "block";
    link.href = videoUrl;
    link.download = "生成视频.mp4";
    link.innerText = "⬇️ 下载视频";
    link.style.display = "block";

    statusDiv.innerText = "✅ 视频生成完成，点击下方下载。";

  } catch (err) {
    console.error(err);
    statusDiv.innerText = `❌ 出错：${err.message}`;
  } finally {
    loading.classList.add("hidden");
  }
};
