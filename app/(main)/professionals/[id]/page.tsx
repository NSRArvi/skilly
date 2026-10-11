import { Metadata } from "next";
import { getProfessional } from "@/lib/actions/professional";
import ProfessionalDetailsClient from "@/components/pages/professionals/ProfessionalDetailsClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const profile = await getProfessional(id);

  if (!profile) {
    return {
      title: "Professional Not Found | Skilly",
      description: "The requested professional profile could not be found.",
    };
  }

  const name = profile.full_name || "Professional";
  const title = profile.profession || profile.categories?.name || "Verified Professional";
  const location = [
    profile.present_address?.city,
    profile.present_address?.country || "Bangladesh",
  ]
    .filter(Boolean)
    .join(", ");

  const pageTitle = `${name} - ${title} | Skilly`;
  const metaDescription =
    profile.rating_message ||
    (profile.bio
      ? profile.bio.slice(0, 160)
      : `Connect and collaborate with ${name}, ${title} based in ${location} on Skilly.`);

  const avatarUrl =
    profile.avatar_url ||
    "https://skilly.com/og-default.png";

  return {
    title: pageTitle,
    description: metaDescription,
    openGraph: {
      title: pageTitle,
      description: metaDescription,
      url: `/professionals/${id}`,
      type: "profile",
      images: [
        {
          url: avatarUrl,
          width: 800,
          height: 800,
          alt: `${name} Profile Photo`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: metaDescription,
      images: [avatarUrl],
    },
  };
}

export default async function ProfessionalPage({ params }: PageProps) {
  const { id } = await params;
  const initialProfile = await getProfessional(id);

  return (
    <ProfessionalDetailsClient
      initialProfile={initialProfile}
      profileId={id}
    />
  );
}

