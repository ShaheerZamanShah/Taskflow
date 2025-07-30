#!/usr/bin/env node

/**
 * Code Optimization Script
 * Identifies and reports optimization opportunities
 * Run: node scripts/optimize-code.js
 */

const fs = require('fs').promises;
const path = require('path');

class CodeOptimizer {
  constructor() {
    this.issues = [];
    this.stats = {
      totalFiles: 0,
      totalLines: 0,
      duplicatedSelectors: 0,
      optimizationOpportunities: 0
    };
  }

  async analyzeProject() {
    console.log('🔍 Starting code analysis for optimization...\n');
    
    // Analyze CSS files for duplicates and optimization
    await this.analyzeCSSFiles();
    
    // Analyze JavaScript/TypeScript files
    await this.analyzeJSFiles();
    
    // Generate report
    this.generateReport();
  }

  async analyzeCSSFiles() {
    console.log('📄 Analyzing CSS files...');
    
    const cssFiles = [
      'frontend/src/index.css',
      'frontend/src/App.css',
      'frontend/src/components/Dashboard/Dashboard.css',
      'frontend/src/components/Tasks/TaskManager.css',
      'frontend/src/components/Analytics/Analytics.css',
      'frontend/src/components/Auth/Auth.css',
      'frontend/src/components/Landing/LandingPage.css'
    ];

    const allSelectors = new Map();
    const duplicateValues = new Map();

    for (const file of cssFiles) {
      const fullPath = path.join(__dirname, '..', '..', file);
      try {
        const content = await fs.readFile(fullPath, 'utf-8');
        this.stats.totalFiles++;
        this.stats.totalLines += content.split('\n').length;

        // Find duplicate background gradients
        const gradientMatches = content.match(/background:\s*linear-gradient\([^;]+\)/g) || [];
        gradientMatches.forEach(gradient => {
          const normalized = gradient.replace(/\s+/g, ' ').trim();
          if (!duplicateValues.has(normalized)) {
            duplicateValues.set(normalized, []);
          }
          duplicateValues.get(normalized).push(file);
        });

        // Find common selectors
        const selectorMatches = content.match(/\.[a-zA-Z][a-zA-Z0-9-_]*\s*{/g) || [];
        selectorMatches.forEach(selector => {
          const clean = selector.replace(/\s*{/, '');
          if (!allSelectors.has(clean)) {
            allSelectors.set(clean, []);
          }
          allSelectors.get(clean).push(file);
        });

      } catch (error) {
        this.issues.push(`❌ Could not read ${file}: ${error.message}`);
      }
    }

    // Report duplicates
    duplicateValues.forEach((files, value) => {
      if (files.length > 1) {
        this.stats.duplicatedSelectors++;
        this.issues.push(`🔄 Duplicate gradient found in ${files.length} files: ${value.substring(0, 50)}...`);
      }
    });

    allSelectors.forEach((files, selector) => {
      if (files.length > 1 && selector !== '.glass-card' && selector !== '.glass-button') {
        this.issues.push(`🔄 Selector "${selector}" appears in ${files.length} files`);
      }
    });
  }

  async analyzeJSFiles() {
    console.log('📄 Analyzing JavaScript/TypeScript files...');
    
    const jsFiles = [
      'frontend/src/components/Dashboard/Dashboard.tsx',
      'frontend/src/components/Tasks/TaskManager.tsx',
      'frontend/src/components/Analytics/Analytics.tsx',
      'frontend/src/App.tsx'
    ];

    for (const file of jsFiles) {
      const fullPath = path.join(__dirname, '..', '..', file);
      try {
        const content = await fs.readFile(fullPath, 'utf-8');
        this.stats.totalFiles++;
        this.stats.totalLines += content.split('\n').length;

        // Check for potential optimizations
        if (content.includes('console.log') && !content.includes('development')) {
          this.issues.push(`🐛 Found console.log in ${file} - should be removed for production`);
        }

        if (content.match(/useState\([^)]*\[\]\)/g)) {
          this.issues.push(`⚡ Consider useMemo for large arrays in ${file}`);
        }

        if (content.match(/useEffect\(\(\) => \{[^}]*fetch/g)) {
          this.issues.push(`⚡ Consider useCallback for fetch functions in ${file}`);
        }

      } catch (error) {
        this.issues.push(`❌ Could not read ${file}: ${error.message}`);
      }
    }
  }

  generateReport() {
    console.log('\n' + '='.repeat(50));
    console.log('📊 CODE OPTIMIZATION REPORT');
    console.log('='.repeat(50));
    
    console.log(`\n📈 Statistics:`);
    console.log(`Files analyzed: ${this.stats.totalFiles}`);
    console.log(`Total lines: ${this.stats.totalLines.toLocaleString()}`);
    console.log(`Issues found: ${this.issues.length}`);
    
    if (this.issues.length === 0) {
      console.log('\n✨ No major optimization issues found!');
      console.log('Your code is well-optimized for production.');
    } else {
      console.log(`\n⚠️  Issues and Recommendations:`);
      this.issues.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue}`);
      });
    }

    console.log('\n💡 General Production Recommendations:');
    console.log('• Create a shared CSS variables file for common gradients');
    console.log('• Implement CSS purging to remove unused styles');
    console.log('• Add React.memo() for frequently re-rendering components');
    console.log('• Use lazy loading for route components');
    console.log('• Optimize images and use WebP format');
    console.log('• Enable gzip compression on server');
    console.log('• Add proper error boundaries');
  }
}

// Run the optimizer
if (require.main === module) {
  const optimizer = new CodeOptimizer();
  optimizer.analyzeProject().catch(console.error);
}

module.exports = CodeOptimizer;
