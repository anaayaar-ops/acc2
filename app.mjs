import 'dotenv/config';
import wolfjs from 'wolf.js';

const { WOLF } = wolfjs;
const client = new WOLF();

// دالة لاستخراج الدوال من الكائن
function getMethods(obj, objName) {
    if (!obj) {
        console.log(`❌ ${objName} غير موجود.`);
        return;
    }
    console.log(`\n--- الدوال المتاحة في ${objName} ---`);
    try {
        // استخراج الدوال من الـ prototype
        const proto = Object.getPrototypeOf(obj);
        const methods = Object.getOwnPropertyNames(proto).filter(prop => typeof obj[prop] === 'function');
        console.log(methods);
    } catch (e) {
        console.log(`فشل في فحص ${objName}: ${e.message}`);
    }
}

client.on('ready', async () => {
    console.log('🚀 البوت متصل! جاري استخراج خريطة الدوال...');
    
    // فحص الكائنات الأساسية
    getMethods(client, 'client');
    getMethods(client.messaging, 'client.messaging');
    getMethods(client.group, 'client.group');
    getMethods(client.subscriber, 'client.subscriber');
    
    console.log('\n--- انتهى الفحص. ابحث عن اسم الدالة الصحيحة في القائمة أعلاه ---');
});

client.login(process.env.U_MAIL, process.env.U_PASS);
