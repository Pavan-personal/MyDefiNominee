"use client";

import { ReactNode } from "react";
import Providers from "./providers";

export function ContextProvider({ children }: { children: ReactNode }) {
  return <Providers>{children}</Providers>;
}