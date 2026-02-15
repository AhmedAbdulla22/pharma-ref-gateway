"use client"

import { useLanguage } from "@/components/providers/language-provider"
import { useTheme } from "@/components/providers/theme-provider"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Pill, Globe, Moon, Sun, Menu } from "lucide-react"
import type { Language } from "@/lib/i18n/translations"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useState } from "react"

const languages: { code: Language; label: string; nativeLabel: string }[] = [
  { code: "en", label: "English", nativeLabel: "EN" },
  { code: "ar", label: "Arabic", nativeLabel: "AR" },
  { code: "ku", label: "Kurdish", nativeLabel: "KU" },
]

export function Header() {
  const { language, setLanguage, t, isRTL } = useLanguage()
  const { theme, toggleTheme } = useTheme()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navigation = [
    { href: "/", label: t("home") },
    { href: "/search", label: t("drugSearch") },
    { href: "/interactions", label: t("interactionCheckerNav") },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Pill className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground hidden sm:inline">{t("appName")}</span>
        </Link>

        <nav className={`hidden md:flex items-center gap-1 ${isRTL ? "flex-row-reverse" : ""}`}>
          {navigation.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                pathname === link.href
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Controls */}
        <div className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
          {/* Language Toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                <Globe className="h-4 w-4" />
                <span className="hidden sm:inline">{languages.find((l) => l.code === language)?.nativeLabel}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={isRTL ? "start" : "end"}>
              {languages.map((lang) => (
                <DropdownMenuItem
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={language === lang.code ? "bg-accent" : ""}
                >
                  <span className="font-medium">{lang.nativeLabel}</span>
                  <span className="text-muted-foreground ms-2">• {lang.label}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme Toggle */}
          <Button
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            aria-label={theme === "light" ? t("dark") : t("light")}
            className="bg-transparent"
          >
            {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </Button>

          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden bg-transparent">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side={isRTL ? "left" : "right"} className="w-72">
              <nav className="flex flex-col gap-2 mt-8">
                {navigation.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-4 py-3 rounded-md text-base font-medium transition-colors ${
                      pathname === link.href
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
