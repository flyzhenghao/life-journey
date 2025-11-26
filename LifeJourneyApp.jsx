import React, { useState, useRef } from 'react';

// 预设的人生事件问题模板
const PRESET_QUESTIONS = [
  {
    id: 'birth',
    category: '👶 出生信息',
    categoryEn: 'Birth Info',
    icon: '🎒',
    questions: [
      { key: 'birthDate', label: '出生日期', labelEn: 'Birth Date', type: 'date', placeholder: '选择日期' },
      { key: 'birthPlace', label: '出生地点', labelEn: 'Birth Place', type: 'text', placeholder: '如：北京市海淀区' },
      { key: 'birthDescription', label: '特别故事', labelEn: 'Special Story', type: 'textarea', placeholder: '关于你出生的特别故事...' },
    ]
  },
  {
    id: 'education',
    category: '🎓 教育经历',
    categoryEn: 'Education',
    icon: '📚',
    questions: [
      { key: 'primarySchool', label: '小学', labelEn: 'Primary School', type: 'period', placeholder: '学校名称' },
      { key: 'middleSchool', label: '初中', labelEn: 'Middle School', type: 'period', placeholder: '学校名称' },
      { key: 'highSchool', label: '高中', labelEn: 'High School', type: 'period', placeholder: '学校名称' },
      { key: 'university', label: '大学', labelEn: 'University', type: 'period', placeholder: '学校名称 / 专业' },
      { key: 'graduateSchool', label: '研究生', labelEn: 'Graduate School', type: 'period', placeholder: '学校名称 / 专业（如有）' },
    ]
  },
  {
    id: 'career',
    category: '💼 职业生涯',
    categoryEn: 'Career',
    icon: '🏢',
    questions: [
      { key: 'firstJob', label: '第一份工作', labelEn: 'First Job', type: 'period', placeholder: '公司 / 职位' },
      { key: 'careerMilestone', label: '职业里程碑', labelEn: 'Career Milestone', type: 'event', placeholder: '如：晋升、创业、转行...' },
    ]
  },
  {
    id: 'love',
    category: '💕 感情生活',
    categoryEn: 'Love Life',
    icon: '💍',
    questions: [
      { key: 'firstLove', label: '初恋', labelEn: 'First Love', type: 'event', placeholder: '那段特别的故事...' },
      { key: 'engagement', label: '订婚', labelEn: 'Engagement', type: 'event', placeholder: '订婚的故事' },
      { key: 'marriage', label: '结婚', labelEn: 'Marriage', type: 'event', placeholder: '婚礼日期和故事' },
    ]
  },
  {
    id: 'family',
    category: '👨‍👩‍👧‍👦 家庭',
    categoryEn: 'Family',
    icon: '🏠',
    questions: [
      { key: 'firstChild', label: '第一个孩子', labelEn: 'First Child', type: 'event', placeholder: '宝宝出生的喜悦' },
      { key: 'moreChildren', label: '更多孩子', labelEn: 'More Children', type: 'event', placeholder: '其他孩子的出生' },
    ]
  },
  {
    id: 'achievements',
    category: '🏆 成就与荣誉',
    categoryEn: 'Achievements',
    icon: '⭐',
    questions: [
      { key: 'awards', label: '获奖/荣誉', labelEn: 'Awards/Honors', type: 'event', placeholder: '获得的重要荣誉' },
      { key: 'specialAchievement', label: '特别成就', labelEn: 'Special Achievement', type: 'event', placeholder: '人生中的特别成就' },
    ]
  },
  {
    id: 'relocation',
    category: '🌍 人生转折',
    categoryEn: 'Life Changes',
    icon: '✈️',
    questions: [
      { key: 'majorMove', label: '重大搬迁', labelEn: 'Major Move', type: 'event', placeholder: '如：移民、搬到新城市' },
      { key: 'lifeChange', label: '人生转折点', labelEn: 'Life Turning Point', type: 'event', placeholder: '改变人生轨迹的事件' },
    ]
  },
];

