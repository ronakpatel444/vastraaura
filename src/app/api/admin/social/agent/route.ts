import { NextRequest, NextResponse } from 'next/server';

// Dynamic viral hooks database - categorized by psychological viral triggers & out-of-surat buyer psychology
const VIRAL_FRAMEWORKS = [
  {
    type: 'pov_metro',
    label: '⚡ POV: Metro Shopper Secret',
    hookGen: (prod: string, cat: string, price: string, fabric: string) =>
      `POV: You live in Mumbai or Delhi, and you finally discovered the direct Surat studio where high-end boutiques buy their ${cat} for ${price}... 🤯`,
    storyboard: [
      '0:00 - 0:02: Dramatic close-up on luxury zari thread, mirrorwork, and authentic stitching.',
      '0:02 - 0:06: 360-degree slow motion twirl showing rich drape, can-can volume, and flare.',
      '0:06 - 0:10: Showing the premium finish, soft inner lining, and artisan detailing.',
      '0:10 - 0:15: "Direct from the weavers to your doorstep. Why pay 5x at local boutiques?" Call to action.',
    ],
    audioTip: 'Viral Bollywood / Desi trending remix with an abrupt, satisfying bass drop.',
    commentTrigger: 'Comment "SOURCE" and we will DM you the direct purchase link with 15% VIP discount code! 💌',
  },
  {
    type: 'price_expose',
    label: '💸 The Boutique Markup Expose',
    hookGen: (prod: string, cat: string, price: string, fabric: string) =>
      `Boutique in Mumbai/Delhi: ₹18,999 ❌\nVastra Aura Direct from Surat: ${price} ✅\nSpot the difference... there is NONE! 🤫`,
    storyboard: [
      '0:00 - 0:03: Split-screen price comparison on screen with bold, eye-catching text.',
      '0:03 - 0:07: Rapid high-definition macro shots of embroidery, border work, and heavy dupatta.',
      '0:07 - 0:11: Full body styling look in natural daylight showing 100% authentic vibrant colors.',
      '0:11 - 0:15: Parcel unboxing with Free Cash on Delivery courier airway bill.',
    ],
    audioTip: 'Viral suspense sound transitioning into confident upbeat hip-hop beat.',
    commentTrigger: 'Save this so you don\'t overpay! Comment your CITY to get the direct VIP link. 🚀',
  },
  {
    type: 'flare_wow',
    label: '💃 The 10-Meter Flare Twirl',
    hookGen: (prod: string, cat: string, price: string, fabric: string) =>
      `Wait till the full flare opens... 😱 Handcrafted with real ${fabric || 'heritage silk'} and delivered across India with Cash on Delivery!`,
    storyboard: [
      '0:00 - 0:02: Model standing still, holding the fabric edges.',
      '0:02 - 0:07: Explosive 360-degree slow-motion spin revealing the full circle gher.',
      '0:07 - 0:11: Detailed pan across the border, mirror work, and blouse cut.',
      '0:11 - 0:15: Smiles, pointing to screen: "Order online on vastraaura.com".',
    ],
    audioTip: 'Trending Navratri Dhol Beat / Gujarati folk fusion with modern bass drop.',
    commentTrigger: 'Comment "VASTRA" to get the direct checkout link sent to your DM! 🎁',
  },
  {
    type: 'relatable_drama',
    label: '🛍️ Relatable Shopper Dilemma',
    hookGen: (prod: string, cat: string, price: string, fabric: string) =>
      `My brain: "You already have enough ethnic outfits!"\nMe seeing this ${prod} at ${price}: "Add to cart immediately!" 😭✨`,
    storyboard: [
      '0:00 - 0:03: Relatable funny lip-sync or text overlay showing the hesitation.',
      '0:03 - 0:08: Sudden reveal of the gorgeous outfit worn, turning and twirling with elegance.',
      '0:08 - 0:12: Showing close-up of fabric texture, soft breathable lining, and premium feel.',
      '0:12 - 0:15: "Girl math says you saved ₹10,000. Treat yourself on vastraaura.com".',
    ],
    audioTip: 'Viral comedy/relatable audio currently trending on Instagram Reels.',
    commentTrigger: 'Tag your shopping partner in the comments! Drop "WANT" for the direct link. 💖',
  },
  {
    type: 'nri_bride',
    label: '✈️ NRI Wedding & Global Express',
    hookGen: (prod: string, cat: string, price: string, fabric: string) =>
      `Planning an Indian wedding in USA, UK or Canada? How our NRI brides are getting designer ${cat} delivered in 5 days for under $50-$100! ✈️`,
    storyboard: [
      '0:00 - 0:03: Passport / international map transition with bold text.',
      '0:03 - 0:08: High-production slow motion modeling of the outfit under warm bridal lighting.',
      '0:08 - 0:12: Video call consultation screen mockup + parcel packing for USA/UK/Canada.',
      '0:12 - 0:15: "Why spend thousands overseas? Shop directly from vastraaura.com".',
    ],
    audioTip: 'Majestic Royal Indian Classical Orchestra (strings + sitar).',
    commentTrigger: 'Comment "NRI" to get our international express shipping catalog in your DM! 🌍',
  },
  {
    type: 'artisan_bts',
    label: '🧵 Master Karigar Artisan BTS',
    hookGen: (prod: string, cat: string, price: string, fabric: string) =>
      `Watch how 48 hours of pure hand-craftsmanship in Surat turns into this breathtaking ${prod}... 🪡✨`,
    storyboard: [
      '0:00 - 0:03: Macro close-up of artisan hand embroidering intricate zari thread into pure fabric.',
      '0:03 - 0:07: Fabric dyeing and hand-pressing process showing the rich depth of shade.',
      '0:07 - 0:11: Final quality check, can-can mounting, and ironing.',
      '0:11 - 0:15: Final model reveal wearing the complete masterpiece with jewelry.',
    ],
    audioTip: 'ASMR artisan loom sounds blending smoothly into ambient acoustic sitar melody.',
    commentTrigger: 'Comment "ARTISAN" to learn more about our karigars & get ₹500 off your first order! 🪡',
  },
  {
    type: 'garba_navratri',
    label: '🔥 Navratri & Sangeet Showstopper',
    hookGen: (prod: string, cat: string, price: string, fabric: string) =>
      `Wear this to your next Garba night or Sangeet and prepare for everyone asking: "WHERE DID YOU GET THIS?!" 💃✨`,
    storyboard: [
      '0:00 - 0:02: Fast beat syncing with footwork or dandiya strike.',
      '0:02 - 0:07: High energy spin showing heavy mirrorwork reflecting festival lights.',
      '0:07 - 0:11: Detail shot of dupatta tassels, latkan, and back design.',
      '0:11 - 0:15: Text overlay: "Free COD + Instant Dispatch across India".',
    ],
    audioTip: 'Trending Garba folk beat remix with high-tempo dhol and electronic drop.',
    commentTrigger: 'Comment "GARBA" to lock your size before this sells out! 💃',
  },
  {
    type: 'urgency_drop',
    label: '⏰ Limited Studio Batch Alert',
    hookGen: (prod: string, cat: string, price: string, fabric: string) =>
      `Only 5 pieces handcrafted in this batch! Once this ${prod} sells out, restocking takes 3 weeks... ⏳`,
    storyboard: [
      '0:00 - 0:03: Rapid 3-second teaser of the most stunning feature (flare or dupatta).',
      '0:03 - 0:07: Showing the limited edition tag and artisan number.',
      '0:07 - 0:11: Quick 360-degree model walkthrough with price tag overlay.',
      '0:11 - 0:15: "Tap link in bio to claim before it says Sold Out!"',
    ],
    audioTip: 'Fast-paced clock ticking effect transitioning into viral upbeat synthesizer track.',
    commentTrigger: 'Comment "MINE" to grab the secret VIP early checkout link! ⚡',
  },
];

