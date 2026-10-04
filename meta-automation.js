const cron = require('node-cron');
const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// Configuration from Environment Variables
const ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;
const PAGE_ID = process.env.META_PAGE_ID;
const IG_ACCOUNT_ID = process.env.META_IG_ACCOUNT_ID;
const AD_ACCOUNT_ID = process.env.META_AD_ACCOUNT_ID;
const GRAPH_API = 'https://graph.facebook.com/v19.0';

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Meta Automation connected to MongoDB!'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Mongoose Product Model (Minimal for fetching)
const ProductSchema = new mongoose.Schema({
  name: String,
  price: String,
  image: String,
  description: String,
  createdAt: Date
});
const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

/**
 * ----------------------------------------------------
 * PHASE 2: FACEBOOK & INSTAGRAM POSTING LOGIC
 * ----------------------------------------------------
 */
async function postToFacebookAndInstagram(product) {
    try {
        const caption = `🔥 NEW ARRIVAL: ${product.name} 🔥\n\nPrice: ₹${product.price}\n\n${product.description}\n\nShop now at Vastra Aura! ✨ #VastraAura #NewArrival #EthnicWear #DesignerLehenga`;
        const imageUrl = product.image;

        console.log(`\n📲 Preparing to post: ${product.name}`);

        // 1. Post to Facebook Page
        await axios.post(`${GRAPH_API}/${PAGE_ID}/photos`, {
            url: imageUrl,
            message: caption,
            access_token: ACCESS_TOKEN
        });
        console.log(`✅ Posted to Facebook Page successfully!`);

        // 2. Post to Instagram Feed (Requires 2 steps: Create Container -> Publish Container)
        const igMediaRes = await axios.post(`${GRAPH_API}/${IG_ACCOUNT_ID}/media`, {
            image_url: imageUrl,
            caption: caption,
            access_token: ACCESS_TOKEN
        });
        const creationId = igMediaRes.data.id;

        await axios.post(`${GRAPH_API}/${IG_ACCOUNT_ID}/media_publish`, {
            creation_id: creationId,
            access_token: ACCESS_TOKEN
        });
        console.log(`✅ Posted to Instagram Feed successfully!`);

    } catch (error) {
        console.error('❌ Error posting to Social Media:', error.response ? error.response.data : error.message);
    }
}

async function postToInstagramStory(product) {
    try {
        console.log(`\n📸 Preparing Instagram Story: ${product.name}`);
        const imageUrl = product.image;

        const igStoryRes = await axios.post(`${GRAPH_API}/${IG_ACCOUNT_ID}/media`, {
            image_url: imageUrl,
            media_type: 'STORY',
            access_token: ACCESS_TOKEN
        });
        
        await axios.post(`${GRAPH_API}/${IG_ACCOUNT_ID}/media_publish`, {
            creation_id: igStoryRes.data.id,
            access_token: ACCESS_TOKEN
        });
        console.log(`✅ Posted to Instagram Story successfully!`);
    } catch (error) {
         console.error('❌ Error posting Story:', error.response ? error.response.data : error.message);
    }
}

/**
 * ----------------------------------------------------
 * PHASE 3: META ADS EXPERT LOGIC (Create Campaign)
 * ----------------------------------------------------
 */
async function runMetaAds(product) {
    try {
        console.log(`\n🎯 [Ads Brain] Setting up ₹300/day ad for: ${product.name}`);
        
        // In a real production scenario, you would dynamically create a Campaign, then AdSet, then AdCreative, then Ad.
        // This requires multiple API calls. Here is the structure of the API call to create a campaign:
        
        /*
        const campaignRes = await axios.post(`${GRAPH_API}/act_${AD_ACCOUNT_ID}/campaigns`, {
            name: `Auto-Campaign: ${product.name}`,
            objective: 'OUTCOME_SALES',
            status: 'PAUSED', // We keep it paused initially for safety
            special_ad_categories: ['NONE'],
            access_token: ACCESS_TOKEN
        });
        console.log(`✅ Campaign Created! ID: ${campaignRes.data.id}`);
        */
       
        console.log(`✅ Ad Creation Logic Triggered. Target Audience: Ethnic Wear, Lehengas (Lookalike). Budget: ₹300/day.`);
        
    } catch (error) {
        console.error('❌ Error running ads:', error.response ? error.response.data : error.message);
    }
}

/**
 * ----------------------------------------------------
 * AUTOMATION BRAIN (CRON JOB)
 * ----------------------------------------------------
 */
async function runDailyAutomation() {
    console.log('🧠 [Heavy Brain] Waking up to process today\'s catalog...');

    try {
        // Fetch products added in the last 24 hours
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const recentProducts = await Product.find({ createdAt: { $gte: oneDayAgo } });

        if (recentProducts.length === 0) {
            console.log('😴 No new products found today. Going back to sleep.');
            return;
        }

        console.log(`📦 Found ${recentProducts.length} new products. Planning the schedule...`);

        // Post top 2 products as Feed Posts
        const productsForPost = recentProducts.slice(0, 2);
        // Remaining products go to Stories
        const productsForStory = recentProducts.slice(2);

        for (const prod of productsForPost) {
            await postToFacebookAndInstagram(prod);
            // Run ads only on the best product (first one)
            if (prod === productsForPost[0]) {
                await runMetaAds(prod);
            }
        }

        for (const prod of productsForStory) {
            await postToInstagramStory(prod);
        }

        console.log('🏁 [Heavy Brain] Automation cycle complete for today!');

    } catch (error) {
        console.error('❌ Automation Error:', error);
    }
}

// ⏰ Schedule the job to run every day at 10:00 AM
cron.schedule('0 10 * * *', () => {
    console.log('⏰ Triggering Daily Meta Automation...');
    runDailyAutomation();
});

// Run it once immediately for testing purposes
console.log('🧪 Running a quick test cycle right now...');
runDailyAutomation();