// 主应用组件
export default function LifeJourneyApp() {
  const [currentStep, setCurrentStep] = useState('intro'); // intro, form, timeline
  const [userName, setUserName] = useState('');
  const [formData, setFormData] = useState({});
  const [customEvents, setCustomEvents] = useState([]);
  const [uploadedImages, setUploadedImages] = useState({});
  const [activeCategory, setActiveCategory] = useState(0);
  const [hoveredEvent, setHoveredEvent] = useState(null);
  const [showAddCustom, setShowAddCustom] = useState(false);
  const fileInputRef = useRef(null);

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
    
    // 处理预设问题的数据
    PRESET_QUESTIONS.forEach(category => {
      category.questions.forEach(q => {
        const data = formData[q.key];
        if (data && (data.date || data.startDate || data.description)) {
          events.push({
            id: q.key,
            title: q.label,
            titleEn: q.labelEn,
            icon: category.icon,
            date: data.date || data.startDate,
            endDate: data.endDate,
            description: data.description || data.name,
            image: uploadedImages[q.key],
            category: category.category
          });
        }
      });
    });

    // 添加自定义事件
    customEvents.forEach(event => {
      if (event.title && event.date) {
        events.push({
          id: event.id,
          title: event.title,
          titleEn: event.title,
          icon: '⭐',
          date: event.date,
          endDate: event.endDate,
          description: event.description,
          image: event.image,
          category: '自定义事件'
        });
      }
    });

    // 按日期排序
    return events.sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  // 渲染开始页面
  const renderIntro = () => (
    <div className="min-h-screen flex items-center justify-center p-8" style={{
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
    }}>
      <div className="max-w-2xl w-full text-center">
        {/* 装饰星星 */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                width: Math.random() * 3 + 1 + 'px',
                height: Math.random() * 3 + 1 + 'px',
                left: Math.random() * 100 + '%',
                top: Math.random() * 100 + '%',
                opacity: Math.random() * 0.8 + 0.2,
                animation: `twinkle ${Math.random() * 3 + 2}s ease-in-out infinite`,
                animationDelay: Math.random() * 2 + 's'
              }}
            />
          ))}
        </div>

        <div className="relative z-10">
          {/* 主标题 */}
          <div className="mb-8">
            <h1 className="text-6xl font-light tracking-wider mb-4" style={{
              fontFamily: '"Noto Serif SC", Georgia, serif',
              background: 'linear-gradient(135deg, #e8d5b7 0%, #f5e6d3 50%, #d4a574 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 60px rgba(232, 213, 183, 0.3)'
            }}>
              你一生的旅程
            </h1>
            <p className="text-lg tracking-widest text-amber-200/60 font-light" style={{
              fontFamily: '"Crimson Text", Georgia, serif'
            }}>
              YOUR LIFE'S JOURNEY
            </p>
          </div>

          {/* 装饰线 */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <div className="h-px w-24 bg-gradient-to-r from-transparent to-amber-400/50" />
            <div className="w-2 h-2 rounded-full bg-amber-400/70" />
            <div className="h-px w-24 bg-gradient-to-l from-transparent to-amber-400/50" />
          </div>

          {/* 描述文字 */}
          <p className="text-amber-100/70 text-lg mb-12 leading-relaxed max-w-lg mx-auto" style={{
            fontFamily: '"Noto Sans SC", sans-serif'
          }}>
            记录你人生中的重要时刻，
            <br />
            将回忆编织成一条璀璨的时间长河
          </p>

          {/* 输入姓名 */}
          <div className="mb-8">
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="请输入你的名字"
              className="w-full max-w-xs px-6 py-4 bg-white/5 border border-amber-400/30 rounded-full text-center text-amber-100 placeholder-amber-200/40 focus:outline-none focus:border-amber-400/60 focus:bg-white/10 transition-all"
              style={{ fontFamily: '"Noto Sans SC", sans-serif' }}
            />
          </div>

          {/* 开始按钮 */}
          <button
            onClick={() => setCurrentStep('form')}
            disabled={!userName.trim()}
            className="group relative px-12 py-4 bg-gradient-to-r from-amber-600/80 to-amber-500/80 rounded-full text-white font-medium tracking-wider overflow-hidden transition-all duration-500 hover:shadow-lg hover:shadow-amber-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ fontFamily: '"Noto Sans SC", sans-serif' }}
          >
            <span className="relative z-10">开始记录我的旅程</span>
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@300;400;500&family=Noto+Sans+SC:wght@300;400;500&family=Crimson+Text:ital@0;1&display=swap');
      `}</style>
    </div>
  );

  // 渲染表单页面
  const renderForm = () => (
    <div className="min-h-screen" style={{
      background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)'
    }}>
      {/* 头部 */}
      <div className="sticky top-0 z-50 bg-gradient-to-b from-slate-900/95 to-slate-900/80 backdrop-blur-lg border-b border-amber-400/10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-xl text-amber-200/90" style={{ fontFamily: '"Noto Serif SC", serif' }}>
              {userName}的人生旅程
            </h2>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setCurrentStep('intro')}
              className="px-4 py-2 text-amber-200/60 hover:text-amber-200 transition-colors text-sm"
            >
              返回
            </button>
            <button
              onClick={() => setCurrentStep('timeline')}
              className="px-6 py-2 bg-gradient-to-r from-amber-600 to-amber-500 rounded-full text-white text-sm font-medium hover:shadow-lg hover:shadow-amber-500/25 transition-all"
            >
              生成时间线 ✨
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 flex gap-8">
        {/* 左侧分类导航 */}
        <div className="w-64 shrink-0">
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
                <span style={{ fontFamily: '"Noto Sans SC", sans-serif' }}>{cat.category.replace(/^[^\s]+\s/, '')}</span>
              </button>
            ))}
            <button
              onClick={() => setShowAddCustom(true)}
              className="w-full px-4 py-3 rounded-xl text-left text-amber-200/50 hover:bg-white/5 hover:text-amber-200/70 transition-all border border-dashed border-amber-400/20"
            >
              <span className="mr-2">➕</span>
              <span style={{ fontFamily: '"Noto Sans SC", sans-serif' }}>添加自定义事件</span>
            </button>
          </div>
        </div>

        {/* 右侧表单内容 */}
        <div className="flex-1 space-y-8">
          {/* 当前分类标题 */}
          <div className="flex items-center gap-4 pb-4 border-b border-amber-400/10">
            <span className="text-4xl">{PRESET_QUESTIONS[activeCategory].icon}</span>
            <div>
              <h3 className="text-2xl text-amber-200" style={{ fontFamily: '"Noto Serif SC", serif' }}>
                {PRESET_QUESTIONS[activeCategory].category.replace(/^[^\s]+\s/, '')}
              </h3>
              <p className="text-amber-200/40 text-sm">{PRESET_QUESTIONS[activeCategory].categoryEn}</p>
            </div>
          </div>

          {/* 问题卡片 */}
          {PRESET_QUESTIONS[activeCategory].questions.map((q) => (
            <div
              key={q.key}
              className="bg-white/5 rounded-2xl p-6 border border-amber-400/10 hover:border-amber-400/20 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="text-lg text-amber-200 mb-1" style={{ fontFamily: '"Noto Sans SC", sans-serif' }}>
                    {q.label}
                  </h4>
                  <p className="text-amber-200/40 text-sm">{q.labelEn}</p>
                </div>
                {/* 图片上传按钮 */}
                <label className="cursor-pointer px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 rounded-lg text-amber-300/70 text-sm transition-all flex items-center gap-2">
                  <span>📷</span>
                  <span>上传图片</span>
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
                    onClick={() => setUploadedImages(prev => {
                      const newImages = {...prev};
                      delete newImages[q.key];
                      return newImages;
                    })}
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
                  className="w-full px-4 py-3 bg-white/5 border border-amber-400/20 rounded-xl text-amber-100 focus:outline-none focus:border-amber-400/50 transition-all"
                />
              )}

              {q.type === 'text' && (
                <input
                  type="text"
                  value={formData[q.key]?.description || ''}
                  onChange={(e) => handleInputChange(q.key, 'description', e.target.value)}
                  placeholder={q.placeholder}
                  className="w-full px-4 py-3 bg-white/5 border border-amber-400/20 rounded-xl text-amber-100 placeholder-amber-200/30 focus:outline-none focus:border-amber-400/50 transition-all"
                />
              )}

              {q.type === 'textarea' && (
                <textarea
                  value={formData[q.key]?.description || ''}
                  onChange={(e) => handleInputChange(q.key, 'description', e.target.value)}
                  placeholder={q.placeholder}
                  rows={3}
                  className="w-full px-4 py-3 bg-white/5 border border-amber-400/20 rounded-xl text-amber-100 placeholder-amber-200/30 focus:outline-none focus:border-amber-400/50 transition-all resize-none"
                />
              )}

              {q.type === 'period' && (
                <div className="space-y-3">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="text-amber-200/40 text-xs mb-1 block">开始时间</label>
                      <input
                        type="date"
                        value={formData[q.key]?.startDate || ''}
                        onChange={(e) => handleInputChange(q.key, 'startDate', e.target.value)}
                        className="w-full px-4 py-2 bg-white/5 border border-amber-400/20 rounded-lg text-amber-100 focus:outline-none focus:border-amber-400/50 transition-all"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-amber-200/40 text-xs mb-1 block">结束时间</label>
                      <input
                        type="date"
                        value={formData[q.key]?.endDate || ''}
                        onChange={(e) => handleInputChange(q.key, 'endDate', e.target.value)}
                        className="w-full px-4 py-2 bg-white/5 border border-amber-400/20 rounded-lg text-amber-100 focus:outline-none focus:border-amber-400/50 transition-all"
                      />
                    </div>
                  </div>
                  <input
                    type="text"
                    value={formData[q.key]?.name || ''}
                    onChange={(e) => handleInputChange(q.key, 'name', e.target.value)}
                    placeholder={q.placeholder}
                    className="w-full px-4 py-3 bg-white/5 border border-amber-400/20 rounded-xl text-amber-100 placeholder-amber-200/30 focus:outline-none focus:border-amber-400/50 transition-all"
                  />
                </div>
              )}

              {q.type === 'event' && (
                <div className="space-y-3">
                  <input
                    type="date"
                    value={formData[q.key]?.date || ''}
                    onChange={(e) => handleInputChange(q.key, 'date', e.target.value)}
                    className="w-full px-4 py-2 bg-white/5 border border-amber-400/20 rounded-lg text-amber-100 focus:outline-none focus:border-amber-400/50 transition-all"
                  />
                  <textarea
                    value={formData[q.key]?.description || ''}
                    onChange={(e) => handleInputChange(q.key, 'description', e.target.value)}
                    placeholder={q.placeholder}
                    rows={2}
                    className="w-full px-4 py-3 bg-white/5 border border-amber-400/20 rounded-xl text-amber-100 placeholder-amber-200/30 focus:outline-none focus:border-amber-400/50 transition-all resize-none"
                  />
                </div>
              )}
            </div>
          ))}

          {/* 自定义事件列表 */}
          {customEvents.length > 0 && (
            <div className="mt-12 pt-8 border-t border-amber-400/10">
              <h3 className="text-xl text-amber-200 mb-6" style={{ fontFamily: '"Noto Serif SC", serif' }}>
                ✨ 我的自定义事件
              </h3>
              {customEvents.map((event, idx) => (
                <div
                  key={event.id}
                  className="bg-gradient-to-r from-amber-500/5 to-transparent rounded-2xl p-6 border border-amber-400/20 mb-4"
                >
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-amber-300/60 text-sm">自定义事件 #{idx + 1}</span>
                    <button
                      onClick={() => deleteCustomEvent(event.id)}
                      className="text-red-400/60 hover:text-red-400 text-sm"
                    >
                      删除
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <input
                      type="text"
                      value={event.title}
                      onChange={(e) => updateCustomEvent(event.id, 'title', e.target.value)}
                      placeholder="事件标题"
                      className="px-4 py-2 bg-white/5 border border-amber-400/20 rounded-lg text-amber-100 placeholder-amber-200/30 focus:outline-none focus:border-amber-400/50"
                    />
                    <input
                      type="date"
                      value={event.date}
                      onChange={(e) => updateCustomEvent(event.id, 'date', e.target.value)}
                      className="px-4 py-2 bg-white/5 border border-amber-400/20 rounded-lg text-amber-100 focus:outline-none focus:border-amber-400/50"
                    />
                  </div>
                  <textarea
                    value={event.description}
                    onChange={(e) => updateCustomEvent(event.id, 'description', e.target.value)}
                    placeholder="描述这个重要时刻..."
                    rows={2}
                    className="w-full px-4 py-3 bg-white/5 border border-amber-400/20 rounded-xl text-amber-100 placeholder-amber-200/30 focus:outline-none focus:border-amber-400/50 resize-none"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 添加自定义事件弹窗 */}
      {showAddCustom && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-900 rounded-2xl p-8 max-w-md w-full mx-4 border border-amber-400/20">
            <h3 className="text-xl text-amber-200 mb-4" style={{ fontFamily: '"Noto Serif SC", serif' }}>
              添加自定义事件
            </h3>
            <p className="text-amber-200/60 mb-6 text-sm">
              除了预设问题，你还可以添加任何对你重要的人生事件
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowAddCustom(false)}
                className="flex-1 px-4 py-3 border border-amber-400/30 rounded-xl text-amber-200/70 hover:bg-white/5 transition-all"
              >
                取消
              </button>
              <button
                onClick={addCustomEvent}
                className="flex-1 px-4 py-3 bg-amber-500 rounded-xl text-white hover:bg-amber-400 transition-all"
              >
                添加事件
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@300;400;500&family=Noto+Sans+SC:wght@300;400;500&display=swap');
      `}</style>
    </div>
  );

  // 渲染时间线页面
  const renderTimeline = () => {
    const timelineData = generateTimelineData();

    return (
      <div className="min-h-screen" style={{
        background: 'linear-gradient(180deg, #0a0a1a 0%, #1a1a2e 50%, #0f1a2a 100%)'
      }}>
        {/* 头部 */}
        <div className="sticky top-0 z-50 bg-gradient-to-b from-slate-950/95 to-transparent backdrop-blur-lg">
          <div className="max-w-4xl mx-auto px-6 py-6 flex items-center justify-between">
            <h1 className="text-2xl text-amber-200/90" style={{ fontFamily: '"Noto Serif SC", serif' }}>
              {userName}的人生旅程
            </h1>
            <button
              onClick={() => setCurrentStep('form')}
              className="px-4 py-2 text-amber-200/60 hover:text-amber-200 transition-colors text-sm border border-amber-400/20 rounded-full hover:border-amber-400/40"
            >
              ← 编辑信息
            </button>
          </div>
        </div>

        {/* 时间线内容 */}
        <div className="max-w-4xl mx-auto px-6 pb-24 relative">
          {/* 中心线 */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-amber-400/50 via-amber-400/30 to-transparent" />

          {/* 事件列表 */}
          {timelineData.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-amber-200/40 text-lg">还没有添加任何事件</p>
              <button
                onClick={() => setCurrentStep('form')}
                className="mt-4 px-6 py-2 bg-amber-500/20 text-amber-300 rounded-full hover:bg-amber-500/30 transition-all"
              >
                开始添加
              </button>
            </div>
          ) : (
            <div className="space-y-16 pt-12">
              {timelineData.map((event, idx) => (
                <div
                  key={event.id}
                  className={`relative flex items-center gap-8 ${idx % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}
                  onMouseEnter={() => setHoveredEvent(event.id)}
                  onMouseLeave={() => setHoveredEvent(null)}
                >
                  {/* 事件卡片 */}
                  <div
                    className={`flex-1 ${idx % 2 === 0 ? 'text-right pr-8' : 'text-left pl-8'}`}
                    style={{
                      animation: 'fadeSlideIn 0.6s ease-out',
                      animationDelay: `${idx * 0.1}s`,
                      animationFillMode: 'both'
                    }}
                  >
                    <div
                      className={`inline-block p-6 rounded-2xl bg-white/5 border border-amber-400/20 backdrop-blur-sm transition-all duration-300 ${
                        hoveredEvent === event.id ? 'bg-white/10 border-amber-400/40 shadow-lg shadow-amber-500/10 transform scale-105' : ''
                      }`}
                    >
                      {/* 日期 */}
                      <div className="text-amber-400/70 text-sm mb-2 font-mono">
                        {event.date}
                        {event.endDate && ` → ${event.endDate}`}
                      </div>
                      {/* 标题 */}
                      <h3 className="text-xl text-amber-100 mb-2" style={{ fontFamily: '"Noto Serif SC", serif' }}>
                        <span className="mr-2">{event.icon}</span>
                        {event.title}
                      </h3>
                      {/* 描述 */}
                      {event.description && (
                        <p className="text-amber-200/60 text-sm leading-relaxed">
                          {event.description}
                        </p>
                      )}
                      {/* 图片（悬停显示） */}
                      {event.image && hoveredEvent === event.id && (
                        <div className="mt-4 overflow-hidden rounded-xl animate-fadeIn">
                          <img
                            src={event.image}
                            alt={event.title}
                            className="w-full h-32 object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 中心点 */}
                  <div className="absolute left-1/2 -translate-x-1/2 z-10">
                    <div
                      className={`w-4 h-4 rounded-full bg-amber-400 transition-all duration-300 ${
                        hoveredEvent === event.id ? 'scale-150 shadow-lg shadow-amber-400/50' : ''
                      }`}
                    />
                    <div
                      className={`absolute inset-0 rounded-full bg-amber-400/30 animate-ping ${
                        hoveredEvent === event.id ? '' : 'hidden'
                      }`}
                    />
                  </div>

                  {/* 占位 */}
                  <div className="flex-1" />
                </div>
              ))}
            </div>
          )}

          {/* 终点 */}
          {timelineData.length > 0 && (
            <div className="text-center mt-24">
              <div className="inline-block px-8 py-4 bg-gradient-to-r from-amber-500/20 to-amber-400/10 rounded-full border border-amber-400/30">
                <p className="text-amber-200/80" style={{ fontFamily: '"Noto Serif SC", serif' }}>
                  ✨ 旅程仍在继续...
                </p>
              </div>
            </div>
          )}
        </div>

        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@300;400;500&family=Noto+Sans+SC:wght@300;400;500&display=swap');
          
          @keyframes fadeSlideIn {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          
          .animate-fadeIn {
            animation: fadeIn 0.3s ease-out;
          }
        `}</style>
      </div>
    );
  };

  // 根据当前步骤渲染不同页面
  return (
    <div>
      {currentStep === 'intro' && renderIntro()}
      {currentStep === 'form' && renderForm()}
      {currentStep === 'timeline' && renderTimeline()}
    </div>
  );
}
