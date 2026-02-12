import 'dotenv/config';
import wolfjs from 'wolf.js';

const { WOLF } = wolfjs;

const settings = {
    identity: process.env.U_MAIL,
    secret: process.env.U_PASS,
    gateA: parseInt(process.env.ENTRY_P), 
    gateB: parseInt(process.env.EXIT_P),  
    trigger: process.env.MATCH_V,         
    action: process.env.EXEC_V,           
    myId: "80055399"                      
};

const service = new WOLF();

const delay = (ms) => new Promise(res => setTimeout(res, ms));

const runFullCycle = async () => {
    try {
        // الجلد الأول (بدون أقواس كما أكد الـ CMD)
        console.log("⚔️ تنفيذ الجلد الأول...");
        await service.messaging.sendGroupMessage(settings.gateB, settings.action);
        
        console.log("⏳ انتظار 43 ثانية...");
        await delay(43000);
        
        // الجلد الثاني
        console.log("⚔️ تنفيذ الجلد الثاني...");
        await service.messaging.sendGroupMessage(settings.gateB, settings.action);
        
        await delay(2000); 
        console.log("🏋️ إرسال أمر التدريب في الخاص...");
        await service.messaging.sendPrivateMessage(settings.gateA, "!س تدريب كل 60");
        
        console.log("✅ الدورة اكتملت بنجاح.");
    } catch (err) {
        console.error("❌ خطأ في التنفيذ:", err.message);
    }
};

service.on('ready', () => {
    console.log("------------------------------------------");
    console.log("✅ System Online: Monitoring Signals...");
    console.log("------------------------------------------");
});

service.on('privateMessage', async (message) => {
    const senderId = message.authorId || message.sourceSubscriberId;
    const text = message.content || message.body || "";

    if (senderId === settings.gateA && text.includes(settings.trigger)) {
        console.log("⚡ رصد اكتمال الطاقة! بدء العمل...");
        await runFullCycle();
    }
});

service.on('groupMessage', async (message) => {
    const text = message.content || message.body || "";
    if (message.targetGroupId === settings.gateB && 
        text.includes("ما زال السباق جاريًا") && 
        text.includes(settings.myId)) {
        
        const match = text.match(/\d+/);
        const waitSeconds = match ? parseInt(match[0]) : 20;
        
        console.log(`⚠️ الروم مشغول. إعادة المحاولة بعد ${waitSeconds} ثانية...`);
        setTimeout(async () => {
            await service.messaging.sendGroupMessage(settings.gateB, settings.action);
        }, (waitSeconds + 1) * 1000);
    }
});

service.login(settings.identity, settings.secret);
