require('dotenv').config();

const fs = require('fs');
const path = require('path');

const {
  S3Client,
  PutObjectCommand,
  HeadObjectCommand
} = require('@aws-sdk/client-s3');

const db = require('./config/db');

const uploadRoot = path.join(__dirname, 'uploads');

const bucket = process.env.R2_BUCKET;
const publicUrl = (process.env.R2_PUBLIC_URL || '').replace(/\/+$/, '');

const client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY
  }
});

const DRY_RUN = process.argv[2] !== '--run';

function filenameFromUrl(url) {
  return url.replace(/^\/uploads\//, '');
}

function localPathFromUrl(url) {
  return path.join(uploadRoot, filenameFromUrl(url));
}

function makeR2Key(table, row, url) {
  const filename = filenameFromUrl(url);

  switch (table) {
    case 'food_images':
      return `food/${row.food_id}/${filename}`;

    case 'restaurant_profiles':
      return `restaurant/${row.user_id}/${filename}`;

    case 'rider_profiles':
      return `rider/${row.user_id}/${filename}`;

    case 'resumes':
      return `resume/${row.user_id}/${filename}`;

    case 'advertisements':
      return `ads/${filename}`;

    case 'vacancies':
      return `vacancy/${filename}`;

    default:
      throw new Error(`Unsupported table: ${table}`);
  }
}

function getRowIdentifier(table, row) {
  switch (table) {
    case 'food_images':
      return {
        where: 'id = $2',
        value: row.id
      };

    case 'restaurant_profiles':
      return {
        where: 'user_id = $2',
        value: row.user_id
      };

    case 'rider_profiles':
      return {
        where: 'user_id = $2',
        value: row.user_id
      };

    case 'resumes':
      return {
        where: 'id = $2',
        value: row.id
      };

    case 'advertisements':
      return {
        where: 'id = $2',
        value: row.id
      };

    case 'vacancies':
      return {
        where: 'id = $2',
        value: row.id
      };

    default:
      throw new Error(`Unsupported table: ${table}`);
  }
}

async function r2ObjectExists(key) {
  try {
    await client.send(
      new HeadObjectCommand({
        Bucket: bucket,
        Key: key
      })
    );

    return true;
  } catch (err) {
    if (
      err.name === 'NotFound' ||
      err.$metadata?.httpStatusCode === 404
    ) {
      return false;
    }

    throw err;
  }
}

async function uploadFile(localPath, key) {
  const buffer = fs.readFileSync(localPath);
  const extension = path.extname(localPath).toLowerCase();

  const contentTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
    '.pdf': 'application/pdf'
  };

  const contentType =
    contentTypes[extension] || 'application/octet-stream';

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType
    })
  );
}

async function migrateTable(table, column) {
  const result = await db.query(`
    SELECT *
    FROM ${table}
    WHERE ${column} LIKE '/uploads/%'
    ORDER BY 1
  `);

  console.log(`\n===== ${table}.${column} =====`);
  console.log(`Records: ${result.rows.length}`);

  let success = 0;
  let failed = 0;

  for (const row of result.rows) {
    const oldUrl = row[column];

    try {
      const localPath = localPathFromUrl(oldUrl);

      if (!fs.existsSync(localPath)) {
        throw new Error(`Local file missing: ${localPath}`);
      }

      const key = makeR2Key(table, row, oldUrl);
      const newUrl = `${publicUrl}/${key}`;

      if (DRY_RUN) {
        console.log(`[DRY-RUN] ${oldUrl} -> ${newUrl}`);
        success++;
        continue;
      }

      const exists = await r2ObjectExists(key);

      if (exists) {
        console.log(`[R2 EXISTS] ${key}`);
      } else {
        await uploadFile(localPath, key);
        console.log(`[UPLOADED] ${key}`);
      }

      const identifier = getRowIdentifier(table, row);

      const updateResult = await db.query(
        `
        UPDATE ${table}
        SET ${column} = $1
        WHERE ${identifier.where}
          AND ${column} = $3
        `,
        [newUrl, identifier.value, oldUrl]
      );

      if (updateResult.rowCount !== 1) {
        throw new Error(
          `Database update affected ${updateResult.rowCount} rows`
        );
      }

      console.log(`[DB UPDATED] ${oldUrl} -> ${newUrl}`);

      success++;
    } catch (err) {
      failed++;

      console.error(`[FAILED] ${oldUrl}`);
      console.error(`         ${err.message}`);
    }
  }

  console.log(
    `RESULT: success=${success}, failed=${failed}`
  );

  return { success, failed };
}

(async () => {
  try {
    console.log('==========================================');
    console.log(' CHUTKI LOCAL UPLOADS -> R2 MIGRATION');
    console.log('==========================================');

    console.log(`Mode: ${DRY_RUN ? 'DRY-RUN' : 'LIVE MIGRATION'}`);
    console.log(`Bucket: ${bucket}`);
    console.log(`Public URL: ${publicUrl}`);

    if (!bucket) throw new Error('R2_BUCKET is not configured');
    if (!publicUrl) throw new Error('R2_PUBLIC_URL is not configured');
    if (!process.env.R2_ENDPOINT) {
      throw new Error('R2_ENDPOINT is not configured');
    }
    if (!process.env.R2_ACCESS_KEY_ID) {
      throw new Error('R2_ACCESS_KEY_ID is not configured');
    }
    if (!process.env.R2_SECRET_ACCESS_KEY) {
      throw new Error('R2_SECRET_ACCESS_KEY is not configured');
    }

    if (DRY_RUN) {
      console.log('');
      console.log('No R2 uploads or database changes will be made.');
      console.log('Use: node migrate-uploads-to-r2.js --run');
    }

    const tables = [
      ['food_images', 'image_url'],
      ['restaurant_profiles', 'image'],
      ['rider_profiles', 'image'],
      ['resumes', 'resume_url'],
      ['advertisements', 'image_url'],
      ['vacancies', 'poster_url']
    ];

    let totalSuccess = 0;
    let totalFailed = 0;

    for (const [table, column] of tables) {
      const result = await migrateTable(table, column);

      totalSuccess += result.success;
      totalFailed += result.failed;
    }

    console.log('\n==========================================');
    console.log(' MIGRATION SUMMARY');
    console.log('==========================================');
    console.log(`Success: ${totalSuccess}`);
    console.log(`Failed : ${totalFailed}`);

    if (DRY_RUN) {
      console.log('');
      console.log('DRY-RUN COMPLETE - database was not modified.');
    } else {
      console.log('');
      console.log('LIVE MIGRATION COMPLETE.');
    }
  } catch (err) {
    console.error('');
    console.error('MIGRATION SCRIPT FAILED:', err.message);
    process.exitCode = 1;
  } finally {
    await db.end();
  }
})();
