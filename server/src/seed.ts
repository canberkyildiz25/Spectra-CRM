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

// Demo verisi İngilizce ve uluslararası. E-postalar IANA'nın ayırdığı
// example.com altında, telefonlar kurgu için ayrılmış 555-01xx (ABD/Kanada)
// ve Ofcom'un drama aralığında (Birleşik Krallık) - hiçbiri gerçek bir
// şirkete ya da kişiye denk gelmez. client/lib/demo.ts bu fırsatların
// kopyasını tutuyor; ikisi birlikte değişmeli.
const customers = [
  { firstName: 'Maya', lastName: 'Chen', email: 'maya.chen@northfield.example.com', phone: '+1 512 555 0142', company: 'Northfield Software', city: 'Austin', country: 'United States', status: 'customer', source: 'Referral' },
  { firstName: 'Daniel', lastName: 'Okafor', email: 'daniel.okafor@ironclad.example.com', phone: '+1 312 555 0187', company: 'Ironclad Construction', city: 'Chicago', country: 'United States', status: 'customer', source: 'Website' },
  { firstName: 'Sofia', lastName: 'Marquez', email: 'sofia@starline.example.com', phone: '+1 416 555 0123', company: 'Starline Textiles', city: 'Toronto', country: 'Canada', status: 'prospect', source: 'Trade show' },
  { firstName: 'Liam', lastName: 'Novak', email: 'liam.novak@meridian.example.com', phone: '+44 20 7946 0321', company: 'Meridian Logistics', city: 'London', country: 'United Kingdom', status: 'prospect', source: 'Cold call' },
  { firstName: 'Priya', lastName: 'Raman', email: 'priya.raman@falcon.example.com', phone: '+1 303 555 0164', company: 'Falcon Energy', city: 'Denver', country: 'United States', status: 'inactive', source: 'LinkedIn' },
  { firstName: 'Hannah', lastName: 'Weber', email: 'hannah@harvest.example.com', phone: '+44 161 496 0782', company: 'Harvest Foods', city: 'Manchester', country: 'United Kingdom', status: 'customer', source: 'Referral' },
  { firstName: 'Marcus', lastName: 'Bell', email: 'marcus.bell@bellwether.example.com', phone: '+1 206 555 0119', company: 'Bellwether Tech', city: 'Seattle', country: 'United States', status: 'prospect', source: 'Website' },
  { firstName: 'Noah', lastName: 'Brooks', email: 'noah.brooks@sunpeak.example.com', phone: '+1 604 555 0138', company: 'Sunpeak Media', city: 'Vancouver', country: 'Canada', status: 'customer', source: 'Trade show' },
];