// Dynamic Hashtag Generator based on product attributes with non-repeating rotating sets
function generateDynamicHashtags(category: string, fabric: string, name: string): string[] {
  const baseTags = [
    '#vastraaura21',
    '#vastraaura',
    '#ethnicwearindia',
    '#chaniyacholionline',
    '#designerlehenga',
  ];

  // Category specific dynamic tags
  const catLower = (category || '').toLowerCase();
  const nameLower = (name || '').toLowerCase();
  const catTags: string[] = [];

  if (catLower.includes('chaniya') || catLower.includes('choli') || catLower.includes('navratri') || nameLower.includes('chaniya') || nameLower.includes('garba')) {
    catTags.push('#chaniyacholi', '#navratrioutfit', '#garbalover', '#navratrichaniyacholi', '#mirrorworklehenga', '#gujaratigarba');
  } else if (catLower.includes('suit') || catLower.includes('3 piece') || nameLower.includes('suit')) {
    catTags.push('#3piecesuit', '#designersuit', '#anarkalisuit', '#festivesuit', '#readymadesuit', '#indianethnicwear');
  } else if (catLower.includes('kurti') || catLower.includes('short') || nameLower.includes('kurti')) {
    catTags.push('#shortkurti', '#cottonkurti', '#dailywearkurti', '#officewearkurti', '#kurtistyle', '#kurticollection');
  } else if (catLower.includes('lehenga') || nameLower.includes('lehenga')) {
    catTags.push('#weddinglehenga', '#bridallehenga', '#partywearlehenga', '#lehengacholi', '#sangeetoutfit', '#bridesofindia');
  } else if (catLower.includes('saree') || nameLower.includes('saree')) {
    catTags.push('#sareelove', '#designersaree', '#sareedraping', '#silksaree', '#festivesaree', '#sareeindia');
  } else {
    catTags.push('#festivewear', '#traditionalattire', '#indianfashion', '#festivedrop', '#ethnicfashion');
  }

  // Fabric specific dynamic tags
  const fabLower = (fabric || '').toLowerCase();
  const fabTags: string[] = [];
  if (fabLower.includes('silk') || fabLower.includes('roman')) {
    fabTags.push('#romansilk', '#silkdress', '#luxurysilk', '#silklehenga');
  } else if (fabLower.includes('cotton')) {
    fabTags.push('#purecotton', '#cottoncomfort', '#handloomcotton', '#sustainablefashion');
  } else if (fabLower.includes('georgette')) {
    fabTags.push('#georgettelehenga', '#puregeorgette', '#georgetteoutfit');
  } else if (fabLower.includes('velvet')) {
    fabTags.push('#velvetlehenga', '#royalvelvet', '#winterwedding');
  } else if (fabLower.includes('organza')) {
    fabTags.push('#organzalehenga', '#organzadupatta', '#organzafashion');
  } else {
    fabTags.push('#handloomcraft', '#artisanmade', '#premiumfabric');
  }

  // Out-of-Surat Metro & High-Paying Cities (Rotated dynamically so posts never share identical tags)
  const cityTargetPool = [
    ['#mumbaifashion', '#delhiboutiques', '#bangaloreethnic', '#punefashion', '#mumbaishopping'],
    ['#delhishopping', '#mumbaiweddings', '#hyderabadfashion', '#kolkatabrides', '#chandigarhweddings'],
    ['#nriwedding', '#indianfashionusa', '#desisinuk', '#torontoindians', '#usadesi'],
    ['#londonweddings', '#dubaifashion', '#canadadesi', '#australiandesi', '#bayareadesi'],
    ['#bengalurufashion', '#chennaishopping', '#ahmedabadfashion', '#gurgaonmoms', '#noidafashion'],
  ];
  const randomCitySet = cityTargetPool[Math.floor(Math.random() * cityTargetPool.length)];

  // Algorithm growth & intent tags
  const intentPool = [
    ['#reelitfeelit', '#trendingreels', '#fypindia', '#cashondeliveryavailable', '#allindiashipping'],
    ['#explorepage', '#viralreels', '#indianfashionblogger', '#freedeliveryindia', '#directfromweavers'],
    ['#reelsinstagram', '#fashionreels', '#weddingshopping', '#festivevibes', '#affordabledressing'],
  ];
  const randomIntentSet = intentPool[Math.floor(Math.random() * intentPool.length)];

  const allCombined = Array.from(new Set([
    ...baseTags,
    ...catTags,
    ...fabTags,
    ...randomCitySet,
    ...randomIntentSet,
  ]));

  return allCombined.slice(0, 26);
}

