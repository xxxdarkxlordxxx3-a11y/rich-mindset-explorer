import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { Eye } from 'lucide-react';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Blog } from './pages/Blog';
import { BlogPost } from './pages/BlogPost';
import { Portfolio } from './pages/Portfolio';
import { CreatePost } from './pages/CreatePost';
import { Login } from './pages/Login';
import { Profile } from './pages/Profile';

const App: React.FC = () => {
  // --- Easter Egg Logic (Global) ---
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  const [typedText, setTypedText] = useState('');
  // تم إزالة الإيموجي من النص
  const secretMessage = "لو عايز تعرف اسمي.. بص على الكيبورد وشوف كل حرف إنجليزي في PL.M يقابله إيه بالعربي";

  useEffect(() => {
    if (showEasterEgg) {
      let currentIndex = 0;
      setTypedText('');
      
      // 1. Typewriter Effect
      // تم تسريع الكتابة بجعل التوقيت 25 مللي ثانية
      const typingInterval = setInterval(() => {
        if (currentIndex < secretMessage.length) {
          setTypedText(prev => prev + secretMessage.charAt(currentIndex));
          currentIndex++;
        } else {
          clearInterval(typingInterval);
        }
      }, 25); 

      // 2. Auto Close after 5 seconds
      const closeTimer = setTimeout(() => {
        setShowEasterEgg(false);
        setTypedText('');
      }, 5000);

      return () => {
        clearInterval(typingInterval);
        clearTimeout(closeTimer);
      };
    }
  }, [showEasterEgg]);

  return (
    <AuthProvider>
      <HashRouter>
        <div className="flex flex-col min-h-screen">
          
          {/* --- Easter Egg Overlay --- */}
          {showEasterEgg && (
            <div className="fixed inset-0 z-[100] bg-slate-900 flex items-center justify-center p-6 animate-fade-in-up">
              <div className="max-w-3xl text-center">
                 {/* استخدام Flexbox لمحاذاة النص والأيقونة بشكل سليم */}
                 <h2 className="text-2xl md:text-4xl font-mono font-bold leading-relaxed flex flex-wrap justify-center items-center gap-2" style={{ direction: 'rtl' }}>
                   <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-green via-brand-purple to-brand-red">
                     {typedText}
                   </span>
                   {/* أيقونة العين Native تظهر فقط عند اكتمال النص */}
                   {typedText.length === secretMessage.length && (
                     <Eye className="w-8 h-8 md:w-10 md:h-10 text-white animate-fade-in-up" />
                   )}
                   <span className="text-white animate-pulse">|</span>
                 </h2>
              </div>
            </div>
          )}

          <Navbar onTriggerEasterEgg={() => setShowEasterEgg(true)} />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/portfolio" element={<Portfolio />} />
              <Route path="/blog" element={<Blog />} />
              {/* مسار عرض المقال الواحد */}
              <Route path="/blog/:id" element={<BlogPost />} />
              <Route path="/create-post" element={<CreatePost />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Login />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </main>
          
          <Footer />
        </div>
      </HashRouter>
    </AuthProvider>
  );
};

export default App;