rm -rf out;
mkdir -p out/bin;
yarn;
yarn build-artifact;
cp package.json out/;
echo "#!/usr/bin/env node" > out/bin/temp;
cat out/bin/index.js >> out/bin/temp;
mv -f out/bin/temp out/bin/index.js;
chmod +x out/bin/index.js;