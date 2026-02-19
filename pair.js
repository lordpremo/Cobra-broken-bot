import makeWASocket, {
  useMultiFileAuthState,
  fetchLatestBaileysVersion
} from "@whiskeysockets/baileys";
import readlineSync from "readline-sync";
import pino from "pino";

console.clear();
console.log("📱 COBRA BROKEN BOT — PAIRING MODE");
console.log("====================================\n");

const number = readlineSync.question(
  "👉 Ingiza namba ya WhatsApp (mfano: 2557XXXXXXXX): "
);

if (!number.startsWith("255")) {
  console.log("\n❌ Namba lazima ianze na 255");
  process.exit(0);
}

async function generateCode() {
  const { state, saveCreds } = await useMultiFileAuthState("./auth");
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: false,
    logger: pino({ level: "silent" })
  });

  let codePrinted = false;

  sock.ev.on("connection.update", async (update) => {
    const { qr, connection, lastDisconnect } = update;

    if (qr && !codePrinted) {
      try {
        const code = await sock.requestPairingCode(number);
        codePrinted = true;

        console.log("\n📌 Pairing Code Yako:");
        console.log("👉 " + code + "\n");
        console.log("⚡ Ingia WhatsApp > Linked Devices > Add Device");
        console.log("⚡ Chagua 'Link with phone number'");
        console.log("⚡ Weka code hiyo kuunganisha bot\n");
      } catch (e) {
        console.log("❌ Imeshindwa kutengeneza code:", e.message || e);
        process.exit(1);
      }
    }

    if (connection === "open") {
      console.log("\n✅ Pairing complete! Sasa run: bash broken.sh\n");
      await saveCreds();
      process.exit(0);
    }

    if (connection === "close") {
      console.log("\n❌ Pairing imekatika. Jaribu tena kwa ku-run: node pair.js\n");
      if (lastDisconnect?.error) {
        console.log("Reason:", lastDisconnect.error?.message || lastDisconnect.error);
      }
      process.exit(1);
    }
  });

  sock.ev.on("creds.update", saveCreds);
}

generateCode();
