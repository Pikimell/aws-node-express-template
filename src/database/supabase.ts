import { createClient } from "@supabase/supabase-js";
import type { RequestHandler } from "express";

import { SUPABASE_SERVICE_ROLE_KEY, SUPABASE_URL } from "../helpers/constants.js";

export const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

let isInitialized = false;

export const initSupabase: RequestHandler = async (_req, _res, next) => {
  if (isInitialized) {
    next();
    return;
  }

  try {
    const { error } = await supabase.from("users").select("id").limit(1);

    if (error) throw error;

    isInitialized = true;
    console.log("Supabase connection successfully established!");
    next();
  } catch (e) {
    console.log("Error while setting up Supabase connection", e);
    next(e);
  }
};
