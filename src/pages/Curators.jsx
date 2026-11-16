import React from 'react';
import { Award, Code, Globe, UserCheck, Heart } from 'lucide-react';

export function Curators() {
  return (
    <div className="bg-[#F7F3EA] text-[#20303C] min-h-[calc(100vh-4rem)] py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Page Title */}
        <div className="text-center max-w-xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#18324A] text-[#F7F3EA] text-xs font-mono font-bold tracking-wider uppercase mb-2">
            SCHOOL IT EXHIBITION 2026
          </div>
          <h1 className="font-display font-extrabold text-3xl sm:text-5xl text-[#18324A] uppercase tracking-tight">
            ABOUT THE CURATORS
          </h1>
          <p className="text-sm text-[#20303C]/80 mt-2">
            Meet the student developers behind the Train the Machine interactive exhibition.
          </p>
        </div>

        {/* Curators Profiles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Curator 1: Dilshaan */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#DDE2E5] shadow-xl space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-[#E67E42]/20 border border-[#E67E42]/40 text-[#E67E42] flex items-center justify-center font-display font-bold text-2xl">
                  D
                </div>
                <div>
                  <h3 className="font-display font-extrabold text-2xl text-[#18324A] uppercase">
                    DILSHAAN
                  </h3>
                  <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-[#E67E42]/10 text-[#E67E42] font-bold">
                    GRADE 9
                  </span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-[#20303C]/80 leading-relaxed">
                “Dilshaan is a Grade 9 student with an interest in coding and web development. He has learned coding, has earned a certificate in Python, and achieved 1st place in website making in Grade 8.”
              </p>
            </div>

            {/* Achievements */}
            <div className="pt-4 border-t border-[#DDE2E5] space-y-2">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block font-bold">
                ACHIEVEMENTS & AWARDS
              </span>
              <div className="space-y-1.5 text-xs font-semibold text-[#18324A]">
                <div className="p-2.5 rounded-xl bg-[#F7F3EA] border border-[#DDE2E5] flex items-center gap-2">
                  <span className="text-base">🐍</span>
                  <span>Python Certificate</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#F7F3EA] border border-[#DDE2E5] flex items-center gap-2">
                  <span className="text-base">🏆</span>
                  <span>1st Place — Website Making, Grade 8</span>
                </div>
              </div>
            </div>
          </div>

          {/* Curator 2: Mirsab */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#DDE2E5] shadow-xl space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-[#4E8585]/20 border border-[#4E8585]/40 text-[#4E8585] flex items-center justify-center font-display font-bold text-2xl">
                  M
                </div>
                <div>
                  <h3 className="font-display font-extrabold text-2xl text-[#18324A] uppercase">
                    MIRSAB
                  </h3>
                  <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-[#4E8585]/10 text-[#4E8585] font-bold">
                    GRADE 10
                  </span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-[#20303C]/80 leading-relaxed">
                “Mirsab is a Grade 10 student with an interest in coding and technology. He has received multiple certificates and achieved 3rd place in website making in Grade 8.”
              </p>
            </div>

            {/* Achievements */}
            <div className="pt-4 border-t border-[#DDE2E5] space-y-2">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block font-bold">
                ACHIEVEMENTS & AWARDS
              </span>
              <div className="space-y-1.5 text-xs font-semibold text-[#18324A]">
                <div className="p-2.5 rounded-xl bg-[#F7F3EA] border border-[#DDE2E5] flex items-center gap-2">
                  <span className="text-base">📜</span>
                  <span>Multiple Certificates</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#F7F3EA] border border-[#DDE2E5] flex items-center gap-2">
                  <span className="text-base">🏆</span>
                  <span>3rd Place — Website Making, Grade 8</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* OUR PROJECT Section */}
        <div className="p-8 sm:p-10 rounded-3xl bg-[#14293c] border-2 border-white/10 text-white shadow-2xl text-center space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-[#E67E42] uppercase font-bold">
            <Heart className="w-4 h-4" />
            <span>COLLABORATIVE MISSION</span>
          </div>

          <h2 className="font-display font-extrabold text-2xl sm:text-3xl uppercase tracking-tight text-white">
            OUR PROJECT
          </h2>

          <p className="text-base sm:text-lg text-[#DDE2E5]/90 max-w-2xl mx-auto leading-relaxed">
            “This is a combined project created by Dilshaan and Mirsab to explore how AI and modern technology work through interactive experiences designed for everyone.”
          </p>

          <div className="pt-4 text-xs font-mono text-[#DDE2E5]/60 border-t border-white/10 max-w-md mx-auto">
            Designed for students, parents, teachers, and visitors of all ages at the School IT Exhibition.
          </div>
        </div>
      </div>
    </div>
  );
}
