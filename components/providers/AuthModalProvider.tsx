"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import LoginModal from "../auth/LoginModal";
import { createClient } from "@/lib/client";

interface AuthModalContextType {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  user: any;
  loading: boolean;
  requireAuth: (e: React.MouseEvent, action: () => void) => void;
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined);

export function AuthModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user || null);
      setLoading(false);
    };

    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
        if (session?.user && isOpen) {
          setIsOpen(false);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [isOpen]);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  const requireAuth = (e: React.MouseEvent, action: () => void) => {
    if (loading) {
      e.preventDefault();
      return;
    }
    if (!user) {
      e.preventDefault();
      openModal();
    } else {
      // If action is provided, we can call it. But usually Next.js Link handles navigation if we don't preventDefault.
      if (action) action();
    }
  };

  return (
    <AuthModalContext.Provider value={{ isOpen, openModal, closeModal, user, loading, requireAuth }}>
      <React.Suspense fallback={null}>
        <LoginQueryHandler onOpenModal={() => setIsOpen(true)} />
      </React.Suspense>
      {children}
      <LoginModal isOpen={isOpen} onClose={closeModal} />
    </AuthModalContext.Provider>
  );
}

function LoginQueryHandler({ onOpenModal }: { onOpenModal: () => void }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (searchParams?.get("login") === "true") {
      onOpenModal();
      // Remove the login query param from the URL to avoid reopening on refresh
      const newSearchParams = new URLSearchParams(searchParams.toString());
      newSearchParams.delete("login");
      const newUrl = pathname + (newSearchParams.toString() ? `?${newSearchParams.toString()}` : "");
      router.replace(newUrl, { scroll: false });
    }
  }, [searchParams, pathname, router, onOpenModal]);

  return null;
}

export function useAuthModal() {
  const context = useContext(AuthModalContext);
  if (context === undefined) {
    throw new Error("useAuthModal must be used within an AuthModalProvider");
  }
  return context;
}
