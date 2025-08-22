const { makeWASocket, useMultiFileAuthState } = require("@adiwajshing/baileys")
const cron = require("node-cron")

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState("session")
    const sock = makeWASocket({ auth: state })

    sock.ev.on("creds.update", saveCreds)

    sock.ev.on("connection.update", (update) => {
        const { connection } = update
        if (connection === "open") {
            console.log("✅ تم تسجيل الدخول بنجاح")
        }
    })

    async function sendAdToGroups(adText) {
        const groups = await sock.groupFetchAllParticipating()
        const groupIds = Object.keys(groups)
        console.log("📢 عدد القروبات:", groupIds.length)

        for (let id of groupIds) {
            await sock.sendMessage(id, { text: adText })
            console.log("✔ أُرسل الإعلان إلى:", groups[id].subject)
            await new Promise(r => setTimeout(r, 3000))
        }
    }

    const adMessage = `🎓✨ جميع الخدمات التعليمية في مكان واحد ✨🎓

📚 لا تشيل هم بعد اليوم … نوفر لك كل ما تحتاجه:
✅ حل جميع التكاليف والواجبات
✅ إعداد أبحاث وتقارير ومشاريع
✅ تصميم عروض بوربوينت مميزة
✅ ملفات وورد وإكسل باحترافية
✅ اسايمنت – ميد – فاينل
✅ تلخيص محاضرات وكتب
✅ كتابة سيرة ذاتية احترافية

🧑🏻‍🎓 خدماتنا متاحة لكافة المراحل الدراسية:
📌 طلاب المدارس – الجامعات – الدراسات العليا

🏥 كما نوفر:
📄 إجازات مرضية (صحتي) بتواريخ قديمة وجديدة
👮🏻‍♂️ للعسكريين، الموظفين، الطلاب، والقطاع الحكومي والخاص

📲 للتواصل الفوري عبر الواتساب:
اضغط هنا للتواصل
 https://wa.me/966576797009`

    cron.schedule("0 9 * * *", async () => {
        await sendAdToGroups("🌅 إعلان الصباح:\n\n" + adMessage)
        console.log("⏰ تم إرسال إعلان الصباح.")
    })

    cron.schedule("0 18 * * *", async () => {
        await sendAdToGroups("🌙 إعلان المساء:\n\n" + adMessage)
        console.log("⏰ تم إرسال إعلان المساء.")
    })

    sock.ev.on("messages.upsert", async (m) => {
        const msg = m.messages[0]
        if (!msg.message) return
        const text = msg.message.conversation || ""

        if (text.startsWith("انشر")) {
            const adText = text.replace("انشر", "").trim() || adMessage
            await sendAdToGroups(adText)
        }
    })
}

startBot()