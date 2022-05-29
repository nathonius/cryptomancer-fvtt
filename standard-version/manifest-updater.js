module.exports.readVersion = function (content) {
  const manifest = JSON.parse(content);
  return manifest.version;
};

module.exports.writeVersion = function (content, version) {
  const manifest = JSON.parse(content);
  manifest.version = version;
  manifest.download = `https://github.com/OfficerHalf/cryptomancer-fvtt/releases/download/v${version}/system.zip`;
  return JSON.stringify(manifest, undefined, 2);
};
