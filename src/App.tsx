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
  AlertCircle
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

// --- Helper Functions ---
const calculateRank = (credits: number) => {
  if (credits >= 5000) return "Platinum";
  if (credits >= 2000) return "Gold";
  if (credits >= 500) return "Silver";
  return "Bronze";
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

        {profile && (
          <div className="hidden md:flex items-center gap-8">
            <Link to="/dashboard" className="text-sm font-medium text-white/70 hover:text-white transition-colors">Dashboard</Link>
            <Link to="/orders" className="text-sm font-medium text-white/70 hover:text-white transition-colors">Orders</Link>
            {profile.role === 'admin' && (
              <Link to="/admin" className="text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" /> Admin
              </Link>
            )}
            <div className="flex items-center gap-4 pl-4 border-l border-white/10">
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
          </div>
        )}

        {!profile && (
          <div className="flex gap-4">
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

const MembershipCard = ({ profile }: { profile: UserProfile }) => {
  const rankColors = {
    Bronze: "from-orange-700 to-orange-900",
    Silver: "from-slate-400 to-slate-600",
    Gold: "from-yellow-500 to-yellow-700",
    Platinum: "from-purple-600 to-indigo-900"
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "relative w-full max-w-md aspect-[1.6/1] rounded-3xl p-8 overflow-hidden shadow-2xl",
        "bg-gradient-to-br", rankColors[profile.rank]
      )}
    >
      <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute bottom-[-20%] left-[-10%] w-48 h-48 bg-black/20 rounded-full blur-2xl" />
      
      <div className="relative h-full flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/60 font-bold">Membership Card</p>
            <h3 className="text-2xl font-bold text-white mt-1 tracking-tight">Graphico Global</h3>
          </div>
          <Award className="w-8 h-8 text-white/80" />
        </div>

        <div className="flex justify-between items-end">
          <div className="space-y-4">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-white/50">Member Name</p>
              <p className="text-lg font-medium text-white">{profile.name}</p>
            </div>
            <div className="flex gap-8">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-white/50">Rank</p>
                <p className="text-sm font-bold text-white">{profile.rank}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-white/50">Credits</p>
                <p className="text-sm font-bold text-white">{profile.credits}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-2 rounded-xl">
            <QRCodeSVG value={profile.id} size={60} />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const AuthPage = ({ type }: { type: 'login' | 'signup' }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) setError(error.message);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (type === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name
            }
          }
        });
        if (error) throw error;
        alert('Check your email for the confirmation link!');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
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
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md glass-card p-10 rounded-[2rem]"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl accent-gradient flex items-center justify-center mx-auto mb-6 shadow-xl shadow-purple-500/20">
            <Zap className="text-white w-8 h-8" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">{type === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
          <p className="text-white/50 text-sm">Experience the future of professional design services.</p>
        </div>

        <button 
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-white/5 border border-white/10 text-white font-bold py-4 rounded-2xl hover:bg-white/10 transition-all mb-6"
        >
          <Chrome className="w-5 h-5" />
          Continue with Google
        </button>

        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
          <div className="relative flex justify-center text-xs uppercase"><span className="bg-transparent px-2 text-white/40 font-bold">Or continue with email</span></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {type === 'signup' && (
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>
          )}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                placeholder="name@company.com"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {error && <p className="text-red-400 text-xs font-medium text-center">{error}</p>}

          <button 
            type="submit"
            disabled={loading}
            className="w-full accent-gradient text-white font-bold py-5 rounded-2xl shadow-lg shadow-purple-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {loading ? 'Processing...' : type === 'login' ? 'Login to Dashboard' : 'Start Your Journey'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-white/40 text-sm">
            {type === 'login' ? "Don't have an account?" : "Already a member?"}
            <Link to={type === 'login' ? '/signup' : '/login'} className="text-purple-400 font-bold ml-2 hover:text-purple-300 transition-colors">
              {type === 'login' ? 'Sign Up' : 'Log In'}
            </Link>
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
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-8">
          <MembershipCard profile={profile} />
          
          <div className="glass-card rounded-3xl p-8 space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <User className="w-5 h-5 text-purple-400" /> Account Details
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-white/5">
                <span className="text-white/40 text-sm">Member ID</span>
                <span className="text-white font-mono text-xs">{profile.id.substring(0, 8)}...</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-white/5">
                <span className="text-white/40 text-sm">Email</span>
                <span className="text-white text-sm">{profile.email}</span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-white/40 text-sm">Join Date</span>
                <span className="text-white text-sm">March 2026</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold text-white tracking-tight">Your Orders</h2>
            <Link to="/order-new" className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-purple-500/20">
              <Plus className="w-5 h-5" /> New Service
            </Link>
          </div>

          <div className="glass-card rounded-3xl overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-white/40">Loading your orders...</div>
            ) : orders.length === 0 ? (
              <div className="p-12 text-center space-y-4">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                  <ShoppingCart className="w-8 h-8 text-white/20" />
                </div>
                <p className="text-white/40">No orders found. Start by requesting a service.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-white/5 border-b border-white/10">
                      <th className="px-8 py-4 text-xs font-bold uppercase tracking-widest text-white/40">Service</th>
                      <th className="px-8 py-4 text-xs font-bold uppercase tracking-widest text-white/40">Status</th>
                      <th className="px-8 py-4 text-xs font-bold uppercase tracking-widest text-white/40">Cost</th>
                      <th className="px-8 py-4 text-xs font-bold uppercase tracking-widest text-white/40">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-white/5 transition-colors group">
                        <td className="px-8 py-6">
                          <div className="flex flex-col">
                            <span className="text-white font-bold">{order.service_type}</span>
                            <span className="text-xs text-white/40 truncate max-w-[200px]">{order.description}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className={cn(
                            "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                            order.status === 'pending' ? "bg-yellow-500/10 text-yellow-500" : 
                            order.status === 'completed' ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                          )}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          <span className="text-purple-400 font-bold">{order.cost} Cr</span>
                        </td>
                        <td className="px-8 py-6 text-white/40 text-sm">
                          {new Date(order.created_at).toLocaleDateString()}
                        </td>
                      </tr>
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

const NewOrderPage = ({ profile, onUpdateProfile }: { profile: UserProfile, onUpdateProfile: (p: UserProfile) => void }) => {
  const [serviceType, setServiceType] = useState('Logo Design');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const services = [
    { name: 'Logo Design', cost: 50, icon: Award },
    { name: 'UI/UX Design', cost: 150, icon: LayoutDashboard },
    { name: 'Brand Identity', cost: 300, icon: ShieldCheck },
    { name: 'Motion Graphics', cost: 200, icon: Zap },
  ];

  const selectedService = services.find(s => s.name === serviceType);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService) return;
    if (profile.credits < selectedService.cost) {
      setError('Insufficient credits');
      return;
    }

    setLoading(true);
    try {
      const newCredits = profile.credits - selectedService.cost;
      const newRank = calculateRank(newCredits);

      const { error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: profile.id,
          user_name: profile.name,
          service_type: serviceType,
          description,
          cost: selectedService.cost,
          status: 'pending'
        });
      
      if (orderError) throw orderError;

      const { error: profileError } = await supabase
        .from('profiles')
        .update({ credits: newCredits, rank: newRank })
        .eq('id', profile.id);
      
      if (profileError) throw profileError;

      onUpdateProfile({ ...profile, credits: newCredits, rank: newRank });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-6 max-w-3xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-[2.5rem] p-10"
      >
        <h2 className="text-3xl font-bold text-white mb-8">Request New Service</h2>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map((s) => (
              <button
                key={s.name}
                type="button"
                onClick={() => setServiceType(s.name)}
                className={cn(
                  "p-6 rounded-3xl border-2 text-left transition-all flex items-center gap-4",
                  serviceType === s.name 
                    ? "border-purple-500 bg-purple-500/10" 
                    : "border-white/5 bg-white/5 hover:bg-white/10"
                )}
              >
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center",
                  serviceType === s.name ? "bg-purple-500 text-white" : "bg-white/10 text-white/40"
                )}>
                  <s.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-white font-bold">{s.name}</p>
                  <p className="text-purple-400 text-sm font-bold">{s.cost} Credits</p>
                </div>
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">Project Description</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-3xl px-6 py-5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all min-h-[150px]"
              placeholder="Tell us about your project requirements..."
              required
            />
          </div>

          <div className="flex items-center justify-between p-6 bg-white/5 rounded-3xl">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-white/40">Total Cost</p>
              <p className="text-2xl font-bold text-white">{selectedService?.cost} Credits</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold uppercase tracking-widest text-white/40">Your Balance</p>
              <p className={cn("text-lg font-bold", profile.credits < (selectedService?.cost || 0) ? "text-red-400" : "text-purple-400")}>
                {profile.credits} Credits
              </p>
            </div>
          </div>

          {error && <p className="text-red-400 text-sm font-medium text-center">{error}</p>}

          <button 
            type="submit"
            disabled={loading || profile.credits < (selectedService?.cost || 0)}
            className="w-full accent-gradient text-white font-bold py-5 rounded-2xl shadow-lg shadow-purple-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : 'Place Order'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

const AdminPanel = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: uData, error: uError } = await supabase.from('profiles').select('*');
      const { data: oData, error: oError } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      
      if (uError) throw uError;
      if (oError) throw oError;

      setUsers(uData || []);
      setOrders(oData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateCredits = async (userId: string, newCredits: number) => {
    try {
      const newRank = calculateRank(newCredits);
      const { error } = await supabase
        .from('profiles')
        .update({ credits: newCredits, rank: newRank })
        .eq('id', userId);
      
      if (error) throw error;
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);
      
      if (error) throw error;
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-6 max-w-7xl mx-auto space-y-12">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-purple-600 flex items-center justify-center">
          <ShieldCheck className="text-white w-6 h-6" />
        </div>
        <h1 className="text-4xl font-bold text-white tracking-tight">Admin Control Center</h1>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <User className="w-5 h-5 text-purple-400" /> User Management
          </h2>
          <div className="glass-card rounded-3xl overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/5 border-b border-white/10">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-white/40">User</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-white/40">Rank</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-white/40">Credits</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-white/40">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-white font-bold">{u.name}</span>
                        <span className="text-xs text-white/40">{u.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-purple-400">{u.rank}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-white font-bold">{u.credits}</span>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => updateCredits(u.id, u.credits + 500)}
                        className="text-[10px] font-bold uppercase tracking-widest bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full hover:bg-purple-500 hover:text-white transition-all"
                      >
                        Add 500
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-purple-400" /> Global Orders
          </h2>
          <div className="glass-card rounded-3xl overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/5 border-b border-white/10">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-white/40">Order</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-white/40">User</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-white/40">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-white font-bold">{o.service_type}</span>
                        <span className="text-xs text-white/40">{o.cost} Credits</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-white text-sm">{o.user_name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <select 
                        value={o.status}
                        onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                        className="bg-white/5 border border-white/10 text-[10px] text-white rounded-lg px-2 py-1 outline-none"
                      >
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          await fetchProfile(session.user.id);
        } else {
          setLoading(false);
        }
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          // Profile not found, trigger might still be running
          setTimeout(() => fetchProfile(userId), 1000);
          return;
        }
        throw error;
      }
      setProfile(data);
    } catch (err: any) {
      console.error('Error fetching profile:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen purple-gradient flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="min-h-screen purple-gradient flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Configuration Required</h2>
        <p className="text-white/50 max-w-md mb-8">
          Please ensure your Supabase environment variables are correctly set in the Secrets panel and the database schema is applied.
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="px-8 py-3 bg-white text-black rounded-xl font-bold"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen purple-gradient text-white selection:bg-purple-500/30">
        <Navbar profile={profile} onLogout={handleLogout} />
        
        <Routes>
          <Route path="/" element={
            profile ? <Navigate to="/dashboard" /> : (
              <div className="pt-32 px-6 max-w-7xl mx-auto text-center space-y-12">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-white/10 text-purple-400 text-xs font-bold uppercase tracking-widest">
                    <Zap className="w-3 h-3" /> The Future of Design is Here
                  </div>
                  <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white leading-[0.9]">
                    ELEVATE YOUR <br />
                    <span className="text-transparent bg-clip-text accent-gradient">DIGITAL IDENTITY</span>
                  </h1>
                  <p className="text-white/50 text-xl max-w-2xl mx-auto font-medium">
                    Graphico Global provides elite design services for high-growth companies. 
                    Join our exclusive membership platform today.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
                    <Link to="/signup" className="px-10 py-5 bg-white text-black rounded-2xl font-bold text-lg hover:scale-105 transition-all shadow-xl shadow-white/10">
                      Get Started
                    </Link>
                    <Link to="/login" className="px-10 py-5 glass text-white rounded-2xl font-bold text-lg hover:bg-white/10 transition-all">
                      Member Login
                    </Link>
                  </div>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-24 text-left">
                  {[
                    { title: 'Premium Tiers', desc: 'Unlock exclusive benefits as you scale your brand.', icon: Award },
                    { title: 'Credit System', desc: 'Seamlessly order services with our dynamic credit logic.', icon: CreditCard },
                    { title: 'Real-time Updates', desc: 'Track your project status and credits in real-time.', icon: Zap }
                  ].map((feature, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + i * 0.1 }}
                      className="glass-card p-8 rounded-3xl space-y-4"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center">
                        <feature.icon className="text-purple-400 w-6 h-6" />
                      </div>
                      <h3 className="text-xl font-bold text-white">{feature.title}</h3>
                      <p className="text-white/40 leading-relaxed">{feature.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            )
          } />
          
          <Route path="/login" element={!profile ? <AuthPage type="login" /> : <Navigate to="/dashboard" />} />
          <Route path="/signup" element={!profile ? <AuthPage type="signup" /> : <Navigate to="/dashboard" />} />
          
          <Route path="/dashboard" element={profile ? <Dashboard profile={profile} /> : <Navigate to="/login" />} />
          <Route path="/order-new" element={profile ? <NewOrderPage profile={profile} onUpdateProfile={setProfile} /> : <Navigate to="/login" />} />
          <Route path="/admin" element={profile?.role === 'admin' ? <AdminPanel /> : <Navigate to="/dashboard" />} />
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}
