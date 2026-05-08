import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Customer } from './models/Customer';
import { Task } from './models/Task';
import { User } from './models/User';
import { Opportunity } from './models/Opportunity';

dotenv.config();

const customers = [
  { firstName: 'Ahmet', lastName: 'Yılmaz', email: 'ahmet.yilmaz@abc.com', phone: '0532 111 2233', company: 'ABC Teknoloji', city: 'İstanbul', country: 'Türkiye', status: 'customer', source: 'Referans' },
  { firstName: 'Ayşe', lastName: 'Kaya', email: 'ayse.kaya@demir.com', phone: '0533 222 3344', company: 'Demir İnşaat', city: 'Ankara', country: 'Türkiye', status: 'customer', source: 'Web Sitesi' },
  { firstName: 'Mehmet', lastName: 'Çelik', email: 'mehmet@yildiz.com', phone: '0535 333 4455', company: 'Yıldız Tekstil', city: 'Bursa', country: 'Türkiye', status: 'prospect', source: 'Fuar' },
  { firstName: 'Fatma', lastName: 'Arslan', email: 'fatma.arslan@global.com', phone: '0536 444 5566', company: 'Global Lojistik', city: 'İzmir', country: 'Türkiye', status: 'prospect', source: 'Soğuk Arama' },
  { firstName: 'Ali', lastName: 'Şahin', email: 'ali.sahin@enerji.com', phone: '0537 555 6677', company: 'Şahin Enerji', city: 'Antalya', country: 'Türkiye', status: 'inactive', source: 'LinkedIn' },
  { firstName: 'Zeynep', lastName: 'Öztürk', email: 'zeynep@ozturk.com', phone: '0538 666 7788', company: 'Öztürk Gıda', city: 'Konya', country: 'Türkiye', status: 'customer', source: 'Referans' },
  { firstName: 'Mustafa', lastName: 'Demir', email: 'mustafa.demir@tech.com', phone: '0539 777 8899', company: 'Demir Tech', city: 'İstanbul', country: 'Türkiye', status: 'prospect', source: 'Web Sitesi' },
  { firstName: 'Elif', lastName: 'Güneş', email: 'elif.gunes@media.com', phone: '0541 888 9900', company: 'Güneş Medya', city: 'İstanbul', country: 'Türkiye', status: 'customer', source: 'Fuar' },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('✅ MongoDB bağlandı');

    // Mevcut kullanıcıyı bul
    const user = await User.findOne();
    if (!user) {
      console.log('❌ Önce register sayfasından bir kullanıcı oluştur!');
      process.exit(1);
    }
    console.log(`👤 Kullanıcı bulundu: ${user.firstName} ${user.lastName}`);

    // Müşterileri ekle
    await Customer.deleteMany({});
    const createdCustomers = await Customer.insertMany(customers);
    console.log(`✅ ${createdCustomers.length} müşteri eklendi`);

    // Görevleri ekle
    await Task.deleteMany({});
    const tasks = [
      { title: 'ABC Teknoloji teklif hazırla', description: 'Q2 için yazılım lisans teklifini hazırla', assignedTo: user._id, priority: 'high', status: 'in-progress', dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), relatedTo: { type: 'customer', id: createdCustomers[0]._id } },
      { title: 'Demir İnşaat toplantısı', description: 'Yeni proje için keşif toplantısı ayarla', assignedTo: user._id, priority: 'high', status: 'pending', dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), relatedTo: { type: 'customer', id: createdCustomers[1]._id } },
      { title: 'Yıldız Tekstil takip araması', description: 'Fuar sonrası takip görüşmesi yap', assignedTo: user._id, priority: 'medium', status: 'pending', dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), relatedTo: { type: 'customer', id: createdCustomers[2]._id } },
      { title: 'Global Lojistik demo hazırla', description: 'Ürün demo sunumu için slayt hazırla', assignedTo: user._id, priority: 'medium', status: 'pending', dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), relatedTo: { type: 'general' } },
      { title: 'Aylık rapor hazırla', description: 'Mayıs ayı satış raporunu hazırla', assignedTo: user._id, priority: 'low', status: 'completed', dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), relatedTo: { type: 'general' } },
      { title: 'Öztürk Gıda sözleşme yenileme', description: 'Yıllık sözleşmeyi yenile', assignedTo: user._id, priority: 'high', status: 'pending', dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), relatedTo: { type: 'customer', id: createdCustomers[5]._id } },
    ];
    await Task.insertMany(tasks);
    console.log(`✅ ${tasks.length} görev eklendi`);

    // Fırsatları ekle
    await Opportunity.deleteMany({});
    const opportunities = [
      { title: 'ABC Teknoloji - Yazılım Lisansı', customerId: createdCustomers[0]._id, amount: 85000, stage: 'proposal', probability: 50, expectedCloseDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), description: 'Yıllık yazılım lisans yenileme' },
      { title: 'Demir İnşaat - ERP Kurulum', customerId: createdCustomers[1]._id, amount: 250000, stage: 'negotiation', probability: 75, expectedCloseDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), description: 'Tam ERP kurulum ve entegrasyon projesi' },
      { title: 'Yıldız Tekstil - Danışmanlık', customerId: createdCustomers[2]._id, amount: 35000, stage: 'qualified', probability: 25, expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
      { title: 'Global Lojistik - Platform Abonelik', customerId: createdCustomers[3]._id, amount: 48000, stage: 'lead', probability: 10, expectedCloseDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000) },
      { title: 'Öztürk Gıda - Sistem Güncelleme', customerId: createdCustomers[5]._id, amount: 62000, stage: 'closed-won', probability: 100, description: 'Sistem güncelleme projesi tamamlandı' },
      { title: 'Güneş Medya - İçerik Yönetimi', customerId: createdCustomers[7]._id, amount: 28000, stage: 'closed-lost', probability: 0, description: 'Rakip firmayı tercih etti' },
    ];
    await Opportunity.insertMany(opportunities);
    console.log(`✅ ${opportunities.length} fırsat eklendi`);

    console.log('\n🎉 Seed tamamlandı! http://localhost:3000 adresini aç.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Hata:', err);
    process.exit(1);
  }
}

seed();
