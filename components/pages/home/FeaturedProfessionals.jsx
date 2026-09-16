import React from "react";
import Link from "next/link";
import ProfessionalsCard from "./ProfessionalsCard";
import Container from "../../shared/Container";

const dummyProfessionals = [
  {
    id: 1,
    name: "Amara Okafor",
    title: "Staff Engineer · ex-Stripe",
    rating: "4.9",
    reviews: "214",
    skills: ["System Design", "Go", "Distributed Systems"],
    price: "120",
    avatar: "https://i.pravatar.cc/150?u=1",
  },
  {
    id: 2,
    name: "Kenji Sato",
    title: "Principal Product Design...",
    rating: "5.0",
    reviews: "168",
    skills: ["Product Design", "Design Systems", "UX"],
    price: "95",
    avatar: "https://i.pravatar.cc/150?u=2",
  },
  {
    id: 3,
    name: "Priya Nair",
    title: "VP Marketing · ex-Hu...",
    rating: "4.8",
    reviews: "302",
    skills: ["Growth", "SEO", "Brand"],
    price: "110",
    avatar: "https://i.pravatar.cc/150?u=3",
  },
  {
    id: 4,
    name: "Daniel Weiss",
    title: "Fractional CFO · ex-Se...",
    rating: "4.9",
    reviews: "141",
    skills: ["Fundraising", "FP&A", "Modeling"],
    price: "150",
    avatar: "https://i.pravatar.cc/150?u=4",
  },
];

export default function FeaturedProfessionals() {
  return (
    <section className="py-24 w-full">
      <Container>
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <h2 className="text-primary font-semibold text-sm mb-2">
              Featured professionals
            </h2>
            <h3 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
              Learn from the best in their field
            </h3>
          </div>
          <Link
            href="/professionals"
            className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors flex items-center gap-1"
          >
            View all professionals <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {dummyProfessionals.map((prof) => (
            <ProfessionalsCard key={prof.id} professional={prof} />
          ))}
        </div>
      </Container>
    </section>
  );
}
