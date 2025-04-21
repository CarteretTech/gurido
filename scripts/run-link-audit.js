/**
 * run-link-audit.js
 * Script runner that imports and executes the link audit
 * Used as a post-build script to automatically check all links
 */

import runLinkAudit from '../src/js/link-audit.js';

// Execute the link audit
console.log('Running post-build link audit...');
runLinkAudit();