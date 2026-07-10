import { Code2, Briefcase, Heart } from 'lucide-react';

export function Footer() {
  const year = new Date().getFullYear();
  
  return (
    <footer className="w-full bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 py-6 mt-auto">
      <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center text-sm font-medium text-gray-600 dark:text-gray-400">
          Developed with <Heart size={14} className="mx-1 text-red-500 fill-red-500" /> by 
          <span className="text-gray-900 dark:text-gray-200 ml-1 font-semibold">Rudransh Chouksey</span>
        </div>
        
        <div className="flex items-center gap-4 text-sm">
          <a 
            href="https://github.com/rudranshchouksey" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            <Code2 size={16} />
            <span>GitHub</span>
          </a>
          <a 
            href="https://linkedin.com/in/rudranshchouksey" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            <Briefcase size={16} />
            <span>LinkedIn</span>
          </a>
        </div>

        <div className="text-xs text-gray-500 dark:text-gray-500">
          &copy; {year} Collaborative Editor
        </div>
      </div>
    </footer>
  );
}
