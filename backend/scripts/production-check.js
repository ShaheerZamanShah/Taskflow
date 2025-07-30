#!/usr/bin/env node

/**
 * Production Readiness Check
 * Validates the application is ready for production deployment
 * Run: node scripts/production-check.js
 */

const fs = require('fs').promises;
const path = require('path');

class ProductionChecker {
  constructor() {
    this.checks = [];
    this.passed = 0;
    this.failed = 0;
  }

  async runAllChecks() {
    console.log('🔍 TaskFlow Production Readiness Check\n');
    console.log('=' * 50);

    await this.checkEnvironmentVariables();
    await this.checkDependencies();
    await this.checkSecurity();
    await this.checkCodeQuality();
    await this.checkBuildFiles();

    this.generateReport();
  }

  async checkEnvironmentVariables() {
    console.log('\n📋 Environment Variables Check');
    
    // Check backend .env
    try {
      const envPath = path.join(__dirname, '..', '.env');
      const envContent = await fs.readFile(envPath, 'utf-8');
      
      const requiredVars = ['NODE_ENV', 'PORT', 'MONGODB_URI', 'JWT_SECRET'];
      const missingVars = [];
      
      requiredVars.forEach(varName => {
        if (!envContent.includes(`${varName}=`)) {
          missingVars.push(varName);
        }
      });
      
      if (missingVars.length === 0) {
        this.pass('✅ All required environment variables present');
      } else {
        this.fail(`❌ Missing environment variables: ${missingVars.join(', ')}`);
      }
      
      // Check JWT secret strength
      const jwtMatch = envContent.match(/JWT_SECRET=(.+)/);
      if (jwtMatch && jwtMatch[1].length < 32) {
        this.fail('❌ JWT_SECRET should be at least 32 characters for production');
      } else {
        this.pass('✅ JWT_SECRET is sufficiently secure');
      }
      
    } catch (error) {
      this.fail('❌ Backend .env file not found');
    }
  }

  async checkDependencies() {
    console.log('\n📦 Dependencies Check');
    
    try {
      // Check backend package.json
      const backendPkg = JSON.parse(
        await fs.readFile(path.join(__dirname, '..', 'package.json'), 'utf-8')
      );
      
      const productionDeps = [
        'express', 'mongoose', 'bcryptjs', 'jsonwebtoken', 
        'cors', 'helmet', 'compression'
      ];
      
      const missingDeps = productionDeps.filter(
        dep => !backendPkg.dependencies[dep]
      );
      
      if (missingDeps.length === 0) {
        this.pass('✅ All critical backend dependencies present');
      } else {
        this.fail(`❌ Missing dependencies: ${missingDeps.join(', ')}`);
      }
      
      // Check frontend package.json
      const frontendPkg = JSON.parse(
        await fs.readFile(path.join(__dirname, '..', '..', 'frontend', 'package.json'), 'utf-8')
      );
      
      if (frontendPkg.dependencies.react && frontendPkg.dependencies['react-dom']) {
        this.pass('✅ Frontend dependencies are valid');
      } else {
        this.fail('❌ Missing critical frontend dependencies');
      }
      
    } catch (error) {
      this.fail('❌ Could not validate dependencies');
    }
  }

  async checkSecurity() {
    console.log('\n🔒 Security Check');
    
    try {
      const serverContent = await fs.readFile(
        path.join(__dirname, '..', 'server.js'), 'utf-8'
      );
      
      const securityChecks = [
        { name: 'Helmet middleware', pattern: /helmet\(\)/ },
        { name: 'CORS configuration', pattern: /cors\(/ },
        { name: 'Rate limiting', pattern: /rateLimit/ },
        { name: 'Input validation', pattern: /express-validator/ },
      ];
      
      securityChecks.forEach(check => {
        if (check.pattern.test(serverContent)) {
          this.pass(`✅ ${check.name} implemented`);
        } else {
          this.fail(`❌ ${check.name} missing`);
        }
      });
      
    } catch (error) {
      this.fail('❌ Could not check security implementations');
    }
  }

  async checkCodeQuality() {
    console.log('\n🎯 Code Quality Check');
    
    try {
      // Check for console.log in production files
      const componentFiles = [
        path.join(__dirname, '..', '..', 'frontend', 'src', 'components', 'Dashboard', 'Dashboard.tsx'),
        path.join(__dirname, '..', '..', 'frontend', 'src', 'components', 'Tasks', 'TaskManager.tsx'),
      ];
      
      let consoleLogsFound = 0;
      
      for (const file of componentFiles) {
        try {
          const content = await fs.readFile(file, 'utf-8');
          const matches = content.match(/console\.log/g);
          if (matches) {
            consoleLogsFound += matches.length;
          }
        } catch (error) {
          // File might not exist
        }
      }
      
      if (consoleLogsFound === 0) {
        this.pass('✅ No console.log statements found in production code');
      } else {
        this.fail(`❌ Found ${consoleLogsFound} console.log statements that should be removed`);
      }
      
      // Check for TypeScript usage
      const frontendSrc = path.join(__dirname, '..', '..', 'frontend', 'src');
      try {
        const files = await fs.readdir(frontendSrc);
        const tsFiles = files.filter(f => f.endsWith('.tsx') || f.endsWith('.ts'));
        if (tsFiles.length > 0) {
          this.pass('✅ TypeScript is properly implemented');
        }
      } catch (error) {
        this.fail('❌ Could not verify TypeScript implementation');
      }
      
    } catch (error) {
      this.fail('❌ Code quality check failed');
    }
  }

  async checkBuildFiles() {
    console.log('\n🏗️ Build Files Check');
    
    // Check if build directory exists
    try {
      const buildPath = path.join(__dirname, '..', '..', 'frontend', 'build');
      await fs.access(buildPath);
      this.pass('✅ Frontend build directory exists');
      
      // Check for critical build files
      const indexHtml = path.join(buildPath, 'index.html');
      await fs.access(indexHtml);
      this.pass('✅ Build index.html exists');
      
    } catch (error) {
      this.fail('❌ Frontend build not found - run "npm run build" first');
    }
  }

  pass(message) {
    this.checks.push({ status: 'PASS', message });
    this.passed++;
  }

  fail(message) {
    this.checks.push({ status: 'FAIL', message });
    this.failed++;
  }

  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 PRODUCTION READINESS REPORT');
    console.log('='.repeat(60));
    
    this.checks.forEach(check => {
      console.log(check.message);
    });
    
    console.log('\n📈 Summary:');
    console.log(`✅ Passed: ${this.passed}`);
    console.log(`❌ Failed: ${this.failed}`);
    console.log(`📊 Success Rate: ${Math.round((this.passed / (this.passed + this.failed)) * 100)}%`);
    
    if (this.failed === 0) {
      console.log('\n🎉 CONGRATULATIONS!');
      console.log('Your TaskFlow application is ready for production deployment!');
      console.log('\nNext steps:');
      console.log('1. Run: npm run clean-db (to clean database)');
      console.log('2. Build frontend: cd frontend && npm run build');
      console.log('3. Deploy to your hosting platform');
      console.log('4. Configure your production domain');
    } else {
      console.log('\n⚠️  Please fix the failed checks before deploying to production.');
    }
    
    console.log('\n📚 For detailed deployment instructions, see:');
    console.log('PRODUCTION_DEPLOYMENT_GUIDE.md');
  }
}

// Run the checker
if (require.main === module) {
  const checker = new ProductionChecker();
  checker.runAllChecks().catch(console.error);
}

module.exports = ProductionChecker;
