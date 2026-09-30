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
import { fetchCountries, fetchStates, fetchCities } from "@/lib/locations";

export default function AddressSection({
  presentAddress,
  setPresentAddress,
  permanentAddress,
  setPermanentAddress,
  isSameAddress,
  setIsSameAddress,
}) {
  const [countriesList, setCountriesList] = useState([]);
  const [presentStatesList, setPresentStatesList] = useState([]);
  const [presentCitiesList, setPresentCitiesList] = useState([]);
  const [permanentStatesList, setPermanentStatesList] = useState([]);
  const [permanentCitiesList, setPermanentCitiesList] = useState([]);

  useEffect(() => {
    let ignore = false;
    fetchCountries().then((data) => {
      if (!ignore) setCountriesList(data);
    });
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;
    if (presentAddress.countryCode) {
      fetchStates(presentAddress.countryCode).then((data) => {
        if (!ignore) setPresentStatesList(data);
      });
    }
    return () => {
      ignore = true;
    };
  }, [presentAddress.countryCode]);

  useEffect(() => {
    let ignore = false;
    if (presentAddress.countryCode && presentAddress.stateCode) {
      fetchCities(presentAddress.countryCode, presentAddress.stateCode).then((data) => {
        if (!ignore) setPresentCitiesList(data);
      });
    }
    return () => {
      ignore = true;
    };
  }, [presentAddress.countryCode, presentAddress.stateCode]);

  useEffect(() => {
    let ignore = false;
    if (permanentAddress.countryCode) {
      fetchStates(permanentAddress.countryCode).then((data) => {
        if (!ignore) setPermanentStatesList(data);
      });
    }
    return () => {
      ignore = true;
    };
  }, [permanentAddress.countryCode]);

  useEffect(() => {
    let ignore = false;
    if (permanentAddress.countryCode && permanentAddress.stateCode) {
      fetchCities(permanentAddress.countryCode, permanentAddress.stateCode).then((data) => {
        if (!ignore) setPermanentCitiesList(data);
      });
    }
    return () => {
      ignore = true;
    };
  }, [permanentAddress.countryCode, permanentAddress.stateCode]);

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
            Your physical and billing locations
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
            <Label className="text-xs font-semibold text-muted-foreground">
              Country
            </Label>
            <Select
              value={presentAddress.countryCode}
              onValueChange={(val) => {
                const countryData = countriesList.find((c) => c.isoCode === val);
                setPresentAddress({
                  ...presentAddress,
                  countryCode: val,
                  country: countryData?.name || val,
                  stateCode: "",
                  state: "",
                  city: "",
                });
              }}
            >
              <SelectTrigger className="bg-background/50 border-border text-foreground h-10 rounded-xl text-xs">
                <SelectValue placeholder="Select Country">
                  {presentAddress.country || "Select Country"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-card border-border text-foreground">
                {countriesList.map((c) => (
                  <SelectItem key={c.isoCode} value={c.isoCode}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground">
              State / Division
            </Label>
            <Select
              value={presentAddress.stateCode}
              disabled={!presentAddress.countryCode}
              onValueChange={(val) => {
                const stateData = presentStatesList.find((s) => s.isoCode === val);
                setPresentAddress({
                  ...presentAddress,
                  stateCode: val,
                  state: stateData?.name || val,
                  city: "",
                });
              }}
            >
              <SelectTrigger className="bg-background/50 border-border text-foreground h-10 rounded-xl text-xs">
                <SelectValue placeholder="Select State/Division">
                  {presentAddress.state || "Select State/Division"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-card border-border text-foreground">
                {presentStatesList.map((s) => (
                  <SelectItem key={s.isoCode} value={s.isoCode}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground">
              City
            </Label>
            <Select
              value={presentAddress.city}
              disabled={!presentAddress.stateCode}
              onValueChange={(val) => {
                setPresentAddress({
                  ...presentAddress,
                  city: val,
                });
              }}
            >
              <SelectTrigger className="bg-background/50 border-border text-foreground h-10 rounded-xl text-xs">
                <SelectValue placeholder="Select City">
                  {presentAddress.city || "Select City"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-card border-border text-foreground">
                {presentCitiesList.map((c) => (
                  <SelectItem key={c.name} value={c.name}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground">
              Zip / Postal Code
            </Label>
            <Input
              value={presentAddress.zipcode}
              onChange={(e) =>
                setPresentAddress({
                  ...presentAddress,
                  zipcode: e.target.value,
                })
              }
              placeholder="E.g. 1207"
              className="bg-background/50 border-border text-foreground h-10 rounded-xl text-xs"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label className="text-xs font-semibold text-muted-foreground">
              Full Street Address
            </Label>
            <Input
              value={presentAddress.fullAddress}
              onChange={(e) =>
                setPresentAddress({
                  ...presentAddress,
                  fullAddress: e.target.value,
                })
              }
              placeholder="E.g. House 12, Road 4, Sector 7, Uttara"
              className="bg-background/50 border-border text-foreground h-10 rounded-xl text-xs"
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
              <Label className="text-xs font-semibold text-muted-foreground">
                Country
              </Label>
              <Select
                value={permanentAddress.countryCode}
                onValueChange={(val) => {
                  const countryData = countriesList.find((c) => c.isoCode === val);
                  setPermanentAddress({
                    ...permanentAddress,
                    countryCode: val,
                    country: countryData?.name || val,
                    stateCode: "",
                    state: "",
                    city: "",
                  });
                }}
              >
                <SelectTrigger className="bg-background/50 border-border text-foreground h-10 rounded-xl text-xs">
                  <SelectValue placeholder="Select Country">
                    {permanentAddress.country || "Select Country"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-card border-border text-foreground">
                  {countriesList.map((c) => (
                    <SelectItem key={c.isoCode} value={c.isoCode}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">
                State / Division
              </Label>
              <Select
                value={permanentAddress.stateCode}
                disabled={!permanentAddress.countryCode}
                onValueChange={(val) => {
                  const stateData = permanentStatesList.find((s) => s.isoCode === val);
                  setPermanentAddress({
                    ...permanentAddress,
                    stateCode: val,
                    state: stateData?.name || val,
                    city: "",
                  });
                }}
              >
                <SelectTrigger className="bg-background/50 border-border text-foreground h-10 rounded-xl text-xs">
                  <SelectValue placeholder="Select State/Division">
                    {permanentAddress.state || "Select State/Division"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-card border-border text-foreground">
                  {permanentStatesList.map((s) => (
                    <SelectItem key={s.isoCode} value={s.isoCode}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">
                City
              </Label>
              <Select
                value={permanentAddress.city}
                disabled={!permanentAddress.stateCode}
                onValueChange={(val) => {
                  setPermanentAddress({
                    ...permanentAddress,
                    city: val,
                  });
                }}
              >
                <SelectTrigger className="bg-background/50 border-border text-foreground h-10 rounded-xl text-xs">
                  <SelectValue placeholder="Select City">
                    {permanentAddress.city || "Select City"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-card border-border text-foreground">
                  {permanentCitiesList.map((c) => (
                    <SelectItem key={c.name} value={c.name}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">
                Zip / Postal Code
              </Label>
              <Input
                value={permanentAddress.zipcode}
                onChange={(e) =>
                  setPermanentAddress({
                    ...permanentAddress,
                    zipcode: e.target.value,
                  })
                }
                placeholder="E.g. 1207"
                className="bg-background/50 border-border text-foreground h-10 rounded-xl text-xs"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-xs font-semibold text-muted-foreground">
                Full Street Address
              </Label>
              <Input
                value={permanentAddress.fullAddress}
                onChange={(e) =>
                  setPermanentAddress({
                    ...permanentAddress,
                    fullAddress: e.target.value,
                  })
                }
                placeholder="Permanent street address"
                className="bg-background/50 border-border text-foreground h-10 rounded-xl text-xs"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