const day = 24 * 60 * 60 * 1000;
const inDays = (n: number) => new Date(Date.now() + n * day);

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
        lastName: 'User',
        role: 'admin',
      }).save();
      console.log(`👤 Demo kullanıcı oluşturuldu: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
    } else {
      // Var olan hesabın adı da güncelleniyor; yoksa canlıda eski Türkçe
      // soyad kalırdı. Parolaya dokunulmuyor, o yüzden updateOne yeterli.
      await User.updateOne({ _id: user._id }, { firstName: 'Demo', lastName: 'User' });
      console.log(`👤 Demo kullanıcı zaten var, adı güncellendi: ${DEMO_EMAIL}`);
    }

    // Müşterileri ekle
    await Customer.deleteMany({});
    const c = await Customer.insertMany(customers);
    console.log(`✅ ${c.length} müşteri eklendi`);

    // Görevleri ekle
    await Task.deleteMany({});
    const tasks = [
      { title: 'Draft the Northfield license proposal', description: 'Prepare the Q4 software license quote', assignedTo: user._id, priority: 'high', status: 'in-progress', dueDate: inDays(3), relatedTo: { type: 'customer', id: c[0]._id } },
      { title: 'Ironclad kickoff meeting', description: 'Set up a discovery call for the new site project', assignedTo: user._id, priority: 'high', status: 'pending', dueDate: inDays(1), relatedTo: { type: 'customer', id: c[1]._id } },
      { title: 'Follow up with Starline Textiles', description: 'Call after the trade show', assignedTo: user._id, priority: 'medium', status: 'pending', dueDate: inDays(5), relatedTo: { type: 'customer', id: c[2]._id } },
      { title: 'Prepare the Meridian demo', description: 'Build the slides for the product demo', assignedTo: user._id, priority: 'medium', status: 'pending', dueDate: inDays(7), relatedTo: { type: 'general' } },
      { title: 'Monthly sales report', description: 'Compile last month’s sales report', assignedTo: user._id, priority: 'low', status: 'completed', dueDate: inDays(-2), relatedTo: { type: 'general' } },
      { title: 'Harvest Foods contract renewal', description: 'Renew the annual contract', assignedTo: user._id, priority: 'high', status: 'pending', dueDate: inDays(2), relatedTo: { type: 'customer', id: c[5]._id } },
    ];
    await Task.insertMany(tasks);
    console.log(`✅ ${tasks.length} görev eklendi`);

    // Fırsatları ekle
    await Opportunity.deleteMany({});
    const opportunities = [
      { title: 'Northfield Software - Software license', customerId: c[0]._id, amount: 85000, stage: 'proposal', probability: 50, expectedCloseDate: inDays(14), description: 'Annual software license renewal' },
      { title: 'Ironclad Construction - ERP rollout', customerId: c[1]._id, amount: 250000, stage: 'negotiation', probability: 75, expectedCloseDate: inDays(21), description: 'Full ERP rollout and integration' },
      { title: 'Starline Textiles - Consulting', customerId: c[2]._id, amount: 35000, stage: 'qualified', probability: 25, expectedCloseDate: inDays(30) },
      { title: 'Meridian Logistics - Platform subscription', customerId: c[3]._id, amount: 48000, stage: 'lead', probability: 10, expectedCloseDate: inDays(45) },
      { title: 'Harvest Foods - System upgrade', customerId: c[5]._id, amount: 62000, stage: 'closed-won', probability: 100, description: 'System upgrade delivered' },
      { title: 'Sunpeak Media - Content management', customerId: c[7]._id, amount: 28000, stage: 'closed-lost', probability: 0, description: 'Went with a competitor' },
      /* Six opportunities left the dashboard reading "0% accepted" and a
         kanban with one card per column — an empty-looking app is the wrong
         first impression for a portfolio visitor. The extra rows also give the
         win-rate and pipeline figures something real to compute against. */
      { title: 'Bellwether Tech - Cloud migration', customerId: c[6]._id, amount: 145000, stage: 'negotiation', probability: 75, expectedCloseDate: inDays(18), description: 'Move on-premise systems to the cloud' },
      { title: 'Northfield Software - Support plan', customerId: c[0]._id, amount: 42000, stage: 'proposal', probability: 50, expectedCloseDate: inDays(10), description: '24/7 priority support' },
      { title: 'Falcon Energy - Field automation', customerId: c[4]._id, amount: 190000, stage: 'qualified', probability: 25, expectedCloseDate: inDays(60) },
      { title: 'Meridian Logistics - Fleet tracking', customerId: c[3]._id, amount: 76000, stage: 'proposal', probability: 50, expectedCloseDate: inDays(25), description: 'Vehicle tracking and route optimization' },
      { title: 'Starline Textiles - Production dashboard', customerId: c[2]._id, amount: 58000, stage: 'lead', probability: 10, expectedCloseDate: inDays(50) },
      { title: 'Ironclad Construction - Site app', customerId: c[1]._id, amount: 96000, stage: 'closed-won', probability: 100, description: 'Construction site mobile app delivered' },
      { title: 'Harvest Foods - Warehouse integration', customerId: c[5]._id, amount: 54000, stage: 'closed-won', probability: 100, description: 'WMS integration completed' },
      { title: 'Sunpeak Media - Ad campaign panel', customerId: c[7]._id, amount: 33000, stage: 'closed-won', probability: 100, description: 'Campaign management panel' },
      { title: 'Bellwether Tech - License renewal', customerId: c[6]._id, amount: 24000, stage: 'closed-lost', probability: 0, description: 'Budget not approved' },
    ];
    const createdOpportunities = await Opportunity.insertMany(opportunities);
    console.log(`✅ ${opportunities.length} fırsat eklendi`);

    // Teklifleri ekle
    await Proposal.deleteMany({});
    const byTitle = (t: string) => createdOpportunities.find((o) => o.title === t)?._id;
    const year = new Date().getFullYear();
    const proposals = [
      {
        proposalNumber: `PRO-${year}-001`,
        customerId: c[0]._id,
        opportunityId: byTitle('Northfield Software - Software license'),
        title: 'Software license and support proposal',
        validUntil: inDays(20),
        status: 'sent',
        taxRate: 20,
        paymentTerms: 'Net 30',
        notes: 'Prices cover 12 months of use.',
        items: [
          { name: 'Enterprise license', description: '50 users', quantity: 50, unit: 'User', unitPrice: 1400 },
          { name: 'Priority support', quantity: 12, unit: 'Month', unitPrice: 1250 },
        ],
      },
      {
        proposalNumber: `PRO-${year}-002`,
        customerId: c[1]._id,
        opportunityId: byTitle('Ironclad Construction - ERP rollout'),
        title: 'ERP rollout and integration proposal',
        validUntil: inDays(35),
        status: 'sent',
        taxRate: 20,
        paymentTerms: 'Three installments',
        items: [
          { name: 'Setup and configuration', quantity: 1, unit: 'Project', unitPrice: 165000 },
          { name: 'Data migration', quantity: 1, unit: 'Project', unitPrice: 48000 },
          { name: 'User training', quantity: 6, unit: 'Day', unitPrice: 6500 },
        ],
      },
      {
        proposalNumber: `PRO-${year}-003`,
        customerId: c[1]._id,
        opportunityId: byTitle('Ironclad Construction - Site app'),
        title: 'Construction site mobile app proposal',
        validUntil: inDays(-5),
        status: 'accepted',
        taxRate: 20,
        paymentTerms: '50% upfront, 50% on delivery',
        items: [
          { name: 'iOS and Android app', quantity: 1, unit: 'Project', unitPrice: 78000 },
          { name: 'Maintenance plan', quantity: 6, unit: 'Month', unitPrice: 3000 },
        ],
      },
      {
        proposalNumber: `PRO-${year}-004`,
        customerId: c[5]._id,
        opportunityId: byTitle('Harvest Foods - Warehouse integration'),
        title: 'Warehouse management integration proposal',
        validUntil: inDays(-12),
        status: 'accepted',
        taxRate: 20,
        paymentTerms: 'Net 30',
        items: [
          { name: 'WMS integration', quantity: 1, unit: 'Project', unitPrice: 44000 },
          { name: 'Barcode terminal setup', quantity: 10, unit: 'Each', unitPrice: 1000 },
        ],
      },
      {
        proposalNumber: `PRO-${year}-005`,
        customerId: c[7]._id,
        opportunityId: byTitle('Sunpeak Media - Ad campaign panel'),
        title: 'Campaign management panel proposal',
        validUntil: inDays(-30),
        status: 'accepted',
        taxRate: 20,
        items: [{ name: 'Panel development', quantity: 1, unit: 'Project', unitPrice: 33000 }],
      },
      {
        proposalNumber: `PRO-${year}-006`,
        customerId: c[6]._id,
        opportunityId: byTitle('Bellwether Tech - License renewal'),
        title: 'Annual license renewal proposal',
        validUntil: inDays(-8),
        status: 'rejected',
        taxRate: 20,
        notes: 'Budget not approved; to be revisited next quarter.',
        items: [{ name: 'License renewal', quantity: 20, unit: 'User', unitPrice: 1200 }],
      },
      {
        proposalNumber: `PRO-${year}-007`,
        customerId: c[3]._id,
        opportunityId: byTitle('Meridian Logistics - Fleet tracking'),
        title: 'Fleet tracking and route optimization proposal',
        validUntil: inDays(28),
        status: 'draft',
        taxRate: 20,
        items: [
          { name: 'Vehicle tracking module', quantity: 40, unit: 'Vehicle', unitPrice: 1400 },
          { name: 'Route optimization', quantity: 1, unit: 'Project', unitPrice: 20000 },
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