// Generate tailored group broadcast messages for WhatsApp, Facebook Groups, and Telegram
function generateGroupBroadcastMessage(
  productName: string,
  category: string,
  formattedPrice: string,
  fabric: string,
  productUrl: string,
  hook: string
) {
  return (
    `🔥 *NEW VIRAL DROP DIRECT FROM SURAT* 🔥\n\n` +
    `*${productName}*\n\n` +
    `Skip paying ₹15,000+ at retail boutiques in Mumbai or Delhi! Get it direct from the Surat master artisans at factory-direct pricing:\n\n` +
    `👗 *Category:* ${category}\n` +
    `🧵 *Fabric:* ${fabric}\n` +
    `💎 *Direct Weaver Price:* ${formattedPrice} (Flat 70% Off retail boutique prices)\n` +
    `📦 *Payment:* Cash on Delivery (COD) Available All Over India\n` +
    `✈️ *Worldwide Express Shipping:* USA, UK, Canada, Australia & Dubai (5-7 Days)\n` +
    `🛡️ *100% Quality Assurance:* Authentic fabric & hand-checked finishing\n\n` +
    `👉 *View Full HD Video & Order Directly Online:* \n${productUrl}\n\n` +
    `📲 *DM / Order on WhatsApp:* https://wa.me/919999999999?text=${encodeURIComponent(`Hi Vastra Aura! I want to order "${productName}" for ${formattedPrice}`)}\n\n` +
    `✨ Share this with friends & family looking for royal festive & wedding outfits!`
  );
}

