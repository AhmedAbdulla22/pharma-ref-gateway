"use client"

export function MedicalBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 dark:from-primary/10 dark:via-transparent dark:to-primary/5" />

      <svg
        className="absolute inset-0 w-full h-full opacity-[0.08] dark:opacity-[0.12]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="hex-pattern"
            x="0"
            y="0"
            width="60"
            height="52"
            patternUnits="userSpaceOnUse"
            patternTransform="scale(1.5)"
          >
            {/* Hexagonal molecular pattern */}
            <path
              d="M30 0 L60 15 L60 37 L30 52 L0 37 L0 15 Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-primary"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hex-pattern)" />
      </svg>

      {/* Floating pill capsules */}
      <div className="absolute top-[10%] left-[5%] animate-float-slow">
        <PillCapsule className="w-16 h-8 text-primary/20 dark:text-primary/30" rotation={-15} />
      </div>
      <div className="absolute top-[25%] right-[8%] animate-float-medium">
        <PillCapsule className="w-12 h-6 text-primary/15 dark:text-primary/25" rotation={30} />
      </div>
      <div className="absolute bottom-[30%] left-[12%] animate-float-fast">
        <PillCapsule className="w-10 h-5 text-primary/10 dark:text-primary/20" rotation={45} />
      </div>
      <div className="absolute bottom-[15%] right-[15%] animate-float-slow">
        <PillCapsule className="w-14 h-7 text-primary/20 dark:text-primary/30" rotation={-25} />
      </div>

      {/* DNA helix strand */}
      <div className="absolute top-[5%] right-[3%] animate-spin-very-slow">
        <DNAHelix className="w-24 h-48 text-primary/10 dark:text-primary/15" />
      </div>
      <div className="absolute bottom-[5%] left-[3%] animate-spin-very-slow-reverse">
        <DNAHelix className="w-20 h-40 text-primary/10 dark:text-primary/15" />
      </div>

      {/* Molecular structure */}
      <div className="absolute top-[40%] left-[2%] animate-pulse-slow">
        <MoleculeStructure className="w-32 h-32 text-primary/15 dark:text-primary/20" />
      </div>
      <div className="absolute top-[60%] right-[5%] animate-pulse-slow delay-1000">
        <MoleculeStructure className="w-24 h-24 text-primary/10 dark:text-primary/15" />
      </div>

      {/* Tablet pills */}
      <div className="absolute top-[70%] left-[25%] animate-float-medium">
        <TabletPill className="w-8 h-8 text-primary/15 dark:text-primary/25" />
      </div>
      <div className="absolute top-[15%] left-[40%] animate-float-fast">
        <TabletPill className="w-6 h-6 text-primary/10 dark:text-primary/20" />
      </div>
      <div className="absolute bottom-[25%] right-[30%] animate-float-slow">
        <TabletPill className="w-10 h-10 text-primary/15 dark:text-primary/25" />
      </div>

      {/* Medical cross symbols */}
      <div className="absolute top-[50%] right-[20%] animate-pulse-slow">
        <MedicalCross className="w-12 h-12 text-primary/10 dark:text-primary/15" />
      </div>
      <div className="absolute bottom-[40%] left-[35%] animate-pulse-slow delay-500">
        <MedicalCross className="w-8 h-8 text-primary/8 dark:text-primary/12" />
      </div>

      {/* Corner glow effects */}
      <div className="absolute -top-20 -left-20 w-96 h-96 bg-primary/5 dark:bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-primary/5 dark:bg-primary/10 rounded-full blur-3xl" />
    </div>
  )
}

function PillCapsule({ className, rotation = 0 }: { className?: string; rotation?: number }) {
  return (
    <svg className={className} viewBox="0 0 60 30" fill="none" style={{ transform: `rotate(${rotation}deg)` }}>
      <rect x="1" y="1" width="58" height="28" rx="14" stroke="currentColor" strokeWidth="1.5" />
      <line x1="30" y1="1" x2="30" y2="29" stroke="currentColor" strokeWidth="1" />
      <rect x="30" y="3" width="26" height="24" rx="12" fill="currentColor" fillOpacity="0.3" />
    </svg>
  )
}

