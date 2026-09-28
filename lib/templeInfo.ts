// Single source of truth for the temple's physical location.
//
// Same shape as the Rajahmundry client's lib/templeInfo.ts, and for the same
// reasons: this address used to be hardcoded in eight places, and the copies
// had already drifted. Here the drift was worse than a stale street line --
// the JSON-LD claimed geo 17.8791762, 83.372373, which is the Vizag area some
// 130 km away, telling search engines this temple was in the wrong city. The
// "Get Directions" button was also an empty href, so it did nothing.
//
// The coordinates, place CID and street address all come from the temple's
// own Google Maps listing (maps.app.goo.gl/1vPvHh9oENiy9hSo8), which reports:
//
//   X6GX+Q86 Hare Krishna movement, kakinada, Jayendra Nagar,
//   Siddartha Nagar, Kakinada, Ramanayyapeta, Andhra Pradesh 533003
//
// The CID matters more than it looks: it binds the embed to this exact listing
// by identity, so a similarly named temple elsewhere cannot take the map's
// place, and the embed then renders the place name and address instead of a
// bare pin in the middle of a field.
//
// Kakinada and Rajahmundry share one Cloudflare account but have separate
// buckets, and each bucket has its own r2.dev subdomain -- so the R2_PUBLIC_URL
// on the server is per-site too. Don't cross them.

export const TEMPLE = {
  /** Google's listing name, including its own lower-cased spelling. */
  name: "Hare Krishna Movement, Kakinada",
  /** Short form for headings and body copy. */
  shortName: "ISKCON Kakinada",

  /** Split for display, one entry per rendered line. */
  addressLines: [
    "Hare Krishna Movement",
    "Jayendra Nagar, Siddartha Nagar",
    "Kakinada, Ramanayyapeta",
    "Andhra Pradesh - 533003",
  ],

  /** Same address on one line, for meta tags, JSON-LD and single-line slots. */
  addressOneLine:
    "Hare Krishna Movement, Jayendra Nagar, Siddartha Nagar, Kakinada, Ramanayyapeta, Andhra Pradesh - 533003",

  // Keyless Google Maps embed (no API key, no billing). Keyed on the place CID
  // rather than a text query so it cannot drift to a different listing.
  mapsEmbedUrl:
    "https://maps.google.com/maps?cid=816842323740137162&hl=en&z=16&output=embed",

  // Directions target. Keyed on place_id so "Get Directions" lands on the same
  // listing the map shows, rather than re-running a text search that could
  // resolve somewhere else.
  mapsDirectionsUrl:
    "https://www.google.com/maps/place/?q=place_id:ChIJ5EVVKQqEVNmvdKEhlZlLb0",

  coordinates: { lat: 16.9769213, lng: 82.2482771 },
  placeId: "ChIJ5EVVKQqEVNmvdKEhlZlLb0",
} as const;
