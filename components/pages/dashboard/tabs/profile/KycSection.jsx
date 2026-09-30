"use client";

import React, { useState, useRef } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  FileText,
  Loader2,
  UploadCloud,
  Lock,
} from "lucide-react";
import { toast } from "sonner";
import { uploadKycDocument } from "@/lib/actions/media";

export default function KycSection({
  idType,
  setIdType,
  frontId,
  setFrontId,
  backId,
  setBackId,
  isVerified,
  onProfileUpdate,
}) {
  const [uploadingFront, setUploadingFront] = useState(false);
  const [uploadingBack, setUploadingBack] = useState(false);
  const frontInputRef = useRef(null);
  const backInputRef = useRef(null);

  const handleFrontUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size exceeds 10MB limit.");
      return;
    }

    setUploadingFront(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("side", "front");
      formData.append("idType", idType);

      const res = await uploadKycDocument(formData);

      if (!res.success) {
        toast.error(res.error || "Front upload failed.");
      } else {
        setFrontId({
          name: file.name,
          previewUrl: res.previewUrl,
          storageUrl: res.storageUrl,
          verified: isVerified,
        });
        toast.success("Front of document uploaded and secured!");
        if (onProfileUpdate) onProfileUpdate();
      }
    } catch (err) {
      console.error("Unexpected error during front upload:", err);
      toast.error("An unexpected error occurred while uploading.");
    } finally {
      setUploadingFront(false);
      if (frontInputRef.current) frontInputRef.current.value = "";
    }
  };

  const handleBackUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size exceeds 10MB limit.");
      return;
    }

    setUploadingBack(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("side", "back");
      formData.append("idType", idType);

      const res = await uploadKycDocument(formData);

      if (!res.success) {
        toast.error(res.error || "Back upload failed.");
      } else {
        const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
        setBackId({
          name: file.name,
          size: `${sizeMB} MB`,
          previewUrl: res.previewUrl,
          storageUrl: res.storageUrl,
        });
        toast.success("Back of document uploaded successfully!");
        if (onProfileUpdate) onProfileUpdate();
      }
    } catch (err) {
      console.error("Unexpected error during back upload:", err);
      toast.error("An unexpected error occurred while uploading.");
    } finally {
      setUploadingBack(false);
      if (backInputRef.current) backInputRef.current.value = "";
    }
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6 space-y-5 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary flex-shrink-0 mt-0.5">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h3 className="font-bold text-foreground text-base tracking-tight">
            Identity Verification
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Verify your government-issued identity to receive the Verified
            Talent badge and unlock instant payouts.
          </p>
        </div>
      </div>

      {/* Document Type Dropdown */}
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-muted-foreground">
          Document Type
        </Label>
        <Select value={idType} onValueChange={setIdType}>
          <SelectTrigger className="bg-background/50 border-border text-foreground focus:border-primary focus:ring-1 focus:ring-primary h-10 rounded-xl text-xs">
            <SelectValue placeholder="Select ID Type" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border text-foreground">
            <SelectItem value="nid">National ID / NID</SelectItem>
            <SelectItem value="passport">Passport</SelectItem>
            <SelectItem value="driving">Driving License</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Front of Document */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-semibold text-muted-foreground">
            Front of Document
          </Label>
          {frontId && (
            <span
              className={`text-[11px] font-semibold flex items-center gap-1 ${
                isVerified ? "text-primary" : "text-amber-500"
              }`}
            >
              {isVerified ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Verified & Locked
                </>
              ) : (
                <>
                  <Clock className="w-3.5 h-3.5" />
                  Uploaded • Pending Review
                </>
              )}
            </span>
          )}
        </div>

        {frontId ? (
          <div className="bg-background/60 border border-border rounded-xl p-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 overflow-hidden">
              {frontId.previewUrl ? (
                <a
                  href={frontId.previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg overflow-hidden border border-border flex-shrink-0 bg-muted block hover:opacity-80 transition-opacity"
                  title="Click to view full size"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={frontId.previewUrl}
                    alt="Front document preview"
                    className="w-full h-full object-cover"
                  />
                </a>
              ) : (
                <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary flex-shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
              )}
              <div className="overflow-hidden">
                {frontId.previewUrl ? (
                  <a
                    href={frontId.previewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-medium text-foreground hover:text-primary underline truncate block"
                    title="Click to view uploaded front document"
                  >
                    {frontId.name || "National ID (Front)"}
                  </a>
                ) : (
                  <p className="text-xs font-medium text-foreground truncate">
                    {frontId.name || "National ID (Front)"}
                  </p>
                )}
                <p className="text-[11px] text-muted-foreground">
                  {isVerified
                    ? "Uploaded & Verified • Locked"
                    : "Uploaded • Editable till verified"}
                </p>
              </div>
            </div>

            {isVerified ? (
              <span className="text-[11px] font-semibold text-primary px-2 py-0.5 rounded bg-primary/10 border border-primary/20">
                Locked
              </span>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => frontInputRef.current?.click()}
                  disabled={uploadingFront}
                  className="text-xs text-primary hover:underline font-semibold"
                >
                  Change
                </button>
                <input
                  ref={frontInputRef}
                  type="file"
                  className="hidden"
                  accept="image/*,.pdf"
                  onChange={handleFrontUpload}
                />
              </div>
            )}
          </div>
        ) : uploadingFront ? (
          <div className="border border-border bg-background/30 rounded-xl p-6 flex flex-col items-center justify-center text-center">
            <Loader2 className="w-6 h-6 text-primary animate-spin mb-2" />
            <p className="text-xs font-semibold text-foreground">
              Uploading Front Document...
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Encrypting and uploading to secure KYC storage
            </p>
          </div>
        ) : (
          <div
            onClick={() => frontInputRef.current?.click()}
            className="border-2 border-dashed border-border hover:border-primary/50 bg-background/30 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all group"
          >
            <input
              ref={frontInputRef}
              type="file"
              className="hidden"
              accept="image/*,.pdf"
              onChange={handleFrontUpload}
            />
            <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center mb-2 group-hover:bg-primary/10 group-hover:text-primary transition-colors text-muted-foreground">
              <UploadCloud className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-foreground">
              Upload Document Front
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              PNG, JPG, or PDF (max 10MB)
            </p>
            <span className="text-xs font-semibold text-primary hover:underline mt-2">
              Browse Files
            </span>
          </div>
        )}
      </div>

      {/* Back of Document */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-semibold text-muted-foreground">
            Back of Document
          </Label>
          {backId && (
            <span
              className={`text-[11px] font-semibold flex items-center gap-1 ${
                isVerified ? "text-primary" : "text-amber-500"
              }`}
            >
              {isVerified ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Verified & Locked
                </>
              ) : (
                <>
                  <Clock className="w-3.5 h-3.5" />
                  Uploaded • Pending Review
                </>
              )}
            </span>
          )}
        </div>

        {backId ? (
          <div className="bg-background/60 border border-border rounded-xl p-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 overflow-hidden">
              {backId.previewUrl ? (
                <a
                  href={backId.previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg overflow-hidden border border-border flex-shrink-0 bg-muted block hover:opacity-80 transition-opacity"
                  title="Click to view full size"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={backId.previewUrl}
                    alt="Back document preview"
                    className="w-full h-full object-cover"
                  />
                </a>
              ) : (
                <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary flex-shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
              )}
              <div className="overflow-hidden">
                {backId.previewUrl ? (
                  <a
                    href={backId.previewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-medium text-foreground hover:text-primary underline truncate block"
                    title="Click to view uploaded back document"
                  >
                    {backId.name || "National ID (Back)"}
                  </a>
                ) : (
                  <p className="text-xs font-medium text-foreground truncate">
                    {backId.name || "National ID (Back)"}
                  </p>
                )}
                <p className="text-[11px] text-muted-foreground">
                  {backId.size ? `${backId.size} • ` : ""}
                  {isVerified
                    ? "Uploaded & Verified • Locked"
                    : "Uploaded • Editable till verified"}
                </p>
              </div>
            </div>

            {isVerified ? (
              <span className="text-[11px] font-semibold text-primary px-2 py-0.5 rounded bg-primary/10 border border-primary/20">
                Locked
              </span>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => backInputRef.current?.click()}
                  disabled={uploadingBack}
                  className="text-xs text-primary hover:underline font-semibold"
                >
                  Change
                </button>
                <input
                  ref={backInputRef}
                  type="file"
                  className="hidden"
                  accept="image/*,.pdf"
                  onChange={handleBackUpload}
                />
              </div>
            )}
          </div>
        ) : uploadingBack ? (
          <div className="border border-border bg-background/30 rounded-xl p-6 flex flex-col items-center justify-center text-center">
            <Loader2 className="w-6 h-6 text-primary animate-spin mb-2" />
            <p className="text-xs font-semibold text-foreground">
              Uploading Back Document...
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Encrypting and uploading to secure KYC storage
            </p>
          </div>
        ) : (
          <div
            onClick={() => backInputRef.current?.click()}
            className="border-2 border-dashed border-border hover:border-primary/50 bg-background/30 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all group"
          >
            <input
              ref={backInputRef}
              type="file"
              className="hidden"
              accept="image/*,.pdf"
              onChange={handleBackUpload}
            />
            <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center mb-2 group-hover:bg-primary/10 group-hover:text-primary transition-colors text-muted-foreground">
              <UploadCloud className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-foreground">
              Upload Document Reverse
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              PNG, JPG, or PDF (max 10MB)
            </p>
            <span className="text-xs font-semibold text-primary hover:underline mt-2">
              Browse Files
            </span>
          </div>
        )}
      </div>

      {/* Institutional AES Storage Callout */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-3.5 flex items-start gap-3">
        <Lock className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <h4 className="text-xs font-bold text-foreground">
            Institutional 256-Bit AES Storage
          </h4>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Data is encrypted in compliant cold storage vaults. Never shared
            with third parties or advertisers.
          </p>
        </div>
      </div>
    </div>
  );
}
