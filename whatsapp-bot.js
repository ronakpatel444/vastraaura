const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB Database!'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Define Product Schema
const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: String, required: true },
  originalPrice: { type: String },
  allowCOD: { type: Boolean, default: true },
  category: { type: String, required: true },
  status: { type: String, required: true, default: 'Active' },
  image: { type: String, required: true },
  images: { type: [String], default: [] },
  fabric: { type: String },
  description: { type: String },
  originalSellerLink: { type: String },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  colors: { type: [String], default: [] },
  sizes: { type: [{ name: String, stock: Number }], default: [] },
}, { timestamps: true });

const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

// Initialize WhatsApp Client
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

client.on('qr', (qr) => {
    console.log('\n=========================================');
    console.log('📱 QR CODE RECEIVED! Please scan this with your WhatsApp:');
    console.log('=========================================\n');
    qrcode.generate(qr, {small: true});
});

client.on('ready', () => {
    console.log('🚀 WhatsApp Bot is ready and listening to incoming messages!');
});

// 🧠 Memory Buffer to store images that come right before a text description
const chatMediaBuffer = {};

client.on('message', async msg => {
    try {
        const chat = await msg.getChat();
        console.log(`[DEBUG-ALL] Message from: "${chat.name}" | isGroup: ${chat.isGroup} | hasMedia: ${msg.hasMedia}`);

        // 👇 અહિયાં તમે જે ગ્રુપનું નામ લખશો, ખાલી એના જ મેસેજ વંચાશે
        const ALLOWED_CONTACTS = [
            'Auto Catalog',
            'Kurti, Gown, Lahenga - Mudra Ethnic - Reseller\'s Update',
            'Mudra Ethnic - Under 1000 Saree\'s Update',
            'Fvd 2009 Website, Meesho, Amazon, Update',
            'Mudra Ethnic - Premium Saree\'s'
        ]; 
        
        if (ALLOWED_CONTACTS.includes(chat.name)) {
            console.log(`📩 Received message in allowed group: [${chat.name}]`);

            // 1️⃣ IF MESSAGE IS A PHOTO (Store it in memory temporarily)
            if (msg.hasMedia) {
                const media = await msg.downloadMedia();
                if (media && media.mimetype.startsWith('image/')) {
                    console.log(`📸 Image received and saved temporarily for [${chat.name}]`);
                    chatMediaBuffer[chat.name] = media; // Overwrites with the latest image
                }
                return; // Stop here, wait for the text description!
            }

            // 2️⃣ IF MESSAGE IS TEXT (Assume it's the description for the last image)
            if (!msg.hasMedia && msg.body.trim().length > 10) {
                const caption = msg.body;
                
                // Check if we have an image waiting for this text
                if (!chatMediaBuffer[chat.name]) {
                    console.log(`⚠️ Text received, but no recent photo was found for it. Ignoring.`);
                    return;
                }

                console.log(`✅ Text matched with previously saved photo! Extracting details...`);
                
                // Extract Price
                const priceMatch = caption.match(/(?:₹|rs\.?|inr)?\s*(\d{3,5})/i);
                const price = priceMatch ? priceMatch[1] : '2999';
                
                // Extract Fabric
                const fabricMatch = caption.match(/fabric:?\s*([a-zA-Z\s]+)/i);
                const fabric = fabricMatch ? fabricMatch[1].trim() : 'Premium Fabric';

                // Extract Name
                const nameLines = caption.split('\n').filter(l => l.trim().length > 0);
                const name = nameLines.length > 0 ? nameLines[0].substring(0, 60) : 'New Launch Product';

                const dummyImageUrl = 'https://res.cloudinary.com/yygvjgu3/image/upload/v1/dummy_product.jpg';

                // Save to MongoDB
                const newProduct = new Product({
                    name: name,
                    price: price,
                    originalPrice: (parseInt(price) + 1000).toString(),
                    category: 'New Arrivals',
                    image: dummyImageUrl,
                    fabric: fabric,
                    description: caption,
                    sizes: [
                        { name: 'S', stock: 10 }, { name: 'M', stock: 10 },
                        { name: 'L', stock: 10 }, { name: 'XL', stock: 10 }
                    ],
                    status: 'Active'
                });

                try {
                    await newProduct.save();
                    console.log(`🎉 Successfully saved [${name}] to Website Database!`);
                    
                    // Clear the buffer so we don't reuse the same image for the next random text
                    delete chatMediaBuffer[chat.name];
                } catch (error) {
                    console.error('❌ Error saving product to DB:', error);
                }
            }
        }
    } catch (err) {
        // Ignored internal WhatsApp sync error
    }
});

// Start the client
console.log('Starting WhatsApp client... Please wait...');
client.initialize();
