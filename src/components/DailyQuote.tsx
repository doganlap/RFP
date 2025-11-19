import React, { useState, useEffect } from 'react';
import { Quote } from 'lucide-react';

const saudiMotivationalQuotes = [
  {
    text: "الإتقان في العمل هو مفتاح النجاح",
    author: "قيمة سعودية",
    english: "Excellence in work is the key to success"
  },
  {
    text: "التميز هدفنا والإتقان طريقنا",
    author: "رؤية 2030",
    english: "Excellence is our goal and perfection is our path"
  },
  {
    text: "العمل الجاد يؤدي إلى النجاح المضمون",
    author: "قيمة سعودية",
    english: "Hard work leads to guaranteed success"
  },
  {
    text: "الابتكار والإبداع يبنيان المستقبل",
    author: "قيمة سعودية",
    english: "Innovation and creativity build the future"
  },
  {
    text: "الصبر والمثابرة يحققان الأهداف",
    author: "قيمة سعودية",
    english: "Patience and perseverance achieve goals"
  },
  {
    text: "الجودة في العمل تعكس شخصيتنا",
    author: "قيمة سعودية",
    english: "Quality in work reflects our personality"
  },
  {
    text: "التعلم المستمر يفتح أبواب النجاح",
    author: "قيمة سعودية",
    english: "Continuous learning opens doors to success"
  },
  {
    text: "العمل الجماعي يحقق الإنجازات الكبرى",
    author: "قيمة سعودية",
    english: "Teamwork achieves great accomplishments"
  }
];

interface DailyQuoteProps {
  language?: 'ar' | 'en';
}

const DailyQuote: React.FC<DailyQuoteProps> = ({ language = 'ar' }) => {
  const [currentQuote, setCurrentQuote] = useState(saudiMotivationalQuotes[0]);

  useEffect(() => {
    // Get quote based on day of year for consistency
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    const quoteIndex = dayOfYear % saudiMotivationalQuotes.length;
    setCurrentQuote(saudiMotivationalQuotes[quoteIndex]);
  }, []);

  return (
    <div className="backdrop-blur-md bg-white/10 dark:bg-gray-900/10 border border-white/20 dark:border-gray-700/20 rounded-lg p-4 shadow-lg">
      <div className="flex items-start gap-3">
        <Quote className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
        <div className="flex-1">
          <blockquote className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
            {language === 'ar' ? currentQuote.text : currentQuote.english}
          </blockquote>
          <cite className="text-xs text-gray-600 dark:text-gray-400">
            - {currentQuote.author}
          </cite>
        </div>
      </div>
    </div>
  );
};

export default DailyQuote;
