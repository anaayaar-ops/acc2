import 'dotenv/config';
import * as wolf from 'wolf.js';

// 1. إعدادات البوت
const settings = {
    identity: process.env.U_MAIL,
    secret: process.env.U_PASS,
    gateA: parseInt(process.env.ENTRY_P), // معرف البوت مصدر الطاقة
    gateB: parseInt(process.env.EXIT_P),  // رقم الروم
    trigger: process.env.MATCH_V,         
    action: process.env.EXEC_V,
    myId: "51660277"                      // معرفك الخاص للمطابقة
};

// 2. تعريف العميل
const client = new wolf.WOLF({
    device: wolf.DeviceType.ANDROID
});

// 3. دالة تنفيذ الإرسال
const executeAction = async () => {
    try {
        console.log("🎯 محاولة تنفيذ الإرسال...");
        await client.messaging.sendGroupMessage(settings.gateB, settings.action);
        console.log(`🚀 تم الإرسال بنجاح إلى [${settings.gateB}]`);
    } catch (err) {
        console.error("❌ فشل الإرسال:", err.message);
    }
};

// 4. أحداث البوت
client.on('ready', async () => {
    console.log("------------------------------------------");
    console.log(`✅ تم تسجيل الدخول: ${client.currentSubscriber?.nickname || "غير معروف"}`);
    console.log("------------------------------------------");

    try {
        await client.setOnlineState(wolf.OnlineState.INVISIBLE);
        console.log('تم ضبط الحالة بنجاح إلى: مشغول (Busy)');

        await client.messaging.sendPrivateMessage(settings.gateA, "!س تدريب كل 1");
        console.log("✉️ تم إرسال أمر التدريب التلقائي بنجاح.");
    } catch (err) {
        console.error("❌ حدث خطأ أثناء التجهيز:", err.message);
    }
});

client.on('privateMessage', async (message) => {
    const senderId = message.authorId || message.sourceSubscriberId;
    const text = message.content || message.body || "";

    if (senderId === settings.gateA && text.includes(settings.trigger)) {
        console.log("⚡ رصد رسالة طاقة! جاري الجلد...");
        await executeAction();
    }
});

client.on('groupMessage', async (message) => {
    const text = message.content || message.body || "";

    if (message.targetGroupId === settings.gateB && 
        text.includes("ما زال السباق جاريًا") && 
        text.includes(settings.myId)) {
        
        const match = text.match(/\d+/);
        const waitSeconds = match ? parseInt(match[0]) : 25;
        
        console.log(`⚠️ السباق جارٍ لـ [${settings.myId}]. انتظار ${waitSeconds} ثانية...`);

        setTimeout(async () => {
            console.log("🔄 انتهى الوقت. إعادة محاولة الجلد الآن...");
            await executeAction();
        }, (waitSeconds + 1) * 1000);
    }
});

// 5. تسجيل الدخول
client.login(settings.identity, settings.secret)
    .catch(err => console.error('خطأ في تسجيل الدخول:', err));
