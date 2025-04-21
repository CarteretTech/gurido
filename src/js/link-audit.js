/**
 * link-audit.js
 * This script performs a post-build analysis of all links in the site.
 * It identifies:
 * - All internal and external links
 * - Their source file and line number
 * - Their destination
 * - Whether the link is valid (for internal links)
 * 
 * This helps with SEO by ensuring all internal links are valid and
 * identifying any broken links or navigation issues.
 */

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
// Fix the import statement for cheerio to use named import instead of default import
import * as cheerio from 'cheerio';

// Configuration
const config = {
  buildDir: path.join(process.cwd(), 'dist'),
  outputFile: path.join(process.cwd(), 'link-audit-report.json'),
  outputConsole: true,
  checkExternal: false, // Set to true to validate external URLs (requires network requests)
  excludePatterns: [
    /^mailto:/,
    /^tel:/,
    /^#/,
    /^https:\/\/unpkg.com/,
    /^javascript:/
  ]
};

// Data structures
const links = [];
const pages = new Map();
const brokenLinks = [];
const warningLinks = [];
const linksByDestination = new Map();

/**
 * Extract the original source file and line number from HTML comment
 * @param {string} html - The HTML content
 * @param {string} linkSelector - CSS selector that targeted the link
 * @returns {Object|null} Source information if available
 */
function extractSourceInfo(html, linkSelector) {
  // Look for Astro debug comments that contain source information
  // Format: <!-- /src/pages/index.astro:10:5 -->
  const regex = /<!--\s*(\/src\/.*?):(\d+):(\d+)\s*-->/g;
  let match;
  let closestDistance = Infinity;
  let closestSource = null;
  
  const linkIndex = html.indexOf(linkSelector);
  
  while ((match = regex.exec(html)) !== null) {
    const commentIndex = match.index;
    const distance = Math.abs(linkIndex - commentIndex);
    
    if (distance < closestDistance) {
      closestDistance = distance;
      closestSource = {
        file: match[1],
        line: parseInt(match[2], 10),
        column: parseInt(match[3], 10)
      };
    }
  }
  
  return closestSource;
}

/**
 * Determine if a URL is internal or external
 * @param {string} href - The URL to check
 * @returns {boolean} True if internal, false if external
 */
function isInternalLink(href) {
  if (!href) return false;
  
  // Skip excluded patterns
  for (const pattern of config.excludePatterns) {
    if (pattern.test(href)) {
      return false; 
    }
  }
  
  return !href.startsWith('http') && !href.startsWith('//');
}

/**
 * Normalize a URL for comparison
 * @param {string} url - The URL to normalize
 * @returns {string} Normalized URL
 */
function normalizeUrl(url) {
  if (!url) return '';
  
  // Remove trailing slash
  url = url.replace(/\/$/, '');
  
  // Remove hash and query params for page existence checks
  url = url.split('#')[0].split('?')[0];
  
  // Handle empty URLs (self-references)
  if (url === '') {
    return '/';
  }
  
  return url;
}

/**
 * Check if a file exists in the build directory
 * @param {string} href - The URL to check
 * @returns {boolean} Whether the file exists
 */
function checkInternalLinkExists(href) {
  href = normalizeUrl(href);
  
  // Handle root URL
  if (href === '/') {
    return fs.existsSync(path.join(config.buildDir, 'index.html'));
  }
  
  // Remove leading slash
  if (href.startsWith('/')) {
    href = href.substring(1);
  }
  
  // Check if the file exists as-is
  if (fs.existsSync(path.join(config.buildDir, href))) {
    return true;
  }
  
  // Check if it exists with index.html appended
  if (fs.existsSync(path.join(config.buildDir, href, 'index.html'))) {
    return true;
  }
  
  // Check if it exists with .html appended
  if (!href.endsWith('.html') && fs.existsSync(path.join(config.buildDir, `${href}.html`))) {
    return true;
  }
  
  return false;
}

/**
 * Process a single HTML file
 * @param {string} filePath - Path to the HTML file
 */
function processHtmlFile(filePath) {
  try {
    const relativePath = path.relative(config.buildDir, filePath);
    const html = fs.readFileSync(filePath, 'utf8');
    const $ = cheerio.load(html);
    
    // Store page data
    const pageUrl = '/' + relativePath.replace(/index\.html$/, '').replace(/\.html$/, '');
    pages.set(pageUrl, {
      file: filePath,
      title: $('title').text(),
      description: $('meta[name="description"]').attr('content') || '',
      inboundLinks: []
    });
    
    // Find all links
    $('a').each((i, el) => {
      const $el = $(el);
      const href = $el.attr('href');
      
      if (!href) return;
      
      const linkText = $el.text().trim();
      const isInternal = isInternalLink(href);
      
      // Create link object
      const link = {
        source: {
          page: pageUrl,
          file: filePath,
          html: $.html(el)
        },
        href,
        text: linkText,
        isInternal,
        destination: normalizeUrl(href)
      };
      
      // Get source info if available
      const sourceInfo = extractSourceInfo(html, $.html(el));
      if (sourceInfo) {
        link.source.originalFile = sourceInfo.file;
        link.source.line = sourceInfo.line;
        link.source.column = sourceInfo.column;
      }
      
      // Check if internal link is valid
      if (isInternal && href !== '#') {
        const normalizedHref = normalizeUrl(href);
        link.exists = checkInternalLinkExists(normalizedHref);
        
        if (!link.exists) {
          brokenLinks.push(link);
        }
      }
      
      // Add link to main collection
      links.push(link);
      
      // Group links by destination for inbound link tracking
      if (isInternal) {
        const dest = normalizeUrl(href);
        if (!linksByDestination.has(dest)) {
          linksByDestination.set(dest, []);
        }
        linksByDestination.get(dest).push(link);
      }
    });
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
  }
}

