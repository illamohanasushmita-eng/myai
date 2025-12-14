"use client";

import React, { useEffect, useState } from "react";
import InsightsPanel from "@/components/InsightsPanel";

export default function InsightsClientWrapper() {
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    try {
      const id = localStorage.getItem("userId") || "";
      setUserId(id);
    } catch (err) {
      console.warn("Unable to read userId from localStorage", err);
    }
  }, []);

  return <InsightsPanel userId={userId} />;
}
