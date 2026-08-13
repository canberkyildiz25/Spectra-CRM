const path = require('path');

/* Tailwind discovers `tailwind.config.js` relative to the working directory,
 * not to this file. Started from the monorepo root the lookup misses, Tailwind
 * silently falls back to its default config, and the build emits preflight with
 * no utilities at all — CSS that looks broken rather than misconfigured.
 * Naming the path removes the dependency on where the process was started. */
module.exports = {
  plugins: {
    tailwindcss: { config: path.join(__dirname, 'tailwind.config.js') },
    autoprefixer: {},
  },
};