/**
 * Scan the build directory for HTML files
 * @param {string} dir - Directory to scan
 */
function scanDirectory(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const file of files) {
    const filePath = path.join(dir, file.name);
    
    if (file.isDirectory()) {
      scanDirectory(filePath);
    } else if (file.name.endsWith('.html')) {
      processHtmlFile(filePath);
    }
  }
}

/**
 * Add inbound link data to pages
 */
function processInboundLinks() {
  // For each page we found
  pages.forEach((page, url) => {
    // Find links that point to this page
    const normalizedUrl = normalizeUrl(url);
    const inboundLinks = linksByDestination.get(normalizedUrl) || [];
    
    // Add inbound links to page data
    page.inboundLinks = inboundLinks;
  });
  
  // Find orphan pages (no inbound links)
  pages.forEach((page, url) => {
    if (page.inboundLinks.length === 0 && url !== '/') {
      warningLinks.push({
        type: 'orphan-page',
        url,
        file: page.file,
        title: page.title
      });
    }
  });
}

/**
 * Generate the report
 */
function generateReport() {
  const report = {
    summary: {
      totalPages: pages.size,
      totalLinks: links.length,
      internalLinks: links.filter(link => link.isInternal).length,
      externalLinks: links.filter(link => !link.isInternal).length,
      brokenLinks: brokenLinks.length,
      warnings: warningLinks.length
    },
    brokenLinks,
    warnings: warningLinks,
    pages: Object.fromEntries(pages),
    links: links,
  };
  
  // Write report to file
  fs.writeFileSync(config.outputFile, JSON.stringify(report, null, 2));
  
  if (config.outputConsole) {
    console.log('\n');
    console.log(chalk.bold.blue('===== LINK AUDIT REPORT ====='));
    console.log('\n');
    console.log(chalk.bold('Pages:'), chalk.green(report.summary.totalPages));
    console.log(chalk.bold('Total Links:'), chalk.green(report.summary.totalLinks));
    console.log(chalk.bold('Internal Links:'), chalk.green(report.summary.internalLinks));
    console.log(chalk.bold('External Links:'), chalk.green(report.summary.externalLinks));
    
    if (brokenLinks.length > 0) {
      console.log('\n');
      console.log(chalk.bold.red(`Broken Links: ${brokenLinks.length}`));
      brokenLinks.forEach(link => {
        console.log('\n');
        console.log(chalk.red(`❌ ${link.href}`));
        console.log(chalk.gray(`   From: ${link.source.page}`));
        if (link.source.originalFile) {
          console.log(chalk.gray(`   Source: ${link.source.originalFile}:${link.source.line}`));
        }
        console.log(chalk.gray(`   Text: "${link.text}"`));
      });
    } else {
      console.log(chalk.bold.green('\n✓ No broken internal links found!'));
    }
    
    if (warningLinks.length > 0) {
      console.log('\n');
      console.log(chalk.bold.yellow(`Warnings: ${warningLinks.length}`));
      const orphanPages = warningLinks.filter(w => w.type === 'orphan-page');
      if (orphanPages.length > 0) {
        console.log(chalk.yellow(`\n⚠️ Orphan Pages: ${orphanPages.length}`));
        orphanPages.forEach(page => {
          console.log(chalk.yellow(`   ${page.url} (${page.title})`));
        });
      }
    }
    
    console.log('\n');
    console.log(chalk.gray(`Full report saved to: ${config.outputFile}`));
    console.log('\n');
  }
}

/**
 * Run the link audit
 */
function runLinkAudit() {
  console.log(chalk.blue('Starting link audit...'));
  console.log(chalk.gray(`Scanning: ${config.buildDir}`));
  
  // Verify the build directory exists
  if (!fs.existsSync(config.buildDir)) {
    console.error(chalk.red(`Build directory not found: ${config.buildDir}`));
    console.error(chalk.red('Please run the build command first.'));
    process.exit(1);
  }
  
  // Scan all HTML files
  scanDirectory(config.buildDir);
  
  // Process inbound links
  processInboundLinks();
  
  // Generate the report
  generateReport();
}

// Export the main function
export default runLinkAudit;

// Allow running directly with Node
if (typeof require !== 'undefined' && require.main === module) {
  runLinkAudit();
}