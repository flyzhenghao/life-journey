// 预设的人生事件问题模板
export const PRESET_QUESTIONS = [
  {
    id: 'birth',
    icon: '👶',
    questions: [
      { key: 'birthDate', type: 'date' },
      { key: 'birthPlace', type: 'text', placeholder: 'birthPlace' },
      { key: 'birthStory', type: 'textarea', placeholder: 'birthStory' },
    ]
  },
  {
    id: 'education',
    icon: '🎓',
    questions: [
      { key: 'primarySchool', type: 'period', placeholder: 'school' },
      { key: 'middleSchool', type: 'period', placeholder: 'school' },
      { key: 'highSchool', type: 'period', placeholder: 'school' },
      { key: 'university', type: 'period', placeholder: 'university' },
      { key: 'graduateSchool', type: 'period', placeholder: 'university' },
    ]
  },
  {
    id: 'career',
    icon: '💼',
    questions: [
      { key: 'firstJob', type: 'period', placeholder: 'job' },
      { key: 'careerMilestone', type: 'event', placeholder: 'milestone' },
    ]
  },
  {
    id: 'love',
    icon: '💕',
    questions: [
      { key: 'firstLove', type: 'event', placeholder: 'loveStory' },
      { key: 'engagement', type: 'event', placeholder: 'engagement' },
      { key: 'marriage', type: 'event', placeholder: 'marriage' },
    ]
  },
  {
    id: 'family',
    icon: '👨‍👩‍👧‍👦',
    questions: [
      { key: 'firstChild', type: 'event', placeholder: 'child' },
      { key: 'moreChildren', type: 'event', placeholder: 'moreChildren' },
    ]
  },
  {
    id: 'achievements',
    icon: '🏆',
    questions: [
      { key: 'awards', type: 'event', placeholder: 'awards' },
      { key: 'specialAchievement', type: 'event', placeholder: 'achievement' },
    ]
  },
  {
    id: 'relocation',
    icon: '🌍',
    questions: [
      { key: 'majorMove', type: 'event', placeholder: 'move' },
      { key: 'lifeChange', type: 'event', placeholder: 'lifeChange' },
    ]
  },
  {
    id: 'health',
    icon: '❤️‍🩹',
    questions: [
      { key: 'healthEvent', type: 'event', placeholder: 'health' },
      { key: 'fitness', type: 'event', placeholder: 'fitness' },
    ]
  },
  {
    id: 'travel',
    icon: '✈️',
    questions: [
      { key: 'memorableTrip', type: 'event', placeholder: 'trip' },
      { key: 'countries', type: 'event', placeholder: 'countries' },
    ]
  },
  {
    id: 'property',
    icon: '🏠',
    questions: [
      { key: 'firstHome', type: 'event', placeholder: 'home' },
      { key: 'investment', type: 'event', placeholder: 'investment' },
    ]
  },
];

export const getCategoryIcon = (categoryId) => {
  const category = PRESET_QUESTIONS.find(c => c.id === categoryId);
  return category?.icon || '⭐';
};
