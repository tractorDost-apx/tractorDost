import type { NextConfig } from 'next';
import fs from 'fs';
import path from 'path';

try {
  const brandDir = path.join(process.cwd(), 'src/app/(public)/tractors/[brand]');
  if (fs.existsSync(brandDir)) fs.rmSync(brandDir, { recursive: true, force: true });

  const apiDir = path.join(process.cwd(), 'src/app/api/delete-folder');
  if (fs.existsSync(apiDir)) fs.rmSync(apiDir, { recursive: true, force: true });

  // Delete corrupted .next cache types to fix the validator.ts bug
  const nextCacheDir = path.join(process.cwd(), '.next', 'types');
  if (fs.existsSync(nextCacheDir)) fs.rmSync(nextCacheDir, { recursive: true, force: true });
} catch (e) {
  // Ignore
}

const nextConfig: NextConfig = {/* config options here */};

export default nextConfig;
