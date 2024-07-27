inkscape --export-filename=icon_16x16.png       --export-type=png --export-dpi=72   --export-width=16    --export-height=16    {svgFile}.svg
inkscape --export-filename=icon_16x16@2x.png    --export-type=png --export-dpi=144  --export-width=32    --export-height=32    {svgFile}.svg
inkscape --export-filename=icon_32x32.png       --export-type=png --export-dpi=72   --export-width=32    --export-height=32    {svgFile}.svg
inkscape --export-filename=icon_32x32@2x.png    --export-type=png --export-dpi=144  --export-width=64    --export-height=64    {svgFile}.svg
inkscape --export-filename=icon_128x128.png     --export-type=png --export-dpi=72   --export-width=128   --export-height=128   {svgFile}.svg
inkscape --export-filename=icon_128x128@2x.png  --export-type=png --export-dpi=144  --export-width=256   --export-height=256   {svgFile}.svg
inkscape --export-filename=icon_256x256.png     --export-type=png --export-dpi=72   --export-width=256   --export-height=256   {svgFile}.svg
inkscape --export-filename=icon_256x256@2x.png  --export-type=png --export-dpi=144  --export-width=512   --export-height=512   {svgFile}.svg
inkscape --export-filename=icon_512x512.png     --export-type=png --export-dpi=72   --export-width=512   --export-height=512   {svgFile}.svg
inkscape --export-filename=icon_512x512@2x.png  --export-type=png --export-dpi=144  --export-width=1024  --export-height=1024  {svgFile}.svg

mkdir icon.iconset
mv *.png icon.iconset
iconutil --convert icns icon.iconset