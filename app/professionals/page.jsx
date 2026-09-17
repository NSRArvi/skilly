"use client";

import React, { useEffect, useState } from "react";
import Container from "../../components/shared/Container";
import ProfessionalsCard from "../../components/pages/home/ProfessionalsCard";
import { createClient } from "../../lib/client";

export default function ProfessionalsPage() {
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfessionals = async () => {
      const supabase = createClient();

      const { data } = await supabase
        .from("professionals")
        .select("*")
        .order("created_at", { ascending: false });

      if (data) {
        setProfessionals(data);
      }
      setLoading(false);
    };

    fetchProfessionals();
  }, []);

  return (
    <div className="min-h-screen bg-background py-16">
      <Container>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="bg-card border border-border rounded-xl p-5 flex flex-col justify-between h-[320px] animate-pulse"
              >
                <div>
                  <div className="flex gap-4 mb-6">
                    <div className="h-12 w-12 rounded-full bg-muted flex-shrink-0"></div>
                    <div className="space-y-2 flex-1 mt-1">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-6">
                    <div className="h-6 w-16 bg-muted rounded-full"></div>
                    <div className="h-6 w-20 bg-muted rounded-full"></div>
                    <div className="h-6 w-14 bg-muted rounded-full"></div>
                  </div>
                </div>
                <div>
                  <div className="h-[1px] w-full bg-border/50 mb-4" />
                  <div className="flex items-center justify-between">
                    <div className="h-5 bg-muted rounded w-1/3"></div>
                    <div className="h-9 bg-muted rounded-xl w-24"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : professionals.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {professionals.map((prof) => (
              <ProfessionalsCard key={prof.id} professional={prof} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-card border border-border rounded-3xl">
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No professionals found
            </h3>
            <p className="text-muted-foreground">
              Check back later as more experts join Skilly.
            </p>
          </div>
        )}
      </Container>
    </div>
  );
}
