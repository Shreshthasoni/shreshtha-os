import { SITE_URL } from "../src/data/profile.ts";

/**
 * Share image URL. The ?v= part changes on every build, so apps that cache link previews
 * (WhatsApp, LinkedIn, X) fetch the new image instead of reusing an old one.
 */
export const OG_IMAGE = `${SITE_URL}/og.png?v=${Date.now().toString(36)}`;
