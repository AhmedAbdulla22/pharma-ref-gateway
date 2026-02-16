"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { MessageCircle, X, Send, Bot, Loader2, Sparkles, User } from "lucide-react"
import { useLanguage } from "@/components/providers/language-provider"

interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

export function DrugChatbot({ drugName, drugContext }: { drugName: string, drugContext: any }) {
  const { isRTL, language } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showHint, setShowHint] = useState(true) // State to show/hide the speech bubble
  const scrollRef = useRef<HTMLDivElement>(null)

  // Initialize greeting
  useEffect(() => {
    const greeting = language === 'ar' 
      ? `مرحباً! أنا مساعدك الصيدلاني. هل لديك أسئلة حول ${drugName}؟` 
      : language === 'ku' 
      ? `سڵاو! من یاریدەدەری دەرمانسازم. پرسیارت هەیە دەربارەی ${drugName}؟` 
      : `Hello! I'm your AI Pharmacist. Ask me anything about ${drugName}.` 
    
    if (messages.length === 0) {
      setMessages([{ role: "assistant", content: greeting }])
    }
  }, [language, drugName])

  // Scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, isOpen])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMsg = input.trim()
    setInput("")
    setMessages(prev => [...prev, { role: "user", content: userMsg }])
    setIsLoading(true)

    try {
      const response = await fetch("/api/drug-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: userMsg, 
          drugName, 
          context: drugContext 
        }),
      })
      
      const data = await response.json()
      setMessages(prev => [...prev, { role: "assistant", content: data.reply }])
    } catch (error) {
      setMessages(prev => [...prev, { role: "assistant", content: "Network error. Please try again." }])
    } finally {
      setIsLoading(false)
    }
  }

  // Close the hint after 10 seconds automatically
  useEffect(() => {
    const timer = setTimeout(() => setShowHint(false), 10000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end pointer-events-auto font-sans">
      
      {/* --- 1. OPEN STATE: CHAT WINDOW --- */}
      {isOpen && (
        <Card className="w-[90vw] md:w-[380px] h-[500px] shadow-2xl bg-card border-border flex flex-col mb-4 animate-in slide-in-from-bottom-5 duration-300 rounded-xl overflow-hidden ring-1 ring-border">
            {/* Header */}
            <CardHeader className="p-4 bg-gradient-to-r from-primary/50 to-muted border-b border-border flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 shadow-[0_0_10px_rgba(6,182,212,0.2)]">
                  <Bot className="h-6 w-6 text-cyan-400" />
                </div>
                <div>
                  <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                    AI Pharmacist <Sparkles className="h-3 w-3 text-amber-400 animate-pulse" />
                  </CardTitle>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">FDA Data Context Active</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full">
                <X className="h-5 w-5" />
              </Button>
            </CardHeader>

            {/* Chat Area */}
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-border bg-card/50">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div 
                    className={`max-w-[85%] p-3 text-sm leading-relaxed shadow-sm ${
                      msg.role === "user" 
                        ? "bg-cyan-600 text-white rounded-2xl rounded-tr-sm" 
                        : "bg-muted border-border text-muted-foreground rounded-2xl rounded-tl-sm"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted border-border p-3 rounded-2xl rounded-tl-sm flex gap-2 items-center">
                    <Loader2 className="h-4 w-4 animate-spin text-cyan-500" />
                    <span className="text-xs text-muted-foreground italic">Reading label...</span>
                  </div>
                </div>
              )}
              <div ref={scrollRef} />
            </CardContent>

            {/* Input Area */}
            <CardFooter className="p-3 bg-muted border-t border-border">
              <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex w-full gap-2">
                <Input 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={isRTL ? "اكتب سؤالك..." : "Type your question..."}
                  className={`bg-background border-border focus-visible:ring-ring/50 placeholder:text-muted-foreground ${isRTL ? "text-right" : ""}`}
                  dir={isRTL ? "rtl" : "ltr"}
                />
                <Button type="submit" size="icon" disabled={isLoading || !input.trim()} className="bg-cyan-600 hover:bg-cyan-500 text-white shrink-0">
                  <Send className={`h-4 w-4 ${isRTL ? "rotate-180" : ""}`} />
                </Button>
              </form>
            </CardFooter>
        </Card>
      )}

      {/* --- 2. CLOSED STATE: PROMINENT BUTTON --- */}
      {!isOpen && (
        <div className="flex flex-col items-end gap-2 group">
          
          {/* A. The "Hint" Bubble (Visible initially or on hover) */}
          <div className={`
             bg-card text-foreground text-xs font-bold py-2 px-4 rounded-xl shadow-xl mb-1 
             transform transition-all duration-300 origin-bottom-right
             flex items-center gap-2 border border-border
             ${showHint ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-90 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0 group-hover:pointer-events-auto"}
          `}>
             <Bot className="h-4 w-4 text-cyan-600" />
             <span>
               {language === 'ar' ? `أسئلة حول ${drugName.substring(0,10)}...؟` : 
                language === 'ku' ? `پرسیار دەربارەی ${drugName.substring(0,10)}...؟` :
                `Questions about ${drugName.substring(0, 15)}...?`}
             </span>
             {/* Tiny Triangle pointing down */}
             <div className="absolute -bottom-1 right-6 w-2 h-2 bg-background rotate-45 border-r border-b border-border"></div>
          </div>

          {/* B. The Main "Pill" Button */}
          <Button
            onClick={() => setIsOpen(true)}
            className="h-14 pl-4 pr-6 rounded-full shadow-[0_0_20px_rgba(6,182,212,0.3)] bg-primary hover:bg-primary/90 text-foreground border-2 border-border transition-all hover:scale-105 flex items-center gap-3 group-hover:shadow-[0_0_30px_rgba(6,182,212,0.5)]"
          >
            {/* Animated Icon Container */}
            <div className="relative">
               <div className="absolute inset-0 bg-foreground rounded-full opacity-20 animate-ping"></div>
               <MessageCircle className="h-6 w-6 relative z-10" />
            </div>
            
            {/* Text Label */}
            <div className="flex flex-col items-start">
               <span className="text-[10px] uppercase font-bold text-primary-foreground leading-none mb-0.5 opacity-80">
                 {language === 'ar' ? "مساعد" : language === 'ku' ? "یاریدەدەر" : "AI Assistant"}
               </span>
               <span className="text-sm font-bold leading-none">
                 {language === 'ar' ? "اسأل الصيدلي" : language === 'ku' ? "پرسیار لە دەرمانساز" : "Ask Pharmacist"}
               </span>
            </div>
          </Button>
        </div>
      )}

    </div>
  )
}