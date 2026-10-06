"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapPin } from "lucide-react";
import { fetchStates, fetchCities } from "@/lib/locations";

export default function AddressSection({
  presentAddress,
  setPresentAddress,
  permanentAddress,
  setPermanentAddress,
  isSameAddress,
  setIsSameAddress,
}) {
  const [presentStatesList, setPresentStatesList] = useState([]);
  const [presentCitiesList, setPresentCitiesList] = useState([]);
  const [permanentStatesList, setPermanentStatesList] = useState([]);
  const [permanentCitiesList, setPermanentCitiesList] = useState([]);

  useEffect(() => {
    fetchStates("BD").then((data) => {
      setPresentStatesList(data);
      setPermanentStatesList(data);
    });
  }, []);

  useEffect(() => {
    fetchCities("BD", presentAddress.stateCode || presentAddress.state).then((data) => {
      setPresentCitiesList(data);
    });
  }, [presentAddress.stateCode, presentAddress.state]);

  useEffect(() => {
    fetchCities("BD", permanentAddress.stateCode || permanentAddress.state).then((data) => {
      setPermanentCitiesList(data);
    });
  }, [permanentAddress.stateCode, permanentAddress.state]);

  return (
    <div className="bg-card border border-border rounded-2xl p-6 md:p-7 space-y-6 shadow-sm">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
          <MapPin className="w-4 h-4" />
        </div>
        <div>
          <h2 className="text-lg md:text-xl font-bold text-foreground tracking-tight">
            Address Information
          </h2>
          <p className="text-xs md:text-sm text-muted-foreground">
            Your physical and billing locations in Bangladesh
          </p>
        </div>
      </div>

      {/* Present Address */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-foreground border-b border-border/70 pb-2 flex items-center gap-2">
          Present Address
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">
              Country
            </Label>
            <div className="flex items-center gap-2 h-10 px-3 rounded-xl bg-muted/40 border border-border text-foreground text-sm font-medium">
              <span className="text-sm">🇧🇩</span>
              <span>Bangladesh</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">
              Division
            </Label>
            <Select
              value={presentAddress.stateCode || presentAddress.state}
              onValueChange={(val) => {
                const stateData = presentStatesList.find(
                  (s) => s.isoCode === val || s.name === val
                );
                setPresentAddress({
                  ...presentAddress,
                  countryCode: "BD",
                  country: "Bangladesh",
                  stateCode: stateData?.isoCode || val,
                  state: stateData?.name || val,
                  city: "",
                });
              }}
            >
              <SelectTrigger className="bg-background/50 border-border text-foreground h-10 rounded-xl text-sm">
                <SelectValue placeholder="Select Division">
                  {presentAddress.state || "Select Division"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-card border-border text-foreground">
                {presentStatesList.map((s) => (
                  <SelectItem key={s.isoCode} value={s.isoCode}>
                    {s.name} {s.bnName ? `(${s.bnName})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">
              District / City
            </Label>
            <Select
              value={presentAddress.city}
              onValueChange={(val) => {
                setPresentAddress({
                  ...presentAddress,
                  city: val,
                });
              }}
            >
              <SelectTrigger className="bg-background/50 border-border text-foreground h-10 rounded-xl text-sm">
                <SelectValue placeholder="Select District">
                  {presentAddress.city || "Select District"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-card border-border text-foreground max-h-60">
                {presentCitiesList.map((c) => (
                  <SelectItem key={c.name} value={c.name}>
                    {c.name} {c.bnName ? `(${c.bnName})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">
              Zip / Postal Code
            </Label>
            <Input
              value={presentAddress.zipcode || ""}
              onChange={(e) =>
                setPresentAddress({
                  ...presentAddress,
                  zipcode: e.target.value,
                })
              }
              placeholder="E.g. 1207"
              className="bg-background/50 border-border text-foreground h-10 rounded-xl text-sm"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label className="text-xs font-semibold text-foreground">
              Full Street Address
            </Label>
            <Input
              value={presentAddress.fullAddress || ""}
              onChange={(e) =>
                setPresentAddress({
                  ...presentAddress,
                  fullAddress: e.target.value,
                })
              }
              placeholder="E.g. House 12, Road 4, Sector 7, Uttara"
              className="bg-background/50 border-border text-foreground h-10 rounded-xl text-sm"
            />
          </div>
        </div>
      </div>

      {/* Permanent Address */}
      <div className="space-y-4 pt-2 border-t border-border/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border/70 pb-2 gap-2">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            Permanent Address
          </h3>
          <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
            <input
              type="checkbox"
              checked={isSameAddress}
              onChange={(e) => setIsSameAddress(e.target.checked)}
              className="rounded border-border text-primary focus:ring-primary h-3.5 w-3.5"
            />
            Same as Present Address
          </label>
        </div>

        {!isSameAddress && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                Country
              </Label>
              <div className="flex items-center gap-2 h-10 px-3 rounded-xl bg-muted/40 border border-border text-foreground text-sm font-medium">
                <span className="text-sm">🇧🇩</span>
                <span>Bangladesh</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                Division
              </Label>
              <Select
                value={permanentAddress.stateCode || permanentAddress.state}
                onValueChange={(val) => {
                  const stateData = permanentStatesList.find(
                    (s) => s.isoCode === val || s.name === val
                  );
                  setPermanentAddress({
                    ...permanentAddress,
                    countryCode: "BD",
                    country: "Bangladesh",
                    stateCode: stateData?.isoCode || val,
                    state: stateData?.name || val,
                    city: "",
                  });
                }}
              >
                <SelectTrigger className="bg-background/50 border-border text-foreground h-10 rounded-xl text-sm">
                  <SelectValue placeholder="Select Division">
                    {permanentAddress.state || "Select Division"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-card border-border text-foreground">
                  {permanentStatesList.map((s) => (
                    <SelectItem key={s.isoCode} value={s.isoCode}>
                      {s.name} {s.bnName ? `(${s.bnName})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                District / City
              </Label>
              <Select
                value={permanentAddress.city}
                onValueChange={(val) => {
                  setPermanentAddress({
                    ...permanentAddress,
                    city: val,
                  });
                }}
              >
                <SelectTrigger className="bg-background/50 border-border text-foreground h-10 rounded-xl text-sm">
                  <SelectValue placeholder="Select District">
                    {permanentAddress.city || "Select District"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-card border-border text-foreground max-h-60">
                  {permanentCitiesList.map((c) => (
                    <SelectItem key={c.name} value={c.name}>
                      {c.name} {c.bnName ? `(${c.bnName})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                Zip / Postal Code
              </Label>
              <Input
                value={permanentAddress.zipcode || ""}
                onChange={(e) =>
                  setPermanentAddress({
                    ...permanentAddress,
                    zipcode: e.target.value,
                  })
                }
                placeholder="E.g. 1207"
                className="bg-background/50 border-border text-foreground h-10 rounded-xl text-sm"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-xs font-semibold text-foreground">
                Full Street Address
              </Label>
              <Input
                value={permanentAddress.fullAddress || ""}
                onChange={(e) =>
                  setPermanentAddress({
                    ...permanentAddress,
                    fullAddress: e.target.value,
                  })
                }
                placeholder="Permanent street address"
                className="bg-background/50 border-border text-foreground h-10 rounded-xl text-sm"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