export async function POST(req: NextRequest) {
  try {
    const { action, product, frameworkIndex = 0, style } = await req.json();
    const handle = '@vastraaura21';
    const siteUrl = 'https://vastraaura.com';

    const productName = product?.name || 'Designer Festive Attire';
    const cleanPrice = product?.price ? String(product.price).replace(/[^\d]/g, '') : '2999';
    const formattedPrice = `₹${Number(cleanPrice).toLocaleString('en-IN')}`;
    const category = product?.category || 'Ethnic Wear';
    const fabric = product?.fabric || 'Luxury Heritage Fabric';
    const productUrl = product?._id ? `${siteUrl}/product/${product._id}` : siteUrl;

    // 1. GENERATE DYNAMIC REEL SCRIPT & CAPTION (By Index or Angle)
    if (action === 'reel_script') {
      const fIndex = Math.abs(frameworkIndex) % VIRAL_FRAMEWORKS.length;
      const framework = VIRAL_FRAMEWORKS[fIndex];

      const hook = framework.hookGen(productName, category, formattedPrice, fabric);
      const hashtags = generateDynamicHashtags(category, fabric, productName).join(' ');

      const fullCaption =
        `${hook}\n\n` +
        `✨ ${productName}\n` +
        `🧵 Fabric: ${fabric} • Authentic Artisan Finish\n` +
        `🏷️ Direct Weaver Price: ${formattedPrice} (No boutique markups!)\n` +
        `📦 Free Insured Cash on Delivery (COD) All Over India\n` +
        `✈️ Express Global Shipping to USA, UK, Canada & Dubai\n\n` +
        `🛍️ Order directly: ${productUrl}\n\n` +
        `${framework.commentTrigger}\n\n` +
        `Follow ${handle} for daily fresh royal drops!\n\n` +
        `${hashtags}`;

      const groupBroadcastText = generateGroupBroadcastMessage(
        productName,
        category,
        formattedPrice,
        fabric,
        productUrl,
        hook
      );

      return NextResponse.json({
        success: true,
        frameworkIndex: fIndex,
        frameworkType: framework.type,
        frameworkLabel: framework.label,
        reelScript: {
          title: `${productName} — ${framework.label}`,
          hook,
          scenes: framework.storyboard,
          audioTip: framework.audioTip,
          cta: framework.commentTrigger,
          caption: fullCaption,
          hashtags,
          groupBroadcastText,
        },
      });
    }

    // 2. RANDOM FRESH VIRAL ANGLE
    if (action === 'random_script') {
      const randomIndex = Math.floor(Math.random() * VIRAL_FRAMEWORKS.length);
      const framework = VIRAL_FRAMEWORKS[randomIndex];

      const hook = framework.hookGen(productName, category, formattedPrice, fabric);
      const hashtags = generateDynamicHashtags(category, fabric, productName).join(' ');

      const fullCaption =
        `${hook}\n\n` +
        `✨ ${productName}\n` +
        `🧵 Fabric: ${fabric} • Pure Artisan Craftsmanship\n` +
        `💎 Direct Studio Price: ${formattedPrice}\n` +
        `📦 100% Cash on Delivery Across India | Free Shipping\n` +
        `✈️ Express Worldwide Delivery to USA, UK & Canada\n\n` +
        `🛍️ Tap link in bio or visit: ${productUrl}\n\n` +
        `${framework.commentTrigger}\n\n` +
        `Follow ${handle} ✨\n\n` +
        `${hashtags}`;

      const groupBroadcastText = generateGroupBroadcastMessage(
        productName,
        category,
        formattedPrice,
        fabric,
        productUrl,
        hook
      );

      return NextResponse.json({
        success: true,
        frameworkIndex: randomIndex,
        frameworkType: framework.type,
        frameworkLabel: framework.label,
        reelScript: {
          title: `${productName} — ${framework.label}`,
          hook,
          scenes: framework.storyboard,
          audioTip: framework.audioTip,
          cta: framework.commentTrigger,
          caption: fullCaption,
          hashtags,
          groupBroadcastText,
        },
      });
    }

    // 3. DYNAMIC CAPTION FOR 1-CLICK PUBLISHER (Zero static text, tailored to product)
    if (action === 'generate_caption') {
      let chosenFramework = VIRAL_FRAMEWORKS[0];
      if (style === 'metro') {
        chosenFramework = VIRAL_FRAMEWORKS[0]; // Metro Shopper
      } else if (style === 'price_expose') {
        chosenFramework = VIRAL_FRAMEWORKS[1]; // Price Expose
      } else if (style === 'flare') {
        chosenFramework = VIRAL_FRAMEWORKS[2]; // 10m Flare
      } else if (style === 'nri') {
        chosenFramework = VIRAL_FRAMEWORKS[4]; // NRI Wedding
      } else if (style === 'artisan') {
        chosenFramework = VIRAL_FRAMEWORKS[5]; // Karigar BTS
      } else if (style === 'garba') {
        chosenFramework = VIRAL_FRAMEWORKS[6]; // Garba showstopper
      } else {
        // Random pick
        chosenFramework = VIRAL_FRAMEWORKS[Math.floor(Math.random() * VIRAL_FRAMEWORKS.length)];
      }

      const hook = chosenFramework.hookGen(productName, category, formattedPrice, fabric);
      const hashtags = generateDynamicHashtags(category, fabric, productName).join(' ');

      const fullCaption =
        `${hook}\n\n` +
        `✨ ${productName}\n` +
        `🧵 Fabric: ${fabric} • Direct Surat Weaver Price\n` +
        `💎 Price: ${formattedPrice} (No boutique markups)\n` +
        `📦 Cash on Delivery (COD) Available Pan-India\n` +
        `✈️ Worldwide Express Delivery (USA, UK, Canada & Dubai)\n\n` +
        `🛍️ Order Online: ${productUrl}\n\n` +
        `${chosenFramework.commentTrigger}\n\n` +
        `Follow ${handle} for daily viral drops!\n\n` +
        `${hashtags}`;

      const groupBroadcastText = generateGroupBroadcastMessage(
        productName,
        category,
        formattedPrice,
        fabric,
        productUrl,
        hook
      );

      return NextResponse.json({
        success: true,
        caption: fullCaption,
        hook,
        hashtags,
        groupBroadcastText,
      });
    }

    // 4. 7-DAY CONTENT CALENDAR SCHEDULE
    if (action === 'calendar') {
      const calendar = [
        {
          day: 'Monday 12:30 PM (Lunch Hour)',
          type: '💸 Metro Boutique Markup Expose',
          hook: 'Boutique in Mumbai/Delhi: ₹18,999 vs Surat Direct: ₹2,999. Spot the difference!',
          goal: 'Attract working women in Mumbai, Delhi & Bangalore searching for wedding wear savings.',
          audio: 'Trending hip-hop transition / dramatic expose sound.',
        },
        {
          day: 'Tuesday 7:00 PM (Commute / Evening)',
          type: '💃 10-Meter Flare Twirl Slow Motion',
          hook: 'Wait till the full flare opens... 😱 Handcrafted with real Roman Silk!',
          goal: 'Trigger high Instagram watch-time retention and twirl saves.',
          audio: 'Trending Gujarati folk fusion or Navratri Dhol bass drop.',
        },
        {
          day: 'Wednesday 2:00 PM',
          type: '✈️ NRI Bride & Overseas Dispatch',
          hook: 'How our NRI brides in USA & UK are getting designer lehengas delivered in 5 days!',
          goal: 'Capture high-ticket international orders in dollars & pounds.',
          audio: 'Royal Indian classical symphony (Sitar + Strings).',
        },
        {
          day: 'Thursday 8:30 PM (Peak Dinner Scroll)',
          type: '🛍️ Relatable Shopper Dilemma',
          hook: 'My brain: "Don\'t buy more clothes!" Me seeing this at direct Surat rates: "Add to cart!"',
          goal: 'Viral shareability and friends tagging friends in comments.',
          audio: 'Trending Instagram comedy dialogue or lip-sync audio.',
        },
        {
          day: 'Friday 6:00 PM (Weekend Shopping Prep)',
          type: '📦 Behind-the-Scenes Packing ASMR',
          hook: 'Packing 15 COD parcels headed to Mumbai, Delhi & Pune tonight! Let\'s unbox one...',
          goal: 'Build unshakeable buyer trust with authentic real parcel dispatch.',
          audio: 'Satisfying crisp tape, box folding & fabric rustle ASMR.',
        },
        {
          day: 'Saturday 11:00 AM (Weekend Morning)',
          type: '👑 Royal Bridal / Sangeet Showcase',
          hook: 'The wedding guest outfit that will make everyone ask: "Where did you get this?!"',
          goal: 'High-intent bridesmaid & festive occasion purchases.',
          audio: 'Trending Bollywood wedding remix with slow build-up.',
        },
        {
          day: 'Sunday 5:00 PM (Weekly Flash Drop)',
          type: '⚡ Limited Edition Studio Drop',
          hook: 'Only 5 pieces left in stock from this artisan batch. Restock takes 3 weeks!',
          goal: 'Generate immediate Sunday evening checkout orders.',
          audio: 'Fast-paced countdown or energetic dance track.',
        },
      ];

      return NextResponse.json({ success: true, calendar });
    }

    // 5. HASHTAG VAULTS (Out-of-Surat Targeting)
    if (action === 'hashtags') {
      const hashtagSets = {
        metroIndia:
          '#mumbaifashion #delhiboutiques #bangaloreethnic #punefashion #mumbaishopping #delhishopping #hyderabadfashion #kolkatabrides #chandigarhfashion #gurgaonmoms #vastraaura21 #vastraaura #indianethnicwear #reelitfeelit #explorepage',
        nriGlobal:
          '#nriwedding #indianfashionusa #desisinuk #canadadesi #dubaifashion #torontoindians #usadesi #londonweddings #bayareadesi #australiandesi #vastraaura21 #ethnicfashion #weddinglehenga #worldwideshipping',
        nationalViral:
          '#reelsindia #trendingreels #fypindia #viralreels #explorepage #indianfashion #ethnicwear #chaniyacholionline #designerlehenga #vastraaura21 #outfitoftheday #indianwear',
        budgetLuxury:
          '#cashondeliveryavailable #freedeliveryindia #directfromweavers #surattextiles #affordabledressing #boutiquestyle #weddingoutfit #festivedrop #ethniccollection #vastraaura',
      };

      return NextResponse.json({ success: true, hashtagSets });
    }

    // 6. INFLUENCER COLLAB DM
    if (action === 'influencer_dm') {
      const dmTemplate =
        `Hey [Creator Name]! ✨\n\n` +
        `We are loving your styling content and aesthetic! 💖\n\n` +
        `We are Vastra Aura (@vastraaura21) — a direct Surat artisan studio delivering luxury handcrafted Chaniya Cholis, Lehengas & 3-Piece Sets nationwide.\n\n` +
        `We would love to GIFT you one of our best-selling viral outfits of your choice from vastraaura.com in exchange for a dedicated styling reel / story review! 🎁👗\n\n` +
        `Would you be open to collaborating? Let us know and we’ll send over our VIP selection catalog! ✨\n\n` +
        `Warm regards,\n` +
        `Team Vastra Aura (@vastraaura21)\n` +
        `vastraaura.com`;

      return NextResponse.json({ success: true, dmTemplate });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
