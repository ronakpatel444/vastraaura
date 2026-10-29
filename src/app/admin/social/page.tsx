'use client';

import { useState, useEffect } from 'react';
import { 
  Send, 
  Image as ImageIcon, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Settings as SettingsIcon, 
  Search, 
  Layers, 
  TrendingUp, 
  Music,
  Share2,
  ExternalLink,
  ChevronRight,
  Info,
  Copy,
  Calendar,
  Hash,
  MessageCircle,
  Video,
  Bot,
  Zap,
  Flame,
  Check,
  Users
} from 'lucide-react';

const InstagramIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

const FacebookIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);

const PinterestIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345-.09.375-.291 1.199-.334 1.357-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.627 0 12-5.373 12-12C24 5.372 18.627 0 12 0z"/>
  </svg>
);

interface Product {
  _id: string;
  name: string;
  price: string;
  originalPrice?: string;
  category: string;
  image: string;
  images?: string[];
  description?: string;
  status?: string;
  slug?: string;
}

interface MetaConfig {
  isConfigured: boolean;
  isConnected: boolean;
  igUsername: string;
  pageName: string;
  connectionError: string;
  pageId: string;
  igAccountId: string;
  adAccountId: string;
  hasToken: boolean;
  // Pinterest
  hasPinterestToken?: boolean;
  isPinterestConnected?: boolean;
  pinterestUsername?: string;
  pinterestBoardId?: string;
  pinterestBoards?: { id: string; name: string }[];
  pinterestConnectionError?: string;
}

