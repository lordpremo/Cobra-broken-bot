async function generateCode() {
  const number = document.getElementById("number").value;
  const box = document.getElementById("resultBox");

  if (!number) {
    box.innerHTML = "❌ Weka namba kwanza";
    return;
  }

  box.innerHTML = "⏳ Inatengeneza pairing code...";

  try {
    const res = await fetch("https://YOUR_RAILWAY_URL/pair", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ number })
    });

    const data = await res.json();

    if (data.status) {
      box.innerHTML = `
        📌 Pairing Code:<br><br>
        <b>${data.code}</b><br><br>
        <button class="copyBtn" onclick="copyCode('${data.code}')">Copy</button>
      `;
    } else {
      box.innerHTML = "❌ " + data.message;
    }
  } catch (e) {
    box.innerHTML = "❌ Error: " + e.message;
  }
}

function copyCode(code) {
  navigator.clipboard.writeText(code);
  alert("Code copied!");
}
