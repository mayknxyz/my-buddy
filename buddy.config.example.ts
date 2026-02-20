// buddy.config.ts
// Instance-specific configuration for my-buddy.
// Copy this file to buddy.config.ts and customize for your instance.
// buddy.config.ts is gitignored in the public repo, tracked in instances.

export default {
  instance: {
    name: "my-buddy",
    accent: "indigo", // indigo | blue | emerald | amber | rose | violet
  },
  persona: {
    name: "Buddy",
    tone: "professional", // professional | casual | concise
    greeting: "Hey, ready to get to work.",
    boundaries: [
      "Never modify .git/ or node_modules/",
      "Always confirm before deleting content files",
    ],
  },
  r2: {
    bucket: "my-buddy-files",
    publicUrl: "https://pub-xxx.r2.dev",
  },
};
