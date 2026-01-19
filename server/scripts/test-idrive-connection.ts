/**
 * Test IDrive E2 Connection
 * This script tests the connection to IDrive E2 storage
 * Run: npm run tsx scripts/test-idrive-connection.ts
 */

import { S3Client, ListBucketsCommand, HeadBucketCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { env } from '../src/config/env';

const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
};

function log(message: string, color = colors.reset) {
    console.log(`${color}${message}${colors.reset}`);
}

async function testConnection() {
    log('\n=================================================', colors.cyan);
    log('  IDrive E2 Storage Connection Test', colors.cyan);
    log('=================================================\n', colors.cyan);

    // Step 1: Check environment variables
    log('Step 1: Checking environment variables...', colors.blue);
    const requiredVars = [
        { name: 'IDRIVE_ACCESS_KEY', value: env.IDRIVE_ACCESS_KEY },
        { name: 'IDRIVE_SECRET_KEY', value: env.IDRIVE_SECRET_KEY },
        { name: 'IDRIVE_BUCKET', value: env.IDRIVE_BUCKET },
        { name: 'IDRIVE_ENDPOINT', value: env.IDRIVE_ENDPOINT },
        { name: 'IDRIVE_REGION', value: env.IDRIVE_REGION },
    ];

    let missingVars = false;
    for (const variable of requiredVars) {
        if (!variable.value) {
            log(`  ❌ ${variable.name}: NOT SET`, colors.red);
            missingVars = true;
        } else {
            const displayValue = variable.name.includes('KEY') 
                ? `${variable.value.substring(0, 4)}...${variable.value.substring(variable.value.length - 4)}`
                : variable.value;
            log(`  ✅ ${variable.name}: ${displayValue}`, colors.green);
        }
    }

    if (missingVars) {
        log('\n❌ Missing required environment variables!', colors.red);
        log('Please set all required variables in server/.env file\n', colors.yellow);
        process.exit(1);
    }

    // Step 2: Create S3 Client
    log('\nStep 2: Creating S3 Client...', colors.blue);
    const client = new S3Client({
        region: env.IDRIVE_REGION,
        endpoint: env.IDRIVE_ENDPOINT,
        credentials: {
            accessKeyId: env.IDRIVE_ACCESS_KEY!,
            secretAccessKey: env.IDRIVE_SECRET_KEY!,
        },
        forcePathStyle: true,
    });
    log('  ✅ S3 Client created successfully', colors.green);

    // Step 3: Test authentication by listing buckets
    log('\nStep 3: Testing authentication (listing buckets)...', colors.blue);
    try {
        const listCommand = new ListBucketsCommand({});
        const response = await client.send(listCommand);
        log('  ✅ Authentication successful!', colors.green);
        log(`  📦 Found ${response.Buckets?.length || 0} buckets:`, colors.cyan);
        response.Buckets?.forEach(bucket => {
            log(`     - ${bucket.Name}`, colors.cyan);
        });
    } catch (error) {
        log('  ❌ Authentication failed!', colors.red);
        if (error instanceof Error) {
            log(`  Error: ${error.message}`, colors.red);
            if (error.message.includes('SSL') || error.message.includes('certificate')) {
                log('\n  💡 Tip: SSL validation error detected.', colors.yellow);
                log('  Your endpoint URL might be incorrect.', colors.yellow);
                log('  Check your IDrive E2 dashboard for the correct endpoint URL.', colors.yellow);
            } else if (error.message.includes('credentials') || error.message.includes('access')) {
                log('\n  💡 Tip: Access denied - check your credentials.', colors.yellow);
                log('  Make sure your Access Key and Secret Key are correct.', colors.yellow);
            }
        }
        process.exit(1);
    }

    // Step 4: Check if the specified bucket exists
    log('\nStep 4: Checking if bucket exists...', colors.blue);
    try {
        const headCommand = new HeadBucketCommand({
            Bucket: env.IDRIVE_BUCKET,
        });
        await client.send(headCommand);
        log(`  ✅ Bucket '${env.IDRIVE_BUCKET}' exists and is accessible!`, colors.green);
    } catch (error) {
        log(`  ❌ Bucket '${env.IDRIVE_BUCKET}' not found or not accessible!`, colors.red);
        if (error instanceof Error) {
            log(`  Error: ${error.message}`, colors.red);
        }
        log('\n  💡 Tip: Create the bucket in your IDrive E2 dashboard or check the bucket name.', colors.yellow);
        process.exit(1);
    }

    // Step 5: Test write permission with a small file
    log('\nStep 5: Testing write permissions...', colors.blue);
    try {
        const testKey = `test-connection-${Date.now()}.txt`;
        const testContent = 'IDrive connection test - you can delete this file';
        
        const putCommand = new PutObjectCommand({
            Bucket: env.IDRIVE_BUCKET,
            Key: testKey,
            Body: Buffer.from(testContent),
            ContentType: 'text/plain',
        });
        
        await client.send(putCommand);
        log('  ✅ Write test successful!', colors.green);
        log(`  📄 Test file created: ${testKey}`, colors.cyan);
        log('  (You can delete this file from your IDrive dashboard)', colors.yellow);
    } catch (error) {
        log('  ❌ Write test failed!', colors.red);
        if (error instanceof Error) {
            log(`  Error: ${error.message}`, colors.red);
        }
        log('\n  💡 Tip: Check your bucket permissions.', colors.yellow);
        process.exit(1);
    }

    // Success!
    log('\n=================================================', colors.green);
    log('  ✅ ALL TESTS PASSED!', colors.green);
    log('  Your IDrive E2 connection is working correctly.', colors.green);
    log('=================================================\n', colors.green);
}

// Run the test
testConnection().catch(error => {
    log('\n❌ Unexpected error:', colors.red);
    console.error(error);
    process.exit(1);
});
