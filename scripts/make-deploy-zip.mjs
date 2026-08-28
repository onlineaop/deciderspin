// Minimal STORE-only (no compression) ZIP writer — avoids depending on any
// external zip CLI (none available in this environment) and avoids the
// Windows path-separator bug that PowerShell's Compress-Archive and .NET's
// ZipFile.CreateFromDirectory both have (they leak backslashes into zip
// entry names, which PHP's ZipArchive then reads as literal filenames
// instead of directories — see deciderspin-site-architecture memory).
// Entry names here are explicit, hand-built forward-slash strings, so that
// bug class can't occur.
import { createWriteStream, readFileSync } from "node:fs";
import { crc32 } from "node:zlib";

const files = JSON.parse(readFileSync(process.argv[2], "utf8"));
// [{ name: "index.html", path: "out/index.html" }, ...]

const out = process.argv[3];
const chunks = [];
const centralRecords = [];
let offset = 0;

function dosDateTime() {
  // Fixed timestamp — doesn't matter for this use case.
  return { time: 0, date: 0x21 }; // 1980-01-01
}

for (const { name, path } of files) {
  const data = readFileSync(path);
  const nameBuf = Buffer.from(name, "utf8");
  const crc = crc32(data);
  const { time, date } = dosDateTime();

  const localHeader = Buffer.alloc(30);
  localHeader.writeUInt32LE(0x04034b50, 0);
  localHeader.writeUInt16LE(20, 4); // version needed
  localHeader.writeUInt16LE(0x0800, 6); // flags: UTF-8 name
  localHeader.writeUInt16LE(0, 8); // method: store
  localHeader.writeUInt16LE(time, 10);
  localHeader.writeUInt16LE(date, 12);
  localHeader.writeUInt32LE(crc, 14);
  localHeader.writeUInt32LE(data.length, 18);
  localHeader.writeUInt32LE(data.length, 22);
  localHeader.writeUInt16LE(nameBuf.length, 26);
  localHeader.writeUInt16LE(0, 28);

  chunks.push(localHeader, nameBuf, data);

  const centralHeader = Buffer.alloc(46);
  centralHeader.writeUInt32LE(0x02014b50, 0);
  centralHeader.writeUInt16LE(20, 4);
  centralHeader.writeUInt16LE(20, 6);
  centralHeader.writeUInt16LE(0x0800, 8);
  centralHeader.writeUInt16LE(0, 10);
  centralHeader.writeUInt16LE(time, 12);
  centralHeader.writeUInt16LE(date, 14);
  centralHeader.writeUInt32LE(crc, 16);
  centralHeader.writeUInt32LE(data.length, 20);
  centralHeader.writeUInt32LE(data.length, 24);
  centralHeader.writeUInt16LE(nameBuf.length, 28);
  centralHeader.writeUInt16LE(0, 30);
  centralHeader.writeUInt16LE(0, 32);
  centralHeader.writeUInt16LE(0, 34);
  centralHeader.writeUInt16LE(0, 36);
  centralHeader.writeUInt32LE(0, 38);
  centralHeader.writeUInt32LE(offset, 42);

  centralRecords.push(Buffer.concat([centralHeader, nameBuf]));

  offset += localHeader.length + nameBuf.length + data.length;
}

const centralDirStart = offset;
const centralDirBuf = Buffer.concat(centralRecords);
offset += centralDirBuf.length;

const endRecord = Buffer.alloc(22);
endRecord.writeUInt32LE(0x06054b50, 0);
endRecord.writeUInt16LE(0, 4);
endRecord.writeUInt16LE(0, 6);
endRecord.writeUInt16LE(files.length, 8);
endRecord.writeUInt16LE(files.length, 10);
endRecord.writeUInt32LE(centralDirBuf.length, 12);
endRecord.writeUInt32LE(centralDirStart, 16);
endRecord.writeUInt16LE(0, 20);

const zipBuf = Buffer.concat([...chunks, centralDirBuf, endRecord]);
createWriteStream(out).write(zipBuf);
console.log(`Wrote ${out}: ${zipBuf.length} bytes, ${files.length} files`);
