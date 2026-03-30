import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  CreditCard, 
  ShoppingCart, 
  Settings, 
  LogOut, 
  User, 
  ShieldCheck, 
  Zap, 
  Award,
  Plus,
  History,
  Menu,
  X,
  ChevronRight,
  QrCode,
  Mail,
  Lock,
  Chrome,
  AlertCircle,
  Image as ImageIcon,
  MessageCircle,
  Trash2,
  DollarSign
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { cn } from './lib/utils';
import { supabase } from './lib/supabase';

// --- Types ---
interface UserProfile {
  id: string;
  email: string;
  name: string;
  credits: number;
  rank: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  role: 'user' | 'admin';
}

interface Order {
  id: string;
  user_id: string;
  user_name: string;
  service_type: string;
  description: string;
  cost: number;
  status: 'pending' | 'completed' | 'cancelled';
  created_at: string;
}

interface Design {
  id: string;
  title: string;
  description: string;
  image_url: string;
  price: number;
  category: string;
  created_at: string;
}

// --- Constants ---
const WHATSAPP_NUMBER = "01930277399";

// --- Helper Functions ---
const calculateRank = (credits: number) => {
  if (credits >= 5000) return "Platinum";
  if (credits >= 2000) return "Gold";
  if (credits >= 500) return "Silver";
  return "Bronze";
};

