const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

// Configuration for placeholder images
const config = {
  locations: [
    { name: 'new-bern', width: 800, height: 600, color: '#4285F4' },
    { name: 'greenville', width: 800, height: 600, color: '#34A853' },
    { name: 'kinston', width: 800, height: 600, color: '#FBBC05' },
    { name: 'wilmington', width: 800, height: 600, color: '#EA4335' },
    { name: 'jacksonville', width: 800, height: 600, color: '#5F6368' },
    { name: 'morehead-city', width: 800, height: 600, color: '#1A73E8' },
  ],
  services: [
    { name: 'seo-audit', width: 600, height: 400, color: '#673AB7' },
    { name: 'local-seo', width: 600, height: 400, color: '#3F51B5' },
    { name: 'content-marketing', width: 600, height: 400, color: '#2196F3' },
    { name: 'link-building', width: 600, height: 400, color: '#03A9F4' },
    { name: 'technical-seo', width: 600, height: 400, color: '#00BCD4' },
    { name: 'conversion-optimization', width: 600, height: 400, color: '#009688' },
    { name: 'analytics', width: 600, height: 400, color: '#4CAF50' },
    { name: 'ppc-management', width: 600, height: 400, color: '#8BC34A' },
  ],
  blog: {
    featured: { width: 1200, height: 630, color: '#FF5722' },
    thumbnail: { width: 400, height: 300, color: '#FF9800' }
  },
  team: [
    { name: 'john-doe', width: 400, height: 400, color: '#795548' },
    { name: 'jane-smith', width: 400, height: 400, color: '#9E9E9E' },
    { name: 'alex-johnson', width: 400, height: 400, color: '#607D8B' },
  ],
  testimonials: [
    { name: 'testimonial-1', width: 300, height: 300, color: '#E91E63' },
    { name: 'testimonial-2', width: 300, height: 300, color: '#9C27B0' },
    { name: 'testimonial-3', width: 300, height: 300, color: '#673AB7' },
  ],
  clients: [
    { name: 'client-1', width: 200, height: 100, color: '#3F51B5' },
    { name: 'client-2', width: 200, height: 100, color: '#2196F3' },
    { name: 'client-3', width: 200, height: 100, color: '#03A9F4' },
    { name: 'client-4', width: 200, height: 100, color: '#00BCD4' },
    { name: 'client-5', width: 200, height: 100, color: '#009688' },
  ],
};

// Make sure directories exist
const directories = [
  'public/images/locations',
  'public/images/services',
  'public/images/blog',
  'public/images/team',
  'public/images/testimonials',
  'public/images/clients'
];

directories.forEach(dir => {
  const fullPath = path.resolve(__dirname, '..', dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`Created directory: ${fullPath}`);
  }
});

// Function to generate a placeholder image
function generatePlaceholder({ name, width, height, color, directory, text }) {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  // Background color
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, width, height);
  
  // Add text
  const displayText = text || name;
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `bold ${Math.floor(height / 10)}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(displayText, width / 2, height / 2);
  
  // Generate a grid pattern for visual interest
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 1;
  
  // Horizontal lines
  for (let y = 0; y < height; y += 20) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
  
  // Vertical lines
  for (let x = 0; x < width; x += 20) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  
  // Save image
  const buffer = canvas.toBuffer('image/jpeg');
  const filePath = path.resolve(__dirname, '..', directory, `${name}.jpg`);
  fs.writeFileSync(filePath, buffer);
  console.log(`Generated: ${filePath}`);
}

// Generate location images
console.log("\nGenerating location images...");
config.locations.forEach(location => {
  generatePlaceholder({
    ...location,
    directory: 'public/images/locations',
    text: `Location: ${location.name.replace(/-/g, ' ').toUpperCase()}`
  });
});

// Generate service images
console.log("\nGenerating service images...");
config.services.forEach(service => {
  generatePlaceholder({
    ...service,
    directory: 'public/images/services',
    text: `Service: ${service.name.replace(/-/g, ' ').toUpperCase()}`
  });
});

// Generate blog images (for demo posts)
console.log("\nGenerating blog images...");
const blogPosts = [
  'local-seo-tips', 
  'google-algorithm-update', 
  'content-strategy', 
  'link-building-guide',
  'technical-seo-checklist',
  'voice-search-optimization'
];

blogPosts.forEach((post, index) => {
  // Featured image
  generatePlaceholder({
    name: `${post}-featured`,
    width: config.blog.featured.width,
    height: config.blog.featured.height,
    color: config.blog.featured.color,
    directory: 'public/images/blog',
    text: `BLOG: ${post.replace(/-/g, ' ').toUpperCase()}`
  });
  
  // Thumbnail image
  generatePlaceholder({
    name: `${post}-thumb`,
    width: config.blog.thumbnail.width,
    height: config.blog.thumbnail.height,
    color: config.blog.thumbnail.color,
    directory: 'public/images/blog',
    text: `BLOG: ${post.replace(/-/g, ' ').toUpperCase()}`
  });
});

// Generate team member images
console.log("\nGenerating team member images...");
config.team.forEach(member => {
  generatePlaceholder({
    ...member,
    directory: 'public/images/team',
    text: `TEAM: ${member.name.replace(/-/g, ' ').toUpperCase()}`
  });
});

// Generate testimonial images
console.log("\nGenerating testimonial images...");
config.testimonials.forEach(testimonial => {
  generatePlaceholder({
    ...testimonial,
    directory: 'public/images/testimonials',
    text: `TESTIMONIAL`
  });
});

// Generate client logos
console.log("\nGenerating client logos...");
config.clients.forEach(client => {
  generatePlaceholder({
    ...client,
    directory: 'public/images/clients',
    text: `CLIENT: ${client.name.replace(/-/g, ' ').toUpperCase()}`
  });
});

console.log("\n✅ All placeholder images have been generated!");
console.log("To use the script, make sure to install the canvas package:");
console.log("npm install canvas");
console.log("\nRun the script with:");
console.log("node scripts/generate-placeholders.js");