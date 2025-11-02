// 🎬 AI 情感短视频生成器 v15 (Cloudflare 版修正版)
// 适配 Cloudflare Pages + Workers 环境
// Made by baofufulc & aimingwang08

const btn = document.getElementById("generateBtn");
const video = document.getElementById("outputVideo");
const statusDiv = document.getElementById("status");
const link = document.getElementById("downloadLink");
const loading = document.getElementById("loading");

// 💡 自动识别后端 Worker 地址
const BASE =
  (typeof WORKER_BASE !== "undefined" && WORKER_BASE) ||
  "https://tts-ai-worker.aimingwang08.workers.dev";

// 🔑 API 密钥（推荐放在 Worker 中，不要放这里）
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

    // 🗣️ 调用 HuggingFace 生成语音（通过 Worker 转发）
    const ttsResp = await fetch(`${BASE}/tts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, key: HUGGINGFACE_KEY }),
    });

    if (!ttsResp.ok) throw new Error("语音生成失败！");
    const ttsData = await ttsResp.json();
    if (!ttsData.audioUrl) throw new Error("未返回语音 URL！");
    const audioUrl = ttsData.audioUrl;

    statusDiv.innerText = "🎬 语音生成完成，合成视频中...";

    // 🎥 调用 KlingAI 生成视频（同样通过 Worker 转发）
    const videoResp = await fetch(`${BASE}/video`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        mood,
        bgType,
        audioUrl,
        key: KLINGAI_KEY,
      }),
    });

    if (!videoResp.ok) throw new Error("KlingAI 视频生成失败！");
    const videoData = await videoResp.json();
    const videoUrl = videoData.videoUrl;
    if (!videoUrl) throw new Error("未返回视频链接！");

    // ✅ 显示视频和下载链接
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
