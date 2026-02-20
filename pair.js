import makeWASocket, {
  useMultiFileAuthState,
  fetchLatestBaileysVersion
} from "@whiskeysockets/baileys";
import readlineSync from "readline-sync";
import qrcode from "qrcode-terminal";
import pino from "pino";

console.clear();
console.log("📱 COBRA BROKEN BOT — PAIRING (CODE + QR MODE)");
console.log("==============================================\n");

const number = readlineSync.question(
  "👉 Ingiza namba ya WhatsApp (mfano: 2557XXXXXXXX): "
);

if (!number.startsWith("255")) {
  console.log("\n❌ Namba lazima ianze na 255");
  process.exit(0);
}

async function startPairing() {
  const { state, saveCreds } = await useMultiFileAuthState("./auth");
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: false,
    logger: pino({ level: "silent" })
  });

  let codePrinted = false;
  let qrFallback = false;

  sock.ev.on("connection.update", async (update) => {
    const { qr, connection } = update;

    // 1️⃣ JARIBU PAIRING CODE MARA MOJA TU
    if (!codePrinted && !qrFallback) {
      try {
        const code = await sock.requestPairingCode(number);
        codePrinted = true;

        console.log("\n📌 Pairing Code Yako:");
        console.log("👉 " + code + "\n");
        console.log("⚡ Ingia WhatsApp > Linked Devices > Add Device");
        console.log("⚡ Chagua 'Link with phone number'");
        console.log("⚡ Weka code hiyo kuunganisha bot\n");
      } catch (e) {
        console.log("\n❌ Pairing code imekataa. Tunahamia QR mode...\n");
        qrFallback = true;
      }
    }

    // 2️⃣ KAMA CODE IMEKATAA → TOA QR
    if (qr && qrFallback) {
      console.log("📌 Scan QR hii kuunganisha bot:\n");
      qrcode.generate(qr, { small: true });
      console.log("\n⚡ Scan QR kwenye WhatsApp > Linked Devices\n");
    }

    // 3️⃣ KAMA IMEUNGANIKA
    if (connection === "open") {
      console.log("\n✅ Pairing complete! Sasa run: bash broken.sh\n");
      await saveCreds();
      process.exit(0);
    }

    // 4️⃣ KAMA IMEKATAA
    if (connection === "close") {
      console.log("\n❌ Pairing imekatika. Jaribu tena: node pair.js\n");
      process.exit(1);
    }
  });

  sock.ev.on("creds.update", saveCreds);
}

startPairing();
