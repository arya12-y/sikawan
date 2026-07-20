import fs from 'fs';
import { globSync } from 'glob';

const themeMap = {
  'bg-white': 'bg-[#14141E]',
  'bg-gray-50': 'bg-[#14141E]',
  'bg-gray-100': 'bg-[#1A1A26]',
  'bg-slate-50': 'bg-[#14141E]',
  'bg-slate-100': 'bg-[#1A1A26]',
  'text-gray-900': 'text-slate-100',
  'text-gray-800': 'text-slate-100',
  'text-gray-700': 'text-slate-300',
  'text-gray-600': 'text-slate-400',
  'text-gray-500': 'text-slate-400',
  'text-slate-900': 'text-slate-100',
  'text-slate-800': 'text-slate-100',
  'text-slate-700': 'text-slate-300',
  'text-slate-600': 'text-slate-400',
  'text-slate-500': 'text-slate-400',
  'border-gray-100': 'border-[#1E1E2E]',
  'border-gray-200': 'border-[#1E1E2E]',
  'border-gray-300': 'border-[#262636]',
  'border-slate-100': 'border-[#1E1E2E]',
  'border-slate-200': 'border-[#1E1E2E]',
  'border-slate-300': 'border-[#262636]',
  'divide-gray-100': 'divide-[#1E1E2E]',
  'divide-gray-200': 'divide-[#1E1E2E]',
  'divide-slate-200': 'divide-[#1E1E2E]',
  'hover:bg-gray-50': 'hover:bg-white/[0.03]',
  'hover:bg-slate-50': 'hover:bg-white/[0.03]',
  'hover:bg-gray-100': 'hover:bg-white/5',
  'focus:ring-indigo-500': 'focus:ring-indigo-500/30',
  'focus:border-indigo-500': 'focus:border-indigo-500',
  'bg-indigo-100 text-indigo-700': 'bg-indigo-500/10 text-indigo-400',
  'bg-cyan-100 text-cyan-700': 'bg-cyan-500/10 text-cyan-400',
  'bg-emerald-100 text-emerald-700': 'bg-emerald-500/10 text-emerald-400',
  'bg-green-100 text-green-700': 'bg-emerald-500/10 text-emerald-400',
  'bg-amber-100 text-amber-700': 'bg-amber-500/10 text-amber-400',
  'bg-yellow-100 text-yellow-700': 'bg-amber-500/10 text-amber-400',
  'bg-rose-100 text-rose-700': 'bg-rose-500/10 text-rose-400',
  'bg-red-100 text-red-700': 'bg-rose-500/10 text-rose-400',
  'bg-indigo-50': 'bg-indigo-500/10',
  'text-indigo-600': 'text-indigo-400',
  'bg-gray-50/50': 'bg-white/[0.02]',
  'bg-gray-50/30': 'bg-white/[0.01]'
};

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;
  
  // Need to process longer tokens first to avoid partial matches
  const sortedTokens = Object.keys(themeMap).sort((a, b) => b.length - a.length);
  
  for (const oldClass of sortedTokens) {
    const newClass = themeMap[oldClass];
    // Use simple global replacement
    content = content.split(oldClass).join(newClass);
  }

  // Dashboard specific replacements
  if (filePath.includes('Dashboard.jsx')) {
    content = content.split('#f1f5f9').join('#1E1E2E');
    content = content.split('#e0e7ff').join('#1E1E2E');
    content = content.split('#475569').join('#94A3B8');
    content = content.split('bg-white/15').join('bg-[#14141E]/50');
  }

  // Fix generic things
  // Outline button
  content = content.replace(/border border-gray-300 bg-white text-gray-700 hover:bg-gray-50/g, 'border border-[#262636] bg-[#14141E] text-slate-300 hover:bg-white/5');

  if (content !== original) {
    fs.writeFileSync(filePath, content);
    console.log('Updated: ' + filePath);
  }
}

const files = globSync('frontend/src/**/*.{jsx,js}');
files.forEach(file => {
  if (file.includes('Pages') || file.includes('Components')) {
    processFile(file);
  }
});

