import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Globe, AtSign, MessageCircle } from 'lucide-react';

import Container from "./Container";

export default function Footer() {
  return (
    <footer className="bg-background pt-20 pb-10 mt-auto border-t border-border/50">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
          
          {/* Brand Column */}
          <div className="md:col-span-4">
            <Link href="/" className="flex items-center mb-6">
              <Image
                src="/skilly.png"
                alt="Skilly Logo"
                width={120}
                height={40}
                className="h-8 w-auto object-contain"
              />
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6 max-w-sm">
              On-demand mentorship from 100% ID-verified professionals. Learn faster, from people who've actually done it.
            </p>
            <div className="flex items-center gap-3">
              <a href="#" className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                <Globe className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                <AtSign className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links Columns */}
          <div className="md:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-8">
            <div>
              <h4 className="text-foreground font-semibold mb-6">Platform</h4>
              <ul className="space-y-4 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground transition-colors">Browse skills</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Find a mentor</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Become an expert</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Pricing</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Enterprise</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-foreground font-semibold mb-6">Community</h4>
              <ul className="space-y-4 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground transition-colors">Mentor stories</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Blog</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Events</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Discord</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Referral program</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-foreground font-semibold mb-6">Company</h4>
              <ul className="space-y-4 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground transition-colors">About</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Careers</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Trust & safety</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Press</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Contact</Link></li>
              </ul>
            </div>
          </div>
          
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© 2026 Skilly, Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="#" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Terms</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Security</Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
