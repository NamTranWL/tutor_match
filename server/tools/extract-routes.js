const fs = require('fs');
const path = require('path');

const SOURCE_DIR = path.join(__dirname, '../src');
const OUTPUT_FILE = path.join(__dirname, '../backend-apis.curl.txt');
const BASE_URL = 'http://localhost:8080/api/v1';

const methods = [
  'Get',
  'Post',
  'Put',
  'Delete',
  'Patch',
  'Options',
  'Head',
  'All',
];

function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function (file) {
    if (fs.statSync(dirPath + '/' + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + '/' + file, arrayOfFiles);
    } else {
      if (file.endsWith('.controller.ts')) {
        arrayOfFiles.push(path.join(dirPath, '/', file));
      }
    }
  });

  return arrayOfFiles;
}

function parseController(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  let controllerPath = '';
  const endpoints = [];

  const controllerMatch = content.match(/@Controller\(['"]([^'"]*)['"]\)/);
  if (controllerMatch) {
    controllerPath = controllerMatch[1];
  } else {
    if (content.match(/@Controller\(\)/)) {
      controllerPath = '';
    }
  }

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    for (const m of methods) {
      const regex = new RegExp(`@${m}\\((['"]([^'"]*)['"])?\\)`);
      const match = trimmed.match(regex);
      if (match) {
        const subPath = match[2] || '';
        let funcName = 'unknown';
        let bodyType = null;
        let isAuth = false;
        let isMultipart = false;

        for (let i = 0; i < 10; i++) {
          if (index + i >= lines.length) break;
          const ahead = lines[index + i].trim();
          if (
            ahead.startsWith('@UseGuards') ||
            ahead.includes('JwtAuthGuard') ||
            ahead.includes('AuthGuard')
          )
            isAuth = true;
          if (ahead.includes('@Body')) bodyType = 'json';
          if (
            ahead.includes('@UploadedFile') ||
            ahead.includes('FileInterceptor')
          )
            isMultipart = true;
          if (ahead.match(/^(async )?(\w+)\(/) && !ahead.startsWith('@')) {
            funcName = ahead.match(/^(async )?(\w+)\(/)[2];
            break;
          }
        }
        for (let i = 1; i < 5; i++) {
          if (index - i < 0) break;
          const behind = lines[index - i].trim();
          if (
            behind.startsWith('@UseGuards') ||
            behind.includes('JwtAuthGuard') ||
            behind.includes('AuthGuard')
          )
            isAuth = true;
        }

        endpoints.push({
          method: m.toUpperCase(),
          path: subPath,
          funcName,
          bodyType,
          isAuth,
          isMultipart,
          controllerPath,
        });
      }
    }
  });

  return endpoints;
}

function generateCurl(endpoint) {
  let routePath = `/${endpoint.controllerPath}/${endpoint.path}`.replace(
    /\/+/g,
    '/',
  );
  // Apply replacement only on the path part to avoid messing up localhost:8080
  routePath = routePath.replace(/:([a-zA-Z0-9_]+)/g, '{$1}');

  let fullPath = `${BASE_URL}${routePath}`;
  // Handle double slashes if any (though logic above should be fine)
  fullPath = fullPath.replace(/([^:])\/\//g, '$1/');

  let curl = `curl -X ${endpoint.method} "${fullPath}"`;

  if (endpoint.isAuth) {
    curl += ` \\\n  -H "Authorization: Bearer $TOKEN"`;
  }

  if (
    endpoint.method === 'POST' ||
    endpoint.method === 'PUT' ||
    endpoint.method === 'PATCH'
  ) {
    if (endpoint.isMultipart) {
      curl += ` \\\n  -H "Content-Type: multipart/form-data"`;
      curl += ` \\\n  -F "file=@/path/to/file"`;
    } else {
      curl += ` \\\n  -H "Content-Type: application/json"`;
      curl += ` \\\n  -d '{"key": "value"}'`;
    }
  }

  return {
    desc: `${endpoint.method} ${fullPath} - ${endpoint.funcName}`,
    cmd: curl,
  };
}

function main() {
  console.log('Starting API extraction...');
  const files = getAllFiles(SOURCE_DIR);
  console.log(`Found ${files.length} controller files.`);

  let output = '';
  let count = 0;
  let authCount = 0;

  files.forEach((file) => {
    const endpoints = parseController(file);
    if (endpoints.length > 0) {
      const relPath = path.relative(SOURCE_DIR, file);
      output += `\n### Controller: ${relPath}\n`;
      endpoints.forEach((ep) => {
        const { desc, cmd } = generateCurl(ep);
        output += `\n# ${desc}\n${cmd}\n`;
        count++;
        if (ep.isAuth) authCount++;
      });
    }
  });

  fs.writeFileSync(OUTPUT_FILE, output);

  console.log(`Summary:`);
  console.log(`Total Endpoints: ${count}`);
  console.log(`Base URL: ${BASE_URL}`);
  console.log(
    `Auth Mechanism: Bearer Token (detected ${authCount} protected endpoints)`,
  );
  console.log(`Output saved to: ${OUTPUT_FILE}`);
}

main();
