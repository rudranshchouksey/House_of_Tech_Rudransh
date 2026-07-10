import { Code2, Briefcase, Heart } from 'lucide-react';

export function Footer() {
  const year = new Date().getFullYear();
  
  return (
    <footer className="w-full bg-white/50 dark:bg-gray-950/50 backdrop-blur-md border-t border-gray-200/50 dark:border-gray-800/50 py-8 mt-auto transition-colors">
      <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 text-[13px] font-medium text-gray-600 dark:text-gray-400">
          <div className="flex items-center">
            Developed by
            <span className="text-gray-900 dark:text-gray-200 ml-1.5 font-semibold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">Rudransh Chouksey</span>
          </div>
          <span className="hidden md:block w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700"></span>
          <div className="flex items-center text-gray-500 dark:text-gray-500">
            &copy; 2026 Rudransh Chouksey
          </div>
        </div>
        
        <div className="flex items-center gap-6 text-[13px] font-medium">
          <a 
            href="https://github.com/rudranshchouksey" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 px-3 py-1.5 rounded-lg transition-all active:scale-95"
          >
            <Code2 size={16} />
            <span>GitHub</span>
          </a>
          
          <div className="w-px h-4 bg-gray-200 dark:bg-gray-800"></div>

          <a 
            href="https://www.linkedin.com/in/rudransh-chouksey/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 px-3 py-1.5 rounded-lg transition-all active:scale-95"
          >
            <Briefcase size={16} />
            <span>LinkedIn</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