function DNAHelix({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 100" fill="none">
      {/* Left strand */}
      <path
        d="M5 5 Q20 15, 35 25 Q20 35, 5 45 Q20 55, 35 65 Q20 75, 5 85 Q20 95, 35 100"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
      {/* Right strand */}
      <path
        d="M35 5 Q20 15, 5 25 Q20 35, 35 45 Q20 55, 5 65 Q20 75, 35 85 Q20 95, 5 100"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
      {/* Cross connections */}
      <line x1="8" y1="15" x2="32" y2="15" stroke="currentColor" strokeWidth="1" />
      <line x1="8" y1="35" x2="32" y2="35" stroke="currentColor" strokeWidth="1" />
      <line x1="8" y1="55" x2="32" y2="55" stroke="currentColor" strokeWidth="1" />
      <line x1="8" y1="75" x2="32" y2="75" stroke="currentColor" strokeWidth="1" />
      <line x1="8" y1="95" x2="32" y2="95" stroke="currentColor" strokeWidth="1" />
      {/* Nodes */}
      <circle cx="8" cy="15" r="2" fill="currentColor" />
      <circle cx="32" cy="15" r="2" fill="currentColor" />
      <circle cx="8" cy="35" r="2" fill="currentColor" />
      <circle cx="32" cy="35" r="2" fill="currentColor" />
      <circle cx="8" cy="55" r="2" fill="currentColor" />
      <circle cx="32" cy="55" r="2" fill="currentColor" />
      <circle cx="8" cy="75" r="2" fill="currentColor" />
      <circle cx="32" cy="75" r="2" fill="currentColor" />
    </svg>
  )
}

function MoleculeStructure({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none">
      {/* Central hexagon */}
      <polygon points="50,15 75,30 75,60 50,75 25,60 25,30" stroke="currentColor" strokeWidth="1.5" fill="none" />
      {/* Outer bonds */}
      <line x1="50" y1="15" x2="50" y2="0" stroke="currentColor" strokeWidth="1" />
      <line x1="75" y1="30" x2="90" y2="20" stroke="currentColor" strokeWidth="1" />
      <line x1="75" y1="60" x2="90" y2="70" stroke="currentColor" strokeWidth="1" />
      <line x1="50" y1="75" x2="50" y2="95" stroke="currentColor" strokeWidth="1" />
      <line x1="25" y1="60" x2="10" y2="70" stroke="currentColor" strokeWidth="1" />
      <line x1="25" y1="30" x2="10" y2="20" stroke="currentColor" strokeWidth="1" />
      {/* Atoms */}
      <circle cx="50" cy="15" r="4" fill="currentColor" />
      <circle cx="75" cy="30" r="4" fill="currentColor" />
      <circle cx="75" cy="60" r="4" fill="currentColor" />
      <circle cx="50" cy="75" r="4" fill="currentColor" />
      <circle cx="25" cy="60" r="4" fill="currentColor" />
      <circle cx="25" cy="30" r="4" fill="currentColor" />
      {/* Outer atoms */}
      <circle cx="50" cy="0" r="3" fill="currentColor" fillOpacity="0.6" />
      <circle cx="90" cy="20" r="3" fill="currentColor" fillOpacity="0.6" />
      <circle cx="90" cy="70" r="3" fill="currentColor" fillOpacity="0.6" />
      <circle cx="50" cy="95" r="3" fill="currentColor" fillOpacity="0.6" />
      <circle cx="10" cy="70" r="3" fill="currentColor" fillOpacity="0.6" />
      <circle cx="10" cy="20" r="3" fill="currentColor" fillOpacity="0.6" />
    </svg>
  )
}

function TabletPill({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 30 30" fill="none">
      <circle cx="15" cy="15" r="13" stroke="currentColor" strokeWidth="1.5" />
      <line x1="15" y1="5" x2="15" y2="25" stroke="currentColor" strokeWidth="1" />
      <circle cx="15" cy="15" r="4" fill="currentColor" fillOpacity="0.3" />
    </svg>
  )
}

function MedicalCross({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none">
      <rect
        x="15"
        y="5"
        width="10"
        height="30"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="currentColor"
        fillOpacity="0.2"
      />
      <rect
        x="5"
        y="15"
        width="30"
        height="10"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="currentColor"
        fillOpacity="0.2"
      />
    </svg>
  )
}