export default function SocialStudioPage() {
  const [activeTab, setActiveTab] = useState<'publisher' | 'agent' | 'queue'>('agent');
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  // 30-Min Queue States
  const [queueData, setQueueData] = useState<any>({ stats: { pending: 0, published: 0, failed: 0 }, queue: { pending: [], published: [], failed: [] } });
  const [loadingQueue, setLoadingQueue] = useState(false);
  const [processingQueue, setProcessingQueue] = useState(false);
  const [queueActionMsg, setQueueActionMsg] = useState('');

  // Channels to publish
  const [channels, setChannels] = useState<{
    instagram_feed: boolean;
    instagram_story: boolean;
    facebook_page: boolean;
    pinterest_pin: boolean;
  }>({
    instagram_feed: true,
    instagram_story: false,
    facebook_page: true,
    pinterest_pin: true,
  });

  // Story config
  const [storyImageCount, setStoryImageCount] = useState<number>(1);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [caption, setCaption] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [publishResult, setPublishResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Meta connection config
  const [config, setConfig] = useState<MetaConfig | null>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [configForm, setConfigForm] = useState({
    metaAccessToken: '',
    metaPageId: '',
    metaIgAccountId: '',
    metaAdAccountId: '',
    pinterestAccessToken: '',
    pinterestBoardId: '',
  });
  const [savingConfig, setSavingConfig] = useState(false);

  // WhatsApp Automation Config
  const [wpAutoSocial, setWpAutoSocial] = useState(false);
  const [wpAllowedGroups, setWpAllowedGroups] = useState('');
  const [wpChannels, setWpChannels] = useState({ instagram_feed: true, facebook_page: true, instagram_reel: false });
  const [savingWpConfig, setSavingWpConfig] = useState(false);
  const [wpConfigMsg, setWpConfigMsg] = useState('');

  // AI Growth Agent states (Targeting Out-of-Surat & Global)
  const [agentStyle, setAgentStyle] = useState<'metro_expose' | 'nri_global' | 'viral_twirl' | 'packing_asmr'>('metro_expose');
  const [reelScript, setReelScript] = useState<any>(null);
  const [generatingScript, setGeneratingScript] = useState(false);
  const [calendar, setCalendar] = useState<any[]>([]);
  const [hashtagSets, setHashtagSets] = useState<any>(null);
  const [dmTemplate, setDmTemplate] = useState<string>('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [publisherGroupText, setPublisherGroupText] = useState<string>('');
  const [generatingCaption, setGeneratingCaption] = useState<boolean>(false);
  const [showMobileCatalog, setShowMobileCatalog] = useState<boolean>(false);

  // Fetch products and meta config on mount
  useEffect(() => {
    fetchProducts();
    fetchMetaConfig();
    fetchAgentDefaults();
    fetchWpConfig();
    fetchQueue();
  }, []);

  const fetchQueue = async () => {
    try {
      setLoadingQueue(true);
      const res = await fetch('/api/admin/social/queue');
      const data = await res.json();
      if (data.success) {
        setQueueData(data);
      }
    } catch (e) {
      console.error('Failed to load queue', e);
    } finally {
      setLoadingQueue(false);
    }
  };

  const handleProcessQueueNow = async () => {
    try {
      setProcessingQueue(true);
      setQueueActionMsg('');
      const res = await fetch('/api/admin/social/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'process_now' }),
      });
      const data = await res.json();
      setQueueActionMsg(data.message || 'Processed');
      fetchQueue();
    } catch (e: any) {
      setQueueActionMsg('Error: ' + e.message);
    } finally {
      setProcessingQueue(false);
      setTimeout(() => setQueueActionMsg(''), 4000);
    }
  };

  const handleDeleteQueueItem = async (id: string) => {
    if (!confirm('Remove this item from the queue?')) return;
    try {
      await fetch('/api/admin/social/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', id }),
      });
      fetchQueue();
    } catch (e) {
      console.error(e);
    }
  };

  const handleRetryQueueItem = async (id: string) => {
    try {
      await fetch('/api/admin/social/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'retry', id }),
      });
      fetchQueue();
    } catch (e) {
      console.error(e);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/products');
      const data = await res.json();
      if (Array.isArray(data)) {
        setProducts(data);
        setFilteredProducts(data);
        if (data.length > 0) {
          handleSelectProduct(data[0]);
        }
      }
    } catch (e) {
      console.error('Failed to load products', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchMetaConfig = async () => {
    try {
      const res = await fetch('/api/admin/social/config');
      const data = await res.json();
      setConfig(data);
      setConfigForm({
        metaAccessToken: '',
        metaPageId: data.pageId || '',
        metaIgAccountId: data.igAccountId || '',
        metaAdAccountId: data.adAccountId || '',
        pinterestAccessToken: '',
        pinterestBoardId: data.pinterestBoardId || '',
      });
    } catch (e) {
      console.error('Failed to load Meta/Pinterest config', e);
    }
  };

  const fetchAgentDefaults = async () => {
    try {
      const [calRes, hashRes, dmRes] = await Promise.all([
        fetch('/api/admin/social/agent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'calendar' }),
        }),
        fetch('/api/admin/social/agent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'hashtags' }),
        }),
        fetch('/api/admin/social/agent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'influencer_dm' }),
        }),
      ]);

      const calData = await calRes.json();
      const hashData = await hashRes.json();
      const dmData = await dmRes.json();

      if (calData.calendar) setCalendar(calData.calendar);
      if (hashData.hashtagSets) setHashtagSets(hashData.hashtagSets);
      if (dmData.dmTemplate) setDmTemplate(dmData.dmTemplate);
    } catch (e) {
      console.error('Failed to load agent defaults', e);
    }
  };

  const [frameworkIndex, setFrameworkIndex] = useState<number>(0);

  const fetchWpConfig = async () => {
    try {
      const res = await fetch('/api/admin/whatsapp-config');
      const data = await res.json();
      setWpAutoSocial(data.whatsappAutoSocial || false);
      setWpAllowedGroups((data.whatsappAllowedGroups || []).join('\n'));
      const ch = data.whatsappAutoSocialChannels || ['instagram_feed', 'facebook_page'];
      setWpChannels({
        instagram_feed: ch.includes('instagram_feed'),
        facebook_page: ch.includes('facebook_page'),
        instagram_reel: ch.includes('instagram_reel'),
      });
    } catch (e) {
      console.error('Failed to load WhatsApp config', e);
    }
  };

  const handleSaveWpConfig = async () => {
    setSavingWpConfig(true);
    setWpConfigMsg('');
    try {
      const channels: string[] = [];
      if (wpChannels.instagram_feed) channels.push('instagram_feed');
      if (wpChannels.facebook_page) channels.push('facebook_page');
      if (wpChannels.instagram_reel) channels.push('instagram_reel');

      const groups = wpAllowedGroups
        .split(/[\n,]/)
        .map((g) => g.trim())
        .filter(Boolean);

      const res = await fetch('/api/admin/whatsapp-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          whatsappAutoSocial: wpAutoSocial,
          whatsappAllowedGroups: groups,
          whatsappAutoSocialChannels: channels,
        }),
      });
      const data = await res.json();
      setWpConfigMsg(data.success ? '✅ WhatsApp automation config saved!' : (data.error || 'Failed'));
    } catch (err: any) {
      setWpConfigMsg('Error: ' + err.message);
    } finally {
      setSavingWpConfig(false);
      setTimeout(() => setWpConfigMsg(''), 4000);
    }
  };

  const handleGenerateScript = async (overrideIndex?: number, overrideProduct?: Product) => {
    try {
      setGeneratingScript(true);
      const targetIndex = overrideIndex !== undefined ? overrideIndex : frameworkIndex;
      const prod = overrideProduct || selectedProduct;
      if (!prod) return;
      const res = await fetch('/api/admin/social/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reel_script',
          product: prod,
          frameworkIndex: targetIndex,
        }),
      });
      const data = await res.json();
      if (data.reelScript) {
        setReelScript(data.reelScript);
        if (overrideIndex !== undefined) setFrameworkIndex(overrideIndex);
        if (data.reelScript.groupBroadcastText) {
          setPublisherGroupText(data.reelScript.groupBroadcastText);
        }
      }
    } catch (e) {
      console.error('Error generating script', e);
    } finally {
      setGeneratingScript(false);
    }
  };

  const handleSpinRandomAngle = async () => {
    try {
      setGeneratingScript(true);
      const res = await fetch('/api/admin/social/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'random_script',
          product: selectedProduct,
        }),
      });
      const data = await res.json();
      if (data.reelScript) {
        setReelScript(data.reelScript);
        if (data.frameworkIndex !== undefined) {
          setFrameworkIndex(data.frameworkIndex);
        }
        if (data.reelScript.groupBroadcastText) {
          setPublisherGroupText(data.reelScript.groupBroadcastText);
        }
      }
    } catch (e) {
      console.error('Error spinning angle', e);
    } finally {
      setGeneratingScript(false);
    }
  };

  const handleUseInPublisher = (captionText: string, groupText?: string) => {
    setCaption(captionText);
    if (groupText) {
      setPublisherGroupText(groupText);
    }
    setActiveTab('publisher');
  };

  useEffect(() => {
    if (selectedProduct && activeTab === 'agent' && !reelScript) {
      handleGenerateScript(0);
    }
  }, [selectedProduct, activeTab]);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingConfig(true);
      const res = await fetch('/api/admin/social/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(configForm),
      });
      const data = await res.json();
      if (data.success) {
        setShowConfigModal(false);
        fetchMetaConfig();
      } else {
        alert(data.error || 'Failed to save');
      }
    } catch (err: any) {
      alert(err.message || 'Error saving settings');
    } finally {
      setSavingConfig(false);
    }
  };

  useEffect(() => {
    let result = products;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(q) || 
        (p.category && p.category.toLowerCase().includes(q))
      );
    }
    if (selectedCategory !== 'All') {
      result = result.filter(p => p.category === selectedCategory);
    }
    setFilteredProducts(result);
  }, [searchQuery, selectedCategory, products]);

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setErrorMsg('');
    setPublishResult(null);
    setShowMobileCatalog(false);

    const allImgs = product.images && product.images.length > 0 
      ? [product.image, ...product.images] 
      : [product.image];
    
    setSelectedImages(allImgs);
    setStoryImageCount(1);
    generateCaption(product, 'random');
    if (activeTab === 'agent') {
      handleGenerateScript(frameworkIndex, product);
    }
  };

  const generateCaption = async (product: Product, style: string = 'random') => {
    try {
      setGeneratingCaption(true);
      const res = await fetch('/api/admin/social/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_caption',
          product,
          style,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCaption(data.caption);
        if (data.groupBroadcastText) {
          setPublisherGroupText(data.groupBroadcastText);
        }
      }
    } catch (e) {
      console.error('Failed to generate dynamic caption', e);
    } finally {
      setGeneratingCaption(false);
    }
  };

  const toggleImageSelection = (imgUrl: string) => {
    if (selectedImages.includes(imgUrl)) {
      if (selectedImages.length === 1) {
        alert('At least one image must be selected.');
        return;
      }
      setSelectedImages(selectedImages.filter(i => i !== imgUrl));
    } else {
      setSelectedImages([...selectedImages, imgUrl]);
    }
  };

  const handlePublish = async () => {
    if (!selectedProduct) {
      alert('Please select a product first.');
      return;
    }

    const activeChannels = Object.entries(channels)
      .filter(([_, active]) => active)
      .map(([channel]) => channel);

    if (activeChannels.length === 0) {
      alert('Please select at least one channel (Instagram, Facebook, or Pinterest).');
      return;
    }

    if (!selectedImages.length) {
      alert('Please select at least one image to post.');
      return;
    }

    try {
      setPublishing(true);
      setErrorMsg('');
      setPublishResult(null);

      const productSlugOrId = selectedProduct.slug || selectedProduct._id;
      const productUrl = typeof window !== 'undefined' 
        ? `${window.location.origin}/products/${productSlugOrId}`
        : `https://vastraaura.com/products/${productSlugOrId}`;

      const res = await fetch('/api/admin/social/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channels: activeChannels,
          caption,
          images: selectedImages,
          storyImageCount,
          productId: selectedProduct._id,
          productTitle: selectedProduct.name,
          productLink: productUrl,
          boardId: config?.pinterestBoardId || '',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to publish to selected channels');
      setPublishResult(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred while publishing');
    } finally {
      setPublishing(false);
    }
  };

  const categories = ['All', 'Chaniya Choli', 'Lehenga', '3 Piece Suit', 'Short Kurtis', 'Saree', 'Kurta Sets'];

  return (
    <div className="p-3 sm:p-5 md:p-8 max-w-7xl mx-auto space-y-5 sm:space-y-6 md:space-y-8 w-full overflow-x-hidden">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5 sm:pb-6">
        <div>
          <div className="flex items-start sm:items-center gap-3">
            <span className="p-2 sm:p-2.5 bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-500 text-white rounded-xl shadow-md flex-shrink-0">
              <Bot className="w-5 h-5 sm:w-6 sm:h-6" />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-gray-900 leading-tight">
                  AI Social Growth Studio
                </h1>
                <span className="px-2 py-0.5 text-[10px] sm:text-[11px] font-bold bg-pink-100 text-pink-700 border border-pink-200 rounded-full flex items-center gap-1">
                  <Flame className="w-3 h-3 text-pink-600 fill-pink-600" /> @vastraaura21
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                Viral Reel Scripts, Content Calendar, and Direct Instagram, Facebook & Pinterest Publishing.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setShowConfigModal(true)}
            className="w-full sm:w-auto justify-center flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors shadow-sm"
          >
            <SettingsIcon className="w-4 h-4 text-gray-600" /> Social API Keys (Meta & Pinterest)
          </button>
        </div>
      </div>

      {/* Main Tab Switcher (Segmented Control on Mobile, Tabs on Desktop) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-1.5 bg-gray-100/90 rounded-2xl sm:bg-transparent sm:p-0 sm:border-b sm:border-gray-200 sm:rounded-none">
        <button
          onClick={() => setActiveTab('agent')}
          className={`flex items-center justify-center gap-2 px-3 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm font-bold rounded-xl sm:rounded-none sm:border-b-2 transition-all ${
            activeTab === 'agent'
              ? 'bg-white text-black shadow-sm sm:bg-transparent sm:shadow-none sm:border-black'
              : 'text-gray-500 hover:text-black sm:border-transparent'
          }`}
        >
          <Sparkles className="w-4 h-4 text-accent" />
          <span>🤖 AI Growth Agent</span>
          <span className="px-1.5 py-0.5 text-[9px] bg-amber-100 text-amber-800 rounded-full font-semibold">Copilot</span>
        </button>

        <button
          onClick={() => setActiveTab('publisher')}
          className={`flex items-center justify-center gap-2 px-3 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm font-bold rounded-xl sm:rounded-none sm:border-b-2 transition-all ${
            activeTab === 'publisher'
              ? 'bg-white text-black shadow-sm sm:bg-transparent sm:shadow-none sm:border-black'
              : 'text-gray-500 hover:text-black sm:border-transparent'
          }`}
        >
          <Send className="w-4 h-4 text-pink-600" />
          <span>📸 1-Click Publisher</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('queue');
            fetchQueue();
          }}
          className={`flex items-center justify-center gap-2 px-3 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm font-bold rounded-xl sm:rounded-none sm:border-b-2 transition-all ${
            activeTab === 'queue'
              ? 'bg-white text-black shadow-sm sm:bg-transparent sm:shadow-none sm:border-black'
              : 'text-gray-500 hover:text-black sm:border-transparent'
          }`}
        >
          <Zap className="w-4 h-4 text-indigo-600" />
          <span>⏱️ 30-Min Queue</span>
          {(queueData?.stats?.pending || 0) > 0 && (
            <span className="px-1.5 py-0.5 text-[10px] bg-indigo-100 text-indigo-800 rounded-full font-bold">
              {queueData.stats.pending}
            </span>
          )}
        </button>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: AI VIRAL GROWTH AGENT (@vastraaura21)                    */}
      {/* ============================================================== */}
      {activeTab === 'agent' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          
          {/* Growth Agent Status Hero Banner */}
          <div className="p-6 bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 text-white rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-neutral-700">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs uppercase tracking-widest text-emerald-400 font-bold">
                  Out-of-Surat Viral Engine Active
                </span>
                <span className="text-neutral-500">•</span>
                <span className="text-xs text-amber-300 font-mono">Focus: Mumbai, Delhi & NRIs (USA, UK, Canada)</span>
              </div>
              <h2 className="text-xl md:text-2xl font-serif font-bold">
                Target High-Paying Buyers Outside Surat on @vastraaura21
              </h2>
              <p className="text-xs md:text-sm text-neutral-300 leading-relaxed font-light">
                People in Mumbai, Delhi & abroad pay 5x higher boutique prices. This AI Agent writes scripts, hooks, and tags specifically designed to pull buyers from metro cities and NRI NRI wedding markets straight to your website.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="https://www.instagram.com/vastraaura21"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 bg-gradient-to-r from-pink-600 to-rose-600 hover:opacity-95 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                <InstagramIcon className="w-4 h-4" /> Open @vastraaura21
              </a>
            </div>
          </div>

          {/* Section: Viral Reel Script Generator */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Video className="w-5 h-5 text-rose-500" />
                  🎬 1. Viral Reel Script & Hook Copilot
                </h3>
                <p className="text-xs text-gray-500">
                  Select an outfit and choose a viral angle. The agent drafts a complete 15-second reel storyboard.
                </p>
              </div>

              {/* Product quick pill */}
              {selectedProduct && (
                <div className="flex items-center gap-2 bg-gray-50 border px-3 py-1.5 rounded-lg text-xs">
                  <span className="text-gray-400">Selected:</span>
                  <strong className="text-gray-900 truncate max-w-[160px]">{selectedProduct.name}</strong>
                  <span className="text-accent font-bold">₹{selectedProduct.price}</span>
                </div>
              )}
            </div>

            {/* Dynamic Framework Switcher & Random Spin */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-700 block">
                  Choose Dynamic Viral Framework (No Fixed Captions):
                </label>
                <button
                  type="button"
                  onClick={handleSpinRandomAngle}
                  className="px-2.5 py-1 bg-gradient-to-r from-amber-500 to-rose-500 hover:opacity-90 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5" /> 🎲 Spin Fresh Angle
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                {[
                  { idx: 0, label: '⚡ Metro Shopper', desc: 'Target Mumbai & Delhi' },
                  { idx: 1, label: '💸 Markup Expose', desc: '5x boutique price truth' },
                  { idx: 2, label: '💃 10m Flare Twirl', desc: 'All-India Free COD' },
                  { idx: 3, label: '🛍️ Girl Math', desc: 'Relatable shopping urge' },
                  { idx: 4, label: '✈️ NRI Bride & Global', desc: 'USA, UK, Dubai wedding' },
                  { idx: 5, label: '🧵 Master Karigar', desc: 'Surat loom craft' },
                  { idx: 6, label: '🔥 Navratri Garba', desc: 'Garba night twirl' },
                  { idx: 7, label: '⏰ Limited Batch', desc: 'Scarcity & fast checkout' },
                ].map(angle => (
                  <button
                    key={angle.idx}
                    onClick={() => handleGenerateScript(angle.idx)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      frameworkIndex === angle.idx
                        ? 'border-black bg-neutral-900 text-white shadow-md'
                        : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="text-xs font-bold truncate">{angle.label}</div>
                    <div className={`text-[10px] mt-0.5 truncate ${frameworkIndex === angle.idx ? 'text-neutral-300' : 'text-gray-500'}`}>
                      {angle.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Generated Script Display */}
            {generatingScript ? (
              <div className="py-12 text-center text-xs text-gray-400 flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                Crafting fresh, custom viral storyboard for @vastraaura21...
              </div>
            ) : reelScript ? (
              <div className="p-5 bg-neutral-50 border border-neutral-200 rounded-xl space-y-4">
                
                {/* 3-Second Hook */}
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-lg">
                  <div className="flex items-center justify-between text-xs font-bold text-rose-900 mb-1">
                    <span className="flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-rose-600" /> 0-3s High Retention Hook (Speech + Screen Text):
                    </span>
                    <button
                      onClick={() => copyToClipboard(reelScript.hook, 'hook')}
                      className="text-[11px] text-rose-700 hover:underline flex items-center gap-1 font-semibold"
                    >
                      {copiedKey === 'hook' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      {copiedKey === 'hook' ? 'Copied!' : 'Copy Hook'}
                    </button>
                  </div>
                  <p className="text-sm font-serif font-bold text-rose-950 italic">
                    {reelScript.hook}
                  </p>
                </div>

                {/* Scenes & Visual Directing */}
                <div className="space-y-2">
                  <strong className="text-xs text-gray-700 block">🎬 Scene-by-Scene Visual Direction:</strong>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                    {reelScript.scenes?.map((scene: string, idx: number) => (
                      <div key={idx} className="p-2.5 bg-white border border-gray-200 rounded-lg text-gray-700 flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-neutral-900 text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                          {idx + 1}
                        </span>
                        <span className="leading-relaxed">{scene}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Audio & CTA Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs space-y-1">
                    <strong className="text-amber-900 flex items-center gap-1 font-bold">
                      <Music className="w-3.5 h-3.5 text-amber-600" /> Trending Audio Style:
                    </strong>
                    <p className="text-amber-800 leading-relaxed text-[11px]">{reelScript.audioTip}</p>
                  </div>

                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs space-y-1">
                    <strong className="text-blue-900 flex items-center gap-1 font-bold">
                      <MessageCircle className="w-3.5 h-3.5 text-blue-600" /> Viral Comment Trigger (CTA):
                    </strong>
                    <p className="text-blue-800 leading-relaxed text-[11px]">{reelScript.cta}</p>
                  </div>
                </div>

                {/* Full Caption Box + Publisher Integration */}
                <div className="pt-2 border-t space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="text-xs font-bold text-gray-700">Unique Dynamic Caption (Product-Specific):</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => copyToClipboard(reelScript.caption, 'caption')}
                        className="flex-1 sm:flex-none justify-center px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors"
                      >
                        {copiedKey === 'caption' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        {copiedKey === 'caption' ? 'Copied!' : 'Copy'}
                      </button>
                      <button
                        onClick={() => handleUseInPublisher(reelScript.caption, reelScript.groupBroadcastText)}
                        className="flex-1 sm:flex-none justify-center px-3 py-1.5 bg-black hover:bg-neutral-800 text-white text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors"
                      >
                        <Send className="w-3 h-3" /> Use in Publisher →
                      </button>
                    </div>
                  </div>
                  <pre className="p-3 bg-white border border-gray-200 rounded-lg text-xs font-sans text-gray-800 whitespace-pre-wrap leading-relaxed max-h-36 overflow-y-auto">
                    {reelScript.caption}
                  </pre>
                </div>

                {/* VIRAL GROUP SEEDING & BROADCAST ENGINE */}
                {reelScript.groupBroadcastText && (
                  <div className="p-3.5 sm:p-4 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200 rounded-xl space-y-2.5 sm:space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <Share2 className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                        <span className="text-[11px] sm:text-xs font-bold text-emerald-900 uppercase tracking-wide">
                          🚀 Viral Group Seeding
                        </span>
                      </div>
                      <span className="text-[9px] sm:text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                        Initial Velocity
                      </span>
                    </div>

                    <p className="text-[10px] sm:text-[11px] text-emerald-800/90 leading-relaxed">
                      Reels go viral when they get rapid initial views from external shares in the first 30 minutes. Blast this post to reseller groups:
                    </p>

                    <div className="grid grid-cols-1 sm:flex sm:flex-wrap gap-2 pt-1">
                      <a
                        href={`https://api.whatsapp.com/send?text=${encodeURIComponent(reelScript.groupBroadcastText)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors text-center"
                      >
                        📲 Share to WhatsApp Groups
                      </a>
                      <a
                        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(selectedProduct ? `https://vastraaura.com/products/${selectedProduct.slug || selectedProduct._id}` : 'https://vastraaura.com')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors text-center"
                      >
                        🌐 Share to Facebook Groups
                      </a>
                      <a
                        href={`https://t.me/share/url?url=${encodeURIComponent(selectedProduct ? `https://vastraaura.com/products/${selectedProduct.slug || selectedProduct._id}` : 'https://vastraaura.com')}&text=${encodeURIComponent(reelScript.groupBroadcastText)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors text-center"
                      >
                        ✈️ Share to Telegram
                      </a>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(reelScript.groupBroadcastText, 'group_text')}
                        className="px-3.5 py-2.5 bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors text-center"
                      >
                        {copiedKey === 'group_text' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedKey === 'group_text' ? 'Copied Message!' : 'Copy Group Message'}
                      </button>
                    </div>
                  </div>
                )}

              </div>
            ) : null}
          </div>

          {/* Section: 7-Day Viral Content Calendar */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-accent" />
                  📅 2. Weekly Viral Growth Calendar for @vastraaura21
                </h3>
                <p className="text-xs text-gray-500">
                  Follow this structured 7-day schedule to feed the Instagram algorithm consistently at peak Indian shopping hours.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {calendar.map((item, idx) => (
                <div key={idx} className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-2.5 hover:border-black/30 transition-all flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-accent font-serif tracking-wide">{item.day}</span>
                      <span className="text-[10px] bg-white border text-gray-600 px-2 py-0.5 rounded-full font-medium">
                        Day {idx + 1}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-gray-900 leading-tight">{item.type}</h4>
                    <p className="text-[11px] text-gray-600 italic">"{item.hook}"</p>
                  </div>

                  <div className="pt-2 border-t border-gray-200/60 text-[10px] space-y-1 text-gray-500">
                    <div>🎯 <strong className="text-gray-700">Goal:</strong> {item.goal}</div>
                    <div>🎵 <strong className="text-gray-700">Audio:</strong> {item.audio}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Surat Viral Hashtag Vault & Influencer DM */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Hashtag Vault */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Hash className="w-4 h-4 text-emerald-600" />
                🏷️ 3. Out-of-Surat & Global Hashtag Vault
              </h3>
              <p className="text-xs text-gray-500">
                Segmented hashtags to capture high-paying buyers in Mumbai, Delhi, and NRI wedding shoppers abroad.
              </p>

              {hashtagSets && (
                <div className="space-y-3">
                  {[
                    { label: '🏙️ Metro Cities (Mumbai, Delhi, Bangalore, Pune)', key: 'metroIndia', tags: hashtagSets.metroIndia },
                    { label: '✈️ NRI & Global (USA, UK, Canada, Dubai)', key: 'nriGlobal', tags: hashtagSets.nriGlobal },
                    { label: '🚀 National Viral Reach (Algorithm)', key: 'nationalViral', tags: hashtagSets.nationalViral },
                    { label: '💎 Budget Luxury & D2C (Nationwide COD)', key: 'budgetLuxury', tags: hashtagSets.budgetLuxury },
                  ].map(stack => (
                    <div key={stack.key} className="p-3 bg-gray-50 border rounded-xl space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-semibold text-gray-900">
                        <span>{stack.label}</span>
                        <button
                          onClick={() => copyToClipboard(stack.tags, stack.key)}
                          className="text-[11px] text-accent hover:underline flex items-center gap-1"
                        >
                          {copiedKey === stack.key ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          {copiedKey === stack.key ? 'Copied!' : 'Copy Tags'}
                        </button>
                      </div>
                      <p className="text-[11px] text-gray-600 font-mono leading-relaxed truncate">{stack.tags}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Influencer Collab Outreach DM */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-pink-600" />
                  💌 4. Influencer Collab DM Template
                </h3>
                <button
                  onClick={() => copyToClipboard(dmTemplate, 'influencer_dm')}
                  className="px-3 py-1 bg-black text-white hover:bg-neutral-800 text-xs font-semibold rounded-md flex items-center gap-1"
                >
                  {copiedKey === 'influencer_dm' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copiedKey === 'influencer_dm' ? 'Copied DM!' : 'Copy Template'}
                </button>
              </div>
              <p className="text-xs text-gray-500">
                Send this DM to Gujarati fashion creators & models on Instagram. When they accept, send them a gift outfit in exchange for a Collaboration Reel!
              </p>

              <pre className="p-4 bg-gray-50 border rounded-xl text-xs font-sans text-gray-800 whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto">
                {dmTemplate}
              </pre>
            </div>

          </div>

          {/* Section 5: High-Traffic Out-of-Surat Facebook & WhatsApp Communities Directory */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-4">
              <div>
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  🌐 5. High-Velocity Facebook & WhatsApp Community Directory
                </h3>
                <p className="text-xs text-gray-500">
                  Target these out-of-Surat groups where high-paying buyers & wedding shoppers actively purchase. Instant 1-click search shortcuts:
                </p>
              </div>
              <span className="text-[10px] bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full font-bold self-start">
                Spike Initial 30-Min Algorithm Retention
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                {
                  title: '🏙️ Mumbai Women Fashion & Boutiques',
                  query: 'mumbai women ethnic wear fashion',
                  desc: 'High disposable income buyers looking for direct Surat factory rates.',
                },
                {
                  title: '🛍️ Delhi NCR Luxury Ethnic & Bridal',
                  query: 'delhi ncr bridal lehenga shopping',
                  desc: 'Chandni Chowk alternative shoppers wanting fast insured COD delivery.',
                },
                {
                  title: '✈️ USA Indian NRI Community & Fashion',
                  query: 'indian clothes wedding usa desi',
                  desc: 'NRI brides paying $100-$300 without hesitation for authentic outfits.',
                },
                {
                  title: '🍁 Canada & Toronto Desi Weddings',
                  query: 'toronto desi wedding shopping clothes',
                  desc: 'Express DHL / FedEx delivery customers ordering festive ensembles.',
                },
                {
                  title: '🇬🇧 UK & London Indian Fashion Hub',
                  query: 'london uk indian bridal lehengas suits',
                  desc: 'Southall / Leicester boutique shoppers who love direct weaver sourcing.',
                },
                {
                  title: '💃 Navratri Chaniya Choli Lovers India',
                  query: 'navratri chaniya choli garba dress online',
                  desc: 'Garba enthusiasts looking for heavy gher 10-meter flare outfits.',
                },
              ].map((grp, idx) => (
                <div key={idx} className="p-3.5 bg-gray-50 border rounded-xl flex flex-col justify-between space-y-2 hover:border-black/30 transition-all">
                  <div>
                    <h4 className="text-xs font-bold text-gray-900 leading-snug">{grp.title}</h4>
                    <p className="text-[11px] text-gray-500 mt-1">{grp.desc}</p>
                  </div>
                  <div className="pt-2 border-t flex items-center justify-between">
                    <a
                      href={`https://www.facebook.com/groups/search/groups/?q=${encodeURIComponent(grp.query)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 hover:underline"
                    >
                      Find Groups on FB <ExternalLink className="w-3 h-3" />
                    </a>
                    {selectedProduct && (
                      <a
                        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://vastraaura.com/product/${selectedProduct._id}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 py-0.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-[10px] font-bold"
                      >
                        Share Product →
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: 1-CLICK DIRECT PUBLISHER (Feed & Story)                 */}
      {/* ============================================================== */}
      {activeTab === 'publisher' && (
        <div className="animate-in fade-in duration-300 space-y-4 sm:space-y-6">
          
          {/* Mobile Selected Product Quick Pill (Only on mobile when product is chosen) */}
          {selectedProduct && (
            <div className="lg:hidden p-3 bg-neutral-900 text-white rounded-2xl flex items-center justify-between gap-3 shadow-md border border-neutral-800">
              <div className="flex items-center gap-2.5 min-w-0">
                <img 
                  src={selectedProduct.image || '/images/hero.jpg'} 
                  alt={selectedProduct.name} 
                  className="w-11 h-13 object-cover rounded-xl flex-shrink-0 bg-neutral-800 border border-neutral-700"
                />
                <div className="min-w-0">
                  <span className="text-[9px] uppercase tracking-wider text-accent font-bold">Selected Outfit</span>
                  <h4 className="text-xs font-bold text-white truncate">{selectedProduct.name}</h4>
                  <p className="text-[11px] font-bold text-amber-300">₹{selectedProduct.price}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowMobileCatalog(!showMobileCatalog)}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl flex-shrink-0 border border-white/15 transition-colors"
              >
                {showMobileCatalog ? 'Close List ▲' : 'Change ▼'}
              </button>
            </div>
          )}

          {/* Main Studio Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-start">
            
            {/* LEFT COLUMN: Product Catalog Picker (5 cols) */}
            <div className={`lg:col-span-5 bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4 ${
              selectedProduct && !showMobileCatalog ? 'hidden lg:block' : 'block'
            }`}>
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-gray-900 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-accent" /> 1. Select Product to Post
                  </h2>
                  <p className="text-[11px] sm:text-xs text-gray-500">Pick any active outfit from your catalog</p>
                </div>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md font-medium">
                  {filteredProducts.length} items
                </span>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by title or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-black transition-colors"
                />
              </div>

              {/* Category Filter Pills */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[11px] -mx-1 px-1">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-colors flex-shrink-0 ${
                      selectedCategory === cat 
                        ? 'bg-black text-white font-medium' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Products List */}
              <div className="space-y-2 max-h-[380px] sm:max-h-[500px] lg:max-h-[560px] overflow-y-auto pr-1">
                {loading ? (
                  <div className="text-center py-12 text-gray-400 text-xs">Loading catalog...</div>
                ) : filteredProducts.length === 0 ? (
                  <div className="text-center py-12 text-gray-400 text-xs">No products found matching search.</div>
                ) : (
                  filteredProducts.map(p => {
                    const isSelected = selectedProduct?._id === p._id;
                    return (
                      <div
                        key={p._id}
                        onClick={() => handleSelectProduct(p)}
                        className={`p-2.5 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                          isSelected
                            ? 'border-black bg-neutral-900 text-white shadow-md'
                            : 'border-gray-100 bg-gray-50 hover:bg-gray-100 text-gray-900'
                        }`}
                      >
                        <img 
                          src={p.image || '/images/hero.jpg'} 
                          alt={p.name} 
                          className="w-12 h-14 sm:w-14 sm:h-16 object-cover rounded-lg flex-shrink-0 bg-gray-200"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-semibold truncate leading-tight">{p.name}</h4>
                          <p className={`text-[10px] sm:text-[11px] mt-0.5 ${isSelected ? 'text-gray-300' : 'text-gray-500'}`}>
                            {p.category || 'Ethnic Wear'}
                          </p>
                          <p className={`text-xs font-bold mt-1 ${isSelected ? 'text-amber-300' : 'text-gray-900'}`}>
                            ₹{p.price}
                          </p>
                        </div>
                        <ChevronRight className={`w-4 h-4 flex-shrink-0 ${isSelected ? 'text-white' : 'text-gray-400'}`} />
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* RIGHT COLUMN: Composer & Studio (7 cols) */}
            <div className="lg:col-span-7 space-y-5 sm:space-y-6">
              {selectedProduct ? (
                <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 shadow-sm space-y-5 sm:space-y-6">
                  
                  {/* Product Header in Studio */}
                  <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-gray-100 gap-2">
                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                      <img
                        src={selectedProduct.image}
                        alt={selectedProduct.name}
                        className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded-lg flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <h3 className="text-xs sm:text-sm md:text-base font-bold text-gray-900 truncate">{selectedProduct.name}</h3>
                        <p className="text-[10px] sm:text-xs text-gray-500">
                          Price: <strong className="text-black">₹{selectedProduct.price}</strong> • {selectedProduct.category}
                        </p>
                      </div>
                    </div>

                    <a
                      href={`/products/${selectedProduct.slug || selectedProduct._id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-accent hover:underline flex items-center gap-1 font-semibold flex-shrink-0"
                    >
                      View Link <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  {/* STEP 2: Choose Channels */}
                  <div className="space-y-2.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500 block">
                      2. Publish Destinations
                    </label>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
                      
                      {/* Instagram Feed */}
                      <label className={`p-2.5 sm:p-3.5 rounded-xl border flex items-center gap-2 sm:gap-3 cursor-pointer transition-all ${
                        channels.instagram_feed 
                          ? 'border-pink-500 bg-pink-50/50 text-gray-900 ring-1 ring-pink-500' 
                          : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
                      }`}>
                        <input
                          type="checkbox"
                          checked={channels.instagram_feed}
                          onChange={(e) => setChannels({ ...channels, instagram_feed: e.target.checked })}
                          className="rounded text-pink-600 focus:ring-pink-500"
                        />
                        <div className="min-w-0">
                          <div className="text-[11px] sm:text-xs font-bold flex items-center gap-1 sm:gap-1.5 truncate">
                            <InstagramIcon className="w-3.5 h-3.5 text-pink-600 flex-shrink-0" /> Insta Feed
                          </div>
                          <p className="text-[9px] sm:text-[10px] text-gray-500 mt-0.5 truncate">Post/Carousel</p>
                        </div>
                      </label>

                      {/* Instagram Story */}
                      <label className={`p-2.5 sm:p-3.5 rounded-xl border flex items-center gap-2 sm:gap-3 cursor-pointer transition-all ${
                        channels.instagram_story 
                          ? 'border-amber-500 bg-amber-50/50 text-gray-900 ring-1 ring-amber-500' 
                          : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
                      }`}>
                        <input
                          type="checkbox"
                          checked={channels.instagram_story}
                          onChange={(e) => setChannels({ ...channels, instagram_story: e.target.checked })}
                          className="rounded text-amber-600 focus:ring-amber-500"
                        />
                        <div className="min-w-0">
                          <div className="text-[11px] sm:text-xs font-bold flex items-center gap-1 sm:gap-1.5 truncate">
                            <Sparkles className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" /> Insta Story
                          </div>
                          <p className="text-[9px] sm:text-[10px] text-gray-500 mt-0.5 truncate">24h Direct View</p>
                        </div>
                      </label>

                      {/* Facebook Page */}
                      <label className={`p-2.5 sm:p-3.5 rounded-xl border flex items-center gap-2 sm:gap-3 cursor-pointer transition-all ${
                        channels.facebook_page 
                          ? 'border-blue-600 bg-blue-50/50 text-gray-900 ring-1 ring-blue-600' 
                          : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
                      }`}>
                        <input
                          type="checkbox"
                          checked={channels.facebook_page}
                          onChange={(e) => setChannels({ ...channels, facebook_page: e.target.checked })}
                          className="rounded text-blue-600 focus:ring-blue-600"
                        />
                        <div className="min-w-0">
                          <div className="text-[11px] sm:text-xs font-bold flex items-center gap-1 sm:gap-1.5 truncate">
                            <FacebookIcon className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" /> FB Page
                          </div>
                          <p className="text-[9px] sm:text-[10px] text-gray-500 mt-0.5 truncate">Photo & Text</p>
                        </div>
                      </label>

                      {/* Pinterest Pin */}
                      <label className={`p-2.5 sm:p-3.5 rounded-xl border flex items-center gap-2 sm:gap-3 cursor-pointer transition-all ${
                        channels.pinterest_pin 
                          ? 'border-red-600 bg-red-50/50 text-gray-900 ring-1 ring-red-600' 
                          : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
                      }`}>
                        <input
                          type="checkbox"
                          checked={channels.pinterest_pin}
                          onChange={(e) => setChannels({ ...channels, pinterest_pin: e.target.checked })}
                          className="rounded text-red-600 focus:ring-red-600"
                        />
                        <div className="min-w-0">
                          <div className="text-[11px] sm:text-xs font-bold flex items-center gap-1 sm:gap-1.5 truncate">
                            <PinterestIcon className="w-3.5 h-3.5 text-red-600 flex-shrink-0" /> Pinterest Pin
                          </div>
                          <p className="text-[9px] sm:text-[10px] text-gray-500 mt-0.5 truncate">Site Backlink</p>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Story Quantity Selector (If Story checked) */}
                  {channels.instagram_story && (
                    <div className="p-3 sm:p-3.5 bg-amber-50/60 border border-amber-200/80 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Story Images Count:
                        </span>
                        <span className="text-xs font-semibold text-amber-800">
                          {storyImageCount === 1 ? '1 Image (First Photo)' : `${storyImageCount} Images`}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4].map(num => (
                          <button
                            key={num}
                            type="button"
                            onClick={() => setStoryImageCount(num)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                              storyImageCount === num
                                ? 'bg-amber-600 text-white font-bold'
                                : 'bg-white text-gray-700 hover:bg-amber-100 border border-amber-200'
                            }`}
                          >
                            {num === 1 ? '1 Photo' : `${num} Photos`}
                          </button>
                        ))}
                      </div>

                      <p className="text-[11px] text-amber-700/90 leading-relaxed">
                        💡 If 1 is selected, only the primary showcase photo will be uploaded to Instagram Story.
                      </p>
                    </div>
                  )}

                  {/* STEP 3: Images to Include */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold uppercase tracking-wider text-gray-500 block">
                        3. Select Photos ({selectedImages.length} selected)
                      </label>
                      <span className="text-[11px] text-gray-400">
                        Tap photo to include
                      </span>
                    </div>

                    <div className="flex gap-2.5 overflow-x-auto pb-2 -mx-1 px-1 touch-pan-x no-scrollbar">
                      {([
                        selectedProduct.image, 
                        ...(selectedProduct.images || [])
                      ]).filter(Boolean).map((img, idx) => {
                        const isPicked = selectedImages.includes(img);
                        return (
                          <div
                            key={idx}
                            onClick={() => toggleImageSelection(img)}
                            className={`relative w-16 h-20 sm:w-20 sm:h-24 rounded-lg overflow-hidden border-2 cursor-pointer flex-shrink-0 transition-all ${
                              isPicked ? 'border-black ring-2 ring-black/20' : 'border-gray-200 opacity-60 hover:opacity-100'
                            }`}
                          >
                            <img src={img} alt="Product img" className="w-full h-full object-cover" />
                            <div className={`absolute top-1 right-1 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                              isPicked ? 'bg-black text-white' : 'bg-white/80 text-gray-600'
                            }`}>
                              {isPicked ? '✓' : ''}
                            </div>
                            {idx === 0 && (
                              <span className="absolute bottom-1 left-1 bg-black/75 text-white text-[9px] px-1 rounded font-medium">
                                Cover
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* STEP 4: Caption Composer */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-gray-500 block">
                        4. Caption & Dynamic AI Angles
                      </label>
                    </div>

                    {/* AI Angle Switcher Ribbon */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 -mx-1 px-1 no-scrollbar w-full">
                      <span className="text-gray-400 text-[10px] sm:text-[11px] flex-shrink-0">Spin:</span>
                      <button
                        type="button"
                        disabled={generatingCaption}
                        onClick={() => generateCaption(selectedProduct, 'random')}
                        className="px-2.5 py-1 text-[11px] bg-gradient-to-r from-amber-500 to-rose-500 hover:opacity-90 text-white rounded-lg font-bold flex items-center gap-1 shadow-sm transition-all flex-shrink-0 whitespace-nowrap"
                      >
                        <Sparkles className="w-3 h-3" /> 🎲 Spin AI
                      </button>
                      <button
                        type="button"
                        disabled={generatingCaption}
                        onClick={() => generateCaption(selectedProduct, 'metro')}
                        className="px-2 py-1 text-[11px] bg-gray-100 hover:bg-gray-200 rounded-lg font-medium text-gray-800 transition-colors flex-shrink-0 whitespace-nowrap"
                      >
                        🏙️ Metro
                      </button>
                      <button
                        type="button"
                        disabled={generatingCaption}
                        onClick={() => generateCaption(selectedProduct, 'flare')}
                        className="px-2 py-1 text-[11px] bg-gray-100 hover:bg-gray-200 rounded-lg font-medium text-gray-800 transition-colors flex-shrink-0 whitespace-nowrap"
                      >
                        💃 10m Flare
                      </button>
                      <button
                        type="button"
                        disabled={generatingCaption}
                        onClick={() => generateCaption(selectedProduct, 'nri')}
                        className="px-2 py-1 text-[11px] bg-gray-100 hover:bg-gray-200 rounded-lg font-medium text-gray-800 transition-colors flex-shrink-0 whitespace-nowrap"
                      >
                        ✈️ NRI Global
                      </button>
                      <button
                        type="button"
                        disabled={generatingCaption}
                        onClick={() => generateCaption(selectedProduct, 'artisan')}
                        className="px-2 py-1 text-[11px] bg-gray-100 hover:bg-gray-200 rounded-lg font-medium text-gray-800 transition-colors flex-shrink-0 whitespace-nowrap"
                      >
                        🧵 Karigar
                      </button>
                      <button
                        type="button"
                        disabled={generatingCaption}
                        onClick={() => generateCaption(selectedProduct, 'garba')}
                        className="px-2 py-1 text-[11px] bg-gray-100 hover:bg-gray-200 rounded-lg font-medium text-gray-800 transition-colors flex-shrink-0 whitespace-nowrap"
                      >
                        🔥 Navratri
                      </button>
                    </div>

                    {generatingCaption ? (
                      <div className="py-6 text-center text-xs text-gray-500 flex items-center justify-center gap-2 bg-gray-50 border rounded-xl">
                        <div className="w-3.5 h-3.5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                        Generating custom viral caption and dynamic tags for {selectedProduct.name}...
                      </div>
                    ) : (
                      <textarea
                        rows={7}
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-black font-sans leading-relaxed transition-colors"
                        placeholder="Write your post caption..."
                      />
                    )}
                  </div>

                  {/* VIRAL GROUP SEEDING LAUNCHPAD IN TAB 2 */}
                  {publisherGroupText && (
                    <div className="p-3.5 sm:p-4 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200 rounded-xl space-y-2.5 sm:space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <Share2 className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                          <span className="text-[11px] sm:text-xs font-bold text-emerald-900 uppercase tracking-wide">
                            🚀 Viral Group Seeding
                          </span>
                        </div>
                        <span className="text-[9px] sm:text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                          First 30 Mins
                        </span>
                      </div>

                      <p className="text-[10px] sm:text-[11px] text-emerald-800/90 leading-relaxed">
                        Reels go viral when external viewers watch in the first 30 minutes! Share this drop directly:
                      </p>

                      <div className="grid grid-cols-1 sm:flex sm:flex-wrap gap-2 pt-1">
                        <a
                          href={`https://api.whatsapp.com/send?text=${encodeURIComponent(publisherGroupText)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors text-center"
                        >
                          📲 WhatsApp Groups
                        </a>
                        <a
                          href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(selectedProduct ? `https://vastraaura.com/products/${selectedProduct.slug || selectedProduct._id}` : 'https://vastraaura.com')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors text-center"
                        >
                          🌐 Facebook Groups
                        </a>
                        <a
                          href={`https://t.me/share/url?url=${encodeURIComponent(selectedProduct ? `https://vastraaura.com/products/${selectedProduct.slug || selectedProduct._id}` : 'https://vastraaura.com')}&text=${encodeURIComponent(publisherGroupText)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3.5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors text-center"
                        >
                          ✈️ Telegram
                        </a>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(publisherGroupText, 'tab2_group_text')}
                          className="px-3.5 py-2.5 bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors text-center"
                        >
                          {copiedKey === 'tab2_group_text' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          {copiedKey === 'tab2_group_text' ? 'Copied Message!' : 'Copy Group Text'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Error / Success Display */}
                  {errorMsg && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <div>
                        <strong className="block font-semibold">Publish Error:</strong>
                        <span>{errorMsg}</span>
                      </div>
                    </div>
                  )}

                  {publishResult && (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 space-y-3">
                      <div className="flex items-center gap-2 font-bold text-sm text-emerald-900">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        {publishResult.message || 'Successfully Published!'}
                      </div>
                      {publishResult.results?.instagramFeed && (
                        <p>📸 Instagram Feed Post ID: <span className="font-mono">{publishResult.results.instagramFeed.postId}</span></p>
                      )}
                      {publishResult.results?.instagramStory && (
                        <p>📱 Instagram Story posted ({publishResult.results.instagramStory.count} photo)</p>
                      )}
                      {publishResult.results?.facebookPage && (
                        <p>🌐 Facebook Page Photo ID: <span className="font-mono">{publishResult.results.facebookPage.postId}</span></p>
                      )}
                      {publishResult.results?.pinterestPin && (
                        <p className="flex items-center gap-1.5 font-medium">
                          📌 Pinterest Pin Created: 
                          <a 
                            href={publishResult.results.pinterestPin.url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-red-600 underline font-bold hover:text-red-700 flex items-center gap-0.5"
                          >
                            View Pin on Pinterest <ExternalLink className="w-3 h-3" />
                          </a>
                        </p>
                      )}

                      {/* Post-Publish Velocity Reminder */}
                      <div className="pt-2 border-t border-emerald-200/80">
                        <p className="font-bold text-emerald-950 flex items-center gap-1.5">
                          <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                          Launch Viral Velocity Booster (Next 30 Minutes):
                        </p>
                        <p className="text-[11px] text-emerald-900 mt-0.5">
                          Click the green <strong>"Blast to WhatsApp Groups"</strong> button above now to bring immediate external viewers to your post!
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  <div className="pt-2">
                    <button
                      type="button"
                      disabled={publishing}
                      onClick={handlePublish}
                      className="w-full py-4 bg-black text-white hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-black/10"
                    >
                      {publishing ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Publishing to Selected Channels...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Publish Now to Social Channels
                        </>
                      )}
                    </button>
                  </div>

                </div>
              ) : (
                <div className="bg-white border border-gray-200 rounded-2xl p-16 text-center text-gray-400">
                  <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm font-medium">Select a product from the left to start publishing.</p>
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: 30-MINUTE SOCIAL MEDIA QUEUE (Auto-Paced Scheduler)      */}
      {/* ============================================================== */}
      {activeTab === 'queue' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          
          {/* Queue Header Hero Card */}
          <div className="p-6 bg-gradient-to-r from-neutral-900 via-neutral-800 to-indigo-950 text-white rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-neutral-700">
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-ping" />
                <span className="text-xs uppercase tracking-widest text-indigo-400 font-bold">
                  30-Minute Auto-Paced Social Engine
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold font-serif">
                Instagram & Facebook Publishing Queue
              </h2>
              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                Posts and Reels from WhatsApp are automatically queued with a <strong>strict 30-minute gap</strong> between each. This protects your account from spam flags and ensures maximum algorithm visibility.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={handleProcessQueueNow}
                disabled={processingQueue || (queueData?.stats?.pending || 0) === 0}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <Zap className="w-4 h-4 text-amber-300" />
                {processingQueue ? 'Publishing Next...' : '⚡ Publish Next Item Now'}
              </button>

              <button
                onClick={fetchQueue}
                disabled={loadingQueue}
                className="px-3.5 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold rounded-xl border border-neutral-600 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                🔄 Refresh
              </button>
            </div>
          </div>

          {/* Action notification message */}
          {queueActionMsg && (
            <div className="p-3.5 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-900 border border-indigo-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-600" />
              <span>{queueActionMsg}</span>
            </div>
          )}

          {/* Stat Counter Pills */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-white border border-gray-200 rounded-2xl shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Scheduled (Waiting)</p>
                <p className="text-2xl font-bold text-indigo-600 mt-1">{queueData?.stats?.pending || 0}</p>
                <p className="text-[11px] text-gray-500 mt-0.5">Spaced by 30 minutes each</p>
              </div>
              <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
                <Zap className="w-6 h-6" />
              </div>
            </div>

            <div className="p-4 bg-white border border-gray-200 rounded-2xl shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Successfully Published</p>
                <p className="text-2xl font-bold text-emerald-600 mt-1">{queueData?.stats?.published || 0}</p>
                <p className="text-[11px] text-gray-500 mt-0.5">Live on Instagram & Facebook</p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>

            <div className="p-4 bg-white border border-gray-200 rounded-2xl shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Failed / Attention Needed</p>
                <p className="text-2xl font-bold text-rose-600 mt-1">{queueData?.stats?.failed || 0}</p>
                <p className="text-[11px] text-gray-500 mt-0.5">Expired tokens or media errors</p>
              </div>
              <div className="p-3 bg-rose-50 rounded-xl text-rose-600">
                <AlertCircle className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* SECTION 1: UPCOMING SCHEDULED QUEUE */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
                <span className="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg text-xs">⏳</span>
                Upcoming Scheduled Posts ({queueData?.queue?.pending?.length || 0})
              </h3>
              <span className="text-xs text-gray-500">
                Interval: <strong>30 minutes</strong>
              </span>
            </div>

            {loadingQueue ? (
              <div className="p-8 text-center text-gray-500 text-sm">Loading queue...</div>
            ) : (!queueData?.queue?.pending || queueData.queue.pending.length === 0) ? (
              <div className="p-10 text-center text-gray-400 space-y-2">
                <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-400" />
                <p className="font-bold text-gray-700 text-sm">Queue is empty!</p>
                <p className="text-xs text-gray-500">
                  When new products arrive in WhatsApp catalog groups, they will automatically appear here scheduled 30 minutes apart.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {queueData.queue.pending.map((item: any, idx: number) => {
                  const schedTime = new Date(item.scheduledAt);
                  const isPast = schedTime.getTime() <= Date.now();
                  const diffMinutes = Math.round((schedTime.getTime() - Date.now()) / 60000);

                  return (
                    <div key={item._id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/50 rounded-xl px-2 transition-colors">
                      <div className="flex items-start gap-3.5">
                        <span className="w-7 h-7 rounded-full bg-neutral-900 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                          {idx + 1}
                        </span>

                        {item.images && item.images[0] ? (
                          <img
                            src={item.images[0]}
                            alt={item.title}
                            className="w-14 h-14 rounded-xl object-cover border border-gray-200 flex-shrink-0"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center flex-shrink-0 font-bold text-xs">
                            🎬 Reel
                          </div>
                        )}

                        <div className="space-y-1 min-w-0">
                          <p className="text-sm font-bold text-gray-900 truncate max-w-md">
                            {item.title}
                          </p>
                          <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                            <span className="px-2 py-0.5 bg-neutral-100 text-neutral-800 rounded font-bold">
                              {item.mediaType === 'REEL' ? '🎬 Reel' : item.mediaType === 'CAROUSEL' ? `📸 Carousel (${item.images?.length || 0})` : '📸 Single Image'}
                            </span>
                            <span className="px-2 py-0.5 bg-pink-50 text-pink-700 rounded font-semibold">
                              Instagram
                            </span>
                            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded font-semibold">
                              Facebook
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 justify-between sm:justify-end">
                        <div className="text-right">
                          <span className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full ${
                            isPast 
                              ? 'bg-amber-100 text-amber-800' 
                              : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          }`}>
                            {isPast ? '⚡ Due Now' : `in ${diffMinutes} mins`}
                          </span>
                          <p className="text-[11px] text-gray-400 mt-0.5 font-mono">
                            {schedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>

                        <button
                          onClick={() => handleDeleteQueueItem(item._id)}
                          className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Remove from queue"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* SECTION 2: RECENTLY PUBLISHED POSTS */}
          {queueData?.queue?.published && queueData.queue.published.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-base text-gray-900 flex items-center gap-2 border-b pb-3">
                <span className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg text-xs">✓</span>
                Recently Published History ({queueData.queue.published.length})
              </h3>
              <div className="divide-y divide-gray-100">
                {queueData.queue.published.map((item: any) => (
                  <div key={item._id} className="py-3 flex items-center justify-between gap-4 text-xs">
                    <div className="flex items-center gap-3 truncate">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span className="font-bold text-gray-900 truncate">{item.title}</span>
                      <span className="text-gray-400 font-mono text-[11px]">
                        {new Date(item.publishedAt || item.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold rounded">
                      Live
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 3: FAILED POSTS (If any) */}
          {queueData?.queue?.failed && queueData.queue.failed.length > 0 && (
            <div className="bg-rose-50/50 border border-rose-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-rose-200 pb-3">
                <h3 className="font-bold text-base text-rose-900 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-rose-600" />
                  Failed Posts ({queueData.queue.failed.length})
                </h3>
              </div>
              <div className="space-y-3">
                {queueData.queue.failed.map((item: any) => (
                  <div key={item._id} className="p-3 bg-white border border-rose-200 rounded-xl flex items-center justify-between gap-4 text-xs">
                    <div className="space-y-1 min-w-0">
                      <p className="font-bold text-gray-900 truncate">{item.title}</p>
                      <p className="text-rose-600 text-[11px] font-mono truncate">{item.error || 'Failed to publish'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleRetryQueueItem(item._id)}
                        className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded text-[11px] cursor-pointer"
                      >
                        Retry
                      </button>
                      <button
                        onClick={() => handleDeleteQueueItem(item._id)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* SOCIAL CONFIG MODAL (META & PINTEREST) */}
      {showConfigModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                <SettingsIcon className="w-5 h-5 text-accent" /> Social Media API Connections
              </h3>
              <button 
                onClick={() => setShowConfigModal(false)}
                className="text-gray-400 hover:text-gray-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-gray-500 leading-relaxed">
              Configure credentials to publish directly to Instagram, Facebook, and Pinterest.
            </p>

            <form onSubmit={handleSaveConfig} className="space-y-4">
              {/* Meta (Instagram & Facebook) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 flex items-center gap-1.5">
                    <InstagramIcon className="w-3.5 h-3.5 text-pink-600" /> Meta (Instagram & Facebook)
                  </h4>
                  {config?.isConnected && (
                    <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      ✓ Connected @{config.igUsername || 'vastraaura21'}
                    </span>
                  )}
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    Meta Access Token (Long-Lived Page/User Token)
                  </label>
                  <input
                    type="password"
                    placeholder="EAAB..."
                    value={configForm.metaAccessToken}
                    onChange={(e) => setConfigForm({ ...configForm, metaAccessToken: e.target.value })}
                    className="w-full p-2.5 border rounded-lg text-xs font-mono bg-gray-50 focus:outline-none focus:border-black"
                  />
                  <span className="text-[11px] text-gray-400">Leave blank if you want to keep existing token.</span>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    Instagram Account ID (IG_ACCOUNT_ID)
                  </label>
                  <input
                    type="text"
                    placeholder="178414..."
                    value={configForm.metaIgAccountId}
                    onChange={(e) => setConfigForm({ ...configForm, metaIgAccountId: e.target.value })}
                    className="w-full p-2.5 border rounded-lg text-xs font-mono bg-gray-50 focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    Facebook Page ID (PAGE_ID)
                  </label>
                  <input
                    type="text"
                    placeholder="127514..."
                    value={configForm.metaPageId}
                    onChange={(e) => setConfigForm({ ...configForm, metaPageId: e.target.value })}
                    className="w-full p-2.5 border rounded-lg text-xs font-mono bg-gray-50 focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    Meta Ad Account ID (Optional for Ads)
                  </label>
                  <input
                    type="text"
                    placeholder="172158..."
                    value={configForm.metaAdAccountId}
                    onChange={(e) => setConfigForm({ ...configForm, metaAdAccountId: e.target.value })}
                    className="w-full p-2.5 border rounded-lg text-xs font-mono bg-gray-50 focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              {/* Pinterest Section */}
              <div className="pt-4 border-t border-gray-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 flex items-center gap-1.5">
                    <PinterestIcon className="w-3.5 h-3.5 text-red-600" /> Pinterest API Settings (v5)
                  </h4>
                  {config?.isPinterestConnected && (
                    <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      ✓ Connected @{config.pinterestUsername}
                    </span>
                  )}
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    Pinterest Access Token (Trial or Bearer Token)
                  </label>
                  <input
                    type="password"
                    placeholder="pina_..."
                    value={configForm.pinterestAccessToken}
                    onChange={(e) => setConfigForm({ ...configForm, pinterestAccessToken: e.target.value })}
                    className="w-full p-2.5 border rounded-lg text-xs font-mono bg-gray-50 focus:outline-none focus:border-red-600"
                  />
                  <span className="text-[11px] text-gray-400">From Pinterest Developers App Dashboard. Leave blank to keep existing.</span>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    Pinterest Default Board ID
                  </label>
                  {config?.pinterestBoards && config.pinterestBoards.length > 0 ? (
                    <div className="space-y-1.5">
                      <select
                        value={configForm.pinterestBoardId}
                        onChange={(e) => setConfigForm({ ...configForm, pinterestBoardId: e.target.value })}
                        className="w-full p-2.5 border rounded-lg text-xs font-medium bg-gray-50 focus:outline-none focus:border-red-600"
                      >
                        <option value="">-- Select one of your Pinterest Boards --</option>
                        {config.pinterestBoards.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.name} ({b.id})
                          </option>
                        ))}
                      </select>
                      <p className="text-[10px] text-gray-400">Or enter Board ID manually below if not listed:</p>
                      <input
                        type="text"
                        placeholder="e.g. 10987654321..."
                        value={configForm.pinterestBoardId}
                        onChange={(e) => setConfigForm({ ...configForm, pinterestBoardId: e.target.value })}
                        className="w-full p-2 border rounded-lg text-xs font-mono bg-gray-50 focus:outline-none focus:border-red-600"
                      />
                    </div>
                  ) : (
                    <>
                      <input
                        type="text"
                        placeholder="Enter your Pinterest Board ID (e.g. 10987654321...)"
                        value={configForm.pinterestBoardId}
                        onChange={(e) => setConfigForm({ ...configForm, pinterestBoardId: e.target.value })}
                        className="w-full p-2.5 border rounded-lg text-xs font-mono bg-gray-50 focus:outline-none focus:border-red-600"
                      />
                      <span className="text-[11px] text-gray-400">Open your Pinterest board in browser to copy the ID, or enter token to fetch boards automatically.</span>
                    </>
                  )}
                </div>

                {config?.pinterestConnectionError && (
                  <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-[11px] text-red-600">
                    Pinterest Status: {config.pinterestConnectionError}
                  </div>
                )}
              </div>

              {/* ── WhatsApp Automation Section ── */}
              <div className="pt-4 border-t border-gray-200 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 flex items-center gap-1.5">
                  <span>📲</span> WhatsApp Group → Auto Social Publish
                </h4>
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  WhatsApp group mathi product aave tyare automatically Instagram + Facebook per post/reel muki devanu.
                </p>

                {/* Master Toggle */}
                <label className="flex items-center gap-3 cursor-pointer group p-3 bg-gray-50 rounded-xl border border-gray-200 hover:border-black transition-colors">
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      checked={wpAutoSocial}
                      onChange={(e) => setWpAutoSocial(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`w-10 h-5 rounded-full transition-colors ${wpAutoSocial ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <div className={`absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full shadow transition-transform ${wpAutoSocial ? 'translate-x-5' : 'translate-x-0'}`}></div>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-gray-900">Auto-Publish to Social Media</span>
                    <span className="block text-[11px] text-gray-500">WhatsApp mathi product aave → Instantly social media per live</span>
                  </div>
                </label>

                {wpAutoSocial && (
                  <div className="space-y-3 pl-1">
                    {/* Channel Selection */}
                    <div>
                      <p className="text-[11px] font-semibold text-gray-700 mb-1.5">Kya platforms per auto-post karvu?</p>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { key: 'instagram_feed', label: '📸 Instagram Feed (Photo/Carousel)', color: 'pink' },
                          { key: 'facebook_page', label: '📘 Facebook Page (Photo/Reel)', color: 'blue' },
                          { key: 'instagram_reel', label: '🎬 Force Reel Format (Video Only)', color: 'purple' },
                        ].map(({ key, label, color }) => (
                          <label key={key} className={`flex items-center gap-1.5 cursor-pointer px-2.5 py-1.5 rounded-lg border text-[11px] font-medium transition-all ${
                            wpChannels[key as keyof typeof wpChannels]
                              ? `bg-${color}-50 border-${color}-300 text-${color}-800`
                              : 'bg-gray-50 border-gray-200 text-gray-500'
                          }`}>
                            <input
                              type="checkbox"
                              checked={wpChannels[key as keyof typeof wpChannels]}
                              onChange={(e) => setWpChannels({ ...wpChannels, [key]: e.target.checked })}
                              className="w-3 h-3 accent-black"
                            />
                            {label}
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Allowed Groups Whitelist */}
                    <div>
                      <label className="text-[11px] font-semibold text-gray-700 block mb-1">
                        Allowed WhatsApp Groups (1 per line — Group name or Chat ID)
                      </label>
                      <textarea
                        rows={3}
                        value={wpAllowedGroups}
                        onChange={(e) => setWpAllowedGroups(e.target.value)}
                        placeholder={"Vastra Catalog Group\n120363XXXXXXXXXX@g.us\nSurat Fashion Suppliers"}
                        className="w-full p-2 border rounded-lg text-[11px] font-mono bg-gray-50 focus:outline-none focus:border-black resize-none"
                      />
                      <p className="text-[10px] text-gray-400 mt-1">
                        Blank = ALL groups allowed. Group name partial match bhi kaam karse (case-insensitive).
                      </p>
                    </div>

                    {wpConfigMsg && (
                      <div className={`p-2.5 rounded-lg text-[11px] font-medium ${wpConfigMsg.startsWith('✅') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                        {wpConfigMsg}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={handleSaveWpConfig}
                      disabled={savingWpConfig}
                      className="w-full py-2 text-xs font-bold text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-60"
                    >
                      {savingWpConfig ? 'Saving...' : '💾 Save WhatsApp Automation Settings'}
                    </button>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingConfig}
                  className="px-4 py-2 text-xs font-bold text-white bg-black hover:bg-neutral-800 rounded-lg transition-colors"
                >
                  {savingConfig ? 'Saving...' : 'Save Credentials'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
