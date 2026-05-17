import 'dotenv/config';
import wolfjs from 'wolf.js';

const { WOLF } = wolfjs;

const settings = {
    identity: process.env.U_MAIL,
    secret: process.env.U_PASS,
    gateA: parseInt(process.env.ENTRY_P), // معرف البوت مصدر الطاقة
    gateB: parseInt(process.env.EXIT_P),  // رقم الروم
    trigger: process.env.MATCH_V,         
    action: process.env.EXEC_V,
    myId: "80055399 "                      // معرفك الخاص للمطابقة
};

const service = new WOLF({
    presence: {
        onlineState: 2 // نطلب من المكتبة الدخول مباشرة بحالة "مشغول" 
    }}) ;


// دالة الإرسال الأصلية الخاصة بك معالجة داخل وظيفة مستقلة لتسهيل استدعائها
const executeAction = async () => {
    try {
        console.log("🎯 محاولة تنفيذ الإرسال...");
        await service.messaging.sendGroupMessage(settings.gateB, settings.action);
        console.log(`🚀 تم الإرسال بنجاح إلى [${settings.gateB}]`);
    } catch (err) {
        try {
            await service.messaging().sendGroupMessage(settings.gateB, settings.action);
            console.log(`🚀 تم الإرسال بنجاح (طريقة بديلة)`);
        } catch (innerErr) {
            console.error("❌ فشل الإرسال بكلا الطريقتين:", innerErr.message);
        }
    }
};

service.on('ready', async () => {
    console.log("------------------------------------------");
    console.log(`✅ تم تسجيل الدخول: ${service.currentSubscriber.nickname}`);
    console.log("------------------------------------------");

    try {
        // إضافة كلمة async قبل () جعلت استخدام await ممكناً هنا
        await service.messaging.sendPrivateMessage(settings.gateA, "!س تدريب كل 1");
        console.log("✉️ تم إرسال أمر التدريب التلقائي بنجاح.");
    } catch (err) {
        console.error("❌ فشل إرسال أمر التدريب:", err.message);
    }
});

// 1. الاستجابة لرسالة الطاقة (الخاص)
service.on('privateMessage', async (message) => {
    const senderId = message.authorId || message.sourceSubscriberId;
    const text = message.content || message.body || "";

    if (senderId === settings.gateA && text.includes(settings.trigger)) {
        console.log("⚡ رصد رسالة طاقة! جاري الجلد...");
        await executeAction();
    }
});

// 2. الاستجابة لرسالة "السباق جاري" (الروم) وإعادة المحاولة
service.on('groupMessage', async (message) => {
    const text = message.content || message.body || "";

    // التحقق من الروم + النص + معرفك
    if (message.targetGroupId === settings.gateB && 
        text.includes("ما زال السباق جاريًا") && 
        text.includes(settings.myId)) {
        
        // استخراج الثواني
        const match = text.match(/\d+/);
        const waitSeconds = match ? parseInt(match[0]) : 25;
        
        console.log(`⚠️ السباق جارٍ لـ [${settings.myId}]. انتظار ${waitSeconds} ثانية...`);

        // الانتظار ثم إعادة المحاولة
        setTimeout(async () => {
            console.log("🔄 انتهى الوقت. إعادة محاولة الجلد الآن...");
            await executeAction();
        }, (waitSeconds + 1) * 1000);
    }
});

service.login(settings.identity, settings.secret);
