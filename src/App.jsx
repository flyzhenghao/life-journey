import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { translations, getTranslation } from './locales/translations';
import { PRESET_QUESTIONS, getCategoryIcon } from './utils/questions';

// Google API 配置
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || '';

// 主应用组件
export default function App() {
  // 状态管理
  const [currentStep, setCurrentStep] = useState('password'); // password, intro, form, timeline
  const [lang, setLang] = useState('zh');
  const [userName, setUserName] = useState('');
  const [formData, setFormData] = useState({});
  const [customEvents, setCustomEvents] = useState([]);
  const [uploadedImages, setUploadedImages] = useState({});
  const [activeCategory, setActiveCategory] = useState(0);
  const [hoveredEvent, setHoveredEvent] = useState(null);
  const [showAddCustom, setShowAddCustom] = useState(false);
  
  // 密码相关
  const [password, setPassword] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [savedPassword, setSavedPassword] = useState(null);
  const [passwordError, setPasswordError] = useState('');
  const [isSettingPassword, setIsSettingPassword] = useState(true);
  
  // Google 登录相关
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  
  const t = useCallback((key) => getTranslation(lang, key), [lang]);
  const timelineRef = useRef(null);

  // 初始化 - 检查本地存储
  useEffect(() => {
    const storedData = localStorage.getItem('lifeJourneyData');
    const storedPassword = localStorage.getItem('lifeJourneyPassword');
    
    if (storedPassword) {
      setSavedPassword(storedPassword);
      setIsSettingPassword(false);
    } else {
      setIsSettingPassword(true);
    }
    
    if (storedData) {
      try {
        const data = JSON.parse(storedData);
        setUserName(data.userName || '');
        setFormData(data.formData || {});
        setCustomEvents(data.customEvents || []);
        setUploadedImages(data.uploadedImages || {});
      } catch (e) {
        console.error('Failed to parse stored data:', e);
      }
    }
  }, []);

  // 自动保存到本地存储
  useEffect(() => {
    if (userName || Object.keys(formData).length > 0) {
      const data = {
        userName,
        formData,
        customEvents,
        uploadedImages,
        lastSaved: new Date().toISOString()
      };
      localStorage.setItem('lifeJourneyData', JSON.stringify(data));
    }
  }, [userName, formData, customEvents, uploadedImages]);

  // 处理密码验证
  const handlePasswordSubmit = () => {
    if (isSettingPassword) {
      // 设置新密码
      if (password && password !== confirmPwd) {
        setPasswordError(t('passwordMismatch'));
        return;
      }
      if (password) {
        localStorage.setItem('lifeJourneyPassword', password);
        setSavedPassword(password);
      }
      setCurrentStep('intro');
    } else {
      // 验证密码
      if (password === savedPassword) {
        setCurrentStep('intro');
      } else {
        setPasswordError(t('wrongPassword'));
      }
    }
  };

  const skipPassword = () => {
    setCurrentStep('intro');
  };

  // 处理表单输入
  const handleInputChange = (key, field, value) => {
    setFormData(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value
      }
    }));
  };

  // 处理图片上传
  const handleImageUpload = (key, file) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImages(prev => ({
          ...prev,
          [key]: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // 删除图片
  const removeImage = (key) => {
    setUploadedImages(prev => {
      const newImages = {...prev};
      delete newImages[key];
      return newImages;
    });
  };

  // 添加自定义事件
  const addCustomEvent = () => {
    setCustomEvents(prev => [...prev, {
      id: Date.now(),
      title: '',
      date: '',
      endDate: '',
      description: '',
      image: null
    }]);
    setShowAddCustom(false);
  };

  // 更新自定义事件
  const updateCustomEvent = (id, field, value) => {
    setCustomEvents(prev => prev.map(event => 
      event.id === id ? { ...event, [field]: value } : event
    ));
  };

  // 删除自定义事件
  const deleteCustomEvent = (id) => {
    setCustomEvents(prev => prev.filter(event => event.id !== id));
  };

  // 生成时间线数据
  const generateTimelineData = () => {
    const events = [];
    
    PRESET_QUESTIONS.forEach(category => {
      category.questions.forEach(q => {
        const data = formData[q.key];
        if (data && (data.date || data.startDate || data.description)) {
          events.push({
            id: q.key,
            title: t(`questions.${q.key}`),
            icon: category.icon,
            date: data.date || data.startDate,
            endDate: data.endDate,
            description: data.description || data.name,
            image: uploadedImages[q.key],
            category: t(`categories.${category.id}`)
          });
        }
      });
    });

    customEvents.forEach(event => {
      if (event.title && event.date) {
        events.push({
          id: event.id,
          title: event.title,
          icon: '⭐',
          date: event.date,
          endDate: event.endDate,
          description: event.description,
          image: event.image,
          category: t('customEvent')
        });
      }
    });

    return events.sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  // 导出 PDF
  const exportToPdf = async () => {
    if (!timelineRef.current) return;
    
    try {
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default;
      
      const canvas = await html2canvas(timelineRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#0a0a1a'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`${userName}_life_journey.pdf`);
    } catch (error) {
      console.error('PDF export failed:', error);
      alert('PDF导出失败，请重试');
    }
  };

  // 渲染密码页面
  const renderPasswordPage = () => (
    <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-main">
      <Stars />
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 max-w-md w-full"
      >
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-amber-400/20">
          <div className="text-center mb-8">
            <span className="text-5xl mb-4 block">🔐</span>
            <h2 className="text-2xl text-amber-200 font-serif">
              {isSettingPassword ? t('setPassword') : t('enterPassword')}
            </h2>
          </div>
          
          <div className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordError('');
              }}
              placeholder={t('passwordPlaceholder')}
              className="input-field"
              onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()}
            />
            
            {isSettingPassword && (
              <input
                type="password"
                value={confirmPwd}
                onChange={(e) => {
                  setConfirmPwd(e.target.value);
                  setPasswordError('');
                }}
                placeholder={t('confirmPassword')}
                className="input-field"
                onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()}
              />
            )}
            
            {passwordError && (
              <p className="text-red-400 text-sm text-center">{passwordError}</p>
            )}
            
            <button onClick={handlePasswordSubmit} className="btn-primary w-full">
              {isSettingPassword ? t('save') : t('unlock')}
            </button>
            
            {isSettingPassword && (
              <button onClick={skipPassword} className="btn-secondary w-full">
                {t('skipPassword')}
              </button>
            )}
          </div>
        </div>
        
        {/* 语言切换 */}
        <div className="text-center mt-6">
          <button 
            onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
            className="text-amber-200/60 hover:text-amber-200 transition-colors"
          >
            {t('switchLang')}
          </button>
        </div>
      </motion.div>
    </div>
  );

  // 渲染开始页面
  const renderIntro = () => (
    <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-main">
      <Stars />
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 max-w-2xl w-full text-center"
      >
        {/* 语言切换 */}
        <div className="absolute top-0 right-0">
          <button 
            onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
            className="px-4 py-2 text-amber-200/60 hover:text-amber-200 transition-colors"
          >
            {t('switchLang')}
          </button>
        </div>

        {/* 主标题 */}
        <div className="mb-8">
          <h1 className="text-5xl md:text-6xl font-light tracking-wider mb-4 font-serif title-gradient">
            {t('appTitle')}
          </h1>
          <p className="text-lg tracking-widest text-amber-200/60 font-light font-crimson">
            {t('appSubtitle')}
          </p>
        </div>

        {/* 装饰线 */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <div className="h-px w-24 bg-gradient-to-r from-transparent to-amber-400/50" />
          <div className="w-2 h-2 rounded-full bg-amber-400/70" />
          <div className="h-px w-24 bg-gradient-to-l from-transparent to-amber-400/50" />
        </div>

        {/* 描述文字 */}
        <p className="text-amber-100/70 text-lg mb-12 leading-relaxed max-w-lg mx-auto">
          {t('appDescription')}
        </p>

        {/* 输入姓名 */}
        <div className="mb-8">
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder={t('enterName')}
            className="w-full max-w-xs px-6 py-4 bg-white/5 border border-amber-400/30 rounded-full text-center text-amber-100 placeholder-amber-200/40 focus:outline-none focus:border-amber-400/60 focus:bg-white/10 transition-all"
          />
        </div>

        {/* 开始按钮 */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setCurrentStep('form')}
          disabled={!userName.trim()}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t('startJourney')}
        </motion.button>
      </motion.div>
    </div>
  );

  // 渲染表单页面
  const renderForm = () => (
    <div className="min-h-screen bg-gradient-main">
      {/* 头部 */}
      <div className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-lg border-b border-amber-400/10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-xl text-amber-200/90 font-serif">
              {userName}{t('journeyOf')}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
              className="px-3 py-1.5 text-amber-200/60 hover:text-amber-200 transition-colors text-sm"
            >
              {t('switchLang')}
            </button>
            <button
              onClick={() => setCurrentStep('intro')}
              className="px-4 py-2 text-amber-200/60 hover:text-amber-200 transition-colors text-sm"
            >
              {t('back')}
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setCurrentStep('timeline')}
              className="btn-primary text-sm"
            >
              {t('generate')} ✨
            </motion.button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 flex gap-8">
        {/* 左侧分类导航 */}
        <div className="w-64 shrink-0 hidden md:block">
          <div className="sticky top-24 space-y-2">
            {PRESET_QUESTIONS.map((cat, idx) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(idx)}
                className={`w-full px-4 py-3 rounded-xl text-left transition-all ${
                  activeCategory === idx
                    ? 'bg-amber-500/20 text-amber-200 border border-amber-400/30'
                    : 'text-amber-200/50 hover:bg-white/5 hover:text-amber-200/70'
                }`}
              >
                <span className="mr-2">{cat.icon}</span>
                <span>{t(`categories.${cat.id}`)}</span>
              </button>
            ))}
            <button
              onClick={() => setShowAddCustom(true)}
              className="w-full px-4 py-3 rounded-xl text-left text-amber-200/50 hover:bg-white/5 hover:text-amber-200/70 transition-all border border-dashed border-amber-400/20"
            >
              <span className="mr-2">➕</span>
              <span>{t('addCustomEvent')}</span>
            </button>
          </div>
        </div>

        {/* 移动端分类选择 */}
        <div className="md:hidden mb-6">
          <select
            value={activeCategory}
            onChange={(e) => setActiveCategory(Number(e.target.value))}
            className="w-full px-4 py-3 bg-white/5 border border-amber-400/20 rounded-xl text-amber-100"
          >
            {PRESET_QUESTIONS.map((cat, idx) => (
              <option key={cat.id} value={idx}>
                {cat.icon} {t(`categories.${cat.id}`)}
              </option>
            ))}
          </select>
        </div>

        {/* 右侧表单内容 */}
        <div className="flex-1 space-y-8">
          {/* 当前分类标题 */}
          <div className="flex items-center gap-4 pb-4 border-b border-amber-400/10">
            <span className="text-4xl">{PRESET_QUESTIONS[activeCategory].icon}</span>
            <div>
              <h3 className="text-2xl text-amber-200 font-serif">
                {t(`categories.${PRESET_QUESTIONS[activeCategory].id}`)}
              </h3>
            </div>
          </div>

          {/* 问题卡片 */}
          {PRESET_QUESTIONS[activeCategory].questions.map((q) => (
            <motion.div
              key={q.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 rounded-2xl p-6 border border-amber-400/10 hover:border-amber-400/20 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="text-lg text-amber-200 mb-1">
                    {t(`questions.${q.key}`)}
                  </h4>
                </div>
                <label className="cursor-pointer px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 rounded-lg text-amber-300/70 text-sm transition-all flex items-center gap-2">
                  <span>📷</span>
                  <span>{t('upload')}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageUpload(q.key, e.target.files[0])}
                  />
                </label>
              </div>

              {/* 显示已上传的图片 */}
              {uploadedImages[q.key] && (
                <div className="mb-4 relative inline-block">
                  <img
                    src={uploadedImages[q.key]}
                    alt="uploaded"
                    className="h-24 w-24 object-cover rounded-lg border border-amber-400/20"
                  />
                  <button
                    onClick={() => removeImage(q.key)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full text-white text-xs flex items-center justify-center hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              )}

              {/* 根据类型渲染不同输入 */}
              {q.type === 'date' && (
                <input
                  type="date"
                  value={formData[q.key]?.date || ''}
                  onChange={(e) => handleInputChange(q.key, 'date', e.target.value)}
                  className="input-field"
                />
              )}

              {q.type === 'text' && (
                <input
                  type="text"
                  value={formData[q.key]?.description || ''}
                  onChange={(e) => handleInputChange(q.key, 'description', e.target.value)}
                  placeholder={t(`placeholders.${q.placeholder}`)}
                  className="input-field"
                />
              )}

              {q.type === 'textarea' && (
                <textarea
                  value={formData[q.key]?.description || ''}
                  onChange={(e) => handleInputChange(q.key, 'description', e.target.value)}
                  placeholder={t(`placeholders.${q.placeholder}`)}
                  rows={3}
                  className="input-field resize-none"
                />
              )}

              {q.type === 'period' && (
                <div className="space-y-3">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="text-amber-200/40 text-xs mb-1 block">{t('startDate')}</label>
                      <input
                        type="date"
                        value={formData[q.key]?.startDate || ''}
                        onChange={(e) => handleInputChange(q.key, 'startDate', e.target.value)}
                        className="input-field"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-amber-200/40 text-xs mb-1 block">{t('endDate')}</label>
                      <input
                        type="date"
                        value={formData[q.key]?.endDate || ''}
                        onChange={(e) => handleInputChange(q.key, 'endDate', e.target.value)}
                        className="input-field"
                      />
                    </div>
                  </div>
                  <input
                    type="text"
                    value={formData[q.key]?.name || ''}
                    onChange={(e) => handleInputChange(q.key, 'name', e.target.value)}
                    placeholder={t(`placeholders.${q.placeholder}`)}
                    className="input-field"
                  />
                </div>
              )}

              {q.type === 'event' && (
                <div className="space-y-3">
                  <input
                    type="date"
                    value={formData[q.key]?.date || ''}
                    onChange={(e) => handleInputChange(q.key, 'date', e.target.value)}
                    className="input-field"
                  />
                  <textarea
                    value={formData[q.key]?.description || ''}
                    onChange={(e) => handleInputChange(q.key, 'description', e.target.value)}
                    placeholder={t(`placeholders.${q.placeholder}`)}
                    rows={2}
                    className="input-field resize-none"
                  />
                </div>
              )}
            </motion.div>
          ))}

          {/* 自定义事件列表 */}
          {customEvents.length > 0 && (
            <div className="mt-12 pt-8 border-t border-amber-400/10">
              <h3 className="text-xl text-amber-200 mb-6 font-serif">
                ✨ {t('customEvent')}
              </h3>
              {customEvents.map((event, idx) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-r from-amber-500/5 to-transparent rounded-2xl p-6 border border-amber-400/20 mb-4"
                >
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-amber-300/60 text-sm">{t('customEvent')} #{idx + 1}</span>
                    <button
                      onClick={() => deleteCustomEvent(event.id)}
                      className="text-red-400/60 hover:text-red-400 text-sm"
                    >
                      {t('delete')}
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <input
                      type="text"
                      value={event.title}
                      onChange={(e) => updateCustomEvent(event.id, 'title', e.target.value)}
                      placeholder={t('eventTitle')}
                      className="input-field"
                    />
                    <input
                      type="date"
                      value={event.date}
                      onChange={(e) => updateCustomEvent(event.id, 'date', e.target.value)}
                      className="input-field"
                    />
                  </div>
                  <textarea
                    value={event.description}
                    onChange={(e) => updateCustomEvent(event.id, 'description', e.target.value)}
                    placeholder={t('description')}
                    rows={2}
                    className="input-field resize-none"
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 添加自定义事件弹窗 */}
      <AnimatePresence>
        {showAddCustom && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => setShowAddCustom(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 rounded-2xl p-8 max-w-md w-full mx-4 border border-amber-400/20"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl text-amber-200 mb-4 font-serif">
                {t('addCustomEvent')}
              </h3>
              <p className="text-amber-200/60 mb-6 text-sm">
                {t('customEventDesc')}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowAddCustom(false)}
                  className="btn-secondary flex-1"
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={addCustomEvent}
                  className="btn-primary flex-1"
                >
                  {t('addCustomEvent')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  // 渲染时间线页面
  const renderTimeline = () => {
    const timelineData = generateTimelineData();

    return (
      <div className="min-h-screen bg-gradient-timeline">
        {/* 头部 */}
        <div className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur-lg">
          <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
            <h1 className="text-xl md:text-2xl text-amber-200/90 font-serif">
              {userName}{t('journeyOf')}
            </h1>
            <div className="flex items-center gap-2 md:gap-3">
              <button
                onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
                className="px-3 py-1.5 text-amber-200/60 hover:text-amber-200 transition-colors text-sm"
              >
                {t('switchLang')}
              </button>
              <button
                onClick={exportToPdf}
                className="px-3 md:px-4 py-2 text-amber-200/60 hover:text-amber-200 transition-colors text-sm border border-amber-400/20 rounded-full hover:border-amber-400/40"
              >
                📄 {t('exportPdf')}
              </button>
              <button
                onClick={() => setCurrentStep('form')}
                className="px-3 md:px-4 py-2 text-amber-200/60 hover:text-amber-200 transition-colors text-sm border border-amber-400/20 rounded-full hover:border-amber-400/40"
              >
                ← {t('edit')}
              </button>
            </div>
          </div>
        </div>

        {/* 时间线内容 */}
        <div ref={timelineRef} className="max-w-4xl mx-auto px-6 pb-24 relative">
          {/* 中心线 */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-amber-400/50 via-amber-400/30 to-transparent hidden md:block" />
          {/* 移动端左侧线 */}
          <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-amber-400/50 via-amber-400/30 to-transparent md:hidden" />

          {/* 事件列表 */}
          {timelineData.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-amber-200/40 text-lg">{t('noEvents')}</p>
              <button
                onClick={() => setCurrentStep('form')}
                className="mt-4 px-6 py-2 bg-amber-500/20 text-amber-300 rounded-full hover:bg-amber-500/30 transition-all"
              >
                {t('addEvent')}
              </button>
            </div>
          ) : (
            <div className="space-y-8 md:space-y-16 pt-12">
              {timelineData.map((event, idx) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className={`relative flex items-center gap-4 md:gap-8 ${
                    idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                  } flex-row`}
                  onMouseEnter={() => setHoveredEvent(event.id)}
                  onMouseLeave={() => setHoveredEvent(null)}
                >
                  {/* 事件卡片 */}
                  <div
                    className={`flex-1 ${
                      idx % 2 === 0 ? 'md:text-right md:pr-8' : 'md:text-left md:pl-8'
                    } text-left pl-12 md:pl-0`}
                  >
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className={`inline-block p-4 md:p-6 rounded-2xl bg-white/5 border border-amber-400/20 backdrop-blur-sm transition-all duration-300 max-w-full ${
                        hoveredEvent === event.id ? 'bg-white/10 border-amber-400/40 shadow-lg shadow-amber-500/10' : ''
                      }`}
                    >
                      {/* 日期 */}
                      <div className="text-amber-400/70 text-sm mb-2 font-mono">
                        {event.date}
                        {event.endDate && ` → ${event.endDate}`}
                      </div>
                      {/* 标题 */}
                      <h3 className="text-lg md:text-xl text-amber-100 mb-2 font-serif">
                        <span className="mr-2">{event.icon}</span>
                        {event.title}
                      </h3>
                      {/* 描述 */}
                      {event.description && (
                        <p className="text-amber-200/60 text-sm leading-relaxed">
                          {event.description}
                        </p>
                      )}
                      {/* 图片 */}
                      <AnimatePresence>
                        {event.image && hoveredEvent === event.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-4 overflow-hidden rounded-xl"
                          >
                            <img
                              src={event.image}
                              alt={event.title}
                              className="w-full h-32 object-cover"
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </div>

                  {/* 中心点 - 桌面端 */}
                  <div className="absolute left-1/2 -translate-x-1/2 z-10 hidden md:block">
                    <motion.div
                      animate={{
                        scale: hoveredEvent === event.id ? 1.5 : 1,
                        boxShadow: hoveredEvent === event.id 
                          ? '0 0 20px rgba(245, 166, 35, 0.5)' 
                          : '0 0 0px rgba(245, 166, 35, 0)'
                      }}
                      className="w-4 h-4 rounded-full bg-amber-400 transition-all duration-300"
                    />
                  </div>

                  {/* 左侧点 - 移动端 */}
                  <div className="absolute left-6 z-10 md:hidden">
                    <motion.div
                      animate={{
                        scale: hoveredEvent === event.id ? 1.3 : 1,
                      }}
                      className="w-4 h-4 rounded-full bg-amber-400"
                    />
                  </div>

                  {/* 占位 - 仅桌面端 */}
                  <div className="flex-1 hidden md:block" />
                </motion.div>
              ))}
            </div>
          )}

          {/* 终点 */}
          {timelineData.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center mt-24"
            >
              <div className="inline-block px-8 py-4 bg-gradient-to-r from-amber-500/20 to-amber-400/10 rounded-full border border-amber-400/30">
                <p className="text-amber-200/80 font-serif">
                  ✨ {t('journeyContinues')}
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    );
  };

  // 根据当前步骤渲染不同页面
  return (
    <div className="font-sans">
      <AnimatePresence mode="wait">
        {currentStep === 'password' && <motion.div key="password" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>{renderPasswordPage()}</motion.div>}
        {currentStep === 'intro' && <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>{renderIntro()}</motion.div>}
        {currentStep === 'form' && <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>{renderForm()}</motion.div>}
        {currentStep === 'timeline' && <motion.div key="timeline" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>{renderTimeline()}</motion.div>}
      </AnimatePresence>
    </div>
  );
}

// 星星背景组件
function Stars() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(60)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white animate-twinkle"
          style={{
            width: Math.random() * 3 + 1 + 'px',
            height: Math.random() * 3 + 1 + 'px',
            left: Math.random() * 100 + '%',
            top: Math.random() * 100 + '%',
            opacity: Math.random() * 0.8 + 0.2,
            animationDelay: Math.random() * 3 + 's',
            animationDuration: Math.random() * 3 + 2 + 's'
          }}
        />
      ))}
    </div>
  );
}