const sendWhatsAppMessage = (design: Design) => {
  const message = `Hello Graphico Global! I am interested in this design:\n\nTitle: ${design.title}\nPrice: ${design.price} BDT\nID: ${design.id}\n\nPlease provide more details.`;
  const encodedMessage = encodeURIComponent(message);
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`, '_blank');
};

// --- Components ---

const Navbar = ({ profile, onLogout }: { profile: UserProfile | null, onLogout: () => void }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10 px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl accent-gradient flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform">
            <Zap className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            Graphico<span className="text-purple-500">Global</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-sm font-medium text-white/70 hover:text-white transition-colors">Portfolio</Link>
          {profile && (
            <>
              <Link to="/dashboard" className="text-sm font-medium text-white/70 hover:text-white transition-colors">Dashboard</Link>
              {profile.role === 'admin' && (
                <Link to="/admin" className="text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4" /> Admin
                </Link>
              )}
            </>
          )}
        </div>

        {profile ? (
          <div className="hidden md:flex items-center gap-4 pl-4 border-l border-white/10">
            <div className="flex flex-col items-end">
              <span className="text-sm font-semibold text-white">{profile.name}</span>
              <span className="text-[10px] uppercase tracking-widest text-purple-400 font-bold">{profile.rank}</span>
            </div>
            <button 
              onClick={onLogout}
              className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-all"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="hidden md:flex gap-4">
            <Link to="/login" className="text-sm font-medium text-white/70 hover:text-white px-4 py-2">Login</Link>
            <Link to="/signup" className="text-sm font-medium bg-white text-black px-6 py-2 rounded-full hover:bg-white/90 transition-colors">Join Now</Link>
          </div>
        )}

        <button className="md:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>
    </nav>
  );
};

const MOCK_DESIGNS: Design[] = [
  {
    id: '1',
    title: 'Premium Logo Design',
    description: 'A high-end, minimalist logo for a global brand. Clean lines and modern typography.',
    image_url: 'https://picsum.photos/seed/logo1/800/600',
    price: 5000,
    category: 'Logo',
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Social Media Branding',
    description: 'Complete social media kit including banners, profile pictures, and post templates.',
    image_url: 'https://picsum.photos/seed/social1/800/600',
    price: 3500,
    category: 'Social',
    created_at: new Date().toISOString()
  },
  {
    id: '3',
    title: 'Corporate Website UI',
    description: 'Modern and responsive website design for a corporate client. Focus on UX and conversion.',
    image_url: 'https://picsum.photos/seed/web1/800/600',
    price: 12000,
    category: 'Web',
    created_at: new Date().toISOString()
  }
];

function DesignCard({ design }: { design: Design }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card rounded-3xl overflow-hidden group"
    >
      <div className="aspect-video overflow-hidden relative">
        <img 
          src={design.image_url} 
          alt={design.title} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-purple-400">
          {design.price} BDT
        </div>
      </div>
      <div className="p-6 space-y-4">
        <div>
          <h3 className="text-xl font-bold text-white">{design.title}</h3>
          <p className="text-white/40 text-sm line-clamp-2">{design.description}</p>
        </div>
        <button 
          onClick={() => sendWhatsAppMessage(design)}
          className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-2xl transition-all shadow-lg shadow-green-500/20"
        >
          <MessageCircle className="w-5 h-5" />
          Order on WhatsApp
        </button>
      </div>
    </motion.div>
  );
}

const MembershipCard = ({ profile }: { profile: UserProfile }) => {
  const rankColors = {
    Bronze: 'from-orange-400 to-orange-700',
    Silver: 'from-slate-300 to-slate-500',
    Gold: 'from-yellow-400 to-yellow-600',
    Platinum: 'from-purple-400 to-purple-600',
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "relative w-full aspect-[1.6/1] rounded-[2rem] p-8 overflow-hidden shadow-2xl group",
        "bg-gradient-to-br",
        rankColors[profile.rank]
      )}
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl group-hover:scale-110 transition-transform duration-700" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full -ml-24 -mb-24 blur-2xl" />
      
      <div className="relative h-full flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-[0.3em] font-black text-white/60">Digital Membership</p>
            <h3 className="text-2xl font-black text-white tracking-tight">Graphico Global</h3>
          </div>
          <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
            <Zap className="text-white w-6 h-6" />
          </div>
        </div>

        <div className="flex justify-between items-end">
          <div className="space-y-4">
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-widest font-bold text-white/60">Member Name</p>
              <p className="text-lg font-bold text-white">{profile.name}</p>
            </div>
            <div className="flex gap-8">
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-widest font-bold text-white/60">Rank</p>
                <p className="text-sm font-black text-white">{profile.rank}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-widest font-bold text-white/60">Credits</p>
                <p className="text-sm font-black text-white">{profile.credits}</p>
              </div>
            </div>
          </div>
          <div className="p-2 bg-white rounded-xl shadow-lg">
            <QRCodeSVG value={profile.id} size={64} level="H" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const Portfolio = () => {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDesigns();
  }, []);

  const fetchDesigns = async () => {
    try {
      const { data, error } = await supabase
        .from('designs')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setDesigns(data && data.length > 0 ? data : MOCK_DESIGNS);
    } catch (err) {
      console.error('Error fetching designs, using mock data:', err);
      setDesigns(MOCK_DESIGNS);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-24 pb-24">
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center px-6 pt-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] animate-pulse delay-1000" />
        </div>
        
        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-white/10 text-purple-400 text-sm font-bold tracking-widest uppercase"
          >
            <Award className="w-4 h-4" /> Premium Design Agency
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl font-black tracking-tighter text-white leading-tight"
          >
            ELEVATE YOUR <br />
            <span className="text-transparent bg-clip-text accent-gradient">DIGITAL PRESENCE</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white/50 text-xl max-w-2xl mx-auto leading-relaxed"
          >
            We craft high-end visual identities and premium digital experiences that set your brand apart from the global competition.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <Link to="/signup" className="px-10 py-5 bg-white text-black font-black rounded-2xl hover:scale-105 transition-transform shadow-xl shadow-white/10">
              Get Started
            </Link>
            <a href="#portfolio" className="px-10 py-5 glass text-white font-black rounded-2xl hover:bg-white/10 transition-colors border border-white/10">
              View Designs
            </a>
          </motion.div>
        </div>
      </section>

      {/* Portfolio Grid */}
      <div id="portfolio" className="px-6 max-w-7xl mx-auto space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h2 className="text-4xl font-black text-white tracking-tight">FEATURED <span className="text-purple-500">DESIGNS</span></h2>
            <p className="text-white/40">Browse our latest creations and order directly via WhatsApp.</p>
          </div>
          <div className="flex gap-2">
            {['All', 'Logo', 'Social', 'Web'].map(cat => (
              <button key={cat} className="px-4 py-2 rounded-xl glass border border-white/5 text-xs font-bold text-white/60 hover:text-white transition-colors">{cat}</button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-24">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full" />
          </div>
        ) : designs.length === 0 ? (
          <div className="text-center py-24 glass-card rounded-3xl">
            <ImageIcon className="w-16 h-16 text-white/10 mx-auto mb-4" />
            <p className="text-white/40">No designs uploaded yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {designs.map((design) => (
              <div key={design.id}>
                <DesignCard design={design} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const AuthPage = ({ type }: { type: 'login' | 'signup' }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (type === 'signup') {
        const { error } = await supabase.auth.signUp({
          email, password, options: { data: { full_name: name } }
        });
        if (error) throw error;
        alert('Check your email for the confirmation link!');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 purple-gradient">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md glass-card p-10 rounded-[2rem]">
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl accent-gradient flex items-center justify-center mx-auto mb-6 shadow-xl shadow-purple-500/20">
            <Zap className="text-white w-8 h-8" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">{type === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
          <p className="text-white/50 text-sm">Join Graphico Global to track your orders and credits.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {type === 'signup' && (
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">Full Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all" placeholder="John Doe" required />
            </div>
          )}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">Email Address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all" placeholder="name@company.com" required />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all" placeholder="••••••••" required />
          </div>
          {error && <p className="text-red-400 text-xs font-medium text-center">{error}</p>}
          <button type="submit" disabled={loading} className="w-full accent-gradient text-white font-bold py-5 rounded-2xl shadow-lg shadow-purple-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50">
            {loading ? 'Processing...' : type === 'login' ? 'Login to Dashboard' : 'Start Your Journey'}
          </button>
        </form>
        <div className="mt-8 text-center">
          <p className="text-white/40 text-sm">
            {type === 'login' ? "Don't have an account?" : "Already a member?"}
            <Link to={type === 'login' ? '/signup' : '/login'} className="text-purple-400 font-bold ml-2 hover:text-purple-300 transition-colors">{type === 'login' ? 'Sign Up' : 'Log In'}</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

const Dashboard = ({ profile }: { profile: UserProfile }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-12 px-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-8">
          <MembershipCard profile={profile} />
          <div className="glass-card rounded-3xl p-8 space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2"><User className="w-5 h-5 text-purple-400" /> Account Details</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-white/5"><span className="text-white/40 text-sm">Member ID</span><span className="text-white font-mono text-xs">{profile.id.substring(0, 8)}...</span></div>
              <div className="flex justify-between items-center py-3 border-b border-white/5"><span className="text-white/40 text-sm">Email</span><span className="text-white text-sm">{profile.email}</span></div>
              <div className="flex justify-between items-center py-3"><span className="text-white/40 text-sm">Rank</span><span className="text-white text-sm font-bold text-purple-400">{profile.rank}</span></div>
            </div>
          </div>
        </div>
        <div className="lg:col-span-2 space-y-8">
          <h2 className="text-3xl font-bold text-white tracking-tight">Your Order History</h2>
          <div className="glass-card rounded-3xl overflow-hidden">
            {loading ? <div className="p-12 text-center text-white/40">Loading...</div> : orders.length === 0 ? <div className="p-12 text-center text-white/40">No orders yet.</div> : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead><tr className="bg-white/5 border-b border-white/10"><th className="px-8 py-4 text-xs font-bold uppercase tracking-widest text-white/40">Service</th><th className="px-8 py-4 text-xs font-bold uppercase tracking-widest text-white/40">Status</th><th className="px-8 py-4 text-xs font-bold uppercase tracking-widest text-white/40">Cost</th></tr></thead>
                  <tbody className="divide-y divide-white/5">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-white/5 transition-colors"><td className="px-8 py-6 text-white font-bold">{order.service_type}</td><td className="px-8 py-6"><span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-yellow-500/10 text-yellow-500">{order.status}</span></td><td className="px-8 py-6 text-purple-400 font-bold">{order.cost} Cr</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminPanel = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [designs, setDesigns] = useState<Design[]>([]);
  const [loading, setLoading] = useState(true);
  const [newDesign, setNewDesign] = useState({ title: '', description: '', image_url: '', price: 0 });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: uData } = await supabase.from('profiles').select('*');
      const { data: dData } = await supabase.from('designs').select('*').order('created_at', { ascending: false });
      setUsers(uData || []);
      setDesigns(dData || []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleAddDesign = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('designs').insert([newDesign]);
      if (error) throw error;
      setNewDesign({ title: '', description: '', image_url: '', price: 0 });
      fetchData();
    } catch (err) { alert('Error adding design'); }
  };

  const handleDeleteDesign = async (id: string) => {
    if (!confirm('Delete this design?')) return;
    try {
      await supabase.from('designs').delete().eq('id', id);
      fetchData();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="min-h-screen pt-32 pb-12 px-6 max-w-7xl mx-auto space-y-12">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-purple-600 flex items-center justify-center"><ShieldCheck className="text-white w-6 h-6" /></div>
        <h1 className="text-4xl font-bold text-white tracking-tight">Admin Control</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Design Upload */}
        <div className="glass-card rounded-[2rem] p-8 space-y-8">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2"><Plus className="w-6 h-6 text-purple-400" /> Upload New Design</h2>
          <form onSubmit={handleAddDesign} className="space-y-4">
            <input type="text" placeholder="Design Title" value={newDesign.title} onChange={e => setNewDesign({...newDesign, title: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white" required />
            <textarea placeholder="Description" value={newDesign.description} onChange={e => setNewDesign({...newDesign, description: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white" required />
            <input type="url" placeholder="Image URL (Direct link)" value={newDesign.image_url} onChange={e => setNewDesign({...newDesign, image_url: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white" required />
            <input type="number" placeholder="Price (BDT)" value={newDesign.price} onChange={e => setNewDesign({...newDesign, price: parseInt(e.target.value)})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white" required />
            <button type="submit" className="w-full accent-gradient text-white font-bold py-4 rounded-xl shadow-lg shadow-purple-500/20">Upload Design</button>
          </form>
        </div>

        {/* Existing Designs */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2"><ImageIcon className="w-6 h-6 text-purple-400" /> Manage Designs</h2>
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {designs.map(design => (
              <div key={design.id} className="glass-card p-4 rounded-2xl flex gap-4 items-center">
                <img src={design.image_url} className="w-20 h-20 object-cover rounded-xl" referrerPolicy="no-referrer" />
                <div className="flex-1">
                  <h4 className="font-bold text-white">{design.title}</h4>
                  <p className="text-purple-400 text-sm font-bold">{design.price} BDT</p>
                </div>
                <button onClick={() => handleDeleteDesign(design.id)} className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-all"><Trash2 className="w-5 h-5" /></button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (!supabase.auth) {
          setLoading(false);
          return;
        }
        const { data: { session } } = await supabase.auth.getSession();
        if (session) await fetchProfile(session.user.id);
        else setLoading(false);
      } catch (err: any) { 
        console.error('Auth init error:', err);
        setLoading(false); 
      }
    };
    initAuth();
    
    if (supabase.auth) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session) fetchProfile(session.user.id);
        else { setProfile(null); setLoading(false); }
      });
      return () => subscription.unsubscribe();
    }
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (error) {
        if (error.code === 'PGRST116') { setTimeout(() => fetchProfile(userId), 1000); return; }
        throw error;
      }
      setProfile(data);
    } catch (err: any) { console.error(err); setError(err.message); } finally { setLoading(false); }
  };

  const handleLogout = async () => { await supabase.auth.signOut(); };

  if (loading) return <div className="min-h-screen purple-gradient flex items-center justify-center"><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full" /></div>;

  if (error && !profile) {
    return (
      <div className="min-h-screen purple-gradient flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Configuration Required</h2>
        <p className="text-white/50 max-w-md mb-8">Please ensure your Supabase environment variables are correctly set and the database schema is applied.</p>
        <button onClick={() => window.location.reload()} className="px-8 py-3 bg-white text-black rounded-xl font-bold">Retry</button>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen purple-gradient text-white selection:bg-purple-500/30">
        <Navbar profile={profile} onLogout={handleLogout} />
        <Routes>
          <Route path="/" element={<Portfolio />} />
          <Route path="/login" element={!profile ? <AuthPage type="login" /> : <Navigate to="/dashboard" />} />
          <Route path="/signup" element={!profile ? <AuthPage type="signup" /> : <Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={profile ? <Dashboard profile={profile} /> : <Navigate to="/login" />} />
          <Route path="/admin" element={profile?.role === 'admin' ? <AdminPanel /> : <Navigate to="/dashboard" />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}
