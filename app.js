import 'dotenv/config';
import wolfjs from 'wolf.js';

const { WOLF } = wolfjs;

const settings = {
    identity: process.env.U_MAIL,
    secret: process.env.U_PASS,
    gateA: parseInt(process.env.ENTRY_P), // بوت الطاقة (المصدر)
    gateB: parseInt(process.env.EXIT_P),  // رقم الروم (الهدف)
    trigger: process.env.MATCH_V,         
    action: process.env.EXEC_V,
    myId: "51660277"                      // معرفك الخاص
};

const service = new WOLF();

// دالة تنفيذ الإرسال (الجلد)
const executeAction = async () => {
    try {
        await service.messaging.sendGroupMessage(settings.gateB, settings.action);
        console.log(`🚀 [${new Date().toLocaleTimeString()}] تم الجلد بنجاح في الروم [${settings.gateB}]`);
    } catch (err) {
        console.error("❌ فشل الإرسال للروم:", err.message);
    }
};

service.on('ready', async () => {
    console.log("------------------------------------------");
    console.log(`✅ تم تسجيل الدخول: ${service.currentSubscriber.nickname}`);
    console.log("🛠️ بانتظار رسائل البوت المصدر...");
    console.log("------------------------------------------");

    try {
        // إرسال أمر التدريب فقط عند بداية العمل
        await service.messaging.sendPrivateMessage(settings.gateA, "!س تدريب كل 1");
        console.log(`✉️ تم إرسال أمر التدريب التلقائي إلى: ${settings.gateA}`);
    } catch (err) {
        console.error("❌ فشل إرسال أمر التدريب:", err.message);
    }
});

// مراقبة الرسائل
service.on('message', async (message) => {
    const text = message.content?.trim();
    if (!text) return;

    // 1. الاستجابة لرسالة الخاص (تنبيه الطاقة)
    if (message.isPrivate && message.authorId === settings.gateA) {
        if (text.includes(settings.trigger)) {
            console.log("⚡ اكتشاف إشارة الطاقة.. جاري الجلد...");
            await executeAction();
        }
    }

    // 2. الاستجابة لرسالة الروم (إعادة المحاولة)
    if (message.isGroup && message.targetGroupId === settings.gateB) {
        if (text.includes("ما زال السباق جاريًا") && text.includes(settings.myId)) {
            
            const match = text.match(/\d+/);
            const waitSeconds = match ? parseInt(match[0]) : 20;
            
            console.log(`⚠️ زحام! انتظار ${waitSeconds} ثانية للإعادة...`);

            setTimeout(async () => {
                console.log("🔄 إعادة المحاولة الآن...");
                await executeAction();
            }, (waitSeconds + 1) * 1000);
        }
    }
});

service.login(settings.identity, settings.secret);
