import 'dotenv/config';
import wolfjs from 'wolf.js';

const { WOLF } = wolfjs;
const client = new WOLF();

const CHANNEL_ID = 9969; // القناة المستهدفة

client.on('ready', async () => {
    console.log(`✅ البوت متصل ومستعد!`);
    
    // 1. تغيير حالة البوت (بما أنها موجودة في القائمة)
    try {
        await client.setOnlineState(1); // 1 = متصل
        console.log("تم ضبط حالة البوت إلى متصل.");
    } catch (err) {
        console.error("خطأ في ضبط الحالة:", err.message);
    }

    // 2. الانضمام للقناة
    await client.group.joinById(CHANNEL_ID);
    console.log(`تم الانضمام للقناة: ${CHANNEL_ID}`);

    // 3. بدء حلقة المهام
    startTaskLoop();
});

async function startTaskLoop() {
    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    while (true) {
        try {
            // استخدام الدالة التي وجدناها في القائمة: sendGroupMessage
            await client.messaging.sendGroupMessage(CHANNEL_ID, '!مد مهام');
            console.log('✅ تم إرسال "!مد مهام"');

            await sleep(1000); // انتظار ثانية

            await client.messaging.sendGroupMessage(CHANNEL_ID, '!مد تحالف ايداع كل');
            console.log('✅ تم إرسال "!مد تحالف ايداع كل"');

            console.log('⏳ بانتظار 61 ثانية...');
            await sleep(61000);
        } catch (err) {
            console.error("❌ خطأ أثناء الإرسال:", err.message);
            await sleep(5000);
        }
    }
}

// تسجيل الدخول
client.login(process.env.U_MAIL, process.env.U_PASS);
