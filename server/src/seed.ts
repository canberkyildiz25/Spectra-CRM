import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Customer } from './models/Customer';
import { Task } from './models/Task';
import { User } from './models/User';
import { Opportunity } from './models/Opportunity';
import { Proposal } from './models/Proposal';

dotenv.config();

// Demo hesabı - giriş ekranında da bu bilgiler gösteriliyor.
const DEMO_EMAIL = 'demo@spectra.com';
const DEMO_PASSWORD = 'demo1234';

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

    // Demo kullanıcısını hazırla. Portfolyoya bakan biri kayıt formuyla
    // karşılaşmadan CRM'i gezebilmeli, bu yüzden sabit bir hesap oluşturuyoruz.
    // Parola User modelindeki pre('save') kancasında hash'leniyor, o yüzden
    // insertMany değil new User(...).save() kullanmak şart.
    let user = await User.findOne({ email: DEMO_EMAIL });
    if (!user) {
      user = await new User({
        username: 'demo',
        email: DEMO_EMAIL,
        password: DEMO_PASSWORD,
        firstName: 'Demo',
        lastName: 'Kullanıcı',
        role: 'admin',
      }).save();
      console.log(`👤 Demo kullanıcı oluşturuldu: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
    } else {
      console.log(`👤 Demo kullanıcı zaten var: ${DEMO_EMAIL}`);
    }

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
      /* Six opportunities left the dashboard reading "%0 teklif kabulü" and a
         kanban with one card per column — an empty-looking app is the wrong
         first impression for a portfolio visitor. The extra rows also give the
         win-rate and pipeline figures something real to compute against. */
      { title: 'Demir Tech - Bulut Göçü', customerId: createdCustomers[6]._id, amount: 145000, stage: 'negotiation', probability: 75, expectedCloseDate: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000), description: 'Şirket içi sistemlerin buluta taşınması' },
      { title: 'ABC Teknoloji - Destek Paketi', customerId: createdCustomers[0]._id, amount: 42000, stage: 'proposal', probability: 50, expectedCloseDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), description: '7/24 öncelikli destek' },
      { title: 'Şahin Enerji - Saha Otomasyonu', customerId: createdCustomers[4]._id, amount: 190000, stage: 'qualified', probability: 25, expectedCloseDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) },
      { title: 'Global Lojistik - Filo Takip', customerId: createdCustomers[3]._id, amount: 76000, stage: 'proposal', probability: 50, expectedCloseDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000), description: 'Araç takip ve rota optimizasyonu' },
      { title: 'Yıldız Tekstil - Üretim Paneli', customerId: createdCustomers[2]._id, amount: 58000, stage: 'lead', probability: 10, expectedCloseDate: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000) },
      { title: 'Demir İnşaat - Saha Uygulaması', customerId: createdCustomers[1]._id, amount: 96000, stage: 'closed-won', probability: 100, description: 'Şantiye mobil uygulaması teslim edildi' },
      { title: 'Öztürk Gıda - Depo Entegrasyonu', customerId: createdCustomers[5]._id, amount: 54000, stage: 'closed-won', probability: 100, description: 'WMS entegrasyonu tamamlandı' },
      { title: 'Güneş Medya - Reklam Paneli', customerId: createdCustomers[7]._id, amount: 33000, stage: 'closed-won', probability: 100, description: 'Kampanya yönetim paneli' },
      { title: 'Demir Tech - Lisans Yenileme', customerId: createdCustomers[6]._id, amount: 24000, stage: 'closed-lost', probability: 0, description: 'Bütçe onayı alınamadı' },
    ];
    const createdOpportunities = await Opportunity.insertMany(opportunities);
    console.log(`✅ ${opportunities.length} fırsat eklendi`);

    // Teklifleri ekle
    await Proposal.deleteMany({});
    const day = 24 * 60 * 60 * 1000;
    const byTitle = (t: string) => createdOpportunities.find((o) => o.title === t)?._id;
    const proposals = [
      {
        proposalNumber: 'TKL-2026-001',
        customerId: createdCustomers[0]._id,
        opportunityId: byTitle('ABC Teknoloji - Yazılım Lisansı'),
        title: 'Yazılım Lisans ve Destek Hizmetleri Teklifi',
        validUntil: new Date(Date.now() + 20 * day),
        status: 'sent',
        taxRate: 20,
        paymentTerms: '30 gün vadeli',
        notes: 'Fiyatlar 12 aylık kullanım içindir.',
        items: [
          { name: 'Kurumsal lisans', description: '50 kullanıcı', quantity: 50, unit: 'Kullanıcı', unitPrice: 1400 },
          { name: 'Öncelikli destek', quantity: 12, unit: 'Ay', unitPrice: 1250 },
        ],
      },
      {
        proposalNumber: 'TKL-2026-002',
        customerId: createdCustomers[1]._id,
        opportunityId: byTitle('Demir İnşaat - ERP Kurulum'),
        title: 'ERP Kurulum ve Entegrasyon Teklifi',
        validUntil: new Date(Date.now() + 35 * day),
        status: 'sent',
        taxRate: 20,
        paymentTerms: '3 taksit',
        items: [
          { name: 'Kurulum ve yapılandırma', quantity: 1, unit: 'Proje', unitPrice: 165000 },
          { name: 'Veri göçü', quantity: 1, unit: 'Proje', unitPrice: 48000 },
          { name: 'Kullanıcı eğitimi', quantity: 6, unit: 'Gün', unitPrice: 6500 },
        ],
      },
      {
        proposalNumber: 'TKL-2026-003',
        customerId: createdCustomers[1]._id,
        opportunityId: byTitle('Demir İnşaat - Saha Uygulaması'),
        title: 'Şantiye Mobil Uygulaması Teklifi',
        validUntil: new Date(Date.now() - 5 * day),
        status: 'accepted',
        taxRate: 20,
        paymentTerms: '50% peşin, 50% teslimde',
        items: [
          { name: 'iOS ve Android uygulama', quantity: 1, unit: 'Proje', unitPrice: 78000 },
          { name: 'Bakım paketi', quantity: 6, unit: 'Ay', unitPrice: 3000 },
        ],
      },
      {
        proposalNumber: 'TKL-2026-004',
        customerId: createdCustomers[5]._id,
        opportunityId: byTitle('Öztürk Gıda - Depo Entegrasyonu'),
        title: 'Depo Yönetim Sistemi Entegrasyon Teklifi',
        validUntil: new Date(Date.now() - 12 * day),
        status: 'accepted',
        taxRate: 20,
        paymentTerms: '30 gün vadeli',
        items: [
          { name: 'WMS entegrasyonu', quantity: 1, unit: 'Proje', unitPrice: 44000 },
          { name: 'Barkod terminali kurulumu', quantity: 10, unit: 'Adet', unitPrice: 1000 },
        ],
      },
      {
        proposalNumber: 'TKL-2026-005',
        customerId: createdCustomers[7]._id,
        opportunityId: byTitle('Güneş Medya - Reklam Paneli'),
        title: 'Kampanya Yönetim Paneli Teklifi',
        validUntil: new Date(Date.now() - 30 * day),
        status: 'accepted',
        taxRate: 20,
        items: [{ name: 'Panel geliştirme', quantity: 1, unit: 'Proje', unitPrice: 33000 }],
      },
      {
        proposalNumber: 'TKL-2026-006',
        customerId: createdCustomers[6]._id,
        opportunityId: byTitle('Demir Tech - Lisans Yenileme'),
        title: 'Yıllık Lisans Yenileme Teklifi',
        validUntil: new Date(Date.now() - 8 * day),
        status: 'rejected',
        taxRate: 20,
        notes: 'Bütçe onayı alınamadı, gelecek dönem tekrar değerlendirilecek.',
        items: [{ name: 'Lisans yenileme', quantity: 20, unit: 'Kullanıcı', unitPrice: 1200 }],
      },
      {
        proposalNumber: 'TKL-2026-007',
        customerId: createdCustomers[3]._id,
        opportunityId: byTitle('Global Lojistik - Filo Takip'),
        title: 'Filo Takip ve Rota Optimizasyonu Teklifi',
        validUntil: new Date(Date.now() + 28 * day),
        status: 'draft',
        taxRate: 20,
        items: [
          { name: 'Araç takip modülü', quantity: 40, unit: 'Araç', unitPrice: 1400 },
          { name: 'Rota optimizasyonu', quantity: 1, unit: 'Proje', unitPrice: 20000 },
        ],
      },
    ];
    await Proposal.insertMany(proposals);
    console.log(`✅ ${proposals.length} teklif eklendi`);

    console.log('\n🎉 Seed tamamlandı! http://localhost:3000 adresini aç.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Hata:', err);
    process.exit(1);
  }
}

seed();
